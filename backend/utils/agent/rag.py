import os, hashlib, tiktoken
from typing import List, Optional, Dict, Any
from langchain_openai import OpenAIEmbeddings
from utils.supabase.client import supabase

EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL", "text-embedding-3-small")
embeddings = OpenAIEmbeddings(model=EMBEDDING_MODEL)
_enc = tiktoken.get_encoding("cl100k_base")


def chunk(text: str, max_tokens: int = 700, overlap: int = 120) -> List[str]:
    if not text or not text.strip():
        return []
    toks = _enc.encode(text)
    out = []
    i, n = 0, len(toks)
    while i < n:
        j = min(i + max_tokens, n)
        out.append(_enc.decode(toks[i:j]).strip())
        if j == n:
            break
        i = j - overlap
    return [c for c in out if c]


def embed_chunks(chunks: List[str], batch_size: int = 64) -> List[List[float]]:
    vecs = []
    for i in range(0, len(chunks), batch_size):
        vecs.extend(embeddings.embed_documents(chunks[i : i + batch_size]))
    return vecs


def _sha(s: str) -> str:
    return hashlib.sha256((s or "").encode("utf-8")).hexdigest()


def reindex_notes(
    pc_id: int, user_id: str, problem_id: str, title: Optional[str], notes: str
) -> Dict[str, Any]:
    supabase.table("note_embeddings").delete().eq("pc_id", pc_id).execute()
    ch = chunk(notes or "")
    if not ch:
        return {"inserted": 0}
    vecs = embed_chunks(ch)
    rows = [
        {
            "pc_id": pc_id,
            "user_id": user_id,
            "problem_id": problem_id,
            "title": title,
            "chunk": c,
            "embedding": v,
        }
        for c, v in zip(ch, vecs)
    ]
    supabase.table("note_embeddings").insert(rows).execute()
    return {"inserted": len(rows)}


def search_notes(user_id: str, problem_id: str | None, query: str, k: int = 6):
    qvec = embeddings.embed_query(query or "")
    res = supabase.rpc(
        "match_note_embeddings",
        {
            "match_count": k,
            "query_embedding": qvec,
            "user_uuid": user_id,
            "prob_id": problem_id,
        },
    ).execute()
    return res.data or []


def context_text(user_id: str, problem_id: str, question: str, k: int = 6) -> str:
    rows = search_notes(user_id, problem_id, question, k)
    if len(rows) < k:
        seen = {r["id"] for r in rows if "id" in r}
        global_rows = [
            r
            for r in search_notes(user_id, None, question, k)
            if r.get("id") not in seen
        ]
        rows.extend(global_rows[: max(0, k - len(rows))])
    return "\n\n".join((r.get("chunk") or "").strip() for r in rows if r.get("chunk"))
