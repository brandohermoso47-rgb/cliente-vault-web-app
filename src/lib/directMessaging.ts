import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { User, DirectMessage, MessagingContact, UserRole } from '../types';
import { INITIAL_INSTRUCTORS } from '../data';

const LOCAL_STORAGE_DM_KEY = 'waackon_unified_direct_messages_v1';
const LOCAL_STORAGE_CONTACTS_KEY = 'waackon_unified_contacts_v1';

/**
 * Generate a unique deterministic conversation ID between two users
 */
export function getConversationId(userId1: string, userId2: string): string {
  const sorted = [userId1, userId2].sort();
  return `dm_${sorted[0]}_${sorted[1]}`;
}

/**
 * Seed initial realistic conversations with instructors and peers so the chat is vibrant immediately
 */
export const INITIAL_CONVERSATIONS: { contact: MessagingContact; messages: DirectMessage[] }[] = [
  {
    contact: {
      id: 'inst-brando',
      name: 'Brando Hermoso',
      displayName: 'Brando Hermoso',
      username: 'brando_waack',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
      role: 'instructor',
      status: 'online',
      category: 'instructor',
      specialty: 'Director de Cátedra • Técnica Base & Rolls',
      level: 'Master',
      country: 'ES',
      lastMessage: 'Recuerda relajar los hombros al rotar los codos en 125 BPM. ¡Gran avance en tu drill!',
      lastMessageTime: '10:45 AM',
      unreadCount: 1
    },
    messages: [
      {
        id: 'msg-seed-1',
        conversationId: 'dm_inst-brando_current',
        senderId: 'inst-brando',
        senderName: 'Brando Hermoso',
        senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
        senderRole: 'instructor',
        receiverId: 'current',
        receiverName: 'Tú',
        receiverAvatar: '',
        receiverRole: 'student',
        text: '¡Hola! Vi que estuviste practicando la sección de Overhand Rolls en el laboratorio de metrónomo.',
        type: 'text',
        createdAt: '2026-08-13T09:30:00Z',
        timestamp: Date.now() - 1000 * 60 * 60 * 4,
        status: 'read',
        isRead: true
      },
      {
        id: 'msg-seed-2',
        conversationId: 'dm_inst-brando_current',
        senderId: 'inst-brando',
        senderName: 'Brando Hermoso',
        senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
        senderRole: 'instructor',
        receiverId: 'current',
        receiverName: 'Tú',
        receiverAvatar: '',
        receiverRole: 'student',
        text: 'Recuerda relajar los hombros al rotar los codos en 125 BPM. ¡Gran avance en tu drill! Si tienes dudas con la caja torácica, avísame aquí.',
        type: 'text',
        createdAt: '2026-08-13T10:45:00Z',
        timestamp: Date.now() - 1000 * 60 * 60 * 3,
        status: 'delivered',
        isRead: false
      }
    ]
  },
  {
    contact: {
      id: 'inst-elena',
      name: 'Elena Rostova',
      displayName: 'Elena Rostova',
      username: 'elena_speedwaack',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=250',
      role: 'instructor',
      status: 'online',
      category: 'instructor',
      specialty: 'Speed-Waack & Síncopas a +128 BPM',
      level: 'Master',
      country: 'FR',
      lastMessage: '¿Te sumas al Live de Síncopas este viernes?',
      lastMessageTime: 'Ayer',
      unreadCount: 0
    },
    messages: [
      {
        id: 'msg-seed-3',
        conversationId: 'dm_inst-elena_current',
        senderId: 'inst-elena',
        senderName: 'Elena Rostova',
        senderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=250',
        senderRole: 'instructor',
        receiverId: 'current',
        receiverName: 'Tú',
        receiverAvatar: '',
        receiverRole: 'student',
        text: '¡Hola! Estamos preparando la coreo rápida de Donna Summer para el viernes. ¿Te sumas al Live de Síncopas?',
        type: 'text',
        createdAt: '2026-08-12T17:20:00Z',
        timestamp: Date.now() - 1000 * 60 * 60 * 20,
        status: 'read',
        isRead: true
      }
    ]
  },
  {
    contact: {
      id: 'u-friend-marilyn',
      name: 'Marilyn',
      displayName: 'Marilyn (Madrid)',
      username: 'marilyn_waack',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
      role: 'student',
      status: 'online',
      category: 'friend',
      specialty: 'Fundamentos & Poses 70s',
      level: 'Nivel 1',
      country: 'ES',
      lastMessage: '¡Terminé la racha de 7 días! ¿Echamos un duelo de práctica?',
      lastMessageTime: '12:15 PM',
      unreadCount: 1
    },
    messages: [
      {
        id: 'msg-seed-4',
        conversationId: 'dm_u-friend-marilyn_current',
        senderId: 'u-friend-marilyn',
        senderName: 'Marilyn',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
        senderRole: 'student',
        receiverId: 'current',
        receiverName: 'Tú',
        receiverAvatar: '',
        receiverRole: 'student',
        text: '¡Hola compi! Estuve probando el reproductor multi-fuente con el playlist de Funk Disco.',
        type: 'text',
        createdAt: '2026-08-13T12:00:00Z',
        timestamp: Date.now() - 1000 * 60 * 90,
        status: 'read',
        isRead: true
      },
      {
        id: 'msg-seed-5',
        conversationId: 'dm_u-friend-marilyn_current',
        senderId: 'u-friend-marilyn',
        senderName: 'Marilyn',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
        senderRole: 'student',
        receiverId: 'current',
        receiverName: 'Tú',
        receiverAvatar: '',
        receiverRole: 'student',
        text: '¡Terminé la racha de 7 días! ¿Echamos un duelo de práctica en el módulo de batallas?',
        type: 'text',
        createdAt: '2026-08-13T12:15:00Z',
        timestamp: Date.now() - 1000 * 60 * 75,
        status: 'delivered',
        isRead: false
      }
    ]
  },
  {
    contact: {
      id: 'u-student-pedro',
      name: 'Pedro',
      displayName: 'Pedro Freestyle',
      username: 'pedro_waack',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
      role: 'student',
      status: 'in_battle',
      category: 'student',
      specialty: 'House & Waacking Fusion',
      level: 'Nivel 2',
      country: 'MX',
      lastMessage: 'El metrónomo táctil a 110 BPM es una locura para clavar el acento.',
      lastMessageTime: '08:10 AM',
      unreadCount: 0
    },
    messages: [
      {
        id: 'msg-seed-6',
        conversationId: 'dm_u-student-pedro_current',
        senderId: 'u-student-pedro',
        senderName: 'Pedro',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
        senderRole: 'student',
        receiverId: 'current',
        receiverName: 'Tú',
        receiverAvatar: '',
        receiverRole: 'student',
        text: 'El metrónomo táctil a 110 BPM es una locura para clavar el acento con vibración.',
        type: 'text',
        createdAt: '2026-08-13T08:10:00Z',
        timestamp: Date.now() - 1000 * 60 * 60 * 5,
        status: 'read',
        isRead: true
      }
    ]
  }
];

