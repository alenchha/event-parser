from enum import Enum
from typing import Set, Dict
from fastapi import HTTPException, Depends

from backend.dependencies.dependencies import get_current_user
from .models import User


class Permission(str, Enum):
    VIEW_EVENTS = "view_events"
    CREATE_EVENT = "create_event"
    EDIT_EVENT = "edit_event"
    DELETE_EVENT = "delete_event"
    PARSE_IMAGE = "parse_image"


ROLE_PERMISSIONS: Dict[str, Set[Permission]] = {
    "user": {
        Permission.VIEW_EVENTS,
    },
    "admin": {
        Permission.VIEW_EVENTS,
        Permission.CREATE_EVENT,
        Permission.EDIT_EVENT,
        Permission.DELETE_EVENT,
        Permission.PARSE_IMAGE,
    }
}


def has_permission(user: User, permission: Permission) -> bool:
    return permission in ROLE_PERMISSIONS.get(user.role, set())


class RequirePermission:
    def __init__(self, permission: Permission):
        self.permission = permission


    def __call__(self, current_user: User = Depends(get_current_user)):
        if not has_permission(current_user, self.permission):
            raise HTTPException(
                status_code=403, 
                detail="Недостаточно прав. Требуются права администратора."
            )
        return current_user
