# Motion Recognition Editor - Complete Guide

## Overview

The Motion Recognition Editor is a powerful tool within Waack On that automatically detects dance movements in instructor videos and overlays educational graphics. It's designed to work offline and generate lightweight, reusable effect data for students.

**Key Feature**: Pose detection runs once during editing, creating pre-calculated "figure events" that are rendered client-side by students - no re-processing required.

## Architecture

### Three-Layer System

```
1. INSTRUCTOR PANEL (Web App)
   └─> Uploads video
   └─> Runs MediaPipe Pose Detection (browser)
   └─> Generates figure events
   └─> Edits/customizes effects
   └─> Saves to Firestore

2. DATA LAYER (Firestore)
   └─> Stores: video URL + JSON of events

3. STUDENT PLAYER (Lightweight)
   └─> Reads: video + event JSON
   └─> Renders: canvas overlays (no ML required)
   └─> Controls: speed, effects toggle, loop
```

## Features

### Phase 1 (MVP - Implemented)

✅ **Torso Grid** (`torso_grid`)
- 2×3 white grid anchored to shoulders and hips
- Shows body structure and orientation

✅ **Extended Arm Line** (`arm_line`)
- Yellow line from shoulder to wrist
- Triggered when elbow angle > ~165°

✅ **Elbow Triangle** (`elbow_triangle`)
- Orange filled triangle at elbow
- Marks ~90° angle (tutting signature)

✅ **Grid Points** (`grid_points`)
- Interactive grid intersection markers
- Highlights when wrist snaps to grid

### Phase 2 (Advanced - Implemented)

✅ **Rotation Arc** (`rotation_arc`)
- Golden arc showing wrist sweep around shoulder
- Visualizes waacking rotation

✅ **Wrist Trail** (`wrist_trail`)
- Cyan motion trail following hand movement
- Shows motion sequence over 150ms

✅ **Pose Echo** (`pose_echo`)
- Orange ghost silhouettes of recent poses
- Reveals motion sequence at a glance

### Phase 3 (Optional - In Roadmap)

- [ ] DTW Comparison: Student form scoring vs template
- [ ] Video Export: Burn overlays to MP4 (9:16 format)
- [ ] Multi-Dancer: Support 2+ people in frame
- [ ] Custom Stickers: Text/emoji attached to joints

## User Workflows

### Instructor: Upload & Edit

1. **Go to Motion Editor tab** in Instructor Panel
2. **Select a class** from dropdown
3. **Upload video** (MP4, WebM, vertical)
   - System detects duration automatically
4. **Automatic detection runs** (first time only)
   - Shows detection progress
   - Takes 10-60 seconds depending on video length
5. **Review detected effects**
   - Watch video with overlays
   - Layers panel shows all events
   - Toggle effect types on/off to test
6. **Edit events** (select in layers panel)
   - Accept/delete individual events
   - Adjust timing (start/end ms)
   - Change color/opacity
7. **Save & Publish**
   - Data persisted to Firestore
   - Associated with class permanently

### Student: Watch & Learn

1. **Open class in Classroom**
2. **Video auto-loads with effects**
3. **Optional controls**:
   - Play/pause
   - Speed (0.5×, 0.75×, 1×, 1.5×)
   - Toggle effect types individually
   - Loop over a time range
   - Mirror view (flip horizontally)
4. **No computation** - just canvas rendering

## Technical Details

### Detection Pipeline

```
Video File
    ↓
[MediaPipe Pose Landmarker - GPU/CPU]
    ↓
Extract Key Joints (shoulders, elbows, wrists, hips)
    ↓
Kalman Filtering (smooth landmarks)
    ↓
[Effect Plugins]
  ├─ Geometry calculations
  ├─ Angle detection
  ├─ Grid generation
  └─ Pattern recognition
    ↓
Figure Events (pre-calculated)
    ↓
JSON Format + Video URL
    ↓
[Firestore] ← Persisted
```

### Figure Event Structure

```json
{
  "id": "evt-001",
  "type": "arm_line",           // Type of effect
  "side": "R",                  // Left or Right (optional)
  "startMs": 1200,              // Start time in video
  "endMs": 1850,                // End time
  "params": {
    "shoulder": {"x": 640, "y": 200},
    "wrist": {"x": 750, "y": 150}
  },
  "color": "#FF00FF",           // Editable
  "opacity": 0.8,               // Editable
  "strokeWidth": 3,             // Line thickness
  "detectedAutomatically": true,
  "editedManually": false,
  "createdAt": "2026-09-30T...",
  "createdBy": "user-123"
}
```

### Effect Plugin Interface

Each effect implements:

```typescript
interface EffectPlugin {
  type: FigureEffectType;
  name: string;
  description: string;
  
  // Called during pose detection
  detect(landmarks, history, context): FigureEvent | FigureEvent[] | null;
  
  // Called during rendering (60fps)
  draw(ctx, event, currentTimeMs, videoWidth, videoHeight): void;
}
```

### Key Geometry Functions

- `distance(a, b)` - Euclidean distance
- `angleBetweenPoints(a, b, c)` - Angle at vertex b
- `generateTorsoGrid(...)` - Grid anchored to body
- `exponentialSmooth(...)` - Filter jitter
- `KalmanFilter1D` - Per-coordinate smoothing

## UI Components

