/**
 * Geometry utilities for motion recognition.
 * Handles calculations for angles, distances, grids, arcs, etc.
 */

import { Point2D, Landmark, AngleCheck } from '../../types/motionRecognition';

// ==================== Basic Geometry ====================

export function distance(a: Point2D, b: Point2D): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function midpoint(a: Point2D, b: Point2D): Point2D {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

/**
 * Angle of a line from point A to point B, in degrees (0-360).
 * 0° = right, 90° = down, 180° = left, 270° = up.
 */
export function lineAngle(a: Point2D, b: Point2D): number {
  const rad = Math.atan2(b.y - a.y, b.x - a.x);
  return ((rad * 180) / Math.PI + 360) % 360;
}

/**
 * Angle between three points (vertex at b).
 * Returns 0-180 degrees.
 * Examples: (shoulder, elbow, wrist) = elbow angle.
 */
export function angleBetweenPoints(a: Point2D, b: Point2D, c: Point2D): number {
  const ba = Math.atan2(a.y - b.y, a.x - b.x);
  const bc = Math.atan2(c.y - b.y, c.x - b.x);
  let angle = Math.abs((ba - bc) * 180) / Math.PI;
  if (angle > 180) angle = 360 - angle;
  return angle;
}

/**
 * Check if angle is approximately a target value.
 * Returns confidence 0-1 (1 = exact, 0 = far from target).
 */
export function checkAngle(
  actual: number,
  target: number,
  tolerance: number = 15
): AngleCheck {
  const diff = Math.abs(actual - target);
  const normalizedDiff = Math.min(diff, 360 - diff);
  const confidence = Math.max(0, 1 - normalizedDiff / tolerance);

  return {
    angle: actual,
    confidence,
    isApprox: (tgt: number, tol: number = tolerance) => {
      return Math.abs(Math.abs(actual - tgt) - 180) <= tol;
    },
  };
}

// ==================== Grid Generation ====================

/**
 * Generate a grid anchored to torso landmarks.
 * Typically anchored between shoulders and hips.
 */
export interface GridParams {
  topLeft: Point2D;
  topRight: Point2D;
  bottomLeft: Point2D;
  bottomRight: Point2D;
  cellSize: number; // approximate size in pixels
}

export function generateTorsoGrid(
  leftShoulder: Point2D,
  rightShoulder: Point2D,
  leftHip: Point2D,
  rightHip: Point2D,
  cellSize: number = 30
): GridParams {
  return {
    topLeft: leftShoulder,
    topRight: rightShoulder,
    bottomLeft: leftHip,
    bottomRight: rightHip,
    cellSize,
  };
}

/**
 * Generate grid points for a rectangular grid.
 */
export function gridPoints(
  params: GridParams
): Point2D[] {
  const points: Point2D[] = [];

  const width = distance(params.topLeft, params.topRight);
  const height = distance(params.topLeft, params.bottomLeft);
  const cols = Math.ceil(width / params.cellSize);
  const rows = Math.ceil(height / params.cellSize);

  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      const u = cols > 0 ? col / cols : 0;
      const v = rows > 0 ? row / rows : 0;

      // Bilinear interpolation
      const x =
        (1 - u) * (1 - v) * params.topLeft.x +
        u * (1 - v) * params.topRight.x +
        (1 - u) * v * params.bottomLeft.x +
        u * v * params.bottomRight.x;

      const y =
        (1 - u) * (1 - v) * params.topLeft.y +
        u * (1 - v) * params.topRight.y +
        (1 - u) * v * params.bottomLeft.y +
        u * v * params.bottomRight.y;

      points.push({ x, y });
    }
  }

  return points;
}

// ==================== Arc Generation ====================

/**
 * Generate arc path for rotation visualization.
 * Useful for waack rotations, shoulder circles, etc.
 */
export interface ArcParams {
  center: Point2D;
  radius: number;
  startAngleDeg: number; // 0-360, 0 = right
  endAngleDeg: number;
  direction?: 'cw' | 'ccw'; // clockwise or counter-clockwise
}

