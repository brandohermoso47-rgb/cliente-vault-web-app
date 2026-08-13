import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Settings, 
  ShieldAlert, 
  Sparkles, 
  GraduationCap, 
  Users, 
  Radio, 
  Timer,
  BookOpen,
  Menu,
  X,
  LayoutDashboard,
  User as UserIcon,
  HelpCircle,
  Eye,
  EyeOff,
  Mail,
  HardDrive,
  Sun,
  Moon,
  Camera,
  Target,
  Gauge,
  Plus,
  Minus,
  Disc,
  FileText,
  Flame,
  Smartphone
} from 'lucide-react';
import { triggerBpm10HapticAndFlash, getBpmHapticPreference, setBpmHapticPreference, testHapticVibration } from './lib/bpmHaptics';
import BWImageGallery from './components/BWImageGallery';
import { GmailWidget } from './components/GmailWidget';
import { GooglePickerModal } from './components/GooglePickerModal';
import { GoogleDocsModal } from './components/GoogleDocsModal';
import SpotifyMusicPlayer, { SpotifyFloatingMiniPlayer } from './components/SpotifyMusicPlayer';
import AdminDashboardView, { ADMIN_USER_ID } from './components/AdminDashboardView';
import { Language, translations, languageNames } from './lib/translations';
import { 
  createBackendAnnouncement, 
  postCommunityMessage, 
  updateProfileBackend 
} from './lib/api';
import { subscribeUserTracksFromFirebase } from './lib/musicService';

// Import Types
import { 
  User, 
  Announcement, 
  Presentation, 
  ChatMessage, 
  Lesson, 
  PlaylistItem, 
  FeedbackItem, 
  NotificationItem,
  CalendarEvent,
  PracticeLog,
  InstructorCatedra
} from './types';
import { 
  notifyStudentFeedbackReviewed, 
  triggerLocalWebPushNotification, 
  registerServiceWorker, 
  requestWebPushPermission, 
  playWebPushSound 
} from './lib/webPush';

// Import Initial Data
import { 
  INITIAL_USER, 
  INITIAL_ANNOUNCEMENTS, 
  INITIAL_PRESENTATIONS, 
  INITIAL_CHAT_MESSAGES, 
  INITIAL_LESSONS, 
  INITIAL_PLAYLISTS, 
  INITIAL_FEEDBACK_ITEMS, 
  INITIAL_CALENDAR_EVENTS,
  INITIAL_PRACTICE_LOGS,
  INITIAL_INSTRUCTORS
} from './data';

// Import Shell Components
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import OnboardingTour from './components/OnboardingTour';
import LoginView from './components/LoginView';
import ProtectedRoute from './components/ProtectedRoute';
import PremiumGate from './components/PremiumGate';
import ViewSkeleton from './components/ViewSkeleton';
import { SubscriptionPlansModal } from './components/SubscriptionPlansModal';
import { LessonCelebration } from './components/LessonCelebration';
import FormationContentPreviewModal from './components/FormationContentPreviewModal';
import SomaticPosingPrototypeModal from './components/SomaticPosingPrototypeModal';

// Code Splitting (React.lazy) for Heavy Academic & Somatic Modules
const ComunidadView = React.lazy(() => import('./components/ComunidadView'));
const CursosView = React.lazy(() => import('./components/CursosView'));
const EntrenamientoView = React.lazy(() => import('./components/EntrenamientoView'));
const LiveView = React.lazy(() => import('./components/LiveView'));
const FisicoView = React.lazy(() => import('./components/FisicoView'));
const ProfileView = React.lazy(() => import('./components/ProfileView'));
const EbooksView = React.lazy(() => import('./components/EbooksView'));
const RankingView = React.lazy(() => import('./components/RankingView'));
const ReelsView = React.lazy(() => import('./components/ReelsView'));
const PrivacyView = React.lazy(() => import('./components/PrivacyView'));
const InstructorView = React.lazy(() => import('./components/InstructorView'));
const StudioDashboardView = React.lazy(() => import('./components/StudioDashboardView'));
const ClassroomView = React.lazy(() => import('./components/ClassroomView'));
const TasksView = React.lazy(() => import('./components/TasksView'));
const GoogleSlidesView = React.lazy(() => import('./components/GoogleSlidesView'));
const AiStudioView = React.lazy(() => import('./components/AiStudioView'));
const PlansView = React.lazy(() => import('./components/PlansView'));
const PodcastsView = React.lazy(() => import('./components/PodcastsView'));

// Import Firebase
import { auth, db, OperationType, handleFirestoreError } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot, setDoc, deleteDoc, query, orderBy, limit, getDoc } from 'firebase/firestore';

// Friends & Battles integration
import { FriendsModal } from './components/FriendsModal';
import { BattleInvitationModal } from './components/BattleInvitationModal';
import { upsertUserProfile, updateUserStatus } from './lib/friendsAndBattles';

// Helper function to play a subtle notification sound using Web Audio API
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // Ignore audio context restrictions
  }
}

// Custom hook for detecting new assigned tasks and notifications
function useNotifications(currentUser: User) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isBouncing, setIsBouncing] = useState<boolean>(false);
  const prevCountRef = useRef<number>(-1);

  useEffect(() => {
    const fetchTasks = () => {
      fetch('/api/student/tasks')
        .then(res => {
          if (!res || !res.ok) return null;
          const contentType = res.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) return null;
          return res.json().catch(() => null);
        })
        .then(data => {
          if (data && data.success && Array.isArray(data.tasks)) {
            const pendingTasks = data.tasks.filter((t: any) => (!t.studentUid || t.studentUid === currentUser.id) && t.status === 'pending');
            const newCount = pendingTasks.length;

            if (prevCountRef.current !== -1 && newCount > prevCountRef.current) {
              playNotificationSound();
              setIsBouncing(true);
              setTimeout(() => setIsBouncing(false), 2500);
            }
            prevCountRef.current = newCount;
            setTasks(pendingTasks);
            setUnreadCount(newCount);
          }
        })
        .catch(() => {
          // Ignore network errors on background poll
        });
    };

    fetchTasks();
    const interval = setInterval(fetchTasks, 15000);
    return () => clearInterval(interval);
  }, [currentUser.id]);

  return { tasks, unreadCount, isBouncing };
}

