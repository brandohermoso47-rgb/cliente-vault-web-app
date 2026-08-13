import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Volume2, VolumeX, Flame, Radio, Sliders, BarChart2, Sparkles } from 'lucide-react';
import { DrillMetronomeEngine } from '../entrenamiento/DrillMetronomeEngine';
import MetronomeLabComponent from '../MetronomeLabComponent';
import { AudioSpectrumVisualizer } from '../entrenamiento/AudioSpectrumVisualizer';

export interface DrillLabProps {
  flashBeat: boolean;
  beatCount: number;
  currentPrompt: string;
  isDrillRunning: boolean;
  timeLeft: number;
  handleStartDrill: () => void;
  drillBpm: number;
  setDrillBpm: (bpm: number) => void;
  drillDuration: number;
  setDrillDuration: (duration: number) => void;
  setTimeLeft: (time: number) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  markingMode: 'beat' | 'voice' | 'both' | 'strong';
  setMarkingMode: (mode: 'beat' | 'voice' | 'both' | 'strong') => void;
}

const DrillLabComponent: React.FC<DrillLabProps> = ({
  flashBeat,
  beatCount,
  currentPrompt,
  isDrillRunning,
  timeLeft,
  handleStartDrill,
  drillBpm,
  setDrillBpm,
  drillDuration,
  setDrillDuration,
  setTimeLeft,
  soundEnabled,
  setSoundEnabled,
  markingMode,
  setMarkingMode
}) => {
  const [activeTab, setActiveTab] = useState<'drill' | 'engine' | 'tone_metronome' | 'spectrum'>('drill');

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Tab switch between Guided Drill, Standalone Metronome Engine, Tone Precision Metronome, and Audio Spectrum */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-[#120F22]/90 border border-white/15 p-2 rounded-2xl gap-2 backdrop-blur-xl shadow-xl">
        <button
          onClick={() => setActiveTab('drill')}
          className={`w-full sm:flex-1 py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-2 ${
            activeTab === 'drill'
              ? 'bg-tertiary text-black shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" /> Drill Guiado
        </button>
        <button
          onClick={() => setActiveTab('engine')}
          className={`w-full sm:flex-1 py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-2 ${
            activeTab === 'engine'
              ? 'bg-tertiary text-black shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Radio className="w-4 h-4" /> Metrónomo WebAudio
        </button>
        <button
          onClick={() => setActiveTab('tone_metronome')}
          className={`w-full sm:flex-1 py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-2 ${
            activeTab === 'tone_metronome'
              ? 'bg-tertiary text-black shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" /> Precision Metronome
        </button>
        <button
          id="tab-spectrum-drill-lab"
          onClick={() => setActiveTab('spectrum')}
          className={`w-full sm:flex-1 py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-2 ${
            activeTab === 'spectrum'
              ? 'bg-tertiary text-black shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart2 className="w-4 h-4" /> Espectro de Audio
        </button>
      </div>

      {activeTab === 'spectrum' ? (
        <AudioSpectrumVisualizer bpm={drillBpm} onBpmChange={(newBpm) => setDrillBpm(newBpm)} />
      ) : activeTab === 'tone_metronome' ? (
        <MetronomeLabComponent />
      ) : activeTab === 'engine' ? (
        <DrillMetronomeEngine 
          initialBpm={drillBpm} 
          onBpmChange={(newBpm) => setDrillBpm(newBpm)} 
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Interactive Widget - Left Column (7 cols) */}
          <div className="lg:col-span-7 glass-panel deep-blue-depth rounded-[24px] p-6 flex flex-col justify-between space-y-6 relative overflow-hidden shadow-xl text-[#EDEFF4]">
            <div className="absolute inset-0 scanline pointer-events-none opacity-20"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-sm text-tertiary bg-tertiary/10 border border-tertiary/20 px-3 py-1 rounded-xl uppercase tracking-wider">
                  ENTRENADOR DE RITMO
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse border border-green-400" />
                  <span className="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">
                    SINTETIZADOR ACTIVO
                  </span>
                </div>
              </div>
              <h3 className="text-2xl font-display-lg italic tracking-tight uppercase mt-3 text-[#EDEFF4]">
                EL BOTÓN DE DRILL
              </h3>
              <p className="text-xs text-on-surface-variant font-semibold mt-1 leading-relaxed">
                Configura tu tempo y duración. El widget emitirá clics rítmicos reales (con acento en el tiempo 1) y destellos visuales para guiar tus rolls, junto a estímulos que cambian cada 8 tiempos.
              </p>
            </div>

            {/* Dynamic instruction display */}
            <div className="p-6 bg-[#0D0D11] rounded-2xl border border-tertiary/15 relative flex flex-col items-center justify-center min-h-[160px] text-center overflow-hidden shadow-inner z-10">
              <AnimatePresence>
                {flashBeat && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.6 }}
                    animate={{ scale: 1.2, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    className={`absolute w-36 h-36 rounded-full border pointer-events-none ${
                      beatCount === 1 ? 'border-[#9A2B3C] bg-[#9A2B3C]/10' : 'border-[#E9C349] bg-[#E9C349]/10'
                    }`}
                  />
                )}
              </AnimatePresence>

              <h4 className="text-xs font-mono font-bold tracking-wider text-tertiary uppercase mb-2 bg-tertiary/10 border border-tertiary/20 px-2.5 py-0.5 rounded-lg inline-block">
                ORDEN ACTUAL:
              </h4>
              <p className="text-lg font-display-lg italic font-bold text-white tracking-wide uppercase whitespace-pre-line px-4 select-none min-h-[50px] flex items-center justify-center">
                {currentPrompt}
              </p>

              {isDrillRunning && (
                <motion.div
                  key={beatCount}
                  initial={{ scale: 0.7, opacity: 0.5 }}
                  animate={{ scale: [1, 1.25, 1], opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="my-3 flex items-center justify-center z-10"
                >
                  <span className="text-6xl font-display-lg font-bold text-tertiary bg-black/40 border border-tertiary/10 rounded-2xl w-24 h-24 flex items-center justify-center shadow-lg select-none">
                    {beatCount || 1}
                  </span>
                </motion.div>
              )}

              <div className="flex items-center justify-center flex-wrap gap-2 mt-4 z-10">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((b) => (
                  <div
                    key={b}
                    className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-mono transition-all duration-100 ${
                      beatCount === b
                        ? b === 1
                          ? 'bg-[#9A2B3C] border-[#9A2B3C] text-white scale-125 font-bold shadow-lg'
                          : 'bg-tertiary border-tertiary text-black scale-110 font-bold shadow-md'
                        : 'bg-black/30 border-tertiary/5 text-on-surface-variant font-bold'
                    }`}
                  >
                    {b}
                  </div>
                ))}
              </div>
            </div>

            {/* Action runner button */}
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-on-surface-variant">
                <span className="flex items-center gap-1.5 uppercase">
                  <Clock className="w-4 h-4 text-tertiary" /> TIEMPO RESTANTE:
                </span>
                <span className="text-tertiary font-bold font-mono text-sm border border-tertiary/10 bg-black/40 px-3 py-1 rounded-lg shadow-inner">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>

              <button
                id="action-drill-trigger"
                onClick={handleStartDrill}
                style={{ backgroundColor: '#513c11' }}
                className={`w-full py-4 rounded-xl font-display-lg font-bold text-xs tracking-widest transition-all uppercase shadow-lg active:scale-95 text-amber-100 border border-[#513c11]/80 hover:brightness-125`}
              >
                {isDrillRunning ? '■ PAUSAR ENTRENAMIENTO' : '▶ DALE PLAY AL DRILL'}
              </button>
            </div>
          </div>

          {/* Drill settings - Right Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="glass-panel deep-blue-depth rounded-[24px] p-6 text-[#EDEFF4] flex flex-col justify-between space-y-4 flex-1 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 scanline pointer-events-none opacity-20"></div>

              <div className="relative z-10">
                <h4 className="text-xs font-mono font-bold tracking-wider text-tertiary uppercase pb-2.5 border-b border-tertiary/10 mb-4">
                  CONFIGURA TU DRILL
                </h4>

                {/* BPM adjustment slider */}
                <div className="p-3.5 rounded-2xl border transition-all duration-300 space-y-2 mb-5 relative overflow-hidden bg-black/20 border-tertiary/10">
                  <div className="flex justify-between items-center text-xs font-mono font-bold">
                    <div className="flex items-center gap-2">
                      <span className="text-on-surface-variant">TEMPO DRILL:</span>
                      {drillBpm % 10 === 0 && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase bg-[#E9C349] text-black shadow flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> 10x
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-tertiary font-bold text-sm border border-tertiary/20 bg-tertiary/5 px-2.5 py-0.5 rounded-lg shadow-inner">
                        {drillBpm} BPM
                      </span>
                    </div>
                  </div>

                  <input
                    id="drill-bpm-slider"
                    type="range"
                    min="90"
                    max="140"
                    value={drillBpm}
                    onChange={(e) => setDrillBpm(Number(e.target.value))}
                    disabled={isDrillRunning}
                    className="w-full h-2 cursor-pointer"
                  />

                  <div className="flex justify-between text-[9px] text-on-surface-variant font-mono font-bold tracking-wide mt-1">
                    <span>90 BPM</span>
                    <span>100 BPM</span>
                    <span>110 BPM</span>
                    <span>120 BPM</span>
                    <span>130 BPM</span>
                    <span>140 BPM</span>
                  </div>
                </div>

                {/* Duration selection buttons */}
                <div className="space-y-2 mb-5">
                  <span className="text-xs font-mono font-bold text-on-surface-variant tracking-wider uppercase">
                    DURACIÓN DEL DRILL:
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {[30, 60, 120, 180].map((dur) => (
                      <button
                        id={`drill-duration-select-${dur}`}
                        key={dur}
                        onClick={() => {
                          setDrillDuration(dur);
                          setTimeLeft(dur);
                        }}
                        disabled={isDrillRunning}
                        className={`py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                          drillDuration === dur
                            ? 'bg-[#9A2B3C] text-white border-[#9A2B3C] shadow-md'
                            : 'bg-black/30 text-on-surface-variant border-tertiary/5 hover:border-tertiary/20'
                        }`}
                      >
                        {dur === 30 ? '30s' : `${dur / 60}m`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sound toggle box */}
                <div className="p-3 bg-black/40 border border-tertiary/10 rounded-xl flex items-center justify-between shadow-inner mb-4">
                  <div>
                    <h5 className="text-xs font-bold text-[#EDEFF4]">Habilitar Metrónomo</h5>
                    <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                      Apoyo rítmico con clics sintetizados
                    </p>
                  </div>
                  <button
                    id="toggle-drill-sound-btn"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-2 border rounded-xl transition-all ${
                      soundEnabled
                        ? 'bg-tertiary text-black border-tertiary shadow-md'
                        : 'bg-black/40 border-tertiary/15 text-on-surface-variant hover:border-tertiary/30'
                    }`}
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                </div>

                {/* Marking Mode selection */}
                <div className="space-y-2 pt-1 pb-2">
                  <span className="text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider">
                    MARCAR EL RITMO:
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      id="marking-mode-beat"
                      type="button"
                      onClick={() => setMarkingMode('beat')}
                      className={`p-3 rounded-xl text-left text-xs font-bold transition-all border flex items-center justify-between ${
                        markingMode === 'beat'
                          ? 'bg-[#E9C349]/10 border-[#E9C349]/30 text-white shadow-md'
                          : 'bg-black/20 border-tertiary/5 text-on-surface-variant hover:border-tertiary/15'
                      }`}
                    >
                      <div>
                        <div className="font-bold">🔊 SÓLO BEAT (METRÓNOMO)</div>
                        <div className="text-[10px] text-on-surface-variant font-semibold mt-0.5">
                          Clics con acento agudo en tiempo 1
                        </div>
                      </div>
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          markingMode === 'beat' ? 'border-[#E9C349]' : 'border-tertiary/10'
                        }`}
                      >
                        {markingMode === 'beat' && <span className="w-2 h-2 rounded-full bg-[#E9C349]" />}
                      </span>
                    </button>

                    <button
                      id="marking-mode-voice"
                      type="button"
                      onClick={() => setMarkingMode('voice')}
                      className={`p-3 rounded-xl text-left text-xs font-bold transition-all border flex items-center justify-between ${
                        markingMode === 'voice'
                          ? 'bg-[#E9C349]/10 border-[#E9C349]/30 text-white shadow-md'
                          : 'bg-black/20 border-tertiary/5 text-on-surface-variant hover:border-tertiary/15'
                      }`}
                    >
                      <div>
                        <div className="font-bold">🗣️ SÓLO VOZ (CONTEO DE BAILE)</div>
                        <div className="text-[10px] text-on-surface-variant font-semibold mt-0.5">
                          Cuenta hablada del 1 al 8 en español
                        </div>
                      </div>
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          markingMode === 'voice' ? 'border-[#E9C349]' : 'border-tertiary/10'
                        }`}
                      >
                        {markingMode === 'voice' && <span className="w-2 h-2 rounded-full bg-[#E9C349]" />}
                      </span>
                    </button>

                    <button
                      id="marking-mode-both"
                      type="button"
                      onClick={() => setMarkingMode('both')}
                      className={`p-3 rounded-xl text-left text-xs font-bold transition-all border flex items-center justify-between ${
                        markingMode === 'both'
                          ? 'bg-[#E9C349]/10 border-[#E9C349]/30 text-white shadow-md'
                          : 'bg-black/20 border-tertiary/5 text-on-surface-variant hover:border-tertiary/15'
                      }`}
                    >
                      <div>
                        <div className="font-bold">🔥 BEAT + VOZ (COMPLETO)</div>
                        <div className="text-[10px] text-on-surface-variant font-semibold mt-0.5">
                          Combina clics rítmicos y voz humana
                        </div>
                      </div>
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          markingMode === 'both' ? 'border-[#E9C349]' : 'border-tertiary/10'
                        }`}
                      >
                        {markingMode === 'both' && <span className="w-2 h-2 rounded-full bg-[#E9C349]" />}
                      </span>
                    </button>

                    <button
                      id="marking-mode-strong"
                      type="button"
                      onClick={() => setMarkingMode('strong')}
                      className={`p-3 rounded-xl text-left text-xs font-bold transition-all border flex items-center justify-between ${
                        markingMode === 'strong'
                          ? 'bg-[#E9C349]/10 border-[#E9C349]/30 text-white shadow-md'
                          : 'bg-black/20 border-tertiary/5 text-on-surface-variant hover:border-tertiary/15'
                      }`}
                    >
                      <div>
                        <div className="font-bold">⚡ TIEMPOS FUERTES (1 - 3 - 5 - 7)</div>
                        <div className="text-[10px] text-on-surface-variant font-semibold mt-0.5">
                          Entrenamiento de fraseo rítmico largo
                        </div>
                      </div>
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          markingMode === 'strong' ? 'border-[#E9C349]' : 'border-tertiary/10'
                        }`}
                      >
                        {markingMode === 'strong' && <span className="w-2 h-2 rounded-full bg-[#E9C349]" />}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-[#9A2B3C]/5 border border-[#9A2B3C]/15 p-4 rounded-xl text-[11px] text-on-surface-variant font-medium shadow-inner relative z-10">
                <div className="flex items-center gap-2 text-[#ffb3b2] font-mono font-bold uppercase mb-1">
                  <Flame className="w-4 h-4 text-tertiary" />
                  <span>💡 Tip del Instructor:</span>
                </div>
                Para mejorar los rolls, no muevas los hombros. Enfócate en el círculo que dibuja el codo y mantén tu pecho arriba y proyectado hacia adelante.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const DrillLab = React.memo(DrillLabComponent);
