import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Radio, 
  User, 
  Send, 
  Users, 
  Heart, 
  Flame, 
  Sparkles, 
  Video, 
  VideoOff, 
  MessageSquare, 
  Volume2, 
  VolumeX,
  Bell,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Tv,
  Eye,
  Mic,
  MicOff,
  Settings,
  Share2,
  Award,
  Pin,
  Swords,
  Languages,
  Crown,
  Zap,
  Music,
  Maximize2,
  X
} from 'lucide-react';
import { User as UserType, CalendarEvent } from '../types';
import { Language, translations, getAITranslation } from '../lib/translations';
import { 
  signInForGoogleCalendar, 
  addEventToGoogleCalendar, 
  getGoogleCalendarWebUrl,
  getCalendarAccessToken
} from '../googleCalendar';
import EmbeddedGoogleMeet from './EmbeddedGoogleMeet';
import LiveBattleTraining from './LiveBattleTraining';

interface LiveViewProps {
  currentUser: UserType;
  events: CalendarEvent[];
  onToggleRsvp: (eventId: string) => void;
  language: Language;
}

interface FloatingEmoji {
  id: number;
  emoji: string;
  left: number;
}

interface Spectator {
  id: string;
  name: string;
  nickname?: string;
  avatar: string;
  role: 'Host' | 'Instructor' | 'VIP' | 'Alumno' | 'PRO';
  status: 'online' | 'broadcasting' | 'idle';
  location: string;
  joinedTime: string;
}

