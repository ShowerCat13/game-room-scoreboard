import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
// Detect the home-network IP for the QR code (prefers LAN over VPN addresses)
import { getLanIp } from './scripts/lan-ip.mjs'

const localIP = getLanIp()

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    // Inject the local IP address at build time for QR code
    __LOCAL_IP__: JSON.stringify(localIP),
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
})