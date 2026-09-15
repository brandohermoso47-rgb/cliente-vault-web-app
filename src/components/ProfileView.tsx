import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, 
  Settings, 
  Plus, 
  Camera, 
  UploadCloud, 
  Share2, 
  Sparkles, 
  Flame, 
  Award, 
  CheckCircle2, 
  Instagram, 
  Grid, 
  Film, 
  Bookmark, 
  Play, 
  X, 
  ChevronRight, 
  Trash2, 
  Maximize2, 
  Check, 
  LogOut, 
  Globe, 
  Mail, 
  CreditCard, 
  AlertTriangle, 
  Clock, 
  Target, 
  Heart, 
  MessageCircle, 
  Download, 
  QrCode, 
  Copy, 
  Upload, 
  CloudLightning, 
  Users, 
  Sliders, 
  Eye, 
  FileText,
  UserCheck,
  ShieldCheck,
  Music,
  Radio,
  Droplet,
  Bell
} from 'lucide-react';
import { User, PracticeLog } from '../types';
import { auth, googleProvider, db, storage } from '../firebase';
import SpotifyPlaylistModal from './SpotifyPlaylistModal';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Language, translations } from '../lib/translations';
import Logo from './Logo';
import { InstructorPushSubscriptionSettings } from './InstructorPushSubscriptionSettings';

interface ProfileViewProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  language: Language;
  onOpenPlansModal?: () => void;
  initialTab?: string;
  onNavigateTab?: (tab: string) => void;
  isGrayscaleGlobal?: boolean;
  onToggleGrayscaleGlobal?: () => void;
}

export interface Goal {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface ProfilePostItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title?: string;
  caption?: string;
  category?: string;
  likesCount: number;
  commentsCount: number;
  authorId?: string;
  authorName?: string;
  createdAt?: any;
  isUserPost?: boolean;
}

