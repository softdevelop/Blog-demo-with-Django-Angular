from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.template import loader
from django.conf import settings

# from django.core.mail import send_mail

 
def index(request):
    template = loader.get_template('index.html')
    context = {'tpl':'base.html'}
    return HttpResponse(template.render(context, request))

