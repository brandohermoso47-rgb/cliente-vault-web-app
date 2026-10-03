// Filtro One Euro (Casiez, Pelacini, Roussel 2012) para la pose en vivo de poseTracker.ts.
// Un filtro de ruido fijo (ej. Kalman con ganancia constante) atrasa en movimientos rápidos
// o sigue temblando en posturas sostenidas: el baile mezcla ambos regímenes todo el tiempo
// (poses sostenidas, golpes/snaps rápidos), que es justo el caso para el que este filtro
// adapta su frecuencia de corte según la velocidad de la señal.
import type { NormalizedPoint } from './poseTracker';
import { distance } from '../motionRecognition/geometry';

function alpha(cutoff: number, dt: number): number {
  const tau = 1 / (2 * Math.PI * cutoff);
  return 1 / (1 + tau / dt);
}

class OneEuroScalar {
  private xPrev: number | null = null;
  private dxPrev = 0;
  private tPrev: number | null = null;

  constructor(
    private minCutoff = 1.2, // Hz; más bajo = más suave en reposo, más atraso
    private beta = 0.4, // coeficiente de velocidad; más alto = menos atraso en movimiento rápido
    private dCutoff = 1.0 // corte para la derivada (velocidad)
  ) {}

  filter(x: number, tSeconds: number): number {
    if (this.tPrev === null) {
      this.tPrev = tSeconds;
      this.xPrev = x;
      this.dxPrev = 0;
      return x;
    }
    const dt = Math.max(tSeconds - this.tPrev, 1 / 120);
    const dx = (x - (this.xPrev ?? x)) / dt;
    const aD = alpha(this.dCutoff, dt);
    const dxHat = aD * dx + (1 - aD) * this.dxPrev;

    const cutoff = this.minCutoff + this.beta * Math.abs(dxHat);
    const aX = alpha(cutoff, dt);
    const xHat = aX * x + (1 - aX) * (this.xPrev ?? x);

    this.tPrev = tSeconds;
    this.xPrev = xHat;
    this.dxPrev = dxHat;
    return xHat;
  }
}

/**
 * Aplica un OneEuroScalar por punto x canal (x, y, z) sobre los 33 landmarks de BlazePose.
 * La cantidad de puntos se toma del primer frame recibido, no se asume fija.
 */
export class PoseOneEuroFilter {
  private xFilters: OneEuroScalar[] = [];
  private yFilters: OneEuroScalar[] = [];
  private zFilters: OneEuroScalar[] = [];

  constructor(
    private minCutoff = 1.2,
    private beta = 0.4,
    private dCutoff = 1.0
  ) {}

  private ensureSize(n: number) {
    while (this.xFilters.length < n) {
      this.xFilters.push(new OneEuroScalar(this.minCutoff, this.beta, this.dCutoff));
      this.yFilters.push(new OneEuroScalar(this.minCutoff, this.beta, this.dCutoff));
      this.zFilters.push(new OneEuroScalar(this.minCutoff, this.beta, this.dCutoff));
    }
  }

  filter(landmarks: NormalizedPoint[], tSeconds: number): NormalizedPoint[] {
    this.ensureSize(landmarks.length);
    return landmarks.map((p, i) => ({
      x: this.xFilters[i].filter(p.x, tSeconds),
      y: this.yFilters[i].filter(p.y, tSeconds),
      z: p.z !== undefined ? this.zFilters[i].filter(p.z, tSeconds) : p.z,
      visibility: p.visibility // no se suaviza una confianza, se pasa tal cual
    }));
  }
}

/**
 * Rechazo de frames anatómicamente implausibles: sigue un largo de referencia (EMA) por
 * segmento óseo y, si un segmento salta más de `tolerance` respecto a su referencia, congela
 * la posición anterior de la articulación lejana (falla localizada, ej. brazo ocluido) en vez
 * de descartar el cuerpo entero. Corre antes del filtro de suavizado para que un frame malo
 * no contamine su estimación de velocidad.
 */
// Cantidad de frames con desviación sostenida tras los que se asume que el cambio de largo
// es real (ej. un brazo que gira hacia la cámara y se escorza) y no un glitch de tracking,
// recalibrando la referencia en vez de congelar la articulación para siempre.
const RECOVERY_FRAMES = 8;

export class BoneLengthGuard {
  private refLengths = new Map<string, number>();
  private rejectStreak = new Map<string, number>();

  constructor(
    private bonePairs: ReadonlyArray<readonly [number, number]>,
    private tolerance = 0.35,
    private refAlpha = 0.05
  ) {}

  apply(current: NormalizedPoint[], previous: NormalizedPoint[] | null): NormalizedPoint[] {
    const out = current.slice();
    for (const [a, b] of this.bonePairs) {
      if (!current[a] || !current[b]) continue;
      const key = `${a}-${b}`;
      // Se mide contra `out`, no contra `current`: así un extremo ya congelado por un
      // par procesado antes (ej. codo congelado al validar hombro-codo) se respeta al
      // validar el siguiente par que lo usa (ej. codo-muñeca), en vez de validar la
      // muñeca contra la posición cruda (potencialmente también implausible) del codo.
      const d = distance(out[a], out[b]);
      const ref = this.refLengths.get(key);
      if (ref === undefined) {
        // Primer frame visto para este hueso: no hay con qué comparar todavía,
        // se toma como referencia inicial en vez de saltearlo sin validar.
        this.refLengths.set(key, d);
        continue;
      }
      if (!previous || !previous[b]) {
        this.refLengths.set(key, ref * (1 - this.refAlpha) + d * this.refAlpha);
        continue;
      }
      const deviation = Math.abs(d - ref) / ref;
      if (deviation > this.tolerance) {
        const streak = (this.rejectStreak.get(key) ?? 0) + 1;
        if (streak >= RECOVERY_FRAMES) {
          // El cambio de largo persiste demasiado para ser un glitch puntual: se acepta
          // como nueva referencia (ej. el bailarín giró el brazo hacia la cámara) en vez
          // de dejar la articulación congelada indefinidamente.
          this.refLengths.set(key, d);
          this.rejectStreak.set(key, 0);
        } else {
          this.rejectStreak.set(key, streak);
          // Se congela la posición, pero se conserva la confianza (visibility) actual:
          // si MediaPipe ya reporta baja confianza en este punto, esa señal no debe
          // taparse con la confianza vieja del frame anterior.
          out[b] = { ...previous[b], visibility: current[b]?.visibility ?? previous[b].visibility };
        }
      } else {
        this.rejectStreak.set(key, 0);
        this.refLengths.set(key, ref * (1 - this.refAlpha) + d * this.refAlpha);
      }
    }
    return out;
  }
}
