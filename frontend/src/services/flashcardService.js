/**
 * Generates flashcards by making a POST request to the backend API.
 * @param {string} topic The topic or definition to generate flashcards for.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of flashcard objects 
 * (e.g., [{ term: "Term1", definition: "Definition1" }]).
 * @throws {Error} If the API request fails, returns an error, or the topic is empty.
 */
export const generateFlashcards = async (topic) => {
  if (!topic || topic.trim() === '') {
    // This case should ideally be caught by form validation in UI, but good to have defense here.
    return Promise.reject(new Error('Topic cannot be empty. Please enter a topic or definition.'));
  }

  try {
    // The Vite dev server proxies /api to the backend (e.g., http://localhost:8000)
    // In production, this will be a relative path to the same origin if frontend is served by backend.
    const response = await fetch('/api/v1/flashcards/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // Good practice to specify what client accepts
      },
      body: JSON.stringify({ topic: topic.trim() }), // Backend expects { "topic": "..." }
    });

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        // Try to parse a more specific error message from the backend (FastAPI often uses 'detail')
        const errorData = await response.json();
        if (errorData && errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        } else if (errorData && errorData.message) { // Fallback for other error structures
            errorMessage = errorData.message;
        }
      } catch (e) {
        // If parsing error details fails, stick with the HTTP status text
        console.warn('Could not parse error response body:', e);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    // Backend is expected to return { flashcards: [{term: ..., definition: ...}, ...] }
    if (data && Array.isArray(data.flashcards)) {
      return data.flashcards;
    } else {
      // This would indicate an unexpected response format from the backend
      console.error('Unexpected response format from API:', data);
      throw new Error('Received an unexpected response format from the server.');
    }

  } catch (error) {
    console.error('Failed to generate flashcards:', error);
    // Re-throw the error so it can be caught and handled by the calling UI component (e.g., App.jsx)
    // This ensures the UI can display a user-friendly error message.
    if (error instanceof Error) {
        throw error; 
    }
    // Fallback for non-Error objects thrown
    throw new Error('An unexpected error occurred while communicating with the server.');
  }
};
