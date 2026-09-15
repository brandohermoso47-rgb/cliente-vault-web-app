import React, { useState, useEffect } from 'react';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  Upload, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Sparkles, 
  X, 
  CheckCircle2, 
  ZoomIn, 
  Clipboard, 
  Trash2, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface AnnouncementImagePickerProps {
  selectedImage: string | null;
  onImageChange: (imageUrl: string | null) => void;
  language?: string;
}

const PRESET_POSTERS = [
  {
    id: 'preset-battle',
    title: 'Flyer Oficial - Batalla Waack On',
    category: 'Competencia',
    url: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'preset-masterclass',
    title: 'Afiche - Masterclass & Intensivo HD',
    category: 'Clase',
    url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'preset-[#D9A9FF]',
    title: 'Afiche - Jamming & Freestyle Disco',
    category: 'Sesión',
    url: 'https://images.unsplash.com/photo-1535525153412-5a42439e2b0d?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'preset-news',
    title: 'Comunicado Oficial - Disco Spotlight',
    category: 'Comunicado',
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'preset-stage',
    title: 'Gran Escenario - Presentación en Vivo',
    category: 'Evento',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'preset-vogue-waack',
    title: 'Cartel Retro 70s - Posing & Attitude',
    category: 'Especial',
    url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=1200'
  }
];

