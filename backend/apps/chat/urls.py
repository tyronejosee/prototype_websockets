from django.urls import path
from django.urls.resolvers import URLPattern

from apps.chat.views import MessageListView

urlpatterns: list[URLPattern] = [
    path("messages/<int:user_id>/", MessageListView.as_view(), name="get-messages"),
]
