from django.http import FileResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from functools import wraps
import os
import io
import sys
import json
import traceback
import logging
from django.conf import settings
from .models import ProblemCategory, Problem, ProblemCompletion, UserProgress
from langchain_core.messages import HumanMessage, AIMessage
from utils.utils import *
from utils.security import SafeExecutor
from utils.problem_info import *
from utils.agent.schema import AgentRequest, AgentResponse
from utils.agent.router import route
from utils.agent.graph import build_graph
from utils.agent.tools import (
    annotate_errors_tool,
    annotated_hints_tool,
    grade_via_tests_tool,
    hints_tool,
    run_tests_tool,
    tool_hints_tool,
    snippet_tool,
)
from utils.agent.utils import (
    append_time_stamp,
    generate_animation,
    get_solution_grade,
)
from utils.agent.rag import reindex_notes
from utils.supabase.client import supabase
from utils.llm_health import check_llm_health, get_health_status
from openai import AuthenticationError, RateLimitError, OpenAIError

logger = logging.getLogger(__name__)
GRAPH = build_graph()


@csrf_exempt
def generate_animation_view(request):
    if request.method != "POST" or "application/json" not in (
        request.content_type or ""
    ):
        return JsonResponse({"error": "Malformed Request"}, status=400)

    try:
        payload = json.loads(request.body)
    except Exception:
        return JsonResponse({"error": "Invalid JSON"}, status=500)

    data_structure = payload.get("data_structure")
    initial_state = payload.get("initial_state", [])
    operations = payload.get("operations", [])

    if (
        not data_structure
        or not isinstance(initial_state, list)
        or not isinstance(operations, list)
    ):
        return JsonResponse(
            {"error": "Required: data_structure, initial_state[], operations[]"},
            status=500,
        )
    res = generate_animation(
        data_structure=data_structure,
        initial_state=initial_state,
        operations=operations,
    )

    if not res.get("ok") or not res.get("video_path"):
        return JsonResponse(
            {
                "ok": False,
                "stderr": res.get("stderr", ""),
                "stdout": res.get("stdout", ""),
                "cmd": res.get("cmd", ""),
            },
            status=400,
        )

    f = open(res["video_path"], "rb")
    resp = FileResponse(f, content_type="video/mp4")
    resp["Content-Disposition"] = (
        'inline; filename="%s.mp4"'
        % os.path.splitext(os.path.basename(res["video_path"]))[0]
    )
    resp["X-Scene-Name"] = res.get("scene_name", "")
    resp["X-Gen-Cmd"] = res.get("cmd", "")
    return resp


@csrf_exempt
def neo_health(request):
    """
    Check the health status of the Neo LLM service.

    Returns:
        JSON with service health information including:
        - is_healthy: boolean indicating if service is operational
        - error_type: type of error if service is down
        - error_message: human-readable error message
        - last_check: timestamp of last health check
    """
    if request.method == "GET":
        # Return cached status without making a new API call
        status = get_health_status()
        return JsonResponse(status.to_dict(), status=200)

    elif request.method == "POST":
        # Perform a new health check (this makes an API call)
        status = check_llm_health()
        return JsonResponse(status, status=200)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def get_completion(request):
    if request.method == "GET":
        user = request.user
        print(user)
        print(user.completion_percentage)
        return JsonResponse({"percentage": user.completion_percentage}, status=200)


