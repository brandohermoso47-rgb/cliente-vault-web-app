import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Swords, Activity, Trophy, Music } from 'lucide-react';
import SpotifyPlaylistModal from '../SpotifyPlaylistModal';
import SoundCloudPlaylistModal from '../SoundCloudPlaylistModal';

export interface BattleLabProps {
  language: string;
  battleThemes: any[];
  selectedThemeId: string;
  setSelectedThemeId: (id: string) => void;
  musicSource: 'synth' | 'spotify' | 'soundcloud';
  setMusicSource: (source: 'synth' | 'spotify' | 'soundcloud') => void;
  battleBpm: number;
  setBattleBpm: (bpm: number) => void;
  spotifyUrl: string;
  setSpotifyUrl: (url: string) => void;
  soundcloudUrl: string;
  setSoundcloudUrl: (url: string) => void;
  battleDuration: number;
  setBattleDuration: (dur: number) => void;
  startBattle: () => void;
  stopBattle: () => void;
  isBattleActive: boolean;
  battleRound: 'none' | 'running' | 'ended';
  setBattleRound: (round: 'none' | 'running' | 'ended') => void;
  battleTimeLeft: number;
  pulseBeat: boolean;
  visualizerRef: React.RefObject<HTMLDivElement | null>;
  bassIntensity: number;
  setBassIntensity: (val: number) => void;
  liveCue: string;
  spotifyEmbedUrl: string;
  soundcloudEmbedUrl: string;
  checkedObjectives: Record<string, boolean>;
  setCheckedObjectives: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  hasSavedPoints: boolean;
  handleSaveChallengeScore: () => void;
  earnedPoints: number;
}

