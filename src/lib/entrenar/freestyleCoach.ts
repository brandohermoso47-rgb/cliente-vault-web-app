// Lógica pura de corrección de postura + ideas creativas en vivo para el freestyle
// con cámara. Separada de React para poder testearla con vitest, igual que motion.ts.
import type { NormalizedPoint } from './poseTracker';
import { POSE_LANDMARK_INDEX as IDX } from './poseTracker';

export type BodyFocus = 'brazos' | 'piernas' | 'torso' | 'niveles' | 'cabeza';

export interface CreativeIdea {
  focus: BodyFocus;
  text: string;
}

export const CREATIVE_IDEAS: CreativeIdea[] = [
  { focus: 'brazos', text: 'Agrega un doble roll de brazos antes de tu próximo golpe.' },
  { focus: 'brazos', text: 'Prueba un freeze con los brazos en ángulos asimétricos, uno alto y uno bajo.' },
  { focus: 'brazos', text: 'Enlaza tres golpes de brazo jugando con la velocidad: lento-lento-rápido.' },
  { focus: 'piernas', text: 'Cambia de nivel: baja a un plié profundo y sube explotando en un salto pequeño.' },
  { focus: 'piernas', text: 'Agrega un paso cruzado para desplazarte lateralmente en la pista.' },
  { focus: 'piernas', text: 'Juega con el footwork: tres pasos rápidos y una pausa con el peso en una sola pierna.' },
  { focus: 'torso', text: 'Introduce una onda de pecho para conectar dos movimientos de brazos.' },
  { focus: 'torso', text: 'Gira el torso 45° mientras mantienes los brazos fijos, como una pose escultórica.' },
  { focus: 'niveles', text: 'Baja al piso un instante y vuelve a subir con un movimiento de brazos dramático.' },
  { focus: 'niveles', text: 'Alterna entre un nivel alto (puntas de pie) y uno bajo (cuclillas) en el mismo compás.' },
  { focus: 'cabeza', text: 'Suma un giro de cabeza dramático justo antes de tu pose final.' },
  { focus: 'cabeza', text: 'Sostén la mirada fija en un punto mientras tu cuerpo se mueve alrededor de ella.' }
];

export type BodyFocusEnergy = Record<BodyFocus, number>;
export const emptyFocusEnergy = (): BodyFocusEnergy => ({ brazos: 0, piernas: 0, torso: 0, niveles: 0, cabeza: 0 });

