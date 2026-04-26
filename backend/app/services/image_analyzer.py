# app/services/image_analyzer.py
import base64
from typing import List, Dict, Any
from app.core.ollama_client import OllamaClient
from app.utils.logger import get_logger

logger = get_logger(__name__)

ANALYSIS_PROMPT = """
You are a travel expert. Analyze this image and recommend 4 travel destinations.

From the image, extract:
- The environment (beach, mountain, city, jungle, desert...)
- The weather and atmosphere (sunny, warm, tropical, snowy, cold...)
- The overall vibe and style

The user wants to travel in month {month}.

IMPORTANT: Only recommend destinations where month {month} actually matches
the weather and atmosphere visible in the image. For example:
- If the image shows a sunny warm beach, do NOT recommend Mediterranean destinations
  in winter months (November to March), recommend instead Caribbean, Southeast Asia,
  or similar destinations that are warm and sunny in month {month}.
- If the image shows snow and mountains, recommend destinations that actually
  have snow in month {month}.
- Always prioritize seasonal accuracy over visual similarity.

WRITING RULES (VERY IMPORTANT):
- Do NOT describe the image explicitly
- Do NOT use phrases like "the image shows", "the image depicts", "in the picture", etc.
- Focus ONLY on the travel recommendation and its reasoning
- Write naturally, as if you are giving travel advice

Make sure that the cities you recommend have an aerport.

Return ONLY a JSON with this structure:
{{
  "destinations": [
    {{
      "city": "string",
      "country": "string",
      "reason": "string (explain why this destination matches both the vibe and month {month} without referring to the image explicitly)"
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