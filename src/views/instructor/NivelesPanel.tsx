import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Flame, Trophy, Radio, Check } from 'lucide-react';

interface Level {
  id: string;
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge?: string;
}

const LEVELS: Level[] = [
  { id: 'novato', name: 'Novato', desc: 'Primeros pasos: arm whips, poses y conteo.', icon: Sparkles, color: '#7C8FF7' },
  { id: 'intermedio', name: 'Intermedio', desc: 'Técnica fusionada y musicalidad.', icon: Flame, color: '#E4B94D', badge: 'Popular' },
  { id: 'avanzado', name: 'Avanzado', desc: 'Freestyle, storytelling y battles.', icon: Trophy, color: '#E5177A' },
  { id: 'profesional', name: 'Profesional', desc: 'Docencia, jurado y escena.', icon: Radio, color: '#8B66D8' },
];

const QUIZ = [
  '¿Dominas los arm whips básicos sin perder el conteo?',
  '¿Sostienes poses y frenos limpios en 8 tiempos?',
  '¿Has bailado en battles o showcases?',
];

type Step = 'pick' | 'quiz' | 'result';

interface NivelesPanelProps {
  studentName?: string;
  onFinish?: (levelId: string) => void;
}

export default function NivelesPanel({ studentName = 'Alumna', onFinish }: NivelesPanelProps) {
  const [step, setStep] = useState<Step>('pick');
  const [picked, setPicked] = useState<string | null>(null);
  const [qi, setQi] = useState(0);
  const [yesCount, setYesCount] = useState(0);
  const [resultLevel, setResultLevel] = useState<Level | null>(null);

  const stepN = step === 'pick' ? 1 : step === 'quiz' ? 2 : 3;

  const answer = (yes: boolean) => {
    const nextYes = yes ? yesCount + 1 : yesCount;
    if (qi < QUIZ.length - 1) {
      setYesCount(nextYes);
      setQi(qi + 1);
    } else {
      const lvl = LEVELS[Math.min(nextYes, LEVELS.length - 1)];
      setResultLevel(lvl);
      setStep('result');
    }
  };

  const confirmPicked = () => {
    const lvl = LEVELS.find(l => l.id === picked) || null;
    setResultLevel(lvl);
    setStep('result');
  };

  const reset = () => { setStep('pick'); setPicked(null); setQi(0); setYesCount(0); setResultLevel(null); };

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div className="flex items-center gap-2">
        {[1, 2, 3].map(n => (
          <span key={n} className={`h-1.5 w-8 rounded-full transition-colors ${n <= stepN ? 'bg-[#E9C349]' : 'bg-white/10'}`} />
        ))}
        <span className="font-mono text-[10px] text-slate-400 ml-2">PASO {stepN} DE 3</span>
      </div>

      <AnimatePresence mode="wait">
        {step === 'pick' && (
          <motion.div key="pick" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-4">
            <div>
              <h3 className="text-xl font-black text-white">Hola, {studentName} · ¿cuál es tu nivel?</h3>
              <p className="text-xs text-slate-400 mt-1">Elige el que más se acerque, o haz el quiz rápido de 3 preguntas.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {LEVELS.map(l => {
                const Icon = l.icon;
                const isOn = picked === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => setPicked(l.id)}
                    className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${isOn ? 'border-[#E9C349] bg-[#E9C349]/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                  >
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${l.color}22`, color: l.color }}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="flex-1">
                      <span className="flex items-center gap-2 font-bold text-sm text-white">
                        {l.name}
                        {l.badge && <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-[#E9C349]/20 text-[#E9C349]">{l.badge}</span>}
                      </span>
                      <span className="text-[11px] text-slate-400">{l.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                disabled={!picked}
                onClick={confirmPicked}
                className="px-5 py-2.5 rounded-xl bg-[#E9C349] text-black font-black text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
              <button
                onClick={() => { setPicked(null); setStep('quiz'); }}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-xs"
              >
                No estoy segura · hacer el quiz
              </button>
            </div>
          </motion.div>
        )}

        {step === 'quiz' && (
          <motion.div key="quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-4">
            <div className="font-mono text-[10px] text-[#E9C349]">PREGUNTA {qi + 1} / {QUIZ.length}</div>
            <h3 className="text-lg font-black text-white max-w-md">{QUIZ[qi]}</h3>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <button onClick={() => answer(true)} className="py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-[#E9C349]/15 hover:border-[#E9C349]/40 font-bold text-sm text-white">Sí</button>
              <button onClick={() => answer(false)} className="py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 font-bold text-sm text-white">Todavía no</button>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 max-w-sm overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(qi / QUIZ.length) * 100}%` }}
                transition={{ duration: 0.4 }}
                className="h-full bg-[#E9C349] rounded-full"
              />
            </div>
          </motion.div>
        )}

        {step === 'result' && resultLevel && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{picked ? 'Tu nivel' : 'Según tus respuestas'}</div>
            <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/5">
              <span className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${resultLevel.color}22`, color: resultLevel.color }}>
                <resultLevel.icon className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-xl font-black text-white">{resultLevel.name}</h3>
                <p className="text-xs text-slate-400">{resultLevel.desc}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Ya tenemos 3 clases recomendadas para tu nivel y el próximo evento cerca de ti en tu inicio.
            </p>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => onFinish?.(resultLevel.id)}
                className="px-5 py-2.5 rounded-xl bg-[#E9C349] text-black font-black text-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Ir a mi inicio
              </button>
              <button onClick={reset} className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-xs">
                Volver a elegir
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
