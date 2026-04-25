# app/api/routes/song_recommendations.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.models.response_models import RecommendationResponse, Destination
from app.services.song_analyzer import SongAnalyzer
from app.core.spotify_client import SpotifyClient
from app.api.deps import get_song_analyzer, get_spotify_client
from app.utils.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


class SongRequest(BaseModel):
    spotify_url: str


@router.post("/recommendations/song", response_model=RecommendationResponse)
async def get_song_recommendations(
    request: SongRequest,
    analyzer: SongAnalyzer = Depends(get_song_analyzer),
    spotify: SpotifyClient = Depends(get_spotify_client),
):
    try:
        track_id = spotify.extract_track_id(request.spotify_url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        audio_features = await spotify.get_audio_features(track_id)
    except Exception as e:
        logger.error(f"Error obtenint audio features: {e}")
        raise HTTPException(status_code=502, detail="Error connectant amb Spotify")

    raw_destinations = await analyzer.analyze(audio_features)

    destinations = [
        Destination(
            city=dest["city"],
            country=dest["country"],
            reason=dest["reason"],
        )
        for dest in raw_destinations
    ]

    return RecommendationResponse(
        destinations=destinations,
        images_analyzed=0,
    )