### MotionEditor.tsx
Main container with playback + editing.
- Video player with overlay canvas
- Playback controls (play/pause, scrub, speed)
- Layers panel (right sidebar)
- Timeline (bottom)

### MotionPlayerOverlay.tsx
Canvas renderer for effects.
- High-DPI support
- Render priority system
- Effect plugin dispatch

### MotionEditorLayersPanel.tsx
Editable effects list.
- Toggle effect types
- Individual event controls
- Color/opacity adjustment
- Timing tweaks (ms-level)

### MotionEditorTimeline.tsx
Visual timeline of all events.
- Grouped by effect type
- Draggable time cursor
- Event duration labels
- Click to seek

### StudentPlayer.tsx
Lightweight playback for students.
- Video + overlays
- Toggle effects on/off
- Speed control
- Mute/unmute

## Customization Guide

### Adding a New Effect

1. **Define the effect** in `src/lib/motionRecognition/effects.ts`:

```typescript
export const myNewEffect: EffectPlugin = {
  type: 'my_new_effect',
  name: 'My Effect',
  description: '...',
  
  detect(landmarks, history, context) {
    // Your detection logic
    return {
      type: 'my_new_effect',
      startMs: ...,
      endMs: ...,
      params: {...},
      color: '#FFFFFF',
      opacity: 0.7,
      detectedAutomatically: true,
      editedManually: false,
    };
  },
  
  draw(ctx, event, currentTimeMs, videoWidth, videoHeight) {
    // Your rendering logic
    ctx.fillStyle = event.color;
    ctx.fillRect(...);
  },
};
```

2. **Register the effect** in `EFFECT_PLUGINS`:

```typescript
export const EFFECT_PLUGINS = {
  torso_grid: torsoGridEffect,
  arm_line: armLineEffect,
  // ... existing effects ...
  my_new_effect: myNewEffect,  // Add here
};
```

3. **Add to UI** (if needed):
   - Color in `EFFECT_COLORS` (MotionEditorLayersPanel.tsx)
   - Icon/description in `EFFECT_DESCRIPTIONS`

### Adjusting Detection Sensitivity

In `src/lib/motionRecognition/detection.ts`:

```typescript
// Angle thresholds
const EXTENDED_ARM_THRESHOLD = 160; // degrees
const RIGHT_ANGLE_TARGET = 90;
const RIGHT_ANGLE_TOLERANCE = 20;   // ±20°

// Smoothing parameters
smoothingWindow: 3,  // frames to smooth over
```

### Styling the Editor UI

The editor uses:
- **Colors**: Tailwind dark theme + custom purple/cyan
- **Fonts**: Inter (sans) + monospace for code
- **Theme**: `src/styles.css` (CSS variables)

Customize:
```css
:root {
  --purple-primary: #a855f7;
  --cyan-accent: #00d9ff;
  --slate-bg: #1e293b;
}
```

## Performance Considerations

### Detection Speed

- **1 min video** → ~10-15 seconds (GPU), ~30-45s (CPU)
- **5 min video** → ~50-75 seconds (GPU), ~2-4 min (CPU)
- **10 min video** → ~2-4 minutes (GPU), ~5-10 min (CPU)

**Optimization tips**:
- Use GPU delegate when available (Chrome on desktop/Mac)
- Reduce frame sample rate for shorter processing

### Rendering Performance

- **Canvas rendering**: 60 FPS at 1280×720 (each effect ~1-5ms)
- **7 effects simultaneously**: ~5-10ms total per frame
- **Mobile**: 30 FPS target with reduced effect complexity

### Storage

- **Video**: Original file size (1 GB typical for 10 min)
- **Event JSON**: ~5-50 KB per video (very lightweight)
- **Firestore**: Pay per read/write, not storage

## Troubleshooting

### Detection Fails

**Symptoms**: "No body detected" message stays
- ✓ Ensure good lighting
- ✓ Keep instructor centered in frame
- ✓ Avoid occlusion of joints
- ✓ Try GPU delegate first, fallback to CPU

### Effects Look Jittery

**Causes**: Jerky motion in overlay
- Solution: Increase smoothing window in `LandmarkSmoother`
- Trade-off: Higher smoothing = lag in response

### Colors Don't Match

**Issue**: Effect colors differ between instructor view and student player
- Check: `EFFECT_COLORS` consistent across all components
- Verify: Browser color profile (sRGB recommended)

### Events Not Saving

**Error**: "Failed to save motion data"
- Check: Firestore permission rules
- Verify: classId is valid and user owns the class
- Retry: Network may be transient

## Data Privacy & Security

- ✅ **No cloud processing**: Detection happens locally in browser
- ✅ **No raw landmarks stored**: Only calculated events
- ✅ **Video URL only**: Metadata only, not re-uploaded
- ✅ **Firestore rules**: Class owner can read/write events

## Future Enhancements

- [ ] Real-time detection (skip video upload)
- [ ] Collaborative editing (multiple instructors)
- [ ] Form scoring (DTW comparison)
- [ ] Mobile app optimization
- [ ] Accessibility (captions, audio cues)
- [ ] Multilanguage UI

## Support & Feedback

Report issues or suggest features:
1. Check existing issues: GitHub Issues
2. Describe: What you were doing, what went wrong
3. Attach: Screenshot + video duration/format if applicable

---

**Version**: 1.0.0 (MVP + Phase 2)  
**Last Updated**: 2026-09-30  
**Author**: Waack On Team