@csrf_exempt
def save_notes(request):
    if request.method != "POST" or "application/json" not in (
        request.content_type or ""
    ):
        return JsonResponse({"error": "Malformed Request"}, status=400)
    try:
        body = json.loads(request.body)
        user = (
            request.user if getattr(request.user, "is_authenticated", False) else None
        )
        user_id = str(getattr(user, "id", body.get("user_id", "")))
        problem_id = str(body.get("problem_id", ""))
        notes = body.get("notes", "") or ""
        pc = (
            supabase.table("problem_completions")
            .select("id,title")
            .eq("user_id", user_id)
            .eq("problem_id", problem_id)
            .maybe_single()
            .execute()
            .data
        )
        if not pc:
            return JsonResponse({"error": "not_found"}, status=404)

        # Try to generate embeddings first
        try:
            stats = reindex_notes(
                pc_id=pc["id"],
                user_id=user_id,
                problem_id=problem_id,
                title=pc.get("title"),
                notes=notes,
            )
        except AuthenticationError as e:
            # API key is invalid or revoked
            logger.error(f"Authentication error generating embeddings for notes (pc_id={pc['id']}): {type(e).__name__}")
            return JsonResponse({
                "error": "Note-taking is temporarily unavailable due to a service authentication issue. Please try again later.",
                "ok": False
            }, status=503)
        except OpenAIError as e:
            # Other OpenAI API errors (rate limits, etc.)
            logger.error(f"OpenAI error generating embeddings for notes (pc_id={pc['id']}): {type(e).__name__}")
            return JsonResponse({
                "error": "Note-taking is temporarily unavailable. Please try again later.",
                "ok": False
            }, status=503)
        except ValueError as e:
            # API key not configured
            logger.error(f"Configuration error for embeddings (pc_id={pc['id']}): API key not configured")
            return JsonResponse({
                "error": "Note-taking is temporarily unavailable due to a configuration issue. Please try again later.",
                "ok": False
            }, status=503)
        except Exception as embedding_error:
            # Other unexpected errors
            logger.error(f"Unexpected error generating embeddings for notes (pc_id={pc['id']}): {type(embedding_error).__name__}")
            return JsonResponse({
                "error": "Failed to save notes. Please try again.",
                "ok": False
            }, status=500)

        # Only save notes to Supabase if embeddings were successful
        supabase.table("problem_completions").update({"notes": notes}).eq(
            "id", pc["id"]
        ).execute()

        return JsonResponse({"ok": True, **stats})
    except Exception as e:
        traceback.print_exc()
        logger.error(f"Error saving notes: {str(e)}")
        return JsonResponse({"error": "Failed to save notes. Please try again."}, status=500)


