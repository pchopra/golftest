import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Defaults to '/golftest/' for web hosting; native builds override with '/'
  base: process.env.VITE_BASE_PATH || '/golftest/',
})
