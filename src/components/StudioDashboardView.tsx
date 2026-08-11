import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Users, 
  UserCheck, 
  GraduationCap, 
  Calendar, 
  TrendingUp, 
  Plus, 
  Search, 
  FileText, 
  Upload, 
  Download, 
  Printer, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Flame, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  Sparkles,
  BookMarked,
  Filter,
  X,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { Studio, StudioInstructor, StudioStudent, StudioDocument, User } from '../types';
import { INITIAL_STUDIO } from '../data';

// Synthesized audio helper using Web Audio API
const playChime = (type: 'success' | 'click' | 'alert' = 'click') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    if (type === 'success') {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    } else {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // Ignore audio context autoplay restrictions
  }
};

interface StudioDashboardViewProps {
  currentUser: User;
  onUserChange?: (user: User) => void;
  language?: string;
  onOpenDocsModal?: () => void;
}

export default function StudioDashboardView({
  currentUser,
  onUserChange,
  language = 'es',
  onOpenDocsModal
}: StudioDashboardViewProps) {
  // Active Subtab inside Studio Dashboard
  const [activeTab, setActiveTab] = useState<'overview' | 'instructors' | 'students' | 'documents' | 'settings'>('overview');

  // Studio State with LocalStorage Persistence
  const [studio, setStudio] = useState<Studio>(() => {
    try {
      const saved = localStorage.getItem('waack_studio_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading studio data', e);
    }
    return INITIAL_STUDIO;
  });

  useEffect(() => {
    try {
      localStorage.setItem('waack_studio_data', JSON.stringify(studio));
    } catch (e) {
      console.error('Error saving studio data', e);
    }
  }, [studio]);

  // Alert Banner State
  const [alertText, setAlertText] = useState<string | null>(null);

  const showAlert = (msg: string) => {
    setAlertText(msg);
    setTimeout(() => setAlertText(null), 3500);
  };

  // --- INSTRUCTOR MANAGEMENT STATE ---
  const [instructorSearch, setInstructorSearch] = useState('');
  const [isAddInstructorOpen, setIsAddInstructorOpen] = useState(false);
  const [instName, setInstName] = useState('');
  const [instEmail, setInstEmail] = useState('');
  const [instSpecialty, setInstSpecialty] = useState('');
  const [instClassesCount, setInstClassesCount] = useState(3);

  const filteredInstructors = studio.instructors.filter(inst => {
    const query = instructorSearch.toLowerCase().trim();
    if (!query) return true;
    return inst.name.toLowerCase().includes(query) || 
           inst.specialty.toLowerCase().includes(query) || 
           inst.email.toLowerCase().includes(query);
  });

  const handleAddInstructor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instName.trim() || !instEmail.trim()) return;

    const newInst: StudioInstructor = {
      id: `inst-${Date.now()}`,
      name: instName.trim(),
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?auto=format&fit=crop&q=80&w=120`,
      email: instEmail.trim(),
      specialty: instSpecialty.trim() || 'Waacking Drills & Styling',
      assignedClassesCount: Number(instClassesCount) || 2,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    setStudio(prev => ({
      ...prev,
      instructors: [newInst, ...prev.instructors]
    }));

    setInstName('');
    setInstEmail('');
    setInstSpecialty('');
    setInstClassesCount(3);
    setIsAddInstructorOpen(false);
    playChime('success');
    showAlert(`Profesor ${newInst.name} vinculado exitosamente al estudio.`);
  };

  const handleToggleInstructorStatus = (id: string) => {
    setStudio(prev => ({
      ...prev,
      instructors: prev.instructors.map(inst => 
        inst.id === id ? { ...inst, status: inst.status === 'active' ? 'inactive' : 'active' } : inst
      )
    }));
    playChime('click');
  };

  const handleDeleteInstructor = (id: string) => {
    setStudio(prev => ({
      ...prev,
      instructors: prev.instructors.filter(inst => inst.id !== id)
    }));
    playChime('click');
    showAlert('Instructor desvinculado de la academia.');
  };

  // --- STUDENT DIRECTORY STATE & FILTERS ---
  const [studentSearch, setStudentSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<'Todos' | 'Nivel 1' | 'Nivel 2' | 'Avanzado'>('Todos');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [studName, setStudName] = useState('');
  const [studEmail, setStudEmail] = useState('');
  const [studLevel, setStudLevel] = useState<'Nivel 1' | 'Nivel 2' | 'Avanzado'>('Nivel 1');

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studName.trim() || !studEmail.trim()) return;

    const newStud: StudioStudent = {
      id: `stud-${Date.now()}`,
      name: studName.trim(),
      avatar: `https://images.unsplash.com/photo-${1494790108377 + Math.floor(Math.random() * 1000)}?auto=format&fit=crop&q=80&w=120`,
      email: studEmail.trim(),
      level: studLevel,
      streakDays: 1,
      subscriptionStatus: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: 'Hoy'
    };

    setStudio(prev => ({
      ...prev,
      students: [newStud, ...prev.students]
    }));

    setStudName('');
    setStudEmail('');
    setIsAddStudentOpen(false);
    playChime('success');
    showAlert(`Estudiante ${newStud.name} registrada en la nómina del estudio.`);
  };

  const filteredStudents = studio.students.filter(stud => {
    const matchesSearch = stud.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                          stud.email.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesLevel = levelFilter === 'Todos' || stud.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const handleDeleteStudent = (id: string) => {
    setStudio(prev => ({
      ...prev,
      students: prev.students.filter(stud => stud.id !== id)
    }));
    playChime('click');
    showAlert('Estudiante eliminada del directorio.');
  };

  // --- REPOSITORY & DOCUMENT MANAGEMENT STATE ---
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<'guia_pdf' | 'planificacion_bpm' | 'manual_tecnica'>('guia_pdf');
  const [docFormat, setDocFormat] = useState('PDF - Guía de Técnica');
  const [docDescription, setDocDescription] = useState('');
  const [docFileUrl, setDocFileUrl] = useState('');
  const [docFileName, setDocFileName] = useState('');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const handleFileUploadPDF = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingDoc(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setDocFileUrl(result);
      setDocFileName(file.name);
      if (!docTitle) {
        setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
      setIsUploadingDoc(false);
      playChime('click');
    };
    reader.readAsDataURL(file);
  };

  const handlePublishDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    let catLabel = 'Guía y Manual de Técnica en PDF';
    if (docCategory === 'planificacion_bpm') catLabel = 'Planificación de Entrenamiento / Rutina BPM';
    if (docCategory === 'manual_tecnica') catLabel = 'Manual de Técnica Académico';

    const newDoc: StudioDocument = {
      id: `std-doc-${Date.now()}`,
      title: docTitle.trim(),
      category: docCategory,
      categoryLabel: catLabel,
      format: docFormat || 'PDF Documento Oficial',
      description: docDescription.trim() || 'Documento oficial subido para instructores y alumnas del estudio.',
      fileUrl: docFileUrl || 'https://waackon.app/docs/Material_Oficial_Studio_WaackOn.pdf',
      fileName: docFileName || `${docTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      createdAt: new Date().toISOString().split('T')[0],
      downloadsCount: 0,
      authorName: 'Coordinación Académica Studio'
    };

    setStudio(prev => ({
      ...prev,
      documents: [newDoc, ...prev.documents]
    }));

    setDocTitle('');
    setDocDescription('');
    setDocFileUrl('');
    setDocFileName('');
    playChime('success');
    showAlert('¡Documento guardado en el repositorio académico del estudio!');
  };

  const handleDeleteDocument = (id: string) => {
    setStudio(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== id)
    }));
    playChime('click');
    showAlert('Documento removido del repositorio.');
  };

  return (
    <div className="min-h-full w-full bg-[#07060c] text-white p-4 sm:p-6 lg:p-8 space-y-8 select-none font-sans">
      
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {alertText && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 px-5 py-3 rounded-2xl bg-[#E9C349] text-black font-extrabold text-xs uppercase shadow-2xl flex items-center gap-2 border border-black/20"
          >
            <Sparkles className="w-4 h-4 text-black animate-spin-slow" />
            <span>{alertText}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BANNER - PANORÁMICO INSTITUCIONAL */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#140b24] via-[#0f091a] to-[#080411] border border-[#E9C349]/40 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-[#E9C349]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E9C349]/15 border border-[#E9C349]/50 flex items-center justify-center text-[#E9C349] shadow-lg shrink-0">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-black text-[#E9C349] uppercase tracking-[0.2em] bg-[#E9C349]/10 px-2.5 py-0.5 rounded border border-[#E9C349]/30">
                  ENTIDAD EDUCATIVA / ESTUDIO DE BAILE
                </span>
                <h1 className="text-xl sm:text-3xl font-black text-white tracking-wider uppercase font-display-lg mt-1">
                  {studio.name}
                </h1>
              </div>
            </div>
            <p className="text-xs text-slate-300 font-sans max-w-2xl leading-relaxed">
              Gestión centralizada de instructores, nómina de estudiantes, control de asistencia y distribución oficial de manuales de técnica y guías en PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <span className="px-4 py-2 rounded-2xl bg-[#1b122b] border border-[#E9C349]/30 text-xs font-mono font-bold text-[#E9C349] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#E9C349]" />
              Plan: {studio.subscriptionPlan}
            </span>
            <button
              onClick={() => setActiveTab('settings')}
              className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/10 cursor-pointer"
            >
              Ajustes Academia
            </button>
          </div>
        </div>

        {/* METRICAS RAPIDAS (SUMMARY CARDS) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-[#0d0918]/80 border border-white/10 hover:border-[#E9C349]/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Total Alumnos</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white font-mono">{studio.students.length}</p>
            <span className="text-[9px] text-emerald-400 font-mono mt-0.5 block">100% inscritos en nómina</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0d0918]/80 border border-white/10 hover:border-[#E9C349]/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Instructores Activos</span>
              <UserCheck className="w-4 h-4 text-[#E9C349]" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white font-mono">
              {studio.instructors.filter(i => i.status === 'active').length}
            </p>
            <span className="text-[9px] text-[#E9C349] font-mono mt-0.5 block">Plantel docente vinculado</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0d0918]/80 border border-white/10 hover:border-[#E9C349]/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Clases Semanales</span>
              <Calendar className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white font-mono">{studio.scheduledClassesThisWeek || 18}</p>
            <span className="text-[9px] text-purple-300 font-mono mt-0.5 block">Horarios en grilla oficial</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0d0918]/80 border border-white/10 hover:border-[#E9C349]/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Asistencia Promedio</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white font-mono">{studio.attendanceRatePercent || 94}%</p>
            <span className="text-[9px] text-amber-400 font-mono mt-0.5 block">Tasa global de retención</span>
          </div>
        </div>
      </div>

      {/* SUBNAV TABS */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto custom-scrollbar">
        {[
          { id: 'overview', label: 'Vista General & Métricas', icon: Building2 },
          { id: 'instructors', label: `Instructores (${studio.instructors.length})`, icon: UserCheck },
          { id: 'students', label: `Directorio Alumnas (${studio.students.length})`, icon: Users },
          { id: 'documents', label: `Repositorio & Guías PDF (${studio.documents.length})`, icon: FileText },
          { id: 'settings', label: 'Datos del Estudio', icon: ShieldCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                playChime('click');
              }}
              className={`px-4 py-2.5 rounded-2xl font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-[#E9C349] text-black shadow-lg font-black' 
                  : 'bg-[#120f21] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* CONTENT SECTIONS */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Quick Staff Summary (6 cols) */}
          <div className="lg:col-span-6 bg-[#110e1d] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#E9C349]" />
                Plantel Docente ({studio.instructors.length})
              </h3>
              <button
                onClick={() => setActiveTab('instructors')}
                className="text-[10px] font-mono font-bold text-[#E9C349] hover:underline flex items-center gap-1"
              >
                Ver todos <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {studio.instructors.slice(0, 3).map(inst => (
                <div key={inst.id} className="p-3.5 rounded-2xl bg-[#090712] border border-white/5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={inst.avatar} alt={inst.name} className="w-10 h-10 rounded-xl object-cover border border-[#E9C349]/40 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-white truncate">{inst.name}</p>
                      <p className="text-[10px] text-[#E9C349] font-mono truncate">{inst.specialty}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 shrink-0">
                    {inst.assignedClassesCount} clases asignadas
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Repository Summary (6 cols) */}
          <div className="lg:col-span-6 bg-[#110e1d] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#E9C349]" />
                Documentos & Guías en PDF ({studio.documents.length})
              </h3>
              <button
                onClick={() => setActiveTab('documents')}
                className="text-[10px] font-mono font-bold text-[#E9C349] hover:underline flex items-center gap-1"
              >
                Ir al Repositorio <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {studio.documents.map(doc => (
                <div key={doc.id} className="p-3.5 rounded-2xl bg-[#090712] border border-white/5 flex items-center justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <span className="text-[8px] font-mono font-bold text-[#E9C349] bg-[#E9C349]/10 px-2 py-0.5 rounded border border-[#E9C349]/20 uppercase">
                      {doc.categoryLabel}
                    </span>
                    <p className="text-xs font-extrabold text-white truncate mt-1">{doc.title}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{doc.format}</p>
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-[#E9C349] text-black font-bold hover:bg-[#d8b33c] shrink-0"
                    title="Descargar PDF"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. INSTRUCTORS MANAGEMENT TAB */}
      {activeTab === 'instructors' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#120f21] p-5 rounded-3xl border border-white/10">
            <div>
              <h2 className="text-base font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#E9C349]" />
                Plantel de Instructores Vinculados
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Administra los profesores de la academia, sus especialidades y asignación de clases.
              </p>
            </div>

            <button
              onClick={() => setIsAddInstructorOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#E9C349] hover:bg-[#d8b33c] text-black font-black text-xs uppercase flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>[+ Agregar Instructor]</span>
            </button>
          </div>

          {/* ADD INSTRUCTOR FORM MODAL / COLLAPSIBLE */}
          <AnimatePresence>
            {isAddInstructorOpen && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddInstructor}
                className="bg-[#161227] border border-[#E9C349]/40 rounded-3xl p-6 space-y-4 shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-xs font-mono font-black text-[#E9C349] uppercase tracking-wider flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Vincular Nuevo Profesor / Docente a la Academia
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddInstructorOpen(false)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={instName}
                      onChange={e => setInstName(e.target.value)}
                      placeholder="ej: Viktor 'WaackGod' S."
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0a0814] border border-white/20 text-white font-bold text-xs focus:outline-none focus:border-[#E9C349]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block mb-1">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      value={instEmail}
                      onChange={e => setInstEmail(e.target.value)}
                      placeholder="viktor@waackon.app"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0a0814] border border-white/20 text-white text-xs focus:outline-none focus:border-[#E9C349]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block mb-1">
                      Especialidad / Cátedra
                    </label>
                    <input
                      type="text"
                      value={instSpecialty}
                      onChange={e => setInstSpecialty(e.target.value)}
                      placeholder="ej: Fast Rolls & Musicality"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0a0814] border border-white/20 text-white text-xs focus:outline-none focus:border-[#E9C349]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block mb-1">
                      Clases Asignadas
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={instClassesCount}
                      onChange={e => setInstClassesCount(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0a0814] border border-white/20 text-white font-bold text-xs focus:outline-none focus:border-[#E9C349]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddInstructorOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#E9C349] text-black font-black text-xs uppercase shadow cursor-pointer"
                  >
                    Guardar Profesor
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* SEARCH BAR FOR INSTRUCTORS */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={instructorSearch}
              onChange={e => setInstructorSearch(e.target.value)}
              placeholder="Buscar profesor por nombre, especialidad técnica o email..."
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#120f21] border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-[#E9C349] transition-all"
            />
            {instructorSearch && (
              <button
                onClick={() => setInstructorSearch('')}
                className="absolute right-3.5 top-2.5 p-1 text-slate-400 hover:text-white cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* INSTRUCTORS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInstructors.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-[#120f21] border border-white/10 rounded-3xl text-slate-400 font-mono text-xs">
                No se encontraron profesores que coincidan con la búsqueda "{instructorSearch}".
              </div>
            ) : (
              filteredInstructors.map(inst => (
              <div
                key={inst.id}
                className="bg-[#120f21] border border-white/10 hover:border-[#E9C349]/40 rounded-3xl p-5 space-y-4 transition-all shadow-xl relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={inst.avatar}
                      alt={inst.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-[#E9C349]/50 shadow-md"
                    />
                    <div>
                      <h3 className="text-sm font-extrabold text-white leading-snug">{inst.name}</h3>
                      <p className="text-[10px] font-mono text-slate-400">{inst.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteInstructor(inst.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
                    title="Desvincular instructor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-xs font-mono pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500">Especialidad:</span>
                    <span className="font-bold text-[#E9C349]">{inst.specialty}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500">Clases Asignadas:</span>
                    <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">{inst.assignedClassesCount} semanales</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Estado:</span>
                    <button
                      onClick={() => handleToggleInstructorStatus(inst.id)}
                      className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border cursor-pointer ${
                        inst.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/10 text-red-400 border-red-500/30'
                      }`}
                    >
                      {inst.status === 'active' ? '● ACTIVO' : '○ INACTIVO'}
                    </button>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      )}

      {/* 3. STUDENTS DIRECTORY TAB */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#120f21] p-5 rounded-3xl border border-white/10">
            <div>
              <h2 className="text-base font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Users className="w-5 h-5 text-[#E9C349]" />
                Directorio de Estudiantes ({filteredStudents.length})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Buscador y filtros por nivel para seguimiento de rachas y estado de suscripción.
              </p>
            </div>

            <button
              onClick={() => setIsAddStudentOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#E9C349] hover:bg-[#d8b33c] text-black font-black text-xs uppercase flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>[+ Registrar Alumna/o]</span>
            </button>
          </div>

          {/* ADD STUDENT MODAL / FORM */}
          <AnimatePresence>
            {isAddStudentOpen && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddStudent}
                className="bg-[#161227] border border-[#E9C349]/40 rounded-3xl p-6 space-y-4 shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-xs font-mono font-black text-[#E9C349] uppercase tracking-wider flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Inscribir Nueva Alumna en la Nómina
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddStudentOpen(false)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={studName}
                      onChange={e => setStudName(e.target.value)}
                      placeholder="ej: Martina Silva"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0a0814] border border-white/20 text-white font-bold text-xs focus:outline-none focus:border-[#E9C349]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block mb-1">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      value={studEmail}
                      onChange={e => setStudEmail(e.target.value)}
                      placeholder="martina@gmail.com"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0a0814] border border-white/20 text-white text-xs focus:outline-none focus:border-[#E9C349]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block mb-1">
                      Nivel Académico
                    </label>
                    <select
                      value={studLevel}
                      onChange={e => setStudLevel(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0a0814] border border-white/20 text-white font-bold text-xs focus:outline-none focus:border-[#E9C349]"
                    >
                      <option value="Nivel 1">Nivel 1 (Fundamentos)</option>
                      <option value="Nivel 2">Nivel 2 (Intermedio)</option>
                      <option value="Avanzado">Avanzado (Performance)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddStudentOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#E9C349] text-black font-black text-xs uppercase shadow cursor-pointer"
                  >
                    Inscribir Alumna
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* SEARCH & LEVEL FILTER BAR */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                placeholder="Buscar alumna por nombre o email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#120f21] border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-[#E9C349]"
              />
            </div>

            <div className="md:col-span-6 flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold shrink-0 flex items-center gap-1">
                <Filter className="w-3 h-3 text-[#E9C349]" /> Nivel:
              </span>
              {(['Todos', 'Nivel 1', 'Nivel 2', 'Avanzado'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all shrink-0 cursor-pointer ${
                    levelFilter === lvl
                      ? 'bg-[#E9C349] text-black font-black'
                      : 'bg-[#120f21] text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* STUDENTS TABLE */}
          <div className="bg-[#120f21] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#0a0814] text-[10px] font-mono font-black text-[#E9C349] uppercase tracking-wider">
                    <th className="p-4">Estudiante / Alumna</th>
                    <th className="p-4">Nivel Actual</th>
                    <th className="p-4">Racha Práctica</th>
                    <th className="p-4">Suscripción</th>
                    <th className="p-4">Fecha Ingreso</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 font-mono">
                        No se encontraron estudiantes con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map(stud => (
                      <tr key={stud.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={stud.avatar} alt={stud.name} className="w-9 h-9 rounded-xl object-cover border border-[#E9C349]/40 shrink-0" />
                            <div>
                              <p className="font-extrabold text-white">{stud.name}</p>
                              <p className="text-[10px] font-mono text-slate-400">{stud.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border ${
                            stud.level === 'Avanzado'
                              ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                              : stud.level === 'Nivel 2'
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                          }`}>
                            {stud.level}
                          </span>
                        </td>

                        <td className="p-4 font-mono font-bold text-amber-400">
                          <span className="flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
                            {stud.streakDays} días
                          </span>
                        </td>

                        <td className="p-4">
                          <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                            stud.subscriptionStatus === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {stud.subscriptionStatus === 'active' ? '● ACTIVA' : '○ PENDIENTE'}
                          </span>
                        </td>

                        <td className="p-4 font-mono text-slate-400 text-[11px]">
                          {stud.joinedDate}
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteStudent(stud.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
                            title="Eliminar del directorio"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. ACADEMIC REPOSITORY & PDF DOCUMENTS TAB */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#18112b] via-[#120a21] to-[#0d0718] border border-[#E9C349]/30 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#E9C349]/10 border border-[#E9C349]/40 flex items-center justify-center text-[#E9C349]">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="text-lg sm:text-2xl font-black tracking-wider text-white uppercase font-mono">
                  REPOSITORIO ACADÉMICO Y DOCUMENTOS PDF
                </h2>
              </div>
              <p className="text-xs text-slate-300 font-sans leading-relaxed max-w-2xl">
                Sube y administra archivos PDF (<strong className="text-[#E9C349]">guías biomecánicas</strong>, <strong className="text-[#E9C349]">planificaciones semanales BPM</strong> y <strong className="text-[#E9C349]">manuales de técnica</strong>) que se compartirán con los instructores y alumnos del estudio.
              </p>
            </div>

            {onOpenDocsModal && (
              <button
                onClick={onOpenDocsModal}
                className="px-4 py-2.5 rounded-2xl bg-[#4285F4] hover:bg-blue-600 text-white font-black text-xs uppercase flex items-center gap-2 shadow-lg transition-all shrink-0 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Redactar en Google Docs</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* UPLOAD FORM (5 cols) */}
            <div className="lg:col-span-5 bg-[#120f21] border border-[#E9C349]/30 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <Upload className="w-4 h-4 text-[#E9C349]" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Subir / Publicar Nuevo Documento PDF
                </h3>
              </div>

              <form onSubmit={handlePublishDocument} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block mb-1">
                    Categoría del Documento
                  </label>
                  <select
                    value={docCategory}
                    onChange={e => setDocCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a0814] border border-white/20 text-white font-bold text-xs focus:outline-none focus:border-[#E9C349]"
                  >
                    <option value="guia_pdf">Guía Biomecánica & Prevención de Lesiones (PDF)</option>
                    <option value="planificacion_bpm">Planificación Semanal de Rutinas BPM (Plantilla)</option>
                    <option value="manual_tecnica">Manual de Técnica y Estructura Musical (PDF)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block mb-1">
                    Título del Documento *
                  </label>
                  <input
                    type="text"
                    required
                    value={docTitle}
                    onChange={e => setDocTitle(e.target.value)}
                    placeholder="ej: Cuaderno de Práctica Biomecánica para prevención de lesiones"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a0814] border border-white/20 text-white font-bold text-xs focus:outline-none focus:border-[#E9C349]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block mb-1">
                    Formato / Páginas
                  </label>
                  <input
                    type="text"
                    value={docFormat}
                    onChange={e => setDocFormat(e.target.value)}
                    placeholder="ej: PDF - 18 Páginas"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a0814] border border-white/20 text-white text-xs focus:outline-none focus:border-[#E9C349]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block mb-1">
                    Descripción Pedagógica
                  </label>
                  <textarea
                    rows={3}
                    value={docDescription}
                    onChange={e => setDocDescription(e.target.value)}
                    placeholder="Describe el propósito del documento..."
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a0814] border border-white/20 text-slate-200 text-xs focus:outline-none focus:border-[#E9C349] resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block mb-1">
                    Archivo PDF (.pdf)
                  </label>
                  <label className="w-full p-3 rounded-2xl bg-[#0a0814] border border-dashed border-white/30 hover:border-[#E9C349] text-center cursor-pointer transition-all flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4 text-[#E9C349]" />
                    <span className="text-xs font-bold text-slate-300 truncate">
                      {docFileName ? docFileName : 'Subir archivo PDF'}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileUploadPDF}
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isUploadingDoc}
                  className="w-full py-3 rounded-2xl bg-[#E9C349] hover:bg-[#d8b33c] text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
                >
                  {isUploadingDoc ? 'Procesando PDF...' : 'Publicar Documento Institucional'}
                </button>
              </form>
            </div>

            {/* DOCUMENTS LIST (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <BookMarked className="w-4 h-4 text-[#E9C349]" />
                  Documentos Publicados del Estudio ({studio.documents.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {studio.documents.map(doc => (
                  <div
                    key={doc.id}
                    className="bg-[#120f21] border border-white/10 hover:border-[#E9C349]/50 rounded-3xl p-5 space-y-3 transition-all relative overflow-hidden shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-[#E9C349]/10 border border-[#E9C349]/40 flex items-center justify-center text-[#E9C349] shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border bg-[#E9C349]/10 text-[#E9C349] border-[#E9C349]/30">
                            {doc.categoryLabel}
                          </span>
                          <h4 className="text-sm font-extrabold text-white mt-1 leading-snug">{doc.title}</h4>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{doc.description}</p>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[10px] font-mono text-slate-400">
                      <span>Formato: {doc.format} • Subido: {doc.createdAt}</span>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-[#E9C349] text-black font-black uppercase hover:bg-[#d8b33c] transition-all flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar PDF</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-[#120f21] border border-white/10 rounded-3xl p-6 space-y-5">
          <h2 className="text-sm font-black font-mono uppercase tracking-wider text-[#E9C349] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" /> Ajustes Institucionales de la Academia
          </h2>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Nombre de la Academia / Estudio</label>
              <input
                type="text"
                value={studio.name}
                onChange={e => setStudio(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a0814] border border-white/20 text-white font-bold"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Dirección / Sede Principal</label>
              <input
                type="text"
                value={studio.address || ''}
                onChange={e => setStudio(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a0814] border border-white/20 text-white font-bold"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Teléfono de Contacto</label>
              <input
                type="text"
                value={studio.phone || ''}
                onChange={e => setStudio(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a0814] border border-white/20 text-white font-bold"
              />
            </div>

            <button
              onClick={() => showAlert('Configuración de la academia guardada.')}
              className="px-5 py-2.5 rounded-2xl bg-[#E9C349] text-black font-black uppercase text-xs cursor-pointer"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
