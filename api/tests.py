from django.test import TestCase
from api.models import Token, Blog, BlogLike, Comment,Notification, NotificationCount, Profile, Contact


# Create your tests here.
def get_profile_image(user):
	img = ''
	try:
		profile = Profile.objects.get(user__username=user)
		img = str(profile.image)
	except Profile.DoesNotExist:
		img = None
	return img


def get_token_user(user):
	token = ''
	try:
		obj = Token.objects.get(user__username=user)
		token = obj.token
	except Token.DoesNotExist:
		token = None
	return token