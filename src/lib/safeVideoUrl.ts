// Solo se usan como fuente de video URLs locales del archivo elegido (blob:) o descargas https.
export function safeVideoUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url, window.location.href);
    return parsed.protocol === 'blob:' || parsed.protocol === 'https:' ? parsed.href : null;
  } catch {
    return null;
  }
}
