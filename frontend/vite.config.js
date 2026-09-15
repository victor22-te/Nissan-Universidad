import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Expone el servidor en 0.0.0.0
    port: 5173,
    watch: {
      usePolling: true, // Necesario para que funcione HMR en Windows/Mac con Docker
    },
  },
})
