/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable dark mode using a class (e.g., <html class="dark">)
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5', // Indigo (Light Theme)
          alt: '#6366F1',     // Lighter Indigo for hover/secondary (Light Theme)
          dark: '#818CF8',    // Indigo-400 (Dark Theme Primary)
          'alt-dark': '#6366F1' // Indigo-500 (Dark Theme Primary Alt)
        },
        accent: {
          DEFAULT: '#10B981', // Emerald (Light Theme)
          dark: '#34D399'     // Emerald-400 (Dark Theme)
        },
        ui: {
          background:   { DEFAULT: '#F9FAFB', dark: '#1F2937' }, // Page background (Gray-50 Light, Gray-800 Dark)
          card:         { DEFAULT: '#FFFFFF', dark: '#374151' }, // Card background (White Light, Gray-700 Dark)
          border:       { DEFAULT: '#E5E7EB', dark: '#4B5563' }, // Default border (Gray-200 Light, Gray-600 Dark)
          'input-border':{ DEFAULT: '#D1D5DB', dark: '#4B5563' }  // Input field border (Gray-300 Light, Gray-600 Dark)
        },
        content: { // Text colors
          heading:      { DEFAULT: '#111827', dark: '#F9FAFB' }, // For H1, H2 etc. (Gray-900 Light, Gray-50 Dark)
          primary:      { DEFAULT: '#1F2937', dark: '#E5E7EB' }, // Main body text (Gray-800 Light, Gray-200 Dark)
          secondary:    { DEFAULT: '#374151', dark: '#D1D5DB' }  // Subtler text (Gray-700 Light, Gray-300 Dark)
        },
        'button-text': { // Text color for primary buttons (ensuring contrast)
          DEFAULT: '#FFFFFF', // White text on dark primary bg (Light Mode)
          dark: '#F9FAFB'     // Light text (Gray-50) on lighter primary.dark bg (Dark Mode)
        },
        success:        { DEFAULT: '#059669', dark: '#34D399' },
        warning:        { DEFAULT: '#F59E0B', dark: '#FCD34D' },
        error:          { DEFAULT: '#EF4444', dark: '#F87171' }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],     // Primary font
        display: ['Poppins', 'sans-serif'] // Secondary font for headings, etc.
      },
      borderRadius: {
        'DEFAULT': '0.5rem', // 8px
        'lg': '0.75rem',     // 12px
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      }
    },
  },
  plugins: [
    require('@headlessui/tailwindcss') // Plugin for styling Headless UI components with Tailwind
  ],
}
