from django.urls import path
from .views import *

urlpatterns = [
    path('run', run_python, name='run_python'),
    path('problem_details', problem_details, name='problem_details'),
    path('hints', ai_hints, name='hints'),
    path('tool_hints', ai_tool_hints, name='tool_hints'),
    path('tests',get_tests)

]