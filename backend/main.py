from fastapi import FastAPI
from backend.core.db import Base, engine
from backend.core.middleware import auth_middleware
import backend.model.models as models
from backend.routes import health, events, users, auth

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Event Parser API")

app.middleware("http")(auth_middleware)

app.include_router(health.router)
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(events.router, prefix="/events", tags=["Events"])