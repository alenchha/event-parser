from fastapi import Request
from fastapi.responses import JSONResponse
from jose import jwt, JWTError
from sqlalchemy.orm import Session
import re

from ..core.db import get_db
from ..model.models import User
from ..routes.auth import SECRET_KEY, ALGORITHM


async def auth_middleware(request: Request, call_next):
    public_paths = [
        "/health",
        "/auth/login",
        "/auth/register",
        "/openapi.json",
        "/docs",
        "/docs/oauth2-redirect",
    ]

    if any(request.url.path.startswith(path) for path in public_paths):
        return await call_next(request)
    
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JSONResponse(status_code=401, content={"detail": "Token missing"})

    token = auth_header.split(" ")[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            return JSONResponse(status_code=401, content={"detail": "Invalid token"})

        db: Session = next(get_db())
        user = db.query(User).filter(User.username == username).first()
        if not user:
            return JSONResponse(status_code=401, content={"detail": "User not found"})

        request.state.user = user

        admin_only = [
            "/events/create",
            "/events/{event_id}",
        ]

        if request.method in ["PATCH", "DELETE"]:
            if re.fullmatch(r"/events/\d+", request.url.path):
                if user.role != "admin":
                    return JSONResponse(status_code=403, content={"detail": "Admin privileges required"})

        if request.url.path == "/events/create" and user.role != "admin":
            return JSONResponse(status_code=403, content={"detail": "Admin privileges required"})

    except JWTError:
        return JSONResponse(status_code=401, content={"detail": "Invalid token"})

    response = await call_next(request)
    return response
