from django.conf import settings
import os
import sys
import io
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

