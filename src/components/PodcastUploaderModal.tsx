import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Music, 
  Sparkles, 
  Radio, 
  Calendar, 
  FileAudio, 
  Plus, 
  Check, 
  AlertCircle,
  HelpCircle,
  Layers,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { PodcastShow, PodcastEpisode, User } from '../types';

interface PodcastUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSavePodcast: (podcast: PodcastShow) => void;
  onAddEpisode?: (podcastId: string, episode: PodcastEpisode) => void;
  onAddBatchEpisodes?: (podcastId: string, episodes: PodcastEpisode[]) => void;
  existingPodcast?: PodcastShow | null;
  mode?: 'create_show' | 'add_episode' | 'batch_upload';
}

export interface BatchEpisodeItem {
  id: string;
  file: File;
  fileName: string;
  title: string;
  description: string;
  seasonNumber: number;
  episodeNumber: number;
  status: 'draft' | 'published';
  audioUrl: string;
}

const CATEGORIES = [
  'Historia & Cultura',
  'Biomecánica & Técnica',
  'Musicalidad & Síncopa',
  'Entrevistas & Charlas',
  'Análisis de Batallas',
  'Mentalidad & Freestyle',
  'General'
];

export default function PodcastUploaderModal({
  isOpen,
  onClose,
  currentUser,
  onSavePodcast,
  onAddEpisode,
  onAddBatchEpisodes,
  existingPodcast,
  mode = 'create_show'
}: PodcastUploaderModalProps) {
  const [currentMode, setCurrentMode] = useState<'create_show' | 'add_episode' | 'batch_upload'>(mode);

  // Show Form State
  const [showTitle, setShowTitle] = useState(existingPodcast?.title || '');
  const [showDescription, setShowDescription] = useState(existingPodcast?.description || '');
  const [showCategory, setShowCategory] = useState(existingPodcast?.category || 'Historia & Cultura');
  const [showStatus, setShowStatus] = useState<'active' | 'archived'>(existingPodcast?.status || 'active');
  const [coverImage, setCoverImage] = useState<string>(
    existingPodcast?.coverImage || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800'
  );
  const [coverDragging, setCoverDragging] = useState(false);

  // Episode Form State
  const [epTitle, setEpTitle] = useState('');
  const [epDescription, setEpDescription] = useState('');
  const [epSeason, setEpSeason] = useState<number>(1);
  const [epNumber, setEpNumber] = useState<number>((existingPodcast?.episodes?.length || 0) + 1);
  const [epPublishDate, setEpPublishDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [epStatus, setEpStatus] = useState<'draft' | 'published'>('published');
  const [epAudioUrl, setEpAudioUrl] = useState<string>('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
  const [epAudioName, setEpAudioName] = useState<string>('episodio_audio_master.mp3');
  const [epArtwork, setEpArtwork] = useState<string>('');

  // Batch Upload Form State
  const [batchItems, setBatchItems] = useState<BatchEpisodeItem[]>([]);
  const [batchGlobalStatus, setBatchGlobalStatus] = useState<'draft' | 'published'>('published');
  const [batchSeason, setBatchSeason] = useState<number>(1);
  const batchAudioFileRef = useRef<HTMLInputElement | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState(false);

  const coverFileRef = useRef<HTMLInputElement | null>(null);
  const audioFileRef = useRef<HTMLInputElement | null>(null);


  if (!isOpen) return null;

  // Handle Cover Art File Selection / Drag & Drop
  const handleCoverFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFormError('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCoverImage(e.target.result as string);
        setFormError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Audio File Selection
  const handleAudioFileSelect = (file: File) => {
    const validFormats = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-m4a', 'audio/m4a'];
    if (!validFormats.some(fmt => file.type.includes(fmt) || file.name.endsWith('.mp3') || file.name.endsWith('.wav') || file.name.endsWith('.m4a'))) {
      setFormError('Selecciona un archivo de audio válido (.mp3, .m4a, .wav).');
      return;
    }
    setEpAudioName(file.name);
    // Create local object URL for instant preview playback
    const url = URL.createObjectURL(file);
    setEpAudioUrl(url);
    setFormError(null);
  };

  const handleSubmitShow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showTitle.trim()) {
      setFormError('El título del podcast es obligatorio.');
      return;
    }
    if (!showDescription.trim()) {
      setFormError('La descripción del podcast es obligatoria.');
      return;
    }
    if (!coverImage) {
      setFormError('El cover art (imagen 1:1) es obligatorio.');
      return;
    }

    const newShow: PodcastShow = {
      id: existingPodcast?.id || `pod-${Date.now()}`,
      instructorId: currentUser.id || 'inst-brando',
      instructorName: currentUser.displayName || currentUser.name || 'Profesor Waack On',
      instructorAvatar: currentUser.avatar || currentUser.photoURL,
      title: showTitle.trim(),
      description: showDescription.trim(),
      coverImage: coverImage,
      category: showCategory,
      status: showStatus,
      createdAt: existingPodcast?.createdAt || new Date().toISOString().split('T')[0],
      episodes: existingPodcast?.episodes || []
    };

    onSavePodcast(newShow);
    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      onClose();
    }, 1200);
  };

  const handleSubmitEpisode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingPodcast && !existingPodcast?.id) {
      setFormError('Primero debes crear o seleccionar un programa de podcast.');
      return;
    }
    if (!epTitle.trim()) {
      setFormError('El título del episodio es obligatorio.');
      return;
    }
    if (!epDescription.trim()) {
      setFormError('La descripción del episodio es obligatoria.');
      return;
    }
    if (!epAudioUrl) {
      setFormError('Debes subir o seleccionar un archivo de audio.');
      return;
    }

    const newEpisode: PodcastEpisode = {
      id: `ep-${Date.now()}`,
      podcastId: existingPodcast!.id,
      title: epTitle.trim(),
      description: epDescription.trim(),
      audioUrl: epAudioUrl,
      duration: '32:40',
      artworkUrl: epArtwork || existingPodcast!.coverImage,
      seasonNumber: epSeason,
      episodeNumber: epNumber,
      publishDate: epPublishDate,
      status: epStatus,
      playsCount: 0
    };

    if (onAddEpisode) {
      onAddEpisode(existingPodcast!.id, newEpisode);
    }
    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      onClose();
    }, 1200);
  };

  // Handle Batch Files Selection
  const handleBatchFilesSelect = (files: FileList | File[]) => {
    const validAudioFiles = Array.from(files).filter(file => {
      const validFormats = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-m4a', 'audio/m4a'];
      return validFormats.some(fmt => file.type.includes(fmt) || file.name.endsWith('.mp3') || file.name.endsWith('.wav') || file.name.endsWith('.m4a'));
    });

    if (validAudioFiles.length === 0) {
      setFormError('Por favor selecciona archivos de audio válidos (.mp3, .m4a, .wav).');
      return;
    }

    const startEpNumber = (existingPodcast?.episodes?.length || 0) + batchItems.length + 1;

    const newItems: BatchEpisodeItem[] = validAudioFiles.map((file, idx) => {
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const formattedTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
      
      return {
        id: `batch-${Date.now()}-${idx}`,
        file,
        fileName: file.name,
        title: formattedTitle,
        description: `Episodio ${startEpNumber + idx}: ${formattedTitle}. Tema de análisis para la comunidad de alumnos de la cátedra.`,
        seasonNumber: batchSeason,
        episodeNumber: startEpNumber + idx,
        status: batchGlobalStatus,
        audioUrl: URL.createObjectURL(file)
      };
    });

    setBatchItems(prev => [...prev, ...newItems]);
    setFormError(null);
  };

  const handleUpdateBatchItem = (id: string, field: keyof BatchEpisodeItem, value: any) => {
    setBatchItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleRemoveBatchItem = (id: string) => {
    setBatchItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmitBatchEpisodes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingPodcast && !existingPodcast?.id) {
      setFormError('Primero debes crear o seleccionar un programa de podcast.');
      return;
    }
    if (batchItems.length === 0) {
      setFormError('Por favor selecciona al menos un archivo de audio para la subida en lote.');
      return;
    }

    const newEpisodes: PodcastEpisode[] = batchItems.map((item, index) => ({
      id: `ep-batch-${Date.now()}-${index}`,
      podcastId: existingPodcast!.id,
      title: item.title.trim() || `Episodio ${item.episodeNumber}`,
      description: item.description.trim() || `Análisis exclusivo de la cátedra de ${currentUser.name}.`,
      audioUrl: item.audioUrl,
      duration: '28:15',
      artworkUrl: existingPodcast!.coverImage,
      seasonNumber: item.seasonNumber,
      episodeNumber: item.episodeNumber,
      publishDate: new Date().toISOString().split('T')[0],
      status: item.status,
      playsCount: 0
    }));

    if (onAddBatchEpisodes) {
      onAddBatchEpisodes(existingPodcast!.id, newEpisodes);
    } else if (onAddEpisode) {
      newEpisodes.forEach(ep => onAddEpisode(existingPodcast!.id, ep));
    }

    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      onClose();
    }, 1200);
  };


  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-[#0d0e1b] border-2 border-[#D9A9FF]/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(217, 169, 255,0.15)] text-white my-8 max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#D9A9FF]/20 border border-[#D9A9FF]/50 flex items-center justify-center text-[#D9A9FF]">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black font-mono tracking-wide text-white uppercase flex items-center gap-2">
                {currentMode === 'create_show' 
                  ? (existingPodcast ? 'Editar Programa de Podcast' : 'Crear Nuevo Podcast (Show)') 
                  : 'Subir Nuevo Episodio de Podcast'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Cátedra de {currentUser.name} • Incluido en tu suscripción de instructor
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Banner */}
        <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-[#D9A9FF]/30 flex items-start gap-3 shrink-0">
          <Sparkles className="w-5 h-5 text-[#D9A9FF] shrink-0 mt-0.5" />
          <div className="text-xs text-gray-300 leading-relaxed">
            <strong className="text-[#D9A9FF] font-bold">Sin monetización individual:</strong> Los podcasts forman parte de tu paquete de contenidos exclusivo. Tus alumnos registrados que se suscriban a tu perfil tendrán acceso automático sin pagos adicionales.
          </div>
        </div>

        {/* Toggle Mode Tabs (If existing podcast exists) */}
        {existingPodcast && (
          <div className="flex items-center gap-2 mt-4 bg-white/5 p-1 rounded-2xl border border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => setCurrentMode('create_show')}
              className={`flex-1 py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all ${
                currentMode === 'create_show' ? 'bg-[#D9A9FF] text-black shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              Info del Show
            </button>
            <button
              type="button"
              onClick={() => setCurrentMode('add_episode')}
              className={`flex-1 py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all ${
                currentMode === 'add_episode' ? 'bg-[#D9A9FF] text-black shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              + 1 Episodio
            </button>
            <button
              type="button"
              onClick={() => setCurrentMode('batch_upload')}
              className={`flex-1 py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                currentMode === 'batch_upload' ? 'bg-[#D9A9FF] text-black shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Subida en Lote</span>
            </button>
          </div>
        )}


        {/* Error Alert */}
        {formError && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Success Alert */}
        {successToast && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2.5 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>¡Guardado con éxito en la plataforma!</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto custom-scrollbar flex-1 pr-1 mt-4 space-y-5">
          {currentMode === 'create_show' ? (
            /* ================= CREATE / EDIT PODCAST SHOW FORM ================= */
            <form onSubmit={handleSubmitShow} className="space-y-5">
              {/* Show Title */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-gray-300 mb-1.5">
                  Título del Podcast (Show) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={showTitle}
                  onChange={(e) => setShowTitle(e.target.value)}
                  placeholder="Ej: Waack & Groove: Historias del Disco 1970s"
                  className="w-full bg-[#121426] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D9A9FF] transition-all"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-gray-300 mb-1.5">
                  Descripción General del Podcast <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={showDescription}
                  onChange={(e) => setShowDescription(e.target.value)}
                  placeholder="Explica de qué trata este programa, la temática de tu cátedra y qué aprenderán los alumnos..."
                  className="w-full bg-[#121426] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D9A9FF] transition-all resize-none"
                  required
                />
              </div>

              {/* Cover Art Drag & Drop Uploader */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-gray-300 mb-1.5">
                  Cover Art del Show (Formato Cuadrado 1:1 Obligatorio) <span className="text-red-400">*</span>
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  {/* Image Preview Box */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-[#D9A9FF]/50 bg-[#121426] flex items-center justify-center group">
                    {coverImage ? (
                      <>
                        <img
                          src={coverImage}
                          alt="Preview Cover"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-1">
                          <Upload className="w-5 h-5 text-[#D9A9FF]" />
                          <span className="text-[10px] font-mono font-bold text-white">Cambiar Imagen</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center p-4 text-center">
                        <ImageIcon className="w-8 h-8 text-[#D9A9FF] mb-1" />
                        <span className="text-[10px] text-gray-400">Sin cover seleccionado</span>
                      </div>
                    )}
                  </div>

                  {/* Dropzone Upload Trigger */}
                  <div className="sm:col-span-2">
                    <div
                      onDragOver={(e) => { e.preventDefault(); setCoverDragging(true); }}
                      onDragLeave={() => setCoverDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setCoverDragging(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleCoverFileSelect(e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => coverFileRef.current?.click()}
                      className={`p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                        coverDragging
                          ? 'border-[#D9A9FF] bg-[#D9A9FF]/10'
                          : 'border-white/20 bg-[#121426] hover:border-[#D9A9FF]/60 hover:bg-[#161933]'
                      }`}
                    >
                      <Upload className="w-6 h-6 text-[#D9A9FF] mb-2" />
                      <p className="text-xs font-bold text-white">
                        Arrastra tu imagen aquí o haz clic para examinar
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Soporta JPG, PNG, WEBP • Recomendado 800x800px (1:1)
                      </p>
                    </div>
                    <input
                      ref={coverFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleCoverFileSelect(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Category and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-gray-300 mb-1.5">
                    Categoría del Podcast
                  </label>
                  <select
                    value={showCategory}
                    onChange={(e) => setShowCategory(e.target.value)}
                    className="w-full bg-[#121426] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D9A9FF] transition-all cursor-pointer"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="bg-[#121426] text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-gray-300 mb-1.5">
                    Estado del Show
                  </label>
                  <select
                    value={showStatus}
                    onChange={(e) => setShowStatus(e.target.value as 'active' | 'archived')}
                    className="w-full bg-[#121426] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D9A9FF] transition-all cursor-pointer"
                  >
                    <option value="active" className="bg-[#121426] text-white">Activo (Visible para Alumnos)</option>
                    <option value="archived" className="bg-[#121426] text-white">Archivado (Oculto)</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-mono text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D9A9FF] to-[#f3d775] text-black font-mono text-xs font-black uppercase tracking-wider shadow-lg hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  {existingPodcast ? 'Guardar Cambios' : 'Crear Podcast Show'}
                </button>
              </div>
            </form>
          ) : currentMode === 'add_episode' ? (
            /* ================= SUBIR Y GESTIONAR EPISODIOS FORM ================= */
            <form onSubmit={handleSubmitEpisode} className="space-y-5">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-gray-300 mb-1.5">
                  Título del Episodio <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={epTitle}
                  onChange={(e) => setEpTitle(e.target.value)}
                  placeholder="Ej: Episodio 1: Aislamiento de Codos y Velocidad"
                  className="w-full bg-[#121426] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D9A9FF] transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-gray-300 mb-1.5">
                  Descripción del Episodio <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={epDescription}
                  onChange={(e) => setEpDescription(e.target.value)}
                  placeholder="Resumen del episodio, puntos clave analizados y ejercicios recomendados..."
                  className="w-full bg-[#121426] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D9A9FF] transition-all resize-none"
                  required
                />
              </div>

              {/* Audio Upload Dropzone */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-gray-300 mb-1.5">
                  Archivo de Audio (MP3, M4A, WAV) <span className="text-red-400">*</span>
                </label>

                <div
                  onClick={() => audioFileRef.current?.click()}
                  className="p-5 rounded-2xl border-2 border-dashed border-[#D9A9FF]/50 bg-[#121426] hover:border-[#D9A9FF] transition-all cursor-pointer flex flex-col items-center justify-center text-center"
                >
                  <FileAudio className="w-8 h-8 text-[#D9A9FF] mb-2" />
                  {epAudioName ? (
                    <div>
                      <p className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-400" /> Archivo Seleccionado: <span className="text-[#D9A9FF]">{epAudioName}</span>
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">Haz clic para reemplazar el archivo de audio</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-white">Haz clic para subir o arrastra tu archivo de audio</p>
                      <p className="text-[10px] text-gray-400 mt-1">Formatos permitidos: MP3, M4A, WAV (hasta 100MB)</p>
                    </div>
                  )}
                </div>

                <input
                  ref={audioFileRef}
                  type="file"
                  accept="audio/mp3,audio/m4a,audio/wav,audio/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleAudioFileSelect(e.target.files[0]);
                    }
                  }}
                />
              </div>

              {/* Season, Episode Number, Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-gray-300 mb-1">
                    Nº Temporada
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={epSeason}
                    onChange={(e) => setEpSeason(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#121426] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D9A9FF]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-gray-300 mb-1">
                    Nº Episodio
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={epNumber}
                    onChange={(e) => setEpNumber(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#121426] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D9A9FF]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-gray-300 mb-1">
                    Fecha de Publicación
                  </label>
                  <input
                    type="date"
                    value={epPublishDate}
                    onChange={(e) => setEpPublishDate(e.target.value)}
                    className="w-full bg-[#121426] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D9A9FF]"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-gray-300 mb-1.5">
                  Estado del Episodio
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 font-bold">
                    <input
                      type="radio"
                      name="epStatus"
                      value="published"
                      checked={epStatus === 'published'}
                      onChange={() => setEpStatus('published')}
                      className="accent-[#D9A9FF]"
                    />
                    <span>Publicado inmediatamente</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 font-bold">
                    <input
                      type="radio"
                      name="epStatus"
                      value="draft"
                      checked={epStatus === 'draft'}
                      onChange={() => setEpStatus('draft')}
                      className="accent-[#D9A9FF]"
                    />
                    <span>Borrador (Oculto)</span>
                  </label>
                </div>
              </div>

              {/* Submit Episode Button */}
              <div className="pt-2 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-mono text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D9A9FF] to-[#f3d775] text-black font-mono text-xs font-black uppercase tracking-wider shadow-lg hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Publicar Episodio
                </button>
              </div>
            </form>
          ) : (
            /* ================= SUBIDA MÚLTIPLE DE EPISODIOS EN LOTE (BATCH UPLOAD) ================= */
            <form onSubmit={handleSubmitBatchEpisodes} className="space-y-5">
              {/* Batch Upload Audio Files Dropzone */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-gray-300 mb-1.5">
                  Selecciona Varios Archivos de Audio a la vez (MP3, M4A, WAV) <span className="text-red-400">*</span>
                </label>

                <div
                  onClick={() => batchAudioFileRef.current?.click()}
                  className="p-6 rounded-2xl border-2 border-dashed border-[#D9A9FF]/50 bg-[#121426] hover:border-[#D9A9FF] hover:bg-[#161933] transition-all cursor-pointer flex flex-col items-center justify-center text-center group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#D9A9FF]/20 text-[#D9A9FF] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Layers className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-white">
                    Haz clic para seleccionar múltiples archivos o arrástralos aquí
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Puedes seleccionar 2, 5, 10 o más audios de una sola vez (.mp3, .m4a, .wav)
                  </p>
                </div>

                <input
                  ref={batchAudioFileRef}
                  type="file"
                  multiple
                  accept="audio/mp3,audio/m4a,audio/wav,audio/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleBatchFilesSelect(e.target.files);
                    }
                  }}
                />
              </div>

              {/* Batch items list */}
              {batchItems.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-mono font-bold text-[#D9A9FF] uppercase">
                      Archivos en Lote ({batchItems.length} episodios preparados)
                    </span>
                    <button
                      type="button"
                      onClick={() => setBatchItems([])}
                      className="text-[10px] font-mono text-red-400 hover:underline"
                    >
                      Limpiar Lote
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                    {batchItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-[#121426] border border-white/10 space-y-3 relative group"
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                          <span className="text-[10px] font-mono font-bold bg-[#D9A9FF]/20 border border-[#D9A9FF]/40 text-[#D9A9FF] px-2 py-0.5 rounded-md">
                            Nº Episodio {item.episodeNumber}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400 truncate max-w-[200px]">
                            {item.fileName}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBatchItem(item.id)}
                            className="p-1 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 text-xs transition-all"
                            title="Quitar este archivo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] font-mono font-bold text-gray-400 uppercase block mb-0.5">
                              Título del Episodio
                            </label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => handleUpdateBatchItem(item.id, 'title', e.target.value)}
                              className="w-full bg-black/40 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#D9A9FF]"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-mono font-bold text-gray-400 uppercase block mb-0.5">
                              Estado
                            </label>
                            <select
                              value={item.status}
                              onChange={(e) => handleUpdateBatchItem(item.id, 'status', e.target.value)}
                              className="w-full bg-black/40 border border-white/15 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#D9A9FF]"
                            >
                              <option value="published">Publicado</option>
                              <option value="draft">Borrador</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] font-mono font-bold text-gray-400 uppercase block mb-0.5">
                            Descripción rápida
                          </label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateBatchItem(item.id, 'description', e.target.value)}
                            className="w-full bg-black/40 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#D9A9FF]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center bg-black/20 border border-white/5 rounded-2xl">
                  <p className="text-xs text-gray-400 font-mono">
                    Ningún archivo seleccionado todavía. Haz clic arriba para elegir varios archivos mp3 o wav.
                  </p>
                </div>
              )}

              {/* Submit Batch Button */}
              <div className="pt-2 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-mono text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={batchItems.length === 0}
                  className={`px-6 py-2.5 rounded-xl text-black font-mono text-xs font-black uppercase tracking-wider shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                    batchItems.length > 0
                      ? 'bg-gradient-to-r from-[#D9A9FF] to-[#f3d775] hover:brightness-110'
                      : 'bg-gray-600 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Publicar Todos los Episodios ({batchItems.length})
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

