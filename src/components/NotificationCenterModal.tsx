import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Radio,
  Sparkles,
  GraduationCap,
  Dumbbell,
  Droplets,
  Megaphone,
  MessageCircle,
  Settings,
  Send,
  Volume2,
  VolumeX,
  Smartphone,
  ExternalLink,
  Flame,
  Clock,
  Filter,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { NotificationItem, User } from '../types';
import {
  getPushPermissionState,
  requestWebPushPermission,
  triggerLocalWebPushNotification,
  playWebPushSound
} from '../lib/webPush';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  currentUser: User;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearReadNotifications: () => void;
  onNavigateToTab: (tabId: string, extraData?: any) => void;
  onSendCustomNotification?: (notif: Omit<NotificationItem, 'id' | 'createdAt'>) => void;
  onOpenAppInstallModal?: () => void;
}

export const INITIAL_DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-live-1',
    userId: 'all',
    title: '🔴 Masterclass en Vivo de Brando Hermoso',
    body: '¡Comenzó la sesión técnica de Aceleración de Rolls & Biomecánica a 128 BPM! Conéctate ahora.',
    type: 'live_stream',
    category: 'live',
    instructorName: 'Brando Hermoso',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    actionTab: 'live',
    actionLabel: 'Entrar al Live Room',
    priority: 'urgent',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString() // 12 mins ago
  },
  {
    id: 'notif-fb-1',
    userId: 'all',
    title: '💃 Corrección de Video Recibida',
    body: 'Kumari "WaackQueen" revisó tu video de Freestyle Disco: "Excelente extensión de brazos, relaja los hombros en la transición de vuelta."',
    type: 'feedback_reviewed',
    category: 'feedback',
    instructorName: 'Kumari',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    actionTab: 'entrenamiento',
    actionLabel: 'Ver Feedback Detallado',
    priority: 'high',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() // 45 mins ago
  },
  {
    id: 'notif-course-1',
    userId: 'all',
    title: '📚 Nueva Cátedra Publicada',
    body: 'Ibuki Imata ha publicado el Módulo 04: "Overhead Rolls a 135 BPM & Aislamiento Dinámico de Codos".',
    type: 'new_course',
    category: 'course',
    instructorName: 'Ibuki Imata',
    instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    actionTab: 'cursos',
    actionLabel: 'Comenzar Clase',
    priority: 'normal',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() // 3 hours ago
  },
  {
    id: 'notif-drill-1',
    userId: 'all',
    title: '⚡ Reto Diario de Aceleración BPM',
    body: 'Completa hoy 15 minutos en el Metrónomo Lab a 120 BPM para mantener tu racha activa de 5 días.',
    type: 'drill_reminder',
    category: 'drill',
    actionTab: 'entrenamiento',
    actionLabel: 'Abrir Metrónomo Lab',
    priority: 'normal',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString() // 7 hours ago
  },
  {
    id: 'notif-hydration-1',
    userId: 'all',
    title: '💧 Recordatorio de Hidratación & Somática',
    body: 'Mantén la elasticidad articular. Bebe 250ml de agua y realiza estiramiento de antebrazos post-entrenamiento.',
    type: 'hydration_reminder',
    category: 'hydration',
    actionTab: 'fisico',
    actionLabel: 'Registrar Somatic Diary',
    priority: 'low',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString() // 18 hours ago
  },
  {
    id: 'notif-ann-1',
    userId: 'all',
    title: '📢 Anuncio Oficial de Waack On Academy',
    body: 'Abierta la convocatoria para el Torneo Internacional de Solos 2026. Premios en becas y membresías de por vida.',
    type: 'announcement',
    category: 'announcement',
    actionTab: 'comunidad',
    actionLabel: 'Ver Convocatoria',
    priority: 'high',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString() // 1 day ago
  }
];

