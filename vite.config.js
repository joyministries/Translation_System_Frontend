import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Changed this line

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // This now uses the official Vite plugin
  ],
})