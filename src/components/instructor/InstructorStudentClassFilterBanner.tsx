import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  BookOpen, 
  Video, 
  Target, 
  Award, 
  ChevronRight, 
  X, 
  Layers, 
  CheckSquare, 
  Square, 
  Edit3, 
  Save, 
  GraduationCap, 
  Music, 
  Eye, 
  Flame, 
  FileText, 
  Zap, 
  Info,
  Check
} from 'lucide-react';
import { User, Lesson, InstructorCatedra } from '../../types';
import Logo from '../Logo';

export interface EnrolledStudent {
  id: string;
  name: string;
  avatar: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  email: string;
  assignedLessons: string[];
  completedLessons: string[];
  lastActive: string;
  points: number;
  notes?: string;
  feedbackNotes?: Record<string, string>; // lessonId -> note
}

export const DEFAULT_ENROLLED_STUDENTS: EnrolledStudent[] = [
  {
    id: 'st-1',
    name: 'Ana "Waack Queen" Silva',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    level: 'Intermedio',
    email: 'ana.queen@dance.com',
    assignedLessons: ['1', '2', '3', '4', '7'],
    completedLessons: ['1', '2', '3'],
    lastActive: 'Ayer',
    points: 420,
    notes: 'Enfocar en la limpieza de los overheads en BPM 125 y sincronización con síncopas.'
  },
  {
    id: 'st-2',
    name: 'Ji-Won Kim',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    level: 'Principiante',
    email: 'jiwon@waack.kr',
    assignedLessons: ['1', '2', '5', '8'],
    completedLessons: ['1'],
    lastActive: 'Hace 2 horas',
    points: 150,
    notes: 'Revisar alineación de muñecas en wrist rolls internos sin elevar los hombros.'
  },
  {
    id: 'st-3',
    name: 'Yuki Sato',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    level: 'Avanzado',
    email: 'yuki.s@dance.jp',
    assignedLessons: ['1', '2', '3', '4', '5', '6', '7', '8'],
    completedLessons: ['1', '2', '3', '4', '5', '6'],
    lastActive: 'Hace 3 días',
    points: 890,
    notes: 'Excelente musicalidad. Perfeccionar transiciones rápidas entre Posing estático y Punking.'
  },
  {
    id: 'st-4',
    name: 'Carlos Mendoza',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    level: 'Intermedio',
    email: 'carlos.m@waacking.es',
    assignedLessons: ['2', '3', '6', '7'],
    completedLessons: ['2', '3'],
    lastActive: 'Hoy',
    points: 380,
    notes: 'Buena energía en pasajes cervicales. Mantener el pulso 4/4 sin apresurarse.'
  },
  {
    id: 'st-5',
    name: 'Melissa Roberts',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    level: 'Principiante',
    email: 'mel@roberts.com',
    assignedLessons: ['1', '5', '8'],
    completedLessons: ['1', '5'],
    lastActive: 'Hace 5 minutos',
    points: 210,
    notes: 'Completó fundamentals con éxito. Siguiente paso: módulo de líneas y ángulos 90°.'
  }
];

export type StudentClassFilter = 'all' | 'assigned' | 'completed' | 'pending' | 'recommended';

interface InstructorStudentClassFilterBannerProps {
  currentUser: User;
  students: EnrolledStudent[];
  selectedStudentId: string;
  onSelectStudent: (studentId: string) => void;
  studentClassFilter: StudentClassFilter;
  onStudentClassFilterChange: (filter: StudentClassFilter) => void;
  lessons: Lesson[];
  instructors: InstructorCatedra[];
  onBatchAssignLevel: (studentId: string, level: string) => void;
  onAddStudent: (newStudent: Omit<EnrolledStudent, 'id' | 'points' | 'lastActive'>) => void;
  onUpdateStudentNotes: (studentId: string, notes: string) => void;
  currentTab: 'catedras' | 'workbook' | 'feedback' | 'metas';
  setCurrentTab: (tab: 'catedras' | 'workbook' | 'feedback' | 'metas') => void;
  setActiveTab: (tab: string) => void;
  onOpenSpotifyPlayer?: () => void;
  onOpenPreviewModal: () => void;
  subscribedInstructorsCount: number;
}

