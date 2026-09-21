// Datos del formulario de registro que App.tsx guarda en Firestore cuando Firebase confirma la sesión nueva.
export type PendingSignup = {
  profile?: Record<string, unknown> | null;
  application?: Record<string, unknown> | null;
  terms?: string | null; // versión de los términos aceptada en el registro
};
export const pending: PendingSignup = { profile: null, application: null, terms: null };
export function takePending(): PendingSignup {
  const out = { profile: pending.profile ?? null, application: pending.application ?? null, terms: pending.terms ?? null };
  pending.profile = null;
  pending.application = null;
  pending.terms = null;
  return out;
}
