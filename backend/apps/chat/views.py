from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request

from apps.chat.models import Message
from apps.chat.serializers import MessageSerializer


class MessageListView(APIView):
    permission_classes: list = [IsAuthenticated]

    def get(self, request: Request, user_id: int) -> Response:
        """Get message history between current user and specified user"""
        messages = Message.objects.filter(
            (Q(sender=request.user) & Q(receiver_id=user_id))
            | (Q(sender_id=user_id) & Q(receiver=request.user))
        ).order_by("timestamp")

        # Mark messages as read if they were sent to the current user
        Message.objects.filter(
            sender_id=user_id, receiver=request.user, is_read=False
        ).update(is_read=True)

        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
