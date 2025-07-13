from django.urls import path
from .views import *

urlpatterns = [
    path('run', run_python, name='run_python'),
]