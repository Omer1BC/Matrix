// lib/api.ts

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/";

export async function getAnimationUrl(opts: {
  name: string;
  args?: Record<string, unknown>;
}): Promise<string | null> {
  const data = opts.args
    ? Object.entries(opts.args).map(([k, v]) => `${k} = ${String(v)}`)
    : [];
  const resp = await ping({ data, name: opts.name }, "get_pattern_media");
  const rel = resp?.data;
  if (!rel) return null;
  return `${API_BASE_URL}${rel}?v=${Date.now()}`;
}

export async function ping(data: Record<string, unknown>, endpoint: string) {
  try {
    const res = await fetch(`${API_BASE_URL}api/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      return {};
    }

    const json = await res.json();
    return json;
  } catch (error) {
    console.error("Failed to fetch problem details:", error);
    return {};
  }
}

export async function saveNotes(payload: {
  user_id: string;
  problem_id: string;
  notes: string;
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/save-notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(
      (data as any)?.error || `save_notes failed (${res.status})`
    );
  return data;
}
