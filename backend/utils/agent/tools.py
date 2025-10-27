# utils/agent/tools.py
from typing import Dict, Any, List
from langchain_core.tools import tool
from utils.utils import (
    run,
    parse_results_str,
    get_ai_hints,
    get_annotated_ai_hints,
    get_tool_hints,
    get_error_details,
)
from api.models import Problem
from .utils import generate_animation_from_prompt, get_solution_grade


@tool(
    "run_tests",
    return_direct=False,
)
def run_tests_tool(problem_id: str, code: str) -> Dict[str, Any]:
    """Run the problem's test harness and return raw output, parsed results, and a summary."""
    raw, had_error = run(problem_id, code)
    parsed = parse_results_str(raw) if isinstance(raw, str) else {}
    total = passed = 0
    for _, case in parsed.items():
        total += 1
        if case.get("actual") == case.get("expected"):
            passed += 1
    return {
        "had_error": bool(had_error),
        "raw": raw,
        "results": parsed,
        "summary": {"total": total, "passed": passed, "failed": max(0, total - passed)},
    }


@tool(
    "grade_via_tests",
    return_direct=False,
)
def grade_via_tests_tool(problem_id: str, code: str) -> Dict[str, Any]:
    """Run tests first, then grade the solution using a rubric (readability/efficiency/robustness) with failing examples; returns {'tests': ..., 'grade': ...}."""
    tests = run_tests_tool.invoke({"problem_id": problem_id, "code": code})
    total = tests["summary"]["total"]
    passed = tests["summary"]["passed"]
    failed = tests["summary"]["failed"]

    title, desc, diff, ref = "Unknown Problem", "", "Medium", ""
    try:
        p = Problem.objects.get(problem_id=problem_id)
        title, desc, diff, ref = (
            p.title,
            p.description or "",
            p.difficulty or "Medium",
            (p.solution or "").strip(),
        )
    except Exception:
        pass

    fail_examples: List[Dict[str, Any]] = []
    for _, case in (tests["results"] or {}).items():
        if case.get("actual") != case.get("expected"):
            fail_examples.append(
                {
                    "input": {
                        k: v for k, v in case.items() if k not in ("actual", "expected")
                    },
                    "expected": case.get("expected"),
                    "actual": case.get("actual"),
                }
            )
            if len(fail_examples) >= 3:
                break

    grade = get_solution_grade(
        code=code,
        problem_title=title,
        problem_description=desc,
        reference_solution=ref,
        difficulty=diff,
        test_passed=passed,
        test_total=total,
        fail_examples=fail_examples,
    )
    grade["verdict"] = bool(total > 0 and failed == 0 and not tests["had_error"])

    return {"tests": tests, "grade": grade}


@tool(
    "hints",
    return_direct=False,
)
def hints_tool(problem_id: str, code: str) -> Dict[str, Any]:
    """Provide concise, code-aware hints for the given problem without revealing the full solution; returns annotated_code + explanations."""
    return get_ai_hints(code, tests="", problem_id=problem_id)


@tool(
    "annotated_hints",
    return_direct=False,
)
def annotated_hints_tool(problem_id: str, code: str) -> Dict[str, Any]:
    """Provide line-anchored hints mapping line numbers to comments plus brief explanations and a thought-provoking test case."""
    return get_annotated_ai_hints(code, tests="", problem_id=problem_id)


@tool(
    "tool_hints",
    return_direct=False,
)
def tool_hints_tool(code: str, pattern: str) -> Dict[str, Any]:
    """Explain how a specific algorithmic pattern/tool (e.g., DFS, Set) applies to the current problem/code without giving away the solution."""
    return get_tool_hints(code, pattern)


@tool(
    "annotate_errors",
    return_direct=False,
)
def annotate_errors_tool(problem_id: str, error: str, code: str) -> Dict[str, Any]:
    """Given an error string and the user's code, suggest minimal line replacements (line_number_to_replacement) with a brief explanation to fix the error."""
    return get_error_details(problem_id=problem_id, error=error, code=code)


@tool(
    "generate_animation",
    return_direct=False,
)
def generate_animation_tool(prompt: str) -> Dict[str, Any]:
    """Generate a data-structure animation from a natural-language prompt. Input: prompt (str). Returns {'ok': bool, 'plan': {...}, 'video_abs': str, 'video': str, 'stdout': str, 'stderr': str, 'cmd': str}. 'video' is a relative path suitable for serving via http://<host>/{video}."""
    res = generate_animation_from_prompt(prompt)
    return {
        "ok": bool(res.get("ok")),
        "plan": res.get("plan", {}),
        "video_rel": res.get("video_rel", ""),
        "video_path": res.get("video_path", ""),
        "stdout": res.get("stdout", ""),
        "stderr": res.get("stderr", ""),
        "cmd": res.get("cmd", ""),
    }
