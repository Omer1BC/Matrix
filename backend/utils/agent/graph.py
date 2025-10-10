# utils/agent/graph.py
from typing import TypedDict, Annotated, Dict, Any
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.memory import MemorySaver

from .tools import (
    run_tests_tool,
    grade_via_tests_tool,
    hints_tool,
    annotated_hints_tool,
    tool_hints_tool,
    annotate_errors_tool,
)


class State(TypedDict):
    messages: Annotated[list, add_messages]
    question: str
    code: str
    task: str
    params: Dict[str, Any]


def llm_node(state: State):
    sys = SystemMessage(
        content=(
            "You are a strict but supportive technical interviewer. "
            "Be concise. Use tools when appropriate. Do not reveal full solutions."
        )
    )
    model = ChatOpenAI(model="gpt-4o-mini", temperature=0.0).bind_tools(
        [
            run_tests_tool,
            grade_via_tests_tool,
            hints_tool,
            annotated_hints_tool,
            tool_hints_tool,
            annotate_errors_tool,
        ]
    )

    msgs = [sys]
    if state.get("question"):
        msgs.append(SystemMessage(content=f"Problem:\n{state['question']}"))
    if state.get("code"):
        msgs.append(
            SystemMessage(
                content=f"User code snapshot:\n```python\n{state['code']}\n```"
            )
        )

    msgs += state["messages"]
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
            ]
        ),
    )
    g.set_entry_point("llm")
    g.add_conditional_edges("llm", route_after_llm, {"tools": "tools", END: END})
    g.add_edge("tools", "llm")
    return g.compile(checkpointer=MemorySaver())
