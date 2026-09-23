import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// En desarrollo, /api apunta a la API local (cd api && npm run dev). En producción lo sirve Firebase Hosting.
// La app se sirve desde /account/ en producción (la raíz del dominio es la landing page estática
// en landing/); en desarrollo (`npm run dev`) sigue en la raíz para no romper el flujo local.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/account/' : '/',
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:8080' } },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    testTimeout: 15_000,
    setupFiles: ['src/test/setup.ts'],
    // Sin claves: firebaseConfigured queda en false aunque exista .env.local.
    env: { VITE_FIREBASE_API_KEY: '' },
  },
}));
