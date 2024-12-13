"""Routing for Chat App."""

from django.urls import path
from .consumers import ChatConsumer

websocket_urlpatterns: list = [
    path("ws/chat/<str:room_name>/", ChatConsumer.as_asgi()),
]
