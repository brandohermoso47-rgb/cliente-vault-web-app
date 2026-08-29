import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crown, 
  Sparkles, 
  Check, 
  ArrowRight, 
  GraduationCap, 
  Briefcase, 
  Dumbbell, 
  ShieldCheck, 
  Users, 
  Star, 
  Zap, 
  Video, 
  BookOpen, 
  DollarSign, 
  Award,
  CheckCircle2,
  TrendingUp,
  Heart,
  Building2
} from 'lucide-react';
import { User } from '../types';
import { Language } from '../lib/translations';

interface PlansViewProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  language: Language;
  onOpenPlansModal?: () => void;
}

export default function PlansView({ currentUser, onUserChange, language, onOpenPlansModal }: PlansViewProps) {
  const isEs = language === 'es';
  const [filterCategory, setFilterCategory] = useState<'all' | 'alumnos' | 'instructores' | 'estudios'>('all');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const handleActivatePlan = (planKey: 'basic_practice' | 'instructor_pass' | 'instructor' | 'plan_academia') => {
    if (onOpenPlansModal) {
      onOpenPlansModal();
    } else {
      // Direct mock activation if modal not passed
      if (planKey === 'instructor') {
        onUserChange({
          ...currentUser,
          role: 'instructor',
          instructorSubscriptionStatus: 'active',
          billingStatus: 'active'
        });
      } else if (planKey === 'plan_academia') {
        onUserChange({
          ...currentUser,
          role: 'studio',
          billingStatus: 'active'
        });
      } else if (planKey === 'basic_practice') {
        onUserChange({
          ...currentUser,
          subscriptionTier: 'basic_practice',
          billingStatus: 'active'
        });
      } else if (planKey === 'instructor_pass') {
        onUserChange({
          ...currentUser,
          subscriptionTier: 'instructor_pass',
          billingStatus: 'active'
        });
      }
    }
  };

  return (
    <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#262626] rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl relative overflow-hidden text-slate-900 dark:text-white w-full">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#E9C349]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Banner Header */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-white dark:from-[#1A1528] dark:via-[#221835] dark:to-[#120F1D] border border-[#E9C349]/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9C349]/15 border border-[#E9C349]/40 text-[#E9C349] font-mono text-[10px] font-black uppercase tracking-widest">
            <Crown className="w-3.5 h-3.5 text-[#E9C349]" />
            {isEs ? 'MODELO OFICIAL DE SUSCRIPCIONES & BENEFICIOS' : 'OFFICIAL MEMBERSHIPS & BENEFITS MODEL'}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase font-mono">
            {isEs ? 'Planes, Membresías y Beneficios' : 'Plans, Memberships & Benefits'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {isEs 
              ? 'Conoce la estructura transparente de WAACK ON®. Accede gratis o elige el plan diseñado para potenciar tu nivel como alumno o escalar tu cátedra profesional como instructor.'
              : 'Discover the transparent structure of WAACK ON®. Access for free or choose the plan tailored for students or professional instructors.'}
          </p>
        </div>

        <div className="shrink-0 flex flex-col gap-3 relative z-10 w-full sm:w-auto">
          <button
            onClick={() => onOpenPlansModal && onOpenPlansModal()}
            className="px-6 py-3.5 bg-[#E9C349] hover:bg-yellow-300 text-black text-xs font-mono font-black rounded-2xl transition-all shadow-[0_0_30px_rgba(233,195,73,0.3)] flex items-center justify-center gap-2 cursor-pointer active:scale-95 uppercase"
          >
            <Zap className="w-4 h-4 fill-black" />
            <span>{isEs ? 'VER MODAL DE PAGO / CHECKOUT' : 'OPEN PAYMENT CHECKOUT'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Billing Cycle Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-[#262626] pb-5">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#0A0A0A] p-1.5 rounded-2xl border border-slate-200 dark:border-[#262626] w-full sm:w-auto">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase rounded-xl transition-all flex items-center gap-2 ${
              filterCategory === 'all'
                ? 'bg-[#E9C349] text-black shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>{isEs ? 'Todos los Planes' : 'All Plans'}</span>
          </button>
          <button
            onClick={() => setFilterCategory('alumnos')}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase rounded-xl transition-all flex items-center gap-2 ${
              filterCategory === 'alumnos'
                ? 'bg-[#E9C349] text-black shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{isEs ? 'Para Alumnos' : 'For Students'}</span>
          </button>
          <button
            onClick={() => setFilterCategory('instructores')}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase rounded-xl transition-all flex items-center gap-2 ${
              filterCategory === 'instructores'
                ? 'bg-[#E9C349] text-black shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{isEs ? 'Para Instructores' : 'For Instructors'}</span>
          </button>
          <button
            onClick={() => setFilterCategory('estudios')}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase rounded-xl transition-all flex items-center gap-2 ${
              filterCategory === 'estudios'
                ? 'bg-[#E9C349] text-black shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{isEs ? 'Estudios & Academias' : 'Studios & Academies'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#0A0A0A] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#262626] text-xs font-mono">
          <span className="text-slate-500 dark:text-slate-400">{isEs ? 'Formato de Facturación:' : 'Billing Format:'}</span>
          <span className="text-[#E9C349] font-bold uppercase">{isEs ? 'Mensual sin Permanencia' : 'Monthly No Contract'}</span>
        </div>
      </div>

      {/* PLAN CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* PLAN 1: GRATUITO */}
        {(filterCategory === 'all' || filterCategory === 'alumnos') && (
          <div className="bg-white dark:bg-[#0D0D12] border border-slate-200 dark:border-[#262626] rounded-3xl p-6 flex flex-col justify-between space-y-6 relative overflow-hidden hover:border-slate-400 dark:hover:border-slate-500 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold rounded-full uppercase tracking-wider">
                  {isEs ? 'LIBRE ACCESO' : 'FREE ACCESS'}
                </span>
                <Users className="w-5 h-5 text-slate-400" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white font-mono uppercase">
                  {isEs ? 'Plan Gratuito / Explorador' : 'Free / Explorer Plan'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isEs 
                    ? 'Explora la plataforma, consulta la comunidad y sigue los perfiles de profesores.'
                    : 'Explore the platform, check the community, and follow instructor profiles.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-[#1F1F24]">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">$0</span>
                  <span className="text-xs font-mono text-slate-400">USD / mes</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 block mt-1">
                  ✓ Incluido por defecto en tu cuenta
                </span>
              </div>

              <div className="space-y-2.5 pt-2 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Acceso al Mapa Global</strong>: Localización de Jam Sessions y escuelas</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Directorio Internacional</strong>: Vista de perfiles de profesores</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Expediente Somático Básico</strong>: Registro de rachas e historial de días</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Feed Social & Reels</strong>: Visualización de clips de Waacking</span>
                </div>
              </div>
            </div>

            <button
              disabled
              className="w-full py-3 bg-slate-200 dark:bg-[#1F1F24] text-slate-500 dark:text-slate-400 font-mono font-bold text-xs rounded-2xl uppercase"
            >
              {isEs ? 'Plan Actual Activado' : 'Current Active Plan'}
            </button>
          </div>
        )}

        {/* PLAN 2: BÁSICO PRÁCTICA INDEPENDIENTE ($8 USD) */}
        {(filterCategory === 'all' || filterCategory === 'alumnos') && (
          <div className="bg-gradient-to-b from-cyan-50 to-white dark:from-[#141226] dark:to-[#0D0B1A] border-2 border-cyan-500/50 rounded-3xl p-6 flex flex-col justify-between space-y-6 relative overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:border-cyan-400 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-black rounded-full uppercase tracking-wider">
                  {isEs ? 'ALUMNOS INDEPENDIENTES' : 'INDEPENDENT STUDENTS'}
                </span>
                <Dumbbell className="w-5 h-5 text-cyan-400" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white font-mono uppercase">
                  {isEs ? 'Plan Básico de Práctica' : 'Basic Practice Plan'}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {isEs 
                    ? 'Herramientas avanzadas de entrenamiento autónomo sin estar suscrito a un profesor.'
                    : 'Advanced self-training tools without an instructor pass.'}
                </p>
              </div>

              <div className="pt-3 border-t border-cyan-500/20">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-cyan-400 font-mono">$8.00</span>
                  <span className="text-xs font-mono text-cyan-200">USD / mes</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 block mt-1">
                  Sin permanencia • Cancela en cualquier momento
                </span>
              </div>

              <div className="space-y-2.5 pt-2 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Freestyle Lab Ilimitado</strong>: Generador de ritmos y metrónomo BPM</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Pose Analyzer con IA</strong>: Medición de ángulos de brazos y torques</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Salas de Batallas 1v1</strong>: Práctica interactiva con otros bailarines</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Galería B&W Privada</strong>: Almacenamiento HD ilimitado de fotos</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleActivatePlan('basic_practice')}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-black text-xs rounded-2xl uppercase transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isEs ? 'Activar Plan Básico ($8 USD)' : 'Activate Basic Plan ($8 USD)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* PLAN 3: MEMBRESÍA DE INSTRUCTOR ($15 USD) */}
        {(filterCategory === 'all' || filterCategory === 'alumnos') && (
          <div className="bg-gradient-to-b from-amber-50 to-white dark:from-[#1E172E] dark:to-[#120E1E] border-2 border-[#E9C349] rounded-3xl p-6 flex flex-col justify-between space-y-6 relative overflow-hidden shadow-[0_0_35px_rgba(233,195,73,0.25)] hover:border-yellow-300 transition-all">
            <div className="absolute top-0 right-0 bg-[#E9C349] text-black text-[9px] font-mono font-black uppercase px-3 py-1 rounded-bl-2xl shadow-md">
              {isEs ? 'MÁS POPULAR ALUMNOS' : 'MOST POPULAR'}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-[#E9C349]/20 border border-[#E9C349]/40 text-[#E9C349] text-[10px] font-mono font-black rounded-full uppercase tracking-wider">
                  {isEs ? 'PANEL DE INSTRUCTOR' : 'INSTRUCTOR PASS'}
                </span>
                <GraduationCap className="w-5 h-5 text-[#E9C349]" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white font-mono uppercase">
                  {isEs ? 'Membresía de Instructor' : 'Instructor Membership Pass'}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {isEs 
                    ? 'Formación guiada intensiva con tu profesor internacional preferido.'
                    : 'Guided training with your preferred international teacher.'}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E9C349]/30">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#E9C349] font-mono">$15.00</span>
                  <span className="text-xs font-mono text-slate-300">USD / mes por profesor</span>
                </div>
                <div className="mt-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>80% PROFESOR / 20% PLATAFORMA</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#E9C349] shrink-0 mt-0.5" />
                  <span><strong>Acceso Total a Cursos HD</strong>: Módulos grabados y transmisiones en vivo</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#E9C349] shrink-0 mt-0.5" />
                  <span><strong>Feedback Biomecánico 1v1</strong>: Corrección directa en video por el profesor</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#E9C349] shrink-0 mt-0.5" />
                  <span><strong>Google Classroom Integration</strong>: Tareas, evaluaciones y certificados</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#E9C349] shrink-0 mt-0.5" />
                  <span><strong>Freestyle Lab Incluido</strong>: Acceso sin costo extra al laboratorio</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleActivatePlan('instructor_pass')}
              className="w-full py-3 bg-[#E9C349] hover:bg-yellow-300 text-black font-mono font-black text-xs rounded-2xl uppercase transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isEs ? 'Suscribirse a Instructor ($15 USD)' : 'Subscribe to Pass ($15 USD)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* PLAN 4: MEMBRESÍA PROFESORES ($15 USD FIJO) */}
        {(filterCategory === 'all' || filterCategory === 'instructores') && (
          <div className="bg-gradient-to-b from-purple-50 to-white dark:from-[#251327] dark:to-[#120A13] border-2 border-purple-500/60 rounded-3xl p-6 flex flex-col justify-between space-y-6 relative overflow-hidden shadow-[0_0_35px_rgba(168,85,247,0.2)] hover:border-purple-400 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-mono font-black rounded-full uppercase tracking-wider">
                  {isEs ? 'PARA PROFESORES E INSTRUCTORES' : 'FOR TEACHERS & INSTRUCTORS'}
                </span>
                <Briefcase className="w-5 h-5 text-purple-400" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white font-mono uppercase">
                  {isEs ? 'Membresía Instructor Global' : 'Global Instructor Plan'}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {isEs 
                    ? 'Monetiza tu conocimiento, publica cursos y administra tus alumnos.'
                    : 'Monetize your expertise, publish courses, and manage your students.'}
                </p>
              </div>

              <div className="pt-3 border-t border-purple-500/30">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-purple-300 font-mono">$15.00</span>
                  <span className="text-xs font-mono text-purple-200">USD / mes tarifa fija</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 block mt-1">
                  ✓ Conservas el 80% neto de la cuota de cada alumno
                </span>
              </div>

              <div className="space-y-2.5 pt-2 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Dashboard de Panel de Instructor</strong>: Gestión de cursos, workbooks y avisos</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Módulo Finanzas 80/20</strong>: Reportes en tiempo real y retiros a banco</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Google Workspace Suite</strong>: Integración con Slides, Classroom y Meet</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Promoción Global & Badges</strong>: Insignia dorada verificada de instructor</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleActivatePlan('instructor')}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-mono font-black text-xs rounded-2xl uppercase transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isEs ? 'Activar Como Instructor ($15 USD)' : 'Activate as Instructor ($15 USD)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* PLAN 5: MEMBRESÍA ESTUDIOS Y ACADEMIAS ($30 USD) */}
        {(filterCategory === 'all' || filterCategory === 'instructores' || filterCategory === 'estudios') && (
          <div className="bg-gradient-to-b from-amber-50 to-white dark:from-[#182338] dark:to-[#0D1322] border-2 border-amber-500/60 rounded-3xl p-6 flex flex-col justify-between space-y-6 relative overflow-hidden shadow-[0_0_35px_rgba(251,191,36,0.2)] hover:border-amber-400 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-black rounded-full uppercase tracking-wider">
                  {isEs ? 'PARA ESTUDIOS Y ACADEMIAS' : 'FOR STUDIOS & ACADEMIES'}
                </span>
                <Building2 className="w-5 h-5 text-amber-400" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white font-mono uppercase">
                  {isEs ? 'Membresía Studio & Academia' : 'Studio & Academy Plan'}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {isEs 
                    ? 'Gestión unificada de nómina de profesores, alumnado y material institucional.'
                    : 'Unified management of teachers, students, and institutional material.'}
                </p>
              </div>

              <div className="pt-3 border-t border-amber-500/30">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-amber-300 font-mono">$30.00</span>
                  <span className="text-xs font-mono text-amber-200">USD / mes tarifa plana</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 block mt-1">
                  ✓ Gestión ilimitada de docentes y nómina estudiantil
                </span>
              </div>

              <div className="space-y-2.5 pt-2 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Nómina Docente y Alumnos</strong>: Gestión centralizada de tu escuela</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Repositorio Institucional</strong>: Carga de guías PDF y workbooks</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Dashboard de Administración</strong>: Control de membresías e inscripciones</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Directorio Global Destacado</strong>: Distintivo de Academia Oficial</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleActivatePlan('plan_academia')}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-mono font-black text-xs rounded-2xl uppercase transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isEs ? 'Activar Plan Academia ($30 USD)' : 'Activate Studio Plan ($30 USD)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {/* SECCIÓN DETALLADA DE BENEFICIOS (ALUMNOS vs INSTRUCTORES) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">

        {/* BENEFICIOS PARA ALUMNOS */}
        <div className="bg-[#0A0A0E] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-xl">
          <div className="flex items-center gap-3 border-b border-cyan-500/20 pb-4">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                {isEs ? 'VENTAJAS PARA ESTUDIANTES' : 'STUDENT BENEFITS'}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono uppercase">
                {isEs ? '¿Por qué entrenar en WAACK ON?' : 'Why train at WAACK ON?'}
              </h3>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-300">
            <div className="flex items-start gap-3 bg-slate-50 dark:bg-[#12101F] p-3.5 rounded-2xl border border-slate-200 dark:border-white/5">
              <Star className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">{isEs ? 'Formación Internacional Directa' : 'Direct Global Mentorship'}</h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Accede a temarios y técnicas de Waacking de los pioneros e instructores más influyentes del mundo sin fronteras geográficas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-50 dark:bg-[#12101F] p-3.5 rounded-2xl border border-slate-200 dark:border-white/5">
              <Video className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">{isEs ? 'Feedback Biomecánico 1v1' : 'Biomechanical 1v1 Feedback'}</h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Envía tus videos de práctica y recibe correcciones detalladas sobre tus líneas, torques y musicalidad por parte de tu profesor.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-50 dark:bg-[#12101F] p-3.5 rounded-2xl border border-slate-200 dark:border-white/5">
              <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">{isEs ? 'Laboratorio de IA y Somática' : 'AI & Somatic Laboratory'}</h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Usa nuestro analizador de pose, metrónomo rítmico y diario somático para acelerar tu desarrollo técnico y memoria muscular.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-50 dark:bg-[#12101F] p-3.5 rounded-2xl border border-slate-200 dark:border-white/5">
              <Heart className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">{isEs ? 'Apoyo Ético Directo al Bailarín (80/20)' : 'Ethical 80/20 Dancer Support'}</h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  El 80% de tu suscripción va íntegramente al bolsillo de tu profesor, garantizando un ecosistema de danza sostenible y justo.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BENEFICIOS PARA INSTRUCTORES */}
        <div className="bg-[#0A0A0E] border border-purple-500/30 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-xl">
          <div className="flex items-center gap-3 border-b border-purple-500/20 pb-4">
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-purple-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">
                {isEs ? 'VENTAJAS PARA INSTRUCTORES' : 'INSTRUCTOR BENEFITS'}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono uppercase">
                {isEs ? '¿Por qué enseñar en WAACK ON?' : 'Why teach on WAACK ON?'}
              </h3>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-300">
            <div className="flex items-start gap-3 bg-slate-50 dark:bg-[#140E20] p-3.5 rounded-2xl border border-slate-200 dark:border-white/5">
              <DollarSign className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">{isEs ? 'Monetización Justa del 80% Neto' : 'Fair 80% Net Revenue'}</h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Gana $12.00 USD netos de cada suscripción mensual de $15.00 USD. Cobros automatizados con transferencia directa a tu cuenta bancaria.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-50 dark:bg-[#140E20] p-3.5 rounded-2xl border border-slate-200 dark:border-white/5">
              <BookOpen className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">{isEs ? 'Plataforma Académica Integrada' : 'Integrated Academic Suite'}</h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Crea cursos, publica ebooks en PDF, programa clases por Google Meet y evalúa con Google Classroom sin instalar nada extra.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-50 dark:bg-[#140E20] p-3.5 rounded-2xl border border-slate-200 dark:border-white/5">
              <TrendingUp className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">{isEs ? 'Alcance e Infraestructura Global' : 'Global Outreach & Infrastructure'}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Forma parte del directorio verificado de instructores globales y llega a miles de bailarines apasionados en América, Europa y Asia.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-50 dark:bg-[#140E20] p-3.5 rounded-2xl border border-slate-200 dark:border-white/5">
              <Award className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">{isEs ? 'Gestión Automática de Alumnos' : 'Automated Student Management'}</h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Panel con estadísticas completas, entrega de certificados de asistencia y sistema de calificaciones centralizado.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* COMPARATIVE SUMMARY TABLE */}
      <div className="bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[#E9C349]" />
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white font-mono uppercase">
              {isEs ? 'Tabla Comparativa de Características' : 'Feature Comparison Matrix'}
            </h3>
            <p className="text-xs text-slate-400">
              {isEs ? 'Resumen de funciones incluidas por tipo de cuenta y suscripción.' : 'Summary of included features by tier.'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/20">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#262626] text-[#8A8A8A]">
                <th className="py-3 px-4 uppercase font-bold">{isEs ? 'Función / Herramienta' : 'Feature / Tool'}</th>
                <th className="py-3 px-4 text-center uppercase font-bold">{isEs ? 'Gratuito ($0)' : 'Free ($0)'}</th>
                <th className="py-3 px-4 text-center uppercase font-bold text-cyan-400">{isEs ? 'Básico Práctica ($8)' : 'Basic Practice ($8)'}</th>
                <th className="py-3 px-4 text-center uppercase font-bold text-[#E9C349]">{isEs ? 'Cátedra Alumno ($15)' : 'Cátedra Pass ($15)'}</th>
                <th className="py-3 px-4 text-center uppercase font-bold text-purple-400">{isEs ? 'Instructor ($15)' : 'Instructor ($15)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#1A1A1A] text-slate-700 dark:text-slate-200">
              <tr>
                <td className="py-3 px-4 font-sans font-medium">Directorio Global & Mapa de Jams</td>
                <td className="py-3 px-4 text-center text-emerald-400">✓</td>
                <td className="py-3 px-4 text-center text-emerald-400">✓</td>
                <td className="py-3 px-4 text-center text-emerald-400">✓</td>
                <td className="py-3 px-4 text-center text-emerald-400">✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-medium">Freestyle Lab (Metrónomo & BPM)</td>
                <td className="py-3 px-4 text-center text-slate-600">Limited</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓ Ilimitado</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓ Ilimitado</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓ Ilimitado</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-medium">Pose Analyzer & Visor de Ángulos IA</td>
                <td className="py-3 px-4 text-center text-slate-600">-</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-medium">Cursos en HD & Clases en Vivo</td>
                <td className="py-3 px-4 text-center text-slate-600">-</td>
                <td className="py-3 px-4 text-center text-slate-600">-</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓ Del Profesor</td>
                <td className="py-3 px-4 text-center text-purple-300 font-bold">✓ Creador</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-medium">Feedback Biomecánico 1v1 por Video</td>
                <td className="py-3 px-4 text-center text-slate-600">-</td>
                <td className="py-3 px-4 text-center text-slate-600">-</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓ Ilimitado</td>
                <td className="py-3 px-4 text-center text-purple-300 font-bold">✓ Evaluador</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-medium">Repartición de Ingresos 80% / 20%</td>
                <td className="py-3 px-4 text-center text-slate-600">-</td>
                <td className="py-3 px-4 text-center text-slate-600">-</td>
                <td className="py-3 px-4 text-center text-[#E9C349] font-bold">80% al Profesor</td>
                <td className="py-3 px-4 text-center text-purple-300 font-bold">80% Recaudo</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
