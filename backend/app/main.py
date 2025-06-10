from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse # Kept for potential future use, though not strictly needed now
import os
from dotenv import load_dotenv
from app.api import api_router # Corrected import

# Determine the path to the .env file (backend/.env)
# __file__ is backend/app/main.py
# os.path.dirname(__file__) is backend/app
# os.path.dirname(os.path.dirname(__file__)) is backend
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path=dotenv_path)

# Initialize FastAPI app
app = FastAPI(title="Flashcard Genie API")

# CORS (Cross-Origin Resource Sharing) Middleware Configuration
# Allows requests from any origin, with any method and headers.
# For production, you might want to restrict origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins - For production, restrict this
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Include API router
app.include_router(api_router, prefix="/api/v1")

# Path to the static files directory (backend/app/static)
# This directory will contain the built frontend assets (index.html, JS, CSS).
static_files_dir = os.path.join(os.path.dirname(__file__), "static")

# Mount static files: Serves files from the 'static_files_dir'.
# The `html=True` argument means it will serve `index.html` for directory paths.
# This will serve 'index.html' at '/' and also handle assets like '/assets/main.js'.
app.mount("/", StaticFiles(directory=static_files_dir, html=True), name="static-app-files")

# A simple health check endpoint for the API
@app.get("/api/health")
async def health_check():
    """Returns a success status if the API is running."""
    return {"status": "ok", "message": "Flashcard Genie API is healthy!"}

# Fallback for SPA routing is handled by StaticFiles(html=True) and is no longer needed here.
# @app.get("/{full_path:path}")
# async def serve_spa_fallback(full_path: str):
#     """Serves the main index.html for any other unhandled GET path, supporting SPA routing."""
#     return FileResponse(os.path.join(static_files_dir, "index.html"))


if __name__ == "__main__":
    # This block allows running the app directly with `python app/main.py`
    # However, `startup.sh` uses `uvicorn app.main:app` which is preferred.
    import uvicorn
    print(f"Attempting to load .env from: {dotenv_path}")
    print(f"GEMINI_API_KEY loaded: {'********' if os.getenv('GEMINI_API_KEY') else 'Not found'}")
    print(f"Serving static files from: {static_files_dir}")
    # Note: Port change here to 8000 to align with startup.sh if running directly
    uvicorn.run(app, host="0.0.0.0", port=8000)
