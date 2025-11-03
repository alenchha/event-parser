import io
import re
import json
from fastapi import UploadFile
from PIL import Image
import easyocr

from google import genai
from google.genai.types import HttpOptions
from google.oauth2 import service_account

reader = easyocr.Reader(['ru', 'en'])

SERVICE_ACCOUNT_JSON = "backend/ai/key.json"

credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_JSON,
    scopes=["https://www.googleapis.com/auth/cloud-platform"]
)

client = genai.Client(
    vertexai=True,
    project="curious-striker-477018-j5",
    location="us-central1",
    credentials=credentials,
    http_options=HttpOptions(api_version="v1")
)

MODEL_NAME = "gemini-2.5-flash"

async def parse_event_from_image(file: UploadFile) -> dict:
    contents = await file.read()
    img = Image.open(io.BytesIO(contents))
    results = reader.readtext(img)
    ocr_text = "\n".join([text for (_, text, _) in results])

    prompt = f"""
    Ты помощник по структуре афиш мероприятий. 
    Извлеки строго JSON с полями:
    title, date, time, place, capacity, description, age_limit, event_type
    Используй только данные из текста ниже. Null, если нет информации.
    Приведи дату в формате ДД.ММ.ГГГГ, например 19 марта будет 19.03.2025. Если год не указан, используй текущий год 2025.
    Age limit добавляй без +, то есть если на афише ты видишь 12+, то просто 12, так как это int значение.

    Текст афиши:
    \"\"\"{ocr_text}\"\"\"
    """

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt
    )

    vertex_response = response.text

    json_match = re.search(r"\{[\s\S]*\}", vertex_response)
    if not json_match:
        return {k: None for k in ["title","description","date","time","place","age_limit","event_type"]}

    try:
        data = json.loads(json_match.group())
    except json.JSONDecodeError:
        data = {k: None for k in ["title","description","date","time","place","age_limit","event_type"]}

    return data
