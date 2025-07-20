from django.conf import settings
import os
import sys
import io
import subprocess
from dotenv import load_dotenv
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain.agents import create_tool_calling_agent, AgentExecutor
# from tools import save_tool
import json
import re

from langchain.tools import Tool
from datetime import datetime

def save_to_txt(data: str, filename: str = "research_output.txt"):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    formatted_text = f"--- Research Output ---\nTimestamp: {timestamp}\n\n{data}\n\n"

    # with open(filename, "a", encoding="utf-8") as f:
    #     f.write(formatted_text)
    
    return f"Data successfully saved to {filename}"

save_tool = Tool(
    name="save_text_to_file",
    func=save_to_txt,
    description="Saves structured research data to a text file.",
)
def get_file_sections(file_path):
    with open(file_path, "r") as f:
        lines = f.readlines()
    sections = []
    prefix = "''''''"
    for line in lines:
        if line.strip().startswith(prefix):
            sections.append([])
        else:
            print('error')
            sections[-1].append(line)
    return sections

def insert_user_code(file_path, user_code,sample=None):
    imports,solution,tests = get_file_sections(file_path)

    # import_lines = []
    # rest_lines = []
    # for line in lines:
    #     if line.strip().startswith("import") or line.strip().startswith("from"):
    #         import_lines.append(line)
    #     else:
    #         rest_lines.append(line)
    res = (''.join(imports) + "\n" + ''.join(solution) + "\n" + user_code + "\n" + ''.join(tests))
    if sample:
        with open(os.path.join(settings.MEDIA_ROOT, sample), "w") as f:
            f.write(res)
    return res
def get_problem_details(problem_id):
    # This function should fetch problem details from a database or other source
    # For demonstration, we return a static response

    res =  {
        "title": "Example Problem",
        "description": "Description of the problem goes here.",
        "test_cases": 3,
        "method_stub": "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        return []",
        "input_args": ["nums","target","output","expected"] 
    }
    result,error = run(res['method_stub'])
    res ['tests'] = result if not error else {}
    return res

   
def id_to_file_name(problem_id):
    res = "1_2sum.py"  
    return os.path.join(settings.MEDIA_ROOT, res)  

def run(problem_id,code):
    media_path = settings.MEDIA_ROOT  
    test_file = id_to_file_name(problem_id)  
    file_path = os.path.join(media_path, test_file)
    return_pair = ["",False]
    res = insert_user_code(
    file_path,
    code,sample="demo.py"
    )
    old_stdout = sys.stdout
    sys.stdout = mystdout = io.StringIO()
    try:
        exec(res, {})
        output = mystdout.getvalue()
    except Exception as e:
        output = str(e)
        return_pair[1] = True
    finally:
        sys.stdout = old_stdout
    return_pair[0] = output
    return return_pair

CODE_HINTS_PROMPT = """You are a technical intervewier for a software engineer.
    The interviewee has been updating their code following your guidance as shown here
    {code}. You compare the candidate's code against the solution {solution} and 
    notice that their code fails on the following tests cases: {cases}. 
    You don't want to give them the answer, but want them to improve their problem solving abilitiy in technical interviews. 
    ONLY add comments to their existing code to guide specifying what they are missing, but do NOT put the actual solution in the commented code. You MUST always respond in the following template and no other text.\n
    {format_instructions}"""
TOOL_HINTS_PROMPT = """You are a technical intervewier for a software engineer.
    The interviewee has been updating their code following your guidance as shown here
    {code}. This is one suggestion that occurs to to give. You MUST NOT explain the answer directly regarding how this approach {pattern} is relevant to the problem, but give the person enough information to figure it out. 
    You MUST always respond in the following template and no other text.\n
    {format_instructions}"""