export function pickCreativeIdea(focusEnergy: BodyFocusEnergy): CreativeIdea {
  const leastUsed = (Object.entries(focusEnergy) as [BodyFocus, number][]).sort((a, b) => a[1] - b[1])[0]?.[0] ?? 'brazos';
  const pool = CREATIVE_IDEAS.filter((i) => i.focus === leastUsed);
  const candidates = pool.length > 0 ? pool : CREATIVE_IDEAS;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// Ángulo (en grados) del vértice `v` entre los puntos `a` y `b`.
export function jointAngle(a: NormalizedPoint, v: NormalizedPoint, b: NormalizedPoint): number {
  const u = { x: a.x - v.x, y: a.y - v.y };
  const w = { x: b.x - v.x, y: b.y - v.y };
  const magU = Math.hypot(u.x, u.y);
  const magW = Math.hypot(w.x, w.y);
  if (magU === 0 || magW === 0) return 0;
  const cos = Math.max(-1, Math.min(1, (u.x * w.x + u.y * w.y) / (magU * magW)));
  return (Math.acos(cos) * 180) / Math.PI;
}

export const MIN_JOINT_VISIBILITY = 0.35;
const REQUIRED_INDICES = [IDX.leftShoulder, IDX.rightShoulder, IDX.leftHip, IDX.rightHip];

export function isPersonDetected(landmarks: NormalizedPoint[] | null): boolean {
  if (!landmarks) return false;
  const avg = REQUIRED_INDICES.reduce((sum, i) => sum + (landmarks[i]?.visibility ?? 0), 0) / REQUIRED_INDICES.length;
  return avg >= MIN_JOINT_VISIBILITY;
}

const TORSO_LEAN_THRESHOLD_DEG = 18;
const SHOULDER_TILT_THRESHOLD = 0.06;
const KNEE_LOCK_ANGLE_DEG = 168;

export type PostureTipKey = 'torso-lean' | 'shoulder-tilt' | 'knees-locked';
export interface PostureTip {
  key: PostureTipKey;
  text: string;
}

const POSTURE_TIP_TEXT: Record<PostureTipKey, string> = {
  'torso-lean': 'Alinea tu columna: tu torso se está inclinando demasiado hacia un lado.',
  'shoulder-tilt': 'Nivela tus hombros, uno está notablemente más alto que el otro.',
  'knees-locked': 'Suaviza tus rodillas: bailar con las piernas bloqueadas limita tu rebote y control.'
};

/** Analiza un cuadro de landmarks y devuelve las correcciones de postura detectadas en ese instante. */
export function analyzePosture(landmarks: NormalizedPoint[]): PostureTip[] {
  const tips: PostureTip[] = [];
  const ls = landmarks[IDX.leftShoulder];
  const rs = landmarks[IDX.rightShoulder];
  const lh = landmarks[IDX.leftHip];
  const rh = landmarks[IDX.rightHip];
  const lk = landmarks[IDX.leftKnee];
  const rk = landmarks[IDX.rightKnee];
  const la = landmarks[IDX.leftAnkle];
  const ra = landmarks[IDX.rightAnkle];
  if (!ls || !rs || !lh || !rh) return tips;

  const shoulderMid = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
  const hipMid = { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 };
  const torsoLeanDeg = (Math.atan2(shoulderMid.x - hipMid.x, hipMid.y - shoulderMid.y) * 180) / Math.PI;
  if (Math.abs(torsoLeanDeg) > TORSO_LEAN_THRESHOLD_DEG) {
    tips.push({ key: 'torso-lean', text: POSTURE_TIP_TEXT['torso-lean'] });
  }

  if (Math.abs(ls.y - rs.y) > SHOULDER_TILT_THRESHOLD) {
    tips.push({ key: 'shoulder-tilt', text: POSTURE_TIP_TEXT['shoulder-tilt'] });
  }

  if (lk && rk && la && ra) {
    const leftKneeAngle = jointAngle(lh, lk, la);
    const rightKneeAngle = jointAngle(rh, rk, ra);
    if (leftKneeAngle > KNEE_LOCK_ANGLE_DEG && rightKneeAngle > KNEE_LOCK_ANGLE_DEG) {
      tips.push({ key: 'knees-locked', text: POSTURE_TIP_TEXT['knees-locked'] });
    }
  }

  return tips;
}

/** Energía de movimiento (distancia recorrida) por zona corporal entre dos cuadros consecutivos. */
export function frameFocusEnergy(curr: NormalizedPoint[], prev: NormalizedPoint[]): BodyFocusEnergy {
  const velocity = (i: number) => {
    const a = curr[i];
    const b = prev[i];
    if (!a || !b) return 0;
    return Math.hypot(a.x - b.x, a.y - b.y);
  };
  const currentHipYAvg = ((curr[IDX.leftHip]?.y ?? 0.55) + (curr[IDX.rightHip]?.y ?? 0.55)) / 2;
  const previousHipYAvg = ((prev[IDX.leftHip]?.y ?? 0.55) + (prev[IDX.rightHip]?.y ?? 0.55)) / 2;
  return {
    brazos: velocity(IDX.leftWrist) + velocity(IDX.rightWrist) + velocity(IDX.leftElbow) + velocity(IDX.rightElbow),
    piernas: velocity(IDX.leftAnkle) + velocity(IDX.rightAnkle) + velocity(IDX.leftKnee) + velocity(IDX.rightKnee),
    torso: velocity(IDX.leftShoulder) + velocity(IDX.rightShoulder),
    cabeza: velocity(IDX.nose),
    niveles: Math.abs(currentHipYAvg - previousHipYAvg) * 2
  };
}

export function totalEnergy(curr: NormalizedPoint[], prev: NormalizedPoint[]): number {
  const f = frameFocusEnergy(curr, prev);
  return f.brazos + f.piernas + f.torso;
}
