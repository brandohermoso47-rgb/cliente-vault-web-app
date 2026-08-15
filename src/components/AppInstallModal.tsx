import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  X,
  Sparkles,
  WifiOff,
  Bell,
  Gauge,
  Music,
  Maximize2,
  Apple,
  Chrome,
  Laptop,
  ArrowRight,
  ShieldCheck,
  Zap,
  Radio
} from 'lucide-react';
import { WaackOnLogo } from './WaackOnLogo';
import {
  getPushPermissionState,
  requestWebPushPermission,
  triggerLocalWebPushNotification,
  playWebPushSound
} from '../lib/webPush';

interface AppInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onOpenNotifications?: () => void;
}

export default function AppInstallModal({
  isOpen,
  onClose,
  userId,
  onOpenNotifications
}: AppInstallModalProps) {
  const [activePlatformTab, setActivePlatformTab] = useState<'mobile' | 'ios' | 'desktop'>('mobile');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [pushState, setPushState] = useState(() => getPushPermissionState());
  const [pushToastNotice, setPushToastNotice] = useState<string | null>(null);

  useEffect(() => {
    // Check if running as standalone PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      setIsInstalled(true);
    }

    // Capture beforeinstallprompt event if browser fires it
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setPushState(getPushPermissionState());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setPushToastNotice('🎉 ¡Aplicación instalada exitosamente en tu dispositivo!');
      }
      setDeferredPrompt(null);
    } else {
      // Guide the user based on active tab
      setPushToastNotice('📱 Sigue las instrucciones paso a paso para añadir el acceso directo en tu dispositivo.');
    }
    setTimeout(() => setPushToastNotice(null), 5000);
  };

  const handleEnablePushInApp = async () => {
    const granted = await requestWebPushPermission(userId);
    setPushState(getPushPermissionState());
    if (granted) {
      playWebPushSound();
      triggerLocalWebPushNotification({
        title: '📲 Waack On App Lista',
        body: '¡Tu aplicación está configurada para recibir avisos de lives y correcciones en tiempo real!',
        tag: 'app-installed'
      });
      setPushToastNotice('🔔 ¡Notificaciones Push activadas en tu app!');
    } else {
      setPushToastNotice('⚠️ Permiso de notificaciones pendiente o denegado.');
    }
    setTimeout(() => setPushToastNotice(null), 4500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="w-full max-w-2xl bg-[#0E0E10] border border-[#262626] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
      >
        {/* Glow ambient background effect */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#E9C349]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#9A2B3C]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3 bg-[#121215] shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white border-2 border-[#E9C349] p-1 flex items-center justify-center shadow-lg shrink-0">
              <WaackOnLogo className="w-8 h-8 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider font-sans">
                  Instalar Aplicación Oficial Waack On
                </h2>
                <span className="text-[10px] font-mono text-black bg-[#E9C349] px-2 py-0.5 rounded-full font-black">
                  PWA v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Experiencia nativa para iOS, Android, macOS y Windows con modo offline y Push.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice toast */}
        <AnimatePresence>
          {pushToastNotice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-5 py-2.5 bg-[#1b1912] border-b border-[#E9C349]/40 text-xs font-mono text-[#EDEFF4] flex items-center justify-between gap-3 shrink-0"
            >
              <span>{pushToastNotice}</span>
              <button onClick={() => setPushToastNotice(null)} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[75vh] custom-scrollbar bg-[#0A0A0C]">
          {/* Hero Feature Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#171510] via-[#1c151a] to-[#121217] border border-[#E9C349]/30 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  Acceso Rápido & Rendimiento Ultra-Fluido
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight leading-snug">
                Entrena sin distracciones desde tu pantalla de inicio
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Sin barras de navegación del navegador, con pantalla completa, audio en segundo plano y notificaciones push inmediatas.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={handleInstallClick}
              className="px-5 py-3 bg-gradient-to-r from-[#E9C349] to-[#dfb430] hover:from-[#f5cf53] hover:to-[#e8bd3a] text-black font-mono text-xs font-black rounded-2xl shadow-xl transition-all flex items-center gap-2 shrink-0 uppercase tracking-wider cursor-pointer border border-[#E9C349]"
            >
              <Download className="w-4 h-4 stroke-[3]" />
              <span>{isInstalled ? 'App Ya Instalada' : 'Instalar Aplicación'}</span>
            </motion.button>
          </div>

          {/* App Core Capabilities Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#E9C349]" />
              <span>Ventajas de la Aplicación Instalada</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#121216] border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Bell className="w-3.5 h-3.5 text-[#E9C349]" />
                  <span>Notificaciones Push Nativas</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Recibe avisos en tu pantalla de bloqueo cuando inicien los Lives o califiquen tus videos de práctica.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#121216] border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Soporte Offline & Caché</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Carga metrónomos y rutinas de calentamiento guardadas incluso en salas de baile sin conexión a internet.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#121216] border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Music className="w-3.5 h-3.5 text-purple-400" />
                  <span>Audio en Segundo Plano</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Reproduce pistas disco y ritmos BPM continuos mientras usas la cámara de tu teléfono para grabarte.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#121216] border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Modo Escenario Fullscreen</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Espacio 100% inmersivo optimizado para ver las clases de rolls y posing a gran escala.
                </p>
              </div>
            </div>
          </div>

          {/* Step-by-Step Installation Guides */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#E9C349]" />
                <span>Instrucciones según tu dispositivo</span>
              </h4>

              <div className="flex items-center gap-1 bg-[#141418] p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setActivePlatformTab('mobile')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    activePlatformTab === 'mobile' ? 'bg-[#E9C349] text-black font-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Android
                </button>
                <button
                  type="button"
                  onClick={() => setActivePlatformTab('ios')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    activePlatformTab === 'ios' ? 'bg-[#E9C349] text-black font-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  iPhone / iPad
                </button>
                <button
                  type="button"
                  onClick={() => setActivePlatformTab('desktop')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    activePlatformTab === 'desktop' ? 'bg-[#E9C349] text-black font-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  PC / Mac
                </button>
              </div>
            </div>

            {activePlatformTab === 'mobile' && (
              <div className="p-4 rounded-xl bg-[#121216] border border-white/10 space-y-2.5 text-xs font-mono text-slate-300">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Chrome className="w-4 h-4 text-emerald-400" />
                  <span>En Chrome para Android:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300">
                  <li>Toca el botón <strong className="text-white font-bold">"Instalar Aplicación"</strong> de arriba.</li>
                  <li>O pulsa el menú de 3 puntos <strong className="text-[#E9C349]">⋮</strong> en la esquina superior de Chrome.</li>
                  <li>Selecciona <strong className="text-white">"Instalar aplicación"</strong> o <strong className="text-white">"Añadir a la pantalla de inicio"</strong>.</li>
                  <li>¡Listo! El ícono de Waack On aparecerá junto a tus otras apps.</li>
                </ol>
              </div>
            )}

            {activePlatformTab === 'ios' && (
              <div className="p-4 rounded-xl bg-[#121216] border border-white/10 space-y-2.5 text-xs font-mono text-slate-300">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Apple className="w-4 h-4 text-slate-200" />
                  <span>En Safari para iPhone / iPad:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300">
                  <li>Abre esta web en el navegador <strong className="text-white">Safari</strong>.</li>
                  <li>Toca el botón <strong className="text-[#E9C349]">Compartir</strong> (el ícono cuadrado con flecha hacia arriba ⎋ en la barra inferior).</li>
                  <li>Desliza hacia abajo y pulsa <strong className="text-white">"Añadir a la pantalla de inicio"</strong>.</li>
                  <li>Pulsa <strong className="text-[#E9C349]">Añadir</strong> en la esquina superior derecha.</li>
                </ol>
              </div>
            )}

            {activePlatformTab === 'desktop' && (
              <div className="p-4 rounded-xl bg-[#121216] border border-white/10 space-y-2.5 text-xs font-mono text-slate-300">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Laptop className="w-4 h-4 text-blue-400" />
                  <span>En Chrome / Edge para Windows / macOS:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300">
                  <li>Haz clic en el ícono de instalación <strong className="text-[#E9C349]">⊕</strong> en la barra de direcciones del navegador.</li>
                  <li>O haz clic en el botón <strong className="text-white">"Instalar Aplicación"</strong> de esta ventana.</li>
                  <li>La app se abrirá en una ventana independiente y podrás anclarla a la barra de tareas.</li>
                </ol>
              </div>
            )}
          </div>

          {/* Push Notifications Quick Connection inside App */}
          <div className="p-4 rounded-2xl bg-[#141418] border border-[#E9C349]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#E9C349]/10 text-[#E9C349] border border-[#E9C349]/30">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">Notificaciones Push de la App</h5>
                <p className="text-[11px] text-slate-400">
                  {pushState.permission === 'granted' ? 'Notificaciones ya autorizadas en este dispositivo.' : 'Permite que la app te envíe alertas sonoras de lives y feedback.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {pushState.permission !== 'granted' ? (
                <button
                  type="button"
                  onClick={handleEnablePushInApp}
                  className="px-3.5 py-1.5 bg-[#E9C349] hover:bg-[#ffdf6b] text-black font-mono text-xs font-black rounded-xl shadow cursor-pointer uppercase"
                >
                  Activar Push
                </button>
              ) : (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl font-mono text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Push Activo</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#121215] border-t border-white/10 flex items-center justify-between gap-3 text-xs font-mono text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Waack On PWA Platform • Cero publicidad</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenNotifications && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenNotifications();
                }}
                className="px-3 py-1.5 text-xs text-[#E9C349] hover:underline font-bold"
              >
                Ver Notificaciones
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
