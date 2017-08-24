from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User, Group, Permission
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.forms import PasswordResetForm
from django.template.response import TemplateResponse
from django.core.mail import send_mail, EmailMessage
from api.models import Token, Blog, BlogLike, Comment,Notification, NotificationCount, Profile, Contact
from django.conf import settings
from django.contrib.admin.views.decorators import staff_member_required
import jwt, json
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login
from django.contrib.auth import login as auth_login
from django.contrib.auth import logout as auth_logout
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
import os
from django.core.mail import send_mail, EmailMultiAlternatives
import time
from django.utils import timezone
import datetime
from django.utils.dateformat import format
from django.db.models import F

from .tests import *



@csrf_exempt
def contact(request):
	email = request.POST.get('email')
	title = request.POST.get('title')
	content = request.POST.get('content')
	try:
		contact = Contact(email=email,title=title,content=content)
		contact.save()
		try:
			msg = EmailMultiAlternatives(title, content, settings.EMAIL_HOST_USER, [email])
			msg.attach_alternative(content, "text/html")
			msg.send()
			response = {
				'result': 1,
				'message' : 'ok'
			}
		except Exception as e:
			response = {
				'result': -1,
				'message' : 'Can not send mail'
			}
	except:
		response = {
			'result': 0,
			'message' : 'Error Token'
		}
	return JsonResponse(response)

def notification_count(request):
	token = request.GET.get('token')

	try:
		obj_token = Token.objects.get(token=token)
		try:
			notifi_count = NotificationCount.objects.get(user=obj_token.user)
			count = notifi_count.count
		except NotificationCount.DoesNotExist:
			count = 0
		response = {
			'result': 1,
			'data' : count
		}
	except Token.DoesNotExist:
		response = {
			'result': 0,
			'message' : 'Error Token'
		}
	return JsonResponse(response)

def notification_list_all(request):

	page = request.GET.get('page')
	itemsPerPage = request.GET.get('itemsPerPage')	or 5
	token = request.GET.get('token')

	try:
		obj_token = Token.objects.get(token=token)
		notifi_list = (
				Notification.objects.filter(blog__author__username=obj_token.user.username).order_by('-created')
				.annotate(
						user_id=F('user__id'),username=F('user__username'),firstName=F('user__first_name'),
						lastName=F('user__last_name'),blog_id=F('blog__id'),blog_title=F('blog__title'),comments_name=F('comment__comments'),
						comments_id=F('comment__id')
					)
				.values('id','user_id','username','firstName','lastName', 'blog_id','blog_title', 'comments_name', 'created', 'status', 'comments_id')
			)

		paginator = Paginator(notifi_list, itemsPerPage)
		try:
			notifi = paginator.page(page)
		except PageNotAnInteger:
			notifi = paginator.page(1)
		except EmptyPage:
			notifi = paginator.page(paginator.num_pages)

		for x in notifi.object_list:
			x['image'] = get_profile_image(x['username'])
			

		previous_page_number = ''
		if notifi.has_previous():
			previous_page_number = notifi.previous_page_number()

		next_page_number = ''
		if notifi.has_next():
			next_page_number = notifi.next_page_number()


		# get count notification

		obj_notification_count = Notification.objects.filter(blog__author__username=obj_token.user.username, status=1)
		notifi_count = obj_notification_count.count()
		


		obj_page = {
			'number' : notifi.number,
			'next_page_number' : next_page_number,
			'previous_page_number': previous_page_number,
			'start_index' : notifi.start_index(),
			'end_index' : notifi.end_index(),
		}
		response = {
			'result': 1,
			'data' : list(notifi.object_list),
			'total' : notifi_list.count(), 
			'info' : obj_page,
			'count': notifi_count
		}


	except Token.DoesNotExist:
		response = {
			'result': 0,
			'message' : 'Error Token'
		}

	return JsonResponse(response)

def notification_list(request):
	token = request.GET.get('token')
	try:
		obj_token = Token.objects.get(token=token)
		notifi = Notification.objects.filter(blog__author__username=obj_token.user.username).order_by('-created')[:10]

		# get notifitcation
		arr = []	
		count_notification = 0
		for x in notifi:
			if x.status == 1: 
				count_notification += 1
			arr.append({
				'id' : x.id,
				'user_id' : x.user.id,
				'username' : x.user.username,
				'firstName' : x.user.first_name,
				'lastName' : x.user.last_name,
				'image' : get_profile_image(x.user.username),
				'blog_id' : x.blog.id,
				'blog' : x.blog.title,
				'comments' : x.comment.comments,
				'created' : x.created,
				'status' : x.status,
				'comments_id' : x.comment.id
			})
			
		response = {
			'result': 1,
			'data' : arr,
			'count': count_notification
		}
	except Token.DoesNotExist:
		response = {
			'result': 0,
			'message' : 'Error Token'
		}
	return JsonResponse(response)

