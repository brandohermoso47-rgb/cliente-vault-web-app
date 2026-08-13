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
  FileText
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
  onUserChange
}: DashboardViewProps) {
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

  // Daily target practice goal editing state
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editingGoalMinutes, setEditingGoalMinutes] = useState<number>(currentUser.targetMinutes || 30);
  const [goalSavedNotice, setGoalSavedNotice] = useState(false);

  useEffect(() => {
    if (currentUser.targetMinutes) {
      setEditingGoalMinutes(currentUser.targetMinutes);
    }
  }, [currentUser.targetMinutes]);

  const handleSaveGoalMinutes = () => {
    if (editingGoalMinutes > 0 && onUserChange) {
      onUserChange(prev => ({
        ...prev,
        targetMinutes: editingGoalMinutes
      }));
      setGoalSavedNotice(true);
      setTimeout(() => {
        setGoalSavedNotice(false);
        setIsEditingGoal(false);
      }, 1600);
    }
  };

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
    const colors = ['#E9C349', '#9A2B3C', '#ffffff', '#38bdf8', '#a855f7', '#34d399', '#f43f5e', '#fbbf24'];
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
    fetch('/api/student/tasks')
      .then(res => {
        if (!res.ok) return null;
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) return null;
        return res.json();
      })
      .then(data => {
        if (data && data.success && Array.isArray(data.tasks)) {
          const myTasks = data.tasks.filter((t: any) => !t.studentUid || t.studentUid === currentUser.id);
          setAssignedTasks(myTasks);
        }
      })
      .catch(err => console.error('Error fetching assigned tasks:', err));
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

  // Hero Banner Default Video State
  const [heroVideoMuted, setHeroVideoMuted] = useState(true);
  const [heroVideoPlaying, setHeroVideoPlaying] = useState(true);
  const [heroVideoFallbackIndex, setHeroVideoFallbackIndex] = useState(0);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);

  const heroVideoSources = [
    '/videos/waack-on-intro.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-party-lights-and-people-dancing-40348-large.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  ];

  const currentHeroVideoSrc = heroVideoSources[heroVideoFallbackIndex % heroVideoSources.length];

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
    drill: { label: 'Drills & Técnica', color: '#E9C349', icon: '⚡' },
    battle: { label: 'Batallas & Freestyle', color: '#9A2B3C', icon: '⚔️' },
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
    <div className="flex-1 min-h-full w-full p-4 md:p-6 space-y-6 bg-[#0A0A0A] text-[#EDEFF4] scanline">
      {/* Banner Hero con video por defecto */}
      <div className="relative w-full h-56 sm:h-64 md:h-80 rounded-3xl overflow-hidden border border-white/15 shadow-2xl mb-4 group bg-black/80">
        {/* Video de fondo por defecto */}
        <video
          ref={heroVideoRef}
          src={currentHeroVideoSrc}
          autoPlay
          muted={heroVideoMuted}
          loop
          playsInline
          onError={handleHeroVideoError}
          className="absolute inset-0 w-full h-full object-cover opacity-85 transition-opacity duration-700 group-hover:opacity-100"
        />

        {/* Capa gradiente oscura y resplandor estilo Waack On */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent pointer-events-none" />

        {/* Contenido principal sobre el video */}
        <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-8">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E9C349]/10 border border-[#E9C349]/30 flex items-center justify-center p-2 backdrop-blur-md shadow-lg">
                <WaackOnLogo className="w-8 h-8 text-[#E9C349]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wider uppercase font-sans flex items-center gap-2">
                  WAACK ON <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E9C349] text-black font-extrabold tracking-normal">INTRO VIDEO</span>
                </h1>
                <p className="text-xs text-[#E9C349] font-mono font-semibold uppercase tracking-widest">
                  Plataforma Oficial de Waacking & Cultura Disco
                </p>
              </div>
            </div>

            {/* Direct Video Control Buttons */}
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-lg">
              <button
                type="button"
                onClick={toggleHeroVideoPlay}
                title={heroVideoPlaying ? "Pausar video" : "Reproducir video"}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer hover:scale-105"
              >
                {heroVideoPlaying ? <Pause className="w-4 h-4 text-[#E9C349]" /> : <Play className="w-4 h-4 text-white fill-white" />}
              </button>

              <button
                type="button"
                onClick={toggleHeroVideoMute}
                title={heroVideoMuted ? "Activar audio" : "Silenciar audio"}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer hover:scale-105"
              >
                {heroVideoMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-[#E9C349]" />}
              </button>
            </div>
          </div>

          <div className="max-w-xl space-y-2 mt-4">
            <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight leading-tight">
              Aprende el arte de la resistencia, el ritmo y la autoexpresión 💃
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Explora tutoriales en alta definición, drilings de aceleración BPM, ebooks teóricos y retroalimentación personalizada por instructores calificados.
            </p>
          </div>
        </div>
      </div>

      {/* UNIFIED GLASSMORPHISM HERO HEADER */}
      <div className="bg-gradient-to-r from-[#130B2E]/90 via-[#1C0D2E]/80 to-[#0A162B]/90 border border-white/20 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] relative overflow-hidden group transition-all duration-500 hover:border-[#E9C349]/40">
        {/* Glow ambient light accents */}
        <div className="absolute -top-28 -right-28 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-400/25 transition-all duration-700" />
        <div className="absolute -bottom-28 -left-28 w-96 h-96 bg-purple-600/25 rounded-full blur-3xl pointer-events-none group-hover:bg-rose-500/25 transition-all duration-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(233,195,73,0.05)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] font-mono font-black text-[#E9C349] bg-black/40 border border-[#E9C349]/50 px-3.5 py-1 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(233,195,73,0.2)] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E9C349] animate-ping" />
                WAACK ON PLATFORM
              </span>
              <span className="text-[10px] font-mono font-black text-cyan-300 bg-cyan-950/40 border border-cyan-400/40 px-3.5 py-1 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                {currentUser.role === 'instructor' ? 'INSTRUCTOR DASHBOARD' : 'STUDENT DASHBOARD'}
              </span>
            </div>

            <div className="flex items-center gap-5 pt-1">
              <div className="shrink-0 transition-transform hover:scale-105 duration-300">
                <WaackOnLogo size="lg" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-wide uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                  {currentUser.role === 'instructor' ? 'Panel de Instructor & Alumnos' : 'Plataforma de Entrenamiento'}
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm font-medium max-w-xl leading-relaxed mt-1">
                  {t.dashboardSubtitle || 'Centro integral de Waacking: Domina tus rolls, estamina y expresión con la metodología oficial de Monroe Dance Group LLC.'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Right User Badge with Glowing Ring */}
          <div className="flex items-center gap-4 bg-black/40 border border-white/20 p-3.5 px-5 rounded-2xl backdrop-blur-xl shadow-2xl shrink-0 group/user hover:border-cyan-400/50 transition-all duration-300">
            <div className="text-right min-w-0">
              <p className="text-sm font-black text-white truncate uppercase tracking-wider group-hover/user:text-cyan-300 transition-colors">{currentUser.name || 'Bailarín'}</p>
              <p className="text-[10px] font-mono text-cyan-300 font-black uppercase tracking-widest flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                {currentUser.role === 'instructor' ? 'Panel de Instructor' : (currentUser.level ? `Nivel ${currentUser.level} Waacker` : 'Estudiante Avanzado')}
              </p>
            </div>
            <div className="relative w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_25px_rgba(168,85,247,0.6)] shrink-0 group-hover/user:scale-105 transition-transform duration-300">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-full h-full rounded-full object-cover bg-black"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-black shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            </div>
          </div>
        </div>

        {/* Action Bar inside Hero */}
        <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-rose-500/20 border border-rose-500/50 rounded-xl flex items-center gap-2.5 text-white font-mono text-xs shadow-[0_0_15px_rgba(244,63,94,0.2)]">
              <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
              <span className="font-extrabold uppercase tracking-wider">PRÓXIMA CLASE EN VIVO: HOY 19:30</span>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab('live')}
            className="px-7 py-3 bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-white text-xs font-black rounded-xl shadow-[0_0_25px_rgba(244,63,94,0.4)] hover:shadow-[0_0_35px_rgba(244,63,94,0.6)] transition-all uppercase tracking-wider flex items-center gap-2.5 cursor-pointer border border-white/30"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Unirse a Clase en Vivo</span>
          </motion.button>
        </div>
      </div>

      {/* SECCIÓN GAMIFICACIÓN: PUNTOS, NIVEL Y ANIMACIÓN CONFETI / BRILLO */}
      <motion.div
        animate={isPointsGlowing ? {
          scale: [1, 1.025, 1.01, 1],
          borderColor: ['#262626', '#E9C349', '#9A2B3C', '#262626'],
          boxShadow: [
            '0 0 0px rgba(233, 195, 73, 0)',
            '0 0 30px rgba(233, 195, 73, 0.65)',
            '0 0 45px rgba(154, 43, 60, 0.75)',
            '0 0 0px rgba(233, 195, 73, 0)'
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
              className="absolute -top-6 left-1/2 -translate-x-1/2 px-5 py-2 bg-gradient-to-r from-[#E9C349] via-[#f59e0b] to-[#9A2B3C] text-black font-mono font-black text-xs md:text-sm rounded-full shadow-[0_0_35px_rgba(233,195,73,0.85)] border-2 border-white flex items-center gap-2 z-50 uppercase tracking-wider whitespace-nowrap"
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
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#E9C349] shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#9A2B3C] text-[#E9C349] rounded-full border border-[#E9C349] flex items-center justify-center text-[10px] font-black shadow">
                ⚡
              </span>
            </motion.div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#E9C349] bg-[#E9C349]/10 border border-[#E9C349]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-[#E9C349]" /> MI ESTADO ACADÉMICO
                </span>
                {isPointsGlowing && (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[10px] font-mono font-black text-white bg-[#9A2B3C] px-2 py-0.5 rounded-full animate-bounce"
                  >
                    ¡PUNTOS ACTUALIZADOS!
                  </motion.span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
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
                <div className="px-4 py-3 bg-[#1c1a12] border border-[#E9C349]/50 rounded-2xl min-w-[140px] shadow-lg">
                  <span className="text-[10px] font-mono font-bold text-[#E9C349] uppercase block tracking-wider">
                    Alumnos Cátedra
                  </span>
                  <span className="text-xl font-black font-mono text-white">
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
                  <span className="text-xl font-bold font-mono text-[#E9C349]">
                    {currentUser.monthlyPrice || '$35 USD/mes'}
                  </span>
                </div>

                {/* Instructor Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAnnModal(true)}
                    className="px-3.5 py-2.5 bg-[#E9C349] hover:bg-[#d8b33c] text-black font-mono text-[11px] font-black rounded-xl border border-[#E9C349] transition-all flex items-center justify-center gap-1.5 shadow cursor-pointer uppercase"
                  >
                    <Megaphone className="w-3.5 h-3.5 fill-black" />
                    <span>Publicar Anuncio</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('instructor')}
                    className="px-3.5 py-2.5 bg-[#9A2B3C] hover:bg-[#81262c] text-white font-mono text-[11px] font-bold rounded-xl border border-[#9A2B3C] transition-all flex items-center justify-center gap-1.5 shadow cursor-pointer uppercase"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#E9C349]" />
                    <span>Panel Instructor</span>
                  </motion.button>
                </div>
              </>
            ) : (currentUser.role === 'studio' || currentUser.role === 'academy') ? (
              <>
                {/* Studio Stats 1: Instructors in Staff */}
                <div className="px-4 py-3 bg-[#1c1a12] border border-[#E9C349]/50 rounded-2xl min-w-[140px] shadow-lg">
                  <span className="text-[10px] font-mono font-bold text-[#E9C349] uppercase block tracking-wider">
                    Staff Instructores
                  </span>
                  <span className="text-xl font-black font-mono text-white">
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
                  <span className="text-xl font-bold font-mono text-[#E9C349]">
                    $4,250 USD
                  </span>
                </div>

                {/* Studio Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('studio')}
                    className="px-3.5 py-2.5 bg-[#E9C349] hover:bg-[#d8b33c] text-black font-mono text-[11px] font-black rounded-xl border border-[#E9C349] transition-all flex items-center justify-center gap-1.5 shadow cursor-pointer uppercase"
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
                    borderColor: ['#E9C349', '#ffffff', '#E9C349']
                  } : {}}
                  transition={{ duration: 0.6 }}
                  className="px-5 py-3 bg-[#1c1a12] border-2 border-[#E9C349] rounded-2xl flex items-center gap-3 relative overflow-hidden shadow-xl"
                >
                  <div className="p-2 bg-[#E9C349] text-black rounded-xl font-bold">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#E9C349] uppercase block tracking-wider">
                      Puntos Totales
                    </span>
                    <span className="text-2xl font-black font-mono text-[#E9C349]">
                      {currentUser.points || 0} <span className="text-xs font-bold text-white">PTS</span>
                    </span>
                  </div>
                </motion.div>

                {/* Level 1 Progress Badge */}
                <div className="px-4 py-3 bg-[#0A0A0A] border border-[#262626] rounded-2xl min-w-[140px]">
                  <div className="flex justify-between items-center text-[10px] font-mono text-[#8A8A8A] mb-1">
                    <span>NIVEL 1</span>
                    <span className="text-[#E9C349] font-bold">{l1Percent}%</span>
                  </div>
                  <div className="w-full bg-[#1c1b1b] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#E9C349] h-full transition-all duration-500" style={{ width: `${l1Percent}%` }} />
                  </div>
                  <span className="text-[9px] font-mono text-[#8A8A8A] mt-1 block">
                    {l1CompletedCount}/{level1Lessons.length} Clases
                  </span>
                </div>

                {/* Level 2 Progress Badge */}
                <div className="px-4 py-3 bg-[#0A0A0A] border border-[#262626] rounded-2xl min-w-[140px]">
                  <div className="flex justify-between items-center text-[10px] font-mono text-[#8A8A8A] mb-1">
                    <span>NIVEL 2</span>
                    <span className="text-[#9A2B3C] font-bold">{l2Percent}%</span>
                  </div>
                  <div className="w-full bg-[#1c1b1b] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#9A2B3C] h-full transition-all duration-500" style={{ width: `${l2Percent}%` }} />
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
                    className="px-3 py-2 bg-[#E9C349] hover:bg-[#d8b33c] text-black font-mono text-[11px] font-black rounded-xl border border-[#E9C349] transition-all flex items-center justify-center gap-1.5 shadow cursor-pointer"
                    title="Gana +50 Puntos y dispara la animación de confeti"
                  >
                    <Zap className="w-3.5 h-3.5 fill-black" />
                    <span>+50 Puntos</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSimulateLevelCompletion}
                    className="px-3 py-2 bg-[#9A2B3C] hover:bg-[#81262c] text-white font-mono text-[11px] font-bold rounded-xl border border-[#9A2B3C] transition-all flex items-center justify-center gap-1.5 shadow cursor-pointer"
                    title="Simula completar un nivel con confeti"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#E9C349]" />
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

      {/* MI BIBLIOTECA DE ENTRENAMIENTO MULTIFUENTE (SoundCloud, Spotify, Google) */}
      <StudentTrainingLibrary currentUser={currentUser} onUserChange={onUserChange} />

      {/* REPRODUCTOR UNIFICADO MULTIFUENTE */}
      <MultiSourceMusicEngine
        initialUrl={currentUser.soundcloudProfileUrl || "https://soundcloud.com/mario-monroe-717013866/sets/waacking-training-vibes"}
        isInstructor={false}
        onSourceChange={(url) => {
          if (onUserChange) {
            onUserChange({
              ...currentUser,
              soundcloudProfileUrl: url
            });
          }
        }}
      />

      {instructorTaskRec && (
        <div className="bg-gradient-to-r from-[#9A2B3C]/30 via-[#121212] to-[#121212] border-2 border-[#E9C349] rounded-2xl p-6 relative overflow-hidden shadow-2xl animate-pulse">
          <div className="absolute right-0 top-0 w-64 h-64 bg-[#E9C349]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-black text-black bg-[#E9C349] px-3 py-1 rounded-full uppercase tracking-wider">
                🎯 Tarea Asignada por el Instructor
              </span>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
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
              className="px-6 py-3 bg-[#E9C349] hover:bg-[#d8b33c] text-black text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-2 uppercase tracking-wider shrink-0 hover:scale-105 cursor-pointer"
            >
              <span>Ver Tareas y Completar</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </motion.button>
          </div>
        </div>
      )}

      {recommendations && recommendations.length > 0 && (
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-mono font-bold tracking-wider text-white uppercase flex items-center gap-2">
                <span>🎯 Recomendaciones Inteligentes (Motor Determinista)</span>
              </h3>
              <p className="text-xs text-[#8A8A8A]">Sugerencias basadas en tu historial real de práctica, gaps de categoría y progresión de BPM.</p>
            </div>
            <span className="text-xs font-mono text-[#E9C349] bg-[#E9C349]/10 px-3 py-1 rounded-full border border-[#E9C349]/30">
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
                      ? 'border-2 border-[#E9C349] bg-gradient-to-br from-[#1c1a12] to-[#121212]'
                      : 'border border-[#262626] hover:border-[#E9C349]/50'
                  }`}
                >
                  <div className="absolute right-0 top-0 w-32 h-32 bg-[#E9C349]/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase flex items-center gap-1 ${badgeInfo.color}`}>
                        {item.type === 'instructor_task' && <span>⭐</span>}
                        {badgeInfo.label}
                      </span>
                      {item.suggestedBpm && (
                        <span className="text-[10px] font-mono text-[#E9C349] font-bold">
                          🎵 {item.suggestedBpm} BPM
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-[#E9C349] transition-colors leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-[#E9C349] group-hover:translate-x-1 transition-transform">
                    <span>{item.type === 'instructor_task' ? 'Resolver Tarea' : 'Acceder ahora'}</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECCIÓN: ANUNCIOS DE INSTRUCTORES */}
      <div className="bg-[#121212] border border-[#262626] rounded-2xl p-5 md:p-6 relative overflow-hidden shadow-2xl space-y-5">
        {/* Glow bg accent */}
        <div className="absolute left-0 top-0 w-80 h-80 bg-[#9A2B3C]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-[#9A2B3C]/20 border border-[#9A2B3C]/40 rounded-xl text-[#E9C349]">
                <Megaphone className="w-5 h-5" />
              </span>
              <h3 className="text-sm md:text-base font-mono font-bold tracking-widest text-[#EDEFF4] uppercase flex flex-wrap items-center gap-2">
                <span>ANUNCIOS</span>
                <span className="text-[9px] font-mono font-bold text-[#E9C349] bg-[#E9C349]/10 border border-[#E9C349]/30 px-2 py-0.5 rounded-full uppercase">
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
                className="px-4 py-2 bg-[#E9C349] hover:bg-[#d8b33c] text-black text-xs font-black rounded-xl border border-transparent shadow-lg transition-all flex items-center gap-2 uppercase tracking-wide hover:scale-105"
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
                    : 'bg-[#181818] text-[#8A8A8A] hover:text-white border-white/5 hover:border-white/15'
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
                    className="mt-2 px-4 py-1.5 bg-[#E9C349]/10 text-[#E9C349] border border-[#E9C349]/30 rounded-xl text-xs font-bold hover:bg-[#E9C349] hover:text-black transition-all"
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
                      return { label: '🏆 Competencia', bg: 'bg-[#E9C349]/20 text-[#E9C349] border-[#E9C349]/40' };
                    case 'sesiones':
                      return { label: '⚡ Sesión / Jam', bg: 'bg-[#9A2B3C]/20 text-[#EDEFF4] border-[#9A2B3C]/40' };
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
                    className={`bg-[#181818]/90 rounded-2xl p-5 border transition-all flex flex-col justify-between relative group ${
                      item.important
                        ? 'border-[#E9C349]/60 bg-gradient-to-b from-[#1e1b12] to-[#121212] shadow-[0_4px_20px_rgba(233,195,73,0.08)]'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    {item.important && (
                      <div className="absolute -top-2.5 right-4 bg-[#E9C349] text-black text-[8px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
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
                            className="w-8 h-8 rounded-full object-cover border border-[#E9C349]/50 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate leading-tight">{item.author}</h4>
                            <span className="text-[8px] font-mono text-[#E9C349] uppercase font-bold block">
                              Instructor Oficial
                            </span>
                          </div>
                        </div>

                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border shrink-0 ${catBadge.bg}`}>
                          {catBadge.label}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-[#EDEFF4] group-hover:text-[#E9C349] transition-colors leading-snug">
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
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-[#E9C349] font-mono text-[10px] font-bold">
                            <ZoomIn className="w-4 h-4" />
                            <span>Ampliar Imagen del Anuncio</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-[#8A8A8A] font-mono">
                      <span>{item.date}</span>

                      <div className="flex items-center gap-2">
                        {item.actionUrl && (
                          <a
                            href={item.actionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-[#E9C349]/10 hover:bg-[#E9C349] text-[#E9C349] hover:text-black border border-[#E9C349]/30 font-bold rounded-lg transition-all flex items-center gap-1 text-[9px]"
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

      {/* SECCIÓN: DIRECTORIO GLOBAL DE INSTRUCTORES WAACK ON */}
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

        // Sort instructors: featured first
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
            {/* Glow accent */}
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-[#E9C349]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[#E9C349] text-base">👑</span>
                  <h3 className="text-sm font-mono font-bold tracking-widest text-[#E9C349] uppercase">
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
                {/* Search/Filter specialty input */}
                <input 
                  type="text" 
                  placeholder={language === 'es' ? 'Filtrar por especialidad o país...' : 'Filter by specialty or country...'}
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                  className="bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-1.5 text-xs text-[#EDEFF4] focus:border-[#E9C349]/50 outline-none w-44 md:w-56 font-medium transition-all"
                />

                {/* Edit Instructor Platform & Price Button */}
                <button
                  type="button"
                  onClick={() => setShowInstructorPlatformEditor(!showInstructorPlatformEditor)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-[#E9C349] via-[#f5d77f] to-[#E9C349] hover:opacity-95 text-black text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95"
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
                    className="px-4 py-1.5 bg-[#E9C349] hover:bg-[#d8b33c] text-black text-xs font-black rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{currentUser.isFeaturedInstructor ? (language === 'es' ? 'Destacado Activo' : 'Featured Active') : (language === 'es' ? '¡Aparecer Arriba!' : 'Appear at Top!')}</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setActiveTab('profile');
                    }}
                    className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-mono font-bold rounded-xl transition-all uppercase"
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
                className="mb-8 bg-[#0D0D11] border border-[#E9C349]/40 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden"
              >
                {/* Notification Banner */}
                {platformSaveNotice && (
                  <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      {platformSaveNotice}
                    </span>
                    <button onClick={() => setPlatformSaveNotice(null)} className="text-white hover:opacity-75">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black uppercase bg-[#E9C349]/20 text-[#E9C349] border border-[#E9C349]/30">
                        CONSOLA DE INSTRUCTOR
                      </span>
                      <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
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
                    className="px-3.5 py-2 bg-[#E9C349] hover:bg-[#d8b33c] text-black text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shrink-0 active:scale-95 shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{language === 'es' ? 'Ir a Cátedra Completa' : 'Go to Full Platform'}</span>
                  </button>
                </div>

                {/* Sub-tabs */}
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
                          : 'bg-white/5 text-[#8A8A8A] hover:bg-white/10 hover:text-white border border-white/5'
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
                      <label className="text-xs font-mono font-bold text-white uppercase block">
                        {language === 'es' ? 'Tarifa Mensual Personalizada por Alumno ($ USD/mes):' : 'Custom Monthly Student Fee ($ USD/month):'}
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <input
                          type="text"
                          value={editPriceInput}
                          onChange={(e) => setEditPriceInput(e.target.value)}
                          placeholder="$35.00 USD/mes"
                          className="bg-[#0A0A0A] border border-white/15 rounded-xl px-4 py-2 text-xs font-mono font-bold text-white outline-none focus:border-[#E9C349] flex-1"
                        />
                        {/* Quick presets */}
                        <div className="flex items-center gap-1.5">
                          {['$25 USD/mes', '$35 USD/mes', '$45 USD/mes', '$55 USD/mes'].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setEditPriceInput(preset)}
                              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                                editPriceInput === preset
                                  ? 'bg-[#E9C349]/20 text-[#E9C349] border-[#E9C349]'
                                  : 'bg-white/5 text-[#8A8A8A] border-white/5 hover:text-white'
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
                          className="px-5 py-2 bg-[#E9C349] hover:bg-[#d8b33c] text-black text-xs font-black rounded-xl uppercase tracking-wider transition-all shrink-0 active:scale-95"
                        >
                          {language === 'es' ? 'Guardar Precio' : 'Save Price'}
                        </button>
                      </div>
                      <p className="text-[10px] text-[#8A8A8A] font-semibold">
                        {language === 'es'
                          ? 'Este precio se mostrará públicamente en tu tarjeta del Directorio de Profesores y en la ventana de suscripción.'
                          : 'This price will be displayed publicly on your card in the Instructors Directory and subscription modal.'}
                      </p>
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
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#E9C349] font-medium"
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
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#E9C349] font-medium"
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
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#E9C349] font-medium"
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
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#E9C349] font-medium"
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
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#E9C349] font-medium resize-none"
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
                        className="px-6 py-2 bg-[#E9C349] hover:bg-[#d8b33c] text-black text-xs font-black rounded-xl uppercase tracking-wider transition-all shrink-0 active:scale-95"
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
                        <h5 className="text-xs font-bold text-white uppercase">
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
                            : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {currentUser.isFeaturedInstructor ? '⭐ DESTACADO ACTIVO' : 'ACTIVAR DESTACADO'}
                      </button>
                    </div>

                    <div className="bg-[#141419] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <h5 className="text-xs font-bold text-white uppercase">
                          {language === 'es' ? 'Estado de Cátedra & Admisión de Alumnos' : 'Classroom Status & Student Admissions'}
                        </h5>
                        <p className="text-[11px] text-[#8A8A8A] font-semibold mt-0.5">
                          {language === 'es' ? 'Plataforma activa y recibiendo alumnos inscritos.' : 'Platform active and accepting enrolled students.'}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold rounded-lg uppercase">
                        🟢 EN LÍNEA & RECIBIENDO ALUMNOS
                      </span>
                    </div>
                  </div>
                )}

                {/* SUB-TAB 4: EDIT CONTENT */}
                {editPlatformSubTab === 'content' && (
                  <div className="space-y-4">
                    <div className="bg-[#141419] border border-white/10 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                          <Video className="w-4 h-4 text-[#E9C349]" />
                          {language === 'es' ? 'Publicar Nueva Clase / Módulo en tu Plataforma' : 'Publish New Class / Module on Your Platform'}
                        </h5>
                        <span className="text-[10px] font-mono text-[#E9C349] font-bold">HD VIDEO / STREAM</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder={language === 'es' ? 'Título de la Clase (ej: Wrist Rolls Avanzados)' : 'Class Title'}
                          className="bg-[#0A0A0A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#E9C349]"
                        />
                        <input
                          type="text"
                          placeholder={language === 'es' ? 'URL del Video (YouTube / Vimeo / MP4)' : 'Video URL'}
                          className="bg-[#0A0A0A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#E9C349]"
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
                          className="px-4 py-2 bg-[#E9C349] text-black font-black text-xs rounded-xl hover:bg-[#d8b33c] transition-all"
                        >
                          {language === 'es' ? 'Publicar Clase' : 'Publish Class'}
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <h6 className="text-xs font-bold text-white uppercase">{language === 'es' ? '¿Quieres editar tus 4 semanas, Ebooks y Metas?' : 'Want to edit your 4 weeks, Ebooks and Goals?'}</h6>
                        <p className="text-[11px] text-slate-300 font-medium">{language === 'es' ? 'Accede al editor maestro del Panel de Instructor.' : 'Access the master editor in the Instructor Panel.'}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (setActiveTab) setActiveTab('instructor');
                        }}
                        className="px-4 py-2 bg-white text-black font-extrabold text-xs rounded-xl hover:bg-slate-200 transition-all shrink-0 uppercase"
                      >
                        {language === 'es' ? 'Abrir Panel de Instructor' : 'Open Instructor Panel'}
                      </button>
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
                  className={`bg-[#181818]/80 rounded-xl p-4 border transition-all flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:scale-[1.015] ${
                    inst.isFeaturedInstructor 
                      ? 'border-[#E9C349]/40 bg-gradient-to-b from-[#1c1a15] to-[#121212] shadow-[0_4px_20px_rgba(233,195,73,0.05)] hover:border-[#E9C349]/70' 
                      : 'border-white/5 hover:border-white/25'
                  }`}
                  title={language === 'es' ? `Haz clic para ver el Plan de Membresía de ${inst.name}` : `Click to view Membership Plan for ${inst.name}`}
                >
                  {/* Featured Badge */}
                  {inst.isFeaturedInstructor && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#E9C349]/10 text-[#E9C349] border border-[#E9C349]/30 text-[8px] font-mono font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
                      <Sparkles className="w-2.5 h-2.5 text-[#E9C349]" />
                      <span>{language === 'es' ? 'DESTACADO' : 'FEATURED'}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Avatar & Country */}
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img 
                          src={inst.avatar} 
                          alt={inst.name} 
                          className={`w-10 h-10 rounded-full object-cover border-2 ${inst.isFeaturedInstructor ? 'border-[#E9C349]' : 'border-[#262626]'}`}
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-black rounded-full flex items-center justify-center text-[9px]">
                          {(inst.country || 'GLOBAL 🌐').split(' ')[1] || '🌐'}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-white truncate leading-tight group-hover:text-[#E9C349] transition-colors">
                            {inst.name}
                          </h4>
                        </div>
                        <div className="flex items-center justify-between gap-1 mt-0.5">
                          <p className="text-[9px] text-[#8A8A8A] font-mono uppercase">{(inst.country || 'GLOBAL').split(' ')[0]}</p>
                          <span className="text-[9px] font-mono font-black text-[#E9C349] bg-[#E9C349]/10 border border-[#E9C349]/25 px-1.5 py-0.2 rounded shrink-0">
                            {inst.monthlyPrice || '$35 USD/mes'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Specialties */}
                    <div className="space-y-1">
                      <p className="text-[8px] text-[#8A8A8A] font-mono uppercase font-bold tracking-wider">
                        {language === 'es' ? 'ESPECIALIDADES' : 'SPECIALTIES'}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {(inst.specialties || []).map((spec, sidx) => (
                          <span 
                            key={sidx}
                            className="text-[9px] font-bold text-[#C2C7D1] bg-white/5 border border-white/5 px-1.5 py-0.5 rounded-md whitespace-nowrap"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer info: Rating, Social & Plan Button */}
                  <div className="space-y-2 mt-4 pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 font-mono text-[9px] text-white">
                        <span className="text-[#E9C349]">★</span>
                        <span>{inst.rating.toFixed(1)}</span>
                        <span className="text-[#8A8A8A]">({inst.students})</span>
                      </div>
                      <a 
                        href={`https://instagram.com/${inst.instagram.replace('@', '')}`}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="text-[9px] text-[#8A8A8A] hover:text-[#E9C349] font-mono transition-colors"
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
                      className="w-full py-1.5 px-2 bg-[#E9C349]/10 group-hover:bg-[#E9C349] text-[#E9C349] group-hover:text-black border border-[#E9C349]/30 font-mono text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Zap className="w-3 h-3 shrink-0" />
                      <span>{language === 'es' ? 'Ver Plan Mensual' : 'View Monthly Plan'}</span>
                      <ArrowRight className="w-3 h-3 shrink-0" />
                    </button>
                  </div>
                </div>
              ))}
              
              {filteredInstructors.length === 0 && (
                <div className="col-span-full py-8 text-center bg-[#0A0A0A] border border-dashed border-[#262626] rounded-xl text-xs text-[#8A8A8A]">
                  {language === 'es' ? 'No se encontraron instructores con esa especialidad.' : 'No instructors found with that specialty.'}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Main Responsive Grid mirroring the reference layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Bento Zone (ZONA INTERACTIVA & COMUNIDAD) -> 8 cols */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Section A: ZONA INTERACTIVA */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pl-1">
              <span className="text-[#E9C349] text-lg">⚡</span>
              <h3 className="text-xs font-mono font-bold tracking-widest text-[#E9C349] uppercase">ZONA INTERACTIVA</h3>
            </div>
            
            {/* 3-Column Bento Grid matching layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card 1: LABORATORIO DE FREESTYLE */}
              <div className="bg-[#121212] border border-[#262626] rounded-2xl p-5 flex flex-col justify-between h-auto md:h-[310px] min-h-[310px] relative overflow-hidden shadow-lg group hover:border-[#E9C349]/30 transition-all">
                <div className="absolute right-[-10px] top-[-10px] w-20 h-20 bg-[#E9C349]/5 rounded-full blur-xl pointer-events-none" />
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">🔮</span>
                    <h4 className="text-xs font-mono font-bold tracking-tight text-[#EDEFF4] uppercase">LAB DE FREESTYLE</h4>
                  </div>
                  <p className="text-[10px] text-[#8A8A8A] font-semibold leading-relaxed">
                    Genera un reto aleatorio de rolls, velocidad u expresión corporal con tempo (BPM) recomendado para entrenar al instante.
                  </p>
                  
                  {/* Generated box with gold glow */}
                  <div className="mt-3 p-3 bg-[#0A0A0A] rounded-xl border border-[#E9C349]/10 text-center flex items-center justify-center min-h-[110px]">
                    <p className="text-[11px] text-[#E9C349] font-bold font-mono whitespace-pre-line leading-relaxed uppercase">
                      {randomPrompt}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGeneratePrompt}
                  disabled={isGenerating}
                  className="w-full mt-3 py-2 bg-[#9A2B3C] hover:bg-[#81262c] text-white text-xs font-bold rounded-xl border border-transparent transition-all uppercase tracking-wider"
                >
                  {isGenerating ? 'Generando...' : 'GENERAR RETO'}
                </motion.button>
              </div>

              {/* Card 2: HERRAMIENTAS DE PRÁCTICA (Includes Virtual Mirror) */}
              <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 flex flex-col justify-between h-auto md:h-[310px] min-h-[310px] shadow-lg relative overflow-hidden hover:border-[#9A2B3C]/20 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🛠️</span>
                      <h4 className="text-xs font-mono font-bold tracking-tight text-[#EDEFF4] uppercase">HERRAMIENTAS</h4>
                    </div>
                    <span className="text-[9px] font-mono text-[#E9C349] bg-[#E9C349]/10 px-2 py-0.5 rounded-lg border border-[#E9C349]/20 font-bold">
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
                        <div className="absolute top-1.5 left-1.5 text-[8px] bg-[#9A2B3C] text-white font-mono font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          Espejo ON
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 bg-[#0A0A0A] border border-[#262626] rounded-xl text-center space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <div className="min-w-0 text-left">
                            <p className="text-[10px] font-bold text-[#E9C349] truncate uppercase">{activeTrack.title}</p>
                            <p className="text-[9px] text-[#8A8A8A] font-bold truncate">{activeTrack.artist}</p>
                          </div>
                          <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-7 h-7 rounded-full bg-[#E9C349] text-black flex items-center justify-center hover:scale-105 transition-transform"
                          >
                            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-black ml-0.5" />}
                          </button>
                        </div>
                        {/* Progress */}
                        <div className="w-full bg-[#1c1b1b] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#E9C349] h-full" style={{ width: `${audioProgress}%` }} />
                        </div>
                      </div>
                    )}

                    <button
                      onClick={toggleVirtualMirror}
                      className={`w-full py-1.5 border border-[#262626] rounded-xl text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 transition-all ${
                        isMirrorOn 
                          ? 'bg-[#9A2B3C]/20 border-[#9A2B3C] text-white shadow' 
                          : 'bg-[#1c1b1b] hover:bg-[#262626] text-[#EDEFF4] border-[#262626]'
                      }`}
                    >
                      {isMirrorOn ? <CameraOff className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
                      <span>{isMirrorOn ? 'Apagar Espejo' : 'Activar Espejo'}</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('entrenamiento')}
                  className="w-full py-1 text-center text-[9px] font-bold text-[#8A8A8A] border border-[#262626] bg-[#0A0A0A] rounded-lg hover:text-white transition-colors"
                >
                  Ver playlists completas &rarr;
                </button>
              </div>

              {/* Card 3: FEEDBACK Y RETOS */}
              <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 flex flex-col justify-between h-auto md:h-[310px] min-h-[310px] shadow-lg hover:border-[#E9C349]/15 transition-all">
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
                    className="w-full py-1.5 bg-[#9A2B3C] hover:bg-[#81262c] text-white text-[10px] font-bold rounded-xl transition-all uppercase flex items-center justify-center gap-1.5 border border-[#E9C349]/30 shadow"
                  >
                    <Plus className="w-3 h-3 text-[#E9C349]" />
                    <span>SUBIR FEEDBACK PARA ALUMNOS</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('entrenamiento')}
                    className="w-full py-1.5 bg-[#1c1b1b] hover:bg-[#262626] text-[#E9C349] text-[10px] font-bold font-mono rounded-xl transition-all uppercase flex items-center justify-center gap-1.5 border border-[#E9C349]/20"
                  >
                    <Sparkles className="w-3 h-3 text-[#E9C349]" />
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
                <span className="text-[9px] font-mono font-bold text-[#E9C349] bg-[#E9C349]/10 border border-[#E9C349]/30 px-2 py-0.5 rounded uppercase">
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
                  className="px-3.5 py-2.5 bg-[#E9C349] hover:bg-[#d8b33c] text-black text-xs font-black rounded-xl border border-[#E9C349] transition-all uppercase flex items-center gap-1.5 cursor-pointer shadow-md"
                  title="Descargar historial semanal de práctica en formato JSON"
                >
                  <Download className="w-4 h-4 fill-black" />
                  <span>Exportar JSON</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowJsonExportModal(!showJsonExportModal)}
                  className="px-3 py-2.5 bg-[#1c1b1b] hover:bg-[#262626] text-cyan-400 text-xs font-bold rounded-xl border border-cyan-500/30 transition-all uppercase flex items-center gap-1.5 cursor-pointer"
                  title="Vista previa del JSON de la semana"
                >
                  <FileJson className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline">Vista Previa</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditingGoal(!isEditingGoal)}
                  className="px-3.5 py-2.5 bg-[#1c1b1b] hover:bg-[#262626] text-[#E9C349] text-xs font-bold rounded-xl border border-[#E9C349]/30 transition-all uppercase flex items-center gap-1.5 cursor-pointer"
                  title="Editar meta diaria de entrenamiento"
                >
                  <Target className="w-4 h-4 text-[#E9C349]" />
                  <span>{isEditingGoal ? 'Cerrar Meta' : `Meta (${currentUser.targetMinutes || 30}m)`}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowLogForm(!showLogForm)}
                  className="px-4 py-2.5 bg-[#1c1b1b] hover:bg-[#262626] text-[#EDEFF4] text-xs font-bold rounded-xl border border-[#262626] transition-all uppercase flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#E9C349]" />
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
                  className="overflow-hidden border-2 border-cyan-500/40 rounded-2xl bg-[#0B0F19] p-4 space-y-3 shadow-2xl relative"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        <FileJson className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
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
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Summary metrics for export */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="bg-[#121826] p-2.5 rounded-xl border border-white/5">
                      <span className="text-[9px] text-slate-400 block uppercase">Sesiones en la Semana:</span>
                      <span className="font-bold text-white text-sm">
                        {((practiceLogs || []).filter(l => {
                          const cutoff = new Date();
                          cutoff.setDate(cutoff.getDate() - 7);
                          return l.date >= cutoff.toISOString().split('T')[0];
                        })).length} sesiones
                      </span>
                    </div>
                    <div className="bg-[#121826] p-2.5 rounded-xl border border-white/5">
                      <span className="text-[9px] text-slate-400 block uppercase">Total Horas/Minutos:</span>
                      <span className="font-bold text-cyan-400 text-sm">
                        {((practiceLogs || []).filter(l => {
                          const cutoff = new Date();
                          cutoff.setDate(cutoff.getDate() - 7);
                          return l.date >= cutoff.toISOString().split('T')[0];
                        })).reduce((a, l) => a + (l.minutes || 0), 0)} min
                      </span>
                    </div>
                    <div className="bg-[#121826] p-2.5 rounded-xl border border-white/5">
                      <span className="text-[9px] text-slate-400 block uppercase">Alumno / Usuario:</span>
                      <span className="font-bold text-white text-xs truncate block">
                        {currentUser.name || 'Alumno'}
                      </span>
                    </div>
                    <div className="bg-[#121826] p-2.5 rounded-xl border border-white/5">
                      <span className="text-[9px] text-slate-400 block uppercase">Formato de Salida:</span>
                      <span className="font-bold text-[#E9C349] text-xs block">.json (Standard)</span>
                    </div>
                  </div>

                  {/* Code preview block */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
                      <span>VISTA PREVIA DEL ESTRUCTURA JSON:</span>
                      {copiedJsonNotice && <span className="text-emerald-400 font-bold">✓ Copiado al portapapeles</span>}
                    </div>
                    <pre className="bg-[#05070D] border border-white/10 rounded-xl p-3 text-[10px] font-mono text-cyan-300/90 overflow-x-auto max-h-48 leading-tight">
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
                        className="flex-1 sm:flex-none px-3.5 py-2 bg-[#121826] hover:bg-[#1a2336] text-slate-200 text-xs font-bold rounded-xl border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
                        className="flex-1 sm:flex-none px-4 py-2 bg-[#E9C349] hover:bg-[#d8b33c] text-black text-xs font-black rounded-xl shadow-lg transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-4 h-4 fill-black" />
                        <span>Descargar JSON (.json)</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Daily Practice Target Goal Form */}
            <AnimatePresence>
              {isEditingGoal && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border border-[#E9C349]/40 rounded-2xl bg-[#0F0D15] p-4 space-y-3 shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#E9C349]/20 text-[#E9C349] border border-[#E9C349]/30">
                        <Target className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                          🎯 AJUSTAR META DIARIA DE ENTRENAMIENTO (MINUTOS)
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          Se sincronizará en Firestore y actualizará dinámicamente la barra de progreso del encabezado.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsEditingGoal(false)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                    {/* Minutes Input */}
                    <div className="flex-1 min-w-[160px]">
                      <label className="text-[10px] font-mono font-bold text-slate-300 block mb-1">
                        MINUTOS OBJETIVO POR DÍA:
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="number"
                          min="5"
                          max="300"
                          step="5"
                          value={editingGoalMinutes}
                          onChange={(e) => setEditingGoalMinutes(Math.max(5, Math.min(300, parseInt(e.target.value) || 0)))}
                          className="w-full text-sm font-bold bg-[#141220] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#E9C349]"
                        />
                        <span className="absolute right-3 text-xs font-mono font-bold text-slate-400">min/día</span>
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex-1">
                      <label className="text-[10px] font-mono font-bold text-slate-300 block mb-1">
                        SELECCIÓN RÁPIDA:
                      </label>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[15, 30, 45, 60, 90, 120].map((mins) => (
                          <button
                            key={`preset-${mins}`}
                            type="button"
                            onClick={() => setEditingGoalMinutes(mins)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                              editingGoalMinutes === mins
                                ? 'bg-[#E9C349] text-black border-[#E9C349] shadow-md scale-105'
                                : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/30'
                            }`}
                          >
                            {mins}m
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="sm:self-end pt-2 sm:pt-0">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleSaveGoalMinutes}
                        className="w-full sm:w-auto px-5 py-2.5 bg-[#E9C349] hover:bg-[#d8b33c] text-black text-xs font-black rounded-xl shadow-lg uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Guardar Meta</span>
                      </motion.button>
                    </div>
                  </div>

                  {goalSavedNotice && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>✓ Meta diaria guardada en Firestore ({currentUser.targetMinutes} min). ¡Barra de progreso del header actualizada!</span>
                    </motion.div>
                  )}
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
                  <h4 className="text-xs font-mono font-bold text-[#E9C349] uppercase">
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
                      className="px-4 py-2 bg-[#9A2B3C] text-white text-xs font-bold rounded-xl border border-transparent transition-all uppercase cursor-pointer"
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
                  <span className="text-xl font-bold text-[#EDEFF4]">48.5 <span className="text-xs font-medium text-[#E9C349]">min/alumno</span></span>
                </div>
                <div className="p-3 bg-[#0A0A0A] border border-[#262626] rounded-xl text-center sm:text-left">
                  <span className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase block">Tasa de Feedback Completado</span>
                  <span className="text-xl font-bold text-[#E9C349]">92.4% <span className="text-xs font-medium text-emerald-400">✓ 385 rev.</span></span>
                </div>
                <div className="p-3 bg-[#0A0A0A] border border-[#262626] rounded-xl text-center sm:text-left">
                  <span className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase block">Sesiones Registradas</span>
                  <span className="text-xl font-bold text-[#EDEFF4]">1,420 <span className="text-xs font-medium text-slate-400">sesiones</span></span>
                </div>
                <div className="p-3 bg-[#0A0A0A] border border-[#262626] rounded-xl text-center sm:text-left">
                  <span className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase block">Alumnos Activos esta Semana</span>
                  <span className="text-xl font-bold text-[#E9C349]">128 <span className="text-xs font-medium text-emerald-400">alumnos</span></span>
                </div>
              </div>
            ) : (currentUser.role === 'studio' || currentUser.role === 'academy') ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-[#0A0A0A] border border-[#262626] rounded-xl text-center sm:text-left">
                  <span className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase block">Instructores Activos Staff</span>
                  <span className="text-xl font-bold text-[#EDEFF4]">12 <span className="text-xs font-medium text-[#E9C349]">docentes</span></span>
                </div>
                <div className="p-3 bg-[#0A0A0A] border border-[#262626] rounded-xl text-center sm:text-left">
                  <span className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase block">Matrícula General Academia</span>
                  <span className="text-xl font-bold text-emerald-400">1,850 <span className="text-xs font-medium text-emerald-300">alumnos</span></span>
                </div>
                <div className="p-3 bg-[#0A0A0A] border border-[#262626] rounded-xl text-center sm:text-left">
                  <span className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase block">Membresías & Suscripciones</span>
                  <span className="text-xl font-bold text-[#E9C349]">$4,250 <span className="text-xs font-medium text-slate-400">USD/mes</span></span>
                </div>
                <div className="p-3 bg-[#0A0A0A] border border-[#262626] rounded-xl text-center sm:text-left">
                  <span className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase block">Eventos & Batallas Activas</span>
                  <span className="text-xl font-bold text-[#E9C349]">8 <span className="text-xs font-medium text-purple-400">globales</span></span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-[#0A0A0A] border border-[#262626] rounded-xl text-center sm:text-left">
                  <span className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase block">Total ({chartTimeRange} Días)</span>
                  <span className="text-xl font-bold text-[#EDEFF4]">{chartData.reduce((acc, curr) => acc + curr.minutos, 0)} <span className="text-xs font-medium">min</span></span>
                </div>
                
                {/* Interactive Meta Diaria Card */}
                <div 
                  onClick={() => {
                    setEditingGoalMinutes(currentUser.targetMinutes || 30);
                    setIsEditingGoal(!isEditingGoal);
                  }}
                  className="p-3 bg-[#0A0A0A] border border-[#262626] hover:border-[#E9C349]/60 transition-all rounded-xl text-center sm:text-left cursor-pointer group relative overflow-hidden"
                  title="Haz clic para editar la meta diaria de entrenamiento"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-[#8A8A8A] group-hover:text-[#E9C349] transition-colors uppercase block">
                      Meta Diaria 🎯
                    </span>
                    <Edit3 className="w-3 h-3 text-[#8A8A8A] group-hover:text-[#E9C349] transition-colors" />
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl font-bold text-[#EDEFF4] group-hover:text-white transition-colors">
                      {currentUser.targetMinutes || 30} <span className="text-xs font-medium text-[#8A8A8A]">min</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#E9C349] opacity-80 group-hover:opacity-100 transition-opacity">
                      {isEditingGoal ? 'Cerrar' : 'Editar'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#0A0A0A] border border-[#262626] rounded-xl text-center sm:text-left">
                  <span className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase block">Racha Activa</span>
                  <span className="text-xl font-bold text-[#E9C349]">🔥 {getPracticeStreak()} <span className="text-xs font-medium">días</span></span>
                </div>
                <div className="p-3 bg-[#0A0A0A] border border-[#262626] rounded-xl text-center sm:text-left">
                  <span className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase block">Cumplimiento</span>
                  <span className="text-xl font-bold text-[#E9C349]">
                    {Math.round((chartData.reduce((acc, curr) => acc + curr.minutos, 0) / (((currentUser.targetMinutes || 30) * chartTimeRange))) * 100)} %
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
                    <span className="w-2 h-2 rounded-full bg-[#E9C349]" />
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
                            : 'text-[#8A8A8A] hover:text-white'
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
                          : 'text-[#8A8A8A] hover:text-white'
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
                          : 'text-[#8A8A8A] hover:text-white'
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
                          : 'text-[#8A8A8A] hover:text-white'
                      }`}
                    >
                      🎯 Meta Diaria
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
                          <stop offset="5%" stopColor="#E9C349" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#E9C349" stopOpacity={0.0} />
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
                        cursor={{ stroke: 'rgba(233,195,73,0.3)', strokeWidth: 1, strokeDasharray: '2 2' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const isMet = data.minutos >= (currentUser.targetMinutes || 30);
                            return (
                              <div className="bg-[#121212] border border-[#262626] p-3 rounded-xl text-xs text-[#EDEFF4] space-y-2 shadow-2xl min-w-[220px]">
                                <div className="flex items-center justify-between border-b border-[#262626] pb-1.5">
                                  <p className="font-mono font-bold text-[10px] text-[#8A8A8A] uppercase">{data.dayName}</p>
                                  <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${isMet ? 'bg-[#E9C349]/20 text-[#E9C349]' : 'bg-rose-500/20 text-rose-300'}`}>
                                    {data.minutos} min {isMet ? '✓ Logrado' : ''}
                                  </span>
                                </div>
                                
                                <div className="space-y-1">
                                  {data.drill > 0 && (
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span className="flex items-center gap-1.5 text-gray-300">
                                        <span className="w-2 h-2 rounded-full bg-[#E9C349]" /> ⚡ Drills & Técnica
                                      </span>
                                      <span className="font-mono font-bold text-[#E9C349]">{data.drill}m</span>
                                    </div>
                                  )}
                                  {data.battle > 0 && (
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span className="flex items-center gap-1.5 text-gray-300">
                                        <span className="w-2 h-2 rounded-full bg-[#9A2B3C]" /> ⚔️ Batallas
                                      </span>
                                      <span className="font-mono font-bold text-[#9A2B3C]">{data.battle}m</span>
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
                                        • <span className="font-bold text-white">{log.minutes}m</span> - {log.description}
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
                        stroke="#9A2B3C" 
                        strokeDasharray="4 4" 
                        label={{ value: `Meta: ${currentUser.targetMinutes || 30}m`, fill: '#9A2B3C', fontSize: 10, position: 'insideTopRight' }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="minutos" 
                        name="Minutos de Práctica" 
                        stroke="#E9C349" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#minutosGradient)" 
                        activeDot={{ r: 7, fill: '#E9C349', stroke: '#0D0D12', strokeWidth: 3 }} 
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
                        cursor={{ fill: 'rgba(233,195,73,0.05)' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-[#121212] border border-[#262626] p-3 rounded-xl text-xs text-[#EDEFF4] space-y-2 shadow-2xl min-w-[210px]">
                                <div className="flex items-center justify-between border-b border-[#262626] pb-1.5">
                                  <p className="font-mono font-bold text-[10px] text-[#8A8A8A] uppercase">{data.dayName}</p>
                                  <span className="font-mono font-bold text-[#E9C349] text-xs">{data.minutos} min total</span>
                                </div>
                                
                                <div className="space-y-1">
                                  {data.drill > 0 && (
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span className="flex items-center gap-1.5 text-gray-300">
                                        <span className="w-2 h-2 rounded-full bg-[#E9C349]" /> ⚡ Drills & Técnica
                                      </span>
                                      <span className="font-mono font-bold text-[#E9C349]">{data.drill}m</span>
                                    </div>
                                  )}
                                  {data.battle > 0 && (
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span className="flex items-center gap-1.5 text-gray-300">
                                        <span className="w-2 h-2 rounded-full bg-[#9A2B3C]" /> ⚔️ Batallas
                                      </span>
                                      <span className="font-mono font-bold text-[#9A2B3C]">{data.battle}m</span>
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
                                        • <span className="font-bold text-white">{log.minutes}m</span> - {log.description}
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
                          <Bar dataKey="drill" name="Drills & Técnica" stackId="a" fill="#E9C349" maxBarSize={45} />
                          <Bar dataKey="battle" name="Batallas & Freestyle" stackId="a" fill="#9A2B3C" maxBarSize={45} />
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
                                fill={isTargetMet ? '#E9C349' : '#9A2B3C'} 
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
                      <span className="font-mono font-bold text-white bg-white/10 px-1.5 py-0.5 rounded text-[10px]">{total}m</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section B: COMUNIDAD - Dynamic Role Based Hub */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pl-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">💬</span>
                <h3 className="text-xs font-mono font-bold tracking-widest text-[#9A2B3C] uppercase">
                  {currentUser.role === 'instructor' 
                    ? 'CANAL DE COMUNICACIÓN Y FEEDBACK DOCENTE'
                    : (currentUser.role === 'studio' || currentUser.role === 'academy')
                    ? 'HUB DE COMUNICACIÓN INSTITUCIONAL Y MODERACIÓN'
                    : 'COMUNIDAD Y CHAT DE ALUMNOS'}
                </h3>
              </div>
              <span className="text-[9px] font-mono text-[#E9C349] font-bold px-2 py-0.5 bg-[#121212] border border-[#262626] rounded-md">
                ROL: {currentUser.role?.toUpperCase() || 'STUDENT'}
              </span>
            </div>
            
            {/* 3-Column Grid representing Comunidad bento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card 1: Role Specific Communication Card 1 */}
              {currentUser.role === 'instructor' ? (
                <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 h-auto md:h-[250px] min-h-[250px] flex flex-col justify-between shadow-lg">
                  <div>
                    <div className="flex items-center justify-between mb-2 border-b border-[#262626] pb-1.5">
                      <span className="text-[10px] font-mono font-bold text-[#E9C349] uppercase">FEEDBACK DE ALUMNOS</span>
                      <span className="text-[8px] text-[#8A8A8A] font-mono">2 Pendientes</span>
                    </div>
                    
                    <div className="space-y-2 mt-2">
                      <div className="p-2.5 bg-[#0A0A0A] rounded-xl border border-[#262626] text-left">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-bold uppercase text-[#EDEFF4]">Sofia R. - Drill 125 BPM</span>
                          <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">Pendiente</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium italic">"Solicitó revisión de simetría en brazos y técnica de rolls."</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('instructor')}
                    className="w-full py-1.5 text-center text-[10px] font-bold text-[#E9C349] border border-[#E9C349]/30 bg-[#E9C349]/10 rounded-xl hover:bg-[#E9C349] hover:text-black transition-colors uppercase"
                  >
                    Revisar Envíos
                  </button>
                </div>
              ) : (currentUser.role === 'studio' || currentUser.role === 'academy') ? (
                <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 h-auto md:h-[250px] min-h-[250px] flex flex-col justify-between shadow-lg">
                  <div>
                    <div className="flex items-center justify-between mb-2 border-b border-[#262626] pb-1.5">
                      <span className="text-[10px] font-mono font-bold text-[#E9C349] uppercase">BOLETÍN ACADEMIA</span>
                      <span className="text-[8px] text-[#8A8A8A] font-mono">Oficial</span>
                    </div>
                    
                    <div className="space-y-2 mt-2">
                      <div className="p-2.5 bg-[#0A0A0A] rounded-xl border border-[#262626] text-left">
                        <span className="text-[9px] font-bold uppercase text-[#E9C349] block mb-1">Copa Waack On 2026</span>
                        <p className="text-[10px] text-gray-300">Convocatoria abierta para todas las sedes e instructores.</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowAnnModal(true)}
                    className="w-full py-1.5 text-center text-[10px] font-bold text-[#E9C349] border border-[#E9C349]/30 bg-[#E9C349]/10 rounded-xl hover:bg-[#E9C349] hover:text-black transition-colors uppercase"
                  >
                    Crear Anuncio Institucional
                  </button>
                </div>
              ) : (
                <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 h-auto md:h-[250px] min-h-[250px] flex flex-col justify-between shadow-lg">
                  <div>
                    <div className="flex items-center justify-between mb-2 border-b border-[#262626] pb-1.5">
                      <span className="text-[10px] font-mono font-bold text-[#9A2B3C] uppercase">FORO GENERAL</span>
                      <span className="text-[8px] text-[#8A8A8A] font-mono">Último Post</span>
                    </div>
                    
                    <div className="space-y-2 mt-2">
                      <div className="p-3 bg-[#0A0A0A] rounded-xl border border-[#262626] text-left">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className="w-4 h-4 rounded-full bg-[#121212] border border-[#262626] overflow-hidden shrink-0">
                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[9px] font-bold uppercase text-[#E9C349]">Marilyn</span>
                        </div>
                        <p className="text-[10px] text-[#EDEFF4] font-medium italic">"¿Alguien probó el reto de rolls dobles a 130 BPM? ¡Es una locura para los hombros!"</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('comunidad')}
                    className="w-full py-1.5 text-center text-[10px] font-bold text-[#9A2B3C] border border-[#9A2B3C]/30 bg-[#9A2B3C]/10 rounded-xl hover:bg-[#9A2B3C] hover:text-white transition-colors uppercase"
                  >
                    Ir al Foro
                  </button>
                </div>
              )}

              {/* Card 2: Role Specific Communication Card 2 */}
              {currentUser.role === 'instructor' ? (
                <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 h-auto md:h-[250px] min-h-[250px] flex flex-col justify-between shadow-lg">
                  <div>
                    <div className="flex items-center justify-between mb-2 border-b border-[#262626] pb-1.5">
                      <span className="text-[10px] font-mono font-bold text-[#E9C349] uppercase">ANUNCIOS DOCENTES</span>
                      <span className="text-[8px] text-[#8A8A8A] font-mono">Activos</span>
                    </div>
                    
                    <div className="space-y-2 mt-2">
                      <div className="p-2.5 bg-[#0A0A0A] border border-[#262626] rounded-xl text-[10px]">
                        <p className="font-bold text-[#EDEFF4] uppercase">Taller de Posing & Expresión Facial</p>
                        <span className="text-[8px] text-[#E9C349] font-mono">Publicado esta semana</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowAnnModal(true)}
                    className="w-full py-1.5 text-center text-[10px] font-bold text-[#E9C349] border border-[#E9C349]/30 bg-[#E9C349]/10 rounded-xl hover:bg-[#E9C349] hover:text-black transition-colors uppercase"
                  >
                    Nuevo Comunicado
                  </button>
                </div>
              ) : (currentUser.role === 'studio' || currentUser.role === 'academy') ? (
                <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 h-auto md:h-[250px] min-h-[250px] flex flex-col justify-between shadow-lg">
                  <div>
                    <div className="flex items-center justify-between mb-2 border-b border-[#262626] pb-1.5">
                      <span className="text-[10px] font-mono font-bold text-[#E9C349] uppercase">CANAL INSTRUCTORES</span>
                      <span className="text-[8px] text-[#8A8A8A] font-mono">Staff</span>
                    </div>
                    
                    <div className="space-y-2 mt-2">
                      <div className="p-2.5 bg-[#0A0A0A] border border-[#262626] rounded-xl text-[10px]">
                        <p className="font-bold text-[#EDEFF4] uppercase">Reunión de Coordinación Cátedras</p>
                        <span className="text-[8px] text-purple-400 font-mono">12 profesores convocados</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('studio')}
                    className="w-full py-1.5 text-center text-[10px] font-bold text-[#E9C349] border border-[#E9C349]/30 bg-[#E9C349]/10 rounded-xl hover:bg-[#E9C349] hover:text-black transition-colors uppercase"
                  >
                    Directorio Studio
                  </button>
                </div>
              ) : (
                <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 h-auto md:h-[250px] min-h-[250px] flex flex-col justify-between shadow-lg">
                  <div>
                    <div className="flex items-center justify-between mb-2 border-b border-[#262626] pb-1.5">
                      <span className="text-[10px] font-mono font-bold text-[#E9C349] uppercase">SALAS DE PRÁCTICA</span>
                      <span className="text-[8px] text-[#8A8A8A] font-mono">Activas</span>
                    </div>
                    
                    <div className="space-y-2 mt-2">
                      {(STUDY_GROUPS || []).slice(0, 2).map((group, idx) => (
                        <div key={group.id || `sg-${idx}`} className="p-2.5 bg-[#0A0A0A] border border-[#262626] rounded-xl flex justify-between items-center text-[10px]">
                          <div className="min-w-0">
                            <p className="font-bold text-[#EDEFF4] uppercase truncate">{group.title}</p>
                            <span className="text-[8px] text-[#8A8A8A] font-mono font-bold">{group.participants} activos</span>
                          </div>
                          <span className="text-[8px] bg-[#121212] border border-[#262626] px-1.5 py-0.5 rounded font-bold font-mono shrink-0 text-[#E9C349]">{group.category}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('comunidad')}
                    className="w-full py-1.5 text-center text-[10px] font-bold text-[#E9C349] border border-[#E9C349]/30 bg-[#E9C349]/10 rounded-xl hover:bg-[#E9C349] hover:text-black transition-colors uppercase"
                  >
                    Unirse a Grupo
                  </button>
                </div>
              )}

              {/* Card 3: CHAT EN VIVO DE LA ACADEMIA */}
              <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 h-auto md:h-[250px] min-h-[250px] flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-1.5 border-b border-[#262626] pb-1.5">
                    <span className="text-[10px] font-mono font-bold text-[#E9C349] uppercase">
                      {currentUser.role === 'instructor' ? 'TUTORÍA CHAT EN VIVO' : (currentUser.role === 'studio' || currentUser.role === 'academy') ? 'CHAT GLOBAL ACADEMIA' : 'LOBBY CHAT'}
                    </span>
                    <span className="text-[8px] text-[#E9C349] font-mono font-bold animate-pulse">• ONLINE</span>
                  </div>
                  
                  <div className="h-[125px] overflow-y-auto space-y-2 pr-1 pt-1 text-[10px] font-mono text-left">
                    {(chatMessages || []).slice(-3).map((msg, idx) => (
                      <div key={msg.id || `msg-${idx}`} className="p-2 bg-[#0A0A0A] rounded-lg border border-[#262626]">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-[#E9C349] uppercase text-[9px]">{msg.user}</span>
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
                      localStorage.removeItem('waackon_draft_bento_chat');
                      setNewLiveMessage(Date.now().toString()); // force update
                    }
                  }} 
                  className="flex flex-col gap-1 mt-2"
                >
                  {bentoChatInput.trim() !== '' && (
                    <div className="flex items-center justify-between text-[8px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
                      <span>💾 Borrador guardado</span>
                      <button
                        type="button"
                        onClick={() => {
                          setBentoChatInput('');
                          localStorage.removeItem('waackon_draft_bento_chat');
                        }}
                        className="text-slate-400 hover:text-rose-300 underline"
                      >
                        Descartar
                      </button>
                    </div>
                  )}
                  <div className="flex gap-1.5">
                    <input
                      id="bento-com-input"
                      type="text"
                      placeholder="Escribe..."
                      value={bentoChatInput}
                      onChange={(e) => setBentoChatInput(e.target.value)}
                      className="flex-1 text-[10px] bg-[#0A0A0A] border border-[#262626] rounded-lg px-2.5 py-1.5 focus:outline-none placeholder-gray-600 text-[#EDEFF4] font-medium"
                    />
                    <button
                      type="submit"
                      className="p-1.5 bg-[#9A2B3C] text-white rounded-lg hover:bg-[#81262c] cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Curriculum & Live Stream Box -> 4 cols */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Box 1: CLASES Y CURSOS */}
          <div className="bg-[#121212] border border-[#262626] rounded-2xl p-5 space-y-4 shadow-lg text-[#EDEFF4]">
            <div className="border-b border-[#262626] pb-3">
              <span className="text-[9px] font-mono font-bold text-[#E9C349] bg-[#E9C349]/10 border border-[#E9C349]/30 px-2 py-0.5 rounded uppercase">
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
                  color: 'bg-[#E9C349]', 
                  lessonsStr: `${l1CompletedCount} de ${level1Lessons.length} lecciones` 
                },
                { 
                  id: 'cursos-2', 
                  title: 'Coreografía Disco Funky', 
                  progress: 30, 
                  color: 'bg-[#9A2B3C]', 
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
                  color: 'bg-[#E9C349]', 
                  lessonsStr: `${l2CompletedCount} de ${level2Lessons.length} lecciones` 
                },
              ].map((course) => (
                <div key={course.id} className="p-3 bg-[#0A0A0A] border border-[#262626] rounded-xl">
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <p className="text-[11px] font-bold text-[#EDEFF4] uppercase leading-tight">{course.title}</p>
                    <span className="text-[10px] font-mono font-bold text-[#E9C349] shrink-0">{course.progress}%</span>
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
                      className="text-[#E9C349] hover:underline uppercase flex items-center gap-0.5 font-bold"
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
                <Calendar className="w-3.5 h-3.5 text-[#E9C349]" /> CALENDARIO & LIVE
              </h4>
              <button 
                onClick={() => setActiveTab('live')} 
                className="text-[9px] text-[#E9C349] hover:underline font-bold uppercase"
              >
                Ver Agenda &rarr;
              </button>
            </div>

            <div className="p-4 space-y-4 bg-[#121212]">
              {/* Prominent Live Class Join Container */}
              <div className="bg-[#181214] border-2 border-[#9A2B3C] rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-9 h-9 rounded-full bg-[#9A2B3C]/30 border border-[#9A2B3C] flex items-center justify-center shrink-0 text-[#E9C349]">
                    <Video className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[10px] font-mono font-bold text-[#E9C349] uppercase tracking-wider">Clase en Vivo Programada</span>
                    </div>
                    <h5 className="text-xs font-bold text-white uppercase">Gestión de Clases en Vivo</h5>
                    <p className="text-[10px] text-slate-400 font-mono">Sesión interactiva con Brando • Hoy 19:30</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMeetModal(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-[#9A2B3C] hover:bg-[#b03246] text-white text-xs font-mono font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer border border-[#E9C349]/40"
                >
                  <Video className="w-3.5 h-3.5 text-[#E9C349]" />
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
                          ? 'bg-[#9A2B3C] text-white border-[#9A2B3C] scale-[1.05]' 
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
                <div className="absolute top-2 left-2 bg-[#9A2B3C] text-white text-[8px] font-bold tracking-widest px-1.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  LIVE NOW
                </div>

                {/* Direct Google Meet Join overlay */}
                <button
                  type="button"
                  onClick={() => setShowMeetModal(true)}
                  className="absolute top-2 right-2 bg-[#E9C349] text-black text-[8px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 hover:scale-105 transition-all shadow-md"
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
                  className="absolute bottom-2 right-2 w-6 h-6 bg-[#121212] border border-[#262626] rounded-full flex items-center justify-center hover:bg-[#1c1b1b] text-[#EDEFF4]"
                >
                  {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                </button>
              </div>

              {/* Simulated active streaming chat box */}
              <div className="bg-[#0A0A0A] rounded-xl border border-[#262626] p-2.5 text-[#EDEFF4]">
                <div className="text-[9px] text-[#8A8A8A] font-bold border-b border-[#262626] pb-1 flex justify-between uppercase">
                  <span>Chat del Directo</span>
                  <span className="text-[#E9C349] font-bold text-[8px]">42 bailarines activos</span>
                </div>
                
                <div className="h-[90px] overflow-y-auto space-y-1.5 pr-1 pt-1.5 text-[10px] font-mono text-left">
                  {liveChat.map((msgStr, index) => {
                    const splitIdx = msgStr.indexOf(':');
                    const sender = msgStr.substring(0, splitIdx);
                    const text = msgStr.substring(splitIdx + 1);
                    return (
                      <div key={index} className="leading-tight">
                        <span className="text-[#E9C349] font-bold uppercase">{sender}:</span>
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
                    className="bg-[#9A2B3C] text-white text-[10px] font-bold px-2 py-0.5 rounded"
                  >
                    Enviar
                  </button>
                </form>
              </div>

            </div>
          </div>

          {/* Box 3: TABLA DE CLASIFICACIÓN (Gamification Leaderboard Widget) */}
          <div className="bg-[#121212] border border-[#262626] rounded-2xl overflow-hidden flex flex-col shadow-lg text-[#EDEFF4]">
            <div className="p-4 border-b border-[#262626] flex justify-between items-center bg-[#1c1b1b]">
              <h4 className="text-xs font-mono font-bold tracking-tight text-[#EDEFF4] uppercase flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-[#E9C349]" /> CLASIFICACIÓN ACADEMIA
              </h4>
              <span className="text-[8px] bg-[#121212] border border-[#262626] px-2 py-0.5 rounded font-mono font-bold">
                PUNTOS
              </span>
            </div>

            <div className="divide-y border-b border-[#262626] divide-[#1c1b1b] bg-[#121212]">
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

                return leaderboardList.slice(0, 3).map((user, idx) => {
                  const position = idx + 1;
                  const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : null;
                  const isMe = user.id === currentUser.id;

                  return (
                    <div 
                      key={`lb-${user.id || idx}-${idx}`} 
                      className={`p-2.5 flex items-center justify-between text-xs ${
                        isMe ? 'bg-[#9A2B3C]/10' : 'bg-[#121212]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 text-center font-mono font-bold">{medal || `#${position}`}</span>
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-7 h-7 rounded-full object-cover border border-[#262626]" 
                        />
                        <span className={`font-bold truncate uppercase text-[11px] ${isMe ? 'text-[#E9C349]' : 'text-[#EDEFF4]'}`}>
                          {user.name}
                        </span>
                      </div>
                      <span className="font-mono font-bold bg-[#0A0A0A] border border-[#262626] px-1.5 py-0.5 rounded text-[10px]">
                        {user.points} pts
                      </span>
                    </div>
                  );
                });
              })()}
            </div>

            <div className="p-3 bg-[#0A0A0A] text-center">
              <button
                onClick={() => setActiveTab('ranking')}
                className="w-full py-2 bg-[#9A2B3C] text-white border border-transparent text-[11px] font-bold rounded-lg hover:bg-[#81262c] transition-all flex items-center justify-center gap-1 uppercase"
              >
                <span>VER RANKING COMPLETO Y LOGROS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* FOOTER BAR matching the mock image bottom footer */}
      <footer className="mt-8 pt-6 border-t border-[#262626] bg-[#121212] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start text-xs font-bold">
          <span className="text-[#E9C349] font-mono tracking-widest text-[10px] uppercase mr-2">© 2026 WAACK ON</span>
          <span className="text-[#262626] hidden md:inline">|</span>
          <button 
            onClick={() => setActiveTab('support')}
            className="text-[#8A8A8A] hover:text-[#E9C349] uppercase tracking-tight transition-colors"
          >
            AYUDA & SOPORTE
          </button>
          <span className="text-[#262626]">|</span>
          <button 
            onClick={() => setActiveTab('profile')}
            className="text-[#8A8A8A] hover:text-[#E9C349] uppercase tracking-tight transition-colors"
          >
            MI CUENTA
          </button>
        </div>

        <div className="flex items-center gap-3">
          <a href="#facebook" className="p-1.5 bg-[#0A0A0A] hover:bg-[#121212] border border-[#262626] text-[#E9C349] rounded-lg transition-all" title="Facebook">
            <Facebook className="w-4 h-4" />
          </a>
          <a href="#instagram" className="p-1.5 bg-[#0A0A0A] hover:bg-[#121212] border border-[#262626] text-[#E9C349] rounded-lg transition-all" title="Instagram">
            <Instagram className="w-4 h-4" />
          </a>
          <a href="#twitter" className="p-1.5 bg-[#0A0A0A] hover:bg-[#121212] border border-[#262626] text-[#E9C349] rounded-lg transition-all" title="Twitter">
            <Twitter className="w-4 h-4" />
          </a>
          <a href="#youtube" className="p-1.5 bg-[#0A0A0A] hover:bg-[#121212] border border-[#262626] text-[#E9C349] rounded-lg transition-all" title="YouTube">
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
                className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[#E9C349]">
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
                            ? 'bg-[#E9C349] text-black border-[#E9C349]'
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
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-2 text-xs text-[#EDEFF4] focus:border-[#E9C349] outline-none"
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
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl p-3 text-xs text-[#EDEFF4] focus:border-[#E9C349] outline-none resize-none"
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
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-3 py-2 text-xs text-[#EDEFF4] focus:border-[#E9C349] outline-none"
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
                    className="rounded accent-[#E9C349]"
                  />
                  <span className="text-[11px] font-mono font-bold text-slate-200">
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
                    className="px-5 py-2 bg-[#E9C349] hover:bg-[#d8b33c] text-black text-xs font-mono font-black rounded-xl shadow-lg transition-all uppercase"
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
      />

    </div>
  );
}
