from sqlalchemy import Column, Integer, String, ForeignKey, Table, Boolean, DateTime
from sqlalchemy.orm import relationship
from ..core.db import Base
from datetime import datetime

user_events = Table(
    "user_events",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("event_id", Integer, ForeignKey("events.id"))
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="user")
    avatar_filename = Column(String, nullable=True)

    registered_events = relationship(
        "Event",
        secondary=user_events,
        back_populates="participants"
    )

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    date = Column(String)
    time = Column(String)
    place = Column(String)
    capacity = Column(Integer)
    description = Column(String, nullable=True)
    age_limit = Column(Integer, nullable=True)
    event_type = Column(String, nullable=True)
    image_url = Column(String, nullable=True)

    participants = relationship(
        "User",
        secondary=user_events,
        back_populates="registered_events"
    )

    @property
    def registration_count(self):
        return len(self.participants)
    
class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    expires_at = Column(DateTime)
    is_revoked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_agent = Column(String, nullable=True)

    user = relationship("User", backref="refresh_tokens")