@csrf_exempt
def notification_mask_all_read(request):
	token = request.POST.get('token')
	ids = request.POST.get('ids')
	

	ids = json.loads(ids)

	try:
		obj_token = Token.objects.get(token=token)
		try:
			notifi_list = Notification.objects.filter(pk__in=ids)
			count = 0
			arr  = []
			if notifi_list.count() > 0:
				for x in notifi_list:
					if x.blog.author.username == obj_token.user.username:
						if x.status == 1:
							arr.append(x.id)
							count += 1
							x.status = 0
							x.save()
				try:
					count_notifi = NotificationCount.objects.get(user__username=obj_token.user.username)
					if count_notifi.count > 0:
						count_notifi.count -= count
					count_notifi.save()	
				except NotificationCount.DoesNotExist:
					count_notifi = None

			response = {
				'result': 1,
				'data' : arr,
				'message' : 'success'
			}
		except Notification.DoesNotExist:
			response = {
				'result': 0,
				'message' : 'Error Notification'
			}
	except Token.DoesNotExist:
		response = {
			'result': 0,
			'message' : 'Error Token'
		}
	return JsonResponse(response)

@csrf_exempt
def notification_mask_read(request):
	token = request.POST.get('token')
	notifi_id = request.POST.get('id')
	try:
		obj_token = Token.objects.get(token=token)
		try:
			notifi = Notification.objects.get(pk=notifi_id)
			if notifi.blog.author.username == obj_token.user.username:
				notifi.status = 0
				notifi.save()
				try:
					count_notifi = NotificationCount.objects.get(user__username=obj_token.user.username)
					if count_notifi.count > 0:
						count_notifi.count -= 1
					count_notifi.save()	
				except NotificationCount.DoesNotExist:
					count_notifi = None
				response = {
					'result': 1,
					'message' : 'Success'
				}
			else:
				response = {
					'result': 0,
					'message' : '403'
				}
		except Notification.DoesNotExist:
			response = {
				'result': 0,
				'message' : 'Error Notification'
			}
	except Token.DoesNotExist:
		response = {
			'result': 0,
			'message' : 'Error Token'
		}
	return JsonResponse(response)

def profile_get(request):
	token = request.GET.get('token')
	try:
		obj_token = Token.objects.get(token=token)
		try:
			user = User.objects.get(username=obj_token.user.username)
			group = user.groups.all()
			data = {
				'userName' : user.username,
				'token' : obj_token.token,
				'lastName' : user.last_name,
				'firstName' : user.first_name,
				'email' : user.email,
				'is_superuser' : user.is_superuser,
				'roles' : group[0].name if group.count() > 0 else '',
				'image' : get_profile_image(user.username)
			}
			try:
				profile = Profile.objects.get(user__username=user.username)
				data['info'] = profile.info
			except Profile.DoesNotExist:
				profile =  None
			response = {
				'result': 1,
				'data' : data
			}
		except User.DoesNotExist:
			response = {
				'result': 0,
				'message' : 'Error User'
			}
	except Token.DoesNotExist:
		response = {
			'result': 0,
			'message' : 'Error Token'
		}
	return JsonResponse(response)

def list_roles(request):
	try:
		group = Group.objects.all()
		arr = []
		for x in group:
			arr.append(x.name)
		response = {
			'result': 1,
			'data' : arr
		}
	except Group.DoesNotExist:
		response = {
			'result': 0,
			'message' : 'Error group'
		}
	return JsonResponse(response)

