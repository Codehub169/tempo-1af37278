import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 9000, // Set frontend development server to port 9000
    strictPort: true, // Fail if port 9000 is already in use
    proxy: {
      // Proxy API requests to the backend to avoid CORS issues during development
      '/api': {
        target: 'http://localhost:8000', // Assuming backend runs on 8000 during development
        changeOrigin: true,
        // No rewrite needed if backend API routes are prefixed with /api
      }
    }
  }
})
