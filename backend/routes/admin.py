from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from ..core.db import get_db
from ..model.models import User as UserModel
from ..schemas.schemas import UserWithEvents
from ..dependencies.dependencies import get_current_user
from ..model.permissons import RequirePermission, Permission

router = APIRouter()

@router.get("/users", response_model=List[UserWithEvents])
def get_all_users(
    db: Session = Depends(get_db),
    admin: UserModel = Depends(RequirePermission(Permission.EDIT_EVENT))
):
    users = db.query(UserModel).all()
    return users

@router.put("/users/{user_id}/role")
def change_user_role(
    user_id: int,
    new_role: str,
    db: Session = Depends(get_db),
    admin: UserModel = Depends(RequirePermission(Permission.EDIT_EVENT))
):
    if new_role not in ["user", "admin"]:
        raise HTTPException(
            status_code=400, 
            detail="Недопустимая роль. Доступные роли: user, admin"
        )
    
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    old_role = user.role
    user.role = new_role
    db.commit()
    
    return {
        "message": f"Роль пользователя {user.username} изменена",
        "old_role": old_role,
        "new_role": new_role
    }