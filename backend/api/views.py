from django.shortcuts import render
# Create your views here.
from django.http import JsonResponse

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import io
import sys
from django.conf import settings

import os
from utils.utils import *
from utils.problem_info import *

@csrf_exempt
def run_python(request):
    media_path = settings.MEDIA_ROOT  # Absolute path to media folder
    # Example: get a file path
    file_path = os.path.join(media_path, "1_2sum.py")
    if request.method == "POST" and request.content_type == "application/json":
        import json
        try:
            body = json.loads(request.body)
            code = body.get("code", "")
            res = insert_user_code(
            file_path,
            code,sample="demo.py",
            )
            old_stdout = sys.stdout
            sys.stdout = mystdout = io.StringIO()
            try:
                exec(res, {})
                output = mystdout.getvalue()
            except Exception as e:
                output = str(e)
            finally:
                sys.stdout = old_stdout
            return JsonResponse(output,safe=False)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request"}, status=400)
@csrf_exempt
def problem_details(request):
    print(request.method,request.content_type)
    if request.method == "POST" and request.content_type == "application/json":
        import json
        try:
            body = json.loads(request.body)
            #Modularize
            print(body)
            problem_id = body.get("problem_id", "")
            res = {
                "title": "Number of Connected Components in an Undirected Graph",
                "difficulty" : "Medium",
                "description" : '''There is an undirected graph with n nodes. There is also an edges array, where edges[i] = [a, b] means that there is an edge between node a and node b in the graph.

The nodes are numbered from 0 to n - 1.

Return the total number of connected components in that graph.''',
                "method_stub" : "def twoSum(self, nums: List[int], target: int) -> List[int]:\n        return []",
                "input_args": ["nums","target","output","expected"],
                 "tools" : {"DFS":{"description": "Algorithm for traversing a graph",
                                    "args": {
                                        "edges": {"type": "List[List[int]]","default_value": "[[1,2]]"}
                                        },
                                    "code": '''#DFS
visit = set()
def dfs(u):
    visit.add(u)
    for nbr in nbrs(u):
        if nbr not in visit:
            dfs(nbr)'''
                                    },
                            "Set" : {"description": "Unordered data structure with O(1) insertion, removal, and find",
                                    "args": {"nums": {"type":"List[int]","default_value":"[1,2,3,2,5]"}
                                        },
                                    "code":'''#Set
elements = set()
elements.add(2) # O(1)
if 2 in elements: # O(1)
elements.remove(2) # O(1)'''
                                    }                     
                            },
            }
            result,error = run(problem_id,res['method_stub']) 
            res['tests'] = result if not error else {}
            # problem_details = get_problem_details(problem_id) 
            return JsonResponse(res)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Malformed Request"}, status=400)
@csrf_exempt
def get_tests(request):
    if request.method == "POST" and request.content_type == "application/json":
        import json
        body = json.loads(request.body)
        problem_id = body.get("problem_id", "")
        code = body.get("code","")
        result,error = run(problem_id,code)
        res = {
            "result": result,
            "error": int(error)
        }
        return JsonResponse(res)
    return JsonResponse({"error": "Malformed Request"}, status=400)
@csrf_exempt
def ai_hints(request):
    if request.method == "POST" and request.content_type == "application/json":
        print("inside posts")
        import json
        try:
            body = json.loads(request.body)
            code = body.get("code", "")
            tests = body.get("tests", "")
            resp = get_ai_hints(code,tests) 
            return JsonResponse(resp)
        except Exception as e:
            return JsonResponse({"Error Occured": str(e)}, status=400)
    print('malformed request')
    return JsonResponse({"error": "Malformed Request"}, status=400)
@csrf_exempt
def ai_tool_hints(request):
    if request.method == "POST" and request.content_type == "application/json":
        print("inside posts")
        import json
        try:
            body = json.loads(request.body)
            code = body.get("code", "")
            pattern = body.get("pattern", "")
            resp = get_tool_hints(code,pattern) 
            return JsonResponse(resp)
        except Exception as e:
            return JsonResponse({"Error Occured": str(e)}, status=400)
    return JsonResponse({"error": "Malformed Request"}, status=400)
@csrf_exempt
def get_animation(request):
    if request.method == "POST" and request.content_type == "application/json":
        import json
        try:
            body = json.loads(request.body)
            data = body.get("data")

            return JsonResponse(get_anim(data))
        except Exception as e:
            return JsonResponse({"Error Occured": str(e)}, status=400)
    return JsonResponse({"error": "Malformed Request"}, status=400) 
@csrf_exempt
def get_pattern_media(request):
    if request.method == "POST" and request.content_type == "application/json":
        import json
        try:
            body = json.loads(request.body)
            data = body.get("data")
            name = body.get("name")
            return JsonResponse(pattern_to_video(name,data))
        except Exception as e:
            return JsonResponse({"Error Occured": str(e)}, status=400)
    return JsonResponse({"error": "Malformed Request"}, status=400) 