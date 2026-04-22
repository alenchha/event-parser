# event-parser

Чтобы запустить backend, нужно перейти в папку backend.

1. Установите зависимости
   pip install -r requirements.txt

2. Чтобы создать базу данных и пользователя admin необходимо:
   Не заходя в папку backend запустить:
   python -m backend.core.create_db

3. В терминале введите команду
   Не заходя в папку backend:
   docker compose up -d 
   uvicorn backend.main:app --host localhost --port 8000

Чтобы запустить frontend, нужно перейти в папку frontend: cd .\frontend\

1. Установим зависимости: npm install

2. Запустим фронт: npm run dev

Чтобы запустить тесты на бэкэнде:
python -m pytest backend/tests/ --cov=backend --cov-report=html

Чтобы запустить тесты на фронтенде:
npm run test:coverage

Чтобы заупстить сквозные тесты:

npx playwright test
