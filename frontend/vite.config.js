import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
        allowedHosts: ["disgrace-trinity-disorder.ngrok-free.dev"],

        port: 5173,

        proxy: {
            '/ls': {
                target: 'http://localhost:3000',
                changeOrigin: true
            },

            '/cat': {
                target: 'http://localhost:3000',
                changeOrigin: true
            },

            '/isDir': {
                target: 'http://localhost:3000',
                changeOrigin: true
            }
        }
    }
})
