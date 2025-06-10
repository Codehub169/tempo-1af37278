import React, { useState } from 'react';
import PropTypes from 'prop-types';

// InputForm component: Handles user input for topic/definition and form submission.
function InputForm({ onSubmit, isLoading }) {
  // State for the input text
  const [inputText, setInputText] = useState('');

  // Handles form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (inputText.trim() && !isLoading) {
      onSubmit(inputText.trim()); // Call the onSubmit prop with the trimmed input text
    }
  };

  return (
    <form onSubmit={handleSubmit} className="input-section mb-8">
      <label htmlFor="topic-input" className="block text-base font-semibold text-content-heading dark:text-dark-content-heading mb-3">
        Enter Topic or Definition:
      </label>
      <textarea
        id="topic-input"
        className="w-full min-h-[120px] p-4 font-sans text-base border border-ui-input-border dark:border-dark-ui-input-border rounded-lg resize-vertical bg-ui-background dark:bg-dark-ui-background text-content-primary dark:text-dark-content-primary placeholder-content-secondary dark:placeholder-dark-content-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-primary dark:focus:border-dark-primary transition-colors duration-200 ease-in-out shadow-sm"
        placeholder="e.g., 'The intricacies of Quantum Entanglement' or 'A philosophical movement emphasizing individual existence, freedom, and choice.'"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        disabled={isLoading} // Disable textarea when loading
        aria-label="Topic or Definition Input"
      />
      <button
        id="generate-button"
        type="submit"
        className={`flex items-center justify-center w-full mt-6 px-7 py-4 font-display text-lg font-semibold rounded-lg transition-all duration-200 ease-in-out shadow-md hover:shadow-lg active:scale-[0.98] active:shadow-sm ${isLoading ? 'bg-ui-border dark:bg-dark-ui-border cursor-not-allowed' : 'bg-primary dark:bg-dark-primary text-button-text dark:text-dark-button-text hover:bg-primary-lighter dark:hover:bg-dark-primary-lighter'}`}
        disabled={isLoading} // Disable button when loading
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 mr-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
        {isLoading ? 'Generating...' : 'Generate Flashcards'}
      </button>
    </form>
  );
}

InputForm.propTypes = {
  onSubmit: PropTypes.func.isRequired, // Function to call when form is submitted
  isLoading: PropTypes.bool.isRequired, // Boolean indicating if loading is in progress
};

export default InputForm;
