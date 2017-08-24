from __future__ import unicode_literals
from ckeditor.fields import RichTextField
from ckeditor_uploader.fields import RichTextUploadingField
from django.db import models
from django.contrib.auth.models import User, Permission, Group
import os
import time
from django.utils.dateformat import format
from django.utils import timezone


class Token(models.Model):
    def __str__(self):        
        return u'%s'%self.user

    user = models.OneToOneField(User, null=True)
    token = models.CharField(max_length = 200, null = True)
    block_account = models.BooleanField(default=False)


def content_file_name_blog(instance, filename):

    time = str(format(timezone.now(), 'U'))
    folder_name = str(instance.author.id)
    ext = filename.split('.')[-1]
    title = (instance.title).replace(" ", "_")
    filename = "%s_%s.%s" % (time, instance.title, ext)
    fullname = os.path.join('static/upload/blog/' + folder_name + '/', filename)
    return fullname


class Blog(models.Model):
    def __str__(self):
        return u'%s'%self.title
    title = models.CharField(max_length=100)
    content_short = models.CharField(max_length=300)
    content_full= RichTextUploadingField() 
    created = models.DateTimeField(auto_now_add = True, auto_now = False)
    updated = models.DateTimeField(auto_now_add = True, auto_now = False)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    like = models.IntegerField(default=0)
    image_name = models.CharField(max_length = 255, null=True)
    image = models.ImageField(upload_to=content_file_name_blog, null=True)



class Comment(models.Model):
    def __str__(self):
        return u'%s'%self.comments
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comments_reply = models.ForeignKey("self", null=True)
    comments = RichTextUploadingField()
    created = models.DateTimeField(auto_now_add = True, auto_now = False)
    status = models.IntegerField(default=0)

class Notification(models.Model):
    def __str__(self):
        return u'%s'%self.user
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE)
    status = models.IntegerField(default=1)
    created = models.DateTimeField(auto_now_add = True, auto_now = False, null=True)

class NotificationCount(models.Model):
    def __str__(self):
        return u'%s'%self.user
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    count = models.IntegerField(default=0)

class BlogLike(models.Model):
    def __str__(self):
        return u'%s'%self.blog
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    like = models.IntegerField(default=1)

def content_file_name(instance, filename):
    ext = filename.split('.')[-1]
    filename = "%s_%s.%s" % (instance.user.id, instance.user.username, ext)
    fullname = os.path.join('static/upload/profile', filename)
    if os.path.exists(fullname):
        os.remove(fullname)
    return fullname

class Profile(models.Model):
    def __str__(self):        
        return u'%s'%self.user

    user = models.OneToOneField(User, null=True)
    created = models.DateTimeField(auto_now_add = True, auto_now = False, null=True)
    info = RichTextUploadingField()
    image = models.ImageField(upload_to=content_file_name, null=True)
    image_name = models.CharField(max_length = 255, null=True)

class Contact(models.Model):
    def __str__(self):
        return u'%s'%self.title
    title = models.CharField(max_length=100)
    content = RichTextUploadingField() 
    email = models.CharField(max_length=100, null=True)
    created = models.DateTimeField(auto_now_add = True, auto_now = False)
    updated = models.DateTimeField(auto_now_add = True, auto_now = False)