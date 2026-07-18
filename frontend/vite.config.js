import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const isTest = !!process.env.VITEST;

export default defineConfig({
  plugins: [
    react(),
    // Tailwind v4 peut faire échouer Vitest sur CI
    ...(isTest ? [] : [tailwindcss()]),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: false,
  },
});
