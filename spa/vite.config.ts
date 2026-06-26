import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Use relative paths so the SPA works from any subfolder (XAMPP /Hadith/ or shared hosting)
  base: './',
})
