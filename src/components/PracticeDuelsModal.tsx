import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Trophy, Flame, Zap, CheckCircle2, RefreshCw, Award, UserCheck } from 'lucide-react';
import { User } from '../types';

interface PracticeDuelsModalProps {
  currentUser: User;
  onClose: () => void;
  onAwardPoints: (points: number) => void;
}

export function PracticeDuelsModal({ currentUser, onClose, onAwardPoints }: PracticeDuelsModalProps) {
  const [rivalName, setRivalName] = useState('Miyu Tokyo (Rival IA)');
  const [rivalMinutes, setRivalMinutes] = useState(45);
  const [userMinutes, setUserMinutes] = useState(60);
  const [isFighting, setIsFighting] = useState(false);
  const [duelResult, setDuelResult] = useState<'win' | 'loss' | 'tie' | null>(null);

  const rivalsList = [
    { name: 'Miyu Tokyo (Rival IA)', minutes: 45, avatar: '👑' },
    { name: 'Princess Lockeroo (Rival IA)', minutes: 75, avatar: '🔥' },
    { name: 'Caleaf Sellers (Rival IA)', minutes: 50, avatar: '⚡' },
    { name: 'E-Joe Jr (Rival IA)', minutes: 60, avatar: '🦾' }
  ];

  const handleStartDuel = () => {
    setIsFighting(true);
    setDuelResult(null);

    setTimeout(() => {
      setIsFighting(false);
      if (userMinutes > rivalMinutes) {
        setDuelResult('win');
        onAwardPoints(100);
      } else if (userMinutes < rivalMinutes) {
        setDuelResult('loss');
        onAwardPoints(20);
      } else {
        setDuelResult('tie');
        onAwardPoints(50);
      }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-gradient-to-br from-[#1c1b1b] via-[#141414] to-[#1c1b1b] border-2 border-[#D9A9FF] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-[0_0_60px_rgba(217, 169, 255,0.3)] text-center relative z-10 space-y-6"
      >
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D9A9FF]/20 text-[#D9A9FF] text-xs font-mono font-bold uppercase border border-[#D9A9FF]/40">
            <Swords className="w-4 h-4 animate-pulse" /> Duelos de Práctica Diaria (Waack Battle)
          </div>
          <h2 className="text-2xl font-black text-white font-serif tracking-tight">
            Compara tu Entrenamiento
          </h2>
          <p className="text-xs text-slate-400">
            Desafía a rivales de la comunidad y pon a prueba tus minutos de dedicación somática de hoy.
          </p>
        </div>

        {/* Rival Selector */}
        {!duelResult && !isFighting && (
          <div className="space-y-5 text-left">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 font-bold mb-2">
                1. Selecciona a tu Oponente:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {rivalsList.map((r) => (
                  <button
                    key={r.name}
                    type="button"
                    onClick={() => {
                      setRivalName(r.name);
                      setRivalMinutes(r.minutes);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                      rivalName === r.name
                        ? 'border-[#D9A9FF] bg-[#D9A9FF]/15 text-white font-bold shadow-md'
                        : 'border-white/10 bg-[#121212] text-slate-400 hover:border-white/30'
                    }`}
                  >
                    <span className="text-2xl">{r.avatar}</span>
                    <div>
                      <p className="text-xs font-bold text-white line-clamp-1">{r.name}</p>
                      <p className="text-[10px] font-mono text-[#D9A9FF]">Meta: {r.minutes} min hoy</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#101010] p-4 rounded-2xl border border-white/10">
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">Tus Minutos de Hoy:</label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={userMinutes}
                  onChange={(e) => setUserMinutes(Number(e.target.value))}
                  className="w-full bg-[#1c1b1b] border border-white/20 rounded-xl p-2.5 text-white font-mono text-center font-bold focus:outline-none focus:border-[#D9A9FF]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">Minutos del Rival ({(rivalName || 'Rival').split(' ')[0]}):</label>
                <div className="w-full bg-[#1c1b1b] border border-white/10 rounded-xl p-2.5 text-[#D9A9FF] font-mono text-center font-bold flex items-center justify-center">
                  {rivalMinutes} min
                </div>
              </div>
            </div>

            <button
              onClick={handleStartDuel}
              className="w-full py-4 bg-gradient-to-r from-[#D9A9FF] to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(217, 169, 255,0.4)] transition-all uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2"
            >
              <Swords className="w-4 h-4" /> Iniciar Duelo de Práctica ⚡
            </button>
          </div>
        )}

        {/* Fighting State */}
        {isFighting && (
          <div className="py-16 flex flex-col items-center justify-center space-y-6">
            <div className="relative w-20 h-20 rounded-full bg-[#D9A9FF]/20 border-2 border-[#D9A9FF] flex items-center justify-center animate-spin">
              <Swords className="w-10 h-10 text-[#D9A9FF]" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-serif font-bold text-white">Comparando registros de entrenamiento...</p>
              <p className="text-xs font-mono text-[#D9A9FF] animate-pulse">Analizando velocidad de brazos, consistencia y minutos con {rivalName}...</p>
            </div>
          </div>
        )}

        {/* Result & Celebration Animation */}
        {duelResult && !isFighting && (
          <div className="space-y-6 py-4">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#D9A9FF] to-amber-700 flex items-center justify-center shadow-2xl border-4 border-[#141414]">
                <Trophy className="w-12 h-12 text-black" />
              </div>
            </motion.div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono uppercase font-bold bg-[#D9A9FF]/20 text-[#D9A9FF] border border-[#D9A9FF]/30">
                {duelResult === 'win' ? '🎉 ¡Victoria Rotunda!' : duelResult === 'loss' ? '💪 ¡Buen Combate!' : '🤝 ¡Empate Técnico!'}
              </span>
              <h3 className="text-2xl font-black text-white font-serif">
                {duelResult === 'win'
                  ? '¡Has superado a tu oponente en la pista!'
                  : duelResult === 'loss'
                  ? 'Tu rival entrenó un poco más hoy. ¡A por la revancha!'
                  : '¡Misma dedicación exacta en el cronómetro!'}
              </h3>
              <p className="text-xs text-slate-300">
                Tú: <strong className="text-white">{userMinutes} min</strong> vs {rivalName}: <strong className="text-white">{rivalMinutes} min</strong>
              </p>
            </div>

            <div className="bg-black/50 border border-white/10 rounded-2xl p-4 flex items-center justify-around">
              <div>
                <p className="text-[10px] font-mono text-slate-400 uppercase">Recompensa</p>
                <p className="text-xl font-black text-[#D9A9FF]">+{duelResult === 'win' ? 100 : duelResult === 'tie' ? 50 : 20} XP</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <p className="text-[10px] font-mono text-slate-400 uppercase">Racha de Duelos</p>
                <p className="text-xl font-black text-emerald-400">🔥 Activa</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDuelResult(null)}
                className="flex-1 py-3 bg-[#262626] hover:bg-[#333] text-white font-bold text-xs rounded-xl transition-all uppercase tracking-wider cursor-pointer"
              >
                Nuevo Duelo
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-[#D9A9FF] hover:bg-[#B87CFF] text-black font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(217, 169, 255,0.4)] transition-all uppercase tracking-wider cursor-pointer"
              >
                Cerrar y Celebrar
              </button>
            </div>
          </div>
        )}

        {!duelResult && !isFighting && (
          <div className="pt-2">
            <button
              onClick={onClose}
              className="text-xs font-mono text-slate-400 hover:text-white underline cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
