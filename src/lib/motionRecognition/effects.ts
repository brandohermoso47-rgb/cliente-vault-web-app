/**
 * Effect plugins for motion recognition.
 * Each effect detects a specific pose pattern and renders it on canvas.
 *
 * MVP effects:
 * - Torso grid
 * - Arm lines (extended arm, ~160° elbow)
 * - Elbow triangle (~90° angle)
 * - Grid points
 */

import {
  FigureEvent,
  SmoothedLandmarks,
  EffectPlugin,
  DetectionContext,
  Point2D,
} from '../../types/motionRecognition';
import {
  distance,
  angleBetweenPoints,
  checkAngle,
  generateTorsoGrid,
  gridPoints,
  arcPath,
} from './geometry';

// ==================== Torso Grid ====================

export const torsoGridEffect: EffectPlugin = {
  type: 'torso_grid',
  name: 'Torso Grid',
  description: 'Grid anchored to shoulders and hips',

  detect(landmarks, history, context) {
    // Always propose a torso grid
    const gridParams = generateTorsoGrid(
      { x: landmarks.leftShoulder.x, y: landmarks.leftShoulder.y },
      { x: landmarks.rightShoulder.x, y: landmarks.rightShoulder.y },
      { x: landmarks.leftHip.x, y: landmarks.leftHip.y },
      { x: landmarks.rightHip.x, y: landmarks.rightHip.y },
      30 // cellSize
    );

    const points = gridPoints(gridParams);

    return {
      type: 'torso_grid',
      startMs: context.frameIndex * (1000 / context.fps),
      endMs: context.frameIndex * (1000 / context.fps) + 500, // 500ms duration (will be extended by merging)
      params: {
        topLeft: gridParams.topLeft,
        topRight: gridParams.topRight,
        bottomLeft: gridParams.bottomLeft,
        bottomRight: gridParams.bottomRight,
        cellSize: gridParams.cellSize,
        points,
      },
      color: '#00D9FF',
      opacity: 0.6,
      strokeWidth: 1,
      detectedAutomatically: true,
      editedManually: false,
    };
  },

  draw(ctx, event, currentTimeMs, videoWidth, videoHeight) {
    if (!event.params.topLeft) return;

    const alpha = (event.endMs - currentTimeMs) / (event.endMs - event.startMs);
    if (alpha <= 0 || alpha > 1) return;

    ctx.save();
    ctx.globalAlpha = (event.opacity ?? 0.6) * alpha;
    ctx.strokeStyle = event.color || '#00D9FF';
    ctx.lineWidth = event.strokeWidth ?? 1;

    const { topLeft, topRight, bottomLeft, bottomRight, cellSize } = event.params;

    // Draw vertical lines
    const colCount = Math.ceil(distance(topLeft, topRight) / cellSize);
    for (let i = 0; i <= colCount; i++) {
      const u = colCount > 0 ? i / colCount : 0;
      const x1 = topLeft.x * (1 - u) + topRight.x * u;
      const y1 = topLeft.y * (1 - u) + topRight.y * u;
      const x2 = bottomLeft.x * (1 - u) + bottomRight.x * u;
      const y2 = bottomLeft.y * (1 - u) + bottomRight.y * u;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Draw horizontal lines
    const rowCount = Math.ceil(distance(topLeft, bottomLeft) / cellSize);
    for (let i = 0; i <= rowCount; i++) {
      const v = rowCount > 0 ? i / rowCount : 0;
      const x1 = topLeft.x * (1 - v) + bottomLeft.x * v;
      const y1 = topLeft.y * (1 - v) + bottomLeft.y * v;
      const x2 = topRight.x * (1 - v) + bottomRight.x * v;
      const y2 = topRight.y * (1 - v) + bottomRight.y * v;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.restore();
  },
};

// ==================== Arm Lines ====================

export const armLineEffect: EffectPlugin = {
  type: 'arm_line',
  name: 'Extended Arm Line',
  description: 'Line along extended arm (elbow ~160°+)',

  detect(landmarks, history, context) {
    const effects: Partial<FigureEvent>[] = [];

    // Check right arm
    if (landmarks.rightShoulder && landmarks.rightElbow && landmarks.rightWrist) {
      const rightAngle = angleBetweenPoints(
        { x: landmarks.rightShoulder.x, y: landmarks.rightShoulder.y },
        { x: landmarks.rightElbow.x, y: landmarks.rightElbow.y },
        { x: landmarks.rightWrist.x, y: landmarks.rightWrist.y }
      );

      if (rightAngle > 160) {
        // arm extended
        effects.push({
          type: 'arm_line',
          side: 'R',
          startMs: context.frameIndex * (1000 / context.fps),
          endMs: context.frameIndex * (1000 / context.fps) + 500,
          params: {
            shoulder: { x: landmarks.rightShoulder.x, y: landmarks.rightShoulder.y },
            wrist: { x: landmarks.rightWrist.x, y: landmarks.rightWrist.y },
          },
          color: '#FF00FF',
          opacity: 0.8,
          strokeWidth: 3,
          detectedAutomatically: true,
          editedManually: false,
        });
      }
    }

    // Check left arm
    if (landmarks.leftShoulder && landmarks.leftElbow && landmarks.leftWrist) {
      const leftAngle = angleBetweenPoints(
        { x: landmarks.leftShoulder.x, y: landmarks.leftShoulder.y },
        { x: landmarks.leftElbow.x, y: landmarks.leftElbow.y },
        { x: landmarks.leftWrist.x, y: landmarks.leftWrist.y }
      );

      if (leftAngle > 160) {
        // arm extended
        effects.push({
          type: 'arm_line',
          side: 'L',
          startMs: context.frameIndex * (1000 / context.fps),
          endMs: context.frameIndex * (1000 / context.fps) + 500,
          params: {
            shoulder: { x: landmarks.leftShoulder.x, y: landmarks.leftShoulder.y },
            wrist: { x: landmarks.leftWrist.x, y: landmarks.leftWrist.y },
          },
          color: '#FF00FF',
          opacity: 0.8,
          strokeWidth: 3,
          detectedAutomatically: true,
          editedManually: false,
        });
      }
    }

    return effects.length > 0 ? effects[0] : null;
  },

  draw(ctx, event, currentTimeMs, videoWidth, videoHeight) {
    if (!event.params.shoulder || !event.params.wrist) return;

    const alpha = Math.max(0, (event.endMs - currentTimeMs) / (event.endMs - event.startMs));
    if (alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = (event.opacity ?? 0.8) * alpha;
    ctx.strokeStyle = event.color || '#FF00FF';
    ctx.lineWidth = event.strokeWidth ?? 3;
    ctx.lineCap = 'round';

    const { shoulder, wrist } = event.params;
    ctx.beginPath();
    ctx.moveTo(shoulder.x, shoulder.y);
    ctx.lineTo(wrist.x, wrist.y);
    ctx.stroke();

    ctx.restore();
  },
};

// ==================== Elbow Triangle ====================

export const elbowTriangleEffect: EffectPlugin = {
  type: 'elbow_triangle',
  name: 'Elbow Triangle',
  description: 'Triangle marking ~90° elbow angle',

  detect(landmarks, history, context) {
    const effects: Partial<FigureEvent>[] = [];

    // Check right elbow
    if (landmarks.rightShoulder && landmarks.rightElbow && landmarks.rightWrist) {
      const rightAngle = angleBetweenPoints(
        { x: landmarks.rightShoulder.x, y: landmarks.rightShoulder.y },
        { x: landmarks.rightElbow.x, y: landmarks.rightElbow.y },
        { x: landmarks.rightWrist.x, y: landmarks.rightWrist.y }
      );

      const check = checkAngle(rightAngle, 90, 20);
      if (check.confidence > 0.5) {
        // ~90° elbow detected
        effects.push({
          type: 'elbow_triangle',
          side: 'R',
          startMs: context.frameIndex * (1000 / context.fps),
          endMs: context.frameIndex * (1000 / context.fps) + 500,
          params: {
            shoulder: { x: landmarks.rightShoulder.x, y: landmarks.rightShoulder.y },
            elbow: { x: landmarks.rightElbow.x, y: landmarks.rightElbow.y },
            wrist: { x: landmarks.rightWrist.x, y: landmarks.rightWrist.y },
            angle: rightAngle,
            confidence: check.confidence,
          },
          color: '#FFAA00',
          opacity: 0.7,
          strokeWidth: 2,
          detectedAutomatically: true,
          editedManually: false,
        });
      }
    }

    // Check left elbow
    if (landmarks.leftShoulder && landmarks.leftElbow && landmarks.leftWrist) {
      const leftAngle = angleBetweenPoints(
        { x: landmarks.leftShoulder.x, y: landmarks.leftShoulder.y },
        { x: landmarks.leftElbow.x, y: landmarks.leftElbow.y },
        { x: landmarks.leftWrist.x, y: landmarks.leftWrist.y }
      );

      const check = checkAngle(leftAngle, 90, 20);
      if (check.confidence > 0.5) {
        effects.push({
          type: 'elbow_triangle',
          side: 'L',
          startMs: context.frameIndex * (1000 / context.fps),
          endMs: context.frameIndex * (1000 / context.fps) + 500,
          params: {
            shoulder: { x: landmarks.leftShoulder.x, y: landmarks.leftShoulder.y },
            elbow: { x: landmarks.leftElbow.x, y: landmarks.leftElbow.y },
            wrist: { x: landmarks.leftWrist.x, y: landmarks.leftWrist.y },
            angle: leftAngle,
            confidence: check.confidence,
          },
          color: '#FFAA00',
          opacity: 0.7,
          strokeWidth: 2,
          detectedAutomatically: true,
          editedManually: false,
        });
      }
    }

    return effects.length > 0 ? effects[0] : null;
  },

  draw(ctx, event, currentTimeMs, videoWidth, videoHeight) {
    if (!event.params.shoulder || !event.params.elbow || !event.params.wrist) return;

    const alpha = Math.max(0, (event.endMs - currentTimeMs) / (event.endMs - event.startMs));
    if (alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = (event.opacity ?? 0.7) * alpha;
    ctx.fillStyle = event.color || '#FFAA00';
    ctx.strokeStyle = event.color || '#FFAA00';
    ctx.lineWidth = event.strokeWidth ?? 2;

    const { shoulder, elbow, wrist } = event.params;

    ctx.beginPath();
    ctx.moveTo(shoulder.x, shoulder.y);
    ctx.lineTo(elbow.x, elbow.y);
    ctx.lineTo(wrist.x, wrist.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  },
};

// ==================== Grid Points ====================

export const gridPointsEffect: EffectPlugin = {
  type: 'grid_points',
  name: 'Grid Points',
  description: 'Anchor points for grid snapping',

  detect(landmarks, history, context) {
    const gridParams = generateTorsoGrid(
      { x: landmarks.leftShoulder.x, y: landmarks.leftShoulder.y },
      { x: landmarks.rightShoulder.x, y: landmarks.rightShoulder.y },
      { x: landmarks.leftHip.x, y: landmarks.leftHip.y },
      { x: landmarks.rightHip.x, y: landmarks.rightHip.y },
      30
    );

    const points = gridPoints(gridParams);

    return {
      type: 'grid_points',
      startMs: context.frameIndex * (1000 / context.fps),
      endMs: context.frameIndex * (1000 / context.fps) + 500,
      params: {
        points,
        pointRadius: 4,
      },
      color: '#00FF00',
      opacity: 0.5,
      detectedAutomatically: true,
      editedManually: false,
    };
  },

  draw(ctx, event, currentTimeMs, videoWidth, videoHeight) {
    if (!event.params.points || !Array.isArray(event.params.points)) return;

    const alpha = Math.max(0, (event.endMs - currentTimeMs) / (event.endMs - event.startMs));
    if (alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = (event.opacity ?? 0.5) * alpha;
    ctx.fillStyle = event.color || '#00FF00';

    const pointRadius = event.params.pointRadius || 4;

    for (const point of event.params.points) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, pointRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  },
};

// ==================== Rotation Arc (Phase 2) ====================

export const rotationArcEffect: EffectPlugin = {
  type: 'rotation_arc',
  name: 'Waack Rotation Arc',
  description: 'Arc marking wrist rotation sweep around shoulder',

  detect(landmarks, history, context) {
    const effects: Partial<FigureEvent>[] = [];
    const wristHistoryKey = `wrist_angles_${context.frameIndex}`;

    // Right arm rotation
    if (landmarks.rightShoulder && landmarks.rightWrist) {
      const angle = Math.atan2(
        landmarks.rightWrist.y - landmarks.rightShoulder.y,
        landmarks.rightWrist.x - landmarks.rightShoulder.x
      );
      const radius = distance(
        { x: landmarks.rightShoulder.x, y: landmarks.rightShoulder.y },
        { x: landmarks.rightWrist.x, y: landmarks.rightWrist.y }
      );

      // Only emit if significant sweep detected (handled by merge logic)
      if (radius > 20) {
        effects.push({
          type: 'rotation_arc',
          side: 'R',
          startMs: context.frameIndex * (1000 / context.fps),
          endMs: context.frameIndex * (1000 / context.fps) + 300,
          params: {
            center: { x: landmarks.rightShoulder.x, y: landmarks.rightShoulder.y },
            radius,
            angle,
            wrist: { x: landmarks.rightWrist.x, y: landmarks.rightWrist.y },
          },
          color: '#FFD400',
          opacity: 0.4,
          strokeWidth: 2,
          detectedAutomatically: true,
          editedManually: false,
        });
      }
    }

    // Left arm rotation (symmetric)
    if (landmarks.leftShoulder && landmarks.leftWrist) {
      const angle = Math.atan2(
        landmarks.leftWrist.y - landmarks.leftShoulder.y,
        landmarks.leftWrist.x - landmarks.leftShoulder.x
      );
      const radius = distance(
        { x: landmarks.leftShoulder.x, y: landmarks.leftShoulder.y },
        { x: landmarks.leftWrist.x, y: landmarks.leftWrist.y }
      );

      if (radius > 20) {
        effects.push({
          type: 'rotation_arc',
          side: 'L',
          startMs: context.frameIndex * (1000 / context.fps),
          endMs: context.frameIndex * (1000 / context.fps) + 300,
          params: {
            center: { x: landmarks.leftShoulder.x, y: landmarks.leftShoulder.y },
            radius,
            angle,
            wrist: { x: landmarks.leftWrist.x, y: landmarks.leftWrist.y },
          },
          color: '#FFD400',
          opacity: 0.4,
          strokeWidth: 2,
          detectedAutomatically: true,
          editedManually: false,
        });
      }
    }

    return effects.length > 0 ? effects : null;
  },

  draw(ctx, event, currentTimeMs, videoWidth, videoHeight) {
    if (!event.params.center || !event.params.radius) return;

    const alpha = Math.max(0, 1 - Math.abs(currentTimeMs - event.startMs) / (event.endMs - event.startMs + 1));
    if (alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = (event.opacity ?? 0.4) * alpha;
    ctx.strokeStyle = event.color || '#FFD400';
    ctx.lineWidth = event.strokeWidth ?? 2;
    ctx.fillStyle = event.color + '22'; // slight fill

    const { center, radius, angle } = event.params;
    const startAngle = angle - 0.5;
    const endAngle = angle + 0.5;

    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.arc(center.x, center.y, radius, startAngle, endAngle);
    ctx.lineTo(center.x, center.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  },
};

// ==================== Wrist Trail (Phase 2) ====================

export const wristTrailEffect: EffectPlugin = {
  type: 'wrist_trail',
  name: 'Wrist Motion Trail',
  description: 'Light trail following wrist movement',

  detect(landmarks, history, context) {
    // Trails are emitted per-frame but merged by time range
    if (!landmarks.rightWrist && !landmarks.leftWrist) return null;

    return {
      type: 'wrist_trail',
      startMs: context.frameIndex * (1000 / context.fps),
      endMs: context.frameIndex * (1000 / context.fps) + 150,
      params: {
        rightWrist: landmarks.rightWrist ? { x: landmarks.rightWrist.x, y: landmarks.rightWrist.y } : null,
        leftWrist: landmarks.leftWrist ? { x: landmarks.leftWrist.x, y: landmarks.leftWrist.y } : null,
      },
      color: '#00FFFF',
      opacity: 0.3,
      strokeWidth: 4,
      detectedAutomatically: true,
      editedManually: false,
    };
  },

  draw(ctx, event, currentTimeMs, videoWidth, videoHeight) {
    const { rightWrist, leftWrist } = event.params;
    const age = (currentTimeMs - event.startMs) / (event.endMs - event.startMs);
    const alpha = Math.max(0, 1 - Math.pow(age, 2)); // fade-out curve

    ctx.save();
    ctx.globalAlpha = (event.opacity ?? 0.3) * Math.min(1, alpha);
    ctx.strokeStyle = event.color || '#00FFFF';
    ctx.lineWidth = Math.max(1, (event.strokeWidth ?? 4) * alpha);
    ctx.lineCap = 'round';

    // Draw right wrist trail point
    if (rightWrist) {
      ctx.beginPath();
      ctx.arc(rightWrist.x, rightWrist.y, ctx.lineWidth * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw left wrist trail point
    if (leftWrist) {
      ctx.beginPath();
      ctx.arc(leftWrist.x, leftWrist.y, ctx.lineWidth * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  },
};

// ==================== Pose Echo (Phase 2) ====================

export const poseEchoEffect: EffectPlugin = {
  type: 'pose_echo',
  name: 'Pose Echo',
  description: 'Ghost silhouettes of previous poses for motion sequence visibility',

  detect(landmarks, history, context) {
    // Emit pose snapshot for echoing
    return {
      type: 'pose_echo',
      startMs: context.frameIndex * (1000 / context.fps),
      endMs: context.frameIndex * (1000 / context.fps) + 500,
      params: {
        leftShoulder: landmarks.leftShoulder ? { x: landmarks.leftShoulder.x, y: landmarks.leftShoulder.y } : null,
        rightShoulder: landmarks.rightShoulder ? { x: landmarks.rightShoulder.x, y: landmarks.rightShoulder.y } : null,
        leftElbow: landmarks.leftElbow ? { x: landmarks.leftElbow.x, y: landmarks.leftElbow.y } : null,
        rightElbow: landmarks.rightElbow ? { x: landmarks.rightElbow.x, y: landmarks.rightElbow.y } : null,
        leftWrist: landmarks.leftWrist ? { x: landmarks.leftWrist.x, y: landmarks.leftWrist.y } : null,
        rightWrist: landmarks.rightWrist ? { x: landmarks.rightWrist.x, y: landmarks.rightWrist.y } : null,
        leftHip: landmarks.leftHip ? { x: landmarks.leftHip.x, y: landmarks.leftHip.y } : null,
        rightHip: landmarks.rightHip ? { x: landmarks.rightHip.x, y: landmarks.rightHip.y } : null,
      },
      color: '#FFAA00',
      opacity: 0.15,
      strokeWidth: 1.5,
      detectedAutomatically: true,
      editedManually: false,
    };
  },

  draw(ctx, event, currentTimeMs, videoWidth, videoHeight) {
    const params = event.params;
    if (!params.leftShoulder) return;

    const age = (currentTimeMs - event.startMs) / (event.endMs - event.startMs);
    if (age < 0 || age > 1) return;

    const alpha = Math.max(0, 1 - age);

    ctx.save();
    ctx.globalAlpha = (event.opacity ?? 0.15) * alpha;
    ctx.strokeStyle = event.color || '#FFAA00';
    ctx.lineWidth = event.strokeWidth ?? 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const ls = params.leftShoulder;
    const rs = params.rightShoulder;
    const le = params.leftElbow;
    const re = params.rightElbow;
    const lw = params.leftWrist;
    const rw = params.rightWrist;
    const lh = params.leftHip;
    const rh = params.rightHip;

    // Draw left arm
    if (ls && le && lw) {
      ctx.beginPath();
      ctx.moveTo(ls.x, ls.y);
      ctx.lineTo(le.x, le.y);
      ctx.lineTo(lw.x, lw.y);
      ctx.stroke();
    }

    // Draw right arm
    if (rs && re && rw) {
      ctx.beginPath();
      ctx.moveTo(rs.x, rs.y);
      ctx.lineTo(re.x, re.y);
      ctx.lineTo(rw.x, rw.y);
      ctx.stroke();
    }

    // Draw torso
    if (ls && rs && lh && rh) {
      ctx.beginPath();
      ctx.moveTo(ls.x, ls.y);
      ctx.lineTo(rs.x, rs.y);
      ctx.lineTo(rh.x, rh.y);
      ctx.lineTo(lh.x, lh.y);
      ctx.closePath();
      ctx.stroke();
    }

    ctx.restore();
  },
};

// ==================== Effect Registry ====================

export const EFFECT_PLUGINS: Record<string, EffectPlugin> = {
  torso_grid: torsoGridEffect,
  arm_line: armLineEffect,
  elbow_triangle: elbowTriangleEffect,
  grid_points: gridPointsEffect,
  rotation_arc: rotationArcEffect,
  wrist_trail: wristTrailEffect,
  pose_echo: poseEchoEffect,
};

export function getEffectPlugin(type: string): EffectPlugin | null {
  return EFFECT_PLUGINS[type] || null;
}

export function getAllEffectPlugins(): EffectPlugin[] {
  return Object.values(EFFECT_PLUGINS);
}
