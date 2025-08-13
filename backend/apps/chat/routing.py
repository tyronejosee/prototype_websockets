from django.urls import re_path

from apps.chat.consumers import ChatConsumer

websocket_urlpatterns: list = [
    re_path(r"ws/chat/$", ChatConsumer.as_asgi()),
]
