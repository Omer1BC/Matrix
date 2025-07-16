from django.conf import settings
import os
import sys
import io

from dotenv import load_dotenv
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain.agents import create_tool_calling_agent, AgentExecutor
# from tools import save_tool
import json


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

def insert_user_code(file_path, user_code,sample=None):
    with open(file_path, "r") as f:
        lines = f.readlines()
    # Find where imports end (first non-import line)
    import_lines = []
    rest_lines = []
    for line in lines:
        if line.strip().startswith("import") or line.strip().startswith("from"):
            import_lines.append(line)
        else:
            rest_lines.append(line)
    res = ''.join(import_lines) + "\n" + user_code + "\n" + ''.join(rest_lines)
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

def run(code):
    media_path = settings.MEDIA_ROOT  
    test_file = id_to_file_name(1)  
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
def get_ai_hints(code,tests):
    class ResearchResponse(BaseModel):
        annotated_code: str
        expalantions_of_hint: str
        thought_provoking_test_case_to_consider_as_comment_block: str
        
    load_dotenv()
    # llm = ChatAnthropic(model="claude-3-5-sonnet-20241022")
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0,)
    parser = PydanticOutputParser(pydantic_object=ResearchResponse)
    print("Here is code:",code)
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
    You are a technical intervewier for a software engineer.
    The interviewee has been updating their code following your guidance as shown here
    {code}. You compare the candidate's code against the solution {solution} and 
    notice that their code fails on the following tests cases: {cases}. 
    You don't want to give them the answer, but want them to improve their problem solving abilitiy in technical interviews. 
    ONLY add comments to their existing code to guide specifying what they are missing, but do NOT put the actual solution in the commented code. You MUST always respond in the following template and no other text.\n
    {format_instructions}
                """,
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
            seen[num] = i""",cases="""
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
        # print('loaded output_dict', output_dict)
        # structured_response = parser.parse(output_str)  # Pass dict directly
        # print('structured',structured_response)
    except Exception as e:
        return {"Error":e,"raw":raw_response}



