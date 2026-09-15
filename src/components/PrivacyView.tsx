import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Lock, 
  Database, 
  Video, 
  Activity, 
  Users, 
  Download, 
  CheckCircle, 
  Trash2, 
  RefreshCw, 
  ShieldCheck,
  Eye,
  FileText,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  CreditCard,
  Award,
  BookOpen,
  Sparkles,
  Clock,
  Ban,
  Scale,
  Printer,
  Search,
  HelpCircle,
  Check,
  ChevronRight,
  Copyright,
  KeyRound,
  DollarSign,
  Calendar,
  FileCheck,
  Bell
} from 'lucide-react';
import { User } from '../types';
import { Language, translations } from '../lib/translations';
import { 
  getPushPermissionState, 
  requestWebPushPermission, 
  getOrRegisterPushSubscription, 
  saveStudentInstructorPushSubscription 
} from '../lib/webPush';

interface PrivacyViewProps {
  currentUser: User;
  language: Language;
}

type LegalTab = 'all' | 'terms' | 'ip' | 'privacy';

export default function PrivacyView({ currentUser, language }: PrivacyViewProps) {
  const t = translations[language] || translations.es;

  // Active Tab State
  const [activeTab, setActiveTab] = useState<LegalTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Consent settings state backed by localStorage
  const [consents, setConsents] = useState({
    telemetry: true,
    ranking: true,
    videoCache: true,
    instructorAccess: true
  });

  const [notification, setNotification] = useState<string | null>(null);
  const [downloadingData, setDownloadingData] = useState(false);
  const [erasingData, setErasingData] = useState(false);
  const [pushStatus, setPushStatus] = useState(() => getPushPermissionState());

  const handleTogglePushNotifications = async () => {
    const granted = await requestWebPushPermission(currentUser.id);
    setPushStatus(getPushPermissionState());

    if (granted) {
      try {
        const sub = await getOrRegisterPushSubscription(currentUser.id);
        await saveStudentInstructorPushSubscription({
          userId: currentUser.id,
          pushEnabled: true,
          pushPermission: 'granted',
          pushSubscription: sub
        });
        setNotification("Notificaciones Push activadas y Endpoint guardado en tu expediente de Firestore.");
      } catch (e) {
        setNotification("Notificaciones Push activadas en tu navegador.");
      }
    } else {
      setNotification("Permiso de notificaciones del navegador no otorgado o bloqueado.");
    }
    setTimeout(() => setNotification(null), 4000);
  };

  // Load consents on mount
  useEffect(() => {
    const savedConsents = localStorage.getItem(`prowaacker_privacy_consents_${currentUser.id}`);
    if (savedConsents) {
      try {
        setConsents(JSON.parse(savedConsents));
      } catch (e) {
        console.error(e);
      }
    }
  }, [currentUser.id]);

  const saveConsentSetting = (key: keyof typeof consents, val: boolean) => {
    const updated = { ...consents, [key]: val };
    setConsents(updated);
    localStorage.setItem(`prowaacker_privacy_consents_${currentUser.id}`, JSON.stringify(updated));
    
    // Quick custom toast notification
    setNotification(`Preferencia de "${String(key)}" actualizada con éxito.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDownloadData = () => {
    setDownloadingData(true);
    
    // Format complete user data payload for ARCO compliance
    setTimeout(() => {
      const dataPayload = {
        userID: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        email: currentUser.email || 'usuario@prowaacker.com',
        points: currentUser.points,
        level: currentUser.level,
        billingStatus: currentUser.billingStatus || 'free',
        completedLessons: currentUser.completedLessons,
        exportTimestamp: new Date().toISOString(),
        complianceStandard: "GDPR / CCPA / ARCO Compliant",
        activeConsents: consents,
        legalNotice: "Waack On Academy - Documento Oficial de Exportación de Datos Personales"
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `prowaacker_user_data_${currentUser.id}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setDownloadingData(false);
      setNotification("Tu reporte de datos personales en formato JSON ha sido descargado exitosamente.");
      setTimeout(() => setNotification(null), 4000);
    }, 1200);
  };

  const handleEraseData = () => {
    if (window.confirm("¿Estás seguro de que deseas purgar tus registros de memoria local? Esta acción eliminará el caché de videos y datos de práctica de este navegador.")) {
      setErasingData(true);
      setTimeout(() => {
        localStorage.removeItem('waacking_practice_logs');
        localStorage.removeItem('waacking_lessons');
        localStorage.removeItem('waacking_feedback_items');
        
        setErasingData(false);
        setNotification("Caché local eliminado con éxito. Los datos sincronizados en Firebase permanecen a salvo.");
        setTimeout(() => setNotification(null), 4000);
      }, 1500);
    }
  };

  const handlePrintLegalNotice = () => {
    window.print();
  };

  // Helper filter function for clause highlighting/search
  const matchesSearch = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#0A0A0A] text-[#EDEFF4] flex flex-col font-sans select-none">
      
      {/* HEADER BANNER */}
      <div className="border-b border-[#262626] pb-5 mb-2 flex flex-col lg:flex-row lg:items-center justify-between gap-4 z-10">
        <div className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-[#D9A9FF]" />
            <h2 className="text-xl sm:text-2xl font-serif-elegant font-bold text-white tracking-tight uppercase">
              {t.privacyTitle || 'CENTRO LEGAL, POLÍTICAS Y TÉRMINOS'}
            </h2>
          </div>
          <p className="text-xs text-[#8A8A8A] font-medium max-w-3xl">
            Marco legal integral de <strong>Waack On Academy</strong> y la plataforma <strong>PROWAACKER</strong>, operadas por <strong>Monroe Dance Group LLC</strong>. Términos de suscripción, protección estricta de propiedad intelectual y políticas de privacidad.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrintLegalNotice}
            className="px-3 py-1.5 rounded-xl bg-[#181818] hover:bg-[#252525] border border-[#333] text-xs font-mono font-bold text-[#D9A9FF] flex items-center gap-1.5 transition-all shadow-md"
            title="Imprimir o guardar como PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Imprimir / PDF</span>
          </button>
          <span className="text-[10px] font-mono font-bold text-[#D9A9FF] border border-[#D9A9FF]/30 bg-[#D9A9FF]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
            TERMS v2.4 (2026)
          </span>
          <span className="text-[10px] font-mono font-bold text-[#C23E9E] border border-[#C23E9E]/30 bg-[#C23E9E]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
            GDPR & IP PROTECTED
          </span>
        </div>
      </div>

      {/* SEARCH AND TABS NAVIGATION BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#121212] border border-[#262626] p-2.5 rounded-2xl">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-[#D9A9FF] text-slate-950 shadow-lg font-black'
                : 'bg-[#1a1a1a] text-[#8A8A8A] hover:text-white hover:bg-[#252525]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ver Todo el Marco Legal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'terms'
                ? 'bg-[#D9A9FF] text-slate-950 shadow-lg font-black'
                : 'bg-[#1a1a1a] text-[#8A8A8A] hover:text-white hover:bg-[#252525]'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>1. Términos & Suscripción</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ip')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ip'
                ? 'bg-[#D9A9FF] text-slate-950 shadow-lg font-black'
                : 'bg-[#1a1a1a] text-[#8A8A8A] hover:text-white hover:bg-[#252525]'
            }`}
          >
            <Copyright className="w-3.5 h-3.5" />
            <span>2. Propiedad Intelectual</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'bg-[#D9A9FF] text-slate-950 shadow-lg font-black'
                : 'bg-[#1a1a1a] text-[#8A8A8A] hover:text-white hover:bg-[#252525]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>3. Privacidad & Datos</span>
          </button>
        </div>

        {/* Filter Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-[#8A8A8A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar cláusula o tema..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#D9A9FF] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#555] outline-none transition-colors"
          />
        </div>
      </div>

      {/* FLOATING TOAST NOTIFICATION */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-[#121212] border border-[#D9A9FF]/40 text-[#EDEFF4] text-xs font-mono py-3 px-5 rounded-xl shadow-2xl flex items-center gap-3"
          >
            <ShieldCheck className="w-4 h-4 text-[#D9A9FF]" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Main Legal Documentation Sections (7 Cols) */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* SECTION 1: TÉRMINOS DE USO Y SUSCRIPCIÓN */}
          {(activeTab === 'all' || activeTab === 'terms') && matchesSearch('suscripcion pago recurrente cancelacion reembolso licencia') && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#121212] border border-[#262626] rounded-2xl p-6 shadow-2xl space-y-5 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D9A9FF]/5 rounded-bl-full pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#D9A9FF]/10 rounded-xl border border-[#D9A9FF]/30">
                    <CreditCard className="w-5 h-5 text-[#D9A9FF]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-mono font-bold text-[#D9A9FF] uppercase tracking-wider">
                      1. TÉRMINOS DE USO Y SUSCRIPCIÓN
                    </h3>
                    <p className="text-[10px] text-[#8A8A8A] font-medium">Políticas de pagos recurrentes, cancelaciones y licencias de acceso</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#1e1e1e] border border-[#333] px-2 py-0.5 rounded text-[#8A8A8A]">
                  SECCIÓN 01
                </span>
              </div>

              <div className="space-y-4 text-xs leading-relaxed text-[#C2C7D1] font-medium">
                
                {/* 1.1 Pagos Recurrentes */}
                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#262626] space-y-2.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2 uppercase">
                    <DollarSign className="w-4 h-4 text-[#D9A9FF]" /> 1.1 Pagos Recurrentes y Facturación Automática
                  </h4>
                  <p className="text-[11px] text-[#8A8A8A] leading-relaxed">
                    Al suscribirte a los planes <strong>PRO ($29.99 USD/mes)</strong> o <strong>VIP Instructor ($59.99 USD/mes)</strong> de Waack On Academy, autorizas expresamente el cobro automático recurrente operado a través de la entidad legal <strong>Monroe Dance Group LLC</strong> a la tarjeta de crédito/débito o cuenta de PayPal registrada. Los cobros se procesarán el mismo día de cada período (mensual o anual). Recibirás un comprobante digital por cada transacción reflejado a nombre de <strong>Monroe Dance Group LLC</strong>.
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[10px] text-[#D9A9FF] font-mono">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Notificación previa de 30 días en caso de modificaciones de tarifa.</span>
                  </div>
                </div>

                {/* 1.2 Políticas de Cancelación */}
                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#262626] space-y-2.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2 uppercase">
                    <Ban className="w-4 h-4 text-[#C23E9E]" /> 1.2 Política Transparente de Cancelación
                  </h4>
                  <p className="text-[11px] text-[#8A8A8A] leading-relaxed">
                    Puedes cancelar tu suscripción en cualquier momento sin penalizaciones ni contratos de permanencia forzosa. Para cancelar:
                  </p>
                  <ol className="list-decimal list-inside text-[11px] text-gray-300 space-y-1 bg-[#121212] p-2.5 rounded-lg border border-[#222]">
                    <li>Accede a tu panel en <strong>Mi Perfil &gt; Facturación & Membresía</strong>.</li>
                    <li>Haz clic en el botón <strong>"Cancelar Suscripción Automática"</strong>.</li>
                    <li>Mantendrás acceso ilimitado hasta la fecha de vencimiento del ciclo facturado actual.</li>
                  </ol>
                </div>

                {/* 1.3 Garantía y Reembolsos */}
                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#262626] space-y-2.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2 uppercase">
                    <Calendar className="w-4 h-4 text-[#D9A9FF]" /> 1.3 Garantía de Devolución de 7 Días
                  </h4>
                  <p className="text-[11px] text-[#8A8A8A] leading-relaxed">
                    Ofrecemos una garantía de satisfacción de <strong>7 días consecutivos</strong> para nuevos usuarios contados a partir del primer pago. Si durante este lapso consideras que la plataforma no cumple tus expectativas y has consumido menos del 20% del contenido de las clases, puedes solicitar la devolución del 100% de tu dinero escribiendo a <span className="text-[#D9A9FF] font-mono">pagos@prowaacker.com</span>. Las renovaciones automáticas posteriores no son reembolsables.
                  </p>
                </div>

                {/* 1.4 Derechos de Uso de Contenido */}
                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#262626] space-y-2.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2 uppercase">
                    <KeyRound className="w-4 h-4 text-[#D9A9FF]" /> 1.4 Licencia Personal e Intransferible
                  </h4>
                  <p className="text-[11px] text-[#8A8A8A] leading-relaxed">
                    El acceso otorga una licencia individual, revocable y no exclusiva para transmisión personal. Se prohíbe terminantemente compartir credenciales de acceso con múltiples usuarios o proyectar las clases en academias físicas con fines de lucro comercial sin una acreditación de Instructor Oficial emitida por Brando Hermoso.
                  </p>
                </div>

              </div>
            </motion.div>
          )}

          {/* SECTION 2: PROTECCIÓN DE PROPIEDAD INTELECTUAL */}
          {(activeTab === 'all' || activeTab === 'ip') && matchesSearch('propiedad intelectual marca marca registrada brando hermoso curriculo metodologia video recording e-book') && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#121212] border border-[#262626] rounded-2xl p-6 shadow-2xl space-y-5 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C23E9E]/10 rounded-bl-full pointer-events-none" />

              <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#C23E9E]/10 rounded-xl border border-[#C23E9E]/30">
                    <Copyright className="w-5 h-5 text-[#C23E9E]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-mono font-bold text-[#C23E9E] uppercase tracking-wider">
                      2. PROTECCIÓN DE PROPIEDAD INTELECTUAL
                    </h3>
                    <p className="text-[10px] text-[#8A8A8A] font-medium">Currículo pedagógico, metodologías de baile, producciones y marcas registradas</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#1e1e1e] border border-[#333] px-2 py-0.5 rounded text-[#8A8A8A]">
                  SECCIÓN 02
                </span>
              </div>

              <div className="space-y-4 text-xs leading-relaxed text-[#C2C7D1] font-medium">
                
                {/* 2.1 Metodología de Brando Hermoso */}
                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#262626] space-y-2.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2 uppercase">
                    <Award className="w-4 h-4 text-[#D9A9FF]" /> 2.1 Currículo Pedagógico y Método de Brando Hermoso
                  </h4>
                  <p className="text-[11px] text-[#8A8A8A] leading-relaxed">
                    Toda la estructura pedagógica de Waacking, desgloses rítmicos a 128 BPM, secuencias de <em>Posing & Drama</em>, dinámicas somáticas y esquemas biomecánicos fueron diseñados exclusivamente por el bailarín profesional <strong>Brando Hermoso</strong> y son propiedad intelectual exclusiva de <strong>Monroe Dance Group LLC</strong>. Este currículo constituye una obra intelectual protegida por convenios internacionales de derecho de autor (OMPI/WIPO) y leyes federales de propiedad intelectual. Queda prohibida su reproducción, adaptación sin autorización o reclamación de autoría de la metodología.
                  </p>
                </div>

                {/* 2.2 Prohibición de Screen Recording y Descargas */}
                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#262626] space-y-2.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2 uppercase">
                    <Video className="w-4 h-4 text-[#C23E9E]" /> 2.2 Prohibición Estricta de Grabación y Resubida
                  </h4>
                  <p className="text-[11px] text-[#8A8A8A] leading-relaxed">
                    Los videos interactivos en alta definición, pistas de audio del metrónomo, e-books en PDF y contenidos del Freestyle Lab son propiedad exclusiva de <strong>Monroe Dance Group LLC</strong> / Waack On Academy.
                  </p>
                  <ul className="list-disc list-inside text-[11px] text-gray-300 space-y-1 bg-[#121212] p-2.5 rounded-lg border border-[#222]">
                    <li><strong>Prohibida la Grabación de Pantalla (Screen Recording):</strong> Cualquier intento de ripear o capturar video activará el bloqueo preventivo de cuenta.</li>
                    <li><strong>Archivos Descargables:</strong> Los libros digitales y guías anatómicas son para lectura personal; prohibida su difusión en canales de Telegram, WhatsApp o bibliotecas públicas.</li>
                  </ul>
                </div>

                {/* 2.3 Marcas e Imagen de Marca */}
                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#262626] space-y-2.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2 uppercase">
                    <Sparkles className="w-4 h-4 text-[#D9A9FF]" /> 2.3 Marcas Registradas con Monroe Dance Group LLC
                  </h4>
                  <p className="text-[11px] text-[#8A8A8A] leading-relaxed">
                    Las denominaciones <strong>WAACK ON®</strong>, <strong>PROWAACKER®</strong>, <strong>WAACK ON ACADEMY®</strong>, <strong>FREESTYLE LAB®</strong>, así como los logotipos, tipografías, lemas e imagen comercial son marcas registradas de propiedad exclusiva de <strong>Monroe Dance Group LLC</strong>. Ningún tercero está autorizado a fabricar merchandising, certificados falsificados o publicidad utilizando la marca o el nombre de Brando Hermoso sin una autorización o licencia previa por escrito emitida formalmente por Monroe Dance Group LLC.
                  </p>
                </div>

                {/* 2.4 Algoritmos de IA */}
                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#262626] space-y-2.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2 uppercase">
                    <Activity className="w-4 h-4 text-[#C23E9E]" /> 2.4 Propiedad de Software y Modelos Biomecánicos
                  </h4>
                  <p className="text-[11px] text-[#8A8A8A] leading-relaxed">
                    El motor de análisis biomecánico en tiempo real y los detectores de postura en el navegador pertenecen al equipo de desarrollo de PROWAACKER. Queda prohibida cualquier labor de ingeniería inversa, descompilación o extracción de datos de entrenamiento del modelo de IA.
                  </p>
                </div>

              </div>
            </motion.div>
          )}

          {/* SECTION 3: POLÍTICA DE PRIVACIDAD & PROTECCIÓN DE DATOS */}
          {(activeTab === 'all' || activeTab === 'privacy') && matchesSearch('privacidad datos gdpr ccpa arco firebase telemetria camara video') && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#121212] border border-[#262626] rounded-2xl p-6 shadow-2xl space-y-5 text-left relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#D9A9FF]/10 rounded-xl border border-[#D9A9FF]/30">
                    <Shield className="w-5 h-5 text-[#D9A9FF]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-mono font-bold text-[#D9A9FF] uppercase tracking-wider">
                      3. POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS
                    </h3>
                    <p className="text-[10px] text-[#8A8A8A] font-medium">Cumplimiento con normativas de privacidad GDPR, CCPA y derechos ARCO</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#1e1e1e] border border-[#333] px-2 py-0.5 rounded text-[#8A8A8A]">
                  SECCIÓN 03
                </span>
              </div>

              <div className="space-y-4 text-xs leading-relaxed text-[#C2C7D1] font-medium">
                
                {/* 3.1 Datos Recopilados */}
                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#262626] space-y-2.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2 uppercase">
                    <Database className="w-4 h-4 text-[#C23E9E]" /> 3.1 Recolección y Finalidad de Datos en Firebase
                  </h4>
                  <p className="text-[11px] text-[#8A8A8A] leading-relaxed">
                    Utilizamos <strong>Firebase Authentication</strong> y <strong>Cloud Firestore</strong> para gestionar de forma cifrada tu acceso, correo electrónico, nivel de baile, medallas y minutas de práctica. Esta información tiene la finalidad exclusiva de sincronizar tu avance pedagógico en la plataforma.
                  </p>
                </div>

                {/* 3.2 Telemetría Biomecánica */}
                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#262626] space-y-2.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2 uppercase">
                    <Activity className="w-4 h-4 text-[#C23E9E]" /> 3.2 Procesamiento Biomecánico de IA en Dispositivo Local
                  </h4>
                  <p className="text-[11px] text-[#8A8A8A] leading-relaxed">
                    Cuando activas la cámara en el Freestyle Lab o en el analizador de video, las coordenadas anatómicas de codos, hombros y tronco se procesan exclusivamente en la memoria RAM de tu propio dispositivo. No guardamos ni transmitimos imágenes faciales ni datos biométricos de identificación física a servidores externos.
                  </p>
                </div>

                {/* 3.3 Privacidad de Videos Subidos */}
                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#262626] space-y-2.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2 uppercase">
                    <Lock className="w-4 h-4 text-[#D9A9FF]" /> 3.3 Confidencialidad de Videos y Evaluaciones
                  </h4>
                  <p className="text-[11px] text-[#8A8A8A] leading-relaxed">
                    Los videos enviados para recibir retroalimentación del instructor son estrictamente confidenciales. Únicamente Brando Hermoso y los evaluadores certificados tienen acceso al material con la finalidad de otorgar comentarios técnicos. Tus prácticas nunca serán publicadas ni vendidas a terceros sin tu consentimiento por escrito.
                  </p>
                </div>

              </div>

              <div className="border-t border-[#262626] pt-4 text-[10px] text-[#8A8A8A] font-mono leading-tight space-y-1">
                <p>Waack On Academy garantiza que no comercializa bases de datos personales con anunciantes o brokers.</p>
                <p>Oficial de Protección de Datos (DPO): <span className="text-[#D9A9FF]">privacidad@prowaacker.com</span></p>
              </div>
            </motion.div>
          )}

        </div>

        {/* RIGHT COLUMN: Interactive Privacy Consent Center & ARCO Tools (5 Cols) */}
        <div className="xl:col-span-5 space-y-6">
          
          {/* Interactive Consent Toggles Panel */}
          <div className="bg-[#121212] border border-[#262626] rounded-2xl p-5 shadow-2xl space-y-4 text-left">
            <h3 className="text-xs font-mono font-bold text-[#D9A9FF] uppercase tracking-widest border-b border-[#262626] pb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#D9A9FF]" /> CENTRO DE CONTROL DE CONSENTIMIENTO
            </h3>
            
            <p className="text-[10px] text-[#8A8A8A] font-medium leading-relaxed mb-4">
              Gestiona en tiempo real tus permisos de telemetría y privacidad en la plataforma PROWAACKER.
            </p>

            <div className="space-y-3">
              
              {/* Push Notifications (Web Push API) */}
              <div className="flex items-start justify-between gap-4 p-3 bg-[#0A0A0A] border border-[#D9A9FF]/40 rounded-xl hover:border-[#D9A9FF] transition-colors shadow-sm">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-[#D9A9FF] animate-pulse" /> Notificaciones Push del Navegador
                  </p>
                  <p className="text-[10px] text-[#8A8A8A] leading-tight">
                    Alertas en segundo plano cuando tus videos de práctica reciban feedback o correcciones de los instructores.
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[9px] font-mono">
                    <span className="text-[#8A8A8A]">Estado:</span>
                    <span className={pushStatus.permission === 'granted' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      {pushStatus.permission === 'granted' ? 'ACTIVADO (Concedido)' : pushStatus.permission === 'denied' ? 'BLOQUEADO' : 'PENDIENTE'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleTogglePushNotifications}
                  className="px-3 py-1.5 bg-[#D9A9FF] hover:bg-[#B478F0] text-black font-mono text-[10px] font-bold uppercase rounded-lg transition-all shadow-md shrink-0 cursor-pointer"
                >
                  {pushStatus.permission === 'granted' ? 'Reactivar' : 'Activar Push'}
                </button>
              </div>
              
              {/* Toggle 1: Telemetry */}
              <div className="flex items-start justify-between gap-4 p-3 bg-[#0A0A0A] border border-[#262626] rounded-xl hover:border-[#333] transition-colors">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#D9A9FF]" /> Registro Biomecánico
                  </p>
                  <p className="text-[10px] text-[#8A8A8A] leading-tight">
                    Permitir que el motor de IA dibuje el esqueleto sobre tu video en ejercicios de brazos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => saveConsentSetting('telemetry', !consents.telemetry)}
                  className="text-white shrink-0 focus:outline-none transition-transform hover:scale-105"
                >
                  {consents.telemetry ? (
                    <ToggleRight className="w-9 h-9 text-[#C23E9E]" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-[#3A3A3A]" />
                  )}
                </button>
              </div>

              {/* Toggle 2: Ranking */}
              <div className="flex items-start justify-between gap-4 p-3 bg-[#0A0A0A] border border-[#262626] rounded-xl hover:border-[#333] transition-colors">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#D9A9FF]" /> Participación en Ranking
                  </p>
                  <p className="text-[10px] text-[#8A8A8A] leading-tight">
                    Mostrar tu nombre, foto de perfil y puntos de práctica acumulados en la tabla pública de la academia.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => saveConsentSetting('ranking', !consents.ranking)}
                  className="text-white shrink-0 focus:outline-none transition-transform hover:scale-105"
                >
                  {consents.ranking ? (
                    <ToggleRight className="w-9 h-9 text-[#C23E9E]" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-[#3A3A3A]" />
                  )}
                </button>
              </div>

              {/* Toggle 3: Video cache */}
              <div className="flex items-start justify-between gap-4 p-3 bg-[#0A0A0A] border border-[#262626] rounded-xl hover:border-[#333] transition-colors">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-[#D9A9FF]" /> Caché de Video Local
                  </p>
                  <p className="text-[10px] text-[#8A8A8A] leading-tight">
                    Guardar temporalmente los enlaces de tus videos subidos en tu navegador para agilizar la carga.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => saveConsentSetting('videoCache', !consents.videoCache)}
                  className="text-white shrink-0 focus:outline-none transition-transform hover:scale-105"
                >
                  {consents.videoCache ? (
                    <ToggleRight className="w-9 h-9 text-[#C23E9E]" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-[#3A3A3A]" />
                  )}
                </button>
              </div>

              {/* Toggle 4: Instructor access */}
              <div className="flex items-start justify-between gap-4 p-3 bg-[#0A0A0A] border border-[#262626] rounded-xl hover:border-[#333] transition-colors">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#D9A9FF]" /> Evaluación del Instructor
                  </p>
                  <p className="text-[10px] text-[#8A8A8A] leading-tight">
                    Permitir que Brando Hermoso y el cuerpo técnico revisen tus rutinas enviadas y te den correcciones.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => saveConsentSetting('instructorAccess', !consents.instructorAccess)}
                  className="text-white shrink-0 focus:outline-none transition-transform hover:scale-105"
                >
                  {consents.instructorAccess ? (
                    <ToggleRight className="w-9 h-9 text-[#C23E9E]" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-[#3A3A3A]" />
                  )}
                </button>
              </div>

            </div>
          </div>

          {/* Data Export & ARCO Rights Panel */}
          <div className="bg-[#121212] border border-[#262626] rounded-2xl p-5 shadow-2xl space-y-4 text-left">
            <h3 className="text-xs font-mono font-bold text-[#D9A9FF] uppercase tracking-widest border-b border-[#262626] pb-2 flex items-center gap-2">
              <Download className="w-4 h-4 text-[#D9A9FF]" /> TUS DERECHOS ARCO (GDPR / CCPA)
            </h3>
            
            <p className="text-[10px] text-[#8A8A8A] font-medium leading-relaxed">
              De conformidad con las leyes internacionales de protección de datos, puedes descargar una copia integra de tu información o borrar la memoria local en cualquier momento.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              
              {/* Button: Export Data */}
              <button
                type="button"
                onClick={handleDownloadData}
                disabled={downloadingData}
                className="py-2.5 px-3 bg-[#1c1e22] hover:bg-[#2c2f35] border border-[#3A3A3A] hover:border-[#5A5A5A] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 focus:outline-none disabled:opacity-50"
              >
                {downloadingData ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D9A9FF]" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-[#D9A9FF]" />
                )}
                <span>Exportar JSON</span>
              </button>

              {/* Button: Purge Cache */}
              <button
                type="button"
                onClick={handleEraseData}
                disabled={erasingData}
                className="py-2.5 px-3 bg-[#261516] hover:bg-[#3d1a1c] border border-[#5c1c1f]/40 text-[#ffb3b2] rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 focus:outline-none disabled:opacity-50"
              >
                {erasingData ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#ff8080]" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5 text-[#ff8080]" />
                )}
                <span>Purgar Memoria</span>
              </button>

            </div>

            {/* Warning footprint note */}
            <div className="bg-[#1c1315] border border-[#ff8080]/20 p-3 rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#ff8080] shrink-0 mt-0.5 animate-pulse" />
              <p className="text-[9px] text-[#ffb3b2] font-semibold leading-normal">
                Purgar la memoria borrará el caché de tus videos subidos y registros de entrenamiento locales en este navegador. Tus medallas y suscripción en Firebase no se verán afectadas.
              </p>
            </div>
          </div>

          {/* Legal Support Contact Card */}
          <div className="bg-[#121212] border border-[#262626] rounded-2xl p-5 shadow-2xl space-y-3 text-left">
            <h3 className="text-xs font-mono font-bold text-[#EDEFF4] uppercase tracking-wider flex items-center gap-2 border-b border-[#262626] pb-2">
              <Scale className="w-4 h-4 text-[#D9A9FF]" /> ENTIDAD LEGAL & CONTACTO
            </h3>
            <p className="text-[11px] text-[#8A8A8A] font-medium leading-relaxed">
              Titular legal de derechos, registros de marca y operaciones comerciales: <strong>Monroe Dance Group LLC</strong>.
            </p>
            <div className="bg-[#0A0A0A] p-3 rounded-xl border border-[#262626] space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between text-gray-300">
                <span className="text-[#8A8A8A]">Entidad Titular:</span>
                <span className="text-white font-bold">Monroe Dance Group LLC</span>
              </div>
              <div className="flex items-center justify-between text-gray-300">
                <span className="text-[#8A8A8A]">E-mail Legal:</span>
                <a href="mailto:legal@prowaacker.com" className="text-[#D9A9FF] font-bold hover:underline">legal@prowaacker.com</a>
              </div>
              <div className="flex items-center justify-between text-gray-300">
                <span className="text-[#8A8A8A]">Protección Datos:</span>
                <a href="mailto:privacidad@prowaacker.com" className="text-[#D9A9FF] font-bold hover:underline">privacidad@prowaacker.com</a>
              </div>
              <div className="flex items-center justify-between text-gray-300">
                <span className="text-[#8A8A8A]">Tiempo Respuesta:</span>
                <span className="text-white font-bold">&lt; 48 Horas Hábiles</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
