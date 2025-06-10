# backend/app/api/v1/endpoints/flashcards.py
"""
API Endpoints for Flashcard Generation.

This module defines the FastAPI routes related to flashcard operations,
primarily for generating flashcards based on user-provided topics or definitions.
"""

from typing import List

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.services.gemini_service import GeminiService # Assuming this will be created
from app.core.config import Settings, get_settings # Assuming this will be created

router = APIRouter()

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
        raise HTTPException(status_code=400, detail="Topic cannot be empty.")

    try:
        # Initialize GeminiService with the API key from settings
        gemini_service = GeminiService(api_key=settings.gemini_api_key)
        
        # Call the service to generate flashcards
        # The service is expected to return a list of dicts, 
        # each with 'term' and 'definition' keys.
        generated_flashcards_data = await gemini_service.generate_flashcards(request.topic)

        # Validate and structure the response using Pydantic models
        flashcards_list = [FlashcardItem(**card) for card in generated_flashcards_data]
        
        return FlashcardResponse(flashcards=flashcards_list)

    except ValueError as ve:
        # Catch specific errors from GeminiService, e.g., invalid API key, prompt issues
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        # Catch-all for other unexpected errors during generation
        # Log the error e for debugging in a real application
        print(f"Error generating flashcards: {e}") # Basic logging
        raise HTTPException(status_code=500, detail="An unexpected error occurred while generating flashcards.")

# Note: The GeminiService and Settings/get_settings are assumed to be implemented in:
# app.services.gemini_service.py and app.core.config.py respectively.
# The main FastAPI app (in main.py) will need to include this router.
