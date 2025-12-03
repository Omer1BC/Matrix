import os
import sys
import io
import ast
import json
import re
from typing import Dict, List, Any, Optional
import importlib.util
from langchain_core.tools import Tool
from datetime import datetime
from django.conf import settings
import subprocess
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain.agents import create_tool_calling_agent, AgentExecutor


def save_to_txt(data: str, filename: str = "research_output.txt"):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    formatted_text = f"--- Research Output ---\nTimestamp: {timestamp}\n\n{data}\n\n"

    return f"Data successfully saved to {filename}"


save_tool = Tool(
    name="save_text_to_file",
    func=save_to_txt,
    description="Saves structured research data to a text file.",
)


def get_file_sections(file_path):
    with open(file_path, "r") as f:
        lines = f.readlines()
    sections = [[]]  # Initialize with one empty section
    prefix = '""""""'  # Changed from single quotes to double quotes to match file format
    for line in lines:
        if line.strip().startswith(prefix):
            sections.append([])
        else:
            sections[-1].append(line)
    # Filter out empty sections
    sections = [s for s in sections if s]

    # Ensure exactly 3 sections: imports, solution, tests
    # If there are 4 sections, the first is likely a stub - merge it with imports
    if len(sections) == 4:
        sections = [sections[0] + sections[1], sections[2], sections[3]]
    elif len(sections) > 4:
        # Merge all sections before the last 2 into imports
        sections = [sum(sections[:-2], []), sections[-2], sections[-1]]

    return sections


def extract_func_name_from_stub(stub: str) -> str | None:
    m = re.search(r"^\s*def\s+([A-Za-z_]\w*)\s*\(", stub, re.M)
    return m.group(1) if m else None


def expected_entrypoint(problem_id: int) -> str | None:
    tpl_path = id_to_file_name(problem_id)
    imports, solution, tests = get_file_sections(tpl_path)
    imports_str = "".join(imports)
    tests_str = "".join(tests)
    soln_str = "".join(solution)

    m = re.search(r'ENTRYPOINT\s*=\s*["\']([A-Za-z_]\w*)["\']', imports_str)
    if m:
        return m.group(1)

    m = re.search(r"^\s*result\s*=\s*([A-Za-z_]\w*)\s*\(", tests_str, re.M)
    if m:
        return m.group(1)

    m = re.search(r"^\s*def\s+([A-Za-z_]\w*)\s*\(", soln_str, re.M)
    if m:
        return m.group(1)

    return None


def user_defines_func(name: str, code: str) -> bool:
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return False
    return any(isinstance(n, ast.FunctionDef) and n.name == name for n in tree.body)


def insert_user_code(file_path, user_code, sample=None, include_solution=False):
    imports, solution, tests = get_file_sections(file_path)

    parts = ["".join(imports)]

    if include_solution:
        parts += ["\n", "".join(solution)]
    parts += ["\n", user_code, "\n", "".join(tests)]
    res = "".join(parts)
    if sample:
        with open(os.path.join(settings.MEDIA_ROOT, sample), "w") as f:
            f.write(res)
    return res


def id_to_file_name(problem_id):
    res = "1_remove.py"
    return os.path.join(settings.MEDIA_ROOT, res)


def run(problem_id, code):
    try:
        compile(code, "user_code.py", "exec")
    except SyntaxError as e:
        return [
            {
                "type": "SyntaxError",
                "msg": e.msg,
                "lineno": e.lineno or 1,
                "offset": e.offset or 1,
                "line": (e.text or "").rstrip("\n"),
            },
            True,
        ]

    required = expected_entrypoint(problem_id)
    if not required:
        return [
            {
                "type": "EntrypointError",
                "msg": "Template missing ENTRYPOINT; contact admin.",
            },
            True,
        ]

    if not user_defines_func(required, code):
        return [
            {
                "type": "EntrypointError",
                "msg": f"Define `{required}` with the required signature.",
            },
            True,
        ]

    media_path = settings.MEDIA_ROOT
    test_file = id_to_file_name(problem_id)
    file_path = os.path.join(media_path, test_file)

    res = insert_user_code(file_path, code, sample="demo.py", include_solution=False)
    old_stdout = sys.stdout
    sys.stdout = mystdout = io.StringIO()
    try:
        exec(res, {})
        output = mystdout.getvalue()
        return [output, False]
    except Exception as e:
        return [f"{type(e).__name__}: {e}", True]
    finally:
        sys.stdout = old_stdout


