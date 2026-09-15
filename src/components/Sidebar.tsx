import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Sparkles, 
  Users, 
  Radio, 
  HelpCircle, 
  User as UserIcon, 
  ShieldCheck,
  UserCheck,
  Dumbbell,
  BookOpen,
  Trophy,
  Briefcase,
  Lock,
  Compass,
  ListTodo,
  Mail,
  HardDrive,
  Presentation,
  ChevronDown,
  Film,
  Camera,
  Crown,
  Headphones,
  Building2,
  Eye,
  Cpu,
  Wallet,
  PlusCircle,
  FileText,
  Calendar,
  Settings,
  Bell,
  Smartphone,
  Activity
} from 'lucide-react';
import { User } from '../types';
import { Language, translations } from '../lib/translations';
import Logo from './Logo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onUserChange: (user: User) => void;
  language: Language;
  onStartOnboarding?: () => void;
  onOpenFormationPreview?: () => void;
  onOpenSomaticPosingPrototype?: () => void;
  onOpenNotifications?: () => void;
  onOpenAppInstall?: () => void;
  unreadNotificationCount?: number;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onUserChange, 
  language, 
  onStartOnboarding, 
  onOpenFormationPreview, 
  onOpenSomaticPosingPrototype,
  onOpenNotifications,
  onOpenAppInstall,
  unreadNotificationCount = 0
}: SidebarProps) {
  // Check active instructor subscriptions from localStorage or user state
  const hasActiveSub = React.useMemo(() => {
    if (currentUser.billingStatus === 'active') return true;
    try {
      const saved = localStorage.getItem('waack_subscribed_instructors');
      const list = saved ? JSON.parse(saved) : [];
      return Array.isArray(list) && list.length > 0;
    } catch (e) {
      return false;
    }
  }, [currentUser.billingStatus]);

  const isInstructor = currentUser.role === 'instructor';

  const principalItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      requiresSub: false, 
      badge: currentUser.id === 'OdXh2P0qGDaFFyNKalECKFq9ESk1'
        ? 'ADMIN'
        : currentUser.role === 'studio' 
          ? 'ACADEMIA' 
          : isInstructor 
            ? 'DOCENTE' 
            : currentUser.role === 'student'
              ? 'ESTUDIANTE'
              : 'INICIO' 
    },
    ...(isInstructor ? [
      { id: 'instructor_finances', label: language === 'es' ? 'Finanzas' : 'Finances', icon: Wallet, requiresSub: false, badge: '80/20' },
      { id: 'instructor_publish', label: language === 'es' ? 'Cursos y Publicaciones' : 'Courses & Content', icon: PlusCircle, requiresSub: false },
      { id: 'instructor_documents', label: language === 'es' ? 'Documentos' : 'Documents', icon: FileText, requiresSub: false },
      { id: 'instructor_students', label: language === 'es' ? 'Alumnos' : 'Students', icon: Users, requiresSub: false },
      { id: 'instructor_classes', label: language === 'es' ? 'Clases' : 'Classes', icon: Calendar, requiresSub: false },
      { id: 'instructor_promotion', label: language === 'es' ? 'Ajustes' : 'Settings', icon: Settings, requiresSub: false },
    ] : []),
    { id: 'live', label: language === 'es' ? 'Lives / En Vivo' : 'Lives / Streaming', icon: Radio, requiresSub: false, badge: 'EN VIVO' },
    { id: 'reels', label: 'Waack Reels', icon: Film, requiresSub: false, badge: 'HOT' }
  ];

  const allSections = [
    {
      id: 'principal',
      title: '1. PRINCIPAL',
      items: principalItems
    },
    {
      id: 'formacion',
      title: '2. FORMACIÓN & CONTENIDO',
      items: [
        { id: 'cursos', label: 'Clases & Cursos', icon: GraduationCap, requiresSub: false, badge: 'VER' },
        ...(onOpenFormationPreview ? [{ id: 'vista_previa_formacion', label: 'Vista Previa Formación', icon: Eye, requiresSub: false, isAction: true, onClick: onOpenFormationPreview, badge: 'NUEVO' }] : []),
        { id: 'entrenamiento', label: language === 'es' ? 'Laboratorio de Freestyles' : 'Freestyle Laboratory', icon: Sparkles, requiresSub: false, badge: 'LAB' },
        ...(onOpenSomaticPosingPrototype ? [{ id: 'prototipo_somatico', label: 'Prototipo Somático Posing', icon: Cpu, requiresSub: false, isAction: true, onClick: onOpenSomaticPosingPrototype, badge: 'LAB v1.0' }] : []),
        { id: 'podcasts', label: 'Podcasts', icon: Headphones, requiresSub: false, badge: 'AUDIO' },
        { id: 'ebooks', label: 'Manuales & eBooks', icon: BookOpen, requiresSub: false }
      ]
    },
    {
      id: 'comunidad',
      title: '3. COMUNIDAD & PROGRESO',
      items: [
        { id: 'fisico', label: 'Somatic Diary', icon: Dumbbell, requiresSub: false },
        { id: 'comunidad', label: 'Comunidad', icon: Users, requiresSub: false },
        { id: 'ranking', label: 'Ranking & Insignias', icon: Trophy, requiresSub: false }
      ]
    },
    {
      id: 'micuenta',
      title: '4. MI CUENTA & SOPORTE',
      items: [
        ...(onOpenNotifications ? [{ 
          id: 'centro_notificaciones', 
          label: language === 'es' ? 'Centro de Notificaciones' : 'Notification Center', 
          icon: Bell, 
          requiresSub: false, 
          isAction: true, 
          onClick: onOpenNotifications,
          badge: unreadNotificationCount > 0 ? `${unreadNotificationCount} NUEVAS` : undefined 
        }] : []),
        ...(onOpenAppInstall ? [{ 
          id: 'instalar_app', 
          label: language === 'es' ? 'Instalar App PWA' : 'Install App PWA', 
          icon: Smartphone, 
          requiresSub: false, 
          isAction: true, 
          onClick: onOpenAppInstall,
          badge: 'NATIVO' 
        }] : []),
        { id: 'planes', label: 'Planes & Membresía', icon: Crown, requiresSub: false, badge: 'NUEVO' },
        ...(onStartOnboarding ? [{ id: 'tour', label: 'Tour Interactivo', icon: Sparkles, requiresSub: false, isAction: true, onClick: onStartOnboarding }] : []),
        { id: 'support', label: 'Ayuda & Soporte', icon: HelpCircle, requiresSub: false },
        { id: 'privacy', label: 'Políticas & Términos', icon: ShieldCheck, requiresSub: false }
      ]
    }
  ];

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    principal: true,
    formacion: true,
    comunidad: true,
    micuenta: true
  });

  const toggleAccordionSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  useEffect(() => {
    const activeSec = allSections.find(sec => sec.items.some(item => item.id === activeTab));
    if (activeSec) {
      setOpenSections(prev => ({
        ...prev,
        [activeSec.id]: true
      }));
    }
  }, [activeTab, currentUser.role]);

  const toggleRole = () => {
    let newRole: 'student' | 'instructor' | 'studio' = 'student';
    if (currentUser.role === 'student') {
      newRole = 'instructor';
    } else if (currentUser.role === 'instructor') {
      newRole = 'studio';
    } else {
      newRole = 'student';
    }
    setActiveTab('dashboard');
    onUserChange({
      ...currentUser,
      role: newRole
    });
  };

  return (
    <aside id="sidebar-panel" className="w-64 bg-white/95 dark:bg-[#090a14]/95 border-r border-slate-200 dark:border-white/10 flex flex-col justify-between h-full max-h-screen shrink-0 select-none shadow-2xl relative z-20 overflow-y-auto custom-scrollbar backdrop-blur-xl">
      <div className="flex flex-col min-h-full">
        {/* Logo / Brand Header */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#0c0d1e]/80 flex flex-col items-center justify-center relative overflow-hidden group shrink-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(233,195,73,0.12)_0%,transparent_70%)] pointer-events-none" />
          
          <Logo variant="full" className="w-40 h-auto relative z-10 transition-transform group-hover:scale-105 duration-300" />
          
          <span className="text-[8px] font-mono tracking-[0.25em] text-[#D9A9FF] font-black mt-1 relative z-10 uppercase text-center">
            PLATAFORMA DE ENTRENAMIENTO
          </span>
        </div>

        {/* User Role Card Box */}
        <div className={`mx-3 my-3 p-3 border rounded-2xl flex items-center justify-between shadow-inner shrink-0 transition-all ${
          currentUser.role === 'studio'
            ? 'bg-amber-50 dark:bg-[#180f2b] border-[#E9C349]/60 shadow-[0_0_12px_rgba(233,195,73,0.15)] dark:shadow-[0_0_12px_rgba(233,195,73,0.25)]'
            : currentUser.role === 'instructor'
            ? 'bg-amber-50 dark:bg-[#1b1222] border-[#E9C349]/40 shadow-[0_0_12px_rgba(233,195,73,0.1)] dark:shadow-[0_0_12px_rgba(233,195,73,0.15)]'
            : 'bg-slate-100 dark:bg-[#1e1e1e] border-slate-200 dark:border-white/10'
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className={`w-9 h-9 rounded-xl border object-cover shrink-0 transition-colors ${
                currentUser.role === 'studio' ? 'border-[#D9A9FF]' : currentUser.role === 'instructor' ? 'border-[#D9A9FF]' : 'border-[#D9A9FF]/50'
              }`}
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold text-slate-900 dark:text-white truncate uppercase leading-tight">
                USUARIO: {(currentUser?.name || 'Bailarín').split(' ')[0]}
              </p>
              <p className="text-[9px] font-mono text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                {currentUser.role === 'studio' ? (
                  <>
                    <Building2 className="w-2.5 h-2.5 text-[#D9A9FF] inline shrink-0" />
                    <span className="capitalize text-[#D9A9FF] font-bold">Academia</span>
                  </>
                ) : currentUser.role === 'instructor' ? (
                  <>
                    <ShieldCheck className="w-2.5 h-2.5 text-[#D9A9FF] inline shrink-0" />
                    <span className="capitalize text-[#D9A9FF] font-bold">Docente</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-2.5 h-2.5 inline text-slate-500 dark:text-slate-400 shrink-0" />
                    <span className="capitalize text-slate-600 dark:text-slate-300 font-bold">Estudiante</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            id="role-switch-btn"
            onClick={toggleRole}
            className={`text-[9px] px-2 py-1 rounded-lg font-black tracking-wider uppercase transition-all shadow-md active:scale-95 shrink-0 border cursor-pointer ${
              currentUser.role === 'studio'
                ? 'bg-[#D9A9FF] text-black border-[#D9A9FF] hover:bg-[#E9B8FF]'
                : currentUser.role === 'instructor'
                ? 'bg-[#D9A9FF] text-black border-[#D9A9FF] hover:bg-[#E9B8FF]'
                : 'bg-[#9E1F86] hover:bg-[#BC2196] text-white border-transparent'
            }`}
            title={`Cambiar a modo ${currentUser.role === 'student' ? 'docente' : currentUser.role === 'instructor' ? 'academia / estudio' : 'estudiante'}`}
          >
            ROLE
          </button>
        </div>

        {/* Subscription Status Pill */}
        <div className="mx-3 mb-3 px-3 py-2 bg-slate-100 dark:bg-[#141022] border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-500 dark:text-slate-400 font-bold uppercase">Suscripción:</span>
          {hasActiveSub ? (
            <span className="text-emerald-400 font-black flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ACTIVA
            </span>
          ) : (
            <span className="text-pink-400 font-bold flex items-center gap-1 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
              <Lock className="w-2.5 h-2.5 text-pink-400" />
              SIN PROFESOR
            </span>
          )}
        </div>

        {/* Navigation Menu Accordion */}
        <nav className="px-3 py-1 space-y-3 flex-1">
          {allSections.map((section) => {
            const isOpen = !!openSections[section.id];
            const hasActiveItem = section.items.some((item) => item.id === activeTab);

            return (
              <div key={section.id} className="space-y-1">
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleAccordionSection(section.id)}
                  className="w-full px-3 py-1.5 flex items-center justify-between group text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="text-[9px] font-black text-[#E9C349] tracking-widest uppercase truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      {section.title}
                    </p>
                    {hasActiveItem && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D9A9FF] animate-pulse shrink-0" />
                    )}
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#D9A9FF] transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Accordion Content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="space-y-1 overflow-hidden"
                    >
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        const isLocked = item.requiresSub && !hasActiveSub;
                        const isInstructorItem = item.id === 'instructor';

                        const instructorName = currentUser.role === 'instructor' 
                          ? (currentUser.name || 'Instructor Waack ON')
                          : 'Marilyn Monroe';
                        const instructorSpecialty = currentUser.role === 'instructor'
                          ? (currentUser.bio || 'Especialista en Waacking, Arm Control & Performance')
                          : 'Especialista en Waacking, Arm Control & Expresividad Disco';

                        return (
                          <motion.button
                            id={`nav-${item.id}`}
                            key={item.id}
                            onClick={() => {
                              if (item.isAction && item.onClick) {
                                item.onClick();
                              } else {
                                setActiveTab(item.id);
                              }
                            }}
                            whileHover={{ x: 3 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className={`relative w-full group/instructor flex flex-col justify-between px-3.5 py-2 rounded-xl transition-all text-left border ${
                              isActive
                                ? 'bg-amber-50 dark:bg-[#1e1735] border-slate-200 dark:border-white/20 text-slate-900 dark:text-white font-extrabold shadow-lg shadow-black/10 dark:shadow-black/40'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border-transparent font-bold'
                            }`}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="activeNavBackground"
                                className="absolute inset-0 bg-amber-50 dark:bg-[#1e1735] border border-[#E9C349]/40 rounded-xl pointer-events-none"
                                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                              />
                            )}

                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2.5 min-w-0 relative z-10">
                                {item.id === 'dashboard' ? (
                                  <motion.div
                                    animate={{
                                      scale: [1, 1.18, 1],
                                      rotate: [0, 4, -4, 0],
                                      filter: [
                                        'drop-shadow(0 0 0px rgba(217, 169, 255, 0))',
                                        'drop-shadow(0 0 6px rgba(217, 169, 255, 0.8))',
                                        'drop-shadow(0 0 0px rgba(217, 169, 255, 0))'
                                      ]
                                    }}
                                    transition={{
                                      duration: 2.2,
                                      repeat: Infinity,
                                      ease: 'easeInOut'
                                    }}
                                    className="shrink-0"
                                  >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#E9C349]' : 'text-slate-500 dark:text-slate-400'}`} />
                                  </motion.div>
                                ) : (
                                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#E9C349]' : 'text-slate-500 dark:text-slate-400'}`} />
                                )}
                                <span className="text-[11px] tracking-wider uppercase truncate">
                                  {item.label}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 ml-1 relative z-10">
                                {item.badge && (
                                  <span className="text-[8px] font-mono font-black text-[#D9A9FF] bg-[#D9A9FF]/15 border border-[#D9A9FF]/30 px-1.5 py-0.2 rounded">
                                    {item.badge}
                                  </span>
                                )}

                                {isLocked ? (
                                  <span className="flex items-center gap-1 bg-pink-500/10 border border-pink-500/20 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold text-pink-400" title="Requiere membresía activa con un profesor">
                                    <Lock className="w-3 h-3 text-pink-400 shrink-0" />
                                    <span className="hidden group-hover:inline">LOCKED</span>
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer info badge */}
      <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/90 text-center shrink-0">
        <p className="text-[9px] font-mono font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          WAACK ON • PLATAFORMA DE BAILARINES
        </p>
      </div>
    </aside>
  );
}