export default function NotificationCenterModal({
  isOpen,
  onClose,
  notifications,
  currentUser,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearReadNotifications,
  onNavigateToTab,
  onSendCustomNotification,
  onOpenAppInstallModal
}: NotificationCenterModalProps) {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [pushState, setPushState] = useState(() => getPushPermissionState());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isRequestingPush, setIsRequestingPush] = useState(false);
  const [pushActionMessage, setPushActionMessage] = useState<string | null>(null);

  // Instructor/Admin Broadcast Form State
  const [showBroadcastTab, setShowBroadcastTab] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastCategory, setBroadcastCategory] = useState<'live' | 'course' | 'drill' | 'announcement'>('announcement');
  const [broadcastPriority, setBroadcastPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [broadcastTabTarget, setBroadcastTabTarget] = useState('dashboard');

  // Sync push permission state on open
  useEffect(() => {
    if (isOpen) {
      setPushState(getPushPermissionState());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Merge provided notifications with initial demo ones if empty
  const allNotificationsList = notifications && notifications.length > 0 
    ? notifications 
    : INITIAL_DEMO_NOTIFICATIONS;

  const filteredNotifications = allNotificationsList.filter(item => {
    if (activeCategoryFilter === 'all') return true;
    if (activeCategoryFilter === 'unread') return !item.read;
    return (item.category || item.type) === activeCategoryFilter || item.type.startsWith(activeCategoryFilter);
  });

  const unreadTotal = allNotificationsList.filter(n => !n.read).length;

  const handleRequestPush = async () => {
    setIsRequestingPush(true);
    try {
      const granted = await requestWebPushPermission(currentUser.id);
      setPushState(getPushPermissionState());
      if (granted) {
        setPushActionMessage('✅ ¡Notificaciones Push activadas en tu dispositivo y navegador!');
      } else {
        setPushActionMessage('⚠️ Permiso no otorgado o bloqueado en las preferencias del navegador.');
      }
    } catch (err) {
      console.error(err);
      setPushActionMessage('Error al activar notificaciones.');
    } finally {
      setIsRequestingPush(false);
      setTimeout(() => setPushActionMessage(null), 5000);
    }
  };

  const handleTriggerTestPush = () => {
    if (soundEnabled) playWebPushSound();
    triggerLocalWebPushNotification({
      title: '🚀 ¡Prueba de Notificación Push Waack On!',
      body: 'Tu sistema de notificaciones está sincronizado y funcionando al 100% con sonido y vibración.',
      tag: `test-push-${Date.now()}`
    });
    setPushActionMessage('🔔 Notificación de prueba emitida en tu pantalla.');
    setTimeout(() => setPushActionMessage(null), 4000);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastBody.trim()) return;

    if (onSendCustomNotification) {
      onSendCustomNotification({
        userId: 'all',
        title: broadcastTitle.trim(),
        body: broadcastBody.trim(),
        type: broadcastCategory === 'live' ? 'live_stream' : broadcastCategory === 'course' ? 'new_course' : broadcastCategory === 'drill' ? 'drill_reminder' : 'announcement',
        category: broadcastCategory,
        instructorName: currentUser.name,
        instructorAvatar: currentUser.avatar,
        actionTab: broadcastTabTarget,
        actionLabel: 'Ver Detalle',
        priority: broadcastPriority,
        read: false
      });
    }

    // Trigger local push
    triggerLocalWebPushNotification({
      title: `📢 ${broadcastTitle.trim()}`,
      body: broadcastBody.trim(),
      tag: `broadcast-${Date.now()}`
    });

    setPushActionMessage(`📢 Notificación "${broadcastTitle}" emitida exitosamente a todos los alumnos.`);
    setBroadcastTitle('');
    setBroadcastBody('');
    setShowBroadcastTab(false);
    setTimeout(() => setPushActionMessage(null), 5000);
  };

  const getCategoryBadge = (item: NotificationItem) => {
    const cat = item.category || item.type;
    switch (cat) {
      case 'live':
      case 'live_stream':
        return (
          <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[9px] font-mono font-black uppercase flex items-center gap-1">
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            <span>EN VIVO</span>
          </span>
        );
      case 'feedback':
      case 'feedback_reviewed':
        return (
          <span className="px-2 py-0.5 rounded-full bg-[#D9A9FF]/20 text-[#D9A9FF] border border-[#D9A9FF]/40 text-[9px] font-mono font-black uppercase flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>FEEDBACK</span>
          </span>
        );
      case 'course':
      case 'new_course':
        return (
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-mono font-black uppercase flex items-center gap-1">
            <GraduationCap className="w-2.5 h-2.5" />
            <span>CURSO</span>
          </span>
        );
      case 'drill':
      case 'drill_reminder':
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-mono font-black uppercase flex items-center gap-1">
            <Dumbbell className="w-2.5 h-2.5" />
            <span>DRILL BPM</span>
          </span>
        );
      case 'hydration':
      case 'hydration_reminder':
        return (
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-[9px] font-mono font-black uppercase flex items-center gap-1">
            <Droplets className="w-2.5 h-2.5" />
            <span>HIDRATACIÓN</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 text-[9px] font-mono font-black uppercase flex items-center gap-1">
            <Megaphone className="w-2.5 h-2.5" />
            <span>ANUNCIO</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="w-full max-w-3xl max-h-[92vh] bg-white dark:bg-[#0E0E10] border border-slate-200 dark:border-[#262626] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
      >
        {/* Glow ambient background effect */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D9A9FF]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#C23E9E]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-4 bg-slate-50 dark:bg-[#121215] shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D9A9FF]/10 border border-[#D9A9FF]/30 flex items-center justify-center text-[#D9A9FF] relative">
              <Bell className="w-5 h-5" />
              {unreadTotal > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-red-500 text-white font-mono text-[9px] font-black rounded-full border-2 border-white dark:border-[#0E0E10] animate-pulse">
                  {unreadTotal}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider font-sans">
                  Centro de Notificaciones & Web Push
                </h2>
                <span className="text-[10px] font-mono text-[#D9A9FF] bg-[#D9A9FF]/10 px-2 py-0.5 rounded-full border border-[#D9A9FF]/30 font-bold hidden sm:inline-block">
                  OFICIAL APP
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Alertas de lives, feedback de video, cátedras y recordatorios de entrenamiento.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-amber-50 dark:bg-[#181818] text-[#E9C349] border-[#E9C349]/40'
                  : 'bg-slate-100 dark:bg-[#141414] text-slate-500 border-slate-200 dark:border-white/10'
              }`}
              title={soundEnabled ? 'Silenciar sonidos de alerta' : 'Activar sonido de alerta'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action toast message */}
        <AnimatePresence>
          {pushActionMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-5 py-2.5 bg-amber-50 dark:bg-[#1b1912] border-b border-[#E9C349]/40 text-xs font-mono text-[#EDEFF4] flex items-center justify-between gap-3 shrink-0"
            >
              <span>{pushActionMessage}</span>
              <button onClick={() => setPushActionMessage(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Web Push Configuration Banner & Quick Actions */}
        <div className="p-4 bg-slate-50 dark:bg-[#141418] border-b border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#D9A9FF]/10 text-[#D9A9FF] border border-[#D9A9FF]/30 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase">Estado Web Push:</span>
                <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full border uppercase ${
                  pushState.permission === 'granted'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : pushState.permission === 'denied'
                    ? 'bg-red-500/20 text-red-400 border-red-500/40'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                }`}>
                  {pushState.permission === 'granted' ? 'Permitido (Activo)' : pushState.permission === 'denied' ? 'Bloqueado' : 'Pendiente'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Recibe avisos incluso con la pestaña en segundo plano o desde la app móvil.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {pushState.permission !== 'granted' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleRequestPush}
                disabled={isRequestingPush}
                className="px-3 py-1.5 bg-[#D9A9FF] hover:bg-[#F2CFFF] text-black font-mono text-xs font-black rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer uppercase"
              >
                <Bell className="w-3.5 h-3.5 fill-black" />
                <span>{isRequestingPush ? 'Solicitando...' : 'Activar Push'}</span>
              </motion.button>
            )}

            <button
              type="button"
              onClick={handleTriggerTestPush}
              className="px-3 py-1.5 bg-slate-100 dark:bg-[#1f1f23] hover:bg-slate-200 dark:hover:bg-[#28282d] text-[#EDEFF4] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 font-mono text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D9A9FF]" />
              <span>Probar Push</span>
            </button>

            {onOpenAppInstallModal && (
              <button
                type="button"
                onClick={onOpenAppInstallModal}
                className="px-3 py-1.5 bg-[#C23E9E]/20 hover:bg-[#C23E9E]/40 text-[#EDEFF4] border border-[#C23E9E]/40 font-mono text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#D9A9FF]" />
                <span>Instalar App</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs & Bulk Actions */}
        <div className="px-4 py-2.5 bg-white dark:bg-[#0F0F12] border-b border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
            {[
              { id: 'all', label: `Todas (${allNotificationsList.length})` },
              { id: 'unread', label: `No leídas (${unreadTotal})` },
              { id: 'live', label: '🔴 En Vivo' },
              { id: 'feedback', label: '💃 Feedback' },
              { id: 'course', label: '📚 Cursos' },
              { id: 'drill', label: '⚡ Drills' },
              { id: 'announcement', label: '📢 Anuncios' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveCategoryFilter(tab.id);
                  setShowBroadcastTab(false);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all shrink-0 border ${
                  !showBroadcastTab && activeCategoryFilter === tab.id
                    ? 'bg-[#E9C349] text-black border-[#E9C349] shadow-sm'
                    : 'bg-slate-100 dark:bg-[#18181c] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15'
                }`}
              >
                {tab.label}
              </button>
            ))}

            {(currentUser.role === 'instructor' || currentUser.role === 'studio' || currentUser.id === 'OdXh2P0qGDaFFyNKalECKFq9ESk1') && (
              <button
                type="button"
                onClick={() => setShowBroadcastTab(!showBroadcastTab)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all shrink-0 border flex items-center gap-1 ${
                  showBroadcastTab
                    ? 'bg-[#9A2B3C] text-white border-[#9A2B3C]'
                    : 'bg-rose-50 dark:bg-[#1c1417] text-[#E9C349] border-[#9A2B3C]/40 hover:bg-[#9A2B3C]/10 dark:hover:bg-[#9A2B3C]/30'
                }`}
              >
                <Send className="w-3 h-3" />
                <span>Emitir Aviso</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {unreadTotal > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="text-[11px] font-mono font-bold text-slate-400 hover:text-[#D9A9FF] transition-colors flex items-center gap-1"
                title="Marcar todas las notificaciones como leídas"
              >
                <CheckCheck className="w-3.5 h-3.5 text-[#D9A9FF]" />
                <span className="hidden sm:inline">Marcar Leídas</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClearReadNotifications}
              className="text-[11px] font-mono font-bold text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
              title="Limpiar notificaciones ya leídas"
            >
              <Trash2 className="w-3 h-3" />
              <span className="hidden sm:inline">Limpiar</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[#0A0A0C]">
          {showBroadcastTab ? (
            /* Instructor / Studio Broadcast Form */
            <form onSubmit={handleSendBroadcast} className="p-4 bg-slate-50 dark:bg-[#141418] border border-slate-200 dark:border-[#262626] rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[#E9C349]" />
                  <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Emitir Notificación Push a los Alumnos
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                  DOCENTE OFICIAL
                </span>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <label className="block text-slate-400 text-[11px] uppercase font-bold mb-1">Título de la Notificación</label>
                  <input
                    type="text"
                    required
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="Ej. 🔴 Live de Rolls hoy a las 19:30 hrs"
                    className="w-full bg-slate-50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#E9C349]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] uppercase font-bold mb-1">Mensaje / Cuerpo del Anuncio</label>
                  <textarea
                    required
                    rows={3}
                    value={broadcastBody}
                    onChange={(e) => setBroadcastBody(e.target.value)}
                    placeholder="Escribe los detalles para la notificación que recibirán todos los alumnos en sus navegadores..."
                    className="w-full bg-slate-50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#E9C349] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] uppercase font-bold mb-1">Categoría</label>
                    <select
                      value={broadcastCategory}
                      onChange={(e) => setBroadcastCategory(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-[#E9C349]"
                    >
                      <option value="announcement">📢 Anuncio General</option>
                      <option value="live">🔴 Transmisión Live</option>
                      <option value="course">📚 Nueva Cátedra</option>
                      <option value="drill">⚡ Reto / Metrónomo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] uppercase font-bold mb-1">Prioridad</label>
                    <select
                      value={broadcastPriority}
                      onChange={(e) => setBroadcastPriority(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-[#E9C349]"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">Alta (Destacado)</option>
                      <option value="urgent">Urgente (🔴 En Vivo)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] uppercase font-bold mb-1">Pestaña Destino</label>
                    <select
                      value={broadcastTabTarget}
                      onChange={(e) => setBroadcastTabTarget(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-[#E9C349]"
                    >
                      <option value="live">Live Room</option>
                      <option value="cursos">Cursos</option>
                      <option value="entrenamiento">Freestyle Lab</option>
                      <option value="comunidad">Comunidad</option>
                      <option value="dashboard">Dashboard</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowBroadcastTab(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-mono font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D9A9FF] hover:bg-[#F2CFFF] text-black text-xs font-mono font-black flex items-center gap-1.5 shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Emitir Notificación Global</span>
                </button>
              </div>
            </form>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">No hay notificaciones en esta categoría</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Las alertas automáticas de feedback, transmisiones en directo y nuevos ejercicios aparecerán aquí.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  !notif.read
                    ? 'bg-amber-50 dark:bg-[#15131a] border-[#E9C349]/40 shadow-[0_0_15px_rgba(233,195,73,0.08)]'
                    : 'bg-slate-50 dark:bg-[#101014] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15'
                }`}
              >
                {/* Left side indicator stripe for unread */}
                {!notif.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D9A9FF]" />
                )}

                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {notif.instructorAvatar ? (
                    <img
                      src={notif.instructorAvatar}
                      alt={notif.instructorName || 'Instructor'}
                      className="w-10 h-10 rounded-xl object-cover border border-[#D9A9FF]/50 shrink-0 mt-0.5"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#D9A9FF] mt-0.5">
                      <Bell className="w-5 h-5" />
                    </div>
                  )}

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getCategoryBadge(notif)}
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-[#D9A9FF] inline-block" />
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {notif.title}
                    </h4>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {notif.body}
                    </p>

                    {notif.instructorName && (
                      <p className="text-[11px] font-mono text-[#D9A9FF]">
                        Instructor: {notif.instructorName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions on right */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-white/5">
                  {notif.actionTab && (
                    <button
                      type="button"
                      onClick={() => {
                        onMarkAsRead(notif.id);
                        onNavigateToTab(notif.actionTab!, { feedbackId: notif.feedbackId });
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-[#D9A9FF] hover:bg-[#F2CFFF] text-black text-xs font-mono font-black rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer uppercase"
                    >
                      <span>{notif.actionLabel || 'Ver'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}

                  {!notif.read && (
                    <button
                      type="button"
                      onClick={() => onMarkAsRead(notif.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                      title="Marcar como leída"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-3.5 bg-slate-50 dark:bg-[#121215] border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Sincronizado en tiempo real con Firebase Firestore & Service Worker</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white/10 hover:bg-slate-700 dark:hover:bg-white/20 text-white font-bold transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
