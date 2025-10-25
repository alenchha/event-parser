from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from ..core.db import get_db
from ..model.models import User as UserModel
from ..schemas.schemas import UserWithEvents, PasswordChange
from ..dependencies.dependencies import get_current_user
from ..routes.auth import get_password_hash, verify_password

router = APIRouter()

@router.get("/users/me", response_model=UserWithEvents)
def get_my_profile(current_user: UserModel = Depends(get_current_user)):
    return current_user

@router.delete("/users/me")
def delete_my_account(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    db.delete(current_user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.patch("/users/me/password")
def change_my_password(
    passwords: PasswordChange,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    if not verify_password(passwords.old_password, current_user.password):
        raise HTTPException(status_code=400, detail="Old password is incorrect")
    
    current_user.password = get_password_hash(passwords.new_password)
    db.commit()
    return {"message": "Password changed successfully"}
