import React, { useState } from 'react';
import { Play, Square, Zap, Music, Sparkles } from 'lucide-react';
import { useWaackMetronome, Subdivision } from '../hooks/useWaackMetronome';

export default function MetronomeLabComponent() {
  const { isPlaying, bpm, setBpm, subdivision, setSubdivision, currentBeat, togglePlay } = useWaackMetronome(128);

  return (
    <div className="bg-[#121212] border border-[#262626] p-6 rounded-3xl shadow-2xl space-y-6 text-[#EDEFF4]">
      {/* Cabecera */}
      <div className="flex items-center justify-between border-b border-[#262626] pb-4">
        <div>
          <h3 className="text-sm font-bold text-[#E9C349] uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#9A2B3C]" /> Metrónomo de Alta Precisión
          </h3>
          <p className="text-[11px] text-[#8A8A8A] mt-0.5">Reloj de hardware síncrono para Drills de Rolls y Overhead.</p>
        </div>
        <span className="text-[10px] font-mono bg-[#9A2B3C]/20 border border-[#9A2B3C] text-[#E9C349] px-2.5 py-1 rounded-full font-bold">
          {isPlaying ? 'ENGINE ACTIVE' : 'STANDBY'}
        </span>
      </div>

      {/* Indicador Visual de Tiempos (1, 2, 3, 4) */}
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((beat) => {
          const isActive = isPlaying && currentBeat === beat;
          const isAccent = beat === 2 || beat === 4; // Acentos de Disco
          return (
            <div
              key={beat}
              className={`h-12 rounded-2xl flex flex-col items-center justify-center font-mono font-bold transition-all border ${
                isActive
                  ? isAccent
                    ? 'bg-[#E9C349] text-black border-[#E9C349] scale-105 shadow-[0_0_15px_rgba(233,195,73,0.5)]'
                    : 'bg-[#9A2B3C] text-white border-[#9A2B3C] scale-105'
                  : 'bg-[#1A1A1A] text-[#8A8A8A] border-[#262626]'
              }`}
            >
              <span className="text-sm">{beat}</span>
              <span className="text-[8px] uppercase font-sans">{isAccent ? 'Accent' : 'Beat'}</span>
            </div>
          );
        })}
      </div>

      {/* Control de BPM */}
      <div className="p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden bg-[#161616] border-[#262626]">
        <div className="flex justify-between items-center text-xs font-mono mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[#8A8A8A] font-bold">TEMPO (BPM):</span>
            {bpm % 10 === 0 && (
              <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-[#E9C349] text-black shadow flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 10x RITMO
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-white">{bpm} <span className="text-xs text-[#E9C349]">BPM</span></span>
          </div>
        </div>

        <input
          type="range"
          min={90}
          max={160}
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-full accent-[#9A2B3C] bg-[#1A1A1A] h-2 rounded-lg cursor-pointer"
        />

        <div className="flex justify-between text-[9px] font-mono text-[#8A8A8A] mt-1.5">
          <span>90 BPM</span>
          <span>100 BPM 📳</span>
          <span>110 BPM 📳</span>
          <span>120 BPM 📳</span>
          <span>130 BPM 📳</span>
          <span>140 BPM 📳</span>
          <span>150 BPM 📳</span>
          <span>160 BPM</span>
        </div>
      </div>

      {/* Selector de Subdivisión */}
      <div className="flex items-center justify-between gap-2 pt-2">
        <span className="text-xs font-mono text-[#8A8A8A] font-bold">SUBDIVISIÓN:</span>
        <div className="flex gap-1.5">
          {(['4n', '8n', '16n'] as Subdivision[]).map((sub) => (
            <button
              key={sub}
              onClick={() => setSubdivision(sub)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold border transition-all ${
                subdivision === sub
                  ? 'bg-[#9A2B3C]/20 border-[#9A2B3C] text-[#E9C349]'
                  : 'bg-[#1A1A1A] border-[#262626] text-[#8A8A8A] hover:text-white'
              }`}
            >
              {sub === '4n' && '1/4 (Poses)'}
              {sub === '8n' && '1/8 (Lines)'}
              {sub === '16n' && '1/16 (Rolls)'}
            </button>
          ))}
        </div>
      </div>

      {/* Botón Principal Start/Stop */}
      <button
        onClick={togglePlay}
        className={`w-full py-4 rounded-2xl text-xs font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-xl ${
          isPlaying
            ? 'bg-[#1A1A1A] border border-[#9A2B3C] text-[#9A2B3C] hover:bg-[#9A2B3C] hover:text-white'
            : 'bg-[#9A2B3C] text-white hover:bg-[#b53247] shadow-[0_4px_20px_rgba(154,43,60,0.4)]'
        }`}
      >
        {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
        <span>{isPlaying ? 'Detener Entrenamiento' : 'Iniciar Metrónomo'}</span>
      </button>
    </div>
  );
}
