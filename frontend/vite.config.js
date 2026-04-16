import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    react(),
    legacy({ targets: ['android >= 5', 'ios >= 10'] }),
  ],
  base: '/',
  server: {
    port: 5173,
    host: true,
  },
})
