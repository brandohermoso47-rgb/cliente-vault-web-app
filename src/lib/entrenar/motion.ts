// Análisis de movimiento para la autoevaluación con cámara. No usa modelos ni servicios externos:
// trabaja sobre muestras de "cuánto cambió la imagen" entre cuadros consecutivos (diferencia de
// cuadros a 64×48). Es una estimación aproximada: mide ritmo, golpes, pausas y espacio usado,
// pero NO reconoce pasos ni poses concretas.

export interface MotionSample {
  t: number;    // ms desde que empezó el análisis
  e: number;    // fracción de píxeles que cambiaron (0–1)
  up: number;   // píxeles cambiados en la mitad superior
  lo: number;   // píxeles cambiados en la mitad inferior
  box: number;  // fracción del cuadro que ocupa el movimiento (caja envolvente)
}

export type MotionProfile = 'hits' | 'flow' | 'hips' | 'feet';

export interface MotionResult {
  sync: number;   // 0–1: qué tan pegados al pulso caen tus golpes de movimiento
  sharp: number;  // 0–1: nitidez de los golpes
  pause: number;  // 0–1: presencia de pausas entre golpes
  space: number;  // 0–1: espacio usado
  profile: MotionProfile;
  suggest: { 0: number; 1: number; 4: number }; // calificaciones 1–5 para ritmo, control y espacio
}

// Estilos que encajan con cada perfil de movimiento (ids de src/lib/entrenar/data.ts).
export const PROFILE_STYLES: Record<MotionProfile, string[]> = {
  hits: ['popping', 'locking', 'krump', 'flexing'],
  flow: ['waacking', 'voguing', 'techno'],
  hips: ['twerking', 'dancehall', 'afrohouse'],
  feet: ['house', 'breaking', 'hiphop', 'techno']
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export function analyzeMotion(samples: MotionSample[], bpm: number): MotionResult | null {
  if (samples.length < 40) return null;
  const last = samples.length - 1;
  // Suavizado de 3 cuadros
  const e = samples.map((s, i) => (samples[Math.max(0, i - 1)].e + s.e + samples[Math.min(last, i + 1)].e) / 3);
  const mean = e.reduce((a, b) => a + b, 0) / e.length;
  if (mean < 0.004) return null; // casi no hubo movimiento
  const sd = Math.sqrt(e.reduce((a, b) => a + (b - mean) ** 2, 0) / e.length);
  const th = mean + 0.5 * sd;

  // Picos de energía = "golpes" de movimiento, separados al menos 150 ms
  const peaks: number[] = [];
  for (let i = 2; i < e.length - 2; i++) {
    if (e[i] > th && e[i] >= e[i - 1] && e[i] >= e[i + 1] && (!peaks.length || samples[i].t - samples[peaks[peaks.length - 1]].t > 150)) peaks.push(i);
  }
  if (peaks.length < 3) return null;

  // Sincronía: concentración de las fases de los golpes respecto al pulso (medio tiempo), resultante circular.
  // ~0 si caen al azar, ~1 si siempre caen en el mismo punto del pulso (independiente de la latencia de la cámara).
  const per = 60000 / bpm;
  let cs = 0, sn = 0;
  for (const i of peaks) {
    const a = 4 * Math.PI * ((samples[i].t % per) / per);
    cs += Math.cos(a); sn += Math.sin(a);
  }
  const sync = clamp01(Math.hypot(cs, sn) / peaks.length);

  // Nitidez: cuánto sobresale cada pico respecto a la mediana de su entorno (±6 cuadros)
  let sh = 0;
  for (const i of peaks) {
    const w = e.slice(Math.max(0, i - 6), i + 7).sort((a, b) => a - b);
    const med = w[w.length >> 1];
    sh += Math.max(0, (e[i] - med) / e[i]);
  }
  const sharp = clamp01(sh / peaks.length);

  // Pausas: fracción de cuadros casi quietos (30 % de la energía media); ~30 % ya cuenta como "muchas"
  const pause = clamp01(e.filter((v) => v < 0.3 * mean).length / e.length / 0.3);
  // Espacio: caja media del movimiento; 60 % del cuadro ya cuenta como "todo el espacio"
  const space = clamp01(samples.reduce((a, s) => a + s.box, 0) / samples.length / 0.6);
  // Reparto arriba/abajo del cuerpo
  const total = Math.max(1, samples.reduce((a, s) => a + s.up + s.lo, 0));
  const U = samples.reduce((a, s) => a + s.up, 0) / total;
  const En = clamp01(mean / 0.15);

  const score: Record<MotionProfile, number> = {
    hits: 0.6 * sharp + 0.4 * pause,
    flow: 0.35 * (1 - sharp) + 0.35 * space + 0.3 * U,
    hips: 0.5 * (1 - U) + 0.3 * (1 - space) + 0.2 * (1 - sharp),
    feet: 0.4 * (1 - U) + 0.4 * space + 0.2 * En
  };
  const profile = (Object.keys(score) as MotionProfile[]).sort((a, b) => score[b] - score[a])[0];

  return {
    sync, sharp, pause, space, profile,
    suggest: {
      0: Math.round(1 + 4 * sync),
      1: Math.round(1 + 4 * (0.6 * sharp + 0.4 * pause)),
      4: Math.round(1 + 4 * space)
    }
  };
}