/**
 * Load local messages map from LocalStorage
 */
export function getLocalStoredMessages(): Record<string, DirectMessage[]> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DM_KEY);
    if (!raw) {
      // Initialize with seed data
      const initialMap: Record<string, DirectMessage[]> = {};
      INITIAL_CONVERSATIONS.forEach(c => {
        const convId = c.messages[0]?.conversationId || `dm_${c.contact.id}_current`;
        initialMap[convId] = c.messages;
      });
      localStorage.setItem(LOCAL_STORAGE_DM_KEY, JSON.stringify(initialMap));
      return initialMap;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Could not parse stored messages:', err);
    return {};
  }
}

/**
 * Save messages map to LocalStorage
 */
export function saveLocalStoredMessages(messagesMap: Record<string, DirectMessage[]>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_DM_KEY, JSON.stringify(messagesMap));
  } catch (err) {
    console.warn('Could not save messages to LocalStorage:', err);
  }
}

/**
 * Send a direct message to a recipient
 */
export async function sendDirectMessage(
  currentUser: User,
  recipient: MessagingContact | User,
  text: string,
  options?: {
    type?: 'text' | 'audio' | 'drill' | 'image' | 'battle_invite';
    audioDuration?: string;
    attachmentUrl?: string;
    drillDetails?: { title: string; bpm: number; category?: string };
  }
): Promise<DirectMessage> {
  const currentUserId = currentUser.id || auth.currentUser?.uid || 'user-current';
  const recipientId = recipient.id;
  const conversationId = getConversationId(currentUserId, recipientId);
  const now = new Date();

  const newMessage: DirectMessage = {
    id: `dm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    conversationId,
    senderId: currentUserId,
    senderName: currentUser.displayName || currentUser.name || 'Estudiante',
    senderAvatar: currentUser.photoURL || currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
    senderRole: currentUser.role || 'student',
    receiverId: recipientId,
    receiverName: ('displayName' in recipient && recipient.displayName) || recipient.name || 'Destinatario',
    receiverAvatar: ('avatar' in recipient && recipient.avatar) || (recipient as any).photoURL || '',
    receiverRole: recipient.role || 'student',
    text: text.trim(),
    type: options?.type || 'text',
    audioDuration: options?.audioDuration,
    attachmentUrl: options?.attachmentUrl,
    drillDetails: options?.drillDetails,
    createdAt: now.toISOString(),
    timestamp: now.getTime(),
    status: 'sent',
    isRead: false
  };

  // 1. Update LocalStorage cache immediately
  const localMap = getLocalStoredMessages();
  const existingList = localMap[conversationId] || [];
  localMap[conversationId] = [...existingList, newMessage];
  saveLocalStoredMessages(localMap);

  // 2. Sync to Firestore `direct_messages` if user is signed in with Firebase
  if (auth.currentUser) {
    try {
      const path = 'direct_messages';
      await setDoc(doc(db, path, newMessage.id), {
        ...newMessage,
        serverTimestamp: serverTimestamp()
      });
    } catch (err) {
      console.warn('Notice: Offline/Firestore DM save fallback active:', err);
    }
  }

  // 3. Dispatch global message sent event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('waackon-dm-sent', { detail: { message: newMessage } }));
  }

  return newMessage;
}

/**
 * Mark all messages in a conversation as read
 */
export function markConversationAsRead(conversationId: string, currentUserId: string) {
  const localMap = getLocalStoredMessages();
  const list = localMap[conversationId];
  if (!list || list.length === 0) return;

  let changed = false;
  const updatedList = list.map(m => {
    if (m.receiverId === currentUserId && !m.isRead) {
      changed = true;
      return { ...m, isRead: true, status: 'read' as const };
    }
    return m;
  });

  if (changed) {
    localMap[conversationId] = updatedList;
    saveLocalStoredMessages(localMap);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('waackon-dm-read-update'));
    }
  }
}

/**
 * Listen to Firestore direct messages in real time for the active conversation
 */
export function subscribeToConversation(
  conversationId: string,
  onUpdate: (messages: DirectMessage[]) => void
): () => void {
  // Return local storage messages immediately
  const localMap = getLocalStoredMessages();
  if (localMap[conversationId]) {
    onUpdate(localMap[conversationId]);
  }

  if (!auth.currentUser) {
    // Listen to local changes via custom window events
    const handler = () => {
      const updatedMap = getLocalStoredMessages();
      onUpdate(updatedMap[conversationId] || []);
    };
    window.addEventListener('waackon-dm-sent', handler);
    window.addEventListener('waackon-dm-read-update', handler);
    return () => {
      window.removeEventListener('waackon-dm-sent', handler);
      window.removeEventListener('waackon-dm-read-update', handler);
    };
  }

  const path = 'direct_messages';
  try {
    const q = query(
      collection(db, path),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const firestoreMsgs: DirectMessage[] = [];
        snapshot.forEach(docSnap => {
          firestoreMsgs.push(docSnap.data() as DirectMessage);
        });

        // Merge with local storage
        const currentLocal = getLocalStoredMessages();
        currentLocal[conversationId] = firestoreMsgs;
        saveLocalStoredMessages(currentLocal);
        onUpdate(firestoreMsgs);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribe();
  } catch (err) {
    console.warn('Notice: Falling back to local subscription:', err);
    return () => {};
  }
}

/**
 * Get total unread direct messages count across all conversations
 */
export function getTotalUnreadDMsCount(currentUserId: string): number {
  const localMap = getLocalStoredMessages();
  let count = 0;
  Object.values(localMap).forEach(list => {
    list.forEach(m => {
      if (m.receiverId === currentUserId && !m.isRead) {
        count++;
      }
    });
  });
  return count;
}