export function arcPath(params: ArcParams): Point2D[] {
  const path: Point2D[] = [];
  const resolution = Math.max(10, Math.ceil(params.radius / 5)); // ~5px segments
  const { startAngleDeg: start, endAngleDeg: end } = params;

  let current = start;
  const step = params.direction === 'ccw' ? -2 : 2; // degrees per point

  while (
    (params.direction === 'cw' && current <= end) ||
    (params.direction === 'ccw' && current >= end)
  ) {
    const rad = (current * Math.PI) / 180;
    path.push({
      x: params.center.x + params.radius * Math.cos(rad),
      y: params.center.y + params.radius * Math.sin(rad),
    });
    current += step;
  }

  // Always include end point
  const endRad = (end * Math.PI) / 180;
  path.push({
    x: params.center.x + params.radius * Math.cos(endRad),
    y: params.center.y + params.radius * Math.sin(endRad),
  });

  return path;
}

// ==================== Smoothing ====================

/**
 * Exponential moving average of a value.
 * Used to smooth noisy landmark detection.
 */
export function exponentialSmooth(current: number, previous: number, alpha: number = 0.3): number {
  return alpha * current + (1 - alpha) * previous;
}

/**
 * Smooth a landmark over time using exponential moving average.
 */
export function smoothLandmark(current: Landmark, previous: Landmark, alpha: number = 0.3): Landmark {
  return {
    x: exponentialSmooth(current.x, previous.x, alpha),
    y: exponentialSmooth(current.y, previous.y, alpha),
    z: current.z ? exponentialSmooth(current.z, previous.z || 0, alpha) : undefined,
    visibility: current.visibility,
  };
}

/**
 * Kalman filter for 1D signal.
 * Reduces noise while preserving sudden changes.
 */
export class KalmanFilter1D {
  private value: number;
  private estimate: number;
  private estimateError: number;
  private measurementError: number;
  private gain: number = 0;

  constructor(initialValue: number, initialError: number = 1, measurementError: number = 0.5) {
    this.value = initialValue;
    this.estimate = initialValue;
    this.estimateError = initialError;
    this.measurementError = measurementError;
  }

  update(measurement: number): number {
    // Predict
    this.estimateError += 0.02; // process noise

    // Update
    this.gain = this.estimateError / (this.estimateError + this.measurementError);
    this.estimate += this.gain * (measurement - this.estimate);
    this.estimateError *= 1 - this.gain;

    this.value = this.estimate;
    return this.value;
  }

  getValue(): number {
    return this.value;
  }
}

// ==================== Bounding Box ====================

export interface BBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export function pointsToBox(points: Point2D[]): BBox {
  if (points.length === 0) {
    return { left: 0, top: 0, right: 0, bottom: 0 };
  }

  let left = points[0].x;
  let right = points[0].x;
  let top = points[0].y;
  let bottom = points[0].y;

  for (const p of points) {
    left = Math.min(left, p.x);
    right = Math.max(right, p.x);
    top = Math.min(top, p.y);
    bottom = Math.max(bottom, p.y);
  }

  return { left, top, right, bottom };
}

export function boxArea(box: BBox): number {
  return (box.right - box.left) * (box.bottom - box.top);
}

// ==================== Normalization ====================

/**
 * Normalize points to 0-1 range based on video/canvas dimensions.
 */
export function normalizeLandmark(
  landmark: Landmark,
  videoWidth: number,
  videoHeight: number
): Point2D {
  return {
    x: landmark.x / videoWidth,
    y: landmark.y / videoHeight,
  };
}

/**
 * Denormalize points back to pixel space.
 */
export function denormalizeLandmark(
  point: Point2D,
  canvasWidth: number,
  canvasHeight: number
): Point2D {
  return {
    x: point.x * canvasWidth,
    y: point.y * canvasHeight,
  };
}
