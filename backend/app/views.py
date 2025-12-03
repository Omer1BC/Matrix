from django.shortcuts import render


def home_view(request):
    return render(request, "home.html")


def api_view(request):
    return render(request, "api.html")
