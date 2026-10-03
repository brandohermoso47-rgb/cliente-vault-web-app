import type { EffectPlugin, FigureEffectType } from '../../../types/motionRecognition';
import { armLineEffect } from './armLine';
import { elbowTriangleEffect } from './elbowTriangle';
import { gridPointsEffect } from './gridPoints';
import { poseEchoEffect } from './poseEcho';
import { rotationArcEffect } from './rotationArc';
import { torsoGridEffect } from './torsoGrid';
import { wristTrailEffect } from './wristTrail';

// Orden = orden de dibujo (de fondo a frente). Un efecto nuevo solo necesita su archivo y una entrada aquí.
export const EFFECT_PLUGINS: EffectPlugin[] = [
  poseEchoEffect,
  torsoGridEffect,
  armLineEffect,
  elbowTriangleEffect,
  rotationArcEffect,
  wristTrailEffect,
  gridPointsEffect,
];

const BY_TYPE = new Map(EFFECT_PLUGINS.map((p) => [p.type, p]));

export function getEffectPlugin(type: FigureEffectType): EffectPlugin | undefined {
  return BY_TYPE.get(type);
}

export const DEFAULT_EFFECT_TYPES: FigureEffectType[] = EFFECT_PLUGINS.filter((p) => p.enabledByDefault).map((p) => p.type);