@csrf_exempt
def agent(request):
    if request.method != "POST" or "application/json" not in (
        request.content_type or ""
    ):
        return JsonResponse({"error": "Malformed Request"}, status=400)
    try:
        body = json.loads(request.body)
        user = (
            request.user if getattr(request.user, "is_authenticated", False) else None
        )
        user_id = str(getattr(user, "id", body.get("user_id", "anon")))
        problem_id = str(body.get("problem_id", "global"))
        req = AgentRequest(
            **{
                "user_id": user_id,
                "problem_id": problem_id,
                "message": body.get("message", body.get("input", "")) or "",
                "code": body.get("code", "") or "",
                "question": body.get("question", "") or "",
                "intent": body.get("intent", None),
                "preferences": body.get("preferences", None),
                "extras": body.get("extras", {}),
            }
        )
        task, params = route(req)
        thread_id = f"{req.user_id}:{req.problem_id}"
        if task == "tests":
            res = run_tests_tool.invoke(
                {"problem_id": req.problem_id, "code": req.code}
            )
            return JsonResponse(AgentResponse(kind="tests", data=res).model_dump())
        if task == "grade":
            res = grade_via_tests_tool.invoke(
                {"problem_id": req.problem_id, "code": req.code}
            )
            return JsonResponse(AgentResponse(kind="grade", data=res).model_dump())
        if task == "tool_hints":
            pat = params.get("pattern", req.extras.get("pattern", ""))
            if not pat:
                return JsonResponse(
                    AgentResponse(
                        kind="tool_hints", data={"error": "pattern required"}
                    ).model_dump()
                )
            res = tool_hints_tool.invoke(
                {"code": req.code, "pattern": pat, "preferences": req.preferences or ""}
            )
            return JsonResponse(AgentResponse(kind="tool_hints", data=res).model_dump())
        if task == "annotate_errors":
            err = params.get("error", req.extras.get("error", req.message))
            res = annotate_errors_tool.invoke(
                {
                    "problem_id": req.problem_id,
                    "error": err,
                    "code": req.code,
                    "preferences": req.preferences or "",
                }
            )
            return JsonResponse(
                AgentResponse(kind="annotate_errors", data=res).model_dump()
            )
        if task == "hints":
            res = hints_tool.invoke(
                {
                    "problem_id": req.problem_id,
                    "code": req.code,
                    "preferences": req.preferences or "",
                }
            )
            return JsonResponse(AgentResponse(kind="hints", data=res).model_dump())
        if task == "annotated_hints":
            res = annotated_hints_tool.invoke(
                {
                    "problem_id": req.problem_id,
                    "code": req.code,
                    "preferences": req.preferences or "",
                }
            )
            return JsonResponse(
                AgentResponse(kind="annotated_hints", data=res).model_dump()
            )
        if task == "explain":
            res = snippet_tool.invoke(
                {
                    "question": req.question,
                    "text": req.message,
                    "preferences": req.preferences or "",
                }
            )
            return JsonResponse(
                AgentResponse(kind="explain", data=res).model_dump(), safe=False
            )
        if task == "generate_animation":
            prompt = (
                params.get("request", "")
                or req.extras.get("request", "")
                or req.message
            )
            animation_speed = float(req.extras.get("animation_speed", 1.0))
            if not prompt:
                payload = {"ok": False, "error": "prompt required"}
                return JsonResponse(
                    AgentResponse(kind="generate_animation", data=payload).model_dump(),
                    status=400,
                )
            # Call generate_animation_from_prompt directly with user_id
            from utils.agent.utils import generate_animation_from_prompt

            result = generate_animation_from_prompt(
                prompt, animation_speed=animation_speed, user_id=user_id
            )

            error_msg = None
            if not result.get("ok"):
                error_msg = result.get("error") or result.get("stderr", "Unknown error")
                if len(error_msg) > 200:
                    error_msg = error_msg[-200:]

            res = {
                "ok": bool(result.get("ok")),
                "error": error_msg,
                "plan": result.get("plan", {}),
                "video_rel": result.get("video_rel", ""),
                "video_path": result.get("video_path", ""),
                "stdout": result.get("stdout", ""),
                "stderr": result.get("stderr", ""),
                "cmd": result.get("cmd", ""),
            }
            return JsonResponse(
                AgentResponse(kind="generate_animation", data=res).model_dump(),
                status=200 if res.get("ok") else 400,
            )
        result = GRAPH.invoke(
            {
                "messages": [HumanMessage(content=req.message)],
                "question": req.question,
                "code": req.code,
                "preferences": req.preferences,
                "task": task,
                "params": params,
                "user_id": user_id,
                "problem_id": problem_id,
            },
            config={"configurable": {"thread_id": thread_id}},
        )
        msgs = result["messages"]
        last_msg = msgs[-1]
        total_tokens = (
            getattr(last_msg, "usage_metadata", {}).get("total_tokens", 0)
            if hasattr(last_msg, "usage_metadata")
            else 0
        )
        content = next(
            (m.content for m in reversed(msgs) if isinstance(m, AIMessage)), ""
        )
        return JsonResponse(
            AgentResponse(
                kind="chat", data={"text": content}, meta={"total_tokens": total_tokens}
            ).model_dump()
        )
    except AuthenticationError as e:
        # OpenAI API key is invalid or revoked
        health_status = get_health_status()
        health_status.mark_unhealthy("authentication_error", "OpenAI API key is invalid or has been revoked")

        if health_status.should_send_notification():
            from utils.llm_health import send_admin_notification
            send_admin_notification(
                subject="URGENT: Neo LLM Service Down - Authentication Failed",
                error_type="authentication_error",
                error_details=str(e)
            )
            health_status.notification_sent()

        traceback.print_exc()
        return JsonResponse({
            "error": "Neo is currently unavailable due to a service authentication issue. A system administrator has been notified.",
            "error_type": "authentication_error"
        }, status=503)

    except RateLimitError as e:
        # Rate limit exceeded
        health_status = get_health_status()
        health_status.mark_unhealthy("rate_limit_error", "OpenAI API rate limit exceeded")

        if health_status.should_send_notification():
            from utils.llm_health import send_admin_notification
            send_admin_notification(
                subject="WARNING: Neo LLM Service - Rate Limit Exceeded",
                error_type="rate_limit_error",
                error_details=str(e)
            )
            health_status.notification_sent()

        traceback.print_exc()
        return JsonResponse({
            "error": "Neo is temporarily unavailable due to high demand. Please try again in a few minutes.",
            "error_type": "rate_limit_error"
        }, status=429)

    except OpenAIError as e:
        # Other OpenAI-specific errors
        health_status = get_health_status()
        health_status.mark_unhealthy("openai_error", str(e))

        if health_status.should_send_notification():
            from utils.llm_health import send_admin_notification
            send_admin_notification(
                subject="ERROR: Neo LLM Service Issue Detected",
                error_type="openai_error",
                error_details=str(e)
            )
            health_status.notification_sent()

        traceback.print_exc()
        return JsonResponse({
            "error": "Neo is currently experiencing issues. Please try again later or contact support.",
            "error_type": "openai_error"
        }, status=503)

    except ValueError as e:
        # API key not configured or validation errors
        if "API key" in str(e) or "OPENAI_API_KEY" in str(e):
            health_status = get_health_status()
            health_status.mark_unhealthy("configuration_error", "OpenAI API key is not configured")

            if health_status.should_send_notification():
                from utils.llm_health import send_admin_notification
                send_admin_notification(
                    subject="URGENT: Neo LLM Service - API Key Not Configured",
                    error_type="configuration_error",
                    error_details=str(e)
                )
                health_status.notification_sent()

            traceback.print_exc()
            return JsonResponse({
                "error": "Neo is currently unavailable due to a configuration issue. A system administrator has been notified.",
                "error_type": "configuration_error"
            }, status=503)
        else:
            # Other ValueError - re-raise to be caught by generic handler
            raise

    except Exception as e:
        traceback.print_exc()
        logger.error(f"Unexpected error in agent endpoint: {str(e)}")
        return JsonResponse({"error": "An unexpected error occurred. Please try again."}, status=500)


