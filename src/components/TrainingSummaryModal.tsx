import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Clock,
  Zap,
  Sparkles,
  Share2,
  CheckCircle2,
  X,
  Flame,
  Dumbbell,
  Award,
  Copy,
  RotateCcw,
  CloudUpload,
  Activity,
  Loader2,
  Check
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';

export interface TrainingSessionSummary {
  durationSeconds: number;
  activityType: string;
  pointsEarned: number;
  details?: string;
  category?: 'drill' | 'drama' | 'battle' | 'fisico' | 'general' | 'combo' | 'sensorial' | 'playlist';
  bpm?: number;
}

interface TrainingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: TrainingSessionSummary | null;
  onShare?: () => void;
  onSaveToFirestore?: (summary: TrainingSessionSummary) => void;
  currentUserId?: string;
}

export const TrainingSummaryModal: React.FC<TrainingSummaryModalProps> = ({
  isOpen,
  onClose,
  summary,
  onShare,
  onSaveToFirestore,
  currentUserId
}) => {
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedToFirestore, setSavedToFirestore] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!isOpen || !summary) return null;

  // Format seconds to mm:ss or text
  const formatDuration = (secs: number) => {
    if (secs < 60) {
      return `${secs} seg`;
    }
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    if (remSecs === 0) {
      return `${mins} min${mins > 1 ? 's' : ''}`;
    }
    return `${mins}m ${remSecs}s`;
  };

  const getCategoryIcon = () => {
    switch (summary.category) {
      case 'drill':
        return <Zap className="w-5 h-5 text-[#E9C349]" />;
      case 'drama':
        return <Sparkles className="w-5 h-5 text-[#E9C349]" />;
      case 'battle':
        return <Trophy className="w-5 h-5 text-[#E9C349]" />;
      case 'fisico':
        return <Dumbbell className="w-5 h-5 text-[#E9C349]" />;
      default:
        return <Flame className="w-5 h-5 text-[#E9C349]" />;
    }
  };

  const handleCopyShare = () => {
    const text = `🔥 ¡Acabo de completar un entrenamiento de Waacking en WAACK ON!\n⏱️ Duración: ${formatDuration(summary.durationSeconds)}\n⚡ Tempo: ${summary.bpm || 120} BPM\n🎯 Actividad: ${summary.activityType}\n🏆 Puntos Ganados: +${summary.pointsEarned} PTS`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    if (onShare) onShare();
  };

  const handleSaveFirestore = async () => {
    if (!summary || isSaving || savedToFirestore) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      const activeUid = auth.currentUser?.uid || currentUserId || 'anonymous';
      const logId = `log-${Date.now()}`;
      const minutes = Math.max(1, Math.ceil(summary.durationSeconds / 60));
      const dateStr = new Date().toISOString().split('T')[0];

      const logData = {
        id: logId,
        date: dateStr,
        minutes,
        durationSeconds: summary.durationSeconds,
        activityType: summary.category || 'drill',
        description: `${summary.activityType} • ${summary.details || 'Práctica realizada'}`,
        category: summary.category || 'drill',
        bpm: summary.bpm || 120,
        pointsEarned: summary.pointsEarned || 0,
        createdAt: new Date().toISOString()
      };

      if (activeUid) {
        await setDoc(doc(db, 'users', activeUid, 'practice_logs', logId), logData).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}/practice_logs/${logId}`);
        });
      }

      if (onSaveToFirestore) {
        onSaveToFirestore(summary);
      }

      setSavedToFirestore(true);
    } catch (err: any) {
      console.error("Error al guardar log en Firestore:", err);
      setSaveError("No se pudo guardar en Firestore. Revisa tu conexión.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        {/* Modal Backdrop overlay click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-md bg-[#121216] border border-[#E9C349]/50 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-[#E9C349]/10 text-white overflow-hidden"
        >
          {/* Glowing Top Ambient Effect */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-br from-[#E9C349]/30 via-[#9A2B3C]/20 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/15 transition-all"
            aria-label="Cerrar modal de resumen"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Trophy Header Icon */}
          <div className="flex flex-col items-center text-center space-y-3 pt-2">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#9A2B3C] via-[#E9C349]/40 to-[#E9C349] p-0.5 shadow-xl flex items-center justify-center animate-pulse">
                <div className="w-full h-full rounded-[14px] bg-[#0d0d12] flex items-center justify-center text-[#E9C349]">
                  <Trophy className="w-10 h-10 text-[#E9C349]" />
                </div>
              </div>
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-[#E9C349] text-slate-950 font-mono font-black text-[10px] uppercase shadow-lg">
                ¡ÉXITO!
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-white">
                RESUMEN DE ENTRENAMIENTO
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                ¡Gran sesión de práctica! Has completado tu objetivo rítmico.
              </p>
            </div>
          </div>

          {/* Key Summary Cards Grid */}
          <div className="mt-6 space-y-3">
            {/* 1. Activity Type */}
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl flex items-center gap-3.5 shadow-inner">
              <div className="p-2.5 rounded-xl bg-[#E9C349]/15 border border-[#E9C349]/30 shrink-0">
                {getCategoryIcon()}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide block">
                  TIPO DE ACTIVIDAD
                </span>
                <p className="text-sm font-bold text-white truncate">
                  {summary.activityType}
                </p>
              </div>
            </div>

            {/* 2. Grid for Duration, BPM & Points Earned */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Duration */}
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center gap-1 text-slate-400 mb-1">
                  <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wide">
                    TIEMPO
                  </span>
                </div>
                <p className="text-base font-black text-white font-mono">
                  {formatDuration(summary.durationSeconds)}
                </p>
              </div>

              {/* BPM */}
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center gap-1 text-slate-400 mb-1">
                  <Activity className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-pulse" />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wide">
                    RITMO
                  </span>
                </div>
                <p className="text-base font-black text-rose-300 font-mono">
                  {summary.bpm ? `${summary.bpm} BPM` : '120 BPM'}
                </p>
              </div>

              {/* Points Earned */}
              <div className="bg-[#E9C349]/10 border border-[#E9C349]/40 p-3 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center gap-1 text-[#E9C349] mb-1">
                  <Award className="w-3.5 h-3.5 text-[#E9C349] shrink-0" />
                  <span className="text-[9px] font-mono font-black uppercase tracking-wide">
                    PUNTOS
                  </span>
                </div>
                <p className="text-base font-black text-[#E9C349] font-mono">
                  +{summary.pointsEarned} <span className="text-[10px]">PTS</span>
                </p>
              </div>
            </div>

            {/* Optional Details or Notes */}
            {summary.details && (
              <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-start gap-2 text-xs text-slate-300">
                <Sparkles className="w-4 h-4 text-[#E9C349] shrink-0 mt-0.5" />
                <p className="leading-relaxed">{summary.details}</p>
              </div>
            )}
          </div>

          {/* Firestore Save Action Box */}
          <div className="mt-5 space-y-2">
            {savedToFirestore ? (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full py-3.5 px-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="uppercase tracking-wide font-mono">¡Registro Guardado en Firestore! 🔥</span>
              </motion.div>
            ) : (
              <button
                type="button"
                onClick={handleSaveFirestore}
                disabled={isSaving}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 border border-emerald-400/30 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Guardando en Firestore...</span>
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-4.5 h-4.5 text-white" />
                    <span>Guardar Registro en Firestore</span>
                  </>
                )}
              </button>
            )}

            {saveError && (
              <p className="text-[11px] text-rose-400 font-mono text-center">{saveError}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={handleCopyShare}
              className="w-full sm:w-auto px-4 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
              title="Copiar resumen al portapapeles"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#E9C349]" />
                  <span>Compartir</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-full flex-1 py-3 bg-gradient-to-r from-[#E9C349] via-amber-400 to-[#E9C349] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#E9C349]/20 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Continuar Entrenando</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
