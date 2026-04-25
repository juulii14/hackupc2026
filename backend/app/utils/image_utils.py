# app/utils/image_utils.py
from fastapi import UploadFile, HTTPException
from app.config import settings


async def validate_image(image: UploadFile) -> None:
    """Valida el tipus i la mida d'una imatge pujada."""

    if image.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Tipus no permès: '{image.content_type}'. "
                   f"Acceptats: {settings.ALLOWED_IMAGE_TYPES}",
        )

    content = await image.read()
    size_mb = len(content) / (1024 * 1024)

    if size_mb > settings.MAX_IMAGE_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"'{image.filename}' pesa {size_mb:.1f} MB. "
                   f"Màxim: {settings.MAX_IMAGE_SIZE_MB} MB",
        )

    await image.seek(0)