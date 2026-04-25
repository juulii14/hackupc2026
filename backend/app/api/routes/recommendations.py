from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from typing import List
from app.models.response_models import RecommendationResponse
from app.services.destination_service import DestinationService
from app.api.deps import get_destination_service
from app.utils.image_utils import validate_image
from app.config import settings

router = APIRouter()

@router.post("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(
    month: int = Form(..., ge=1, le=12),
    images: List[UploadFile] = File(...),
    service: DestinationService = Depends(get_destination_service),
):
    if len(images) > settings.MAX_IMAGES_PER_REQUEST:
        raise HTTPException(
            status_code=400,
            detail=f"Màxim {settings.MAX_IMAGES_PER_REQUEST} imatges per petició",
        )

    image_data_list = []
    for image in images:
        await validate_image(image)
        content = await image.read()
        image_data_list.append({
            "filename": image.filename,
            "content": content,
            "content_type": image.content_type,
        })

    return await service.get_recommendations(image_data_list, month)