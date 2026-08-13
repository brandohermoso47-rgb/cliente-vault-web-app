import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Send, 
  X, 
  Minus, 
  Maximize2, 
  Minimize2, 
  Search, 
  Users, 
  Sparkles, 
  UserCheck, 
  GraduationCap, 
  Crown, 
  Globe, 
  Swords, 
  Mic, 
  MicOff, 
  Smile, 
  Music, 
  Flame, 
  Check, 
  CheckCheck, 
  ChevronLeft, 
  Circle, 
  Paperclip,
  Play,
  Pause,
  ArrowRight,
  ExternalLink,
  Volume2,
  Bell
} from 'lucide-react';
import { User, DirectMessage, MessagingContact, UserRole, ChatMessage } from '../types';
import { 
  getConversationId, 
  getLocalStoredMessages, 
  saveLocalStoredMessages, 
  sendDirectMessage, 
  subscribeToConversation, 
  markConversationAsRead,
  getTotalUnreadDMsCount,
  INITIAL_CONVERSATIONS
} from '../lib/directMessaging';
import { INITIAL_INSTRUCTORS, INITIAL_CHAT_MESSAGES } from '../data';
import { listenToFriendships, listenToUsersProfiles } from '../lib/friendsAndBattles';
import { auth } from '../lib/firebase';

interface UnifiedFloatingMessengerProps {
  currentUser: User;
  onOpenLiveBattle?: (friend: User) => void;
  onOpenClassroomLesson?: (lessonId: string) => void;
  onOpenMultiSourceMusic?: () => void;
}

/**
 * Global helper to trigger the floating messenger to open directly with a specific user
 */
export function openDirectMessageWithUser(contact: Partial<MessagingContact> | Partial<User>) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('waackon-open-dm-with-user', { detail: { contact } }));
  }
}

