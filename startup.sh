#!/bin/bash
# Exit immediately if a command exits with a non-zero status.
set -e

# Determine the API key to use
FINAL_GEMINI_API_KEY=""
PLACEHOLDER_API_KEY="PLACEHOLDER_GEMINI_API_KEY_REPLACE_ME"

if [ -n "${GEMINI_API_KEY}" ]; then
  echo "Using pre-existing GEMINI_API_KEY environment variable for setup."
  FINAL_GEMINI_API_KEY="${GEMINI_API_KEY}"
elif [ -n "${GEMINI_API_KEY_INPUT}" ]; then
  echo "Using GEMINI_API_KEY_INPUT environment variable for setup."
  FINAL_GEMINI_API_KEY="${GEMINI_API_KEY_INPUT}"
elif [ -n "${GEMINI_API_KEY_FILE}" ]; then
  echo "GEMINI_API_KEY_FILE environment variable is set. Attempting to read API key from file: ${GEMINI_API_KEY_FILE}"
  if [ -f "${GEMINI_API_KEY_FILE}" ] && [ -r "${GEMINI_API_KEY_FILE}" ]; then
    # Read the first line and trim leading/trailing whitespace
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

# If API key is still not found, attempt interactive prompt or use placeholder for non-interactive
if [ -z "${FINAL_GEMINI_API_KEY}" ]; then
  echo "INFO: Gemini API Key not found via GEMINI_API_KEY, GEMINI_API_KEY_INPUT, or GEMINI_API_KEY_FILE (or file was invalid/empty)."
  if [ -t 0 ]; then # Check if stdin is a terminal (interactive session)
    echo "Attempting to prompt for Gemini API Key interactively."
    printf "Please enter your Google Gemini API Key: "
    read -r GEMINI_API_KEY_INTERACTIVE_INPUT
    if [ -n "${GEMINI_API_KEY_INTERACTIVE_INPUT}" ]; then
      FINAL_GEMINI_API_KEY="${GEMINI_API_KEY_INTERACTIVE_INPUT}"
      echo "Using Gemini API Key provided interactively."
    else
      echo "ERROR: No API Key was entered interactively."
      echo "The application will use a placeholder API key. Flashcard generation will NOT work."
      echo "Please provide a valid API key for full functionality."
      FINAL_GEMINI_API_KEY="${PLACEHOLDER_API_KEY}"
      # Exit if interactive and no key provided? Or let it run with placeholder?
      # For now, let it run with placeholder even if interactive prompt failed to get input.
      # To make it stricter for interactive: uncomment exit 1 and remove placeholder assignment above.
      # echo "Exiting. Please set the API key and try again."
      # exit 1 
    fi
  else
    # Not an interactive terminal, so use placeholder and print warning.
    echo "WARNING: Gemini API Key is missing and not running in an interactive terminal to prompt for it."
    echo "The application will start with a placeholder API key: '${PLACEHOLDER_API_KEY}'"
    echo "Flashcard generation will NOT work until a valid GEMINI_API_KEY is provided."
    echo "Please provide your API key using one of the following methods:"
    echo "  1. GEMINI_API_KEY (environment variable)"
    echo "  2. GEMINI_API_KEY_INPUT (environment variable)"
    echo "  3. GEMINI_API_KEY_FILE (environment variable pointing to a file containing the key)"
    FINAL_GEMINI_API_KEY="${PLACEHOLDER_API_KEY}"
    # DO NOT EXIT HERE - allow server to start with placeholder
  fi
fi

# Ensure FINAL_GEMINI_API_KEY is populated (it should be, even if it's the placeholder)
if [ -z "${FINAL_GEMINI_API_KEY}" ]; then
  echo "CRITICAL ERROR: FINAL_GEMINI_API_KEY is unexpectedly empty after all checks. This should not happen. Exiting."
  exit 1
fi

# If the key is the placeholder, issue a final prominent warning.
if [ "${FINAL_GEMINI_API_KEY}" = "${PLACEHOLDER_API_KEY}" ]; then
  echo -e "\n************************************************************************************"
  echo "WARNING: USING PLACEHOLDER GEMINI API KEY: '${PLACEHOLDER_API_KEY}'"
  echo "The application will run, but AI-powered features (flashcard generation) WILL FAIL."
  echo "Please configure a valid GEMINI_API_KEY environment variable for full functionality."
  echo "************************************************************************************\n"
fi

echo -e "\nStarting Flashcard Genie setup..."

# Create .env file in backend directory
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
mkdir -p frontend
cd frontend

if [ -f "package.json" ]; then
  if [ -d "node_modules" ] && [ -f "package-lock.json" ]; then # Check for package-lock.json for more robust check
    echo "Node modules already installed (node_modules and package-lock.json exist). Skipping npm install."
  else
    echo "Installing frontend dependencies with npm ci (clean install if package-lock.json exists) or npm install..."
    if [ -f "package-lock.json" ]; then
      npm ci
    else
      npm install
    fi
  fi

  echo "Building frontend application..."
  npm run build
else
  echo "Warning: package.json not found in frontend directory. Skipping frontend setup."
fi

echo -e "\nFrontend setup complete."
cd ..

# --- Prepare static files for Backend serving ---
echo -e "\nPreparing static files for backend..."
STATIC_DIR="backend/app/static"
mkdir -p "${STATIC_DIR}"

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

# Ensure venv is active (it should be if this script runs in a single shell session)
# If running parts of this script separately, venv might need reactivation.
if [ -z "${VIRTUAL_ENV}" ]; then
    echo "Warning: Python virtual environment not detected as active. Attempting to activate..."
    if [ -f "venv/bin/activate" ]; then
        # shellcheck disable=SC1091
        source venv/bin/activate
        echo "Virtual environment activated."
    else
        echo "Error: venv/bin/activate not found. Backend might not run correctly."
        # Consider exiting if venv is critical and not active: exit 1
    fi
fi

echo "Backend server will run on http://0.0.0.0:8000"
echo "Frontend will be served by the backend on http://localhost:8000"

# Use --reload for development, consider removing for production deployments
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
