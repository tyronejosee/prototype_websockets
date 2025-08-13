import json
from typing import cast, TypedDict

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import BaseChannelLayer
from django.contrib.auth import get_user_model

from apps.chat.models import Message
from apps.accounts.models import User as UserType

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self) -> None:
        self.user = self.scope["user"]

        if self.user.is_anonymous:
            await self.close()
            return

        self.user_group_name = f"user_{self.user.id}"

        # Join user's personal group
        channel_layer = cast(BaseChannelLayer, self.channel_layer)
        await channel_layer.group_add(self.user_group_name, self.channel_name)

        # Update user online status
        await self.set_user_online(self.user, True)

        await self.accept()

        # Notify about connection
        await self.send(
            text_data=json.dumps(
                {"type": "connection_established", "message": "Connected successfully"}
            )
        )

    async def disconnect(self, code: int) -> None:
        if hasattr(self, "user") and not self.user.is_anonymous:
            # Leave user's personal group
            channel_layer = cast(BaseChannelLayer, self.channel_layer)
            await channel_layer.group_discard(self.user_group_name, self.channel_name)

            # Update user offline status
            await self.set_user_online(self.user, False)

    async def receive(
        self, text_data: str | None = None, bytes_data: bytes | None = None
    ) -> None:
        if not text_data:
            return

        try:
            data = json.loads(text_data)
            message_type = data.get("type")

            if message_type == "chat_message":
                await self.handle_chat_message(data)
            elif message_type == "typing":
                await self.handle_typing(data)

        except json.JSONDecodeError:
            await self.send(
                text_data=json.dumps({"type": "error", "message": "Invalid JSON data"})
            )

    async def handle_chat_message(self, data: dict) -> None:
        receiver_id = data.get("receiver_id")
        content = data.get("content")

        if not receiver_id or not content:
            await self.send(
                text_data=json.dumps(
                    {"type": "error", "message": "Missing receiver_id or content"}
                )
            )
            return

        # Save message to database
        message = await self.save_message(
            sender=self.user, receiver_id=receiver_id, content=content
        )

        if not message:
            await self.send(
                text_data=json.dumps(
                    {"type": "error", "message": "Failed to save message"}
                )
            )
            return

        # Prepare message data
        message_data = {
            "type": "chat_message",
            "message_id": message.id,
            "sender_id": self.user.id,
            "sender_username": self.user.username,
            "receiver_id": receiver_id,
            "content": content,
            "timestamp": message.timestamp.isoformat(),
        }
        # Send to receiver
        channel_layer = cast(BaseChannelLayer, self.channel_layer)
        await channel_layer.group_send(
            f"user_{receiver_id}",
            {"type": "chat_message_handler", "message_data": message_data},
        )

        # Send same chat_message to sender
        await channel_layer.group_send(
            self.user_group_name,
            {"type": "chat_message_handler", "message_data": message_data},
        )

    async def handle_typing(self, data: dict) -> None:
        receiver_id = data.get("receiver_id")
        is_typing = data.get("is_typing", False)

        if not receiver_id:
            return

        # Send typing indicator to receiver
        channel_layer = cast(BaseChannelLayer, self.channel_layer)
        await channel_layer.group_send(
            f"user_{receiver_id}",
            {
                "type": "typing_handler",
                "sender_id": self.user.id,
                "sender_username": self.user.username,
                "is_typing": is_typing,
            },
        )

    async def chat_message_handler(self, event: dict) -> None:
        message_data = event["message_data"]
        await self.send(text_data=json.dumps(message_data))

    async def typing_handler(self, event: dict) -> None:
        await self.send(
            text_data=json.dumps(
                {
                    "type": "typing",
                    "sender_id": event["sender_id"],
                    "sender_username": event["sender_username"],
                    "is_typing": event["is_typing"],
                }
            )
        )

    @database_sync_to_async
    def save_message(
        self, sender: UserType, receiver_id: int, content: str
    ) -> Message | None:
        try:
            receiver = User.objects.get(id=receiver_id)
            message = Message.objects.create(
                sender=sender, receiver=receiver, content=content
            )
            return message
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def set_user_online(self, user: "UserType", is_online: bool) -> None:
        user.is_online = is_online
        user.save()