@csrf_exempt
def profile_edit(request):
	
	token = request.POST.get('token')
	first_name = request.POST.get('first_name')
	last_name = request.POST.get('last_name')
	info = request.POST.get('info')
	email = request.POST.get('email')
	file = request.FILES.get('file')
	roles = request.POST.get('roles')

	try:
		obj_token = Token.objects.get(token=token)
		try:
			user = User.objects.get(username=obj_token.user.username)

			# save profile
			try:
				profile = Profile.objects.get(user__username=user.username)
				url_image = str(profile.image)
				if os.path.exists(url_image):
					os.remove(url_image)
			except Profile.DoesNotExist:
				profile = Profile(user=user)
			profile.info = info
			if file != None:
				profile.image = file
			profile.save()

			# save user
			user.first_name = first_name
			user.last_name = last_name
			user.email = email

			try:
				user.save()
				user.groups.clear()
				group = Group.objects.get(name=roles)
				group.user_set.add(user)
				response = {
					'result': 1,
					'message' : 'Save success'	
				}
			except Group.DoesNotExist:
				group = None
				response = {
					'result': 0,
					'message' : 'Can not add group'	
				}
		except User.DoesNotExist:
			response = {
				'result': 0,
				'message' : 'Error User'
			}
	except Token.DoesNotExist:
		response = {
			'result': 0,
			'message' : 'Error Token'
		}
	return JsonResponse(response)

def blog_list_all(request):

	page = request.GET.get('page')
	itemsPerPage = request.GET.get('itemsPerPage')	or 5


	blog_list = (
			Blog.objects.order_by('-created')
			.annotate(created_by=F('author__username'),author_first_name=F('author__first_name'),author_last_name=F('author__last_name'))
			.values('id','title','content_short','created_by','created', 'image','author_first_name', 'author_last_name')
		)
	paginator = Paginator(blog_list, itemsPerPage)

	try:
		blogs = paginator.page(page)
	except PageNotAnInteger:
		# If page is not an integer, deliver first page.
		blogs = paginator.page(1)
	except EmptyPage:
		# If page is out of range (e.g. 9999), deliver last page of results.
		blogs = paginator.page(paginator.num_pages)

	previous_page_number = ''
	if blogs.has_previous():
		previous_page_number = blogs.previous_page_number()
	next_page_number = ''
	if blogs.has_next():
		next_page_number = blogs.next_page_number()



	obj_page = {
		'number' : blogs.number,
		'next_page_number' : next_page_number,
		'previous_page_number': previous_page_number,
		'start_index' : blogs.start_index(),
		'end_index' : blogs.end_index(),
	}
	response = {
		'result': 1,
		'data' : list(blogs.object_list),
		'total' : blog_list.count(), 
		'info' : obj_page,
	}
	return JsonResponse(response)

def blog_list_comments(request):
	blog_id = request.GET.get('id')
	page = request.GET.get('page')
	itemsPerPage = request.GET.get('itemsPerPage')	or 5


	try:
		_id = int(blog_id)
		comments_list = (
				Comment.objects.filter(blog__id=_id, comments_reply__isnull=True).order_by('-created')
				.annotate(
					created_by=F('user__username'), first_name=F('user__first_name'), last_name=F('user__last_name')
				)
				.values('id','comments','created','created_by', 'first_name', 'last_name')
			)
		paginator = Paginator(comments_list, itemsPerPage)

		try:
			comments = paginator.page(page)
		except PageNotAnInteger:
			comments = paginator.page(1)
		except EmptyPage:
			comments = paginator.page(paginator.num_pages)


		for v in comments.object_list:
			list_reply_comment = (
					Comment.objects.filter(blog__id=_id, comments_reply__id=v['id'])
					.annotate(
						created_by=F('user__username'), first_name=F('user__first_name'), last_name=F('user__last_name')
					)
					.values('id','comments','created','created_by', 'first_name', 'last_name')
				)
			if list_reply_comment.count() > 0:
				for x in list_reply_comment:
					x['created_by_image'] = get_profile_image(x['created_by'])

			v['created_by_image'] = get_profile_image(v['created_by'])
			v['list_reply'] = list(list_reply_comment)

		previous_page_number = ''
		if comments.has_previous():
			previous_page_number = comments.previous_page_number()
		next_page_number = ''
		if comments.has_next():
			next_page_number = comments.next_page_number()


		obj_page = {}
		if comments_list.count() > 0:
			obj_page = {
				'number' : comments.number,
				'next_page_number' : next_page_number,
				'previous_page_number': previous_page_number,
				'start_index' : comments.start_index(),
				'end_index' : comments.end_index(),
			}
		response = {
			'result': 1,
			'data' : list(comments.object_list),
			'info' : obj_page,
			'total' : comments_list.count(), 
		}
	except Exception as e:
		response = {
			'result': 0,
			'message' : 'Error'
		}
	return JsonResponse(response)