@csrf_exempt
def run_python(request):
    media_path = settings.MEDIA_ROOT  # Absolute path to media folder
    if request.method == "POST":
        # More flexible content type checking
        content_type = request.content_type or ""

        if "application/json" in content_type:
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

                full_code = insert_user_code(
                    file_path,
                    code,
                    sample=f"demo_{problem_id}.py",
                )

                # Execute with template-aware security
                executor = SafeExecutor(enable_timeout=True)
                result = executor.execute_with_template(
                    full_code=full_code,
                    user_code=code,
                    timeout=10
                )

                if not result['success']:
                    # Check if it's a security violation
                    if result.get('violations'):
                        error_msg = "🔒 Security violation detected:\n\n"
                        error_msg += "\n".join(result['violations'])
                        error_msg += "\n\nImport statements and file system access are not allowed for security reasons."
                        return JsonResponse({"output": error_msg}, safe=False)
                    # Other execution errors
                    return JsonResponse({"output": result['error']}, safe=False)

                return JsonResponse({"output": result['output']}, safe=False)

            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error in run_python: {str(e)}")
                return JsonResponse({"error": "Invalid request format."}, status=400)
            except Exception as e:
                import logging
                import traceback
                logger = logging.getLogger(__name__)
                logger.error(f"Error in run_python: {str(e)}")
                traceback.print_exc()
                return JsonResponse({"error": "An error occurred while executing code."}, status=400)
        else:
            error_msg = (
                f"Expected application/json content type, got: '{request.content_type}'"
            )
            return JsonResponse({"error": error_msg}, status=400)
    else:
        error_msg = f"Expected POST method, got: {request.method}"
        return JsonResponse({"error": error_msg}, status=405)


