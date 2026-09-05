import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sunrise, 
  Sun, 
  Sunset, 
  Moon, 
  Clock, 
  Sparkles, 
  Eye, 
  Check, 
  ShieldCheck, 
  ChevronDown 
} from 'lucide-react';
import { CircadianThemeConfig, CircadianMode } from '../hooks/useCircadianTheme';
import { Language } from '../lib/translations';

interface CircadianHeaderControlProps {
  circadian: CircadianThemeConfig;
  theme: 'light' | 'dark';
  language: Language;
}

export const CircadianHeaderControl: React.FC<CircadianHeaderControlProps> = ({
  circadian,
  theme,
  language
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    period,
    mode,
    formattedTime,
    isEyeCareBoost,
    setMode,
    toggleEyeCareBoost,
    periodLabel,
    periodDescription,
    PeriodIcon,
    indicatorColor
  } = circadian;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const t = {
    title: language === 'es' ? 'Modo Circadiano Anti-fatiga' : language === 'ja' ? '体内時計・視覚保護モード' : language === 'ko' ? '서캐디안 눈 피로 완화' : 'Circadian Eye Comfort',
    subtitle: language === 'es' ? 'Adaptación cromática por hora del día' : language === 'ja' ? '時間帯に応じた色調の自動調整' : language === 'ko' ? '시간대별 색상 자동 조절' : 'Auto color scheme based on time of day',
    autoMode: language === 'es' ? 'Automático (Horario Local)' : language === 'ja' ? '自動 (現地時間)' : language === 'ko' ? '자동 (현지 시간)' : 'Automatic (Local Time)',
    autoDesc: language === 'es' ? 'Se sincroniza automáticamente con la hora de tu equipo.' : language === 'ja' ? 'PCの時刻に合わせて自動変更されます。' : language === 'ko' ? '기기 시간에 맞춰 자동으로 변경됩니다.' : 'Automatically syncs with your system clock.',
    eyeCareTitle: language === 'es' ? 'Refuerzo Anti-fatiga Ocular' : language === 'ja' ? '視覚保護ブースト' : language === 'ko' ? '시각 보호 부스트' : 'Eye Care Comfort Boost',
    eyeCareDesc: language === 'es' ? 'Atenúa contrastes duros y suaviza los tonos dorados para sesiones largas.' : language === 'ja' ? '長時間の管理作業でも目が疲れにくい暖色補正。' : language === 'ko' ? '장시간 작업 시 눈의 피로를 덜어주는 부드러운 색조 보정.' : 'Softens harsh highlights for prolonged administrative work.',
    periods: {
      dawn: {
        title: language === 'es' ? 'Amanecer (06:00 - 11:59)' : language === 'ja' ? '朝 (06:00 - 11:59)' : language === 'ko' ? '아침 (06:00 - 11:59)' : 'Dawn (06:00 - 11:59)',
        desc: language === 'es' ? 'Claridad matutina suave para iniciar la jornada.' : 'Gentle morning clarity to start the day.'
      },
      day: {
        title: language === 'es' ? 'Mediodía / Tarde (12:00 - 17:59)' : language === 'ja' ? '昼 (12:00 - 17:59)' : language === 'ko' ? '낮 (12:00 - 17:59)' : 'Midday (12:00 - 17:59)',
        desc: language === 'es' ? 'Contraste balanceado contra reflejos del estudio.' : 'Balanced studio contrast reducing screen glare.'
      },
      sunset: {
        title: language === 'es' ? 'Atardecer (18:00 - 21:59)' : language === 'ja' ? '夕方 (18:00 - 21:59)' : language === 'ko' ? '일몰 (18:00 - 21:59)' : 'Sunset (18:00 - 21:59)',
        desc: language === 'es' ? 'Filtro ámbar que reduce la luz azul.' : 'Warm amber tone reducing blue light emission.'
      },
      night: {
        title: language === 'es' ? 'Noche / Madrugada (22:00 - 05:59)' : language === 'ja' ? '夜 (22:00 - 05:59)' : language === 'ko' ? '야간 (22:00 - 05:59)' : 'Night (22:00 - 05:59)',
        desc: language === 'es' ? 'Máximo descanso visual para revisiones nocturnas.' : 'Maximum eye relaxation for late-night tasks.'
      }
    },
    activeNow: language === 'es' ? 'Activo ahora' : language === 'ja' ? '現在適用中' : language === 'ko' ? '현재 적용됨' : 'Active now',
    tooltipHeader: language === 'es' ? 'Esquema Circadiano:' : language === 'ja' ? '体内時計色調:' : language === 'ko' ? '서캐디안 모드:' : 'Circadian Theme:'
  };

  const periodOptions: Array<{ id: CircadianMode; title: string; desc: string; icon: React.ElementType; color: string }> = [
    {
      id: 'auto',
      title: t.autoMode,
      desc: `${t.autoDesc} (${formattedTime})`,
      icon: Clock,
      color: '#E9C349'
    },
    {
      id: 'dawn',
      title: t.periods.dawn.title,
      desc: t.periods.dawn.desc,
      icon: Sunrise,
      color: '#F59E0B'
    },
    {
      id: 'day',
      title: t.periods.day.title,
      desc: t.periods.day.desc,
      icon: Sun,
      color: '#E9C349'
    },
    {
      id: 'sunset',
      title: t.periods.sunset.title,
      desc: t.periods.sunset.desc,
      icon: Sunset,
      color: '#F97316'
    },
    {
      id: 'night',
      title: t.periods.night.title,
      desc: t.periods.night.desc,
      icon: Moon,
      color: '#A855F7'
    }
  ];

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button with Hover Label Tooltip */}
      <div className="relative group/circadian">
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer shadow-sm ${
            isOpen
              ? 'bg-[#E9C349]/20 border-[#E9C349] text-[#E9C349] shadow-[0_0_12px_rgba(233,195,73,0.35)]'
              : theme === 'light'
              ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-300/80 text-amber-950'
              : 'bg-[#141414] hover:bg-[#1C1811] border-[#332A1C] text-slate-200 hover:text-[#E9C349]'
          }`}
          aria-label={`${t.title}: ${periodLabel} (${formattedTime})`}
          title={`${t.title} - ${periodLabel} (${formattedTime})`}
        >
          {/* Pulsing Period Icon */}
          <div className="relative flex items-center justify-center">
            <PeriodIcon 
              className="w-3.5 h-3.5 transition-colors" 
              style={{ color: indicatorColor }} 
            />
            <span 
              className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full animate-ping opacity-60"
              style={{ backgroundColor: indicatorColor }}
            />
          </div>

          <span className="hidden lg:inline text-[11px] font-mono tracking-tight font-extrabold truncate max-w-[130px]">
            {periodLabel}
          </span>
          <span className="hidden md:inline lg:hidden text-[10px] font-mono text-slate-400">
            {formattedTime}
          </span>

          {mode === 'auto' && (
            <span className="px-1 py-0.2 rounded text-[8px] bg-[#E9C349]/20 text-[#E9C349] border border-[#E9C349]/30 font-bold uppercase hidden xl:inline">
              AUTO
            </span>
          )}

          {isEyeCareBoost && (
            <Eye className="w-3 h-3 text-amber-400 shrink-0" />
          )}

          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </motion.button>

        {/* Hover Label Tooltip */}
        {!isOpen && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 pointer-events-none opacity-0 group-hover/circadian:opacity-100 transition-all duration-200 z-50 scale-95 group-hover/circadian:scale-100 flex flex-col items-center">
            <div className={`w-2 h-2 rotate-45 -mb-1 border-t border-l ${
              theme === 'light' ? 'bg-slate-900 border-slate-700' : 'bg-[#18140B] border-[#E9C349]/40'
            }`} />
            <div className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono tracking-wide shadow-2xl border flex items-center gap-2 whitespace-nowrap ${
              theme === 'light'
                ? 'bg-slate-900 text-white border-slate-700 shadow-xl'
                : 'bg-[#18140B] text-[#EDEFF4] border-[#E9C349]/40 shadow-[0_8px_20px_rgba(0,0,0,0.8)]'
            }`}>
              <PeriodIcon className="w-3 h-3 text-[#E9C349]" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold">{t.tooltipHeader} {periodLabel}</span>
                  <span className="text-amber-400">({formattedTime})</span>
                </div>
                <span className="text-[9px] text-slate-400 font-sans">{periodDescription}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute top-full right-0 mt-2 w-[calc(100vw-24px)] sm:w-[360px] rounded-2xl border shadow-2xl z-50 flex flex-col overflow-hidden backdrop-blur-xl ${
              theme === 'light'
                ? 'bg-white/95 border-amber-200 text-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.15)]'
                : 'bg-[#0E0E0E]/95 border-[#2E2416] text-[#EDEFF4] shadow-[0_20px_50px_rgba(0,0,0,0.85)]'
            }`}
          >
            {/* Header */}
            <div className={`p-3.5 border-b shrink-0 flex items-center justify-between ${
              theme === 'light' ? 'bg-amber-50/80 border-amber-200/80' : 'bg-[#15120C]/90 border-[#2A2418]'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E9C349] to-amber-600 flex items-center justify-center text-black font-black shadow-md">
                  <PeriodIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-black uppercase tracking-wider">
                    {t.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-sans">
                    {t.subtitle} • <span className="font-mono text-amber-400 font-bold">{formattedTime}</span>
                  </p>
                </div>
              </div>

              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                {mode === 'auto' ? 'AUTO' : 'MANUAL'}
              </span>
            </div>

            {/* List of Periods */}
            <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
              {periodOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = mode === opt.id;
                const isCurrentActive = (mode === 'auto' && opt.id === period) || (mode === opt.id);

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMode(opt.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? theme === 'light'
                          ? 'bg-amber-100/70 border-amber-400 text-amber-950 shadow-sm'
                          : 'bg-[#1F190E] border-[#E9C349]/60 text-white shadow-sm'
                        : theme === 'light'
                        ? 'bg-slate-50/70 hover:bg-slate-100 border-slate-200/80 text-slate-800'
                        : 'bg-[#141414] hover:bg-[#1A1813] border-[#222222] text-slate-300'
                    }`}
                  >
                    <div 
                      className="p-1.5 rounded-lg border shrink-0 mt-0.5"
                      style={{ 
                        backgroundColor: `${opt.color}15`, 
                        borderColor: `${opt.color}30`,
                        color: opt.color 
                      }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-mono font-bold truncate">
                          {opt.title}
                        </span>
                        {isCurrentActive && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                            {t.activeNow}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans line-clamp-1 mt-0.5">
                        {opt.desc}
                      </p>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-[#E9C349] shrink-0 self-center" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Extra Eye Care Comfort Booster Toggle */}
            <div className={`p-3 border-t flex items-center justify-between gap-2 ${
              theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#12100B] border-[#241C10]'
            }`}>
              <div className="flex items-start gap-2">
                <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${isEyeCareBoost ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400'}`}>
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold">
                    {t.eyeCareTitle}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-sans leading-tight">
                    {t.eyeCareDesc}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleEyeCareBoost}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer p-0.5 ${
                  isEyeCareBoost ? 'bg-[#E9C349]' : 'bg-slate-700'
                }`}
                aria-label="Alternar refuerzo anti-fatiga ocular"
              >
                <div className={`w-5 h-5 rounded-full bg-black transition-transform ${
                  isEyeCareBoost ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Footer Note */}
            <div className={`p-2 px-3 border-t text-[10px] font-mono flex items-center gap-1.5 ${
              theme === 'light' ? 'bg-amber-50/50 text-amber-900/80 border-amber-200/50' : 'bg-black/60 text-slate-400 border-white/5'
            }`}>
              <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate">
                {language === 'es' 
                  ? 'Frecuencia de color regulada contra la fatiga visual del docente.' 
                  : 'Regulated color frequency protecting instructor eye health.'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
