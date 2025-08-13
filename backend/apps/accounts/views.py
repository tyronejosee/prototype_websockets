from typing import cast
import jwt

from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserSerializer,
)

User = get_user_model()


class RegisterView(CreateAPIView):
    permission_classes: list = [AllowAny]
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer

    def create(self, request: Request) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT token
        payload = {
            "user_id": user.id,
            "email": user.email,
            "username": user.username,
        }
        token = jwt.encode(
            payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
        )

        return Response(
            {"token": token, "user": UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes: list = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = cast(dict, serializer.validated_data)

        user = validated_data["user"]
        user.is_online = True
        user.save()

        payload = {
            "user_id": user.id,
            "email": user.email,
            "username": user.username,
        }
        token = jwt.encode(
            payload,
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM,
        )

        return Response({"token": token, "user": UserSerializer(user).data})


class LogoutView(APIView):
    permission_classes: list = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        request.user.is_online = False
        request.user.save()
        return Response({"message": "Logged out successfully"})


class UserListView(APIView):
    permission_classes: list = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        users = User.objects.exclude(id=request.user.id).order_by(
            "-is_online",
            "username",
        )
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