@csrf_exempt
def run_learn_tests(request):
    media_path = settings.MEDIA_ROOT

    if request.method != "POST":
        return JsonResponse(
            {"error": f"Expected POST, got {request.method}"}, status=405
        )

    if "application/json" not in (request.content_type or ""):
        return JsonResponse({"error": "Expected application/json"}, status=400)

    try:
        body = json.loads(request.body)
        code = body.get("code", "")
        problem_id = body.get("problem_id", "1_2sum")
        user_id = body.get("user_id")

        if not user_id:
            return JsonResponse({"error": "Could not find user"}, status=400)

        resp = (
            supabase.table("problem_completions")
            .select("*")
            .eq("problem_id", problem_id)
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )

        problem_row = resp.data

        if not problem_row:
            return JsonResponse(
                {"error": f"Problem {problem_id} not found in Supabase"}, status=404
            )

        file_name = f"{problem_id}.py"
        file_path = os.path.join(media_path, file_name)

        if not os.path.exists(file_path):
            return JsonResponse(
                {"error": f"Problem file {file_name} not found"}, status=404
            )

        full_code = insert_user_code(file_path, code, sample="demo.py")

        # Execute with template-aware security
        executor = SafeExecutor(enable_timeout=True)
        exec_result = executor.execute_with_template(
            full_code=full_code,
            user_code=code,
            timeout=10
        )

        if not exec_result['success']:
            # Check if it's a security violation
            if exec_result.get('violations'):
                return JsonResponse(
                    {
                        "success": False,
                        "error": "SecurityViolation",
                        "info": {
                            "type": "SecurityViolation",
                            "msg": "Code contains prohibited operations",
                            "violations": exec_result['violations']
                        },
                        "test_results": [],
                    },
                    status=400,
                )
            # Check if it's a syntax error
            if exec_result.get('syntax_error'):
                e = exec_result['syntax_error']
                return JsonResponse(
                    {
                        "success": False,
                        "error": "SyntaxError",
                        "info": e,
                        "test_results": [],
                    },
                    status=400,
                )
            # Other execution errors
            return JsonResponse(
                {"success": False, "error": exec_result['error'], "test_results": []},
                status=500,
            )

        try:
            namespace = exec_result.get('namespace', {})
            test_results = namespace.get("results", {})
            formatted_results = []

            for test_name, result in test_results.items():
                formatted_results.append(
                    {
                        "test_name": test_name,
                        "passed": result.get("passed", False),
                        "expected": result.get("expected"),
                        "actual": result.get("actual"),
                        "error": result.get("error", ""),
                        "input": result.get("graph")
                        or result.get("nums")
                        or result.get("input", ""),
                        "description": (
                            f"Test case {test_name.split('_')[-1]}"
                            if "_" in test_name
                            else test_name
                        ),
                    }
                )

            passed_tests = sum(1 for r in formatted_results if r["passed"])
            total_tests = len(formatted_results)

            if total_tests > 0 and passed_tests == total_tests:
                return JsonResponse(
                    {
                        "success": True,
                        "message": "All tests passed! Problem marked as completed.",
                        "test_results": formatted_results,
                        "total_tests": total_tests,
                        "passed_tests": passed_tests,
                    }
                )

            return JsonResponse(
                {
                    "success": True,
                    "test_results": formatted_results,
                    "total_tests": total_tests,
                    "passed_tests": passed_tests,
                }
            )

        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error running tests: {str(e)}")
            traceback.print_exc()
            return JsonResponse(
                {"success": False, "error": "Failed to run tests. Please try again.", "test_results": []}, status=500
            )

    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error in run_learn_tests: {str(e)}")
        return JsonResponse({"error": "Invalid request format."}, status=400)
    except Exception as e:
        logger.error(f"Error in run_learn_tests: {str(e)}")
        traceback.print_exc()
        return JsonResponse({"error": "An error occurred while running tests."}, status=400)


@csrf_exempt
def get_tests(request):
    if request.method == "POST" and request.content_type == "application/json":
        import json

        body = json.loads(request.body)
        problem_id = body.get("problem_id", "")
        code = body.get("code", "")
        result, error = run(problem_id, code)
        res = {"result": result, "error": int(error)}
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
            resp = get_ai_hints(code, tests)
            return JsonResponse(resp)
        except Exception as e:
            return JsonResponse({"Error Occured": str(e)}, status=400)
    print("malformed request")
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
            resp = get_tool_hints(code, pattern)
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
            return JsonResponse(pattern_to_video(name, data))
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
            resp = get_annotated_ai_hints(code, tests)
            return JsonResponse(resp)
        except Exception as e:
            return JsonResponse({"Error Occured": str(e)}, status=400)
    print("malformed request")
    return JsonResponse({"error": "Malformed Request"}, status=400)


