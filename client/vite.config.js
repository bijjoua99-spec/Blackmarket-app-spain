import { defineConfig } from 'vite'

// Configuración para producción: sin proxy, el frontend usará la URL completa del backend
export default defineConfig({
  server: {
    port: 5173
  }
})
