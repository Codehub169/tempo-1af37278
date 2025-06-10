import React from 'react';
import PropTypes from 'prop-types';

/**
 * LoadingSpinner component
 * Displays a spinning animation and a loading message.
 */
const LoadingSpinner = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center my-10 text-center" role="status" aria-live="polite">
      {/* The .spinner class is defined in src/index.css and provides base animation & border colors. Tailwind classes below adjust size. */}
      <div className="spinner w-12 h-12 mb-4" aria-hidden="true"></div> 
      <p className="text-lg font-medium text-content-secondary dark:text-content-secondary-dark">
        {message}
      </p>
    </div>
  );
};

LoadingSpinner.propTypes = {
  message: PropTypes.string,
};

LoadingSpinner.defaultProps = {
  message: 'Summoning knowledge from the digital ether...',
};

export default LoadingSpinner;
