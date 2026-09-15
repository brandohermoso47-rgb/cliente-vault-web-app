import React from 'react';
import { Shuffle, Play } from 'lucide-react';
import { Language } from '../../lib/translations';

export interface CombosLabProps {
  language: Language;
  comboPracticeActive: boolean;
  setComboPracticeActive: (active: boolean) => void;
  comboArms: string;
  comboBody: string;
  comboFeet: string;
  comboAttitude: string;
  currentComboArms: string[];
  currentComboBody: string[];
  currentComboFeet: string[];
  currentComboAttitude: string[];
  comboArmsIdx: number;
  setComboArmsIdx: (idx: number) => void;
  comboBodyIdx: number;
  setComboBodyIdx: (idx: number) => void;
  comboFeetIdx: number;
  setComboFeetIdx: (idx: number) => void;
  comboAttitudeIdx: number;
  setComboAttitudeIdx: (idx: number) => void;
  generateRandomCombo: () => void;
  comboPracticeBpm: number;
  setComboPracticeBpm: (bpm: number) => void;
  comboTimeLeft: number;
  setComboTimeLeft: (time: number) => void;
  comboBeatCount: number;
  comboFlash: boolean;
  playSynthBeep: (freq: number, dur: number) => void;
}

const CombosLabComponent: React.FC<CombosLabProps> = ({
  language,
  comboPracticeActive,
  setComboPracticeActive,
  comboArms,
  comboBody,
  comboFeet,
  comboAttitude,
  currentComboArms,
  currentComboBody,
  currentComboFeet,
  currentComboAttitude,
  comboArmsIdx,
  setComboArmsIdx,
  comboBodyIdx,
  setComboBodyIdx,
  comboFeetIdx,
  setComboFeetIdx,
  comboAttitudeIdx,
  setComboAttitudeIdx,
  generateRandomCombo,
  comboPracticeBpm,
  setComboPracticeBpm,
  comboTimeLeft,
  setComboTimeLeft,
  comboBeatCount,
  comboFlash,
  playSynthBeep
}) => {
  return (
    <div className="w-full flex flex-col space-y-6 sm:space-y-8">
      <div className="glass-panel deep-blue-depth rounded-[24px] p-8 text-[#EDEFF4] relative overflow-hidden">
        <div className="absolute inset-0 scanline pointer-events-none opacity-20"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-tertiary/10 pb-6 mb-6 gap-4 relative z-10">
          <div>
            <span className="font-label-sm text-[#d9a9ff] bg-[#d9a9ff]/10 border border-[#d9a9ff]/20 px-3 py-1 rounded-xl uppercase tracking-wider">
              DRAFT DE COREOGRAFÍA
            </span>
            <h3 className="text-2xl font-display-lg italic tracking-tight uppercase mt-3 text-[#EDEFF4]">
              🔀 Generador de Combinaciones Waack
            </h3>
            <p className="text-xs text-on-surface-variant font-semibold mt-1">
              Crea y practica combinaciones únicas mezclando técnica de brazos, disociaciones corporales, traslados y actitud.
            </p>
          </div>
          <div className="bg-[#C23E9E]/10 border border-[#C23E9E]/20 p-3 rounded-xl text-center shrink-0 min-w-[140px]">
            <div className="text-[10px] font-mono text-[#ffb3b2] uppercase tracking-widest font-bold">Práctica Diaria</div>
            <div className="text-md font-bold text-white mt-0.5">+50 Pts / Combo</div>
          </div>
        </div>

        {!comboPracticeActive ? (
          <div className="space-y-6 relative z-10">
            {/* The Slots Board */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Slot Arms */}
              <div className="bg-[#121212] border border-[#262626] p-4 rounded-2xl flex flex-col justify-between min-h-[140px] hover:border-tertiary/20 transition-all shadow-md">
                <div>
                  <span className="text-[9px] font-mono text-tertiary bg-tertiary/10 border border-tertiary/20 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                    🙆‍♀️ {language === 'es' ? 'Movimiento de Brazos' : 'Arm Movement'}
                  </span>
                  <p className="font-bold text-xs text-white mt-3.5 leading-relaxed">
                    {comboArms}
                  </p>
                </div>
                <div className="flex overflow-x-auto gap-1.5 pt-2 scrollbar-none">
                  {currentComboArms.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setComboArmsIdx(i);
                        playSynthBeep(700, 0.04);
                      }}
                      className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold border shrink-0 uppercase transition-colors ${
                        comboArmsIdx === i
                          ? 'bg-tertiary text-black border-tertiary'
                          : 'bg-black/30 text-on-surface-variant border-tertiary/5 hover:border-tertiary/20'
                      }`}
                    >
                      Var {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slot Body */}
              <div className="bg-[#121212] border border-[#262626] p-4 rounded-2xl flex flex-col justify-between min-h-[140px] hover:border-[#C23E9E]/30 transition-all shadow-md">
                <div>
                  <span className="text-[9px] font-mono text-[#ffb3b2] bg-[#C23E9E]/10 border border-[#C23E9E]/20 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                    💃 {language === 'es' ? 'Expresión Corporal' : 'Body Expression'}
                  </span>
                  <p className="font-bold text-xs text-white mt-3.5 leading-relaxed">
                    {comboBody}
                  </p>
                </div>
                <div className="flex overflow-x-auto gap-1.5 pt-2 scrollbar-none">
                  {currentComboBody.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setComboBodyIdx(i);
                        playSynthBeep(750, 0.04);
                      }}
                      className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold border shrink-0 uppercase transition-colors ${
                        comboBodyIdx === i
                          ? 'bg-[#C23E9E] text-white border-[#C23E9E]'
                          : 'bg-black/30 text-on-surface-variant border-tertiary/5 hover:border-[#C23E9E]/20'
                      }`}
                    >
                      Var {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slot Feet */}
              <div className="bg-[#121212] border border-[#262626] p-4 rounded-2xl flex flex-col justify-between min-h-[140px] hover:border-purple-500/20 transition-all shadow-md">
                <div>
                  <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                    👟 {language === 'es' ? 'Pasos y Niveles' : 'Footwork & Levels'}
                  </span>
                  <p className="font-bold text-xs text-white mt-3.5 leading-relaxed">
                    {comboFeet}
                  </p>
                </div>
                <div className="flex overflow-x-auto gap-1.5 pt-2 scrollbar-none">
                  {currentComboFeet.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setComboFeetIdx(i);
                        playSynthBeep(800, 0.04);
                      }}
                      className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold border shrink-0 uppercase transition-colors ${
                        comboFeetIdx === i
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-black/30 text-on-surface-variant border-tertiary/5 hover:border-purple-500/20'
                      }`}
                    >
                      Var {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slot Attitude */}
              <div className="bg-[#121212] border border-[#262626] p-4 rounded-2xl flex flex-col justify-between min-h-[140px] hover:border-orange-500/20 transition-all shadow-md">
                <div>
                  <span className="text-[9px] font-mono text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                    🎭 {language === 'es' ? 'Actitud y Pose' : 'Attitude & Pose'}
                  </span>
                  <p className="font-bold text-xs text-white mt-3.5 leading-relaxed">
                    {comboAttitude}
                  </p>
                </div>
                <div className="flex overflow-x-auto gap-1.5 pt-2 scrollbar-none">
                  {currentComboAttitude.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setComboAttitudeIdx(i);
                        playSynthBeep(850, 0.04);
                      }}
                      className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold border shrink-0 uppercase transition-colors ${
                        comboAttitudeIdx === i
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-black/30 text-on-surface-variant border-tertiary/5 hover:border-orange-500/20'
                      }`}
                    >
                      Var {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Trigger Random */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={generateRandomCombo}
                className="bg-transparent hover:bg-white/5 text-[#D9A9FF] border border-[#D9A9FF]/30 hover:border-[#D9A9FF] font-mono tracking-widest font-bold px-6 py-3.5 rounded-xl uppercase text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Shuffle className="w-4 h-4 text-tertiary" />
                🔀 GENERAR MEZCLA ALEATORIA
              </button>
            </div>

            {/* Settings and Practice Button */}
            <div className="bg-[#0D0D11] border border-tertiary/10 p-6 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">Velocidad del Metrónomo:</label>
                    <span className="text-sm font-mono font-bold text-tertiary">{comboPracticeBpm} BPM</span>
                  </div>
                  <input
                    type="range"
                    min="110"
                    max="145"
                    value={comboPracticeBpm}
                    onChange={(e) => setComboPracticeBpm(+e.target.value)}
                    className="w-full h-2 cursor-pointer"
                  />
                </div>
                <div className="flex gap-2 shrink-0 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setComboPracticeBpm(115);
                      playSynthBeep(600, 0.05);
                    }}
                    className="px-3 py-1.5 text-[9px] font-mono font-bold border border-tertiary/10 hover:border-tertiary/30 bg-black/40 rounded uppercase text-on-surface"
                  >
                    Lento (115)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setComboPracticeBpm(128);
                      playSynthBeep(700, 0.05);
                    }}
                    className="px-3 py-1.5 text-[9px] font-mono font-bold border border-tertiary/10 hover:border-tertiary/30 bg-black/40 rounded uppercase text-on-surface"
                  >
                    House (128)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setComboPracticeBpm(140);
                      playSynthBeep(800, 0.05);
                    }}
                    className="px-3 py-1.5 text-[9px] font-mono font-bold border border-tertiary/10 hover:border-tertiary/30 bg-black/40 rounded uppercase text-on-surface"
                  >
                    Hyper (140)
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setComboTimeLeft(60);
                  setComboPracticeActive(true);
                  playSynthBeep(1000, 0.15);
                }}
                className="w-full bg-[#D9A9FF] hover:bg-[#ffe088] text-black font-display-lg font-bold py-4 rounded-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95"
              >
                <Play className="w-4 h-4 text-[#C23E9E] fill-[#C23E9E]" />
                ⏱️ INICIAR DRILL DE PRÁCTICA DEL COMBO (60 Segundos)
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 relative z-10">
            {/* Practice Screen active */}
            <div className="bg-[#0D0D11] text-[#EDEFF4] rounded-2xl border border-tertiary/15 p-6 relative overflow-hidden flex flex-col justify-between space-y-6 text-center shadow-xl">
              <div className={`absolute inset-0 bg-tertiary opacity-5 transition-opacity duration-75 pointer-events-none ${
                comboFlash ? 'opacity-20' : 'opacity-0'
              }`} />

              <div className="flex justify-between items-center text-xs text-on-surface-variant border-b border-tertiary/10 pb-3">
                <div>
                  ⏱️ TIEMPO DE DRILL:{' '}
                  <strong className="text-tertiary font-mono">{comboTimeLeft}s</strong>
                </div>
                <div className="font-bold text-tertiary font-mono">
                  BPM DE ENTRENAMIENTO: {comboPracticeBpm}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono text-on-surface-variant tracking-wider uppercase mb-2">TIEMPO DEL COMPÁS DE 8</div>
                <div className="flex justify-center items-center gap-2 md:gap-3.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((beatNum) => (
                    <div
                      key={beatNum}
                      className={`w-9 h-9 md:w-11 md:h-11 rounded-full border flex items-center justify-center text-xs md:text-sm font-bold transition-all ${
                        comboBeatCount === beatNum
                          ? 'bg-tertiary text-black border-tertiary scale-110 shadow-lg'
                          : 'bg-black/40 border-tertiary/5 text-on-surface-variant'
                      }`}
                    >
                      {beatNum}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 bg-black/40 border border-tertiary/5 rounded-xl p-4 max-w-xl mx-auto text-left">
                <h4 className="text-[9px] font-mono font-bold text-tertiary uppercase tracking-widest border-b border-tertiary/10 pb-1 mb-2">GUÍA COMPLETA DEL COMBO:</h4>
                <div className="text-xs space-y-2.5 font-semibold text-[#EDEFF4]">
                  <div>🙌 <strong className="text-tertiary mr-1.5">BRAZOS:</strong> {comboArms}</div>
                  <div>💃 <strong className="text-[#ffb3b2] mr-1.5">CUERPO:</strong> {comboBody}</div>
                  <div>👟 <strong className="text-purple-400 mr-1.5">PASOS:</strong> {comboFeet}</div>
                  <div>🎭 <strong className="text-orange-400 mr-1.5">ACTITUD:</strong> {comboAttitude}</div>
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-4 border-t border-tertiary/10">
                <button
                  type="button"
                  onClick={() => {
                    setComboPracticeActive(false);
                    playSynthBeep(600, 0.08);
                  }}
                  className="bg-[#C23E9E] text-white hover:bg-[#8F2C7A] font-bold px-6 py-3 rounded-xl border border-[#C23E9E] text-xs transition-all uppercase tracking-wider shadow-md"
                >
                  ⏹️ DETENER PRÁCTICA
                </button>
                <button
                  type="button"
                  onClick={generateRandomCombo}
                  className="bg-transparent hover:bg-white/5 text-white font-bold px-6 py-3 rounded-xl border border-tertiary/20 hover:border-tertiary/40 text-xs transition-all uppercase tracking-wider"
                >
                  🔀 VARIAR ELEMENTOS
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const CombosLab = React.memo(CombosLabComponent);
