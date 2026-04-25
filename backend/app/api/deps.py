# app/api/deps.py
from app.services.destination_service import DestinationService
from app.services.image_analyzer import ImageAnalyzer
from app.core.ollama_client import OllamaClient
from app.services.song_analyzer import SongAnalyzer
from app.core.spotify_client import SpotifyClient


def get_destination_service() -> DestinationService:
    ollama_client = OllamaClient()
    image_analyzer = ImageAnalyzer(ollama_client=ollama_client)
    return DestinationService(image_analyzer=image_analyzer)

def get_spotify_client() -> SpotifyClient:
    return SpotifyClient()

def get_song_analyzer() -> SongAnalyzer:
    ollama_client = OllamaClient()
    return SongAnalyzer(ollama_client=ollama_client)


