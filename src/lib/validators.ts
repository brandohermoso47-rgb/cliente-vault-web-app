export const emailOk = (v: string) => /^[^ @]+@[^ @]+[.][^ @]+$/.test(v.trim());
export const handleOk = (v: string) => /^[a-z0-9_.]{3,20}$/.test(v.trim().toLowerCase());
// Política de contraseña del proyecto Firebase: 9+ caracteres, mayúscula, minúscula, número y símbolo.
export const passwordOk = (v: string) =>
  v.length >= 9 && /[a-z]/.test(v) && /[A-Z]/.test(v) && /[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v);
export const PASSWORD_HELP = 'Mínimo 9 caracteres, con mayúscula, minúscula, número y símbolo (ej. Waack#2026x).';

export const MAX_IMAGE_MB = 10;
export const MAX_VIDEO_MB = 200;
export const MAX_PDF_MB = 50;
export const MAX_TOTAL_MB = 1024; // tope suave por usuario (lo aplica la interfaz)
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
export const PDF_TYPES = ['application/pdf'];

// Versión vigente de los Términos de servicio (src/screens/Terms.tsx). Cámbiala cuando el texto cambie de forma importante.
export const TERMS_VERSION = '2026-09-21';
