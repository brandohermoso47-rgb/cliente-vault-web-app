import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En desarrollo, /api apunta a la API local (cd api && npm run dev). En producción lo sirve Firebase Hosting.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:8080' } },
});
