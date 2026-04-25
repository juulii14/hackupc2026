# app/api/routes/song_recommendations.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.models.response_models import RecommendationResponse, Destination
from app.services.song_analyzer import SongAnalyzer
from app.core.lastfm_client import LastfmClient
from app.api.deps import get_song_analyzer, get_lastfm_client
from app.utils.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


class SongRequest(BaseModel):
    artist: str
    track: str


@router.post("/recommendations/song", response_model=RecommendationResponse)
async def get_song_recommendations(
    request: SongRequest,
    analyzer: SongAnalyzer = Depends(get_song_analyzer),
    lastfm: LastfmClient = Depends(get_lastfm_client),
):
    try:
        tags = await lastfm.get_track_tags(request.artist, request.track)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error obtenint tags de Last.fm: {e}")
        raise HTTPException(status_code=502, detail="Error connectant amb Last.fm")

    if not tags:
        raise HTTPException(status_code=404, detail="No s'han trobat tags per aquesta cançó")

    raw_destinations = await analyzer.analyze(tags, request.artist, request.track)

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