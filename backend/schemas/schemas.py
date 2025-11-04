from pydantic import BaseModel, field_validator
from typing import Optional, List
import re

class UserBase(BaseModel):
    id: Optional[int] = None
    username: str

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    password: str

class EventBase(BaseModel):
    id: Optional[int] = None
    title: str
    date: str
    time: str
    place: str
    capacity: int
    description: Optional[str] = None
    age_limit: Optional[int] = None
    event_type: Optional[str] = None
    image_url: Optional[str] = None
    registration_count: Optional[int] = None

    class Config:
        from_attributes = True

class EventWithParticipants(EventBase):
    participants: List[UserBase] = []

class UserWithEvents(UserBase):
    role: str
    registered_events: List[EventBase] = []

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class EventCreate(BaseModel):
    title: str
    date: str
    time: str
    place: str
    capacity: int
    description: Optional[str] = None
    age_limit: Optional[int] = None
    event_type: Optional[str] = None
    image_url: Optional[str] = None

    @field_validator("date")
    def validate_date_format(cls, value):
        if not re.match(r"^\d{2}\.\d{2}\.\d{4}$", value):
            raise ValueError("Дата должна быть в формате ДД.ММ.ГГГГ (например, 31.12.2015)")
        return value

    @field_validator("time")
    def validate_time_format(cls, value):
        if not re.match(r"^(?:[01]\d|2[0-3]):[0-5]\d$", value):
            raise ValueError("Время должно быть в формате ЧЧ:ММ (например, 10:30)")
        return value

class PasswordChange(BaseModel):
    old_password: str
    new_password: str
