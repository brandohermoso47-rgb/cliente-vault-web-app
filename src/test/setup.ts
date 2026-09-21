import { vi } from 'vitest';

// Las pruebas del frontend NUNCA deben hablar con Firebase, Stripe ni la API reales.
globalThis.fetch = vi.fn(() => Promise.reject(new Error('Red bloqueada en las pruebas'))) as unknown as typeof fetch;