export default function App() {
  // Language Selector State
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('waacking_language') as Language;
    return (saved === 'es' || saved === 'en' || saved === 'ko' || saved === 'ja' || saved === 'pt') ? saved : 'es';
  });

  // Onboarding Tour state
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('waacking_onboarding_completed') !== 'true';
  });

  // Global Black and White (Monochrome) Image Mode
  const [isGrayscaleGlobal, setIsGrayscaleGlobal] = useState<boolean>(() => {
    return localStorage.getItem('waackon_grayscale_mode') === 'true';
  });

  const handleToggleGrayscaleGlobal = () => {
    setIsGrayscaleGlobal(prev => {
      const nextVal = !prev;
      localStorage.setItem('waackon_grayscale_mode', String(nextVal));
      return nextVal;
    });
  };

  // Focus Mode State and Texts
  const [isFocusMode, setIsFocusMode] = useState<boolean>(() => {
    return localStorage.getItem('waacking_focus_mode') === 'true';
  });

  const focusModeText: Record<Language, { enable: string; disable: string; activeLabel: string }> = {
    es: {
      enable: "Modo Enfoque",
      disable: "Salir Enfoque",
      activeLabel: "MODO ENFOQUE"
    },
    en: {
      enable: "Focus Mode",
      disable: "Exit Focus",
      activeLabel: "FOCUS MODE"
    },
    ko: {
      enable: "집중 모드",
      disable: "집중 모드 종료",
      activeLabel: "집중 모드"
    },
    ja: {
      enable: "集中モード",
      disable: "集中モード終了",
      activeLabel: "集中モード"
    },
    pt: {
      enable: "Modo Foco",
      disable: "Sair do Foco",
      activeLabel: "MODO FOCO"
    }
  };

  const handleToggleFocusMode = () => {
    setIsFocusMode(prev => {
      const newVal = !prev;
      localStorage.setItem('waacking_focus_mode', String(newVal));
      return newVal;
    });
  };

  useEffect(() => {
    localStorage.setItem('waacking_language', language);
  }, [language]);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('waacking_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('waacking_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Subscription Plans Modal state
  const [isPlansModalOpen, setIsPlansModalOpen] = useState<boolean>(false);

  // Workspace integration modals state
  const [showGmailModal, setShowGmailModal] = useState<boolean>(false);
  const [showPickerModal, setShowPickerModal] = useState<boolean>(false);
  const [showDocsModal, setShowDocsModal] = useState<boolean>(false);

  // Course Level Select lifted state
  const [selectedCourseLevel, setSelectedCourseLevel] = useState<1 | 2>(1);

  // Formation and Content Preview Modal state
  const [showFormationPreviewModal, setShowFormationPreviewModal] = useState<boolean>(false);

  // Somatic Posing Prototype Modal state
  const [showSomaticPosingModal, setShowSomaticPosingModal] = useState<boolean>(false);

  // Lesson Celebration state
  const [celebratedLesson, setCelebratedLesson] = useState<Lesson | null>(null);

  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem('waacking_active_tab') || 'dashboard';
  });

  // Training session duration timer state
  const [trainingSeconds, setTrainingSeconds] = useState<number>(0);
  const [isTrainingRunning, setIsTrainingRunning] = useState<boolean>(false);

  useEffect(() => {
    if (activeTab === 'entrenamiento') {
      setIsTrainingRunning(true);
      const interval = setInterval(() => {
        setTrainingSeconds(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setIsTrainingRunning(false);
    }
  }, [activeTab]);

  const formatTrainingTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hours > 0) {
      return `${hours}:${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Firebase Auth states
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(() => {
    return localStorage.getItem('waacking_guest_mode') === 'true';
  });
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  // State with LocalStorage loaders
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('waacking_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const { tasks: assignedTasksNotifications, unreadCount, isBouncing } = useNotifications(currentUser);

  // Presence & Firestore Profile synchronization
  useEffect(() => {
    if (currentUser.id) {
      upsertUserProfile(currentUser);
      updateUserStatus(currentUser.id, activeTab === 'live' ? 'in_battle' : 'online');
    }
  }, [currentUser.id, currentUser.name, activeTab]);

  // central user update and Firestore sync helper
  const updateUserAndPersist = (arg: User | ((prev: User) => User)) => {
    setCurrentUser(prev => {
      const updated = typeof arg === 'function' ? (arg as any)(prev) : arg;
      localStorage.setItem('waacking_user', JSON.stringify(updated));

      // Sync with Backend API (Zod Schema Validated)
      updateProfileBackend(updated, {
        name: updated.name,
        role: updated.role,
        bio: updated.bio,
        avatar: updated.avatar,
        instagram: updated.instagram
      }).catch(err => {
        console.warn("[Backend Profile Sync Notice]:", err);
      });

      // Persist to Firestore if logged in
      if (auth.currentUser) {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        setDoc(docRef, {
          id: updated.id,
          name: updated.name,
          avatar: updated.avatar,
          role: updated.role,
          completedLessons: updated.completedLessons,
          points: updated.points,
          email: updated.email || auth.currentUser.email || '',
          nickname: updated.nickname || '',
          bio: updated.bio || '',
          level: updated.level || 'intermediate',
          instagram: updated.instagram || '',
          targetMinutes: updated.targetMinutes || 30,
          hydrationReminders: updated.hydrationReminders ?? true,
          lessonNotifications: updated.lessonNotifications ?? true,
          trainingPreferences: updated.trainingPreferences || {
            hydrationReminders: updated.hydrationReminders ?? true,
            lessonNotifications: updated.lessonNotifications ?? true
          },
          customAchievements: updated.customAchievements || [],
          billingStatus: updated.billingStatus || 'cancelled'
        }).catch(err => {
          console.error("Error saving updated profile to Firestore:", err);
        });
      }
      return updated;
    });
  };

  // Helper for normalizing roles across backend and frontend
  const normalizeUserRole = (rawRole: string): 'student' | 'instructor' | 'studio' => {
    const lower = (rawRole || '').toLowerCase().trim();
    if (['instructor', 'docente', 'profesor'].includes(lower)) return 'instructor';
    if (['studio', 'academia', 'escuela'].includes(lower)) return 'studio';
    return 'student';
  };

  // Real-time Firestore Listener for current user profile & webhook role changes
  useEffect(() => {
    const activeUid = firebaseUser?.uid || currentUser.id;
    if (!activeUid) return;

    const userDocRef = doc(db, 'users', activeUid);
    const unsub = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.role || data.billingStatus || data.subscription_status) {
          const newRole = normalizeUserRole(data.role || currentUser.role);
          const newStatus = data.billingStatus || data.subscription_status || 'active';

          setCurrentUser(prev => {
            if (prev.role !== newRole || prev.billingStatus !== newStatus) {
              const updated = {
                ...prev,
                role: newRole,
                billingStatus: newStatus as any
              };
              localStorage.setItem('waacking_user', JSON.stringify(updated));

              // Automatic redirection to the appropriate role dashboard
              setActiveTab('dashboard');
              const dashPath = newRole === 'instructor' 
                ? '/dashboard/instructor' 
                : newRole === 'studio' 
                  ? '/dashboard/academia' 
                  : '/dashboard/estudiante';
              
              if (window.location.pathname !== dashPath) {
                window.history.replaceState({}, '', dashPath);
              }

              setPushToast({
                id: `webhook-role-${Date.now()}`,
                title: '¡Rol y Suscripción Actualizados!',
                body: `Webhook completado. Redirigiendo a tu Dashboard de ${
                  newRole === 'instructor' ? 'Instructor' : newRole === 'studio' ? 'Academia' : 'Estudiante'
                }.`
              });

              return updated;
            }
            return prev;
          });
        }
      }
    }, (err) => {
      console.warn('[Real-time Role Snapshot Notice]:', err);
    });

    return () => unsub();
  }, [firebaseUser?.uid, currentUser.id]);

  // Handle URL path routing & payment redirect query parameters
  useEffect(() => {
    const pathname = window.location.pathname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);

    if (pathname.includes('/dashboard/estudiante') || pathname.includes('/dashboard/student')) {
      setActiveTab('dashboard');
      if (currentUser.role !== 'student') {
        updateUserAndPersist(prev => ({ ...prev, role: 'student' }));
      }
    } else if (pathname.includes('/dashboard/instructor')) {
      setActiveTab('dashboard');
      if (currentUser.role !== 'instructor') {
        updateUserAndPersist(prev => ({ ...prev, role: 'instructor' }));
      }
    } else if (pathname.includes('/dashboard/academia') || pathname.includes('/dashboard/studio')) {
      setActiveTab('dashboard');
      if (currentUser.role !== 'studio') {
        updateUserAndPersist(prev => ({ ...prev, role: 'studio' }));
      }
    }

    if (searchParams.get('payment_status') === 'success') {
      const plan = searchParams.get('plan') || 'clase_profesor';
      let targetRole: 'student' | 'instructor' | 'studio' = 'student';
      let roleLabel = 'Estudiante';
      let dashPath = '/dashboard/estudiante';

      if (['plan_instructor', 'instructor'].includes(plan)) {
        targetRole = 'instructor';
        roleLabel = 'Instructor';
        dashPath = '/dashboard/instructor';
      } else if (['plan_academia', 'studio', 'academia'].includes(plan)) {
        targetRole = 'studio';
        roleLabel = 'Academia';
        dashPath = '/dashboard/academia';
      }

      updateUserAndPersist(prev => ({
        ...prev,
        role: targetRole,
        billingStatus: 'active'
      }));

      setActiveTab('dashboard');
      window.history.replaceState({}, '', dashPath);

      setPushToast({
        id: `pay-success-${Date.now()}`,
        title: '¡Pago Confirmado por Webhook!',
        body: `Suscripción activa. Bienvenido a tu Dashboard de ${roleLabel}.`
      });
    }
  }, []);

  // Sync auth state changes with Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        setIsGuestMode(false);
        localStorage.setItem('waacking_guest_mode', 'false');

        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setCurrentUser({
              id: user.uid,
              name: data.name || user.displayName || 'Bailarín',
              firstName: data.firstName || (data.name ? data.name.split(' ')[0] : undefined),
              lastName: data.lastName || (data.name ? data.name.split(' ').slice(1).join(' ') : undefined),
              avatar: user.photoURL || data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
              role: normalizeUserRole(data.role || 'student'),
              completedLessons: data.completedLessons || [],
              points: data.points || 0,
              email: user.email || data.email || undefined,
              nickname: data.nickname || (data.name ? `@${data.name.toLowerCase().replace(/\s+/g, '')}` : undefined),
              bio: data.bio,
              level: data.level,
              instagram: data.instagram,
              targetMinutes: data.targetMinutes,
              customAchievements: data.customAchievements || [],
              billingStatus: data.billingStatus || 'cancelled'
            });
          } else {
            // Document does not exist, create a clean profile in Firestore
            const nameParts = (user.displayName || '').trim().split(' ');
            const inferredFirstName = nameParts[0] || 'Bailarín';
            const inferredLastName = nameParts.slice(1).join(' ') || '';
            const defaultName = user.displayName || 'Bailarín Waack On';
            const defaultNickname = `@${inferredFirstName.toLowerCase()}${inferredLastName ? '_' + inferredLastName.toLowerCase() : ''}`.replace(/\s+/g, '');

            const newUserProfile: User = {
              id: user.uid,
              name: defaultName,
              firstName: inferredFirstName,
              lastName: inferredLastName,
              avatar: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
              role: 'student',
              completedLessons: [],
              points: 0,
              email: user.email || undefined,
              nickname: defaultNickname,
              billingStatus: 'cancelled'
            };
            await setDoc(docRef, newUserProfile, { merge: true });
            setCurrentUser(newUserProfile);
          }
        } catch (error) {
          const errMessage = error instanceof Error ? error.message : String(error);
          if (!errMessage.includes('client is offline')) {
            console.error("Error syncing profile with Firestore:", error);
          }
          // Fallback to minimal user info
          setCurrentUser({
            id: user.uid,
            name: user.displayName || 'Bailarín',
            avatar: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
            role: 'student',
            completedLessons: [],
            points: 0,
            email: user.email || undefined
          });
        }
      } else {
        setFirebaseUser(null);
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [presentations, setPresentations] = useState<Presentation[]>(INITIAL_PRESENTATIONS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);

  const [instructors, setInstructors] = useState<InstructorCatedra[]>(INITIAL_INSTRUCTORS);

  const [lessons, setLessons] = useState<Lesson[]>(() => {
    try {
      const saved = localStorage.getItem('waacking_lessons');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { console.error(e); }
    return INITIAL_LESSONS;
  });

  const [playlists, setPlaylists] = useState<PlaylistItem[]>(INITIAL_PLAYLISTS);

  // Subscribe to user session music from Firebase Firestore
  useEffect(() => {
    if (!currentUser?.id) return;
    const unsub = subscribeUserTracksFromFirebase(currentUser.id, (userTracks) => {
      setPlaylists(userTracks);
    });
    return () => unsub();
  }, [currentUser?.id]);

  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>(INITIAL_FEEDBACK_ITEMS);
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>([]);
  const [pushToast, setPushToast] = useState<{ id: string; title: string; body: string; feedbackId?: string } | null>(null);

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem('waacking_events');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { console.error(e); }
    return INITIAL_CALENDAR_EVENTS;
  });

  const [practiceLogs, setPracticeLogs] = useState<PracticeLog[]>(() => {
    try {
      const saved = localStorage.getItem('waacking_practice_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { console.error(e); }
    return INITIAL_PRACTICE_LOGS;
  });

  // Real-time Firestore Listeners for Community & Academy Collections
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'chat_messages'),
      (snapshot) => {
        if (!snapshot.empty) {
          const msgs = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as ChatMessage));
          setChatMessages(msgs);
        } else {
          INITIAL_CHAT_MESSAGES.forEach(msg => {
            setDoc(doc(db, 'chat_messages', msg.id), msg).catch(err =>
              handleFirestoreError(err, OperationType.WRITE, `chat_messages/${msg.id}`)
            );
          });
          setChatMessages(INITIAL_CHAT_MESSAGES);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'chat_messages');
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'presentations'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Presentation));
          setPresentations(items);
        } else {
          INITIAL_PRESENTATIONS.forEach(p => {
            setDoc(doc(db, 'presentations', p.id), p).catch(err =>
              handleFirestoreError(err, OperationType.WRITE, `presentations/${p.id}`)
            );
          });
          setPresentations(INITIAL_PRESENTATIONS);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'presentations');
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'announcements'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Announcement));
          setAnnouncements(items);
        } else {
          INITIAL_ANNOUNCEMENTS.forEach(a => {
            setDoc(doc(db, 'announcements', a.id), a).catch(err =>
              handleFirestoreError(err, OperationType.WRITE, `announcements/${a.id}`)
            );
          });
          setAnnouncements(INITIAL_ANNOUNCEMENTS);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'announcements');
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'feedback_items'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as FeedbackItem));
          setFeedbackItems(items);
        } else {
          INITIAL_FEEDBACK_ITEMS.forEach(f => {
            setDoc(doc(db, 'feedback_items', f.id), f).catch(err =>
              handleFirestoreError(err, OperationType.WRITE, `feedback_items/${f.id}`)
            );
          });
          setFeedbackItems(INITIAL_FEEDBACK_ITEMS);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'feedback_items');
      }
    );
    return () => unsub();
  }, []);

  // Register Service Worker and listen for notification click events
  useEffect(() => {
    registerServiceWorker();

    const handleOpenFeedback = () => {
      setActiveTab('entrenamiento');
      setPushToast(null);
    };
    window.addEventListener('OPEN_FEEDBACK_ITEM', handleOpenFeedback);
    return () => window.removeEventListener('OPEN_FEEDBACK_ITEM', handleOpenFeedback);
  }, []);

  // Real-time Firestore Listener for Notifications (/notifications)
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'notifications'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as NotificationItem));
          items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setNotificationsList(items);

          // Check if there's a new unread feedback notification for current user
          const latest = items[0];
          if (latest && !latest.read) {
            const isForMe = latest.userId === currentUser.id || latest.userId === currentUser.name || latest.studentName === currentUser.name;
            if (isForMe) {
              setPushToast({
                id: latest.id,
                title: latest.title,
                body: latest.body,
                feedbackId: latest.feedbackId
              });
              triggerLocalWebPushNotification({
                title: latest.title,
                body: latest.body,
                tag: `notif-${latest.id}`,
                feedbackId: latest.feedbackId,
                onClick: () => setActiveTab('entrenamiento')
              });
            }
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'notifications');
      }
    );
    return () => unsub();
  }, [currentUser.id, currentUser.name]);

  // Real-time Firestore Listener for Lessons (/lessons)
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'lessons'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Lesson));
          items.sort((a, b) => a.level - b.level || a.id.localeCompare(b.id));
          setLessons(items);
        } else {
          INITIAL_LESSONS.forEach(l => {
            setDoc(doc(db, 'lessons', l.id), l).catch(err =>
              handleFirestoreError(err, OperationType.WRITE, `lessons/${l.id}`)
            );
          });
          setLessons(INITIAL_LESSONS);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'lessons');
      }
    );
    return () => unsub();
  }, []);

  // Real-time Firestore Listener for User Practice Logs (/users/{uid}/practice_logs)
  useEffect(() => {
    const activeUid = firebaseUser?.uid || currentUser.id;
    if (!activeUid) return;

    const unsub = onSnapshot(
      collection(db, 'users', activeUid, 'practice_logs'),
      (snapshot) => {
        if (!snapshot.empty) {
          const logs = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as PracticeLog));
          logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setPracticeLogs(logs);
        } else {
          INITIAL_PRACTICE_LOGS.forEach(log => {
            setDoc(doc(db, 'users', activeUid, 'practice_logs', log.id), log).catch(err =>
              handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}/practice_logs/${log.id}`)
            );
          });
          setPracticeLogs(INITIAL_PRACTICE_LOGS);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${activeUid}/practice_logs`);
      }
    );
    return () => unsub();
  }, [firebaseUser?.uid, currentUser.id]);

  // Save to LocalStorage when remaining non-Firestore states change
  useEffect(() => {
    localStorage.setItem('waacking_active_tab', activeTab);
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('waacking_practice_logs', JSON.stringify(practiceLogs));
  }, [practiceLogs]);

  useEffect(() => {
    localStorage.setItem('waacking_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('waacking_lessons', JSON.stringify(lessons));
  }, [lessons]);

  useEffect(() => {
    localStorage.setItem('waacking_events', JSON.stringify(events));
  }, [events]);

  // ACTIONS

  // 1. Mark lesson completed
  const handleMarkLessonComplete = (lessonId: string, completed: boolean) => {
    const lesson = lessons.find(l => l.id === lessonId);
    const level = lesson?.level || 1;
    const pointsAwarded = level === 1 ? 50 : 80;

    updateUserAndPersist(prev => {
      let updatedCompleted = [...prev.completedLessons];
      let newPoints = prev.points;

      if (completed) {
        if (!updatedCompleted.includes(lessonId)) {
          updatedCompleted.push(lessonId);
          newPoints += pointsAwarded;
          if (lesson) {
            setCelebratedLesson(lesson);
          }
        }
      } else {
        if (updatedCompleted.includes(lessonId)) {
          updatedCompleted = updatedCompleted.filter(id => id !== lessonId);
          newPoints = Math.max(0, newPoints - pointsAwarded);
        }
      }
      return { ...prev, completedLessons: updatedCompleted, points: newPoints };
    });

    if (lesson) {
      const updatedLesson = { ...lesson, completed };
      setDoc(doc(db, 'lessons', lessonId), updatedLesson, { merge: true }).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `lessons/${lessonId}`);
      });
    }

    setLessons(prev => 
      prev.map(l => l.id === lessonId ? { ...l, completed } : l)
    );
  };

  // 2. Add announcement (Backend RBAC Protected & Zod Validated)
  const handleAddAnnouncement = async (
    title: string, 
    content: string, 
    important: boolean = false,
    category: string = 'comunicados',
    actionUrl?: string,
    imageUrl?: string
  ) => {
    try {
      const backendAnn = await createBackendAnnouncement(currentUser, {
        title,
        content,
        category,
        isImportant: important,
        actionUrl,
        imageUrl
      });

      const newAnn: Announcement = {
        id: backendAnn.id || `a-${Date.now()}`,
        title: backendAnn.title || title,
        content: backendAnn.content || content,
        date: new Date().toISOString().split('T')[0],
        author: currentUser.nickname || currentUser.name,
        authorAvatar: currentUser.avatar,
        authorRole: currentUser.role,
        category: category as any,
        important,
        actionUrl,
        imageUrl
      };
      setDoc(doc(db, 'announcements', newAnn.id), newAnn).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `announcements/${newAnn.id}`);
      });
    } catch (err: any) {
      console.error("[Backend Announcement RBAC / Zod Error]:", err);
      alert(err.message || 'Error de permisos RBAC o validación en el servidor');
    }
  };

  const handleDeleteAnnouncement = (id: string) => {
    deleteDoc(doc(db, 'announcements', id)).catch(err => {
      handleFirestoreError(err, OperationType.DELETE, `announcements/${id}`);
    });
  };

  // 3. Add presentation
  const handleAddPresentation = (text: string, videoUrl?: string) => {
    const newPres: Presentation = {
      id: `p-${Date.now()}`,
      studentName: currentUser.name,
      studentAvatar: currentUser.avatar,
      text,
      videoUrl: videoUrl || '',
      date: 'Hace un momento',
      likes: 0,
      comments: []
    };
    setDoc(doc(db, 'presentations', newPres.id), newPres).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `presentations/${newPres.id}`);
    });
  };

  // 4. Like presentation
  const handleLikePresentation = (id: string) => {
    const p = presentations.find(item => item.id === id);
    if (!p) return;
    const isLiked = p.isLikedByMe;
    const updated = {
      ...p,
      likes: isLiked ? Math.max(0, p.likes - 1) : p.likes + 1,
      isLikedByMe: !isLiked
    };
    setDoc(doc(db, 'presentations', id), updated).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `presentations/${id}`);
    });
  };

  // 5. Add comment to presentation
  const handleAddCommentToPresentation = (presId: string, text: string) => {
    const p = presentations.find(item => item.id === presId);
    if (!p) return;
    const updated = {
      ...p,
      comments: [
        ...(p.comments || []),
        {
          id: `c-${Date.now()}`,
          author: currentUser.name,
          avatar: currentUser.avatar,
          text,
          date: 'Hace un momento'
        }
      ]
    };
    setDoc(doc(db, 'presentations', presId), updated).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `presentations/${presId}`);
    });
  };

  // 6. Add Chat Lobby message (Backend Zod Validated)
  const handleAddChatMessage = async (text: string) => {
    try {
      await postCommunityMessage(currentUser, {
        content: text,
        channel: 'lobby'
      });

      const newMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        user: currentUser.name,
        avatar: currentUser.avatar,
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        role: currentUser.role
      };
      setDoc(doc(db, 'chat_messages', newMsg.id), newMsg).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `chat_messages/${newMsg.id}`);
      });
      
      updateUserAndPersist(prev => ({
        ...prev,
        points: prev.points + 10
      }));
    } catch (err: any) {
      console.error("[Backend Chat Zod Error]:", err);
      alert(err.message || 'Error de sanitización o validación de mensaje en el servidor');
    }
  };

  // 7. Add Feedback / practice video
  const handleAddFeedbackItem = (title: string, description: string, videoUrl: string) => {
    const newFeedback: FeedbackItem = {
      id: `fb-${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentAvatar: currentUser.avatar,
      videoTitle: title,
      videoUrl,
      description,
      date: new Date().toISOString().split('T')[0],
      corrections: [],
      completed: false
    };
    setDoc(doc(db, 'feedback_items', newFeedback.id), newFeedback).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `feedback_items/${newFeedback.id}`);
    });

    updateUserAndPersist(prev => ({
      ...prev,
      points: prev.points + 100
    }));
  };

  // 7b. Add bonus points (Gamification administrator / simulator)
  const handleAddBonusPoints = (amount: number) => {
    updateUserAndPersist(prev => ({
      ...prev,
      points: Math.max(0, prev.points + amount)
    }));
  };

  // 7c. Log practice time in minutes
  const handleLogPractice = (
    minutes: number, 
    activityType: 'drill' | 'battle' | 'combo' | 'playlist' | 'sensorial', 
    description: string,
    extra?: { category?: Lesson['category']; bpm?: number }
  ) => {
    const activeUid = firebaseUser?.uid || currentUser.id;
    const newLog: PracticeLog = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      minutes,
      activityType,
      description,
      category: extra?.category,
      bpm: extra?.bpm
    };

    if (activeUid) {
      setDoc(doc(db, 'users', activeUid, 'practice_logs', newLog.id), newLog).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}/practice_logs/${newLog.id}`);
      });
    }

    setPracticeLogs(prev => [newLog, ...prev]);

    // Reward points for consistency: 5 points per minute practiced
    const pointsAwarded = Math.round(minutes * 5);
    if (pointsAwarded > 0) {
      updateUserAndPersist(prev => ({
        ...prev,
        points: prev.points + pointsAwarded
      }));
    }
  };

  // 8. Add Instructor Correction
  const handleAddCorrection = (itemId: string, time: string, text: string) => {
    const item = feedbackItems.find(i => i.id === itemId);
    if (!item) return;
    const updated = {
      ...item,
      completed: true,
      corrections: [
        ...(item.corrections || []),
        {
          id: `cor-${Date.now()}`,
          time,
          text,
          author: currentUser.name,
          role: currentUser.role
        }
      ]
    };
    setDoc(doc(db, 'feedback_items', itemId), updated).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `feedback_items/${itemId}`);
    });

    // Send Web Push Notification and persist notification to Firebase
    notifyStudentFeedbackReviewed({
      studentId: item.studentId,
      studentName: item.studentName,
      videoTitle: item.videoTitle,
      instructorName: currentUser.name || 'Brando Hermoso',
      feedbackId: itemId,
      correctionText: text
    });
  };

  // 9. RSVP toggle for events
  const handleToggleRsvp = (eventId: string) => {
    setEvents(prev => 
      prev.map(evt => {
        if (evt.id === eventId) {
          const isRsvped = evt.rsvpByMe;
          return {
            ...evt,
            rsvpCount: isRsvped ? evt.rsvpCount - 1 : evt.rsvpCount + 1,
            rsvpByMe: !isRsvped
          };
        }
        return evt;
      })
    );
  };

  // 10. Add calendar event (Instructor function)
  const handleInstructorAddEvent = (newEventData: Omit<CalendarEvent, 'id' | 'rsvpCount'>) => {
    const newEvent: CalendarEvent = {
      ...newEventData,
      id: `e-inst-${Date.now()}`,
      rsvpCount: 0
    };
    setEvents(prev => [newEvent, ...prev]);
  };

  // Switch tab render router
  const renderContent = () => {
    switch (activeTab) {
      case 'planes':
        return (
          <PlansView
            currentUser={currentUser}
            onUserChange={updateUserAndPersist}
            language={language}
            onOpenPlansModal={() => setIsPlansModalOpen(true)}
          />
        );
      case 'galeria_bw':
        return (
          <ProfileView
            currentUser={currentUser}
            onUserChange={updateUserAndPersist}
            language={language}
            onOpenPlansModal={() => setIsPlansModalOpen(true)}
            initialTab="galeria_bw"
            onNavigateTab={setActiveTab}
            isGrayscaleGlobal={isGrayscaleGlobal}
            onToggleGrayscaleGlobal={handleToggleGrayscaleGlobal}
          />
        );
      case 'dashboard':
        if (currentUser.id === ADMIN_USER_ID || auth.currentUser?.uid === ADMIN_USER_ID || firebaseUser?.uid === ADMIN_USER_ID) {
          return (
            <AdminDashboardView
              currentUser={currentUser}
              onUserChange={updateUserAndPersist}
              language={language}
            />
          );
        }
        if (currentUser.role === 'studio') {
          return (
            <StudioDashboardView
              currentUser={currentUser}
              onUserChange={updateUserAndPersist}
              language={language}
              onOpenDocsModal={() => setShowDocsModal(true)}
            />
          );
        }
        if (currentUser.role === 'instructor') {
          return (
            <InstructorView
              currentUser={currentUser}
              onUserChange={updateUserAndPersist}
              events={events}
              onAddEvent={handleInstructorAddEvent}
              language={language}
              setActiveTab={setActiveTab}
              lessons={lessons}
              onOpenDocsModal={() => setShowDocsModal(true)}
            />
          );
        }
        return (
          <DashboardView
            currentUser={currentUser}
            lessons={lessons}
            playlists={playlists}
            feedbackItems={feedbackItems}
            events={events}
            chatMessages={chatMessages}
            announcements={announcements}
            onAddAnnouncement={handleAddAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            setActiveTab={setActiveTab}
            onMarkLessonComplete={handleMarkLessonComplete}
            selectedCourseLevel={selectedCourseLevel}
            setSelectedCourseLevel={setSelectedCourseLevel}
            onAddChatMessage={handleAddChatMessage}
            practiceLogs={practiceLogs}
            onLogPractice={handleLogPractice}
            onUserChange={updateUserAndPersist}
            language={language}
            theme={theme}
          />
        );
      case 'cursos':
        if (currentUser.billingStatus !== 'active' && currentUser.subscriptionTier !== 'instructor_pass') {
          return (
            <PremiumGate
              language={language}
              sectionName="classes"
              onSubscribe={() => updateUserAndPersist({ ...currentUser, billingStatus: 'active' })}
              onOpenPlansModal={() => setIsPlansModalOpen(true)}
            />
          );
        }
        return (
          <CursosView
            currentUser={currentUser}
            lessons={lessons}
            instructors={instructors}
            onMarkLessonComplete={handleMarkLessonComplete}
            setActiveTab={setActiveTab}
            selectedCourseLevel={selectedCourseLevel}
            setSelectedCourseLevel={setSelectedCourseLevel}
            language={language}
            feedbackItems={feedbackItems}
            onAddFeedbackItem={handleAddFeedbackItem}
            onAddCorrection={handleAddCorrection}
          />
        );
      case 'podcasts':
        return (
          <PodcastsView
            currentUser={currentUser}
            onUserChange={updateUserAndPersist}
            instructors={instructors}
          />
        );
      case 'classroom':
        return (
          <ClassroomView
            currentUser={currentUser}
            language={language}
            lessons={lessons}
          />
        );
      case 'tasks':
        return (
          <TasksView
            currentUser={currentUser}
            language={language}
            lessons={lessons}
            onAddBonusPoints={handleAddBonusPoints}
          />
        );
      case 'google_slides':
        return (
          <GoogleSlidesView
            currentUser={currentUser}
            language={language}
          />
        );
      case 'ai_studio':
        return <AiStudioView />;
      case 'ebooks':
        if (currentUser.billingStatus !== 'active' && currentUser.subscriptionTier !== 'instructor_pass') {
          return (
            <PremiumGate
              language={language}
              sectionName="resources"
              onSubscribe={() => updateUserAndPersist({ ...currentUser, billingStatus: 'active' })}
              onOpenPlansModal={() => setIsPlansModalOpen(true)}
            />
          );
        }
        return (
          <EbooksView
            currentUser={currentUser}
            language={language}
          />
        );
      case 'entrenamiento':
        if (currentUser.billingStatus !== 'active' && !currentUser.subscriptionTier) {
          return (
            <PremiumGate
              language={language}
              sectionName="lab"
              onSubscribe={() => updateUserAndPersist({ ...currentUser, billingStatus: 'active' })}
              onOpenPlansModal={() => setIsPlansModalOpen(true)}
            />
          );
        }
        return (
          <EntrenamientoView
            currentUser={currentUser}
            playlists={playlists}
            feedbackItems={feedbackItems}
            onAddFeedbackItem={handleAddFeedbackItem}
            onAddCorrection={handleAddCorrection}
            onAddBonusPoints={handleAddBonusPoints}
            onLogPractice={handleLogPractice}
            language={language}
            onUserChange={updateUserAndPersist}
            trainingBpm={trainingBpm}
            onBpmChange={setTrainingBpm}
            theme={theme}
          />
        );
      case 'fisico':
        return (
          <FisicoView
            currentUser={currentUser}
            language={language}
            onAddBonusPoints={handleAddBonusPoints}
          />
        );
      case 'comunidad':
        return (
          <ComunidadView
            currentUser={currentUser}
            announcements={announcements}
            presentations={presentations}
            chatMessages={chatMessages}
            onAddAnnouncement={handleAddAnnouncement}
            onAddPresentation={handleAddPresentation}
            onAddChatMessage={handleAddChatMessage}
            onLikePresentation={handleLikePresentation}
            onAddCommentToPresentation={handleAddCommentToPresentation}
            language={language}
          />
        );
      case 'friends':
        return (
          <ProfileView
            currentUser={currentUser}
            onUserChange={updateUserAndPersist}
            language={language}
            onOpenPlansModal={() => setIsPlansModalOpen(true)}
            initialTab="amigos"
            onNavigateTab={setActiveTab}
          />
        );
      case 'ranking':
        return (
          <RankingView
            currentUser={currentUser}
            lessons={lessons}
            feedbackItems={feedbackItems}
            chatMessagesCount={(chatMessages || []).filter(msg => msg && msg.user === currentUser.name).length}
            onAddBonusPoints={handleAddBonusPoints}
            setActiveTab={setActiveTab}
            onUserChange={updateUserAndPersist}
            language={language}
          />
        );
      case 'reels':
        return (
          <ReelsView
            currentUser={currentUser}
            onNavigateTab={setActiveTab}
            language={language}
          />
        );
      case 'live':
        return (
          <LiveView
            currentUser={currentUser}
            events={events}
            onToggleRsvp={handleToggleRsvp}
            language={language}
          />
        );
      case 'profile':
        return (
          <ProfileView
            currentUser={currentUser}
            onUserChange={updateUserAndPersist}
            language={language}
            onOpenPlansModal={() => setIsPlansModalOpen(true)}
            initialTab="expediente"
            onNavigateTab={setActiveTab}
            isGrayscaleGlobal={isGrayscaleGlobal}
            onToggleGrayscaleGlobal={handleToggleGrayscaleGlobal}
          />
        );
      case 'privacy':
        return (
          <PrivacyView
            currentUser={currentUser}
            language={language}
          />
        );
      case 'instructor':
        return (
          <InstructorView
            currentUser={currentUser}
            onUserChange={updateUserAndPersist}
            events={events}
            onAddEvent={handleInstructorAddEvent}
            language={language}
            setActiveTab={setActiveTab}
            lessons={lessons}
            onOpenDocsModal={() => setShowDocsModal(true)}
          />
        );
      case 'studio':
        return (
          <StudioDashboardView
            currentUser={currentUser}
            onUserChange={updateUserAndPersist}
            language={language}
            onOpenDocsModal={() => setShowDocsModal(true)}
          />
        );
      case 'gmail':
        return (
          <div className="flex-1 overflow-y-auto p-6 bg-[#0A0A0A] flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6">
            <div className="p-4 bg-red-500/20 text-red-400 rounded-full border border-red-500/40 shadow-xl">
              <Mail className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Integración Oficial con Gmail</h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Conecta tu cuenta de Gmail para enviar reportes de evaluación, comunicados de cátedra y recibir notificaciones académicas de Waack On.
              </p>
            </div>
            <button
              onClick={() => setShowGmailModal(true)}
              className="px-6 py-3 bg-[#E9C349] text-black text-xs font-black rounded-2xl shadow-xl hover:bg-yellow-300 transition-all uppercase flex items-center gap-2"
            >
              <Mail className="w-4 h-4" /> Abrir Gestor de Gmail
            </button>
          </div>
        );
      case 'google_picker':
        return (
          <div className="flex-1 overflow-y-auto p-6 bg-[#0A0A0A] flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6">
            <div className="p-4 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/40 shadow-xl">
              <HardDrive className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Google Drive Picker</h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Examina y selecciona videos de tus drilings de Waacking, pistas de música Disco o documentos de cátedra guardados en tu Google Drive.
              </p>
            </div>
            <button
              onClick={() => setShowPickerModal(true)}
              className="px-6 py-3 bg-[#E9C349] text-black text-xs font-black rounded-2xl shadow-xl hover:bg-yellow-300 transition-all uppercase flex items-center gap-2"
            >
              <HardDrive className="w-4 h-4" /> Abrir Selector de Drive
            </button>
          </div>
        );
      case 'support':
        return (
          <div className="flex-1 overflow-y-auto p-6 bg-brand-bg flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6">
            <div className="p-4 bg-brand-orange-light text-brand-orange rounded-full border-4 border-brand-orange shadow-[4px_4px_0px_0px_#FF9F1C]">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-black text-brand-dark uppercase tracking-tight">¿NECESITAS AYUDA TÉCNICA?</h2>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed font-medium">
                Nuestra plataforma está optimizada para el aprendizaje sincrónico de baile. Si tienes inconvenientes con el metrónomo de sonido en vivo, los reproductores BPM o la carga de video, ponte en contacto con soporte técnico.
              </p>
            </div>
            <div className="w-full p-5 bg-white border-4 border-brand-dark rounded-2xl shadow-[6px_6px_0px_0px_rgba(29,29,31,1)] text-left space-y-2 text-brand-dark">
              <p className="text-xs font-bold"><strong>Email:</strong> soporte@academiadewaacking.com</p>
              <p className="text-xs font-black text-brand-cyan"><strong>Atención:</strong> Lunes a Viernes (09:00 - 18:00)</p>
            </div>
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className="px-6 py-3 bg-brand-pink text-white text-xs font-black rounded-xl border-2 border-brand-dark shadow-[4px_4px_0px_0px_rgba(29,29,31,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(29,29,31,1)] transition-all uppercase"
            >
              Volver al Dashboard
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  // Calculate daily practice goal completion percentage
  const targetPracticeMinutes = currentUser.targetMinutes || 30;
  const todayISOStr = new Date().toISOString().split('T')[0];
  const nowLocalDate = new Date();
  const todayLocalStr = `${nowLocalDate.getFullYear()}-${String(nowLocalDate.getMonth() + 1).padStart(2, '0')}-${String(nowLocalDate.getDate()).padStart(2, '0')}`;
  const todayLoggedMinutes = (practiceLogs || [])
    .filter(log => log && (log.date === todayISOStr || log.date === todayLocalStr))
    .reduce((sum, log) => sum + (log.minutes || 0), 0);
  const activeMinutes = Math.floor((trainingSeconds || 0) / 60);
  const totalTodayPracticeMinutes = todayLoggedMinutes + activeMinutes;
  const dailyPracticeGoalPercent = Math.min(100, Math.round((totalTodayPracticeMinutes / targetPracticeMinutes) * 100));

  const hasFired100GoalConfettiRef = useRef(false);
  const [isGoal100Flashing, setIsGoal100Flashing] = useState(false);

  // Spotify Music Player state
  const [isSpotifyPlayerOpen, setIsSpotifyPlayerOpen] = useState(false);
  const [isSpotifyFloating, setIsSpotifyFloating] = useState(false);
  const [activeSpotifyUrl, setActiveSpotifyUrl] = useState('https://open.spotify.com/embed/playlist/37i9dQZF1DX6XNisNdE8g6');

  // Quick BPM Selector state for Training mode
  const [trainingBpm, setTrainingBpm] = useState<number>(120);
  const [isBpmHapticEnabled, setIsBpmHapticEnabled] = useState<boolean>(getBpmHapticPreference);
  const [isBpm10Flashing, setIsBpm10Flashing] = useState<boolean>(false);
  const [hapticTestNotice, setHapticTestNotice] = useState<string | null>(null);
  const headerTapTimesRef = useRef<number[]>([]);

  // Listen to haptic preference changes from anywhere in the app
  useEffect(() => {
    const handleHapticSync = () => {
      setIsBpmHapticEnabled(getBpmHapticPreference());
    };
    window.addEventListener('bpm-haptic-preference-changed', handleHapticSync);
    return () => window.removeEventListener('bpm-haptic-preference-changed', handleHapticSync);
  }, []);

  // Trigger mobile vibration & visual flash whenever trainingBpm hits a multiple of 10
  useEffect(() => {
    if (isBpmHapticEnabled && trainingBpm % 10 === 0) {
      triggerBpm10HapticAndFlash(trainingBpm, isBpmHapticEnabled, () => {
        setIsBpm10Flashing(true);
        const timer = setTimeout(() => setIsBpm10Flashing(false), 850);
        return () => clearTimeout(timer);
      });
    }
  }, [trainingBpm, isBpmHapticEnabled]);

  const toggleBpmHapticPreference = () => {
    const nextVal = !isBpmHapticEnabled;
    setIsBpmHapticEnabled(nextVal);
    setBpmHapticPreference(nextVal);
    if (nextVal) {
      const vibrated = testHapticVibration();
      setHapticTestNotice(vibrated ? '📳 Vibración Probada OK' : '📳 Vibración Háptica Activada (10x BPM)');
    } else {
      setHapticTestNotice('📳 Vibración Háptica Desactivada');
    }
    setTimeout(() => setHapticTestNotice(null), 2500);
  };

  const handleHeaderTapTempo = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    const times = [...headerTapTimesRef.current, now].filter(t => now - t < 2500);
    headerTapTimesRef.current = times;
    if (times.length >= 2) {
      const intervals = [];
      for (let i = 1; i < times.length; i++) {
        intervals.push(times[i] - times[i - 1]);
      }
      const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgMs);
      if (calculatedBpm >= 60 && calculatedBpm <= 220) {
        setTrainingBpm(calculatedBpm);
      }
    }
  };

  const triggerHeaderGoalConfetti = (event?: React.MouseEvent) => {
    let originX = 0.85;
    let originY = 0.08;

    if (event && event.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      originX = (rect.left + rect.width / 2) / window.innerWidth;
      originY = (rect.top + rect.height / 2) / window.innerHeight;
    }

    // Trigger visual flash ring effect
    setIsGoal100Flashing(true);
    setTimeout(() => setIsGoal100Flashing(false), 1200);

    // Multi-stage celebratory confetti burst
    confetti({
      particleCount: 55,
      spread: 75,
      origin: { x: originX, y: originY },
      colors: ['#10B981', '#E9C349', '#3B82F6', '#EC4899', '#8B5CF6'],
      zIndex: 9999
    });

    setTimeout(() => {
      confetti({
        particleCount: 35,
        angle: 60,
        spread: 55,
        origin: { x: Math.max(0.1, originX - 0.05), y: originY },
        colors: ['#10B981', '#E9C349', '#FFFFFF'],
        zIndex: 9999
      });
      confetti({
        particleCount: 35,
        angle: 120,
        spread: 55,
        origin: { x: Math.min(0.9, originX + 0.05), y: originY },
        colors: ['#10B981', '#E9C349', '#FFFFFF'],
        zIndex: 9999
      });
    }, 150);
  };

  useEffect(() => {
    if (dailyPracticeGoalPercent >= 100) {
      if (!hasFired100GoalConfettiRef.current) {
        hasFired100GoalConfettiRef.current = true;
        triggerHeaderGoalConfetti();
      }
    } else {
      hasFired100GoalConfettiRef.current = false;
    }
  }, [dailyPracticeGoalPercent]);

  return (
    <ProtectedRoute
      authChecked={authChecked}
      firebaseUser={firebaseUser}
      isGuestMode={isGuestMode}
      fallback={
        <LoginView
          onGuestMode={() => {
            setIsGuestMode(true);
            localStorage.setItem('waacking_guest_mode', 'true');
          }}
          onSuccess={(user) => {
            setFirebaseUser(user);
            setIsGuestMode(false);
            localStorage.setItem('waacking_guest_mode', 'false');
          }}
          language={language}
          onLanguageChange={setLanguage}
        />
      }
    >
      <div id="app-container" className={`w-full max-w-7xl mx-auto overflow-x-hidden flex min-h-screen font-sans selection:bg-[#9A2B3C] selection:text-[#EDEFF4] flex-col lg:flex-row relative transition-all duration-300 ${
        isGrayscaleGlobal ? 'grayscale contrast-125' : ''
      } ${theme === 'light' ? 'bg-[#f4f5f7] text-[#1a1a1a]' : 'bg-[#0A0A0A] text-[#EDEFF4]'}`}>
      {/* Mobile Sidebar Drawer (Sliding menu) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-[#0A0A0A]/80 backdrop-blur-sm"
            />
            {/* Drawer Content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative z-10"
            >
              {/* Close Button overlay inside the sliding drawer */}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-[#121212] border border-[#262626] text-[#EDEFF4] hover:bg-[#9A2B3C] transition-all z-20 focus:outline-none"
                title="Cerrar menú"
              >
                <X className="w-4 h-4" />
              </button>
              <Sidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                currentUser={currentUser}
                onUserChange={updateUserAndPersist}
                language={language}
                onStartOnboarding={() => setShowOnboarding(true)}
                onOpenFormationPreview={() => setShowFormationPreviewModal(true)}
                onOpenSomaticPosingPrototype={() => setShowSomaticPosingModal(true)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (Permanent sidebar) */}
      {!isFocusMode && (
        <div className="hidden lg:flex shrink-0 h-full">
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            currentUser={currentUser}
            onUserChange={updateUserAndPersist}
            language={language}
            onStartOnboarding={() => setShowOnboarding(true)}
            onOpenFormationPreview={() => setShowFormationPreviewModal(true)}
            onOpenSomaticPosingPrototype={() => setShowSomaticPosingModal(true)}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 min-h-screen lg:min-h-0 lg:h-screen lg:overflow-hidden ${theme === 'light' ? 'bg-[#f8f9fa] text-[#1a1a1a]' : 'bg-[#0A0A0A] text-[#EDEFF4]'}`}>
        
        {/* Top Header Navigation */}
        <header id="top-header" className={`h-16 border-b px-4 sm:px-6 flex items-center justify-between shrink-0 select-none relative z-20 ${theme === 'light' ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-[#0A0A0A] border-[#262626] animate-header-glow'}`}>
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger button for mobile menu */}
            {!isFocusMode && (
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`lg:hidden p-2 rounded-xl transition-all focus:outline-none shrink-0 border ${
                  theme === 'light' 
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900' 
                    : 'bg-[#141414] hover:bg-[#9A2B3C] border-[#333333] text-white'
                }`}
                aria-label="Abrir menú de navegación"
                title="Abrir menú de navegación"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}

            {/* 1. BRAND IDENTITY: Circular "WAACK ON" Logo with Gold Wing & Impactful Black Typography on White Circle */}
            <div 
              onClick={() => setActiveTab('dashboard')} 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border-2 border-[#E9C349] shadow-[0_0_12px_rgba(233,195,73,0.35)] flex items-center justify-center p-0.5 shrink-0 select-none cursor-pointer hover:scale-105 transition-transform"
              title="WAACK ON - Portal Principal"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* White Background Circle */}
                <circle cx="50" cy="50" r="48" fill="#FFFFFF" />
                {/* Golden Wing Sculpture */}
                <path d="M22 45 C35 25, 60 20, 78 30 C65 35, 50 42, 40 52 C30 62, 25 72, 22 45 Z" fill="#E9C349" />
                <path d="M28 50 C38 35, 58 32, 72 40 C60 45, 48 50, 40 58 C32 66, 28 72, 28 50 Z" fill="#D4AF37" />
                {/* Impactful Black "WAACK ON" Text */}
                <text x="50" y="78" textAnchor="middle" fill="#000000" fontSize="16" fontWeight="900" fontFamily="sans-serif" letterSpacing="-0.5">WAACK ON</text>
              </svg>
            </div>

            {/* 2. HEADER TITLE: PANEL DE CONTROL - INSTRUCTOR PRINCIPAL / PORTAL DE ENTRENAMIENTO - ALUMNA */}
            <div className="flex items-center gap-2 truncate">
              {isFocusMode ? (
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9A2B3C] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#9A2B3C]"></span>
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-[#9A2B3C] font-black uppercase">
                    {focusModeText[language]?.activeLabel || 'MODO ENFOQUE'}
                  </span>
                  <span className="text-slate-400 font-mono font-bold">/</span>
                  <span className={`text-[10px] sm:text-[11px] font-mono tracking-wider uppercase font-extrabold truncate ${theme === 'light' ? 'text-slate-800' : 'text-[#EDEFF4]'}`}>{activeTab}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 truncate">
                  <h1 className="text-xs sm:text-sm font-display-lg font-black tracking-wider uppercase text-white truncate flex items-center gap-2">
                    {(currentUser.id === ADMIN_USER_ID || auth.currentUser?.uid === ADMIN_USER_ID || firebaseUser?.uid === ADMIN_USER_ID)
                      ? '🛡️ PANEL DE ADMINISTRADOR GENERAL'
                      : currentUser.role === 'studio'
                      ? 'PANEL DE ADMINISTRACIÓN - ACADEMIA DE WAACKING'
                      : currentUser.role === 'instructor' 
                      ? 'PANEL DE CONTROL - INSTRUCTOR PRINCIPAL' 
                      : 'PORTAL DE ENTRENAMIENTO - ALUMNA'}
                  </h1>
                  {activeTab !== 'dashboard' && (
                    <div className="hidden xl:flex items-center gap-1.5 shrink-0">
                      <span className="text-slate-500 font-mono text-xs font-bold">/</span>
                      <span className="text-xs font-mono font-bold text-[#E9C349] uppercase">{activeTab}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* [ADMIN BADGE INDICATOR] */}
            {(currentUser.id === ADMIN_USER_ID || auth.currentUser?.uid === ADMIN_USER_ID || firebaseUser?.uid === ADMIN_USER_ID) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#E9C349] to-amber-500 text-black font-extrabold text-[11px] font-mono uppercase tracking-wider shadow-[0_0_15px_rgba(233,195,73,0.5)] border border-amber-300">
                <ShieldAlert className="w-4 h-4 text-black fill-black" />
                <span>ADMIN</span>
              </span>
            )}

            {/* [Vista Previa Formación y Contenido] */}
            <button
              onClick={() => setShowFormationPreviewModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#E9C349] hover:bg-[#ffdf6b] text-black font-mono font-black text-[11px] uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
              title="Vista Previa de Formación y Contenido"
            >
              <Eye className="w-3.5 h-3.5 text-black" />
              <span className="hidden sm:inline">Vista Previa</span>
            </button>

            {/* [Spotify] Spotify Player Quick Launch Button */}
            <button
              onClick={() => setIsSpotifyPlayerOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer focus:outline-none ${
                isSpotifyFloating || isSpotifyPlayerOpen
                  ? 'bg-[#1DB954] text-black border-[#1DB954] font-bold shadow-[0_0_12px_rgba(29,185,84,0.4)]'
                  : theme === 'light'
                    ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-950 shadow-sm'
                    : 'bg-[#141414] hover:bg-[#1a1a1a] border-[#1DB954]/40 text-white shadow-sm'
              }`}
              title="Abrir reproductor de música de Spotify"
              aria-label="Abrir reproductor de música de Spotify"
            >
              <div className="w-4 h-4 rounded-full bg-[#1DB954] text-black flex items-center justify-center shrink-0">
                <Disc className="w-3 h-3 animate-spin-slow" />
              </div>
              <span className="text-[11px] font-mono font-bold tracking-tight hidden sm:inline">[Spotify]</span>
            </button>

            {/* Visual Indicator & Quick Toggle for BPM Haptic Feedback Status */}
            <div className="relative flex items-center">
              <button
                type="button"
                onClick={toggleBpmHapticPreference}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer select-none focus:outline-none text-xs font-mono font-bold shadow-sm active:scale-95 ${
                  isBpmHapticEnabled
                    ? theme === 'light'
                      ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-400 text-emerald-900 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                      : 'bg-emerald-950/70 hover:bg-emerald-900/90 border-emerald-500/70 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                    : theme === 'light'
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-500'
                      : 'bg-[#141414] hover:bg-[#202020] border-[#333333] text-slate-400'
                }`}
                title={
                  isBpmHapticEnabled
                    ? 'Estado actual: Vibración Háptica y Destello ACTIVADOS (múltiplos de 10 BPM). Clic para probar o desactivar antes de tu sesión.'
                    : 'Estado actual: Vibración Háptica DESACTIVADA. Clic para activar antes de tu sesión.'
                }
                aria-label={`Estado de vibración háptica: ${isBpmHapticEnabled ? 'Activado' : 'Desactivado'}`}
              >
                <div className="relative flex items-center justify-center shrink-0">
                  <Smartphone className={`w-3.5 h-3.5 ${isBpmHapticEnabled ? 'text-emerald-400 animate-pulse' : 'text-slate-400 opacity-60'}`} />
                  {isBpmHapticEnabled && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <span className="hidden md:inline font-mono uppercase tracking-tight text-[10px] text-slate-300 dark:text-slate-400">Háptico</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-black uppercase tracking-wider ${
                    isBpmHapticEnabled 
                      ? 'bg-emerald-500 text-black font-extrabold shadow-sm' 
                      : 'bg-slate-700/50 text-slate-400'
                  }`}>
                    {isBpmHapticEnabled ? 'ON' : 'OFF'}
                  </span>
                </div>
              </button>

              {/* Toast Feedback popup on click */}
              <AnimatePresence>
                {hapticTestNotice && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.9 }}
                    className="absolute top-10 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap bg-black/95 text-amber-300 border border-amber-400/80 px-3 py-1 rounded-xl text-[10px] font-mono font-bold shadow-2xl pointer-events-none flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    <span>{hapticTestNotice}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick BPM Selector (Header - Visible only during Entrenamiento mode) */}
            {activeTab === 'entrenamiento' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={
                  isBpm10Flashing
                    ? { scale: [1, 1.12, 0.96, 1.08, 1], boxShadow: ['0 0 0px rgba(233,195,73,0)', '0 0 25px rgba(233,195,73,0.9)', '0 0 5px rgba(233,195,73,0.2)'] }
                    : { opacity: 1, scale: 1 }
                }
                transition={isBpm10Flashing ? { duration: 0.65 } : { duration: 0.2 }}
                className={`relative flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-xl border transition-all shadow-sm ${
                  isBpm10Flashing
                    ? 'bg-amber-500/30 border-amber-400 text-amber-100 ring-2 ring-amber-400/50 shadow-[0_0_20px_rgba(233,195,73,0.7)]'
                    : trainingBpm % 10 === 0 && isBpmHapticEnabled
                      ? 'bg-amber-500/15 border-amber-400/80 text-amber-200'
                      : theme === 'light'
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-950'
                        : 'bg-[#141414] border-[#9A2B3C]/80 text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[#E9C349]">
                  <div className="relative flex items-center justify-center">
                    <motion.div
                      key={`bpm-gauge-pulse-${trainingBpm}`}
                      animate={{ scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8] }}
                      transition={{ repeat: Infinity, duration: 60 / Math.max(40, trainingBpm), ease: "easeInOut" }}
                    >
                      <Gauge className="w-3.5 h-3.5 text-[#E9C349]" />
                    </motion.div>
                    <motion.span
                      key={`bpm-beat-dot-${trainingBpm}`}
                      className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#E9C349] shadow-[0_0_6px_#E9C349]"
                      animate={{ scale: [0.6, 1.5, 0.6], opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 60 / Math.max(40, trainingBpm), ease: "easeInOut" }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-black tracking-wider uppercase hidden md:inline">BPM</span>
                </div>

                <button
                  onClick={() => setTrainingBpm(prev => Math.max(60, prev - 2))}
                  className="p-1 hover:bg-[#9A2B3C]/40 text-[#E9C349] rounded-md transition-colors active:scale-95 focus:outline-none"
                  title="Disminuir velocidad (-2 BPM)"
                  aria-label="Disminuir BPM"
                >
                  <Minus className="w-3 h-3" />
                </button>

                <motion.button 
                  type="button"
                  onClick={handleHeaderTapTempo}
                  key={`bpm-badge-tempo-${trainingBpm}`}
                  animate={
                    isBpm10Flashing
                      ? {}
                      : {
                          scale: [1, 1.05, 1],
                          boxShadow: [
                            "0 0 0px rgba(233,195,73,0)",
                            "0 0 8px rgba(233,195,73,0.45)",
                            "0 0 0px rgba(233,195,73,0)"
                          ]
                        }
                  }
                  transition={
                    isBpm10Flashing
                      ? {}
                      : { repeat: Infinity, duration: 60 / Math.max(40, trainingBpm), ease: "easeInOut" }
                  }
                  className={`flex items-center gap-1 px-2 py-0.5 rounded border font-mono text-xs font-black transition-all cursor-pointer select-none active:scale-95 ${
                    trainingBpm % 10 === 0
                      ? 'bg-[#E9C349] text-black border-[#E9C349] shadow-sm font-extrabold'
                      : 'bg-black/50 border-[#E9C349]/40 text-[#E9C349] hover:bg-black/70'
                  }`}
                  title="Botón unificado: haz clic en el número para Tap Tempo (ritmo) o en el icono de teléfono para alternar la vibración en múltiplos de 10 BPM."
                  aria-label="BPM Tap Tempo y Vibración Háptica"
                >
                  <span>{trainingBpm}</span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBpmHapticPreference();
                    }}
                    className={`p-0.5 rounded transition-all flex items-center justify-center ${
                      isBpmHapticEnabled
                        ? trainingBpm % 10 === 0 ? 'text-black' : 'text-emerald-400 hover:text-emerald-300'
                        : 'opacity-30 hover:opacity-75 text-slate-400'
                    }`}
                    title={isBpmHapticEnabled ? 'Vibración y Destello 10x ACTIVADO (Clic para apagar)' : 'Vibración y Destello 10x DESACTIVADO (Clic para activar)'}
                  >
                    <Smartphone className={`w-3 h-3 ${isBpmHapticEnabled && trainingBpm % 10 === 0 ? 'animate-bounce' : ''}`} />
                  </span>
                </motion.button>

                <button
                  onClick={() => setTrainingBpm(prev => Math.min(220, prev + 2))}
                  className="p-1 hover:bg-[#9A2B3C]/40 text-[#E9C349] rounded-md transition-colors active:scale-95 focus:outline-none"
                  title="Aumentar velocidad (+2 BPM)"
                  aria-label="Aumentar BPM"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </motion.div>
            )}

            {/* 4. ELIMINACIÓN DE ELEMENTOS ALUMNO: Only render practice goals for students, hidden for instructor & studio! */}
            {!isFocusMode && currentUser.role !== 'instructor' && currentUser.role !== 'studio' && (
              <motion.button
                onClick={(e) => {
                  setActiveTab('dashboard');
                  if (dailyPracticeGoalPercent >= 100) {
                    triggerHeaderGoalConfetti(e);
                  }
                }}
                animate={isGoal100Flashing ? { scale: [1, 1.18, 0.95, 1.05, 1] } : { scale: 1 }}
                transition={{ duration: 0.6 }}
                className={`relative flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer focus:outline-none overflow-visible ${
                  theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900 shadow-sm'
                    : 'bg-[#141414] hover:bg-[#1f1f1f] border-[#333333] text-white shadow-sm'
                } ${
                  dailyPracticeGoalPercent >= 100
                    ? 'ring-2 ring-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : ''
                }`}
                title={`Meta diaria de práctica: ${totalTodayPracticeMinutes} de ${targetPracticeMinutes} min (${dailyPracticeGoalPercent}%)${dailyPracticeGoalPercent >= 100 ? ' - ¡Haz clic para celebrar!' : ''}`}
                aria-label={`Meta diaria de práctica: ${dailyPracticeGoalPercent}% completado`}
              >
                <AnimatePresence>
                  {isGoal100Flashing && (
                    <motion.div
                      initial={{ opacity: 0.9, scale: 0.8 }}
                      animate={{ opacity: 0, scale: 1.6 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-400 pointer-events-none z-10"
                    />
                  )}
                </AnimatePresence>

                <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
                  <svg className="w-7 h-7 transform -rotate-90" viewBox="0 0 32 32">
                    <circle
                      cx="16"
                      cy="16"
                      r="12"
                      fill="none"
                      stroke={theme === 'light' ? '#cbd5e1' : '#262626'}
                      strokeWidth="3"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="12"
                      fill="none"
                      stroke={dailyPracticeGoalPercent >= 100 ? '#10B981' : '#E9C349'}
                      strokeWidth="3"
                      strokeDasharray="75.4"
                      strokeDashoffset={75.4 - (75.4 * dailyPracticeGoalPercent) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  <span className={`absolute text-[8px] font-mono font-black ${
                    dailyPracticeGoalPercent >= 100 ? 'text-emerald-400' : 'text-[#E9C349]'
                  }`}>
                    {dailyPracticeGoalPercent}%
                  </span>
                </div>

                <div className="hidden sm:flex flex-col text-left leading-none space-y-1 min-w-[55px]">
                  <div className="flex items-center justify-between gap-1 text-[9px] font-mono font-bold">
                    <span className="text-slate-400 uppercase tracking-tight">META</span>
                    <span className={dailyPracticeGoalPercent >= 100 ? 'text-emerald-400 font-black' : 'text-[#E9C349] font-black'}>
                      {totalTodayPracticeMinutes}/{targetPracticeMinutes}m
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-black/60 h-1 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        dailyPracticeGoalPercent >= 100 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-[#E9C349]'
                      }`}
                      style={{ width: `${dailyPracticeGoalPercent}%` }}
                    />
                  </div>
                </div>
              </motion.button>
            )}

            {/* 3. UNIFIED LANGUAGE SELECTOR: "IDIOMA: Español" */}
            {!isFocusMode && (
              <div className={`flex items-center gap-1.5 border px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                theme === 'light' ? 'border-slate-300 bg-slate-100 text-slate-900' : 'border-[#333333] bg-[#141414] text-white'
              }`}>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider hidden sm:inline text-emerald-400">
                  IDIOMA:
                </span>
                <select
                  id="language-selector"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="bg-transparent font-mono font-bold text-xs border-none outline-none cursor-pointer focus:ring-0 py-0 pr-4 pl-0 text-white"
                  aria-label="Seleccionar idioma de la plataforma"
                  title="Seleccionar idioma de la plataforma"
                >
                  <option value="es" className="bg-[#141414] text-white">Español</option>
                  <option value="en" className="bg-[#141414] text-white">English</option>
                  <option value="ja" className="bg-[#141414] text-white">日本語</option>
                  <option value="ko" className="bg-[#141414] text-white">한국어</option>
                </select>
              </div>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              className={`p-1.5 sm:p-2 rounded-xl transition-all border focus:outline-none flex items-center gap-1.5 ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900 font-bold'
                  : 'bg-[#141414] hover:bg-[#202020] border-[#333333] text-white font-bold'
              }`}
              aria-label={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#E9C349]" />
              ) : (
                <Moon className="w-4 h-4 text-amber-600" />
              )}
            </button>

            {/* 5. CORRECT USER PROFILE: Zoe Jackson with "Zoe 'Flow' Jackson" & subtitle "Instructor Senior" */}
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer focus:outline-none border ${
                activeTab === 'profile'
                  ? 'bg-[#E9C349]/20 border-[#E9C349] shadow-[0_0_12px_rgba(233,195,73,0.3)]'
                  : theme === 'light' 
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900' 
                    : 'bg-[#141414] hover:bg-[#202020] border-[#333333] text-white'
              }`}
              aria-label={`Ver perfil de ${currentUser.name}`}
              title={`Ver perfil de ${currentUser.name}`}
            >
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-[#E9C349] object-cover shrink-0 shadow-sm" 
                referrerPolicy="no-referrer"
              />
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-xs font-black uppercase tracking-wide text-white">
                  {currentUser.name}
                </span>
                {currentUser.role === 'studio' ? (
                  <span className="text-[10px] text-[#E9C349] font-mono font-bold uppercase">
                    Academia / Estudio
                  </span>
                ) : currentUser.role === 'instructor' ? (
                  <span className="text-[10px] text-emerald-400 font-medium lowercase">
                    Instructor Senior
                  </span>
                ) : (
                  <span className="text-[10px] text-[#E9C349] font-mono font-bold uppercase">
                    Estudiante Avanzada
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono font-bold text-[#E9C349] bg-[#E9C349]/10 px-1.5 py-0.5 rounded border border-[#E9C349]/30 hidden lg:inline ml-1">
                [Mi Cuenta]
              </span>
            </button>
          </div>
        </header>

        {/* Dynamic Inner Router view */}
        <main className={`flex-1 flex flex-col overflow-y-auto min-h-0 relative w-full ${theme === 'light' ? 'bg-[#f4f5f7] text-[#1a1a1a]' : 'bg-[#0A0A0A] text-[#EDEFF4]'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.99 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className={`flex-1 flex flex-col min-h-full w-full ${isFocusMode ? '' : 'pb-24 lg:pb-12'}`}
            >
              <React.Suspense fallback={<ViewSkeleton title={activeTab} />}>
                {renderContent()}
              </React.Suspense>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Tactile Bottom Navigation for Mobile Devices */}
        {!isFocusMode && (
          <div id="mobile-bottom-nav" className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t-4 border-brand-dark flex items-center justify-around px-2 shrink-0 select-none z-40 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[9px] sm:text-[10px] font-black transition-all focus:outline-none ${
                activeTab === 'dashboard' ? 'text-brand-pink' : 'text-gray-500 hover:text-brand-dark'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span>INICIO</span>
            </button>
            <button
              onClick={() => setActiveTab('cursos')}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[9px] sm:text-[10px] font-black transition-all focus:outline-none ${
                activeTab === 'cursos' ? 'text-brand-pink' : 'text-gray-500 hover:text-brand-dark'
              }`}
            >
              <GraduationCap className="w-5 h-5 mb-0.5" />
              <span>CLASES</span>
            </button>
            <button
              onClick={() => setActiveTab('ebooks')}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[9px] sm:text-[10px] font-black transition-all focus:outline-none ${
                activeTab === 'ebooks' ? 'text-[#9A2B3C]' : 'text-gray-500 hover:text-[#121212]'
              }`}
            >
              <BookOpen className="w-5 h-5 mb-0.5" />
              <span>RECURSOS</span>
            </button>
            <button
              onClick={() => setActiveTab('entrenamiento')}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[9px] sm:text-[10px] font-black transition-all focus:outline-none ${
                activeTab === 'entrenamiento' ? 'text-brand-pink' : 'text-gray-500 hover:text-brand-dark'
              }`}
            >
              <Sparkles className="w-5 h-5 mb-0.5" />
              <span>ZONA</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[9px] sm:text-[10px] font-black transition-all focus:outline-none ${
                activeTab === 'profile' ? 'text-brand-pink' : 'text-gray-500 hover:text-brand-dark'
              }`}
            >
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className={`w-5 h-5 rounded-full object-cover border-2 shrink-0 ${
                  activeTab === 'profile' ? 'border-brand-pink' : 'border-gray-400'
                }`}
                referrerPolicy="no-referrer"
              />
              <span className="mt-0.5 uppercase">CUENTA</span>
            </button>
          </div>
        )}

      </div>

      <AnimatePresence>
        {showOnboarding && (
          <OnboardingTour
            currentUser={currentUser}
            language={language}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onAddBonusPoints={handleAddBonusPoints}
            onUpdateUser={updateUserAndPersist}
            onClose={() => {
              setShowOnboarding(false);
              localStorage.setItem('waacking_onboarding_completed', 'true');
            }}
          />
        )}
      </AnimatePresence>

      <SubscriptionPlansModal
        isOpen={isPlansModalOpen}
        onClose={() => setIsPlansModalOpen(false)}
        currentUser={currentUser}
        language={language}
        onUpdateUser={updateUserAndPersist}
      />

      {/* Gmail Integration Widget */}
      <GmailWidget
        isOpen={showGmailModal}
        onClose={() => setShowGmailModal(false)}
      />

      {/* Google Drive Picker Modal */}
      <GooglePickerModal
        isOpen={showPickerModal}
        onClose={() => setShowPickerModal(false)}
        onSelectFile={(file) => {
          alert(`¡Archivo de Google Drive seleccionado con éxito!\nNombre: ${file.name}\nEnlace: ${file.webViewLink || 'Disponible'}`);
        }}
      />

      {/* Google Docs Workspace Modal */}
      <GoogleDocsModal
        isOpen={showDocsModal}
        onClose={() => setShowDocsModal(false)}
        language={language}
      />

      {/* Real-time Live Battle Invitation Popup */}
      <BattleInvitationModal 
        currentUser={currentUser}
        onAcceptBattle={(battle) => {
          setActiveTab('live');
        }}
      />

      {/* Lesson Completion Celebration Modal */}
      <AnimatePresence>
        {celebratedLesson && (
          <LessonCelebration
            lesson={celebratedLesson}
            currentUser={currentUser}
            onClose={() => setCelebratedLesson(null)}
          />
        )}
      </AnimatePresence>

      {/* Real-time Web Push Feedback Toast Alert */}
      <AnimatePresence>
        {pushToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[9999] max-w-md bg-[#121212] border-2 border-[#E9C349] p-4 rounded-2xl shadow-[0_10px_35px_rgba(233,195,73,0.3)] text-white flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E9C349]/20 border border-[#E9C349]/50 flex items-center justify-center text-[#E9C349] shrink-0">
                  <Bell className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-mono font-bold text-xs uppercase text-[#E9C349] tracking-wider">
                    {pushToast.title}
                  </h4>
                  <p className="text-[11px] text-gray-300 font-medium leading-tight mt-0.5">
                    {pushToast.body}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPushToast(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#262626]">
              <button
                onClick={() => {
                  setPushToast(null);
                  setActiveTab('entrenamiento');
                }}
                className="px-3 py-1.5 bg-[#E9C349] hover:bg-[#d4ae36] text-black font-mono text-[11px] font-bold uppercase rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Ver Retroalimentación
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spotify Music Player Modal */}
      <SpotifyMusicPlayer
        isOpen={isSpotifyPlayerOpen}
        onClose={() => setIsSpotifyPlayerOpen(false)}
        language={language}
        activeSpotifyUrl={activeSpotifyUrl}
        onSelectSpotifyUrl={(url) => setActiveSpotifyUrl(url)}
        isFloating={isSpotifyFloating}
        onToggleFloating={(floating) => setIsSpotifyFloating(floating)}
      />

      {/* Spotify Floating Mini-Player Widget */}
      <AnimatePresence>
        {isSpotifyFloating && !isSpotifyPlayerOpen && (
          <SpotifyFloatingMiniPlayer
            activeEmbedUrl={activeSpotifyUrl}
            onOpenFullModal={() => setIsSpotifyPlayerOpen(true)}
            onClose={() => setIsSpotifyFloating(false)}
            language={language}
          />
        )}
      </AnimatePresence>

      {/* Global Formation and Content Preview Modal */}
      <FormationContentPreviewModal
        isOpen={showFormationPreviewModal}
        onClose={() => setShowFormationPreviewModal(false)}
        lessons={lessons}
        instructors={instructors}
        onSelectLesson={(lesson) => {
          setActiveTab('cursos');
        }}
        onOpenPlansModal={() => setIsPlansModalOpen(true)}
      />

      {/* Global Somatic Posing Prototype Modal */}
      <SomaticPosingPrototypeModal
        isOpen={showSomaticPosingModal}
        onClose={() => setShowSomaticPosingModal(false)}
      />
    </div>
    </ProtectedRoute>
  );
}