const BattleLabComponent: React.FC<BattleLabProps> = ({
  language,
  battleThemes,
  selectedThemeId,
  setSelectedThemeId,
  musicSource,
  setMusicSource,
  battleBpm,
  setBattleBpm,
  spotifyUrl,
  setSpotifyUrl,
  soundcloudUrl,
  setSoundcloudUrl,
  battleDuration,
  setBattleDuration,
  startBattle,
  stopBattle,
  isBattleActive,
  battleRound,
  setBattleRound,
  battleTimeLeft,
  pulseBeat,
  visualizerRef,
  bassIntensity,
  setBassIntensity,
  liveCue,
  spotifyEmbedUrl,
  soundcloudEmbedUrl,
  checkedObjectives,
  setCheckedObjectives,
  hasSavedPoints,
  handleSaveChallengeScore,
  earnedPoints
}) => {
  const [isSpotifyModalOpen, setIsSpotifyModalOpen] = useState(false);
  const [isSoundCloudModalOpen, setIsSoundCloudModalOpen] = useState(false);
  const selectedTheme = battleThemes.find(t => t.id === selectedThemeId) || battleThemes[0] || {
    id: 'basic',
    name: 'Rutina Base',
    description: 'Rutina por defecto',
    bpm: 120,
    objectives: []
  };

  const playSynthBeep = (freq: number, duration: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignore audio failures
    }
  };

  return (
    <div className="w-full flex flex-col space-y-6 sm:space-y-8">
      <div className="bg-[#120F22]/90 border border-white/15 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 text-[#EDEFF4] relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 scanline pointer-events-none opacity-20"></div>
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 mb-6 gap-6 relative z-10">
          <div>
            <span className="font-mono text-[10px] font-black text-[#D9A9FF] bg-[#D9A9FF]/10 border border-[#D9A9FF]/30 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              {language === 'es' ? 'RETO TÉCNICO CON RITMO' : 'RHYTHM TECHNICAL CHALLENGE'}
            </span>
            <h3 className="text-2xl sm:text-3xl font-display-lg italic tracking-tight uppercase mt-3 text-white">
              🎯 {language === 'es' ? 'Reto de Objetivos Freestyle' : 'Freestyle Objectives Challenge'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-2xl leading-relaxed">
              {language === 'es'
                ? 'Practica tu freestyle integrando consignas y objetivos técnicos específicos sincronizados con la música.'
                : 'Practice your freestyle integrating specific prompts and technical objectives synchronized with music.'}
            </p>
          </div>
          {/* Score and Points Reward */}
          <div className="bg-[#C23E9E]/15 border border-[#C23E9E]/30 p-4 rounded-2xl text-center shrink-0 min-w-[160px] shadow-lg">
            <div className="text-[10px] font-mono text-[#D9A9FF] uppercase tracking-widest font-black">
              {language === 'es' ? 'RECOMPENSA MÁXIMA' : 'MAX REWARD'}
            </div>
            <div className="text-base font-black text-white mt-1">
              {language === 'es' ? '+120 Puntos de Ritmo' : '+120 Rhythm Points'}
            </div>
          </div>
        </div>

        {/* 1. SELECTION STATE */}
        {battleRound === 'none' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 relative z-10">
            {/* Select Theme Section (8 Cols) */}
            <div className="lg:col-span-8 space-y-5">
              <h4 className="text-xs font-mono font-bold uppercase text-[#D9A9FF] tracking-widest border-b border-white/10 pb-2">
                🧠 {language === 'es' ? 'Selecciona una Rutina / Enfoque Técnico:' : 'Select a Routine / Technical Focus:'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {battleThemes.map((theme, idx) => (
                  <div
                    key={theme.id || idx}
                    onClick={() => {
                      setSelectedThemeId(theme.id);
                      setBattleBpm(theme.bpm || 120);
                      playSynthBeep(750, 0.05);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between text-left ${
                      selectedThemeId === theme.id
                        ? 'bg-[#C23E9E]/10 border-[#C23E9E] shadow-[0_0_15px_rgba(194, 62, 158,0.2)]'
                        : 'bg-[#121212] border-[#262626] hover:border-[#C23E9E]/40 hover:bg-[#121212]/70'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono text-tertiary font-bold tracking-wider block mb-1">
                        {theme.bpm} BPM
                      </span>
                      <h5 className="font-bold text-xs text-white uppercase tracking-wide leading-tight mb-2">
                        {theme.name}
                      </h5>
                      <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">
                        {theme.description}
                      </p>
                    </div>
                    <span
                      className={`text-[9px] font-mono border px-2 py-0.5 rounded mt-4 inline-block self-start font-bold uppercase tracking-wider ${
                        selectedThemeId === theme.id
                          ? 'bg-[#C23E9E] text-white border-[#C23E9E]'
                          : 'bg-black/30 text-[#8A8A8A] border-[#262626]'
                      }`}
                    >
                      {selectedThemeId === theme.id
                        ? language === 'es' ? 'SELECCIONADO' : 'SELECTED'
                        : language === 'es' ? 'SELECCIONAR' : 'SELECT'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Detailed Objectives List for selected Theme */}
              <div className="bg-[#0D0D11] border border-tertiary/10 rounded-2xl p-5 space-y-3.5">
                <div className="flex items-center justify-between border-b border-[#262626] pb-2">
                  <span className="text-[10px] font-mono font-bold text-tertiary uppercase tracking-widest">
                    🎯 {language === 'es' ? 'Objetivos Incluidos en este Reto:' : 'Objectives Included in this Challenge:'}
                  </span>
                  <span className="text-[10px] font-mono text-on-surface-variant font-bold uppercase">
                    {(selectedTheme.objectives || []).length} {language === 'es' ? 'Objetivos' : 'Objectives'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(selectedTheme.objectives || []).map((obj: any) => (
                    <div key={obj.id} className="bg-black/30 border border-[#262626] rounded-xl p-3.5 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <span className="text-[11px] font-bold text-white leading-tight">
                            {obj.text}
                          </span>
                          <span className="text-[9px] font-mono text-[#D9A9FF] font-black whitespace-nowrap">
                            +{obj.points} Pts
                          </span>
                        </div>
                        <p className="text-[9px] text-[#8A8A8A] italic leading-normal">
                          {language === 'es' ? `Criterio: ${obj.tip}` : `Criteria: ${obj.tip}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Configuration Area (4 Cols) */}
            <div className="md:col-span-4 bg-[#0d0d11]/80 border border-tertiary/10 rounded-2xl p-5 flex flex-col justify-between space-y-5 shadow-lg">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-mono font-black uppercase text-tertiary border-b border-tertiary/10 pb-2 mb-3 tracking-widest">
                    ⚙️ {language === 'es' ? 'Sincronizar Música:' : 'Sync Music Source:'}
                  </h4>

                  <div className="flex bg-black/40 border border-[#262626] rounded-lg p-0.5 gap-1">
                    <button
                      onClick={() => setMusicSource('synth')}
                      className={`flex-1 py-1.5 rounded text-[9px] font-mono font-bold uppercase transition-all ${
                        musicSource === 'synth' ? 'bg-[#C23E9E] text-white shadow-sm' : 'text-[#8A8A8A] hover:text-white'
                      }`}
                    >
                      🔊 {language === 'es' ? 'Sintetizador' : 'Synth'}
                    </button>
                    <button
                      onClick={() => setMusicSource('spotify')}
                      className={`flex-1 py-1.5 rounded text-[9px] font-mono font-bold uppercase transition-all ${
                        musicSource === 'spotify' ? 'bg-[#1DB954] text-white shadow-sm' : 'text-[#8A8A8A] hover:text-white'
                      }`}
                    >
                      🎧 Spotify
                    </button>
                    <button
                      onClick={() => setMusicSource('soundcloud')}
                      className={`flex-1 py-1.5 rounded text-[9px] font-mono font-bold uppercase transition-all ${
                        musicSource === 'soundcloud' ? 'bg-[#ff5500] text-white shadow-sm' : 'text-[#8A8A8A] hover:text-white'
                      }`}
                    >
                      ☁️ SoundCloud
                    </button>
                  </div>
                </div>

                {/* Music source specific settings */}
                {musicSource === 'synth' && (
                  <div className="bg-black/30 border border-[#262626] rounded-xl p-3 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold text-[#8A8A8A]">
                      <span>{language === 'es' ? 'TEMPO METRÓNOMO:' : 'METRONOME TEMPO:'}</span>
                      <span className="text-tertiary">{battleBpm} BPM</span>
                    </div>
                    <input
                      type="range"
                      min="90"
                      max="140"
                      value={battleBpm}
                      onChange={(e) => {
                        setBattleBpm(Number(e.target.value));
                        playSynthBeep(600 + Number(e.target.value), 0.03);
                      }}
                      className="w-full accent-tertiary bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}

                {musicSource === 'spotify' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase block">
                        {language === 'es' ? 'URL O TRACK ID SPOTIFY:' : 'SPOTIFY TRACK OR PLAYLIST URL:'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsSpotifyModalOpen(true)}
                        className="text-[10px] font-mono font-bold text-[#1DB954] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Music className="w-3 h-3" />
                        <span>{language === 'es' ? 'Mi Spotify' : 'My Spotify'}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="https://open.spotify.com/playlist/..."
                      value={spotifyUrl}
                      onChange={(e) => setSpotifyUrl(e.target.value)}
                      className="w-full bg-black/60 border border-[#262626] focus:border-[#1DB954] text-xs text-white p-2.5 rounded-xl font-mono"
                    />

                    <SpotifyPlaylistModal
                      isOpen={isSpotifyModalOpen}
                      onClose={() => setIsSpotifyModalOpen(false)}
                      onSelectPlaylist={(p) => setSpotifyUrl(p.externalUrl)}
                    />
                  </div>
                )}

                {musicSource === 'soundcloud' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase block">
                        {language === 'es' ? 'URL O PISTA DE SOUNDCLOUD:' : 'SOUNDCLOUD TRACK OR PLAYLIST:'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsSoundCloudModalOpen(true)}
                        className="text-[10px] font-mono font-bold text-[#FF5500] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Music className="w-3 h-3" />
                        <span>{language === 'es' ? 'Mi SoundCloud' : 'My SoundCloud'}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="https://soundcloud.com/..."
                      value={soundcloudUrl}
                      onChange={(e) => setSoundcloudUrl(e.target.value)}
                      className="w-full bg-black/60 border border-[#262626] focus:border-[#ff5500] text-xs text-white p-2.5 rounded-xl font-mono"
                    />

                    <SoundCloudPlaylistModal
                      isOpen={isSoundCloudModalOpen}
                      onClose={() => setIsSoundCloudModalOpen(false)}
                      onSelectPlaylist={(sc) => setSoundcloudUrl(sc.externalUrl)}
                      language={language === 'en' ? 'en' : 'es'}
                    />
                  </div>
                )}

                {/* Duration selector */}
                <div className="space-y-2">
                  <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase block">
                    ⏱️ {language === 'es' ? 'DURACIÓN DEL RETO:' : 'CHALLENGE DURATION:'}
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[30, 45, 60, 120].map((dur) => (
                      <button
                        key={dur}
                        onClick={() => {
                          setBattleDuration(dur);
                          playSynthBeep(700, 0.05);
                        }}
                        className={`py-1 rounded text-[10px] font-mono font-bold transition-all ${
                          battleDuration === dur
                            ? 'bg-tertiary text-black font-bold'
                            : 'bg-[#1A1A1A] text-[#8A8A8A] border border-[#262626] hover:text-white'
                        }`}
                      >
                        {dur} seg
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={startBattle}
                className="w-full bg-[#D9A9FF] hover:bg-[#ffe088] text-black font-display-lg font-bold py-3 rounded-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 shadow-md mt-4"
              >
                <Swords className="w-4 h-4 text-[#C23E9E]" />
                {language === 'es' ? '¡INICIAR RETO DE OBJETIVOS!' : 'START OBJECTIVES CHALLENGE!'}
              </button>
            </div>
          </div>
        )}

        {/* 2. RUNNING STATE */}
        {isBattleActive && battleRound === 'running' && (
          <div className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Visual Status card */}
              <div className="md:col-span-8 bg-[#0D0D11] text-[#EDEFF4] rounded-2xl border border-tertiary/15 p-6 relative overflow-hidden flex flex-col justify-between min-h-[440px] shadow-xl">
                {/* Sub-header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span className="text-[10px] font-mono font-bold tracking-widest text-tertiary uppercase">
                      {language === 'es' ? 'ENTRENAMIENTO ACTIVO' : 'ACTIVE TRAINING'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-on-surface-variant block uppercase">
                      {language === 'es' ? 'Tiempo Restante' : 'Time Left'}
                    </span>
                    <span className="text-3xl font-mono font-bold text-[#ffb3b2] tabular-nums">{battleTimeLeft}s</span>
                  </div>
                </div>

                {/* Central Visual Metronome / Objective Focus */}
                <div className="text-center py-4 flex flex-col items-center justify-center relative my-2">
                  <div className="relative w-24 h-24 flex items-center justify-center mb-3">
                    <motion.div
                      animate={pulseBeat ? { scale: [1, 1.4, 1], opacity: [0.6, 0.1, 0.6] } : {}}
                      transition={{ duration: 0.15 }}
                      className={`absolute inset-0 rounded-full blur-md ${
                        musicSource === 'spotify'
                          ? 'bg-green-500'
                          : musicSource === 'soundcloud'
                          ? 'bg-[#ff5500]'
                          : 'bg-[#C23E9E]'
                      } pointer-events-none`}
                    />
                    <div
                      className={`w-16 h-16 rounded-full border-2 flex items-center justify-center relative z-10 ${
                        musicSource === 'spotify'
                          ? 'border-[#1DB954] bg-[#1DB954]/10 shadow-[0_0_15px_rgba(29,185,84,0.3)]'
                          : musicSource === 'soundcloud'
                          ? 'border-[#ff5500] bg-[#ff5500]/10 shadow-[0_0_15px_rgba(255,85,0,0.3)]'
                          : 'border-[#C23E9E] bg-[#C23E9E]/10 shadow-[0_0_15px_rgba(194, 62, 158,0.3)]'
                      }`}
                    >
                      <Activity
                        className={`w-6 h-6 ${
                          musicSource === 'spotify'
                            ? 'text-[#1DB954]'
                            : musicSource === 'soundcloud'
                            ? 'text-[#ff5500]'
                            : 'text-tertiary'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Frequency Visualizer bars */}
                  <div className="w-full max-w-sm mt-1 mb-4 px-4 space-y-2.5">
                    <div
                      ref={visualizerRef}
                      className="flex items-end justify-center gap-[3px] h-16 w-full px-4 border border-white/5 bg-black/40 rounded-2xl py-2 shadow-inner overflow-hidden"
                    >
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1.5 rounded-t bg-gradient-to-t from-[#C23E9E] via-[#D9A9FF] to-cyan-400 opacity-85 transition-all duration-75"
                          style={{ height: '20%' }}
                        />
                      ))}
                    </div>

                    {/* Slider for intensity */}
                    <div className="space-y-1 text-left">
                      <div className="flex justify-between items-center text-[8px] font-mono font-bold text-[#8A8A8A]">
                        <span>{language === 'es' ? '🔊 INTENSIDAD DEL RITMO / BAJOS:' : '🔊 RHYTHM & BASS INTENSITY:'}</span>
                        <span className="text-white bg-[#C23E9E]/40 px-1 py-0.5 rounded text-[8px]">{bassIntensity}x</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={bassIntensity}
                        onChange={(e) => {
                          setBassIntensity(Number(e.target.value));
                          playSynthBeep(400 + Number(e.target.value) * 100, 0.05);
                        }}
                        className="w-full accent-[#D9A9FF] bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-[#8A8A8A] tracking-widest uppercase mb-1 font-bold">
                    {language === 'es' ? 'CONSEJO DE TÉCNICA EN VIVO' : 'LIVE TECHNIQUE CUE'}
                  </div>
                  <h3 className="text-sm md:text-md font-bold text-white px-6 min-h-[40px] max-w-lg leading-relaxed">
                    {liveCue}
                  </h3>
                </div>

                {/* Bottom status bar */}
                <div className="flex justify-between items-center text-[10px] border-t border-[#262626] pt-4 font-mono">
                  <div>
                    <span className="text-on-surface-variant uppercase tracking-widest">
                      {language === 'es' ? 'MÚSICA:' : 'MUSIC:'}
                    </span>{' '}
                    <strong
                      className={
                        musicSource === 'spotify'
                          ? 'text-[#1DB954]'
                          : musicSource === 'soundcloud'
                          ? 'text-[#ff5500]'
                          : 'text-tertiary'
                      }
                    >
                      {musicSource === 'spotify'
                        ? 'SPOTIFY PLAYLIST'
                        : musicSource === 'soundcloud'
                        ? 'SOUNDCLOUD PLAYER'
                        : `${battleBpm} BPM SYNTH`}
                    </strong>
                  </div>
                  <div>
                    <span className="text-on-surface-variant uppercase tracking-widest">
                      {language === 'es' ? 'RUTINA:' : 'ROUTINE:'}
                    </span>{' '}
                    <strong className="text-white uppercase">{selectedTheme.name}</strong>
                  </div>
                </div>
              </div>

              {/* Active Objectives Guide List */}
              <div className="md:col-span-4 bg-[#0d0d11]/80 border border-[#262626] rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-mono font-black uppercase text-tertiary border-b border-[#262626] pb-2 mb-3 tracking-widest">
                      🎯 {language === 'es' ? 'Objetivos a Ejecutar:' : 'Objectives to Execute:'}
                    </h4>
                    <p className="text-[10px] text-[#8A8A8A] leading-relaxed mb-4">
                      {language === 'es'
                        ? 'Ejecuta tu freestyle centrándote en cumplir las siguientes metas técnicas al ritmo:'
                        : 'Execute your freestyle focusing on nailing these technical goals to the rhythm:'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {(selectedTheme.objectives || []).map((obj: any) => (
                      <div key={obj.id} className="bg-black/30 border border-[#262626] rounded-xl p-3 space-y-1">
                        <div className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-tertiary mt-1.5 shrink-0" />
                          <div className="text-[11px] font-bold text-white leading-tight">
                            {obj.text}
                          </div>
                        </div>
                        <p className="text-[9px] text-[#8A8A8A] pl-3.5 italic leading-normal">
                          {obj.tip}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {musicSource === 'spotify' && spotifyEmbedUrl && (
                  <div className="rounded-lg overflow-hidden border border-[#262626] bg-black/60 p-1">
                    <iframe
                      src={spotifyEmbedUrl}
                      width="100%"
                      height="80"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="rounded"
                    ></iframe>
                  </div>
                )}

                {musicSource === 'soundcloud' && soundcloudEmbedUrl && (
                  <div className="rounded-lg overflow-hidden border border-[#ff5500]/15 bg-black/60 p-1">
                    <iframe
                      src={soundcloudEmbedUrl}
                      width="100%"
                      height="166"
                      frameBorder="no"
                      scrolling="no"
                      allow="autoplay"
                      loading="lazy"
                      className="rounded"
                    ></iframe>
                  </div>
                )}

                <button
                  onClick={stopBattle}
                  className="w-full bg-[#C23E9E]/10 hover:bg-[#C23E9E]/25 text-[#ffb3b2] border border-[#C23E9E]/30 font-bold py-2.5 rounded-xl text-xs transition-all uppercase tracking-widest mt-2"
                >
                  🏳️ {language === 'es' ? 'DETENER RETO Y VOLVER' : 'STOP CHALLENGE & EXIT'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. COMPLETED & SELF-ASSESSMENT STATE */}
        {battleRound === 'ended' && (
          <div className="space-y-6 relative z-10 max-w-4xl mx-auto w-full">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-tertiary/10 border border-tertiary/20 rounded-full animate-bounce">
                <Trophy className="w-8 h-8 text-tertiary" />
              </div>
              <h3 className="text-2xl font-display-lg italic uppercase tracking-tight text-white">
                ⏱️ {language === 'es' ? '¡PRÁCTICA COMPLETADA!' : 'PRACTICE COMPLETED!'}
              </h3>
              <p className="text-xs text-on-surface-variant font-semibold max-w-md mx-auto leading-relaxed">
                {language === 'es'
                  ? 'El tiempo ha terminado. Ahora, sé honesto consigo mismo y califica tu desempeño rítmico para calcular tu puntaje.'
                  : 'Time has run out. Now, be honest with yourself and score your performance to compute your points.'}
              </p>
            </div>

            {/* Checklist card */}
            <div className="bg-[#0D0D11] border border-tertiary/10 rounded-2xl p-6 space-y-4 shadow-xl">
              <h4 className="text-[10px] font-mono font-bold uppercase text-tertiary tracking-widest border-b border-[#262626] pb-2">
                📋 {language === 'es' ? 'Ficha de Auto-Evaluación (Checklist):' : 'Self-Evaluation Checklist:'}
              </h4>

              <div className="space-y-3.5">
                {(selectedTheme.objectives || []).map((obj: any) => {
                  const isChecked = !!checkedObjectives[obj.id];
                  return (
                    <div
                      key={obj.id}
                      onClick={() => {
                        if (!hasSavedPoints) {
                          setCheckedObjectives((prev) => ({ ...prev, [obj.id]: !prev[obj.id] }));
                        }
                      }}
                      className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 select-none ${
                        hasSavedPoints ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                      } ${
                        isChecked
                          ? 'bg-[#C23E9E]/10 border-[#C23E9E]/50 text-white'
                          : 'bg-black/30 border-[#262626] text-on-surface-variant hover:border-white/10'
                      }`}
                    >
                      <div className="pt-0.5 shrink-0">
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                            isChecked ? 'bg-[#C23E9E] border-[#C23E9E] text-white' : 'border-white/30 bg-transparent'
                          }`}
                        >
                          {isChecked && <span className="text-[11px] font-black">✔</span>}
                        </div>
                      </div>
                      <div className="flex-1 space-y-1 text-left">
                        <div className="flex justify-between items-start gap-4">
                          <span className={`text-xs font-bold ${isChecked ? 'text-white' : 'text-white/70'}`}>
                            {obj.text}
                          </span>
                          <span className="text-[10px] font-mono text-tertiary font-bold whitespace-nowrap">
                            +{obj.points} Pts
                          </span>
                        </div>
                        <p className="text-[10px] text-[#8A8A8A] leading-normal italic">
                          {language === 'es' ? `Criterio: ${obj.tip}` : `Criteria: ${obj.tip}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Perfect score checklist notification */}
              {(selectedTheme.objectives || []).length > 0 &&
                (selectedTheme.objectives || []).every((obj: any) => checkedObjectives[obj.id]) &&
                !hasSavedPoints && (
                  <div className="bg-[#D9A9FF]/10 border border-[#D9A9FF]/20 p-3 rounded-xl text-center">
                    <span className="text-[10px] font-mono text-[#D9A9FF] font-black uppercase tracking-wider">
                      🌟 ¡Rendimiento Perfecto! +20 Puntos de Consistencia Extra por completar todo.
                    </span>
                  </div>
                )}

              {/* Score summary in real-time */}
              <div className="border-t border-[#262626] pt-4 flex flex-col items-center justify-center gap-2">
                <div className="text-[9px] font-mono text-[#8A8A8A] uppercase tracking-widest">
                  {language === 'es' ? 'Puntos Estimados a Reclamar' : 'Estimated Points to Claim'}
                </div>

                {(() => {
                  let total = 0;
                  (selectedTheme.objectives || []).forEach((obj: any) => {
                    if (checkedObjectives[obj.id]) total += obj.points;
                  });
                  if (
                    (selectedTheme.objectives || []).length > 0 &&
                    (selectedTheme.objectives || []).every((obj: any) => checkedObjectives[obj.id])
                  ) {
                    total += 20;
                  }
                  return (
                    <div className="text-3xl font-display-lg italic text-[#D9A9FF] tracking-tight animate-pulse">
                      +{total} Pts
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Submission and Saving Actions */}
            <div className="space-y-3">
              {!hasSavedPoints ? (
                <button
                  onClick={handleSaveChallengeScore}
                  className="w-full bg-[#D9A9FF] hover:bg-[#ffe088] text-black font-display-lg font-bold py-3.5 rounded-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 shadow-md"
                >
                  <Swords className="w-4 h-4 text-[#C23E9E]" />
                  {language === 'es' ? 'CONFIRMAR Y GUARDAR SESIÓN' : 'CONFIRM & SAVE SESSION'}
                </button>
              ) : (
                <div className="bg-[#1DB954]/10 border border-[#1DB954]/20 rounded-2xl p-4 text-center space-y-1">
                  <span className="text-xs font-bold text-[#1DB954] block uppercase">
                    ✅ ¡PUNTOS REGISTRADOS CON ÉXITO!
                  </span>
                  <p className="text-[10px] text-white/90 leading-relaxed font-semibold">
                    {language === 'es'
                      ? `Se han sumado +${earnedPoints} Puntos de Ritmo a tu perfil y la práctica quedó registrada en tu expediente.`
                      : `+${earnedPoints} Rhythm Points have been added to your profile, and the practice session is saved to your log.`}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={startBattle}
                  className="flex-1 bg-transparent hover:bg-white/5 text-white border border-[#262626] hover:border-white/10 text-xs font-mono font-bold uppercase tracking-wider py-2.5 rounded-xl transition-all"
                >
                  🔄 {language === 'es' ? 'Volver a Intentar' : 'Try Challenge Again'}
                </button>
                <button
                  onClick={() => setBattleRound('none')}
                  className="flex-1 bg-[#1A1A1A] hover:bg-[#262626] text-white border border-[#262626] text-xs font-mono font-bold uppercase tracking-wider py-2.5 rounded-xl transition-all"
                >
                  🔙 {language === 'es' ? 'Volver a Selección' : 'Back to Selection'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const BattleLab = React.memo(BattleLabComponent);
export default BattleLab;
