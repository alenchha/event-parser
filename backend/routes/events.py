from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse
import io
import qrcode
from typing import List

from ..core.db import get_db
from ..model.models import Event as EventModel
from ..schemas.schemas import EventCreate, EventWithParticipants, EventBase
from ..dependencies.dependencies import get_current_user
from ..ai.parser import parse_event_from_image

router = APIRouter()

@router.get("/", response_model=List[EventWithParticipants])
def get_events(db: Session = Depends(get_db), user=Depends(get_current_user)):
    events = db.query(EventModel).all()
    return [
        {
            **e.__dict__, "registration_count": len(e.participants),
            "participants": e.participants,
        }
        for e in events
    ]

@router.post("/parse_image")
async def parse_image(file: UploadFile = File(...), user=Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    return await parse_event_from_image(file)

@router.post("/create")
def create_event(event: EventCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    db_event = EventModel(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.get("/{event_id}", response_model=EventBase)
def get_event(event_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    db_event = db.query(EventModel).filter(EventModel.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    return {
        **db_event.__dict__,
        "registration_count": len(db_event.participants),
    }

@router.post("/{event_id}/register")
def register_for_event(event_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    db_event = db.query(EventModel).filter(EventModel.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    if db_event.capacity is not None and len(db_event.participants) >= db_event.capacity:
        raise HTTPException(status_code=400, detail="Нет свободных мест")
    if user in db_event.participants:
        raise HTTPException(status_code=400, detail="Already registered")
    db_event.participants.append(user)
    db.commit()
    db.refresh(db_event)
    return {"message": f"{user.username} зарегистрирован(а) на '{db_event.title}'"}

@router.delete("/{event_id}/unregister")
def unregister_from_event(event_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    db_event = db.query(EventModel).filter(EventModel.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    if user not in db_event.participants:
        raise HTTPException(status_code=400, detail="User is not registered for this event")
    db_event.participants.remove(user)
    db.commit()
    return {"message": f"{user.username} снят(а) с регистрации"}

@router.get("/{event_id}/qrcode")
def get_event_qrcode(event_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    db_event = db.query(EventModel).filter(EventModel.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    qr_data = f"{db_event.title} — {db_event.date} {db_event.time} @ {db_event.place}"
    img = qrcode.make(qr_data)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")

@router.patch("/{event_id}")
def patch_event(event_id: int, partial_event: dict, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    db_event = db.query(EventModel).filter(EventModel.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    allowed_fields = {"title", "date", "time", "place", "description", "age_limit", "event_type"}
    updated = False
    for key, value in partial_event.items():
        if key in allowed_fields and value is not None:
            setattr(db_event, key, value)
            updated = True
    if not updated:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    db.commit()
    db.refresh(db_event)
    return {"message": "Event updated", "event": db_event}

@router.delete("/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    db_event = db.query(EventModel).filter(EventModel.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(db_event)
    db.commit()
    return {"message": f"Event '{db_event.title}' deleted successfully"}
