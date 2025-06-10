import google.generativeai as genai
import json
import logging
import re # For more robust markdown stripping
from app.core.config import Settings

logger = logging.getLogger(__name__)

class GeminiService:
    """Service for interacting with the Gemini API to generate flashcards."""

    def __init__(self, settings: Settings):
        """
        Initializes the GeminiService with API key and model name from settings.
        Args:
            settings: The application settings object.
        """
        self.settings = settings
        if not self.settings.GEMINI_API_KEY:
            logger.error("GEMINI_API_KEY is not configured.")
            raise ValueError("GEMINI_API_KEY must be set for GeminiService initialization.")
        try:
            genai.configure(api_key=self.settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(self.settings.GEMINI_MODEL_NAME)
            logger.info(f"GeminiService initialized with model: {self.settings.GEMINI_MODEL_NAME}")
        except Exception as e:
            logger.error(f"Failed to configure Gemini API or initialize model: {e}", exc_info=True)
            raise ValueError(f"Gemini API configuration error: {e}") from e

    async def generate_flashcards(self, topic: str) -> list[dict[str, str]]: # Changed to async def
        """
        Generates flashcards for a given topic using the Gemini API.

        Args:
            topic: The topic or definition to generate flashcards for.

        Returns:
            A list of dictionaries, where each dictionary has 'term' and 'definition' keys.

        Raises:
            ValueError: If the topic is empty, API response is invalid, or parsing fails.
        """
        if not topic or not topic.strip():
            logger.warning("Attempted to generate flashcards with an empty topic.")
            raise ValueError("Topic cannot be empty.")

        prompt = (
            f"Generate 5-7 flashcards for the following topic or definition: '{topic}'.\n"
            f"Each flashcard must have a 'term' and a 'definition'.\n"
            f"The term should be a concise key concept, and the definition should explain it clearly.\n"
            f"Return the flashcards as a valid JSON array of objects, where each object has exactly two keys: 'term' (string) and 'definition' (string).\n"
            f"Example format:\n"
            f"[\n"
            f"  {{\"term\": \"Example Term 1\", \"definition\": \"This is the definition for example term 1.\"}},\n"
            f"  {{\"term\": \"Example Term 2\", \"definition\": \"This is the definition for example term 2.\"}}\n"
            f"]\n"
            f"Ensure the output is ONLY the JSON array and nothing else. Do not include any introductory text, explanations, or markdown formatting like ```json ... ``` around the JSON itself."
        )

        try:
            logger.info(f"Generating flashcards for topic: {topic[:50]}...")
            # Configuration for generation to encourage JSON output
            generation_config = genai.types.GenerationConfig(
                # response_mime_type="application/json", # Use if model/API version supports it directly
                candidate_count=1,
                temperature=0.7 # Adjust for creativity vs. predictability
            )
            # Use generate_content_async for non-blocking call
            response = await self.model.generate_content_async(
                prompt,
                generation_config=generation_config
            )

            if not response.candidates or not response.candidates[0].content.parts:
                logger.error("Gemini API returned an empty or invalid response structure.")
                raise ValueError("Failed to generate flashcards: AI returned an empty or invalid response structure.")
            
            response_text = response.candidates[0].content.parts[0].text.strip()
            logger.debug(f"Raw Gemini response: {response_text}")

            # Attempt to parse the JSON response
            try:
                # Try to strip markdown if present
                # Handles ```json ... ``` or ``` ... ```
                match = re.search(r"```(?:json)?\s*([\[\{].*[\]\}])\s*```", response_text, re.DOTALL | re.IGNORECASE)
                if match:
                    json_text_content = match.group(1).strip()
                    logger.info("Extracted JSON content from markdown block.")
                else:
                    json_text_content = response_text
                
                flashcards_data = json.loads(json_text_content)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON response from Gemini: {e}. Response: {response_text[:200]}...", exc_info=True)
                raise ValueError(f"Invalid flashcard data format from AI. Please try rephrasing your topic. Error: {e}") from e

            # Validate structure
            if not isinstance(flashcards_data, list):
                logger.error(f"Parsed data is not a list: {type(flashcards_data)}. Data: {str(flashcards_data)[:200]}...")
                raise ValueError("Generated flashcards are not in the expected list format.")

            validated_flashcards = []
            for item in flashcards_data:
                if isinstance(item, dict) and 'term' in item and 'definition' in item and isinstance(item['term'], str) and isinstance(item['definition'], str):
                    validated_flashcards.append({
                        'term': item['term'],
                        'definition': item['definition']
                    })
                else:
                    logger.warning(f"Skipping invalid flashcard item (missing keys, wrong types, or not a dict): {str(item)[:100]}...")
            
            if not validated_flashcards:
                if flashcards_data: # Original data existed (e.g. list of invalid items)
                    logger.warning("AI response parsed but contained no valid flashcard items.")
                    raise ValueError("The AI generated data, but it couldn't be formed into valid flashcards. Please try a different topic or rephrase.")
                else: # AI returned an empty list or structure that led to empty flashcards_data
                    logger.warning("AI returned no flashcards for this topic or an empty structure.")
                    raise ValueError("The AI didn't return any flashcards for this topic. Please try again or rephrase.")

            logger.info(f"Successfully generated {len(validated_flashcards)} flashcards for topic: {topic[:50]}...")
            return validated_flashcards

        except ValueError: # Re-raise ValueErrors to be handled by the endpoint
            raise
        except Exception as e:
            logger.error(f"An unexpected error occurred in generate_flashcards for topic '{topic[:50]}...': {e}", exc_info=True)
            raise ValueError(f"Failed to generate flashcards due to an unexpected API or processing error. Please try again later.") from e
