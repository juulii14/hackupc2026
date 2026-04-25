# app/api/deps.py
from app.services.destination_service import DestinationService
from app.services.image_analyzer import ImageAnalyzer
from app.core.ollama_client import OllamaClient


def get_destination_service() -> DestinationService:
    ollama_client = OllamaClient()
    image_analyzer = ImageAnalyzer(ollama_client=ollama_client)
    return DestinationService(image_analyzer=image_analyzer)



# -------------------------------------- MIRAR --------------------------------------