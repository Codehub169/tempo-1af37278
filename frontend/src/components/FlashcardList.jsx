import React from 'react';
import PropTypes from 'prop-types';
import Flashcard from './Flashcard';

// FlashcardList component: Renders a list of Flashcard components.
function FlashcardList({ flashcards }) {
  // If no flashcards, return null (or a placeholder message if preferred, handled in App.jsx)
  if (!flashcards || flashcards.length === 0) {
    return null;
  }

  return (
    <div id="flashcards-container" className="grid gap-7">
      {flashcards.map((card, index) => (
        <Flashcard 
          key={index} // Using index as key for simplicity, consider stable IDs if available
          term={card.term}
          definition={card.definition}
          animationDelay={`${index * 0.12}s`} // Staggered animation delay
        />
      ))}
    </div>
  );
}

FlashcardList.propTypes = {
  flashcards: PropTypes.arrayOf(
    PropTypes.shape({
      term: PropTypes.string.isRequired,
      definition: PropTypes.string.isRequired,
    })
  ).isRequired, // Array of flashcard objects
};

export default FlashcardList;
