import jwt

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractUser
from rest_framework.authentication import BaseAuthentication
from rest_framework.request import Request

User = get_user_model()


class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request: Request) -> None | tuple[AbstractUser, None]:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(
                token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
            )
            user = User.objects.get(id=payload["user_id"])
            return (user, None)
        except Exception:
            return None
