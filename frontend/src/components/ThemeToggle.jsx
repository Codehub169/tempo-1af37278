import React from 'react';
import { useTheme } from '../hooks/useTheme'; 

// ThemeToggle component: Allows users to switch between light and dark themes.
function ThemeToggle() {
  const { theme, setTheme } = useTheme(); // Get current theme and setter from context

  // SVG icon for light mode (Sun)
  const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true" focusable="false">
      {/* Simplified and more common sun icon path for better visual consistency */}
      <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zM12 19c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm0-12.5c-.83 0-1.5.67-1.5 1.5v2c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-2c0-.83-.67-1.5-1.5-1.5zm0 9c-.83 0-1.5.67-1.5 1.5v2c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-2c0-.83-.67-1.5-1.5-1.5zm-6.07-5.07l-1.42-1.42c-.4-.4-1.02-.4-1.41 0-.4.4-.4 1.02 0 1.41l1.42 1.42c.2.2.45.29.71.29s.51-.1.71-.29c.39-.39.39-1.02-.01-1.41zm10.75 3.65l1.42-1.42c.4-.4.4-1.02 0-1.41-.4-.4-1.02-.4-1.41 0l-1.42 1.42c-.4.4-.4 1.02 0 1.41.2.2.45.29.71.29s.51-.1.71-.29zm-12.16 1.42l-1.42 1.42c-.4.4-.4 1.02 0 1.41.2.2.45.29.71.29s.51-.1.71-.29l1.42-1.42c.4-.4.4-1.02 0-1.41-.39-.39-1.03-.39-1.42 0zm12.16 0l1.42 1.42c.4.4.4 1.02 0 1.41-.2.2-.45.29.71.29s-.51-.1-.71-.29l-1.42-1.42c-.4-.4-.4-1.02 0-1.41.4-.4 1.02-.4 1.41 0zM4.5 10.5H2c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h2.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5zm15 0h-2.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5H20c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/>
    </svg>
  );

  // SVG icon for dark mode (Moon)
  const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true" focusable="false">
      <path d="M12.01.02c-1.28 0-2.5.21-3.64.61.4.39.76.83 1.07 1.3.3.47.53.98.68 1.52.15.54.22 1.1.22 1.67s-.07 1.13-.22 1.67c-.15.54-.38 1.05-.68 1.52s-.67.91-1.07 1.3c-.41.38-.86.72-1.34 1.01A9.922 9.922 0 0012.01 22c5.52 0 10-4.48 10-10S17.53.02 12.01.02z"/>
    </svg>
  );

  return (
    <div className="theme-switcher flex items-center bg-ui-card dark:bg-ui-card-dark p-1 rounded-lg shadow-sm border border-ui-border dark:border-ui-border-dark">
      <button 
        id="light-theme-button"
        title="Switch to Light Mode"
        onClick={() => setTheme('light')}
        className={`p-2 rounded-md transition-colors duration-200 ease-in-out ${theme === 'light' ? 'bg-primary text-button-text dark:bg-primary-dark dark:text-button-text-dark' : 'text-content-secondary dark:text-content-secondary-dark hover:bg-ui-background dark:hover:bg-ui-background-dark'}`}
        aria-pressed={theme === 'light'}
        aria-label="Switch to Light Theme"
      >
        <SunIcon />
      </button>
      <button 
        id="dark-theme-button"
        title="Switch to Dark Mode"
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-md transition-colors duration-200 ease-in-out ${theme === 'dark' ? 'bg-primary text-button-text dark:bg-primary-dark dark:text-button-text-dark' : 'text-content-secondary dark:text-content-secondary-dark hover:bg-ui-background dark:hover:bg-ui-background-dark'}`}
        aria-pressed={theme === 'dark'}
        aria-label="Switch to Dark Theme"
      >
        <MoonIcon />
      </button>
    </div>
  );
}

export default ThemeToggle;