CODE_HINTS_PROMPT = """You are a technical interviewer for a software engineer.
Learner preferences: {preferences_block}
The interviewee has been updating their code following your guidance as shown here
{code}. You compare the candidate's code against the solution {solution} and
notice that their code fails on the following tests cases: {cases}.
You don't want to give them the answer, but want them to improve their problem solving ability in technical interviews.
ONLY add comments to their existing code to guide specifying what they are missing, but do NOT put the actual solution in the commented code. You MUST always respond in the following template and no other text.
{format_instructions}"""

TOOL_HINTS_PROMPT = """You are a technical interviewer for a software engineer.
Learner preferences: {preferences_block}
The interviewee has been updating their code following your guidance as shown here
{code}. This is one suggestion that occurs to give. You MUST NOT explain the answer directly regarding how this approach {pattern} is relevant to the problem, but give the person enough information to figure it out.
You MUST always respond in the following template and no other text.
{format_instructions}"""

# CODE_HINTS_PROMPT_2 = """You are a technical interviewer for a software engineer.
# Learner preferences: {preferences_block}
# The interviewee has been updating their code following your guidance as shown here
# {code}. You compare the candidate's code against the solution {solution} and
# notice that their code fails on the following tests cases: {cases}.
# You don't want to give them the answer, but want them to improve their problem solving ability in technical interviews.
# ONLY hints to each relevant line number of their code specifying what they are missing, but do NOT put the actual solution in the commented code.
# You MUST always respond in the following template and no other text.
# {format_instructions}"""

CODE_HINTS_PROMPT_2 = """You are a technical interviewer helping a software engineer improve their problem-solving skills.

Context:
- Learner preferences: {preferences_block}
- Candidate's current code: {code}
- Expected solution approach: {solution}
- Failed test cases: {cases}

Your Task:
Analyze why the candidate's code fails the given test cases by comparing their approach to the expected solution. Provide educational hints that guide discovery without revealing the answer.

Hint Guidelines:
1. IDENTIFY the specific line(s) where logic diverges from correct behavior
2. DESCRIBE what the code is currently doing at that line
3. ASK a guiding question or provide a conceptual hint about what's missing
4. DO NOT include any actual code or syntax from the solution
5. DO NOT write corrected code, even in comments

For each issue found:
- Reference the exact line number(s)
- Focus on the conceptual gap, not the implementation
- Use questions like "What happens when...?" or "Have you considered...?"
- If multiple issues exist, prioritize the most fundamental one first

Example hint format:
"Line 5: Your loop currently processes all elements. What should happen when the array is empty?"
You MUST always respond in the following template and no other text.

{format_instructions}
"""


CODE_HINTS_PROMPT_3 = """You are a technical interviewer for a software engineer.
Learner preferences: {preferences_block}
The interviewee has been updating their code following your guidance as shown here
{code}. You compare the candidate's code against the solution {solution} and
notice that their code fails on the following tests cases: {cases}.
You don't want to give them the answer, but want them to improve their problem solving ability in technical interviews.
ONLY hints to each relevant line number of their code specifying what they are missing, but do NOT put the actual solution in the commented code. You MUST always respond in the following template and no other text.
{format_instructions}"""

ASK_AI_PROMPT = """
You are a technical interviewer for a software engineer.
Learner preferences: {preferences_block}
The problem statement is {question}.
They are confused about what a particular section of the problem means. Help them out as concisely as you can. You MUST always respond in the following template and no other text.
{format_instructions}
"""

ERROR_PROMPT = """
You are going to play the role of the interpreter.
Learner preferences: {preferences_block}
It is known that the following code {code} has the error {error}. When run with the imports {imports} and tested like this {tests}.
Identify the line number of the code snippet that needs to be replaced and what syntactically correct python code it needs to be replaced by to fix the error. Note that since the snippet is a part
of a larger file, the line numbers are relative to the file, not the snippet. Since the replacement lines will be pasted in exactly character by character, be sure to include any leading tabs. You MUST always respond in the following template and no other text.
{format_instructions}
"""