export default function AnnouncementImagePicker({
  selectedImage,
  onImageChange,
  language = 'es'
}: AnnouncementImagePickerProps) {
  const [activeSourceTab, setActiveSourceTab] = useState<'upload' | 'url' | 'presets' | 'paste'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [lightboxPreview, setLightboxPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageSourceLabel, setImageSourceLabel] = useState<string>('Imagen Adjunta');

  // Paste from Clipboard Listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const result = event.target?.result as string;
              if (result) {
                onImageChange(result);
                setImageSourceLabel('📋 Pegado del Portapapeles');
              }
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onImageChange]);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(language === 'es' ? 'Por favor selecciona un archivo de imagen válido.' : 'Please select a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onImageChange(result);
        setImageSourceLabel('📱 Cargado desde Dispositivo');
      }
    };
    reader.readAsDataURL(file);

    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const storageRef = ref(storage, `announcements/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      onImageChange(downloadUrl);
      setImageSourceLabel('☁️ Firebase Storage');
    } catch (err) {
      console.warn('Firebase Storage announcement upload notice:', err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://') && !urlInput.startsWith('data:image')) {
      setUrlError(language === 'es' ? 'Ingresa una URL que comience con http:// o https://' : 'Please enter a valid URL starting with http:// or https://');
      return;
    }
    setUrlError(null);
    onImageChange(urlInput.trim());
    setImageSourceLabel('🌐 Enlace de Imagen Web');
  };

  return (
    <div className="space-y-3 bg-[#0A0A0E] border border-[#262626] rounded-2xl p-4 text-xs font-sans">
      {/* Header Label */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[#D9A9FF]" />
          <span className="font-mono font-bold text-white uppercase tracking-wider text-[11px]">
            {language === 'es' ? 'Imagen del Anuncio / Afiche Oficial' : 'Announcement Image / Official Flyer'}
          </span>
        </div>
        <span className="text-[9px] font-mono font-semibold text-[#D9A9FF] bg-[#D9A9FF]/10 px-2 py-0.5 rounded border border-[#D9A9FF]/20">
          HD VISUAL
        </span>
      </div>

      {/* IF IMAGE IS SELECTED: SHOW RICH PREVIEW */}
      {selectedImage ? (
        <div className="space-y-2">
          <div className="relative rounded-xl overflow-hidden border-2 border-[#D9A9FF]/60 bg-black group shadow-xl">
            <img
              src={selectedImage}
              alt="Vista previa del anuncio"
              className="w-full h-44 object-cover group-hover:scale-102 transition-transform duration-300"
            />

            {/* Top Source Badge */}
            <div className="absolute top-2.5 left-2.5 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15 text-[10px] font-mono text-[#D9A9FF] font-bold flex items-center gap-1.5 shadow-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{imageSourceLabel}</span>
            </div>

            {/* Action Buttons Overlay */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setLightboxPreview(selectedImage)}
                className="p-2 bg-black/80 hover:bg-[#D9A9FF] hover:text-black text-white rounded-lg transition-all border border-white/20 shadow-lg flex items-center gap-1"
                title={language === 'es' ? 'Ampliar Vista Previa' : 'Expand Preview'}
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span className="text-[9px] font-bold font-mono uppercase hidden sm:inline">Ampliar</span>
              </button>

              <button
                type="button"
                onClick={() => onImageChange(null)}
                className="p-2 bg-black/80 hover:bg-red-600 text-white rounded-lg transition-all border border-white/20 shadow-lg flex items-center gap-1"
                title={language === 'es' ? 'Quitar Imagen' : 'Remove Image'}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="text-[9px] font-bold font-mono uppercase hidden sm:inline">Quitar</span>
              </button>
            </div>

            {/* Bottom Info bar */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 pt-6 flex items-center justify-between">
              <span className="text-[10px] text-slate-300 font-medium truncate max-w-[240px]">
                {language === 'es' ? 'Listo para ser publicado en el tablero de anuncios' : 'Ready for bulletin board publishing'}
              </span>
              <button
                type="button"
                onClick={() => onImageChange(null)}
                className="text-[10px] text-[#D9A9FF] underline hover:text-white font-mono font-bold"
              >
                {language === 'es' ? 'Cambiar Imagen' : 'Change Image'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* IF NO IMAGE: SHOW SOURCE SELECTION TABS */
        <div className="space-y-3">
          {/* Source Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-[#121217] rounded-xl border border-white/5">
            {[
              { id: 'upload', label: language === 'es' ? '📁 Archivo' : '📁 File', icon: Upload },
              { id: 'url', label: language === 'es' ? '🌐 Enlace URL' : '🌐 Web URL', icon: LinkIcon },
              { id: 'presets', label: language === 'es' ? '🖼️ Galería' : '🖼️ Presets', icon: Sparkles },
              { id: 'paste', label: language === 'es' ? '📋 Pegar' : '📋 Paste', icon: Clipboard },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveSourceTab(tab.id as any);
                    setUrlError(null);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeSourceTab === tab.id
                      ? 'bg-[#D9A9FF] text-black font-black shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: FILE UPLOAD / DRAG & DROP */}
          {activeSourceTab === 'upload' && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-5 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#D9A9FF] bg-[#D9A9FF]/10'
                  : 'border-[#262626] hover:border-[#D9A9FF]/50 bg-[#121216] hover:bg-[#17171d]'
              }`}
            >
              <div className="p-3 bg-[#D9A9FF]/10 border border-[#D9A9FF]/30 rounded-full text-[#D9A9FF]">
                <Upload className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-mono font-bold text-white block">
                  {language === 'es' ? 'Arrastra tu afiche aquí o haz clic para examinar' : 'Drag your flyer here or click to browse'}
                </span>
                <span className="text-[10px] text-[#8A8A8A] block font-medium">
                  {language === 'es' ? 'Soporta PNG, JPG, WEBP o GIF desde tu celular/PC' : 'Supports PNG, JPG, WEBP, or GIF'}
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                className="hidden"
                id="ann-file-picker-input"
              />
              <label
                htmlFor="ann-file-picker-input"
                className="mt-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer"
              >
                {language === 'es' ? 'Seleccionar Imagen Local' : 'Select Local Image'}
              </label>
            </div>
          )}

          {/* TAB 2: WEB URL */}
          {activeSourceTab === 'url' && (
            <form onSubmit={handleApplyUrl} className="space-y-2.5 bg-[#121216] p-3.5 rounded-xl border border-white/5">
              <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block">
                {language === 'es' ? 'Pega el enlace directo de la imagen (Unsplash, Imgur, etc.):' : 'Paste direct image link:'}
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 bg-[#0A0A0D] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#D9A9FF] font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D9A9FF] hover:bg-[#B87CFF] text-black font-mono font-black text-xs rounded-xl uppercase transition-all shrink-0"
                >
                  {language === 'es' ? 'Cargar' : 'Load'}
                </button>
              </div>
              {urlError && (
                <div className="text-[10px] text-red-400 font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{urlError}</span>
                </div>
              )}
            </form>
          )}

          {/* TAB 3: PRESET GALLERY */}
          {activeSourceTab === 'presets' && (
            <div className="space-y-2 bg-[#121216] p-3 rounded-xl border border-white/5">
              <span className="text-[10px] font-mono font-bold text-[#8A8A8A] uppercase block">
                {language === 'es' ? 'Selecciona un afiche prediseñado oficial de Waack On:' : 'Select an official Waack On preset flyer:'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {PRESET_POSTERS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      onImageChange(preset.url);
                      setImageSourceLabel(`🖼️ ${preset.title}`);
                    }}
                    className="relative rounded-lg overflow-hidden border border-white/10 hover:border-[#D9A9FF] group text-left transition-all bg-black/60 aspect-video"
                  >
                    <img
                      src={preset.url}
                      alt={preset.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent p-1.5 flex flex-col justify-end">
                      <span className="text-[8px] font-mono font-bold text-[#D9A9FF] uppercase bg-black/80 px-1 rounded w-max">
                        {preset.category}
                      </span>
                      <span className="text-[9px] font-extrabold text-white truncate leading-tight mt-0.5">
                        {preset.title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CLIPBOARD PASTE INSTRUCTIONS */}
          {activeSourceTab === 'paste' && (
            <div className="p-4 bg-[#121216] border border-white/10 rounded-xl text-center space-y-2">
              <div className="p-2.5 bg-[#D9A9FF]/10 border border-[#D9A9FF]/30 rounded-full w-max mx-auto text-[#D9A9FF]">
                <Clipboard className="w-5 h-5" />
              </div>
              <h5 className="text-xs font-mono font-bold text-white uppercase">
                {language === 'es' ? 'Pegar captura o imagen desde el portapapeles' : 'Paste screenshot or image from clipboard'}
              </h5>
              <p className="text-[10px] text-[#8A8A8A] font-medium leading-relaxed max-w-sm mx-auto">
                {language === 'es'
                  ? 'Copia cualquier imagen o captura de pantalla en tu computadora/celular y presiona Ctrl + V (o Cmd + V) estando en esta pantalla.'
                  : 'Copy any screenshot or image to your clipboard and press Ctrl + V (or Cmd + V) anywhere on this form.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* LIGHTBOX MODAL FOR IMAGE PREVIEW */}
      {lightboxPreview && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-[#121212] border border-[#D9A9FF]/50 rounded-2xl overflow-hidden p-3 shadow-2xl">
            <button
              type="button"
              onClick={() => setLightboxPreview(null)}
              className="absolute top-4 right-4 p-2 bg-black/80 hover:bg-red-600 text-white rounded-full transition-all border border-white/20 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxPreview}
              alt="Vista previa ampliada"
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
            <div className="mt-3 flex items-center justify-between text-xs font-mono text-[#8A8A8A] px-2">
              <span>{language === 'es' ? 'Afiche Oficial de Anuncio' : 'Official Announcement Flyer'}</span>
              <button
                type="button"
                onClick={() => setLightboxPreview(null)}
                className="text-[#D9A9FF] font-bold underline"
              >
                {language === 'es' ? 'Cerrar Vista Previa' : 'Close Preview'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