export default function ProfileView({ 
  currentUser, 
  onUserChange, 
  language, 
  onOpenPlansModal,
  isGrayscaleGlobal,
  onToggleGrayscaleGlobal
}: ProfileViewProps) {
  // Modal states
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDancerCardModal, setShowDancerCardModal] = useState(false);
  const [showSpotifyModal, setShowSpotifyModal] = useState(false);
  const [showPushSettingsModal, setShowPushSettingsModal] = useState(false);
  const [selectedHighlight, setSelectedHighlight] = useState<any | null>(null);
  const [lightboxItem, setLightboxItem] = useState<ProfilePostItem | null>(null);

  // Settings Modal internal tab
  const [settingsTab, setSettingsTab] = useState<'expediente' | 'entrenamiento' | 'notificaciones' | 'google' | 'spotify' | 'suscripcion' | 'preferencias'>('expediente');

  // Grid filter tab
  const [activeGridTab, setActiveGridTab] = useState<'all' | 'reels' | 'saved'>('all');

  // Toast message
  const [profileToast, setProfileToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setProfileToast(msg);
    setTimeout(() => setProfileToast(null), 3500);
  };

  // Firebase Auth sync state
  const [firebaseUser, setFirebaseUser] = useState(auth.currentUser);

  // Local user editing state
  const [name, setName] = useState(currentUser.name || 'Bailarín');
  const [nickname, setNickname] = useState(currentUser.nickname || `@${(currentUser.name || 'dancer').toLowerCase().replace(/\s+/g, '')}`);
  const [bio, setBio] = useState(currentUser.bio || 'Bailarín apasionado por el Waacking / Whacking, musicalidad y expresión libre. 💃✨');
  const [level, setLevel] = useState(currentUser.level || 'intermediate');
  const [instagram, setInstagram] = useState(currentUser.instagram || '@waackon_official');
  const [targetMinutes, setTargetMinutes] = useState(currentUser.targetMinutes || 30);
  const [hydrationReminders, setHydrationReminders] = useState<boolean>(
    currentUser.hydrationReminders ?? currentUser.trainingPreferences?.hydrationReminders ?? true
  );
  const [lessonNotifications, setLessonNotifications] = useState<boolean>(
    currentUser.lessonNotifications ?? currentUser.trainingPreferences?.lessonNotifications ?? true
  );

  // Sync state whenever currentUser prop changes
  useEffect(() => {
    if (currentUser) {
      if (currentUser.targetMinutes !== undefined) setTargetMinutes(currentUser.targetMinutes);
      const hydr = currentUser.hydrationReminders ?? currentUser.trainingPreferences?.hydrationReminders;
      if (hydr !== undefined) setHydrationReminders(hydr);
      const less = currentUser.lessonNotifications ?? currentUser.trainingPreferences?.lessonNotifications;
      if (less !== undefined) setLessonNotifications(less);
    }
  }, [currentUser]);

  // Central Training Configuration persist helper that uses updateUserAndPersist (via onUserChange) and syncs to Firebase
  const updateUserAndPersist = async (newTargetMinutes: number, newHydration: boolean, newNotifications: boolean) => {
    setTargetMinutes(newTargetMinutes);
    setHydrationReminders(newHydration);
    setLessonNotifications(newNotifications);

    const updatedUser: User = {
      ...currentUser,
      name,
      nickname,
      bio,
      level,
      instagram,
      targetMinutes: newTargetMinutes,
      hydrationReminders: newHydration,
      lessonNotifications: newNotifications,
      trainingPreferences: {
        hydrationReminders: newHydration,
        lessonNotifications: newNotifications
      }
    };

    onUserChange(updatedUser);

    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          targetMinutes: newTargetMinutes,
          hydrationReminders: newHydration,
          lessonNotifications: newNotifications,
          trainingPreferences: {
            hydrationReminders: newHydration,
            lessonNotifications: newNotifications
          },
          updatedAt: new Date().toISOString()
        }, { merge: true });
        setSyncStatus('cloud');
      } catch (err) {
        console.error('Error in direct Firestore training preferences save:', err);
      }
    }

    showToast('¡Configuración de entrenamiento guardada en Firebase!');
  };

  // Practice Logs for CSV Export
  const [practiceLogs, setPracticeLogs] = useState<PracticeLog[]>([]);

  useEffect(() => {
    const activeUid = firebaseUser?.uid || currentUser.id;
    if (!activeUid) return;

    // Load local storage fallback first
    try {
      const saved = localStorage.getItem('waacking_practice_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPracticeLogs(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    }

    // Subscribe to Firestore practice logs
    const unsub = onSnapshot(
      collection(db, 'users', activeUid, 'practice_logs'),
      (snapshot) => {
        if (!snapshot.empty) {
          const logs = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as PracticeLog));
          logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setPracticeLogs(logs);
        }
      },
      (err) => {
        console.warn('Practice logs listener error:', err);
      }
    );

    return () => unsub();
  }, [firebaseUser?.uid, currentUser.id]);

  // Export Practice History to downloadable CSV file
  const exportPracticeLogsCSV = () => {
    let logsToExport = practiceLogs;

    // Fallback to localStorage if state is currently empty
    if (!logsToExport || logsToExport.length === 0) {
      try {
        const saved = localStorage.getItem('waacking_practice_logs');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            logsToExport = parsed;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (!logsToExport || logsToExport.length === 0) {
      showToast('No hay registros de entrenamiento disponibles para exportar.');
      return;
    }

    // Header row
    const headers = ['ID', 'Fecha', 'Minutos', 'Tipo de Actividad', 'Descripción', 'Categoría', 'BPM'];

    // Data rows
    const csvRows = logsToExport.map(log => {
      const sanitize = (text?: string | number) => {
        if (text === undefined || text === null) return '""';
        const str = String(text).replace(/"/g, '""');
        return `"${str}"`;
      };

      return [
        sanitize(log.id),
        sanitize(log.date),
        log.minutes || 0,
        sanitize(log.activityType),
        sanitize(log.description),
        sanitize(log.category || 'General'),
        log.bpm || ''
      ].join(',');
    });

    // Add UTF-8 Byte Order Mark (BOM) so Excel opens UTF-8 text (accents, emojis) properly
    const csvContent = '\uFEFF' + [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const usernameSanitized = (currentUser.nickname || currentUser.name || 'alumno')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');
    const todayStr = new Date().toISOString().split('T')[0];
    const filename = `historial_practica_${usernameSanitized}_${todayStr}.csv`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`¡Historial (${logsToExport.length} registros) exportado en CSV correctamente!`);
  };

  // Subscription state
  const [billingStatus, setBillingStatus] = useState<'active' | 'cancelled'>(currentUser.billingStatus || 'active');
  const [invoiceDownloadingId, setInvoiceDownloadingId] = useState<string | null>(null);
  const [invoiceDownloadProgress, setInvoiceDownloadProgress] = useState(0);

  // Dynamic Level & Progress calculation for smooth animated fill bar
  const completedLessonsCount = (currentUser && Array.isArray(currentUser.completedLessons)) ? currentUser.completedLessons.length : 12;
  const currentLevelNumber = typeof currentUser?.level === 'number' 
    ? currentUser.level 
    : (parseInt(String(currentUser?.level || '1').replace(/\D/g, ''), 10) || 2);
  const targetLessonsForLevel = 16;
  const progressPercent = Math.min(100, Math.max(15, Math.round((completedLessonsCount / targetLessonsForLevel) * 100)));

  // Firebase Auth sync
  const [syncStatus, setSyncStatus] = useState<'local' | 'cloud'>('local');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Upload Form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFileType, setUploadFileType] = useState<'image' | 'video'>('video');
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Práctica');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  // Posts & Reels Feed state
  const [postsFeed, setPostsFeed] = useState<ProfilePostItem[]>([]);

  // Default sample posts for grid when user has no posts
  const defaultSamplePosts: ProfilePostItem[] = [
    {
      id: 'sample-1',
      type: 'video',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4',
      title: 'Waack Rolls a 128 BPM',
      caption: 'Entrenando técnica de brazos y musicalidad disco. #Waacking #WaackON',
      category: 'Práctica',
      likesCount: 142,
      commentsCount: 18,
      isUserPost: true
    },
    {
      id: 'sample-2',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=600',
      title: 'Pose & Lines Workshop',
      caption: 'Sesión intensiva de poses congeladas y extensiones.',
      category: 'Fotos',
      likesCount: 89,
      commentsCount: 7,
      isUserPost: true
    },
    {
      id: 'sample-3',
      type: 'video',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-dancer-performing-a-routine-41525-large.mp4',
      title: 'Freestyle Battle Round 1',
      caption: 'Expresando la emoción del soul clásico. #WaackONBattle',
      category: 'Batalla',
      likesCount: 230,
      commentsCount: 34,
      isUserPost: true
    },
    {
      id: 'sample-4',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600',
      title: 'Backstage Vibe',
      caption: 'Antes de subir al escenario en el Waack ON Fest 2026.',
      category: 'Fotos',
      likesCount: 112,
      commentsCount: 12,
      isUserPost: true
    },
    {
      id: 'sample-5',
      type: 'video',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-hip-hop-under-a-bridge-41526-large.mp4',
      title: 'Sincopa & Disco Groove',
      caption: 'Práctica libre de la lección 4 del módulo intermedio.',
      category: 'Reels',
      likesCount: 175,
      commentsCount: 22,
      isUserPost: true
    },
    {
      id: 'sample-6',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
      title: 'New Outfit & Energy',
      caption: 'Listos para la clase en vivo con el maestro.',
      category: 'Fotos',
      likesCount: 95,
      commentsCount: 9,
      isUserPost: true
    }
  ];

  // Highlights / Story circles data
  const storyHighlights = [
    { id: 'h1', title: 'Elite Waacker', icon: '👑', color: 'from-[#D9A9FF] to-amber-600', desc: 'Rango alcanzado por completar más de 15 lecciones avanzadas.' },
    { id: 'h2', title: '7d Racha', icon: '🔥', color: 'from-[#FF6126] to-[#FF2E63]', desc: '¡Has practicado 7 días consecutivos esta semana!' },
    { id: 'h3', title: 'Arm Control', icon: '⚡', color: 'from-amber-400 to-yellow-500', desc: 'Insignia por perfeccionar la técnica de rolls y poses en ángulo recto.' },
    { id: 'h4', title: 'Battle Winner', icon: '🏆', color: 'from-[#FF007A] to-purple-600', desc: 'Ganador del reto comunitario de freestyle del mes.' },
    { id: 'h5', title: 'Reels Star', icon: '🎬', color: 'from-pink-500 to-rose-600', desc: 'Más de 5 videos subidos a la comunidad Waack ON.' },
    { id: 'h6', title: 'Meta Diaria', icon: '🎯', color: 'from-emerald-400 to-teal-600', desc: 'Cumplimiento constante de 30 minutos de práctica diaria.' },
  ];

  // Sync Auth and Fetch Firestore Reels
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        setSyncStatus('cloud');
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setName(data.name || user.displayName || 'Bailarín');
            setNickname(data.nickname || `@${(data.name || 'dancer').toLowerCase().replace(/\s+/g, '')}`);
            setBio(data.bio || bio);
            setLevel(data.level || 'intermediate');
            setInstagram(data.instagram || '@waackon_official');
            setTargetMinutes(data.targetMinutes || 30);
            setBillingStatus(data.billingStatus || 'active');
          }
        } catch (e) {
          console.warn('Firestore user fetch error:', e);
        }
      } else {
        setSyncStatus('local');
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Fetch Firestore Reels in real time
  useEffect(() => {
    try {
      const q = query(collection(db, 'reels'), orderBy('createdAt', 'desc'));
      const unsubscribeReels = onSnapshot(q, (snapshot) => {
        const fetched: ProfilePostItem[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          fetched.push({
            id: docSnap.id,
            type: d.videoUrl ? 'video' : 'image',
            url: d.videoUrl || d.imageUrl || d.url || 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=600',
            title: d.title || d.songTitle || 'Práctica Waacking',
            caption: d.caption || d.description || '',
            category: d.category || 'Reels',
            likesCount: d.likesCount || d.likes || 1,
            commentsCount: d.commentsCount || (d.comments ? d.comments.length : 0),
            authorId: d.authorId || d.userId,
            authorName: d.authorName || d.songArtist,
            isUserPost: true
          });
        });

        if (fetched.length > 0) {
          setPostsFeed(fetched);
        } else {
          setPostsFeed(defaultSamplePosts);
        }
      }, (err) => {
        console.warn('Reels snapshot error, using default sample posts:', err);
        setPostsFeed(defaultSamplePosts);
      });

      return () => unsubscribeReels();
    } catch (err) {
      console.warn('Could not subscribe to reels:', err);
      setPostsFeed(defaultSamplePosts);
    }
  }, []);

  // Save Profile Changes
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    const updatedUser: User = {
      ...currentUser,
      name,
      nickname,
      bio,
      level,
      instagram,
      targetMinutes,
      hydrationReminders,
      lessonNotifications,
      trainingPreferences: {
        hydrationReminders,
        lessonNotifications
      },
      billingStatus
    };

    onUserChange(updatedUser);

    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          name,
          nickname,
          bio,
          level,
          instagram,
          targetMinutes,
          hydrationReminders,
          lessonNotifications,
          trainingPreferences: {
            hydrationReminders,
            lessonNotifications
          },
          billingStatus,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        setSyncStatus('cloud');
      } catch (err) {
        console.error('Error saving profile to Firestore:', err);
      }
    }

    setIsSaving(false);
    setSaveSuccess(true);
    showToast('¡Perfil actualizado con éxito!');
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Google Auth Handlers
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setFirebaseUser(result.user);
      setSyncStatus('cloud');
      showToast('¡Sesión iniciada con Google!');
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setAuthError('Error de inicio de sesión con Google.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setFirebaseUser(null);
      setSyncStatus('local');
      showToast('Has cerrado sesión.');
    } catch (err) {
      console.error(err);
    }
  };

  // Invoice Download Simulation
  const handleDownloadInvoice = (invoiceId: string) => {
    setInvoiceDownloadingId(invoiceId);
    setInvoiceDownloadProgress(0);
    const interval = setInterval(() => {
      setInvoiceDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setInvoiceDownloadingId(null);
            showToast(`Factura ${invoiceId} descargada en PDF.`);
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  // Upload Modal File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    const isVideo = file.type.startsWith('video');
    setUploadFileType(isVideo ? 'video' : 'image');

    const previewUrl = URL.createObjectURL(file);
    setUploadPreviewUrl(previewUrl);
    setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
  };

  // Execute Upload to Firebase Storage + Firestore
  const handlePerformUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile && !uploadPreviewUrl) {
      showToast('Selecciona un archivo de video o imagen.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    let mediaUrl = uploadPreviewUrl || '';

    try {
      // 1. Upload to Firebase Storage if real file exists
      if (uploadFile) {
        const fileExt = uploadFile.name.split('.').pop();
        const fileName = `uploads/${currentUser.id}_${Date.now()}.${fileExt}`;
        const storageRef = ref(storage, fileName);

        const uploadTask = uploadBytesResumable(storageRef, uploadFile);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              setUploadProgress(progress);
            },
            (error) => {
              console.warn('Storage upload error, falling back to local object URL:', error);
              resolve(); // Fallback graciously
            },
            async () => {
              try {
                mediaUrl = await getDownloadURL(uploadTask.snapshot.ref);
              } catch (e) {
                console.warn('Get download URL fallback:', e);
              }
              resolve();
            }
          );
        });
      }

      setUploadProgress(90);

      // 2. Save document to Firestore collection `reels`
      const newPostData = {
        title: uploadTitle || 'Nueva Práctica Waack ON',
        caption: uploadCaption || 'Publicado desde mi perfil de bailarín.',
        category: uploadCategory,
        [uploadFileType === 'video' ? 'videoUrl' : 'imageUrl']: mediaUrl,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        likesCount: 1,
        commentsCount: 0,
        createdAt: serverTimestamp()
      };

      let newDocId = `post-${Date.now()}`;
      try {
        const docRef = await addDoc(collection(db, 'reels'), newPostData);
        newDocId = docRef.id;
      } catch (fsErr) {
        console.warn('Could not save post to Firestore collection reels:', fsErr);
      }

      // 3. Update local UI feed
      const newLocalPost: ProfilePostItem = {
        id: newDocId,
        type: uploadFileType,
        url: mediaUrl,
        title: uploadTitle || 'Nueva Práctica Waack ON',
        caption: uploadCaption,
        category: uploadCategory,
        likesCount: 1,
        commentsCount: 0,
        isUserPost: true
      };

      setPostsFeed((prev) => [newLocalPost, ...prev]);

      setUploadProgress(100);
      setIsUploading(false);
      setShowUploadModal(false);

      // Reset form
      setUploadFile(null);
      setUploadPreviewUrl(null);
      setUploadTitle('');
      setUploadCaption('');

      showToast('¡Publicación subida exitosamente!');
    } catch (err) {
      console.error('Upload Error:', err);
      setIsUploading(false);
      showToast('Ocurrió un error al subir el archivo.');
    }
  };

  // Delete Post
  const handleDeletePost = async (postId: string) => {
    setPostsFeed((prev) => prev.filter((p) => p.id !== postId));
    if (lightboxItem?.id === postId) setLightboxItem(null);

    try {
      await deleteDoc(doc(db, 'reels', postId));
    } catch (e) {
      console.warn('Delete firestore post fallback:', e);
    }

    showToast('Publicación eliminada.');
  };

  // Filter feed items for 3x3 grid
  const filteredGridItems = postsFeed.filter((item) => {
    if (activeGridTab === 'reels') return item.type === 'video';
    return true; // 'all' or 'saved'
  });

  return (
    <div className="flex-1 min-h-full w-full bg-[#0A0A0E] text-slate-900 dark:text-white flex flex-col font-body-md pb-16 scroll-smooth">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {profileToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#D9A9FF] text-black font-extrabold text-xs px-5 py-3 rounded-full shadow-[0_10px_30px_rgba(217, 169, 255,0.4)] flex items-center gap-2 border border-black/20"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>{profileToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 1. BARRA PRINCIPAL SUPERIOR (TOP ACTION BAR) */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0A0A0E]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo variant="compact" className="w-8 h-8 shrink-0" />
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-black tracking-wider uppercase font-mono text-slate-900 dark:text-white truncate max-w-[160px] sm:max-w-none">
              {nickname || `@${currentUser.name.toLowerCase().replace(/\s+/g, '')}`}
            </h1>
            <span className="w-2 h-2 rounded-full bg-[#D9A9FF] animate-pulse" title="Bailarín Verificado" />
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* BOTÓN DE SUBIDA (+ / 📷) */}
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#FF6126] via-[#FF2E63] to-[#FF007A] text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,46,99,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Subir fotos de práctica o videos/reels"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <Camera className="w-4 h-4 hidden sm:inline" />
            <span className="hidden md:inline">{language === 'es' ? 'Subir' : 'Upload'}</span>
          </button>

          {/* BOTÓN DE VER Y COMPARTIR TARJETA DE BAILARÍN ("PERFIL") */}
          <button
            type="button"
            onClick={() => setShowDancerCardModal(true)}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-900 dark:text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
            title="Vista previa de Tarjeta Oficial de Bailarín"
          >
            <QrCode className="w-4 h-4 text-[#D9A9FF]" />
            <span className="hidden sm:inline">{language === 'es' ? 'Perfil' : 'Profile Card'}</span>
          </button>

          {/* BOTÓN DE NOTIFICACIONES PUSH (🔔) */}
          <button
            type="button"
            onClick={() => setShowPushSettingsModal(true)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer relative"
            title="Ajustes de Notificaciones Push de Instructores"
          >
            <Bell className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Push</span>
            {currentUser.pushEnabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            )}
          </button>

          {/* ICONO DE CONFIGURACIÓN (ENGRANAJE ⚙️) */}
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-900 dark:text-white transition-all cursor-pointer hover:rotate-45"
            title="Ajustes de cuenta, expediente y suscripción"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-200" />
          </button>

        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-6 space-y-6">

        {/* ========================================================================= */}
        {/* 2. CABECERA DE PERFIL E IDENTIDAD */}
        {/* ========================================================================= */}
        <section className="bg-[#121218] border border-slate-200 dark:border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FF2E63]/10 via-[#E9C349]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Profile Row: Avatar + Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 z-10 relative">
            
            {/* Glowing Circular Avatar */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-[#FF2E63] via-[#D9A9FF] to-amber-500 shadow-[0_0_25px_rgba(255,46,99,0.5)] flex items-center justify-center">
                <img 
                  src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600"} 
                  alt={currentUser.name} 
                  className="w-full h-full rounded-full object-cover border-2 border-black"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className="absolute bottom-1 right-1 bg-[#FF2E63] text-white p-2 rounded-full border-2 border-[#121218] shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer"
                title="Cambiar avatar en ajustes"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            {/* Main Info */}
            <div className="space-y-2 flex-1 min-w-0">
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-wide font-mono">
                  {currentUser.name}
                </h2>
                {currentUser.role === 'instructor' ? (
                  <span className="px-3 py-1 rounded-full bg-[#D9A9FF]/20 border border-[#D9A9FF]/40 text-[#D9A9FF] text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#D9A9FF]" />
                    <span>INSTRUCTOR SENIOR</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-[#D9A9FF]/20 border border-[#D9A9FF]/40 text-[#D9A9FF] text-[10px] font-mono font-black uppercase tracking-wider">
                    {level === 'advanced' ? 'Elite Pro 🌟' : level === 'intermediate' ? 'Rhythm Master ⚡' : 'Iniciado 🌱'}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-600 dark:text-slate-300 font-mono">
                <span className="font-extrabold text-slate-900 dark:text-white">{nickname}</span>
                <span className="text-slate-400 dark:text-slate-500">•</span>
                <a 
                  href={`https://instagram.com/${instagram.replace('@', '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-pink-400 hover:text-pink-300 transition-colors font-bold"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>{instagram}</span>
                </a>
              </div>

              {/* Biography */}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1 max-w-xl">
                {bio}
              </p>

              {/* Progress Bar towards Next Level or Instructor Academy Status */}
              {currentUser.role === 'instructor' ? (
                <div className="pt-2 p-3 bg-amber-50 dark:bg-[#181822] border border-[#E9C349]/30 rounded-xl space-y-1 max-w-md shadow-lg">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#E9C349] uppercase">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#D9A9FF]" />
                      <span>MODO DOCENTE & MÉTRICAS DE ACADEMIA</span>
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">DOCENTE ACTIVO</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                    Gestión de evaluaciones, catálogo de cursos y seguimiento personalizado.
                  </p>
                </div>
              ) : (
                <div className="pt-2 space-y-1.5 max-w-md">
                  <div className="flex justify-between text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#D9A9FF]" />
                      <span>Rango & Nivel {currentLevelNumber}</span>
                    </span>
                    <span className="text-[#D9A9FF] font-black">{progressPercent}% ({completedLessonsCount}/{targetLessonsForLevel} Clases)</span>
                  </div>
                  <div className="h-3 w-full bg-slate-200 dark:bg-black/60 rounded-full overflow-hidden p-0.5 border border-slate-300 dark:border-white/20 shadow-inner relative">
                    <motion.div 
                      initial={{ width: '0%' }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-[#FF6126] via-[#FF2E63] to-[#D9A9FF] rounded-full relative overflow-hidden shadow-[0_0_15px_rgba(217, 169, 255,0.6)]"
                    >
                      <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-1/3"
                      />
                    </motion.div>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* COMPACT METRICS ROW: DYNAMIC ACCORDING TO ROLE */}
          {currentUser.role === 'instructor' ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 pt-4 border-t border-white/10 text-center font-mono">
              <div className="bg-white/5 hover:bg-white/10 p-2.5 sm:p-3 rounded-2xl border border-[#D9A9FF]/30 transition-all">
                <p className="text-lg sm:text-2xl font-black text-[#D9A9FF]">128</p>
                <p className="text-[9px] sm:text-[11px] text-slate-300 font-bold uppercase truncate">Alumnos Activos</p>
              </div>

              <div className="bg-white/5 hover:bg-white/10 p-2.5 sm:p-3 rounded-2xl border border-white/10 transition-all">
                <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">385</p>
                <p className="text-[9px] sm:text-[11px] text-slate-400 font-bold uppercase truncate">Evaluaciones</p>
              </div>

              <div className="bg-white/5 hover:bg-white/10 p-2.5 sm:p-3 rounded-2xl border border-white/10 transition-all">
                <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">24</p>
                <p className="text-[9px] sm:text-[11px] text-slate-400 font-bold uppercase truncate">Clases Publicadas</p>
              </div>

              <div className="bg-white/5 hover:bg-white/10 p-2.5 sm:p-3 rounded-2xl border border-white/10 transition-all">
                <p className="text-lg sm:text-2xl font-black text-emerald-400">92.4%</p>
                <p className="text-[9px] sm:text-[11px] text-slate-400 font-bold uppercase truncate">Tasa Feedback</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:gap-4 pt-4 border-t border-white/10 text-center font-mono">
              <div className="bg-white/5 hover:bg-white/10 p-2.5 sm:p-3 rounded-2xl border border-white/10 transition-all">
                <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">{(postsFeed || []).length}</p>
                <p className="text-[9px] sm:text-[11px] text-slate-400 font-bold uppercase truncate">Publicaciones</p>
              </div>

              <div className="bg-white/5 hover:bg-white/10 p-2.5 sm:p-3 rounded-2xl border border-white/10 transition-all">
                <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">24</p>
                <p className="text-[9px] sm:text-[11px] text-slate-400 font-bold uppercase truncate">Amigos</p>
              </div>

              <div className="bg-white/5 hover:bg-white/10 p-2.5 sm:p-3 rounded-2xl border border-white/10 transition-all">
                <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
                  {(currentUser && Array.isArray(currentUser.completedLessons)) ? currentUser.completedLessons.length : 12}
                </p>
                <p className="text-[9px] sm:text-[11px] text-slate-400 font-bold uppercase truncate">Clases</p>
              </div>

              <div className="bg-white/5 hover:bg-white/10 p-2.5 sm:p-3 rounded-2xl border border-white/10 transition-all">
                <p className="text-lg sm:text-2xl font-black text-[#FF2E63] flex items-center justify-center gap-1">
                  <span>7</span>
                  <Flame className="w-4 h-4 fill-[#FF2E63]" />
                </p>
                <p className="text-[9px] sm:text-[11px] text-slate-400 font-bold uppercase truncate">Racha</p>
              </div>
            </div>
          )}

          {/* HISTORIAS Y LOGROS DESTACADOS (HORIZONTAL SCROLL CIRCLES) */}
          <div className="pt-2">
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">
              Historias & Logros Destacados
            </p>
            <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
              {storyHighlights.map((hl) => (
                <button
                  key={hl.id}
                  type="button"
                  onClick={() => setSelectedHighlight(hl)}
                  className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
                >
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-tr ${hl.color} shadow-lg group-hover:scale-105 transition-transform flex items-center justify-center`}>
                    <div className="w-full h-full rounded-full bg-[#121218] flex items-center justify-center text-xl sm:text-2xl border border-black">
                      {hl.icon}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white truncate max-w-[70px]">
                    {hl.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* PANEL DE CONFIGURACIÓN DE ENTRENAMIENTO */}
        {/* ========================================================================= */}
        <section className="bg-[#121218] border border-[#D9A9FF]/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#D9A9FF]/10 via-amber-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

          {/* Panel Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 z-10 relative">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-[#D9A9FF] to-amber-600 text-black shadow-lg shadow-amber-500/20">
                <Target className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase font-mono tracking-wider flex items-center gap-2">
                  <span>Configuración de Entrenamiento</span>
                  <span className="text-[10px] bg-[#D9A9FF]/20 text-[#D9A9FF] px-2 py-0.5 rounded-full border border-[#D9A9FF]/40 font-mono font-bold">
                    ACTIVO
                  </span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Ajusta tu meta diaria de minutos y activa/desactiva recordatorios de práctica y alertas.
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full self-start sm:self-center flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sincronizado con Firebase
            </span>
          </div>

          {/* Panel Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 z-10 relative">
            
            {/* 1. Meta de Minutos Diarios (Número) */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 flex flex-col justify-between hover:border-[#D9A9FF]/40 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono font-bold text-[#D9A9FF] uppercase flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#D9A9FF]" />
                    <span>Meta de Minutos Diarios</span>
                  </label>
                  <span className="text-xs font-mono font-black text-slate-900 dark:text-white bg-slate-900/10 dark:bg-black/50 px-2.5 py-0.5 rounded-lg border border-white/15">
                    {targetMinutes} min/día
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Define el objetivo numérico de minutos diarios para tu rutina de baile y seguimiento.
                </p>
              </div>

              {/* Controls: Input Number + Quick Buttons */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={5}
                    max={300}
                    step={5}
                    value={targetMinutes}
                    onChange={(e) => {
                      const val = Math.max(5, Math.min(300, Number(e.target.value) || 5));
                      updateUserAndPersist(val, hydrationReminders, lessonNotifications);
                    }}
                    className="w-full bg-white dark:bg-black/60 border border-white/20 rounded-xl px-4 py-2 text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-[#E9C349] transition-colors"
                  />
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-bold">min</span>
                </div>

                {/* Quick Preset Pills */}
                <div className="flex items-center gap-1.5 pt-1 overflow-x-auto scrollbar-none">
                  {[15, 30, 45, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => updateUserAndPersist(mins, hydrationReminders, lessonNotifications)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        targetMinutes === mins
                          ? 'bg-[#E9C349] text-black font-black shadow-md'
                          : 'bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/20 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Toggles: Hidratación & Lecciones */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4 flex flex-col justify-between hover:border-[#D9A9FF]/40 transition-colors">
              
              {/* Toggle 1: Recordatorios de Hidratación */}
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 uppercase">
                    <Droplet className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
                    <span>Recordatorios de Hidratación</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Avisos periódicos para beber agua durante tus sesiones intensas de baile.
                  </p>
                </div>

                {/* Animated Toggle Switch */}
                <button
                  type="button"
                  onClick={() => updateUserAndPersist(targetMinutes, !hydrationReminders, lessonNotifications)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 cursor-pointer ${
                    hydrationReminders ? 'bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]' : 'bg-slate-700'
                  }`}
                  aria-label="Toggle recordatorios de hidratación"
                >
                  <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`w-4 h-4 rounded-full bg-white shadow-md ${
                      hydrationReminders ? 'ml-6' : 'ml-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2: Notificaciones de Nuevas Lecciones */}
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-pink-400 uppercase">
                    <Bell className="w-4 h-4 text-pink-400 fill-pink-400/20" />
                    <span>Notificaciones de Nuevas Lecciones</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Alertas automáticas al publicarse nuevas lecciones o ejercicios de baile.
                  </p>
                </div>

                {/* Animated Toggle Switch */}
                <button
                  type="button"
                  onClick={() => updateUserAndPersist(targetMinutes, hydrationReminders, !lessonNotifications)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 cursor-pointer ${
                    lessonNotifications ? 'bg-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.5)]' : 'bg-slate-700'
                  }`}
                  aria-label="Toggle notificaciones de nuevas lecciones"
                >
                  <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`w-4 h-4 rounded-full bg-white shadow-md ${
                      lessonNotifications ? 'ml-6' : 'ml-0'
                    }`}
                  />
                </button>
              </div>

            </div>

            {/* 3. Exportar Historial de Práctica (Logs CSV) */}
            <div className="md:col-span-2 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-[#D9A9FF]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#D9A9FF]/60 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#D9A9FF] uppercase">
                  <Download className="w-4 h-4 text-[#D9A9FF]" />
                  <span>Exportar Historial de Práctica (CSV)</span>
                  <span className="text-[10px] bg-white/10 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded-full font-mono font-bold">
                    {practiceLogs.length} registros
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 max-w-xl">
                  Descarga un archivo CSV descargable con tus registros de práctica (minutos, tipo de actividad, lección, BPM y notas) para analizar tu progreso fuera de la plataforma.
                </p>
              </div>

              <button
                type="button"
                onClick={exportPracticeLogsCSV}
                className="px-4 py-2.5 rounded-xl bg-[#D9A9FF] hover:bg-[#F2CFFF] text-black font-mono font-black text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Descargar CSV</span>
              </button>
            </div>

            {/* 4. Notificaciones Push de Instructores (Acceso Rápido al Diálogo Flotante) */}
            <div className="md:col-span-2 bg-gradient-to-r from-purple-100 via-purple-50 to-transparent dark:from-purple-950/40 dark:via-purple-900/20 dark:to-transparent border border-purple-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-purple-500/60 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-700 dark:text-purple-300 uppercase">
                  <Bell className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  <span>Notificaciones Push de Instructores</span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                    {currentUser.pushEnabled ? '🟢 Activas' : '🔴 Inactivas'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 max-w-xl">
                  Configura alertas personalizadas por instructor, reviews de video y masterclasses en un diálogo flotante optimizado.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPushSettingsModal(true)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-purple-500/20 active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
                <span>Configurar Push</span>
              </button>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. SEGUNDA BARRA Y CUADRÍCULA DE CONTENIDO (INSTAGRAM FEED GRID 3x3) */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          
          {/* BARRA DIVISORIA DE CONTENIDO */}
          <div className="flex items-center justify-around border-y border-slate-200 dark:border-white/10 py-3 bg-white/80 dark:bg-[#121218]/80 backdrop-blur-md rounded-2xl font-mono text-xs font-bold uppercase">
            
            <button
              type="button"
              onClick={() => setActiveGridTab('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeGridTab === 'all'
                  ? 'bg-white/10 text-[#E9C349] border border-[#E9C349]/40 shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline">Publicaciones</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveGridTab('reels')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeGridTab === 'reels'
                  ? 'bg-white/10 text-[#FF2E63] border border-[#FF2E63]/40 shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Film className="w-4 h-4" />
              <span className="hidden sm:inline">Reels & Videos</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveGridTab('saved')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeGridTab === 'saved'
                  ? 'bg-white/10 text-cyan-400 border border-cyan-500/40 shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span className="hidden sm:inline">Guardados</span>
            </button>

          </div>

          {/* CUADRÍCULA 3x3 PRINCIPAL */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2.5">
            {filteredGridItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setLightboxItem(item)}
                className="group relative aspect-square bg-[#121218] rounded-xl overflow-hidden border border-white/10 cursor-pointer shadow-md hover:border-[#D9A9FF]/60 transition-all"
              >
                {/* Media Preview Thumbnail */}
                {item.type === 'video' ? (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={item.title || 'Foto'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}

                {/* Video Indicator Badge */}
                {item.type === 'video' && (
                  <div className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white border border-white/20">
                    <Film className="w-3.5 h-3.5 text-[#FF2E63]" />
                  </div>
                )}

                {/* Hover / Touch Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-opacity duration-200 text-white font-mono font-bold text-xs">
                  <div className="flex items-center gap-1 text-pink-400">
                    <Heart className="w-4 h-4 fill-pink-400" />
                    <span>{item.likesCount}</span>
                  </div>
                  <div className="flex items-center gap-1 text-cyan-400">
                    <MessageCircle className="w-4 h-4 fill-cyan-400" />
                    <span>{item.commentsCount}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </section>

      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: CONFIGURACIÓN Y AJUSTES (ENGRANAJE ⚙️) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#121218] border border-white/20 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-white/10 text-[#D9A9FF]">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white font-mono uppercase">
                      Ajustes del Perfil de Bailarín
                    </h3>
                    <p className="text-xs text-slate-400">Gestiona tus datos, sincronización y membresía</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Internal Settings Tabs */}
              <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setSettingsTab('expediente')}
                  className={`px-3 py-2 rounded-xl font-bold uppercase transition-all cursor-pointer ${
                    settingsTab === 'expediente' ? 'bg-[#D9A9FF] text-black' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Expediente
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsTab('entrenamiento')}
                  className={`px-3 py-2 rounded-xl font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                    settingsTab === 'entrenamiento' ? 'bg-[#D9A9FF] text-black' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Entrenamiento</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsTab('notificaciones')}
                  className={`px-3 py-2 rounded-xl font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                    settingsTab === 'notificaciones' ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.5)]' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5 text-purple-300" />
                  <span>Notificaciones</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsTab('google')}
                  className={`px-3 py-2 rounded-xl font-bold uppercase transition-all cursor-pointer ${
                    settingsTab === 'google' ? 'bg-[#FF2E63] text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Google Sync
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsTab('spotify')}
                  className={`px-3 py-2 rounded-xl font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                    settingsTab === 'spotify' ? 'bg-[#1DB954] text-black' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>Spotify Sync</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsTab('suscripcion')}
                  className={`px-3 py-2 rounded-xl font-bold uppercase transition-all cursor-pointer ${
                    settingsTab === 'suscripcion' ? 'bg-cyan-500 text-black' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Suscripción
                </button>
              </div>

              {/* TAB 1: EXPEDIENTE DE BAILARÍN */}
              {settingsTab === 'expediente' && (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block mb-1">
                        Nombre Real
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#E9C349]"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block mb-1">
                        AKA / Nickname (@)
                      </label>
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#E9C349]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block mb-1">
                      Biografía de Bailarín
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-[#E9C349]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block mb-1">
                        Usuario de Instagram
                      </label>
                      <input
                        type="text"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#E9C349]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block mb-1">
                        Meta Diaria de Práctica (min)
                      </label>
                      <input
                        type="number"
                        value={targetMinutes}
                        onChange={(e) => setTargetMinutes(Number(e.target.value))}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#E9C349]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6126] via-[#FF2E63] to-[#FF007A] text-white font-mono font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-98 transition-all cursor-pointer"
                  >
                    {isSaving ? 'Guardando...' : 'Guardar Cambios de Expediente'}
                  </button>
                </form>
              )}

              {/* TAB ENTRENAMIENTO: CONFIGURACIÓN DE ENTRENAMIENTO */}
              {settingsTab === 'entrenamiento' && (
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                    <div>
                      <label className="text-xs font-mono font-bold text-[#D9A9FF] uppercase block mb-1">
                        Meta de Minutos Diarios (Número)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min={5}
                          max={300}
                          step={5}
                          value={targetMinutes}
                          onChange={(e) => {
                            const val = Math.max(5, Math.min(300, Number(e.target.value) || 5));
                            updateUserAndPersist(val, hydrationReminders, lessonNotifications);
                          }}
                          className="w-full bg-white dark:bg-black/60 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#E9C349]"
                        />
                        <span className="text-xs font-mono font-bold text-slate-400">min/día</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-3">
                      <div>
                        <p className="text-xs font-mono font-bold text-cyan-400 uppercase">Recordatorios de Hidratación</p>
                        <p className="text-[11px] text-slate-400">Notificaciones periódicas para beber agua.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateUserAndPersist(targetMinutes, !hydrationReminders, lessonNotifications)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${hydrationReminders ? 'bg-cyan-500' : 'bg-slate-700'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${hydrationReminders ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-3">
                      <div>
                        <p className="text-xs font-mono font-bold text-pink-400 uppercase">Notificaciones de Nuevas Lecciones</p>
                        <p className="text-[11px] text-slate-400">Alertas de nuevas clases y módulos de baile.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateUserAndPersist(targetMinutes, hydrationReminders, !lessonNotifications)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${lessonNotifications ? 'bg-pink-500' : 'bg-slate-700'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${lessonNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="border-t border-white/10 pt-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-mono font-bold text-[#D9A9FF] uppercase">Exportar Historial (Logs CSV)</p>
                        <p className="text-[11px] text-slate-400">Descarga tu historial completo en formato CSV.</p>
                      </div>
                      <button
                        type="button"
                        onClick={exportPracticeLogsCSV}
                        className="px-3.5 py-2 bg-[#D9A9FF] hover:bg-[#F2CFFF] text-black font-mono font-bold text-xs rounded-xl transition-all uppercase flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>CSV</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB NOTIFICACIONES PUSH & INSTRUCTORES */}
              {settingsTab === 'notificaciones' && (
                <div className="space-y-4">
                  <InstructorPushSubscriptionSettings
                    currentUser={currentUser}
                    onUserUpdate={(updated) => onUserChange({ ...currentUser, ...updated })}
                  />
                </div>
              )}

              {/* TAB 2: GOOGLE SYNC */}
              {settingsTab === 'google' && (
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CloudLightning className={`w-5 h-5 ${syncStatus === 'cloud' ? 'text-green-400' : 'text-amber-400'}`} />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">Estado de Base de Datos</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {syncStatus === 'cloud' ? 'Sincronizado con Firestore Cloud' : 'Guardado Local en Dispositivo'}
                        </p>
                      </div>
                    </div>
                    <span className={`w-3 h-3 rounded-full ${syncStatus === 'cloud' ? 'bg-green-500' : 'bg-amber-500'}`} />
                  </div>

                  {firebaseUser ? (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-600 dark:text-slate-300">Conectado como: <strong className="text-slate-900 dark:text-white">{firebaseUser.email}</strong></p>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-mono font-bold rounded-xl transition-all uppercase"
                      >
                        Cerrar Sesión de Google
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-slate-900 dark:text-white font-mono font-bold text-xs rounded-xl transition-all uppercase flex items-center justify-center gap-2"
                    >
                      <Globe className="w-4 h-4 text-cyan-400" />
                      <span>Iniciar Sesión con Google</span>
                    </button>
                  )}
                </div>
              )}

              {/* TAB 3: SPOTIFY API PLAYLIST INTEGRATION */}
              {settingsTab === 'spotify' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#1DB954]/10 border border-[#1DB954]/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-[#1DB954] text-black rounded-xl">
                        <Music className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-mono font-bold text-[#1DB954] uppercase">Sincronización API de Spotify</p>
                        <p className="text-xs text-slate-900 dark:text-white mt-0.5">Importa y reproduce tus playlists privadas directamente en Waack ON.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSettingsModal(false);
                        setShowSpotifyModal(true);
                      }}
                      className="px-4 py-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-mono font-bold text-xs rounded-xl transition-all uppercase flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Radio className="w-4 h-4" />
                      <span>Abrir Spotify Sync</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: SUSCRIPCIÓN & FACTURAS */}
              {settingsTab === 'suscripcion' && (
                <div className="space-y-4">
                  <div className="p-4 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-500/30 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase">Membresía Waack ON Pro</p>
                      <p className="text-xs text-slate-900 dark:text-white font-bold mt-0.5">Acceso Ilimitado a Clases y Talleres</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold rounded-full uppercase">
                      Activa
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-mono font-bold text-slate-300 uppercase">Facturas Recientes</p>
                    {['INV-2026-001', 'INV-2026-002'].map((inv) => (
                      <div key={inv} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-900 dark:text-white font-bold">{inv} • $19.99 USD</span>
                        <button
                          type="button"
                          onClick={() => handleDownloadInvoice(inv)}
                          disabled={invoiceDownloadingId === inv}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-slate-900 dark:text-white rounded-lg flex items-center gap-1.5 transition-all"
                        >
                          <Download className="w-3.5 h-3.5 text-[#D9A9FF]" />
                          <span>{invoiceDownloadingId === inv ? `${invoiceDownloadProgress}%` : 'PDF'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: FORMULARIO DE SUBIDA CON FIREBASE STORAGE (+ / 📷) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#121218] border border-white/20 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5 relative"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-[#FF6126] to-[#FF2E63] text-white">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white font-mono uppercase">
                      Subir Contenido a Waack ON
                    </h3>
                    <p className="text-xs text-slate-400">Guardado en Firebase Storage y Firestore</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePerformUpload} className="space-y-4">
                
                {/* File Dropzone Input */}
                <div className="border-2 border-dashed border-white/20 hover:border-[#D9A9FF] rounded-2xl p-6 text-center cursor-pointer transition-all bg-white/5 relative overflow-hidden group">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  {uploadPreviewUrl ? (
                    <div className="space-y-2">
                      {uploadFileType === 'video' ? (
                        <video src={uploadPreviewUrl} className="max-h-40 mx-auto rounded-xl object-cover" controls />
                      ) : (
                        <img src={uploadPreviewUrl} alt="Preview" className="max-h-40 mx-auto rounded-xl object-cover" />
                      )}
                      <p className="text-xs font-mono text-[#D9A9FF] font-bold">Haz clic para cambiar archivo</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Camera className="w-8 h-8 text-[#E9C349] mx-auto group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase">
                        Selecciona o arrastra video/foto
                      </p>
                      <p className="text-[10px] text-slate-400">Soporta MP4, MOV, JPG, PNG desde tu celular o PC</p>
                    </div>
                  )}
                </div>

                {/* Title Input */}
                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block mb-1">
                    Título de la Publicación
                  </label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Ej. Práctica de Rolls 128 BPM"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#E9C349]"
                    required
                  />
                </div>

                {/* Caption Input */}
                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block mb-1">
                    Descripción / Hashtags
                  </label>
                  <textarea
                    rows={2}
                    value={uploadCaption}
                    onChange={(e) => setUploadCaption(e.target.value)}
                    placeholder="Agrega notas de tu entrenamiento o hashtags #WaackON"
                    className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-[#E9C349]"
                  />
                </div>

                {/* Category Selector */}
                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block mb-1">
                    Categoría
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full bg-white dark:bg-[#1A1A22] border border-white/20 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#E9C349]"
                  >
                    <option value="Práctica">Práctica & Técnica</option>
                    <option value="Reels">Reels & Freestyle</option>
                    <option value="Batalla">Batalla / Competición</option>
                    <option value="Fotos">Foto de Sesión</option>
                  </select>
                </div>

                {/* Progress Bar during Upload */}
                {isUploading && (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[10px] font-mono font-bold text-slate-300">
                      <span>Subiendo a Firebase Storage...</span>
                      <span className="text-[#D9A9FF]">{uploadProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#FF6126] to-[#D9A9FF] transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF6126] via-[#FF2E63] to-[#FF007A] text-white font-mono font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? 'Subiendo Archivo...' : 'Publicar en mi Perfil'}
                </button>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 3: PREVISUALIZACIÓN DE TARJETA OFICIAL DE BAILARÍN ("PERFIL") */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showDancerCardModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gradient-to-b from-[#181824] via-[#0D0D14] to-black border-2 border-[#D9A9FF]/50 rounded-3xl w-full max-w-sm p-6 shadow-[0_0_50px_rgba(217, 169, 255,0.3)] space-y-6 text-center relative overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setShowDancerCardModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-[#D9A9FF]/20 text-[#D9A9FF] text-[9px] font-mono font-bold uppercase tracking-widest border border-[#D9A9FF]/40">
                  TARJETA OFICIAL DE BAILARÍN
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-wider font-mono pt-2">
                  WAACK ON DANCER ID
                </h3>
              </div>

              {/* Card Main Body */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                <div className="w-24 h-24 mx-auto rounded-full p-1 bg-gradient-to-tr from-[#FF2E63] to-[#D9A9FF] shadow-xl">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full rounded-full object-cover border border-black"
                  />
                </div>

                <div>
                  <p className="text-lg font-black text-white">{currentUser.name}</p>
                  <p className="text-xs font-mono text-[#D9A9FF] font-bold">{nickname}</p>
                  <p className="text-[10px] text-slate-400 mt-1">ID Estudiante: #9842 • Rango Elite</p>
                </div>

                {/* Simulated QR Code */}
                <div className="bg-white p-3 rounded-xl w-32 h-32 mx-auto flex items-center justify-center shadow-lg">
                  <QrCode className="w-full h-full text-black" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('¡Enlace de perfil copiado al portapapeles!');
                }}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono font-bold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Copy className="w-4 h-4 text-[#D9A9FF]" />
                <span>Copiar Enlace de Perfil</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 4: LIGHTBOX Y PLAYER DE MEDIA (FOTO/VIDEO) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {lightboxItem && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#121218] border border-white/20 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[85vh]"
            >
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 hover:bg-black text-white border border-white/20"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Media Container */}
              <div className="w-full md:w-1/2 bg-black flex items-center justify-center p-2 relative min-h-[260px]">
                {lightboxItem.type === 'video' ? (
                  <video src={lightboxItem.url} controls autoPlay className="max-h-[60vh] w-full object-contain rounded-xl" />
                ) : (
                  <img src={lightboxItem.url} alt={lightboxItem.title} className="max-h-[60vh] w-full object-contain rounded-xl" />
                )}
              </div>

              {/* Details & Actions */}
              <div className="w-full md:w-1/2 p-5 flex flex-col justify-between space-y-4 font-mono">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-[#D9A9FF] font-bold">
                    <span>{lightboxItem.category || 'Publicación'}</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{lightboxItem.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed">{lightboxItem.caption}</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5 text-pink-400 font-bold">
                      <Heart className="w-4 h-4 fill-pink-400" />
                      {lightboxItem.likesCount} me gusta
                    </span>
                    <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                      <MessageCircle className="w-4 h-4 fill-cyan-400" />
                      {lightboxItem.commentsCount} comentarios
                    </span>
                  </div>

                  {lightboxItem.isUserPost && (
                    <button
                      type="button"
                      onClick={() => handleDeletePost(lightboxItem.id)}
                      className="w-full py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Eliminar Publicación</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 5: DETALLE DE HISTORIA / EMBLEMA */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedHighlight && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#121218] border border-white/20 rounded-3xl w-full max-w-sm p-6 text-center space-y-4 relative shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setSelectedHighlight(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-900 dark:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-5xl py-2">{selectedHighlight.icon}</div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white font-mono uppercase">{selectedHighlight.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">{selectedHighlight.desc}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Spotify Playlist Sync Modal */}
      <SpotifyPlaylistModal
        isOpen={showSpotifyModal}
        onClose={() => setShowSpotifyModal(false)}
      />

      {/* ========================================================================= */}
      {/* MODAL 6: DIÁLOGO FLOTANTE DE NOTIFICACIONES PUSH DE INSTRUCTORES */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showPushSettingsModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-3xl my-auto"
            >
              <InstructorPushSubscriptionSettings
                currentUser={currentUser}
                onUserUpdate={(updated) => onUserChange({ ...currentUser, ...updated })}
                onClose={() => setShowPushSettingsModal(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
