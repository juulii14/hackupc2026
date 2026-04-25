# app/core/spotify_client.py
import httpx
from app.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_API_URL = "https://api.spotify.com/v1"


class SpotifyClient:
    def __init__(self):
        self.client_id = settings.SPOTIFY_CLIENT_ID
        self.client_secret = settings.SPOTIFY_CLIENT_SECRET

    async def _get_token(self) -> str:
        """Obté un token d'accés de Spotify via client credentials."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                SPOTIFY_TOKEN_URL,
                data={"grant_type": "client_credentials"},
                auth=(self.client_id, self.client_secret),
            )
            response.raise_for_status()
        return response.json()["access_token"]

    def extract_track_id(self, spotify_url: str) -> str:
        """Extreu el track_id d'una URL de Spotify."""
        # https://open.spotify.com/track/1234abcd?si=...
        try:
            track_id = spotify_url.split("/track/")[1].split("?")[0]
            return track_id
        except IndexError:
            raise ValueError(f"URL de Spotify invàlida: {spotify_url}")

    async def get_audio_features(self, track_id: str) -> dict:
        """Retorna les audio features d'una cançó."""
        token = await self._get_token()
        async with httpx.AsyncClient() as client:
            logger.info(f"Obtenint audio features per track: {track_id}")
            response = await client.get(
                f"{SPOTIFY_API_URL}/audio-features/{track_id}",
                headers={"Authorization": f"Bearer {token}"},
            )
            response.raise_for_status()
        return response.json()

