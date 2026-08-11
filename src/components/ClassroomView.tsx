import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  Plus, 
  BookOpen, 
  Users, 
  Megaphone, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  FileText,
  Send,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { User, Lesson } from '../types';
import { Language, translations } from '../lib/translations';
import {
  ClassroomCourse,
  ClassroomCourseWork,
  ClassroomAnnouncement,
  ClassroomStudent,
  signInForGoogleClassroom,
  getClassroomAccessToken,
  listClassroomCourses,
  getClassroomCourseWork,
  getClassroomAnnouncements,
  getClassroomStudents,
  createClassroomCourse,
  createClassroomCourseWork,
  createClassroomAnnouncement
} from '../googleClassroom';

interface ClassroomViewProps {
  currentUser: User;
  language: Language;
  lessons: Lesson[];
}

export default function ClassroomView({ currentUser, language, lessons }: ClassroomViewProps) {
  const [token, setToken] = useState<string | null>(getClassroomAccessToken());
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<ClassroomCourse | null>(null);
  
  const [courseWork, setCourseWork] = useState<ClassroomCourseWork[]>([]);
  const [announcements, setAnnouncements] = useState<ClassroomAnnouncement[]>([]);
  const [students, setStudents] = useState<ClassroomStudent[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'work' | 'announcements' | 'students'>('work');

  // Modal States for mutating Google Classroom operations (Mandatory User Confirmation)
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [newCourseName, setNewCourseName] = useState('Waack On - Técnica & Musicalidad');
  const [newCourseSection, setNewCourseSection] = useState('Nivel Intermedio / Avanzado');

  const [showCreateWorkModal, setShowCreateWorkModal] = useState(false);
  const [newWorkTitle, setNewWorkTitle] = useState('');
  const [newWorkDesc, setNewWorkDesc] = useState('');
  const [newWorkPoints, setNewWorkPoints] = useState(100);

  const [showCreateAnnouncementModal, setShowCreateAnnouncementModal] = useState(false);
  const [newAnnouncementText, setNewAnnouncementText] = useState('');

  // Handle Google Classroom Login
  const handleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const token = await signInForGoogleClassroom();
      setToken(token);
      setSuccessMsg('¡Conectado exitosamente con Google Classroom!');
      await fetchCourses(token);
    } catch (err: any) {
      setErrorMsg(err.message || 'No se pudo iniciar sesión con Google Classroom.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Courses
  const fetchCourses = async (activeToken?: string) => {
    const tok = activeToken || token;
    if (!tok) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const list = await listClassroomCourses(tok);
      setCourses(list);
      if (list.length > 0 && !selectedCourse) {
        setSelectedCourse(list[0]);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('No se pudieron cargar las clases de Google Classroom.');
    } finally {
      setLoading(false);
    }
  };

  // Load Details for Selected Course
  useEffect(() => {
    if (selectedCourse && token) {
      loadCourseDetails(selectedCourse.id);
    }
  }, [selectedCourse, token]);

  const loadCourseDetails = async (courseId: string) => {
    if (!token) return;
    try {
      setLoading(true);
      const [works, annocs, studs] = await Promise.all([
        getClassroomCourseWork(courseId, token).catch(() => []),
        getClassroomAnnouncements(courseId, token).catch(() => []),
        getClassroomStudents(courseId, token).catch(() => [])
      ]);
      setCourseWork(works);
      setAnnouncements(annocs);
      setStudents(studs);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 1. CONFIRMATION & CREATE COURSE
  const handleConfirmCreateCourse = async () => {
    if (!newCourseName.trim() || !token) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const newCourse = await createClassroomCourse({
        name: newCourseName,
        section: newCourseSection,
        descriptionHeading: 'Waack On Academy - Integración Oficial'
      }, token);
      
      setShowCreateCourseModal(false);
      setSuccessMsg(`¡Clase "${newCourse.name}" creada correctamente en Google Classroom!`);
      await fetchCourses(token);
      setSelectedCourse(newCourse);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al crear la clase.');
    } finally {
      setLoading(false);
    }
  };

  // 2. CONFIRMATION & CREATE COURSEWORK
  const handleConfirmCreateWork = async () => {
    if (!newWorkTitle.trim() || !selectedCourse || !token) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      await createClassroomCourseWork(selectedCourse.id, {
        title: newWorkTitle,
        description: newWorkDesc,
        maxPoints: newWorkPoints,
        workType: 'ASSIGNMENT'
      }, token);

      setShowCreateWorkModal(false);
      setNewWorkTitle('');
      setNewWorkDesc('');
      setSuccessMsg('¡Tarea asignada con éxito en Google Classroom!');
      await loadCourseDetails(selectedCourse.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al asignar la tarea.');
    } finally {
      setLoading(false);
    }
  };

  // 3. CONFIRMATION & CREATE ANNOUNCEMENT
  const handleConfirmCreateAnnouncement = async () => {
    if (!newAnnouncementText.trim() || !selectedCourse || !token) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      await createClassroomAnnouncement(selectedCourse.id, newAnnouncementText, token);
      setShowCreateAnnouncementModal(false);
      setNewAnnouncementText('');
      setSuccessMsg('¡Anuncio publicado correctamente en el tablón de Google Classroom!');
      await loadCourseDetails(selectedCourse.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al publicar anuncio.');
    } finally {
      setLoading(false);
    }
  };

  // Quick sync Waack On drill to Google Classroom
  const handleSyncLessonToClassroom = (lesson: Lesson) => {
    if (!selectedCourse) {
      setErrorMsg('Selecciona primero una clase activa en Google Classroom.');
      return;
    }
    setNewWorkTitle(`[Waack On] ${lesson.title}`);
    setNewWorkDesc(`Categoría: ${lesson.category.toUpperCase()}\nNivel: ${lesson.level}\n\nObjetivos: Realizar la rutina de práctica y grabar video para corrección.\nRecurso de clase: ${lesson.videoUrl || 'Plataforma Waack On'}`);
    setShowCreateWorkModal(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#17142b] via-[#1f1a3a] to-[#120f24] p-6 sm:p-8 rounded-3xl border border-blue-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono font-black text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                GOOGLE WORKSPACE INTEGRATION
              </span>
              {token && (
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  CONECTADO
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-blue-400 shrink-0" />
              Google Classroom Sincronizado
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl font-medium">
              Conecta tus clases, tareas, anuncios y calificaciones directamente con Google Classroom. Sincroniza los módulos de Waack On con tus alumnos en un clic.
            </p>
          </div>

          {!token ? (
            <button
              onClick={handleLogin}
              disabled={loading}
              className="gsi-material-button self-start md:self-center shadow-xl hover:scale-105 active:scale-95 transition-all shrink-0"
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents font-bold text-xs">Conectar con Google Classroom</span>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchCourses()}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition-all flex items-center gap-2 shadow-lg"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
              {currentUser.role === 'instructor' && (
                <button
                  type="button"
                  onClick={() => setShowCreateCourseModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white border border-blue-400 text-xs font-extrabold uppercase transition-all shadow-lg hover:scale-105 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Clase
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast notifications */}
      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between text-rose-300 text-xs font-bold">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-emerald-300 text-xs font-bold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Workspace Integration Body */}
      {token ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Courses Sidebar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                Mis Clases en Google Classroom ({courses.length})
              </h2>
            </div>

            {courses.length === 0 ? (
              <div className="p-6 bg-[#131124] border border-white/10 rounded-2xl text-center space-y-3">
                <p className="text-xs text-slate-400">No se encontraron clases activas en tu cuenta de Google Classroom.</p>
                {currentUser.role === 'instructor' && (
                  <button
                    onClick={() => setShowCreateCourseModal(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all"
                  >
                    Crear primera clase en Google Classroom
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {(courses || []).map((course) => {
                  const isSelected = selectedCourse?.id === course.id;
                  return (
                    <div
                      key={course.id}
                      onClick={() => setSelectedCourse(course)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                        isSelected 
                          ? 'bg-[#1e1a38] border-blue-500/50 text-white shadow-xl' 
                          : 'bg-[#121021] border-white/10 text-slate-300 hover:border-white/20 hover:bg-[#18152e]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[9px] font-mono font-bold text-blue-400 uppercase bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                            {course.section || 'Clase Activa'}
                          </span>
                          <h3 className="text-sm font-black text-white mt-1 uppercase">{course.name}</h3>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{course.descriptionHeading || course.description}</p>
                        </div>
                        {course.alternateLink && (
                          <a
                            href={course.alternateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 text-slate-400 hover:text-blue-300 transition-all border border-white/10 shrink-0"
                            title="Abrir directamente en Google Classroom"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Waack On Quick Sync Module Panel */}
            <div className="p-5 bg-[#121021] border border-blue-500/20 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#E9C349]" />
                <h3 className="text-xs font-black text-white uppercase">Sincronización Rápida Waack On</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Exporta ejercicios prácticos y lecciones de Waack On a la clase seleccionada de Google Classroom con un clic:
              </p>
              <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
                {(lessons || []).slice(0, 4).map((l) => (
                  <div key={l.id} className="p-2.5 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-white truncate max-w-[170px]">{l.title}</span>
                    <button
                      type="button"
                      onClick={() => handleSyncLessonToClassroom(l)}
                      className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[10px] font-bold transition-all"
                    >
                      Exportar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Course Content Panel */}
          <div className="lg:col-span-2 space-y-4">
            {selectedCourse ? (
              <div className="bg-[#121021] border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl">
                {/* Course Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono font-black text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded uppercase">
                      CÓDIGO AULA: {selectedCourse.enrollmentCode || 'ACTIVO'}
                    </span>
                    <h2 className="text-xl font-black text-white uppercase mt-1">{selectedCourse.name}</h2>
                    <p className="text-xs text-slate-400">{selectedCourse.section} • {selectedCourse.descriptionHeading}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedCourse.alternateLink && (
                      <a
                        href={selectedCourse.alternateLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Ir a Google Classroom
                      </a>
                    )}
                  </div>
                </div>

                {/* Subtabs Toolbar */}
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('work')}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase transition-all flex items-center gap-2 ${
                        activeSubTab === 'work'
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Tareas ({courseWork.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('announcements')}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase transition-all flex items-center gap-2 ${
                        activeSubTab === 'announcements'
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Megaphone className="w-3.5 h-3.5" />
                      Anuncios ({announcements.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('students')}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase transition-all flex items-center gap-2 ${
                        activeSubTab === 'students'
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      Alumnos ({students.length})
                    </button>
                  </div>

                  {currentUser.role === 'instructor' && (
                    <div className="flex items-center gap-2">
                      {activeSubTab === 'work' && (
                        <button
                          type="button"
                          onClick={() => setShowCreateWorkModal(true)}
                          className="px-3.5 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Crear Tarea
                        </button>
                      )}
                      {activeSubTab === 'announcements' && (
                        <button
                          type="button"
                          onClick={() => setShowCreateAnnouncementModal(true)}
                          className="px-3.5 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Nuevo Anuncio
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Subtab 1: CourseWork / Assignments */}
                {activeSubTab === 'work' && (
                  <div className="space-y-3">
                    {courseWork.length === 0 ? (
                      <div className="p-8 bg-black/30 border border-white/5 rounded-2xl text-center space-y-2">
                        <FileText className="w-8 h-8 text-slate-500 mx-auto" />
                        <p className="text-xs text-slate-400">No hay tareas o asignaciones creadas en esta clase todavía.</p>
                      </div>
                    ) : (
                      (courseWork || []).map((w) => (
                        <div key={w.id || Math.random()} className="p-4 bg-black/40 border border-white/10 rounded-2xl flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase">
                                {w.maxPoints ? `${w.maxPoints} PTS` : 'TAREA'}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">{w.state || 'PUBLICADA'}</span>
                            </div>
                            <h4 className="text-sm font-black text-white mt-1 uppercase">{w.title}</h4>
                            <p className="text-xs text-slate-300 whitespace-pre-line mt-1">{w.description || 'Sin descripción adicional.'}</p>
                          </div>
                          {w.alternateLink && (
                            <a
                              href={w.alternateLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-blue-500/20 text-slate-300 hover:text-blue-300 text-xs font-bold border border-white/10 transition-all shrink-0 flex items-center gap-1"
                            >
                              Ver Tarea
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Subtab 2: Announcements */}
                {activeSubTab === 'announcements' && (
                  <div className="space-y-3">
                    {announcements.length === 0 ? (
                      <div className="p-8 bg-black/30 border border-white/5 rounded-2xl text-center space-y-2">
                        <Megaphone className="w-8 h-8 text-slate-500 mx-auto" />
                        <p className="text-xs text-slate-400">No hay anuncios publicados en el tablón de la clase.</p>
                      </div>
                    ) : (
                      (announcements || []).map((a) => (
                        <div key={a.id || Math.random()} className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span>ANUNCIO OFICIAL</span>
                            <span>{a.creationTime ? new Date(a.creationTime).toLocaleDateString() : 'Reciente'}</span>
                          </div>
                          <p className="text-xs text-slate-200 whitespace-pre-line">{a.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Subtab 3: Students Roster */}
                {activeSubTab === 'students' && (
                  <div className="space-y-3">
                    {students.length === 0 ? (
                      <div className="p-8 bg-black/30 border border-white/5 rounded-2xl text-center space-y-2">
                        <Users className="w-8 h-8 text-slate-500 mx-auto" />
                        <p className="text-xs text-slate-400">Los alumnos inscritos en Google Classroom aparecerán listados aquí.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(students || []).map((s) => (
                          <div key={s.userId} className="p-3 bg-black/40 border border-white/10 rounded-xl flex items-center gap-3">
                            <img
                              src={s.profile?.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                              alt="Alumno"
                              className="w-8 h-8 rounded-full border border-blue-400/40 object-cover"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{s.profile?.name?.fullName || 'Alumno Inscrito'}</p>
                              <p className="text-[10px] text-slate-400 truncate">{s.profile?.emailAddress || s.userId}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#121021] border border-white/10 rounded-3xl p-12 text-center space-y-3">
                <GraduationCap className="w-12 h-12 text-slate-500 mx-auto" />
                <p className="text-sm font-bold text-slate-300">Selecciona una clase de Google Classroom en el menú lateral para ver detalles.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Not logged in landing explanation */
        <div className="bg-[#121021] border border-white/10 rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center mx-auto text-blue-400">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase">Sincroniza con Google Classroom</h3>
            <p className="text-xs text-slate-400 max-w-lg mx-auto mt-2 leading-relaxed">
              Sincroniza tus cursos de danza, asignaciones de ejercicios de Waack On y listas de alumnos con tu aula virtual oficial de Google Classroom con permisos seguros.
            </p>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="gsi-material-button mx-auto shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            <div className="gsi-material-button-state"></div>
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents font-bold text-xs">Iniciar Sesión con Google</span>
            </div>
          </button>
        </div>
      )}

      {/* 1. MODAL: Confirm Create Course */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-[#121021] border border-blue-500/30 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-white">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase">Confirmar Creación de Clase</h3>
                <p className="text-[11px] text-slate-400">Se creará un nuevo curso real en tu Google Classroom.</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nombre de la Clase:</label>
                <input
                  type="text"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Sección / Nivel:</label>
                <input
                  type="text"
                  value={newCourseSection}
                  onChange={(e) => setNewCourseSection(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowCreateCourseModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmCreateCourse}
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold uppercase shadow-lg"
              >
                Confirmar y Crear en Google
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL: Confirm Create CourseWork */}
      {showCreateWorkModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-[#121021] border border-blue-500/30 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-white">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase">Confirmar Asignación de Tarea</h3>
                <p className="text-[11px] text-slate-400">Se enviará como tarea oficial a los alumnos en Google Classroom.</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Título de la Tarea:</label>
                <input
                  type="text"
                  value={newWorkTitle}
                  onChange={(e) => setNewWorkTitle(e.target.value)}
                  placeholder="Ej. Rutina de Arm Control en 8 tiempos"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Instrucciones:</label>
                <textarea
                  rows={3}
                  value={newWorkDesc}
                  onChange={(e) => setNewWorkDesc(e.target.value)}
                  placeholder="Instrucciones para el alumno..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Puntuación Máxima:</label>
                <input
                  type="number"
                  value={newWorkPoints}
                  onChange={(e) => setNewWorkPoints(parseInt(e.target.value, 10) || 100)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowCreateWorkModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmCreateWork}
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold uppercase shadow-lg"
              >
                Confirmar y Asignar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL: Confirm Create Announcement */}
      {showCreateAnnouncementModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-[#121021] border border-blue-500/30 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-white">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase">Confirmar Anuncio en Tablón</h3>
                <p className="text-[11px] text-slate-400">Se publicará en la página principal del curso en Google Classroom.</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Mensaje del Anuncio:</label>
                <textarea
                  rows={4}
                  value={newAnnouncementText}
                  onChange={(e) => setNewAnnouncementText(e.target.value)}
                  placeholder="Ej. Recordatorio: Hoy tenemos sesión interactiva de musicalidad..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowCreateAnnouncementModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmCreateAnnouncement}
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold uppercase shadow-lg"
              >
                Publicar Anuncio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
