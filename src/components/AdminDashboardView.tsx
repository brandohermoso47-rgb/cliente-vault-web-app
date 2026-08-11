import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Users, 
  FileVideo, 
  HardDrive, 
  Search, 
  Filter, 
  Calendar, 
  Mail, 
  Eye, 
  FolderOpen, 
  ExternalLink, 
  CheckCircle2, 
  RefreshCw, 
  Activity, 
  X, 
  Video, 
  Music, 
  Award, 
  Crown,
  Sparkles,
  Download,
  Clock,
  ChevronRight
} from 'lucide-react';
import { collection, onSnapshot, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from '../types';
import Logo from './Logo';

export const ADMIN_USER_ID = 'OdXh2P0qGDaFFyNKalECKFq9ESk1';

interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status?: string;
  createdAt?: string;
  joinedDate?: string;
  updatedAt?: string;
  billingStatus?: string;
  points?: number;
  uploadedFilesCount: number;
  fileBreakdown: {
    reelsCount: number;
    practiceLogsCount: number;
    playlistsCount: number;
    instructorTracksCount: number;
    feedbackCount: number;
  };
}

interface UserUploadedFile {
  id: string;
  title: string;
  category: 'reel' | 'practice_log' | 'playlist' | 'instructor_track' | 'feedback';
  fileUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  imageUrl?: string;
  createdAt: string;
  fileSize?: string;
  caption?: string;
}

interface AdminDashboardViewProps {
  currentUser: User;
  onUserChange?: (updated: User) => void;
  language?: 'es' | 'en';
}

