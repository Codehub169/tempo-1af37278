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
elif [ -n "${GEMINI_API_KEY_FILE}" ]; then
  echo "GEMINI_API_KEY_FILE environment variable is set. Attempting to read API key from file: ${GEMINI_API_KEY_FILE}"
  if [ -f "${GEMINI_API_KEY_FILE}" ] && [ -r "${GEMINI_API_KEY_FILE}" ]; then
    # Read the first line from the file and remove leading/trailing whitespace
    GEMINI_API_KEY_FROM_FILE=$(head -n 1 "${GEMINI_API_KEY_FILE}" | xargs)
    if [ -n "${GEMINI_API_KEY_FROM_FILE}" ]; then
      FINAL_GEMINI_API_KEY="${GEMINI_API_KEY_FROM_FILE}"
      echo "Successfully read Gemini API Key from file: ${GEMINI_API_KEY_FILE}"
    else
      echo "Warning: GEMINI_API_KEY_FILE (${GEMINI_API_KEY_FILE}) is empty or contains only whitespace. API key not loaded from file."
    fi
  else
    echo "Warning: GEMINI_API_KEY_FILE (${GEMINI_API_KEY_FILE}) not found or not readable. API key not loaded from file."
  fi
fi

# If API key is still not found, attempt interactive prompt or show error
if [ -z "${FINAL_GEMINI_API_KEY}" ]; then
  echo "INFO: Gemini API Key not found via GEMINI_API_KEY, GEMINI_API_KEY_INPUT, or GEMINI_API_KEY_FILE (or file was invalid/empty)."
  # Check if stdin is a terminal (interactive session)
  if [ -t 0 ]; then
    echo "Attempting to prompt for Gemini API Key interactively."
    printf "Please enter your Google Gemini API Key: "
    read -r GEMINI_API_KEY_INTERACTIVE_INPUT
    if [ -n "${GEMINI_API_KEY_INTERACTIVE_INPUT}" ]; then
      FINAL_GEMINI_API_KEY="${GEMINI_API_KEY_INTERACTIVE_INPUT}"
      echo "Using Gemini API Key provided interactively."
    else
      echo "ERROR: No API Key was entered interactively."
      echo "This application requires a Google Gemini API key to function."
      echo "Please provide your API key using one of the following methods:"
      echo "  1. GEMINI_API_KEY (environment variable)"
      echo "  2. GEMINI_API_KEY_INPUT (environment variable)"
      echo "  3. GEMINI_API_KEY_FILE (environment variable pointing to a file containing the key)"
      echo ""
      echo "How to set environment variables:"
      echo "  - When running with Docker:"
      echo "    docker run -e GEMINI_API_KEY=\"your_api_key_here\" your_image_name"
      echo "    docker run -e GEMINI_API_KEY_FILE=\"/path/to/keyfile_in_container\" -v /local/path/to/keyfile:/path/to/keyfile_in_container your_image_name"
      echo "    (Replace 'your_api_key_here' with your actual key and 'your_image_name' with your Docker image name)"
      echo ""
      echo "  - When using Docker Compose (in your docker-compose.yml):"
      echo "    services:"
      echo "      your_service_name: # Replace with your service name"
      echo "        environment:"
      echo "          - GEMINI_API_KEY=your_api_key_here"
      echo "        # Or for file-based key (mount the key file into the container):"
      echo "        #  - GEMINI_API_KEY_FILE=/path/to/keyfile_in_container"
      echo "        # volumes:"
      echo "        #  - /local/path/to/keyfile:/path/to/keyfile_in_container:ro"
      echo "    (Replace 'your_api_key_here' with your actual key)"
      echo ""
      echo "  - When running directly in a shell before executing this script:"
      echo "    export GEMINI_API_KEY=\"your_api_key_here\""
      echo "    # Then run ./startup.sh"
      echo ""
      echo "The script will now exit. Please set the API key and try again."
      exit 1
    fi
  else
    # Not an interactive terminal, so print the original error and exit.
    echo "ERROR: Gemini API Key is missing and not running in an interactive terminal to prompt for it."
    echo "This application requires a Google Gemini API key to function."
    echo "Please provide your API key using one of the following methods:"
    echo "  1. GEMINI_API_KEY (environment variable)"
    echo "  2. GEMINI_API_KEY_INPUT (environment variable)"
    echo "  3. GEMINI_API_KEY_FILE (environment variable pointing to a file containing the key)"
    echo ""
    echo "How to set environment variables:"
    echo "  - When running with Docker:"
    echo "    docker run -e GEMINI_API_KEY=\"your_api_key_here\" your_image_name"
    echo "    docker run -e GEMINI_API_KEY_FILE=\"/path/to/keyfile_in_container\" -v /local/path/to/keyfile:/path/to/keyfile_in_container your_image_name"
      echo "    (Replace 'your_api_key_here' with your actual key and 'your_image_name' with your Docker image name)"
    echo ""
    echo "  - When using Docker Compose (in your docker-compose.yml):"
    echo "    services:"
    echo "      your_service_name: # Replace with your service name"
    echo "        environment:"
    echo "          - GEMINI_API_KEY=your_api_key_here"
    echo "        # Or for file-based key (mount the key file into the container):"
    echo "        #  - GEMINI_API_KEY_FILE=/path/to/keyfile_in_container"
    echo "        # volumes:"
    echo "        #  - /local/path/to/keyfile:/path/to/keyfile_in_container:ro"
    echo "    (Replace 'your_api_key_here' with your actual key)"
    echo ""
    echo "  - When running directly in a shell before executing this script:"
    echo "    export GEMINI_API_KEY=\"your_api_key_here\""
    echo "    # Then run ./startup.sh"
    echo ""
    echo "The script will now exit. Please set the API key and try again."
    exit 1
  fi
fi

# Ensure FINAL_GEMINI_API_KEY is populated if we haven't exited
if [ -z "${FINAL_GEMINI_API_KEY}" ]; then
  echo "CRITICAL ERROR: FINAL_GEMINI_API_KEY is unexpectedly empty after all checks. Exiting."
  echo "Please ensure an API key is provided via environment variables (GEMINI_API_KEY, GEMINI_API_KEY_INPUT, GEMINI_API_KEY_FILE) or interactively if prompted."
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
# The check ensures the directory exists and is not empty before attempting to remove its contents.
if [ -d "${STATIC_DIR}" ] && [ -n "$(ls -A "${STATIC_DIR}/" 2>/dev/null)" ]; then
  echo "Cleaning old static files from ${STATIC_DIR}..."
  rm -rf "${STATIC_DIR:?}"/*
else
  echo "Static directory '${STATIC_DIR}' is empty or newly created. No cleanup needed."
fi

if [ -d "frontend/dist" ] && [ -n "$(ls -A frontend/dist/ 2>/dev/null)" ]; then
  echo "Copying built frontend (from frontend/dist) to ${STATIC_DIR}..."
  cp -r frontend/dist/* "${STATIC_DIR}/"
  echo -e "\nStatic files prepared."
elif [ -f "frontend/package.json" ]; then # Only error if frontend setup was attempted (package.json exists)
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
# Using exec to replace the shell process with uvicorn, making uvicorn the main process (PID 1 in Docker if this script is entrypoint)
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
