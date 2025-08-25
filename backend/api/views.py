from django.shortcuts import render, get_object_or_404
# Create your views here.
from django.http import JsonResponse

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import io
import sys
from django.conf import settings
from .models import ProblemCategory, Problem, ProblemCompletion, User, UserProgress

import traceback

import os
from utils.utils import *
from utils.agents import *
from utils.problem_info import *

# backend functions whose urls are mapped in /api/urls.py
@csrf_exempt
def get_completion(request):
    if request.method == "GET":
        user = request.user
        print(user)
        print(user.completion_percentage)
        return JsonResponse({"percentage": user.completion_percentage}, status=400)
    
@csrf_exempt
def run_python(request):
    media_path = settings.MEDIA_ROOT  # Absolute path to media folder
    if request.method == "POST":
        # More flexible content type checking
        content_type = request.content_type or ''
        
        if 'application/json' in content_type:
            import json
            try:
                body = json.loads(request.body)
                
                code = body.get("code", "")
                problem_id = body.get("problem_id", "1_2sum")
                
                
                # Map problem IDs to their respective files
                problem_files = {
                    "1_2sum": "1_2sum.py",
                    "intro-1": "intro-1_graph_sum.py",
                    # Add more problems as needed
                }
                
                file_name = problem_files.get(problem_id, "1_2sum.py")
                file_path = os.path.join(media_path, file_name)
                
                if not os.path.exists(file_path):
                    error_msg = f"Problem file {file_name} not found at {file_path}"
                    print(f"ERROR: {error_msg}")
                    return JsonResponse({"error": error_msg}, status=404)
                
                res = insert_user_code(
                    file_path,
                    code,
                    sample=f"demo_{problem_id}.py",
                )
                
                old_stdout = sys.stdout
                sys.stdout = mystdout = io.StringIO()
                try:
                    exec(res, {})
                    output = mystdout.getvalue()
                except Exception as e:
                    output = str(e)
                    import traceback
                    traceback.print_exc()
                finally:
                    sys.stdout = old_stdout
                
                return JsonResponse({"output": output}, safe=False)
                
            except json.JSONDecodeError as e:
                error_msg = f"JSON decode error: {str(e)}"
                return JsonResponse({"error": error_msg}, status=400)
            except Exception as e:
                error_msg = f"General error: {str(e)}"
                import traceback
                traceback.print_exc()
                return JsonResponse({"error": error_msg}, status=400)
        else:
            error_msg = f"Expected application/json content type, got: '{request.content_type}'"
            return JsonResponse({"error": error_msg}, status=400)
    else:
        error_msg = f"Expected POST method, got: {request.method}"
        return JsonResponse({"error": error_msg}, status=405)


