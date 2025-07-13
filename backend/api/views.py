from django.shortcuts import render
# Create your views here.
from django.http import JsonResponse

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import io
import sys

@csrf_exempt
def run_python(request):
    if request.method == "POST" and request.content_type == "application/json":
        import json
        try:
            body = json.loads(request.body)
            code = body.get("code", "")
            # Redirect stdout to capture print output
            old_stdout = sys.stdout
            sys.stdout = mystdout = io.StringIO()
            try:
                exec(code, {})
                output = mystdout.getvalue()
            except Exception as e:
                output = str(e)
            finally:
                sys.stdout = old_stdout
            return JsonResponse({"output": output})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request"}, status=400)
