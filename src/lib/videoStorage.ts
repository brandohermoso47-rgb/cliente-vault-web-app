import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { storage } from './firebase';
import { VIDEO_TYPES } from './validators';

/**
 * Upload video file to Firebase Storage for motion recognition
 */
export async function uploadClassVideo(
  uid: string,
  classId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  if (!VIDEO_TYPES.includes(file.type)) {
    throw new Error('Solo se aceptan archivos de video');
  }

  const maxSize = 500 * 1024 * 1024; // 500MB
  if (file.size > maxSize) {
    throw new Error('El archivo no puede exceder 500MB');
  }

  const filename = `users/${uid}/classes/${classId}/video_${Date.now()}.mp4`;
  const fileRef = ref(storage, filename);
  const uploadTask = uploadBytesResumable(fileRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        console.error('Upload error:', error);
        reject(new Error('Error subiendo video: ' + error.message));
      },
      async () => {
        try {
          const url = await getDownloadURL(fileRef);
          resolve(url);
        } catch (err) {
          reject(new Error('Error obteniendo URL del video'));
        }
      }
    );
  });
}

/**
 * Get video duration from file
 */
export async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.onloadedmetadata = () => {
      const durationMs = video.duration * 1000;
      resolve(durationMs);
    };

    video.onerror = () => {
      reject(new Error('No se pudo leer la duración del video'));
    };

    video.srcObject = file;
  });
}

/**
 * Delete video from Firebase Storage
 */
export async function deleteClassVideo(videoUrl: string): Promise<void> {
  try {
    const fileRef = ref(storage, videoUrl);
    await deleteObject(fileRef);
  } catch (err) {
    console.error('Error deleting video:', err);
    throw new Error('Error eliminando video');
  }
}

/**
 * Create placeholder video URL for demo
 */
export function createPlaceholderVideoUrl(classId: string): string {
  return `https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4`;
}
