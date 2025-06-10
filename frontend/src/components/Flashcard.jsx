import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Flashcard component: Displays a single flashcard with term and definition.
function Flashcard({ term, definition, animationDelay }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // This timeout ensures that the component is first rendered with initial styles (flashcard-enter),
    // and then the 'flashcard-enter-active' class is applied to trigger the CSS transition.
    // The transitionDelay style property will respect the staggered animationDelay prop.
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50); // A small delay like 50ms is usually enough for the browser to register initial styles.

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []); // Run this effect only once on mount

  return (
    <div 
      className={`flashcard bg-ui-background dark:bg-ui-background-dark border border-ui-border dark:border-ui-border-dark border-l-4 border-l-accent dark:border-l-accent-dark rounded-lg p-6 shadow-md ${isVisible ? 'flashcard-enter-active' : 'flashcard-enter'}`}
      style={{ transitionDelay: animationDelay }} // Use transitionDelay for CSS transitions defined in index.css
    >
      <div className="mb-1">
        <span className="text-xs font-bold text-primary dark:text-primary-dark uppercase tracking-wider">
          Term
        </span>
      </div>
      <h3 className="font-display text-xl font-semibold text-content-heading dark:text-content-heading-dark mb-4 pb-4 border-b border-dashed border-ui-border dark:border-ui-border-dark">
        {term}
      </h3>
      <div className="mb-1">
        <span className="text-xs font-bold text-primary dark:text-primary-dark uppercase tracking-wider">
          Definition
        </span>
      </div>
      {/* 
        Regarding dangerouslySetInnerHTML:
        The backend's Gemini service prompt aims for plain JSON strings for 'term' and 'definition'.
        If Gemini strictly adheres and returns plain text, using {definition} directly would be safer to prevent XSS.
        However, this component uses dangerouslySetInnerHTML, implying an expectation or allowance for simple HTML 
        (e.g., <b>, <i>) in the definition, as noted in the original comment.
        Crucially, the backend does not sanitize HTML within the strings from Gemini.
        If Gemini were to inject malicious HTML, it would be rendered.
        This remains a potential low-risk vulnerability if Gemini deviates from plain string output.
        Keeping as is, per original intent, but noting the security consideration.
      */}
      <p 
        className="text-base text-content-primary dark:text-content-primary-dark leading-relaxed break-words"
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
