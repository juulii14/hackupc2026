 # app/models/response_models.py
from pydantic import BaseModel, Field
from typing import List


class Destination(BaseModel):
    city: str
    country: str
    reason: str = Field(..., description="Per què encaixa amb les imatges pujades")


class RecommendationResponse(BaseModel):
    destinations: List[Destination]
    images_analyzed: int