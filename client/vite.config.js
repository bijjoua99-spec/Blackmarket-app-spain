import { defineConfig } from 'vite'

// Dev server proxy: reenvía /api al backend en localhost:5021
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5021',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
