import json
import os
import re
import shutil
import subprocess
from typing import Dict, List, Any, Optional
from django.conf import settings
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

# --- Prompts ---

GRADING_PROMPT = """
You are a strict but fair code reviewer for algorithmic interview solutions.

Evaluate the user's solution using **only** the categories below on a 0.0–5.0 scale (one decimal is fine):

- readability: variable naming, structure, clarity, comments, and idiomatic style
- efficiency: time/space complexity relative to a typical optimal approach for this problem
- robustness: handling of edge cases, input validation (where appropriate), and defensive coding

Context:
- Problem: {problem_title} ({difficulty})
- Description: {problem_description}
- User code:
```python
{code}

Reference solution (may be empty):

python
Copy code
{reference_solution}
Test summary: {test_passed}/{test_total} passed

Failing examples (up to 3):
{fail_examples}

Instructions:

Be concise and specific in explanations for each category (what is good, what to improve).

If all tests pass, it’s okay to give higher robustness; if tests fail, explain likely missed edges.

Output must strictly match the schema.

{format_instructions}
"""

ANIMATION_PROMPT = """
You write one Python program for Manim and return a structured object.

Constraints:
- Use Manim Community 0.19+ APIs.
- One Scene subclass only, class name: {scene_class_name}.
- Import visualizer from templates via:
  sys.path.append(os.path.join(os.path.dirname(__file__), "..", "templates"))
  from {templates_module_name} import {visualizer_class_name}
- Instantiate the visualizer with initial_values={initial_state}.
- If the first operation is not "create", call self.play(v.create()) once at start.
- For each op in {operations}, if the method exists on the visualizer, call self.play(getattr(v, name)(*args), run_time=op.run_time or 0.8), then self.wait(op.pause or 0.4).
- Add self.wait(0.4) at the beginning and self.wait(0.6) at the end.
- No prints, no external files, no randomness, no comments.

Environment hints:
- data_structure="{data_structure}" → templates module is "{templates_module_name}", class "{visualizer_class_name}".
- Scene name must be {scene_class_name}.
- The file must be self-contained and import only manim + the visualizer + stdlib.

Return only the object described by the schema. Do not include code fences or extra text.

{format_instructions}
"""


class GradeSchema(BaseModel):
    metrics: Dict[str, float]  # keys: readability, efficiency, robustness (0..5)
    explanations: Dict[str, str]  # same keys with short explanations
    verdict: bool  # LLM's guess, but server will override with actual tests
    comment: str  # a short overall summary


