/**
 * Motion Recognition Library
 * Public API for pose detection, figure events, and rendering.
 */

// Types
export {
  Landmark,
  PoseLandmarks,
  SmoothedLandmarks,
  FigureEvent,
  MotionRecognitionData,
  FigureEffectType,
  DetectionSession,
  MotionEditorState,
  EffectPlugin,
  DetectionContext,
  GeometryResult,
  AngleCheck,
  Point2D,
} from '../../types/motionRecognition';

// Geometry utilities
export {
  distance,
  midpoint,
  lineAngle,
  angleBetweenPoints,
  checkAngle,
  generateTorsoGrid,
  gridPoints,
  arcPath,
  exponentialSmooth,
  smoothLandmark,
  KalmanFilter1D,
  pointsToBox,
  boxArea,
  normalizeLandmark,
  denormalizeLandmark,
} from './geometry';

// Effect plugins
export {
  torsoGridEffect,
  armLineEffect,
  elbowTriangleEffect,
  gridPointsEffect,
  EFFECT_PLUGINS,
  getEffectPlugin,
  getAllEffectPlugins,
} from './effects';

// Detection engine
export { detectMotionEvents, LandmarkSmoother, mergeConsecutiveEvents } from './detection';
