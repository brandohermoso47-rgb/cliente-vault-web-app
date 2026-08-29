import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ListTodo, 
  Calendar, 
  Sparkles, 
  ExternalLink, 
  Clock, 
  FolderPlus,
  Flame,
  Target,
  ArrowRight
} from 'lucide-react';
import { User, Lesson } from '../types';
import { Language } from '../lib/translations';
import {
  GoogleTaskList,
  GoogleTask,
  signInForGoogleTasks,
  getTasksAccessToken,
  listTaskLists,
  createTaskList,
  listTasks,
  createTask,
  toggleTaskStatus,
  deleteTask
} from '../googleTasks';

interface TasksViewProps {
  currentUser: User;
  language: Language;
  lessons: Lesson[];
  onAddBonusPoints?: (amount: number) => void;
}

export default function TasksView({ currentUser, language, lessons, onAddBonusPoints }: TasksViewProps) {
  const [token, setToken] = useState<string | null>(getTasksAccessToken());
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [taskLists, setTaskLists] = useState<GoogleTaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('@default');
  const [tasks, setTasks] = useState<GoogleTask[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  // Instructor Assigned Tasks
  const [assignedInstructorTasks, setAssignedInstructorTasks] = useState<any[]>([]);

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
          const mine = data.tasks.filter((t: any) => !t.studentUid || t.studentUid === currentUser.id);
          setAssignedInstructorTasks(mine.length > 0 ? mine : defaultFallbackTasks.filter((t: any) => !t.studentUid || t.studentUid === currentUser.id));
        } else {
          setAssignedInstructorTasks(defaultFallbackTasks.filter((t: any) => !t.studentUid || t.studentUid === currentUser.id));
        }
      })
      .catch(() => {
        if (isMounted) {
          setAssignedInstructorTasks(defaultFallbackTasks.filter((t: any) => !t.studentUid || t.studentUid === currentUser.id));
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser.id]);

  const handleCompleteInstructorTaskItem = async (taskId: string) => {
    try {
      const res = await fetch(`/api/student/tasks/${taskId}/complete`, {
        method: 'PATCH'
      });
      const data = await res.json();
      if (data.success) {
        setAssignedInstructorTasks(prev =>
          prev.map(t => t.id === taskId ? { ...t, status: 'completed' } : t)
        );
        const pts = data.awardedPoints || 50;
        if (onAddBonusPoints) {
          onAddBonusPoints(pts);
        }
        setSuccessMsg(`¡Tarea completada con éxito! +${pts} puntos añadidos a tu ranking.`);
      } else {
        setErrorMsg(data.error || 'Error al completar la tarea.');
      }
    } catch (err: any) {
      setErrorMsg('Error de conexión al completar la tarea.');
    }
  };

  // Modals for Google Tasks mutations
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  const [taskToDelete, setTaskToDelete] = useState<GoogleTask | null>(null);

  // Handle Google Tasks Login
  const handleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const activeToken = await signInForGoogleTasks();
      setToken(activeToken);
      setSuccessMsg('¡Conectado exitosamente con Google Tasks!');
      await loadLists(activeToken);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con Google Tasks.');
    } finally {
      setLoading(false);
    }
  };

  // Load Task Lists
  const loadLists = async (activeToken?: string) => {
    const tok = activeToken || token;
    if (!tok) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const lists = await listTaskLists(tok);
      setTaskLists(lists);
      if (lists.length > 0 && selectedListId === '@default') {
        setSelectedListId(lists[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('No se pudieron obtener las listas de Google Tasks.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Tasks for Selected List
  useEffect(() => {
    if (token) {
      fetchTasksForList(selectedListId);
    }
  }, [selectedListId, token]);

  const fetchTasksForList = async (listId: string) => {
    if (!token) return;
    try {
      setLoading(true);
      const items = await listTasks(listId, token);
      setTasks(items);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Error al cargar las tareas de Google Tasks.');
    } finally {
      setLoading(false);
    }
  };

  // 1. CONFIRM & CREATE TASKLIST
  const handleConfirmCreateList = async () => {
    if (!newListTitle.trim() || !token) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const created = await createTaskList(newListTitle, token);
      setShowCreateListModal(false);
      setNewListTitle('');
      setSuccessMsg(`¡Lista "${created.title}" creada en Google Tasks!`);
      await loadLists(token);
      setSelectedListId(created.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al crear la lista.');
    } finally {
      setLoading(false);
    }
  };

  // 2. CONFIRM & CREATE TASK
  const handleConfirmCreateTask = async () => {
    if (!newTaskTitle.trim() || !token) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      await createTask(
        selectedListId,
        {
          title: newTaskTitle,
          notes: newTaskNotes,
          due: newTaskDueDate || undefined
        },
        token
      );

      setShowCreateTaskModal(false);
      setNewTaskTitle('');
      setNewTaskNotes('');
      setNewTaskDueDate('');
      setSuccessMsg('¡Tarea añadida correctamente a Google Tasks!');
      await fetchTasksForList(selectedListId);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al crear la tarea.');
    } finally {
      setLoading(false);
    }
  };

  // 3. TOGGLE TASK COMPLETION
  const handleToggleTask = async (task: GoogleTask) => {
    if (!token) return;
    const isCompletedNow = task.status !== 'completed';
    try {
      // Optimistic update
      setTasks(prev =>
        prev.map(t =>
          t.id === task.id
            ? { ...t, status: isCompletedNow ? 'completed' : 'needsAction' }
            : t
        )
      );

      await toggleTaskStatus(selectedListId, task.id, isCompletedNow, token);
      await fetchTasksForList(selectedListId);
    } catch (err: any) {
      setErrorMsg('Error al cambiar el estado de la tarea en Google Tasks.');
      await fetchTasksForList(selectedListId);
    }
  };

  // 4. CONFIRM & DELETE TASK
  const handleConfirmDeleteTask = async () => {
    if (!taskToDelete || !token) return;
    try {
      setLoading(true);
      await deleteTask(selectedListId, taskToDelete.id, token);
      setTaskToDelete(null);
      setSuccessMsg('Tarea eliminada de Google Tasks.');
      await fetchTasksForList(selectedListId);
    } catch (err: any) {
      setErrorMsg('Error al eliminar la tarea.');
    } finally {
      setLoading(false);
    }
  };

  // Preset Waack On Goals to add in 1 click
  const presetGoals = [
    { title: '🎯 Práctica de Arm Control (20 mins)', notes: 'Realizar rotaciones, over & under wrist rolls frente al espejo.' },
    { title: '🔥 Grabar video de Waacking para la comunidad', notes: 'Grabar combo de 8 tiempos e importar a la pestaña de Tareas o Comunidad.' },
    { title: '🎧 Escuchar playlist de Disco & Funk', notes: 'Identificar acentos de batería, hi-hats y sección de vientos para acentuación.' },
    { title: '💃 Practicar Posing & Expresión Facial', notes: '4 poses estáticas en velocidad rápida manteniendo la actitud de la era disco.' }
  ];

  const handleQuickAddPreset = (preset: { title: string; notes: string }) => {
    setNewTaskTitle(preset.title);
    setNewTaskNotes(preset.notes);
    setShowCreateTaskModal(true);
  };

  const filteredTasks = (tasks || []).filter(t => {
    if (filter === 'pending') return t.status !== 'completed';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-[#1c1815] dark:via-[#2a1e1b] dark:to-[#17131a] p-6 sm:p-8 rounded-3xl border border-[#E9C349]/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#E9C349]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono font-black text-[#E9C349] bg-[#E9C349]/10 border border-[#E9C349]/30 px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
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
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
              <ListTodo className="w-8 h-8 text-[#E9C349] shrink-0" />
              Metas & Google Tasks
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl font-medium">
              Sincroniza tus objetivos de entrenamiento, tareas de práctica diario y rutinas de baile con tu cuenta oficial de Google Tasks.
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
                <span className="gsi-material-button-contents font-bold text-xs">Conectar con Google Tasks</span>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadLists()}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 text-xs font-bold transition-all flex items-center gap-2 shadow-lg"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
              <button
                type="button"
                onClick={() => setShowCreateTaskModal(true)}
                className="px-5 py-2.5 rounded-xl bg-[#E9C349] hover:bg-[#d6b039] text-black border border-[#E9C349] text-xs font-extrabold uppercase transition-all shadow-lg hover:scale-105 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nueva Tarea
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
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

      {/* Instructor Assigned Tasks Section */}
      {assignedInstructorTasks.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 via-white to-white dark:from-[#1c1912] dark:via-[#121212] dark:to-[#121212] border-2 border-[#E9C349] rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#E9C349]/20 text-[#E9C349]">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Tareas Asignadas por Instructores / IA</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Completa estas misiones para sumar puntos directos a tu ranking somático.</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-[#E9C349] bg-[#E9C349]/10 px-3 py-1 rounded-full border border-[#E9C349]/30">
              {(assignedInstructorTasks || []).filter(t => t.status !== 'completed').length} Pendientes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {(assignedInstructorTasks || []).map(task => {
                const isCompleted = task.status === 'completed';
                return (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: -15, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: 15 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                      isCompleted
                        ? 'bg-slate-50 dark:bg-black/30 border-slate-200 dark:border-white/5 opacity-70'
                        : 'bg-white dark:bg-black/50 border-[#E9C349]/40 hover:border-[#E9C349] shadow-lg'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E9C349]/20 text-[#E9C349]">
                          {task.category || 'Misión Técnica'}
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-400">
                          +{task.points || 50} pts
                        </span>
                      </div>
                      <div className="relative inline-block max-w-full">
                        <motion.h4
                          animate={{ color: isCompleted ? '#94a3b8' : '#ffffff' }}
                          transition={{ duration: 0.25 }}
                          className="text-sm font-bold relative"
                        >
                          {task.title}
                          <motion.span
                            className="absolute left-0 top-1/2 h-[2px] bg-[#E9C349] origin-left rounded-full pointer-events-none"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: isCompleted ? 1 : 0 }}
                            transition={{ duration: 0.35, ease: 'easeInOut' }}
                          />
                        </motion.h4>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {task.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        {isCompleted ? '✓ Completada y Sumada' : 'Pendiente de entrega'}
                      </span>
                      {!isCompleted ? (
                        <button
                          onClick={() => handleCompleteInstructorTaskItem(task.id)}
                          className="px-4 py-2 bg-[#E9C349] hover:bg-[#d8b33c] text-black text-xs font-black rounded-xl shadow transition-all hover:scale-105 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Completar (+{task.points || 50} pts)</span>
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Completada
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {token ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task Lists Sidebar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-[#E9C349]" />
                Mis Listas de Tareas ({taskLists.length})
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateListModal(true)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 text-xs font-bold transition-all"
                title="Crear nueva lista en Google Tasks"
              >
                <FolderPlus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {taskLists.map((list) => {
                const isSelected = selectedListId === list.id;
                return (
                  <button
                    key={list.id}
                    onClick={() => setSelectedListId(list.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-50 dark:bg-[#241c17] border-[#E9C349]/60 text-slate-900 dark:text-white shadow-xl'
                        : 'bg-white dark:bg-[#121021] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-[#18152e]'
                    }`}
                  >
                    <span className="text-xs font-extrabold uppercase truncate">{list.title}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-[#E9C349] shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Quick Presets Panel */}
            <div className="p-5 bg-white dark:bg-[#121021] border border-[#E9C349]/20 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#E9C349]" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase">Sugerencias de Práctica</h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Haz clic en una sugerencia para enviarla como meta directamente a tu Google Tasks:
              </p>
              <div className="space-y-2">
                {presetGoals.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAddPreset(preset)}
                    className="w-full text-left p-2.5 bg-slate-50 dark:bg-black/40 hover:bg-slate-100 dark:hover:bg-black/70 border border-slate-200 dark:border-white/5 hover:border-[#E9C349]/30 rounded-xl transition-all group"
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#E9C349] transition-colors">{preset.title}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{preset.notes}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tasks List Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-[#121021] border border-slate-200 dark:border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase">
                    {taskLists.find(l => l.id === selectedListId)?.title || 'Lista de Tareas'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {(tasks || []).filter(t => t.status !== 'completed').length} tareas pendientes • {(tasks || []).filter(t => t.status === 'completed').length} completadas
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 p-1 rounded-xl self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setFilter('pending')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      filter === 'pending' ? 'bg-[#E9C349] text-black shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Pendientes
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter('completed')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      filter === 'completed' ? 'bg-[#E9C349] text-black shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Completadas
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      filter === 'all' ? 'bg-[#E9C349] text-black shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Todas
                  </button>
                </div>
              </div>

              {/* Tasks Items */}
              <div className="space-y-3">
                {filteredTasks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-2xl text-center space-y-2"
                  >
                    <CheckCircle2 className="w-8 h-8 text-slate-500 mx-auto" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">No hay tareas en esta categoría.</p>
                  </motion.div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {filteredTasks.map((task) => {
                      const isDone = task.status === 'completed';
                      return (
                        <motion.div
                          key={task.id}
                          layout
                          initial={{ opacity: 0, x: -25, scale: 0.97 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 25, scale: 0.95 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className={`p-4 rounded-2xl border transition-colors flex items-start justify-between gap-4 ${
                            isDone
                              ? 'bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/5'
                              : 'bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <button
                              type="button"
                              onClick={() => handleToggleTask(task)}
                              className="mt-0.5 text-slate-500 dark:text-slate-400 hover:text-[#E9C349] transition-colors shrink-0 cursor-pointer"
                            >
                              <motion.div
                                key={isDone ? 'done' : 'undone'}
                                initial={{ scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                              >
                                {isDone ? (
                                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                                ) : (
                                  <Square className="w-5 h-5" />
                                )}
                              </motion.div>
                            </button>
                            <div className="min-w-0">
                              <div className="relative inline-block max-w-full">
                                <motion.h4
                                  animate={{ color: isDone ? '#94a3b8' : '#ffffff' }}
                                  transition={{ duration: 0.3 }}
                                  className="text-sm font-bold relative"
                                >
                                  {task.title}
                                  <motion.span
                                    className="absolute left-0 top-1/2 h-[2px] bg-emerald-400 origin-left rounded-full pointer-events-none"
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: isDone ? 1 : 0 }}
                                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                                  />
                                </motion.h4>
                              </div>
                              {task.notes && (
                                <p className={`text-xs whitespace-pre-line mt-1 line-clamp-3 transition-colors ${isDone ? 'text-slate-500' : 'text-slate-300'}`}>
                                  {task.notes}
                                </p>
                              )}
                              {task.due && (
                                <div className="flex items-center gap-1 mt-2 text-[10px] font-mono text-amber-400/80">
                                  <Clock className="w-3 h-3" />
                                  <span>Vence: {new Date(task.due).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setTaskToDelete(task)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-rose-500/20 text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-300 transition-all border border-slate-200 dark:border-white/10 shrink-0 cursor-pointer"
                            title="Eliminar tarea"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Not logged in landing state */
        <div className="bg-white dark:bg-[#121021] border border-slate-200 dark:border-white/10 rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-[#E9C349]/20 border border-[#E9C349]/30 flex items-center justify-center mx-auto text-[#E9C349]">
            <ListTodo className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">Sincroniza tus Metas con Google Tasks</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto mt-2 leading-relaxed">
              Conecta tu cuenta de Google para organizar tus tareas de entrenamiento, metas diarias de Waacking y listas de práctica directamente en Google Tasks.
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
              <span className="gsi-material-button-contents font-bold text-xs">Conectar con Google Tasks</span>
            </div>
          </button>
        </div>
      )}

      {/* 1. MODAL: Confirm Create Task */}
      <AnimatePresence>
        {showCreateTaskModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white dark:bg-[#121021] border border-[#E9C349]/30 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-slate-900 dark:text-white"
            >
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-3">
                <div className="p-2 rounded-xl bg-[#E9C349]/20 text-[#E9C349]">
                  <ListTodo className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase">Confirmar Nueva Tarea</h3>
                  <p className="text-[11px] text-slate-400">Se añadirá a tu lista de Google Tasks.</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Título de la Tarea:</label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Ej. Practicar Posing en 8 tiempos"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#E9C349]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Notas / Detalles:</label>
                  <textarea
                    rows={3}
                    value={newTaskNotes}
                    onChange={(e) => setNewTaskNotes(e.target.value)}
                    placeholder="Detalles del ejercicio o recordatorio..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#E9C349]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Fecha Límite (Opcional):</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#E9C349]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCreateTask}
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-[#E9C349] hover:bg-[#d6b039] text-black text-xs font-extrabold uppercase shadow-lg cursor-pointer"
                >
                  Añadir a Google Tasks
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. MODAL: Confirm Create TaskList */}
      <AnimatePresence>
        {showCreateListModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white dark:bg-[#121021] border border-[#E9C349]/30 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-slate-900 dark:text-white"
            >
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-3">
                <div className="p-2 rounded-xl bg-[#E9C349]/20 text-[#E9C349]">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase">Nueva Lista en Google Tasks</h3>
                  <p className="text-[11px] text-slate-400">Organiza tus metas en un grupo independiente.</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nombre de la Lista:</label>
                  <input
                    type="text"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder="Ej. Objetivos del Trimestre"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#E9C349]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateListModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCreateList}
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-[#E9C349] hover:bg-[#d6b039] text-black text-xs font-extrabold uppercase shadow-lg cursor-pointer"
                >
                  Crear Lista
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. MODAL: Confirm Delete Task */}
      <AnimatePresence>
        {taskToDelete && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-[#121021] border border-rose-500/30 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-white"
            >
              <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase">Eliminar Tarea</h3>
                  <p className="text-[11px] text-slate-400">¿Estás seguro de eliminar esta tarea de Google Tasks?</p>
                </div>
              </div>

              <p className="text-xs text-white font-bold bg-black/40 p-3 rounded-xl border border-white/5">
                "{taskToDelete.title}"
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setTaskToDelete(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteTask}
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold uppercase shadow-lg cursor-pointer"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
