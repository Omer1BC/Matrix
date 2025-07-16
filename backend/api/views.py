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
            code,
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
            problem_id = body.get("problem_id", "")
            problem_details = get_problem_details(problem_id) 
            return JsonResponse(problem_details)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
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