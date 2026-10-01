/**
 * Motion Recognition Editor Types
 *
 * Architecture: Pose detection runs once during video editing.
 * Result is stored as "figure events" (pre-calculated, editable graphics),
 * not raw landmarks. Student player reads video + event JSON, renders with Canvas.
 */

// ==================== Pose & Landmarks ====================

export interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number; // 0-1, confidence
}

export interface PoseLandmarks {
  // Right side landmarks (0-indexed from MediaPipe Pose)
  rightShoulder: Landmark;
  rightElbow: Landmark;
  rightWrist: Landmark;
  rightHip: Landmark;
  rightKnee: Landmark;
  rightAnkle: Landmark;

  // Left side landmarks
  leftShoulder: Landmark;
  leftElbow: Landmark;
  leftWrist: Landmark;
  leftHip: Landmark;
  leftKnee: Landmark;
  leftAnkle: Landmark;

  // Spine
  nose: Landmark;
  neck: Landmark; // center between shoulders
  spine: Landmark; // center between hips and shoulders
}

export interface SmoothedLandmarks extends PoseLandmarks {
  frameIndex: number;
  timestamp: number; // ms
  confidence: number; // mean visibility
}

// ==================== Figure Events (what gets stored) ====================

export type FigureEffectType =
  | 'torso_grid'
  | 'arm_line'
  | 'elbow_triangle'
  | 'grid_points'
  | 'rotation_arc'      // phase 2
  | 'wrist_trail'        // phase 2
  | 'pose_echo';         // phase 2

export interface Point2D {
  x: number;
  y: number;
}

/**
 * Pre-calculated figure event.
 * Stored in database, edited by instructor, rendered by student player.
 */
export interface FigureEvent {
  id: string;
  type: FigureEffectType;
  startMs: number; // when effect appears in video
  endMs: number;   // when effect disappears
  side?: 'L' | 'R'; // for asymmetric effects

  // Effect-specific parameters stored as JSON
  // Examples:
  // { tipo: "linea_brazo", lado: "L", hombro: {x,y}, muñeca: {x,y} }
  // { tipo: "rejilla", esquinas: [{x,y}, ...], cellSize: 30 }
  // { tipo: "arco", centro: {x,y}, radio: 50, angulo_inicio: 0, angulo_fin: 90 }
  params: Record<string, any>;

  // Display customization
  color?: string; // hex color
  opacity?: number; // 0-1
  strokeWidth?: number;

  // Metadata
  detectedAutomatically: boolean;
  editedManually: boolean;
  createdAt: string; // ISO timestamp
  createdBy: string; // user ID
}

/**
 * Collection of figure events for a video/class.
 * One per class/video.
 */
export interface MotionRecognitionData {
  id: string;
  classId: string;
  videoUrl: string;
  videoDurationMs: number;

  events: FigureEvent[];

  // Settings that apply to all events
  masterSettings: {
    gridSpacing?: number;
    arcResolution?: number;
    trailLength?: number;
  };

  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// ==================== Detection Session (transient, not stored) ====================

export interface DetectionSession {
  classId: string;
  videoUrl: string;
  videoDurationMs: number;

  // Raw pose landmarks extracted from MediaPipe
  poseFrames: SmoothedLandmarks[];

  // Detected figure events (before user approval)
  proposedEvents: FigureEvent[];

  // Detection parameters
  detectionParams: {
    fps: number;
    minConfidence: number;
    smoothingWindow: number; // frames
  };

  status: 'idle' | 'detecting' | 'complete' | 'error';
  errorMessage?: string;
  progress: number; // 0-1
}

// ==================== Editor State ====================

export interface MotionEditorState {
  session: DetectionSession;

  // Current editing context
  selectedEventId?: string;
  selectedEventType?: FigureEffectType;

  // Timeline playback
  currentTimeMs: number;
  isPlaying: boolean;

  // UI toggles
  showGrid: boolean;
  showArmLines: boolean;
  showElbowTriangles: boolean;
  showGridPoints: boolean;

  // Pending changes (before save)
  pendingChanges: Map<string, Partial<FigureEvent>>;
}

// ==================== Effect Plugin Interface ====================

export interface EffectPlugin {
  type: FigureEffectType;
  name: string;
  description: string;

  /**
   * Detect if this effect should be active at given landmarks.
   * Returns null if effect not detected, or partial FigureEvent if detected.
   * Called frame-by-frame during detection phase.
   */
  detect(
    landmarks: SmoothedLandmarks,
    history: SmoothedLandmarks[],
    context: DetectionContext
  ): Partial<FigureEvent> | null;

  /**
   * Render this effect on canvas.
   * Called during playback at each frame.
   */
  draw(
    ctx: CanvasRenderingContext2D,
    event: FigureEvent,
    currentTimeMs: number,
    videoWidth: number,
    videoHeight: number
  ): void;
}

export interface DetectionContext {
  videoWidth: number;
  videoHeight: number;
  fps: number;
  frameIndex: number;
  totalFrames: number;
}

// ==================== Geometry Helpers ====================

export interface GeometryResult {
  angle: number; // degrees
  distance: number;
  midpoint: Point2D;
  rotation: number; // angle of line
}

/**
 * Result of checking an angle between 3 points (shoulder-elbow-wrist, etc).
 * Used to detect poses like ~90° elbows, extended arms, etc.
 */
export interface AngleCheck {
  angle: number; // degrees, 0-180
  confidence: number; // how clean the angle is
  isApprox: (target: number, tolerance: number) => boolean;
}
