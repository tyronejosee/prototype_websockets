from typing import Sequence

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from apps.accounts.models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display: Sequence = (
        "username",
        "email",
        "is_online",
        "last_seen",
        "is_staff",
        "is_active",
    )
    list_filter: Sequence = ("is_online", "is_staff", "is_active")
    readonly_fields: Sequence = ("last_seen",)
