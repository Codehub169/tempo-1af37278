#!/bin/bash
# Exit immediately if a command exits with a non-zero status.
set -e

# Determine the API key to use
FINAL_GEMINI_API_KEY=""

if [ -n "${GEMINI_API_KEY}" ]; then
  echo "Using pre-existing GEMINI_API_KEY environment variable for setup."
  FINAL_GEMINI_API_KEY="${GEMINI_API_KEY}"
elif [ -n "${GEMINI_API_KEY_INPUT}" ]; then
  echo "Using GEMINI_API_KEY_INPUT environment variable for setup."
  FINAL_GEMINI_API_KEY="${GEMINI_API_KEY_INPUT}"
else
  echo "ERROR: Gemini API Key is missing."
  echo "This application requires a Google Gemini API key to function."
  echo "Please provide your API key using one of the following environment variables:"
  echo "  1. GEMINI_API_KEY"
  echo "  2. GEMINI_API_KEY_INPUT"
  echo ""
  echo "How to set the environment variable:"
  echo "  - When running with Docker:"
  echo "    docker run -e GEMINI_API_KEY=\"your_api_key_here\" your_image_name"
  echo "    (Replace 'your_api_key_here' with your actual key and 'your_image_name' with your Docker image name)"
  echo ""
  echo "  - When using Docker Compose (in your docker-compose.yml):"
  echo "    services:"
  echo "      your_service_name: # Replace with your service name"
  echo "        environment:"
  echo "          - GEMINI_API_KEY=your_api_key_here"
  echo "    (Replace 'your_api_key_here' with your actual key)"
  echo ""
  echo "  - When running directly in a shell before executing this script:"
  echo "    export GEMINI_API_KEY=\"your_api_key_here\""
  echo "    # Then run ./startup.sh"
  echo ""
  echo "The script will now exit. Please set the API key and try again."
  exit 1
fi

echo -e "\nStarting Flashcard Genie setup..."

# Create .env file in backend directory
# Ensure backend directory exists
mkdir -p backend
echo "GEMINI_API_KEY=${FINAL_GEMINI_API_KEY}" > backend/.env
echo ".env file created in backend directory with GEMINI_API_KEY."

# --- Backend Setup ---
echo -e "\nSetting up Python backend..."
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
if [ -f "requirements.txt" ]; then
  pip install -r requirements.txt
else
  echo "Warning: requirements.txt not found in backend directory. Skipping pip install -r."
fi

echo -e "\nBackend setup complete."
cd ..

# --- Frontend Setup ---
echo -e "\nSetting up Node.js frontend..."
# Ensure frontend directory exists
mkdir -p frontend
cd frontend

if [ -f "package.json" ]; then
  if [ -d "node_modules" ]; then
    echo "Node modules already installed. Skipping npm install."
  else
    echo "Installing frontend dependencies with npm..."
    npm install
  fi

  echo "Building frontend application..."
  npm run build # Assumes vite build, output to 'dist'
else
  echo "Warning: package.json not found in frontend directory. Skipping frontend setup."
fi

echo -e "\nFrontend setup complete."
cd ..

# --- Prepare static files for Backend serving ---
echo -e "\nPreparing static files for backend..."
STATIC_DIR="backend/app/static"
mkdir -p "${STATIC_DIR}"

# Clear out old static files, if any
if [ -n "$(ls -A ${STATIC_DIR}/ 2>/dev/null)" ]; then
  echo "Cleaning old static files from ${STATIC_DIR}..."
  rm -rf "${STATIC_DIR:?}"/*
else
  echo "Static directory '${STATIC_DIR}' is empty or does not exist yet. No cleanup needed."
fi

if [ -d "frontend/dist" ] && [ -n "$(ls -A frontend/dist/ 2>/dev/null)" ]; then
  echo "Copying built frontend (from frontend/dist) to ${STATIC_DIR}..."
  cp -r frontend/dist/* "${STATIC_DIR}/"
  echo -e "\nStatic files prepared."
elif [ -f "frontend/package.json" ]; then # Only error if frontend setup was attempted
  echo "Error: Frontend build directory 'frontend/dist' is empty or does not exist after build attempt."
  echo "Frontend build might have failed or produced no output. Please check the logs."
  exit 1
else
  echo "Skipping frontend static file copy as frontend setup was skipped (no package.json)."
fi

# --- Run Application ---
echo -e "\nStarting Flashcard Genie application..."
cd backend

# Ensure venv is active (already activated earlier in the script if running in one go)
# The source command modifies the current shell's environment, so it persists.

echo "Backend server will run on http://0.0.0.0:8000"
echo "Frontend will be served by the backend on http://localhost:8000"

# Run Uvicorn server for FastAPI
# The application will be accessible on port 8000
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
