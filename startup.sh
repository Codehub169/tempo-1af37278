#!/bin/bash
# Exit immediately if a command exits with a non-zero status.
set -e

# Check if GEMINI_API_KEY_INPUT is set, if not, prompt the user or exit
if [ -z "${GEMINI_API_KEY_INPUT}" ]; then
  echo "Error: GEMINI_API_KEY_INPUT environment variable is not set."
  echo "Please set it before running the script, e.g., export GEMINI_API_KEY_INPUT=\"your_api_key_here\""
  exit 1
fi

GEMINI_API_KEY="${GEMINI_API_KEY_INPUT}"

echo "\nStarting Flashcard Genie setup..."

# Create .env file in backend directory
echo "GEMINI_API_KEY=${GEMINI_API_KEY}" > backend/.env
echo ".env file created in backend directory with GEMINI_API_KEY."

# --- Backend Setup ---
echo "\n Setting up Python backend..."
cd backend

if [ ! -d "venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv venv
else
  echo "Python virtual environment already exists."
fi

echo "Activating virtual environment..."
# shellcheck disable=SC1091
source venv/bin/activate

echo "Installing Python dependencies from requirements.txt..."
pip install --upgrade pip
pip install -r requirements.txt

echo "\n Backend setup complete."
cd ..

# --- Frontend Setup ---
echo "\n Setting up Node.js frontend..."
cd frontend

if [ -d "node_modules" ]; then
  echo "Node modules already installed. Skipping npm install."
else
  echo "Installing frontend dependencies with npm..."
  npm install
fi

echo "Building frontend application..."
npm run build # Assumes vite build, output to 'dist'

echo "\n Frontend setup complete."
cd ..

# --- Prepare static files for Backend serving ---
echo "\n Preparing static files for backend..."
STATIC_DIR="backend/app/static"
mkdir -p "${STATIC_DIR}"

# Clear out old static files, if any
if [ -n "$(ls -A ${STATIC_DIR}/ 2>/dev/null)" ]; then
  echo "Cleaning old static files from ${STATIC_DIR}..."
  rm -rf "${STATIC_DIR:?}"/*
else
  echo "Static directory is empty or does not exist yet. No cleanup needed."
fi


echo "Copying built frontend (from frontend/dist) to ${STATIC_DIR}..."
cp -r frontend/dist/* "${STATIC_DIR}/"

echo "\n Static files prepared."

# --- Run Application ---
echo "\n Starting Flashcard Genie application..."
cd backend

# Ensure venv is active (already activated earlier in the script if running in one go)
# source venv/bin/activate # This is redundant if script runs uninterrupted

echo "Backend server will run on http://0.0.0.0:8000"
echo "Frontend will be served by the backend on http://localhost:8000"

# Run Uvicorn server for FastAPI
# The application will be accessible on port 8000
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