@csrf_exempt
def blog_comments(request):

	token = request.POST.get('token')
	blog_id = request.POST.get('id')
	comments = request.POST.get('comments')
	comments_id = request.POST.get('comments_id')

	if token != '':
		try:
			obj_token = Token.objects.get(token=token)
			try:
				data = {}
				_id = int(blog_id)
				blog = Blog.objects.get(pk=_id)

				# create comment
				comment_blog = Comment(blog=blog, user=obj_token.user, comments=comments,status=1)

				if comments_id != None:
					try:
						comment_reply_obj = Comment.objects.get(pk=comments_id)
						comment_blog.comments_reply = comment_reply_obj
						comment_blog.save()
					except Comment.DoesNotExist:
						response = {
							'result': 0,
							'message' : 'Error comments id'
						}
						return JsonResponse(response)
				else:
					comment_blog.save()

				if obj_token.user != blog.author:	
					# create notification			
					notifi = Notification(blog=blog, user=obj_token.user, comment=comment_blog)
					notifi.save()

					# create notification count
					try:
						notifi_count = NotificationCount.objects.get(user=blog.author)
						notifi_count.count += 1
						notifi_count.save()
					except NotificationCount.DoesNotExist:
						notifi_count =  NotificationCount(user=blog.author, count=1)
						notifi_count.save()
					data = {
						'id' : notifi.id,
						'user_id' : notifi.user.id,
						'username' : notifi.user.username,
						'firstName' :  notifi.user.first_name,
						'lastName' :  notifi.user.last_name, 
						'blog_id' :  notifi.blog.id,
						'blog_title' :  notifi.blog.title, 
						'blog_author' :  get_token_user(notifi.blog.author.username), 
						'comments_name' :  notifi.comment.comments,
						'status' : notifi.status, 
						'comments_id' : notifi.comment.id,
						'created_by_image' : get_profile_image(notifi.user.username)
					}
		
				response = {
					'result': 1,
					'data' : data,
					'message' : 'success'
				}
			except Blog.DoesNotExist:
				response = {
					'result': 0,
					'message' : 'Error id'
				}
			
		except Exception as e:
			response = {
				'result': 0,
				'message' : 'Error token'
			}
	else:
		response = {
			'result': 0,
			'message' : '403'
		}

	return JsonResponse(response)

@csrf_exempt
def blog_delete_comments(request):

	token = request.POST.get('token')
	comment_id = request.POST.get('id')

	if token != '':
		try:
			obj_token = Token.objects.get(token=token)
			try:
				_id = int(comment_id)
				comments = Comment.objects.get(pk=_id)
				if obj_token.user.username == comments.user.username:
					try:
						notifi = Notification.objects.get(comment__id=comments.id)
						if notifi.status == 1: 
							try:
								notifi_count = NotificationCount.objects.get(user=comments.blog.author)
								notifi_count.count -= 1
								notifi_count.save()
							except NotificationCount.DoesNotExist:
								notifi_count = None
					except Notification.DoesNotExist:
						notifi = None
					comments.delete()
					response = {
						'result': 1,
						'message' : 'success'
					}
			except Blog.DoesNotExist:
				response = {
					'result': 0,
					'message' : 'Error id'
				}
			
		except Exception as e:
			response = {
				'result': 0,
				'message' : 'Error token'
			}
	else:
		response = {
			'result': 0,
			'message' : '403'
		}

	return JsonResponse(response)

@csrf_exempt
def blog_like(request):

	token = request.POST.get('token')
	blog_id = request.POST.get('id')

	if token != '':
		try:
			obj_token = Token.objects.get(token=token)
			try:
				_id = int(blog_id)
				blog = Blog.objects.get(pk=_id)
				try:
					get_blog_like = BlogLike.objects.get(blog__id = _id, user__username = obj_token.user.username)
					response = {
						'result': 0,
						'message' : 'Liked user blog'
					}
				except BlogLike.DoesNotExist:
					blog_like = BlogLike(blog=blog, user=obj_token.user)
					blog_like.save()
					blog.like += 1
					blog.save()
					response = {
						'result': 1,
						'message' : 'success'
					}
			except Blog.DoesNotExist:
				response = {
					'result': 0,
					'message' : 'Error id'
				}
			
		except Exception as e:
			response = {
				'result': 0,
				'message' : 'Error token'
			}
	else:
		response = {
			'result': 0,
			'message' : '403'
		}

	return JsonResponse(response)

