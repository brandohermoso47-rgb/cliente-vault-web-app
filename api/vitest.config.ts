import { defineConfig } from 'vitest/config';

// Cada fichero levanta su propio PostgreSQL embebido (PGlite): se ejecutan en serie y con margen de tiempo.
export default defineConfig({
  test: { fileParallelism: false, hookTimeout: 60_000, testTimeout: 30_000 },
});
