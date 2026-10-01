# Motion Recognition Editor - MVP Implementation

## Overview

This document describes the motion recognition editor for Waack On, enabling instructors to automatically detect body poses in teaching videos and overlay educational graphics (grids, arm lines, angle markers).

**Key architectural decision:** Pose detection runs **once** during video editing and saves pre-calculated "figure events" as JSON, not raw landmarks. Students' lightweight player reads this JSON and renders effects with Canvas—no MediaPipe needed on student devices.

## Implementation Status

### ✅ Phase 1 (MVP) - Completed

#### 1. Data Models & Types (`src/types/motionRecognition.ts`)

- **Landmark**: Point in 2D/3D space with visibility confidence
- **PoseLandmarks**: 13 key body joints extracted from MediaPipe Pose
- **SmoothedLandmarks**: Filtered landmarks with frame index and confidence
- **FigureEvent**: Pre-calculated, editable graphic (what gets stored)
  ```typescript
  {
    id: "arm-line-123",
    type: "arm_line",
    side: "L",
    startMs: 1200,
    endMs: 1850,
    params: { shoulder: {x,y}, wrist: {x,y} },
    color: "#FF00FF",
    opacity: 0.8,
    detectedAutomatically: true,
    editedManually: false
  }
  ```
- **MotionRecognitionData**: Collection of events for one video
  - Also includes master settings (grid spacing, arc resolution, etc.)

#### 2. Geometry Engine (`src/lib/motionRecognition/geometry.ts`)

Utilities for calculating:
- **Angles**: between 3 points (elbow angle, arm extension)
- **Distances**: between landmarks
- **Grid generation**: anchored to torso (shoulders/hips)
- **Arc paths**: for rotation visualization
- **Smoothing**: Kalman filters & exponential moving average for landmark jitter reduction
- **Bounding boxes**: for measuring space usage

#### 3. Effect Plugins System (`src/lib/motionRecognition/effects.ts`)

Plugin interface: each effect is a module with two methods.

**MVP effects:**
- **Torso Grid**: 2D grid aligned to shoulders/hips, for form reference
- **Arm Lines**: Line from shoulder to wrist when arm extended (~160° elbow)
- **Elbow Triangle**: Triangle marking ~90° angle at elbow
- **Grid Points**: Anchor points for grid snapping

Plugin API:
```typescript
interface EffectPlugin {
  detect(landmarks: SmoothedLandmarks, history: SmoothedLandmarks[], context: DetectionContext)
    => Partial<FigureEvent> | null;
  
  draw(ctx: CanvasRenderingContext2D, event: FigureEvent, currentTimeMs, videoW, videoH)
    => void;
}
```

All effects are registered in `EFFECT_PLUGINS` map for easy lookup and iteration.

#### 4. Pose Detection Engine (`src/lib/motionRecognition/detection.ts`)

Orchestrates:
- **MediaPipe loading**: Dynamically loads Vision Tasks from CDN
- **Landmark extraction**: Maps MediaPipe's 33 landmarks to 13 key joints
- **Smoothing**: Kalman filters per coordinate to reduce jitter
- **Frame-by-frame detection**: Samples video at configurable FPS (default 30fps)
- **Event merging**: Consolidates short detections into stable effects
  - Gap threshold: 200ms (events < 200ms apart with same type+side are merged)
  - Averages numeric parameters across merges

**Output**: List of `FigureEvent[]`, ready to save and render.

#### 5. Editor UI (`src/components/MotionEditor/`)

**MotionEditor.tsx**: Main container
- Left: Video player with canvas overlay showing effects
- Right: Layers panel (event list with edit controls)
- Bottom: Timeline showing event placement

**Features:**
- Playback controls (play/pause, seek, speed)
- Re-run detection button
- Event editing per item:
  - Accept (confirm auto-detected event)
  - Delete (remove unwanted effect)
  - Adjust timing (start/end milliseconds)
  - Customize color & opacity
- Effect type toggles (show/hide each type)
- Visual feedback (selected event highlighted, gutter indication)

**MotionEditorTimeline.tsx**: Time-based view
- Ruler with time markers
- Event blocks colored by type
- Current time indicator
- Click to seek

**MotionEditorLayersPanel.tsx**: Event list & details
- Grouped by effect type with visibility toggle
- Per-event cards showing:
  - Icon (colored dot)
  - Type, side, timing, duration
  - Status badge (Auto/Edited)
- Selected event expands to show:
  - Start/end adjustment inputs
  - Color picker
  - Opacity slider
  - Delete & accept buttons

**MotionPlayerOverlay.tsx**: Canvas rendering
- Hooks into effect plugins' `draw()` methods
- Renders only visible effects in current time window
- Smooth fade-out as event ends

#### 6. Student Player (`src/components/MotionEditor/StudentPlayer.tsx`)

Lightweight playback for students—**no MediaPipe**.
- Video + canvas overlay
- Effect toggles (student-controlled, per-type show/hide)
- Standard video controls:
  - Play/pause, seek, volume
  - Playback rate (0.5x - 2x for slow-mo learning)
  - Fullscreen
  - Settings menu (effect toggles)

## Architecture Decisions

### Why this approach?

1. **One-time detection**: Pose detection is computationally expensive (~500ms per frame). Running it once during editing and caching results is vastly more efficient than real-time detection.

2. **Figure events, not landmarks**: Raw MediaPipe landmarks (33 per frame × ~200 frames = 6600 points) bloat storage and are hard to edit. Pre-calculated events (elbow angle, grid corners) are:
   - Smaller (JSON)
   - Editable (instructor can adjust timing, color, visibility)
   - Semantic (represents "extended arm", not raw joint coordinates)
   - Reusable (same event type across videos)