@csrf_exempt
def blog_delete(request):

	token = request.POST.get('token')
	blog_id = request.POST.get('id')

	try:
		obj_token = Token.objects.get(token=token)
		group = obj_token.user.groups.all()
		if group[0].name == 'admin':
			try:
				_id = int(blog_id)
				blog = Blog.objects.get(pk=_id)
				if blog.author.username == obj_token.user.username:
					# reset notification count
					notifi = Notification.objects.filter(blog=blog)
					if notifi.count() > 0:
						try:
							notifi_count = NotificationCount.objects.get(user=obj_token.user)
							print(notifi_count.count)
							notifi_count.count -= notifi.count()
							notifi_count.save()
						except NotificationCount.DoesNotExist:
							notifi_count = None
					# delete image
					url_image = str(blog.image)
					if os.path.exists(url_image):
						os.remove(url_image)

					blog.delete()
					response = {
						'result': 1,
						'message' : 'success'
					}
				else: 
					response = {
						'result': 0,
						'message' : '403'
					}
			except Blog.DoesNotExist:
				response = {
					'result': 0,
					'message' : 'Error id'
				}
			
		else:
			response = {
				'result': 0,
				'message' : '403'
			}
	except Exception as e:
		response = {
			'result': 0,
			'message' : 'Error token'
		}

	return JsonResponse(response)

@csrf_exempt
def blog_edit(request):

	token = request.POST.get('token')
	blog_id = request.POST.get('id')
	title = request.POST.get('title')
	content_short = request.POST.get('content_short')	
	content_full = request.POST.get('content_full')	
	file = request.FILES.get('file')

	try:
		obj_token = Token.objects.get(token=token)
		group = obj_token.user.groups.all()
		if group[0].name == 'admin':
			try:
				_id = int(blog_id)
				blog = Blog.objects.get(pk=_id)
				if obj_token.user.username == blog.author.username:
					blog.title = title
					blog.content_short = content_short
					blog.content_full = content_full

					# remove image old
					if file != None:
						url_image = str(blog.image)
						if os.path.exists(url_image):
							os.remove(url_image)

						# save image new
						blog.image = file 
					# save new blog

					blog.save()
					response = {
						'result': 1,
						'message' : 'success'
					}
				else:
					response = {
						'result': -1,
						'message' : '403'
					}
			except Blog.DoesNotExist:
				response = {
					'result': 0,
					'message' : 'Error id'
				}
			
		else:
			response = {
				'result': 0,
				'message' : '403'
			}
	except Exception as e:
		response = {
			'result': 0,
			'message' : 'Error token'
		}

	return JsonResponse(response)

def blog_get(request):
	token = request.GET.get('token')
	blog_id = request.GET.get('id')
	try:
		_id = int(blog_id)
		blog = Blog.objects.get(pk=_id)
		user_like = False
		if token != '':
			obj_token = Token.objects.get(token=token)
			try:
				get_blog_like = BlogLike.objects.get(blog__id = _id, user__username = obj_token.user.username)
				user_like = True
			except BlogLike.DoesNotExist:
				user_like = False
		obj = {
			'id' : blog.id,
			'title' : blog.title,
			'content_short' : blog.content_short,
			'content_full' : blog.content_full,
			'created_by' : blog.author.username,
			'author' : blog.author.first_name + '  ' + blog.author.last_name,
			'created' : blog.created,
			'like' : blog.like,
			'user_like' : user_like	,
			'image' : str(blog.image)
		}
		response = {
			'result': 1,
			'data' : obj
		}
	except Blog.DoesNotExist:
		response = {
			'result': 0,
			'message' : 'Error id'
		}

	return JsonResponse(response)

