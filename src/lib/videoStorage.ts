import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

// Debe coincidir con storage.rules (video/(mp4|webm|quicktime), < 200 MB).
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
const EXT: Record<string, string> = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' };

export async function uploadClassVideo(
  uid: string,
  classId: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const ext = EXT[file.type];
  if (!ext) throw new Error('Formato no admitido. Sube un video MP4, WebM o MOV.');
  if (file.size >= MAX_VIDEO_BYTES) throw new Error('El video debe pesar menos de 200 MB.');

  const fileRef = ref(storage, `users/${uid}/classes/${classId}/video_${Date.now()}.${ext}`);
  const task = uploadBytesResumable(fileRef, file, { contentType: file.type });

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snap) => onProgress?.((snap.bytesTransferred / snap.totalBytes) * 100),
      (error) => reject(new Error('Error subiendo el video: ' + error.message)),
      () => { getDownloadURL(fileRef).then(resolve, () => reject(new Error('No se pudo obtener la URL del video.'))); }
    );
  });
}

export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const objectUrl = URL.createObjectURL(file);
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(Math.round(video.duration * 1000));
    };
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo leer la duración del video.'));
    };
    video.src = objectUrl;
  });
}
