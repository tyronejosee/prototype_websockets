from typing import Sequence

from django.contrib import admin

from apps.chat.models import Message


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display: Sequence = ("sender", "receiver", "content", "timestamp", "is_read")
    list_filter: Sequence = ("timestamp", "is_read")
    search_fields: Sequence = ("sender__username", "receiver__username", "content")
    readonly_fields: Sequence = ("timestamp",)
