# app/core/ollama_client.py
import httpx
import json
from app.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


class OllamaClient:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL
        self.timeout = settings.OLLAMA_TIMEOUT

    async def generate_with_image(self, prompt: str, image_b64: str) -> dict:
        payload = {
            "model": self.model,
            "prompt": prompt,
            "images": [image_b64],
            "stream": False,
            "format": "json",
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            logger.info(f"Enviant imatge a Ollama amb model '{self.model}'")
            response = await client.post(
                f"{self.base_url}/api/generate",
                json=payload,
            )
            response.raise_for_status()

        raw_text = response.json().get("response", "{}")

        try:
            return json.loads(raw_text)
        except json.JSONDecodeError as e:
            logger.error(f"Ollama no ha retornat JSON vàlid: {raw_text[:200]}")
            raise ValueError(f"Resposta invàlida d'Ollama: {e}") from e
    

    async def generate_text(self, prompt: str) -> dict:
        payload = {
            "model": settings.OLLAMA_TEXT_MODEL,
            "messages": [
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            "stream": False,
            "format": "json",
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            logger.info(f"Enviant text a Ollama amb model '{settings.OLLAMA_TEXT_MODEL}'")
            response = await client.post(
                f"{self.base_url}/api/chat",
                json=payload,
            )
            response.raise_for_status()

        raw_text = response.json().get("message", {}).get("content", "{}")

        try:
            return json.loads(raw_text)
        except json.JSONDecodeError as e:
            logger.error(f"Ollama no ha retornat JSON vàlid: {raw_text[:200]}")
            raise ValueError(f"Resposta invàlida d'Ollama: {e}") from e 