def get_ai_hints(code,tests,problem_id=1):
    _,solution_section,_ = get_file_sections(id_to_file_name(problem_id))
    with open(os.path.join(settings.MEDIA_ROOT, "demo2.py"), "w") as f:
        f.write(''.join(solution_section))
    soln = ''.join(solution_section)
    class ResearchResponse(BaseModel):
        annotated_code: str
        expalantions_of_hint: str
        thought_provoking_test_case_to_consider_as_comment_block: str
        
    load_dotenv()
    # llm = ChatAnthropic(model="claude-3-5-sonnet-20241022")
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0,)
    parser = PydanticOutputParser(pydantic_object=ResearchResponse)
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                CODE_HINTS_PROMPT,
            ),
            ("placeholder", "{chat_history}"),
            ("human", "{query}"),
            ("placeholder", "{agent_scratchpad}"),
        ]
    ).partial(format_instructions=parser.get_format_instructions(),code=code,solution=soln,cases="""
    stderr: ❌ Test failed for input nums = [3, 2, 4], target = 6
    stderr: Expected output: [1, 2]
    stderr: Actual output: [2, 1]
    """)

    tools = [ save_tool]
    agent = create_tool_calling_agent(
        llm=llm,
        prompt=prompt,
        tools=tools
    )

    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
    query = "My code is not working. Can you give me some suggestions to think about while not explicitly giving me the answer?"
    raw_response = agent_executor.invoke({"query":query})

    try:
        output_str = raw_response.get("output")
        output_dict = json.loads(output_str)  # Convert JSON string to Python dict
        return output_dict
    except Exception as e:
        return {"Error":e,"raw":raw_response}



def get_tool_hints(code,pattern):
    
    class ResearchResponse(BaseModel):
        explanation: str
        
    load_dotenv()
    
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0,)
    parser = PydanticOutputParser(pydantic_object=ResearchResponse)
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                TOOL_HINTS_PROMPT,
            ),
            ("placeholder", "{chat_history}"),
            ("human", "{query}"),
            ("placeholder", "{agent_scratchpad}"),
        ]
    ).partial(format_instructions=parser.get_format_instructions(),code=code,solution="""def two_sum(nums, target):
        seen = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i""",pattern=pattern)
    tools = [ save_tool]
    agent = create_tool_calling_agent(
        llm=llm,
        prompt=prompt,
        tools=tools
    )

    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
    query = "I'm a little stuck here, can you give me some suggestions to think about to get closer to the solution"
    raw_response = agent_executor.invoke({"query":query})

    try:
        output_str = raw_response.get("output")
        output_dict = json.loads(output_str)  # Convert JSON string to Python dict
        return output_dict
    except Exception as e:
        return {"Error":e,"raw":raw_response}
def get_anim(data={"pattern": "Set","action":"Insert","step": 6}):
    pattern,action, step = data['pattern'],data['action'],data["step"]
    path = pattern_to_file(pattern)
    # print('type',type(step))
    insert_animation(path,action)
    name =  f"step_{step}.mp4"
    subprocess.run(["manim",path,"Array","-ql","-n",f"{str(step)},{str(step)}","-o",name],check=True)
    
    return {"name":name}

def insert_animation(path,action):

    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    play_pattern = re.compile(r'^\s*self\.play\(.*\)\s*$')
    last_play_index = None

    # Find the index of the last self.play(...) line
    for i, line in enumerate(lines):
        if play_pattern.match(line):
            last_play_index = i

    if last_play_index is None:
        raise ValueError("No self.play(...) line found in the file.")

    # Determine correct indentation (match the last play)
    indentation = re.match(r'^(\s*)', lines[last_play_index]).group(1)
    insertion = indentation + action + "\n"

    # Insert the new play call right after the last one
    lines.insert(last_play_index + 1, insertion)

    # Write the updated lines back to the file
    with open(path, "w", encoding="utf-8") as f:
        f.writelines(lines)

def pattern_to_file(pattern):
    return os.path.join(settings.MEDIA_ROOT,"2_Array.py")
