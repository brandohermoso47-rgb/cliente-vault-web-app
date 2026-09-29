# Phase 2: Advanced Motion Recognition Features

## Overview

This document describes Phase 2 additions to the motion recognition system:
- **DTW Comparison**: Dynamic Time Warping for pose sequence analysis
- **Video Export**: Burn motion effects directly into video
- **Student Performance Analysis**: Automated feedback system with scoring

## 1. Dynamic Time Warping (DTW) Comparison

### Purpose
Compare student pose sequences against instructor reference using DTW algorithm. Measures form accuracy, timing synchronization, and movement consistency.

### Key Functions

#### `comparePoseSequences(instructorPoses, studentPoses)`
```typescript
const result = comparePoseSequences(instructorPoses, studentPoses);
// Returns: {
//   distance: number,
//   similarity: 0-100,
//   warpingPath: Array<[i, j]>,
//   temporalAlignment: 0-100
// }
```

**Metrics:**
- `similarity` (0-100): How closely student matches instructor form
- `temporalAlignment` (0-100): % of frames properly synchronized
- `distance`: Normalized euclidean distance between pose sequences

#### `scoreStudentPerformance(instructorPoses, studentPoses)`
```typescript
const score = scoreStudentPerformance(instructorPoses, studentPoses);
// Returns: {
//   overallScore: 0-100,
//   formScore: 0-100,        // Pose accuracy (40%)
//   timingScore: 0-100,      // Rhythm sync (30%)
//   consistencyScore: 0-100, // Stability (30%)
//   feedback: string[]       // AI-generated feedback
// }
```

**Scoring Breakdown:**
- **Form Score (40%)**: Based on pose similarity via DTW
- **Timing Score (30%)**: Temporal alignment quality
- **Consistency Score (30%)**: Landmark confidence and smoothness

### Example Usage

```typescript
import { scoreStudentPerformance } from '@/lib/motionRecognition/dtw';

// After detecting poses from instructor and student videos
const analysis = scoreStudentPerformance(
  instructorPoseSequence,
  studentPoseSequence
);

console.log(`Overall: ${analysis.overallScore}`);
console.log(`Form: ${analysis.formScore}`);
console.log('Feedback:', analysis.feedback);
// Output:
// Overall: 82
// Form: 75
// Feedback:
// - ✓ Forma: Buena técnica, solo detalles menores
// - ⚠️ Ritmo: Casi sincronizado, acelera un poco
// - ✓ Estabilidad: Movimientos controlados
```

### Algorithm Details

**DTW Matrix Computation:**
1. Create (n+1)×(m+1) matrix where n=instructor frames, m=student frames
2. Fill matrix: `dtw[i][j] = cost + min(dtw[i-1][j], dtw[i][j-1], dtw[i-1][j-1])`
3. Cost = euclidean distance between poses
4. Result: dtw[n][m] = accumulated distance

**Warping Path:**
- Backtrack from [n,m] to [0,0] following minimum values
- Identifies frame-to-frame correspondences
- Allows flexible temporal alignment

### Comparison Visualization

The `StudentPerformanceAnalyzer` component displays:
- Side-by-side video comparison
- Overlay mode showing both videos
- Real-time DTW metrics
- Score breakdown with progress bars
- Personalized feedback

## 2. Video Export with Motion Effects

### Purpose
Render motion recognition overlays directly into video files. Export in multiple formats and aspect ratios for social media.

### Key Functions

#### `exportVideoWithEffects(videoFile, motionData, options)`
```typescript
const options = {
  aspectRatio: '9:16',      // Portrait for TikTok/Reels
  quality: 'high',          // low | medium | high
  fps: 30,
  bitrate: '5M',
  includeAudio: true,
  onProgress: (progress) => console.log(`${progress}% complete`)
};

const blob = await exportVideoWithEffects(videoFile, motionData, options);
downloadBlob(blob, 'class_with_effects.webm');
```

**Aspect Ratios:**
- `16:9` - Standard widescreen
- `9:16` - Portrait (TikTok, Reels)
- `1:1` - Square (Instagram Feed)

**Rendering Pipeline:**
1. Load video into canvas
2. For each frame:
   - Draw video frame
   - Render active motion effects
   - Capture as WebP blob
3. Assemble frames into video using MediaRecorder
4. Export as WebM (VP9 codec)

#### `createShortClip(videoFile, motionData, startMs, durationMs)`
```typescript
// Create 15-second clip optimized for social media
const clip = await createShortClip(
  videoFile,
  motionData,
  5000,      // Start at 5 seconds
  15000      // 15 second duration
);
downloadBlob(clip, 'short_clip.webm');
```

**Output:** 1080×1920 (9:16) WebM video, ready to upload

#### `downloadBlob(blob, filename)`
```typescript
const blob = await exportVideoWithEffects(...);
downloadBlob(blob, 'my_class_video.webm');
// Triggers browser download
```

### Performance Considerations

- **Frame Rendering**: ~30-50ms per frame at 1080p
- **Full Video**: ~5-10 minutes for 3-minute source video
- **Memory**: ~200-300MB for processing (temporary, released after export)
- **Browser Support**: Chrome, Edge, Firefox (not Safari)

### Technical Details

**Canvas Rendering:**
```typescript
// For each motion event active at current time:
const event = FigureEvent;
const plugin = EFFECT_PLUGINS[event.type];
plugin.draw(ctx, event, currentTimeMs, videoW, videoH);
```

**MediaRecorder Configuration:**
```typescript
const mediaRecorder = new MediaRecorder(stream, {
  mimeType: 'video/webm;codecs=vp9',
  videoBitsPerSecond: 5_000_000 // 5 Mbps
});
```

