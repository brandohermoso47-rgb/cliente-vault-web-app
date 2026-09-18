import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  Video, 
  BookOpen, 
  Award, 
  Zap, 
  ShieldCheck, 
  Star, 
  Instagram, 
  Users, 
  CreditCard,
  ArrowRight
} from 'lucide-react';

import { Language } from '../lib/translations';

export interface InstructorPlanInfo {
  id: string;
  name: string;
  avatar: string;
  specialties: string[];
  level: string;
  country: string;
  isFeaturedInstructor?: boolean;
  instagram: string;
  rating: number;
  students: number;
  monthlyPrice?: string;
  methodologyDescription?: string;
  associatedLabTools?: string[];
}

interface InstructorMembershipModalProps {
  instructor: InstructorPlanInfo | null;
  onClose: () => void;
  language?: Language | string;
  onSubscribe?: (instructorName: string) => void;
}

export default function InstructorMembershipModal({
  instructor,
  onClose,
  language = 'es',
  onSubscribe
}: InstructorMembershipModalProps) {
  const [activeTab, setActiveTab] = useState<'programa' | 'beneficios' | 'metodologia'>('programa');
  const [subscribedToast, setSubscribedToast] = useState(false);

  if (!instructor) return null;

  const isEs = language === 'es';
  const price = instructor.monthlyPrice || '$49.99';

  const weeksData = [
    {
      week: 1,
      title: isEs ? 'Semana 1: Fundamentos Biomecánicos & Rolls' : 'Week 1: Biomechanical Fundamentals & Rolls',
      desc: isEs 
        ? 'Aislamiento de codos, alineación de hombros, port de bras y control de aceleración en rolls limpios a 120 BPM.'
        : 'Elbow isolation, shoulder alignment, port de bras, and acceleration control in clean 120 BPM rolls.',
      highlights: isEs ? ['Postura Somática', 'Aislamiento 360°', 'Drills en Espejo'] : ['Somatic Posture', '360° Isolation', 'Mirror Drills']
    },
    {
      week: 2,
      title: isEs ? 'Semana 2: Musicalidad Disco, Síncopa & Acentos' : 'Week 2: Disco Musicality, Syncopation & Accents',
      desc: isEs 
        ? 'Acentos en caja torácica, lectura de líneas de bajo/vientos en música Disco 70s y contratiempos acelerados.'
        : 'Chest accents, bass/horn line interpretation in 70s Disco music, and accelerated off-beats.',
      highlights: isEs ? ['Ritmo Contratiempo', 'Acentos de Pecho', 'Playlists BPM+'] : ['Off-Beat Rhythm', 'Chest Accents', 'BPM+ Playlists']
    },
    {
      week: 3,
      title: isEs ? 'Semana 3: Pasarela, Poses Simétricas & Carácter' : 'Week 3: Runway, Symmetrical Poses & Character',
      desc: isEs 
        ? 'Expresión facial y corporal, proyección escénica, pasarela retro, congelados en pose y presencia dramática.'
        : 'Facial and body expression, stage projection, retro runway, pose freezes, and dramatic presence.',
      highlights: isEs ? ['Pasarela Disco', 'Pose Sincronizada', 'Expresión Teatral'] : ['Disco Runway', 'Synchronized Pose', 'Theatrical Expression']
    },
    {
      week: 4,
      title: isEs ? 'Semana 4: Master Freestyle, Batalla & Certificación' : 'Week 4: Master Freestyle, Battle & Certification',
      desc: isEs 
        ? 'Creación de secuencias espontáneas, batallas 1v1 virtuales en vivo con feedback directo y evaluación de cierre.'
        : 'Spontaneous sequence creation, 1v1 virtual live battles with direct feedback, and final assessment.',
      highlights: isEs ? ['Simulación de Batalla', 'Feedback 1v1', 'Diploma Waack On'] : ['Battle Simulation', '1v1 Feedback', 'Waack On Diploma']
    }
  ];

  const handleSubscribeClick = () => {
    setSubscribedToast(true);
    if (onSubscribe) {
      onSubscribe(instructor.name);
    }
    setTimeout(() => {
      setSubscribedToast(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      {/* Background click listener */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Smooth entrance animation container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative bg-[#121212] border border-[#262626] rounded-2xl max-w-2xl w-full p-4 sm:p-7 shadow-2xl z-10 space-y-6 overflow-y-auto max-h-[90vh] my-auto custom-scrollbar"
      >
        {/* Glow ambient background accent */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#D9A9FF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#C23E9E]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-all border border-white/5 z-20"
          title={isEs ? 'Cerrar' : 'Close'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Toast Notification */}
        <AnimatePresence>
          {subscribedToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold rounded-xl flex items-center gap-2 z-30"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {isEs 
                  ? `¡Solicitud de membresía enviada para entrenar con ${instructor.name}! Te redirigiremos a tu panel.`
                  : `Membership request submitted to train with ${instructor.name}! Redirecting.`}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructor Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={instructor.avatar}
                alt={instructor.name}
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-[#D9A9FF] shadow-lg"
                referrerPolicy="no-referrer"
              />
              {instructor.isFeaturedInstructor && (
                <div className="absolute -bottom-2 -right-1 bg-[#D9A9FF] text-black text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 fill-black" />
                  <span>VIP</span>
                </div>
              )}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold text-[#D9A9FF] bg-[#D9A9FF]/10 border border-[#D9A9FF]/30 px-2 py-0.5 rounded-md uppercase">
                  {instructor.level}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {instructor.country}
                </span>
              </div>

              <h2 className="text-lg md:text-xl font-bold text-white leading-tight">
                {instructor.name}
              </h2>

              <div className="flex items-center gap-3 text-xs text-[#8A8A8A] font-mono">
                <div className="flex items-center gap-1 text-[#D9A9FF] font-bold">
                  <Star className="w-3.5 h-3.5 fill-[#D9A9FF]" />
                  <span>{instructor.rating.toFixed(1)}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1 text-slate-300">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{instructor.students} {isEs ? 'estudiantes' : 'students'}</span>
                </div>
                <span>•</span>
                <a
                  href={`https://instagram.com/${instructor.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-400 hover:text-[#D9A9FF] transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>{instructor.instagram}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Pricing Highlight */}
          <div className="bg-gradient-to-br from-[#1E1B12] to-[#141414] border border-[#D9A9FF]/40 rounded-2xl p-3.5 text-right shrink-0 shadow-inner flex flex-col justify-center">
            <span className="text-[10px] font-mono font-bold text-[#D9A9FF] uppercase block tracking-wider">
              {isEs ? 'PLAN DE MEMBRESÍA MENSUAL' : 'MONTHLY MEMBERSHIP PLAN'}
            </span>
            <div className="flex items-baseline justify-end gap-1 mt-0.5">
              <span className="text-2xl md:text-3xl font-black text-white font-mono">{price}</span>
              <span className="text-xs font-mono text-slate-400">{isEs ? '/mes' : '/mo'}</span>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 font-bold block mt-0.5">
              ✓ {isEs ? 'Acceso Ilimitado x 30 días' : 'Unlimited 30-Day Access'}
            </span>
          </div>
        </div>

        {/* Tabs switcher */}
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('programa')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 border ${
              activeTab === 'programa'
                ? 'bg-[#D9A9FF] text-black border-[#D9A9FF] shadow-md'
                : 'bg-[#181818] text-[#8A8A8A] hover:text-white border-white/5'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{isEs ? '4 Semanas de Entrenamiento' : '4 Weeks Training Plan'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('beneficios')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 border ${
              activeTab === 'beneficios'
                ? 'bg-[#D9A9FF] text-black border-[#D9A9FF] shadow-md'
                : 'bg-[#181818] text-[#8A8A8A] hover:text-white border-white/5'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{isEs ? 'Beneficios' : 'Benefits'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('metodologia')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 border ${
              activeTab === 'metodologia'
                ? 'bg-[#C23E9E] text-white border-[#C23E9E] shadow-md'
                : 'bg-[#181818] text-[#8A8A8A] hover:text-white border-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#D9A9FF]" />
            <span>{isEs ? 'Metodología & Tools' : 'Methodology & Tools'}</span>
          </button>
        </div>

        {/* TAB 1: 4 WEEKS TRAINING PROGRAM */}
        {activeTab === 'programa' && (
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
            {weeksData.map((w) => (
              <div
                key={w.week}
                className="bg-[#181818] border border-white/5 rounded-xl p-4 space-y-2 hover:border-[#D9A9FF]/30 transition-all group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#D9A9FF]/10 border border-[#D9A9FF]/40 text-[#D9A9FF] text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      W{w.week}
                    </span>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#D9A9FF] transition-colors">
                      {w.title}
                    </h4>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-bold">
                    {isEs ? '7 Días de Práctica' : '7 Days Practice'}
                  </span>
                </div>

                <p className="text-[11px] text-[#A0A5B1] leading-relaxed">
                  {w.desc}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(w.highlights || []).map((h, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] font-mono text-[#D9A9FF] bg-[#D9A9FF]/5 border border-[#D9A9FF]/20 px-2 py-0.5 rounded-md font-bold"
                    >
                      ✓ {h}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: INCLUDED MEMBERSHIP BENEFITS */}
        {activeTab === 'beneficios' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
            {/* 1. Evaluación y Feedback */}
            <div className="bg-[#181818] border border-white/5 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-[#D9A9FF]">
                <Video className="w-4 h-4 shrink-0" />
                <h4 className="text-xs font-bold text-white uppercase">
                  {isEs ? 'Evaluación & Video-Feedback 1v1' : '1v1 Assessment & Video Feedback'}
                </h4>
              </div>
              <p className="text-[11px] text-[#A0A5B1] leading-relaxed">
                {isEs 
                  ? 'Envía tus grabaciones semanales y recibe corrección biomecánica directa del instructor con desglose en cámara lenta.'
                  : 'Submit your weekly recordings and receive direct biomechanical corrections with slow-motion analysis.'}
              </p>
            </div>

            {/* 2. Material Exclusivo */}
            <div className="bg-[#181818] border border-white/5 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-[#D9A9FF]">
                <BookOpen className="w-4 h-4 shrink-0" />
                <h4 className="text-xs font-bold text-white uppercase">
                  {isEs ? 'Material Exclusivo Waack On' : 'Exclusive Waack On Material'}
                </h4>
              </div>
              <p className="text-[11px] text-[#A0A5B1] leading-relaxed">
                {isEs 
                  ? 'Acceso descargable al Waack Workbook v2.2 (PDF), 12 video-drills acelerados y playlists curadas BPM 125-135.'
                  : 'Downloadable access to Waack Workbook v2.2 (PDF), 12 accelerated video drills, and curated playlists.'}
              </p>
            </div>

            {/* 3. Batallas en Vivo */}
            <div className="bg-[#181818] border border-white/5 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-[#D9A9FF]">
                <Zap className="w-4 h-4 shrink-0" />
                <h4 className="text-xs font-bold text-white uppercase">
                  {isEs ? 'Pase a Batallas en Vivo & Jams' : 'Live Battle & Jam Passes'}
                </h4>
              </div>
              <p className="text-[11px] text-[#A0A5B1] leading-relaxed">
                {isEs 
                  ? 'Entrada preferencial sin costo adicional a las Batallas Oficiales mensuales y salas de práctica con cámara abierta.'
                  : 'Preferential zero-cost entry to monthly Official Battles and open-camera practice rooms.'}
              </p>
            </div>

            {/* 4. Certificado Oficial */}
            <div className="bg-[#181818] border border-white/5 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-[#D9A9FF]">
                <Award className="w-4 h-4 shrink-0" />
                <h4 className="text-xs font-bold text-white uppercase">
                  {isEs ? 'Certificado Digital Acreditado' : 'Accredited Digital Certificate'}
                </h4>
              </div>
              <p className="text-[11px] text-[#A0A5B1] leading-relaxed">
                {isEs 
                  ? 'Diploma oficial de finalización emitido por la Academia Waack On y avalado por tu instructor al culminar las 4 semanas.'
                  : 'Official completion diploma issued by Waack On Academy and signed by your instructor upon 4-week completion.'}
              </p>
            </div>
          </div>
        )}

        {/* Benefits summary list banner */}
        <div className="p-3 bg-gradient-to-r from-[#181818] via-[#1F1B13] to-[#181818] border border-[#D9A9FF]/30 rounded-xl flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{isEs ? 'Garantía de Satisfacción Waack On' : 'Waack On Satisfaction Guarantee'}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300 font-medium">
            <span>✓ {isEs ? '4 Semanas' : '4 Weeks'}</span>
            <span>•</span>
            <span>✓ {isEs ? 'Evaluación 1v1' : '1v1 Assessment'}</span>
            <span>•</span>
            <span>✓ {isEs ? 'Certificado' : 'Certificate'}</span>
          </div>
        </div>

        {/* TAB 3: METODOLOGÍA & HERRAMIENTAS FREESTYLE LAB */}
        {activeTab === 'metodologia' && (
          <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
            <div className="p-4 bg-[#181224] border border-[#D9A9FF]/30 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#D9A9FF] uppercase tracking-wider">
                  ENFOQUE PEDAGÓGICO DE CÁTEDRA
                </span>
                <span className="px-2 py-0.5 rounded bg-[#C23E9E]/30 text-[#D9A9FF] text-[9px] font-mono font-bold">
                  VERIFICADO
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                {instructor.methodologyDescription || `En esta cátedra, el instructor utiliza un enfoque biomecánico avanzado combinando la técnica histórica del Disco con herramientas interactivas del Freestyle Lab.

Se trabajan aceleraciones de muñeca, aislamiento escapular y proyectabilidad dramática mediante evaluaciones continuas.`}
              </p>

              {/* Lab tools associated */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">
                  Herramientas del Freestyle Lab Integradas:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(instructor.associatedLabTools && instructor.associatedLabTools.length > 0
                    ? instructor.associatedLabTools
                    : ['Espejo Ciego', 'DramaLab', 'BattleLab', 'SomaticFeedbackLab']
                  ).map(t => (
                    <span key={t} className="px-2.5 py-1 rounded-xl bg-[#D9A9FF]/15 border border-[#D9A9FF]/30 text-[#D9A9FF] text-[10px] font-mono font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[#D9A9FF]" />
                      <span>{t}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/10">
          <div className="text-left">
            <span className="text-[10px] font-mono text-[#8A8A8A] block">
              {isEs ? 'Acompañamiento personalizado directo con' : 'Direct personalized coaching with'}
            </span>
            <span className="text-xs font-bold text-white font-mono">
              {instructor.name} ({instructor.level})
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono font-bold rounded-xl transition-all uppercase w-1/2 sm:w-auto"
            >
              {isEs ? 'Cancelar' : 'Cancel'}
            </button>
            
            <button
              type="button"
              onClick={handleSubscribeClick}
              className="px-6 py-2.5 bg-[#D9A9FF] hover:bg-[#B87CFF] text-black text-xs font-mono font-black rounded-xl shadow-lg transition-all uppercase flex items-center justify-center gap-2 hover:scale-105 w-1/2 sm:w-auto"
            >
              <CreditCard className="w-4 h-4 stroke-[2.5]" />
              <span>{isEs ? 'Unirme al Plan Mensual' : 'Join Monthly Plan'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
