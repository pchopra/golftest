import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Use '/' for native (Capacitor), '/golftest/' for web hosting
  base: process.env.VITE_BASE_PATH || '/',
})
