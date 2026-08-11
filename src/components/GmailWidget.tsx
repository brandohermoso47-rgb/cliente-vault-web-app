import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Send, RefreshCw, X, AlertCircle, CheckCircle2, UserCheck, Inbox } from 'lucide-react';
import { signInForGmail, fetchGmailMessages, sendGmailEmail, getGmailAccessToken, GmailMessageSummary } from '../gmail';

interface GmailWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRecipientEmail?: string;
  defaultSubject?: string;
}

export const GmailWidget: React.FC<GmailWidgetProps> = ({
  isOpen,
  onClose,
  defaultRecipientEmail = '',
  defaultSubject = '[Waack On] Feedback de Entrenamiento'
}) => {
  const [token, setToken] = useState<string | null>(getGmailAccessToken());
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose'>('inbox');

  // Form state
  const [recipient, setRecipient] = useState<string>(defaultRecipientEmail);
  const [subject, setSubject] = useState<string>(defaultSubject);
  const [bodyText, setBodyText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [sendSuccess, setSendSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (defaultRecipientEmail) setRecipient(defaultRecipientEmail);
    if (defaultSubject) setSubject(defaultSubject);
  }, [defaultRecipientEmail, defaultSubject]);

  const handleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const newToken = await signInForGmail();
      setToken(newToken);
      await loadInbox(newToken);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al autenticar con Gmail.');
    } finally {
      setLoading(false);
    }
  };

  const loadInbox = async (authToken?: string) => {
    setLoading(true);
    setErrorMsg(null);
    const result = await fetchGmailMessages(authToken || token || undefined);
    if (result.error === 'AUTH_REQUIRED') {
      setToken(null);
    } else if (result.error) {
      setErrorMsg(result.error);
    } else {
      setMessages(result.messages);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && token) {
      loadInbox();
    }
  }, [isOpen]);

  const handleInitiateSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !subject.trim() || !bodyText.trim()) return;
    setShowConfirmModal(true);
  };

  const handleConfirmSend = async () => {
    setShowConfirmModal(false);
    setSending(true);
    setErrorMsg(null);
    setSendSuccess(false);

    const result = await sendGmailEmail({
      to: recipient.trim(),
      subject: subject.trim(),
      body: bodyText.trim()
    }, token || undefined);

    setSending(false);
    if (result.success) {
      setSendSuccess(true);
      setBodyText('');
      setTimeout(() => setSendSuccess(false), 5000);
    } else if (result.error === 'AUTH_REQUIRED') {
      setToken(null);
      setErrorMsg('Tu sesión de Gmail expiró. Por favor inicia sesión de nuevo.');
    } else {
      setErrorMsg(result.error || 'No se pudo enviar el correo.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0F0B1E] border border-white/20 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-white relative shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                Gmail para Waack On
              </h3>
              <p className="text-xs text-slate-400">
                Notificaciones y correos de cátedra directamente desde tu cuenta oficial.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Required State */}
        {!token ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <Mail className="w-8 h-8" />
            </div>

            <div className="max-w-md space-y-2">
              <h4 className="text-base font-bold text-white uppercase">
                Conecta tu cuenta de Gmail
              </h4>
              <p className="text-xs text-slate-300">
                Inicia sesión con Google para recibir notificaciones de tareas, enviar feedback de baile y comunicarte con los instructores.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Official Material Sign In with Google Button */}
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="bg-white hover:bg-slate-100 text-slate-900 font-bold px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{loading ? 'Conectando...' : 'Iniciar Sesión con Google'}</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 pt-4 space-y-4">
            {/* Subtabs */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('inbox')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'inbox'
                      ? 'bg-[#E9C349] text-black shadow-md'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <Inbox className="w-3.5 h-3.5" /> Bandeja ({messages.length})
                </button>
                <button
                  onClick={() => setActiveTab('compose')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'compose'
                      ? 'bg-[#E9C349] text-black shadow-md'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" /> Redactar Correo
                </button>
              </div>

              <button
                onClick={() => loadInbox()}
                disabled={loading}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-all text-xs flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {sendSuccess && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>¡Correo enviado con éxito a través de Gmail!</span>
              </div>
            )}

            {/* Tab: Inbox */}
            {activeTab === 'inbox' && (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {loading && messages.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
                    Cargando mensajes de Gmail...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No se encontraron correos recientes en tu bandeja de entrada.
                  </div>
                ) : (
                  (messages || []).map((msg) => (
                    <div
                      key={msg.id}
                      className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span className="truncate max-w-[250px]">{msg.from}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{msg.date?.slice(0, 16)}</span>
                      </div>
                      <p className="text-xs font-semibold text-[#E9C349] truncate">{msg.subject}</p>
                      <p className="text-[11px] text-slate-300 line-clamp-2">{msg.snippet}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Compose */}
            {activeTab === 'compose' && (
              <form onSubmit={handleInitiateSend} className="space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Para (Email del Destinatario):</label>
                    <input
                      type="email"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="estudiante@ejemplo.com"
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E9C349]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Asunto:</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Feedback de Evaluación - Cátedra Waack On"
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E9C349]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Mensaje:</label>
                    <textarea
                      value={bodyText}
                      onChange={(e) => setBodyText(e.target.value)}
                      rows={5}
                      placeholder="Escribe aquí las observaciones, acentos técnicos o mensajes de cátedra..."
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E9C349] resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={sending || !recipient || !subject || !bodyText}
                    className="px-6 py-2.5 rounded-xl bg-[#E9C349] text-black font-extrabold text-xs uppercase shadow-lg hover:bg-yellow-300 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" /> Enviar Correo
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Mandatory User Confirmation Dialog before sending */}
        <AnimatePresence>
          {showConfirmModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-[#120E24] border border-[#E9C349]/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-white"
              >
                <div className="flex items-center gap-3 text-yellow-400">
                  <AlertCircle className="w-6 h-6" />
                  <h4 className="text-sm font-black uppercase tracking-tight">
                    Confirmar Envío de Correo
                  </h4>
                </div>

                <div className="space-y-2 text-xs text-slate-300 bg-black/40 p-3 rounded-2xl border border-white/10">
                  <p><strong>Destinatario:</strong> {recipient}</p>
                  <p><strong>Asunto:</strong> {subject}</p>
                  <p className="line-clamp-3"><strong>Contenido:</strong> {bodyText}</p>
                </div>

                <p className="text-[11px] text-slate-400">
                  ¿Estás seguro de que deseas enviar este correo electrónico a través de la API oficial de Gmail?
                </p>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmSend}
                    className="px-5 py-2 rounded-xl bg-[#E9C349] text-black text-xs font-black uppercase shadow-lg hover:bg-yellow-300 transition-all"
                  >
                    Sí, Enviar Correo
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
