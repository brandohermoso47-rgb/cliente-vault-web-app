import React from 'react';
import { Camera, Sparkles, Trophy, Play } from 'lucide-react';

export interface DramaLabProps {
  language: string;
  activeStimulusIndex: number;
  setActiveStimulusIndex: (idx: number) => void;
  isDramaPracticing: boolean;
  setIsDramaPracticing: (p: boolean) => void;
  dramaTimer: number;
  setDramaTimer: (t: number) => void;
  dramaPointsAwarded: boolean;
  setDramaPointsAwarded: (p: boolean) => void;
  onAddBonusPoints?: (pts: number) => void;
  onLogPractice?: (cnt: number, type: string, note: string) => void;
  currentUser?: any;
  bpm?: number;
}

const VISUAL_STIMULI = [
  {
    id: 'drama-1',
    title: 'Hollywood Siren',
    pose: 'Mirada rasgada sobre el hombro, labios entreabiertos, actitud misteriosa y magnética.',
    color: 'from-amber-500/20 to-red-600/20',
    border: 'border-amber-500/30'
  },
  {
    id: 'drama-2',
    title: 'Disco Fury',
    pose: 'Mentón elevado, ojos desorbitados de energía, sonrisa feroz de alta intensidad.',
    color: 'from-purple-500/20 to-pink-600/20',
    border: 'border-purple-500/30'
  },
  {
    id: 'drama-3',
    title: 'Majestic Pride',
    pose: 'Cuello alargado al máximo, rostro impasible de alta costura, cejas ligeramente arqueadas.',
    color: 'from-cyan-500/20 to-blue-600/20',
    border: 'border-cyan-500/30'
  }
];

const DramaLabComponent: React.FC<DramaLabProps> = ({
  language,
  activeStimulusIndex,
  setActiveStimulusIndex,
  isDramaPracticing,
  setIsDramaPracticing,
  dramaTimer,
  setDramaTimer,
  dramaPointsAwarded,
  setDramaPointsAwarded,
  onAddBonusPoints,
  onLogPractice,
  bpm = 120
}) => {
  const currentStimulus = VISUAL_STIMULI[activeStimulusIndex] || VISUAL_STIMULI[0];

  const handleStartDrama = () => {
    setIsDramaPracticing(true);
    setDramaTimer(45);
    setDramaPointsAwarded(false);
  };

  return (
    <div className="w-full flex flex-col space-y-6 sm:space-y-8">
      <div className="glass-panel deep-blue-depth rounded-[24px] p-8 text-[#EDEFF4] relative overflow-hidden">
        <div className="absolute inset-0 scanline pointer-events-none opacity-20"></div>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-tertiary/10 pb-6 mb-6 gap-4 relative z-10">
          <div>
            <span className="font-label-sm text-[#D9A9FF] bg-[#D9A9FF]/10 border border-[#D9A9FF]/20 px-3 py-1 rounded-xl uppercase tracking-wider">
              {language === 'es' ? 'TEATRALIDAD, EXPRESIÓN Y CONTROL FACIAL' : 'THEATRICALITY, EXPRESSION & FACIAL CONTROL'}
            </span>
            <h3 className="text-2xl font-display-lg italic tracking-tight uppercase mt-3 text-[#EDEFF4]">
              🎭 {language === 'es' ? 'Laboratorio de Expresión Facial' : 'Facial Expression Laboratory'}
            </h3>
            <p className="text-xs text-on-surface-variant font-semibold mt-1 max-w-xl leading-relaxed">
              {language === 'es'
                ? 'El Waacking no es solo mover los brazos de prisa; es el drama que transmites con tus ojos, tu mentón y tu actitud.'
                : 'Waacking is not just about moving your arms fast; it is the drama you transmit with your eyes, chin, and attitude.'}
            </p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-xl text-center shrink-0 min-w-[140px]">
            <div className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">
              {language === 'es' ? 'RECOMPENSA FACIAL' : 'FACIAL REWARD'}
            </div>
            <div className="text-sm font-bold text-white mt-1">+30 Pts / 45s</div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
          {/* Left - Stimulus Selector */}
          <div className="md:col-span-7 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase text-tertiary tracking-widest border-b border-tertiary/10 pb-2">
              📸 {language === 'es' ? 'Selecciona un Estímulo Visual:' : 'Select a Visual Stimulus:'}
            </h4>

            <div className="grid grid-cols-1 gap-3">
              {VISUAL_STIMULI.map((stim, idx) => (
                <div
                  key={stim.id}
                  onClick={() => {
                    setActiveStimulusIndex(idx);
                    setIsDramaPracticing(false);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
                    activeStimulusIndex === idx
                      ? 'bg-purple-500/10 border-purple-500/50 text-white shadow-lg'
                      : 'bg-black/30 border-[#262626] text-on-surface-variant hover:border-white/20'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-black/40 border border-white/10 shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-white uppercase tracking-wider">{stim.title}</h5>
                    <p className="text-[10px] text-[#8A8A8A] mt-1 leading-relaxed">{stim.pose}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Practice Mirror / Camera */}
          <div 
            className={`md:col-span-5 bg-[#0D0D11] border rounded-2xl p-5 flex flex-col justify-between space-y-5 shadow-lg relative overflow-hidden transition-all duration-300 ${
              isDramaPracticing 
                ? 'animate-bpm-pulse border-purple-400/90 shadow-[0_0_35px_rgba(168,85,247,0.35)]' 
                : 'border-tertiary/10'
            }`}
            style={{ '--bpm-pulse-duration': `${(60 / (bpm || 120)).toFixed(3)}s` } as React.CSSProperties}
          >
            {/* Subtle Pulse Ring Overlay */}
            {isDramaPracticing && (
              <div 
                className="absolute inset-0 pointer-events-none rounded-2xl border-2 border-purple-400/40 animate-bpm-ring z-10"
                style={{ '--bpm-pulse-duration': `${(60 / (bpm || 120)).toFixed(3)}s` } as React.CSSProperties}
              />
            )}

            <div className="text-center space-y-3 relative z-20">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 mx-auto flex items-center justify-center">
                <Camera className="w-8 h-8 text-purple-400" />
              </div>
              <h5 className="text-xs font-mono font-bold text-white uppercase">{currentStimulus.title}</h5>
              <p className="text-[10px] text-[#8A8A8A] italic leading-relaxed px-2">{currentStimulus.pose}</p>
            </div>

            {isDramaPracticing ? (
              <div className="space-y-4 text-center bg-black/40 border border-purple-500/20 p-4 rounded-xl relative z-20">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                  <span className="text-[10px] font-mono font-bold text-purple-300">PULSO DE RITMO: {bpm || 120} BPM</span>
                </div>
                <div className="text-4xl font-mono font-bold text-purple-400 animate-pulse">{dramaTimer}s</div>
                <p className="text-[10px] text-on-surface-variant uppercase font-mono font-bold">
                  {language === 'es' ? '¡MANTÉN LA ACTITUD Y MIRADA EN CÁMARA AL RITMO!' : 'KEEP THE ATTITUDE & LOOK AT CAMERA TO THE BEAT!'}
                </p>
                {dramaPointsAwarded && (
                  <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-2 rounded text-[10px] font-mono font-bold">
                    ✅ +30 PUNTOS REGISTRADOS
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleStartDrama}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-display-lg font-bold py-3.5 rounded-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 shadow-md relative z-20 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                {language === 'es' ? 'INICIAR PRÁCTICA FACIAL (45s)' : 'START FACIAL PRACTICE (45s)'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const DramaLab = React.memo(DramaLabComponent);
export default DramaLab;
