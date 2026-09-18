import { useState, useEffect, useMemo, type ElementType } from 'react';
import { Sunrise, Sun, Sunset, Moon } from 'lucide-react';
import { Language } from '../lib/translations';

export type CircadianPeriod = 'dawn' | 'day' | 'sunset' | 'night';
export type CircadianMode = 'auto' | CircadianPeriod;

export interface CircadianThemeConfig {
  period: CircadianPeriod;
  mode: CircadianMode;
  currentHour: number;
  currentMinute: number;
  formattedTime: string;
  isEyeCareBoost: boolean;
  setMode: (mode: CircadianMode) => void;
  toggleEyeCareBoost: () => void;
  headerClasses: string;
  badgeClasses: string;
  indicatorColor: string;
  periodLabel: string;
  periodDescription: string;
  PeriodIcon: ElementType;
}

export function getCircadianPeriodFromHour(hour: number): CircadianPeriod {
  if (hour >= 6 && hour < 12) {
    return 'dawn'; // 06:00 - 11:59: Amanecer / Mañana
  } else if (hour >= 12 && hour < 18) {
    return 'day'; // 12:00 - 17:59: Mediodía / Tarde
  } else if (hour >= 18 && hour < 22) {
    return 'sunset'; // 18:00 - 21:59: Atardecer / Crepúsculo
  } else {
    return 'night'; // 22:00 - 05:59: Noche / Madrugada (Anti-fatiga máxima)
  }
}

