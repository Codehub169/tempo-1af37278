import google.generativeai as genai
import json
import logging
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
        try:
            genai.configure(api_key=self.settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(self.settings.GEMINI_MODEL_NAME)
            logger.info(f"GeminiService initialized with model: {self.settings.GEMINI_MODEL_NAME}")
        except Exception as e:
            logger.error(f"Failed to configure Gemini API or initialize model: {e}")
            raise ValueError(f"Gemini API configuration error: {e}") from e

    def generate_flashcards(self, topic: str) -> list[dict[str, str]]:
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
            response = self.model.generate_content(
                prompt,
                generation_config=generation_config
            )

            if not response.candidates or not response.candidates[0].content.parts:
                logger.error("Gemini API returned an empty or invalid response.")
                raise ValueError("Failed to generate flashcards: Empty API response.")
            
            # Assuming the first part of the first candidate contains the text
            response_text = response.candidates[0].content.parts[0].text.strip()
            logger.debug(f"Raw Gemini response: {response_text}")

            # Attempt to parse the JSON response
            try:
                flashcards_data = json.loads(response_text)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON response from Gemini: {e}. Response: {response_text}")
                # Fallback: Try to extract JSON if it's embedded in markdown
                if response_text.startswith("```json") and response_text.endswith("```"):
                    try:
                        clean_response = response_text.removeprefix("```json\n").removesuffix("\n```").strip()
                        flashcards_data = json.loads(clean_response)
                        logger.info("Successfully parsed JSON after stripping markdown.")
                    except json.JSONDecodeError as e2:
                        logger.error(f"Fallback JSON parsing also failed: {e2}. Cleaned response: {clean_response}")
                        raise ValueError(f"Invalid flashcard data format from AI (fallback failed): {e2}. Original text: {response_text[:100]}...") from e2
                else:
                    raise ValueError(f"Invalid flashcard data format from AI: {e}. Text: {response_text[:100]}...") from e

            # Validate structure
            if not isinstance(flashcards_data, list):
                logger.error(f"Parsed data is not a list: {type(flashcards_data)}")
                raise ValueError("Generated flashcards are not in the expected list format.")

            validated_flashcards = []
            for item in flashcards_data:
                if isinstance(item, dict) and 'term' in item and 'definition' in item:
                    validated_flashcards.append({
                        'term': str(item['term']),
                        'definition': str(item['definition'])
                    })
                else:
                    logger.warning(f"Skipping invalid flashcard item: {item}")
            
            if not validated_flashcards and flashcards_data: # Original data existed but none were valid
                raise ValueError("No valid flashcards found in the AI response after validation.")
            if not validated_flashcards and not flashcards_data: # AI returned empty list or similar
                 raise ValueError("AI returned no flashcards for this topic.")

            logger.info(f"Successfully generated {len(validated_flashcards)} flashcards.")
            return validated_flashcards

        except Exception as e:
            logger.error(f"An unexpected error occurred in generate_flashcards: {e}", exc_info=True)
            # Re-raise as ValueError or a more specific custom exception if defined
            raise ValueError(f"Failed to generate flashcards due to an API or processing error: {e}") from e
