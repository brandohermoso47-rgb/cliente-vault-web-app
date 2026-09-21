const MSG: Record<string, string> = {
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/wrong-password': 'Correo o contraseña incorrectos.',
  'auth/user-not-found': 'Correo o contraseña incorrectos.',
  'auth/email-already-in-use': 'Ese correo ya tiene una cuenta (quizá creada con Google). Inicia sesión o usa «Continuar con Google».',
  'auth/weak-password': 'La contraseña es muy débil.',
  'auth/password-does-not-meet-requirements': 'La contraseña debe tener mínimo 9 caracteres, con mayúscula, minúscula, número y símbolo.',
  'auth/invalid-email': 'Introduce un correo válido.',
  'auth/network-request-failed': 'Sin conexión con Firebase. Revisa tu internet.',
  'auth/too-many-requests': 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
  'auth/operation-not-allowed': 'El acceso con correo no está habilitado en Firebase.',
  'auth/unauthorized-domain': 'Este dominio no está autorizado en Firebase Authentication.',
  'auth/popup-blocked': 'El navegador bloqueó la ventana de Google. Permite las ventanas emergentes y reintenta.',
};
export function authMessage(e: any): string {
  const code = e?.code as string | undefined;
  return (code && MSG[code]) || `No se pudo completar (${code || e?.message || 'error desconocido'}).`;
}
