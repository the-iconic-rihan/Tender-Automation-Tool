from django.urls import re_path

from .consumer import FileUploadConsumer

websocket_urlpatterns = [
    re_path(r'api/ws/file_upload/$', FileUploadConsumer.as_asgi()),
]