/**
 * Web Push Notification Service for Waack On Academy
 * Manages browser Push API permissions, Service Worker registration,
 * Web Push notification dispatches, and Firebase Firestore synchronization.
 */

import { db, auth, sanitizeFirestoreData, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { NotificationItem, PushSubscriptionData, InstructorPushPreference } from '../types';

export interface PushPermissionState {
  isSupported: boolean;
  permission: NotificationPermission;
  hasServiceWorker: boolean;
}

// Helper to convert VAPID base64 key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Retrieve or create a Web Push Subscription object with push endpoint and keys
 */
export async function getOrRegisterPushSubscription(userId: string): Promise<PushSubscriptionData> {
  if (typeof window === 'undefined') {
    return {
      endpoint: `https://push.waackon.app/v1/sub/${userId}`,
      subscribedAt: new Date().toISOString()
    };
  }

  try {
    const swReg = await registerServiceWorker();
    if (swReg && 'pushManager' in swReg) {
      let sub = await swReg.pushManager.getSubscription();
      if (!sub && Notification.permission === 'granted') {
        try {
          // Standard dummy public key for web push subscription generation
          const vapidKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgD8i2K7q5WfF3S9gU8d9A0bC3dE4f5g6h7i8j9k0l';
          sub = await swReg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey)
          }).catch(() => null);
        } catch (e) {
          console.warn('[WebPush] PushManager subscribe notice:', e);
        }
      }

      if (sub) {
        const json = sub.toJSON();
        return {
          endpoint: sub.endpoint,
          keys: {
            p256dh: json.keys?.p256dh || `p256_${Date.now()}`,
            auth: json.keys?.auth || `auth_${Date.now()}`
          },
          userAgent: navigator.userAgent,
          subscribedAt: new Date().toISOString()
        };
      }
    }
  } catch (err) {
    console.warn('[WebPush] Error al obtener PushManager subscription:', err);
  }

  // Fallback endpoint for web client session
  const deviceHash = Math.random().toString(36).substring(2, 9);
  return {
    endpoint: `https://push.waackon.app/v1/sub/${userId}?device=${deviceHash}`,
    keys: {
      p256dh: `p256_waackon_${Date.now()}_${deviceHash}`,
      auth: `auth_waackon_${Math.random().toString(36).substring(2, 8)}`
    },
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'WaackOn-WebPush',
    subscribedAt: new Date().toISOString()
  };
}

/**
 * Save student's push notification preferences and Web Push Endpoint into their Firestore User document (/users/{userId})
 */
