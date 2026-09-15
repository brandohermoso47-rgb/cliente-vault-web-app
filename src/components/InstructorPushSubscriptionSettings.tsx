import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Check, 
  Copy, 
  Sparkles, 
  ShieldCheck, 
  Radio, 
  Volume2, 
  Send, 
  UserCheck, 
  Smartphone, 
  Server, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Megaphone,
  Video,
  Zap,
  Music,
  X
} from 'lucide-react';
import { User, InstructorPushPreference, PushSubscriptionData } from '../types';
import { 
  getPushPermissionState, 
  requestWebPushPermission, 
  getOrRegisterPushSubscription, 
  saveStudentInstructorPushSubscription, 
  triggerLocalWebPushNotification, 
  playWebPushSound 
} from '../lib/webPush';

interface InstructorPushSubscriptionSettingsProps {
  currentUser: User;
  onUserUpdate?: (updatedFields: Partial<User>) => void;
  onClose?: () => void;
}

const DEFAULT_INSTRUCTORS = [
  { id: 'inst-brando', name: 'Brando Hermoso', role: 'Director Principal & Master Instructor', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120' },
  { id: 'inst-elena', name: 'Elena Rostova', role: 'Instructora Senior de Waacking Fundamentals', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120' },
  { id: 'inst-imperial', name: 'Imperial Masters', role: 'Cátedra de Musicalidad y Ritmo Disco', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120' },
  { id: 'inst-sofia', name: 'Sofía Waacker', role: 'Especialista en Posing, Performance y Expresión', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120' }
];

export const InstructorPushSubscriptionSettings: React.FC<InstructorPushSubscriptionSettingsProps> = ({
  currentUser,
  onUserUpdate,
  onClose
}) => {
  const [pushPermission, setPushPermission] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });

  const [pushEnabled, setPushEnabled] = useState<boolean>(() => {
    return currentUser.pushEnabled ?? (currentUser.pushPermission === 'granted');
  });

  const [pushEndpoint, setPushEndpoint] = useState<string>(() => {
    return currentUser.pushEndpoint || currentUser.pushSubscription?.endpoint || `https://push.waackon.app/v1/sub/${currentUser.id}`;
  });

  const [pushSubscriptionObj, setPushSubscriptionObj] = useState<PushSubscriptionData | null>(() => {
    return currentUser.pushSubscription || null;
  });

  // Topics
  const [topics, setTopics] = useState({
    announcements: currentUser.pushTopics?.announcements ?? true,
    feedback: currentUser.pushTopics?.feedback ?? true,
    lives: currentUser.pushTopics?.lives ?? true,
    drills: currentUser.pushTopics?.drills ?? true
  });

  // Instructor preferences
  const [instructorPrefs, setInstructorPrefs] = useState<InstructorPushPreference[]>(() => {
    if (currentUser.instructorPushPreferences && currentUser.instructorPushPreferences.length > 0) {
      return currentUser.instructorPushPreferences;
    }
    return DEFAULT_INSTRUCTORS.map(i => ({
      instructorId: i.id,
      instructorName: i.name,
      enabled: true,
      announcements: true,
      lessonAlerts: true,
      feedbackAlerts: true,
      liveSessionAlerts: true
    }));
  });

  const [isSaving, setIsSaving] = useState(false);
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testSent, setTestSent] = useState(false);

  // Sync state on load
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission);
    }
    // Retrieve web push subscription endpoint
    getOrRegisterPushSubscription(currentUser.id).then((sub) => {
      if (sub) {
        setPushSubscriptionObj(sub);
        setPushEndpoint(sub.endpoint);
      }
    });
  }, [currentUser.id]);

  // Handle Request Permission
  const handleRequestPermission = async () => {
    const granted = await requestWebPushPermission(currentUser.id);
    if (granted) {
      setPushPermission('granted');
      setPushEnabled(true);
      const sub = await getOrRegisterPushSubscription(currentUser.id);
      if (sub) {
        setPushSubscriptionObj(sub);
        setPushEndpoint(sub.endpoint);
      }
    } else {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setPushPermission(Notification.permission);
      }
    }
  };

  // Save Preferences to Firestore
  const handleSaveToFirestore = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      let currentSub = pushSubscriptionObj;
      if (!currentSub) {
        currentSub = await getOrRegisterPushSubscription(currentUser.id);
        setPushSubscriptionObj(currentSub);
        setPushEndpoint(currentSub.endpoint);
      }

      await saveStudentInstructorPushSubscription({
        userId: currentUser.id,
        pushEnabled,
        pushPermission,
        pushSubscription: currentSub,
        instructorPushPreferences: instructorPrefs,
        pushTopics: topics
      });

      if (onUserUpdate) {
        onUserUpdate({
          pushEnabled,
          pushPermission,
          pushEndpoint: currentSub.endpoint,
          pushSubscription: currentSub,
          instructorPushPreferences: instructorPrefs,
          pushTopics: topics
        });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error al guardar notificaciones push en Firestore:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger Test Push Notification
  const handleSendTestNotification = () => {
    playWebPushSound();
    triggerLocalWebPushNotification({
      title: '⚡ Waack On Academy - Alerta de Instructor',
      body: '¡Brando Hermoso acaba de publicar un nuevo video-drill de aceleración a 130 BPM!',
      tag: `test-instructor-push-${Date.now()}`
    });
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  // Toggle instructor preference
  const toggleInstructor = (instId: string) => {
    setInstructorPrefs(prev => prev.map(item => {
      if (item.instructorId === instId) {
        return { ...item, enabled: !item.enabled };
      }
      return item;
    }));
  };

  // Copy Endpoint URL
  const handleCopyEndpoint = () => {
    if (!pushEndpoint) return;
    navigator.clipboard.writeText(pushEndpoint);
    setCopiedEndpoint(true);
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  return (
    <div className="bg-[#12121a] border border-[#D9A9FF]/30 rounded-3xl p-6 sm:p-8 space-y-6 text-white shadow-2xl relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#D9A9FF]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Bell className="w-5 h-5 text-purple-400" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
              Notificaciones Push de Instructores
            </h3>
            <span className="text-[10px] font-mono font-bold bg-[#D9A9FF]/20 text-[#D9A9FF] border border-[#D9A9FF]/40 px-2 py-0.5 rounded-full uppercase">
              Firestore Sync
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Suscríbete para recibir alertas instantáneas en tu navegador o móvil cuando tus instructores suban evaluaciones de feedback, anuncios o clases en vivo.
          </p>
        </div>

        {/* Global Push Enable Toggle Switch & Optional Close Button */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl">
            <div className="text-right">
              <p className="text-xs font-mono font-bold text-white uppercase">Estado del Push</p>
              <p className="text-[10px] text-slate-400 font-medium">
                {pushEnabled ? '🟢 Suscripción Activa' : '🔴 Inactivo'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPushEnabled(!pushEnabled)}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                pushEnabled ? 'bg-purple-600 shadow-[0_0_12px_rgba(147,51,234,0.5)]' : 'bg-slate-700'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${pushEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Cerrar ventana de notificaciones"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Permission & Endpoint Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Browser Permission Status */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 uppercase">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Permiso del Navegador</span>
            </div>
            {pushPermission === 'granted' ? (
              <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Concedido
              </span>
            ) : pushPermission === 'denied' ? (
              <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-rose-400 bg-rose-950/80 border border-rose-500/30 px-2.5 py-1 rounded-full">
                <AlertCircle className="w-3 h-3" /> Bloqueado
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-500/30 px-2.5 py-1 rounded-full">
                <Radio className="w-3 h-3 animate-pulse" /> Pendiente
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300">
            {pushPermission === 'granted'
              ? 'Tu navegador tiene permisos habilitados para emitir alertas Push en vivo.'
              : 'Haz clic en el botón para otorgar permisos de notificación en tu dispositivo.'}
          </p>

          {pushPermission !== 'granted' && (
            <button
              type="button"
              onClick={handleRequestPermission}
              className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Activar Permisos de Notificación Nativa</span>
            </button>
          )}
        </div>

        {/* Push Subscription Endpoint */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 uppercase">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Endpoint de Suscripción</span>
            </div>
            <span className="text-[9px] font-mono font-bold text-purple-300 bg-purple-950/80 border border-purple-500/30 px-2 py-0.5 rounded-md">
              Guardado en /users/{currentUser.id.substring(0, 8)}...
            </span>
          </div>

          <p className="text-[10px] text-slate-400">
            Identificador único asignado por la API Web Push para enrutar alertas a este dispositivo:
          </p>

          <div className="flex items-center gap-2 bg-[#0a0a0f] border border-white/10 p-2 rounded-xl text-xs font-mono text-cyan-300 overflow-hidden">
            <span className="truncate flex-1 text-[10px]">{pushEndpoint}</span>
            <button
              type="button"
              onClick={handleCopyEndpoint}
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors shrink-0 cursor-pointer"
              title="Copiar Endpoint URL"
            >
              {copiedEndpoint ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Topics Selector */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#D9A9FF]" />
          <span>Tipos de Alertas de Instructores</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Announcement */}
          <div
            onClick={() => setTopics(prev => ({ ...prev, announcements: !prev.announcements }))}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
              topics.announcements ? 'bg-purple-950/40 border-purple-500/40 text-white' : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            <div className={`p-2 rounded-xl ${topics.announcements ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs">Anuncios Oficiales</p>
              <p className="text-[10px] text-slate-400">Noticias de cátedra</p>
            </div>
          </div>

          {/* Feedback */}
          <div
            onClick={() => setTopics(prev => ({ ...prev, feedback: !prev.feedback }))}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
              topics.feedback ? 'bg-purple-950/40 border-purple-500/40 text-white' : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            <div className={`p-2 rounded-xl ${topics.feedback ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <Video className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs">Evaluaciones de Video</p>
              <p className="text-[10px] text-slate-400">Corrección de drills</p>
            </div>
          </div>

          {/* Lives */}
          <div
            onClick={() => setTopics(prev => ({ ...prev, lives: !prev.lives }))}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
              topics.lives ? 'bg-purple-950/40 border-purple-500/40 text-white' : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            <div className={`p-2 rounded-xl ${topics.lives ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs">Directos y Lives</p>
              <p className="text-[10px] text-slate-400">Aviso pre-transmisión</p>
            </div>
          </div>

          {/* Drills / Music */}
          <div
            onClick={() => setTopics(prev => ({ ...prev, drills: !prev.drills }))}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
              topics.drills ? 'bg-purple-950/40 border-purple-500/40 text-white' : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            <div className={`p-2 rounded-xl ${topics.drills ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <Music className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs">Nuevas Playlists BPM</p>
              <p className="text-[10px] text-slate-400">Música de entrenamiento</p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructor Subscriptions List */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-purple-400" />
            <span>Instructores Disponibles</span>
          </h4>
          <button
            type="button"
            onClick={() => {
              const allEnabled = instructorPrefs.every(i => i.enabled);
              setInstructorPrefs(prev => prev.map(i => ({ ...i, enabled: !allEnabled })));
            }}
            className="text-[11px] text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer"
          >
            {instructorPrefs.every(i => i.enabled) ? 'Desmarcar Todos' : 'Suscribir a Todos'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DEFAULT_INSTRUCTORS.map((inst) => {
            const pref = instructorPrefs.find(p => p.instructorId === inst.id);
            const isSubscribed = pref?.enabled ?? true;

            return (
              <div
                key={inst.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isSubscribed ? 'bg-white/5 border-purple-500/30' : 'bg-white/[0.02] border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={inst.avatar}
                    alt={inst.name}
                    className="w-10 h-10 rounded-full object-cover border border-purple-500/30 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{inst.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{inst.role}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleInstructor(inst.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isSubscribed
                      ? 'bg-purple-600 text-white shadow-md hover:bg-purple-500'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  {isSubscribed ? 'Suscrito ✓' : 'Suscribir'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={handleSendTestNotification}
          className="w-full sm:w-auto px-4 py-2.5 bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Volume2 className="w-4 h-4 text-amber-300" />
          <span>{testSent ? '¡Notificación Emitida! 🔔' : 'Probar Notificación de Instructor'}</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {saveSuccess && (
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 animate-pulse">
              <CheckCircle2 className="w-4 h-4" /> ¡Preferencias y Endpoint guardados en Firestore!
            </span>
          )}

          <button
            type="button"
            onClick={handleSaveToFirestore}
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando en Firestore...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Guardar Preferencias de Notificación</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
