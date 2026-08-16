import { doc, setDoc, deleteDoc, collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, auth, storage, handleFirestoreError, OperationType } from './firebase';
import { PlaylistItem } from '../types';

export const INITIAL_DEFAULT_TRACKS: PlaylistItem[] = [
  {
    id: '1',
    title: 'Waack That Funk (Groove Edition)',
    artist: 'Disco Symphony',
    bpm: 124,
    duration: '3:45',
    type: 'fast',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a815a3.mp3?filename=funky-groove-112318.mp3',
    provider: 'custom',
    category: 'Fundamentos'
  },
  {
    id: '2',
    title: 'Midnight Posing Lounge',
    artist: 'Soul Train Ensemble',
    bpm: 110,
    duration: '4:12',
    type: 'slow',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=funky-synth-disco-115328.mp3',
    provider: 'custom',
    category: 'Posing'
  },
  {
    id: '3',
    title: 'Whacking Arms Acceleration 130 BPM',
    artist: 'Imperial Beats',
    bpm: 130,
    duration: '3:20',
    type: 'fast',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_3343362fa4.mp3?filename=retro-funk-groove-8724.mp3',
    provider: 'custom',
    category: 'Drills'
  }
];

/**
 * Save user track to Firebase Firestore under user session
 */
export async function saveUserTrackToFirebase(userId: string, track: PlaylistItem): Promise<void> {
  if (!userId) return;

  const trackData = {
    id: track.id,
    userId,
    title: track.title,
    artist: track.artist || 'Artista Desconocido',
    bpm: track.bpm || 120,
    duration: track.duration || '3:00',
    type: track.type || (track.bpm >= 120 ? 'fast' : 'slow'),
    audioUrl: track.audioUrl,
    provider: track.provider || 'custom',
    category: track.category || 'General',
    storagePath: track.storagePath || '',
    createdAt: track.createdAt || new Date().toISOString()
  };

  const userTrackRef = doc(db, 'users', userId, 'playlists', track.id);
  const globalTrackRef = doc(db, 'user_playlists', track.id);

  try {
    await setDoc(userTrackRef, trackData, { merge: true });
    await setDoc(globalTrackRef, trackData, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${userId}/playlists/${track.id}`);
  }
}

/**
 * Subscribe to real-time changes of user's saved music tracks in Firebase
 */
export function subscribeUserTracksFromFirebase(
  userId: string,
  onTracksUpdate: (tracks: PlaylistItem[]) => void
): () => void {
  if (!userId || !auth.currentUser) {
    onTracksUpdate(INITIAL_DEFAULT_TRACKS);
    return () => {};
  }

  const userTracksRef = collection(db, 'users', userId, 'playlists');

  const unsubscribe = onSnapshot(
    userTracksRef,
    (snapshot) => {
      if (snapshot.empty) {
        // Fallback: search in global user_playlists collection
        const q = query(collection(db, 'user_playlists'), where('userId', '==', userId));
        getDocs(q).then((globalSnap) => {
          if (!globalSnap.empty) {
            const loaded = globalSnap.docs.map(doc => doc.data() as PlaylistItem);
            onTracksUpdate([...loaded, ...INITIAL_DEFAULT_TRACKS]);
          } else {
            onTracksUpdate(INITIAL_DEFAULT_TRACKS);
          }
        }).catch(() => {
          onTracksUpdate(INITIAL_DEFAULT_TRACKS);
        });
      } else {
        const loaded = snapshot.docs.map(doc => doc.data() as PlaylistItem);
        // Combine loaded tracks with default library, avoiding duplicate IDs
        const loadedIds = new Set(loaded.map(t => t.id));
        const combined = [...loaded, ...INITIAL_DEFAULT_TRACKS.filter(d => !loadedIds.has(d.id))];
        onTracksUpdate(combined);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, `users/${userId}/playlists`);
      onTracksUpdate(INITIAL_DEFAULT_TRACKS);
    }
  );

  return unsubscribe;
}

/**
 * Upload audio file (MP3, WAV, M4A, OGG, FLAC) to Firebase Storage and save record in Firestore session
 */
export async function uploadAudioFileToFirebase(
  userId: string,
  file: File,
  metadata: { title: string; artist?: string; bpm?: number; category?: string },
  onProgress?: (percent: number) => void
): Promise<PlaylistItem> {
  if (!userId) {
    throw new Error('Debe haber un usuario con sesión activa para subir música.');
  }

  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `user_music/${userId}/${Date.now()}_${sanitizedFileName}`;
  const fileRef = ref(storage, storagePath);

  const uploadTask = uploadBytesResumable(fileRef, file, {
    contentType: file.type || 'audio/mpeg'
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) onProgress(progress);
      },
      (error) => {
        console.error('Firebase Storage Audio Upload Error:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          const newTrack: PlaylistItem = {
            id: `track_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            title: metadata.title || file.name.replace(/\.[^/.]+$/, ''),
            artist: metadata.artist || 'Artista Local',
            bpm: metadata.bpm || 120,
            duration: '0:00', // Duration determined when audio loads in player
            type: (metadata.bpm || 120) >= 120 ? 'fast' : 'slow',
            audioUrl: downloadUrl,
            provider: 'upload',
            userId,
            storagePath,
            category: metadata.category || 'Música Propia',
            createdAt: new Date().toISOString()
          };

          await saveUserTrackToFirebase(userId, newTrack);
          resolve(newTrack);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

/**
 * Delete a user track from Firestore and Firebase Storage
 */
export async function deleteUserTrackFromFirebase(userId: string, track: PlaylistItem): Promise<void> {
  if (!userId || !track.id) return;

  try {
    // Delete from Firestore
    const userTrackRef = doc(db, 'users', userId, 'playlists', track.id);
    const globalTrackRef = doc(db, 'user_playlists', track.id);

    await deleteDoc(userTrackRef).catch(() => {});
    await deleteDoc(globalTrackRef).catch(() => {});

    // Delete from Firebase Storage if uploaded file
    if (track.storagePath) {
      const fileRef = ref(storage, track.storagePath);
      await deleteObject(fileRef).catch((e) => console.warn('Storage delete notice:', e));
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `users/${userId}/playlists/${track.id}`);
  }
}
