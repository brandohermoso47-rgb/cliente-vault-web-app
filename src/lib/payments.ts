import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

// Llamadas a las Cloud Functions de pagos (Stripe). El cobro real ocurre en Stripe Checkout, no en esta web.
async function call<T>(name: string, data?: unknown): Promise<T> {
  if (!functions) throw new Error('Firebase no está configurado.');
  try {
    const res = await httpsCallable(functions, name)(data ?? {});
    return res.data as T;
  } catch (e: any) {
    const code: string = e?.code || '';
    // Funciones aún no desplegadas o sin claves de Stripe.
    if (code === 'functions/not-found' || code === 'functions/internal' || code === 'functions/unavailable') {
      throw new Error('Los pagos todavía no están activados. Inténtalo más tarde.');
    }
    throw new Error(e?.message || 'No se pudo completar la operación de pago.');
  }
}

const go = ({ url }: { url: string | null }) => {
  if (!url) throw new Error('No se recibió la página de pago.');
  window.location.assign(url);
};

export async function startCheckout(planId: string, interval: 'month' | 'year', instructorId?: string) {
  go(await call('createCheckoutSession', { planId, interval, instructorId }));
}
export async function openBillingPortal() { go(await call('createPortalSession')); }
export async function startConnectOnboarding() { go(await call('createConnectOnboarding')); }
