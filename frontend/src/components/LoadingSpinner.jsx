import React from 'react';

/**
 * LoadingSpinner component
 * Displays a spinning animation and a loading message.
 * Matches the styling of the provided HTML preview.
 */
const LoadingSpinner = ({ message = 'Summoning knowledge from the digital ether...' }) => {
  return (
    <div className="flex flex-col items-center justify-center my-10 text-center" role="status" aria-live="polite">
      {/* The .spinner class is defined in src/index.css and uses theme colors */}
      <div className="spinner w-12 h-12 mb-4"></div> 
      <p className="text-lg font-medium text-content-secondary dark:text-dark-content-secondary">
        {message}
      </p>
    </div>
  );
};

export default LoadingSpinner;
