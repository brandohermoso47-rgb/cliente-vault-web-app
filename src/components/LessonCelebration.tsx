import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, CheckCircle2, Star } from 'lucide-react';
import { Lesson, User } from '../types';

interface LessonCelebrationProps {
  lesson: Lesson | null;
  currentUser: User;
  onClose: () => void;
}

export function LessonCelebration({ lesson, currentUser, onClose }: LessonCelebrationProps) {
  if (!lesson) return null;

  const points = lesson.level === 1 ? 50 : 80;

  // Generate random floating particles for confetti/sparkles
  const particles = Array.from({ length: 30 });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      {/* Floating Sparkles & Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((_, i) => {
          const randomX = Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000);
          const randomDelay = Math.random() * 0.4;
          const randomDuration = 1.2 + Math.random() * 1.8;
          const size = 6 + Math.random() * 14;
          const color = ['#D9A9FF', '#FFB3B2', '#B3C5FF', '#E9B8FF', '#FFA07A', '#10B981'][i % 6];

          return (
            <motion.div
              key={i}
              initial={{ x: randomX, y: -20, opacity: 1, scale: 0, rotate: 0 }}
              animate={{
                y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 50,
                opacity: [1, 1, 0],
                scale: [0.5, 1.4, 0.8],
                rotate: 360 * (i % 2 === 0 ? 1 : -1)
              }}
              transition={{
                duration: randomDuration,
                delay: randomDelay,
                ease: 'easeOut'
              }}
              style={{
                position: 'absolute',
                width: size,
                height: size,
                backgroundColor: color,
                borderRadius: i % 3 === 0 ? '50%' : '3px',
                boxShadow: `0 0 12px ${color}`
              }}
            />
          );
        })}
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 30 }}
        className="bg-gradient-to-br from-[#1c1b1b] via-[#141414] to-[#1c1b1b] border-2 border-[#D9A9FF] rounded-3xl p-8 max-w-md w-full shadow-[0_0_60px_rgba(217, 169, 255,0.35)] text-center relative z-10 space-y-6"
      >
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-[#D9A9FF] to-amber-700 flex items-center justify-center shadow-2xl border-4 border-[#141414]">
          <Trophy className="w-12 h-12 text-black" />
        </div>

        <div className="pt-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D9A9FF]/20 text-[#D9A9FF] text-xs font-mono font-bold uppercase border border-[#D9A9FF]/40">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> ¡Lección Completada!
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight line-clamp-2">
            {lesson.title}
          </h3>
          <p className="text-xs text-slate-400">
            {lesson.category} • {lesson.duration}
          </p>
        </div>

        <div className="bg-black/50 border border-white/10 rounded-2xl p-4 flex items-center justify-around">
          <div>
            <p className="text-[10px] font-mono text-slate-400 uppercase">Puntos Ganados</p>
            <p className="text-xl font-black text-[#D9A9FF]">+{points} XP</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <p className="text-[10px] font-mono text-slate-400 uppercase">Progreso Total</p>
            <p className="text-xl font-black text-emerald-400">{(currentUser.completedLessons || []).length} Clases</p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-gradient-to-r from-[#D9A9FF] to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(217, 169, 255,0.4)] transition-all uppercase tracking-wider cursor-pointer"
          >
            ¡Excelente, Continuar Entrenando! 💃
          </button>
        </div>
      </motion.div>
    </div>
  );
}
