# Motion Editor - Integration Guide for Instructor Panel

## Quick Start

The motion recognition editor is ready to integrate into the instructor panel. Here's how:

## 1. Data Model Updates

### Firestore Approach (Recommended)

Add to class document in `users/{uid}/instructorData/classes/{classId}`:

```typescript
interface IClass {
  // ... existing fields
  videoUrl?: string;          // video storage/streaming URL
  videoDurationMs?: number;   // video length
  motionRecognitionData?: {
    events: FigureEvent[];
    masterSettings: {
      gridSpacing?: number;
      arcResolution?: number;
      trailLength?: number;
    };
    createdAt: string;
    updatedAt: string;
    createdBy: string;
  };
}
```

Add function to `src/lib/instructor.ts`:

```typescript
export async function saveMotionRecognitionData(
  uid: string,
  classId: string,
  data: MotionRecognitionData
): Promise<void> {
  await updateDoc(
    doc(db, `users/${uid}/instructorData/classes`, classId),
    {
      motionRecognitionData: data,
      updatedAt: serverTimestamp(),
    }
  );
}
```

## 2. Instructor Panel Integration

In `src/views/InstructorNew.tsx`:

### Add Tab Button

```typescript
// In the tab list (around line 170):
{
  id: 'motion-editor',
  label: '🎬 Motion Editor',  // eye-catching icon
  icon: Film,  // or similar lucide icon
}
```

### Add Tab Content

In the render section (where other tabs are handled):

```typescript
case 'motion-editor': {
  const selectedClass = /* get the currently selected class */;
  
  if (!selectedClass) {
    return <div>Select a class first</div>;
  }

  return (
    <MotionEditor
      videoUrl={selectedClass.videoUrl}
      videoDurationMs={selectedClass.videoDurationMs}
      classId={selectedClass.id}
      instructorId={currentUser.id}
      initialData={selectedClass.motionRecognitionData}
      onSave={async (data) => {
        try {
          await saveMotionRecognitionData(currentUser.id, selectedClass.id, data);
          // Show success toast
          alert('Motion recognition data saved!');
          // Refresh class data
          this.loadClasses();
        } catch (error) {
          alert('Failed to save: ' + error);
        }
      }}
      onCancel={() => {
        // Go back to class management
        this.setState({ activeTab: 'classes' });
      }}
    />
  );
}
```

### Add Import

```typescript
import { MotionEditor } from '../components/MotionEditor';
import { saveMotionRecognitionData } from '../lib/instructor';
```

## 3. Class Editor Enhancement

Add a button in the class editing panel to open the motion editor:

```tsx
<button
  onClick={() => this.setState({ activeTab: 'motion-editor', selectedClass })}
  className="px-4 py-2 bg-purple text-white rounded hover:bg-purple-bright"
>
  📹 Edit Motion Effects
</button>
```

Show the motion editor icon/indicator if class has motion recognition data:

```tsx
{selectedClass.motionRecognitionData?.events.length > 0 && (
  <span className="ml-2 text-xs bg-green text-white px-2 py-1 rounded">
    {selectedClass.motionRecognitionData.events.length} effects
  </span>
)}
```

## 4. Student View Integration

### In Class Playback View

Display the student player instead of plain video:

```tsx
import { StudentPlayer } from '../components/MotionEditor';

// In your class viewing component:
<StudentPlayer
  videoUrl={classData.videoUrl}
  motionData={classData.motionRecognitionData}
  title={classData.title}
  showControls={true}
/>
```

### Optional: Preview in Editor

Show a preview of motion effects in the class management screen:

```tsx
{classData.motionRecognitionData && (
  <div className="mt-3 p-3 bg-glass rounded">
    <h4 className="text-sm font-semibold">Motion Effects Preview</h4>
    <div className="text-xs text-ink-2 mt-1">
      {classData.motionRecognitionData.events.map(e => e.type).join(', ')}
    </div>
  </div>
)}
```

## 5. File Uploads (Phase Integration)

For video file handling, integrate with your existing upload system:

```typescript
// In class creation/editing:
async function uploadVideoAndGetUrl(file: File): Promise<string> {
  const filename = `classes/${classId}/video_${Date.now()}.mp4`;
  const ref = storageRef(storage, filename);
  const task = uploadBytesResumable(ref, file);
  
  return new Promise((resolve, reject) => {
    task.on('state_changed', 
      (snapshot) => {
        const progress = snapshot.bytesTransferred / snapshot.totalBytes;
        console.log('Upload progress:', progress);
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(ref);
        resolve(url);
      }
    );
  });
}
```

