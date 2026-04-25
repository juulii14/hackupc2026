# app/config.py
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    APP_ENV: str = "development"
    DEBUG: bool = True
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Ollama
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llava"
    OLLAMA_TIMEOUT: int = 300

    # Last.fm
    LASTFM_API_KEY: str = ""
    LASTFM_BASE_URL: str = "https://ws.audioscrobbler.com/2.0"

    # Model de text
    OLLAMA_TEXT_MODEL: str = "llama3.2:1b"
    # Imatges
    MAX_IMAGE_SIZE_MB: int = 10
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/jpg"]
    MAX_IMAGES_PER_REQUEST: int = 5

    # Recomanacions
    MAX_DESTINATIONS: int = 5

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()