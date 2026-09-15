import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  Volume2, 
  Sparkles, 
  Radio, 
  ArrowRight, 
  CheckCircle2, 
  Calendar, 
  MessageSquare, 
  VolumeX,
  Plus,
  Compass,
  Camera,
  CameraOff,
  Music,
  Clock,
  Users,
  Flame,
  HelpCircle,
  User as UserIcon,
  Youtube,
  Instagram,
  Facebook,
  Twitter,
  Send,
  Sliders,
  Tv,
  Check,
  Video,
  Trophy,
  Megaphone,
  Zap,
  ExternalLink,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  ZoomIn,
  Target,
  Edit3,
  Save,
  Download,
  FileJson,
  Copy,
  FileText,
  Gauge,
  GraduationCap,
  Bell,
  Signal,
  Eye,
  ShieldCheck,
  Cast
} from 'lucide-react';
import AnnouncementImagePicker from './AnnouncementImagePicker';
import { WaackOnLogo } from './WaackOnLogo';
import { 
  User, 
  Lesson, 
  PlaylistItem, 
  FeedbackItem, 
  CalendarEvent, 
  ChatMessage,
  PracticeLog,
  Announcement
} from '../types';
import EmbeddedGoogleMeet from './EmbeddedGoogleMeet';
import InstructorMembershipModal, { InstructorPlanInfo } from './InstructorMembershipModal';
import StudentLevelProgressBar from './StudentLevelProgressBar';
import StudentTrainingLibrary from './StudentTrainingLibrary';
import MultiSourceMusicEngine from './MultiSourceMusicEngine';
import WeeklyMuscleRecommendationPanel from './WeeklyMuscleRecommendationPanel';
import WelcomeDashboard from './WelcomeDashboard';

import { Language, translations } from '../lib/translations';
import { getPersonalizedRecommendations } from '../lib/api';
import { computeRecommendations, RecommendationItem } from '../lib/recommendations/engine';

import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  Cell,
  Legend,
  ReferenceLine
} from 'recharts';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface DashboardViewProps {
  currentUser: User;
  lessons: Lesson[];
  playlists: PlaylistItem[];
  feedbackItems: FeedbackItem[];
  events: CalendarEvent[];
  chatMessages: ChatMessage[];
  announcements?: Announcement[];
  onAddAnnouncement?: (title: string, content: string, important?: boolean, category?: string, actionUrl?: string, imageUrl?: string) => void;
  onDeleteAnnouncement?: (id: string) => void;
  setActiveTab: (tab: string) => void;
  onMarkLessonComplete: (lessonId: string, completed: boolean) => void;
  selectedCourseLevel: 1 | 2;
  setSelectedCourseLevel: (level: 1 | 2) => void;
  onAddChatMessage?: (text: string) => void;
  practiceLogs: PracticeLog[];
  onLogPractice: (minutes: number, activityType: 'drill' | 'battle' | 'combo' | 'playlist' | 'sensorial', description: string, extra?: { category?: Lesson['category']; bpm?: number }) => void;
  language: Language;
  onUserChange?: (arg: User | ((prev: User) => User)) => void;
  theme?: 'dark' | 'light';
  onOpenPlansModal?: () => void;
}



const STUDY_GROUPS = [
  { id: 'sg-1', title: 'Afinación de Rolls a 125 BPM', participants: 18, lastActive: 'Hace 5m', category: 'Técnica' },
  { id: 'sg-2', title: 'Estilo Disco de los 70s vs Electrónica', participants: 12, lastActive: 'Hace 20m', category: 'Historia' },
  { id: 'sg-3', title: 'Preparación para la Batalla Waack On', participants: 25, lastActive: 'Hace 2m', category: 'Freestyle' }
];

