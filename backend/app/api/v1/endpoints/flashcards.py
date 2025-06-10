# backend/app/api/v1/endpoints/flashcards.py
"""
API Endpoints for Flashcard Generation.

This module defines the FastAPI routes related to flashcard operations,
primarily for generating flashcards based on user-provided topics or definitions.
"""

import logging # Added for consistent logging
from typing import List

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.services.gemini_service import GeminiService
from app.core.config import Settings, get_settings

router = APIRouter()
logger = logging.getLogger(__name__) # Added logger instance

class FlashcardItem(BaseModel):
    """Pydantic model for a single flashcard item."""
    term: str
    definition: str

class FlashcardRequest(BaseModel):
    """Pydantic model for the flashcard generation request."""
    topic: str

class FlashcardResponse(BaseModel):
    """Pydantic model for the flashcard generation response."""
    flashcards: List[FlashcardItem]

@router.post("/generate", response_model=FlashcardResponse)
async def generate_flashcards_endpoint(
    request: FlashcardRequest,
    settings: Settings = Depends(get_settings) # Dependency injection for settings
):
    """
    Generate flashcards based on the provided topic/definition.

    The user submits a topic or a piece of text, and this endpoint uses the GeminiService
    to generate a list of term/definition pairs as flashcards.
    """
    if not request.topic or not request.topic.strip():
        logger.warning("Flashcard generation request with empty topic.")
        raise HTTPException(status_code=400, detail="Topic cannot be empty.")

    try:
        # Initialize GeminiService with the settings object
        gemini_service = GeminiService(settings=settings) # Corrected instantiation
        
        # Call the service to generate flashcards
        # The service is expected to return a list of dicts, 
        # each with 'term' and 'definition' keys.
        generated_flashcards_data = await gemini_service.generate_flashcards(request.topic)

        # Validate and structure the response using Pydantic models
        flashcards_list = [FlashcardItem(**card) for card in generated_flashcards_data]
        
        return FlashcardResponse(flashcards=flashcards_list)

    except ValueError as ve:
        # Catch specific errors from GeminiService, e.g., invalid API key, prompt issues, parsing errors
        logger.error(f"ValueError in flashcard generation for topic '{request.topic[:50]}...': {ve}") # Consistent logging
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        # Catch-all for other unexpected errors during generation
        logger.exception(f"Unexpected error generating flashcards for topic '{request.topic[:50]}...'") # Consistent logging with stack trace
        raise HTTPException(status_code=500, detail="An unexpected error occurred while generating flashcards.")

# Note: The GeminiService and Settings/get_settings are implemented in:
# app.services.gemini_service.py and app.core.config.py respectively.
# The main FastAPI app (in main.py) will include this router.
