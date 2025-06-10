import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

/**
 * Custom hook to access the theme context.
 * Provides `theme` (current theme string: 'light' or 'dark') 
 * and `setTheme` (function to change theme: setTheme('light') or setTheme('dark')).
 * @returns {{theme: string, setTheme: Function}}
 * @throws {Error} If used outside of a ThemeProvider.
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
