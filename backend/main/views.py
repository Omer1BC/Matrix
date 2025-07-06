from django.shortcuts import render
# Create your views here.

from django.http import JsonResponse

def index(request):
    data = {
        "response":"Hello World!"
        
    }
    return JsonResponse(data)