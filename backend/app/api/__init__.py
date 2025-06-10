# backend/app/api/__init__.py
"""
API router aggregator.

This module imports and makes the main API router from version 1 available
for the FastAPI application to include.
"""

from .v1 import api_router

__all__ = ["api_router"]