def get_ai_hints(
    code: str, tests: str = "", problem_id: int = 1, preferences: str = ""
):
    _, solution_section, _ = get_file_sections(id_to_file_name(problem_id))
    soln = "".join(solution_section)

    class ResearchResponse(BaseModel):
        annotated_code: str
        expalantions_of_hint: str
        thought_provoking_test_case_to_consider_as_comment_block: str

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0)
    parser = PydanticOutputParser(pydantic_object=ResearchResponse)
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", CODE_HINTS_PROMPT),
            ("placeholder", "{chat_history}"),
            ("human", "{query}"),
            ("placeholder", "{agent_scratchpad}"),
        ]
    ).partial(
        format_instructions=parser.get_format_instructions(),
        preferences_block=_preferences_block(preferences),
        code=code,
        solution=soln,
        cases="""
stderr: ❌ Test failed for input nums = [3, 2, 4], target = 6
stderr: Expected output: [1, 2]
stderr: Actual output: [2, 1]
""",
    )

    tools = [save_tool]
    agent = create_tool_calling_agent(llm=llm, prompt=prompt, tools=tools)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
    query = "My code is not working. Can you give me some suggestions to think about while not explicitly giving me the answer?"
    raw_response = agent_executor.invoke({"query": query})

    try:
        output_str = raw_response.get("output")
        return json.loads(output_str)
    except Exception as e:
        return {"Error": e, "raw": raw_response}


def get_annotated_ai_hints(code, tests, problem_id: int = 1, preferences: str = ""):
    _, solution_section, _ = get_file_sections(id_to_file_name(problem_id))
    soln = "".join(solution_section)

    class ResearchResponse(BaseModel):
        line_number_to_comment: Dict[int, str]
        expalantions_of_hint: str
        thought_provoking_test_case_to_consider_as_comment_block: str

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0)
    parser = PydanticOutputParser(pydantic_object=ResearchResponse)
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", CODE_HINTS_PROMPT_2),
            ("placeholder", "{chat_history}"),
            ("human", "{query}"),
            ("placeholder", "{agent_scratchpad}"),
        ]
    ).partial(
        format_instructions=parser.get_format_instructions(),
        preferences_block=_preferences_block(preferences),
        code=code,
        solution=soln,
        cases="""
stderr: ❌ Test failed for input nums = [3, 2, 4], target = 6
stderr: Expected output: [1, 2]
stderr: Actual output: [2, 1]
""",
    )

    tools = [save_tool]
    agent = create_tool_calling_agent(llm=llm, prompt=prompt, tools=tools)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
    query = "My code is not working. Can you give me some suggestions to think about while not explicitly giving me the answer?"
    raw_response = agent_executor.invoke({"query": query})

    try:
        output_str = raw_response.get("output")
        return json.loads(output_str)
    except Exception as e:
        return {"Error": e, "raw": raw_response}


def ask_ai(question, text, preferences: str = ""):
    class ResearchResponse(BaseModel):
        response: str

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0)
    parser = PydanticOutputParser(pydantic_object=ResearchResponse)
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", ASK_AI_PROMPT),
            ("placeholder", "{chat_history}"),
            ("human", "{query}"),
            ("placeholder", "{agent_scratchpad}"),
        ]
    ).partial(
        format_instructions=parser.get_format_instructions(),
        preferences_block=_preferences_block(preferences),
        question=question,
    )

    tools = [save_tool]
    agent = create_tool_calling_agent(llm=llm, prompt=prompt, tools=tools)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
    query = f"I'm not sure what {text} exactly means in the context of the problem statement. Can you help me understand it better?"
    raw_response = agent_executor.invoke({"query": query})
    try:
        output_str = raw_response.get("output")
        return json.loads(output_str)
    except Exception as e:
        return {"Error": e, "raw": raw_response}


def get_tool_hints(code, pattern, preferences: str = ""):
    class ResearchResponse(BaseModel):
        explanation: str

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0)
    parser = PydanticOutputParser(pydantic_object=ResearchResponse)
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", TOOL_HINTS_PROMPT),
            ("placeholder", "{chat_history}"),
            ("human", "{query}"),
            ("placeholder", "{agent_scratchpad}"),
        ]
    ).partial(
        format_instructions=parser.get_format_instructions(),
        preferences_block=_preferences_block(preferences),
        code=code,
        solution="""def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i""",
        pattern=pattern,
    )

    tools = [save_tool]
    agent = create_tool_calling_agent(llm=llm, prompt=prompt, tools=tools)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
    query = "I'm a little stuck here, can you give me some suggestions to think about to get closer to the solution"
    raw_response = agent_executor.invoke({"query": query})

    try:
        output_str = raw_response.get("output")
        return json.loads(output_str)
    except Exception as e:
        return {"Error": e, "raw": raw_response}


