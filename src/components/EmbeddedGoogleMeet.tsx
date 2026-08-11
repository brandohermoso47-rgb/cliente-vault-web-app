import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Video, ExternalLink, X, Maximize2, Minimize2, ShieldCheck, RefreshCw, Volume2 } from 'lucide-react';

interface EmbeddedGoogleMeetProps {
  meetUrl: string;
  title?: string;
  instructor?: string;
  onClose?: () => void;
  isInline?: boolean;
}

export default function EmbeddedGoogleMeet({
  meetUrl,
  title = 'Clase en Vivo Google Meet',
  instructor = 'Waack On Academy',
  onClose,
  isInline = false
}: EmbeddedGoogleMeetProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Clean URL format for Google Meet
  const cleanMeetUrl = React.useMemo(() => {
    let url = meetUrl || 'https://meet.google.com/waacking-academy-live';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    return url;
  }, [meetUrl]);

  const handleRefreshIframe = () => {
    setIframeKey((prev) => prev + 1);
  };

  const content = (
    <div className={`bg-[#0c0a12] border border-blue-500/30 rounded-2xl overflow-hidden flex flex-col shadow-2xl text-white ${
      isFullscreen ? 'fixed inset-4 z-50 max-w-none m-0 h-[calc(100vh-2rem)]' : isInline ? 'w-full h-full min-h-[480px]' : 'w-full h-[600px] max-h-[85vh]'
    }`}>
      {/* Google Meet Header Toolbar */}
      <div className="bg-gradient-to-r from-[#141226] via-[#1a1733] to-[#121021] border-b border-blue-500/20 px-4 py-3 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-400/40 flex items-center justify-center shrink-0">
            <Video className="w-4 h-4 text-blue-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-black text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded uppercase shrink-0">
                GOOGLE MEET INTEGRADO
              </span>
              <span className="text-[9px] font-mono font-bold text-emerald-400 flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                CAM/MIC ACTIVO
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase truncate mt-0.5">{title}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRefreshIframe}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs border border-white/10"
            title="Recargar sala de video"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs border border-white/10"
            title={isFullscreen ? "Restaurar tamaño" : "Ampliar pantalla"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <a
            href={cleanMeetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-[10px] font-bold uppercase transition-all border border-blue-500/30 flex items-center gap-1"
            title="Abrir en pestaña externa si lo necesitas"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden sm:inline">Pestaña Externa</span>
          </a>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-all border border-rose-500/30"
              title="Salir de la reunión"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Embedded Google Meet Frame */}
      <div className="relative flex-1 bg-black overflow-hidden">
        <iframe
          key={iframeKey}
          src={cleanMeetUrl}
          title={title}
          allow="camera *; microphone *; display-capture *; autoplay *; clipboard-write *; encrypted-media *; fullscreen *"
          allowFullScreen
          loading="lazy"
          className="w-full h-full border-0 relative z-10"
        />

        {/* Informative fallback overlay if browser policies block Google Meet framing */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0f0d1b] to-[#080610] p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-3xl">
            📹
          </div>
          <div>
            <h4 className="text-base font-bold text-white uppercase">Cargando videollamada de Google Meet...</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              La sala está incrustada directamente en tu interfaz. Acepta los permisos de cámara y micrófono de tu navegador para unirte al instante.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-[#0b0914] border-t border-white/5 px-4 py-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>INCRUSTACIÓN SEGURA GOOGLE MEET • PROFESOR: {instructor.toUpperCase()}</span>
        </div>
        <span className="text-slate-500">{cleanMeetUrl}</span>
      </div>
    </div>
  );

  if (isInline) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl"
      >
        {content}
      </motion.div>
    </div>
  );
}