@csrf_exempt
def ask(request):
    if request.method == "POST" and request.content_type == "application/json":
        import json

        try:
            body = json.loads(request.body)
            text = body.get("text", "")
            question = body.get("question", "")
            print(question, text)
            resp = ask_ai(question, text)
            print("response is resp", resp)
            return JsonResponse(resp)
        except Exception as e:
            return JsonResponse({"Error Occured": str(e)}, status=400)
    return JsonResponse({"error": "Malformed Request"}, status=400)


@csrf_exempt
def grade_solution(request):
    """
    POST JSON:
      { "problem_id": "some_id", "code": "<user code>" }

    Response:
      {
        "success": true,
        "verdict": true/false,  # based on tests
        "metrics": { "readability": 4.1, "efficiency": 3.8, "robustness": 4.5 },
        "explanations": { "readability": "...", "efficiency": "...", "robustness": "..." },
        "comment": "short overall comment",
        "test_summary": {
          "total": 3, "passed": 2, "failed": 1,
          "cases": { "0": {...}, "1": {...}, ... }  # parsed results dict from run()
        }
      }
    """

    if request.method != "POST":
        return JsonResponse({"error": "Malformed Request"}, status=400)

    content_type = (request.content_type or "").lower()

    if "application/json" not in content_type:
        pass

    try:
        body = json.loads(request.body)
        problem_id = body.get("problem_id", "")
        code = body.get("code", "")

        if not problem_id:
            return JsonResponse({"error": "Missing problem_id"}, status=400)
        if not code.strip():
            return JsonResponse({"error": "No code provided"}, status=400)

        results_str, had_error = run(problem_id, code)
        results_dict = parse_results_str(results_str) or {}

        total = 0
        passed = 0

        for _, case in results_dict.items():
            total += 1
            if case.get("actual") == case.get("expected"):
                passed += 1

        failed = max(0, total - passed)
        passes_all = total > 0 and failed == 0 and not had_error

        problem = None
        problem_title = "Unknown Problem"
        problem_description = ""
        difficulty = "Medium"
        reference_solution = ""

        try:
            problem = Problem.objects.get(problem_id=problem_id)
            problem_title = problem.title
            problem_description = problem.description
            difficulty = problem.difficulty or difficulty
            reference_solution = (problem.solution or "").strip()
        except Problem.DoesNotExist:
            pass

        fail_examples = []

        if failed:
            for _, case in list(results_dict.items()):
                if case.get("actual") != case.get("expected"):
                    example = {
                        "input": {
                            k: v
                            for k, v in case.items()
                            if k not in ("actual", "expected")
                        },
                        "expected": case.get("expected"),
                        "actual": case.get("actual"),
                    }
                    fail_examples.append(example)
                    if len(fail_examples) >= 3:
                        break

        llm_grade = get_solution_grade(
            code=code,
            problem_title=problem_title,
            problem_description=problem_description,
            reference_solution=reference_solution,
            difficulty=difficulty,
            test_passed=passed,
            test_total=total,
            fail_examples=fail_examples,
        )

        llm_grade["verdict"] = passes_all

        if passes_all and request.user.is_authenticated and problem:
            completion, _ = ProblemCompletion.objects.get_or_create(
                user=request.user, problem=problem
            )
            completion.mark_as_completed(user_solution=code)

            if not hasattr(request.user, "progress"):
                UserProgress.objects.create(user=request.user)
            request.user.progress.update_progress()

        return JsonResponse(
            {
                "success": True,
                "verdict": llm_grade.get("verdict", False),
                "metrics": llm_grade.get("metrics", {}),
                "explanations": llm_grade.get("explanations", {}),
                "comment": llm_grade.get("comment", ""),
                "test_summary": {
                    "total": total,
                    "passed": passed,
                    "failed": failed,
                    "cases": results_dict,
                },
            }
        )

    except Exception as e:
        traceback.print_exc()
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def annotate_errors(request):
    if request.method == "POST" and request.content_type == "application/json":
        import json

        try:
            body = json.loads(request.body)
            code = body.get("code", "")
            error = body.get("error", "")
            id = body.get("id", "")
            resp = get_error_details(id, error, code)
            return JsonResponse(resp, safe=False)
        except Exception as e:
            return JsonResponse({"Error Occured": str(e)}, status=400)
    return JsonResponse({"error": "Malformed Request"}, status=400)


