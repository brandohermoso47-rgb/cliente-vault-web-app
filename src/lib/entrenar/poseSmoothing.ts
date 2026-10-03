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
export class BoneLengthGuard {
  private refLengths = new Map<string, number>();

  constructor(
    private bonePairs: ReadonlyArray<readonly [number, number]>,
    private tolerance = 0.35,
    private refAlpha = 0.05
  ) {}

  apply(current: NormalizedPoint[], previous: NormalizedPoint[] | null): NormalizedPoint[] {
    if (!previous) return current;
    const out = current.slice();
    for (const [a, b] of this.bonePairs) {
      if (!current[a] || !current[b] || !previous[b]) continue;
      const key = `${a}-${b}`;
      const d = distance(current[a], current[b]);
      const ref = this.refLengths.get(key);
      if (ref === undefined) {
        this.refLengths.set(key, d);
        continue;
      }
      const deviation = Math.abs(d - ref) / ref;
      if (deviation > this.tolerance) {
        out[b] = previous[b];
      } else {
        this.refLengths.set(key, ref * (1 - this.refAlpha) + d * this.refAlpha);
      }
    }
    return out;
  }
}
