import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Plus, 
  RefreshCw, 
  ExternalLink, 
  X, 
  AlertCircle, 
  Sparkles, 
  Check, 
  Search, 
  BookOpen, 
  Clock, 
  Send,
  Edit3,
  FileCheck
} from 'lucide-react';
import { 
  signInForGoogleDocs, 
  listGoogleDocs, 
  createGoogleDoc, 
  getGoogleDoc, 
  appendTextToGoogleDoc, 
  getDocsAccessToken, 
  GoogleDocItem, 
  GoogleDocContent 
} from '../googleDocs';

interface GoogleDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
  initialExportTitle?: string;
  initialExportText?: string;
}

export const GoogleDocsModal: React.FC<GoogleDocsModalProps> = ({
  isOpen,
  onClose,
  language = 'es',
  initialExportTitle = '',
  initialExportText = ''
}) => {
  const [token, setToken] = useState<string | null>(getDocsAccessToken());
  const [docs, setDocs] = useState<GoogleDocItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Doc Form
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [newDocTitle, setNewDocTitle] = useState<string>(initialExportTitle || '');
  const [newDocContent, setNewDocContent] = useState<string>(initialExportText || '');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Append Text to Selected Doc
  const [selectedDoc, setSelectedDoc] = useState<GoogleDocItem | null>(null);
  const [appendText, setAppendText] = useState<string>('');
  const [isAppending, setIsAppending] = useState<boolean>(false);
  const [confirmAppendModal, setConfirmAppendModal] = useState<boolean>(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  const triggerToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const newToken = await signInForGoogleDocs();
      setToken(newToken);
      await loadUserDocs(newToken);
      triggerToast(language === 'es' ? '¡Sesión con Google Docs iniciada!' : 'Signed in with Google Docs!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con Google Docs.');
    } finally {
      setLoading(false);
    }
  };

  const loadUserDocs = async (authToken?: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const activeToken = authToken || token || undefined;
      if (!activeToken) return;
      const fetched = await listGoogleDocs(activeToken);
      setDocs(fetched);
    } catch (err: any) {
      if (err.message?.includes('sesión') || err.message?.includes('token')) {
        setToken(null);
      } else {
        setErrorMsg(err.message || 'Error al obtener la lista de Google Docs.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && token) {
      loadUserDocs(token);
    }
    if (initialExportTitle) {
      setNewDocTitle(initialExportTitle);
    }
    if (initialExportText) {
      setNewDocContent(initialExportText);
    }
  }, [isOpen]);

  const handleCreateNewDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) {
      setErrorMsg(language === 'es' ? 'Ingresa un título para el documento.' : 'Please enter a document title.');
      return;
    }

    setIsCreating(true);
    setErrorMsg(null);
    try {
      const activeToken = token || getDocsAccessToken();
      if (!activeToken) throw new Error('No hay token activo de Google Docs.');

      // 1. Create doc
      const created = await createGoogleDoc(newDocTitle.trim(), activeToken);

      // 2. Append content if provided
      if (newDocContent.trim() && created.documentId) {
        await appendTextToGoogleDoc(created.documentId, newDocContent.trim(), activeToken);
      }

      triggerToast(language === 'es' ? `¡Documento "${newDocTitle}" creado con éxito!` : `Document "${newDocTitle}" created successfully!`);
      setNewDocTitle('');
      setNewDocContent('');
      setShowCreateForm(false);
      await loadUserDocs(activeToken);

      if (created.documentId) {
        window.open(`https://docs.google.com/document/d/${created.documentId}/edit`, '_blank');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al crear el documento en Google Docs.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleConfirmAppend = async () => {
    if (!selectedDoc || !appendText.trim()) return;

    setIsAppending(true);
    setErrorMsg(null);
    try {
      const activeToken = token || getDocsAccessToken();
      if (!activeToken) throw new Error('No hay token activo de Google Docs.');

      await appendTextToGoogleDoc(selectedDoc.id, appendText.trim(), activeToken);
      triggerToast(language === 'es' ? '¡Anotación agregada exitosamente al documento!' : 'Note added successfully to Google Doc!');
      setAppendText('');
      setSelectedDoc(null);
      setConfirmAppendModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al actualizar el documento.');
    } finally {
      setIsAppending(false);
    }
  };

  const filteredDocs = docs.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#4285F4] text-white font-extrabold text-xs px-5 py-3 rounded-full shadow-[0_10px_30px_rgba(66,133,244,0.4)] flex items-center gap-2 border border-white/20"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-[#0b0f19] border border-[#4285F4]/30 rounded-3xl p-5 sm:p-7 max-w-3xl w-full text-white relative shadow-[0_0_50px_rgba(66,133,244,0.15)] flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#4285F4]/20 border border-[#4285F4]/50 flex items-center justify-center text-[#4285F4]">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                Google Docs Workspace
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'es' ? 'Crea, visualiza y exporta apuntes de clase y diarios somáticos a Google Docs' : 'Create, view, and export class notes and somatic diaries to Google Docs'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/40 rounded-2xl text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}

        {/* Not Logged In State */}
        {!token ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 my-auto">
            <div className="w-20 h-20 rounded-full bg-[#4285F4]/10 border border-[#4285F4]/30 flex items-center justify-center text-[#4285F4] shadow-[0_0_30px_rgba(66,133,244,0.2)]">
              <FileText className="w-10 h-10" />
            </div>

            <div className="max-w-md space-y-2">
              <h4 className="text-lg font-black text-white uppercase">
                {language === 'es' ? 'Sincroniza tus Apuntes con Google Docs' : 'Sync Notes with Google Docs'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'es' 
                  ? 'Conecta tu cuenta oficial de Google para crear documentos automáticos, guardar tus bitácoras de entrenamiento somático y revisar apuntes de cátedra en cualquier dispositivo.'
                  : 'Connect your official Google account to automatically create documents, save somatic practice logs, and review lecture notes.'}
              </p>
            </div>

            {/* Official Material Sign In with Google Button */}
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="bg-white hover:bg-slate-100 text-slate-900 font-bold px-7 py-3.5 rounded-2xl flex items-center gap-3 shadow-xl hover:shadow-2xl transition-all cursor-pointer disabled:opacity-50 hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span className="font-mono text-xs uppercase tracking-wider">{loading ? 'Conectando...' : 'Iniciar Sesión con Google'}</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 pt-4 space-y-4 overflow-hidden">
            
            {/* Top Controls Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#131926] p-3 rounded-2xl border border-[#4285F4]/20">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'es' ? "Buscar en tus Google Docs..." : "Search in your Google Docs..."}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => loadUserDocs(token)}
                  disabled={loading}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                  title="Refrescar lista"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#4285F4]' : ''}`} />
                </button>

                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="px-3.5 py-2 rounded-xl bg-[#4285F4] hover:bg-[#3367d6] text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'es' ? 'Nuevo Documento' : 'New Document'}</span>
                </button>
              </div>
            </div>

            {/* Create Form Section */}
            {showCreateForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreateNewDoc}
                className="p-4 bg-[#121828] border border-[#4285F4]/40 rounded-2xl space-y-3 shrink-0"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#4285F4]" />
                    <span>{language === 'es' ? 'Crear Nuevo Documento en Google Docs' : 'Create New Google Doc'}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <input
                  type="text"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder={language === 'es' ? "Título del documento (ej: Apuntes Cátedra Waacking)" : "Document title..."}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4285F4]"
                  required
                />

                <textarea
                  value={newDocContent}
                  onChange={(e) => setNewDocContent(e.target.value)}
                  placeholder={language === 'es' ? "Escribe o pega aquí el contenido inicial o notas de la sesión..." : "Enter initial text content or session notes..."}
                  rows={3}
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4285F4] resize-none"
                />

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-slate-300 hover:text-white"
                  >
                    {language === 'es' ? 'Cancelar' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-4 py-1.5 rounded-xl bg-[#4285F4] hover:bg-[#3367d6] text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isCreating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{language === 'es' ? 'Creando...' : 'Creating...'}</span>
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>{language === 'es' ? 'Crear y Abrir' : 'Create & Open'}</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}

            {/* Document List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
              {loading && docs.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 animate-pulse flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#4285F4]" />
                  <span>{language === 'es' ? 'Obteniendo tus documentos de Google Docs...' : 'Fetching your Google Docs...'}</span>
                </div>
              ) : filteredDocs.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 bg-[#121828] border border-white/5 rounded-2xl p-6">
                  <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p>{language === 'es' ? 'No se encontraron documentos en tu Google Docs.' : 'No Google Docs found.'}</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="mt-3 px-4 py-2 bg-[#4285F4] text-white font-mono text-xs font-bold rounded-xl cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === 'es' ? 'Crear mi primer documento' : 'Create my first doc'}</span>
                  </button>
                </div>
              ) : (
                filteredDocs.map((docItem) => {
                  const isSelectedForAppend = selectedDoc?.id === docItem.id;

                  return (
                    <div
                      key={docItem.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isSelectedForAppend 
                          ? 'bg-[#4285F4]/15 border-[#4285F4] shadow-[0_0_15px_rgba(66,133,244,0.3)]'
                          : 'bg-[#121828] hover:bg-[#182033] border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#4285F4]/20 border border-[#4285F4]/40 flex items-center justify-center shrink-0 text-[#4285F4]">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate hover:text-[#4285F4] transition-colors">
                            {docItem.name}
                          </h4>
                          {docItem.modifiedTime && (
                            <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              <span>Modified: {new Date(docItem.modifiedTime).toLocaleDateString()}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => {
                            if (isSelectedForAppend) {
                              setSelectedDoc(null);
                            } else {
                              setSelectedDoc(docItem);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelectedForAppend
                              ? 'bg-[#4285F4] text-white border-[#4285F4]'
                              : 'bg-white/5 hover:bg-white/15 border-white/15 text-slate-200'
                          }`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{language === 'es' ? 'Añadir Nota' : 'Append Note'}</span>
                        </button>

                        {docItem.webViewLink && (
                          <a
                            href={docItem.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
                            title="Abrir en Google Docs"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      {/* Inline Append Note Input if selected */}
                      {isSelectedForAppend && (
                        <div className="w-full pt-3 mt-2 border-t border-[#4285F4]/30 space-y-2">
                          <p className="text-xs font-mono text-[#4285F4] font-bold">
                            {language === 'es' ? 'Añadir nuevo texto al final de este documento:' : 'Append text to end of document:'}
                          </p>
                          <textarea
                            value={appendText}
                            onChange={(e) => setAppendText(e.target.value)}
                            placeholder={language === 'es' ? "Escribe aquí la anotación, reflexión o ejercicio a añadir..." : "Type text to append..."}
                            rows={2}
                            className="w-full bg-black/60 border border-[#4285F4]/40 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4285F4] resize-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setSelectedDoc(null)}
                              className="px-3 py-1 rounded-lg bg-white/10 text-xs text-slate-300"
                            >
                              {language === 'es' ? 'Cancelar' : 'Cancel'}
                            </button>
                            <button
                              onClick={() => setConfirmAppendModal(true)}
                              disabled={!appendText.trim()}
                              className="px-4 py-1 rounded-lg bg-[#4285F4] hover:bg-[#3367d6] text-white text-xs font-bold font-mono flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <Send className="w-3 h-3" />
                              <span>{language === 'es' ? 'Guardar Anotación' : 'Save Note'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Confirmation Modal for Destructive/Mutating Document Append */}
        {confirmAppendModal && selectedDoc && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-md">
              <h4 className="text-sm font-black text-white uppercase">
                {language === 'es' ? 'Confirmar actualización del documento' : 'Confirm Document Update'}
              </h4>
              <p className="text-xs text-slate-300">
                {language === 'es' 
                  ? `¿Deseas añadir este texto al final del documento "${selectedDoc.name}" en tu Google Docs?`
                  : `Are you sure you want to append this text to "${selectedDoc.name}" in Google Docs?`}
              </p>
            </div>
            <div className="p-3 bg-black/50 border border-white/10 rounded-xl max-w-md text-left text-xs font-mono text-slate-300 max-h-24 overflow-y-auto">
              {appendText}
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setConfirmAppendModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmAppend}
                disabled={isAppending}
                className="px-5 py-2 rounded-xl bg-[#4285F4] hover:bg-[#3367d6] text-white text-xs font-bold font-mono cursor-pointer flex items-center gap-1.5"
              >
                {isAppending ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>{language === 'es' ? 'Sí, Guardar en Google Docs' : 'Yes, Save to Google Docs'}</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
