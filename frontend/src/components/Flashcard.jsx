import React from 'react';
import PropTypes from 'prop-types';

// Flashcard component: Displays a single flashcard with term and definition.
function Flashcard({ term, definition, animationDelay }) {
  return (
    <div 
      className="flashcard bg-ui-background dark:bg-dark-ui-background border border-ui-border dark:border-dark-ui-border border-l-4 border-l-accent dark:border-l-dark-accent rounded-lg p-6 shadow-md flashcard-enter"
      style={{ animationDelay }} // Apply animation delay for staggered effect
    >
      <div className="mb-1">
        <span className="text-xs font-bold text-primary dark:text-dark-primary uppercase tracking-wider">
          Term
        </span>
      </div>
      <h3 className="font-display text-xl font-semibold text-content-heading dark:text-dark-content-heading mb-4 pb-4 border-b border-dashed border-ui-border dark:border-dark-ui-border">
        {term}
      </h3>
      <div className="mb-1">
        <span className="text-xs font-bold text-primary dark:text-dark-primary uppercase tracking-wider">
          Definition
        </span>
      </div>
      {/* Use dangerouslySetInnerHTML if definition might contain simple HTML (e.g., <b>, <i>) from Gemini. Otherwise, use {definition} directly. */}
      {/* For security, ensure that any HTML content from Gemini is sanitized or trusted. */}
      <p 
        className="text-base text-content-primary dark:text-dark-content-primary leading-relaxed"
        dangerouslySetInnerHTML={{ __html: definition }} 
      />
    </div>
  );
}

Flashcard.propTypes = {
  term: PropTypes.string.isRequired, // The term for the flashcard
  definition: PropTypes.string.isRequired, // The definition for the flashcard
  animationDelay: PropTypes.string, // Optional animation delay for staggered loading effect
};

Flashcard.defaultProps = {
  animationDelay: '0s',
};

export default Flashcard;
