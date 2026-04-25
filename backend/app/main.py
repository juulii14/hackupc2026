# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import recommendations
from app.config import settings

app = FastAPI(
    title="Travel Destination Recommender",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    recommendations.router,
    prefix="/api/v1",
    tags=["recommendations"],
)


@app.get("/health")
async def health_check():
    return {"status": "ok"}