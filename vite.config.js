import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        secure: false,
        timeout: 60000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.log('[vite-proxy-warning]', err.message);
            if (res && !res.headersSent) {
              res.writeHead(504, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Proxy connection reset. Retrying...' }));
            }
          });
        },
      }
    }
  }
})
