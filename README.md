# event-parser

Чтобы запустить backend, нужно перейти в папку backend.

1) Установите зависимости 
    pip install -r requirements.txt

2) Чтобы создать баззу данных и пользователя admin необходимо:
    Не заходя в папку backend запустить:
    python -m backend.core.create_db

2) В терминале введите команду
    Не заходя в папку backend:
    uvicorn backend.main:app --reload

Чтобы запустить frontend, нужно перейти в папку frontend: cd .\frontend\

1) Установим зависимости: npm install 

2) Запустим фронт: npm run dev