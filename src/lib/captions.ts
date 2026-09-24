// Subtítulos y traducción en vivo, sin servicios de pago: quien transmite usa el reconocimiento de voz del
// navegador y publica la frase en su documento de live_sessions; los espectadores la reciben en tiempo real y,
// si quieren, la traducen en su propio dispositivo con el traductor integrado del navegador (Chrome/Edge).
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export const CAPTION_LANGS: Array<[string, string]> = [
  ['es', 'Español'], ['en', 'English'], ['pt', 'Português'], ['fr', 'Français'], ['ko', '한국어'], ['zh', '中文'], ['ja', '日本語'], ['it', 'Italiano'], ['de', 'Deutsch'],
];
const SPEECH_TAG: Record<string, string> = { es: 'es-ES', en: 'en-US', pt: 'pt-BR', fr: 'fr-FR', ko: 'ko-KR', zh: 'zh-CN', ja: 'ja-JP', it: 'it-IT', de: 'de-DE' };

export const speechSupported = () => !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
export const translatorSupported = () => 'Translator' in window;

// Empieza a reconocer tu voz y publica cada frase (parcial o final) como subtítulo de tu transmisión.
export function startCaptions(uid: string, lang: string, onError: (msg: string) => void) {
  const Rec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!Rec) { onError('Tu navegador no permite subtítulos automáticos. Usa Chrome o Edge.'); return () => {}; }
  const rec = new Rec();
  rec.lang = SPEECH_TAG[lang] || 'es-ES';
  rec.continuous = true;
  rec.interimResults = true;
  let stopped = false;
  let last = 0;
  const publish = (text: string) => updateDoc(doc(db, 'live_sessions', uid), { caption: text.slice(-240), captionLang: lang, captionAt: serverTimestamp() }).catch(() => {});
  rec.onresult = (e: any) => {
    const r = e.results[e.results.length - 1];
    const now = Date.now();
    if (r.isFinal || now - last > 700) { last = now; publish(r[0].transcript.trim()); }
  };
  rec.onerror = (e: any) => { if (e.error === 'not-allowed') { stopped = true; onError('Permite el micrófono para activar los subtítulos.'); } };
  rec.onend = () => { if (!stopped) { try { rec.start(); } catch { /* ya activo */ } } };
  try { rec.start(); } catch { /* ya activo */ }
  return () => { stopped = true; try { rec.stop(); } catch { /* */ } publish(''); };
}

const translators = new Map<string, Promise<any>>();
// Traduce una frase en el dispositivo del espectador. Devuelve el texto original si no se puede.
export async function translateText(text: string, from: string, to: string): Promise<string> {
  if (!text || from === to || !translatorSupported()) return text;
  const key = from + '>' + to;
  try {
    if (!translators.has(key)) translators.set(key, (window as any).Translator.create({ sourceLanguage: from, targetLanguage: to }));
    const t = await translators.get(key);
    return await t.translate(text);
  } catch { translators.delete(key); return text; }
}
