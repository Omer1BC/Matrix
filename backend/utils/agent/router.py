# utils/agent/router.py
import re
from typing import Dict, Any, Tuple
from .schema import AgentRequest, Intent


def route(req: AgentRequest) -> Tuple[Intent, Dict[str, Any]]:
    if req.intent:
        return req.intent, req.extras

    msg = (req.message or "").lower()

    if "grade" in msg or "score" in msg:
        return "grade", {}
    if "test" in msg or "run tests" in msg:
        return "tests", {}
    if "line" in msg and ("error" in msg or "traceback" in msg or "syntax" in msg):
        return "annotate_errors", {"error": req.extras.get("error", req.message)}
    if (
        re.search(r"\b(dfs|bfs|two[-\s]?sum|heap|set|stack|queue)\b", msg)
        or "tool hint" in msg
    ):
        return "tool_hints", {"pattern": req.extras.get("pattern", "")}
    if "annotated" in msg and "hint" in msg:
        return "annotated_hints", {}
    if "hint" in msg:
        return "hints", {}
    if "animate" in msg or "animation" in msg:
        return "generate_animation", {
            "structure": req.extras.get("structure", ""),
            "request": req.extras.get("request", msg),
            "steps": req.extras.get("steps", []),
        }

    return "chat", {}
