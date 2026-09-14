import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  CheckCircle, 
  Download, 
  BookOpen, 
  Book, 
  CheckSquare, 
  Square,
  Clock,
  Compass,
  Zap,
  Flame,
  ArrowRight,
  GraduationCap,
  UserCheck,
  Users,
  Award,
  Sparkles,
  Layers,
  Video,
  FileText,
  ChevronRight,
  Star,
  ShieldCheck,
  Filter,
  UserPlus,
  Copy,
  Check,
  Eye,
  Target,
  Edit3,
  Save,
  Music,
  TrendingUp,
  CheckCircle2,
  LayoutGrid,
  ListFilter,
  Gauge,
  SlidersHorizontal,
  RotateCcw,
  Bookmark
} from 'lucide-react';
import { User, Lesson, InstructorCatedra, IntensiveCourse, CatedraMaterial, FeedbackItem } from '../types';
import { Language, translations } from '../lib/translations';
import { WaackingPillarsGallery } from './WaackingPillarsGallery';
import { SomaticFeedbackLab } from './lab/SomaticFeedbackLab';
import FormationContentPreviewModal from './FormationContentPreviewModal';
import { CategoryFilterBar, FilterState, FilterDimensionTab, STYLE_OPTIONS, TECHNIQUE_OPTIONS, DIFFICULTY_OPTIONS } from './CategoryFilterBar';
import InstructorStudentClassFilterBanner, { 
  EnrolledStudent, 
  DEFAULT_ENROLLED_STUDENTS, 
  StudentClassFilter 
} from './instructor/InstructorStudentClassFilterBanner';
import Logo from './Logo';

interface CursosViewProps {
  currentUser: User;
  lessons: Lesson[];
  instructors: InstructorCatedra[];
  onMarkLessonComplete: (lessonId: string, completed: boolean) => void;
  setActiveTab: (tab: string) => void;
  selectedCourseLevel: 1 | 2;
  setSelectedCourseLevel: (level: 1 | 2) => void;
  language: Language;
  feedbackItems?: FeedbackItem[];
  onAddFeedbackItem?: (title: string, description: string, videoUrl: string) => void;
  onAddCorrection?: (itemId: string, time: string, text: string) => void;
  onUserChange?: (updater: (prev: User) => User) => void;
  onOpenSpotifyPlayer?: () => void;
}

const WORKBOOK_PAGES = [
  {
    title: "1. LA CUNA DEL WAACKING (Años 70)",
    subtitle: "Orígenes e Historia • Cátedra Brando Hermoso",
    content: "El Waacking nació a principios de los años 70 en los clubes clandestinos de la comunidad LGBTQ+ en Los Ángeles, California. Bailarines negros y latinos como Tyrone Proctor, Outrageous Waackin' Billy y Tinker Toy crearon un lenguaje de escape e identidad individual sobre los beats de la naciente música Disco. Originalmente llamado 'Whacking' (del verbo golpear), se inspiró en el glamour de las estrellas de cine mudo como Greta Garbo, la teatralidad escénica y los movimientos dramáticos."
  },
  {
    title: "2. LA MÉTRICA DISCO Y LA SÍNCOPA",
    subtitle: "Musicalidad Teórica • Cátedra Elena Rostova",
    content: "La música Disco se construye sobre un compás constante de 4/4 ('Four on the Floor'), usualmente variando entre 110 y 135 BPM. El Waacking juega fundamentalmente con el contratiempo (las síncopas) y los acentos marcados por la caja en los tiempos 2 y 4. Al entrenar tus rolls, concéntrate en que cada rotación cruce detrás de tu cabeza en la subdivisión del charles (el platillo, los 'and' en inglés: 1-and-2-and-3-and-4)."
  },
  {
    title: "3. LOS 5 PILARES DEL ARSENAL",
    subtitle: "Glosario Técnico de Drills",
    content: "• ROLLS (Gros): Rotación interna o externa alrededor de la articulación del codo.\n• POSES (Estáticas): Posturas geométricas instantáneas que congelan el ritmo.\n• LINES (Proyección): El estiramiento extremo de los brazos trazando líneas en el espacio.\n• OVERHEADS: Pasar los brazos rítmicamente por encima de la frente o coronilla.\n• DRAMA (Expresión): El carácter actoral de personificar el drama de la música."
  }
];

