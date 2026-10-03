// Ángulos articulares en vivo a partir de los 33 landmarks de poseTracker.ts.
// Reutiliza la matemática ya existente en motionRecognition/geometry.ts (angleBetweenPoints,
// lineAngle, midpoint) que trabaja sobre {x,y} simples — compatible por estructura con
// NormalizedPoint, sin necesitar los tipos con nombre de campo del editor offline de clases.
import { angleBetweenPoints, lineAngle, midpoint } from '../motionRecognition/geometry';
import { POSE_LANDMARK_INDEX, type NormalizedPoint } from './poseTracker';

const IDX = POSE_LANDMARK_INDEX;
const MIN_VISIBILITY = 0.4;

export interface JointAngles {
  leftElbow: number;
  rightElbow: number;
  leftShoulder: number;
  rightShoulder: number;
  leftKnee: number;
  rightKnee: number;
  leftHip: number;
  rightHip: number;
  spineTilt: number; // grados de inclinación respecto a la vertical
}

/** Resto no negativo, a diferencia de `%` de JS que preserva el signo del operando. */
function mod(x: number, n: number): number {
  return ((x % n) + n) % n;
}

/**
 * Calcula los ángulos articulares del frame actual, o null si no hay suficiente
 * confianza en los puntos necesarios (evita dibujar ángulos basura sobre
 * articulaciones que MediaPipe está adivinando por oclusión).
 *
 * `aspectRatio` (ancho/alto del video) corrige que MediaPipe normaliza x e y por
 * separado (por ancho y alto de imagen respectivamente): si el video no es cuadrado,
 * un ángulo recto real se ve distorsionado si se calcula directo sobre x,y normalizados
 * 0-1. Multiplicar x por el aspect ratio antes de medir ángulos deshace esa distorsión.
 */
export function computeJointAngles(lm: NormalizedPoint[], aspectRatio: number = 1): JointAngles | null {
  const need = [
    IDX.leftShoulder, IDX.rightShoulder,
    IDX.leftElbow, IDX.rightElbow,
    IDX.leftWrist, IDX.rightWrist,
    IDX.leftHip, IDX.rightHip,
    IDX.leftKnee, IDX.rightKnee,
    IDX.leftAnkle, IDX.rightAnkle
  ];
  if (need.some((i) => (lm[i]?.visibility ?? 0) < MIN_VISIBILITY)) return null;

  const ar = (p: NormalizedPoint) => ({ x: p.x * aspectRatio, y: p.y });
  const shoulderL = ar(lm[IDX.leftShoulder]), shoulderR = ar(lm[IDX.rightShoulder]);
  const elbowL = ar(lm[IDX.leftElbow]), elbowR = ar(lm[IDX.rightElbow]);
  const wristL = ar(lm[IDX.leftWrist]), wristR = ar(lm[IDX.rightWrist]);
  const hipL = ar(lm[IDX.leftHip]), hipR = ar(lm[IDX.rightHip]);
  const kneeL = ar(lm[IDX.leftKnee]), kneeR = ar(lm[IDX.rightKnee]);
  const ankleL = ar(lm[IDX.leftAnkle]), ankleR = ar(lm[IDX.rightAnkle]);

  const midShoulder = midpoint(shoulderL, shoulderR);
  const midHip = midpoint(hipL, hipR);
  // lineAngle: 0°=derecha, 90°=abajo (coordenadas de imagen, y crece hacia abajo).
  // Una columna erguida (cadera -> hombro, hacia arriba en la imagen) da ~270°.
  const spineLineAngle = lineAngle(midHip, midShoulder);
  const spineTilt = Math.abs(mod(spineLineAngle - 270 + 180, 360) - 180);

  return {
    leftElbow: angleBetweenPoints(shoulderL, elbowL, wristL),
    rightElbow: angleBetweenPoints(shoulderR, elbowR, wristR),
    leftShoulder: angleBetweenPoints(hipL, shoulderL, elbowL),
    rightShoulder: angleBetweenPoints(hipR, shoulderR, elbowR),
    leftKnee: angleBetweenPoints(hipL, kneeL, ankleL),
    rightKnee: angleBetweenPoints(hipR, kneeR, ankleR),
    leftHip: angleBetweenPoints(shoulderL, hipL, kneeL),
    rightHip: angleBetweenPoints(shoulderR, hipR, kneeR),
    spineTilt
  };
}

/** Pares de huesos usados tanto para el esqueleto en canvas como para la guarda de plausibilidad. */
export const BONE_PAIRS: ReadonlyArray<readonly [number, number]> = [
  [IDX.leftShoulder, IDX.leftElbow], [IDX.leftElbow, IDX.leftWrist],
  [IDX.rightShoulder, IDX.rightElbow], [IDX.rightElbow, IDX.rightWrist],
  [IDX.leftHip, IDX.leftKnee], [IDX.leftKnee, IDX.leftAnkle],
  [IDX.rightHip, IDX.rightKnee], [IDX.rightKnee, IDX.rightAnkle],
  [IDX.leftShoulder, IDX.rightShoulder], [IDX.leftHip, IDX.rightHip],
  [IDX.leftShoulder, IDX.leftHip], [IDX.rightShoulder, IDX.rightHip],
  [IDX.nose, IDX.leftShoulder], [IDX.nose, IDX.rightShoulder]
];