export const UnifiedFloatingMessenger: React.FC<UnifiedFloatingMessengerProps> = ({
  currentUser,
  onOpenLiveBattle,
  onOpenClassroomLesson,
  onOpenMultiSourceMusic
}) => {
  // Floating Messenger Open/Close/Minimize state
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Active Tab & View
  const [activeCategory, setActiveCategory] = useState<'all' | 'instructors' | 'friends' | 'students' | 'global'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeContact, setActiveContact] = useState<MessagingContact | null>(null);

  // Messages & Conversations state
  const [messagesMap, setMessagesMap] = useState<Record<string, DirectMessage[]>>({});
  const [activeMessages, setActiveMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [unreadTotal, setUnreadTotal] = useState(0);

  // Global lobby messages
  const [globalChatMessages, setGlobalChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [globalInputText, setGlobalInputText] = useState('');

  // Friends from Firestore/local
  const [friendsList, setFriendsList] = useState<MessagingContact[]>([]);

  // Voice memo simulation state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<any>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Emoji picker toggle
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Notification Teaser / Badge
  const [latestTeaser, setLatestTeaser] = useState<{ sender: string; text: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Initial Load of Messages & Total Unread
  useEffect(() => {
    const loaded = getLocalStoredMessages();
    setMessagesMap(loaded);
    setUnreadTotal(getTotalUnreadDMsCount(currentUser.id));
  }, [currentUser.id]);

  // 2. Listen to Friends from friendships collection
  useEffect(() => {
    if (!currentUser.id) return;
    const unsubFriendships = listenToFriendships(currentUser.id, (docs) => {
      const acceptedDocs = docs.filter(d => d.status === 'accepted');
      const friendUids = acceptedDocs.map(d => d.users.find(u => u !== currentUser.id)).filter((u): u is string => Boolean(u));

      if (friendUids.length > 0) {
        listenToUsersProfiles(friendUids, (profiles) => {
          const formattedFriends: MessagingContact[] = profiles.map(p => ({
            id: p.id,
            name: p.displayName || p.name,
            displayName: p.displayName || p.name,
            username: p.username,
            avatar: p.photoURL || p.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
            role: p.role || 'student',
            status: p.status || (p.isOnline ? 'online' : 'offline'),
            category: 'friend',
            specialty: p.level || 'Estudiante de Waacking',
            level: p.level,
            unreadCount: 0
          }));
          setFriendsList(formattedFriends);
        });
      }
    });

    return () => unsubFriendships();
  }, [currentUser.id]);

  // 3. Listen to global direct message events
  useEffect(() => {
    const handleDmSent = () => {
      const updated = getLocalStoredMessages();
      setMessagesMap(updated);
      setUnreadTotal(getTotalUnreadDMsCount(currentUser.id));
    };

    const handleReadUpdate = () => {
      const updated = getLocalStoredMessages();
      setMessagesMap(updated);
      setUnreadTotal(getTotalUnreadDMsCount(currentUser.id));
    };

    const handleOpenWithUser = (e: any) => {
      const targetContact = e.detail?.contact;
      if (targetContact) {
        const fullContact: MessagingContact = {
          id: targetContact.id || 'target-id',
          name: targetContact.displayName || targetContact.name || 'Bailarín',
          displayName: targetContact.displayName || targetContact.name || 'Bailarín',
          username: targetContact.username || 'dancer',
          avatar: targetContact.photoURL || targetContact.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
          role: targetContact.role || 'student',
          status: targetContact.status || 'online',
          category: targetContact.role === 'instructor' ? 'instructor' : 'student',
          specialty: targetContact.specialty || targetContact.bio || 'Waacking Performer',
          unreadCount: 0
        };
        setActiveContact(fullContact);
        setIsOpen(true);
        setIsMinimized(false);
      }
    };

    window.addEventListener('waackon-dm-sent', handleDmSent);
    window.addEventListener('waackon-dm-read-update', handleReadUpdate);
    window.addEventListener('waackon-open-dm-with-user', handleOpenWithUser);

    return () => {
      window.removeEventListener('waackon-dm-sent', handleDmSent);
      window.removeEventListener('waackon-dm-read-update', handleReadUpdate);
      window.removeEventListener('waackon-open-dm-with-user', handleOpenWithUser);
    };
  }, [currentUser.id]);

  // 4. Subscribe to active conversation messages
  useEffect(() => {
    if (!activeContact) return;

    const convId = getConversationId(currentUser.id, activeContact.id);
    const legacyConvId = `dm_${activeContact.id}_current`;

    // Mark as read
    markConversationAsRead(convId, currentUser.id);
    markConversationAsRead(legacyConvId, currentUser.id);

    const unsub = subscribeToConversation(convId, (msgs) => {
      if (msgs && msgs.length > 0) {
        setActiveMessages(msgs);
      } else {
        // Fallback to legacy seed if any
        const fallback = messagesMap[legacyConvId] || messagesMap[convId] || [];
        setActiveMessages(fallback);
      }
    });

    return () => unsub();
  }, [activeContact, currentUser.id, messagesMap]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (activeContact || activeCategory === 'global') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages, globalChatMessages, activeContact, activeCategory]);

  // Voice recording timer
  useEffect(() => {
    if (isRecordingVoice) {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecordingVoice]);

  // Assemble full contacts catalog
  const instructorsCatalog: MessagingContact[] = INITIAL_INSTRUCTORS.map(inst => ({
    id: inst.id,
    name: inst.name,
    displayName: inst.name,
    username: inst.id.replace('inst-', '') + '_waack',
    avatar: inst.avatar,
    role: 'instructor',
    status: 'online',
    category: 'instructor',
    specialty: inst.specialty || inst.role,
    level: 'Master',
    country: 'Global',
    unreadCount: 0
  }));

  // Default seed contacts from INITIAL_CONVERSATIONS
  const seedContacts = INITIAL_CONVERSATIONS.map(c => c.contact);

  // Combine and deduplicate contacts
  const allContactsMap = new Map<string, MessagingContact>();
  seedContacts.forEach(c => allContactsMap.set(c.id, c));
  instructorsCatalog.forEach(c => {
    if (!allContactsMap.has(c.id)) {
      allContactsMap.set(c.id, c);
    }
  });
  friendsList.forEach(c => allContactsMap.set(c.id, c));

  // Compute latest message & unread badge for each contact
  const allContacts: MessagingContact[] = Array.from(allContactsMap.values()).map(contact => {
    const convId = getConversationId(currentUser.id, contact.id);
    const legacyId = `dm_${contact.id}_current`;
    const convMsgs = messagesMap[convId] || messagesMap[legacyId] || [];
    const lastMsg = convMsgs[convMsgs.length - 1];
    const unreadCount = convMsgs.filter(m => m.receiverId === currentUser.id && !m.isRead).length;

    return {
      ...contact,
      lastMessage: lastMsg ? lastMsg.text : contact.lastMessage || 'Iniciar conversación...',
      lastMessageTime: lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : contact.lastMessageTime || '',
      unreadCount
    };
  });

  // Filter contacts by active tab & search query
  const filteredContacts = allContacts.filter(contact => {
    if (contact.id === currentUser.id) return false;
    
    // Category filtering
    if (activeCategory === 'instructors' && contact.category !== 'instructor' && contact.role !== 'instructor') return false;
    if (activeCategory === 'friends' && contact.category !== 'friend') return false;
    if (activeCategory === 'students' && contact.category !== 'student' && contact.role === 'instructor') return false;

    // Search query filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = contact.name.toLowerCase().includes(q);
      const matchUsername = (contact.username || '').toLowerCase().includes(q);
      const matchSpecialty = (contact.specialty || '').toLowerCase().includes(q);
      return matchName || matchUsername || matchSpecialty;
    }

    return true;
  });

  // Send Direct Message Handler
  const handleSendMessage = async (textToSend?: string, options?: any) => {
    const text = (textToSend || inputText).trim();
    if (!text && !options) return;
    if (!activeContact) return;

    setInputText('');
    setShowEmojiPicker(false);

    try {
      const newMsg = await sendDirectMessage(currentUser, activeContact, text, options);
      setActiveMessages(prev => [...prev, newMsg]);

      // If sending to an instructor or seed friend, simulate an automated instant response after 2.5s for rich interactivity
      if (activeContact.role === 'instructor' && !options?.type) {
        setTimeout(async () => {
          const autoReply: DirectMessage = {
            id: `dm_reply_${Date.now()}`,
            conversationId: getConversationId(currentUser.id, activeContact.id),
            senderId: activeContact.id,
            senderName: activeContact.name,
            senderAvatar: activeContact.avatar,
            senderRole: activeContact.role,
            receiverId: currentUser.id,
            receiverName: currentUser.name,
            receiverAvatar: currentUser.avatar,
            receiverRole: currentUser.role,
            text: `¡Excelente mensaje! He tomado nota de tu consulta sobre ${text.length > 25 ? text.slice(0, 25) + '...' : 'tu técnica'}. Practica con el metrónomo en 115 BPM y revisaremos tus avances en la próxima sesión en vivo. ✨`,
            type: 'text',
            createdAt: new Date().toISOString(),
            timestamp: Date.now(),
            status: 'delivered',
            isRead: false
          };

          const local = getLocalStoredMessages();
          const cid = getConversationId(currentUser.id, activeContact.id);
          local[cid] = [...(local[cid] || []), autoReply];
          saveLocalStoredMessages(local);
          setActiveMessages(prev => [...prev, autoReply]);
          setUnreadTotal(getTotalUnreadDMsCount(currentUser.id));
        }, 2200);
      }
    } catch (err) {
      console.error('Error sending direct message:', err);
    }
  };

  // Send Global Lobby Chat Message
  const handleSendGlobalMessage = () => {
    if (!globalInputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `gm-${Date.now()}`,
      user: currentUser.displayName || currentUser.name,
      avatar: currentUser.photoURL || currentUser.avatar,
      text: globalInputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      role: currentUser.role
    };

    setGlobalChatMessages(prev => [...prev, newMsg]);
    setGlobalInputText('');
  };

  // Send Voice Memo Simulation
  const handleStopAndSendVoiceMemo = () => {
    setIsRecordingVoice(false);
    const durationStr = `0:${recordingSeconds < 10 ? '0' : ''}${recordingSeconds}`;
    handleSendMessage('🎙️ Mensaje de audio', {
      type: 'audio',
      audioDuration: durationStr
    });
  };

  // Quick Suggestion Prompts
  const quickPrompts = [
    '✨ ¡Hola maestro! ¿Cómo relajo los hombros en rolls?',
    '⚔️ ¡Vamos a echar una batalla de práctica!',
    '🎧 ¿Qué track recomiendas a 120 BPM?',
    '🔥 ¡Gran sesión de entrenamiento hoy!'
  ];

  const danceEmojis = ['💃', '🕺', '👑', '🔥', '⚡', '🏆', '🎵', '💖', '👏', '🎯', '🙌', '🌟'];

  return (
    <>
      {/* 1. FLOATING TRIGGER BUTTON (Always visible bottom-right) */}
      <div id="waackon-floating-messenger-trigger" className="fixed bottom-6 right-6 z-[9990] flex items-end gap-3 pointer-events-auto">
        {/* Teaser pill if incoming unread */}
        <AnimatePresence>
          {unreadTotal > 0 && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              onClick={() => {
                setIsOpen(true);
                setIsMinimized(false);
              }}
              className="bg-[#121212]/95 backdrop-blur-md border border-[#E9C349]/60 px-4 py-2.5 rounded-2xl shadow-[0_8px_30px_rgba(233,195,73,0.25)] text-white flex items-center gap-3 cursor-pointer hover:border-[#E9C349] transition-all group"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-[#E9C349] animate-ping shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-[#E9C349] font-mono block uppercase text-[10px] tracking-wider">
                  {unreadTotal} {unreadTotal === 1 ? 'Mensaje Nuevo' : 'Mensajes Nuevos'}
                </span>
                <span className="text-gray-300 text-[11px] truncate max-w-[170px] block">
                  Instructores & amigos en línea
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#E9C349] group-hover:translate-x-0.5 transition-transform" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Floating Trigger Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (isOpen && isMinimized) {
              setIsMinimized(false);
            } else {
              setIsOpen(!isOpen);
              setIsMinimized(false);
            }
          }}
          className={`relative p-3.5 sm:p-4 rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.6)] border transition-all flex items-center justify-center cursor-pointer ${
            isOpen 
              ? 'bg-[#9A2B3C] text-white border-[#E9C349]' 
              : 'bg-gradient-to-br from-[#1E1E1E] to-[#121212] text-[#E9C349] border-[#E9C349]/60 hover:border-[#E9C349] shadow-[0_0_25px_rgba(233,195,73,0.2)]'
          }`}
          title="Abrir Mensajería Unificada Waack On"
        >
          {isOpen && !isMinimized ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <>
              <MessageSquare className="w-6 h-6 text-[#E9C349]" />
              {unreadTotal > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#9A2B3C] border-2 border-black text-white text-[10px] font-bold font-mono rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  {unreadTotal > 9 ? '+9' : unreadTotal}
                </span>
              )}
              {/* Online Pulse Dot */}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-black rounded-full" />
            </>
          )}
        </motion.button>
      </div>

      {/* 2. FLOATING MESSENGER WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="waackon-unified-floating-window"
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '56px' : isExpanded ? '85vh' : '620px',
              width: isExpanded ? '92vw' : '420px',
              maxWidth: '680px'
            }}
            exit={{ opacity: 0, y: 40, scale: 0.94 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={`fixed bottom-24 right-4 sm:right-6 z-[9995] bg-[#121212] border border-[#2B2B2B] shadow-[0_20px_60px_rgba(0,0,0,0.85)] rounded-3xl overflow-hidden flex flex-col backdrop-blur-xl text-white font-sans ${
              isMinimized ? 'h-14 overflow-hidden shadow-md' : ''
            }`}
          >
            {/* WINDOW TOP HEADER */}
            <div className="bg-gradient-to-r from-[#181818] via-[#151515] to-[#1A1A1A] border-b border-[#262626] px-4 py-3 flex items-center justify-between shrink-0 select-none">
              {activeContact ? (
                /* Header in Active Conversation */
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setActiveContact(null)}
                    className="p-1.5 rounded-xl bg-[#222222] hover:bg-[#2F2F2F] text-gray-300 hover:text-white transition-colors cursor-pointer"
                    title="Volver a la lista de contactos"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="relative">
                    <img 
                      src={activeContact.avatar} 
                      alt={activeContact.name} 
                      className="w-8 h-8 rounded-xl object-cover border border-[#E9C349]/40" 
                    />
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[#121212] ${
                      activeContact.status === 'in_battle' 
                        ? 'bg-amber-500' 
                        : activeContact.status === 'online' 
                        ? 'bg-emerald-500' 
                        : 'bg-gray-500'
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-white truncate max-w-[150px]">
                        {activeContact.displayName || activeContact.name}
                      </h4>
                      {activeContact.role === 'instructor' && (
                        <span className="px-1.5 py-0.5 bg-[#E9C349]/20 border border-[#E9C349]/50 text-[#E9C349] text-[9px] font-mono font-bold rounded-md flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5" /> DOCENTE
                        </span>
                      )}
                      {activeContact.category === 'friend' && (
                        <span className="px-1.5 py-0.5 bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[9px] font-mono font-bold rounded-md flex items-center gap-0.5">
                          <UserCheck className="w-2.5 h-2.5" /> AMIGO
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono truncate">
                      {activeContact.status === 'online' ? '🟢 En línea ahora' : activeContact.status === 'in_battle' ? '⚔️ En duelo de práctica' : '⚫ Desconectado'}
                    </p>
                  </div>
                </div>
              ) : (
                /* Header in Contacts / Inbox View */
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[#E9C349]/20 border border-[#E9C349]/50 flex items-center justify-center text-[#E9C349]">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-[#E9C349] flex items-center gap-1.5">
                      Mensajería Waack On
                    </h3>
                    <p className="text-[10px] text-gray-400 leading-tight">
                      Hub de comunicación unificado
                    </p>
                  </div>
                </div>
              )}

              {/* Window Controls (Minimize, Expand, Close) */}
              <div className="flex items-center gap-1 text-gray-400">
                {activeContact && (
                  <button
                    onClick={() => {
                      if (onOpenLiveBattle) {
                        onOpenLiveBattle({
                          id: activeContact.id,
                          name: activeContact.name,
                          avatar: activeContact.avatar,
                          role: activeContact.role,
                          completedLessons: [],
                          points: 500
                        });
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-[#242424] hover:text-[#E9C349] transition-colors cursor-pointer text-xs flex items-center gap-1 font-mono mr-1"
                    title="Desafiar a Duelo de Waacking"
                  >
                    <Swords className="w-3.5 h-3.5 text-[#E9C349]" />
                    <span className="hidden sm:inline text-[10px]">Duelo</span>
                  </button>
                )}

                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 rounded-lg hover:bg-[#242424] hover:text-white transition-colors cursor-pointer"
                  title={isMinimized ? "Restaurar" : "Minimizar"}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 rounded-lg hover:bg-[#242424] hover:text-white transition-colors cursor-pointer hidden sm:block"
                  title={isExpanded ? "Tamaño estándar" : "Expandir"}
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[#9A2B3C] hover:text-white transition-colors cursor-pointer"
                  title="Cerrar mensajería"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* IF NOT MINIMIZED: RENDER MAIN BODY */}
            {!isMinimized && (
              <div className="flex-1 flex flex-col overflow-hidden bg-[#121212]">
                {/* VIEW 1: ACTIVE DIRECT MESSAGE CONVERSATION */}
                {activeContact ? (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Active Conversation Message List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-gradient-to-b from-[#141414] to-[#101010]">
                      {/* Welcome banner at top of chat */}
                      <div className="text-center py-3 border-b border-[#222222] mb-3">
                        <img 
                          src={activeContact.avatar} 
                          alt={activeContact.name} 
                          className="w-14 h-14 rounded-2xl mx-auto object-cover border-2 border-[#E9C349]/40 mb-2 shadow-lg" 
                        />
                        <h4 className="font-bold text-sm text-white">
                          {activeContact.displayName || activeContact.name}
                        </h4>
                        <p className="text-xs text-gray-400 max-w-xs mx-auto mt-0.5">
                          {activeContact.specialty || 'Miembro de la comunidad Waack On'}
                        </p>
                        <div className="mt-2 flex items-center justify-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1F1F1F] border border-[#333333] text-gray-300">
                            Canal Cifrado Directo
                          </span>
                        </div>
                      </div>

                      {/* Messages Stream */}
                      {activeMessages.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-xs">
                          <Sparkles className="w-6 h-6 mx-auto mb-2 text-[#E9C349]/60 animate-pulse" />
                          <p>No hay mensajes previos con {activeContact.name}.</p>
                          <p className="text-[11px] text-gray-400 mt-1">¡Inicia la conversación o envíale una duda técnica!</p>
                        </div>
                      ) : (
                        activeMessages.map((msg) => {
                          const isMe = msg.senderId === currentUser.id || msg.senderId === 'current' || msg.senderId === auth.currentUser?.uid;
                          return (
                            <div 
                              key={msg.id} 
                              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            >
                              <div className="flex items-end gap-2 max-w-[85%]">
                                {!isMe && (
                                  <img 
                                    src={msg.senderAvatar || activeContact.avatar} 
                                    alt={msg.senderName} 
                                    className="w-6 h-6 rounded-lg object-cover shrink-0 mb-1 border border-[#333333]" 
                                  />
                                )}

                                <div 
                                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                                    isMe 
                                      ? 'bg-gradient-to-br from-[#1E1E1E] to-[#181818] border border-[#E9C349]/60 text-white rounded-br-none shadow-[0_4px_15px_rgba(0,0,0,0.4)]' 
                                      : 'bg-[#1C1C1C] border border-[#2B2B2B] text-gray-100 rounded-bl-none shadow-[0_4px_15px_rgba(0,0,0,0.3)]'
                                  }`}
                                >
                                  {/* Audio message card */}
                                  {msg.type === 'audio' ? (
                                    <div className="flex items-center gap-2.5 py-1">
                                      <button 
                                        onClick={() => setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)}
                                        className="w-7 h-7 rounded-full bg-[#E9C349] text-black flex items-center justify-center shrink-0 cursor-pointer shadow"
                                      >
                                        {playingAudioId === msg.id ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black ml-0.5" />}
                                      </button>
                                      <div className="flex-1">
                                        <div className="h-2 w-28 bg-[#333333] rounded-full overflow-hidden flex items-center">
                                          <div className={`h-full bg-[#E9C349] ${playingAudioId === msg.id ? 'w-full animate-pulse transition-all duration-3000' : 'w-1/3'}`} />
                                        </div>
                                        <span className="text-[10px] font-mono text-gray-400 mt-1 block">
                                          Nota de voz ({msg.audioDuration || '0:15'})
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="whitespace-pre-wrap font-sans">{msg.text}</p>
                                  )}

                                  {/* Message status & time */}
                                  <div className={`flex items-center gap-1 mt-1 text-[9px] font-mono ${isMe ? 'text-[#E9C349]/80 justify-end' : 'text-gray-500 justify-start'}`}>
                                    <span>
                                      {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isMe && (
                                      <span>
                                        {msg.status === 'read' || msg.isRead ? (
                                          <CheckCheck className="w-3 h-3 text-[#E9C349]" />
                                        ) : (
                                          <Check className="w-3 h-3 text-gray-400" />
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Smart Prompts */}
                    <div className="px-3 py-1.5 bg-[#141414] border-t border-[#222222] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      {quickPrompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(prompt)}
                          className="px-2.5 py-1 rounded-full bg-[#1C1C1C] hover:bg-[#252525] border border-[#2E2E2E] text-[10px] text-gray-300 hover:text-white shrink-0 whitespace-nowrap transition-colors cursor-pointer"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>

                    {/* Voice Recording Active Bar */}
                    {isRecordingVoice && (
                      <div className="bg-[#9A2B3C]/90 px-4 py-2 flex items-center justify-between text-white border-t border-[#9A2B3C]">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-400 animate-ping" />
                          <span className="font-mono text-xs font-bold">
                            Grabando audio: 0:{recordingSeconds < 10 ? '0' : ''}{recordingSeconds}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsRecordingVoice(false)}
                            className="text-xs text-gray-200 hover:text-white px-2 py-1 bg-black/30 rounded-lg cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleStopAndSendVoiceMemo}
                            className="text-xs bg-white text-black font-bold px-3 py-1 rounded-lg cursor-pointer flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" /> Enviar
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Emoji Bar Picker Popover */}
                    {showEmojiPicker && (
                      <div className="p-2 bg-[#1A1A1A] border-t border-[#2B2B2B] flex items-center justify-between gap-1 overflow-x-auto">
                        {danceEmojis.map((emoji, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setInputText(prev => prev + emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="p-1.5 hover:bg-[#2A2A2A] rounded-lg text-base cursor-pointer transition-transform hover:scale-125"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Input Composer */}
                    <div className="p-3 bg-[#161616] border-t border-[#242424] flex items-center gap-2">
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`p-2 rounded-xl text-gray-400 hover:text-[#E9C349] hover:bg-[#222222] transition-colors cursor-pointer ${
                          showEmojiPicker ? 'text-[#E9C349] bg-[#222222]' : ''
                        }`}
                        title="Añadir emojis"
                      >
                        <Smile className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (isRecordingVoice) {
                            handleStopAndSendVoiceMemo();
                          } else {
                            setIsRecordingVoice(true);
                          }
                        }}
                        className={`p-2 rounded-xl text-gray-400 hover:text-[#E9C349] hover:bg-[#222222] transition-colors cursor-pointer ${
                          isRecordingVoice ? 'text-red-400 bg-red-950/40 animate-pulse' : ''
                        }`}
                        title="Grabar nota de voz"
                      >
                        <Mic className="w-4 h-4" />
                      </button>

                      <input
                        ref={inputRef}
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder={`Escribe a ${activeContact.displayName || activeContact.name}...`}
                        className="flex-1 bg-[#202020] border border-[#2E2E2E] focus:border-[#E9C349] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition-all"
                      />

                      <button
                        disabled={!inputText.trim()}
                        onClick={() => handleSendMessage()}
                        className="p-2.5 rounded-xl bg-[#E9C349] hover:bg-[#d4ae36] disabled:opacity-40 disabled:hover:bg-[#E9C349] text-black font-bold transition-all shadow-md cursor-pointer flex items-center justify-center"
                        title="Enviar mensaje"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : activeCategory === 'global' ? (
                  /* VIEW 2: GLOBAL ACADEMY LOBBY CHAT */
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-4 py-2 bg-[#1A1A1A] border-b border-[#242424] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Globe className="w-3.5 h-3.5 text-[#E9C349]" />
                        <span className="font-bold text-white">Sala Global de la Academia</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> En Vivo
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-gradient-to-b from-[#141414] to-[#101010]">
                      {globalChatMessages.map((msg) => (
                        <div key={msg.id} className="flex items-start gap-2.5 group">
                          <img 
                            src={msg.avatar} 
                            alt={msg.user} 
                            className="w-7 h-7 rounded-xl object-cover border border-[#333333] shrink-0 mt-0.5" 
                          />
                          <div className="flex-1 min-w-0 bg-[#1A1A1A] border border-[#2B2B2B] p-2.5 rounded-2xl rounded-tl-none">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-white">{msg.user}</span>
                                {msg.role === 'instructor' && (
                                  <span className="px-1 py-0.2 bg-[#E9C349]/20 text-[#E9C349] text-[8px] font-mono font-bold rounded">
                                    DOCENTE
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] font-mono text-gray-500">{msg.time}</span>
                            </div>
                            <p className="text-xs text-gray-200 leading-relaxed font-sans">{msg.text}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Global Chat Input */}
                    <div className="p-3 bg-[#161616] border-t border-[#242424] flex items-center gap-2">
                      <input
                        type="text"
                        value={globalInputText}
                        onChange={(e) => setGlobalInputText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSendGlobalMessage();
                          }
                        }}
                        placeholder="Escribe en el chat global de la academia..."
                        className="flex-1 bg-[#202020] border border-[#2E2E2E] focus:border-[#E9C349] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition-all"
                      />
                      <button
                        disabled={!globalInputText.trim()}
                        onClick={handleSendGlobalMessage}
                        className="p-2.5 rounded-xl bg-[#E9C349] hover:bg-[#d4ae36] disabled:opacity-40 text-black font-bold transition-all cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* VIEW 3: INBOX / CONTACTS DIRECTORY LIST */
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Category Filter Tabs */}
                    <div className="p-2.5 bg-[#161616] border-b border-[#242424] flex items-center gap-1 overflow-x-auto no-scrollbar">
                      <button
                        onClick={() => setActiveCategory('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shrink-0 ${
                          activeCategory === 'all' 
                            ? 'bg-[#E9C349] text-black shadow-sm' 
                            : 'bg-[#202020] text-gray-400 hover:text-white'
                        }`}
                      >
                        Todos
                      </button>

                      <button
                        onClick={() => setActiveCategory('instructors')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                          activeCategory === 'instructors' 
                            ? 'bg-[#E9C349] text-black shadow-sm' 
                            : 'bg-[#202020] text-gray-400 hover:text-white'
                        }`}
                      >
                        <Crown className="w-3 h-3" /> Instructores
                      </button>

                      <button
                        onClick={() => setActiveCategory('friends')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                          activeCategory === 'friends' 
                            ? 'bg-[#E9C349] text-black shadow-sm' 
                            : 'bg-[#202020] text-gray-400 hover:text-white'
                        }`}
                      >
                        <UserCheck className="w-3 h-3" /> Amigos ({friendsList.length})
                      </button>

                      <button
                        onClick={() => setActiveCategory('students')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                          activeCategory === 'students' 
                            ? 'bg-[#E9C349] text-black shadow-sm' 
                            : 'bg-[#202020] text-gray-400 hover:text-white'
                        }`}
                      >
                        <GraduationCap className="w-3 h-3" /> Estudiantes
                      </button>

                      <button
                        onClick={() => setActiveCategory('global')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                          activeCategory === 'global' 
                            ? 'bg-[#9A2B3C] text-white shadow-sm' 
                            : 'bg-[#202020] text-gray-400 hover:text-white'
                        }`}
                      >
                        <Globe className="w-3 h-3" /> Chat Global
                      </button>
                    </div>

                    {/* Instant Search Bar */}
                    <div className="p-3 bg-[#141414] border-b border-[#222222]">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Buscar instructor, amigo o compañero..."
                          className="w-full bg-[#1C1C1C] border border-[#2B2B2B] focus:border-[#E9C349] rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition-all"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Contacts & Conversations List */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
                      {filteredContacts.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 text-xs">
                          <Users className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                          <p>No se encontraron contactos en esta categoría.</p>
                          {searchQuery && (
                            <p className="text-[11px] text-gray-400 mt-1">Prueba con otro término de búsqueda.</p>
                          )}
                        </div>
                      ) : (
                        filteredContacts.map((contact) => (
                          <div
                            key={contact.id}
                            onClick={() => setActiveContact(contact)}
                            className="p-2.5 rounded-2xl bg-[#181818] hover:bg-[#202020] border border-[#242424] hover:border-[#E9C349]/40 transition-all flex items-center gap-3 cursor-pointer group"
                          >
                            {/* Avatar & Online indicator */}
                            <div className="relative shrink-0">
                              <img 
                                src={contact.avatar} 
                                alt={contact.name} 
                                className="w-10 h-10 rounded-xl object-cover border border-[#2E2E2E]" 
                              />
                              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[#181818] ${
                                contact.status === 'in_battle' 
                                  ? 'bg-amber-500' 
                                  : contact.status === 'online' 
                                  ? 'bg-emerald-500' 
                                  : 'bg-gray-500'
                              }`} />
                            </div>

                            {/* Contact Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <h4 className="font-bold text-xs text-white group-hover:text-[#E9C349] transition-colors truncate">
                                    {contact.displayName || contact.name}
                                  </h4>
                                  {contact.role === 'instructor' && (
                                    <Crown className="w-3 h-3 text-[#E9C349] shrink-0" />
                                  )}
                                  {contact.category === 'friend' && (
                                    <UserCheck className="w-3 h-3 text-purple-400 shrink-0" />
                                  )}
                                </div>
                                <span className="text-[9px] font-mono text-gray-500 shrink-0">
                                  {contact.lastMessageTime}
                                </span>
                              </div>

                              <p className="text-[11px] text-gray-400 truncate leading-tight">
                                {contact.lastMessage}
                              </p>

                              {contact.specialty && (
                                <p className="text-[9px] text-gray-500 font-mono truncate mt-0.5">
                                  {contact.specialty}
                                </p>
                              )}
                            </div>

                            {/* Unread count badge */}
                            {(contact.unreadCount || 0) > 0 && (
                              <span className="w-5 h-5 rounded-full bg-[#E9C349] text-black font-bold font-mono text-[10px] flex items-center justify-center shrink-0 shadow-md">
                                {contact.unreadCount}
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Bottom Info Footer */}
                    <div className="p-3 bg-[#151515] border-t border-[#222222] flex items-center justify-between text-[11px] text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>{filteredContacts.length} contactos disponibles</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#E9C349]">
                        Waack On Hub v3.0
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UnifiedFloatingMessenger;