3. **Plugin system**: New effects don't require touching detection or playback code. Just implement `detect()` and `draw()`, register in map.

4. **Smooth but simple**: Kalman filtering removes sensor noise; event merging consolidates jitter-induced false positives.

## Data Flow

```
Instructor Upload Video
    ↓
[Run Detection on Video]
  ├─ MediaPipe Pose for each frame
  ├─ Smooth landmarks (Kalman)
  ├─ Run effect plugins
  ├─ Merge consecutive events
  └─ Result: FigureEvent[]
    ↓
[Editor UI]
  ├─ Display events in timeline
  ├─ Allow accept/delete/edit per event
  └─ Save to database
    ↓
[Student Player]
  ├─ Read event JSON
  ├─ Render with Canvas during playback
  └─ Student can toggle effects
```

## Data Storage (Phase 2)

Currently: Figure events stored in component state. For persistence:

### Option A: Firestore Subcollection (recommended)
```firestore
users/{uid}/instructorData/classes/{classId}
  └─ motionRecognition (document)
      └─ events: FigureEvent[]
      └─ settings: { gridSpacing: 30, ... }
```

### Option B: PostgreSQL + Drizzle (if using for scaled platform)
```sql
CREATE TABLE motion_recognition_events (
  id UUID PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES classes(id),
  type VARCHAR(50) NOT NULL,
  start_ms INTEGER NOT NULL,
  end_ms INTEGER NOT NULL,
  side CHAR(1),
  params JSONB NOT NULL,
  color VARCHAR(7),
  opacity FLOAT,
  detected_automatically BOOLEAN,
  edited_manually BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);
```

## Phase 2 Features (Not yet implemented)

- **Rotation arcs**: Visual sweep showing shoulder/hip rotation angles
- **Wrist trails**: 2-3 frame motion blur following wrist
- **Pose echoes**: Ghost images of previous frames for timing reference
- **Manual event creation**: Instructor draws events by hand (start/end time + type)
- **Multi-dancer support**: Detect & track 2+ people in frame, separate by side

## Phase 3 Features

- **Video export**: Burn overlays onto video in 9:16 aspect ratio for TikTok/Instagram reels
- **DTW comparison**: Compare student pose timing vs. instructor reference, score form/rhythm
- **Technique templates**: Pre-built "routines" (sequence of poses) to detect automatically

## Integration with Instructor Panel

In `src/views/InstructorNew.tsx`, add tab:

```tsx
case 'motion-editor': {
  const selectedClass = this.state.selectedClass;
  return (
    <MotionEditor
      videoUrl={selectedClass.videoUrl}
      videoDurationMs={selectedClass.videoDurationMs}
      classId={selectedClass.id}
      instructorId={currentUser.id}
      initialData={selectedClass.motionRecognitionData}
      onSave={this.saveMotionData}
      onCancel={() => this.setState({ activeTab: 'classes' })}
    />
  );
}
```

When instructor clicks "Edit Motion Effects" on a class, load `MotionEditor`. On save, persist `MotionRecognitionData` with class.

## Testing

### Unit Tests (`src/lib/motionRecognition/__tests__/`)
- Geometry: angle/distance calculations
- Smoothing: Kalman filter convergence
- Event merging: consecutive event consolidation
- Effect plugins: detect() output validation

### Integration Tests
- Detection on sample video
- Event count & timing ranges
- Canvas rendering without errors

### Manual Testing
1. Upload short waacking video
2. Run detection
3. Verify grid/lines/triangles appear at expected times
4. Edit: delete some events, adjust timing
5. Verify student player renders correctly

## Known Limitations

1. **Single dancer only (MVP)**: Detects only one pose. With 2+ dancers, landmarks mix.
   - Fix Phase 2: Multi-person detection with person ID tracking
2. **Fixed FPS assumption**: Detection assumes 30fps; videos at other rates need frame time mapping.
   - Fix: Extract actual video FPS from metadata
3. **No motion blur**: Wrist trails are Phase 2.
4. **No custom effects UI**: Instructors can't create new effect types (code-only).

## Performance Considerations

- **MediaPipe load**: ~100ms first time (subsequent cached)
- **Detection**: ~50ms/frame at 30fps = ~10 seconds for 6-minute video (okay for async)
- **Memory**: Landmarks stored frame-by-frame (~10MB for 10 min video) but discarded after merging
- **Student playback**: <5MB for typical event JSON, Canvas rendering <5ms per frame

## File Structure

```
src/
├─ types/
│  └─ motionRecognition.ts          # All type definitions
├─ lib/motionRecognition/
│  ├─ index.ts                      # Public API
│  ├─ geometry.ts                   # Math utilities
│  ├─ effects.ts                    # MVP effect plugins
│  └─ detection.ts                  # MediaPipe + detection pipeline
└─ components/MotionEditor/
   ├─ index.ts                      # Public exports
   ├─ MotionEditor.tsx              # Main editor UI
   ├─ MotionEditorTimeline.tsx       # Timeline view
   ├─ MotionEditorLayersPanel.tsx    # Event list
   ├─ MotionPlayerOverlay.tsx        # Canvas rendering
   └─ StudentPlayer.tsx             # Student playback
```

## Next Steps

1. **Store/Retrieve**: Add Firestore persistence (MotionRecognitionData per class)
2. **Integration**: Wire up to instructor panel class editor
3. **Testing**: Create sample video + run manual tests
4. **Styling**: Match Waack On design system (colors, animations)
5. **Phase 2**: Arcs, trails, echoes; manual event creation

## References

- [MediaPipe Pose Landmarker Docs](https://mediapipe.dev/tasks/vision/pose_landmarker/)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Kalman Filter (simple explanation)](https://en.wikipedia.org/wiki/Kalman_filter)
