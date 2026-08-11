import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';

export interface GoogleDocItem {
  id: string;
  name: string;
  webViewLink?: string;
  modifiedTime?: string;
}

export interface GoogleDocContent {
  documentId: string;
  title: string;
  body: {
    content: any[];
  };
}

export const docsAuthProvider = new GoogleAuthProvider();
docsAuthProvider.addScope('https://www.googleapis.com/auth/documents');
docsAuthProvider.addScope('https://www.googleapis.com/auth/documents.readonly');
docsAuthProvider.addScope('https://www.googleapis.com/auth/drive');
docsAuthProvider.addScope('https://www.googleapis.com/auth/drive.file');
docsAuthProvider.addScope('https://www.googleapis.com/auth/drive.readonly');
docsAuthProvider.setCustomParameters({
  prompt: 'select_account'
});

let cachedDocsAccessToken: string | null = null;

export const setDocsAccessToken = (token: string | null) => {
  cachedDocsAccessToken = token;
};

export const getDocsAccessToken = (): string | null => {
  return cachedDocsAccessToken;
};

export const signInForGoogleDocs = async (): Promise<string> => {
  try {
    const result = await signInWithPopup(auth, docsAuthProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso de Google Docs.');
    }
    cachedDocsAccessToken = credential.accessToken;
    return cachedDocsAccessToken;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      throw new Error('La ventana de autenticación fue cerrada por el usuario.');
    }
    console.error('Error al iniciar sesión con Google Docs:', error);
    throw error;
  }
};

export const listGoogleDocs = async (token?: string): Promise<GoogleDocItem[]> => {
  const activeToken = token || cachedDocsAccessToken;
  if (!activeToken) {
    throw new Error('No hay sesión activa con Google Docs / Drive.');
  }

  const response = await fetch("https://www.googleapis.com/drive/v3/files?q=mimeType%3D'application%2Fvnd.google-apps.document'&fields=files(id,name,webViewLink,modifiedTime)", {
    headers: {
      Authorization: `Bearer ${activeToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Error al listar documentos de Google Docs');
  }

  const data = await response.json();
  return data.files || [];
};

export const createGoogleDoc = async (title: string, token?: string): Promise<GoogleDocContent> => {
  const activeToken = token || cachedDocsAccessToken;
  if (!activeToken) {
    throw new Error('No hay sesión activa con Google Docs.');
  }

  const response = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${activeToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: title || 'Waack On - Somatic & Practice Document'
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Error al crear documento en Google Docs');
  }

  return await response.json();
};

export const getGoogleDoc = async (documentId: string, token?: string): Promise<GoogleDocContent> => {
  const activeToken = token || cachedDocsAccessToken;
  if (!activeToken) {
    throw new Error('No hay sesión activa con Google Docs.');
  }

  const response = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
    headers: {
      Authorization: `Bearer ${activeToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Error al obtener el documento de Google Docs');
  }

  return await response.json();
};

export const appendTextToGoogleDoc = async (documentId: string, text: string, token?: string): Promise<any> => {
  const activeToken = token || cachedDocsAccessToken;
  if (!activeToken) {
    throw new Error('No hay sesión activa con Google Docs.');
  }

  const response = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${activeToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            text: text + '\n',
            endOfSegmentLocation: {}
          }
        }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Error al actualizar el documento de Google Docs');
  }

  return await response.json();
};
