from django.urls import path
from django.urls.resolvers import URLPattern

from apps.accounts.views import RegisterView, LoginView, LogoutView, UserListView

urlpatterns: list[URLPattern] = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("users/", UserListView.as_view(), name="user-list"),
]
