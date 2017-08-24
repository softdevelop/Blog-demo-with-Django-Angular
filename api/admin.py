from django.contrib import admin

# Register your models here.
from .models import  Blog, Comment, Notification, NotificationCount, BlogLike, Token, Profile, Contact

class CommentAdmin(admin.ModelAdmin):
	model = Comment
	list_display = ['user', 'blog', 'created']

class BlogAdmin(admin.ModelAdmin):
	model = Blog
	list_display = ['title', 'author']	

class NotificationAdmin(admin.ModelAdmin):
	model = Notification
	list_display = ['user', 'blog', 'comment']

class NotificationCountAdmin(admin.ModelAdmin):
	model = NotificationCount
	list_display = ['user', 'count']	

admin.site.register(Blog, BlogAdmin)
admin.site.register(Comment, CommentAdmin)
admin.site.register(Notification, NotificationAdmin)
admin.site.register(NotificationCount, NotificationCountAdmin)
admin.site.register(BlogLike)
admin.site.register(Token)
admin.site.register(Profile)
admin.site.register(Contact)