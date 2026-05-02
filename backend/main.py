from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from backend.core.db import Base, engine
from backend.core.middleware import auth_middleware
from backend.routes import health, events, users, auth, admin, upload, seo, weather

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Event Parser API")

app.middleware("http")(auth_middleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:8000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://localhost",
        "http://127.0.0.1",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(health.router)
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(events.router, prefix="/events", tags=["Events"])
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(admin.router, prefix="/admin", tags=['Admin'])
app.include_router(weather.router, tags=["Weather"])
app.include_router(seo.router, tags=["SEO"])