export default function InstructorStudentClassFilterBanner({
  currentUser,
  students,
  selectedStudentId,
  onSelectStudent,
  studentClassFilter,
  onStudentClassFilterChange,
  lessons,
  instructors,
  onBatchAssignLevel,
  onAddStudent,
  onUpdateStudentNotes,
  currentTab,
  setCurrentTab,
  setActiveTab,
  onOpenSpotifyPlayer,
  onOpenPreviewModal,
  subscribedInstructorsCount
}: InstructorStudentClassFilterBannerProps) {
  const [searchStudentQuery, setSearchStudentQuery] = useState('');
  const [studentLevelFilter, setStudentLevelFilter] = useState<'all' | 'Principiante' | 'Intermedio' | 'Avanzado'>('all');
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isStudentDetailModalOpen, setIsStudentDetailModalOpen] = useState(false);

  // Add Student Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentLevel, setNewStudentLevel] = useState<'Principiante' | 'Intermedio' | 'Avanzado'>('Principiante');
  const [newStudentNotes, setNewStudentNotes] = useState('');

  // Selected student object
  const selectedStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  // Filtered student list for the selector
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchStudentQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchStudentQuery.toLowerCase());
      const matchesLevel = studentLevelFilter === 'all' || student.level === studentLevelFilter;
      return matchesSearch && matchesLevel;
    });
  }, [students, searchStudentQuery, studentLevelFilter]);

  // Aggregate stats
  const totalClassesCount = lessons.length;
  const activeStudentsCount = students.length;

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentEmail.trim()) return;

    // By default assign first 2 fundamentals lessons
    const defaultAssigned = lessons.slice(0, 3).map(l => l.id);

    onAddStudent({
      name: newStudentName.trim(),
      email: newStudentEmail.trim(),
      level: newStudentLevel,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`,
      assignedLessons: defaultAssigned,
      completedLessons: [],
      notes: newStudentNotes.trim()
    });

    setNewStudentName('');
    setNewStudentEmail('');
    setNewStudentNotes('');
    setIsAddStudentModalOpen(false);
  };

  // Selected student specific counts
  const studentAssignedCount = selectedStudent ? selectedStudent.assignedLessons.length : 0;
  const studentCompletedCount = selectedStudent ? selectedStudent.completedLessons.length : 0;
  const studentProgressPercent = selectedStudent && totalClassesCount > 0 
    ? Math.round((studentCompletedCount / totalClassesCount) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      {/* 1. EXECUTIVE HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#170f2b] via-[#211538] to-[#120d20] border-2 border-[#D9A9FF]/40 p-6 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow ambient decoration */}
        <div className="absolute top-0 right-1/4 w-80 h-40 bg-[#D9A9FF]/10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-purple-600/10 blur-3xl pointer-events-none rounded-full" />

        <div className="flex flex-col sm:flex-row sm:items-center gap-5 relative z-10">
          <div className="relative shrink-0">
            <Logo variant="full" className="w-36 h-auto" />
            <span className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#D9A9FF] to-amber-500 text-black text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-full shadow-lg border border-black/30">
              DOCENTE / ACADEMIA
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-mono font-extrabold text-black bg-[#D9A9FF] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                <GraduationCap className="w-3.5 h-3.5" /> GESTIÓN DE CLASES POR ALUMNO
              </span>
              <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full uppercase">
                {activeStudentsCount} ESTUDIANTES EN NÓMINA
              </span>
              <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-500/10 border border-purple-500/30 px-2.5 py-0.5 rounded-full uppercase">
                {totalClassesCount} LECCIONES DEL CATÁLOGO
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2 flex-wrap">
              <span>Gestión & Filtro Curricular por Estudiante</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Selecciona a cualquier alumna o alumno para auditar su avance individual, filtrar el catálogo de video clases según su ruta asignada, validar lecciones completadas y asignar nuevos módulos técnicos.
            </p>
          </div>
        </div>

        {/* Action / View Tabs Toolbar */}
        <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto relative z-10">
          <button
            type="button"
            onClick={() => setIsAddStudentModalOpen(true)}
            className="px-4 py-2 text-xs font-black rounded-2xl bg-[#D9A9FF] hover:bg-[#F2CFFF] text-black transition-all flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer uppercase tracking-wider"
            title="Inscribir nueva alumna o alumno en la plataforma"
          >
            <UserPlus className="w-4 h-4 text-black" />
            <span>[+ Registrar Alumno]</span>
          </button>

          {onOpenSpotifyPlayer && (
            <button
              type="button"
              onClick={onOpenSpotifyPlayer}
              className="px-3.5 py-2 text-xs font-black rounded-2xl bg-[#1DB954]/20 hover:bg-[#1DB954]/30 text-[#1DB954] border border-[#1DB954]/50 transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer uppercase tracking-wider"
              title="Música Spotify para Entrenamientos"
            >
              <Music className="w-4 h-4 text-[#1DB954]" />
              <span>Música Spotify</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenPreviewModal}
            className="px-3.5 py-2 text-xs font-bold rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all flex items-center gap-1.5 shadow-md"
            title="Abrir Vista Previa de Formación"
          >
            <Eye className="w-4 h-4 text-slate-300" />
            <span>Vista Previa</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('classroom')}
            className="px-3.5 py-2 text-xs font-bold rounded-2xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-all flex items-center gap-1.5 shadow-md"
            title="Sincronizar con Google Classroom"
          >
            <GraduationCap className="w-4 h-4 text-blue-400" />
            <span>Google Classroom</span>
          </button>

          <div className="bg-black/60 border border-white/15 p-1 rounded-2xl flex gap-1 shadow-xl flex-wrap">
            <button
              onClick={() => setCurrentTab('catedras')}
              className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 ${
                currentTab === 'catedras' ? 'bg-[#D9A9FF] text-black shadow-lg' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Desglose por Cátedra</span>
            </button>
            <button
              onClick={() => setCurrentTab('metas')}
              className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 ${
                currentTab === 'metas' ? 'bg-[#D9A9FF] text-black shadow-lg' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Metas & 7 Días</span>
            </button>
            <button
              onClick={() => setCurrentTab('workbook')}
              className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 ${
                currentTab === 'workbook' ? 'bg-[#D9A9FF] text-black shadow-lg' : 'text-slate-300 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Bitácora Teórica</span>
            </button>
            <button
              onClick={() => setCurrentTab('feedback')}
              className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 ${
                currentTab === 'feedback' ? 'bg-[#D9A9FF] text-black shadow-lg' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Feedback & Video</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STUDENT SELECTOR & SEARCH FILTER STRIP */}
      <div className="bg-[#130f24] border border-white/15 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D9A9FF]/20 border border-[#D9A9FF]/40 flex items-center justify-center text-[#D9A9FF] shrink-0 shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span>FILTRAR CATÁLOGO POR ESTUDIANTE:</span>
                <span className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full font-sans font-bold">
                  {selectedStudentId === 'all' ? 'Viendo Todas las Clases' : `Filtrando por: ${selectedStudent?.name}`}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Haz clic en una alumna/o para ver sus clases asignadas, avance porcentual y gestionar su currículo personalizado.
              </p>
            </div>
          </div>

          {/* Search and Level Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchStudentQuery}
                onChange={(e) => setSearchStudentQuery(e.target.value)}
                placeholder="Buscar alumno..."
                className="w-full pl-9 pr-3 py-1.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D9A9FF] transition-all"
              />
              {searchStudentQuery && (
                <button
                  type="button"
                  onClick={() => setSearchStudentQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
              {(['all', 'Principiante', 'Intermedio', 'Avanzado'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setStudentLevelFilter(lvl)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    studentLevelFilter === lvl
                      ? 'bg-[#D9A9FF] text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl === 'all' ? 'Todos Niveles' : lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Horizontal Student Cards Carousel */}
        <div className="flex items-stretch gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20">
          {/* Card: Global / All Students */}
          <button
            type="button"
            onClick={() => onSelectStudent('all')}
            className={`p-3.5 rounded-2xl border transition-all shrink-0 flex flex-col justify-between w-48 text-left cursor-pointer ${
              selectedStudentId === 'all'
                ? 'bg-gradient-to-br from-white/20 to-white/5 border-white text-white shadow-xl ring-2 ring-white/30'
                : 'bg-black/40 border-white/10 hover:border-white/30 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-white/10 text-white">
                VISTA GLOBAL
              </span>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase text-white truncate">
                Todos los Alumnos
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Catálogo unificado ({totalClassesCount} clases)
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-slate-400">
              <span>{activeStudentsCount} Alumnos activos</span>
              <span className="text-emerald-400 font-bold">● En línea</span>
            </div>
          </button>

          {/* Student Cards */}
          {filteredStudents.map((student) => {
            const isSelected = selectedStudentId === student.id;
            const completedCount = student.completedLessons.length;
            const assignedCount = student.assignedLessons.length;
            const percent = totalClassesCount > 0 ? Math.round((completedCount / totalClassesCount) * 100) : 0;

            const levelColor = 
              student.level === 'Principiante' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
              student.level === 'Intermedio' ? 'text-purple-400 bg-purple-500/10 border-purple-500/30' :
              'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

            return (
              <button
                key={student.id}
                type="button"
                onClick={() => onSelectStudent(student.id)}
                className={`p-3.5 rounded-2xl border transition-all shrink-0 flex flex-col justify-between w-56 text-left cursor-pointer relative group ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#D9A9FF]/20 via-[#231d36] to-[#120f21] border-[#D9A9FF] text-white shadow-2xl ring-2 ring-[#D9A9FF]/40'
                    : 'bg-black/40 border-white/10 hover:border-[#D9A9FF]/40 text-slate-300'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#D9A9FF] text-black flex items-center justify-center text-[10px] font-black shadow-md">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}

                <div className="flex items-start gap-2.5 mb-2">
                  <div className="relative">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-10 h-10 rounded-xl object-cover border-2 border-white/20 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border border-black" />
                  </div>

                  <div className="overflow-hidden pr-4">
                    <span className={`text-[8px] font-mono font-extrabold uppercase px-1.5 py-0.2 rounded border inline-block mb-0.5 ${levelColor}`}>
                      {student.level}
                    </span>
                    <h4 className="text-xs font-black text-white truncate group-hover:text-[#D9A9FF] transition-colors">
                      {student.name}
                    </h4>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 mt-1">
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                    <span>Avance: {completedCount}/{totalClassesCount} ({percent}%)</span>
                    <span className="text-[#D9A9FF] font-bold">{assignedCount} Asignadas</span>
                  </div>
                  <div className="w-full bg-black/60 h-1.5 rounded-full overflow-hidden border border-white/10">
                    <div
                      className="bg-gradient-to-r from-[#D9A9FF] to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span>⏱ {student.lastActive}</span>
                  <span className="text-purple-300 font-bold">{student.points} pts</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 3. ACTIVE SELECTED STUDENT CONTROL BAR & CLASS STATUS FILTER */}
        {selectedStudent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1b1530] border border-[#D9A9FF]/40 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl"
          >
            {/* Student quick info */}
            <div className="flex items-center gap-3">
              <img
                src={selectedStudent.avatar}
                alt={selectedStudent.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-[#D9A9FF] shadow-md shrink-0"
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">
                    {selectedStudent.name}
                  </h3>
                  <span className="text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#D9A9FF] text-black">
                    NIVEL {selectedStudent.level.toUpperCase()}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">
                    {selectedStudent.email}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  <span className="font-bold text-[#D9A9FF]">{studentCompletedCount} de {totalClassesCount}</span> clases completadas ({studentProgressPercent}%) • <span className="font-bold text-purple-300">{studentAssignedCount} clases asignadas</span> en su syllabus.
                </p>
              </div>
            </div>

            {/* Class Filter Tabs for this student */}
            <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-xl border border-white/15 flex-wrap">
              <span className="text-[10px] font-mono font-bold text-slate-400 px-2 uppercase">
                Filtrar Clases:
              </span>

              <button
                type="button"
                onClick={() => onStudentClassFilterChange('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  studentClassFilter === 'all'
                    ? 'bg-white text-black shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Todas ({totalClassesCount})
              </button>

              <button
                type="button"
                onClick={() => onStudentClassFilterChange('assigned')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 cursor-pointer ${
                  studentClassFilter === 'assigned'
                    ? 'bg-[#D9A9FF] text-black shadow-md'
                    : 'text-[#D9A9FF] hover:bg-[#D9A9FF]/10'
                }`}
              >
                <span>📌 Asignadas ({studentAssignedCount})</span>
              </button>

              <button
                type="button"
                onClick={() => onStudentClassFilterChange('completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 cursor-pointer ${
                  studentClassFilter === 'completed'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-emerald-300 hover:bg-emerald-500/10'
                }`}
              >
                <span>✅ Aprobadas ({studentCompletedCount})</span>
              </button>

              <button
                type="button"
                onClick={() => onStudentClassFilterChange('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 cursor-pointer ${
                  studentClassFilter === 'pending'
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'text-purple-300 hover:bg-purple-500/10'
                }`}
              >
                <span>⏳ Pendientes ({Math.max(0, studentAssignedCount - studentCompletedCount)})</span>
              </button>
            </div>

            {/* Quick Actions for this student */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => onBatchAssignLevel(selectedStudent.id, selectedStudent.level)}
                className="px-3 py-1.5 rounded-xl bg-[#D9A9FF]/20 hover:bg-[#D9A9FF]/30 text-[#D9A9FF] border border-[#D9A9FF]/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                title={`Asignar todas las lecciones del nivel ${selectedStudent.level} a esta alumna`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Asignar Nivel {selectedStudent.level}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsStudentDetailModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                title="Ver Ficha y Notas de la Alumna"
              >
                <FileText className="w-3.5 h-3.5 text-purple-300" />
                <span>Ficha & Notas</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* 4. MODAL: REGISTRAR NUEVO ESTUDIANTE */}
      <AnimatePresence>
        {isAddStudentModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#161229] border-2 border-[#D9A9FF] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#D9A9FF] text-black flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-tight">
                      Inscribir Nuevo Alumno / Estudiante
                    </h3>
                    <p className="text-xs text-slate-400">
                      Crea el perfil del alumno para asignarle clases y monitorear su evolución.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateStudent} className="space-y-4">
                <div>
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase block mb-1">
                    Nombre Completo o Alias de Danza:
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Ej. Sofia 'Disco Fire' López"
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/20 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D9A9FF]"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase block mb-1">
                    Correo Electrónico:
                  </label>
                  <input
                    type="email"
                    required
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    placeholder="sofia@waack.com"
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/20 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D9A9FF]"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase block mb-1">
                    Nivel Técnico de Entrada:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Principiante', 'Intermedio', 'Avanzado'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setNewStudentLevel(lvl)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          newStudentLevel === lvl
                            ? 'bg-[#D9A9FF] text-black border-[#D9A9FF] shadow-md'
                            : 'bg-black/40 text-slate-300 border-white/10 hover:border-white/30'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase block mb-1">
                    Notas Docentes Iniciales (Objetivos / Correcciones):
                  </label>
                  <textarea
                    rows={3}
                    value={newStudentNotes}
                    onChange={(e) => setNewStudentNotes(e.target.value)}
                    placeholder="Ej. Trabajar la extensión de hombros y el bloqueo en BPM 120."
                    className="w-full px-4 py-2 bg-black/60 border border-white/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D9A9FF]"
                  />
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddStudentModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#D9A9FF] hover:bg-[#F2CFFF] text-black font-black text-xs uppercase rounded-xl shadow-xl transition-all cursor-pointer"
                  >
                    Registrar e Inscribir
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. MODAL: FICHA & NOTAS DEL ALUMNO */}
      <AnimatePresence>
        {isStudentDetailModalOpen && selectedStudent && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#161229] border-2 border-purple-500/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={selectedStudent.avatar}
                    alt={selectedStudent.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#D9A9FF] shadow-lg"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-white uppercase">
                        {selectedStudent.name}
                      </h3>
                      <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-[#D9A9FF] text-black">
                        {selectedStudent.level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{selectedStudent.email} • Última actividad: {selectedStudent.lastActive}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStudentDetailModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress and Stats Cards */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-black/50 border border-white/10 p-3 rounded-2xl">
                  <span className="text-xs text-slate-400 font-mono block uppercase">Clases Aprobadas</span>
                  <span className="text-xl font-black text-emerald-400">{studentCompletedCount}</span>
                </div>
                <div className="bg-black/50 border border-white/10 p-3 rounded-2xl">
                  <span className="text-xs text-slate-400 font-mono block uppercase">Clases Asignadas</span>
                  <span className="text-xl font-black text-[#D9A9FF]">{studentAssignedCount}</span>
                </div>
                <div className="bg-black/50 border border-white/10 p-3 rounded-2xl">
                  <span className="text-xs text-slate-400 font-mono block uppercase">Puntos Ganados</span>
                  <span className="text-xl font-black text-purple-300">{selectedStudent.points}</span>
                </div>
              </div>

              {/* Editable Instructor Notes */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center justify-between">
                  <span>Bitácora de Observaciones & Correcciones:</span>
                  <span className="text-[10px] text-[#D9A9FF]">Visible para instructores</span>
                </label>
                <textarea
                  rows={4}
                  defaultValue={selectedStudent.notes || ''}
                  onBlur={(e) => onUpdateStudentNotes(selectedStudent.id, e.target.value)}
                  placeholder="Escribe observaciones de postura, ritmo o asignaciones para este alumno..."
                  className="w-full p-3.5 bg-black/60 border border-white/20 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D9A9FF] leading-relaxed"
                />
                <p className="text-[10px] text-slate-400">
                  Las notas se guardan automáticamente al salir del campo de texto.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onSelectStudent('all');
                    setIsStudentDetailModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10"
                >
                  Volver a Vista Global
                </button>
                <button
                  type="button"
                  onClick={() => setIsStudentDetailModalOpen(false)}
                  className="px-6 py-2 bg-[#D9A9FF] text-black font-black text-xs uppercase rounded-xl shadow-lg"
                >
                  Listo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
