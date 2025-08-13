from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = ["username"]

    class Meta:
        ordering: list[str] = ["username"]
        verbose_name_plural: str = "users"
        verbose_name: str = "user"

    def __str__(self) -> str:
        return self.username
