from django.http import JsonResponse

def home(request):
    data = {
        "response":"Hello World"
    }
    return JsonResponse(data)