def get_error_details(problem_id, error, code, preferences: str = ""):
    imports, _, tests = get_file_sections(id_to_file_name(problem_id))
    imprts = "".join(imports)
    tsts = "".join(tests)

    class ResearchResponse(BaseModel):
        line_number_to_replacement: Dict[int, str]
        expalantions_of_hint: str

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0)
    parser = PydanticOutputParser(pydantic_object=ResearchResponse)
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", ERROR_PROMPT),
            ("placeholder", "{agent_scratchpad}"),
        ]
    ).partial(
        format_instructions=parser.get_format_instructions(),
        preferences_block=_preferences_block(preferences),
        code=code,
        imports=imprts,
        tests=tsts,
        error=error,
    )

    raw_response = llm.invoke(prompt.format_prompt().to_messages())
    try:
        output_str = raw_response.content
        output_dict = parser.parse(output_str)
        return output_dict.dict()
    except Exception as e:
        return {"Error": str(e), "raw": raw_response.content}


def get_anim(data={"pattern": "Set", "action": "Insert", "step": 6}):
    pattern, action, step = data["pattern"], data["action"], data["step"]
    path = pattern_to_file(pattern)
    # print('type',type(step))
    insert_animation(path, action)
    name = f"step_{step}.mp4"
    subprocess.run(
        ["manim", path, "Array", "-ql", "-n", f"{str(step)},{str(step)}", "-o", name],
        check=True,
    )

    return {"name": name}


def insert_animation(path, action):

    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    play_pattern = re.compile(r"^\s*self\.play\(.*\)\s*$")
    last_play_index = None

    # Find the index of the last self.play(...) line
    for i, line in enumerate(lines):
        if play_pattern.match(line):
            last_play_index = i

    if last_play_index is None:
        raise ValueError("No self.play(...) line found in the file.")

    # Determine correct indentation (match the last play)
    indentation = re.match(r"^(\s*)", lines[last_play_index]).group(1)
    insertion = indentation + action + "\n"

    # Insert the new play call right after the last one
    lines.insert(last_play_index + 1, insertion)

    # Write the updated lines back to the file
    with open(path, "w", encoding="utf-8") as f:
        f.writelines(lines)


def pattern_to_file(pattern):
    keys = {
        "DFS": "3_dfs.py",
        "Set": "4_set.py",
        "BST": "../animations/templates/bst.py",
    }
    return os.path.join(settings.MEDIA_ROOT, keys[pattern])


def file_from_pattern(pattern):
    return os.path.join(settings.MEDIA_ROOT, "patterns", "Array.py"), os.path.join(
        "/media/videos/Array/480p15/Array.mp4"
    )


def pattern_to_video(name, data):
    if name == "BST":
        remove_path = os.path.join(settings.MEDIA_ROOT, "1_remove.py")
        spec = importlib.util.spec_from_file_location("bst_remove", remove_path)
        if not spec or not spec.loader:
            raise ImportError(f"Unable to load module from {remove_path}")
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)

        case_index = None
        if isinstance(data, dict):
            case_index = data.get("case_index")
        elif isinstance(data, list):
            for entry in data:
                s = str(entry)
                if "case_index" in s:
                    try:
                        case_index = int(s.split("=")[-1].strip())
                        break
                    except Exception:
                        case_index = None

        if case_index is None:
            raise ValueError("BST animation requires a 'case_index' in data")

        rel_path = mod.animate_test_case(int(case_index))
        return {"data": rel_path}

    path = pattern_to_file(name)
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    # Find the start of the construct method
    for i, line in enumerate(lines):
        if re.match(r"\s*def construct\(self\):", line):
            insert_index = i + 1
            break
    else:
        raise ValueError("construct method not found")

    # Insert edges assignment
    for input in data:
        print("input")
        lines.insert(insert_index, f"        {input}\n")

    # Write the modified file back
    path_no_mime = path[:-3]
    new_path = path_no_mime + "-1" + path[-3:]
    new_name = os.path.basename(new_path)
    with open(new_path, "w", encoding="utf-8") as f:
        f.writelines(lines)

    # Render with manim
    subprocess.run(
        ["manim", new_path, "-ql", "-o", new_name[:-3], "--disable_caching"], check=True
    )
    return {"data": f"media/videos/{new_name[:-3]}/480p15/{new_name[:-3]}.mp4"}


def parse_results_str(s: str) -> Dict[str, Any]:

    if not s or not isinstance(s, str):
        return {}
    s = s.strip()

    try:
        return ast.literal_eval(s)
    except Exception:
        pass

    try:
        return json.loads(s.replace("'", '"'))
    except Exception:
        return {}


def _preferences_block(preferences: Optional[str]) -> str:
    p = (preferences or "").strip()
    if not p:
        return "none"
    # cap to avoid runaway payloads
    return p[:800]
