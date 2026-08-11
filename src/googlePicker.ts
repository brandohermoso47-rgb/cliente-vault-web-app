import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';

// Google Auth Provider configured with Google Drive / Picker scopes
export const googlePickerProvider = new GoogleAuthProvider();
googlePickerProvider.addScope('https://www.googleapis.com/auth/drive.file');
googlePickerProvider.addScope('https://www.googleapis.com/auth/drive.metadata.readonly');
googlePickerProvider.setCustomParameters({
  prompt: 'select_account'
});

// Memory cached token for Picker
let cachedPickerAccessToken: string | null = null;

export const setPickerAccessToken = (token: string | null) => {
  cachedPickerAccessToken = token;
};

export const getPickerAccessToken = (): string | null => {
  return cachedPickerAccessToken;
};

export const signInForGooglePicker = async (): Promise<string> => {
  try {
    const result = await signInWithPopup(auth, googlePickerProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso para Google Drive Picker.');
    }
    cachedPickerAccessToken = credential.accessToken;
    return cachedPickerAccessToken;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      throw new Error('La ventana de autenticación fue cerrada por el usuario.');
    }
    console.error('Error signing in for Google Picker:', error);
    throw error;
  }
};

export interface DrivePickedFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  size?: string;
}

/**
 * Fetch files from user's Google Drive matching query
 */
export const fetchDriveFiles = async (
  queryStr: string = '',
  token?: string
): Promise<{ files: DrivePickedFile[]; error?: string }> => {
  const activeToken = token || cachedPickerAccessToken;
  if (!activeToken) {
    return { files: [], error: 'AUTH_REQUIRED' };
  }

  try {
    let q = "trashed = false";
    if (queryStr.trim()) {
      q += ` and name contains '${queryStr.replace(/'/g, "\\'")}'`;
    }

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,webViewLink,webContentLink,iconLink,thumbnailLink,size)&pageSize=30`,
      {
        headers: { Authorization: `Bearer ${activeToken}` }
      }
    );

    if (!res.ok) {
      if (res.status === 401) {
        cachedPickerAccessToken = null;
        return { files: [], error: 'AUTH_REQUIRED' };
      }
      throw new Error(`Drive API error status ${res.status}`);
    }

    const data = await res.json();
    return { files: data.files || [] };
  } catch (err: any) {
    console.error('Error fetching Drive files:', err);
    return { files: [], error: err.message || 'Error al conectar con Google Drive' };
  }
};

/**
 * Fetch specifically audio/music files from Google Drive
 */
export const fetchAudioDriveFiles = async (
  queryStr: string = '',
  token?: string
): Promise<{ files: DrivePickedFile[]; error?: string }> => {
  const activeToken = token || cachedPickerAccessToken;
  if (!activeToken) {
    return { files: [], error: 'AUTH_REQUIRED' };
  }

  try {
    let q = "trashed = false and (mimeType contains 'audio/' or mimeType contains 'music' or name contains '.mp3' or name contains '.wav' or name contains '.m4a')";
    if (queryStr.trim()) {
      q += ` and name contains '${queryStr.replace(/'/g, "\\'")}'`;
    }

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,webViewLink,webContentLink,iconLink,thumbnailLink,size)&pageSize=30`,
      {
        headers: { Authorization: `Bearer ${activeToken}` }
      }
    );

    if (!res.ok) {
      if (res.status === 401) {
        cachedPickerAccessToken = null;
        return { files: [], error: 'AUTH_REQUIRED' };
      }
      throw new Error(`Drive API status ${res.status}`);
    }

    const data = await res.json();
    return { files: data.files || [] };
  } catch (err: any) {
    console.error('Error fetching audio Drive files:', err);
    return { files: [], error: err.message || 'Error al obtener archivos de audio de Google Drive' };
  }
};
