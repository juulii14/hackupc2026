# app/services/song_analyzer.py
import json
from app.core.ollama_client import OllamaClient
from app.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

SONG_PROMPT = """
You are a travel expert. Based on these Spotify audio features of a song, 
recommend travel destinations that match the mood, energy and style of the music.

Audio features:
- Energy: {energy} (0=calm, 1=intense)
- Valence: {valence} (0=sad/dark, 1=happy/euphoric)
- Danceability: {danceability} (0=not danceable, 1=very danceable)
- Tempo: {tempo} BPM
- Acousticness: {acousticness} (0=electronic, 1=acoustic)
- Instrumentalness: {instrumentalness} (0=vocals, 1=instrumental)

IMPORTANT: Recommend destinations where the local music, culture and atmosphere 
matches the mood of this song. For example:
- High energy + high danceability → Latin America, Caribbean
- Low valence + acoustic → Scandinavian countries, Iceland
- High valence + high tempo → Brazil, Spain, Italy

Return ONLY a JSON with this structure:
{{
  "destinations": [
    {{
      "city": "string",
      "country": "string",
      "reason": "string (why this destination matches the song's mood)"
    }}
  ]
}}
"""


class SongAnalyzer:
    def __init__(self, ollama_client: OllamaClient):
        self.client = ollama_client

    async def analyze(self, audio_features: dict) -> list[dict]:
        prompt = SONG_PROMPT.format(
            energy=audio_features.get("energy", 0),
            valence=audio_features.get("valence", 0),
            danceability=audio_features.get("danceability", 0),
            tempo=audio_features.get("tempo", 0),
            acousticness=audio_features.get("acousticness", 0),
            instrumentalness=audio_features.get("instrumentalness", 0),
        )

        logger.info("Analitzant audio features amb Ollama")
        result = await self.client.generate_text(prompt)
        return result.get("destinations", [])