import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';

// Google Auth Provider configured with Gmail scopes
export const googleGmailProvider = new GoogleAuthProvider();
googleGmailProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');
googleGmailProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleGmailProvider.setCustomParameters({
  prompt: 'select_account'
});

// Memory cached token
let cachedGmailAccessToken: string | null = null;

export const setGmailAccessToken = (token: string | null) => {
  cachedGmailAccessToken = token;
};

export const getGmailAccessToken = (): string | null => {
  return cachedGmailAccessToken;
};

export const signInForGmail = async (): Promise<string> => {
  try {
    const result = await signInWithPopup(auth, googleGmailProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso para Gmail.');
    }
    cachedGmailAccessToken = credential.accessToken;
    return cachedGmailAccessToken;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      throw new Error('La ventana de autenticación fue cerrada por el usuario.');
    }
    console.error('Error signing in for Gmail:', error);
    throw error;
  }
};

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet?: string;
  subject?: string;
  from?: string;
  date?: string;
}

/**
 * Fetch list of recent Gmail messages for authenticated user
 */
export const fetchGmailMessages = async (
  token?: string,
  maxResults: number = 10
): Promise<{ messages: GmailMessageSummary[]; error?: string }> => {
  const activeToken = token || cachedGmailAccessToken;
  if (!activeToken) {
    return { messages: [], error: 'AUTH_REQUIRED' };
  }

  try {
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`,
      {
        headers: { Authorization: `Bearer ${activeToken}` }
      }
    );

    if (!listRes.ok) {
      if (listRes.status === 401) {
        cachedGmailAccessToken = null;
        return { messages: [], error: 'AUTH_REQUIRED' };
      }
      throw new Error(`Gmail API error status ${listRes.status}`);
    }

    const listData = await listRes.json();
    const messageItems: { id: string; threadId: string }[] = listData.messages || [];

    // Fetch details for each message
    const detailedMessages: GmailMessageSummary[] = await Promise.all(
      messageItems.map(async (msg) => {
        try {
          const itemRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
            { headers: { Authorization: `Bearer ${activeToken}` } }
          );
          if (!itemRes.ok) return { id: msg.id, threadId: msg.threadId };
          const itemData = await itemRes.json();
          const headers = itemData.payload?.headers || [];
          const subjectHeader = headers.find((h: any) => h.name === 'Subject')?.value || 'Sin asunto';
          const fromHeader = headers.find((h: any) => h.name === 'From')?.value || 'Desconocido';
          const dateHeader = headers.find((h: any) => h.name === 'Date')?.value || '';

          return {
            id: msg.id,
            threadId: msg.threadId,
            snippet: itemData.snippet || '',
            subject: subjectHeader,
            from: fromHeader,
            date: dateHeader
          };
        } catch {
          return { id: msg.id, threadId: msg.threadId };
        }
      })
    );

    return { messages: detailedMessages };
  } catch (err: any) {
    console.error('Error fetching Gmail messages:', err);
    return { messages: [], error: err.message || 'Error al conectar con Gmail' };
  }
};

/**
 * Send an email via Gmail API
 * Note: Always show confirmation dialog before calling this!
 */
export const sendGmailEmail = async (
  emailData: { to: string; subject: string; body: string },
  token?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const activeToken = token || cachedGmailAccessToken;
  if (!activeToken) {
    return { success: false, error: 'AUTH_REQUIRED' };
  }

  try {
    // Construct RFC 2822 raw message in base64url format
    const utf8Body = unescape(encodeURIComponent(emailData.body));
    const rawMessage = [
      `To: ${emailData.to}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${emailData.subject}`,
      '',
      utf8Body
    ].join('\r\n');

    const encodedMessage = btoa(rawMessage)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${activeToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: encodedMessage })
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      if (res.status === 401) {
        cachedGmailAccessToken = null;
        return { success: false, error: 'AUTH_REQUIRED' };
      }
      throw new Error(errData.error?.message || `Error status ${res.status}`);
    }

    const data = await res.json();
    return { success: true, messageId: data.id };
  } catch (err: any) {
    console.error('Error sending email via Gmail:', err);
    return { success: false, error: err.message || 'Error al enviar correo' };
  }
};
