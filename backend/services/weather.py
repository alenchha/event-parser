import os
import httpx
from dotenv import load_dotenv

load_dotenv()

WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather"

async def get_weather(city: str):
    if not WEATHER_API_KEY:
        return {"error": "API ключ погоды не настроен на сервере."}
    
    if not city or not city.strip():
        return {"error": "Название города не указано."}

    params = {
        "q": city,
        "appid": WEATHER_API_KEY,
        "units": "metric",
        "lang": "ru"
    }
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(WEATHER_API_URL, params=params)

            if response.status_code != 200:
                error_data = response.json()
                if error_data.get("cod") == "404":
                    return {"error": f"Город '{city}' не найден. Проверьте название."}
                else:
                    return {"error": f"Ошибка API погоды: {error_data.get('message', 'Неизвестная ошибка')}"}
            
            data = response.json()

            return {
                "city": data.get("name", city),
                "temperature": round(data["main"]["temp"]),
                "feels_like": round(data["main"]["feels_like"]),
                "humidity": data["main"]["humidity"],
                "description": data["weather"][0]["description"],
                "icon": data["weather"][0]["icon"]
            }
            
    except httpx.TimeoutException:
        return {"error": "Сервер погоды не отвечает (таймаут)."}
    except Exception as e:
        return {"error": "Не удалось получить погоду. Проверьте соединение."}
    