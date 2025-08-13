from typing import Sequence

from rest_framework import serializers

from apps.accounts.serializers import UserSerializer
from apps.chat.models import Message


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields: Sequence = (
            "id",
            "sender",
            "receiver",
            "content",
            "timestamp",
            "is_read",
        )


class CreateMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields: Sequence = ("receiver", "content")
