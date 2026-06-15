import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const NGROK_HOST = process.env.VITE_NGROK_HOST ?? 'mundane-maturely-bulgur.ngrok-free.dev'
const useNgrokHmr = process.env.VITE_NGROK === 'true'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    allowedHosts: [NGROK_HOST, 'localhost'],
    ...(useNgrokHmr
      ? {
          hmr: {
            protocol: 'wss',
            host: NGROK_HOST,
            clientPort: 443,
          },
        }
      : {}),
    proxy: {
      '/api': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
    },
  },
})
