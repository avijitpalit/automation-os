import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 1. Import the Tailwind plugin

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 2. Add it right here to compile your utility classes
  ],
  base: '',
  server: {
    cors: {
      origin: 'http://helloworld.lvh.me',
    },
    origin: 'http://localhost:3000',
  },
  build: {
    outDir: '../assets/build',
    emptyOutDir: true,
    target: 'es2015',
    cssCodeSplit: false,
    rollupOptions: {
      input: 'src/main.jsx',
      output: {
        format: 'iife',
        entryFileNames: 'main.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) return 'main.css'
          return 'assets/[name][extname]'
        },
        inlineDynamicImports: true,
      },
    },
  },
})