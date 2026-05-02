from fastapi import APIRouter
from backend.services.weather import get_weather

router = APIRouter()

@router.get("/weather/{city}")
async def weather(city: str):
    return await get_weather(city)
