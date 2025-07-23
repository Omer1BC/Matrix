from django.urls import path
from .views import *
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('run', run_python, name='run_python'),
    path('problem_details', problem_details, name='problem_details'),
    path('hints', ai_hints, name='hints'),
    path('tool_hints', ai_tool_hints, name='tool_hints'),
    path('tests',get_tests),
    path('get_animation',get_animation),
    path("get_pattern_media",get_pattern_media)

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
