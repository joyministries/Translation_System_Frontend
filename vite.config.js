import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Strip all console.* calls from the production bundle.
    // They remain active in development (npm run dev).
    esbuild: {
      drop: ['console', 'debugger'],
    },
  },
})