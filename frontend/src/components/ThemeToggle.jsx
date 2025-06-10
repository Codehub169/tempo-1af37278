import React from 'react';
import { useTheme } from '../hooks/useTheme'; // Assuming useTheme hook is in this path

// ThemeToggle component: Allows users to switch between light and dark themes.
function ThemeToggle() {
  const { theme, setTheme } = useTheme(); // Get current theme and setter from context

  // SVG icon for light mode (Sun)
  const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM12 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-10C6.48 5 2 9.48 2 15s4.48 10 10 10 10-4.48 10-10S17.52 5 12 5zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    </svg>
  );

  // SVG icon for dark mode (Moon)
  const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M10 2c-1.82 0-3.53.5-5 1.35C7.99 5.08 10 8.3 10 12s-2.01 6.92-5 8.65C6.47 21.5 8.18 22 10 22c5.52 0 10-4.48 10-10S15.52 2 10 2z"/>
    </svg>
  );

  return (
    <div className="theme-switcher flex items-center bg-ui-card dark:bg-dark-ui-card p-2 rounded-lg shadow-sm border border-ui-border dark:border-dark-ui-border">
      <button 
        id="light-theme-button"
        title="Switch to Light Mode"
        onClick={() => setTheme('light')}
        className={`p-2 rounded-md transition-colors duration-200 ease-in-out  ${theme === 'light' ? 'bg-primary text-button-text dark:bg-dark-primary dark:text-dark-button-text' : 'text-content-secondary dark:text-dark-content-secondary hover:bg-ui-background dark:hover:bg-dark-ui-background'}`}
        aria-pressed={theme === 'light'}
      >
        <SunIcon />
      </button>
      <button 
        id="dark-theme-button"
        title="Switch to Dark Mode"
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-md transition-colors duration-200 ease-in-out ${theme === 'dark' ? 'bg-primary text-button-text dark:bg-dark-primary dark:text-dark-button-text' : 'text-content-secondary dark:text-dark-content-secondary hover:bg-ui-background dark:hover:bg-dark-ui-background'}`}
        aria-pressed={theme === 'dark'}
      >
        <MoonIcon />
      </button>
    </div>
  );
}

export default ThemeToggle;
