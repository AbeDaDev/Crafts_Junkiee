import { defineConfig } from 'vite'
import { resolve } from 'node:path'

const pages = ['index', 'keychains', 'diy-pens', 'glitter', 'dtf-prints', 'accessories', 'customize', 'samples', 'shop', 'reviews', 'checkout']

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((p) => [p, resolve(import.meta.dirname, `${p}.html`)])),
    },
  },
})
