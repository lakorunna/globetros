import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // MapLibre locates its web worker next to its own module file,
  // which only works if Vite serves it straight from node_modules in dev.
  optimizeDeps: { exclude: ['maplibre-gl'] },
})
