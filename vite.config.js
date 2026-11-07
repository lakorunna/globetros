import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // MapLibre locates its web worker next to its own module file,
  // which only works if Vite serves it straight from node_modules in dev.
  optimizeDeps: { exclude: ['maplibre-gl'] },
  build: {
    rolldownOptions: {
      output: {
        // Keep the big libraries in their own files: they rarely change, so returning
        // visitors keep them cached when only the app code is updated.
        codeSplitting: {
          groups: [
            { name: 'maplibre', test: /node_modules[\\/]maplibre-gl/ },
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
          ],
        },
      },
    },
    // MapLibre itself is about 1 MB and can't be made smaller, so don't warn about that one
    chunkSizeWarningLimit: 1100,
  },
})
