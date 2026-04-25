# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import recommendations
from app.config import settings
from app.api.routes import recommendations, song_recommendations


app = FastAPI(
    title="Travel Destination Recommender",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    recommendations.router,
    prefix="/api/v1",
    tags=["recommendations"],
)

app.include_router(
    song_recommendations.router,
    prefix="/api/v1",
    tags=["song-recommendations"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok"}