import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  // Dev proxy: only used locally. On Vercel, VITE_API_URL env var points to VPS.
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL ?? 'http://localhost:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: (process.env.VITE_API_URL ?? 'http://localhost:8000').replace('http', 'ws'),
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
