from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from backend.model.models import RefreshToken
import uuid


class TokenRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_refresh_token(
        self,
        user_id: int,
        expires_days: int = 7,
        user_agent: str = None
    ) -> RefreshToken:
        token_id = str(uuid.uuid4())
        expires_at = datetime.utcnow() + timedelta(days=expires_days)

        db_token = RefreshToken(
            token=token_id,
            user_id=user_id,
            expires_at=expires_at,
            user_agent=user_agent
        )

        self.db.add(db_token)
        self.db.commit()
        self.db.refresh(db_token)
        return db_token

    def get_refresh_token(self, token_id: str) -> RefreshToken:
        return self.db.query(RefreshToken).filter(
            RefreshToken.token == token_id,
            RefreshToken.is_revoked.is_(False),
            RefreshToken.expires_at > datetime.utcnow()
        ).first()

    def revoke_refresh_token(self, token_id: str) -> bool:
        token = self.db.query(RefreshToken).filter(RefreshToken.token == token_id).first()
        if token:
            token.is_revoked = True
            self.db.commit()
            return True
        else:
            return False
