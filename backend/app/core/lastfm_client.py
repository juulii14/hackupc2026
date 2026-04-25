import httpx
import unicodedata
from app.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


class LastfmClient:
    def __init__(self):
        self.api_key = settings.LASTFM_API_KEY
        self.base_url = settings.LASTFM_BASE_URL

    import unicodedata

    def _normalize(self, text: str) -> str:
        """Elimina accents d'un text."""
        return unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")

    async def get_track_tags(self, artist: str, track: str) -> list[str]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                self.base_url,
                params={
                    "method": "track.getTopTags",
                    "artist": self._normalize(artist),
                    "track": self._normalize(track),
                    "api_key": self.api_key,
                    "format": "json",
                    "autocorrect": 1,
                },
            )
            response.raise_for_status()

        tags = response.json().get("toptags", {}).get("tag", [])
        result = [tag["name"] for tag in tags[:10]]

        if not result:
            logger.info(f"No hi ha tags per la cançó, provant amb l'artista: {artist}")
            result = await self._get_artist_tags(artist)

        return result

    async def _get_artist_tags(self, artist: str) -> list[str]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                self.base_url,
                params={
                    "method": "artist.getTopTags",
                    "artist": artist,
                    "api_key": self.api_key,
                    "format": "json",
                },
            )
            response.raise_for_status()
        tags = response.json().get("toptags", {}).get("tag", [])
        return [tag["name"] for tag in tags[:10]]