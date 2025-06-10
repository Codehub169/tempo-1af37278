import React, { createContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types'; // Best practice: include PropTypes

// Create the context
// Provide a default value matching the shape of the context data for better autocompletion and testing.
export const ThemeContext = createContext({
  theme: 'light', // Default initial theme
  setTheme: () => console.warn('ThemeProvider not found or setTheme called outside of context'),
});

// Define the provider component
export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    let initialTheme = 'light'; // Default theme

    // Ensure running in a browser environment before accessing window or localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedTheme = localStorage.getItem('flashcardGenieTheme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
          initialTheme = savedTheme;
        } else {
          // No valid theme in localStorage or not set, check system preference
          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            initialTheme = 'dark';
          }
        }
      } catch (error) {
        console.warn('Could not access localStorage to get saved theme. Falling back to system/default.', error);
        // Fallback to system preference if localStorage access failed, then to default 'light'
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          initialTheme = 'dark';
        }
      }
    }
    return initialTheme;
  });

  // Function to apply the theme to the DOM and persist in localStorage
  // This function only performs side effects and does not alter React state directly.
  const applyThemeToDOMAndStorage = useCallback((currentTheme) => {
    if (typeof window !== 'undefined' && window.document) {
      const root = window.document.documentElement;
      
      // For Tailwind CSS dark mode (darkMode: 'class')
      if (currentTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      // The data-theme attribute is redundant if Tailwind's 'dark' class is the primary mechanism for styling.
      // root.setAttribute('data-theme', currentTheme); // Kept commented as per original, it's not needed for Tailwind 'class' mode.
      
      try {
        localStorage.setItem('flashcardGenieTheme', currentTheme);
      } catch (error) {
        console.warn('Could not save theme to localStorage.', error);
      }
    }
  }, []); // Empty dependency array: this function is stable and doesn't depend on component's scope variables (besides window/document)

  // Effect to apply the theme to DOM/localStorage when the 'theme' state changes or on initial load
  useEffect(() => {
    applyThemeToDOMAndStorage(theme);
  }, [theme, applyThemeToDOMAndStorage]); // Re-run when theme state changes or if applyThemeToDOMAndStorage were to change (it's stable)

  // Function to set a specific theme, exposed to consumers via context
  // This function is responsible for updating the React state.
  const setTheme = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setThemeState(newTheme); // Update state, which triggers the useEffect to apply side effects
    } else {
      console.warn(`Invalid theme specified: ${newTheme}. Theme not changed.`);
      // Optionally, one could implement toggle logic here if newTheme is not 'light' or 'dark',
      // but current ThemeToggle component calls with explicit 'light' or 'dark'.
      // Example: setThemeState(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
