from pydantic import BaseSettings
from functools import lru_cache
import os

class Settings(BaseSettings):
    """Application settings."""
    GEMINI_API_KEY: str
    # Default model, can be overridden by environment variable if needed
    GEMINI_MODEL_NAME: str = "gemini-1.5-flash-latest"

    class Config:
        # Pydantic will automatically try to load environment variables.
        # If python-dotenv is used elsewhere (e.g., in main.py) to load a .env file,
        # those variables will be available in the environment for Pydantic to pick up.
        # Example: env_file = ".env"
        # env_file_encoding = "utf-8"
        pass

@lru_cache()
def get_settings() -> Settings:
    """
    Returns the application settings.
    The settings are cached for performance using lru_cache.
    This function will be used as a dependency in FastAPI routes.
    """
    return Settings()