def get_solution_grade(
    code: str,
    problem_title: str,
    problem_description: str,
    reference_solution: str,
    difficulty: str,
    test_passed: int,
    test_total: int,
    fail_examples: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Call the LLM to grade the solution. Returns a dict with keys:
    metrics, explanations, verdict, comment
    """
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0)
    parser = PydanticOutputParser(pydantic_object=GradeSchema)
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", GRADING_PROMPT),
        ]
    ).partial(
        format_instructions=parser.get_format_instructions(),
        problem_title=problem_title,
        difficulty=difficulty,
        problem_description=problem_description,
        code=code,
        reference_solution=reference_solution or "(not provided)",
        test_passed=str(test_passed),
        test_total=str(test_total),
        fail_examples=json.dumps(fail_examples, ensure_ascii=False, indent=2),
    )

    try:
        res = llm.invoke(prompt.format_prompt().to_messages())
        parsed = parser.parse(res.content)
        m = parsed.metrics or {}
        metrics = {
            "readability": float(m.get("readability", 0.0) or 0.0),
            "efficiency": float(m.get("efficiency", 0.0) or 0.0),
            "robustness": float(m.get("robustness", 0.0) or 0.0),
        }
        explanations = {
            "readability": (parsed.explanations or {}).get("readability", ""),
            "efficiency": (parsed.explanations or {}).get("efficiency", ""),
            "robustness": (parsed.explanations or {}).get("robustness", ""),
        }
        return {
            "metrics": metrics,
            "explanations": explanations,
            "verdict": bool(parsed.verdict),
            "comment": parsed.comment or "",
        }
    except Exception as e:
        return {
            "metrics": {"readability": 0.0, "efficiency": 0.0, "robustness": 0.0},
            "explanations": {
                "readability": "Unable to grade due to an internal error.",
                "efficiency": "Unable to grade due to an internal error.",
                "robustness": "Unable to grade due to an internal error.",
            },
            "verdict": False,
            "comment": f"Grader error: {e}",
        }


# Animation Generation

DS_SPEC: Dict[str, Dict[str, Any]] = {
    "stack": {
        "ops": {"create", "push", "pop", "peek", "clear"},
        "synonyms": {
            "init": "create",
            "start": "create",
            "append": "push",
            "add": "push",
            "remove": "pop",
            "top": "peek",
            "reset": "clear",
            "empty": "clear",
        },
    }
}


def _allowed_ops(ds: str) -> set:
    return DS_SPEC.get(ds, DS_SPEC["stack"])["ops"]


def _normalize_op_name(ds: str, name: str) -> str:
    name = (name or "").strip().lower()
    syn = DS_SPEC.get(ds, DS_SPEC["stack"])["synonyms"]
    return syn.get(name, name)


def _spec_to_text(ds_spec: Dict[str, Dict[str, Any]]) -> str:
    lines = []
    names = ", ".join(sorted(ds_spec.keys()))
    lines.append(f"Supported data_structures: [{names}]")
    for ds in sorted(ds_spec.keys()):
        ops = ", ".join(sorted(ds_spec[ds].get("ops", [])))
        syn = ds_spec[ds].get("synonyms", {})
        syn_pairs = ", ".join(f"{k}→{v}" for k, v in sorted(syn.items()))
        syn_line = f"Synonyms: {syn_pairs}" if syn_pairs else "Synonyms: (none)"
        lines.append(f"- {ds}: ops = [{ops}]. {syn_line}.")
    return "\n".join(lines)


def _fallback_parse_prompt(prompt: str) -> Dict[str, Any]:
    """
    Deterministic, no-defaults fallback for simple english:
    e.g., "stack starting with 5,10,15 then push 20, peek, pop twice, clear"
    """
    text = (prompt or "").lower()
    ds = "stack"

    init: List[Any] = []
    m = re.search(r"(start(ing)? with|initial( state)?)\s+([^\.\n;]+)", text)
    if m:
        vals = re.findall(r"-?\d+\.?\d*", m.group(4))
        for s in vals:
            if re.fullmatch(r"-?\d+", s):
                init.append(int(s))
            else:
                try:
                    init.append(float(s))
                except Exception:
                    pass

    ops: List[Dict[str, Any]] = []
    tokens = re.split(r"[;,\.]\s*|\bthen\b|\band\b", text)
    for t in tokens:
        t = t.strip()
        if not t:
            continue
        if any(k in t for k in ["push", "add", "append"]):
            vals = re.findall(r"-?\d+\.?\d*", t)
            for s in vals:
                arg: Any
                if re.fullmatch(r"-?\d+", s):
                    arg = int(s)
                else:
                    try:
                        arg = float(s)
                    except Exception:
                        continue
                ops.append({"name": "push", "args": [arg]})
        elif any(k in t for k in ["peek", "top"]):
            ops.append({"name": "peek", "args": []})
        elif any(k in t for k in ["pop", "remove"]):
            n = 1
            if re.search(r"\btwice\b|2 times|x2|two", t):
                n = 2
            if re.search(r"\bthrice\b|3 times|x3|three", t):
                n = 3
            for _ in range(n):
                ops.append({"name": "pop", "args": []})
        elif any(k in t for k in ["clear", "reset", "empty"]):
            ops.append({"name": "clear", "args": []})

    return {"data_structure": ds, "initial_state": init, "operations": ops}


def _build_planning_prompt(ds_spec: Dict[str, Dict[str, Any]]) -> str:
    spec_text = _spec_to_text(ds_spec)
    return f"""
            Convert the user's request into a structured plan.

            {spec_text}

            Rules:
            - data_structure: one of the supported values above. If unclear, choose "stack".
            - initial_state: list of scalars; default [] if not specified.
            - operations: ordered list of steps; each step has:
              - name in the selected data structure's supported ops. Map synonyms as specified above.
              - args: positional args; for push use [value]; other ops use [].
              - run_time: optional float seconds
              - pause: optional float seconds

            If any step is unsupported for the chosen data structure, drop it. If push lacks a value, drop that step. If the first step is not "create", that is acceptable; the renderer may call create() first.

            Input:
            {{user_prompt}}

            Return only the object that matches the schema.

            {{format_instructions}}
          """.strip()


ANIMATION_PLANNING_PROMPT = _build_planning_prompt(DS_SPEC)


class OperationModel(BaseModel):
    name: str
    args: List[Any] = Field(default_factory=list)
    run_time: Optional[float] = None
    pause: Optional[float] = None


class PlanModel(BaseModel):
    data_structure: str
    initial_state: List[Any] = Field(default_factory=list)
    operations: List[OperationModel] = Field(default_factory=list)


def plan_animation_from_prompt(
    user_prompt: str, model: str = "gpt-4o-mini", temperature: float = 0.0
) -> Dict[str, Any]:
    parser = PydanticOutputParser(pydantic_object=PlanModel)
    prompt = ChatPromptTemplate.from_messages(
        [("system", ANIMATION_PLANNING_PROMPT)]
    ).partial(
        format_instructions=parser.get_format_instructions(),
        user_prompt=user_prompt or "",
    )
    try:
        llm = ChatOpenAI(model=model, temperature=temperature)
        res = llm.invoke(prompt.format_prompt().to_messages())
        parsed: PlanModel = parser.parse(res.content)
        ds = parsed.data_structure if parsed.data_structure in DS_SPEC else "stack"
        allowed = _allowed_ops(ds)
        ops: List[Dict[str, Any]] = []
        for op in parsed.operations or []:
            name = _normalize_op_name(ds, op.name)
            if name not in allowed:
                continue
            if name == "push":
                if not op.args:
                    continue
                val = op.args[0]
                if isinstance(val, str):
                    v = val.strip()
                    if re.fullmatch(r"-?\d+", v):
                        val = int(v)
                    else:
                        try:
                            val = float(v)
                        except Exception:
                            val = v[:32] if v else v
                elif not isinstance(val, (int, float, str)):
                    continue
                args = [val]
            else:
                args = []
            step: Dict[str, Any] = {"name": name, "args": args}
            if op.run_time is not None:
                step["run_time"] = float(op.run_time)
            if op.pause is not None:
                step["pause"] = float(op.pause)
            ops.append(step)
        return {
            "data_structure": ds,
            "initial_state": parsed.initial_state,
            "operations": ops,
        }
    except Exception:
        return _fallback_parse_prompt(user_prompt)


def generate_animation_from_prompt(user_prompt: str) -> Dict[str, Any]:
    plan = plan_animation_from_prompt(user_prompt)

    ds = (
        plan.get("data_structure") if plan.get("data_structure") in DS_SPEC else "stack"
    )
    init = plan.get("initial_state") or []

    ops: List[Dict[str, Any]] = []
    allowed = _allowed_ops(ds)
    for o in plan.get("operations", []):
        name = _normalize_op_name(ds, o.get("name", ""))
        if name not in allowed:
            continue
        args = o.get("args", [])
        if name == "push":
            if not args:
                continue
            val = args[0]
            if isinstance(val, str):
                v = val.strip()
                if re.fullmatch(r"-?\d+", v):
                    val = int(v)
                else:
                    try:
                        val = float(v)
                    except Exception:
                        val = v[:32] if v else v
            elif not isinstance(val, (int, float, str)):
                continue
            args = [val]
        else:
            args = []
        step = {"name": name, "args": args}
        if "run_time" in o:
            step["run_time"] = float(o["run_time"])
        if "pause" in o:
            step["pause"] = float(o["pause"])
        ops.append(step)

    return generate_animation(data_structure=ds, initial_state=init, operations=ops)


class AnimationResponse(BaseModel):
    filename: str
    scene_name: str
    code: str


def _ensure_dirs(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def _discover_video(tmp_dir: str) -> Optional[str]:
    root = os.path.join(tmp_dir, "media", "videos")
    if not os.path.isdir(root):
        return None
    for dirpath, _, filenames in os.walk(root):
        for f in filenames:
            if f.endswith(".mp4"):
                return os.path.join(dirpath, f)
    return None


def generate_animation(
    data_structure: str,
    initial_state: List[Any],
    operations: List[Dict[str, Any]],
    model: str = "gpt-4o-mini",
    temperature: float = 0.0,
) -> Dict[str, Any]:
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    animations_dir = os.path.join(base_dir, "animations")
    templates_dir = os.path.join(animations_dir, "templates")
    tmp_dir = os.path.join(animations_dir, "tmp")
    _ensure_dirs(tmp_dir)

    cap = data_structure[:1].upper() + data_structure[1:].lower()
    scene_class_name = f"{cap}Example"
    templates_module_name = data_structure.lower()
    visualizer_class_name = f"{cap}Visualizer"
    default_filename = f"tmp_{templates_module_name}.py"

    llm = ChatOpenAI(model=model, temperature=temperature)
    parser = PydanticOutputParser(pydantic_object=AnimationResponse)

    prompt = ChatPromptTemplate.from_messages([("system", ANIMATION_PROMPT)]).partial(
        format_instructions=parser.get_format_instructions(),
        data_structure=data_structure,
        templates_module_name=templates_module_name,
        visualizer_class_name=visualizer_class_name,
        scene_class_name=scene_class_name,
        initial_state=json.dumps(initial_state, ensure_ascii=False),
        operations=json.dumps(operations, ensure_ascii=False),
    )

    try:
        res = llm.invoke(prompt.format_prompt().to_messages())
        parsed = parser.parse(res.content)

        filename = parsed.filename or default_filename
        if not filename.endswith(".py"):
            filename = f"{filename}.py"

        file_path = os.path.join(tmp_dir, filename)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(parsed.code)

        env = os.environ.copy()
        add_path = os.pathsep.join([templates_dir, env.get("PYTHONPATH", "")]).strip(
            os.pathsep
        )
        env["PYTHONPATH"] = add_path

        cmd = ["manim", "-ql", filename, parsed.scene_name]
        proc = subprocess.run(
            cmd,
            cwd=tmp_dir,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        video_path = _discover_video(tmp_dir)
        ok = proc.returncode == 0 and bool(video_path)

        video_rel_tmp = ""
        if video_path:
            video_rel_tmp = os.path.relpath(video_path, start=tmp_dir).replace(
                "\\", "/"
            )

        final_abs = ""
        final_rel = ""

        if ok:
            try:
                p_norm = video_path.replace("\\", "/")
                parts = p_norm.split("/media/", 1)
                under_media = (
                    parts[1]
                    if len(parts) == 2
                    else f"videos/{os.path.basename(p_norm)}"
                )

                final_abs = os.path.join(settings.MEDIA_ROOT, under_media)
                os.makedirs(os.path.dirname(final_abs), exist_ok=True)
                shutil.copy2(video_path, final_abs)

                media_prefix = (settings.MEDIA_URL or "/media/").strip("/")
                final_rel = f"{media_prefix}/{under_media}"
            except Exception:
                final_abs = video_path
                final_rel = video_rel_tmp

        return {
            "ok": ok,
            "file_path": file_path,
            "scene_name": parsed.scene_name,
            "stdout": proc.stdout,
            "stderr": proc.stderr,
            "video_path": final_abs or video_path or "",
            "video_rel": final_rel or video_rel_tmp,
            "media_dir": os.path.join(tmp_dir, "media"),
            "cmd": " ".join(cmd),
        }
    except Exception as e:
        return {
            "ok": False,
            "file_path": "",
            "scene_name": scene_class_name,
            "stdout": "",
            "stderr": f"animation error: {e}",
            "video_path": "",
            "video_rel": "",
            "media_dir": "",
            "cmd": "",
        }


# Code Editor Context


def snippet(s: str, max_chars: int = 2000) -> str:
    if not s:
        return ""
    s = s.strip()
    if len(s) <= max_chars:
        return s
    half = max_chars // 2
    return s[:half] + "\n\n<...snip...>\n\n" + s[-half:]


# Autonomous Hints


def append_time_stamp(file_name, timestamp, code):
    path = f"{settings.USER_FILES}/{file_name}"
    data = {}
    try:
        with open(path, "r") as f:
            data = json.load(f)
    except FileNotFoundError:
        data = {}

    data[timestamp] = code
    try:
        with open(path, "w") as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        return False
