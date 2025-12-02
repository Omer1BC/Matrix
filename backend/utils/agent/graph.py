from typing import TypedDict, Annotated, Dict, Any
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langchain_core.messages import SystemMessage, AIMessage, HumanMessage
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.memory import MemorySaver
from .utils import snippet
from .tools import (
    generate_animation_tool,
    run_tests_tool,
    grade_via_tests_tool,
    hints_tool,
    annotated_hints_tool,
    tool_hints_tool,
    annotate_errors_tool,
    snippet_tool,
)
from .rag import context_text


class State(TypedDict):
    messages: Annotated[list, add_messages]
    question: str
    code: str
    preferences: str
    task: str
    params: Dict[str, Any]
    user_id: str
    problem_id: str


def _last_user_text(msgs: list) -> str:
    for m in reversed(msgs):
        if isinstance(m, HumanMessage):
            # m.content can be str or list; just stringify
            return m.content if isinstance(m.content, str) else str(m.content)
    return ""


def llm_node(state: State):
    sys = SystemMessage(
        content="You are a strict but supportive technical interviewer. Be concise. Use tools when appropriate. Do not reveal full solutions."
    )
    model = ChatOpenAI(model="gpt-4o-mini", temperature=0.0).bind_tools(
        [
            run_tests_tool,
            grade_via_tests_tool,
            hints_tool,
            annotated_hints_tool,
            tool_hints_tool,
            annotate_errors_tool,
            generate_animation_tool,
            snippet_tool,
        ]
    )

    msgs = state["messages"]

    msgs.append(sys)

    if state.get("question"):
        msgs.append(SystemMessage(content=f"Problem:\n{state['question']}"))
    if state.get("preferences"):
        msgs.append(
            SystemMessage(content=f"Learner preferences: {state['preferences']}")
        )

    uid = state.get("user_id", "")
    pid = state.get("problem_id", "")
    query = state.get("question") or _last_user_text(state["messages"])
    try:
        notes_ctx = context_text(uid, pid, query, k=6).strip()
    except Exception:
        notes_ctx = ""

    if notes_ctx:
        msgs.append(
            SystemMessage(
                content=f"User's own notes for this problem (treat as high-priority context):\n{notes_ctx}"
            )
        )

    # Add conversation history BEFORE current code

    # Add current code LAST so it's most recent and emphasized
    if state.get("code"):
        msgs.append(
            SystemMessage(
                content=f"IMPORTANT - CURRENT CODE (most recent version, use this for analysis):\n```python\n{snippet(state['code'])}\n```"
            )
        )

    return {"messages": [model.invoke(msgs)]}


def route_after_llm(state: State):
    last = state["messages"][-1] if state["messages"] else None
    if isinstance(last, AIMessage) and getattr(last, "tool_calls", None):
        return "tools"
    return END


def build_graph():
    g = StateGraph(State)
    g.add_node("llm", llm_node)
    g.add_node(
        "tools",
        ToolNode(
            [
                run_tests_tool,
                grade_via_tests_tool,
                hints_tool,
                annotated_hints_tool,
                tool_hints_tool,
                annotate_errors_tool,
                snippet_tool,
                generate_animation_tool,
            ]
        ),
    )
    g.set_entry_point("llm")
    g.add_conditional_edges("llm", route_after_llm, {"tools": "tools", END: END})
    g.add_edge("tools", "llm")
    return g.compile(checkpointer=MemorySaver())
