from sqlalchemy.orm import Session
from typing import Optional, List
from backend.model.models import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db


    def create_user(self, username: str, password: str) -> User:
        db_user = User(
            username=username,
            password=password
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user


    def get_user_by_username(self, username: str) -> Optional[User]:
        return self.db.query(User).filter(User.username == username).first()


    def user_exists(self, username: str) -> bool:
        return self.db.query(User).filter(User.username == username).first() is not None
