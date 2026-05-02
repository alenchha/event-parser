from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import uuid
import os

from backend.core.db import get_db
from backend.core.s3 import s3_client
from backend.dependencies.dependencies import get_current_user

router = APIRouter()

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024


@router.post("/users/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Неверный формат. Разрешены: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)

    if size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Файл слишком большой. Максимум {MAX_FILE_SIZE // (1024*1024)} MB"
        )

    filename = f"avatars/{current_user.id}/{uuid.uuid4()}{file_ext}"

    try:
        saved_filename = s3_client.upload_file(file.file, filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка загрузки: {str(e)}")

    current_user.avatar_filename = saved_filename
    db.commit()

    presigned_url = s3_client.get_presigned_url(saved_filename)
    return {"avatar_url": presigned_url}


@router.get("/users/me/avatar")
async def get_my_avatar(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if not current_user.avatar_filename:
        raise HTTPException(status_code=404, detail="Avatar not found")

    presigned_url = s3_client.get_presigned_url(current_user.avatar_filename)
    return {"avatar_url": presigned_url}


@router.delete("/users/me/avatar")
async def delete_avatar(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.avatar_filename:
        s3_client.delete_file(current_user.avatar_filename)
        current_user.avatar_filename = None
        db.commit()
    return {"message": "Аватар удален"}
