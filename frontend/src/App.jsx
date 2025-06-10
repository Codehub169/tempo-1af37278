import React, { useState, useEffect } from 'react';
import InputForm from './components/InputForm';
import FlashcardList from './components/FlashcardList';
import ThemeToggle from './components/ThemeToggle';
import LoadingSpinner from './components/LoadingSpinner';
import { generateFlashcards } from './services/flashcardService'; // Assuming flashcardService.js will be created

function App() {
  const [topic, setTopic] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFlashcardsTitle, setShowFlashcardsTitle] = useState(false);

  const handleSubmit = async (inputText) => {
    if (!inputText.trim()) {
      setError('Please enter a topic or definition.');
      setFlashcards([]);
      setShowFlashcardsTitle(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    setFlashcards([]);
    setShowFlashcardsTitle(false);

    try {
      const data = await generateFlashcards(inputText);
      if (data && data.flashcards && data.flashcards.length > 0) {
        setFlashcards(data.flashcards);
        setShowFlashcardsTitle(true);
      } else {
        setFlashcards([]);
        setShowFlashcardsTitle(false);
        setError('No flashcards generated for this topic. Try rephrasing or a different subject.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setFlashcards([]);
      setShowFlashcardsTitle(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to clear error when topic changes
  useEffect(() => {
    if (topic) setError(null);
  }, [topic]);

  return (
    <div className="min-h-screen bg-ui-background text-content-primary flex flex-col items-center py-8 px-4 transition-colors duration-300 ease-in-out">
      <div className="container w-full max-w-3xl mx-auto">
        <div className="top-bar flex justify-end items-center w-full mb-6 sm:mb-4">
          <ThemeToggle />
        </div>

        <header className="text-center mb-10">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-primary dark:text-primary-dark mb-1">
            Flashcard Genie <span role="img" aria-label="genie emoji" className="inline-block transform translate-y-1 scale-110 filter drop-shadow-sm">🧞</span>
          </h1>
          <p className="text-base sm:text-lg text-content-secondary dark:text-content-secondary-dark max-w-xl mx-auto">
            Instantly transform any topic or definition into study-ready flashcards with the power of AI.
          </p>
        </header>

        <main className="main-content bg-ui-card dark:bg-ui-card-dark p-6 sm:p-10 rounded-lg shadow-lg w-full transition-colors duration-300 ease-in-out">
          <InputForm onSubmit={handleSubmit} setTopic={setTopic} isLoading={isLoading} />
          
          {error && (
            <div className="mt-6 p-4 text-sm text-red-700 bg-red-100 border border-red-400 rounded-md dark:bg-red-900 dark:text-red-300 dark:border-red-600">
              <p>{error}</p>
            </div>
          )}

          {isLoading && <LoadingSpinner />} 

          {!isLoading && !error && showFlashcardsTitle && (
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-content-heading dark:text-content-heading-dark mt-8 mb-6 pb-3 border-b-2 border-ui-border dark:border-ui-border-dark flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7 mr-3 text-accent dark:text-accent-dark">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Your Generated Wisdom
            </h2>
          )}

          {!isLoading && flashcards.length > 0 && (
            <FlashcardList flashcards={flashcards} />
          )}

          {!isLoading && !error && flashcards.length === 0 && !showFlashcardsTitle && (
             <p className="text-center p-10 text-content-secondary dark:text-content-secondary-dark italic bg-ui-background dark:bg-ui-background-dark border border-dashed border-ui-border dark:border-ui-border-dark rounded-md mt-8 transition-colors duration-300 ease-in-out">
              The Genie awaits your command! Enter a topic above and let the magic begin.
            </p>
          )}
        </main>

        <footer className="text-center mt-16 mb-8">
          <p className="text-sm text-content-secondary dark:text-content-secondary-dark">
            &copy; {new Date().getFullYear()} Flashcard Genie. AI-powered learning.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
