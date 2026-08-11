import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Video, 
  Image as ImageIcon, 
  Sparkles, 
  Sliders, 
  Play, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  Zap, 
  Cpu, 
  Film, 
  Maximize2 
} from 'lucide-react';

export default function AiStudioView() {
  const [activeTool, setActiveTool] = useState<'video' | 'image'>('video');

  // Video Analysis State
  const [videoPrompt, setVideoPrompt] = useState('Analizar técnica de arm-rolls, velocidad de rotación y precisión postural en la intro de Waacking.');
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoAnalysisResult, setVideoAnalysisResult] = useState<string | null>(null);
  const [selectedVideoSample, setSelectedVideoSample] = useState<string>('sample-1.mp4');

  // Image Generation State
  const [imagePrompt, setImagePrompt] = useState('Bailarina profesional de Waacking en un escenario underground iluminado con luces de neón dorado y sombras dramáticas, estética 70s Soul Train.');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9'>('16:9');
  const [selectedImageModel, setSelectedImageModel] = useState<'gemini-3.1-flash-image' | 'gemini-3-pro-image'>('gemini-3.1-flash-image');
  const [imageLoading, setImageLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [imageTextResult, setImageTextResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyzeVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setVideoLoading(true);
    setVideoAnalysisResult(null);

    try {
      const res = await fetch('/api/ai/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoPrompt,
          mimeType: 'video/mp4'
        })
      });
      const data = await res.json();
      if (data.success) {
        setVideoAnalysisResult(data.analysis);
      } else {
        setVideoAnalysisResult('Error al analizar el video. Intenta nuevamente.');
      }
    } catch (err) {
      setVideoAnalysisResult('Error de conexión con el servidor de análisis de video con Gemini Pro.');
    } finally {
      setVideoLoading(false);
    }
  };

  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setImageLoading(true);
    setGeneratedImageUrl(null);
    setImageTextResult(null);

    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio,
          model: selectedImageModel
        })
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        setImageTextResult(data.text);
      } else {
        alert(data.error || 'Error al generar la imagen');
      }
    } catch (err: any) {
      alert('Error de conexión al generar imagen: ' + err.message);
    } finally {
      setImageLoading(false);
    }
  };

  const aspectRatiosList = [
    { label: '1:1 (Cuadrado)', value: '1:1' },
    { label: '16:9 (Cinemático)', value: '16:9' },
    { label: '9:16 (Story / Reel)', value: '9:16' },
    { label: '4:3 (Estándar)', value: '4:3' },
    { label: '3:4 (Vertical)', value: '3:4' },
    { label: '3:2 (Fotografía)', value: '3:2' },
    { label: '2:3 (Retrato)', value: '2:3' },
    { label: '21:9 (Ultra Wide)', value: '21:9' }
  ];

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-[#221f1f] to-[#161616] border border-white/10 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest bg-[#E9C349]/20 text-[#E9C349] font-bold uppercase border border-[#E9C349]/30">
              Gemini Multimodal Studio
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest bg-pink-500/20 text-pink-400 font-bold uppercase">
              Pro & Flash
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-tight">
            AI Studio: Video & Image Lab
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Analiza movimientos de baile con <code className="text-[#E9C349]">gemini-3.1-pro-preview</code> y genera arte y afiches con control total de aspect ratios.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#101010] p-1.5 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTool('video')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
              activeTool === 'video'
                ? 'bg-[#E9C349] text-black shadow-lg font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            Análisis de Video (Pro)
          </button>
          <button
            onClick={() => setActiveTool('image')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
              activeTool === 'image'
                ? 'bg-[#E9C349] text-black shadow-lg font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Generador de Imágenes
          </button>
        </div>
      </div>

      {/* Tool 1: Video Analysis */}
      {activeTool === 'video' && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Controls Panel */}
          <div className="lg:col-span-6 bg-[#1a1919] border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
            <form onSubmit={handleAnalyzeVideo} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono text-slate-300 uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-[#E9C349]" />
                    Modelo Activo: gemini-3.1-pro-preview
                  </label>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">Alta Precisión Multimodal</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Sube o selecciona un video de coreografía de Waacking para que Gemini Pro analice posturas, velocidad de muñecas, isolaciones y ritmo.
                </p>

                {/* Sample Video Selector */}
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Seleccionar muestra de video de práctica:</label>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { id: 'sample-1.mp4', title: 'Waacking Arm Rolls 120 BPM' },
                    { id: 'sample-2.mp4', title: 'Posing & Lines Intro' },
                    { id: 'sample-3.mp4', title: 'Fast Punking Battle' }
                  ].map((sample) => (
                    <button
                      type="button"
                      key={sample.id}
                      onClick={() => setSelectedVideoSample(sample.id)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${
                        selectedVideoSample === sample.id
                          ? 'border-[#E9C349] bg-[#E9C349]/10 text-white font-bold'
                          : 'border-white/10 bg-[#121212] text-slate-400 hover:border-white/30'
                      }`}
                    >
                      <Film className="w-4 h-4 text-[#E9C349] mb-1.5" />
                      {sample.title}
                    </button>
                  ))}
                </div>

                <label className="block text-xs font-medium text-slate-300 mb-1.5">Enfoque de Análisis / Prompt:</label>
                <textarea
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  rows={4}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#E9C349] transition-colors resize-none font-sans"
                  placeholder="Describe qué aspectos técnicos deseas que Gemini analice..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={videoLoading}
                className="w-full py-3.5 bg-[#E9C349] hover:bg-[#d8b23c] text-black font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {videoLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analizando Video con Gemini Pro...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Ejecutar Análisis de Video Pro
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-6 bg-[#1a1919] border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-[#E9C349]" />
                Resultado del Análisis Técnico
              </h3>
              {videoAnalysisResult && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(videoAnalysisResult);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 bg-[#121212] px-2.5 py-1.5 rounded-lg border border-white/10"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              )}
            </div>

            <div className="flex-1 bg-[#121212] border border-white/10 rounded-xl p-5 overflow-y-auto max-h-[420px] custom-scrollbar">
              {videoLoading ? (
                <div className="h-full flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full border-2 border-[#E9C349] border-t-transparent animate-spin" />
                  <p className="text-sm font-mono text-slate-300 animate-pulse">
                    Procesando fotogramas de video con modelo <code className="text-[#E9C349]">gemini-3.1-pro-preview</code>...
                  </p>
                </div>
              ) : videoAnalysisResult ? (
                <div className="space-y-4 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {videoAnalysisResult}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-16 text-center space-y-3 text-slate-500">
                  <Video className="w-12 h-12 stroke-[1.5] text-slate-600" />
                  <p className="text-sm">Selecciona una muestra y ejecuta el análisis para recibir retroalimentación experta impulsada por IA.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Tool 2: Image Generation with Aspect Ratios */}
      {activeTool === 'image' && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Controls Panel */}
          <div className="lg:col-span-6 bg-[#1a1919] border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
            <form onSubmit={handleGenerateImage} className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono text-slate-300 uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-[#E9C349]" />
                    Generador Visual Gemini
                  </label>
                  <select
                    value={selectedImageModel}
                    onChange={(e: any) => setSelectedImageModel(e.target.value)}
                    className="bg-[#121212] border border-white/10 text-xs text-[#E9C349] font-mono rounded-lg px-2 py-1 focus:outline-none"
                  >
                    <option value="gemini-3.1-flash-image">gemini-3.1-flash-image</option>
                    <option value="gemini-3-pro-image">gemini-3-pro-image (Studio)</option>
                  </select>
                </div>

                <label className="block text-xs font-medium text-slate-300 mb-1.5">Prompt Creativo (Afiche, Vestuario, Concept Art de Waacking):</label>
                <textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  rows={3}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#E9C349] transition-colors resize-none font-sans"
                  placeholder="Describe la imagen que deseas generar..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#E9C349]" />
                  Seleccionar Relación de Aspecto (Aspect Ratio):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {aspectRatiosList.map((ar) => (
                    <button
                      type="button"
                      key={ar.value}
                      onClick={() => setAspectRatio(ar.value as any)}
                      className={`py-2 px-3 rounded-xl border text-xs font-mono transition-all flex flex-col items-center justify-center gap-1 ${
                        aspectRatio === ar.value
                          ? 'border-[#E9C349] bg-[#E9C349]/15 text-[#E9C349] font-bold shadow-md'
                          : 'border-white/10 bg-[#121212] text-slate-400 hover:border-white/30'
                      }`}
                    >
                      <span className="text-[11px] font-bold">{ar.value}</span>
                      <span className="text-[9px] text-slate-500">{ar.label.split(' ')[1] || ''}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={imageLoading}
                className="w-full py-3.5 bg-[#E9C349] hover:bg-[#d8b23c] text-black font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {imageLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generando Imagen ({aspectRatio})...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generar Imagen con Aspect Ratio {aspectRatio}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Image Display Panel */}
          <div className="lg:col-span-6 bg-[#1a1919] border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center min-h-[400px]">
            {imageLoading ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-16 text-center">
                <div className="w-12 h-12 rounded-full border-2 border-[#E9C349] border-t-transparent animate-spin" />
                <p className="text-sm font-mono text-slate-300 animate-pulse">
                  Renderizando imagen con <code className="text-[#E9C349]">{selectedImageModel}</code> en proporción <span className="text-[#E9C349] font-bold">{aspectRatio}</span>...
                </p>
              </div>
            ) : generatedImageUrl ? (
              <div className="w-full space-y-4 flex flex-col items-center">
                <div className="relative group w-full rounded-xl overflow-hidden border border-white/10 bg-black flex items-center justify-center p-2">
                  <img
                    src={generatedImageUrl}
                    alt="Generada por Gemini AI"
                    className="max-h-[360px] object-contain rounded-lg shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                  <a
                    href={generatedImageUrl}
                    download="waack-ai-artwork.png"
                    className="absolute bottom-4 right-4 bg-black/80 hover:bg-black text-white p-2.5 rounded-xl border border-white/20 shadow-lg flex items-center gap-1.5 text-xs font-mono transition-transform hover:scale-105"
                  >
                    <Download className="w-4 h-4 text-[#E9C349]" />
                    Descargar
                  </a>
                </div>
                {imageTextResult && (
                  <p className="text-xs text-slate-400 italic text-center px-4">
                    "{imageTextResult}"
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center space-y-3 text-slate-500 py-16">
                <ImageIcon className="w-12 h-12 stroke-[1.5] text-slate-600" />
                <p className="text-sm">Configura tu prompt y relación de aspecto para generar piezas visuales únicas para tu academia de Waacking.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
