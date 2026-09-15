import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  Sparkles, 
  Briefcase, 
  GraduationCap, 
  ShieldCheck, 
  Dumbbell, 
  Crown, 
  CreditCard, 
  ArrowRight,
  User,
  Users,
  Zap,
  Check,
  Building2,
  Lock
} from 'lucide-react';
import { User as UserType, StudentSubscriptionTier } from '../types';
import { Language } from '../lib/translations';

interface SubscriptionPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType;
  language: Language;
  onUpdateUser: (updatedUser: Partial<UserType>) => void;
  playChime?: (type: 'success' | 'click' | 'cash' | 'error') => void;
  defaultPlan?: 'instructor' | 'basic_practice' | 'instructor_pass' | 'plan_academia' | 'studio';
  targetInstructorName?: string;
}

export const SubscriptionPlansModal: React.FC<SubscriptionPlansModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  language,
  onUpdateUser,
  playChime,
  defaultPlan = 'basic_practice',
  targetInstructorName
}) => {
  const isEs = language === 'es';
  const [selectedPlan, setSelectedPlan] = useState<'instructor' | 'basic_practice' | 'instructor_pass' | 'plan_academia' | 'studio'>(defaultPlan);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectAndActivate = async (planKey: 'clase_profesor' | 'plan_instructor' | 'plan_academia' | 'instructor' | 'basic_practice' | 'instructor_pass' | 'studio') => {
    if (playChime) playChime('click');
    setLoadingPlan(planKey);

    try {
      // Call Universal Payment Webhook Simulator Endpoint on backend
      const res = await fetch('/api/webhook/simulate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userEmail: currentUser.email || `${currentUser.id}@waackon.com`,
          planType: planKey === 'instructor' ? 'plan_instructor' : (planKey === 'instructor_pass' ? 'clase_profesor' : (planKey === 'studio' ? 'plan_academia' : planKey)),
          gateway: 'stripe',
          transactionId: `tx-${Date.now()}`
        })
      });

      const data = await res.json();

      if (playChime) playChime('cash');

      if (data.success && data.result) {
        onUpdateUser({
          role: data.result.assignedRole,
          billingStatus: 'active',
          instructorSubscriptionStatus: 'active'
        });

        setSuccessToast(
          isEs 
            ? `¡Webhook de Pago Procesado! Rol actualizado a '${data.result.assignedRole.toUpperCase()}'. Redirigiendo a ${data.result.dashboardUrl}`
            : `Payment Webhook Processed! Role updated to ${data.result.assignedRole.toUpperCase()}. Redirecting to ${data.result.dashboardUrl}`
        );
      } else {
        // Fallback local update
        const targetRole = planKey === 'instructor' || planKey === 'plan_instructor' ? 'instructor' : (planKey === 'plan_academia' || planKey === 'studio' ? 'studio' : 'student');
        onUpdateUser({
          role: targetRole,
          billingStatus: 'active'
        });
        setSuccessToast(isEs ? `¡Plan activado exitosamente!` : `Plan activated successfully!`);
      }
    } catch (err) {
      console.warn('[Webhook Simulation Error]:', err);
      // Fallback
      const targetRole = planKey === 'instructor' || planKey === 'plan_instructor' ? 'instructor' : (planKey === 'plan_academia' || planKey === 'studio' ? 'studio' : 'student');
      onUpdateUser({
        role: targetRole,
        billingStatus: 'active'
      });
      setSuccessToast(isEs ? `¡Plan activado!` : `Plan activated!`);
    } finally {
      setLoadingPlan(null);
      setTimeout(() => {
        setSuccessToast(null);
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-[#0F0D1A] border-2 border-[#D9A9FF]/40 rounded-3xl max-w-5xl w-full p-4 sm:p-8 shadow-2xl z-10 space-y-6 overflow-y-auto max-h-[90vh] my-auto custom-scrollbar"
      >
        {/* Glow ambient backgrounds */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D9A9FF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-all border border-white/10 z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Floating Success Toast */}
        <AnimatePresence>
          {successToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-[#0A120E] border-2 border-emerald-500/60 text-emerald-300 text-xs font-mono font-bold rounded-2xl flex items-center gap-3 shadow-[0_0_30px_rgba(52,211,153,0.3)] z-30"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D9A9FF]/15 border border-[#D9A9FF]/30 text-[#D9A9FF] font-mono text-[10px] font-black uppercase tracking-widest">
            <Crown className="w-3.5 h-3.5 text-[#D9A9FF]" />
            MODELO DE SUSCRIPCIONES Y MEMBRESÍAS WAACK ON
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
            {isEs ? 'Selecciona tu Plan de Entrenamiento' : 'Choose Your Training Membership Plan'}
          </h2>

          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {isEs 
              ? 'Nuestra aplicación es de acceso gratuito. Elige la membresía que mejor se adapte a tus objetivos: práctica general independiente o formación intensiva con un profesor internacional.'
              : 'Our app is free to access. Choose the membership plan that best fits your goals.'}
          </p>
        </div>

        {/* 4 PLAN CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">

          {/* PLAN 1: PLAN BÁSICO DE PRÁCTICA GENERAL ($8 USD/MES) */}
          <div 
            onClick={() => setSelectedPlan('basic_practice')}
            className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden ${
              selectedPlan === 'basic_practice'
                ? 'bg-gradient-to-b from-[#16122C] to-[#0E0C1C] border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)] scale-[1.02]'
                : 'bg-[#120F20] border-white/10 hover:border-cyan-500/40 hover:bg-[#161328]'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-black uppercase tracking-wider">
                  ALUMNOS INDEPENDIENTES
                </span>
                <Dumbbell className="w-5 h-5 text-cyan-400" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white font-mono">
                  Plan Básico de Práctica
                </h3>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Acceso libre a herramientas de práctica sin suscribirte a un profesor.
                </p>
              </div>

              <div className="pt-2 border-t border-white/10">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white font-mono">$8.00</span>
                  <span className="text-xs font-mono text-cyan-300">USD / mes</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                  Sin permanencia • Cancela cuando quieras
                </span>
              </div>

              <div className="space-y-2 pt-3 text-xs font-sans text-slate-300">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Freestyle Lab Completo</strong>: Metrónomo BPM y Generador de Ritmos</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Análisis Somático</strong>: Pose Analyzer con IA y Anotador de Ángulos</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Práctica Sensorial</strong>: Registro de Sensaciones, Fluididad y Torques</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Batallas Virtuales</strong>: Participación en salas de práctica 1v1 y Jams</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Ranking Global</strong>: Acumulación de puntos por horas de práctica</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={loadingPlan === 'basic_practice'}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectAndActivate('basic_practice');
              }}
              className="w-full py-3 px-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 mt-4"
            >
              {loadingPlan === 'basic_practice' ? (
                <span>Procesando...</span>
              ) : (
                <>
                  <span>Activar Plan Básico ($8 USD)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* PLAN 2: MEMBRESÍA CÁTEDRA INSTRUCTOR ($15 USD/MES POR PROFESOR) */}
          <div 
            onClick={() => setSelectedPlan('instructor_pass')}
            className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden ${
              selectedPlan === 'instructor_pass'
                ? 'bg-gradient-to-b from-[#1C1628] to-[#120E1E] border-[#D9A9FF] shadow-[0_0_30px_rgba(217, 169, 255,0.3)] scale-[1.02]'
                : 'bg-[#120F20] border-white/10 hover:border-[#D9A9FF]/50 hover:bg-[#18142A]'
            }`}
          >
            {/* VIP Tag */}
            <div className="absolute top-0 right-0 bg-[#D9A9FF] text-black text-[9px] font-mono font-black uppercase px-3 py-1 rounded-bl-2xl shadow-md">
              RECOMENDADO ALUMNOS
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-[#D9A9FF]/20 border border-[#D9A9FF]/40 text-[#D9A9FF] text-[10px] font-mono font-black uppercase tracking-wider">
                  PANEL DE INSTRUCTOR
                </span>
                <GraduationCap className="w-5 h-5 text-[#D9A9FF]" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white font-mono">
                  Suscripción por Instructor
                </h3>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Entrena directo con tu profesor internacional preferido.
                </p>
              </div>

              <div className="pt-2 border-t border-white/10">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#D9A9FF] font-mono">$15.00</span>
                  <span className="text-xs font-mono text-slate-300">USD / mes por profesor</span>
                </div>
                <div className="mt-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> REPARTICIÓN TRANSPARENTE: 80% PROFESOR / 20% PLATAFORMA
                </div>
              </div>

              <div className="space-y-2 pt-2 text-xs font-sans text-slate-300">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#D9A9FF] shrink-0 mt-0.5" />
                  <span><strong>Programa 4 Semanas</strong>: Clases exclusivas en HD y Masterclasses</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#D9A9FF] shrink-0 mt-0.5" />
                  <span><strong>Feedback 1v1</strong>: Corrección biomecánica de video enviada por el profesor</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#D9A9FF] shrink-0 mt-0.5" />
                  <span><strong>Biblioteca Exclusiva</strong>: Workbooks PDF, Guías teóricas y Ebooks</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#D9A9FF] shrink-0 mt-0.5" />
                  <span><strong>Pase Freestyle Lab incluido</strong>: Acceso total a las herramientas generales</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={loadingPlan === 'instructor_pass'}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectAndActivate('instructor_pass');
              }}
              className="w-full py-3 px-4 rounded-2xl bg-[#D9A9FF] hover:bg-[#B87CFF] text-black font-mono font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 mt-4"
            >
              {loadingPlan === 'instructor_pass' ? (
                <span>Procesando...</span>
              ) : (
                <>
                  <span>Suscribirse a Instructor ($15 USD)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* PLAN 3: SUSCRIPCIÓN PLATAFORMA INSTRUCTORES ($15 USD/MES FIJO) */}
          <div 
            onClick={() => setSelectedPlan('instructor')}
            className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden ${
              selectedPlan === 'instructor'
                ? 'bg-gradient-to-b from-[#241220] to-[#140B13] border-purple-400 shadow-[0_0_25px_rgba(192,132,252,0.25)] scale-[1.02]'
                : 'bg-[#120F20] border-white/10 hover:border-purple-500/40 hover:bg-[#181222]'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-mono font-black uppercase tracking-wider">
                  PARA INSTRUCTORES
                </span>
                <Briefcase className="w-5 h-5 text-purple-400" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white font-mono">
                  Membresía Instructor
                </h3>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Cuota fija para impartir clases y gestionar tu academia.
                </p>
              </div>

              <div className="pt-2 border-t border-white/10">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-purple-300 font-mono">$15.00</span>
                  <span className="text-xs font-mono text-purple-200">USD / mes</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                  Recibes el 80% neto de cada alumno suscrito a tu cátedra
                </span>
              </div>

              <div className="space-y-2 pt-3 text-xs font-sans text-slate-300">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Dashboard de Gestión</strong>: Control completo de alumnos y catálogo</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Publicación de Cátedras</strong>: Cursos intensivos, masterclasses y ebooks</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Módulo de Finanzas 80/20</strong>: Cobros automatizados y retiros a banco</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Directorio Global</strong>: Posicionamiento destacado internacional</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={loadingPlan === 'instructor'}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectAndActivate('instructor');
              }}
              className="w-full py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 mt-4"
            >
              {loadingPlan === 'instructor' ? (
                <span>Procesando...</span>
              ) : (
                <>
                  <span>Activar como Instructor ($15 USD)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* PLAN 4: MEMBRESÍA ESTUDIOS Y ACADEMIAS ($30 USD/MES) */}
          <div 
            onClick={() => setSelectedPlan('plan_academia')}
            className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden ${
              selectedPlan === 'plan_academia' || selectedPlan === 'studio'
                ? 'bg-gradient-to-b from-[#182338] to-[#0D1322] border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.3)] scale-[1.02]'
                : 'bg-[#120F20] border-white/10 hover:border-amber-400/50 hover:bg-[#141829]'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-black uppercase tracking-wider">
                  STUDIOS Y ACADEMIAS
                </span>
                <Building2 className="w-5 h-5 text-amber-400" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white font-mono">
                  Membresía Academia
                </h3>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Gestión institucional de instructores, alumnos y repositorios.
                </p>
              </div>

              <div className="pt-2 border-t border-white/10">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-amber-300 font-mono">$30.00</span>
                  <span className="text-xs font-mono text-amber-200">USD / mes</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                  Gestión ilimitada de docentes y nómina estudiantil
                </span>
              </div>

              <div className="space-y-2 pt-3 text-xs font-sans text-slate-300">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Nómina Docente y Alumnos</strong>: Directorio unificado de tu estudio</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Repositorio Documental</strong>: Subida de guías PDF, temarios y programas</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Dashboard Institucional</strong>: Control de inscripciones y membresías</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Mapa Global</strong>: Posicionamiento destacado como Academia Oficial</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={loadingPlan === 'plan_academia' || loadingPlan === 'studio'}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectAndActivate('plan_academia');
              }}
              className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 mt-4"
            >
              {loadingPlan === 'plan_academia' || loadingPlan === 'studio' ? (
                <span>Procesando...</span>
              ) : (
                <>
                  <span>Activar Academia ($30 USD)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>

        {/* ACCESO GRATUITO FOOTER SUMMARY */}
        <div className="p-4 rounded-2xl bg-[#141222] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              <strong>Acceso Gratuito a la App ($0 USD/mes)</strong>:
              Explora el directorio global, mapas, noticias y perfil personal libremente.
            </span>
          </div>

          <span className="text-[10px] font-bold text-[#D9A9FF] bg-[#D9A9FF]/10 px-3 py-1 rounded-xl border border-[#D9A9FF]/20 shrink-0">
            SIN CONTRATOS NI PERMANENCIA
          </span>
        </div>

      </motion.div>
    </div>
  );
};
