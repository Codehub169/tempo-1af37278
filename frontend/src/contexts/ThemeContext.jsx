import React, { createContext, useState, useEffect, useCallback } from 'react';

// Create the context
export const ThemeContext = createContext();

// Define the provider component
export const ThemeProvider = ({ children }) => {
  // Initialize state from localStorage or system preference, defaulting to 'light'
  const [theme, setThemeState] = useState(() => {
    const savedTheme = localStorage.getItem('flashcardGenieTheme');
    if (savedTheme) {
      return savedTheme;
    }
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  // Function to apply the theme to the document
  const applyTheme = useCallback((newTheme) => {
    const root = window.document.documentElement;
    
    // For Tailwind CSS dark mode (darkMode: 'class')
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // For custom CSS variables via data-theme attribute (as in HTML preview)
    root.setAttribute('data-theme', newTheme);
    
    localStorage.setItem('flashcardGenieTheme', newTheme);
    setThemeState(newTheme);
  }, []);

  // Effect to apply the theme when it changes or on initial load
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Function to toggle theme or set a specific theme, exposed to consumers
  const setTheme = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      // Directly call applyTheme which also updates state
      // This ensures that if a component calls setTheme(currentTheme), it still reapplies correctly.
      applyTheme(newTheme); 
    } else {
      // Toggle logic if no specific theme is provided, or handle as an error
      // For this project, ThemeToggle explicitly calls setTheme('light') or setTheme('dark')
      console.warn(`Invalid theme: ${newTheme}. Defaulting to light/dark toggle or current state.`);
      // applyTheme(theme === 'light' ? 'dark' : 'light'); // Optional: implement toggle if needed
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
