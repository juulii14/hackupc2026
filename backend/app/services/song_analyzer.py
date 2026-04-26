# app/services/song_analyzer.py
import json
from app.core.ollama_client import OllamaClient
from app.utils.logger import get_logger

logger = get_logger(__name__)

SONG_PROMPT = """
You are a travel expert. Based on the song "{artist} - {track}" and its musical tags, 
recommend 4 travel destinations.

Musical tags: {tags}

Use the tags as the main factor to determine the mood, energy and style.
Use your knowledge about the song's theme and cultural origin as a secondary factor.

Make sure that the cities you recommend have an aerport.

Return ONLY a JSON with this structure:
{{
  "destinations": [
    {{
      "city": "string",
      "country": "string",
      "reason": "string (why this destination matches the song)"
    }}
  ]
}}
"""


class SongAnalyzer:
    def __init__(self, ollama_client: OllamaClient):
        self.client = ollama_client

    async def analyze(self, tags: list[str], artist: str, track: str) -> list[dict]:
        prompt = SONG_PROMPT.format(
            artist=artist,
            track=track,
            tags=", ".join(tags),
        )
        logger.info(f"Analitzant cançó amb Ollama: {artist} - {track}")
        result = await self.client.generate_text(prompt)
        return result.get("destinations", [])