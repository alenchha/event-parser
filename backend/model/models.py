from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from ..core.db import Base

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