# Replace your existing get_all_categories function with this:
@csrf_exempt
def get_all_categories(request):
    """get all categories and their problems"""
    if request.method == "GET":
        categories = ProblemCategory.objects.prefetch_related("problems").all()
        result = {}
        user = (
            request.user if getattr(request.user, "is_authenticated", False) else None
        )
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
                        "unlocked": (not problem.is_locked_by_default)
                        or problem.is_unlocked_for_user(user),
                    }
                    for problem in category.problems.order_by("order")
                ],
            }

        return JsonResponse(result)
    return JsonResponse({"error": "Method not allowed"}, status=405)


# Add this new function for running individual test cases:
@csrf_exempt
def run_test_case(request):
    """Run a specific test case against user code"""
    if request.method == "POST" and request.content_type == "application/json":
        import json

        try:
            body = json.loads(request.body)
            code = body.get("code", "")
            test_case = body.get("test_case", {})
            problem_id = body.get("problem_id", "")

            if not code.strip():
                return JsonResponse({"error": "No code provided"}, status=400)

            if not test_case:
                return JsonResponse({"error": "No test case provided"}, status=400)

            # Extract test case data
            test_input = test_case.get("input", "")
            expected_output = test_case.get("expected_output", "")

            # Execute safely with security restrictions
            executor = SafeExecutor(enable_timeout=True)
            exec_result = executor.execute(code, test_input, timeout=10, allow_imports=False)

            if not exec_result['success']:
                # Check if it's a security violation
                if exec_result.get('violations'):
                    error_msg = "Security violation: " + "; ".join(exec_result['violations'])
                    return JsonResponse(
                        {
                            "passed": False,
                            "actual_output": exec_result.get('output', ''),
                            "expected_output": expected_output,
                            "error": error_msg,
                        }
                    )
                # Other execution errors
                return JsonResponse(
                    {
                        "passed": False,
                        "actual_output": exec_result.get('output', ''),
                        "expected_output": expected_output,
                        "error": exec_result['error'],
                    }
                )

            # Get the actual output
            actual_output = exec_result['output'].strip()

            # Compare outputs (normalize whitespace)
            expected_normalized = expected_output.strip()
            actual_normalized = actual_output.strip()

            passed = expected_normalized == actual_normalized

            return JsonResponse(
                {
                    "passed": passed,
                    "actual_output": actual_output,
                    "expected_output": expected_output,
                    "error": None,
                }
            )

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Method not allowed"}, status=405)


# --------------#
@csrf_exempt
def log_editor_history(request):
    if request.method == "POST" and request.content_type == "application/json":

        try:
            body = json.loads(request.body)
            user_id = body.get("user_id", "")
            code = body.get("code", "")
            timestamp = body.get("timestamp", "")

            res = append_time_stamp(f"{user_id}_code_history.txt", timestamp, code)

            return JsonResponse({"success": res, "message": "Log saved successfully"})

        except Exception as e:
            return JsonResponse({"Error Occured": str(e)}, status=400)
    return JsonResponse({"error": "Malformed Request"}, status=400)


@csrf_exempt
def clear_log_history(request):
    if request.method == "POST" and request.content_type == "application/json":
        try:
            body = json.loads(request.body)
            user_id = body.get("user_id", "")

            path = f"{settings.USER_FILES}/{user_id}_code_history.txt"

            if os.path.isfile(path):
                os.remove(path)
            else:
                return JsonResponse(
                    {"Error Occured": "File does not exist"}, status=400
                )
            return JsonResponse({"Success": "Log file cleared"}, status=200)
        except Exception as e:
            return JsonResponse({"Error occurred": str(e)}, status=400)
    return JsonResponse({"error": "Malformed Request"}, status=400)
