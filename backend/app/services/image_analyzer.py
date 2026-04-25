# app/services/image_analyzer.py
import base64
from typing import List, Dict, Any
from app.core.ollama_client import OllamaClient
from app.utils.logger import get_logger

logger = get_logger(__name__)

ANALYSIS_PROMPT = """
Analyze this image and recommend travel destinations that match the
weather, environment, mood and style you see. The user wants to travel in month {month}.

Return ONLY a JSON with this structure:
{{
  "destinations": [
    {{
      "city": "string",
      "country": "string",
      "reason": "string (why this destination matches the image)"
    }}
  ]
}}
"""


class ImageAnalyzer:
    def __init__(self, ollama_client: OllamaClient):
        self.client = ollama_client

    async def analyze(self, images: List[Dict[str, Any]], month: int) -> List[Dict]:
        prompt = ANALYSIS_PROMPT.format(month=month)
        all_destinations = []

        for img in images:
            logger.info(f"Analitzant imatge: {img['filename']}")
            image_b64 = base64.b64encode(img["content"]).decode("utf-8")
            result = await self.client.generate_with_image(prompt, image_b64)
            destinations = result.get("destinations", [])
            all_destinations.extend(destinations)

        return all_destinations