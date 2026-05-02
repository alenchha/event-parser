#!/bin/sh

echo "Starting entrypoint..."

mkdir -p /app/data

echo "Running DB init..."
python backend/core/create_db.py

echo "Starting FastAPI..."
exec "$@"