def blog_list(request):
	token = request.GET.get('token')
	page = request.GET.get('page')
	itemsPerPage = request.GET.get('itemsPerPage')	or 5


	try:
		obj_token = Token.objects.get(token=token)
		try:
			arr = []
			blog_list = (
				Blog.objects.filter(author__username=obj_token.user.username).order_by('-created')
				.annotate(created_by=F('author__username'),author_first_name=F('author__first_name'),author_last_name=F('author__last_name'))
				.values('id','title','content_short','created_by','created', 'image')
			)

			paginator = Paginator(blog_list, itemsPerPage)
			try:
				blogs = paginator.page(page)
			except PageNotAnInteger:
				# If page is not an integer, deliver first page.
				blogs = paginator.page(1)
			except EmptyPage:
				# If page is out of range (e.g. 9999), deliver last page of results.
				blogs = paginator.page(paginator.num_pages)

			previous_page_number = ''
			if blogs.has_previous():
				previous_page_number = blogs.previous_page_number()
			next_page_number = ''
			if blogs.has_next():
				next_page_number = blogs.next_page_number()

			obj_page = {
				'number' : blogs.number,
				'next_page_number' : next_page_number,
				'previous_page_number': previous_page_number,
				'start_index' : blogs.start_index(),
				'end_index' : blogs.end_index(),
			}
			response = {
				'result': 1,
				'data' : list(blogs.object_list),
				'total' : blog_list.count(), 
				'number' : blogs.number,
				'next_page_number' : next_page_number,
				'previous_page_number': previous_page_number,
				'start_index' : blogs.start_index(),
				'end_index' : blogs.end_index(),
			}
		except Exception as e:
			response = {
				'result': 0,
				'message' : '403'
			}
	except Exception as e:
		response = {
			'result': 0,
			'message' : 'Error token'
		}

	return JsonResponse(response)

@csrf_exempt
def blog_add(request):

	token = request.POST.get('token')
	title = request.POST.get('title')
	content_short = request.POST.get('content_short')	
	content_full = request.POST.get('content_full')	
	file = request.FILES.get('file')


	try:
		obj_token = Token.objects.get(token=token)
		group = obj_token.user.groups.all()
		if group[0].name == 'admin':
			try:
				check_title_blog = Blog.objects.get(title=title)
				response = {
					'result': -1,
					'message' : 'Blog exist'
				}
			except Blog.DoesNotExist:
				blog = Blog(title = title,content_short = content_short, content_full = content_full, author =  obj_token.user, image=file)
				blog.save()
				response = {
					'result': 1,
					'message' : 'success'
				}
		else:
			response = {
				'result': 0,
				'message' : '403'
			}
	except Exception as e:
		response = {
			'result': 0,
			'message' : 'Error token'
		}

	return JsonResponse(response)


@csrf_exempt
def logout(request):
	try:
		auth_logout(request)
		response = {
			'result': 1
		}
	except Exception as e:
		response = {
			'result': 0,
			'message' : 'Error'
		}
	return JsonResponse(response)



@csrf_exempt
def login(request):
	username = request.POST.get('username')
	password = request.POST.get('password')

	user = authenticate(username=username, password=password)
	if user is not None:
		if user.is_active:
			user = User.objects.get(username = username)
			try:
				token = Token.objects.get(user = user)
				auth_login(request, user)
				group = user.groups.all()
				data = {
					'id' : user.id,
					'userName' : user.username,
					'token' : token.token,
					'lastName' : user.last_name,
					'firstName' : user.first_name,
					'email' : user.email,
					'is_superuser' : user.is_superuser,
					'roles' : group[0].name,
					'image' : get_profile_image(user.username)
				}

				response = {
					'result' : 1,
					'data' : data,
				}
			except Exception as e:
				response = {
					'result': 0,
					'message' : 'Error token'
				}
		else:
			response = {
				'result': 0,
				'message' : 'User not active!'
			}
	else:
		response = {
			'result': 0,
			'message' : 'User or password invalid!'
		}
	
	return JsonResponse(response)


@csrf_exempt
def signup(request):
	username = request.POST.get('username')
	password = request.POST.get('password')
	fname = request.POST.get('fname')
	lname = request.POST.get('lname')


	encode = jwt.encode({'username' : username}, settings.SECRET_KEY)

	if User.objects.filter(username=username).exists():
	    response = {
			'result': -1,
			'message' : 'User name exist'	
		}
	else:
		try:
			user = User(username = username, password = password, first_name = fname, last_name = lname)
			user.set_password(password)
			user.is_active = True
			user.is_staff = True
			user.is_superuser = True
			group_name = 'admin'

			try:
				group = Group.objects.get(name=group_name)
			except Group.DoesNotExist:
				new_group, created = Group.objects.get_or_create(name=group_name)
				group = Group.objects.get(name=group_name)

			user.save()
			group.user_set.add(user)
			token = Token(user = user, token = str(encode))
			token.save()
			response = {
				'result': 1,
				'message' : 'Save success'	
			}
		except Exception as e:
			response = {
				'result': 0,
				'message' : 'Can not save user'	
			}
		
	return JsonResponse(response)



