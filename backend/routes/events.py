from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse
import io
import qrcode
from typing import Optional
from datetime import datetime

from backend.core.db import get_db
from backend.model.models import Event as EventModel
from backend.schemas.schemas import EventCreate, EventWithParticipants, EventBase, EventListResponse
from backend.dependencies.dependencies import get_current_user
from backend.ai.parser import parse_event_from_image
from backend.model.permissons import RequirePermission, Permission

router = APIRouter()

def parse_date_dmy(date_str: str) -> Optional[datetime]:
    if not date_str:
        return None

    if '-' in date_str:
        try:
            year, month, day = date_str.split('-')
            return datetime(int(year), int(month), int(day))
        except:
            pass
    
    if '.' in date_str:
        try:
            day, month, year = date_str.split('.')
            return datetime(int(year), int(month), int(day))
        except:
            pass
    
    return None

@router.get("/", response_model=EventListResponse)
def get_events(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    age_limit: Optional[int] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    event_type: Optional[str] = None,
    place: Optional[str] = None,
    sort_by: str = "date",
    sort_order: str = "asc",
    db: Session = Depends(get_db)
):
    events = db.query(EventModel).all()
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

    filtered = []
    for e in events:
        ev_date = parse_date_dmy(e.date)
        if ev_date and ev_date < today:
            continue

        if search and search.lower() not in e.title.lower():
            continue

        if age_limit is not None and e.age_limit is not None and e.age_limit > age_limit:
            continue

        if date_from:
            from_date = parse_date_dmy(date_from)
            if from_date and ev_date and ev_date < from_date:
                continue

        if date_to:
            to_date = parse_date_dmy(date_to)
            if to_date and ev_date and ev_date > to_date:
                continue

        if event_type and e.event_type and event_type.lower() not in e.event_type.lower():
            continue

        if place and place.lower() not in e.place.lower():
            continue
        
        filtered.append(e)

    reverse = sort_order == "desc"
    if sort_by == "title":
        filtered.sort(key=lambda x: x.title, reverse=reverse)
    elif sort_by == "place":
        filtered.sort(key=lambda x: x.place, reverse=reverse)
    else:
        filtered.sort(key=lambda x: parse_date_dmy(x.date) or datetime.min, reverse=reverse)

    total = len(filtered)
    paginated = filtered[skip:skip + limit]

    result_items = []
    for e in paginated:
        result_items.append({
            **e.__dict__,
            "registration_count": len(e.participants),
            "participants": e.participants,
        })
    
    return {
        "items": result_items,
        "total": total,
        "skip": skip,
        "limit": limit,
        "has_more": skip + limit < total
    }

@router.post("/parse_image")
async def parse_image(file: UploadFile = File(...), user=Depends(RequirePermission(Permission.PARSE_IMAGE))):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    return await parse_event_from_image(file)

@router.post("/create")
def create_event(event: EventCreate, db: Session = Depends(get_db), user=Depends(RequirePermission(Permission.CREATE_EVENT))):
    db_event = EventModel(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.get("/{event_id}", response_model=EventBase)
def get_event(event_id: int, db: Session = Depends(get_db)):
    db_event = db.query(EventModel).filter(EventModel.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    return {
        **db_event.__dict__,
        "registration_count": len(db_event.participants),
    }

@router.post("/{event_id}/register")
def register_for_event(event_id: int, db: Session = Depends(get_db), user=Depends(RequirePermission(Permission.VIEW_EVENTS))):
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
def unregister_from_event(event_id: int, db: Session = Depends(get_db), user=Depends(RequirePermission(Permission.VIEW_EVENTS))):
    db_event = db.query(EventModel).filter(EventModel.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    if user not in db_event.participants:
        raise HTTPException(status_code=400, detail="User is not registered for this event")
    db_event.participants.remove(user)
    db.commit()
    return {"message": f"{user.username} снят(а) с регистрации"}

@router.get("/{event_id}/qrcode")
def get_event_qrcode(event_id: int, db: Session = Depends(get_db), user=Depends(RequirePermission(Permission.VIEW_EVENTS))):
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
def patch_event(event_id: int, partial_event: dict, db: Session = Depends(get_db), user=Depends(RequirePermission(Permission.EDIT_EVENT))):
    db_event = db.query(EventModel).filter(EventModel.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    allowed_fields = {
        "title",
        "date",
        "time",
        "place",
        "capacity",
        "description",
        "age_limit",
        "event_type",
        "image_url",
    }

    updated = False
    required_fields = {"title", "date", "time", "place", "capacity"}

    for key, value in partial_event.items():
        if key in allowed_fields:
            if key in required_fields and (value is None or value == ""):
                raise HTTPException(status_code=400, detail=f"{key} обязательно")
            setattr(db_event, key, value)
            updated = True

    if not updated:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    db.commit()
    db.refresh(db_event)
    return {"message": "Event updated", "event": db_event}

@router.delete("/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db), user=Depends(RequirePermission(Permission.DELETE_EVENT))):
    db_event = db.query(EventModel).filter(EventModel.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(db_event)
    db.commit()
    return {"message": f"Event '{db_event.title}' deleted successfully"}
