from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.core.db import get_db
from backend.schemas.schemas import UserCreate, Token, RefreshTokenRequest
from backend.dependencies.dependencies import get_current_user
from backend.services.auth_service import AuthService
from backend.model.models import User as UserModel

router = APIRouter()


def set_refresh_token_cookie(response: Response, refresh_token: str):
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )


def clear_refresh_token_cookie(response: Response):
    response.delete_cookie(key="refresh_token", path="/")


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    auth_service = AuthService(db)

    try:
        new_user = auth_service.register_user(user)
        return {
            "message": "User registered successfully", 
            "user_id": new_user.id
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=Token)
def login(
    response: Response,
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    auth_service = AuthService(db)
    user = auth_service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    user_agent = request.headers.get("user-agent")
    access_token, refresh_token = auth_service.create_tokens(user, user_agent)

    set_refresh_token_cookie(response, refresh_token)

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    auth_service = AuthService(db)
    refresh_token = request.cookies.get("refresh_token")

    print(f"Refresh token from cookie: {refresh_token}")

    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token not found")

    try:
        user_agent = request.headers.get("user-agent")
        new_access_token, new_refresh_token = auth_service.refresh_tokens(
            refresh_token, user_agent
        )

        set_refresh_token_cookie(response, new_refresh_token)

        return {
            "access_token": new_access_token,
            "token_type": "bearer"
        }
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/logout")
def logout(
    response: Response,
    request: Request,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    auth_service = AuthService(db)
    refresh_token = request.cookies.get("refresh_token")

    if refresh_token:
        auth_service.logout(refresh_token)

    clear_refresh_token_cookie(response)

    return {"message": "Successfully logged out"}
