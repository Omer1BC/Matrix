from django.urls import path
from .views import *
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path("run", run_python, name="run_python"),
    path("problem_details", problem_details, name="problem_details"),
    path("hints", ai_hints, name="hints"),
    path("tool_hints", ai_tool_hints, name="tool_hints"),
    path("tests", get_tests),
    path("get_animation", get_animation),
    path("get_pattern_media", get_pattern_media),
    path("annotate", annotate),
    path("annotate_errors", annotate_errors),
    path("ask", ask),
    # path("next_thread", next_thread),
    path("grade_solution", grade_solution, name="grade_solution"),
    # llm agent
    path("agent", agent, name="agent"),
    # learn page urls
    path("categories", get_all_categories, name="get_all_categories"),
    path("problem-details", problem_details, name="problem_details"),
    path("run-test", run_test_case, name="run_test_case"),
    path("run-learn-tests", run_learn_tests, name="run_learn_tests"),
    path("completion", get_completion, name="completion"),


    path("login", login_view, name="login_view"),
    path("logout", logout_view, name="logout_view"),

    # autonmous hints
    path("log-editor-history",log_editor_history, name="log_editor_history"),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