@csrf_exempt
def run_learn_tests(request):
    media_path = settings.MEDIA_ROOT

    if request.method == "POST":
        content_type = request.content_type or ''

        if 'application/json' in content_type:
            try:
                body = json.loads(request.body)
                code = body.get("code", "")
                problem_id = body.get("problem_id", "1_2sum")

                # Make sure the user is logged in
                if not request.user.is_authenticated:
                    return JsonResponse({"error": "Authentication required"}, status=403)

                user = request.user

                # Find the problem
                try:
                    problem = Problem.objects.get(problem_id=problem_id)
                except Problem.DoesNotExist:
                    return JsonResponse({"error": f"Problem {problem_id} not found"}, status=404)

                # Insert user code into test file (your existing logic)
                file_name = f"{problem_id}.py"
                file_path = os.path.join(media_path, file_name)

                if not os.path.exists(file_path):
                    return JsonResponse({"error": f"Problem file {file_name} not found"}, status=404)

                res = insert_user_code(file_path, code)

                # Capture stdout
                old_stdout = sys.stdout
                sys.stdout = mystdout = io.StringIO()
                namespace = {}

                try:
                    exec(res, namespace)
                    test_results = namespace.get("results", {})
                    formatted_results = []
                    for test_name, result in test_results.items():
                        formatted_results.append({
                            "test_name": test_name,
                            "passed": result.get("passed", False),
                            "expected": result.get("expected"),
                            "actual": result.get("actual"),
                            "error": result.get("error", ""),
                            "input": result.get("graph") or result.get("nums") or result.get("input", ""),
                            "description": f"Test case {test_name.split('_')[-1]}" if "_" in test_name else test_name
                        })

                    passed_tests = sum(1 for r in formatted_results if r["passed"])
                    total_tests = len(formatted_results)
                    if total_tests > 0 and passed_tests == total_tests:
                        completion, created = ProblemCompletion.objects.get_or_create(
                            user=user,
                            problem=problem
                        )
                        completion.mark_as_completed(user_solution=code)

                        # Update user progress
                        
                        if not hasattr(user, 'progress'):
                            UserProgress.objects.create(user=user)
                        user.progress.update_progress()

                        return JsonResponse({
                            "success": True,
                            "message": "All tests passed! Problem marked as completed.",
                            "test_results": formatted_results,
                            "total_tests": total_tests,
                            "passed_tests": passed_tests,
                            "next_problem": user.progress.current_problem.problem_id if user.progress.current_problem else None
                        })

                    # If some tests failed → just return results
                    return JsonResponse({
                        "success": True,
                        "test_results": formatted_results,
                        "total_tests": total_tests,
                        "passed_tests": passed_tests
                    })

                except Exception as e:
                    error_msg = str(e)
                    traceback.print_exc()
                    return JsonResponse({
                        "success": False,
                        "error": error_msg,
                        "test_results": []
                    })
                finally:
                    sys.stdout = old_stdout

            except json.JSONDecodeError as e:
                return JsonResponse({"error": f"JSON decode error: {str(e)}"}, status=400)
            except Exception as e:
                traceback.print_exc()
                return JsonResponse({"error": str(e)}, status=400)
        else:
            return JsonResponse({"error": f"Expected application/json, got: '{request.content_type}'"}, status=400)
    else:
        return JsonResponse({"error": f"Expected POST method, got: {request.method}"}, status=405)

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
                "method_stub" : "def countComponents(n: int, edges: List[List[int]]):\n        return 0",
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
                                    "args": {"numbers": {"type":"List[int]","default_value":"[1,2,3,1,4,2,5]"}
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
@csrf_exempt
def annotate(request):
    if request.method == "POST" and request.content_type == "application/json":
        print("inside posts")
        import json
        try:
            body = json.loads(request.body)
            code = body.get("code", "")
            tests = body.get("tests", "")
            resp = get_annotated_ai_hints(code,tests) 
            return JsonResponse(resp)
        except Exception as e:
            return JsonResponse({"Error Occured": str(e)}, status=400)
    print('malformed request')
    return JsonResponse({"error": "Malformed Request"}, status=400)
@csrf_exempt
def ask(request):
    if request.method == "POST" and request.content_type == "application/json":
        import json
        try:
            body = json.loads(request.body)
            text = body.get("text", "")
            question = body.get("question", "")
            print(question,text)
            resp = ask_ai(question,text) 
            print("response is resp",resp)
            return JsonResponse(resp)
        except Exception as e:
            return JsonResponse({"Error Occured": str(e)}, status=400)
    return JsonResponse({"error": "Malformed Request"}, status=400)
@csrf_exempt
def next_thread(request):
    if request.method == "POST" and request.content_type == "application/json":
        import json
        try:
            body = json.loads(request.body)
            ask = body.get("ask", "")
            question = body.get("question", "")
            code = body.get("code", "")
            resp = get_next_conversation(ask,code,question) 
            return JsonResponse(resp)
        except Exception as e:
            return JsonResponse({"Error Occured": str(e)}, status=400)
    return JsonResponse({"error": "Malformed Request"}, status=400)
@csrf_exempt
def annotate_errors(request):
    if request.method == "POST" and request.content_type == "application/json":
        import json
        try:
            body = json.loads(request.body)
            code = body.get("code", "")
            error = body.get("error", "")
            id = body.get("id", "")
            resp = get_error_details(id,error,code) 
            return JsonResponse(resp,safe=False)
        except Exception as e:
            return JsonResponse({"Error Occured": str(e)}, status=400)
    return JsonResponse({"error": "Malformed Request"}, status=400)
# Replace your existing get_all_categories function with this:
@csrf_exempt
def get_all_categories(request):
    """get all categories and their problems"""
    if request.method == "GET":
        categories = ProblemCategory.objects.prefetch_related('problems').all()
        result = {}
        user = request.user
        print(request.user)
        for category in categories:
            result[category.key] = {
                "title": category.title,
                "icon": category.icon,
                "items": [
                    {
                        "id": problem.problem_id,
                        "title": problem.title,
                        "description": problem.description,
                        "difficulty": problem.difficulty,
                        "unlocked":not (problem.is_locked_by_default) or problem.is_unlocked_for_user(user)
                    }
                    for problem in category.problems.order_by('order') #ignore # Removed is_active filter since your model might not have it
                ]
            }
        
        return JsonResponse(result)
    return JsonResponse({"error": "Method not allowed"}, status=405)

# Replace your existing problem_details function with this enhanced version:
@csrf_exempt
def problem_details(request):
    print(request.method, request.content_type)
    if request.method == "POST" and request.content_type == "application/json":
        import json
        try:
            body = json.loads(request.body)
            problem_id = body.get("problem_id", "")
            
            try:
                # Try to get problem from database first
                problem = Problem.objects.get(problem_id=problem_id)
                
                res = {
                    "title": problem.title,
                    "difficulty": problem.difficulty,
                    "description": problem.description,
                    "method_stub": problem.method_stub,
                    "solution": problem.solution,
                    "test_cases": problem.get_test_cases(),  # This uses the model method to parse JSON
                    "category": problem.category.title,
                    "input_args": problem.input_args,
                    "tools": problem.tools
                }
                
                # Try to run existing tests if available
                try:
                    result, error = run(problem_id, res['method_stub']) 
                    res['tests'] = result if not error else {}
                except:
                    res['tests'] = {}
                
                return JsonResponse(res)
                
            except Problem.DoesNotExist:
                # Fallback to your existing hardcoded response
                res = {
                    "title": "Number of Connected Components in an Undirected Graph",
                    "difficulty": "Medium",
                    "description": '''There is an undirected graph with n nodes. There is also an edges array, where edges[i] = [a, b] means that there is an edge between node a and node b in the graph.

The nodes are numbered from 0 to n - 1.

Return the total number of connected components in that graph.''',
                    "method_stub": "def twoSum(self, nums: List[int], target: int) -> List[int]:\n        return []",
                    "input_args": ["nums", "target", "output", "expected"],
                    "tools": {
                        "DFS": {
                            "description": "Algorithm for traversing a graph",
                            "args": {
                                "edges": {"type": "List[List[int]]", "default_value": "[[1,2]]"}
                            },
                            "code": '''#DFS
visit = set()
def dfs(u):
    visit.add(u)
    for nbr in nbrs(u):
        if nbr not in visit:
            dfs(nbr)'''
                        },
                        "Set": {
                            "description": "Unordered data structure with O(1) insertion, removal, and find",
                            "args": {"nums": {"type": "List[int]", "default_value": "[1,2,3,2,5]"}},
                            "code": '''#Set
elements = set()
elements.add(2) # O(1)
if 2 in elements: # O(1)
elements.remove(2) # O(1)'''
                        }
                    },
                    "test_cases": []  # Add empty test cases for compatibility
                }
                result, error = run(problem_id, res['method_stub']) 
                res['tests'] = result if not error else {}
                return JsonResponse(res)
                
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Malformed Request"}, status=400)

# Add this new function for running individual test cases:
@csrf_exempt
def run_test_case(request):
    """Run a specific test case against user code"""
    if request.method == "POST" and request.content_type == "application/json":
        import json
        try:
            body = json.loads(request.body)
            code = body.get('code', '')
            test_case = body.get('test_case', {})
            problem_id = body.get('problem_id', '')
            
            if not code.strip():
                return JsonResponse({'error': 'No code provided'}, status=400)
            
            if not test_case:
                return JsonResponse({'error': 'No test case provided'}, status=400)
            
            # Extract test case data
            test_input = test_case.get('input', '')
            expected_output = test_case.get('expected_output', '')
            
            # Capture stdout and stderr
            old_stdout = sys.stdout
            stdout_capture = io.StringIO()
            
            try:
                # Redirect stdout
                sys.stdout = stdout_capture
                
                # Execute the user's code
                exec_globals = {}
                exec(code, exec_globals)
                
                # If there's test input, execute it
                if test_input:
                    exec(test_input, exec_globals)
                
                # Get the actual output
                actual_output = stdout_capture.getvalue().strip()
                
                # Compare outputs (normalize whitespace)
                expected_normalized = expected_output.strip()
                actual_normalized = actual_output.strip()
                
                passed = expected_normalized == actual_normalized
                
                return JsonResponse({
                    'passed': passed,
                    'actual_output': actual_output,
                    'expected_output': expected_output,
                    'error': None
                })
                
            except Exception as e:
                return JsonResponse({
                    'passed': False,
                    'actual_output': stdout_capture.getvalue(),
                    'error': str(e)
                })
            finally:
                # Restore stdout
                sys.stdout = old_stdout
                
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt  # for testing — better to configure CSRF properly
def login_view(request):
    if request.method == "POST":
        data = json.loads(request.body.decode("utf-8"))
        username = data.get("username")
        password = data.get("password")

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({"success": True, "message": "Logged in"})
        else:
            return JsonResponse({"success": False, "message": "Invalid credentials"}, status=400)
    return JsonResponse({"success": False, "message": "Only POST allowed"}, status=405)

@csrf_exempt
def logout_view(request):
    logout(request)
    return JsonResponse({"success": True, "message": "Logged out"})
