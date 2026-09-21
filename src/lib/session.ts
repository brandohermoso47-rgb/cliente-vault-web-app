// Datos del formulario de registro que App.tsx guarda en Firestore cuando Firebase confirma la sesión nueva.
export type PendingSignup = {
  profile?: Record<string, unknown> | null;
  application?: Record<string, unknown> | null;
};
export const pending: PendingSignup = { profile: null, application: null };
export function takePending(): PendingSignup {
  const out = { profile: pending.profile ?? null, application: pending.application ?? null };
  pending.profile = null;
  pending.application = null;
  return out;
}