export default function DashboardView({
  currentUser,
  lessons,
  playlists,
  feedbackItems,
  events,
  chatMessages,
  announcements = [],
  onAddAnnouncement,
  onDeleteAnnouncement,
  setActiveTab,
  onMarkLessonComplete,
  selectedCourseLevel,
  setSelectedCourseLevel,
  onAddChatMessage,
  practiceLogs,
  onLogPractice,
  language,
  onUserChange,
  onOpenPlansModal
}: DashboardViewProps) {
  // Check if current user is newly registered, guest, or has unassigned role
  const isNewlyRegistered = currentUser.role === 'guest' || !currentUser.role || (
    currentUser.role === 'student' && 
    (!currentUser.completedLessons || currentUser.completedLessons.length === 0) && 
    (currentUser.points || 0) === 0 && 
    currentUser.billingStatus !== 'active'
  );

  const [showWelcomeDashboard, setShowWelcomeDashboard] = useState<boolean>(() => {
    const saved = localStorage.getItem('waackon_view_welcome_mode');
    if (saved !== null) {
      return saved === 'true';
    }
    return isNewlyRegistered;
  });

  const handleToggleWelcomeMode = (val: boolean) => {
    setShowWelcomeDashboard(val);
    localStorage.setItem('waackon_view_welcome_mode', val ? 'true' : 'false');
  };

  // Freestyle generator state
  const [randomPrompt, setRandomPrompt] = useState<string>("Haz clic en Generar para iniciar un reto de freestyle instantáneo");
  const [isGenerating, setIsGenerating] = useState(false);
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('');

  // Manual practice log form states
  const [showLogForm, setShowLogForm] = useState(false);
  const [showMeetModal, setShowMeetModal] = useState(false);
  const [logMinutes, setLogMinutes] = useState<number>(20);
  const [logType, setLogType] = useState<'drill' | 'battle' | 'combo' | 'playlist' | 'sensorial'>('drill');
  const [logDesc, setLogDesc] = useState<string>('');

  // Instructor Announcements Section States
  const [selectedAnnCat, setSelectedAnnCat] = useState<'todos' | 'competencias' | 'sesiones' | 'clases' | 'comunicados'>('todos');
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState<string>(() => {
    return localStorage.getItem('waackon_draft_dashboard_announcement_title') || '';
  });
  const [annContent, setAnnContent] = useState<string>(() => {
    return localStorage.getItem('waackon_draft_dashboard_announcement_content') || '';
  });
  const [bentoChatInput, setBentoChatInput] = useState<string>(() => {
    return localStorage.getItem('waackon_draft_bento_chat') || '';
  });

  useEffect(() => {
    if (annTitle) {
      localStorage.setItem('waackon_draft_dashboard_announcement_title', annTitle);
    } else {
      localStorage.removeItem('waackon_draft_dashboard_announcement_title');
    }
  }, [annTitle]);

  useEffect(() => {
    if (annContent) {
      localStorage.setItem('waackon_draft_dashboard_announcement_content', annContent);
    } else {
      localStorage.removeItem('waackon_draft_dashboard_announcement_content');
    }
  }, [annContent]);

  useEffect(() => {
    if (bentoChatInput) {
      localStorage.setItem('waackon_draft_bento_chat', bentoChatInput);
    } else {
      localStorage.removeItem('waackon_draft_bento_chat');
    }
  }, [bentoChatInput]);
  const [annCategory, setAnnCategory] = useState<'competencias' | 'sesiones' | 'clases' | 'comunicados'>('comunicados');
  const [annImportant, setAnnImportant] = useState(false);
  const [annActionUrl, setAnnActionUrl] = useState('');
  const [annImage, setAnnImage] = useState<string | null>(null);
  const [annLightboxImage, setAnnLightboxImage] = useState<string | null>(null);
  const [annAlertMessage, setAnnAlertMessage] = useState<string | null>(null);
  const [selectedInstructorForPlan, setSelectedInstructorForPlan] = useState<InstructorPlanInfo | null>(null);

  // Instructor Platform & Price Editor State inside Directorio
  const [showInstructorPlatformEditor, setShowInstructorPlatformEditor] = useState(false);
  const [editPlatformSubTab, setEditPlatformSubTab] = useState<'price' | 'profile' | 'config' | 'content'>('price');
  const [editPriceInput, setEditPriceInput] = useState(currentUser.monthlyPrice || '$35 USD/mes');
  const [editNameInput, setEditNameInput] = useState(currentUser.name || 'Alexander Jackson');
  const [editInstaInput, setEditInstaInput] = useState(currentUser.instagram || '@waack_instructor');
  const [editSpecialtyInput, setEditSpecialtyInput] = useState('Arm Velocity, Wrist Rolls & Performance');
  const [editCountryInput, setEditCountryInput] = useState('México 🇲🇽');
  const [editBioInput, setEditBioInput] = useState('Profesor titular de la Cátedra Waack On y Director de Técnica.');
  const [platformSaveNotice, setPlatformSaveNotice] = useState<string | null>(null);

  // Assigned Tasks for recommendation engine
  const [assignedTasks, setAssignedTasks] = useState<any[]>([]);

  // Gamification Celebration State for Points & Level Completion
  const [showConfetti, setShowConfetti] = useState(false);
  const [isPointsGlowing, setIsPointsGlowing] = useState(false);
  const [floatingBonusText, setFloatingBonusText] = useState<string | null>(null);
  const [confettiParticles, setConfettiParticles] = useState<Array<{
    id: number;
    targetX: number;
    targetY: number;
    size: number;
    color: string;
    shape: string;
    rotation: number;
    duration: number;
  }>>([]);

  const prevPointsRef = useRef<number>(currentUser.points || 0);
  const prevL1PercentRef = useRef<number>(0);
  const prevL2PercentRef = useRef<number>(0);

  const triggerCelebration = (message: string) => {
    const colors = ['#D9A9FF', '#C23E9E', '#ffffff', '#38bdf8', '#a855f7', '#34d399', '#f43f5e', '#fbbf24'];
    const shapes = ['circle', 'square', 'star'];
    const newParticles = Array.from({ length: 48 }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / 48 + (Math.random() * 0.4 - 0.2);
      const distance = 90 + Math.random() * 200;
      return {
        id: Date.now() + i,
        targetX: Math.cos(angle) * distance,
        targetY: Math.sin(angle) * distance - (50 + Math.random() * 70),
        size: 6 + Math.random() * 9,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        rotation: Math.random() * 720 - 360,
        duration: 0.9 + Math.random() * 0.9,
      };
    });

    setConfettiParticles(newParticles);
    setShowConfetti(true);
    setIsPointsGlowing(true);
    setFloatingBonusText(message);

    setTimeout(() => {
      setIsPointsGlowing(false);
    }, 1800);

    setTimeout(() => {
      setShowConfetti(false);
      setFloatingBonusText(null);
    }, 2800);
  };
  useEffect(() => {
    let isMounted = true;
    const defaultFallbackTasks = [
      {
        id: 't-default-1',
        title: 'Drill de Posing con Matices Sincrónicos (120 BPM)',
        description: 'Ejecuta 8 tiempos de Posing estricto manteniendo proyección visual constante a la cámara.',
        category: 'técnica',
        points: 50,
        authorUid: 'inst-1',
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    ];

    fetch('/api/student/tasks')
      .then(res => {
        if (!res || !res.ok) return null;
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) return null;
        return res.json().catch(() => null);
      })
      .then(data => {
        if (!isMounted) return;
        if (data && data.success && Array.isArray(data.tasks)) {
          const myTasks = data.tasks.filter((t: any) => !t.studentUid || t.studentUid === currentUser.id);
          setAssignedTasks(myTasks.length > 0 ? myTasks : defaultFallbackTasks.filter((t: any) => !t.studentUid || t.studentUid === currentUser.id));
        } else {
          setAssignedTasks(defaultFallbackTasks.filter((t: any) => !t.studentUid || t.studentUid === currentUser.id));
        }
      })
      .catch(() => {
        if (isMounted) {
          setAssignedTasks(defaultFallbackTasks.filter((t: any) => !t.studentUid || t.studentUid === currentUser.id));
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser.id]);

  const recommendations = computeRecommendations({
    user: currentUser,
    logs: practiceLogs || [],
    lessons: lessons || [],
    playlists: playlists || [],
    assignedTasks: assignedTasks || [],
    limit: 5
  }) || [];
  const instructorTaskRec = recommendations.find(r => r.type === 'instructor_task');

  const handleAnnImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setAnnImage(dataUrl);
      }
    };
    reader.readAsDataURL(file as Blob);
  };

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    if (onAddAnnouncement) {
      onAddAnnouncement(
        annTitle.trim(),
        annContent.trim(),
        annImportant,
        annCategory,
        annActionUrl.trim() || undefined,
        annImage || undefined
      );
    }

    setAnnAlertMessage('¡Anuncio publicado en el Dashboard Principal exitosamente!');
    setTimeout(() => setAnnAlertMessage(null), 3500);

    setAnnTitle('');
    setAnnContent('');
    setAnnActionUrl('');
    setAnnImage(null);
    setAnnImportant(false);
    setShowAnnModal(false);
    localStorage.removeItem('waackon_draft_dashboard_announcement_title');
    localStorage.removeItem('waackon_draft_dashboard_announcement_content');
  };

  // Time range and chart view mode state for Recharts visualization
  const [chartTimeRange, setChartTimeRange] = useState<7 | 14 | 30>(7);
  const [chartViewMode, setChartViewMode] = useState<'line' | 'stacked' | 'total'>('line');

  // Instructor Lives & Announcement Hub State
  const [selectedLiveId, setSelectedLiveId] = useState<string>('live-brando');
  const [liveFilterTab, setLiveFilterTab] = useState<'all' | 'live' | 'today' | 'upcoming'>('all');
  const [liveReminders, setLiveReminders] = useState<Record<string, boolean>>({});
  const [liveToastNotice, setLiveToastNotice] = useState<string | null>(null);

  const INSTRUCTOR_LIVES = [
    {
      id: 'live-brando',
      instructor: 'Brando Hermoso',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
      role: 'Master Instructor & Director',
      country: 'España',
      countryFlag: '🇪🇸',
      title: 'Masterclass en Vivo: Aceleración de Rolls, Resistencia & Técnica Disco',
      description: 'Sesión técnica en tiempo real desde la sala central. Corrección postural de rolls, fijación escapular y aceleración progresiva de 115 a 128 BPM con feedback en directo.',
      status: 'live' as const,
      statusLabel: 'EN DIRECTO AHORA',
      viewers: 94,
      scheduledTime: 'Transmitiendo en Directo Ahora',
      bpm: 128,
      category: 'Técnica & Rolls',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-party-lights-and-people-dancing-40348-large.mp4',
      tag: 'MASTERCLASS EN VIVO',
      roomName: 'Sala Central 01 - Live Room',
      level: 'Intermedio / Avanzado',
      topics: ['Biomecánica de Hombros', 'Rolls a 128 BPM', 'Feedback en Vivo'],
      isOfficial: true
    },
    {
      id: 'live-kumari',
      instructor: 'Kumari "WaackQueen"',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
      role: 'Elite Instructor • Los Ángeles',
      country: 'Estados Unidos',
      countryFlag: '🇺🇸',
      title: 'Taller en Vivo: Expresión Dramática, Pasarela y Presencia Escénica',
      description: 'Aprende los secretos del posing teatral, la proyección escénica de la mirada y cómo interpretar narrativamente pistas disco clásicas de los años 70.',
      status: 'today' as const,
      statusLabel: 'HOY 19:30 HRS',
      viewers: 142,
      scheduledTime: 'Hoy a las 19:30 hrs (En 45 min)',
      bpm: 118,
      category: 'Posing & Carácter',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      tag: 'TALLER HOY',
      roomName: 'Sala Sunset LA - Live',
      level: 'Todos los niveles',
      topics: ['Teatralidad', 'Pasarela Disco', 'Expresión Facial'],
      isOfficial: true
    },
    {
      id: 'live-ibuki',
      instructor: 'Ibuki Imata',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
      role: 'Master Instructor • Osaka',
      country: 'Japón',
      countryFlag: '🇯🇵',
      title: 'Live Internacional: Speed Drills & Biomecánica de Codos a 135 BPM',
      description: 'Velocidad ultra-limpia sin tensión cervical. Metodología de control excéntrico para clavar los golpes en el acento musical con fluidez extrema.',
      status: 'upcoming' as const,
      statusLabel: 'MAÑANA 11:00 HRS',
      viewers: 210,
      scheduledTime: 'Mañana a las 11:00 hrs (GMT+1)',
      bpm: 135,
      category: 'Velocidad BPM',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-party-lights-and-people-dancing-40348-large.mp4',
      tag: 'LIVESTREAM GLOBAL',
      roomName: 'Sala Tokyo Speed',
      level: 'Avanzado',
      topics: ['Velocidad 135 BPM', 'Codos & Aislamiento', 'Drills de Resistencia'],
      isOfficial: true
    },
    {
      id: 'live-yoonji',
      instructor: 'YoonJi Kim',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120',
      role: 'Elite Instructor • Seúl',
      country: 'Corea del Sur',
      countryFlag: '🇰🇷',
      title: 'Batalla en Vivo & Q&A: Análisis de Musicalidad Funk & Síncopa 70s',
      description: 'Sesión interactiva en directo de análisis de ritmos complejos y cómo crear variaciones inesperadas en rondas de batalla de alta tensión.',
      status: 'upcoming' as const,
      statusLabel: 'SÁBADO 18:00 HRS',
      viewers: 180,
      scheduledTime: 'Sábado a las 18:00 hrs',
      bpm: 122,
      category: 'Musicalidad & Batallas',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      tag: 'SESIÓN DE BATALLA',
      roomName: 'Sala Seoul Groove',
      level: 'Intermedio',
      topics: ['Síncopa Rítmica', 'Estrategia de Batalla', 'Preguntas & Respuestas'],
      isOfficial: true
    }
  ];

  const activeSelectedLive = INSTRUCTOR_LIVES.find(l => l.id === selectedLiveId) || INSTRUCTOR_LIVES[0];

  const handleToggleLiveReminder = (liveId: string, instructorName: string, time: string) => {
    setLiveReminders(prev => {
      const newState = !prev[liveId];
      if (newState) {
        setLiveToastNotice(`🔔 ¡Recordatorio activado! Te notificaremos antes de que inicie el Live de ${instructorName} (${time}).`);
      } else {
        setLiveToastNotice(`🔕 Recordatorio desactivado para el Live de ${instructorName}.`);
      }
      setTimeout(() => setLiveToastNotice(null), 4500);
      return { ...prev, [liveId]: newState };
    });
  };

  // Hero Banner Default Video State
  const [heroVideoMuted, setHeroVideoMuted] = useState(true);
  const [heroVideoPlaying, setHeroVideoPlaying] = useState(true);
  const [heroVideoFallbackIndex, setHeroVideoFallbackIndex] = useState(0);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);

  const heroVideoSources = [
    activeSelectedLive.videoUrl || '/videos/waack-on-intro.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-party-lights-and-people-dancing-40348-large.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  ];

  const currentHeroVideoSrc = activeSelectedLive.videoUrl || heroVideoSources[heroVideoFallbackIndex % heroVideoSources.length];

  const handleHeroVideoError = () => {
    if (heroVideoFallbackIndex < heroVideoSources.length - 1) {
      setHeroVideoFallbackIndex(prev => prev + 1);
    }
  };

  const toggleHeroVideoPlay = () => {
    if (heroVideoRef.current) {
      if (heroVideoPlaying) {
        heroVideoRef.current.pause();
        setHeroVideoPlaying(false);
      } else {
        heroVideoRef.current.play().catch(() => {});
        setHeroVideoPlaying(true);
      }
    }
  };

  const toggleHeroVideoMute = () => {
    if (heroVideoRef.current) {
      heroVideoRef.current.muted = !heroVideoMuted;
      setHeroVideoMuted(!heroVideoMuted);
    }
  };

  // Real-time Firestore Practice Logs from subcollection 'practice_logs'
  const [firestoreLogs, setFirestoreLogs] = useState<PracticeLog[]>([]);

  useEffect(() => {
    if (!currentUser?.id) return;
    const activeUid = currentUser.id;
    const logsRef = collection(db, 'users', activeUid, 'practice_logs');
    
    const unsub = onSnapshot(
      logsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const fetchedLogs: PracticeLog[] = [];
          snapshot.docs.forEach((docSnap) => {
            const data = docSnap.data();
            fetchedLogs.push({
              id: docSnap.id,
              date: data.date || new Date().toISOString().split('T')[0],
              minutes: typeof data.minutes === 'number' ? data.minutes : 0,
              activityType: data.activityType || 'drill',
              description: data.description || 'Práctica realizada',
              bpm: data.bpm,
              category: data.category,
              pointsEarned: data.pointsEarned
            } as PracticeLog);
          });
          setFirestoreLogs(fetchedLogs);
        }
      },
      (error) => {
        console.warn("Firestore listener warning on practice_logs subcollection:", error);
      }
    );

    return () => unsub();
  }, [currentUser?.id]);

  // Combine practiceLogs from props and direct firestoreLogs from subcollection 'practice_logs'
  const effectiveLogs = React.useMemo(() => {
    const logMap = new Map<string, PracticeLog>();
    (practiceLogs || []).forEach(l => {
      if (l && l.id) logMap.set(l.id, l);
    });
    firestoreLogs.forEach(l => {
      if (l && l.id) logMap.set(l.id, l);
    });
    return Array.from(logMap.values());
  }, [practiceLogs, firestoreLogs]);

  // JSON Export States
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<string | null>(null);
  const [showJsonExportModal, setShowJsonExportModal] = useState(false);
  const [copiedJsonNotice, setCopiedJsonNotice] = useState(false);

  // Helper to format days and map practice logs categorized by activity type
  const getChartData = (daysCount: number = 7) => {
    const dayLabels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const data = [];

    // We'll generate the last N days including today
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0]; // "YYYY-MM-DD"
      const dayName = dayLabels[d.getDay()];

      // Filter and sum logs for this day categorized by activityType from Firestore subcollection 'practice_logs'
      const dayLogs = effectiveLogs.filter(log => log.date === dateStr);
      const drill = dayLogs.filter(l => l.activityType === 'drill').reduce((sum, log) => sum + (log.minutes || 0), 0);
      const battle = dayLogs.filter(l => l.activityType === 'battle').reduce((sum, log) => sum + (log.minutes || 0), 0);
      const combo = dayLogs.filter(l => l.activityType === 'combo').reduce((sum, log) => sum + (log.minutes || 0), 0);
      const playlist = dayLogs.filter(l => l.activityType === 'playlist').reduce((sum, log) => sum + (log.minutes || 0), 0);
      const sensorial = dayLogs.filter(l => l.activityType === 'sensorial').reduce((sum, log) => sum + (log.minutes || 0), 0);
      const totalMinutes = dayLogs.reduce((sum, log) => sum + (log.minutes || 0), 0);

      data.push({
        id: `chart-day-${dateStr}`,
        date: dateStr,
        dayName: daysCount > 14 ? `${d.getDate()}/${d.getMonth() + 1}` : `${dayName} ${d.getDate()}`,
        label: dayName,
        minutos: totalMinutes,
        targetMinutes: currentUser.targetMinutes || 30,
        drill,
        battle,
        combo,
        playlist,
        sensorial,
        logs: dayLogs
      });
    }

    return data;
  };

  const getPracticeStreak = () => {
    let streak = 0;
    // Let's count backwards starting from today
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const hasPractice = effectiveLogs.some(log => log.date === dateStr && log.minutes > 0);
      if (hasPractice) {
        streak++;
      } else {
        // Break streak if it wasn't today and was yesterday
        if (i > 0) break;
      }
    }
    return streak;
  };

  // Download practice history JSON handler for the week
  const handleDownloadWeeklyLogsJSON = () => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const cutoffDateStr = sevenDaysAgo.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    const weeklyLogs = effectiveLogs.filter(log => log.date >= cutoffDateStr);
    const totalMins = weeklyLogs.reduce((acc, l) => acc + (l.minutes || 0), 0);

    const exportPayload = {
      app: "WaackOn Platform",
      version: "2.0",
      exportedAt: new Date().toISOString(),
      period: {
        type: "weekly",
        startDate: cutoffDateStr,
        endDate: todayStr,
        totalMinutes: totalMins,
        totalSessions: weeklyLogs.length
      },
      student: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        targetMinutes: currentUser.targetMinutes || 30,
        streakDays: getPracticeStreak()
      },
      activityBreakdownMinutes: {
        drill: weeklyLogs.filter(l => l.activityType === 'drill').reduce((a, l) => a + (l.minutes || 0), 0),
        battle: weeklyLogs.filter(l => l.activityType === 'battle').reduce((a, l) => a + (l.minutes || 0), 0),
        combo: weeklyLogs.filter(l => l.activityType === 'combo').reduce((a, l) => a + (l.minutes || 0), 0),
        playlist: weeklyLogs.filter(l => l.activityType === 'playlist').reduce((a, l) => a + (l.minutes || 0), 0),
        sensorial: weeklyLogs.filter(l => l.activityType === 'sensorial').reduce((a, l) => a + (l.minutes || 0), 0)
      },
      logs: weeklyLogs.map(log => ({
        id: log.id,
        date: log.date,
        minutes: log.minutes,
        activityType: log.activityType,
        description: log.description,
        category: log.category || null,
        bpm: log.bpm || null,
        timestamp: (log as any).timestamp || null
      }))
    };

    const jsonStr = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (currentUser.name || 'alumno').toLowerCase().replace(/[^a-z0-9]/g, '_');
    a.download = `historial_semanal_waackon_${safeName}_${todayStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccessNotice(`✓ Historial de la semana descargado como JSON exitosamente (${weeklyLogs.length} sesiones, ${totalMins} min).`);
    setTimeout(() => setDownloadSuccessNotice(null), 4500);
  };

  const getWeeklyLogsJSONString = () => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const cutoffDateStr = sevenDaysAgo.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    const weeklyLogs = effectiveLogs.filter(log => log.date >= cutoffDateStr);
    const totalMins = weeklyLogs.reduce((acc, l) => acc + (l.minutes || 0), 0);

    return JSON.stringify({
      app: "WaackOn Platform",
      exportedAt: new Date().toISOString(),
      period: {
        startDate: cutoffDateStr,
        endDate: todayStr,
        totalMinutes: totalMins,
        totalSessions: weeklyLogs.length
      },
      student: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        targetMinutes: currentUser.targetMinutes || 30
      },
      logs: weeklyLogs
    }, null, 2);
  };

  const handleCopyWeeklyLogsJSON = () => {
    const str = getWeeklyLogsJSONString();
    navigator.clipboard.writeText(str);
    setCopiedJsonNotice(true);
    setTimeout(() => setCopiedJsonNotice(false), 2500);
  };

  const chartData = getChartData(chartTimeRange);

  const ACTIVITY_CONFIG: Record<PracticeLog['activityType'], { label: string; color: string; icon: string }> = {
    drill: { label: 'Drills & Técnica', color: '#D9A9FF', icon: '⚡' },
    battle: { label: 'Batallas & Freestyle', color: '#C23E9E', icon: '⚔️' },
    combo: { label: 'Combos & Rutinas', color: '#3B82F6', icon: '💃' },
    playlist: { label: 'Música & Ritmo', color: '#10B981', icon: '🎵' },
    sensorial: { label: 'Somático & Postura', color: '#8B5CF6', icon: '🧘' },
  };

  const weeklyCategoryTotals = {
    drill: chartData.reduce((acc, curr) => acc + curr.drill, 0),
    battle: chartData.reduce((acc, curr) => acc + curr.battle, 0),
    combo: chartData.reduce((acc, curr) => acc + curr.combo, 0),
    playlist: chartData.reduce((acc, curr) => acc + curr.playlist, 0),
    sensorial: chartData.reduce((acc, curr) => acc + curr.sensorial, 0),
  };

  // Playlists player preview state
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState<PlaylistItem>(playlists[0]);
  const [audioProgress, setAudioProgress] = useState(30);

  // Live video preview state
  const [isMuted, setIsMuted] = useState(true);
  const [liveChat, setLiveChat] = useState<string[]>([]);
  const [newLiveMessage, setNewLiveMessage] = useState('');

  // Virtual Mirror states
  const [isMirrorOn, setIsMirrorOn] = useState(false);
  const [mirrorStream, setMirrorStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Course Progress Calculations
  const safeLessons = lessons || [];
  const safeLogs = practiceLogs || [];
  const level1Lessons = safeLessons.filter(l => l && l.level === 1);
  const level2Lessons = safeLessons.filter(l => l && l.level === 2);
  const l1CompletedCount = level1Lessons.filter(l => (currentUser.completedLessons || []).includes(l.id)).length;
  const l2CompletedCount = level2Lessons.filter(l => (currentUser.completedLessons || []).includes(l.id)).length;
  const l1Percent = Math.round((l1CompletedCount / (level1Lessons.length || 1)) * 100) || 0;
  const l2Percent = Math.round((l2CompletedCount / (level2Lessons.length || 1)) * 100) || 0;

  // Monitor points change automatically
  useEffect(() => {
    const curPts = currentUser.points || 0;
    if (prevPointsRef.current !== undefined && curPts > prevPointsRef.current) {
      const delta = curPts - prevPointsRef.current;
      triggerCelebration(`+${delta} PTS GANADOS! 🌟`);
    }
    prevPointsRef.current = curPts;
  }, [currentUser.points]);

  // Monitor Level 1 completion automatically
  useEffect(() => {
    if (l1Percent >= 100 && prevL1PercentRef.current < 100 && prevL1PercentRef.current > 0) {
      triggerCelebration('🎉 ¡NIVEL 1 COMPLETADO AL 100%! 🏆');
    }
    prevL1PercentRef.current = l1Percent;
  }, [l1Percent]);

  // Monitor Level 2 completion automatically
  useEffect(() => {
    if (l2Percent >= 100 && prevL2PercentRef.current < 100 && prevL2PercentRef.current > 0) {
      triggerCelebration('🏆 ¡NIVEL 2 COMPLETADO AL 100%! 🌟');
    }
    prevL2PercentRef.current = l2Percent;
  }, [l2Percent]);

  const handleSimulatePointsGain = (amount: number = 50) => {
    if (onUserChange) {
      onUserChange(prev => ({ ...prev, points: (prev.points || 0) + amount }));
    } else {
      triggerCelebration(`+${amount} PTS GANADOS! 🌟`);
    }
  };

  const handleSimulateLevelCompletion = () => {
    triggerCelebration('🎉 ¡NIVEL COMPLETADO! LOGRO DESBLOQUEADO 🏆');
  };

  const [recs, setRecs] = useState<any>(null);

  useEffect(() => {
    if (currentUser.id && safeLogs.length >= 0) {
      getPersonalizedRecommendations(currentUser, safeLogs)
        .then(setRecs)
        .catch(console.warn);
    }
  }, [currentUser.id, safeLogs.length]);

  // Sound simulation interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle Virtual Mirror Camera Stream
  const toggleVirtualMirror = async () => {
    if (isMirrorOn) {
      if (mirrorStream) {
        mirrorStream.getTracks().forEach(track => track.stop());
      }
      setMirrorStream(null);
      setIsMirrorOn(false);
    } else {
      try {
        if (!navigator?.mediaDevices?.getUserMedia) {
          throw new Error('MediaDevices not supported');
        }
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        setMirrorStream(stream);
        setIsMirrorOn(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        console.warn("Virtual mirror webcam access notice:", err?.message || err);
        setAnnAlertMessage("No se pudo acceder a la cámara. Revisa los permisos de video en tu navegador para el Espejo Virtual.");
        setTimeout(() => setAnnAlertMessage(null), 4000);
      }
    }
  };

  // Assign stream if camera starts
  useEffect(() => {
    if (isMirrorOn && mirrorStream && videoRef.current) {
      videoRef.current.srcObject = mirrorStream;
    }
  }, [isMirrorOn, mirrorStream]);

  // Clean camera stream on unmount
  useEffect(() => {
    return () => {
      if (mirrorStream) {
        mirrorStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mirrorStream]);

  // Generate deterministic recommendation-based challenge
  const handleGeneratePrompt = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const recs = computeRecommendations({
        user: currentUser,
        logs: practiceLogs,
        lessons,
        playlists,
        limit: 10
      });
      if (recs.length > 0) {
        const rec = recs[Math.floor(Math.random() * recs.length)];
        setRandomPrompt(`🎯 [Razón: ${(rec.reason || '').toUpperCase()}]\n${rec.title}\n💡 ${rec.description}${rec.suggestedBpm ? `\n🎵 BPM: ${rec.suggestedBpm}` : ''}`);
      } else {
        setRandomPrompt("¡Mantén tu práctica constante en Waack On!");
      }
      setIsGenerating(false);
    }, 400);
  };

  // Live chat messages feed simulation
  useEffect(() => {
    const defaultMessages = [
      "Pedro: ¡Esa transición a la pose fue brutal!",
      "Elena: Me encantó la mecánica de codos Brando",
      "Lucía: La sincronización con la música está clavada",
      "Carlos: La explicación del torso torque aclaró todas mis dudas",
      "Sara: Esperando el próximo ejercicio a 128 BPM",
    ];
    setLiveChat(defaultMessages);

    const incomingFeed = [
      "Andrés: Los ejercicios de 128 BPM están muy intensos",
      "Marilyn: ¿Cuándo es la próxima clase de poses de los 70s?",
      "David: La guía somática me ayudó a corregir la postura",
      "Sofia: Saludos desde la academia en México 🇲🇽",
      "Valeria: ¡Ese acento rítmico estuvo impecable!"
    ];
    let feedIndex = 0;

    const interval = setInterval(() => {
      const nextMsg = incomingFeed[feedIndex % incomingFeed.length];
      feedIndex++;
      setLiveChat((prev) => [...prev.slice(-8), nextMsg]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const handleSendLiveMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLiveMessage.trim()) return;
    setLiveChat((prev) => [...prev, `${currentUser.name}: ${newLiveMessage}`]);
    setNewLiveMessage('');
  };

  const t = translations[language] || translations['es'];

  return (
    <div className="flex-1 min-h-full w-full space-y-6 text-[#EDEFF4]">
      {/* CENTRO DE ANUNCIOS & LIVES DE INSTRUCTORES */}
      <div className="bg-[#121212] border border-[#262626] rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden space-y-5">
        {/* Glow ambient background effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D9A9FF]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#C23E9E]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Live notification toast popup */}
        <AnimatePresence>
          {liveToastNotice && (
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              className="p-3.5 bg-gradient-to-r from-amber-50 via-rose-50 to-rose-50 dark:from-[#1c1a12] dark:via-[#241a15] dark:to-[#1c1214] border border-[#E9C349]/60 text-slate-900 dark:text-white text-xs font-mono font-bold rounded-2xl flex items-center justify-between gap-3 shadow-2xl relative z-30"
            >
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 bg-[#D9A9FF] text-black rounded-lg">
                  <Bell className="w-3.5 h-3.5 fill-black" />
                </span>
                <span className="text-[#EDEFF4]">{liveToastNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setLiveToastNotice(null)}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hub Header & Live Hub Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4 relative z-10">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 bg-[#C23E9E]/25 text-[#D9A9FF] border border-[#C23E9E]/60 rounded-full text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>CENTRO DE ANUNCIOS & LIVES</span>
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Signal className="w-3 h-3 text-emerald-400" />
                <span>1 Transmisión Activa • 3 Masterclasses Agendadas</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase font-sans flex items-center gap-2">
              <span>Transmisiones en Vivo de los Instructores</span>
              <Sparkles className="w-5 h-5 text-[#D9A9FF]" />
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Conéctate en tiempo real a las cátedras en directo, recibe correcciones técnicas de postura y rolls, y entrena con el staff docente internacional de Waack On.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {currentUser.role === 'instructor' ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => setShowAnnModal(true)}
                  className="px-3.5 py-2 bg-[#1c1a12] hover:bg-amber-100 dark:hover:bg-[#282415] text-[#E9C349] border border-[#E9C349]/40 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 shadow cursor-pointer uppercase"
                >
                  <Megaphone className="w-3.5 h-3.5 text-[#D9A9FF]" />
                  <span>Publicar Anuncio de Live</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => setActiveTab('live')}
                  className="px-4 py-2 bg-gradient-to-r from-[#C23E9E] to-[#bd2c44] hover:from-[#b12b40] hover:to-[#d6324d] text-white text-xs font-mono font-black rounded-xl border border-white/20 transition-all flex items-center gap-2 shadow-lg cursor-pointer uppercase tracking-wider"
                >
                  <Radio className="w-4 h-4 text-white animate-pulse" />
                  <span>Iniciar Mi Transmisión</span>
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => setActiveTab('calendario')}
                  className="px-3.5 py-2 bg-[#181818] hover:bg-slate-200 dark:hover:bg-[#222222] text-slate-300 hover:text-slate-900 dark:hover:text-white border border-white/10 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#D9A9FF]" />
                  <span>Ver Calendario</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => setActiveTab('live')}
                  className="px-4 py-2 bg-gradient-to-r from-[#D9A9FF] to-[#dfb430] hover:from-[#f5cf53] hover:to-[#e8bd3a] text-black text-xs font-mono font-black rounded-xl border border-[#D9A9FF] transition-all flex items-center gap-2 shadow-lg cursor-pointer uppercase tracking-wider"
                >
                  <Radio className="w-4 h-4 text-black animate-pulse" />
                  <span>Entrar al Live Room</span>
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* Live Broadcast Main Spotlight & Side Roster Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch relative z-10">
          
          {/* LEFT: Featured Live Stream Stage / Interactive Video Player (8 cols) */}
          <div className="lg:col-span-8 flex flex-col justify-between bg-[#0A0A0A] border border-[#262626] rounded-2xl overflow-hidden shadow-2xl relative group min-h-[380px] md:min-h-[420px]">
            
            {/* Background Stream Video Element */}
            <div className="relative w-full h-56 sm:h-64 md:h-72 bg-black overflow-hidden">
              <video
                ref={heroVideoRef}
                key={activeSelectedLive.id}
                src={activeSelectedLive.videoUrl || currentHeroVideoSrc}
                autoPlay
                muted={heroVideoMuted}
                loop
                playsInline
                onError={handleHeroVideoError}
                className="w-full h-full object-cover opacity-85 group-hover:opacity-95 transition-opacity duration-700"
              />

              {/* Gradient overlays for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/40 to-black/70 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/60 pointer-events-none" />

              {/* Top Stream Status Header */}
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 z-20">
                <div className="flex flex-wrap items-center gap-2">
                  {activeSelectedLive.status === 'live' ? (
                    <span className="px-3 py-1 bg-red-600/90 text-white font-mono text-[10px] font-black rounded-full border border-red-400 flex items-center gap-1.5 shadow-lg uppercase tracking-wider animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      <span>🔴 EN DIRECTO AHORA</span>
                    </span>
                  ) : activeSelectedLive.status === 'today' ? (
                    <span className="px-3 py-1 bg-amber-500/90 text-black font-mono text-[10px] font-black rounded-full border border-amber-300 flex items-center gap-1.5 shadow-lg uppercase tracking-wider">
                      <Clock className="w-3 h-3" />
                      <span>⏰ {activeSelectedLive.tag}</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-blue-600/90 text-white font-mono text-[10px] font-black rounded-full border border-blue-400 flex items-center gap-1.5 shadow-lg uppercase tracking-wider">
                      <Calendar className="w-3 h-3" />
                      <span>📅 {activeSelectedLive.tag}</span>
                    </span>
                  )}

                  <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-[#D9A9FF] font-mono text-[10px] font-bold rounded-full border border-white/10 flex items-center gap-1">
                    <Eye className="w-3 h-3 text-[#D9A9FF]" />
                    <span>{activeSelectedLive.viewers || 84} bailarines</span>
                  </span>

                  <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-slate-300 font-mono text-[10px] rounded-full border border-white/10 hidden sm:flex items-center gap-1">
                    <Radio className="w-3 h-3 text-[#C23E9E]" />
                    <span>{activeSelectedLive.roomName}</span>
                  </span>
                </div>

                {/* Video controls (Play/Pause & Mute) */}
                <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/15 shadow-md">
                  <button
                    type="button"
                    onClick={toggleHeroVideoPlay}
                    title={heroVideoPlaying ? "Pausar stream preview" : "Reproducir stream"}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                  >
                    {heroVideoPlaying ? <Pause className="w-3.5 h-3.5 text-[#D9A9FF]" /> : <Play className="w-3.5 h-3.5 text-white fill-white" />}
                  </button>

                  <button
                    type="button"
                    onClick={toggleHeroVideoMute}
                    title={heroVideoMuted ? "Activar audio" : "Silenciar audio"}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                  >
                    {heroVideoMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#D9A9FF]" />}
                  </button>
                </div>
              </div>

              {/* Bottom Stream Badges */}
              <div className="absolute bottom-3 left-3.5 right-3.5 flex flex-wrap items-center justify-between gap-2 z-20">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#D9A9FF]/20 text-[#D9A9FF] border border-[#D9A9FF]/40 rounded-lg text-[10px] font-mono font-bold">
                    🎵 {activeSelectedLive.bpm} BPM
                  </span>
                  <span className="px-2 py-0.5 bg-white/10 text-white border border-white/15 rounded-lg text-[10px] font-mono font-bold">
                    🎯 {activeSelectedLive.level}
                  </span>
                  <span className="px-2 py-0.5 bg-[#C23E9E]/30 text-[#EDEFF4] border border-[#C23E9E]/50 rounded-lg text-[10px] font-mono font-bold hidden sm:inline-block">
                    💎 {activeSelectedLive.category}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-black/70 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  {activeSelectedLive.scheduledTime}
                </span>
              </div>
            </div>

            {/* Bottom Details Section of Featured Live */}
            <div className="p-4 sm:p-5 space-y-4 bg-white dark:bg-[#0e0e10] border-t border-slate-200 dark:border-white/10 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={activeSelectedLive.avatar}
                        alt={activeSelectedLive.instructor}
                        className="w-11 h-11 rounded-2xl object-cover border-2 border-[#D9A9FF] shadow-md"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute -bottom-1 -right-1 text-xs">
                        {activeSelectedLive.countryFlag}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
                          {activeSelectedLive.instructor}
                        </h4>
                        <span className="text-[9px] font-mono text-[#D9A9FF] bg-[#D9A9FF]/10 border border-[#D9A9FF]/30 px-1.5 py-0.2 rounded font-bold uppercase shrink-0">
                          DOCENTE OFICIAL
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8A8A8A] font-mono">
                        {activeSelectedLive.role} • {activeSelectedLive.country}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleLiveReminder(activeSelectedLive.id, activeSelectedLive.instructor, activeSelectedLive.scheduledTime)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                        liveReminders[activeSelectedLive.id]
                          ? 'bg-[#E9C349] text-black border-[#E9C349] shadow-md'
                          : 'bg-[#181818] text-[#8A8A8A] hover:text-slate-900 dark:hover:text-white border-white/10 hover:border-white/20'
                      }`}
                      title="Activar o desactivar recordatorio"
                    >
                      <Bell className={`w-3.5 h-3.5 ${liveReminders[activeSelectedLive.id] ? 'fill-black' : ''}`} />
                      <span className="hidden sm:inline">
                        {liveReminders[activeSelectedLive.id] ? 'Recordatorio Activo' : 'Añadir Recordatorio'}
                      </span>
                    </button>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {activeSelectedLive.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {activeSelectedLive.description}
                </p>

                {/* Key topics pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Temas:</span>
                  {activeSelectedLive.topics.map((tpc, i) => (
                    <span key={i} className="text-[10px] font-mono text-[#EDEFF4] bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                      • {tpc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Main Action Bar for Selected Live */}
              <div className="pt-3 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 w-full sm:w-auto">
                  <ShieldCheck className="w-4 h-4 text-[#D9A9FF] shrink-0" />
                  <span>Acceso incluido en tu plan o membresía de cátedra</span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab('live')}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-[#D9A9FF] to-[#dfb430] hover:from-[#f5cf53] hover:to-[#e8bd3a] text-black font-mono text-xs font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer hover:scale-105"
                  >
                    <Radio className="w-4 h-4 text-black animate-pulse" />
                    <span>
                      {activeSelectedLive.status === 'live' ? '🔴 Entrar a la Transmisión' : 'Acceder al Live Room'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT: List / Roster of Instructor Lives & Announcements (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between bg-white dark:bg-[#0e0e10] border border-[#262626] rounded-2xl p-4 space-y-3.5 shadow-xl">
            
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#E9C349]" />
                  <h3 className="text-xs font-mono font-bold tracking-wider text-slate-900 dark:text-white uppercase">
                    Cartelera de Lives ({INSTRUCTOR_LIVES.length})
                  </h3>
                </div>
                <span className="text-[9px] font-mono font-bold text-[#D9A9FF] bg-[#D9A9FF]/10 px-2 py-0.5 rounded-full border border-[#D9A9FF]/20">
                  Esta Semana
                </span>
              </div>

              {/* Filter Tabs for Roster */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'live', label: '🔴 En Vivo' },
                  { id: 'today', label: '⏰ Hoy' },
                  { id: 'upcoming', label: '📅 Próximos' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setLiveFilterTab(tab.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all shrink-0 border ${
                      liveFilterTab === tab.id
                        ? 'bg-[#E9C349] text-black border-[#E9C349] shadow-sm'
                        : 'bg-[#141414] text-[#8A8A8A] hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Live Cards List */}
              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                {INSTRUCTOR_LIVES.filter(live => {
                  if (liveFilterTab === 'all') return true;
                  return live.status === liveFilterTab;
                }).map((item) => {
                  const isSelected = selectedLiveId === item.id;
                  return (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedLiveId(item.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'bg-[#1c1a12] border-[#E9C349] shadow-[0_0_15px_rgba(233,195,73,0.15)]'
                          : 'bg-[#141414] border-slate-200 dark:border-white/5 hover:border-white/20 hover:bg-[#181818]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative shrink-0">
                            <img
                              src={item.avatar}
                              alt={item.instructor}
                              className={`w-9 h-9 rounded-xl object-cover border ${
                                isSelected ? 'border-[#D9A9FF]' : 'border-white/20'
                              }`}
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute -bottom-1 -right-1 text-[10px]">
                              {item.countryFlag}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <h5 className={`text-xs font-bold truncate leading-tight ${isSelected ? 'text-[#E9C349]' : 'text-slate-900 dark:text-white'}`}>
                              {item.instructor}
                            </h5>
                            <span className="text-[9px] font-mono text-slate-400 block truncate">
                              {item.category} • {item.bpm} BPM
                            </span>
                          </div>
                        </div>

                        <span className={`text-[8px] font-mono font-black px-2 py-0.5 rounded-full border uppercase shrink-0 ${
                          item.status === 'live'
                            ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                            : item.status === 'today'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                        }`}>
                          {item.tag}
                        </span>
                      </div>

                      <p className="text-[11px] font-medium text-slate-300 line-clamp-2 leading-tight">
                        {item.title}
                      </p>

                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-slate-200 dark:border-white/5">
                        <span className="flex items-center gap-1 text-[#E9C349]">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{item.scheduledTime}</span>
                        </span>

                        <span className={`font-bold ${isSelected ? 'text-[#D9A9FF]' : 'text-slate-500'}`}>
                          {isSelected ? '▶ En Pantalla' : 'Ver Detalle'}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Quick Live Anuncio Ticker Banner */}
            <div className="p-2.5 bg-[#141414] border border-white/10 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-[#D9A9FF] uppercase">
                <Megaphone className="w-3 h-3 text-[#D9A9FF]" />
                <span>Aviso de Transmisión Oficial</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-tight">
                Las salas en vivo se abren 10 minutos antes para calentamiento y prueba de audio.
              </p>
            </div>

          </div>

        </div>

        {/* Ticker Bottom Strip de Anuncios de Instructores */}
        <div className="p-2.5 bg-[#0A0A0A] border border-slate-200 dark:border-white/5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="px-2 py-0.5 bg-[#D9A9FF] text-black font-bold text-[9px] rounded uppercase shrink-0">
              NOVEDADES
            </span>
            <span className="truncate text-slate-300 text-[11px]">
              📢 <strong className="text-slate-900 dark:text-white">Brando Hermoso:</strong> Abierta inscripción para corrección individual en el Live del viernes • 📢 <strong className="text-slate-900 dark:text-white">Kumari:</strong> Nuevo repertorio de música disco para la sesión de hoy.
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('comunidad')}
              className="text-[#D9A9FF] hover:underline font-bold text-[10px] flex items-center gap-1"
            >
              <span>Ver Foro & Comunidad</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

      {/* Switcher de Modo de Vista: Panel de Bienvenida vs Dashboard de Entrenamiento */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#121212] border border-[#262626] p-2.5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 px-2">
          <span className="w-2 h-2 rounded-full bg-[#E9C349] animate-pulse" />
          <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">VISTA PRINCIPAL:</span>
          {showWelcomeDashboard && (
            <span className="text-[10px] font-mono bg-[#D9A9FF]/10 text-[#D9A9FF] border border-[#D9A9FF]/30 px-2 py-0.5 rounded font-bold">
              ✨ Modo Exploración
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 bg-[#0A0A0A] p-1 rounded-xl border border-[#262626]">
          <button
            type="button"
            onClick={() => handleToggleWelcomeMode(true)}
            className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              showWelcomeDashboard
                ? 'bg-[#E9C349] text-black shadow-md'
                : 'text-[#8A8A8A] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>🌟 Panel de Bienvenida</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleWelcomeMode(false)}
            className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              !showWelcomeDashboard
                ? 'bg-[#9A2B3C] text-white shadow-md'
                : 'text-[#8A8A8A] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>📊 Dashboard de Entrenamiento</span>
          </button>
        </div>
      </div>

      {/* RENDER CONDICIONAL: WELCOME DASHBOARD (NUEVOS USUARIOS) VS DASHBOARD DE PRÁCTICA */}
      {showWelcomeDashboard ? (
        <WelcomeDashboard
          currentUser={currentUser}
          setActiveTab={setActiveTab}
          onOpenPlansModal={onOpenPlansModal}
          onSubscribeInstructor={(name, price) => {
            setSelectedInstructorForPlan({
              name,
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
              monthlyPrice: price,
              level: 'Master',
              bio: `Cátedra oficial de ${name}`,
              specialties: ['Waacking Technique', 'Biomechanics']
            });
          }}
          onSwitchToPracticeDashboard={() => handleToggleWelcomeMode(false)}
          language={language}
          onUserChange={onUserChange}
        />
      ) : (
        <>
      {/* SECCIÓN GAMIFICACIÓN: PUNTOS, NIVEL Y ANIMACIÓN CONFETI / BRILLO */}
      <motion.div
        animate={isPointsGlowing ? {
          scale: [1, 1.025, 1.01, 1],
          borderColor: ['#262626', '#D9A9FF', '#C23E9E', '#262626'],
          boxShadow: [
            '0 0 0px rgba(217, 169, 255, 0)',
            '0 0 30px rgba(217, 169, 255, 0.65)',
            '0 0 45px rgba(194, 62, 158, 0.75)',
            '0 0 0px rgba(217, 169, 255, 0)'
          ]
        } : {}}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="bg-[#121212] border border-[#262626] rounded-2xl p-5 md:p-6 relative overflow-visible shadow-2xl transition-all"
      >
        {/* Confetti Explosion Canvas using motion/react */}
        <AnimatePresence>
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none z-50 overflow-visible flex items-center justify-center">
              {confettiParticles.map((particle, idx) => (
                <motion.div
                  key={`confetti-${particle.id}-${idx}`}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
                  animate={{
                    x: particle.targetX,
                    y: particle.targetY,
                    scale: [0, 1.4, 0.8, 0],
                    opacity: [1, 1, 0.9, 0],
                    rotate: particle.rotation,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: particle.duration,
                    ease: [0.15, 0.85, 0.35, 1],
                  }}
                  style={{
                    position: 'absolute',
                    width: particle.size,
                    height: particle.size,
                    backgroundColor: particle.color,
                    borderRadius: particle.shape === 'circle' ? '50%' : '2px',
                    boxShadow: `0 0 10px ${particle.color}`,
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Floating text popup for bonus points & level completion */}
        <AnimatePresence>
          {floatingBonusText && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: -45, scale: 1.15 }}
              exit={{ opacity: 0, y: -70, scale: 0.9 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              className="absolute -top-6 left-1/2 -translate-x-1/2 px-5 py-2 bg-gradient-to-r from-[#D9A9FF] via-[#f59e0b] to-[#C23E9E] text-black font-mono font-black text-xs md:text-sm rounded-full shadow-[0_0_35px_rgba(217, 169, 255,0.85)] border-2 border-white flex items-center gap-2 z-50 uppercase tracking-wider whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-black animate-spin" />
              <span>{floatingBonusText}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          {/* User Points & Avatar Info */}
          <div className="flex items-center gap-4">
            <motion.div 
              animate={isPointsGlowing ? { rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.25, 1] } : {}}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <img 
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'} 
                alt={currentUser.name} 
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#D9A9FF] shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#C23E9E] text-[#D9A9FF] rounded-full border border-[#D9A9FF] flex items-center justify-center text-[10px] font-black shadow">
                ⚡
              </span>
            </motion.div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#D9A9FF] bg-[#D9A9FF]/10 border border-[#D9A9FF]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-[#D9A9FF]" /> MI ESTADO ACADÉMICO
                </span>
                {isPointsGlowing && (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[10px] font-mono font-black text-white bg-[#C23E9E] px-2 py-0.5 rounded-full animate-bounce"
                  >
                    ¡PUNTOS ACTUALIZADOS!
                  </motion.span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {currentUser.name}
              </h3>
              <p className="text-xs text-[#8A8A8A]">
                Nivel actual: <span className="text-[#EDEFF4] font-semibold">{currentUser.level || 'Estudiante Cátedra Waack On'}</span>
              </p>
            </div>
          </div>

          {/* Points Counter & Level Metrics - Dynamic by Role */}
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {currentUser.role === 'instructor' ? (
              <>
                {/* Instructor Stats 1: Total Students */}
                <div className="px-4 py-3 bg-[#1c1a12] border border-[#D9A9FF]/50 rounded-2xl min-w-[140px] shadow-lg">
                  <span className="text-[10px] font-mono font-bold text-[#D9A9FF] uppercase block tracking-wider">
                    Alumnos Cátedra
                  </span>
                  <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                    154 <span className="text-xs font-bold text-[#E9C349]">alumnos</span>
                  </span>
                </div>

                {/* Instructor Stats 2: Feedback Pending */}
                <div className="px-4 py-3 bg-[#0A0A0A] border border-[#262626] rounded-2xl min-w-[140px]">
                  <span className="text-[10px] font-mono font-bold text-[#8A8A8A] uppercase block tracking-wider">
                    Revisiones Pendientes
                  </span>
                  <span className="text-xl font-bold font-mono text-amber-400">
                    2 <span className="text-xs font-medium text-amber-300 font-sans">videos</span>
                  </span>
                </div>

                {/* Instructor Stats 3: Monthly Fee */}
                <div className="px-4 py-3 bg-[#0A0A0A] border border-[#262626] rounded-2xl min-w-[140px]">
                  <span className="text-[10px] font-mono font-bold text-[#8A8A8A] uppercase block tracking-wider">
                    Tarifa Cátedra
                  </span>
                  <span className="text-xl font-bold font-mono text-[#D9A9FF]">
                    {currentUser.monthlyPrice || '$35 USD/mes'}
                  </span>
                </div>

                {/* Instructor Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAnnModal(true)}
                    className="px-3.5 py-2.5 bg-[#D9A9FF] hover:bg-[#B87CFF] text-black font-mono text-[11px] font-black rounded-xl border border-[#D9A9FF] transition-all flex items-center justify-center gap-1.5 shadow cursor-pointer uppercase"
                  >
                    <Megaphone className="w-3.5 h-3.5 fill-black" />
                    <span>Publicar Anuncio</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('instructor')}
                    className="px-3.5 py-2.5 bg-[#C23E9E] hover:bg-[#8F2C7A] text-white font-mono text-[11px] font-bold rounded-xl border border-[#C23E9E] transition-all flex items-center justify-center gap-1.5 shadow cursor-pointer uppercase"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#D9A9FF]" />
                    <span>Panel Instructor</span>
                  </motion.button>
                </div>
              </>
            ) : (currentUser.role === 'studio' || currentUser.role === 'academy') ? (
              <>
                {/* Studio Stats 1: Instructors in Staff */}
                <div className="px-4 py-3 bg-[#1c1a12] border border-[#D9A9FF]/50 rounded-2xl min-w-[140px] shadow-lg">
                  <span className="text-[10px] font-mono font-bold text-[#D9A9FF] uppercase block tracking-wider">
                    Staff Instructores
                  </span>
                  <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                    12 <span className="text-xs font-bold text-[#E9C349]">docentes</span>
                  </span>
                </div>

                {/* Studio Stats 2: Total Enrolled Students */}
                <div className="px-4 py-3 bg-[#0A0A0A] border border-[#262626] rounded-2xl min-w-[140px]">
                  <span className="text-[10px] font-mono font-bold text-[#8A8A8A] uppercase block tracking-wider">
                    Matrícula Total
                  </span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    1,850 <span className="text-xs font-medium text-emerald-300 font-sans">alumnos</span>
                  </span>
                </div>

                {/* Studio Stats 3: Monthly Subscriptions */}
                <div className="px-4 py-3 bg-[#0A0A0A] border border-[#262626] rounded-2xl min-w-[140px]">
                  <span className="text-[10px] font-mono font-bold text-[#8A8A8A] uppercase block tracking-wider">
                    Ingresos Mensuales
                  </span>
                  <span className="text-xl font-bold font-mono text-[#D9A9FF]">
                    $4,250 USD
                  </span>
                </div>

                {/* Studio Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('studio')}
                    className="px-3.5 py-2.5 bg-[#D9A9FF] hover:bg-[#B87CFF] text-black font-mono text-[11px] font-black rounded-xl border border-[#D9A9FF] transition-all flex items-center justify-center gap-1.5 shadow cursor-pointer uppercase"
                  >
                    <Sliders className="w-3.5 h-3.5 text-black" />
                    <span>Gestión Studio</span>
                  </motion.button>
                </div>
              </>
            ) : (
              <>
                {/* Points Badge with Glow Highlight */}
                <motion.div
                  animate={isPointsGlowing ? {
                    scale: [1, 1.15, 1],
                    backgroundColor: ['#1c1a12', '#3d2e08', '#1c1a12'],
                    borderColor: ['#D9A9FF', '#ffffff', '#D9A9FF']
                  } : {}}
                  transition={{ duration: 0.6 }}
                  className="px-5 py-3 bg-[#1c1a12] border-2 border-[#D9A9FF] rounded-2xl flex items-center gap-3 relative overflow-hidden shadow-xl"
                >
                  <div className="p-2 bg-[#D9A9FF] text-black rounded-xl font-bold">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#D9A9FF] uppercase block tracking-wider">
                      Puntos Totales
                    </span>
                    <span className="text-2xl font-black font-mono text-[#E9C349]">
                      {currentUser.points || 0} <span className="text-xs font-bold text-slate-900 dark:text-white">PTS</span>
                    </span>
                  </div>
                </motion.div>

                {/* Level 1 Progress Badge */}
                <div className="px-4 py-3 bg-[#0A0A0A] border border-[#262626] rounded-2xl min-w-[140px]">
                  <div className="flex justify-between items-center text-[10px] font-mono text-[#8A8A8A] mb-1">
                    <span>NIVEL 1</span>
                    <span className="text-[#D9A9FF] font-bold">{l1Percent}%</span>
                  </div>
                  <div className="w-full bg-[#1c1b1b] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#D9A9FF] h-full transition-all duration-500" style={{ width: `${l1Percent}%` }} />
                  </div>
                  <span className="text-[9px] font-mono text-[#8A8A8A] mt-1 block">
                    {l1CompletedCount}/{level1Lessons.length} Clases
                  </span>
                </div>

                {/* Level 2 Progress Badge */}
                <div className="px-4 py-3 bg-[#0A0A0A] border border-[#262626] rounded-2xl min-w-[140px]">
                  <div className="flex justify-between items-center text-[10px] font-mono text-[#8A8A8A] mb-1">
                    <span>NIVEL 2</span>
                    <span className="text-[#C23E9E] font-bold">{l2Percent}%</span>
                  </div>
                  <div className="w-full bg-[#1c1b1b] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#C23E9E] h-full transition-all duration-500" style={{ width: `${l2Percent}%` }} />
                  </div>
                  <span className="text-[9px] font-mono text-[#8A8A8A] mt-1 block">
                    {l2CompletedCount}/{level2Lessons.length} Clases
                  </span>
                </div>

                {/* Interactive Test Trigger Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSimulatePointsGain(50)}
                    className="px-3 py-2 bg-[#D9A9FF] hover:bg-[#B87CFF] text-black font-mono text-[11px] font-black rounded-xl border border-[#D9A9FF] transition-all flex items-center justify-center gap-1.5 shadow cursor-pointer"
                    title="Gana +50 Puntos y dispara la animación de confeti"
                  >
                    <Zap className="w-3.5 h-3.5 fill-black" />
                    <span>+50 Puntos</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSimulateLevelCompletion}
                    className="px-3 py-2 bg-[#C23E9E] hover:bg-[#8F2C7A] text-white font-mono text-[11px] font-bold rounded-xl border border-[#C23E9E] transition-all flex items-center justify-center gap-1.5 shadow cursor-pointer"
                    title="Simula completar un nivel con confeti"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#D9A9FF]" />
                    <span>Completar Nivel</span>
                  </motion.button>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* COMPONENTE BARRA DE PROGRESO DE EVOLUCIÓN DE NIVEL DEL ESTUDIANTE */}
      <StudentLevelProgressBar
        currentUser={currentUser}
        lessons={lessons}
        onNavigateToLessons={() => setActiveTab('clases')}
        language={language === 'en' ? 'en' : 'es'}
      />

      {instructorTaskRec && (
        <div className="bg-gradient-to-r from-rose-50 via-white to-white dark:from-[#9A2B3C]/30 dark:via-[#121212] dark:to-[#121212] border-2 border-[#E9C349] rounded-2xl p-6 relative overflow-hidden shadow-2xl animate-pulse">
          <div className="absolute right-0 top-0 w-64 h-64 bg-[#E9C349]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-black text-black bg-[#D9A9FF] px-3 py-1 rounded-full uppercase tracking-wider">
                🎯 Tarea Asignada por el Instructor
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {instructorTaskRec.title}
              </h3>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                {instructorTaskRec.description}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab('tasks')}
              className="px-6 py-3 bg-[#D9A9FF] hover:bg-[#B87CFF] text-black text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-2 uppercase tracking-wider shrink-0 hover:scale-105 cursor-pointer"
            >
              <span>Ver Tareas y Completar</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </motion.button>
          </div>
        </div>
      )}

      {recommendations && recommendations.length > 0 && (
        <div className="mb-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-mono font-bold tracking-wider text-slate-900 dark:text-white uppercase flex items-center gap-2">
                <span>🎯 Recomendaciones Inteligentes (Motor Determinista)</span>
              </h3>
              <p className="text-xs text-[#8A8A8A]">Sugerencias basadas en tu historial real de práctica, gaps de categoría y progresión de BPM.</p>
            </div>
            <span className="text-xs font-mono text-[#D9A9FF] bg-[#D9A9FF]/10 px-3 py-1 rounded-full border border-[#D9A9FF]/30">
              {recommendations.length} Activas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.slice(0, 3).map((item: RecommendationItem, idx: number) => {
              const reasonLabels: Record<string, { label: string; color: string }> = {
                gap_categoria: { label: 'Gap de Categoría', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
                progresion_bpm: { label: 'Progresión BPM', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
                area_debil: { label: 'Área a Reforzar', color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
                racha_en_riesgo: { label: 'Retomar Práctica', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
                nivel_desbloqueado: { label: 'Nivel Desbloqueado', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
                tarea_instructor: { label: 'Tarea Instructor', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
              };
              const badgeInfo = reasonLabels[item.reason] || { label: item.reason, color: 'text-slate-300 bg-slate-800 border-slate-700' };

              return (
                <motion.div 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  key={`rec-${item.id || idx}-${idx}`}
                  onClick={() => setActiveTab(item.ctaTab)}
                  className={`p-5 bg-[#121212] rounded-2xl flex flex-col justify-between transition-all group cursor-pointer shadow-xl relative overflow-hidden ${
                    item.type === 'instructor_task'
                      ? 'border-2 border-[#E9C349] bg-gradient-to-br from-amber-50 to-white dark:from-[#1c1a12] dark:to-[#121212]'
                      : 'border border-[#262626] hover:border-[#E9C349]/50'
                  }`}
                >
                  <div className="absolute right-0 top-0 w-32 h-32 bg-[#D9A9FF]/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase flex items-center gap-1 ${badgeInfo.color}`}>
                        {item.type === 'instructor_task' && <span>⭐</span>}
                        {badgeInfo.label}
                      </span>
                      {item.suggestedBpm && (
                        <span className="text-[10px] font-mono text-[#D9A9FF] font-bold">
                          🎵 {item.suggestedBpm} BPM
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#E9C349] transition-colors leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs font-mono text-[#E9C349] group-hover:translate-x-1 transition-transform">
                    <span>{item.type === 'instructor_task' ? 'Resolver Tarea' : 'Acceder ahora'}</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECCIÓN PRINCIPAL: HERRAMIENTAS ESENCIALES DE ENTRENAMIENTO DIARIO */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Bento Zone (ZONA INTERACTIVA & ENTRENAMIENTO) -> 8 cols */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Section A: ZONA INTERACTIVA */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pl-1">
              <span className="text-[#D9A9FF] text-lg">⚡</span>
              <h3 className="text-xs font-mono font-bold tracking-widest text-[#D9A9FF] uppercase">ZONA INTERACTIVA</h3>
            </div>
            
            {/* 3-Column Bento Grid matching layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card 1: LABORATORIO DE FREESTYLE */}
              <div className="bg-[#121212] border border-[#262626] rounded-2xl p-5 flex flex-col justify-between h-auto md:h-[310px] min-h-[310px] relative overflow-hidden shadow-lg group hover:border-[#D9A9FF]/30 transition-all">
                <div className="absolute right-[-10px] top-[-10px] w-20 h-20 bg-[#D9A9FF]/5 rounded-full blur-xl pointer-events-none" />
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">🔮</span>
                    <h4 className="text-xs font-mono font-bold tracking-tight text-[#EDEFF4] uppercase">LAB DE FREESTYLE</h4>
                  </div>
                  <p className="text-[10px] text-[#8A8A8A] font-semibold leading-relaxed">
                    Genera un reto aleatorio de rolls, velocidad u expresión corporal con tempo (BPM) recomendado para entrenar al instante.
                  </p>
                  
                  {/* Generated box with gold glow */}
                  <div className="mt-3 p-3 bg-[#0A0A0A] rounded-xl border border-[#D9A9FF]/10 text-center flex items-center justify-center min-h-[110px]">
                    <p className="text-[11px] text-[#D9A9FF] font-bold font-mono whitespace-pre-line leading-relaxed uppercase">
                      {randomPrompt}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGeneratePrompt}
                  disabled={isGenerating}
                  className="w-full mt-3 py-2 bg-[#C23E9E] hover:bg-[#8F2C7A] text-white text-xs font-bold rounded-xl border border-transparent transition-all uppercase tracking-wider"
                >
                  {isGenerating ? 'Generando...' : 'GENERAR RETO'}
                </motion.button>
              </div>

              {/* Card 2: HERRAMIENTAS DE PRÁCTICA (Includes Virtual Mirror) */}
              <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 flex flex-col justify-between h-auto md:h-[310px] min-h-[310px] shadow-lg relative overflow-hidden hover:border-[#C23E9E]/20 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🛠️</span>
                      <h4 className="text-xs font-mono font-bold tracking-tight text-[#EDEFF4] uppercase">HERRAMIENTAS</h4>
                    </div>
                    <span className="text-[9px] font-mono text-[#D9A9FF] bg-[#D9A9FF]/10 px-2 py-0.5 rounded-lg border border-[#D9A9FF]/20 font-bold">
                      {activeTrack.bpm} BPM
                    </span>
                  </div>
                  
                  <p className="text-[10px] text-[#8A8A8A] font-semibold leading-relaxed mb-2">
                    Música clasificada y visor reflectivo para perfeccionar la alineación de tus codos.
                  </p>

                  {/* Virtual mirror visual module */}
                  <div className="space-y-2">
                    {isMirrorOn ? (
                      <div className="relative aspect-[4/3] w-full rounded-xl border border-[#262626] overflow-hidden bg-black shadow-inner">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          muted 
                          className="w-full h-full object-cover scale-x-[-1]" 
                        />
                        <div className="absolute top-1.5 left-1.5 text-[8px] bg-[#C23E9E] text-white font-mono font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          Espejo ON
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 bg-[#0A0A0A] border border-[#262626] rounded-xl text-center space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <div className="min-w-0 text-left">
                            <p className="text-[10px] font-bold text-[#D9A9FF] truncate uppercase">{activeTrack.title}</p>
                            <p className="text-[9px] text-[#8A8A8A] font-bold truncate">{activeTrack.artist}</p>
                          </div>
                          <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-7 h-7 rounded-full bg-[#D9A9FF] text-black flex items-center justify-center hover:scale-105 transition-transform"
                          >
                            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-black ml-0.5" />}
                          </button>
                        </div>
                        {/* Progress */}
                        <div className="w-full bg-[#1c1b1b] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#D9A9FF] h-full" style={{ width: `${audioProgress}%` }} />
                        </div>
                      </div>
                    )}

                    <button
                      onClick={toggleVirtualMirror}
                      className={`w-full py-1.5 border border-[#262626] rounded-xl text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 transition-all ${
                        isMirrorOn 
                          ? 'bg-[#9A2B3C]/20 border-[#9A2B3C] text-slate-900 dark:text-white shadow' 
                          : 'bg-[#1c1b1b] hover:bg-slate-100 dark:hover:bg-[#262626] text-[#EDEFF4] border-[#262626]'
                      }`}
                    >
                      {isMirrorOn ? <CameraOff className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
                      <span>{isMirrorOn ? 'Apagar Espejo' : 'Activar Espejo'}</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('entrenamiento')}
                  className="w-full py-1 text-center text-[9px] font-bold text-[#8A8A8A] border border-[#262626] bg-[#0A0A0A] rounded-lg hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Ver playlists completas &rarr;
                </button>
              </div>

              {/* Card 3: FEEDBACK Y RETOS */}
              <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 flex flex-col justify-between h-auto md:h-[310px] min-h-[310px] shadow-lg hover:border-[#D9A9FF]/15 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🏆</span>
                      <h4 className="text-xs font-mono font-bold tracking-tight text-[#EDEFF4] uppercase">FEEDBACK & RETOS</h4>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                      2 Pendientes
                    </span>
                  </div>
                  <p className="text-[10px] text-[#8A8A8A] font-semibold leading-relaxed mb-3">
                    Revisión biomecánica de videos subidos por alumnos de la academia.
                  </p>

                  {/* Student feedback status list */}
                  <div className="space-y-2">
                    {(feedbackItems || []).slice(0, 3).map((item, idx) => {
                      const isUnreviewed = !item.completed;
                      return (
                        <div key={item.id || `fb-${idx}`} className="p-2 bg-[#0A0A0A] border border-[#262626] rounded-xl flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <img src={item.studentAvatar} alt={item.studentName} className="w-7 h-7 rounded-full object-cover border border-[#262626] shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-[#EDEFF4] truncate">{item.studentName}</p>
                              <p className="text-[8px] text-[#8A8A8A] truncate font-mono">{item.videoTitle}</p>
                            </div>
                          </div>
                          <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0 uppercase ${
                            isUnreviewed 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' 
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {isUnreviewed ? 'NO REVISADA' : 'REVISADO'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-2">
                  <button
                    onClick={() => setActiveTab('entrenamiento')}
                    className="w-full py-1.5 bg-[#C23E9E] hover:bg-[#8F2C7A] text-white text-[10px] font-bold rounded-xl transition-all uppercase flex items-center justify-center gap-1.5 border border-[#D9A9FF]/30 shadow"
                  >
                    <Plus className="w-3 h-3 text-[#D9A9FF]" />
                    <span>SUBIR FEEDBACK PARA ALUMNOS</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('entrenamiento')}
                    className="w-full py-1.5 bg-[#1c1b1b] hover:bg-slate-100 dark:hover:bg-[#262626] text-[#E9C349] text-[10px] font-bold font-mono rounded-xl transition-all uppercase flex items-center justify-center gap-1.5 border border-[#E9C349]/20"
                  >
                    <Sparkles className="w-3 h-3 text-[#D9A9FF]" />
                    <span>LAB DE FREESTYLE</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* PANEL DE SUGERENCIAS DE ACONDICIONAMIENTO Y FISIOLOGÍA MUSCULAR */}
          <WeeklyMuscleRecommendationPanel
            practiceLogs={practiceLogs || []}
            currentUser={currentUser}
            onLogPractice={onLogPractice}
            setActiveTab={setActiveTab}
            onUserChange={onUserChange}
            language={language}
          />

          {/* Section: GRÁFICO DE PROGRESO SEMANAL */}
          <div className="bg-[#121212] border border-[#262626] rounded-2xl p-5 shadow-lg text-[#EDEFF4] space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#262626] pb-3">
              <div>
                <span className="text-[9px] font-mono font-bold text-[#D9A9FF] bg-[#D9A9FF]/10 border border-[#D9A9FF]/30 px-2 py-0.5 rounded uppercase">
                  ESTADÍSTICAS DE BIOMECÁNICA
                </span>
                <h3 className="text-base font-display-lg italic text-[#EDEFF4] uppercase mt-2">
                  📈 Gráfico de Progreso Semanal
                </h3>
                <p className="text-xs text-[#8A8A8A] font-semibold">
                  Visualiza tu tiempo acumulado de entrenamiento y cumple tu objetivo de Waacking.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownloadWeeklyLogsJSON}
                  className="px-3.5 py-2.5 bg-[#D9A9FF] hover:bg-[#B87CFF] text-black text-xs font-black rounded-xl border border-[#D9A9FF] transition-all uppercase flex items-center gap-1.5 cursor-pointer shadow-md"
                  title="Descargar historial semanal de práctica en formato JSON"
                >
                  <Download className="w-4 h-4 fill-black" />
                  <span>Exportar JSON</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowJsonExportModal(!showJsonExportModal)}
                  className="px-3 py-2.5 bg-[#1c1b1b] hover:bg-slate-100 dark:hover:bg-[#262626] text-cyan-400 text-xs font-bold rounded-xl border border-cyan-500/30 transition-all uppercase flex items-center gap-1.5 cursor-pointer"
                  title="Vista previa del JSON de la semana"
                >
                  <FileJson className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline">Vista Previa</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowLogForm(!showLogForm)}
                  className="px-4 py-2.5 bg-[#1c1b1b] hover:bg-slate-100 dark:hover:bg-[#262626] text-[#EDEFF4] text-xs font-bold rounded-xl border border-[#262626] transition-all uppercase flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#D9A9FF]" />
                  <span>{showLogForm ? 'Cerrar Registro' : 'Registrar Sesión'}</span>
                </motion.button>
              </div>
            </div>

            {/* Download success toast notice */}
            <AnimatePresence>
              {downloadSuccessNotice && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl flex items-center justify-between gap-2 shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{downloadSuccessNotice}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded font-bold uppercase">
                    JSON Descargado
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Interactive JSON Export Preview Card */}
            <AnimatePresence>
              {showJsonExportModal && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-2 border-cyan-500/40 rounded-2xl bg-cyan-50 dark:bg-[#0B0F19] p-4 space-y-3 shadow-2xl relative"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        <FileJson className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <span>EXPORTAR HISTORIAL SEMANAL DE ENTRENAMIENTO (JSON)</span>
                          <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-bold">
                            Últimos 7 días
                          </span>
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          Formato estructurado ideal para respaldos externos, hojas de cálculo, Notion o seguimiento académico.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowJsonExportModal(false)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Summary metrics for export */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="bg-slate-100 dark:bg-[#121826] p-2.5 rounded-xl border border-slate-200 dark:border-white/5">
                      <span className="text-[9px] text-slate-400 block uppercase">Sesiones en la Semana:</span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {((practiceLogs || []).filter(l => {
                          const cutoff = new Date();
                          cutoff.setDate(cutoff.getDate() - 7);
                          return l.date >= cutoff.toISOString().split('T')[0];
                        })).length} sesiones
                      </span>
                    </div>
                    <div className="bg-slate-100 dark:bg-[#121826] p-2.5 rounded-xl border border-slate-200 dark:border-white/5">
                      <span className="text-[9px] text-slate-400 block uppercase">Total Horas/Minutos:</span>
                      <span className="font-bold text-cyan-400 text-sm">
                        {((practiceLogs || []).filter(l => {
                          const cutoff = new Date();
                          cutoff.setDate(cutoff.getDate() - 7);
                          return l.date >= cutoff.toISOString().split('T')[0];
                        })).reduce((a, l) => a + (l.minutes || 0), 0)} min
                      </span>
                    </div>
                    <div className="bg-slate-100 dark:bg-[#121826] p-2.5 rounded-xl border border-slate-200 dark:border-white/5">
                      <span className="text-[9px] text-slate-400 block uppercase">Alumno / Usuario:</span>
                      <span className="font-bold text-slate-900 dark:text-white text-xs truncate block">
                        {currentUser.name || 'Alumno'}
                      </span>
                    </div>
                    <div className="bg-slate-100 dark:bg-[#121826] p-2.5 rounded-xl border border-slate-200 dark:border-white/5">
                      <span className="text-[9px] text-slate-400 block uppercase">Formato de Salida:</span>
                      <span className="font-bold text-[#D9A9FF] text-xs block">.json (Standard)</span>
                    </div>
                  </div>

                  {/* Code preview block */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
                      <span>VISTA PREVIA DEL ESTRUCTURA JSON:</span>
                      {copiedJsonNotice && <span className="text-emerald-400 font-bold">✓ Copiado al portapapeles</span>}
                    </div>
                    <pre className="bg-slate-900 dark:bg-[#05070D] border border-white/10 rounded-xl p-3 text-[10px] font-mono text-cyan-300/90 overflow-x-auto max-h-48 leading-tight">
                      {getWeeklyLogsJSONString()}
                    </pre>
                  </div>

                  {/* Modal action buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 border-t border-white/10">
                    <p className="text-[10px] text-slate-400">
                      💡 Puedes importar este archivo JSON en aplicaciones externas de analítica o registro de horas.
                    </p>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleCopyWeeklyLogsJSON}
                        className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-100 dark:bg-[#121826] hover:bg-slate-200 dark:hover:bg-[#1a2336] text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{copiedJsonNotice ? '¡Copiado!' : 'Copiar JSON'}</span>
                      </button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => {
                          handleDownloadWeeklyLogsJSON();
                          setShowJsonExportModal(false);
                        }}
                        className="flex-1 sm:flex-none px-4 py-2 bg-[#D9A9FF] hover:bg-[#B87CFF] text-black text-xs font-black rounded-xl shadow-lg transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-4 h-4 fill-black" />
                        <span>Descargar JSON (.json)</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Manual practice registration form */}
            <AnimatePresence>
              {showLogForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border border-[#262626] rounded-2xl bg-[#0A0A0A] p-4 space-y-3"
                >
                  <h4 className="text-xs font-mono font-bold text-[#D9A9FF] uppercase">
                    📝 REGISTRAR SESIÓN DE ENTRENAMIENTO FUERA DE LÍNEA
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Minutes Input */}
                    <div>
                      <label className="text-[10px] font-mono font-bold text-[#8A8A8A] block mb-1">TIEMPO (MINUTOS):</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="180"
                        value={logMinutes} 
                        onChange={(e) => setLogMinutes(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full text-xs bg-[#121212] border border-[#262626] rounded-xl px-2.5 py-1.5 focus:outline-none text-[#EDEFF4]"
                      />
                    </div>

                    {/* Activity Type Dropdown */}
                    <div>
                      <label className="text-[10px] font-mono font-bold text-[#8A8A8A] block mb-1">ZONA / ACTIVIDAD:</label>
                      <select 
                        value={logType} 
                        onChange={(e) => setLogType(e.target.value as any)}
                        className="w-full text-xs font-bold bg-[#121212] border border-[#262626] rounded-xl px-2 py-1.5 focus:outline-none text-[#EDEFF4]"
                      >
                        <option value="drill">Metrónomo / Drills</option>
                        <option value="playlist">Playlists BPM</option>
                        <option value="battle">Arena de Batalla</option>
                        <option value="combo">Draft de Poses</option>
                        <option value="sensorial">Somatic / Sensorial</option>
                      </select>
                    </div>

                    {/* Description Text Input */}
                    <div>
                      <label className="text-[10px] font-mono font-bold text-[#8A8A8A] block mb-1">DETALLE DE PRÁCTICA:</label>
                      <input 
                        type="text" 
                        placeholder="Ej. Práctica libre de rolls"
                        value={logDesc} 
                        onChange={(e) => setLogDesc(e.target.value)}
                        className="w-full text-xs font-semibold bg-[#121212] border border-[#262626] rounded-xl px-2.5 py-1.5 focus:outline-none text-[#EDEFF4]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1.5">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => {
                        onLogPractice(logMinutes, logType, logDesc || `Práctica de ${logType}`);
                        setLogDesc('');
                        setShowLogForm(false);
                      }}
                      className="px-4 py-2 bg-[#C23E9E] text-white text-xs font-bold rounded-xl border border-transparent transition-all uppercase cursor-pointer"
                    >
                      Guardar Sesión
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bento statistics grid */}
            {/* Key Metrics Row */}
            {currentUser.role === 'instructor' ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-[#0A0A0A] border border-[#262626] rounded-xl text-center sm:text-left">
                  <span className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase block">Minutos Práctica Alumnos (Avg.)</span>
                  <span className="text-xl font-bold text-[#EDEFF4]">48.5 <span className="text-xs font-medium text-[#D9A9FF]">min/alumno</span></span>
                </div>
                <div className="p-3 bg-[#0A0A0A] border border-[#262626] rounded-xl text-center sm:text-left">
                  <span className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase block">Tasa de Feedback Completado</span>
                  <span className="text-xl font-bold text-[#D9A9FF]">92.4% <span className="text-xs font-medium text-emerald-400">✓ 385 rev.</span></span>
                </div>
                <div className="p-3 bg-[#0A0A0A] border border-[#262626] rounded-xl text-center sm:text-left">
                  <span className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase block">Sesiones Registradas</span>
                  <span className="text-xl font-bold text-[#EDEFF4]">1,420 <span className="text-xs font-medium text-slate-400">sesiones</span></span>
                </div>
                <div className="p-3 bg-[#0A0A0A] border border-[#262626] rounded-xl text-center sm:text-left">
                  <span className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase block">Alumnos Activos esta Semana</span>
                  <span className="text-xl font-bold text-[#D9A9FF]">128 <span className="text-xs font-medium text-emerald-400">alumnos</span></span>
                </div>
              </div>
            ) : (currentUser.role === 'studio' || currentUser.role === 'academy') ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-[#0A0A0A] border border-[#262626] rounded-xl text-center sm:text-left">
                  <span className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase block">Instructores Activos Staff</span>
                  <span className="text-xl font-bold text-[#EDEFF4]">12 <span className="text-xs font-medium text-[#D9A9FF]">docentes</span></span>
                </div>
                <div className="p-3 bg-[#0A0A0A] border border-[#262626] rounded-xl text-center sm:text-left">
                  <span className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase block">Matrícula General Academia</span>
                  <span className="text-xl font-bold text-emerald-400">1,850 <span className="text-xs font-medium text-emerald-300">alumnos</span></span>
                </div>
                <div className="p-3 bg-[#0A0A0A] border border-[#262626] rounded-xl text-center sm:text-left">
                  <span className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase block">Membresías & Suscripciones</span>
                  <span className="text-xl font-bold text-[#D9A9FF]">$4,250 <span className="text-xs font-medium text-slate-400">USD/mes</span></span>
                </div>
                <div className="p-3 bg-[#0A0A0A] border border-[#262626] rounded-xl text-center sm:text-left">
                  <span className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase block">Eventos & Batallas Activas</span>
                  <span className="text-xl font-bold text-[#D9A9FF]">8 <span className="text-xs font-medium text-purple-400">globales</span></span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-[#0A0A0A] border border-[#262626] rounded-xl text-center sm:text-left">
                  <span className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase block">Total ({chartTimeRange} Días)</span>
                  <span className="text-xl font-bold text-[#EDEFF4]">{chartData.reduce((acc, curr) => acc + curr.minutos, 0)} <span className="text-xs font-medium">min</span></span>
                </div>
                
                <div className="p-3 bg-[#0A0A0A] border border-[#262626] rounded-xl text-center sm:text-left">
                  <span className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase block">Sesiones Registradas</span>
                  <span className="text-xl font-bold text-[#EDEFF4]">
                    {chartData.reduce((acc, curr) => acc + (curr.logs ? curr.logs.length : (curr.minutos > 0 ? 1 : 0)), 0)} <span className="text-xs font-medium text-slate-400">sesiones</span>
                  </span>
                </div>

                <div className="p-3 bg-[#0A0A0A] border border-[#262626] rounded-xl text-center sm:text-left">
                  <span className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase block">Racha Activa</span>
                  <span className="text-xl font-bold text-[#D9A9FF]">🔥 {getPracticeStreak()} <span className="text-xs font-medium">días</span></span>
                </div>
                <div className="p-3 bg-[#0A0A0A] border border-[#262626] rounded-xl text-center sm:text-left">
                  <span className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase block">Promedio Diario</span>
                  <span className="text-xl font-bold text-[#D9A9FF]">
                    {Math.round(chartData.reduce((acc, curr) => acc + curr.minutos, 0) / chartTimeRange)} <span className="text-xs font-medium">min/día</span>
                  </span>
                </div>
              </div>
            )}

            {/* Recharts Chart Container */}
            <div className="border border-[#262626] rounded-2xl p-4 bg-[#0A0A0A] space-y-4 w-full">
              {/* Chart Header & Controls */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-[#262626] pb-3">
                <div>
                  <h4 className="text-xs font-mono font-bold text-[#EDEFF4] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D9A9FF]" />
                    {currentUser.role === 'instructor' 
                      ? 'TENDENCIA DE ENGAGEMENT SEMANAL' 
                      : 'Evolución del Tiempo de Entrenamiento Diario (Firestore)'}
                  </h4>
                  <p className="text-[10px] text-[#8A8A8A] font-medium mt-0.5">
                    {currentUser.role === 'instructor'
                      ? 'Datos agregados de minutos de práctica de alumnos, tasa de feedback completado y sesiones registradas'
                      : (chartViewMode === 'line' 
                          ? 'Visualiza la tendencia continua y progresión en minutos practicados por día'
                          : chartViewMode === 'stacked' 
                            ? 'Tiempo acumulado por categoría de actividad (Drills, Batallas, Combos, Música, Somático)'
                            : 'Total de minutos practicados frente a la meta diaria')}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                  {/* Time Range Selector */}
                  <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-xl border border-[#262626]">
                    {[7, 14, 30].map((days) => (
                      <button
                        key={`range-${days}`}
                        type="button"
                        onClick={() => setChartTimeRange(days as 7 | 14 | 30)}
                        className={`px-2 py-1 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                          chartTimeRange === days
                            ? 'bg-[#9A2B3C] text-white shadow-md'
                            : 'text-[#8A8A8A] hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {days}D
                      </button>
                    ))}
                  </div>

                  {/* View Mode Selector */}
                  <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-xl border border-[#262626]">
                    <button
                      type="button"
                      onClick={() => setChartViewMode('line')}
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                        chartViewMode === 'line'
                          ? 'bg-[#E9C349] text-slate-950 shadow-md'
                          : 'text-[#8A8A8A] hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      📈 Evolución Línea
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartViewMode('stacked')}
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                        chartViewMode === 'stacked'
                          ? 'bg-[#E9C349] text-slate-950 shadow-md'
                          : 'text-[#8A8A8A] hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      📊 Por Actividad
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartViewMode('total')}
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                        chartViewMode === 'total'
                          ? 'bg-[#E9C349] text-slate-950 shadow-md'
                          : 'text-[#8A8A8A] hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      📊 Barras Totales
                    </button>
                  </div>
                </div>
              </div>

              {/* Responsive Recharts Display */}
              <div className="h-60 sm:h-64 md:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartViewMode === 'line' ? (
                    <AreaChart
                      data={chartData}
                      margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="minutosGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D9A9FF" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#D9A9FF" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1c1b1b" vertical={false} />
                      <XAxis 
                        dataKey="dayName" 
                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#8A8A8A' }} 
                        axisLine={{ stroke: '#262626' }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#8A8A8A' }}
                        axisLine={{ stroke: '#262626' }}
                        tickLine={false}
                        unit="m"
                      />
                      <RechartsTooltip 
                        cursor={{ stroke: 'rgba(217, 169, 255,0.3)', strokeWidth: 1, strokeDasharray: '2 2' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const isMet = data.minutos >= (currentUser.targetMinutes || 30);
                            return (
                              <div className="bg-[#121212] border border-[#262626] p-3 rounded-xl text-xs text-[#EDEFF4] space-y-2 shadow-2xl min-w-[220px]">
                                <div className="flex items-center justify-between border-b border-[#262626] pb-1.5">
                                  <p className="font-mono font-bold text-[10px] text-[#8A8A8A] uppercase">{data.dayName}</p>
                                  <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${isMet ? 'bg-[#D9A9FF]/20 text-[#D9A9FF]' : 'bg-rose-500/20 text-rose-300'}`}>
                                    {data.minutos} min {isMet ? '✓ Logrado' : ''}
                                  </span>
                                </div>
                                
                                <div className="space-y-1">
                                  {data.drill > 0 && (
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span className="flex items-center gap-1.5 text-gray-300">
                                        <span className="w-2 h-2 rounded-full bg-[#D9A9FF]" /> ⚡ Drills & Técnica
                                      </span>
                                      <span className="font-mono font-bold text-[#D9A9FF]">{data.drill}m</span>
                                    </div>
                                  )}
                                  {data.battle > 0 && (
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span className="flex items-center gap-1.5 text-gray-300">
                                        <span className="w-2 h-2 rounded-full bg-[#C23E9E]" /> ⚔️ Batallas
                                      </span>
                                      <span className="font-mono font-bold text-[#C23E9E]">{data.battle}m</span>
                                    </div>
                                  )}
                                  {data.combo > 0 && (
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span className="flex items-center gap-1.5 text-gray-300">
                                        <span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> 💃 Combos
                                      </span>
                                      <span className="font-mono font-bold text-[#3B82F6]">{data.combo}m</span>
                                    </div>
                                  )}
                                  {data.playlist > 0 && (
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span className="flex items-center gap-1.5 text-gray-300">
                                        <span className="w-2 h-2 rounded-full bg-[#10B981]" /> 🎵 Música
                                      </span>
                                      <span className="font-mono font-bold text-[#10B981]">{data.playlist}m</span>
                                    </div>
                                  )}
                                  {data.sensorial > 0 && (
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span className="flex items-center gap-1.5 text-gray-300">
                                        <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" /> 🧘 Somático
                                      </span>
                                      <span className="font-mono font-bold text-[#8B5CF6]">{data.sensorial}m</span>
                                    </div>
                                  )}
                                  {data.minutos === 0 && (
                                    <p className="text-[10px] text-gray-500 italic">Sin actividad registrada en esta fecha</p>
                                  )}
                                </div>

                                {(data.logs || []).length > 0 && (
                                  <div className="border-t border-[#262626] pt-1.5 space-y-1">
                                    <p className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase">Registros de Firestore:</p>
                                    {(data.logs || []).map((log: any, lidx: number) => (
                                      <p key={log.id || `log-${lidx}`} className="text-[10px] text-gray-300 truncate">
                                        • <span className="font-bold text-slate-900 dark:text-white">{log.minutes}m</span> - {log.description}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <ReferenceLine 
                        y={currentUser.targetMinutes || 30} 
                        stroke="#C23E9E" 
                        strokeDasharray="4 4" 
                        label={{ value: `Meta: ${currentUser.targetMinutes || 30}m`, fill: '#C23E9E', fontSize: 10, position: 'insideTopRight' }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="minutos" 
                        name="Minutos de Práctica" 
                        stroke="#D9A9FF" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#minutosGradient)" 
                        activeDot={{ r: 7, fill: '#D9A9FF', stroke: '#0D0D12', strokeWidth: 3 }} 
                      />
                    </AreaChart>
                  ) : (
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1c1b1b" vertical={false} />
                      <XAxis 
                        dataKey="dayName" 
                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#8A8A8A' }} 
                        axisLine={{ stroke: '#262626' }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#8A8A8A' }}
                        axisLine={{ stroke: '#262626' }}
                        tickLine={false}
                        unit="m"
                      />
                      <RechartsTooltip 
                        cursor={{ fill: 'rgba(217, 169, 255,0.05)' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-[#121212] border border-[#262626] p-3 rounded-xl text-xs text-[#EDEFF4] space-y-2 shadow-2xl min-w-[210px]">
                                <div className="flex items-center justify-between border-b border-[#262626] pb-1.5">
                                  <p className="font-mono font-bold text-[10px] text-[#8A8A8A] uppercase">{data.dayName}</p>
                                  <span className="font-mono font-bold text-[#D9A9FF] text-xs">{data.minutos} min total</span>
                                </div>
                                
                                <div className="space-y-1">
                                  {data.drill > 0 && (
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span className="flex items-center gap-1.5 text-gray-300">
                                        <span className="w-2 h-2 rounded-full bg-[#D9A9FF]" /> ⚡ Drills & Técnica
                                      </span>
                                      <span className="font-mono font-bold text-[#D9A9FF]">{data.drill}m</span>
                                    </div>
                                  )}
                                  {data.battle > 0 && (
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span className="flex items-center gap-1.5 text-gray-300">
                                        <span className="w-2 h-2 rounded-full bg-[#C23E9E]" /> ⚔️ Batallas
                                      </span>
                                      <span className="font-mono font-bold text-[#C23E9E]">{data.battle}m</span>
                                    </div>
                                  )}
                                  {data.combo > 0 && (
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span className="flex items-center gap-1.5 text-gray-300">
                                        <span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> 💃 Combos
                                      </span>
                                      <span className="font-mono font-bold text-[#3B82F6]">{data.combo}m</span>
                                    </div>
                                  )}
                                  {data.playlist > 0 && (
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span className="flex items-center gap-1.5 text-gray-300">
                                        <span className="w-2 h-2 rounded-full bg-[#10B981]" /> 🎵 Música
                                      </span>
                                      <span className="font-mono font-bold text-[#10B981]">{data.playlist}m</span>
                                    </div>
                                  )}
                                  {data.sensorial > 0 && (
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span className="flex items-center gap-1.5 text-gray-300">
                                        <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" /> 🧘 Somático
                                      </span>
                                      <span className="font-mono font-bold text-[#8B5CF6]">{data.sensorial}m</span>
                                    </div>
                                  )}
                                  {data.minutos === 0 && (
                                    <p className="text-[10px] text-gray-500 italic">Sin actividad registrada</p>
                                  )}
                                </div>

                                {(data.logs || []).length > 0 && (
                                  <div className="border-t border-[#262626] pt-1.5 space-y-1">
                                    <p className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase">Sesiones:</p>
                                    {(data.logs || []).map((log: any, lidx: number) => (
                                      <p key={log.id || `log-${lidx}`} className="text-[10px] text-gray-300 truncate">
                                        • <span className="font-bold text-slate-900 dark:text-white">{log.minutes}m</span> - {log.description}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      
                      {chartViewMode === 'stacked' ? (
                        <>
                          <Bar dataKey="drill" name="Drills & Técnica" stackId="a" fill="#D9A9FF" maxBarSize={45} />
                          <Bar dataKey="battle" name="Batallas & Freestyle" stackId="a" fill="#C23E9E" maxBarSize={45} />
                          <Bar dataKey="combo" name="Combos & Rutinas" stackId="a" fill="#3B82F6" maxBarSize={45} />
                          <Bar dataKey="playlist" name="Música & Ritmo" stackId="a" fill="#10B981" maxBarSize={45} />
                          <Bar dataKey="sensorial" name="Somático & Postura" stackId="a" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={45} />
                        </>
                      ) : (
                        <Bar dataKey="minutos" name="Total Minutos" radius={[4, 4, 0, 0]} maxBarSize={45}>
                          {(chartData || []).map((entry, index) => {
                            const isTargetMet = entry.minutos >= (currentUser.targetMinutes || 30);
                            return (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={isTargetMet ? '#D9A9FF' : '#C23E9E'} 
                              />
                            );
                          })}
                        </Bar>
                      )}
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Categorized Summary Badges */}
              <div className="pt-3 border-t border-[#262626] flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-[#8A8A8A] uppercase mr-1">Resumen del Período:</span>
                {(Object.keys(ACTIVITY_CONFIG) as Array<PracticeLog['activityType']>).map((type) => {
                  const config = ACTIVITY_CONFIG[type];
                  const total = weeklyCategoryTotals[type] || 0;
                  return (
                    <div 
                      key={type}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141414] border border-[#262626] text-[11px] font-medium text-gray-300"
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: config.color }} />
                      <span>{config.icon} {config.label}</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white bg-white/10 px-1.5 py-0.5 rounded text-[10px]">{total}m</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Curriculum & Live Stream Box -> 4 cols */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Box 1: CLASES Y CURSOS */}
          <div className="bg-[#121212] border border-[#262626] rounded-2xl p-5 space-y-4 shadow-lg text-[#EDEFF4]">
            <div className="border-b border-[#262626] pb-3">
              <span className="text-[9px] font-mono font-bold text-[#D9A9FF] bg-[#D9A9FF]/10 border border-[#D9A9FF]/30 px-2 py-0.5 rounded uppercase">
                TU RUTA DE APRENDIZAJE
              </span>
              <h3 className="text-sm font-display-lg italic text-[#EDEFF4] uppercase mt-2">CLASES Y CURSOS</h3>
            </div>

            <div className="space-y-4">
              {[
                { 
                  id: 'cursos-1', 
                  title: 'Nivel 1: Fundamentos del Waacking', 
                  progress: l1Percent, 
                  color: 'bg-[#D9A9FF]', 
                  lessonsStr: `${l1CompletedCount} de ${level1Lessons.length} lecciones` 
                },
                { 
                  id: 'cursos-2', 
                  title: 'Coreografía Disco Funky', 
                  progress: 30, 
                  color: 'bg-[#C23E9E]', 
                  lessonsStr: '1 de 3 lecciones' 
                },
                { 
                  id: 'cursos-3', 
                  title: 'Musicalidad Avanzada y Acentos', 
                  progress: 75, 
                  color: 'bg-[#5e0b15]', 
                  lessonsStr: '3 de 4 lecciones' 
                },
                { 
                  id: 'cursos-4', 
                  title: 'Nivel 2: Coreografías y Styling', 
                  progress: l2Percent, 
                  color: 'bg-[#D9A9FF]', 
                  lessonsStr: `${l2CompletedCount} de ${level2Lessons.length} lecciones` 
                },
              ].map((course) => (
                <div key={course.id} className="p-3 bg-[#0A0A0A] border border-[#262626] rounded-xl">
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <p className="text-[11px] font-bold text-[#EDEFF4] uppercase leading-tight">{course.title}</p>
                    <span className="text-[10px] font-mono font-bold text-[#D9A9FF] shrink-0">{course.progress}%</span>
                  </div>
                  
                  {/* Custom progress bar */}
                  <div className="w-full bg-[#1c1b1b] h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`${course.color} h-full transition-all duration-700`} 
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-[9px] text-[#8A8A8A] font-mono font-bold mt-2">
                    <span>{course.lessonsStr}</span>
                    <button
                      onClick={() => {
                        if (course.id === 'cursos-1' || course.id === 'cursos-2') {
                          setSelectedCourseLevel(1);
                        } else {
                          setSelectedCourseLevel(2);
                        }
                        setActiveTab('cursos');
                      }}
                      className="text-[#D9A9FF] hover:underline uppercase flex items-center gap-0.5 font-bold"
                    >
                      Ver Lecciones &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Box 2: CALENDARIO & LIVE BLOCK (Video + Live chat stream) */}
          <div className="bg-[#121212] border border-[#262626] rounded-2xl overflow-hidden flex flex-col shadow-lg text-[#EDEFF4]">
            
            {/* Calendar Strip Header */}
            <div className="p-4 border-b border-[#262626] flex justify-between items-center bg-[#1c1b1b]">
              <h4 className="text-xs font-mono font-bold tracking-tight text-[#EDEFF4] uppercase flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#D9A9FF]" /> CALENDARIO & LIVE
              </h4>
              <button 
                onClick={() => setActiveTab('live')} 
                className="text-[9px] text-[#D9A9FF] hover:underline font-bold uppercase"
              >
                Ver Agenda &rarr;
              </button>
            </div>

            <div className="p-4 space-y-4 bg-[#121212]">
              {/* Prominent Live Class Join Container */}
              <div className="bg-rose-50 dark:bg-[#181214] border-2 border-[#9A2B3C] rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-9 h-9 rounded-full bg-[#C23E9E]/30 border border-[#C23E9E] flex items-center justify-center shrink-0 text-[#D9A9FF]">
                    <Video className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[10px] font-mono font-bold text-[#D9A9FF] uppercase tracking-wider">Clase en Vivo Programada</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase">Gestión de Clases en Vivo</h5>
                    <p className="text-[10px] text-slate-400 font-mono">Sesión interactiva con Brando • Hoy 19:30</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMeetModal(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-[#C23E9E] hover:bg-[#C13F9C] text-white text-xs font-mono font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer border border-[#D9A9FF]/40"
                >
                  <Video className="w-3.5 h-3.5 text-[#D9A9FF]" />
                  <span>UNIRSE A CLASE EN VIVO - HOY 19:30</span>
                </button>
              </div>

              {/* Weekly agenda strip representation inside mockup */}
              <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl p-2.5">
                <p className="text-[8px] font-mono font-bold text-[#8A8A8A] uppercase tracking-widest mb-1.5">Agenda Semanal</p>
                <div className="grid grid-cols-7 gap-1 text-center font-mono font-bold">
                  {[
                    { day: 'Lun', active: false, classText: '' },
                    { day: 'Mar', active: true, classText: 'Técnica' },
                    { day: 'Mié', active: false, classText: '' },
                    { day: 'Jue', active: true, classText: 'Live Feed' },
                    { day: 'Vie', active: false, classText: '' },
                    { day: 'Sáb', active: false, classText: '' },
                    { day: 'Dom', active: false, classText: '' }
                  ].map((d, idx) => (
                    <div 
                      key={idx} 
                      className={`p-1 rounded-lg border ${
                        d.active 
                          ? 'bg-[#C23E9E] text-white border-[#C23E9E] scale-[1.05]' 
                          : 'bg-[#121212] text-gray-500 border-[#262626] text-[9px]'
                      }`}
                      title={d.classText || 'Sin clases'}
                    >
                      <p className="text-[8px] uppercase">{d.day}</p>
                      {d.active && <span className="text-[6px] block font-sans font-bold tracking-tighter uppercase leading-none mt-0.5">{d.classText}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Broadcast Screen box */}
              <div className="relative aspect-video rounded-xl border border-[#262626] overflow-hidden group shadow bg-black">
                <img 
                  src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600" 
                  alt="Live Stream Class" 
                  className="w-full h-full object-cover opacity-60" 
                />
                
                {/* Live tag */}
                <div className="absolute top-2 left-2 bg-[#C23E9E] text-white text-[8px] font-bold tracking-widest px-1.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  LIVE NOW
                </div>

                {/* Direct Google Meet Join overlay */}
                <button
                  type="button"
                  onClick={() => setShowMeetModal(true)}
                  className="absolute top-2 right-2 bg-[#D9A9FF] text-black text-[8px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 hover:scale-105 transition-all shadow-md"
                  title="Unirse a Google Meet Integrado"
                >
                  <Video className="w-3.5 h-3.5 text-black" /> Google Meet Integrado
                </button>

                {/* Broadcast Name overlay */}
                <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 border border-[#262626] rounded text-[8px] font-mono text-white">
                  Transmisión de Posturas con Brando
                </div>

                {/* Mute controls */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="absolute bottom-2 right-2 w-6 h-6 bg-[#121212] border border-[#262626] rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-[#1c1b1b] text-[#EDEFF4]"
                >
                  {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                </button>
              </div>

              {/* Simulated active streaming chat box */}
              <div className="bg-[#0A0A0A] rounded-xl border border-[#262626] p-2.5 text-[#EDEFF4]">
                <div className="text-[9px] text-[#8A8A8A] font-bold border-b border-[#262626] pb-1 flex justify-between uppercase">
                  <span>Chat del Directo</span>
                  <span className="text-[#D9A9FF] font-bold text-[8px]">42 bailarines activos</span>
                </div>
                
                <div className="h-[90px] overflow-y-auto space-y-1.5 pr-1 pt-1.5 text-[10px] font-mono text-left">
                  {liveChat.map((msgStr, index) => {
                    const splitIdx = msgStr.indexOf(':');
                    const sender = msgStr.substring(0, splitIdx);
                    const text = msgStr.substring(splitIdx + 1);
                    return (
                      <div key={index} className="leading-tight">
                        <span className="text-[#D9A9FF] font-bold uppercase">{sender}:</span>
                        <span className="text-[#EDEFF4] font-medium"> {text}</span>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleSendLiveMessage} className="mt-2 flex gap-1.5">
                  <input 
                    type="text" 
                    placeholder="Escribe en el directo..." 
                    value={newLiveMessage}
                    onChange={(e) => setNewLiveMessage(e.target.value)}
                    className="flex-1 bg-[#121212] border border-[#262626] rounded px-2 py-0.5 text-[10px] text-[#EDEFF4] placeholder-gray-600 font-semibold focus:outline-none"
                  />
                  <button 
                    type="submit" 
                    className="bg-[#C23E9E] text-white text-[10px] font-bold px-2 py-0.5 rounded"
                  >
                    Enviar
                  </button>
                </form>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* SECCIONES COMPLEMENTARIAS Y RECURSOS: BIBLIOTECA, MÚSICA, ANUNCIOS, COMUNIDAD Y RANKING */}
      <div className="space-y-8 mt-10 border-t border-[#262626] pt-8">
        
        {/* 1. BIBLIOTECA DE ENTRENAMIENTO WAACK ON */}
        <StudentTrainingLibrary currentUser={currentUser} onUserChange={onUserChange} />

        {/* 2. REPRODUCTOR DE AUDIO Y MÚSICA DE ENTRENAMIENTO MULTI-FUENTE */}
        <MultiSourceMusicEngine 
          initialUrl="https://soundcloud.com/mario-monroe-717013866/sets/waacking-training-vibes" 
          isInstructor={currentUser.role === 'instructor'} 
        />

        {/* 3. SECCIÓN: ANUNCIOS DE INSTRUCTORES */}
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-5 md:p-6 relative overflow-hidden shadow-2xl space-y-5">
          <div className="absolute left-0 top-0 w-80 h-80 bg-[#C23E9E]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/5 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-[#C23E9E]/20 border border-[#C23E9E]/40 rounded-xl text-[#D9A9FF]">
                  <Megaphone className="w-5 h-5" />
                </span>
                <h3 className="text-sm md:text-base font-mono font-bold tracking-widest text-[#EDEFF4] uppercase flex flex-wrap items-center gap-2">
                  <span>ANUNCIOS</span>
                  <span className="text-[9px] font-mono font-bold text-[#D9A9FF] bg-[#D9A9FF]/10 border border-[#D9A9FF]/30 px-2 py-0.5 rounded-full uppercase">
                    Novedades Oficiales
                  </span>
                </h3>
              </div>
              <p className="text-[11px] text-[#8A8A8A] font-semibold leading-relaxed">
                Comunicados, convocatorias de competencias, sesiones de práctica y clases publicadas por el equipo docente.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Publicación Gratuita para Instructores</span>
              </div>

              {currentUser.role === 'instructor' && (
                <button
                  type="button"
                  onClick={() => setShowAnnModal(true)}
                  className="px-4 py-2 bg-[#D9A9FF] hover:bg-[#B87CFF] text-black text-xs font-black rounded-xl border border-transparent shadow-lg transition-all flex items-center gap-2 uppercase tracking-wide hover:scale-105"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Publicar Anuncio (Gratis)</span>
                </button>
              )}
            </div>
          </div>

          {/* Notification Toast */}
          <AnimatePresence>
            {annAlertMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold rounded-xl flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{annAlertMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'todos', label: 'Todos los Anuncios' },
              { id: 'competencias', label: '🏆 Competencias' },
              { id: 'sesiones', label: '⚡ Sesiones & Jams' },
              { id: 'clases', label: '💃 Clases Especiales' },
              { id: 'comunicados', label: '📢 Comunicados' },
            ].map((cat) => {
              const isSelected = selectedAnnCat === cat.id;
              const count = (announcements || []).filter(a => cat.id === 'todos' || a.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedAnnCat(cat.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-[#E9C349] text-black border-[#E9C349] shadow-md'
                      : 'bg-[#181818] text-[#8A8A8A] hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-white/5 hover:border-white/15'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? 'bg-black/20 text-black' : 'bg-white/10 text-slate-300'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Announcements Grid */}
          {(() => {
            const filteredList = (announcements || []).filter(a => {
              if (selectedAnnCat === 'todos') return true;
              return a.category === selectedAnnCat;
            });

            if (filteredList.length === 0) {
              return (
                <div className="py-8 text-center bg-[#0A0A0A] border border-dashed border-[#262626] rounded-2xl p-6 text-xs text-[#8A8A8A] space-y-2">
                  <p className="font-mono font-bold text-slate-400">No hay anuncios publicados en esta categoría actualmente.</p>
                  {currentUser.role === 'instructor' && (
                    <button
                      type="button"
                      onClick={() => setShowAnnModal(true)}
                      className="mt-2 px-4 py-1.5 bg-[#D9A9FF]/10 text-[#D9A9FF] border border-[#D9A9FF]/30 rounded-xl text-xs font-bold hover:bg-[#D9A9FF] hover:text-black transition-all"
                    >
                      Publicar el primer anuncio
                    </button>
                  )}
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredList.map((item, idx) => {
                  const getCategoryBadge = (cat?: string) => {
                    switch (cat) {
                      case 'competencias':
                        return { label: '🏆 Competencia', bg: 'bg-[#D9A9FF]/20 text-[#D9A9FF] border-[#D9A9FF]/40' };
                      case 'sesiones':
                        return { label: '⚡ Sesión / Jam', bg: 'bg-[#C23E9E]/20 text-[#EDEFF4] border-[#C23E9E]/40' };
                      case 'clases':
                        return { label: '💃 Clase Especial', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
                      case 'comunicados':
                      default:
                        return { label: '📢 Comunicado', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
                    }
                  };

                  const catBadge = getCategoryBadge(item.category);

                  return (
                    <div
                      key={`ann-${item.id || idx}-${idx}`}
                      className={`bg-white/90 dark:bg-[#181818]/90 rounded-2xl p-5 border transition-all flex flex-col justify-between relative group ${
                        item.important
                          ? 'border-[#E9C349]/60 bg-gradient-to-b from-amber-50 to-white dark:from-[#1e1b12] dark:to-[#121212] shadow-[0_4px_20px_rgba(233,195,73,0.08)]'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      {item.important && (
                        <div className="absolute -top-2.5 right-4 bg-[#D9A9FF] text-black text-[8px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 fill-black" />
                          <span>DESTACADO</span>
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={item.authorAvatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120'}
                              alt={item.author}
                              className="w-8 h-8 rounded-full object-cover border border-[#D9A9FF]/50 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">{item.author}</h4>
                              <span className="text-[8px] font-mono text-[#E9C349] uppercase font-bold block">
                                Instructor Oficial
                              </span>
                            </div>
                          </div>

                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border shrink-0 ${catBadge.bg}`}>
                            {catBadge.label}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-[#EDEFF4] group-hover:text-[#D9A9FF] transition-colors leading-snug">
                          {item.title}
                        </h4>

                        <p className="text-[11px] text-[#A0A5B1] font-normal leading-relaxed whitespace-pre-line">
                          {item.content}
                        </p>

                        {item.imageUrl && (
                          <div 
                            onClick={() => setAnnLightboxImage(item.imageUrl || null)}
                            className="relative w-full h-44 rounded-xl overflow-hidden cursor-pointer group/img border border-white/10 my-1.5 bg-black/60 shrink-0"
                            title="Haz clic para ampliar la imagen"
                          >
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-[#D9A9FF] font-mono text-[10px] font-bold">
                              <ZoomIn className="w-4 h-4" />
                              <span>Ampliar Imagen del Anuncio</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[10px] text-[#8A8A8A] font-mono">
                        <span>{item.date}</span>

                        <div className="flex items-center gap-2">
                          {item.actionUrl && (
                            <a
                              href={item.actionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-[#D9A9FF]/10 hover:bg-[#D9A9FF] text-[#D9A9FF] hover:text-black border border-[#D9A9FF]/30 font-bold rounded-lg transition-all flex items-center gap-1 text-[9px]"
                            >
                              <span>Acceder</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}

                          {(currentUser.role === 'instructor' || currentUser.name === item.author) && onDeleteAnnouncement && (
                            <button
                              type="button"
                              onClick={() => onDeleteAnnouncement(item.id)}
                              className="p-1 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-md transition-all"
                              title="Eliminar anuncio"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* 4. SECCIÓN: DIRECTORIO GLOBAL DE INSTRUCTORES WAACK ON */}
        {(() => {
          const defaultInstructors = [
            {
              id: 'inst-1',
              name: 'Brando Hermoso',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
              specialties: language === 'es' ? ['Rolls Rápidos', 'Mecánica Corporal', 'Postura Somática'] : ['Fast Rolls', 'Body Mechanics', 'Somatic Posture'],
              level: 'Master',
              country: 'ESPAÑA 🇪🇸',
              isFeaturedInstructor: true,
              monthlyPrice: '$45 USD/mes',
              instagram: '@brando_hermoso',
              rating: 4.9,
              students: 1540
            },
            {
              id: 'inst-2',
              name: 'Kumari "WaackQueen"',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
              specialties: language === 'es' ? ['Expresión Teatral', 'Pasarela Disco', 'Carácter Actoral'] : ['Theatrical Expression', 'Disco Runway', 'Acting Character'],
              level: 'Elite',
              country: 'ESTADOS UNIDOS 🇺🇸',
              isFeaturedInstructor: true,
              monthlyPrice: '$38 USD/mes',
              instagram: '@kumari_waack',
              rating: 4.8,
              students: 920
            },
            {
              id: 'inst-3',
              name: 'Ibuki Imata',
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
              specialties: language === 'es' ? ['Velocidad Sostenida', 'Freestyle Dinámico', 'BPM Avanzados'] : ['Sustained Speed', 'Dynamic Freestyle', 'Advanced BPMs'],
              level: 'Master',
              country: 'JAPÓN 🇯🇵',
              isFeaturedInstructor: false,
              monthlyPrice: '$42 USD/mes',
              instagram: '@ibuki_waack_on',
              rating: 4.9,
              students: 2100
            },
            {
              id: 'inst-4',
              name: 'YoonJi Kim',
              avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120',
              specialties: language === 'es' ? ['Musicalidad Rítmica', 'Aislamiento Codos', 'Síncopa Disco'] : ['Rhythmic Musicality', 'Elbow Isolation', 'Disco Syncopation'],
              level: 'Elite',
              country: 'COREA DEL SUR 🇰🇷',
              isFeaturedInstructor: true,
              monthlyPrice: '$48 USD/mes',
              instagram: '@yoonji_waack',
              rating: 4.9,
              students: 1150
            },
            {
              id: 'inst-5',
              name: 'Master of Rhythm',
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
              specialties: language === 'es' ? ['Advanced', 'Técnica Waack On', 'Mecánica Corporal'] : ['Advanced', 'Waack On Technique', 'Body Mechanics'],
              level: 'Advanced',
              country: 'ESTADOS UNIDOS 🇺🇸',
              isFeaturedInstructor: true,
              monthlyPrice: '$35 USD/mes',
              instagram: '@master_of_rhythm',
              rating: 5.0,
              students: 840
            },
            {
              id: 'inst-6',
              name: 'Lorena "La Waack"',
              avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
              specialties: language === 'es' ? ['Pose Simétrica', 'Vibras de los 70s', 'Elegancia de Brazos'] : ['Symmetrical Pose', '70s Vibes', 'Arm Elegance'],
              level: 'Advanced',
              country: 'COLOMBIA 🇨🇴',
              isFeaturedInstructor: false,
              monthlyPrice: '$29 USD/mes',
              instagram: '@lorena_lawaack',
              rating: 4.7,
              students: 480
            }
          ];

          const allInstructors = [...defaultInstructors];
          if (currentUser.role === 'instructor') {
            const exists = allInstructors.some(inst => inst.id === currentUser.id);
            if (!exists) {
              allInstructors.push({
                id: currentUser.id,
                name: currentUser.nickname || currentUser.name || 'Tú (Instructor)',
                avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
                specialties: language === 'es' 
                  ? [currentUser.level || 'Instructor', 'Técnica Waack On', 'Musicalidad'] 
                  : [currentUser.level || 'Instructor', 'Waack On Technique', 'Musicality'],
                level: 'Instructor',
                country: language === 'es' ? 'Local/Global 🌐' : 'Local/Global 🌐',
                isFeaturedInstructor: !!currentUser.isFeaturedInstructor,
                monthlyPrice: currentUser.monthlyPrice || '$35 USD/mes',
                instagram: currentUser.instagram || '@waack_instructor',
                rating: 5.0,
                students: 24
              });
            }
          }

          const sortedInstructors = [...allInstructors].sort((a, b) => {
            if (a.isFeaturedInstructor && !b.isFeaturedInstructor) return -1;
            if (!a.isFeaturedInstructor && b.isFeaturedInstructor) return 1;
            return b.rating - a.rating;
          });

          const filteredInstructors = sortedInstructors.filter(inst => {
            if (!specialtyFilter.trim()) return true;
            const filter = specialtyFilter.toLowerCase();
            return (
              (inst.name || '').toLowerCase().includes(filter) ||
              (inst.specialties || []).some(spec => (spec || '').toLowerCase().includes(filter)) ||
              (inst.country || '').toLowerCase().includes(filter)
            );
          });

          return (
            <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 relative overflow-hidden shadow-2xl">
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-[#D9A9FF]/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#D9A9FF] text-base">👑</span>
                    <h3 className="text-sm font-mono font-bold tracking-widest text-[#D9A9FF] uppercase">
                      {language === 'es' ? 'DIRECTORIO DE PROFESORES GLOBALES' : 'GLOBAL INSTRUCTOR DIRECTORY'}
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#8A8A8A] font-semibold mt-1">
                    {language === 'es' 
                      ? 'Conecta con los mejores exponentes de la cultura Waack On a nivel internacional. Los instructores destacados aparecen al principio.' 
                      : 'Connect with the top exponents of Waack On culture worldwide. Featured instructors are listed first.'}
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2.5">
                  <input 
                    type="text" 
                    placeholder={language === 'es' ? 'Filtrar por especialidad o país...' : 'Filter by specialty or country...'}
                    value={specialtyFilter}
                    onChange={(e) => setSpecialtyFilter(e.target.value)}
                    className="bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-1.5 text-xs text-[#EDEFF4] focus:border-[#D9A9FF]/50 outline-none w-44 md:w-56 font-medium transition-all"
                  />

                  <button
                    type="button"
                    onClick={() => setShowInstructorPlatformEditor(!showInstructorPlatformEditor)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-[#D9A9FF] via-[#f5d77f] to-[#D9A9FF] hover:opacity-95 text-black text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95"
                  >
                    <Sliders className="w-3.5 h-3.5 text-black" />
                    <span>
                      {showInstructorPlatformEditor 
                        ? (language === 'es' ? 'Cerrar Editor' : 'Close Editor') 
                        : (language === 'es' ? '🛠️ Editar Mi Plataforma & Precio' : '🛠️ Edit My Platform & Fee')}
                    </span>
                  </button>

                  {currentUser.role === 'instructor' ? (
                    <button 
                      onClick={() => setActiveTab('instructor')}
                      className="px-4 py-1.5 bg-[#D9A9FF] hover:bg-[#B87CFF] text-black text-xs font-black rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{currentUser.isFeaturedInstructor ? (language === 'es' ? 'Destacado Activo' : 'Featured Active') : (language === 'es' ? '¡Aparecer Arriba!' : 'Appear at Top!')}</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        setActiveTab('profile');
                      }}
                      className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-900 dark:text-white text-[10px] font-mono font-bold rounded-xl transition-all uppercase"
                    >
                      {language === 'es' ? '¿Eres instructor? Regístrate gratis' : 'Are you an instructor? Join free'}
                    </button>
                  )}
                </div>
              </div>

              {/* Panel de Edición de Plataforma y Precio de Instructor */}
              {showInstructorPlatformEditor && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8 bg-[#0D0D11] border border-[#D9A9FF]/40 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden"
                >
                  {platformSaveNotice && (
                    <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        {platformSaveNotice}
                      </span>
                      <button onClick={() => setPlatformSaveNotice(null)} className="text-emerald-700 dark:text-white hover:opacity-75">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black uppercase bg-[#D9A9FF]/20 text-[#D9A9FF] border border-[#D9A9FF]/30">
                          CONSOLA DE INSTRUCTOR
                        </span>
                        <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-[#E9C349]" />
                          {language === 'es' ? 'GESTIONAR MI PLATAFORMA & PRECIO DE CÁTEDRA' : 'MANAGE MY PLATFORM & MEMBERSHIP FEE'}
                        </h4>
                      </div>
                      <p className="text-[11px] text-[#8A8A8A] font-semibold mt-1">
                        {language === 'es'
                          ? 'Personaliza el precio de tu membresía, tu perfil, configuración de plataforma y contenidos visibles en el directorio.'
                          : 'Customize your membership pricing, profile, platform setup, and content visible in the directory.'}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (setActiveTab) setActiveTab('instructor');
                      }}
                      className="px-3.5 py-2 bg-[#D9A9FF] hover:bg-[#B87CFF] text-black text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shrink-0 active:scale-95 shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{language === 'es' ? 'Ir a Cátedra Completa' : 'Go to Full Platform'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-5 overflow-x-auto scrollbar-none">
                    {[
                      { id: 'price', label: language === 'es' ? '1. Precio de Membresía' : '1. Membership Price', icon: '💲' },
                      { id: 'profile', label: language === 'es' ? '2. Perfil de Instructor' : '2. Instructor Profile', icon: '👤' },
                      { id: 'config', label: language === 'es' ? '3. Configurar Plataforma' : '3. Platform Config', icon: '⚙️' },
                      { id: 'content', label: language === 'es' ? '4. Editar Contenido & Cursos' : '4. Edit Content & Courses', icon: '📚' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setEditPlatformSubTab(tab.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                          editPlatformSubTab === tab.id
                            ? 'bg-[#E9C349] text-black font-black shadow-md'
                            : 'bg-white/5 text-[#8A8A8A] hover:bg-white/10 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/5'
                        }`}
                      >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* SUB-TAB 1: EDIT PRICE */}
                  {editPlatformSubTab === 'price' && (
                    <div className="space-y-4">
                      <div className="bg-[#141419] border border-white/10 rounded-xl p-4 space-y-3">
                        <label className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase block">
                          {language === 'es' ? 'Tarifa Mensual Personalizada por Alumno ($ USD/mes):' : 'Custom Monthly Student Fee ($ USD/month):'}
                        </label>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <input
                            type="text"
                            value={editPriceInput}
                            onChange={(e) => setEditPriceInput(e.target.value)}
                            placeholder="$35.00 USD/mes"
                            className="bg-[#0A0A0A] border border-white/15 rounded-xl px-4 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-[#E9C349] flex-1"
                          />
                          <div className="flex items-center gap-1.5">
                            {['$25 USD/mes', '$35 USD/mes', '$45 USD/mes', '$55 USD/mes'].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setEditPriceInput(preset)}
                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                                  editPriceInput === preset
                                    ? 'bg-[#E9C349]/20 text-[#E9C349] border-[#E9C349]'
                                    : 'bg-white/5 text-[#8A8A8A] border-slate-200 dark:border-white/5 hover:text-slate-900 dark:hover:text-white'
                                }`}
                              >
                                {preset.split(' ')[0]}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => {
                              if (onUserChange) {
                                onUserChange((prev) => ({
                                  ...prev,
                                  monthlyPrice: editPriceInput
                                }));
                              }
                              setPlatformSaveNotice(language === 'es' ? '¡Precio de membresía actualizado en tu plataforma!' : 'Membership fee updated on your platform!');
                              setTimeout(() => setPlatformSaveNotice(null), 3500);
                            }}
                            className="px-5 py-2 bg-[#D9A9FF] hover:bg-[#B87CFF] text-black text-xs font-black rounded-xl uppercase tracking-wider transition-all shrink-0 active:scale-95"
                          >
                            {language === 'es' ? 'Guardar Precio' : 'Save Price'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 2: EDIT PROFILE */}
                  {editPlatformSubTab === 'profile' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold text-[#8A8A8A] uppercase">
                          {language === 'es' ? 'Nombre Completo' : 'Full Name'}
                        </label>
                        <input
                          type="text"
                          value={editNameInput}
                          onChange={(e) => setEditNameInput(e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#E9C349] font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold text-[#8A8A8A] uppercase">
                          {language === 'es' ? 'Usuario de Instagram' : 'Instagram Handle'}
                        </label>
                        <input
                          type="text"
                          value={editInstaInput}
                          onChange={(e) => setEditInstaInput(e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#E9C349] font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold text-[#8A8A8A] uppercase">
                          {language === 'es' ? 'Especialidades & Enfoque' : 'Specialties & Focus'}
                        </label>
                        <input
                          type="text"
                          value={editSpecialtyInput}
                          onChange={(e) => setEditSpecialtyInput(e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#E9C349] font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold text-[#8A8A8A] uppercase">
                          {language === 'es' ? 'País & Bandera' : 'Country & Flag'}
                        </label>
                        <input
                          type="text"
                          value={editCountryInput}
                          onChange={(e) => setEditCountryInput(e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#E9C349] font-medium"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-mono font-bold text-[#8A8A8A] uppercase">
                          {language === 'es' ? 'Biografía de Presentación' : 'Presentation Bio'}
                        </label>
                        <textarea
                          rows={2}
                          value={editBioInput}
                          onChange={(e) => setEditBioInput(e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-[#E9C349] font-medium resize-none"
                        />
                      </div>

                      <div className="sm:col-span-2 flex justify-end pt-1">
                        <button
                          onClick={() => {
                            if (onUserChange) {
                              onUserChange((prev) => ({
                                ...prev,
                                name: editNameInput,
                                instagram: editInstaInput
                              }));
                            }
                            setPlatformSaveNotice(language === 'es' ? '¡Perfil de instructor guardado exitosamente!' : 'Instructor profile saved successfully!');
                            setTimeout(() => setPlatformSaveNotice(null), 3500);
                          }}
                          className="px-6 py-2 bg-[#D9A9FF] hover:bg-[#B87CFF] text-black text-xs font-black rounded-xl uppercase tracking-wider transition-all shrink-0 active:scale-95"
                        >
                          {language === 'es' ? 'Guardar Perfil' : 'Save Profile'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 3: CONFIG PLATFORM */}
                  {editPlatformSubTab === 'config' && (
                    <div className="space-y-4">
                      <div className="bg-[#141419] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase">
                            {language === 'es' ? 'Estado de Profesor Destacado en Directorio' : 'Featured Instructor Status in Directory'}
                          </h5>
                          <p className="text-[11px] text-[#8A8A8A] font-semibold mt-0.5">
                            {language === 'es' 
                              ? 'Los profesores destacados aparecen con la insignia dorada arriba del directorio.'
                              : 'Featured instructors appear with the golden badge at top of directory.'}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const nextState = !currentUser.isFeaturedInstructor;
                            if (onUserChange) {
                              onUserChange((prev) => ({
                                ...prev,
                                isFeaturedInstructor: nextState
                              }));
                            }
                            setPlatformSaveNotice(nextState ? '¡Ahora eres un Profesor Destacado!' : 'Estado cambiado');
                            setTimeout(() => setPlatformSaveNotice(null), 3500);
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                            currentUser.isFeaturedInstructor
                              ? 'bg-[#E9C349] text-black border-[#E9C349]'
                              : 'bg-white/5 text-slate-900 dark:text-white border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {currentUser.isFeaturedInstructor ? '⭐ DESTACADO ACTIVO' : 'ACTIVAR DESTACADO'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 4: EDIT CONTENT */}
                  {editPlatformSubTab === 'content' && (
                    <div className="space-y-4">
                      <div className="bg-[#141419] border border-white/10 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase flex items-center gap-1.5">
                            <Video className="w-4 h-4 text-[#E9C349]" />
                            {language === 'es' ? 'Publicar Nueva Clase / Módulo en tu Plataforma' : 'Publish New Class / Module on Your Platform'}
                          </h5>
                          <span className="text-[10px] font-mono text-[#D9A9FF] font-bold">HD VIDEO / STREAM</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder={language === 'es' ? 'Título de la Clase (ej: Wrist Rolls Avanzados)' : 'Class Title'}
                            className="bg-[#0A0A0A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#E9C349]"
                          />
                          <input
                            type="text"
                            placeholder={language === 'es' ? 'URL del Video (YouTube / Vimeo / MP4)' : 'Video URL'}
                            className="bg-[#0A0A0A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#E9C349]"
                          />
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <p className="text-[10px] text-[#8A8A8A]">
                            {language === 'es' ? 'Tus alumnos recibirán una notificación directa de nuevo contenido.' : 'Your students will receive a direct new content notification.'}
                          </p>
                          <button
                            onClick={() => {
                              setPlatformSaveNotice(language === 'es' ? '¡Nueva clase publicada en tu plataforma!' : 'New class published on your platform!');
                              setTimeout(() => setPlatformSaveNotice(null), 3500);
                            }}
                            className="px-4 py-2 bg-[#D9A9FF] text-black font-black text-xs rounded-xl hover:bg-[#B87CFF] transition-all"
                          >
                            {language === 'es' ? 'Publicar Clase' : 'Publish Class'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Instructors Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {(filteredInstructors || []).map((inst, idx) => (
                  <div 
                    key={`inst-${inst.id || idx}-${idx}`}
                    onClick={() => setSelectedInstructorForPlan(inst)}
                    className={`bg-white/80 dark:bg-[#181818]/80 rounded-xl p-4 border transition-all flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:scale-[1.015] ${
                      inst.isFeaturedInstructor 
                        ? 'border-[#E9C349]/40 bg-gradient-to-b from-amber-50 to-white dark:from-[#1c1a15] dark:to-[#121212] shadow-[0_4px_20px_rgba(233,195,73,0.05)] hover:border-[#E9C349]/70' 
                        : 'border-slate-200 dark:border-white/5 hover:border-white/25'
                    }`}
                    title={language === 'es' ? `Haz clic para ver el Plan de Membresía de ${inst.name}` : `Click to view Membership Plan for ${inst.name}`}
                  >
                    {inst.isFeaturedInstructor && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#D9A9FF]/10 text-[#D9A9FF] border border-[#D9A9FF]/30 text-[8px] font-mono font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
                        <Sparkles className="w-2.5 h-2.5 text-[#D9A9FF]" />
                        <span>{language === 'es' ? 'DESTACADO' : 'FEATURED'}</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img 
                            src={inst.avatar} 
                            alt={inst.name} 
                            className={`w-10 h-10 rounded-full object-cover border-2 ${inst.isFeaturedInstructor ? 'border-[#D9A9FF]' : 'border-[#262626]'}`}
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-black rounded-full flex items-center justify-center text-[9px]">
                            {(inst.country || 'GLOBAL 🌐').split(' ')[1] || '🌐'}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight group-hover:text-[#E9C349] transition-colors">
                              {inst.name}
                            </h4>
                          </div>
                          <div className="flex items-center justify-between gap-1 mt-0.5">
                            <p className="text-[9px] text-[#8A8A8A] font-mono uppercase">{(inst.country || 'GLOBAL').split(' ')[0]}</p>
                            <span className="text-[9px] font-mono font-black text-[#D9A9FF] bg-[#D9A9FF]/10 border border-[#D9A9FF]/25 px-1.5 py-0.2 rounded shrink-0">
                              {inst.monthlyPrice || '$35 USD/mes'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[8px] text-[#8A8A8A] font-mono uppercase font-bold tracking-wider">
                          {language === 'es' ? 'ESPECIALIDADES' : 'SPECIALTIES'}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {(inst.specialties || []).map((spec, sidx) => (
                            <span 
                              key={sidx}
                              className="text-[9px] font-bold text-[#C2C7D1] bg-white/5 border border-slate-200 dark:border-white/5 px-1.5 py-0.5 rounded-md whitespace-nowrap"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mt-4 pt-3 border-t border-slate-200 dark:border-white/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 font-mono text-[9px] text-slate-900 dark:text-white">
                          <span className="text-[#E9C349]">★</span>
                          <span>{inst.rating.toFixed(1)}</span>
                          <span className="text-[#8A8A8A]">({inst.students})</span>
                        </div>
                        <a 
                          href={`https://instagram.com/${inst.instagram.replace('@', '')}`}
                          target="_blank" 
                          rel="noopener noreferrer" 
                          onClick={(e) => e.stopPropagation()}
                          className="text-[9px] text-[#8A8A8A] hover:text-[#D9A9FF] font-mono transition-colors"
                        >
                          {inst.instagram}
                        </a>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInstructorForPlan(inst);
                        }}
                        className="w-full py-1.5 px-2 bg-[#D9A9FF]/10 group-hover:bg-[#D9A9FF] text-[#D9A9FF] group-hover:text-black border border-[#D9A9FF]/30 font-mono text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Zap className="w-3 h-3 shrink-0" />
                        <span>{language === 'es' ? 'Ver Plan Mensual' : 'View Monthly Plan'}</span>
                        <ArrowRight className="w-3 h-3 shrink-0" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* 5. SECCIÓN: COMUNIDAD Y CHAT DE ALUMNOS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pl-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">💬</span>
              <h3 className="text-xs font-mono font-bold tracking-widest text-[#C23E9E] uppercase">
                {currentUser.role === 'instructor' 
                  ? 'CANAL DE COMUNICACIÓN Y FEEDBACK DOCENTE'
                  : (currentUser.role === 'studio' || currentUser.role === 'academy')
                  ? 'HUB DE COMUNICACIÓN INSTITUCIONAL Y MODERACIÓN'
                  : 'COMUNIDAD Y CHAT DE ALUMNOS'}
              </h3>
            </div>
            <span className="text-[9px] font-mono text-[#D9A9FF] font-bold px-2 py-0.5 bg-[#121212] border border-[#262626] rounded-md">
              ROL: {currentUser.role?.toUpperCase() || 'STUDENT'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Foro / Feedback */}
            <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 h-auto md:h-[250px] min-h-[250px] flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-2 border-b border-[#262626] pb-1.5">
                  <span className="text-[10px] font-mono font-bold text-[#C23E9E] uppercase">FORO GENERAL</span>
                  <span className="text-[8px] text-[#8A8A8A] font-mono">Último Post</span>
                </div>
                
                <div className="space-y-2 mt-2">
                  <div className="p-3 bg-[#0A0A0A] rounded-xl border border-[#262626] text-left">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-4 h-4 rounded-full bg-[#121212] border border-[#262626] overflow-hidden shrink-0">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[9px] font-bold uppercase text-[#D9A9FF]">Marilyn</span>
                    </div>
                    <p className="text-[10px] text-[#EDEFF4] font-medium italic">"¿Alguien probó el reto de rolls dobles a 130 BPM? ¡Es una locura para los hombros!"</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('comunidad')}
                className="w-full py-1.5 text-center text-[10px] font-bold text-[#C23E9E] border border-[#C23E9E]/30 bg-[#C23E9E]/10 rounded-xl hover:bg-[#C23E9E] hover:text-white transition-colors uppercase"
              >
                Ir al Foro
              </button>
            </div>

            {/* Card 2: Salas de Práctica */}
            <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 h-auto md:h-[250px] min-h-[250px] flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-2 border-b border-[#262626] pb-1.5">
                  <span className="text-[10px] font-mono font-bold text-[#D9A9FF] uppercase">SALAS DE PRÁCTICA</span>
                  <span className="text-[8px] text-[#8A8A8A] font-mono">Activas</span>
                </div>
                
                <div className="space-y-2 mt-2">
                  {(STUDY_GROUPS || []).slice(0, 2).map((group, idx) => (
                    <div key={group.id || `sg-${idx}`} className="p-2.5 bg-[#0A0A0A] border border-[#262626] rounded-xl flex justify-between items-center text-[10px]">
                      <div className="min-w-0">
                        <p className="font-bold text-[#EDEFF4] uppercase truncate">{group.title}</p>
                        <span className="text-[8px] text-[#8A8A8A] font-mono font-bold">{group.participants} activos</span>
                      </div>
                      <span className="text-[8px] bg-[#121212] border border-[#262626] px-1.5 py-0.5 rounded font-bold font-mono shrink-0 text-[#D9A9FF]">{group.category}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setActiveTab('comunidad')}
                className="w-full py-1.5 text-center text-[10px] font-bold text-[#D9A9FF] border border-[#D9A9FF]/30 bg-[#D9A9FF]/10 rounded-xl hover:bg-[#D9A9FF] hover:text-black transition-colors uppercase"
              >
                Unirse a Sala
              </button>
            </div>

            {/* Card 3: Lobby Chat */}
            <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 h-auto md:h-[250px] min-h-[250px] flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-1.5 border-b border-[#262626] pb-1.5">
                  <span className="text-[10px] font-mono font-bold text-[#D9A9FF] uppercase">LOBBY CHAT</span>
                  <span className="text-[8px] text-[#D9A9FF] font-mono font-bold animate-pulse">• ONLINE</span>
                </div>
                
                <div className="h-[125px] overflow-y-auto space-y-2 pr-1 pt-1 text-[10px] font-mono text-left">
                  {(chatMessages || []).slice(-3).map((msg, idx) => (
                    <div key={msg.id || `msg-${idx}`} className="p-2 bg-[#0A0A0A] rounded-lg border border-[#262626]">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-[#D9A9FF] uppercase text-[9px]">{msg.user}</span>
                        <span className="text-[8px] text-[#8A8A8A]">{msg.time}</span>
                      </div>
                      <p className="text-[#EDEFF4] font-medium leading-tight">{msg.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (bentoChatInput.trim()) {
                    const customVal = bentoChatInput.trim();
                    if (onAddChatMessage) {
                      onAddChatMessage(customVal);
                    } else if (Array.isArray(chatMessages)) {
                      chatMessages.push({
                        id: `m-custom-${Date.now()}`,
                        user: currentUser.name,
                        avatar: currentUser.avatar,
                        text: customVal,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        role: currentUser.role
                      });
                    }
                    setBentoChatInput('');
                  }
                }} 
                className="flex gap-1.5 mt-2"
              >
                <input
                  type="text"
                  placeholder="Escribe..."
                  value={bentoChatInput}
                  onChange={(e) => setBentoChatInput(e.target.value)}
                  className="flex-1 text-[10px] bg-[#0A0A0A] border border-[#262626] rounded-lg px-2.5 py-1.5 focus:outline-none placeholder-gray-600 text-[#EDEFF4] font-medium"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-[#C23E9E] text-white rounded-lg hover:bg-[#8F2C7A] cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* 6. SECCIÓN: TABLA DE CLASIFICACIÓN / LEADERBOARD */}
        <div className="bg-[#121212] border border-[#262626] rounded-2xl overflow-hidden shadow-2xl text-[#EDEFF4]">
          <div className="p-4 border-b border-[#262626] flex justify-between items-center bg-[#1c1b1b]">
            <h4 className="text-xs font-mono font-bold tracking-tight text-[#EDEFF4] uppercase flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-[#D9A9FF]" /> CLASIFICACIÓN & RANKING DE LA ACADEMIA
            </h4>
            <span className="text-[9px] bg-[#121212] border border-[#262626] px-2.5 py-0.5 rounded font-mono font-bold text-[#D9A9FF]">
              PUNTOS & LOGROS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#262626] bg-[#121212]">
            {(() => {
              const simulatedCompetitors = [
                { id: 'u-pedro', name: 'Pedro Freestyle', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120', points: 420 },
                { id: 'u-sara', name: 'Sara Pose', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120', points: 290 },
                { id: 'u-carlos', name: 'Carlos Groove', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120', points: 180 },
                { id: 'u-elena', name: 'Elena Waack', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120', points: 80 }
              ];

              const leaderboardList = [
                ...simulatedCompetitors,
                { id: currentUser.id, name: `${currentUser.name} (Tú)`, avatar: currentUser.avatar, points: currentUser.points }
              ].sort((a, b) => b.points - a.points);

              return leaderboardList.slice(0, 4).map((user, idx) => {
                const position = idx + 1;
                const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : null;
                const isMe = user.id === currentUser.id;

                return (
                  <div 
                    key={`lb-${user.id || idx}-${idx}`} 
                    className={`p-3.5 flex items-center justify-between text-xs ${
                      isMe ? 'bg-[#C23E9E]/10' : 'bg-[#121212]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 text-center font-mono font-bold text-sm">{medal || `#${position}`}</span>
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-8 h-8 rounded-full object-cover border border-[#262626]" 
                      />
                      <div className="min-w-0">
                        <span className={`font-bold truncate uppercase text-[11px] block ${isMe ? 'text-[#D9A9FF]' : 'text-[#EDEFF4]'}`}>
                          {user.name}
                        </span>
                        <span className="text-[9px] text-[#8A8A8A] font-mono">Nivel {Math.floor(user.points / 100) + 1}</span>
                      </div>
                    </div>
                    <span className="font-mono font-bold bg-[#0A0A0A] border border-[#262626] px-2 py-1 rounded text-[11px] text-[#D9A9FF] shrink-0">
                      {user.points} pts
                    </span>
                  </div>
                );
              });
            })()}
          </div>

          <div className="p-3 bg-[#0A0A0A] text-center border-t border-[#262626]">
            <button
              onClick={() => setActiveTab('ranking')}
              className="w-full py-2 bg-[#C23E9E] text-white border border-transparent text-xs font-bold rounded-xl hover:bg-[#8F2C7A] transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider shadow-md"
            >
              <span>VER RANKING COMPLETO Y LOGROS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
      </>
      )}

      {/* FOOTER BAR matching the mock image bottom footer */}
      <footer className="mt-8 pt-6 border-t border-[#262626] bg-[#121212] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start text-xs font-bold">
          <span className="text-[#D9A9FF] font-mono tracking-widest text-[10px] uppercase mr-2">© 2026 WAACK ON</span>
          <span className="text-[#262626] hidden md:inline">|</span>
          <button 
            onClick={() => setActiveTab('support')}
            className="text-[#8A8A8A] hover:text-[#D9A9FF] uppercase tracking-tight transition-colors"
          >
            AYUDA & SOPORTE
          </button>
          <span className="text-[#262626]">|</span>
          <button 
            onClick={() => setActiveTab('profile')}
            className="text-[#8A8A8A] hover:text-[#D9A9FF] uppercase tracking-tight transition-colors"
          >
            MI CUENTA
          </button>
        </div>

        <div className="flex items-center gap-3">
          <a href="#facebook" className="p-1.5 bg-[#0A0A0A] hover:bg-slate-100 dark:hover:bg-[#121212] border border-[#262626] text-[#E9C349] rounded-lg transition-all" title="Facebook">
            <Facebook className="w-4 h-4" />
          </a>
          <a href="#instagram" className="p-1.5 bg-[#0A0A0A] hover:bg-slate-100 dark:hover:bg-[#121212] border border-[#262626] text-[#E9C349] rounded-lg transition-all" title="Instagram">
            <Instagram className="w-4 h-4" />
          </a>
          <a href="#twitter" className="p-1.5 bg-[#0A0A0A] hover:bg-slate-100 dark:hover:bg-[#121212] border border-[#262626] text-[#E9C349] rounded-lg transition-all" title="Twitter">
            <Twitter className="w-4 h-4" />
          </a>
          <a href="#youtube" className="p-1.5 bg-[#0A0A0A] hover:bg-slate-100 dark:hover:bg-[#121212] border border-[#262626] text-[#E9C349] rounded-lg transition-all" title="YouTube">
            <Youtube className="w-4 h-4" />
          </a>
        </div>
      </footer>

      {showMeetModal && (
        <EmbeddedGoogleMeet
          meetUrl="https://meet.google.com/waacking-academy-live"
          title="Transmisión de Posturas con Brando"
          instructor="Brando Hermoso"
          onClose={() => setShowMeetModal(false)}
        />
      )}

      {/* Modal para Redactar Anuncios de Instructor */}
      <AnimatePresence>
        {showAnnModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121212] border border-[#262626] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setShowAnnModal(false)}
                className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[#D9A9FF]">
                  <Megaphone className="w-5 h-5" />
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider">
                    Publicar Anuncio de Instructor
                  </h3>
                </div>
                <p className="text-xs text-[#8A8A8A] font-medium">
                  Redacta comunicados, convocatorias a batallas, sesiones de práctica o clases. Se mostrará en el dashboard principal para todos los alumnos.
                </p>
              </div>

              <form onSubmit={handlePublishAnnouncement} className="space-y-4 text-xs">
                {(annTitle.trim() !== '' || annContent.trim() !== '') && (
                  <div className="flex items-center justify-between bg-emerald-950/70 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs font-mono text-emerald-300">
                    <span className="flex items-center gap-1.5 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      💾 Borrador de anuncio guardado localmente
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAnnTitle('');
                        setAnnContent('');
                        localStorage.removeItem('waackon_draft_dashboard_announcement_title');
                        localStorage.removeItem('waackon_draft_dashboard_announcement_content');
                      }}
                      className="text-slate-400 hover:text-rose-300 text-[10px] underline cursor-pointer"
                    >
                      Limpiar borrador
                    </button>
                  </div>
                )}
                {/* Categoría */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-300 uppercase">
                    Categoría del Anuncio
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'competencias', label: '🏆 Competencia / Batalla' },
                      { id: 'sesiones', label: '⚡ Sesión / Jamming' },
                      { id: 'clases', label: '💃 Clase / Masterclass' },
                      { id: 'comunicados', label: '📢 Comunicado General' },
                    ].map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setAnnCategory(c.id as any)}
                        className={`p-2 rounded-xl text-[10px] font-mono font-bold border transition-all text-left ${
                          annCategory === c.id
                            ? 'bg-[#D9A9FF] text-black border-[#D9A9FF]'
                            : 'bg-[#0A0A0A] text-slate-300 border-[#262626] hover:border-white/20'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Título */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-300 uppercase">
                    Título del Anuncio
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Gran Batalla Waack On 2026 - Inscripciones Abiertas"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-2 text-xs text-[#EDEFF4] focus:border-[#D9A9FF] outline-none"
                  />
                </div>

                {/* Contenido */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-300 uppercase">
                    Detalle / Contenido
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe las fechas, horarios, reglas de la batalla o detalles de la clase..."
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl p-3 text-xs text-[#EDEFF4] focus:border-[#D9A9FF] outline-none resize-none"
                  />
                </div>

                {/* Action Link */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-300 uppercase">
                    Enlace de Inscripción o Reunión (Opcional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/xyz-abc o link a formulario"
                    value={annActionUrl}
                    onChange={(e) => setAnnActionUrl(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-2 text-xs text-[#EDEFF4] focus:border-[#D9A9FF] outline-none"
                  />
                </div>

                {/* Componente de Imagen del Anuncio (Archivos, URL, Presets, Clipboard) */}
                <AnnouncementImagePicker
                  selectedImage={annImage}
                  onImageChange={setAnnImage}
                  language={language}
                />

                {/* Important Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-[#0A0A0A] border border-[#262626]">
                  <input
                    type="checkbox"
                    checked={annImportant}
                    onChange={(e) => setAnnImportant(e.target.checked)}
                    className="rounded accent-[#D9A9FF]"
                  />
                  <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-200">
                    Marcar como Destacado / Urgente (Aparecerá resaltado en dorado)
                  </span>
                </label>

                {/* Free Notice */}
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Sin costo alguno: La publicación de anuncios para instructores oficiales es 100% gratuita.</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAnnModal(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono font-bold rounded-xl transition-all uppercase"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#D9A9FF] hover:bg-[#B87CFF] text-black text-xs font-mono font-black rounded-xl shadow-lg transition-all uppercase"
                  >
                    Publicar Anuncio Ahora
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Lightbox para Ampliar Imagen de Anuncio */}
      <AnimatePresence>
        {annLightboxImage && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center"
            >
              <button
                type="button"
                onClick={() => setAnnLightboxImage(null)}
                className="absolute -top-10 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                title="Cerrar vista previa"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={annLightboxImage}
                alt="Imagen del anuncio ampliada"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-white/20 shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Membresía del Instructor */}
      <InstructorMembershipModal
        instructor={selectedInstructorForPlan}
        onClose={() => setSelectedInstructorForPlan(null)}
        language={language}
        onSubscribe={(instructorName) => {
          localStorage.setItem('waackon_assigned_instructor_name', instructorName);
          if (selectedInstructorForPlan?.id) {
            localStorage.setItem('waackon_assigned_instructor_id', selectedInstructorForPlan.id);
          }
          if (onUserChange) {
            onUserChange(prev => ({
              ...prev,
              billingStatus: 'active',
              subscriptionTier: 'instructor_pass',
              points: (prev.points || 0) + 50,
              subscribedInstructorIds: Array.from(new Set([...(prev.subscribedInstructorIds || []), selectedInstructorForPlan?.id || instructorName]))
            }));
          }
        }}
      />

    </div>
  );
}