export default function AdminDashboardView({ currentUser, language = 'es' }: AdminDashboardViewProps) {
  const [usersList, setUsersList] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [selectedUserForFiles, setSelectedUserForFiles] = useState<AdminUserRecord | null>(null);
  const [userFilesList, setUserFilesList] = useState<UserUploadedFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>('');
  const [activeFileTab, setActiveFileTab] = useState<'all' | 'reels' | 'practice' | 'audio'>('all');

  // Fetch all users from Firestore
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const usersRef = collection(db, 'users');
    const unsub = onSnapshot(usersRef, async (snapshot) => {
      if (!isMounted) return;

      try {
        // Fetch global content collections to tally files per user
        const reelsSnap = await getDocs(collection(db, 'reels')).catch(() => null);
        const playlistsSnap = await getDocs(collection(db, 'user_playlists')).catch(() => null);
        const tracksSnap = await getDocs(collection(db, 'instructor_drive_tracks')).catch(() => null);
        const feedbackSnap = await getDocs(collection(db, 'feedback_items')).catch(() => null);

        const reelsDocs = reelsSnap ? reelsSnap.docs.map(d => d.data()) : [];
        const playlistsDocs = playlistsSnap ? playlistsSnap.docs.map(d => d.data()) : [];
        const tracksDocs = tracksSnap ? tracksSnap.docs.map(d => d.data()) : [];
        const feedbackDocs = feedbackSnap ? feedbackSnap.docs.map(d => d.data()) : [];

        const records: AdminUserRecord[] = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            const userId = docSnap.id;

            // Fetch practice logs subcollection for this user
            const logsSnap = await getDocs(collection(db, 'users', userId, 'practice_logs')).catch(() => null);
            const practiceLogsCount = logsSnap ? logsSnap.size : 0;

            const reelsCount = reelsDocs.filter((r: any) => r.authorId === userId || r.userId === userId).length;
            const playlistsCount = playlistsDocs.filter((p: any) => p.userId === userId).length;
            const instructorTracksCount = tracksDocs.filter((t: any) => t.userId === userId || t.authorId === userId).length;
            const feedbackCount = feedbackDocs.filter((f: any) => f.studentId === userId || f.userId === userId).length;

            const totalUploadedFiles = reelsCount + practiceLogsCount + playlistsCount + instructorTracksCount + feedbackCount;

            const formattedCreatedDate = data.createdAt 
              || data.joinedDate 
              || data.updatedAt 
              || 'Registrado recientemente';

            return {
              id: userId,
              name: data.name || data.displayName || 'Usuario de Waack ON',
              email: data.email || `${userId.substring(0, 8)}@waackon.internal`,
              avatar: data.avatar || data.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
              role: data.role || 'student',
              status: data.status || (data.isOnline ? 'online' : 'offline'),
              createdAt: formattedCreatedDate,
              joinedDate: data.joinedDate || data.createdAt,
              updatedAt: data.updatedAt,
              billingStatus: data.billingStatus || 'active',
              points: data.points || 0,
              uploadedFilesCount: totalUploadedFiles,
              fileBreakdown: {
                reelsCount,
                practiceLogsCount,
                playlistsCount,
                instructorTracksCount,
                feedbackCount
              }
            };
          })
        );

        if (isMounted) {
          setUsersList(records);
          setLoading(false);
          setLastRefreshedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      } catch (err) {
        console.warn('Error syncing users for Admin view:', err);
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  // Fetch individual user files when inspecting a user
  const handleInspectUserFiles = async (userRecord: AdminUserRecord) => {
    setSelectedUserForFiles(userRecord);
    setLoadingFiles(true);
    setUserFilesList([]);

    try {
      const files: UserUploadedFile[] = [];

      // 1. Fetch user Reels / Videos
      const reelsQ = query(collection(db, 'reels'), where('authorId', '==', userRecord.id));
      const reelsSnap = await getDocs(reelsQ).catch(() => null);
      if (reelsSnap) {
        reelsSnap.forEach((docSnap) => {
          const d = docSnap.data();
          files.push({
            id: docSnap.id,
            title: d.caption || d.songTitle || 'Reel de Waacking',
            category: 'reel',
            videoUrl: d.videoUrl || d.mediaUrl,
            imageUrl: d.imageUrl || d.thumbnailUrl,
            createdAt: d.createdAt ? new Date(d.createdAt.seconds ? d.createdAt.seconds * 1000 : d.createdAt).toLocaleDateString() : 'Reciente',
            caption: d.caption || d.hashtags
          });
        });
      }

      // 2. Fetch User Practice Logs
      const logsSnap = await getDocs(collection(db, 'users', userRecord.id, 'practice_logs')).catch(() => null);
      if (logsSnap) {
        logsSnap.forEach((docSnap) => {
          const d = docSnap.data();
          files.push({
            id: docSnap.id,
            title: d.description || `Sesión de práctica (${d.minutes || 30} min)`,
            category: 'practice_log',
            videoUrl: d.videoUrl,
            audioUrl: d.audioUrl,
            createdAt: d.date || 'Sin fecha',
            caption: `Actividad: ${d.activityType || 'Entrenamiento'} | BPM: ${d.bpm || 128}`
          });
        });
      }

      // 3. Fetch User Playlists
      const plQ = query(collection(db, 'user_playlists'), where('userId', '==', userRecord.id));
      const plSnap = await getDocs(plQ).catch(() => null);
      if (plSnap) {
        plSnap.forEach((docSnap) => {
          const d = docSnap.data();
          files.push({
            id: docSnap.id,
            title: d.title || 'Playlist personalizada',
            category: 'playlist',
            audioUrl: d.url,
            createdAt: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Reciente',
            caption: `Proveedor: ${d.provider || 'Enlace audio'} ${d.bpm ? `| ${d.bpm} BPM` : ''}`
          });
        });
      }

      // 4. Fetch Instructor Drive Tracks
      const trackQ = query(collection(db, 'instructor_drive_tracks'), where('userId', '==', userRecord.id));
      const trackSnap = await getDocs(trackQ).catch(() => null);
      if (trackSnap) {
        trackSnap.forEach((docSnap) => {
          const d = docSnap.data();
          files.push({
            id: docSnap.id,
            title: d.title || 'Pista de Entrenamiento MP3',
            category: 'instructor_track',
            audioUrl: d.audioUrl || d.url,
            createdAt: d.uploadedAt || 'Reciente',
            fileSize: d.fileSizeMb || 'Audio HD',
            caption: `BPM: ${d.bpm || 128} | Estilo: ${d.category || 'Waacking'}`
          });
        });
      }

      setUserFilesList(files);
    } catch (err) {
      console.warn('Error fetching files for user:', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  // Filter users by search term and role
  const filteredUsers = usersList.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRoleFilter === 'all' || user.role === selectedRoleFilter;

    return matchesSearch && matchesRole;
  });

  const totalFilesCount = usersList.reduce((acc, u) => acc + u.uploadedFilesCount, 0);

  const filteredUserFiles = userFilesList.filter(file => {
    if (activeFileTab === 'all') return true;
    if (activeFileTab === 'reels') return file.category === 'reel';
    if (activeFileTab === 'practice') return file.category === 'practice_log';
    if (activeFileTab === 'audio') return file.category === 'playlist' || file.category === 'instructor_track';
    return true;
  });

  return (
    <div className="space-y-8 pb-16 min-h-screen">
      {/* ========================================================================= */}
      {/* 1. ADMIN HEADER & OFFICIAL BADGE INDICATOR */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#17120A] via-[#221B0D] to-[#121218] border-2 border-[#E9C349]/50 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#E9C349]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-[#FF2E63]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#E9C349] to-amber-500 text-black font-extrabold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(233,195,73,0.5)]">
                <Crown className="w-4 h-4 text-black fill-black animate-bounce" />
                PANEL DE ADMINISTRACIÓN GENERAL
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                ID ADMIN: OdXh2P0qGDaFFyNKalECKFq9ESk1
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Control de Usuarios y Archivos
              <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-[#E9C349] shrink-0" />
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Vista administrativa autorizada. Monitorea todos los perfiles de la base de datos de Firestore, sus expedientes de registro y sus archivos/videos subidos.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all cursor-pointer shadow-md active:scale-95"
            >
              <RefreshCw className="w-4 h-4 text-[#E9C349]" />
              <span>Actualizar ({lastRefreshedTime || 'AHORA'})</span>
            </button>
          </div>
        </div>

        {/* Global Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>Usuarios Totales</span>
              <Users className="w-4 h-4 text-[#E9C349]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{usersList.length}</div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">En Firestore DB</div>
          </div>

          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>Archivos Subidos</span>
              <FileVideo className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">{totalFilesCount}</div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Reels, Audios & Logs</div>
          </div>

          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>Instructores Pass</span>
              <Award className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-300">
              {usersList.filter(u => u.role === 'instructor' || u.role === 'studio').length}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Docentes y Estudios</div>
          </div>

          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>Estado del Servidor</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-300">100%</div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">● Firebase Synced</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEARCH & ROLE FILTERS BAR */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#121218] p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, correo electrónico o ID..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#E9C349] transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              Limpiar
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-[#E9C349] shrink-0 ml-1" />
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Rol:</span>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'student', label: 'Estudiantes' },
            { id: 'instructor', label: 'Instructores' },
            { id: 'studio', label: 'Academias' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedRoleFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedRoleFilter === f.id
                  ? 'bg-[#E9C349] text-black shadow-md'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. USERS LIST TABLE / CARDS */}
      {/* ========================================================================= */}
      <div className="bg-[#121218] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#E9C349]" />
            <h2 className="text-lg font-bold text-white">Directorio de Usuarios ({filteredUsers.length})</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Mostrando {filteredUsers.length} de {usersList.length} usuarios
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#E9C349] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-400 font-mono">Cargando base de datos de usuarios desde Firestore...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-base text-slate-300 font-semibold">No se encontraron usuarios</p>
            <p className="text-xs text-slate-500">Intenta cambiar los términos de búsqueda o filtros.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Usuario</th>
                  <th className="p-4">Correo Electrónico</th>
                  <th className="p-4">Fecha de Registro</th>
                  <th className="p-4 text-center">Archivos Subidos</th>
                  <th className="p-4">Rol / Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.03] transition-colors group">
                    {/* User Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-10 h-10 rounded-full object-cover border border-white/20 shrink-0" 
                        />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {user.name}
                            {user.id === ADMIN_USER_ID && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-[#E9C349] text-black">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 font-mono flex items-center gap-1">
                            <span>ID: {user.id.substring(0, 12)}...</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="p-4 font-mono text-xs text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate max-w-[200px]">{user.email}</span>
                      </div>
                    </td>

                    {/* Creation Date */}
                    <td className="p-4 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-[#E9C349] shrink-0" />
                        <span>{user.createdAt}</span>
                      </div>
                    </td>

                    {/* Number of Uploaded Files */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleInspectUserFiles(user)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono transition-all cursor-pointer ${
                          user.uploadedFilesCount > 0
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-900/90'
                            : 'bg-white/5 text-slate-500 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>{user.uploadedFilesCount} {user.uploadedFilesCount === 1 ? 'archivo' : 'archivos'}</span>
                      </button>
                    </td>

                    {/* Role & Status */}
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide w-fit ${
                          user.role === 'instructor'
                            ? 'bg-purple-950/80 text-purple-300 border border-purple-500/50'
                            : user.role === 'studio'
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
                              : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50'
                        }`}>
                          {user.role}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Plan: {user.billingStatus || 'Activo'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleInspectUserFiles(user)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FF2E63] hover:bg-[#ff1e56] text-white text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Archivos</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL INSPECTOR DE ARCHIVOS POR USUARIO */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedUserForFiles && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#121218] border border-white/20 rounded-3xl w-full max-w-4xl p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedUserForFiles(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-white/10">
                <img
                  src={selectedUserForFiles.avatar}
                  alt={selectedUserForFiles.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#E9C349] shadow-xl"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-white">{selectedUserForFiles.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E9C349]/20 border border-[#E9C349] text-[#E9C349] text-xs font-bold uppercase">
                      {selectedUserForFiles.role}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-300 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{selectedUserForFiles.email}</span>
                    <span>•</span>
                    <span>ID: {selectedUserForFiles.id}</span>
                  </p>
                  <p className="text-xs text-slate-400 font-mono">
                    Registrado el: <strong className="text-white">{selectedUserForFiles.createdAt}</strong>
                  </p>
                </div>
              </div>

              {/* Summary Stats Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/5 rounded-2xl p-3 border border-white/10 text-center">
                  <div className="text-xs text-slate-400 font-semibold mb-1">Total Subidos</div>
                  <div className="text-xl font-extrabold text-[#E9C349]">{selectedUserForFiles.uploadedFilesCount}</div>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 border border-white/10 text-center">
                  <div className="text-xs text-slate-400 font-semibold mb-1">Reels & Videos</div>
                  <div className="text-xl font-extrabold text-cyan-400">{selectedUserForFiles.fileBreakdown.reelsCount}</div>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 border border-white/10 text-center">
                  <div className="text-xs text-slate-400 font-semibold mb-1">Practica / Logs</div>
                  <div className="text-xl font-extrabold text-emerald-400">{selectedUserForFiles.fileBreakdown.practiceLogsCount}</div>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 border border-white/10 text-center">
                  <div className="text-xs text-slate-400 font-semibold mb-1">Audios & Tracks</div>
                  <div className="text-xl font-extrabold text-purple-400">
                    {selectedUserForFiles.fileBreakdown.playlistsCount + selectedUserForFiles.fileBreakdown.instructorTracksCount}
                  </div>
                </div>
              </div>

              {/* Tabs for files filtering */}
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                {[
                  { id: 'all', label: 'Todos los Archivos' },
                  { id: 'reels', label: 'Reels / Videos' },
                  { id: 'practice', label: 'Práctica' },
                  { id: 'audio', label: 'Música / Audios' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFileTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeFileTab === tab.id
                        ? 'bg-[#E9C349] text-black shadow-md'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Files List Content */}
              {loadingFiles ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-[#E9C349] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-400 font-mono">Buscando archivos subidos por el usuario...</p>
                </div>
              ) : filteredUserFiles.length === 0 ? (
                <div className="py-12 text-center space-y-3 bg-white/5 rounded-2xl border border-white/10 p-6">
                  <FolderOpen className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">Este usuario aún no tiene archivos registrados en esta categoría.</p>
                  <p className="text-xs text-slate-500">Los videos de reels, audios y bitácoras de entrenamiento aparecerán aquí.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredUserFiles.map((file) => (
                    <div 
                      key={file.id} 
                      className="bg-black/40 border border-white/10 hover:border-white/20 rounded-2xl p-4 space-y-3 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {file.category === 'reel' && <Video className="w-4 h-4 text-cyan-400 shrink-0" />}
                          {file.category === 'practice_log' && <Activity className="w-4 h-4 text-emerald-400 shrink-0" />}
                          {(file.category === 'playlist' || file.category === 'instructor_track') && (
                            <Music className="w-4 h-4 text-purple-400 shrink-0" />
                          )}
                          <h4 className="font-bold text-white text-sm line-clamp-1">{file.title}</h4>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">{file.createdAt}</span>
                      </div>

                      {file.caption && (
                        <p className="text-xs text-slate-300 bg-white/5 p-2 rounded-xl border border-white/5 font-mono line-clamp-2">
                          {file.caption}
                        </p>
                      )}

                      {/* Video Media Player Preview if URL available */}
                      {file.videoUrl && (
                        <div className="rounded-xl overflow-hidden bg-black border border-white/10 aspect-video relative">
                          <video 
                            src={file.videoUrl} 
                            controls 
                            className="w-full h-full object-contain"
                            preload="metadata"
                          />
                        </div>
                      )}

                      {/* Audio Player Preview if Audio URL available */}
                      {file.audioUrl && (
                        <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                          <audio src={file.audioUrl} controls className="w-full h-8" />
                        </div>
                      )}

                      {/* Direct Link Action */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                        <span className="text-[10px] text-slate-500 font-mono uppercase">
                          Tipo: {file.category.replace('_', ' ')}
                        </span>
                        {(file.videoUrl || file.audioUrl || file.fileUrl) && (
                          <a
                            href={file.videoUrl || file.audioUrl || file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#E9C349] hover:underline text-xs font-bold"
                          >
                            <span>Abrir enlace</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setSelectedUserForFiles(null)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
