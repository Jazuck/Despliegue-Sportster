import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    // Render (vite preview): el host público no coincide con localhost
    allowedHosts: true,
  },
})
