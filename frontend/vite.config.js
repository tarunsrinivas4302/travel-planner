import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'url'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'


// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./src', import.meta.url)), // ESM compatible alias
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
})
