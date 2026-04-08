from fastapi import APIRouter, Response, Depends
from sqlalchemy.orm import Session
from ..core.db import get_db
from ..model.models import Event as EventModel

router = APIRouter()

@router.get("/robots.txt")
async def robots_txt():
    content = """User-agent: *
    Allow: /events
    Allow: /events/
    Disallow: /register
    Disallow: /profile
    Disallow: /upload
    Disallow: /users

    Sitemap: http://localhost:8000/sitemap.xml
    """
    return Response(content=content, media_type="text/plain")

@router.get("/sitemap.xml")
async def sitemap_xml(db: Session = Depends(get_db)):
    events = db.query(EventModel).all()
    
    urls = [
        "<url><loc>http://localhost:5173/events</loc><priority>0.9</priority></url>"
    ]
    
    for event in events:
        urls.append(
            f"<url><loc>http://localhost:5173/events/{event.id}</loc>"
            f"<lastmod>{event.date}</lastmod>"
            f"<priority>0.8</priority></url>"
        )
    
    content = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>"""
    
    return Response(content=content, media_type="application/xml")