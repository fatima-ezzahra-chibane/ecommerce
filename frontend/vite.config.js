import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig(async () => {
  const plugins = [react()];

  // Tailwind seulement hors Vitest (évite les plantages CI)
  if (!process.env.VITEST) {
    const { default: tailwindcss } = await import('@tailwindcss/vite');
    plugins.push(tailwindcss());
  }

  return {
    plugins,
    server: {
      host: '0.0.0.0',
      port: 5173,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',
      css: false,
      pool: 'forks',
    },
  };
});