export default function LiveView({
  currentUser,
  events,
  onToggleRsvp,
  language
}: LiveViewProps) {
  // Main Navigation subtabs
  const [subTab, setSubTab] = useState<'live-room' | 'go-live' | 'spectators' | 'battle-training' | 'calendar'>('live-room');

  // Active Stream Channel selector in Live Room
  const [activeChannel, setActiveChannel] = useState<'main' | 'practice' | 'somatic'>('main');

  // Floating reactions / hearts
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [totalLikes, setTotalLikes] = useState(1420);

  // Embedded Google Meet state
  const [isGoogleMeetInline, setIsGoogleMeetInline] = useState(false);
  const [activeEmbeddedMeet, setActiveEmbeddedMeet] = useState<{ url: string; title: string; instructor?: string } | null>(null);

  // Subtitles / Voice Translation state
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);

  // Chat translations & Pin
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});
  const [pinnedComment, setPinnedComment] = useState<string | null>("📌 Pista actual: Cheryl Lynn - Got To Be Real (128 BPM) | ¡Acentúa cada beat con los codos!");

  // Dynamic live speech subtitles loop
  const LIVE_SPEECHES = [
    "¡Eso es! Mantén el pecho arriba y extiende completamente los brazos al hacer el roll detrás de la cabeza.",
    "No te olvides de conectar la mirada con la dirección de tus manos. La proyección de ojos es clave en el waacking.",
    "Ahora acelera el tempo con la música: un, dos, tres, cuatro, ¡proyecta con fuerza en cada golpe!",
    "Excelente flexión de muñecas, Marilyn. Asegúrate de relajar los hombros para no tensionar el cuello.",
    "Recuerda que el waacking no es solo técnica, es drama y expresión. ¡Siente el beat disco y déjate llevar!"
  ];

  const [speechIndex, setSpeechIndex] = useState(0);
  const [translatedSpeech, setTranslatedSpeech] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setSpeechIndex((prev) => (prev + 1) % LIVE_SPEECHES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const original = LIVE_SPEECHES[speechIndex];
    const translation = getAITranslation(original, language);
    setTranslatedSpeech(translation);
  }, [speechIndex, language]);

  // Video controls
  const [isMuted, setIsMuted] = useState(true);
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Go Live / Broadcast Studio state
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('Práctica en Vivo: Arm Control & Speed Drills 128 BPM');
  const [broadcastCategory, setBroadcastCategory] = useState('Waacking');
  const [broadcastMusic, setBroadcastMusic] = useState('Sylvester - You Make Me Feel (Mighty Real)');
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  const [broadcastDuration, setBroadcastDuration] = useState(0);
  const [broadcastViewers, setBroadcastViewers] = useState(38);

  // Timer for active broadcast
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isBroadcasting) {
      timer = setInterval(() => {
        setBroadcastDuration(prev => prev + 1);
        if (Math.random() > 0.6) {
          setBroadcastViewers(v => v + (Math.random() > 0.4 ? 1 : -1));
        }
      }, 1000);
    } else {
      setBroadcastDuration(0);
    }
    return () => clearInterval(timer);
  }, [isBroadcasting]);

  // Format seconds to HH:MM:SS
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return `${h > 0 ? `${h.toString().padStart(2, '0')}:` : ''}${rm.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Connected Spectators List
  const [spectators, setSpectators] = useState<Spectator[]>([
    { id: 'u1', name: 'Brando Hermoso', nickname: 'Master_Brando', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', role: 'Host', status: 'broadcasting', location: 'Ciudad de México', joinedTime: 'Hace 45m' },
    { id: 'u2', name: 'Sara Waack', nickname: 'Sara_Queen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', role: 'PRO', status: 'online', location: 'Madrid, España', joinedTime: 'Hace 12m' },
    { id: 'u3', name: 'Pedro Punking', nickname: 'Pedro_P', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', role: 'VIP', status: 'online', location: 'Bogotá, Colombia', joinedTime: 'Hace 5m' },
    { id: 'u4', name: 'Elena Pose', nickname: 'Elena_Pose', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150', role: 'Instructor', status: 'online', location: 'Santiago, Chile', joinedTime: 'Hace 30m' },
    { id: 'u5', name: 'Marilyn Roll', nickname: 'Marilyn_Waack', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', role: 'Alumno', status: 'online', location: 'Buenos Aires', joinedTime: 'Hace 2m' },
    { id: 'u6', name: 'Carlos Disco', nickname: 'Carlos_Vibes', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150', role: 'Alumno', status: 'online', location: 'Lima, Perú', joinedTime: 'Hace 18m' }
  ]);

  // Simulated Live Chat Stream
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; name: string; avatar: string; text: string; time: string; badge?: string }>>([
    { id: '1', name: 'Sara Waack', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120', text: '¡Buenas noches a toda la familia de Waack ON! Lista para entrenar.', time: '19:28', badge: 'PRO' },
    { id: '2', name: 'Pedro Punking', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120', text: 'Brando, ¿podrías repetir la aceleración de muñecas a 128 BPM?', time: '19:29', badge: 'VIP' },
    { id: '3', name: 'Elena Pose', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120', text: '¡Qué buen track de calentamiento! La energía en la sala está brutal 🔥', time: '19:31', badge: 'INSTRUCTOR' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Google Calendar Integration States
  const [syncedEvents, setSyncedEvents] = useState<string[]>(() => {
    const saved = localStorage.getItem('waackon_synced_gcal_events');
    return saved ? JSON.parse(saved) : [];
  });
  const [isGCalConnected, setIsGCalConnected] = useState<boolean>(() => !!getCalendarAccessToken());
  const [gcalLoadingId, setGcalLoadingId] = useState<string | null>(null);
  const [gcalBannerLoading, setGcalBannerLoading] = useState(false);
  const [gcalAlert, setGcalAlert] = useState<string | null>(null);

  const showGCalNotice = (msg: string) => {
    setGcalAlert(msg);
    setTimeout(() => setGcalAlert(null), 5000);
  };

  const handleConnectGoogleCalendar = async () => {
    setGcalBannerLoading(true);
    try {
      await signInForGoogleCalendar();
      setIsGCalConnected(true);
      showGCalNotice('¡Cuenta de Google Calendar vinculada con éxito!');
    } catch (err: any) {
      console.warn('Google Calendar auth prompt dismissed or error:', err);
      showGCalNotice('Puedes usar la sincronización rápida mediante enlace web directo a Google Calendar.');
    } finally {
      setGcalBannerLoading(false);
    }
  };

  const handleAddToGoogleCalendar = async (evt: CalendarEvent) => {
    setGcalLoadingId(evt.id);
    try {
      let token = getCalendarAccessToken();
      if (!token) {
        token = await signInForGoogleCalendar();
        setIsGCalConnected(true);
      }
      const res = await addEventToGoogleCalendar(evt, token);
      if (res.success) {
        setSyncedEvents((prev) => {
          const updated = [...prev, evt.id];
          localStorage.setItem('waackon_synced_gcal_events', JSON.stringify(updated));
          return updated;
        });
        showGCalNotice(`¡Evento "${evt.title}" agregado a tu Google Calendar!`);
      } else {
        const webUrl = getGoogleCalendarWebUrl(evt);
        window.open(webUrl, '_blank');
        setSyncedEvents((prev) => {
          const updated = [...prev, evt.id];
          localStorage.setItem('waackon_synced_gcal_events', JSON.stringify(updated));
          return updated;
        });
        showGCalNotice(`Abriendo Google Calendar para guardar "${evt.title}"...`);
      }
    } catch (err) {
      const webUrl = getGoogleCalendarWebUrl(evt);
      window.open(webUrl, '_blank');
      setSyncedEvents((prev) => {
        const updated = [...prev, evt.id];
        localStorage.setItem('waackon_synced_gcal_events', JSON.stringify(updated));
        return updated;
      });
      showGCalNotice(`Redirigiendo a Google Calendar para programar "${evt.title}".`);
    } finally {
      setGcalLoadingId(null);
    }
  };

  // Local camera stream handler
  useEffect(() => {
    if (isWebcamOn || (subTab === 'go-live' && cameraActive)) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setWebcamStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          console.warn("Camera/Mic not accessible in iframe preview. Showing high-fidelity animated stage preview.");
        });
    } else {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        setWebcamStream(null);
      }
    }

    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isWebcamOn, subTab, cameraActive]);

  // Floating reaction emitter
  const handleAddReaction = (emoji: string) => {
    setTotalLikes(prev => prev + 1);
    const newEmoji: FloatingEmoji = {
      id: Date.now() + Math.random(),
      emoji,
      left: Math.random() * 70 + 15
    };
    setFloatingEmojis((prev) => [...prev, newEmoji]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter(item => item.id !== newEmoji.id));
    }, 2500);
  };

  // Send Chat Message
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      name: currentUser.name,
      avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      badge: 'TÚ'
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');
  };

  return (
    <div className="flex-1 min-h-full w-full p-4 sm:p-6 bg-[#0a0a0a] text-white flex flex-col font-body-md text-left">
      {/* Floating Keyframes for Live Reactions */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(0.6);
            opacity: 0;
          }
          15% {
            opacity: 1;
            transform: translateY(-25px) scale(1.3);
          }
          85% {
            opacity: 1;
          }
          100% {
            transform: translateY(-300px) scale(0.7);
            opacity: 0;
          }
        }
        .animate-float-up {
          animation: floatUp 2.4s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }
      `}} />

      {/* Top Header & Navigation Subtabs */}
      <div className="border-b border-white/10 pb-5 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-red-600/20 text-red-400 border border-red-500/30 flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              TRANSMISIONES EN TIEMPO REAL
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
              LIVES DE WAACK ON
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Sintoniza masterclasses en vivo, transmite tus entrenamientos, interactúa con la comunidad y desafía a otros bailarines.
          </p>
        </div>

        {/* Subtabs Controls */}
        <div className="bg-[#141414] border border-white/10 p-1.5 rounded-2xl flex gap-1.5 overflow-x-auto shadow-2xl shrink-0 scrollbar-none">
          <button
            onClick={() => setSubTab('live-room')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 border ${
              subTab === 'live-room' 
                ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30' 
                : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            <Radio className="w-4 h-4 text-white animate-pulse" />
            SALA LIVE
          </button>

          <button
            onClick={() => setSubTab('go-live')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 border ${
              subTab === 'go-live' 
                ? 'bg-[#E9C349] text-slate-950 border-[#E9C349] shadow-lg shadow-[#E9C349]/20' 
                : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            <Tv className="w-4 h-4 text-slate-950" />
            TRANSMITIR AHORA
          </button>

          <button
            onClick={() => setSubTab('spectators')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 border ${
              subTab === 'spectators' 
                ? 'bg-[#9A2B3C] text-white border-[#9A2B3C] shadow-lg' 
                : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4 text-amber-300" />
            ESPECTADORES ({spectators.length})
          </button>

          <button
            onClick={() => setSubTab('battle-training')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 border ${
              subTab === 'battle-training' 
                ? 'bg-white/20 text-white border-white/30' 
                : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            <Swords className="w-4 h-4 text-[#E9C349]" />
            BATALLAS LIVE
          </button>

          <button
            onClick={() => setSubTab('calendar')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 border ${
              subTab === 'calendar' 
                ? 'bg-blue-600/30 text-blue-300 border-blue-500/50' 
                : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-400" />
            CALENDARIO
          </button>
        </div>
      </div>

      {/* 1. LIVE STREAM ROOM TAB */}
      {subTab === 'live-room' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 items-stretch z-10">
          
          {/* Main Streaming Stage (8 Cols) */}
          <div className="xl:col-span-8 flex flex-col space-y-4">
            
            {/* Active Channel Selector */}
            <div className="flex items-center justify-between bg-[#141414] border border-white/10 p-2 rounded-2xl">
              <span className="text-xs font-mono font-bold text-slate-400 px-2 uppercase flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#E9C349]" /> CANALES EN VIVO:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveChannel('main')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    activeChannel === 'main'
                      ? 'bg-[#E9C349] text-slate-950 border-[#E9C349]'
                      : 'bg-white/5 text-slate-300 border-transparent hover:bg-white/10'
                  }`}
                >
                  🔴 Sala Principal (Brando)
                </button>
                <button
                  onClick={() => setActiveChannel('practice')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    activeChannel === 'practice'
                      ? 'bg-[#9A2B3C] text-white border-[#9A2B3C]'
                      : 'bg-white/5 text-slate-300 border-transparent hover:bg-white/10'
                  }`}
                >
                  ⚡ Practice Room (Arm Drills)
                </button>
                <button
                  onClick={() => setActiveChannel('somatic')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    activeChannel === 'somatic'
                      ? 'bg-purple-600 text-white border-purple-500'
                      : 'bg-white/5 text-slate-300 border-transparent hover:bg-white/10'
                  }`}
                >
                  🧘 Flow Somático
                </button>
              </div>
            </div>

            {/* Stage Player Box */}
            <div className="bg-black rounded-2xl overflow-hidden border border-[#E9C349]/30 relative aspect-video flex items-center justify-center shadow-2xl min-h-[380px] group">
              {isGoogleMeetInline ? (
                <EmbeddedGoogleMeet
                  meetUrl="https://meet.google.com/waacking-academy-live"
                  title="Masterclass de Waacking en Vivo - Brando Hermoso"
                  instructor="Brando Hermoso"
                  isInline={true}
                  onClose={() => setIsGoogleMeetInline(false)}
                />
              ) : (
                <>
                  {/* Stream Background Video / Image Simulation */}
                  {activeChannel === 'main' && (
                    <img 
                      src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=1200" 
                      alt="Waacking Stream" 
                      className="absolute inset-0 w-full h-full object-cover opacity-85 pointer-events-none" 
                    />
                  )}
                  {activeChannel === 'practice' && (
                    <img 
                      src="https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=1200" 
                      alt="Arm Drills" 
                      className="absolute inset-0 w-full h-full object-cover opacity-85 pointer-events-none" 
                    />
                  )}
                  {activeChannel === 'somatic' && (
                    <img 
                      src="https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&q=80&w=1200" 
                      alt="Somatic Flow" 
                      className="absolute inset-0 w-full h-full object-cover opacity-85 pointer-events-none" 
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none" />

                  {/* Live Status Header Overlay */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-auto">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-red-600 text-white text-[10px] font-black tracking-wider px-3 py-1 rounded-full border border-red-400 animate-pulse flex items-center gap-1.5 shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        EN VIVO
                      </span>

                      <span className="bg-black/70 backdrop-blur-md text-[#E9C349] text-[10px] font-mono border border-[#E9C349]/30 px-3 py-1 rounded-full flex items-center gap-1.5 font-bold shadow-md">
                        <Eye className="w-3.5 h-3.5" /> 142 viendo ahora
                      </span>

                      <span className="bg-black/70 backdrop-blur-md text-slate-300 text-[10px] font-mono border border-white/10 px-2.5 py-1 rounded-full">
                        1080p 60fps
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsGoogleMeetInline(true)}
                      className="bg-blue-600/90 hover:bg-blue-600 text-white text-[10px] font-black tracking-wider px-3 py-1.5 rounded-xl border border-blue-400/40 flex items-center gap-1.5 shadow-lg hover:scale-105 transition-all"
                    >
                      <Video className="w-3.5 h-3.5 text-white" /> GOOGLE MEET EN VIVO
                    </button>
                  </div>

                  {/* AI Subtitles overlay */}
                  {subtitlesEnabled && (
                    <div className="absolute bottom-20 left-4 right-4 z-20 bg-black/85 backdrop-blur-md border-2 border-[#E9C349]/50 p-3.5 rounded-2xl flex items-center gap-3 shadow-2xl">
                      <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse shrink-0" />
                      <div className="flex-1">
                        <p className="text-[9px] font-mono font-black text-[#E9C349] uppercase tracking-widest flex items-center gap-1.5">
                          🎤 Subtítulos e Interpretación de Voz IA ({language.toUpperCase()}):
                        </p>
                        <p className="text-xs font-bold text-white leading-relaxed italic mt-0.5">
                          "{translatedSpeech || 'Brando Hermoso: Mantén los hombros alineados al acelerar los giros detrás del cuello.'}"
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Animated Floating Hearts / Reactions */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                    {floatingEmojis.map((item) => (
                      <span 
                        key={item.id} 
                        className="absolute bottom-6 text-4xl animate-float-up pointer-events-none drop-shadow-xl"
                        style={{ left: `${item.left}%` }}
                      >
                        {item.emoji}
                      </span>
                    ))}
                  </div>

                  {/* Host watermark info */}
                  <div className="absolute bottom-4 left-4 z-10 bg-[#141414]/90 p-3 rounded-xl border border-white/10 shadow-2xl backdrop-blur-md">
                    <p className="text-[9px] font-mono font-bold text-[#E9C349] uppercase">INSTRUCTOR DE LA SALA</p>
                    <h4 className="text-xs font-black text-white uppercase mt-0.5">
                      {activeChannel === 'main' ? 'Brando Hermoso' : activeChannel === 'practice' ? 'Sara Waack' : 'Elena Pose'}
                    </h4>
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      {activeChannel === 'main' ? 'Masterclass: Enfoque y proyección en rolls' : activeChannel === 'practice' ? 'Speed Drills 128 BPM' : 'Alineamiento Corporal'}
                    </p>
                  </div>

                  {/* Mute controller button */}
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="absolute bottom-4 right-4 z-10 p-2.5 bg-[#141414]/90 rounded-full border border-white/20 text-white hover:bg-black transition-all shadow-lg"
                    aria-label="Silenciar o activar audio"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#E9C349]" />}
                  </button>
                </>
              )}
            </div>

            {/* Interactive Reaction & Control Bar */}
            <div className="bg-[#141414] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
              {/* Webcam toggler for viewer */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsWebcamOn(!isWebcamOn)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 border ${
                    isWebcamOn 
                      ? 'bg-[#E9C349] text-slate-950 border-[#E9C349]' 
                      : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  {isWebcamOn ? <Video className="w-4 h-4 text-slate-950" /> : <VideoOff className="w-4 h-4" />}
                  {isWebcamOn ? 'CÁMARA EN SALA: ACTIVA' : 'ENCENDER MI CÁMARA'}
                </button>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Comparte tu cámara con el instructor para recibir retroalimentación.
                </span>
              </div>

              {/* Subtitles CC Toggle */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                <Languages className="w-4 h-4 text-[#E9C349]" />
                <span className="text-[10px] font-bold text-white uppercase">SUBTÍTULOS:</span>
                <button
                  onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${
                    subtitlesEnabled ? 'bg-[#9A2B3C] text-white' : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {subtitlesEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Reaction Floating Hearts Emitter Buttons */}
              <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold px-1">REACCIONES:</span>
                <button
                  onClick={() => handleAddReaction('❤️')}
                  className="p-1.5 hover:bg-rose-500/20 rounded-lg active:scale-90 text-base transition-all"
                  title="Enviar Corazón"
                >
                  ❤️
                </button>
                <button
                  onClick={() => handleAddReaction('🔥')}
                  className="p-1.5 hover:bg-amber-500/20 rounded-lg active:scale-90 text-base transition-all"
                  title="Enviar Fuego"
                >
                  🔥
                </button>
                <button
                  onClick={() => handleAddReaction('✨')}
                  className="p-1.5 hover:bg-yellow-500/20 rounded-lg active:scale-90 text-base transition-all"
                  title="Enviar Brillo"
                >
                  ✨
                </button>
                <button
                  onClick={() => handleAddReaction('💃')}
                  className="p-1.5 hover:bg-purple-500/20 rounded-lg active:scale-90 text-base transition-all"
                  title="Enviar Waack"
                >
                  💃
                </button>
                <span className="text-xs font-mono font-bold text-[#E9C349] pl-1">
                  {totalLikes}
                </span>
              </div>
            </div>

            {/* Local Camera Preview Box */}
            {isWebcamOn && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#141414] border border-[#E9C349]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 shadow-2xl"
              >
                <div className="w-32 h-24 bg-black rounded-xl overflow-hidden border border-[#E9C349]/40 relative shrink-0 shadow-lg">
                  {webcamStream ? (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-[#9A2B3C]/20 to-[#E9C349]/20">
                      <User className="w-6 h-6 text-[#E9C349] animate-pulse" />
                    </div>
                  )}
                  <span className="absolute bottom-1 left-1 bg-[#E9C349] text-slate-950 font-mono font-black text-[8px] px-1 rounded">
                    TÚ (SALA LIVE)
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5 uppercase">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    Cámara de alumno activa en la transmisión
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    El instructor Brando y el resto de los alumnos pueden ver tu ejecución en tiempo real para hacerte correcciones.
                  </p>
                </div>
              </motion.div>
            )}

          </div>

          {/* Right Side Chat & Connected Spectators (4 Cols) */}
          <div className="xl:col-span-4 flex flex-col justify-between bg-[#141414] border border-white/10 rounded-2xl overflow-hidden shadow-2xl min-h-[450px]">
            
            {/* Header */}
            <div className="p-4 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#E9C349]" /> CHAT EN VIVO DE LA SALA
                </h4>
                <p className="text-[10px] text-slate-400">Sé constructivo y apoya a los compañeros</p>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Live
              </span>
            </div>

            {/* Pinned announcement if any */}
            {pinnedComment && (
              <div className="p-2.5 bg-[#E9C349]/10 border-b border-[#E9C349]/20 flex items-center justify-between text-xs text-[#E9C349] font-medium">
                <span className="truncate pr-2">{pinnedComment}</span>
                <button onClick={() => setPinnedComment(null)} className="text-slate-400 hover:text-white shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Chat Stream Body */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[360px] scrollbar-thin scrollbar-thumb-[#9A2B3C]">
              {chatMessages.map((msg) => {
                const isTranslated = !!translatedMessages[msg.id];
                const displayedText = isTranslated ? translatedMessages[msg.id] : msg.text;

                return (
                  <div key={msg.id} className="flex gap-2.5 items-start text-xs">
                    <img src={msg.avatar} alt={msg.name} className="w-7 h-7 rounded-full object-cover shrink-0 border border-[#E9C349]/40 mt-0.5" />
                    <div className="flex-1 bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">{msg.name}</span>
                          {msg.badge && (
                            <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#E9C349]/20 text-[#E9C349] border border-[#E9C349]/30">
                              {msg.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-mono text-slate-500">{msg.time}</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed">{displayedText}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendChat} className="p-3 bg-[#181818] border-t border-white/10 flex gap-2">
              <input 
                type="text"
                placeholder="Escribe un mensaje en la transmisión..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E9C349]"
              />
              <button 
                type="submit"
                disabled={!chatInput.trim()}
                className="px-4 py-2 bg-[#E9C349] text-slate-950 font-black rounded-xl text-xs hover:bg-[#f3d362] disabled:opacity-40 transition-all shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>

        </div>
      )}

      {/* 2. GO LIVE / BROADCAST STUDIO TAB */}
      {subTab === 'go-live' && (
        <div className="space-y-6 z-10">
          <div className="bg-[#141414] border border-[#E9C349]/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <Tv className="w-5 h-5 text-[#E9C349]" />
                  <h3 className="text-lg font-black text-white uppercase tracking-wide">
                    ESTUDIO DE TRANSMISIÓN EN VIVO
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Transmite tu propio entrenamiento, práctica de pases o masterclass para todos los miembros de la comunidad Waack ON.
                </p>
              </div>

              {!isBroadcasting ? (
                <button
                  onClick={() => setIsBroadcasting(true)}
                  className="px-6 py-3 bg-[#E9C349] text-slate-950 font-black rounded-xl text-sm hover:bg-[#f3d362] transition-all flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95"
                >
                  <Radio className="w-4 h-4 text-slate-950 animate-pulse" />
                  INICIAR TRANSMISIÓN AHORA
                </button>
              ) : (
                <button
                  onClick={() => setIsBroadcasting(false)}
                  className="px-6 py-3 bg-rose-600 text-white font-black rounded-xl text-sm hover:bg-rose-700 transition-all flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95"
                >
                  <VideoOff className="w-4 h-4" />
                  FINALIZAR TRANSMISIÓN
                </button>
              )}
            </div>

            {/* Broadcast Stage & Form Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
              
              {/* Studio Camera View (7 cols) */}
              <div className="lg:col-span-7 flex flex-col space-y-4">
                <div className="bg-black rounded-2xl overflow-hidden border border-[#E9C349]/40 relative aspect-video flex items-center justify-center shadow-2xl">
                  {cameraActive ? (
                    webcamStream ? (
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    ) : (
                      <div className="relative w-full h-full">
                        <img 
                          src="https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=1000" 
                          alt="Studio Host" 
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="px-3 py-1.5 rounded-xl bg-black/80 text-[#E9C349] text-xs font-mono font-bold border border-[#E9C349]/30">
                            CÁMARA VIRTUAL EN VIVO ACTIVA
                          </span>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="text-center p-8">
                      <VideoOff className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-400 font-bold">Cámara desactivada</p>
                    </div>
                  )}

                  {/* Broadcasting Banner Overlay */}
                  {isBroadcasting && (
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
                      <div className="flex items-center gap-2">
                        <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full border border-red-400 animate-pulse flex items-center gap-1.5 shadow-lg">
                          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          TRANSMITIENDO EN VIVO
                        </span>
                        <span className="bg-black/80 backdrop-blur-md text-[#E9C349] text-[10px] font-mono px-3 py-1 rounded-full border border-[#E9C349]/30 font-bold">
                          ⏱️ {formatDuration(broadcastDuration)}
                        </span>
                      </div>

                      <span className="bg-black/80 backdrop-blur-md text-slate-200 text-[10px] font-mono px-3 py-1 rounded-full border border-white/10 font-bold flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-[#E9C349]" /> {broadcastViewers} espectadores
                      </span>
                    </div>
                  )}

                  {/* Studio Audio Visualizer simulation */}
                  <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between bg-black/80 backdrop-blur-md p-3 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setMicActive(!micActive)}
                        className={`p-2 rounded-lg ${micActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400'}`}
                      >
                        {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      </button>
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {micActive ? 'Micrófono en vivo (Audio 48kHz)' : 'Micrófono Silenciado'}
                      </span>
                    </div>

                    <button 
                      onClick={() => setCameraActive(!cameraActive)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${cameraActive ? 'bg-white/10 text-white border-white/20' : 'bg-rose-600 text-white border-rose-500'}`}
                    >
                      {cameraActive ? 'Apagar Video' : 'Encender Video'}
                    </button>
                  </div>
                </div>

                <div className="bg-[#181818] border border-white/10 rounded-2xl p-4 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400">ESTADO DEL SERVIDOR RTMP:</span>
                  <span className="font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    CONEXIÓN NATIVA EXCELENTE (1080p60 - 6000 kbps)
                  </span>
                </div>
              </div>

              {/* Form Settings (5 cols) */}
              <div className="lg:col-span-5 bg-[#181818] border border-white/10 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-mono font-bold text-[#E9C349] uppercase tracking-wider">
                  CONFIGURACIÓN DE TU STREAM
                </h4>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Título de la Transmisión
                  </label>
                  <input 
                    type="text"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E9C349]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Categoría / Estilo
                  </label>
                  <select 
                    value={broadcastCategory}
                    onChange={(e) => setBroadcastCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E9C349]"
                  >
                    <option value="Waacking">Waacking (Arm Control & Rolls)</option>
                    <option value="Posing">Expressive Posing & Character</option>
                    <option value="Drills">Drills 128 BPM</option>
                    <option value="Battle Jam">Práctica de Batalla Libre</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Pista o Música en Segundo Plano
                  </label>
                  <input 
                    type="text"
                    value={broadcastMusic}
                    onChange={(e) => setBroadcastMusic(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E9C349]"
                  />
                </div>

                <div className="p-3 bg-[#101010] rounded-xl border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 block font-bold">CONSEJO PARA INSTRUCTORES:</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Asegúrate de tener buena iluminación frontal y espacio suficiente para mover los brazos a máxima extensión sin salir de encuadre.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 3. SPECTATORS / CONNECTED AUDIENCE TAB ("Quién está conectado") */}
      {subTab === 'spectators' && (
        <div className="space-y-6 z-10">
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#E9C349]" />
                  AUDIENCIA Y ESPECTADORES CONECTADOS EN TIEMPO REAL
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Visualiza quiénes están sintonizando la sala de transmisiones en directo de Waack ON.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold rounded-xl flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {spectators.length} Usuarios Activos
                </span>
              </div>
            </div>

            {/* Spectators Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {spectators.map((spec) => (
                <div 
                  key={spec.id} 
                  className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-[#E9C349]/50 transition-all shadow-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img 
                        src={spec.avatar} 
                        alt={spec.name} 
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#E9C349]/60" 
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#1a1a1a]" />
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-white truncate flex items-center gap-1.5">
                        {spec.name}
                        {spec.role === 'Host' && <Crown className="w-3.5 h-3.5 text-[#E9C349]" />}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-400 truncate">@{spec.nickname}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#E9C349]/15 text-[#E9C349] border border-[#E9C349]/30">
                          {spec.role}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">{spec.location}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSubTab('live-room');
                      setChatMessages(prev => [
                        ...prev,
                        {
                          id: `msg-${Date.now()}`,
                          name: currentUser.name,
                          avatar: currentUser.avatar,
                          text: `👋 ¡Un gran saludo para ${spec.name} en el live!`,
                          time: 'Ahora'
                        }
                      ]);
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-[#E9C349] hover:text-slate-950 text-slate-300 transition-all shrink-0"
                    title="Saludar en el Live Chat"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. LIVE BATTLES PRACTICE TAB */}
      {subTab === 'battle-training' && (
        <LiveBattleTraining currentUser={currentUser} language={language} />
      )}

      {/* 5. CLASS CALENDAR TAB */}
      {subTab === 'calendar' && (
        <div className="space-y-6 z-10">
          <div className="p-5 bg-[#141414] border border-blue-500/30 rounded-2xl shadow-xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  SINCRONIZACIÓN OFICIAL
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" /> AGENDA GOOGLE CALENDAR DE LIVES
                </h3>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-1 leading-relaxed">
                Guarda tus clases en vivo y masterclasses de Waack ON en tu calendario personal para recibir alertas automáticas.
              </p>
            </div>

            <button
              onClick={handleConnectGoogleCalendar}
              disabled={gcalBannerLoading}
              className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 border ${
                isGCalConnected
                  ? 'bg-blue-600/20 border-blue-400 text-blue-300 hover:bg-blue-600/30'
                  : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400 shadow-lg active:scale-95'
              }`}
            >
              {gcalBannerLoading ? 'CONECTANDO...' : isGCalConnected ? 'GOOGLE CALENDAR VINCULADO' : 'CONECTAR MI GOOGLE CALENDAR'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {events.map((evt) => {
              const isSynced = syncedEvents.includes(evt.id);
              const isLoadingThis = gcalLoadingId === evt.id;

              return (
                <div key={evt.id} className="bg-[#141414] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-2xl hover:border-[#E9C349]/40 transition-all">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-[9px] font-mono text-[#E9C349] bg-[#E9C349]/10 border border-[#E9C349]/20 px-2.5 py-0.5 rounded-full font-bold">
                        {evt.duration}
                      </span>
                      <span className="text-xs text-[#E9C349] font-mono font-bold flex items-center gap-1 uppercase">
                        <Calendar className="w-3.5 h-3.5" /> {evt.date} • {evt.time}
                      </span>
                    </div>

                    <h3 className="text-md font-bold text-white uppercase mt-3 tracking-wide">{evt.title}</h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase">Instructor: {evt.instructor}</p>
                    <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">{evt.description}</p>
                  </div>

                  <div className="border-t border-white/10 pt-4 space-y-2">
                    <button
                      onClick={() => onToggleRsvp(evt.id)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 uppercase ${
                        evt.rsvpByMe 
                          ? 'bg-[#E9C349]/20 border-[#E9C349] text-[#E9C349]' 
                          : 'bg-[#E9C349] text-slate-950 border-[#E9C349] hover:bg-[#f3d362]'
                      }`}
                    >
                      {evt.rsvpByMe ? <CheckCircle2 className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                      {evt.rsvpByMe ? 'ASISTENCIA CONFIRMADA' : 'CONFIRMAR ASISTENCIA'}
                    </button>

                    <button
                      onClick={() => handleAddToGoogleCalendar(evt)}
                      disabled={isLoadingThis}
                      className="w-full py-2.5 rounded-xl text-xs font-bold transition-all border border-blue-500/30 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 flex items-center justify-center gap-1.5 uppercase"
                    >
                      <Calendar className="w-4 h-4 text-blue-400" />
                      {isLoadingThis ? 'GUARDANDO EN CALENDAR...' : isSynced ? 'EN TU GOOGLE CALENDAR' : 'AÑADIR A GOOGLE CALENDAR'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Embedded Google Meet Float */}
      {activeEmbeddedMeet && (
        <EmbeddedGoogleMeet
          meetUrl={activeEmbeddedMeet.url}
          title={activeEmbeddedMeet.title}
          instructor={activeEmbeddedMeet.instructor}
          onClose={() => setActiveEmbeddedMeet(null)}
        />
      )}
    </div>
  );
}