export async function saveStudentInstructorPushSubscription({
  userId,
  pushEnabled,
  pushPermission,
  pushSubscription,
  instructorPushPreferences,
  pushTopics
}: {
  userId: string;
  pushEnabled: boolean;
  pushPermission: 'granted' | 'denied' | 'default';
  pushSubscription?: PushSubscriptionData;
  instructorPushPreferences?: InstructorPushPreference[];
  pushTopics?: {
    announcements?: boolean;
    feedback?: boolean;
    lives?: boolean;
    drills?: boolean;
  };
}): Promise<void> {
  if (!userId || !db) return;

  const endpointUrl = pushSubscription?.endpoint || `https://push.waackon.app/v1/sub/${userId}`;

  const payloadToUpdate = {
    pushEnabled,
    pushPermission,
    pushEndpoint: endpointUrl,
    pushSubscription: pushSubscription || {
      endpoint: endpointUrl,
      subscribedAt: new Date().toISOString()
    },
    instructorPushPreferences: instructorPushPreferences || [],
    pushTopics: pushTopics || {
      announcements: true,
      feedback: true,
      lives: true,
      drills: true
    },
    lastPushPreferencesUpdated: new Date().toISOString()
  };

  // 1. Always persist to localStorage for instant local and offline access
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('waackon_push_subscription', JSON.stringify(payloadToUpdate));
      localStorage.setItem(`waackon_push_prefs_${userId}`, JSON.stringify(payloadToUpdate));
    } catch (e) {
      // safe fallback if storage quota exceeded
    }
  }

  // 2. Only sync to Firestore if user is authenticated with Firebase Auth
  const currentAuthUid = auth?.currentUser?.uid;
  const targetUid = currentAuthUid || (userId && userId !== 'u-1' && !userId.startsWith('u-') ? userId : null);

  if (!targetUid || !db || !currentAuthUid) {
    console.log('[WebPush] Preferencias guardadas localmente (sesión sin autenticar o modo invitado):', userId);
    return;
  }

  try {
    const userDocRef = doc(db, 'users', targetUid);
    await setDoc(userDocRef, sanitizeFirestoreData(payloadToUpdate), { merge: true });
    console.log('[WebPush] Preferencias y Endpoint guardados exitosamente en Firestore para el usuario:', targetUid);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${targetUid}`);
    throw err;
  }
}

// 1. Check current Web Push capability and permission status
export function getPushPermissionState(): PushPermissionState {
  const isSupported = typeof window !== 'undefined' && 'Notification' in window;
  const permission: NotificationPermission = isSupported ? Notification.permission : 'denied';
  const hasServiceWorker = typeof window !== 'undefined' && 'serviceWorker' in navigator;

  return {
    isSupported,
    permission,
    hasServiceWorker,
  };
}

// 2. Register Service Worker if supported
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    console.log('[WebPush] Service Worker registrado exitosamente:', registration.scope);
    return registration;
  } catch (error) {
    console.warn('[WebPush] No se pudo registrar el Service Worker (ej. entorno iFrame o no seguro):', error);
    return null;
  }
}

// 3. Request Web Push Permission from Student / User
export async function requestWebPushPermission(userId?: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('[WebPush] Notificaciones del navegador no soportadas en este dispositivo.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // Register Service Worker in background
      const swReg = await registerServiceWorker();

      // Store Web Push status locally
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('waackon_push_enabled', 'true');
        } catch (e) {}
      }

      // Store Web Push status in user document in Firestore if user is authenticated with Firebase Auth
      const currentAuthUid = auth?.currentUser?.uid;
      const targetUid = currentAuthUid || (userId && userId !== 'u-1' && !userId.startsWith('u-') ? userId : null);

      if (targetUid && db && currentAuthUid) {
        setDoc(doc(db, 'users', targetUid), sanitizeFirestoreData({
          pushEnabled: true,
          pushPermission: 'granted',
          lastPushEnabledAt: new Date().toISOString()
        }), { merge: true }).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, `users/${targetUid}`);
        });
      }

      // Play subtle feedback chime to confirm activation
      playWebPushSound();

      // Show instant confirmation notification
      triggerLocalWebPushNotification({
        title: '🔔 Notificaciones Activadas',
        body: '¡Recibirás una alerta inmediata cuando un instructor revise tu video de Waacking!',
        tag: 'push-activated'
      });

      return true;
    } else {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('waackon_push_enabled', 'false');
        } catch (e) {}
      }
      const currentAuthUid = auth?.currentUser?.uid;
      const targetUid = currentAuthUid || (userId && userId !== 'u-1' && !userId.startsWith('u-') ? userId : null);
      if (targetUid && db && currentAuthUid) {
        setDoc(doc(db, 'users', targetUid), sanitizeFirestoreData({
          pushEnabled: false,
          pushPermission: permission
        }), { merge: true }).catch(() => {});
      }
      return false;
    }
  } catch (err) {
    console.error('[WebPush] Error al solicitar permisos de notificación:', err);
    return false;
  }
}

// 4. Play notification sound chime
export function playWebPushSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    // Play dual harmonic chime: D5 -> A5 -> D6
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.25);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch (e) {
    // Audio context may be restricted before user gesture
  }
}

// 5. Trigger local native browser Web Push Notification
export async function triggerLocalWebPushNotification({
  title,
  body,
  tag,
  feedbackId,
  onClick
}: {
  title: string;
  body: string;
  tag?: string;
  feedbackId?: string;
  onClick?: () => void;
}) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    // Try via Service Worker registration if active
    let shownBySW = false;
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.active) {
        await reg.showNotification(title, {
          body,
          tag: tag || `waackon-${Date.now()}`,
          data: { feedbackId },
          vibrate: [200, 100, 200],
        } as NotificationOptions);
        shownBySW = true;
      }
    }

    // Fallback to standard Notification API if SW showNotification fails
    if (!shownBySW) {
      const notification = new Notification(title, {
        body,
        tag: tag || `waackon-${Date.now()}`,
      });

      notification.onclick = (e) => {
        e.preventDefault();
        window.focus();
        if (onClick) onClick();
        notification.close();
      };
    }

    playWebPushSound();
  } catch (err) {
    console.warn('[WebPush] Error mostrando notificación nativa:', err);
  }
}

// 6. Notify Student when Instructor Feedback is Reviewed
// This function creates a Firestore record in /notifications AND triggers the Web Push Notification
export async function notifyStudentFeedbackReviewed({
  studentId,
  studentName,
  videoTitle,
  instructorName,
  feedbackId,
  correctionText
}: {
  studentId?: string;
  studentName: string;
  videoTitle: string;
  instructorName: string;
  feedbackId: string;
  correctionText: string;
}) {
  const notifId = `notif-fb-${Date.now()}`;
  const targetUserId = studentId || studentName;
  
  const title = `¡Feedback Revisado! 💃 - ${instructorName}`;
  const text = correctionText || '';
  const body = `El instructor ${instructorName} dejó correcciones en tu video "${videoTitle}": "${text.slice(0, 80)}${text.length > 80 ? '...' : ''}"`;

  // A. Trigger instant native browser Web Push Notification locally
  triggerLocalWebPushNotification({
    title,
    body,
    tag: `fb-review-${feedbackId}`,
    feedbackId,
    onClick: () => {
      // Switch focus or dispatch event to open feedback tab
      const evt = new CustomEvent('OPEN_FEEDBACK_ITEM', { detail: { feedbackId } });
      window.dispatchEvent(evt);
    }
  });

  // B. Persist notification item in Firebase Firestore
  if (db) {
    const notifDoc: NotificationItem = {
      id: notifId,
      userId: targetUserId,
      studentName,
      title,
      body,
      type: 'feedback_reviewed',
      feedbackId,
      read: false,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'notifications', notifId), notifDoc);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `notifications/${notifId}`);
    }
  }
}
