from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from backend.core.db import get_db
from backend.model.models import User as UserModel
from backend.schemas.schemas import UserWithEvents, PasswordChange, EventBase
from backend.dependencies.dependencies import get_current_user
from backend.core.config import get_password_hash, verify_password
from backend.core.s3 import s3_client

router = APIRouter()

@router.get("/me", response_model=UserWithEvents)
def get_my_profile(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    avatar_url = None
    if current_user.avatar_filename:
        avatar_url = s3_client.get_presigned_url(current_user.avatar_filename)

    registered_events = []
    for e in current_user.registered_events:
        registered_events.append(
            EventBase(
                id=e.id,
                title=e.title,
                date=e.date,
                time=e.time,
                place=e.place,
                capacity=e.capacity,
                description=e.description,
                age_limit=e.age_limit,
                event_type=e.event_type,
                image_url=e.image_url,
                registration_count=len(e.participants)
            ).model_dump()
        )

    return {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role,
        "registered_events": registered_events,
        "avatar_url": avatar_url
    }

@router.delete("/me")
def delete_my_account(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    if current_user.avatar_filename:
        s3_client.delete_file(current_user.avatar_filename)
    
    db.delete(current_user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.patch("/me/password")
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
