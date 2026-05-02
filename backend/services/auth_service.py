from sqlalchemy.orm import Session
from jose import jwt
from datetime import datetime, timedelta
from typing import Optional, Tuple

from backend.core.config import (
    SECRET_KEY, ALGORITHM, 
    ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS,
    verify_password, get_password_hash
)
from backend.model.models import User
from backend.repositories.token_repository import TokenRepository
from backend.repositories.user_repository import UserRepository
from backend.schemas.schemas import UserCreate

class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.token_repo = TokenRepository(db)
        self.user_repo = UserRepository(db)
    
    def register_user(self, user_data: UserCreate) -> User:
        if self.user_repo.user_exists(user_data.username):
            raise ValueError("User already exists")

        hashed_password = get_password_hash(user_data.password)
    
        db_user = self.user_repo.create_user(
            username=user_data.username,
            password=hashed_password
        )
        
        return db_user
    
    def authenticate_user(self, username: str, password: str) -> Optional[User]:
        user = self.user_repo.get_user_by_username(username)
        if not user or not verify_password(password, user.password):
            return None
        return user
    
    def create_tokens(self, user: User, user_agent: str = None) -> Tuple[str, str]:
        db_refresh_token = self.token_repo.create_refresh_token(
            user_id=user.id,
            expires_days=REFRESH_TOKEN_EXPIRE_DAYS,
            user_agent=user_agent
        )
        access_token = self._create_access_token({"sub": user.username})
        refresh_token = self._create_refresh_token(
            {"sub": user.username}, 
            jti=db_refresh_token.token
        )
        return access_token, refresh_token
    
    def refresh_tokens(self, refresh_token: str, user_agent: str = None) -> Tuple[str, str]:
        try:
            payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
            if payload.get("type") != "refresh":
                raise ValueError("Invalid token type")
            
            username = payload.get("sub")
            jti = payload.get("jti")
            
            if not username or not jti:
                raise ValueError("Invalid token")
                
        except jwt.JWTError:
            raise ValueError("Invalid token")
        
        db_token = self.token_repo.get_refresh_token(jti)
        if not db_token:
            raise ValueError("Refresh token not found or expired")

        user = self.user_repo.get_user_by_username(username)
        if not user:
            raise ValueError("User not found")

        self.token_repo.revoke_refresh_token(jti)

        new_db_token = self.token_repo.create_refresh_token(
            user_id=user.id,
            expires_days=REFRESH_TOKEN_EXPIRE_DAYS,
            user_agent=user_agent
        )
        new_access_token = self._create_access_token({"sub": user.username})
        new_refresh_token = self._create_refresh_token(
            {"sub": user.username},
            jti=new_db_token.token
        )
        
        return new_access_token, new_refresh_token
    
    def logout(self, refresh_token: str) -> bool:
        try:
            payload = jwt.decode(
                refresh_token,
                SECRET_KEY,
                algorithms=[ALGORITHM],
                options={"verify_exp": False}
            )
            jti = payload.get("jti")
            
            if jti:
                return self.token_repo.revoke_refresh_token(jti)
        except jwt.JWTError:
            pass
        
        return False
    
    def _create_access_token(self, data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({
            "exp": expire,
            "type": "access"
        })
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    def _create_refresh_token(self, data: dict, jti: str) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({
            "exp": expire,
            "type": "refresh",
            "jti": jti
        })
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    