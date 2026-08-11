import React, { useState } from 'react';
import { Sparkles, Dumbbell, Check, Calendar, FileText, Send, User, Target, ShieldAlert, Cpu, ClipboardList, PlusCircle } from 'lucide-react';
import { User as UserType } from '../types';
import { createInstructorTask } from '../lib/api';

interface OnboardingPlanViewerProps {
  studentName: string;
  planMarkdown: string;
  currentUser: UserType;
  onRefreshPlan?: () => void;
}

export default function OnboardingPlanViewer({
  studentName,
  planMarkdown,
  currentUser,
  onRefreshPlan
}: OnboardingPlanViewerProps) {
  const [createdTasks, setCreatedTasks] = useState<string[]>([]);
  const [creatingTask, setCreatingTask] = useState<string | null>(null);

  // Extract recommended tasks from Markdown lines starting with "- [" or "- " under "✅ Tareas Recomendadas"
  const extractTasks = (markdown: string): string[] => {
    const tasksSection = (markdown || '').split('✅ Tareas Recomendadas')[1] || '';
    const lines = tasksSection.split('\n');
    const tasks: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const cleanTask = trimmed.replace(/^[-*]\s*/, '').replace(/^\[.*?\]:\s*/, '');
        if (cleanTask.length > 5) {
          tasks.push(cleanTask);
        }
      }
    }

    if (tasks.length === 0) {
      return [
        `Grabar 2 minutos en el SomaticFeedbackLab enfocándose en la extensión simétrica de codos`,
        `Superar el nivel 3 del Entrenador de Ritmo a 120 BPM manteniendo la limpieza en los roll-outs`
      ];
    }

    return tasks;
  };

  const tasksList = extractTasks(planMarkdown);

  const handleCreateTask = async (taskText: string) => {
    if (createdTasks.includes(taskText)) return;
    setCreatingTask(taskText);

    try {
      await createInstructorTask(currentUser, {
        title: taskText.slice(0, 100),
        description: `Tarea recomendada desde el Plan de Onboarding de ${studentName}: ${taskText}`,
        category: 'onboarding-lab',
        points: 50
      });
      setCreatedTasks(prev => [...prev, taskText]);
    } catch (err) {
      console.error('[Create Task Error]:', err);
    } finally {
      setCreatingTask(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#1E0F21] via-[#160B18] to-[#0D0914] border border-[#3A2542] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-[#9A2B3C]/20 border border-[#9A2B3C]/40 text-[#E9C349] shrink-0">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold text-[#E9C349] uppercase tracking-widest flex items-center gap-1.5">
              <span>CÁTEDRA DEL INSTRUCTOR</span>
              <span className="px-2 py-0.5 rounded-full bg-[#9A2B3C]/30 text-white text-[9px]">PLAN IA ACTIVADO</span>
            </div>
            <h3 className="text-base font-extrabold text-white tracking-tight mt-0.5">
              Plan de Entrenamiento Personalizado de {studentName}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Formato pedagógico optimizado para la asignación de módulos en el Freestyle Lab.
            </p>
          </div>
        </div>

        {onRefreshPlan && (
          <button
            onClick={onRefreshPlan}
            className="px-4 py-2.5 rounded-2xl bg-[#261E2E] hover:bg-[#342740] border border-[#3A2A47] text-slate-200 hover:text-white text-xs font-mono font-bold transition-all flex items-center gap-2 self-start md:self-auto shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E9C349]" />
            <span>Re-evaluar con IA</span>
          </button>
        )}
      </div>

      {/* Structured Plan View Container */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#0E0C14] border border-[#2B1F33] text-slate-200 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#9A2B3C]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Markdown Rendered Content */}
        <div className="prose prose-invert max-w-none space-y-5 text-sm leading-relaxed">
          {(planMarkdown || '').split('\n\n').map((block, idx) => {
            const trimmed = block.trim();
            if (trimmed.startsWith('👤')) {
              return (
                <div key={idx} className="p-5 rounded-2xl bg-[#15111E] border border-[#33243F]">
                  <h4 className="text-sm font-black text-[#E9C349] uppercase tracking-wider flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-[#E9C349]" />
                    {trimmed.split('\n')[0]}
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    {trimmed.split('\n').slice(1).map((line, lIdx) => (
                      <p key={lIdx} className="font-medium">{line}</p>
                    ))}
                  </div>
                </div>
              );
            }

            if (trimmed.startsWith('🎯')) {
              return (
                <div key={idx} className="p-5 rounded-2xl bg-[#15111E] border border-[#33243F]">
                  <h4 className="text-sm font-black text-rose-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-rose-400" />
                    {trimmed.split('\n')[0]}
                  </h4>
                  <div className="space-y-2 text-xs text-slate-300">
                    {trimmed.split('\n').slice(1).map((line, lIdx) => (
                      <p key={lIdx} className="font-medium">{line}</p>
                    ))}
                  </div>
                </div>
              );
            }

            if (trimmed.startsWith('🔬')) {
              return (
                <div key={idx} className="p-5 rounded-2xl bg-[#15111E] border border-[#33243F]">
                  <h4 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Dumbbell className="w-4 h-4 text-amber-300" />
                    {trimmed.split('\n')[0]}
                  </h4>
                  <div className="space-y-2 text-xs text-slate-300">
                    {trimmed.split('\n').slice(1).map((line, lIdx) => (
                      <p key={lIdx} className="font-medium">{line}</p>
                    ))}
                  </div>
                </div>
              );
            }

            if (trimmed.startsWith('📅')) {
              return (
                <div key={idx} className="p-5 rounded-2xl bg-[#15111E] border border-[#33243F]">
                  <h4 className="text-sm font-black text-cyan-300 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-cyan-300" />
                    {trimmed.split('\n')[0]}
                  </h4>
                  <div className="space-y-2 text-xs text-slate-300">
                    {trimmed.split('\n').slice(1).map((line, lIdx) => (
                      <p key={lIdx} className="font-medium">{line}</p>
                    ))}
                  </div>
                </div>
              );
            }

            if (trimmed.startsWith('✅')) {
              return (
                <div key={idx} className="p-5 rounded-2xl bg-[#15111E] border border-emerald-500/30">
                  <h4 className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <ClipboardList className="w-4 h-4 text-emerald-400" />
                    {trimmed.split('\n')[0]}
                  </h4>
                  <div className="space-y-2 text-xs text-slate-300">
                    {trimmed.split('\n').slice(1).map((line, lIdx) => (
                      <p key={lIdx} className="font-medium">{line}</p>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <div key={idx} className="p-4 rounded-xl bg-[#120F1A] border border-[#2B2036] text-xs text-slate-300">
                {trimmed}
              </div>
            );
          })}
        </div>

        {/* System Task Quick Assign Section */}
        {currentUser.role === 'instructor' && (
          <div className="mt-6 pt-6 border-t border-[#2B1F33] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Asignar Tareas Automáticas al Sistema
                </h5>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Haz clic en cualquiera de las tareas recomendadas por la IA para asignarla a la lista de tareas del alumno.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tasksList.map((taskText, i) => {
                const isDone = createdTasks.includes(taskText);
                const isLoading = creatingTask === taskText;

                return (
                  <div
                    key={i}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isDone
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-[#15121E] border-[#31253E] hover:border-[#E9C349]/40 text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-medium leading-snug line-clamp-2">
                      {taskText}
                    </span>

                    <button
                      onClick={() => handleCreateTask(taskText)}
                      disabled={isDone || isLoading}
                      className={`px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold uppercase shrink-0 transition-all flex items-center gap-1.5 ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-300 cursor-default'
                          : 'bg-[#9A2B3C] hover:bg-[#B8344B] text-white shadow-md active:scale-95'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Asignada</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3 text-[#E9C349]" />
                          <span>Asignar</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