export function useCircadianTheme(theme: 'light' | 'dark', language: Language = 'es'): CircadianThemeConfig {
  const [mode, setModeState] = useState<CircadianMode>(() => {
    const saved = localStorage.getItem('waackon_circadian_mode') as CircadianMode;
    return ['auto', 'dawn', 'day', 'sunset', 'night'].includes(saved) ? saved : 'auto';
  });

  const [isEyeCareBoost, setIsEyeCareBoost] = useState<boolean>(() => {
    return localStorage.getItem('waackon_eyecare_boost') === 'true';
  });

  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000); // Check every 30 seconds
    return () => clearInterval(timer);
  }, []);

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const formattedTime = useMemo(() => {
    const h = currentHour % 12 || 12;
    const m = currentMinute < 10 ? `0${currentMinute}` : currentMinute;
    const ampm = currentHour >= 12 ? 'PM' : 'AM';
    return `${h}:${m} ${ampm}`;
  }, [currentHour, currentMinute]);

  const activePeriod: CircadianPeriod = useMemo(() => {
    if (mode === 'auto') {
      return getCircadianPeriodFromHour(currentHour);
    }
    return mode;
  }, [mode, currentHour]);

  const setMode = (newMode: CircadianMode) => {
    setModeState(newMode);
    localStorage.setItem('waackon_circadian_mode', newMode);
  };

  const toggleEyeCareBoost = () => {
    setIsEyeCareBoost(prev => {
      const next = !prev;
      localStorage.setItem('waackon_eyecare_boost', String(next));
      return next;
    });
  };

  const periodData = useMemo(() => {
    switch (activePeriod) {
      case 'dawn':
        return {
          icon: Sunrise,
          indicatorColor: '#F59E0B', // Amber
          label: language === 'es' ? 'Mañana • Enfoque' : language === 'ja' ? '朝 • 集中' : language === 'ko' ? '아침 • 집중' : 'Morning Focus',
          desc: language === 'es' 
            ? 'Luz equilibrada de amanecer para activar la mente sin deslumbramiento.' 
            : 'Balanced morning light to activate focus with zero glare.',
          headerDark: 'bg-gradient-to-r from-[#151109] via-[#0E0C07] to-[#120E08] border-[#382B14] text-[#F4EEDC] shadow-[0_4px_25px_rgba(245,158,11,0.08)]',
          headerLight: 'bg-gradient-to-r from-amber-50/90 via-white to-amber-50/60 border-amber-200/90 text-slate-900 shadow-sm shadow-amber-500/5',
          badge: 'bg-amber-500/15 border-amber-500/30 text-amber-400'
        };
      case 'day':
        return {
          icon: Sun,
          indicatorColor: '#D9A9FF', // Gold
          label: language === 'es' ? 'Día • Claridad' : language === 'ja' ? '昼 • 明瞭' : language === 'ko' ? '낮 • 선명함' : 'Daylight Clarity',
          desc: language === 'es' 
            ? 'Contraste óptimo adaptado a luz ambiental de mediodía.' 
            : 'Optimal studio contrast adapted to ambient daylight.',
          headerDark: 'bg-gradient-to-r from-[#0C0C0C] via-[#10100E] to-[#0D0D0D] border-[#2A2A26] text-[#EDEFF4] animate-header-glow',
          headerLight: 'bg-gradient-to-r from-[#FAFAFA] via-white to-[#F5F5F7] border-slate-300 text-slate-900 shadow-sm',
          badge: 'bg-[#D9A9FF]/15 border-[#D9A9FF]/30 text-[#D9A9FF]'
        };
      case 'sunset':
        return {
          icon: Sunset,
          indicatorColor: '#F97316', // Orange
          label: language === 'es' ? 'Atardecer • Calidez' : language === 'ja' ? '夕方 • 暖色' : language === 'ko' ? '일몰 • 온화' : 'Sunset Warmth',
          desc: language === 'es' 
            ? 'Filtro cálido con atenuación progresiva de luz azul contra el cansancio.' 
            : 'Warm amber tones reducing blue light to prevent eye fatigue.',
          headerDark: 'bg-gradient-to-r from-[#191107] via-[#130D05] to-[#181007] border-[#462F16] text-[#FDF0D5] shadow-[0_4px_30px_rgba(249,115,22,0.1)]',
          headerLight: 'bg-gradient-to-r from-[#FFF7ED] via-[#FFFBEB] to-[#FEF3C7] border-amber-300 text-amber-950 shadow-sm shadow-orange-500/10',
          badge: 'bg-orange-500/15 border-orange-500/30 text-orange-400'
        };
      case 'night':
      default:
        return {
          icon: Moon,
          indicatorColor: '#A855F7', // Soft purple/amber
          label: language === 'es' ? 'Noche • Anti-fatiga' : language === 'ja' ? '夜 • 視覚保護' : language === 'ko' ? '야간 • 눈 피로 완화' : 'Night Comfort',
          desc: language === 'es' 
            ? 'Bajo contraste y negros profundos para proteger la retina en sesiones tardías.' 
            : 'Low-contrast deep tones protecting your retinas during nocturnal work.',
          headerDark: 'bg-gradient-to-r from-[#080705] via-[#0B0805] to-[#070604] border-[#2B1D0E] text-[#ECE3D2] shadow-[0_4px_35px_rgba(217, 169, 255,0.06)]',
          headerLight: 'bg-gradient-to-r from-[#FBF5E8] via-[#FFFDF7] to-[#F5ECE0] border-[#E5D5BC] text-[#2C2417] shadow-inner',
          badge: 'bg-purple-500/15 border-purple-500/30 text-purple-300'
        };
    }
  }, [activePeriod, language]);

  // Combined header class based on theme and eye-care boost
  const headerClasses = useMemo(() => {
    const baseClasses = theme === 'light' ? periodData.headerLight : periodData.headerDark;
    const eyeCareTint = isEyeCareBoost 
      ? theme === 'light' 
        ? 'ring-1 ring-amber-400/40' 
        : 'ring-1 ring-amber-500/30 shadow-[inset_0_1px_0_rgba(217, 169, 255,0.2)]' 
      : '';
    return `${baseClasses} ${eyeCareTint} transition-colors duration-700`;
  }, [theme, periodData, isEyeCareBoost]);

  return {
    period: activePeriod,
    mode,
    currentHour,
    currentMinute,
    formattedTime,
    isEyeCareBoost,
    setMode,
    toggleEyeCareBoost,
    headerClasses,
    badgeClasses: periodData.badge,
    indicatorColor: periodData.indicatorColor,
    periodLabel: periodData.label,
    periodDescription: periodData.desc,
    PeriodIcon: periodData.icon
  };
}
