from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^login$', views.login, name='login'),
    url(r'^logout$', views.logout, name='logout'),
    url(r'^signup$', views.signup, name='signup'),
    url(r'^list-roles$', views.list_roles, name='list_roles'),

    # notification
    url(r'^notification/mask-read$', views.notification_mask_read, name='notification_mask_read'),
    url(r'^notification/mask-all-read$', views.notification_mask_all_read, name='notification_mask_all_read'),
    url(r'^notification/list$', views.notification_list, name='notification_list'),
    url(r'^notification/list-all$', views.notification_list_all, name='notification_list_all'),
    url(r'^notification/count$', views.notification_count, name='notification_count'),
    # url(r'^notification/reset-count$', views.notification_reset_count, name='notification_reset_count'),

    # profile
    url(r'^profile/edit$', views.profile_edit, name='profile_edit'),
    url(r'^profile/get$', views.profile_get, name='profile_get'),



    # blog
    url(r'^blog/list-all$', views.blog_list_all, name='blog_list_all'),
    url(r'^blog/add$', views.blog_add, name='blog_add'),
    url(r'^blog/list$', views.blog_list, name='blog_list'),
    url(r'^blog/get$', views.blog_get, name='blog_get'),
    url(r'^blog/edit$', views.blog_edit, name='blog_edit'),
    url(r'^blog/delete$', views.blog_delete, name='blog_delete'),
    url(r'^blog/like$', views.blog_like, name='blog_like'),
    url(r'^blog/comments$', views.blog_comments, name='blog_comments'),
    url(r'^blog/list-comments$', views.blog_list_comments, name='blog_list_comments'),
    url(r'^blog/list-delete-comments$', views.blog_delete_comments, name='blog_delete_comments'),


    # contact


     url(r'^contact$', views.contact, name='contact'),
]
