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

/**
 * Calcula los ángulos articulares del frame actual, o null si no hay suficiente
 * confianza en los puntos necesarios (evita dibujar ángulos basura sobre
 * articulaciones que MediaPipe está adivinando por oclusión).
 */
export function computeJointAngles(lm: NormalizedPoint[]): JointAngles | null {
  const need = [
    IDX.leftShoulder, IDX.rightShoulder,
    IDX.leftElbow, IDX.rightElbow,
    IDX.leftWrist, IDX.rightWrist,
    IDX.leftHip, IDX.rightHip,
    IDX.leftKnee, IDX.rightKnee,
    IDX.leftAnkle, IDX.rightAnkle
  ];
  if (need.some((i) => (lm[i]?.visibility ?? 0) < MIN_VISIBILITY)) return null;

  const midShoulder = midpoint(lm[IDX.leftShoulder], lm[IDX.rightShoulder]);
  const midHip = midpoint(lm[IDX.leftHip], lm[IDX.rightHip]);
  // lineAngle: 0°=derecha, 90°=abajo (coordenadas de imagen, y crece hacia abajo).
  // Una columna erguida (cadera -> hombro, hacia arriba en la imagen) da ~270°.
  const spineLineAngle = lineAngle(midHip, midShoulder);
  const spineTilt = Math.abs(((spineLineAngle - 270 + 180) % 360) - 180);

  return {
    leftElbow: angleBetweenPoints(lm[IDX.leftShoulder], lm[IDX.leftElbow], lm[IDX.leftWrist]),
    rightElbow: angleBetweenPoints(lm[IDX.rightShoulder], lm[IDX.rightElbow], lm[IDX.rightWrist]),
    leftShoulder: angleBetweenPoints(lm[IDX.leftHip], lm[IDX.leftShoulder], lm[IDX.leftElbow]),
    rightShoulder: angleBetweenPoints(lm[IDX.rightHip], lm[IDX.rightShoulder], lm[IDX.rightElbow]),
    leftKnee: angleBetweenPoints(lm[IDX.leftHip], lm[IDX.leftKnee], lm[IDX.leftAnkle]),
    rightKnee: angleBetweenPoints(lm[IDX.rightHip], lm[IDX.rightKnee], lm[IDX.rightAnkle]),
    leftHip: angleBetweenPoints(lm[IDX.leftShoulder], lm[IDX.leftHip], lm[IDX.leftKnee]),
    rightHip: angleBetweenPoints(lm[IDX.rightShoulder], lm[IDX.rightHip], lm[IDX.rightKnee]),
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