### Limitations & Future Work

**Current:**
- Browser-based rendering (slow, memory intensive)
- WebM format only
- No audio mixing yet

**Phase 3 (Planned):**
- Server-side FFmpeg rendering (fast, scalable)
- Multiple output formats (MP4, MOV, etc.)
- Audio track preservation
- Watermark/branding overlay
- Preset templates (TikTok, Reels, YouTube)

## 3. Student Performance Analysis Component

### Purpose
Integrated component for students to submit attempts and receive AI-generated feedback.

### Usage

```typescript
import { StudentPerformanceAnalyzer } from '@/components/MotionEditor';

<StudentPerformanceAnalyzer
  instructorVideoUrl={classData.videoUrl}
  instructorPoses={extractedInstructorPoses}
  studentVideoUrl={studentSubmissionUrl}
  onAnalysisComplete={(score) => {
    console.log(`Student scored: ${score.overallScore}`);
  }}
/>
```

### Features

1. **Video Comparison:**
   - Side-by-side view (instructor vs student)
   - Overlay mode (transparent comparison)
   - Synchronized playback

2. **Performance Metrics:**
   - Overall score (0-100)
   - Form accuracy score
   - Timing synchronization score
   - Movement consistency score

3. **AI Feedback:**
   - Automatic analysis via DTW
   - Context-aware suggestions
   - Specific areas for improvement

4. **Visual Feedback:**
   - Color-coded scores (red/orange/yellow/green)
   - Progress bars per metric
   - Performance badges (⭐ to ⭐⭐⭐)

### Feedback Examples

```
Form Score 75:
- ✓ Forma: Casi bien, ajusta la alineación de hombros

Timing Score 85:
- ✓ Ritmo: Buen timing, muy cercano

Consistency Score 90:
- ✓✓ Estabilidad: Movimientos muy fluidos y controlados
```

## Integration Example

### Instructor Workflow

```typescript
// 1. Enable video export in motion editor
const handleExport = async () => {
  const blob = await exportVideoWithEffects(
    videoFile,
    motionRecognitionData
  );
  downloadBlob(blob, `${classTitle}_with_effects.webm`);
};

// 2. Share exported video with students
// 3. Students submit their attempts
```

### Student Workflow

```typescript
// 1. Student records attempt video
const studentVideo = await recordVideo();

// 2. Submit for analysis
const score = await submitForAnalysis(studentVideo, classId);

// 3. Receive feedback immediately
console.log(score.feedback);
// ["✓ Forma: Buena técnica", "⚠️ Ritmo: Acelera un poco"]

// 4. Track progress over time
const progressTrend = trackProgressOverTime(
  instructorPoses,
  [attempt1, attempt2, attempt3]
);
```

## API Reference

### DTW Module (`src/lib/motionRecognition/dtw.ts`)

- `comparePoseSequences(seq1, seq2): DTWResult`
- `scoreStudentPerformance(seq1, seq2): ScoreResult`
- `trackProgressOverTime(reference, attempts): ProgressData[]`

### Video Export Module (`src/lib/motionRecognition/videoExport.ts`)

- `exportVideoWithEffects(file, data, options): Promise<Blob>`
- `createShortClip(file, data, start, duration): Promise<Blob>`
- `exportPreviewGIF(file, data, start, duration): Promise<Blob>`
- `downloadBlob(blob, filename): void`

### Components

- `StudentPerformanceAnalyzer`: Full analysis UI
- `MotionEditor`: Enhanced with export button
- `StudentPlayer`: Display videos with effects

## Testing

### Unit Tests

```typescript
// Test DTW comparison
import { comparePoseSequences } from '@/lib/motionRecognition/dtw';

describe('DTW', () => {
  it('should give high similarity for identical poses', () => {
    const result = comparePoseSequences(poses, poses);
    expect(result.similarity).toBeGreaterThan(95);
  });

  it('should measure temporal offset', () => {
    const shifted = poses.map((p, i) => (i < 5 ? null : poses[i-5]));
    const result = comparePoseSequences(poses, shifted as any);
    expect(result.temporalAlignment).toBeLessThan(80);
  });
});
```

### Manual Testing

1. **Compare identical videos**: Should get ~100% similarity
2. **Compare with timing offset**: Should detect temporal misalignment
3. **Compare different techniques**: Should give appropriate feedback
4. **Export video**: Check WebM plays correctly with all effects rendered
5. **Student analyzer**: Submit video, verify scores and feedback

## Performance Targets

- DTW comparison: < 5 seconds for 3-minute video
- Video export: 5-10 minutes for 3-minute video (browser)
- UI responsiveness: < 100ms for all interactions
- Feedback generation: < 1 second

## Known Issues

1. **WebM Support**: Not all browsers support VP9 codec
   - Fallback: Use VP8 (lower quality)
2. **Audio Loss**: Current export doesn't preserve audio track
   - Phase 3: Use FFmpeg for audio mixing
3. **Memory Usage**: Large videos may crash browser
   - Limit: Process videos < 5 minutes

## Future Enhancements

- [ ] Server-side FFmpeg rendering
- [ ] Multi-dancer tracking
- [ ] Technique templates (pre-built pose sequences)
- [ ] Real-time feedback during class
- [ ] Progress analytics dashboard
- [ ] Peer comparison (student vs classmates)
- [ ] Mobile app export
- [ ] Social media integration (TikTok, Instagram direct upload)

---

**Last Updated:** 2026-09-29
**Author:** Motion Recognition Team
**Status:** Phase 2 Complete, Phase 3 Planned