## 6. State Management

### Option A: React Local State (Current)

Keep motion data in component state like the current implementation.

### Option B: Redux/Context (Recommended for Scale)

```typescript
// Store in Redux
const classSlice = createSlice({
  name: 'class',
  initialState: {
    data: null,
    motionRecognitionData: null,
  },
  reducers: {
    setMotionRecognitionData: (state, action) => {
      state.motionRecognitionData = action.payload;
    },
  },
});
```

## 7. Error Handling

Add error boundaries and user feedback:

```typescript
// In MotionEditor container:
if (state.detectionError) {
  return (
    <div className="p-4 bg-red-900 border border-red-600 rounded">
      <h3 className="font-semibold text-red-100">Detection Error</h3>
      <p className="text-sm text-red-200 mt-1">{state.detectionError}</p>
      <button onClick={() => this.runDetection()}>
        Retry
      </button>
    </div>
  );
}
```

## 8. Styling & Theming

Ensure Waack On brand colors are used. Update color constants:

```typescript
// src/lib/motionRecognition/effects.ts
const EFFECT_COLORS: Record<string, string> = {
  torso_grid: '#00D9FF',     // Waack On cyan
  arm_line: '#FF00FF',       // Pink
  elbow_triangle: '#FFAA00', // Orange
  grid_points: '#00FF00',    // Green
  // ... match your design system
};
```

## 9. Permissions & Roles

Ensure only instructors can access the motion editor:

```typescript
// In InstructorNew.tsx render guard:
if (currentUser.role !== 'instructor' && currentUser.role !== 'estudio') {
  return <div>Instructor mode required</div>;
}
```

## 10. Testing Checklist

- [ ] Upload video → detection runs → events appear in timeline
- [ ] Delete event → removed from list
- [ ] Accept event → status changes from "Auto" to "Confirmed"
- [ ] Adjust timing → event block moves in timeline
- [ ] Change color/opacity → visual updates
- [ ] Save → data persists to Firestore
- [ ] Reload page → data re-loads correctly
- [ ] Student views class → effects render in player
- [ ] Student toggles effect type → visibility changes
- [ ] Student adjusts playback speed → overlays still sync

## Common Issues & Fixes

### MediaPipe fails to load
**Issue**: "Failed to load MediaPipe Vision Tasks"
**Fix**: 
- Check browser console for CORS errors
- Ensure CDN URLs in `detection.ts` are accessible
- Fallback: Use remote-hosted WASM binaries

```typescript
// In detection.ts, fallback CDN
const MEDIAPIPE_URLS = [
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/',
  'https://unpkg.com/@mediapipe/tasks-vision@latest/', // fallback
];
```

### Video seek doesn't work
**Issue**: "Seeking is not allowed" during detection
**Fix**: Use `waitForFrame()` helper or set `video.preload = 'auto'`

### Memory leak with canvas
**Issue**: Memory usage increases on long videos
**Fix**: Call `canvas.getContext('2d')` only once, reuse context

### Effects don't align with video
**Issue**: Landmarks don't match video dimensions
**Fix**: Verify canvas size matches video dimensions:
```typescript
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;
```

## Next Phase: Drizzle Schema

When moving to PostgreSQL, add migrations:

```typescript
// drizzle/migrations/0004_motion_recognition.ts
export async function up(db: Database) {
  // Create motion_recognition_events table
  await db.schema
    .createTable('motion_recognition_events')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultRaw('gen_random_uuid()'))
    .addColumn('class_id', 'uuid', (col) => col.notNull().references('classes.id'))
    .addColumn('type', 'varchar(50)', (col) => col.notNull())
    .addColumn('start_ms', 'integer', (col) => col.notNull())
    .addColumn('end_ms', 'integer', (col) => col.notNull())
    .addColumn('side', 'char(1)')
    .addColumn('params', 'jsonb', (col) => col.notNull())
    .addColumn('color', 'varchar(7)')
    .addColumn('opacity', 'numeric')
    .addColumn('detected_automatically', 'boolean', (col) => col.defaultTo(true))
    .addColumn('edited_manually', 'boolean', (col) => col.defaultTo(false))
    .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultNow())
    .addColumn('created_by', 'uuid', (col) => col.references('users.id'))
    .execute();
}
```

## Support & Questions

For implementation questions, refer to:
- `docs/MOTION_RECOGNITION_IMPLEMENTATION.md` - Detailed architecture
- `src/lib/motionRecognition/index.ts` - Public API
- Component examples in `src/components/MotionEditor/`
