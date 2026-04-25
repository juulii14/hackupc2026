# app/models/request_models.py
from pydantic import BaseModel, Field

class RecommendationRequest(BaseModel):
    month: int = Field(..., ge=1, le=12, description="Mes preferit de viatge (1-12)")