export default function CursosView({
  currentUser,
  lessons,
  instructors,
  onMarkLessonComplete,
  setActiveTab,
  selectedCourseLevel,
  setSelectedCourseLevel,
  language,
  feedbackItems,
  onAddFeedbackItem,
  onAddCorrection,
  onUserChange,
  onOpenSpotifyPlayer
}: CursosViewProps) {
  // Navigation / Filter States
  const [currentTab, setCurrentTab] = useState<'catedras' | 'workbook' | 'feedback' | 'metas'>('catedras');
  const [selectedInstructorFilter, setSelectedInstructorFilter] = useState<string>('all'); // 'all' or instructorId
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Goal Management State (Relocated from Dashboard)
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [targetGoalMinutes, setTargetGoalMinutes] = useState<number>(currentUser.targetMinutes || 30);
  const [targetWeeklyDays, setTargetWeeklyDays] = useState<number>(() => {
    const saved = localStorage.getItem('waackon_target_weekly_days');
    return saved ? parseInt(saved, 10) : 5;
  });
  const [goalSavedToast, setGoalSavedToast] = useState(false);

  const handleSaveGoal = (minutes: number, days?: number) => {
    setTargetGoalMinutes(minutes);
    if (days !== undefined) {
      setTargetWeeklyDays(days);
      localStorage.setItem('waackon_target_weekly_days', String(days));
    }
    if (onUserChange) {
      onUserChange(prev => ({
        ...prev,
        targetMinutes: minutes
      }));
    }
    setIsEditingGoal(false);
    setGoalSavedToast(true);
    setTimeout(() => setGoalSavedToast(false), 3500);
  };

  // Video Feedback Form & Correction States
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoDesc, setNewVideoDesc] = useState('');
  const [correctionTime, setCorrectionTime] = useState<Record<string, string>>({});
  const [correctionText, setCorrectionText] = useState<Record<string, string>>({});

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoTitle.trim() || !newVideoUrl.trim() || !newVideoDesc.trim()) return;
    if (onAddFeedbackItem) {
      onAddFeedbackItem(newVideoTitle, newVideoDesc, newVideoUrl);
    }
    setNewVideoTitle('');
    setNewVideoUrl('');
    setNewVideoDesc('');
    setShowFeedbackForm(false);
  };

  const handleAddCorrectionSubmit = (itemId: string) => {
    const text = correctionText[itemId];
    const timestamp = correctionTime[itemId] || "0:00";
    if (!text || !text.trim()) return;
    if (onAddCorrection) {
      onAddCorrection(itemId, timestamp, text);
    }
    setCorrectionText(prev => ({ ...prev, [itemId]: '' }));
    setCorrectionTime(prev => ({ ...prev, [itemId]: '' }));
  };

  // Active level mapping
  const selectedLevel = selectedCourseLevel;
  const setSelectedLevel = setSelectedCourseLevel;

  // Category, Style, Technique, Difficulty & Search Filter State
  const [filters, setFilters] = useState<FilterState>({
    style: 'all',
    technique: 'all',
    difficulty: 'all',
    completion: 'all',
    searchQuery: '',
  });
  const [activeDimensionTab, setActiveDimensionTab] = useState<FilterDimensionTab>('all');
  const [viewLayout, setViewLayout] = useState<'catedras' | 'catalog'>('catedras');

  // Instructor & Academy Role Check
  const isInstructorOrAcademy = 
    currentUser.role === 'instructor' || 
    currentUser.role === 'academy' || 
    currentUser.role === 'studio' || 
    (currentUser as any).role === 'academia' ||
    (currentUser as any).isInstructor === true;

  // Enrolled Students Management State (persisted locally)
  const [students, setStudents] = useState<EnrolledStudent[]>(() => {
    try {
      const saved = localStorage.getItem('waackon_enrolled_students');
      return saved ? JSON.parse(saved) : DEFAULT_ENROLLED_STUDENTS;
    } catch (e) {
      return DEFAULT_ENROLLED_STUDENTS;
    }
  });

  const persistStudents = (newStudents: EnrolledStudent[]) => {
    setStudents(newStudents);
    try {
      localStorage.setItem('waackon_enrolled_students', JSON.stringify(newStudents));
    } catch (e) {
      console.error('Error saving enrolled students', e);
    }
  };

  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [studentClassFilter, setStudentClassFilter] = useState<StudentClassFilter>('all');

  const selectedStudent = React.useMemo(() => {
    return students.find(s => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  // Student class assignment & completion management handlers
  const handleToggleStudentAssignLesson = (studentId: string, lessonId: string) => {
    const updated = students.map(s => {
      if (s.id !== studentId) return s;
      const isAssigned = s.assignedLessons.includes(lessonId);
      const newAssigned = isAssigned
        ? s.assignedLessons.filter(id => id !== lessonId)
        : [...s.assignedLessons, lessonId];
      return { ...s, assignedLessons: newAssigned };
    });
    persistStudents(updated);
    const targetStudent = updated.find(s => s.id === studentId);
    const isNowAssigned = targetStudent?.assignedLessons.includes(lessonId);
    setMaterialToast(isNowAssigned ? `📌 Lección asignada al currículo de ${targetStudent?.name}` : `❌ Lección desasignada de ${targetStudent?.name}`);
    setTimeout(() => setMaterialToast(null), 3000);
  };

  const handleToggleStudentLessonComplete = (studentId: string, lessonId: string) => {
    const updated = students.map(s => {
      if (s.id !== studentId) return s;
      const isComp = s.completedLessons.includes(lessonId);
      const newCompleted = isComp
        ? s.completedLessons.filter(id => id !== lessonId)
        : [...s.completedLessons, lessonId];
      return { ...s, completedLessons: newCompleted };
    });
    persistStudents(updated);
    const targetStudent = updated.find(s => s.id === studentId);
    const isNowComp = targetStudent?.completedLessons.includes(lessonId);
    setMaterialToast(isNowComp ? `✅ Lección aprobada/completada para ${targetStudent?.name}` : `⏳ Lección marcada como pendiente para ${targetStudent?.name}`);
    setTimeout(() => setMaterialToast(null), 3000);
  };

  const handleBatchAssignLevel = (studentId: string, levelStr: string) => {
    const levelNum = levelStr === 'Principiante' ? 1 : 2;
    const levelLessonIds = (lessons || [])
      .filter(l => l.level === levelNum || l.difficulty?.toLowerCase() === levelStr.toLowerCase())
      .map(l => l.id);

    const updated = students.map(s => {
      if (s.id !== studentId) return s;
      const merged = Array.from(new Set([...s.assignedLessons, ...levelLessonIds]));
      return { ...s, assignedLessons: merged };
    });
    persistStudents(updated);
    const targetStudent = updated.find(s => s.id === studentId);
    setMaterialToast(`⚡ Asignadas ${levelLessonIds.length} clases de nivel ${levelStr} a ${targetStudent?.name}`);
    setTimeout(() => setMaterialToast(null), 3500);
  };

  const handleAddStudent = (newStudentData: Omit<EnrolledStudent, 'id' | 'points' | 'lastActive'>) => {
    const newSt: EnrolledStudent = {
      ...newStudentData,
      id: `st-${Date.now()}`,
      points: 120,
      lastActive: 'Recién añadido'
    };
    const updated = [newSt, ...students];
    persistStudents(updated);
    setSelectedStudentId(newSt.id);
    setMaterialToast(`🎓 Alumno ${newSt.name} registrado e inscrito exitosamente`);
    setTimeout(() => setMaterialToast(null), 3500);
  };

  const handleUpdateStudentNotes = (studentId: string, notes: string) => {
    const updated = students.map(s => s.id === studentId ? { ...s, notes } : s);
    persistStudents(updated);
    setMaterialToast('📝 Ficha y observaciones del alumno actualizadas');
    setTimeout(() => setMaterialToast(null), 3000);
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      style: 'all',
      technique: 'all',
      difficulty: 'all',
      completion: 'all',
      searchQuery: '',
    });
  };

  // Helper filter matching function with Student Mode Support
  const matchesLessonFilters = (lesson: Lesson, f: FilterState, instFilter: string) => {
    if (instFilter !== 'all' && lesson.instructorId !== instFilter) return false;

    // Instructor / Academy Student Filtering Mode
    if (isInstructorOrAcademy && selectedStudentId !== 'all' && selectedStudent) {
      if (studentClassFilter === 'assigned') {
        if (!selectedStudent.assignedLessons.includes(lesson.id)) return false;
      } else if (studentClassFilter === 'completed') {
        if (!selectedStudent.completedLessons.includes(lesson.id)) return false;
      } else if (studentClassFilter === 'pending') {
        if (!selectedStudent.assignedLessons.includes(lesson.id) || selectedStudent.completedLessons.includes(lesson.id)) return false;
      } else if (studentClassFilter === 'recommended') {
        const studentLevelNum = selectedStudent.level === 'Principiante' ? 1 : 2;
        if (lesson.level !== studentLevelNum && lesson.difficulty?.toLowerCase() !== selectedStudent.level.toLowerCase()) {
          return false;
        }
      }
    }

    // Style match
    if (f.style !== 'all') {
      const lessonStyle = lesson.style || (
        lesson.category === 'caracter' ? 'punking' :
        lesson.category === 'velocidad' ? 'fast_waack' :
        lesson.category === 'postura' ? 'classic' :
        lesson.category === 'improvisacion' ? 'soul_freestyle' :
        lesson.category === 'fundamentos' ? 'posing' : 'classic'
      );
      if (lessonStyle !== f.style) return false;
    }

    // Technique match
    if (f.technique !== 'all') {
      const lessonTech = lesson.technique || (
        lesson.category === 'brazos' ? 'rolls' :
        lesson.category === 'postura' ? 'posture' :
        lesson.category === 'musicalidad' ? 'musicality' :
        lesson.category === 'caracter' ? 'drama' :
        lesson.category === 'velocidad' ? 'speed' :
        lesson.category === 'improvisacion' ? 'footwork' : 'fundamentals'
      );
      if (lessonTech !== f.technique) return false;
    }

    // Difficulty match
    if (f.difficulty !== 'all') {
      const lessonDiff = lesson.difficulty || (lesson.level === 1 ? 'principiante' : 'intermedio');
      if (f.difficulty === 'principiante') {
        if (lessonDiff !== 'principiante' && lesson.level !== 1) return false;
      } else if (f.difficulty === 'intermedio') {
        if (lessonDiff !== 'intermedio' && lesson.level !== 2) return false;
      } else if (f.difficulty === 'avanzado') {
        if (lessonDiff !== 'avanzado') return false;
      }
    }

    // Completion status
    if (f.completion === 'completed') {
      if (!currentUser.completedLessons?.includes(lesson.id)) return false;
    } else if (f.completion === 'pending') {
      if (currentUser.completedLessons?.includes(lesson.id)) return false;
    }

    // Search query
    if (f.searchQuery.trim()) {
      const q = f.searchQuery.toLowerCase().trim();
      const matchTitle = lesson.title.toLowerCase().includes(q);
      const matchDesc = (lesson.description || '').toLowerCase().includes(q);
      const matchInstructor = (lesson.instructorName || '').toLowerCase().includes(q);
      const matchCategory = (lesson.category || '').toLowerCase().includes(q);
      const matchTags = (lesson.tags || []).some(tag => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchInstructor && !matchCategory && !matchTags) {
        return false;
      }
    }

    return true;
  };

  // Filtered lessons across all active criteria
  const filteredLessons = (lessons || []).filter(l => matchesLessonFilters(l, filters, selectedInstructorFilter));

  // Selected Active Lesson in Video Player
  const [activeLesson, setActiveLesson] = useState<Lesson | undefined>(() => (lessons && lessons.length > 0) ? lessons[0] : undefined);

  // Download / Material notification toast
  const [materialToast, setMaterialToast] = useState<string | null>(null);

  // Sync active lesson when filters change
  useEffect(() => {
    if (filteredLessons.length > 0) {
      if (!activeLesson || !filteredLessons.some(l => l.id === activeLesson.id)) {
        setActiveLesson(filteredLessons[0]);
      }
    }
  }, [filters, selectedInstructorFilter, lessons]);

  // Workbook page index
  const [workbookPage, setWorkbookPage] = useState(0);

  // Gemini Executive Summary & Transcript states
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [generatedSummaries, setGeneratedSummaries] = useState<{ [lessonId: string]: string }>({});
  const [showTranscripts, setShowTranscripts] = useState<{ [lessonId: string]: boolean }>({});
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [copiedSummaryId, setCopiedSummaryId] = useState<string | null>(null);

  const handleGenerateSummary = async (lesson: Lesson) => {
    setIsSummarizing(true);
    setSummaryError(null);

    const transcriptText = lesson.transcription || `[00:00] Inicio de la clase ${lesson.title}.\n[02:00] Explicación biomecánica de la postura y control articular.\n[05:00] Ejecución de drills a velocidad progresiva.\n[10:00] Consejos de improvisación y musicalidad en compás 4/4.`;

    try {
      const res = await fetch('/api/gemini/summarize-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          lessonDescription: lesson.description || '',
          instructorName: lesson.instructorName || 'Brando Hermoso',
          category: lesson.category || 'técnica',
          transcription: transcriptText
        })
      });

      const data = await res.json();
      if (data.summary) {
        setGeneratedSummaries(prev => ({
          ...prev,
          [lesson.id]: data.summary
        }));
      } else {
        setSummaryError('No se pudo generar el resumen ejecutivo.');
      }
    } catch (err: any) {
      console.error('Error generating summary:', err);
      setSummaryError('Error de conexión al generar resumen con Gemini.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCopySummary = (summaryText: string, lessonId: string) => {
    navigator.clipboard.writeText(summaryText);
    setCopiedSummaryId(lessonId);
    setTimeout(() => setCopiedSummaryId(null), 3000);
  };

  const toggleShowTranscript = (lessonId: string) => {
    setShowTranscripts(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }));
  };

  // Global Progress Calculation
  const completedCount = (lessons || []).filter(l => (currentUser.completedLessons || []).includes(l.id)).length;
  const progressPercent = Math.round((completedCount / ((lessons && lessons.length) || 1)) * 100) || 0;

  const handleLessonSelect = (lesson: Lesson) => {
    setActiveLesson(lesson);
  };

  const handleToggleComplete = (lessonId: string) => {
    const isCompleted = (currentUser.completedLessons || []).includes(lessonId);
    onMarkLessonComplete(lessonId, !isCompleted);
  };

  const handleDownloadMaterial = (title: string) => {
    setMaterialToast(`📥 Material Descargado: "${title}". Archivo PDF guardado en tu dispositivo.`);
    setTimeout(() => setMaterialToast(null), 4000);
  };

  const t = translations[language] || translations['es'];

  // Filtered list of subscribed instructors
  const subscribedInstructors = (instructors || []).filter(i => i && i.isSubscribed);

  return (
    <div className="flex-1 min-h-full w-full p-4 sm:p-6 bg-[#09080d] text-white flex flex-col font-body-md space-y-6">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {materialToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-[#D9A9FF] text-black px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 border border-black/20"
          >
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{materialToast}</span>
          </motion.div>
        )}
        {goalSavedToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-gradient-to-r from-[#D9A9FF] to-amber-400 text-black px-5 py-3.5 rounded-2xl shadow-2xl font-extrabold text-xs flex items-center gap-2.5 border border-black/20"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0 text-black" />
            <span>🎯 Meta de entrenamiento actualizada a {targetGoalMinutes} min/día ({targetWeeklyDays} días/semana).</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONDITIONAL BANNER: INSTRUCTOR / ACADEMY STUDENT MANAGEMENT BANNER VS STANDARD BANNER */}
      {isInstructorOrAcademy ? (
        <InstructorStudentClassFilterBanner
          currentUser={currentUser}
          students={students}
          selectedStudentId={selectedStudentId}
          onSelectStudent={setSelectedStudentId}
          studentClassFilter={studentClassFilter}
          onStudentClassFilterChange={setStudentClassFilter}
          lessons={lessons || []}
          instructors={subscribedInstructors}
          onBatchAssignLevel={handleBatchAssignLevel}
          onAddStudent={handleAddStudent}
          onUpdateStudentNotes={handleUpdateStudentNotes}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          setActiveTab={setActiveTab}
          onOpenSpotifyPlayer={onOpenSpotifyPlayer}
          onOpenPreviewModal={() => setShowPreviewModal(true)}
          subscribedInstructorsCount={(subscribedInstructors || []).length}
        />
      ) : (
        <>
          {/* HEADER SECTION FOR STUDENTS */}
          <div className="bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-pink-900/20 border border-white/15 p-6 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <Logo variant="full" className="w-36 h-auto shrink-0" />
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-mono font-bold text-[#D9A9FF] bg-white/10 border border-[#D9A9FF]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#D9A9FF]" /> CÁTEDRAS ACTIVAS
                  </span>
                  <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full uppercase">
                    {(subscribedInstructors || []).length} PROFESORES SUSCRITOS
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  Clases, Cursos & Materiales por Instructor
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  Accede al desglose exclusivo de lecciones en video, programas intensivos y guías teóricas organizados específicamente según tus catedráticos suscritos.
                </p>
              </div>
            </div>

            {/* Action / Mode Tabs */}
            <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
              {onOpenSpotifyPlayer && (
                <button
                  type="button"
                  onClick={onOpenSpotifyPlayer}
                  className="px-3.5 py-2 text-xs font-black rounded-2xl bg-[#1DB954]/20 hover:bg-[#1DB954]/30 text-[#1DB954] border border-[#1DB954]/50 transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer uppercase tracking-wider"
                  title="Reproductor de Música y Playlists de Waacking en Spotify"
                >
                  <Music className="w-4 h-4 text-[#1DB954]" />
                  <span>Música Spotify</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="px-4 py-2 text-xs font-black rounded-2xl bg-[#D9A9FF] hover:bg-[#F2CFFF] text-black transition-all flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer uppercase tracking-wider"
                title="Abrir Vista Previa de Formación y Contenido"
              >
                <Eye className="w-4 h-4 text-black" />
                <span>Vista Previa Formación</span>
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
                  className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 ${
                    currentTab === 'catedras' ? 'bg-[#D9A9FF] text-black shadow-lg' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Desglose por Cátedra</span>
                </button>
                <button
                  onClick={() => setCurrentTab('metas')}
                  className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 ${
                    currentTab === 'metas' ? 'bg-[#D9A9FF] text-black shadow-lg' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Metas & 7 Días</span>
                </button>
                <button
                  onClick={() => setCurrentTab('workbook')}
                  className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 ${
                    currentTab === 'workbook' ? 'bg-[#D9A9FF] text-black shadow-lg' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Bitácora Teórica</span>
                </button>
                <button
                  onClick={() => setCurrentTab('feedback')}
                  className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 ${
                    currentTab === 'feedback' ? 'bg-[#D9A9FF] text-black shadow-lg' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Feedback & Video</span>
                </button>
              </div>
            </div>
          </div>

          {/* SUBSCRIBED INSTRUCTORS SELECTOR BAR */}
          <div className="bg-gradient-to-r from-[#171322] via-[#211a30] to-[#12101b] border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D9A9FF]/15 border border-[#D9A9FF]/40 flex items-center justify-center text-[#D9A9FF] shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  TUS PROFESORES ACTUALES EN CÁTEDRA:
                </h3>
                <p className="text-[11px] text-slate-400">
                  Selecciona un profesor para filtrar todo su contenido o mantén la vista unificada.
                </p>
              </div>
            </div>

            {/* Instructor Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <button
                type="button"
                onClick={() => setSelectedInstructorFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all shrink-0 flex items-center gap-2 ${
                  selectedInstructorFilter === 'all'
                    ? 'bg-white text-black border-white shadow-lg'
                    : 'bg-black/40 text-slate-300 border-white/10 hover:border-white/30'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Ver Todas las Cátedras</span>
              </button>

              {(subscribedInstructors || []).map((inst) => {
                const isSel = selectedInstructorFilter === inst.id;
                return (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => setSelectedInstructorFilter(inst.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all shrink-0 flex items-center gap-2 ${
                      isSel
                        ? 'bg-[#D9A9FF] text-black border-[#D9A9FF] shadow-lg'
                        : 'bg-black/40 text-slate-200 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src={inst.avatar} alt={inst.name} className="w-5 h-5 rounded-full object-cover border border-white/20" />
                    <span>{inst.name}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/30 text-current">
                      {inst.lessonsCount} Lecciones
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* CATEGORY & ATTRIBUTE FILTER BAR */}
      <CategoryFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        totalLessonsCount={(lessons || []).length}
        filteredLessonsCount={filteredLessons.length}
        activeDimensionTab={activeDimensionTab}
        setActiveDimensionTab={setActiveDimensionTab}
      />

      {/* VIEW LAYOUT TOGGLE */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-[#100d1a] border border-white/10 p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 font-bold uppercase">Modo de Visualización:</span>
          <span className="text-xs font-bold text-[#D9A9FF] bg-[#D9A9FF]/10 px-2 py-0.5 rounded-lg border border-[#D9A9FF]/30">
            {filteredLessons.length} Lecciones Filtradas
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setViewLayout('catedras')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewLayout === 'catedras'
                ? 'bg-[#D9A9FF] text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Desglose por Cátedra</span>
          </button>

          <button
            type="button"
            onClick={() => setViewLayout('catalog')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewLayout === 'catalog'
                ? 'bg-[#D9A9FF] text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Catálogo Unificado</span>
          </button>
        </div>
      </div>

      {/* MAIN CATEDRAS BREAKDOWN VIEW */}
      {currentTab === 'catedras' && viewLayout === 'catedras' && (
        <div className="space-y-8">

          {/* GLOBAL PROGRESS SUMMARY */}
          <div className="bg-[#12101c] border border-white/10 rounded-2xl p-5 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-8 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#D9A9FF] uppercase tracking-wider">
                  AVANCE DE APRENDIZAZAJE UNIFICADO EN TUS CÁTEDRAS
                </span>
                <span className="text-xs font-mono font-extrabold text-white">
                  {completedCount} de {(lessons || []).length} Lecciones Completadas ({progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-black/60 h-3 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="bg-gradient-to-r from-[#D9A9FF] via-amber-400 to-purple-500 h-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <div className="md:col-span-4 flex items-center justify-end gap-3 text-xs font-mono text-slate-300">
              <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-center flex-1">
                <span className="text-lg font-black text-white block">{(subscribedInstructors || []).length}</span>
                <span className="text-[9px] text-slate-400 uppercase">Cátedras Activas</span>
              </div>
              <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-center flex-1">
                <span className="text-lg font-black text-emerald-400 block">{currentUser.points}</span>
                <span className="text-[9px] text-slate-400 uppercase">Puntos Ganados</span>
              </div>
            </div>
          </div>

          {/* 5 PILARES TÉCNICOS DEL WAACKING (COLECCIÓN BANNERS) */}
          <WaackingPillarsGallery />

          {/* INSTRUCTOR BREAKDOWN SECTION CARDS */}
          {(instructors || [])
            .filter(inst => inst && (selectedInstructorFilter === 'all' || selectedInstructorFilter === inst.id))
            .map((instructor) => {
              const instLessons = (lessons || []).filter(l => l && l.instructorId === instructor.id);
              const instCompleted = instLessons.filter(l => (currentUser.completedLessons || []).includes(l.id)).length;
              const instProgress = instLessons.length > 0 ? Math.round((instCompleted / instLessons.length) * 100) : 0;

              return (
                <div 
                  key={instructor.id}
                  className="bg-[#120f1d] border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all"
                >
                  {/* CATEDRA HEADER SHOWCASE BANNER */}
                  <div className={`p-6 bg-gradient-to-r ${instructor.featuredColor} border-b border-white/10 relative overflow-hidden`}>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#D9A9FF] shadow-2xl shrink-0">
                          <img src={instructor.avatar} alt={instructor.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[10px] font-mono font-black text-[#D9A9FF] bg-black/60 px-2.5 py-0.5 rounded-full border border-[#D9A9FF]/30 uppercase">
                              CÁTEDRA OFICIAL
                            </span>
                            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase">
                              {instructor.specialty}
                            </span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                            {instructor.name}
                          </h2>
                          <p className="text-xs text-purple-200 font-medium mt-0.5 max-w-2xl leading-relaxed">
                            {instructor.bio}
                          </p>
                        </div>
                      </div>

                      {/* Instructor Stats Pill */}
                      <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 shrink-0 self-start lg:self-center">
                        <div className="text-center px-2">
                          <p className="text-[9px] font-mono text-slate-400 uppercase">Programas</p>
                          <p className="text-sm font-black text-white">{(instructor.courses || []).length}</p>
                        </div>
                        <div className="h-6 w-px bg-white/20" />
                        <div className="text-center px-2">
                          <p className="text-[9px] font-mono text-slate-400 uppercase">Video Clases</p>
                          <p className="text-sm font-black text-[#D9A9FF]">{(instLessons || []).length}</p>
                        </div>
                        <div className="h-6 w-px bg-white/20" />
                        <div className="text-center px-2">
                          <p className="text-[9px] font-mono text-slate-400 uppercase">Materiales</p>
                          <p className="text-sm font-black text-purple-300">{(instructor.materials || []).length} PDFs</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CATEDRA CONTENT GRID (3 CATEGORIES IN INTEGRATED VIEW) */}
                  <div className="p-6 space-y-8">

                    {/* 1. PROGRAMAS & CURSOS INTENSIVOS DE LA CÁTEDRA */}
                    <div>
                      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                          <Award className="w-4 h-4 text-[#D9A9FF]" />
                          Programas & Cursos Intensivos de {instructor.name}
                        </h3>
                        <span className="text-[10px] font-mono text-slate-400">
                          {(instructor.courses || []).length} Programas Especializados
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {(instructor.courses || []).map((course) => (
                          <div 
                            key={course.id}
                            className="bg-[#0b0a12] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-[#D9A9FF]/40 transition-all shadow-lg group"
                          >
                            <div className="relative aspect-video overflow-hidden">
                              <img 
                                src={course.coverImage} 
                                alt={course.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                              <span className="absolute top-3 left-3 bg-black/80 border border-[#D9A9FF]/40 text-[#D9A9FF] text-[9px] font-mono font-bold px-2.5 py-1 rounded-xl uppercase">
                                {course.level}
                              </span>
                              <span className="absolute bottom-3 left-3 right-3 text-xs font-black text-white truncate">
                                {course.title}
                              </span>
                            </div>

                            <div className="p-4 space-y-3">
                              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                                {course.description}
                              </p>
                              
                              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-white/10 pt-2.5">
                                <span>Duración: {course.durationWeeks} Semanas</span>
                                <span>Módulos: {course.modulesCount} Temas</span>
                                <span className="text-emerald-400 font-bold">● Disponible</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  // Select first lesson of this instructor or notify
                                  if (instLessons.length > 0) setActiveLesson(instLessons[0]);
                                }}
                                className="w-full py-2 bg-[#D9A9FF]/20 hover:bg-[#D9A9FF]/30 text-[#D9A9FF] border border-[#D9A9FF]/40 rounded-xl text-xs font-extrabold uppercase transition-all flex items-center justify-center gap-1.5"
                              >
                                Ver Módulos de la Cátedra <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 2. CLASES EN VIDEO Y REPRODUCTOR DE LA CÁTEDRA */}
                    <div>
                      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                          <Video className="w-4 h-4 text-purple-400" />
                          Clases en Video de {instructor.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedLevel(1)}
                            className={`px-3 py-1 rounded-xl text-[10px] font-bold border ${
                              selectedLevel === 1 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-black/30 text-slate-400 border-white/10'
                            }`}
                          >
                            Nivel 1
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedLevel(2)}
                            className={`px-3 py-1 rounded-xl text-[10px] font-bold border ${
                              selectedLevel === 2 ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-black/30 text-slate-400 border-white/10'
                            }`}
                          >
                            Nivel 2
                          </button>
                        </div>
                      </div>

                      {/* Video Player & Lesson List Layout */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        
                        {/* Video Player (7 cols) */}
                        <div className="lg:col-span-7 bg-[#0b0a12] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                          {(() => {
                            const curL = (activeLesson && activeLesson.instructorId === instructor.id) ? activeLesson : (instLessons[0] || activeLesson);
                            if (!curL) {
                              return (
                                <div className="p-8 text-center text-xs text-slate-400 font-mono">
                                  No hay clases publicadas aún para este profesor.
                                </div>
                              );
                            }
                            return (
                              <>
                                <div className="relative aspect-video bg-black overflow-hidden group">
                                  <img 
                                    src={curL.videoUrl || instructor.courses[0]?.coverImage} 
                                    alt={curL.title}
                                    className="w-full h-full object-cover opacity-80" 
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-14 h-14 rounded-full bg-[#D9A9FF] text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                                      <Play className="w-6 h-6 fill-current ml-1" />
                                    </div>
                                  </div>
                                  <span className="absolute top-3 left-3 bg-black/80 text-[#D9A9FF] text-[9px] font-mono font-bold px-2.5 py-1 rounded-xl uppercase border border-[#D9A9FF]/30">
                                    {curL.category}
                                  </span>
                                </div>

                                <div className="p-4 space-y-3">
                                  <div className="flex items-start justify-between gap-3 flex-wrap">
                                    <div>
                                      <h4 className="text-base font-black text-white uppercase">{curL.title}</h4>
                                      <p className="text-[10px] text-[#D9A9FF] font-mono uppercase mt-0.5">
                                        {instructor.name} • DURACIÓN: {curL.duration}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {isInstructorOrAcademy && selectedStudent && (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => handleToggleStudentAssignLesson(selectedStudent.id, curL.id)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                                              selectedStudent.assignedLessons.includes(curL.id)
                                                ? 'bg-[#D9A9FF]/20 text-[#D9A9FF] border-[#D9A9FF]/40 hover:bg-[#D9A9FF]/30'
                                                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                                            }`}
                                            title={`Asignar a ${selectedStudent.name}`}
                                          >
                                            <Bookmark className="w-3.5 h-3.5" />
                                            <span>{selectedStudent.assignedLessons.includes(curL.id) ? 'Asignada a Alumno' : '+ Asignar a Alumno'}</span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => handleToggleStudentLessonComplete(selectedStudent.id, curL.id)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                                              selectedStudent.completedLessons.includes(curL.id)
                                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                                            }`}
                                            title={`Validar aprobación de ${selectedStudent.name}`}
                                          >
                                            <CheckCircle className="w-3.5 h-3.5" />
                                            <span>{selectedStudent.completedLessons.includes(curL.id) ? 'Alumno: Aprobada' : 'Validar Alumno'}</span>
                                          </button>
                                        </>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => handleToggleComplete(curL.id)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-1.5 ${
                                          (currentUser.completedLessons || []).includes(curL.id)
                                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                            : 'bg-[#D9A9FF] text-black border-[#D9A9FF]'
                                        }`}
                                      >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        <span>{(currentUser.completedLessons || []).includes(curL.id) ? 'COMPLETADA' : 'MARCAR COMPLETADA'}</span>
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-xs text-slate-300 leading-relaxed">{curL.description}</p>
                                  
                                  {/* AI Executive Summary & Transcription Section */}
                                  <div className="pt-3 border-t border-white/10 space-y-3">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <button
                                          type="button"
                                          onClick={() => handleGenerateSummary(curL)}
                                          disabled={isSummarizing}
                                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-purple-500/30 text-[#D9A9FF] border border-[#D9A9FF]/40 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                                        >
                                          <Sparkles className={`w-4 h-4 text-[#D9A9FF] ${isSummarizing ? 'animate-spin' : ''}`} />
                                          <span>{generatedSummaries[curL.id] ? 'Regenerar Resumen' : 'Generar Resumen Ejecutivo (Gemini IA)'}</span>
                                          <span className="text-[9px] bg-[#D9A9FF]/20 text-[#D9A9FF] px-1.5 py-0.5 rounded font-mono uppercase border border-[#D9A9FF]/30">IA</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => toggleShowTranscript(curL.id)}
                                          className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                                        >
                                          <FileText className="w-3.5 h-3.5 text-purple-400" />
                                          <span>{showTranscripts[curL.id] ? 'Ocultar Transcripción' : 'Ver Transcripción'}</span>
                                        </button>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setCurrentTab('feedback');
                                          setShowFeedbackForm(true);
                                          setNewVideoTitle(`Video de Práctica: ${curL.title}`);
                                        }}
                                        className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                                      >
                                        <Video className="w-3.5 h-3.5 text-[#D9A9FF]" /> Subir Video
                                      </button>
                                    </div>

                                    {/* Loading State */}
                                    {isSummarizing && (
                                      <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200 flex items-center gap-3 animate-pulse">
                                        <Sparkles className="w-5 h-5 text-[#D9A9FF] animate-spin shrink-0" />
                                        <div>
                                          <p className="text-xs font-bold text-white">Generando Resumen Ejecutivo con Gemini IA...</p>
                                          <p className="text-[10px] text-purple-300 font-mono">Procesando transcripción limpia para extraer objetivos, pilares técnicos y ejercicios somáticos.</p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Summary Display Card */}
                                    {generatedSummaries[curL.id] && !isSummarizing && (
                                      <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 rounded-xl bg-slate-900/90 border border-[#D9A9FF]/40 space-y-3 shadow-2xl relative overflow-hidden"
                                      >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D9A9FF]/5 rounded-full blur-2xl pointer-events-none" />
                                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                          <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-[#D9A9FF]/20 border border-[#D9A9FF]/30 text-[#D9A9FF]">
                                              <Sparkles className="w-4 h-4" />
                                            </div>
                                            <div>
                                              <h5 className="text-xs font-black text-white uppercase tracking-wider">RESUMEN EJECUTIVO (GEMINI IA)</h5>
                                              <p className="text-[10px] text-[#D9A9FF] font-mono">Análisis inteligente basado en la transcripción limpia de la clase</p>
                                            </div>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() => handleCopySummary(generatedSummaries[curL.id], curL.id)}
                                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all border border-white/10 cursor-pointer"
                                          >
                                            {copiedSummaryId === curL.id ? (
                                              <>
                                                <Check className="w-3 h-3 text-emerald-400" />
                                                <span className="text-emerald-400">¡Copiado!</span>
                                              </>
                                            ) : (
                                              <>
                                                <Copy className="w-3 h-3 text-slate-300" />
                                                <span>Copiar</span>
                                              </>
                                            )}
                                          </button>
                                        </div>

                                        <div className="text-xs text-slate-200 leading-relaxed font-sans space-y-2 whitespace-pre-line max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                          {generatedSummaries[curL.id]}
                                        </div>
                                      </motion.div>
                                    )}

                                    {/* Full Transcription Card */}
                                    {showTranscripts[curL.id] && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2"
                                      >
                                        <div className="flex items-center justify-between">
                                          <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                            <FileText className="w-3.5 h-3.5 text-purple-400" />
                                            Transcripción Oficial de la Clase
                                          </h5>
                                          <span className="text-[10px] font-mono text-slate-500">Audio limpio • Marcas de tiempo</span>
                                        </div>
                                        <div className="p-3 bg-slate-950/80 rounded-lg border border-white/5 text-xs text-slate-300 font-mono leading-relaxed max-h-60 overflow-y-auto whitespace-pre-line custom-scrollbar">
                                          {curL.transcription || `[00:00] Inicio de la clase ${curL.title}.\n[02:00] Explicación biomecánica de la postura y control articular.\n[05:00] Ejecución de drills a velocidad progresiva.\n[10:00] Consejos de improvisación y musicalidad en compás 4/4.`}
                                        </div>
                                      </motion.div>
                                    )}

                                    {summaryError && (
                                      <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
                                        {summaryError}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>

                        {/* Lesson List (5 cols) */}
                        <div className="lg:col-span-5 bg-[#0b0a12] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                          <div className="space-y-2">
                            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                              LECCIONES DE LA CÁTEDRA ({(instLessons || []).length})
                            </p>
                            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                              {(instLessons || []).map((l) => {
                                const isAct = activeLesson.id === l.id;
                                const isComp = (currentUser.completedLessons || []).includes(l.id);
                                return (
                                  <div
                                    key={l.id}
                                    onClick={() => handleLessonSelect(l)}
                                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                      isAct 
                                        ? 'bg-[#D9A9FF]/15 border-[#D9A9FF] text-white shadow-md' 
                                        : 'bg-black/40 border-white/5 hover:border-white/20 text-slate-300'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div 
                                        onClick={(e) => { e.stopPropagation(); handleToggleComplete(l.id); }}
                                        className="shrink-0 cursor-pointer text-[#D9A9FF]"
                                      >
                                        {isComp ? <CheckSquare className="w-4 h-4 text-[#D9A9FF]" /> : <Square className="w-4 h-4 text-slate-500" />}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs font-bold truncate uppercase">{l.title}</p>
                                        <p className="text-[9px] font-mono text-slate-400">{l.duration} • {l.category}</p>
                                      </div>
                                    </div>
                                    <Play className={`w-3.5 h-3.5 shrink-0 ${isAct ? 'text-[#D9A9FF] fill-current' : 'text-slate-500'}`} />
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setActiveTab('entrenamiento')}
                            className="w-full mt-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs font-extrabold uppercase transition-all flex items-center justify-center gap-1.5"
                          >
                            Ir a Entrenar con el Botón de Drill <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    </div>

                    {/* 3. MATERIALES & WORKBOOKS EXCLUSIVOS DE LA CÁTEDRA */}
                    <div>
                      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-400" />
                          Materiales de Estudio & Workbooks de {instructor.name}
                        </h3>
                        <span className="text-[10px] font-mono text-slate-400">
                          {(instructor.materials || []).length} Documentos en PDF
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(instructor.materials || []).map((mat) => (
                          <div 
                            key={mat.id}
                            className="bg-[#0b0a12] border border-white/10 p-4 rounded-2xl flex flex-col justify-between hover:border-purple-400/40 transition-all shadow-md"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-mono font-extrabold text-purple-300 bg-purple-900/30 border border-purple-500/30 px-2 py-0.5 rounded-md uppercase">
                                  {mat.type} • {mat.pages} PÁGINAS
                                </span>
                                <span className="text-[9px] font-mono text-slate-400">{mat.fileSize}</span>
                              </div>
                              <h4 className="text-xs font-black text-white uppercase">{mat.title}</h4>
                              <p className="text-xs text-slate-400 leading-relaxed">{mat.description}</p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDownloadMaterial(mat.title)}
                              className="mt-4 w-full py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/30 text-xs font-extrabold uppercase transition-all flex items-center justify-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5 text-purple-300" /> Descargar PDF de Cátedra
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}

        </div>
      )}

      {/* UNIFIED DIRECT CATALOG VIEW */}
      {currentTab === 'catedras' && viewLayout === 'catalog' && (
        <div className="space-y-6">
          {/* CATALOG HEADER WITH ACTIVE FILTER CHIPS */}
          <div className="bg-[#12101f] border border-white/10 p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div>
              <h2 className="text-lg font-black text-white uppercase flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-[#D9A9FF]" />
                Catálogo Unificado de Clases de Waacking
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Mostrando {filteredLessons.length} lecciones filtradas por estilo, técnica y nivel de dificultad.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {filters.style !== 'all' && (
                <span className="text-[10px] font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  Estilo: {STYLE_OPTIONS.find(s => s.id === filters.style)?.label}
                  <button onClick={() => handleFilterChange({ style: 'all' })} className="hover:text-white font-black ml-1 cursor-pointer">×</button>
                </span>
              )}
              {filters.technique !== 'all' && (
                <span className="text-[10px] font-mono font-bold bg-blue-950/80 text-blue-300 border border-blue-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  Técnica: {TECHNIQUE_OPTIONS.find(t => t.id === filters.technique)?.label}
                  <button onClick={() => handleFilterChange({ technique: 'all' })} className="hover:text-white font-black ml-1 cursor-pointer">×</button>
                </span>
              )}
              {filters.difficulty !== 'all' && (
                <span className="text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  Nivel: {DIFFICULTY_OPTIONS.find(d => d.id === filters.difficulty)?.label}
                  <button onClick={() => handleFilterChange({ difficulty: 'all' })} className="hover:text-white font-black ml-1 cursor-pointer">×</button>
                </span>
              )}
              {filters.completion !== 'all' && (
                <span className="text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  Estado: {filters.completion === 'completed' ? 'Completadas' : 'Pendientes'}
                  <button onClick={() => handleFilterChange({ completion: 'all' })} className="hover:text-white font-black ml-1 cursor-pointer">×</button>
                </span>
              )}
            </div>
          </div>

          {/* CATALOG GRID */}
          {filteredLessons.length === 0 ? (
            <div className="bg-[#12101f] border border-white/10 p-12 rounded-3xl text-center space-y-4 shadow-xl">
              <ListFilter className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-base font-black text-white uppercase">No se encontraron lecciones</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No hay clases que cumplan simultáneamente con todos los criterios de estilo, técnica o nivel seleccionados.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-[#D9A9FF] hover:bg-[#B073E8] text-black font-extrabold text-xs uppercase rounded-xl transition-all shadow-lg flex items-center gap-2 mx-auto cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Restablecer Todos los Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredLessons.map((lesson) => {
                const isComp = (currentUser.completedLessons || []).includes(lesson.id);
                const isAct = activeLesson?.id === lesson.id;
                const inst = instructors.find(i => i.id === lesson.instructorId);

                // Student specific status if instructor/academy
                const isStudentAssigned = selectedStudent?.assignedLessons.includes(lesson.id);
                const isStudentCompleted = selectedStudent?.completedLessons.includes(lesson.id);
                const studentsCompletedThisCount = students.filter(s => s.completedLessons.includes(lesson.id)).length;

                return (
                  <div
                    key={lesson.id}
                    className={`bg-[#120f1d] border rounded-2xl overflow-hidden flex flex-col justify-between transition-all group hover:border-[#D9A9FF]/50 shadow-xl ${
                      isAct ? 'border-[#D9A9FF] ring-1 ring-[#D9A9FF]/40' : 'border-white/10'
                    }`}
                  >
                    {/* Thumbnail & Badges */}
                    <div className="relative aspect-video bg-black overflow-hidden">
                      <img
                        src={lesson.videoUrl || inst?.courses[0]?.coverImage}
                        alt={lesson.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        <span className="text-[9px] font-mono font-bold bg-black/80 text-[#D9A9FF] px-2 py-0.5 rounded-md border border-[#D9A9FF]/30 uppercase">
                          {lesson.category}
                        </span>
                        {lesson.difficulty && (
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md uppercase border ${
                            lesson.difficulty === 'principiante' 
                              ? 'bg-amber-950/80 text-amber-300 border-amber-500/30'
                              : lesson.difficulty === 'intermedio'
                              ? 'bg-purple-950/80 text-purple-300 border-purple-500/30'
                              : 'bg-rose-950/80 text-rose-300 border-rose-500/30'
                          }`}>
                            {lesson.difficulty}
                          </span>
                        )}
                      </div>

                      {/* Top Right: Student Management Badges */}
                      {isInstructorOrAcademy && (
                        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                          {selectedStudent ? (
                            <>
                              <span className={`text-[8px] font-mono font-black px-2 py-0.5 rounded-md uppercase border shadow-md ${
                                isStudentAssigned
                                  ? 'bg-[#D9A9FF] text-black border-[#D9A9FF]'
                                  : 'bg-black/80 text-slate-400 border-white/20'
                              }`}>
                                {isStudentAssigned ? '📌 Asignada a Alumno' : 'No asignada'}
                              </span>
                              {isStudentCompleted && (
                                <span className="text-[8px] font-mono font-black px-2 py-0.5 rounded-md uppercase bg-emerald-500 text-black border border-emerald-400 shadow-md">
                                  ✅ Aprobada por Alumno
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-[8px] font-mono font-bold px-2 py-0.5 rounded-md uppercase bg-black/80 text-cyan-300 border border-cyan-500/30">
                              👥 {studentsCompletedThisCount}/{students.length} Alumnos
                            </span>
                          )}
                        </div>
                      )}

                      {/* Bottom Info */}
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono">
                        <span className="bg-black/80 text-slate-300 px-2 py-0.5 rounded-md">
                          ⏱ {lesson.duration}
                        </span>
                        {lesson.bpm && (
                          <span className="bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30">
                            🎵 {lesson.bpm} BPM
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        {/* Instructor line */}
                        <div className="flex items-center gap-2">
                          <img
                            src={inst?.avatar}
                            alt={lesson.instructorName}
                            className="w-5 h-5 rounded-full object-cover border border-white/20"
                          />
                          <span className="text-[10px] font-mono text-slate-300 truncate uppercase">
                            {lesson.instructorName}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-black text-white uppercase line-clamp-2">
                          {lesson.title}
                        </h4>

                        {/* Style and Technique Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {lesson.style && (
                            <span className="text-[9px] font-mono text-purple-300 bg-purple-950/50 border border-purple-500/30 px-1.5 py-0.5 rounded">
                              {STYLE_OPTIONS.find(s => s.id === lesson.style)?.label || lesson.style}
                            </span>
                          )}
                          {lesson.technique && (
                            <span className="text-[9px] font-mono text-blue-300 bg-blue-950/50 border border-blue-500/30 px-1.5 py-0.5 rounded">
                              {TECHNIQUE_OPTIONS.find(t => t.id === lesson.technique)?.label || lesson.technique}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {lesson.description}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="space-y-2 pt-2 border-t border-white/10">
                        {/* Standard Player Button */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveLesson(lesson);
                              setViewLayout('catedras');
                            }}
                            className="flex-1 py-1.5 bg-[#D9A9FF] hover:bg-[#B073E8] text-black font-extrabold text-xs uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <Play className="w-3 h-3 fill-current" /> Ver en Video
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleComplete(lesson.id)}
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${
                              isComp
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-black/40 text-slate-400 border-white/10 hover:text-white'
                            }`}
                            title={isComp ? 'Marcar como pendiente' : 'Marcar como completada'}
                          >
                            {isComp ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Instructor / Academy Student Management Toolbar */}
                        {isInstructorOrAcademy && selectedStudent && (
                          <div className="pt-2 border-t border-white/10 flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleStudentAssignLesson(selectedStudent.id, lesson.id)}
                              className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                                isStudentAssigned
                                  ? 'bg-[#D9A9FF]/20 text-[#D9A9FF] border-[#D9A9FF]/40 hover:bg-[#D9A9FF]/30'
                                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                              }`}
                              title={`Asignar o desasignar esta clase al currículo de ${selectedStudent.name}`}
                            >
                              <span>{isStudentAssigned ? '📌 Asignada' : '+ Asignar'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleStudentLessonComplete(selectedStudent.id, lesson.id)}
                              className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                                isStudentCompleted
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                  : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                              }`}
                              title={`Validar aprobación técnica para ${selectedStudent.name}`}
                            >
                              <span>{isStudentCompleted ? '✅ Aprobada' : 'Validar'}</span>
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => setActiveTab('entrenamiento')}
                          className="w-full py-1 bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-mono font-bold uppercase rounded-lg border border-white/10 flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <Zap className="w-3 h-3 text-[#D9A9FF]" /> Practicar en Drills
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* WORKBOOK MODE */}
      {currentTab === 'workbook' && (
        <div className="flex-1 flex flex-col items-center justify-center w-full py-4 space-y-6">
          <div className="bg-[#12101f] border border-[#D9A9FF]/30 p-6 rounded-3xl text-center w-full relative overflow-hidden shadow-2xl text-white">
            <Book className="w-10 h-10 text-[#D9A9FF] mx-auto mb-3 animate-pulse" />
            <h3 className="text-xl font-black text-white uppercase tracking-tight">BITÁCORA TEÓRICA UNIFICADA v2.1</h3>
            <p className="text-xs text-slate-300 font-medium max-w-xl mx-auto mt-2 leading-relaxed">
              Recopilación teórica que integra las cátedras de Brando Hermoso y Elena Rostova: terminología, historia de los años 70 y plantillas de práctica.
            </p>
            <button
              type="button"
              onClick={() => handleDownloadMaterial('Waacking_Workbook_Unificado_V2.1.pdf')}
              className="mt-4 px-5 py-2.5 bg-[#D9A9FF] hover:bg-[#B073E8] text-black text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 mx-auto uppercase shadow-lg"
            >
              <Download className="w-4 h-4" /> Descargar Guía Unificada en PDF (Completa)
            </button>
          </div>

          {/* Interactive Workbook Reader */}
          <div className="bg-[#12101f] border border-white/10 w-full rounded-3xl overflow-hidden flex flex-col md:flex-row h-[380px] shadow-2xl text-white">
            {/* Navigation */}
            <div className="md:w-1/3 bg-black/50 p-4 border-r border-white/10 flex flex-col gap-2 overflow-y-auto">
              <p className="text-[10px] font-mono font-bold text-slate-400 tracking-wider mb-2 uppercase">CAPÍTULOS DISPONIBLES</p>
              {WORKBOOK_PAGES.map((page, idx) => (
                <button
                  key={idx}
                  onClick={() => setWorkbookPage(idx)}
                  className={`w-full text-left p-3 rounded-2xl transition-all border ${
                    workbookPage === idx 
                      ? 'bg-[#D9A9FF]/20 border-[#D9A9FF] text-white shadow-md' 
                      : 'text-slate-400 hover:text-white border-transparent'
                  }`}
                >
                  <p className="text-[10px] font-mono text-[#D9A9FF] font-bold uppercase">{page.subtitle}</p>
                  <h4 className="text-xs font-bold mt-1 uppercase truncate">{page.title}</h4>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b border-white/10 pb-2">
                  <span className="text-[9px] font-mono text-[#D9A9FF] tracking-widest font-bold uppercase">LECTURA TEÓRICA</span>
                  <h4 className="text-md font-extrabold text-white mt-1 uppercase">{WORKBOOK_PAGES[workbookPage].title}</h4>
                </div>
                <p className="text-xs text-slate-300 font-medium leading-relaxed whitespace-pre-line">
                  {WORKBOOK_PAGES[workbookPage].content}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Cuaderno Teórico de Waacking v2.1</span>
                <span>Página {workbookPage + 1} de {WORKBOOK_PAGES.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK & FREESTYLE VIDEO REVIEWS MODE */}
      {currentTab === 'feedback' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-pink-900/20 border border-white/15 p-6 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-[#D9A9FF] bg-white/10 border border-[#D9A9FF]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 w-fit mb-2">
                <Video className="w-3.5 h-3.5 text-[#D9A9FF]" /> REVISIÓN DE VIDEOS & FREESTYLE
              </span>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                Sesión de Feedback Somático y Corrección de Técnica
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Sube tus videos de freestyle, drills o ejercicios de las lecciones de tu cátedra para recibir análisis detallado, marca de tiempo y correcciones personalizadas de tus catedráticos.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowFeedbackForm(true)}
              className="px-5 py-2.5 bg-[#D9A9FF] hover:bg-[#AD70E5] text-black font-extrabold text-xs uppercase rounded-xl transition-all shadow-lg flex items-center gap-2 shrink-0 self-start md:self-auto cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Subir Nuevo Video
            </button>
          </div>

          <SomaticFeedbackLab
            currentUser={currentUser}
            feedbackItems={feedbackItems || []}
            showFeedbackForm={showFeedbackForm}
            setShowFeedbackForm={setShowFeedbackForm}
            newVideoTitle={newVideoTitle}
            setNewVideoTitle={setNewVideoTitle}
            newVideoUrl={newVideoUrl}
            setNewVideoUrl={setNewVideoUrl}
            newVideoDesc={newVideoDesc}
            setNewVideoDesc={setNewVideoDesc}
            handleFeedbackSubmit={handleFeedbackSubmit}
            correctionTime={correctionTime}
            setCorrectionTime={setCorrectionTime}
            correctionText={correctionText}
            setCorrectionText={setCorrectionText}
            handleAddCorrectionSubmit={handleAddCorrectionSubmit}
          />
        </div>
      )}

      {/* METAS DE ENTRENAMIENTO & 7 DÍAS MODE */}
      {currentTab === 'metas' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-900/30 via-purple-900/20 to-pink-900/20 border border-[#D9A9FF]/30 p-6 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#D9A9FF]/20 border border-[#D9A9FF]/50 flex items-center justify-center text-[#D9A9FF] shrink-0 shadow-lg">
                <Target className="w-8 h-8 text-[#D9A9FF]" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#D9A9FF] bg-white/10 border border-[#D9A9FF]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 w-fit mb-1">
                  <Sparkles className="w-3 h-3 text-[#D9A9FF]" /> GESTIÓN DE METAS DE APRENDIZAJE
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  Meta Diaria & Planificación de 7 Días
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Establece tu compromiso diario de minutos de práctica, ajusta tu ritmo semanal de 7 días y sincroniza tu avance con los programas y cátedras oficiales de Waack On.
                </p>
              </div>
            </div>

            {onOpenSpotifyPlayer && (
              <button
                type="button"
                onClick={onOpenSpotifyPlayer}
                className="px-4 py-2.5 bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold text-xs uppercase rounded-xl transition-all shadow-xl flex items-center gap-2 shrink-0 self-start md:self-auto cursor-pointer"
              >
                <Music className="w-4 h-4 text-black" />
                <span>Abrir Spotify Waack Tracks</span>
              </button>
            )}
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#12101f] border border-white/10 p-5 rounded-2xl shadow-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#8A8A8A] uppercase block">Meta Diaria Actual</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-black text-[#D9A9FF]">{currentUser.targetMinutes || targetGoalMinutes}</span>
                  <span className="text-xs text-slate-400 font-mono">minutos/día</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#D9A9FF]/10 border border-[#D9A9FF]/30 flex items-center justify-center text-[#D9A9FF]">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#12101f] border border-white/10 p-5 rounded-2xl shadow-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#8A8A8A] uppercase block">Objetivo Semanal (7 Días)</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-black text-white">{targetWeeklyDays}</span>
                  <span className="text-xs text-slate-400 font-mono">días / semana</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Flame className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#12101f] border border-white/10 p-5 rounded-2xl shadow-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#8A8A8A] uppercase block">Horas Totales Estimadas</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-black text-emerald-400">
                    {Math.round(((currentUser.targetMinutes || targetGoalMinutes) * targetWeeklyDays * 4) / 60)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">horas/mes</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#12101f] border border-white/10 p-5 rounded-2xl shadow-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#8A8A8A] uppercase block">Lecciones Completadas</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-black text-cyan-400">{completedCount}</span>
                  <span className="text-xs text-slate-400 font-mono">/ {(lessons || []).length}</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Interactive Goal Editor Card */}
          <div className="bg-[#120f1d] border border-white/15 p-6 rounded-3xl shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#D9A9FF]" /> Personalizar Meta Diaria y Frecuencia de Entrenamiento
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Selecciona la duración recomendada según tu nivel técnico y disponibilidad de práctica.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#D9A9FF] bg-[#D9A9FF]/10 px-3 py-1 rounded-xl border border-[#D9A9FF]/30">
                  Guardado Automático en Perfil
                </span>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="space-y-3">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                1. Selecciona tus Minutos Diarios Objetivo:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {[15, 20, 30, 45, 60, 90].map((mins) => {
                  const isSelected = (currentUser.targetMinutes || targetGoalMinutes) === mins;
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => handleSaveGoal(mins, targetWeeklyDays)}
                      className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-[#D9A9FF] text-black border-[#D9A9FF] font-black shadow-[0_0_20px_rgba(217, 169, 255,0.35)] scale-105'
                          : 'bg-black/40 text-white border-white/10 hover:border-white/30 hover:bg-white/5'
                      }`}
                    >
                      <span className="text-2xl font-black">{mins}</span>
                      <span className="text-[10px] font-mono uppercase tracking-wider opacity-80">minutos</span>
                      {mins === 30 && (
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full mt-1 ${isSelected ? 'bg-black text-[#D9A9FF]' : 'bg-[#D9A9FF]/20 text-[#D9A9FF]'}`}>
                          Recomendado
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Weekly Days Commitment */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                2. Frecuencia Semanal (Días de Práctica en 7 Días):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[3, 4, 5, 6, 7].map((days) => {
                  const isSelected = targetWeeklyDays === days;
                  return (
                    <button
                      key={days}
                      type="button"
                      onClick={() => handleSaveGoal(currentUser.targetMinutes || targetGoalMinutes, days)}
                      className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-400 font-black shadow-[0_0_20px_rgba(147,51,234,0.4)] scale-105'
                          : 'bg-black/40 text-white border-white/10 hover:border-white/30 hover:bg-white/5'
                      }`}
                    >
                      <span className="text-xl font-black">{days} Días</span>
                      <span className="text-[10px] font-mono text-purple-200">
                        {days === 7 ? 'Modo Intensivo' : days >= 5 ? 'Progreso Constante' : 'Mantenimiento'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Recommendations & Direct Shortcuts */}
            <div className="p-5 bg-black/50 border border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D9A9FF]" /> ¿Listo para comenzar tu sesión de hoy?
                </h4>
                <p className="text-[11px] text-slate-400">
                  Completa lecciones de tus cátedras suscritas o entrena drills con música disco en el metrónomo.
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => setCurrentTab('catedras')}
                  className="px-4 py-2 bg-[#D9A9FF] hover:bg-[#F2CFFF] text-black font-extrabold text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4 text-black" />
                  <span>Ir a Clases</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('entrenamiento')}
                  className="px-4 py-2 bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 font-extrabold text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Zap className="w-4 h-4 text-purple-300" />
                  <span>Zona de Entrenamiento</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE VISTA PREVIA DE FORMACIÓN Y CONTENIDO */}
      <FormationContentPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        lessons={lessons}
        instructors={instructors}
        onSelectLesson={(lesson) => {
          setActiveLesson(lesson);
          setCurrentTab('catedras');
        }}
      />

    </div>
  );
}
