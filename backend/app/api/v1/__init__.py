# backend/app/api/v1/__init__.py
"""
Version 1 API router.

This module defines the main router for API version 1 and includes
all specific endpoint routers, such as the one for flashcards.
"""

from fastapi import APIRouter

from .endpoints import flashcards

api_router = APIRouter()

api_router.include_router(flashcards.router, prefix="/flashcards", tags=["Flashcards"])
