# app/services/destination_service.py
from typing import List, Dict, Any
from app.services.image_analyzer import ImageAnalyzer
from app.models.response_models import RecommendationResponse, Destination
from app.utils.logger import get_logger

logger = get_logger(__name__)


class DestinationService:
    def __init__(self, image_analyzer: ImageAnalyzer):
        self.image_analyzer = image_analyzer

    async def get_recommendations(
        self, images: List[Dict[str, Any]], month: int
    ) -> RecommendationResponse:

        logger.info(f"Iniciant pipeline per {len(images)} imatge(s), mes {month}")

        raw_destinations = await self.image_analyzer.analyze(images, month)
        unique_destinations = self._deduplicate(raw_destinations)

        destinations = [
            Destination(
                city=dest["city"],
                country=dest["country"],
                reason=dest["reason"],
            )
            for dest in unique_destinations
        ]

        logger.info(f"Retornant {len(destinations)} destinacions")
        return RecommendationResponse(
            destinations=destinations,
            images_analyzed=len(images),
        )

    def _deduplicate(self, destinations: List[Dict]) -> List[Dict]:
        seen = set()
        unique = []
        for dest in destinations:
            key = (dest["city"].lower(), dest["country"].lower())
            if key not in seen:
                seen.add(key)
                unique.append(dest)
        return unique