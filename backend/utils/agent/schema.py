# utils/agent/schema.py
from typing import Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

Intent = Literal[
    "chat",  # general Q&A about the problem
    "hints",  # annotated hints (code-aware)
    "annotated_hints",  # line-anchored hints
    "tool_hints",  # pattern/tool-specific advice
    "tests",  # run tests
    "grade",  # run tests + grade + feedback
    "annotate_errors",  # suggest minimal fix for known error
    "generate_animation",
]


class AgentRequest(BaseModel):
    user_id: str
    problem_id: str
    message: str = ""
    question: str = ""  # title + description is ideal
    intent: Optional[Intent] = None
    code: Optional[str] = Field(default=None, max_length=500000)
    preferences: Optional[str] = Field(default=None, max_length=2000)
    extras: Dict[str, Any] = {}  # e.g. { "pattern": "DFS", "error": "NameError: x" }


class AgentResponse(BaseModel):
    kind: Intent | Literal["chat"]
    data: Dict[str, Any]
    meta: Dict[str, Any] = {}
