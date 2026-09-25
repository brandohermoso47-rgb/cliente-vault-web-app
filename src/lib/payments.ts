import { api, ApiError } from './api';

// Pagos con Stripe a través de la API. El cobro real ocurre en Stripe Checkout, no en esta web.
async function redirect(path: string, body?: unknown) {
  try {
    const { url } = await api<{ url: string | null }>('POST', path, body);
    if (!url) throw new Error('No se recibió la página de pago.');
    window.location.assign(url);
  } catch (e) {
    if (e instanceof ApiError && (e.code === 'api_unavailable' || e.code === 'payments_disabled')) {
      throw new Error('Los pagos todavía no están activados. Inténtalo más tarde.');
    }
    throw e;
  }
}

export const startCheckout = (planId: string, interval: 'month' | 'year', instructorId?: string) =>
  redirect('/billing/checkout', { planId, interval, instructorId });
export const openBillingPortal = () => redirect('/billing/portal');
export const startConnectOnboarding = () => redirect('/connect/onboarding');

export interface InstructorEarnings {
  onboarded: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  activeSubscribers: number;
  monthlyGrossCents: number;
  monthlyNetCents: number;
  feePercent: number;
  currency: string;
  priceMonthlyCents: number | null;
  available: { amount: number; currency: string }[];
  pending: { amount: number; currency: string }[];
  lastPayout: { amount: number; currency: string; arrivalDate: number; status: string } | null;
}

export const getInstructorEarnings = () => api<InstructorEarnings>('GET', '/billing/instructor-earnings');
