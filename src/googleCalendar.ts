import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';
import { CalendarEvent } from './types';

// Google Auth Provider configured with Google Calendar scopes
export const googleCalendarProvider = new GoogleAuthProvider();
googleCalendarProvider.addScope('https://www.googleapis.com/auth/calendar');
googleCalendarProvider.addScope('https://www.googleapis.com/auth/calendar.events');
googleCalendarProvider.setCustomParameters({
  prompt: 'select_account'
});

// Cache access token in memory (never localStorage)
let cachedCalendarAccessToken: string | null = null;

export const setCalendarAccessToken = (token: string | null) => {
  cachedCalendarAccessToken = token;
};

export const getCalendarAccessToken = (): string | null => {
  return cachedCalendarAccessToken;
};

/**
 * Sign in user with Google to grant Google Calendar permissions
 */
export const signInForGoogleCalendar = async (): Promise<string> => {
  try {
    const result = await signInWithPopup(auth, googleCalendarProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso de Google Calendar.');
    }
    cachedCalendarAccessToken = credential.accessToken;
    return cachedCalendarAccessToken;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      throw new Error('La ventana de autenticación fue cerrada por el usuario.');
    }
    console.error('Error al iniciar sesión con Google Calendar:', error);
    throw error;
  }
};

/**
 * Helper to construct ISO Date String for Google Calendar
 */
function parseEventTimes(dateStr: string, timeStr: string, durationStr: string) {
  // dateStr is YYYY-MM-DD
  // timeStr is HH:MM or similar (e.g. "19:00", "20:30")
  const [hours, minutes] = (timeStr || "19:00").split(':').map(n => parseInt(n, 10) || 0);
  
  const startDate = new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
  
  // Parse duration e.g. "1.5 horas", "90 min", "2 horas"
  let durationMinutes = 90; // default 1.5 hours
  if (durationStr) {
    if (durationStr.includes('hora')) {
      const hoursNum = parseFloat(durationStr.replace(/[^0-9.]/g, '')) || 1.5;
      durationMinutes = Math.round(hoursNum * 60);
    } else if (durationStr.includes('min')) {
      durationMinutes = parseInt(durationStr.replace(/[^0-9]/g, ''), 10) || 90;
    }
  }

  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

  return {
    startIso: startDate.toISOString(),
    endIso: endDate.toISOString()
  };
}

export interface AddGoogleEventResult {
  success: boolean;
  eventId?: string;
  htmlLink?: string;
  meetUrl?: string;
  error?: string;
}

/**
 * Generates a formatted Google Meet URL
 */
export const generateGoogleMeetRoomUrl = (customSeed?: string): string => {
  const seed = customSeed || Math.random().toString(36).substring(2, 10);
  const cleanSeed = (seed || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const part1 = cleanSeed.slice(0, 3) || 'waa';
  const part2 = cleanSeed.slice(3, 7) || 'ckon';
  const part3 = cleanSeed.slice(7, 10) || 'live';
  return `https://meet.google.com/${part1}-${part2}-${part3}`;
};

/**
 * Adds a single Waack On CalendarEvent directly to the user's primary Google Calendar via API
 * Requesting automatic Google Meet video call creation (conferenceDataVersion=1)
 */
export const addEventToGoogleCalendar = async (
  event: CalendarEvent,
  token?: string
): Promise<AddGoogleEventResult> => {
  const activeToken = token || cachedCalendarAccessToken;

  if (!activeToken) {
    return {
      success: false,
      error: 'AUTH_REQUIRED'
    };
  }

  const { startIso, endIso } = parseEventTimes(event.date, event.time, event.duration);
  const meetLink = event.meetUrl || generateGoogleMeetRoomUrl(event.title || event.id);

  const googleEventBody = {
    summary: `[Waack On] ${event.title}`,
    description: `${event.description}\n\nInstructor: ${event.instructor}\nUnirse a la clase en Google Meet: ${meetLink}\nOrganizado por La Academia de Waack On.`,
    start: {
      dateTime: startIso,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    },
    end: {
      dateTime: endIso,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    },
    location: meetLink,
    conferenceData: {
      createRequest: {
        requestId: `waackon-meet-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        conferenceSolutionKey: {
          type: 'hangoutsMeet'
        }
      }
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'email', minutes: 120 }
      ]
    }
  };

  try {
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${activeToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(googleEventBody)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      if (res.status === 401) {
        cachedCalendarAccessToken = null;
        return { success: false, error: 'AUTH_REQUIRED' };
      }
      throw new Error(errData.error?.message || `Error status ${res.status}`);
    }

    const data = await res.json();
    const createdMeetUrl = data.hangoutLink || data.conferenceData?.entryPoints?.[0]?.uri || meetLink;

    return {
      success: true,
      eventId: data.id,
      htmlLink: data.htmlLink,
      meetUrl: createdMeetUrl
    };
  } catch (err: any) {
    console.error('Error de API Google Calendar:', err);
    return {
      success: false,
      error: err.message || 'Error al conectar con Google Calendar'
    };
  }
};

/**
 * Creates a standard direct web link to open Google Calendar event creation dialog in browser
 */
export const getGoogleCalendarWebUrl = (event: CalendarEvent): string => {
  const { startIso, endIso } = parseEventTimes(event.date, event.time, event.duration);
  
  // Format dates for Google Calendar URL: YYYYMMDDTHHMMSSZ
  const formatUtc = (isoStr: string) => {
    return isoStr.replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const datesParam = `${formatUtc(startIso)}/${formatUtc(endIso)}`;
  const title = encodeURIComponent(`[Waack On] ${event.title}`);
  const details = encodeURIComponent(`${event.description}\n\nInstructor: ${event.instructor}\nPlataforma: Waack On`);
  const location = encodeURIComponent(event.meetUrl || 'Waack On Live Room');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${datesParam}&details=${details}&location=${location}`;
};
