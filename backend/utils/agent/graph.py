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


def tools_node(state: State):
    """Custom tools node that injects user_id from state into animation tool calls."""
    from .utils import generate_animation_from_prompt

    last = state["messages"][-1] if state["messages"] else None
    if not isinstance(last, AIMessage) or not getattr(last, "tool_calls", None):
        return {"messages": []}

    user_id = state.get("user_id", "anon")
    tool_messages = []

    for tool_call in last.tool_calls:
        tool_name = tool_call.get("name", "")
        tool_args = tool_call.get("args", {})
        tool_id = tool_call.get("id", "")

        # Handle animation tool specially to inject user_id
        if tool_name == "generate_animation":
            prompt = tool_args.get("prompt", "")
            animation_speed = tool_args.get("animation_speed", 1.0)
            res = generate_animation_from_prompt(prompt, animation_speed=animation_speed, user_id=user_id)

            error_msg = None
            if not res.get("ok"):
                error_msg = res.get("error") or res.get("stderr", "Unknown error")
                if len(error_msg) > 200:
                    error_msg = error_msg[-200:]

            result = {
                "ok": bool(res.get("ok")),
                "error": error_msg,
                "plan": res.get("plan", {}),
                "video_rel": res.get("video_rel", ""),
                "video_path": res.get("video_path", ""),
                "stdout": res.get("stdout", ""),
                "stderr": res.get("stderr", ""),
                "cmd": res.get("cmd", ""),
            }

            from langchain_core.messages import ToolMessage
            tool_messages.append(ToolMessage(content=str(result), tool_call_id=tool_id))
        else:
            # For other tools, use the default ToolNode behavior
            # We need to invoke the tool normally
            tool_map = {
                "run_tests": run_tests_tool,
                "grade_via_tests": grade_via_tests_tool,
                "hints": hints_tool,
                "annotated_hints": annotated_hints_tool,
                "tool_hints": tool_hints_tool,
                "annotate_errors": annotate_errors_tool,
                "snippet": snippet_tool,
            }

            if tool_name in tool_map:
                try:
                    result = tool_map[tool_name].invoke(tool_args)
                    from langchain_core.messages import ToolMessage
                    tool_messages.append(ToolMessage(content=str(result), tool_call_id=tool_id))
                except Exception as e:
                    from langchain_core.messages import ToolMessage
                    tool_messages.append(ToolMessage(content=f"Error: {str(e)}", tool_call_id=tool_id))

    return {"messages": tool_messages}


def build_graph():
    g = StateGraph(State)
    g.add_node("llm", llm_node)
    g.add_node("tools", tools_node)
    g.set_entry_point("llm")
    g.add_conditional_edges("llm", route_after_llm, {"tools": "tools", END: END})
    g.add_edge("tools", "llm")
    return g.compile(checkpointer=MemorySaver())
