import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, 
  TrendingUp, 
  Percent, 
  ShoppingBag, 
  Users, 
  Calendar, 
  Plus, 
  BookOpen, 
  Video, 
  Check, 
  PlusCircle, 
  ChevronRight, 
  Trash2, 
  Sparkles,
  Award,
  BookMarked,
  Layers,
  GraduationCap,
  Presentation,
  ArrowRightLeft,
  BellRing,
  ShieldCheck,
  CreditCard,
  Settings,
  X,
  Send,
  Smile,
  MoreVertical,
  CheckCircle2,
  User as UserIcon,
  Instagram,
  Radio,
  Youtube,
  Globe,
  Edit3,
  ExternalLink,
  ThumbsUp,
  Target,
  Upload,
  Compass,
  AlertCircle,
  Loader2,
  Wallet,
  Music,
  Disc,
  ListTodo,
  Mail,
  HardDrive,
  Zap,
  FileText,
  Download,
  Printer,
  FileType,
  Filter,
  LayoutDashboard,
  UserCheck,
  Play,
  Pause,
  Timer,
  Volume2,
  ClipboardCheck,
  Search,
  Share2,
  Copy,
  BookOpenCheck,
  Sliders,
  RotateCcw,
  MessageSquare,
  Eye,
  Clock,
  Flame,
  Activity,
  CheckSquare,
  Square
} from 'lucide-react';
import { User, CalendarEvent, Lesson, PodcastShow, PodcastEpisode } from '../types';
import { INITIAL_PODCAST_SHOWS } from '../data';
import { StudioVibeCard } from './DiscoBallWidget';
import { Language } from '../lib/translations';
import { generateGoogleMeetRoomUrl } from '../googleCalendar';
import { fetchInstructorMetrics, createInstructorTask, generateOnboardingPlanBackend, updateInstructorPricingMethodologyBackend } from '../lib/api';
import OnboardingQuestionnaireModal from './OnboardingQuestionnaireModal';
import OnboardingPlanViewer from './OnboardingPlanViewer';
import TeachingMethodologyEditor from './TeachingMethodologyEditor';
import { InstructorFinanceView } from './InstructorFinanceView';
import SoundCloudPlayer from './SoundCloudPlayer';
import MultiSourcePlayer, { parseMusicSource } from './MultiSourcePlayer';
import PodcastUploaderModal from './PodcastUploaderModal';
import MetronomeLabComponent from './MetronomeLabComponent';
import ClassroomView from './ClassroomView';
import TasksView from './TasksView';
import { GmailWidget } from './GmailWidget';
import { GooglePickerModal } from './GooglePickerModal';
import GoogleSlidesView from './GoogleSlidesView';
import Logo from './Logo';

import InstructorPlaylistsManager from './instructor/InstructorPlaylistsManager';

interface InstructorViewProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id' | 'rsvpCount'>) => void;
  language: Language;
  setActiveTab?: (tab: string) => void;
  lessons?: Lesson[];
  initialSubTab?: string;
  onOpenDocsModal?: () => void;
}

export interface InstructorDocument {
  id: string;
  title: string;
  category: 'guia_pdf' | 'planificacion_bpm';
  categoryLabel: string;
  format: string;
  description: string;
  fileUrl: string;
  fileName?: string;
  createdAt: string;
  downloadsCount: number;
  authorName?: string;
}

interface PublishedItem {
  id: string;
  title: string;
  type: 'workshop' | 'course' | 'ebook';
  price: number;
  salesCount: number;
  description: string;
  createdAt: string;
  status: 'active' | 'draft';
}

interface InstructorTransaction {
  id: string;
  itemTitle: string;
  itemType: 'workshop' | 'course' | 'ebook';
  studentName: string;
  amount: number;
  platformCut: number;
  netInstructor: number;
  date: string;
}

interface MockStudent {
  id: string;
  name: string;
  level: string;
  lastActive: string;
  email: string;
}

const INSTRUCTOR_TRANSLATIONS: Record<string, any> = {
  es: {
    title: "Laboratorio del Instructor",
    subtitle: "Administra tu cátedra, crea tus clases y haz crecer tus ingresos netos.",
    notInstructorTitle: "Conviértete en Instructor Waack On 🎓",
    notInstructorDesc: "Expande la academia creando tu propio portal de enseñanza independiente. Publica tus talleres intensivos presenciales o virtuales, cursos de biomecánica o ebooks de Waacking fijando tus propios precios. El portal deduce solo un 15% de comisión para reinversión en servidores y mantenimiento.",
    becomeBtn: "Habilitar Modo Instructor",
    backBtn: "Volver a Estudiante",
    tabOverview: "Finanzas y Ventas",
    tabPublish: "Publicar Contenido",
    tabStudents: "Alumnos",
    tabClasses: "Clases y Talleres",
    tabPromotion: "Planes de Destacado",
    grossRevenue: "Ingresos Brutos",
    platformFee: "Comisión Portal (15%)",
    netRevenue: "Ganancias Netas",
    totalSales: "Ventas Totales",
    activeStudents: "Alumnos Activos",
    recentSales: "Registro de Transacciones Recientes",
    simulateSale: "Simular Compra de Alumno 💸",
    simulateSaleDesc: "Simula que un alumno compra uno de tus talleres o contenidos activos para ver el desglose de comisiones y saldo neto.",
    simulateSuccess: "¡Simulación exitosa! Se procesó el pago con un 15% de retención del portal.",
    publishTitle: "Crear Nueva Publicación",
    pubType: "Tipo de Recurso",
    pubWorkshop: "Taller en Vivo (Workshop)",
    pubCourse: "Curso de Técnica Grabado",
    pubEbook: "Ebook / Guía Teórica PDF",
    pubName: "Título de la publicación",
    pubDesc: "Descripción, agenda o syllabus",
    pubPrice: "Precio de Venta ($ USD)",
    platformCutText: "Comisión retenida por Waack On (15%):",
    instructorPayoutText: "Tus ganancias netas netas:",
    publishBtn: "Publicar Recurso",
    publishedItems: "Portafolio de Recursos Publicados",
    tableStudent: "Alumno",
    tableLevel: "Nivel",
    tableLastActive: "Actividad",
    tableAction: "Acción",
    addClassEvent: "Agendar Sesión en Calendario Académico",
    classDate: "Fecha del Taller",
    classTime: "Hora de Inicio (ej: 19:30)",
    classDuration: "Duración Estimada (ej: 90 min)",
    classMeet: "Enlace Virtual de Meet / Zoom (Opcional)",
    scheduleSuccess: "¡Taller programado exitosamente! Tus alumnos podrán verlo en la pestaña de directos.",
    noPublishedItems: "Aún no has creado publicaciones de venta. ¡Inicia creando tu primer taller!",
    alertStudent: "Enviar recordatorio de postura",
    alertSent: "¡Notificación de práctica enviada al alumno!",
    currency: "USD"
  },
  en: {
    title: "Instructor Workspace",
    subtitle: "Manage your studio, launch workshops, and scale your net income.",
    notInstructorTitle: "Become a Waack On Instructor 🎓",
    notInstructorDesc: "Expand our community by setting up your own independent teaching suite. Publish live intensive workshops, biomechanical drilling courses, or styled ebooks, and set your own price points. The platform deducts a flat 15% maintenance fee to support streaming infrastructure.",
    becomeBtn: "Enable Instructor Mode",
    backBtn: "Switch to Student Mode",
    tabOverview: "Finance & Sales",
    tabPublish: "Publish Content",
    tabStudents: "Students List",
    tabClasses: "Schedule Classes",
    tabPromotion: "Promo & Featured",
    grossRevenue: "Gross Revenue",
    platformFee: "Platform Cut (15%)",
    netRevenue: "Net Earnings",
    totalSales: "Total Sales",
    activeStudents: "Active Students",
    recentSales: "Recent Transaction Ledger",
    simulateSale: "Simulate Student Purchase 💸",
    simulateSaleDesc: "Simulate a live student purchase of your active portfolio to review fee splitting.",
    simulateSuccess: "Simulation complete! Transacted with 15% platform retention.",
    publishTitle: "Create New Resource",
    pubType: "Resource Type",
    pubWorkshop: "Live Online/Offline Workshop",
    pubCourse: "Pre-recorded Technique Course",
    pubEbook: "Digital Ebook / PDF Guide",
    pubName: "Resource Title",
    pubDesc: "Description, syllabus, or requirements",
    pubPrice: "Selling Price ($ USD)",
    platformCutText: "Waack On maintenance fee (15%):",
    instructorPayoutText: "Your net payout:",
    publishBtn: "Publish Resource",
    publishedItems: "Your Published Resources",
    tableStudent: "Student",
    tableLevel: "Level",
    tableLastActive: "Last Active",
    tableAction: "Action",
    addClassEvent: "Add Class Session to Academy Calendar",
    classDate: "Event Date",
    classTime: "Start Time (e.g., 19:30)",
    classDuration: "Estimated Duration (e.g., 90 min)",
    classMeet: "Meet / Zoom Virtual link (Optional)",
    scheduleSuccess: "Workshop scheduled successfully! Students will see it in the Live tab.",
    noPublishedItems: "No sales assets published yet. Kick off by launching your first workshop!",
    alertStudent: "Send posture check alert",
    alertSent: "Practice reminder dispatched to the student!",
    currency: "USD"
  },
  ko: {
    title: "강사 관리 센터",
    subtitle: "수강생 관리, 신규 특강 및 교재 등록, 그리고 실시간 매출을 점검하세요.",
    notInstructorTitle: "Waack On 공식 강사 등록 🎓",
    notInstructorDesc: "와킹 아카데미 내에 나만의 독립 강좌를 개설해 보세요. 기획 워크숍, 비트 브레이킹 강의, 이론 전자책 등을 자유로운 정찰제로 전 세계 수강생들에게 판매할 수 있습니다. 플랫폼 유지 수수료는 단 15%입니다.",
    becomeBtn: "강사 권한 활성화",
    backBtn: "학생 모드로 복귀",
    tabOverview: "정산 및 거래 내역",
    tabPublish: "신규 강좌 등록",
    tabStudents: "학생 명부",
    tabClasses: "일정 및 워크숍 생성",
    tabPromotion: "인기 강사 플랜",
    grossRevenue: "총 누적 매출액",
    platformFee: "플랫폼 수수료 (15%)",
    netRevenue: "실제 정산 수령액",
    totalSales: "누적 판매 건수",
    activeStudents: "소속 수강생 수",
    recentSales: "최근 판매 정산 영수증",
    simulateSale: "학생 구매 모의 테스트 💸",
    simulateSaleDesc: "개설된 강좌를 학생이 실제로 구매하여 정산금과 15% 수수료 분할이 처리되는 과정을 시뮬레이션합니다.",
    simulateSuccess: "모의 구매 완료! 15% 수수료가 분할 정산되었습니다.",
    publishTitle: "새로운 판매 콘텐츠 기획",
    pubType: "콘텐츠 분야",
    pubWorkshop: "실시간 라이브 워크숍",
    pubCourse: "온라인 녹화 클래스",
    pubEbook: "왁킹 전자 가이드북 PDF",
    pubName: "강의 및 자료 제목",
    pubDesc: "강의 세부 계획 및 소개 글",
    pubPrice: "판매가 설정 ($ USD)",
    platformCutText: "Waack On 이용 수수료 (15%):",
    instructorPayoutText: "최종 정산 예상액:",
    publishBtn: "콘텐츠 공개하기",
    publishedItems: "공개 중인 콘텐츠 목록",
    tableStudent: "수강생 성명",
    tableLevel: "클래스 레벨",
    tableLastActive: "최근 연습일",
    tableAction: "피드백 알림",
    addClassEvent: "아카데미 캘린더에 수업 추가",
    classDate: "수업 진행일",
    classTime: "수업 개시 시간 (예: 19:30)",
    classDuration: "수업 예정 시간 (예: 90분)",
    classMeet: "비대면 Zoom/Meet 링크 (선택)",
    scheduleSuccess: "일정이 등록되었습니다! 라이브 탭에 노출됩니다.",
    noPublishedItems: "공개된 콘텐츠가 없습니다. 첫 특강을 올려보세요!",
    alertStudent: "올바른 자세 연습 알림",
    alertSent: "학생에게 연습 알림이 전송되었습니다!",
    currency: "USD"
  },
  ja: {
    title: "講師用ワークスペース",
    subtitle: "スクール運営、教材・ワークショップの公開、収益管理をワンストップで行えます。",
    notInstructorTitle: "Waack On インストラクターへの昇格 🎓",
    notInstructorDesc: "当プラットフォーム内であなたのオリジナルスクールを開講しましょう。オンラインでのワークショップや、アームロールの集中講座、電子テキスト等を好きなプライスで公開・販売できます。システム手数料は販売手数料15%のみです。",
    becomeBtn: "講師モードを起動する",
    backBtn: "生徒モードへ戻る",
    tabOverview: "売上と財務データ",
    tabPublish: "クラス・教材の公開",
    tabStudents: "受講生一覧",
    tabClasses: "レッスンスケジュール",
    tabPromotion: "おすすめ掲載プラン",
    grossRevenue: "総売上高",
    platformFee: "システム手数料 (15%)",
    netRevenue: "手取り純収益",
    totalSales: "総販売数",
    activeStudents: "受講生生徒数",
    recentSales: "売上トランザクション履歴",
    simulateSale: "生徒の購入シミュレーション 💸",
    simulateSaleDesc: "公開中の教材が生徒に購入された状況をエミュレートし、売上分配を確認します。",
    simulateSuccess: "エミュレーション完了！15%の管理手数料を差し引き加算しました。",
    publishTitle: "新規リソースをリリースする",
    pubType: "販売コンテンツの形式",
    pubWorkshop: "ライブワークショップ（特別講義）",
    pubCourse: "録画講座ビデオシリーズ",
    pubEbook: "教則用電子書籍・PDF",
    pubName: "コンテンツ名",
    pubDesc: "講義の概要・シラバス",
    pubPrice: "販売価格 ($ USD)",
    platformCutText: "Waack Onシステム手数料 (15%):",
    instructorPayoutText: "お受け取り予定額:",
    publishBtn: "コンテンツを公開",
    publishedItems: "リリース済みコンテンツポートフォリオ",
    tableStudent: "生徒",
    tableLevel: "クラス",
    tableLastActive: "最終アクティブ",
    tableAction: "お知らせ",
    addClassEvent: "カレンダーにクラスを追加",
    classDate: "開催予定日",
    classTime: "開始時間 (例: 19:30)",
    classDuration: "推定時間 (例: 90分)",
    classMeet: "Meet/Zoom配信リンク (任意)",
    scheduleSuccess: "クラスをカレンダーに追加しました！ライブタブで確認できます。",
    noPublishedItems: "まだ販売リソースがありません。最初の特別ワークショップを企画しましょう！",
    alertStudent: "姿勢改善の練習アドバイスを送る",
    alertSent: "生徒に自主練習リマインダーを送信しました！",
    currency: "USD"
  },
  pt: {
    title: "Escritório do Instrutor",
    subtitle: "Administre seus alunos, publique sessões pagas e gerencie suas receitas líquidas.",
    notInstructorTitle: "Torne-se um Instrutor Waack On 🎓",
    notInstructorDesc: "Amplie a escola criando sua suíte de ensino autônoma. Publique intensivos presenciais ou online, cursos de braço e velocidade, ou e-books autorais estipulando os valores que desejar. A plataforma retém apenas 15% do valor por transação para suporte e desenvolvimento.",
    becomeBtn: "Ativar Modo Instrutor",
    backBtn: "Voltar para Aluno",
    tabOverview: "Finanças e Vendas",
    tabPublish: "Publicar Conteúdo",
    tabStudents: "Painel de Alunos",
    tabClasses: "Grade de Aulas",
    tabPromotion: "Planos de Destaque",
    grossRevenue: "Faturamento Bruto",
    platformFee: "Taxa do Portal (15%)",
    netRevenue: "Receita Líquida",
    totalSales: "Total de Vendas",
    activeStudents: "Alunos Matriculados",
    recentSales: "Histórico de Vendas Recentes",
    simulateSale: "Simular Venda de Aluno 💸",
    simulateSaleDesc: "Simule que um aluno comprou uma de suas produções ativas para verificar a divisão de taxas e recebimento.",
    simulateSuccess: "Simulação de transação concluída! 15% retidos pela Waack On.",
    publishTitle: "Criar Nova Publicação de Venda",
    pubType: "Tipo de Item",
    pubWorkshop: "Workshop Intensivo (Ao Vivo)",
    pubCourse: "Curso em Vídeo Gravado",
    pubEbook: "E-book / Guia em PDF",
    pubName: "Nome do Material",
    pubDesc: "Resumo, cronograma ou requisitos",
    pubPrice: "Preço Comercial ($ USD)",
    platformCutText: "Taxa de intermediação Waack On (15%):",
    instructorPayoutText: "Seus ganhos líquidos finais:",
    publishBtn: "Publicar Item",
    publishedItems: "Seu Portfólio de Itens Publicados",
    tableStudent: "Estudante",
    tableLevel: "Grau",
    tableLastActive: "Log Recente",
    tableAction: "Feedback",
    addClassEvent: "Inserir Sessão no Calendário Escolar",
    classDate: "Data do Evento",
    classTime: "Hora de Início (ex: 19:30)",
    classDuration: "Tempo Estimado (ex: 90 min)",
    classMeet: "Link de Transmissão (Opcional)",
    scheduleSuccess: "Aula inserida com sucesso! Alunos poderão acessá-la no painel correspondente.",
    noPublishedItems: "Você ainda não possui materiais cadastrados para venda. Crie seu primeiro workshop!",
    alertStudent: "Notificar ajuste postural",
    alertSent: "Aviso de postura enviado ao estudante!",
    currency: "USD"
  }
};

const INITIAL_MOCK_STUDENTS: MockStudent[] = [
  { id: 'st-1', name: 'Ana "Waack Queen" Silva', level: 'Intermedio', lastActive: 'Ayer', email: 'ana.queen@dance.com' },
  { id: 'st-2', name: 'Ji-Won Kim', level: 'Principiante', lastActive: 'Hace 2 horas', email: 'jiwon@waack.kr' },
  { id: 'st-3', name: 'Yuki Sato', level: 'Avanzado', lastActive: 'Hace 3 días', email: 'yuki.s@dance.jp' },
  { id: 'st-4', name: 'Carlos Mendoza', level: 'Intermedio', lastActive: 'Hoy', email: 'carlos.m@waacking.es' },
  { id: 'st-5', name: 'Melissa Roberts', level: 'Principiante', lastActive: 'Hace 5 minutos', email: 'mel@roberts.com' }
];

const INITIAL_PUBLISHED_ITEMS: PublishedItem[] = [
  {
    id: 'pub-1',
    title: 'Waacking Arms and Speed Drill Intensive',
    type: 'workshop',
    price: 35.00,
    salesCount: 14,
    description: 'Taller virtual en vivo enfocado en la velocidad y limpieza de los brazos (overheads y rolls).',
    createdAt: '2026-07-10',
    status: 'active'
  },
  {
    id: 'pub-2',
    title: 'Biomecánica y Postura Sólida en Waacking',
    type: 'course',
    price: 49.00,
    salesCount: 8,
    description: 'Curso en video con 8 lecciones completas sobre la estabilidad del core y la articulación del hombro.',
    createdAt: '2026-07-05',
    status: 'active'
  }
];

const INITIAL_TRANSACTIONS: InstructorTransaction[] = [
  {
    id: 'tx-1',
    itemTitle: 'Waacking Arms and Speed Drill Intensive',
    itemType: 'workshop',
    studentName: 'Ana "Waack Queen" Silva',
    amount: 35.00,
    platformCut: 5.25,
    netInstructor: 29.75,
    date: '2026-07-15 18:30'
  },
  {
    id: 'tx-2',
    itemTitle: 'Biomecánica y Postura Sólida en Waacking',
    itemType: 'course',
    studentName: 'Yuki Sato',
    amount: 49.00,
    platformCut: 7.35,
    netInstructor: 41.65,
    date: '2026-07-14 11:20'
  }
];

const INITIAL_INSTRUCTOR_DOCUMENTS: InstructorDocument[] = [
  {
    id: 'doc-biomecanica-1',
    title: 'Cuaderno de Práctica Biomecánica para prevención de lesiones de hombro y codo',
    category: 'guia_pdf',
    categoryLabel: 'Guía y Manual de Técnica en PDF',
    format: 'PDF - 18 Páginas (Biomecánica & Anatomía)',
    description: 'Guía técnica e ilustrada para la prevención de sobrecarga en hombros y codos en Waacking. Incluye gráficos de alineación articular, rotación de escápula y ejercicios de calentamiento biomecánico.',
    fileUrl: 'https://waackon.app/docs/Cuaderno_Practica_Biomecanica_Prevencion_Lesiones.pdf',
    fileName: 'Cuaderno_Practica_Biomecanica_Prevencion_Lesiones.pdf',
    createdAt: '2026-08-07',
    downloadsCount: 54,
    authorName: 'Docente Waack On'
  },
  {
    id: 'doc-planificacion-bpm-2',
    title: 'Planificación Semanal de Entrenamiento BPM & Drills (Plantilla Imprimible & Digital)',
    category: 'planificacion_bpm',
    categoryLabel: 'Planificación de Entrenamiento / Rutina BPM',
    format: 'Plantilla Imprimible / Digital (PDF & Doc)',
    description: 'Plantilla interactiva diseñada para que las alumnas registren sus rutinas de BPM semanales, metas de incremento de tempo en Arms Control, minutos de práctica en metrónomo y diario de fatiga muscular.',
    fileUrl: 'https://waackon.app/docs/Planificacion_Semanal_Entrenamiento_BPM_Imprimible.pdf',
    fileName: 'Planificacion_Semanal_Entrenamiento_BPM_Imprimible.pdf',
    createdAt: '2026-08-07',
    downloadsCount: 92,
    authorName: 'Docente Waack On'
  }
];

export default function InstructorView({
  currentUser,
  onUserChange,
  events,
  onAddEvent,
  language,
  setActiveTab,
  lessons = [],
  initialSubTab = 'dashboard',
  onOpenDocsModal
}: InstructorViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    'dashboard' | 'finances' | 'overview' | 'publish' | 'documents' | 'students' | 'classes' | 'promotion' | 'methodology' | 'soundcloud' | 'podcasts' | 'workspace_classroom' | 'workspace_tasks' | 'workspace_gmail' | 'workspace_drive'
  >((initialSubTab as any) || 'dashboard');

  // Google Workspace Integrated Modal Tool State
  const [activeWorkspaceModal, setActiveWorkspaceModal] = useState<'classroom' | 'tasks' | 'gmail' | 'drive' | 'slides' | null>(null);

  // Instructor Documents & PDF Guides State
  const [instructorDocuments, setInstructorDocuments] = useState<InstructorDocument[]>(() => {
    try {
      const saved = localStorage.getItem('waack_instructor_documents');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_INSTRUCTOR_DOCUMENTS;
  });

  useEffect(() => {
    localStorage.setItem('waack_instructor_documents', JSON.stringify(instructorDocuments));
  }, [instructorDocuments]);

  // Form state for creating new PDF document
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<'guia_pdf' | 'planificacion_bpm'>('guia_pdf');
  const [docFormat, setDocFormat] = useState('PDF - Guía Técnica');
  const [docDescription, setDocDescription] = useState('');
  const [docFileUrl, setDocFileUrl] = useState('');
  const [docFileName, setDocFileName] = useState('');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const handleFileUploadPDF = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingDoc(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setDocFileUrl(result);
      setDocFileName(file.name);
      if (!docTitle) {
        setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
      setIsUploadingDoc(false);
      playChime('click');
    };
    reader.readAsDataURL(file);
  };

  const handlePublishDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;
    const newDoc: InstructorDocument = {
      id: `doc-${Date.now()}`,
      title: docTitle.trim(),
      category: docCategory,
      categoryLabel: docCategory === 'guia_pdf' ? 'Guía y Manual de Técnica en PDF' : 'Planificación de Entrenamiento / Rutinas BPM',
      format: docFormat || (docCategory === 'guia_pdf' ? 'PDF - Documento Técnico' : 'Plantilla Imprimible'),
      description: docDescription.trim() || 'Documento oficial subido para el alumnado de la academia.',
      fileUrl: docFileUrl || 'https://waackon.app/docs/Material_Oficial_WaackOn.pdf',
      fileName: docFileName || `${docTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      createdAt: new Date().toISOString().split('T')[0],
      downloadsCount: 0,
      authorName: currentUser.name || 'Docente Waack On'
    };
    setInstructorDocuments(prev => [newDoc, ...prev]);
    setDocTitle('');
    setDocDescription('');
    setDocFileUrl('');
    setDocFileName('');
    playChime('success');
    setAlertText('¡Documento publicado exitosamente en el panel de alumnas!');
    setTimeout(() => setAlertText(null), 3500);
  };

  const handleDeleteDocument = (id: string) => {
    setInstructorDocuments(prev => prev.filter(d => d.id !== id));
    playChime('click');
    setAlertText('Documento eliminado.');
    setTimeout(() => setAlertText(null), 2500);
  };

  // Instructor Podcasts State & Persistence
  const [instructorPodcasts, setInstructorPodcasts] = useState<PodcastShow[]>(() => {
    try {
      const saved = localStorage.getItem('waack_instructor_podcasts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.episodes !== undefined) {
          return parsed;
        }
      }
    } catch (e) {}
    return INITIAL_PODCAST_SHOWS;
  });

  const [isPodcastModalOpen, setIsPodcastModalOpen] = useState(false);
  const [selectedPodcastForEdit, setSelectedPodcastForEdit] = useState<PodcastShow | null>(null);
  const [podcastModalMode, setPodcastModalMode] = useState<'create_show' | 'add_episode'>('create_show');

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab as any);
    }
  }, [initialSubTab]);
  const [broadcastInput, setBroadcastInput] = useState('');
  const [customMonthlyPriceInput, setCustomMonthlyPriceInput] = useState(currentUser.monthlyPrice || '$15.00 USD/mes');
  const [priceNumberInput, setPriceNumberInput] = useState<string>(() => {
    const raw = (currentUser.monthlyPrice || '$15.00').replace(/[^0-9.]/g, '');
    return raw || '15.00';
  });
  const [isUpdatingPrice, setIsUpdatingPrice] = useState<boolean>(false);
  const [pricingError, setPricingError] = useState<string | null>(null);

  const handleUpdatePricing = async (valueToUpdate?: string) => {
    setPricingError(null);
    setIsUpdatingPrice(true);

    const val = valueToUpdate !== undefined ? valueToUpdate : priceNumberInput;
    const cleanNum = parseFloat(val.replace(/[^0-9.]/g, ''));

    // Business rule: prevents negative or null values
    if (isNaN(cleanNum) || cleanNum <= 0) {
      const err = 'Regla de negocio: La tarifa mensual debe ser un valor positivo mayor a $0.00 USD (no se permiten valores negativos ni nulos).';
      setPricingError(err);
      setIsUpdatingPrice(false);
      playChime('error');
      return;
    }

    try {
      const formattedPrice = `$${cleanNum.toFixed(2)} USD/mes`;

      await updateInstructorPricingMethodologyBackend(currentUser, {
        monthlyPriceUSD: cleanNum,
        monthlyPriceFormatted: formattedPrice,
        methodologyDescription: currentUser.methodologyDescription || '',
        associatedLabTools: currentUser.associatedLabTools || []
      });

      const updatedUser: User = {
        ...currentUser,
        monthlyPrice: formattedPrice,
        monthlyPriceUSD: cleanNum
      };

      onUserChange(updatedUser);
      localStorage.setItem('waack_user', JSON.stringify(updatedUser));
      setCustomMonthlyPriceInput(formattedPrice);
      setPriceNumberInput(cleanNum.toFixed(2));
      playChime('success');
      setAlertText(`¡Tarifa actualizada a ${formattedPrice} y reflejada inmediatamente en el Directorio Global!`);
      setTimeout(() => setAlertText(null), 4000);
    } catch (err: any) {
      console.error('[Update Pricing Error]:', err);
      setPricingError(err.message || 'Error al actualizar la tarifa en el servidor');
      playChime('error');
    } finally {
      setIsUpdatingPrice(false);
    }
  };
  
  // Persistence state
  const [publishedItems, setPublishedItems] = useState<PublishedItem[]>(() => {
    const saved = localStorage.getItem('waack_inst_published');
    return saved ? JSON.parse(saved) : INITIAL_PUBLISHED_ITEMS;
  });

  const [transactions, setTransactions] = useState<InstructorTransaction[]>(() => {
    const saved = localStorage.getItem('waack_inst_txs');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [students, setStudents] = useState<MockStudent[]>(() => {
    const saved = localStorage.getItem('waack_inst_students');
    return saved ? JSON.parse(saved) : INITIAL_MOCK_STUDENTS;
  });

  // Local state to maintain the selected/filtered student UID across dashboard tabs
  const [selectedStudentUid, setSelectedStudentUid] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('waack_inst_selected_student_uid') || null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (selectedStudentUid) {
        sessionStorage.setItem('waack_inst_selected_student_uid', selectedStudentUid);
      } else {
        sessionStorage.removeItem('waack_inst_selected_student_uid');
      }
    } catch (e) {}
  }, [selectedStudentUid]);

  const selectedStudent = useMemo(() => {
    if (!selectedStudentUid) return null;
    return (students || []).find(s => s.id === selectedStudentUid || (s as any).uid === selectedStudentUid) || null;
  }, [students, selectedStudentUid]);

  const handleSelectStudentForFilter = (studentId: string | null) => {
    setSelectedStudentUid(studentId);
    playChime('click');
    if (studentId) {
      const found = students.find(s => s.id === studentId);
      if (found) {
        setAlertText(`Filtro activo: ${found.name} (UID: ${found.id})`);
        setTimeout(() => setAlertText(null), 3000);
      }
    } else {
      setAlertText('Filtro de alumno desactivado (Mostrando todos).');
      setTimeout(() => setAlertText(null), 2500);
    }
  };

  // State alerts
  const [alertText, setAlertText] = useState<string | null>(null);

  // Form State for creating a published item
  const [pubType, setPubType] = useState<'workshop' | 'course' | 'ebook'>('workshop');
  const [pubTitle, setPubTitle] = useState('');
  const [pubDesc, setPubDesc] = useState('');
  const [pubPrice, setPubPrice] = useState('25.00');

  // Promotion Subscription state
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'semi-annual' | 'annual' | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutCardName, setCheckoutCardName] = useState('');
  const [checkoutCardNumber, setCheckoutCardNumber] = useState('');
  const [checkoutCardExpiry, setCheckoutCardExpiry] = useState('');
  const [checkoutCardCVC, setCheckoutCardCVC] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Form State for scheduling a class event
  const [classPanelSubTab, setClassPanelSubTab] = useState<'schedule' | 'curriculum' | 'live_control' | 'submissions'>('schedule');
  const [classTitle, setClassTitle] = useState('');
  const [classDate, setClassDate] = useState('');
  const [classTime, setClassTime] = useState('');
  const [classDuration, setClassDuration] = useState('90 min');
  const [classMeet, setClassMeet] = useState('');
  const [classMusicUrl, setClassMusicUrl] = useState('');
  const [classBpm, setClassBpm] = useState<number | ''>(128);
  const [classEventType, setClassEventType] = useState<'Masterclass Magistral' | 'Taller Intensivo de Técnica' | 'Sesión 1-a-1 de Corrección' | 'Laboratorio de Freestyle'>('Taller Intensivo de Técnica');
  const [classTargetAudience, setClassTargetAudience] = useState<'all' | 'selected_only' | 'level_specific'>('all');
  const [classTargetLevel, setClassTargetLevel] = useState<'all' | 'Principiante' | 'Intermedio' | 'Avanzado'>('all');
  const [classNotes, setClassNotes] = useState('');

  // Attendance Sheet Modal / State for scheduled classes
  const [attendanceModalEvent, setAttendanceModalEvent] = useState<any | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, Record<string, 'present' | 'absent' | 'late'>>>(() => {
    try {
      const saved = localStorage.getItem('waack_inst_attendance_records');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('waack_inst_attendance_records', JSON.stringify(attendanceRecords));
    } catch (e) {}
  }, [attendanceRecords]);

  // Live Control Room & Metronome & Round Timer State
  const [liveMetronomeActive, setLiveMetronomeActive] = useState(false);
  const [liveMetronomeBpm, setLiveMetronomeBpm] = useState(124);
  const [liveMetronomeBeat, setLiveMetronomeBeat] = useState(1);
  const [liveRoundTimerSeconds, setLiveRoundTimerSeconds] = useState(60);
  const [liveRoundInitialTime, setLiveRoundInitialTime] = useState(60);
  const [liveRoundTimerRunning, setLiveRoundTimerRunning] = useState(false);
  const [liveTeacherNotes, setLiveTeacherNotes] = useState(() => {
    return localStorage.getItem('waack_inst_live_teacher_notes') || "Observaciones de la Cátedra:\n- Sofía: Mejorar la extensión de codo en compás 4.\n- Carlos: Excelente velocidad en roll; mantener la mirada erguida al público.\n- Yuki: Mantener ritmo a 128 BPM en posing sincopado.";
  });

  useEffect(() => {
    try {
      localStorage.setItem('waack_inst_live_teacher_notes', liveTeacherNotes);
    } catch (e) {}
  }, [liveTeacherNotes]);

  // Metronome beat interval
  useEffect(() => {
    if (!liveMetronomeActive) return;
    const intervalMs = (60 / liveMetronomeBpm) * 1000;
    const intervalId = setInterval(() => {
      setLiveMetronomeBeat(prev => (prev % 8) + 1);
      // Play audio click
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        // Accent on beat 1 and beat 5
        const isAccent = (liveMetronomeBeat === 1 || liveMetronomeBeat === 5);
        osc.frequency.setValueAtTime(isAccent ? 880 : 440, ctx.currentTime);
        gain.gain.setValueAtTime(isAccent ? 0.1 : 0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } catch (e) {}
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [liveMetronomeActive, liveMetronomeBpm, liveMetronomeBeat]);

  // Live round timer interval
  useEffect(() => {
    if (!liveRoundTimerRunning) return;
    const timerId = setInterval(() => {
      setLiveRoundTimerSeconds(prev => {
        if (prev <= 1) {
          setLiveRoundTimerRunning(false);
          playChime('cash');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [liveRoundTimerRunning]);

  // Curriculum Management State
  const [curriculumSearchQuery, setCurriculumSearchQuery] = useState('');
  const [curriculumLevelFilter, setCurriculumLevelFilter] = useState<'all' | 'Principiante' | 'Intermedio' | 'Avanzado'>('all');
  const [curriculumAssignedMap, setCurriculumAssignedMap] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem('waack_inst_curriculum_assigned');
      return saved ? JSON.parse(saved) : {
        '1': ['st-101', 'st-102', 'st-103'],
        '2': ['st-101', 'st-102'],
        '3': ['st-101']
      };
    } catch (e) {
      return {};
    }
  });

  const [curriculumApprovedMap, setCurriculumApprovedMap] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem('waack_inst_curriculum_approved');
      return saved ? JSON.parse(saved) : {
        '1': ['st-101']
      };
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('waack_inst_curriculum_assigned', JSON.stringify(curriculumAssignedMap));
      localStorage.setItem('waack_inst_curriculum_approved', JSON.stringify(curriculumApprovedMap));
    } catch (e) {}
  }, [curriculumAssignedMap, curriculumApprovedMap]);

  // Student Submissions & Technical Homework State
  const [studentSubmissions, setStudentSubmissions] = useState<Array<{
    id: string;
    studentId: string;
    studentName: string;
    lessonTitle: string;
    submittedAt: string;
    videoUrl: string;
    status: 'pending' | 'graded';
    score?: number;
    feedback?: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem('waack_inst_submissions');
      return saved ? JSON.parse(saved) : [
        {
          id: 'sub-1',
          studentId: 'st-101',
          studentName: 'Ana "Waack Queen"',
          lessonTitle: 'Fundamentos de Geometría Braquial & Rolls',
          submittedAt: 'Hoy, 12:45',
          videoUrl: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&q=80&w=600',
          status: 'pending'
        },
        {
          id: 'sub-2',
          studentId: 'st-102',
          studentName: 'Ji-Won Kim',
          lessonTitle: 'Pose Diva & Líneas de Hombro 70s',
          submittedAt: 'Ayer, 18:20',
          videoUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600',
          status: 'pending'
        }
      ];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('waack_inst_submissions', JSON.stringify(studentSubmissions));
    } catch (e) {}
  }, [studentSubmissions]);

  // Feedback modal or editing submission
  const [gradingSubmission, setGradingSubmission] = useState<{
    submission: any;
    score: number;
    feedback: string;
  } | null>(null);

  // New Lesson Direct Creation Modal
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonCategory, setNewLessonCategory] = useState('Arms & Hands Control');
  const [newLessonLevel, setNewLessonLevel] = useState<'Principiante' | 'Intermedio' | 'Avanzado'>('Intermedio');
  const [newLessonDuration, setNewLessonDuration] = useState('15 min');
  const [newLessonBpm, setNewLessonBpm] = useState(128);
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState('');
  const [newLessonDescription, setNewLessonDescription] = useState('');

  // Expediente / Profile Dossier State (Left Panel)
  const [dossierRealName, setDossierRealName] = useState(() => localStorage.getItem('waack_inst_realname') || currentUser.name || "Jessica Soner");
  const [dossierAkaName, setDossierAkaName] = useState(() => localStorage.getItem('waack_inst_akaname') || "Princess Waack");
  const [dossierBio, setDossierBio] = useState(() => localStorage.getItem('waack_inst_bio') || "Especialista en Waacking, Posing y Expresividad Escénica con más de 12 años de trayectoria internacional en batallas y producciones teatrales. Mi metodología se centra en la musicalidad orgánica, simetría braquial y presencia de impacto.");
  const [dossierInstagram, setDossierInstagram] = useState(() => localStorage.getItem('waack_inst_ig') || "@jassysoner.waack");
  const [dossierTiktok, setDossierTiktok] = useState(() => localStorage.getItem('waack_inst_tt') || "@jassywaack");
  const [dossierYoutube, setDossierYoutube] = useState(() => localStorage.getItem('waack_inst_yt') || "youtube.com/@jassysonerwaack");
  const [dossierThreads, setDossierThreads] = useState(() => localStorage.getItem('waack_inst_th') || "@jassysoner");
  const [dossierAvatar, setDossierAvatar] = useState(() => localStorage.getItem('waack_inst_avatar') || currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400");
  const [newMilestoneInput, setNewMilestoneInput] = useState('');
  const [dossierMilestones, setDossierMilestones] = useState<string[]>(() => {
    const saved = localStorage.getItem('waack_inst_milestones');
    return saved ? JSON.parse(saved) : [
      "Ganadora 'Waack Up Europe Paris 2023'",
      "Juez Oficial Red Bull Dance Your Style Mexico 2024",
      "Directora & Fundadora de Waack On Intensive Academy",
      "Coreógrafa de la gira 'Disco Groove Experience 2025'"
    ];
  });
  
  const [newPortfolioUrl, setNewPortfolioUrl] = useState('');
  const [dossierPortfolio, setDossierPortfolio] = useState<string[]>(() => {
    const saved = localStorage.getItem('waack_inst_portfolio');
    return saved ? JSON.parse(saved) : [
      "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&q=80&w=600"
    ];
  });

  // Week-by-Week Training Plan State
  const [trainingWeeks, setTrainingWeeks] = useState<Array<{week: number; title: string; desc: string; focus: string; duration: string}>>(() => {
    const saved = localStorage.getItem('waack_inst_weeks');
    return saved ? JSON.parse(saved) : [
      { week: 1, title: "Semana 1: Fundamentos de Geometría Braquial", desc: "Alineación de codos, velocidad de rotación en hombros y control angular en poses fijas.", focus: "Técnica Base & Fuerza", duration: "3 Horas de Clase" },
      { week: 2, title: "Semana 2: Postura Diva & Posing Dramático", desc: "Uso de la mirada, ángulos faciales y proyección escénica inspirada en la era Disco Glam 70s.", focus: "Expresividad & Carácter", duration: "3.5 Horas" },
      { week: 3, title: "Semana 3: Micro-Musicalidad & Sincopa", desc: "Desglose de ritmos complejos de la B.S.O. de Funk & Disco, acentos sutiles y polirritmia.", focus: "Listening & Sharp Accentuation", duration: "4 Horas" },
      { week: 4, title: "Semana 4: Battle Readiness & Solo Choreography", desc: "Construcción de rondas de freestyle en batalla, manejo de presión y creación de solo de graduación.", focus: "Estrategia & Performance", duration: "4 Horas + Evaluativo" }
    ];
  });

  // Selected Instructor Modal for Floating Training Plan Card
  const [selectedInstructorPlan, setSelectedInstructorPlan] = useState<any | null>(null);

  // Onboarding Engine State
  const [showQuestionnaireModal, setShowQuestionnaireModal] = useState<boolean>(false);
  const [selectedStudentPlan, setSelectedStudentPlan] = useState<{ student: MockStudent; planMarkdown: string } | null>(null);
  const [studentPlansMap, setStudentPlansMap] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('waack_student_plans_map');
    return saved ? JSON.parse(saved) : {
      'st-101': `👤 Perfil de Ingreso del Alumno
Alumno: Sofia Disco

Objetivo Principal (Waacking): Competir en batallas 1v1 y dominar el musicality sincopado a 128 BPM.

Puntos de Fricción (Desafíos): Rigidez en la mirada en momentos de presión y ligera asimetría en los arm-rolls con el brazo izquierdo.

🎯 Estrategia Pedagógica Sugerida
Enfoque Técnico: Calibrar la simetría de rotación en codos y aceleración de muñecas a contratiempo.

Enfoque Expresivo/Musical: Trabajar la disociación facial y proyección escénica en momentos de pausa y posing.

🔬 Integración del Freestyle Lab
DramaLab: Configurar el modo de contacto visual escénico y micro-expresiones dramáticas para mantener la firmeza gestual en batalla.

SomaticFeedbackLab / Espejo Ciego: Trabajar 3 minutos en oscuridad parcial o sin espejo para forzar la propiocepción del codo izquierdo.

📅 Plan de Acción (Semanas 1-4)
Semana 1-2 (Fundamentación y Desbloqueo):
- 3 sesiones semanales en Espejo Ciego acelerando de 100 a 120 BPM.
- Grabar 1 toma en DramaLab ejecutando miradas fijas en los acentos de batería.

Semana 3-4 (Progresión):
- Batallas de prueba en BattleLab nivel medio con secuencias de posing de 2 tiempos.
- Corrección de postura erguida en giros acelerados.

✅ Tareas Recomendadas (Para el sistema de tareas)
- Grabar 2 minutos en el SomaticFeedbackLab enfocándose en la extensión del brazo izquierdo
- Superar el nivel 3 del Entrenador de Ritmo a 120 BPM manteniendo la limpieza`
    };
  });

  const handleOpenStudentPlan = (student: MockStudent) => {
    const existingPlan = studentPlansMap[student.id] || `👤 Perfil de Ingreso del Alumno
Alumno: ${student.name}

Objetivo Principal (Waacking): Desarrollar vocabulario técnico de Whacking y ganar fluidez en freestyle.

Puntos de Fricción (Desafíos): Falta de confianza al improvisar y tensión acumulada en hombros.

🎯 Estrategia Pedagógica Sugerida
Enfoque Técnico: Relajación trapecial, extensión completa de codos y limpieza angular en Posing.

Enfoque Expresivo/Musical: Escucha activa de B.S.O. Disco de los 70s e interpretación de instrumentos de viento.

🔬 Integración del Freestyle Lab
SomaticFeedbackLab / Espejo Ciego: Uso obligatorio para desacoplar la dependencia visual del reflejo y ganar memoria muscular.

DramaLab: Micro-ejercicios de intencionalidad teatral (glamour, furia, juego).

📅 Plan de Acción (Semanas 1-4)
Semana 1-2 (Fundamentación y Desbloqueo):
- Drills de 10 minutos de rotación limpia de brazos sin mover el torso.
- 2 prácticas semanales en Espejo Ciego a 110 BPM.

Semana 3-4 (Progresión):
- Aumento gradual a 125 BPM e integración de pasarela con poses.

✅ Tareas Recomendadas (Para el sistema de tareas)
- Grabar 2 minutos en SomaticFeedbackLab a 110 BPM
- Completar la evaluación de historia de los clubes de LA`;

    setSelectedStudentPlan({ student, planMarkdown: existingPlan });
  };

  // Subscribed instructors state ($15 USD/mes per instructor)
  const [subscribedInstructors, setSubscribedInstructors] = useState<string[]>(() => {
    const saved = localStorage.getItem('waack_subscribed_instructors');
    return saved ? JSON.parse(saved) : ['Brandon Hermoso'];
  });

  const toggleSubscribeInstructor = (instructorName: string, price: string = "$15 USD/mes") => {
    setSubscribedInstructors(prev => {
      let updated: string[];
      if (prev.includes(instructorName)) {
        updated = prev.filter(name => name !== instructorName);
        playChime('click');
        setAlertText(`Suscripción a ${instructorName} desactivada.`);
      } else {
        updated = [...prev, instructorName];
        playChime('cash');
        setAlertText(`¡Suscripción activa a ${instructorName} por ${price}! Acceso completo concedido.`);
      }
      localStorage.setItem('waack_subscribed_instructors', JSON.stringify(updated));
      setTimeout(() => setAlertText(null), 4000);
      return updated;
    });
  };

  const audioCtxRef = useRef<AudioContext | null>(null);

  const [rbacVerified, setRbacVerified] = useState<boolean | null>(null);
  const [rbacDetail, setRbacDetail] = useState<string>('Verificando RBAC en backend...');

  useEffect(() => {
    async function verifyRbac() {
      if (currentUser.role === 'instructor') {
        try {
          const metrics = await fetchInstructorMetrics(currentUser);
          setRbacVerified(true);
          setRbacDetail(`Backend RBAC Validado (${metrics.databaseEngine})`);
        } catch (err: any) {
          setRbacVerified(false);
          setRbacDetail(err.message || 'RBAC Rechazado por Servidor');
        }
      }
    }
    verifyRbac();
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('waack_inst_published', JSON.stringify(publishedItems));
  }, [publishedItems]);

  useEffect(() => {
    localStorage.setItem('waack_inst_txs', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('waack_inst_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('waack_instructor_podcasts', JSON.stringify(instructorPodcasts));
  }, [instructorPodcasts]);

  const handleSavePodcast = (savedShow: PodcastShow) => {
    setInstructorPodcasts(prev => {
      const exists = prev.some(p => p.id === savedShow.id);
      if (exists) {
        return prev.map(p => p.id === savedShow.id ? savedShow : p);
      } else {
        return [savedShow, ...prev];
      }
    });
    setAlertText(`¡Podcast "${savedShow.title}" guardado correctamente en tu cátedra!`);
    setTimeout(() => setAlertText(null), 4000);
  };

  const handleAddEpisodeToPodcast = (podcastId: string, episode: PodcastEpisode) => {
    setInstructorPodcasts(prev => (prev || []).map(p => {
      if (p.id === podcastId) {
        return {
          ...p,
          episodes: [episode, ...(p.episodes || [])]
        };
      }
      return p;
    }));
    setAlertText(`¡Episodio "${episode.title}" publicado con éxito!`);
    setTimeout(() => setAlertText(null), 4000);
  };

  const handleDeletePodcast = (podcastId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este programa de podcast?')) {
      setInstructorPodcasts(prev => (prev || []).filter(p => p && p.id !== podcastId));
      setAlertText('Podcast eliminado.');
      setTimeout(() => setAlertText(null), 3000);
    }
  };

  const handleDeleteEpisode = (podcastId: string, episodeId: string) => {
    if (window.confirm('¿Eliminar este episodio de podcast?')) {
      setInstructorPodcasts(prev => (prev || []).map(p => {
        if (p.id === podcastId) {
          return {
            ...p,
            episodes: (p.episodes || []).filter(ep => ep && ep.id !== episodeId)
          };
        }
        return p;
      }));
      setAlertText('Episodio eliminado.');
      setTimeout(() => setAlertText(null), 3000);
    }
  };

  const playChime = (type: 'success' | 'click' | 'cash' | 'error') => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (type === 'error') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
        return;
      }
      
      if (type === 'cash') {
        // Double register coin sound
        const playCoin = (freq: number, startTime: number, vol: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(vol, startTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.15);
          osc.start(startTime);
          osc.stop(startTime + 0.15);
        };
        const now = ctx.currentTime;
        playCoin(987.77, now, 0.08); // B5
        playCoin(1318.51, now + 0.08, 0.08); // E6
      } else if (type === 'success') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.08); // G5
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(650, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      }
    } catch (e) {
      console.warn("Audio Context failed:", e);
    }
  };

  const t = INSTRUCTOR_TRANSLATIONS[language] || INSTRUCTOR_TRANSLATIONS['es'];

  // Calculate totals
  const totalGross = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPlatformCut = transactions.reduce((acc, curr) => acc + curr.platformCut, 0);
  const totalNet = transactions.reduce((acc, curr) => acc + curr.netInstructor, 0);
  const totalSalesCount = transactions.length;

  const handleBecomeInstructor = () => {
    playChime('success');
    onUserChange({
      ...currentUser,
      role: 'instructor'
    });
  };

  const handleBroadcastMessage = () => {
    if (!broadcastInput.trim()) return;
    playChime('success');
    setAlertText(language === 'es' ? `¡Mensaje difundido a todos los estudiantes: "${broadcastInput}"!` : `Broadcast sent: "${broadcastInput}"`);
    setBroadcastInput('');
    setTimeout(() => setAlertText(null), 4000);
  };

  const handleStartLiveClass = () => {
    playChime('success');
    setActiveSubTab('classes');
    setAlertText(language === 'es' ? 'Abre la agenda de clases para transmitir en directo.' : 'Opening schedule live class suite.');
    setTimeout(() => setAlertText(null), 3000);
  };

  const handleSaveDossier = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    localStorage.setItem('waack_inst_realname', dossierRealName);
    localStorage.setItem('waack_inst_akaname', dossierAkaName);
    localStorage.setItem('waack_inst_bio', dossierBio);
    localStorage.setItem('waack_inst_ig', dossierInstagram);
    localStorage.setItem('waack_inst_tt', dossierTiktok);
    localStorage.setItem('waack_inst_yt', dossierYoutube);
    localStorage.setItem('waack_inst_th', dossierThreads);
    localStorage.setItem('waack_inst_avatar', dossierAvatar);
    localStorage.setItem('waack_inst_milestones', JSON.stringify(dossierMilestones));
    localStorage.setItem('waack_inst_portfolio', JSON.stringify(dossierPortfolio));
    localStorage.setItem('waack_inst_weeks', JSON.stringify(trainingWeeks));

    playChime('success');
    setAlertText(language === 'es' ? "¡Expediente de Instructor y Plan de Entrenamiento guardados correctamente!" : "Instructor Dossier & Training Plan successfully updated!");
    setTimeout(() => setAlertText(null), 3500);
  };

  const handleAddMilestone = () => {
    if (!newMilestoneInput.trim()) return;
    const updated = [...dossierMilestones, newMilestoneInput.trim()];
    setDossierMilestones(updated);
    localStorage.setItem('waack_inst_milestones', JSON.stringify(updated));
    setNewMilestoneInput('');
    playChime('click');
  };

  const handleDeleteMilestone = (index: number) => {
    const updated = (dossierMilestones || []).filter((_, i) => i !== index);
    setDossierMilestones(updated);
    localStorage.setItem('waack_inst_milestones', JSON.stringify(updated));
    playChime('click');
  };

  // Lightbox for Instructor portfolio
  const [instructorLightboxPhoto, setInstructorLightboxPhoto] = useState<string | null>(null);

  // File Upload Handler for Instructor Avatar
  const handleInstructorAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      setDossierAvatar(dataUrl);
      localStorage.setItem('waack_inst_avatar', dataUrl);
      onUserChange({ ...currentUser, avatar: dataUrl });
      playChime('success');
      setAlertText('¡Imagen de perfil del instructor actualizada correctamente!');
      setTimeout(() => setAlertText(null), 3500);
    };
    reader.readAsDataURL(file);
  };

  // File Upload Handler for Instructor Portfolio / Mis Imágenes
  const handleInstructorPortfolioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (!dataUrl) return;

        setDossierPortfolio((prev) => {
          const updated = [dataUrl, ...prev];
          localStorage.setItem('waack_inst_portfolio', JSON.stringify(updated));
          return updated;
        });

        playChime('success');
        setAlertText('¡Nueva imagen agregada a tu portafolio!');
        setTimeout(() => setAlertText(null), 3500);
      };
      reader.readAsDataURL(file as Blob);
    });
  };

  const handleRemovePortfolioPhoto = (photoUrl: string) => {
    const updated = (dossierPortfolio || []).filter(p => p !== photoUrl);
    setDossierPortfolio(updated);
    localStorage.setItem('waack_inst_portfolio', JSON.stringify(updated));
    setAlertText('Imagen eliminada del portafolio.');
    setTimeout(() => setAlertText(null), 3500);
  };

  const handleSetPortfolioAsInstructorAvatar = (photoUrl: string) => {
    setDossierAvatar(photoUrl);
    localStorage.setItem('waack_inst_avatar', photoUrl);
    onUserChange({ ...currentUser, avatar: photoUrl });
    playChime('success');
    setAlertText('¡Foto establecida como avatar del instructor!');
    setTimeout(() => setAlertText(null), 3500);
  };

  const handleAddPortfolioPhoto = () => {
    if (!newPortfolioUrl.trim()) return;
    const updated = [...(dossierPortfolio || []), newPortfolioUrl.trim()];
    setDossierPortfolio(updated);
    localStorage.setItem('waack_inst_portfolio', JSON.stringify(updated));
    setNewPortfolioUrl('');
    playChime('click');
  };

  const handleDeletePortfolioPhoto = (index: number) => {
    const updated = (dossierPortfolio || []).filter((_, i) => i !== index);
    setDossierPortfolio(updated);
    localStorage.setItem('waack_inst_portfolio', JSON.stringify(updated));
    playChime('click');
  };

  const handleJoinTrainingPlan = (instructorName: string) => {
    playChime('cash');
    setAlertText(language === 'es' ? `¡Te has unido exitosamente al Plan de Entrenamiento de ${instructorName}! Acceso concedido a todas las semanas.` : `Joined ${instructorName}'s Training Plan! Access granted to all weeks.`);
    setSelectedInstructorPlan(null);
    setTimeout(() => setAlertText(null), 4000);
  };

  const handleRevertToStudent = () => {
    playChime('click');
    onUserChange({
      ...currentUser,
      role: 'student'
    });
  };

  const handleCancelSubscription = () => {
    if (window.confirm(language === 'es' ? '¿Estás seguro de que deseas desactivar tu estatus de destacado? Perderás posicionamiento prioritario en la búsqueda.' : 'Are you sure you want to deactivate your featured status? You will lose search visibility priority.')) {
      playChime('click');
      const updatedUser = {
        ...currentUser,
        isFeaturedInstructor: false,
        billingStatus: 'cancelled' as const,
        featuredPlan: undefined,
        featuredExpiry: undefined
      };
      onUserChange(updatedUser);
      setAlertText(language === 'es' ? 'Suscripción Cancelada Exitosamente ❄️' : 'Subscription Cancelled Successfully ❄️');
      setTimeout(() => setAlertText(null), 3000);
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutLoading(true);
    playChime('click');
    setTimeout(() => {
      setCheckoutLoading(false);
      setCheckoutSuccess(true);
      playChime('success');
      setTimeout(() => {
        const expiryDate = selectedPlan === 'annual' 
          ? '2027-07-21' 
          : selectedPlan === 'semi-annual' 
            ? '2027-01-21' 
            : '2026-08-21';
            
        const updatedUser = {
          ...currentUser,
          isFeaturedInstructor: true,
          billingStatus: 'active' as const,
          featuredPlan: selectedPlan || 'monthly',
          featuredExpiry: expiryDate
        };
        onUserChange(updatedUser);
        setIsCheckingOut(false);
        setCheckoutSuccess(false);
        setSelectedPlan(null);
        setCheckoutCardName('');
        setCheckoutCardNumber('');
        setCheckoutCardExpiry('');
        setCheckoutCardCVC('');
        
        setAlertText(language === 'es' ? '¡Estatus Destacado Activado Exitosamente! 🔥' : 'Featured Status Activated Successfully! 🔥');
        setTimeout(() => setAlertText(null), 4000);
      }, 1500);
    }, 2000);
  };

  // Simulate Student Sale Action
  const handleSimulateSale = () => {
    if (publishedItems.length === 0) {
      setAlertText(language === 'es' ? "¡Primero debes publicar un taller o contenido para simular compras!" : "Please publish a resource first before simulating purchases!");
      return;
    }

    playChime('cash');

    // Pick a random student
    const randStudent = students[Math.floor(Math.random() * students.length)];
    // Pick a random published item
    const randItem = publishedItems[Math.floor(Math.random() * publishedItems.length)];

    const itemPrice = randItem.price;
    const cut = parseFloat((itemPrice * 0.15).toFixed(2));
    const net = parseFloat((itemPrice - cut).toFixed(2));

    const newTx: InstructorTransaction = {
      id: `tx-${Date.now()}`,
      itemTitle: randItem.title,
      itemType: randItem.type,
      studentName: randStudent.name,
      amount: itemPrice,
      platformCut: cut,
      netInstructor: net,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setTransactions(prev => [newTx, ...prev]);

    // Increase item sales count
    setPublishedItems(prev => prev.map(item => {
      if (item.id === randItem.id) {
        return { ...item, salesCount: item.salesCount + 1 };
      }
      return item;
    }));

    setAlertText(t.simulateSuccess);
    setTimeout(() => setAlertText(null), 4000);
  };

  // Publish resource
  const handlePublishResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubTitle.trim()) return;

    playChime('success');

    const priceNum = parseFloat(pubPrice) || 0;
    const newItem: PublishedItem = {
      id: `pub-${Date.now()}`,
      title: pubTitle,
      type: pubType,
      price: priceNum,
      salesCount: 0,
      description: pubDesc || (language === 'es' ? 'Material educativo de Waacking.' : 'Waacking educational content.'),
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    setPublishedItems(prev => [newItem, ...prev]);
    setPubTitle('');
    setPubDesc('');
    setPubPrice('25.00');

    setAlertText(language === 'es' ? "¡Material publicado con éxito en la academia!" : "Material published successfully inside the academy!");
    setTimeout(() => setAlertText(null), 3000);
  };

  // Schedule calendar class event
  const handleScheduleClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classTitle.trim() || !classDate || !classTime) return;

    playChime('success');

    const finalMeetUrl = classMeet.trim() || generateGoogleMeetRoomUrl(classTitle + classDate);
    const musicSource = classMusicUrl.trim() 
      ? parseMusicSource(classMusicUrl.trim(), classTitle, typeof classBpm === 'number' ? classBpm : 128)
      : undefined;

    const fullTitle = `[${classEventType}] ${classTitle}${selectedStudent && classTargetAudience === 'selected_only' ? ` (Exclusivo: ${selectedStudent.name})` : ''}`;

    // Add to main App state via onAddEvent
    onAddEvent({
      title: fullTitle,
      date: classDate,
      time: classTime,
      duration: classDuration || '90 min',
      instructor: currentUser.name,
      description: classNotes.trim() 
        ? `${classNotes.trim()} • Impartido por ${currentUser.name}. Sala oficial disponible.`
        : (language === 'es' ? `Sesión interactiva impartida por ${currentUser.name}. Enlace oficial disponible.` : `Live session taught by ${currentUser.name}.`),
      meetUrl: finalMeetUrl,
      ...(musicSource ? { musicSource } : {})
    });

    setClassTitle('');
    setClassDate('');
    setClassTime('');
    setClassDuration('90 min');
    setClassMeet('');
    setClassMusicUrl('');
    setClassBpm(128);
    setClassNotes('');

    setAlertText(language === 'es' ? "¡Clase programada e inyectada en la agenda del profesor!" : "Class scheduled and injected into instructor agenda!");
    setTimeout(() => setAlertText(null), 4000);
  };

  // Helper to toggle attendance status for a student in a class
  const handleSetStudentAttendance = (eventId: string, studentId: string, status: 'present' | 'absent' | 'late') => {
    playChime('click');
    setAttendanceRecords(prev => {
      const eventAttendance = prev[eventId] || {};
      return {
        ...prev,
        [eventId]: {
          ...eventAttendance,
          [studentId]: status
        }
      };
    });
  };

  // Copy class meeting link
  const handleCopyClassLink = (meetUrl: string, title: string) => {
    navigator.clipboard.writeText(meetUrl);
    playChime('click');
    setAlertText(`¡Enlace copiado al portapapeles para "${title}"!`);
    setTimeout(() => setAlertText(null), 3000);
  };

  // Toggle assign lesson to student
  const handleToggleAssignLesson = (lessonId: string, studentId: string) => {
    playChime('click');
    setCurriculumAssignedMap(prev => {
      const currentList = prev[lessonId] || [];
      const exists = currentList.includes(studentId);
      const updated = exists ? currentList.filter(id => id !== studentId) : [...currentList, studentId];
      return {
        ...prev,
        [lessonId]: updated
      };
    });
    const studentObj = students.find(s => s.id === studentId);
    setAlertText(`Asignación actualizada para ${studentObj ? studentObj.name : 'alumno'}.`);
    setTimeout(() => setAlertText(null), 2500);
  };

  // Toggle approve lesson for student
  const handleToggleApproveLesson = (lessonId: string, studentId: string) => {
    playChime('success');
    setCurriculumApprovedMap(prev => {
      const currentList = prev[lessonId] || [];
      const exists = currentList.includes(studentId);
      const updated = exists ? currentList.filter(id => id !== studentId) : [...currentList, studentId];
      return {
        ...prev,
        [lessonId]: updated
      };
    });
    const studentObj = students.find(s => s.id === studentId);
    setAlertText(`¡Validación pedagógica registrada para ${studentObj ? studentObj.name : 'alumno'}!`);
    setTimeout(() => setAlertText(null), 2500);
  };

  // Assign lesson to all enrolled students
  const handleAssignLessonToAll = (lessonId: string) => {
    playChime('success');
    const allIds = students.map(s => s.id);
    setCurriculumAssignedMap(prev => ({
      ...prev,
      [lessonId]: allIds
    }));
    setAlertText(`¡Lección asignada a todos los ${students.length} alumnos de la cátedra!`);
    setTimeout(() => setAlertText(null), 3000);
  };

  // Grade student submission
  const handleGradeSubmission = (submissionId: string, score: number, feedback: string) => {
    playChime('success');
    setStudentSubmissions(prev => prev.map(sub => {
      if (sub.id === submissionId) {
        return {
          ...sub,
          status: 'graded',
          score,
          feedback
        };
      }
      return sub;
    }));
    setGradingSubmission(null);
    setAlertText(`¡Evaluación y corrección técnica guardadas exitosamente (${score}/100)!`);
    setTimeout(() => setAlertText(null), 3500);
  };

  // Timer round helpers
  const handleStartRoundTimer = (seconds: number) => {
    playChime('click');
    setLiveRoundInitialTime(seconds);
    setLiveRoundTimerSeconds(seconds);
    setLiveRoundTimerRunning(true);
  };

  const handleResetRoundTimer = () => {
    playChime('click');
    setLiveRoundTimerRunning(false);
    setLiveRoundTimerSeconds(liveRoundInitialTime);
  };

  const handleDeleteItem = (id: string) => {
    playChime('click');
    setPublishedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAlertStudent = (studentName: string) => {
    playChime('success');
    setAlertText(`${t.alertSent} (${studentName})`);
    setTimeout(() => setAlertText(null), 3000);
  };

  // If NOT instructor, show beautiful invitation to register/enable
  if (currentUser.role !== 'instructor') {
    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0A0A0A] flex items-center justify-center">
        <div className="absolute inset-0 scanline pointer-events-none opacity-5" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl w-full bg-[#121212]/90 border border-white/10 rounded-[28px] p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D9A9FF]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#C23E9E]/10 rounded-full blur-3xl" />

          <div className="w-20 h-20 bg-white/5 border border-[#D9A9FF]/40 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(217, 169, 255,0.1)]">
            <Award className="w-10 h-10 text-[#D9A9FF] animate-pulse" />
          </div>

          <h3 className="text-2xl sm:text-3xl font-serif-elegant font-black tracking-tight text-[#EDEFF4] mb-4">
            {t.notInstructorTitle}
          </h3>

          <p className="text-sm text-[#C2C7D1] leading-relaxed mb-8 font-semibold">
            {t.notInstructorDesc}
          </p>

          <div className="space-y-4">
            <button
              id="enable-instructor-btn"
              onClick={handleBecomeInstructor}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#D9A9FF] hover:bg-[#F2CFFF] text-black font-black text-sm tracking-wide transition-all shadow-lg shadow-[#D9A9FF]/10 active:scale-95"
            >
              {t.becomeBtn}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const subTabTitles: Record<string, string> = {
    dashboard: language === 'es' ? 'Dashboard de Docente' : 'Instructor Dashboard',
    finances: language === 'es' ? 'Gestión de Finanzas (80/20)' : 'Instructor Finances (80/20)',
    overview: language === 'es' ? 'Resumen & Notificaciones' : 'Overview & Notifications',
    publish: language === 'es' ? 'Cursos, Talleres & Publicaciones' : 'Courses, Workshops & Content',
    documents: language === 'es' ? 'Documentos & Guías PDF' : 'PDF Guides & Documents',
    students: language === 'es' ? 'Alumnos & Seguimiento' : 'Student Roster & Tracking',
    classes: language === 'es' ? 'Clases & Directos (Google Meet)' : 'Classes & Live (Google Meet)',
    promotion: language === 'es' ? 'Ajustes & Destacados' : 'Settings & Promotion',
    methodology: language === 'es' ? 'Metodología & Freestyle Lab' : 'Methodology & Lab',
    podcasts: 'Podcasts de Cátedra',
    soundcloud: language === 'es' ? 'Listas de Reproducción & Nube' : 'Instructor Playlists & Cloud'
  };

  return (
    <div className="flex-1 min-h-full w-full bg-[#07050e] text-slate-200 relative flex flex-col items-center p-3 sm:p-6">
      {/* Main Glass Dashboard Shell */}
      <div className="w-full bg-[#120f20]/90 border border-white/10 rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(147,51,234,0.15)] backdrop-blur-xl flex flex-col overflow-hidden relative min-h-[680px]">
        
        {/* Unified Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#0e0c18]/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              <img 
                src={dossierAvatar || currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} 
                alt="Instructor" 
                className="w-11 h-11 rounded-2xl object-cover border-2 border-pink-500/80 shadow-md" 
              />
              <label 
                className="absolute -bottom-1 -right-1 bg-pink-600 hover:bg-pink-500 text-white p-1 rounded-full cursor-pointer shadow-md transition-all hover:scale-110 z-10"
                title="Cambiar Foto de Perfil"
              >
                <Edit3 className="w-2.5 h-2.5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleInstructorAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                  {subTabTitles[activeSubTab] || 'Panel de Instructor'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-pink-500/20 border border-pink-500/40 text-pink-300 shrink-0">
                  DOCENTE
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 font-semibold truncate flex items-center gap-2 mt-0.5">
                <span>{dossierRealName || currentUser.name || 'Jassy Soner'}</span>
                <span className="text-pink-400">@{dossierAkaName || 'jassywaack'}</span>
                <span className="text-emerald-400 flex items-center gap-1 text-[9px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {rbacDetail}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button 
              onClick={() => setActiveSubTab('classes')}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'classes'
                  ? 'bg-pink-600 border-pink-400 text-white shadow-lg shadow-pink-600/30'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
              }`}
              title="Clases & Directos"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clases</span>
            </button>
            <button 
              onClick={() => setActiveSubTab('overview')}
              className={`p-2 rounded-xl border text-slate-300 relative transition-all ${
                activeSubTab === 'overview'
                  ? 'bg-pink-600 border-pink-400 text-white'
                  : 'bg-white/5 hover:bg-white/10 border-white/10'
              }`}
              title="Notificaciones y Actividad"
            >
              <BellRing className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-pink-500 animate-ping" />
            </button>
            <button 
              onClick={() => setActiveSubTab('promotion')}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'promotion'
                  ? 'bg-[#D9A9FF] border-[#D9A9FF] text-black shadow-lg shadow-yellow-500/20'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
              }`}
              title="Ajustes & Destacados"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ajustes</span>
            </button>
            <button
              onClick={handleRevertToStudent}
              className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs flex items-center gap-1.5 border border-white/10 transition-all ml-1"
              title="Volver a modo estudiante"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#D9A9FF]" />
              <span className="hidden md:inline">{t.backBtn}</span>
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs Bar */}
        <div className="px-4 py-2.5 border-b border-white/10 bg-[#0a0815]/90 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'students', label: 'Alumnos', icon: Users, badge: students.length },
            { id: 'classes', label: 'Clases & Directos', icon: Calendar },
            { id: 'finances', label: 'Finanzas', icon: DollarSign },
            { id: 'documents', label: 'Documentos PDF', icon: BookMarked, badge: instructorDocuments.length },
            { id: 'methodology', label: 'Metodología & Lab', icon: Award },
            { id: 'publish', label: 'Publicar Cursos', icon: PlusCircle },
            { id: 'podcasts', label: 'Podcasts', icon: Radio },
            { id: 'overview', label: 'Ventas & Actividad', icon: ShoppingBag },
            { id: 'promotion', label: 'Ajustes & Destacados', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            const isCurrent = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playChime('click');
                  setActiveSubTab(tab.id as any);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all border ${
                  isCurrent
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 border-pink-400 text-white shadow-md shadow-purple-600/30'
                    : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-300 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-mono font-black ${
                    isCurrent ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Global Student Filter State Bar (Maintained across all instructor dashboard tabs) */}
        <div className="px-4 py-2.5 border-b border-white/10 bg-[#140f26]/95 flex flex-wrap items-center justify-between gap-3 transition-all">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-300">
              <Filter className="w-3.5 h-3.5 text-[#D9A9FF]" />
              <span className="uppercase text-[10px] tracking-wider text-[#D9A9FF]">Estudiante Filtrado:</span>
            </div>

            {/* Student Chips Selector */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => handleSelectStudentForFilter(null)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                  selectedStudentUid === null
                    ? 'bg-[#D9A9FF] text-black border-[#D9A9FF] shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                Todos ({students.length})
              </button>

              {students.map(std => {
                const isSelected = selectedStudentUid === std.id;
                return (
                  <button
                    key={std.id}
                    onClick={() => handleSelectStudentForFilter(isSelected ? null : std.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-pink-500/25 to-purple-500/25 border-pink-400 text-pink-200 shadow-[0_0_12px_rgba(236,72,153,0.3)] ring-1 ring-pink-400/50'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-pink-400 animate-pulse' : 'bg-slate-500'}`} />
                    <span>{std.name}</span>
                    {isSelected && <Check className="w-3 h-3 text-pink-300" />}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedStudent ? (
            <div className="flex items-center gap-2 shrink-0 animate-fadeIn">
              <div className="px-2.5 py-1 rounded-lg bg-pink-950/60 border border-pink-500/40 text-[10px] font-mono text-pink-200 flex items-center gap-1.5 shadow-sm">
                <UserIcon className="w-3 h-3 text-pink-400" />
                <span className="font-bold text-white truncate max-w-[140px]">{selectedStudent.name}</span>
                <span className="text-pink-400/80 font-mono text-[9px]">({selectedStudent.id})</span>
              </div>

              <button
                onClick={() => handleOpenStudentPlan(selectedStudent)}
                className="px-2.5 py-1 rounded-lg bg-[#C23E9E]/30 hover:bg-[#C23E9E]/50 border border-[#C23E9E]/50 text-[#D9A9FF] text-[10px] font-mono font-bold transition-all flex items-center gap-1"
                title="Abrir Plan de Onboarding IA"
              >
                <Sparkles className="w-3 h-3 text-[#D9A9FF]" />
                <span className="hidden sm:inline">Plan IA</span>
              </button>

              <button
                onClick={() => handleAlertStudent(selectedStudent.name)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[10px] font-bold transition-all flex items-center gap-1"
                title="Enviar Notificación de Postura"
              >
                <BellRing className="w-3 h-3 text-yellow-400" />
                <span className="hidden sm:inline">Alerta</span>
              </button>

              <button
                onClick={() => handleSelectStudentForFilter(null)}
                className="p-1 rounded-lg bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition-all"
                title="Limpiar filtro de estudiante"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="text-[10px] font-mono text-slate-400 hidden lg:flex items-center gap-1">
              <span>Selecciona un alumno arriba para mantener contexto entre pestañas</span>
            </div>
          )}
        </div>

        {/* Main Workspace Area */}
        <div className="flex-1 overflow-y-auto">

      {/* Floating System Alerts */}
      <AnimatePresence>
        {alertText && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-4 sm:right-8 z-50 max-w-md p-4 bg-[#121212] border-2 border-[#D9A9FF]/50 shadow-[0_4px_30px_rgba(217, 169, 255,0.15)] rounded-2xl flex items-center gap-3"
          >
            <BellRing className="w-5 h-5 text-[#D9A9FF] shrink-0" />
            <p className="text-xs font-bold text-[#EDEFF4]">{alertText}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Sub-tab panels */}
      <div className="flex-1 p-4 sm:p-6 md:p-8 w-full">
        <AnimatePresence mode="wait">
          {activeSubTab === 'dashboard' && (
            <motion.div
              key="dashboard-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* TOP SECTION: Quick Stats | Central Disco Ball | Student Management */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                
                {/* 1. Quick Stats (2x2 Grid) - 4 Cols */}
                <div className="lg:col-span-4 space-y-3 flex flex-col justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">Quick Stats</h3>
                  <div className="grid grid-cols-2 gap-3 flex-1">
                    
                    {/* Stat Card 1 */}
                    <div className="bg-[#17132a]/80 border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between relative overflow-hidden group hover:border-pink-500/50 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_#ec4899]" />
                      </div>
                      <div className="mt-3">
                        <div className="text-xl font-bold text-white font-mono">2,890</div>
                        <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Alumnos alcanzados</div>
                      </div>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="bg-[#17132a]/80 border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/50 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                          <Layers className="w-4 h-4" />
                        </div>
                        <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                      </div>
                      <div className="mt-3">
                        <div className="text-xl font-bold text-white font-mono">1,387</div>
                        <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Lecciones completadas</div>
                      </div>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="bg-[#17132a]/80 border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/50 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                          <BellRing className="w-4 h-4" />
                        </div>
                        <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
                      </div>
                      <div className="mt-3">
                        <div className="text-xl font-bold text-white font-mono">4,017</div>
                        <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Notificaciones enviadas</div>
                      </div>
                    </div>

                    {/* Stat Card 4 */}
                    <div className="bg-[#17132a]/80 border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/50 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
                      </div>
                      <div className="mt-3">
                        <div className="text-xl font-bold text-white font-mono">2,033</div>
                        <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Ventas de cursos</div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 2. Studio Vibe - animated 3D disco ball with tempo & live controls - 4 Cols */}
                <StudioVibeCard
                  onToast={(msg) => {
                    setAlertText(msg);
                    setTimeout(() => setAlertText(null), 3000);
                  }}
                />

                {/* 3. Student Management Panel - 4 Cols */}
                <div className="lg:col-span-4 bg-[#17132a]/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">
                      Student Management ({students.length})
                    </h3>
                    <button
                      onClick={() => setActiveSubTab('students')}
                      className="text-[10px] font-mono font-bold text-[#D9A9FF] hover:underline flex items-center gap-1"
                    >
                      <span>Ver Todos</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="space-y-2.5 flex-1 flex flex-col justify-around">
                    {students.slice(0, 3).map((std, idx) => {
                      const isSel = selectedStudentUid === std.id;
                      const progressPct = idx === 0 ? 85 : idx === 1 ? 55 : 35;
                      return (
                        <div
                          key={std.id}
                          onClick={() => handleSelectStudentForFilter(isSel ? null : std.id)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isSel
                              ? 'bg-pink-500/20 border-pink-400 text-white shadow-[0_0_12px_rgba(236,72,153,0.25)] ring-1 ring-pink-400/60'
                              : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold ${
                                isSel ? 'bg-pink-500 text-white' : 'bg-white/10 text-[#D9A9FF]'
                              }`}>
                                {std.name.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="truncate">{std.name}</span>
                            </div>
                            <span className="font-mono text-[10px] text-slate-400 shrink-0">
                              {std.level}
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-pink-500 to-purple-500 h-1.5 rounded-full"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mt-1">
                            <span>UID: {std.id}</span>
                            <span className={isSel ? 'text-pink-300 font-bold flex items-center gap-1' : ''}>
                              {isSel ? '✓ Estudiante Seleccionado' : `Progreso ${progressPct}%`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* BOTTOM SECTION: Communication Hub Table & Message Broadcast */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Communication Hub Panel (7 Cols) */}
                <div className="lg:col-span-7 bg-[#17132a]/80 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Communication Hub</h3>
                      <p className="text-[10px] font-mono text-slate-400">Haz clic en un alumno para seleccionarlo</p>
                    </div>
                    <button
                      onClick={handleStartLiveClass}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-black text-xs shadow-lg active:scale-95 transition-all"
                    >
                      Start Live Class
                    </button>
                  </div>

                  {/* Student Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-slate-400 font-mono text-[10px] border-b border-white/10 pb-2">
                          <th className="pb-2">Alumno</th>
                          <th className="pb-2">Nivel</th>
                          <th className="pb-2">Actividad</th>
                          <th className="pb-2 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {students.map((std) => {
                          const isSel = selectedStudentUid === std.id;
                          return (
                            <tr
                              key={std.id}
                              onClick={() => handleSelectStudentForFilter(isSel ? null : std.id)}
                              className={`transition-all cursor-pointer ${
                                isSel ? 'bg-pink-500/20 text-white' : 'hover:bg-white/5'
                              }`}
                            >
                              <td className="py-2.5">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-[#D9A9FF] text-[10px]">
                                    {std.name.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-bold text-white text-xs flex items-center gap-1.5">
                                      <span>{std.name}</span>
                                      {isSel && (
                                        <span className="text-[9px] font-mono bg-pink-500 text-white px-1.5 py-0.2 rounded font-bold">
                                          FILTRADO
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[9px] font-mono text-slate-400">{std.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2.5">
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                  std.level === 'Avanzado' ? 'bg-red-500/20 text-red-300' :
                                  std.level === 'Intermedio' ? 'bg-[#D9A9FF]/20 text-[#D9A9FF]' :
                                  'bg-cyan-500/20 text-cyan-300'
                                }`}>
                                  {std.level}
                                </span>
                              </td>
                              <td className="py-2.5 text-slate-400 font-mono text-[11px]">
                                {std.lastActive}
                              </td>
                              <td className="py-2.5 text-right">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectStudentForFilter(isSel ? null : std.id);
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all border ${
                                    isSel
                                      ? 'bg-pink-600 border-pink-400 text-white'
                                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                                  }`}
                                >
                                  {isSel ? '✓ Activo' : 'Seleccionar'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Message Broadcast Panel (5 Cols) */}
                <div className="lg:col-span-5 bg-[#17132a]/80 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Message</h3>
                    <button
                      onClick={handleBroadcastMessage}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-black text-xs shadow-lg active:scale-95 transition-all"
                    >
                      Broadcast Message
                    </button>
                  </div>

                  {/* Input Box */}
                  <div className="bg-[#0e0c18] border border-white/10 rounded-xl p-3 flex-1 flex flex-col justify-between min-h-[120px]">
                    <textarea
                      value={broadcastInput}
                      onChange={e => setBroadcastInput(e.target.value)}
                      placeholder="Short your message..."
                      className="w-full bg-transparent text-white text-xs placeholder:text-slate-500 focus:outline-none resize-none flex-1"
                      rows={3}
                    />
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <Smile className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" />
                      </div>
                      <button
                        onClick={handleBroadcastMessage}
                        className="p-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white transition-all active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* GOOGLE WORKSPACE TOOLS INTEGRATED CARD */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#0F172A] border border-sky-500/30 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span>HERRAMIENTAS DE INTEGRACIÓN CÁTEDRA</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                      </div>
                      <h4 className="text-sm font-extrabold text-white">
                        Ecosistema Google Workspace para Instructores
                      </h4>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                    Acceso directo integrado
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveWorkspaceModal('classroom')}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-sky-500/10 border border-white/10 hover:border-sky-500/40 text-left transition-all active:scale-95 group cursor-pointer"
                  >
                    <GraduationCap className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform mb-2" />
                    <div className="text-xs font-bold text-white">Classroom</div>
                    <div className="text-[10px] text-slate-400 font-mono">Sincronizar tareas</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveWorkspaceModal('tasks')}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/40 text-left transition-all active:scale-95 group cursor-pointer"
                  >
                    <ListTodo className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform mb-2" />
                    <div className="text-xs font-bold text-white">Tasks</div>
                    <div className="text-[10px] text-slate-400 font-mono">Pauta & Metas</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveWorkspaceModal('gmail')}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/40 text-left transition-all active:scale-95 group cursor-pointer"
                  >
                    <Mail className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform mb-2" />
                    <div className="text-xs font-bold text-white">Gmail</div>
                    <div className="text-[10px] text-slate-400 font-mono">Avisos a alumnos</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveWorkspaceModal('drive')}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/40 text-left transition-all active:scale-95 group cursor-pointer"
                  >
                    <HardDrive className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform mb-2" />
                    <div className="text-xs font-bold text-white">Drive Picker</div>
                    <div className="text-[10px] text-slate-400 font-mono">Adjuntar recursos</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveWorkspaceModal('slides')}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-yellow-500/10 border border-white/10 hover:border-yellow-500/40 text-left transition-all active:scale-95 group cursor-pointer"
                  >
                    <Presentation className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform mb-2" />
                    <div className="text-xs font-bold text-white">Google Slides</div>
                    <div className="text-[10px] text-slate-400 font-mono">Presentaciones</div>
                  </button>
                </div>
              </div>

            </motion.div>
          )}

          {activeSubTab === 'finances' && (
            <motion.div
              key="finances-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <InstructorFinanceView
                currentUser={currentUser}
                language={language}
                playChime={playChime}
              />
            </motion.div>
          )}

          {activeSubTab === 'overview' && (
            <motion.div
              key="overview-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Financial Dashboard Statistics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#121212] border border-white/5 p-4 sm:p-5 rounded-2xl shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono tracking-widest text-[#8A8A8A] font-bold uppercase">{t.grossRevenue}</span>
                    <DollarSign className="w-4 h-4 text-[#D9A9FF]" />
                  </div>
                  <h4 className="text-xl sm:text-2xl font-serif-elegant font-black text-white">
                    ${totalGross.toFixed(2)} <span className="text-[10px] text-[#8A8A8A] font-mono font-bold">{t.currency}</span>
                  </h4>
                </div>

                <div className="bg-[#121212] border border-white/5 p-4 sm:p-5 rounded-2xl shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono tracking-widest text-[#8A8A8A] font-bold uppercase">{t.platformFee}</span>
                    <Percent className="w-4 h-4 text-[#C23E9E]" />
                  </div>
                  <h4 className="text-xl sm:text-2xl font-serif-elegant font-black text-red-400">
                    -${totalPlatformCut.toFixed(2)} <span className="text-[10px] text-[#8A8A8A] font-mono font-bold">{t.currency}</span>
                  </h4>
                </div>

                <div className="bg-[#121212] border border-[#D9A9FF]/10 p-4 sm:p-5 rounded-2xl shadow-sm relative overflow-hidden bg-gradient-to-br from-[#D9A9FF]/5 to-transparent">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono tracking-widest text-[#D9A9FF] font-black uppercase">{t.netRevenue}</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h4 className="text-xl sm:text-2xl font-serif-elegant font-black text-emerald-400">
                    ${totalNet.toFixed(2)} <span className="text-[10px] text-emerald-400 font-mono font-bold">{t.currency}</span>
                  </h4>
                </div>

                <div className="bg-[#121212] border border-white/5 p-4 sm:p-5 rounded-2xl shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono tracking-widest text-[#8A8A8A] font-bold uppercase">{t.totalSales}</span>
                    <ShoppingBag className="w-4 h-4 text-cyan-400" />
                  </div>
                  <h4 className="text-xl sm:text-2xl font-serif-elegant font-black text-white">
                    {totalSalesCount}
                  </h4>
                </div>
              </div>

              {/* Purchase Simulation Feature */}
              <div className="bg-[#121212] border border-white/5 p-5 rounded-[24px] flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden shadow-inner">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D9A9FF]/5 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <h4 className="text-base font-black text-[#EDEFF4] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D9A9FF]" />
                    {t.simulateSale}
                  </h4>
                  <p className="text-xs text-[#8A8A8A] max-w-xl font-semibold mt-1">
                    {t.simulateSaleDesc}
                  </p>
                </div>
                <button
                  id="simulate-purchase-btn"
                  onClick={handleSimulateSale}
                  className="px-5 py-3 rounded-xl bg-white/5 hover:bg-[#D9A9FF] text-white hover:text-black font-black text-xs border border-white/10 hover:border-[#D9A9FF] transition-all whitespace-nowrap self-start md:self-center"
                >
                  {language === 'es' ? 'Simular Pago de Alumno' : 'Simulate Payment'}
                </button>
              </div>

              {/* Transactions list */}
              <div className="bg-[#121212] border border-white/5 rounded-[24px] p-5 sm:p-6">
                <h4 className="text-sm font-mono tracking-wider text-[#8A8A8A] font-bold uppercase mb-4">
                  {t.recentSales}
                </h4>

                {transactions.length === 0 ? (
                  <div className="py-12 text-center text-[#8A8A8A] text-xs font-mono">
                    [NO TRANSACTIONS REGISTERED]
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 pb-2 text-[#8A8A8A] font-black font-mono">
                          <th className="pb-3 pr-2 uppercase">ITEM</th>
                          <th className="pb-3 px-2 uppercase">ESTUDIANTE</th>
                          <th className="pb-3 px-2 uppercase">BRUTO</th>
                          <th className="pb-3 px-2 text-red-400 uppercase">COMISIÓN (15%)</th>
                          <th className="pb-3 pl-2 text-emerald-400 uppercase">NETO INSTRUCTOR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map(tx => (
                          <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                            <td className="py-3 pr-2 font-bold text-white">
                              <span className="text-[9px] font-mono font-black text-black bg-[#D9A9FF]/90 px-1.5 py-0.5 rounded uppercase mr-2 tracking-wide">
                                {tx.itemType}
                              </span>
                              {tx.itemTitle}
                            </td>
                            <td className="py-3 px-2 font-semibold text-[#C2C7D1]">
                              {tx.studentName}
                            </td>
                            <td className="py-3 px-2 font-mono text-[#EDEFF4]">
                              ${tx.amount.toFixed(2)}
                            </td>
                            <td className="py-3 px-2 font-mono text-red-400">
                              -${tx.platformCut.toFixed(2)}
                            </td>
                            <td className="py-3 pl-2 font-mono text-emerald-400 font-bold">
                              +${tx.netInstructor.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeSubTab === 'methodology' && (
            <motion.div
              key="methodology-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <TeachingMethodologyEditor
                currentUser={currentUser}
                language={language}
                onSaveSuccess={(updatedUser) => {
                  onUserChange(updatedUser);
                  setAlertText('¡Metodología pedagógica y herramientas del Freestyle Lab actualizadas exitosamente!');
                  setTimeout(() => setAlertText(null), 4000);
                }}
                playChime={playChime}
              />
            </motion.div>
          )}

          {activeSubTab === 'publish' && (
            <motion.div
              key="publish-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Header Title from screenshot */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h2 className="text-xl sm:text-2xl font-black tracking-wider text-white uppercase flex items-center gap-2">
                  EXPEDIENTE DE INSTRUCTOR <span className="neon-pink-hover inline-block cursor-pointer">PRO-WAACK ON</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
                
                {/* LEFT COLUMN: Dossier Edit Panel (6 Cols) */}
                <div className="lg:col-span-6 bg-[#130f21] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl backdrop-blur-xl">
                  
                  {/* DATOS DE INSTRUCTOR */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-mono font-black text-slate-300 tracking-widest uppercase">DATOS DE INSTRUCTOR</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-mono text-slate-400 font-extrabold uppercase mb-1">
                          NOMBRE COMPLETO
                        </label>
                        <input
                          type="text"
                          required
                          value={dossierRealName}
                          onChange={e => setDossierRealName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a0814] border border-white/20 text-white font-extrabold text-xs focus:outline-none focus:border-[#D9A9FF] transition-all shadow-inner"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-slate-400 font-extrabold uppercase mb-1">
                          AKA / NOMBRE BE BAILE
                        </label>
                        <input
                          type="text"
                          required
                          value={dossierAkaName}
                          onChange={e => setDossierAkaName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a0814] border border-white/20 text-white font-extrabold text-xs focus:outline-none focus:border-[#D9A9FF] transition-all shadow-inner"
                        />
                      </div>
                    </div>
                  </div>

                  {/* BIOGRAFÍA / FILOSOFÍA DE ENSEÑANZA */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-mono font-black text-slate-300 tracking-widest uppercase">
                      BIOGRAFÍA / FILOSOFÍA DE ENSEÑANZA
                    </p>
                    <textarea
                      rows={3}
                      value={dossierBio}
                      onChange={e => setDossierBio(e.target.value)}
                      placeholder="Waacking historia even fearcourred bio anineva traraoenium: la waacking history and cwadenifica y la historia de la técnica..."
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a0814] border border-white/20 text-slate-200 font-semibold text-xs focus:outline-none focus:border-[#D9A9FF] resize-none leading-relaxed shadow-inner"
                    />
                  </div>

                  {/* REDES SOCIALES */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-mono font-black text-slate-300 tracking-widest uppercase">REDES SOCIALES</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 bg-[#0a0814] border border-white/20 px-3 py-2 rounded-2xl shadow-inner">
                        <Instagram className="w-4 h-4 text-slate-300 shrink-0" />
                        <input
                          type="text"
                          value={dossierInstagram}
                          onChange={e => setDossierInstagram(e.target.value)}
                          placeholder="@tus_rolls"
                          className="w-full bg-transparent text-white font-bold text-xs focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2 bg-[#0a0814] border border-white/20 px-3 py-2 rounded-2xl shadow-inner">
                        <Radio className="w-4 h-4 text-slate-300 shrink-0" />
                        <input
                          type="text"
                          value={dossierTiktok}
                          onChange={e => setDossierTiktok(e.target.value)}
                          placeholder="@Aka_Wackson"
                          className="w-full bg-transparent text-white font-bold text-xs focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2 bg-[#0a0814] border border-white/20 px-3 py-2 rounded-2xl shadow-inner">
                        <Youtube className="w-4 h-4 text-slate-300 shrink-0" />
                        <input
                          type="text"
                          value={dossierYoutube}
                          onChange={e => setDossierYoutube(e.target.value)}
                          placeholder="@TuuTube"
                          className="w-full bg-transparent text-white font-bold text-xs focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2 bg-[#0a0814] border border-white/20 px-3 py-2 rounded-2xl shadow-inner">
                        <Globe className="w-4 h-4 text-slate-300 shrink-0" />
                        <input
                          type="text"
                          value={dossierThreads}
                          onChange={e => setDossierThreads(e.target.value)}
                          placeholder="@Threads"
                          className="w-full bg-transparent text-white font-bold text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* TRAYECTORIA PROFESIONAL */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-mono font-black text-slate-300 tracking-widest uppercase">
                      TRAYECTORIA PROFESIONAL
                    </p>
                    <textarea
                      rows={3}
                      value={dossierMilestones.join(', ')}
                      onChange={e => setDossierMilestones(e.target.value.split(', '))}
                      placeholder="Entrensa milestones obentaaciones, historias claves, prilendos, premiros y atrada lemilemlos..."
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a0814] border border-white/20 text-slate-200 font-semibold text-xs focus:outline-none focus:border-[#D9A9FF] resize-none leading-relaxed shadow-inner"
                    />
                  </div>

                  {/* MIS IMÁGENES & PORTAFOLIO DE FOTOS */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-mono font-black text-slate-300 tracking-widest uppercase">
                        MIS IMÁGENES & PORTAFOLIO ({dossierPortfolio.length})
                      </p>
                      <label className="text-[9px] font-mono font-bold text-[#D9A9FF] bg-[#D9A9FF]/10 border border-[#D9A9FF]/30 hover:bg-[#D9A9FF] hover:text-black px-2.5 py-1 rounded-lg cursor-pointer transition-all flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        <span>Subir desde archivo</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleInstructorPortfolioUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                      {dossierPortfolio.map((url, idx) => (
                        <div key={idx} className="relative w-20 h-24 rounded-2xl overflow-hidden border border-white/20 shrink-0 group bg-black shadow-lg">
                          <img src={url} alt={`Portfolio ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-all p-1">
                            <button
                              type="button"
                              onClick={() => setInstructorLightboxPhoto(url)}
                              className="p-1 bg-white/20 hover:bg-white/40 text-white rounded-lg transition-all"
                              title="Ampliar foto"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetPortfolioAsInstructorAvatar(url)}
                              className="px-1.5 py-0.5 bg-[#D9A9FF] text-black text-[7px] font-mono font-black uppercase rounded"
                              title="Usar como foto de perfil"
                            >
                              Avatar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemovePortfolioPhoto(url)}
                              className="p-1 bg-red-600/60 hover:bg-red-600 text-white rounded-lg transition-all"
                              title="Eliminar foto"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}

                      <label className="w-20 h-24 rounded-2xl border-2 border-dashed border-white/30 hover:border-[#D9A9FF] flex flex-col items-center justify-center text-slate-400 hover:text-[#D9A9FF] transition-all shrink-0 bg-white/5 cursor-pointer group">
                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-[8px] font-mono font-bold uppercase mt-1">Agregar</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleInstructorPortfolioUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* CTA BUTTON FROM SCREENSHOT */}
                  <button
                    onClick={(e) => handleSaveDossier(e)}
                    className="w-full py-3.5 rounded-2xl border border-[#D9A9FF] bg-gradient-to-r from-[#1c182a] via-[#2c2212] to-[#1c182a] hover:from-[#2a2238] hover:to-[#2a2238] text-[#fce295] font-black text-xs uppercase tracking-widest shadow-xl shadow-[#D9A9FF]/10 active:scale-98 transition-all cursor-pointer"
                  >
                    GUARDAR Y SINCRONIZAR EXPEDIENTE DE INSTRUCTOR
                  </button>
                </div>

                {/* RIGHT COLUMN: Instructor 4-Week Syllabus & Cátedra Curriculum Builder (6 Cols) */}
                <div className="lg:col-span-6 space-y-4 relative">
                  
                  {/* Top Header Tabs */}
                  <div className="bg-[#130f21] border border-white/10 rounded-2xl p-2.5 flex items-center justify-between gap-2 overflow-x-auto shadow-xl">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 rounded-xl bg-[#D9A9FF]/10 border border-[#D9A9FF]/30 text-[#D9A9FF] font-black text-xs uppercase tracking-wider flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-[#D9A9FF]" />
                        <span>PLAN DE CÁTEDRA & SYLLABUS</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 font-bold hidden sm:inline">
                        (4 Semanas de Formación)
                      </span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleSaveDossier()}
                      className="px-3 py-1.5 rounded-xl bg-[#D9A9FF] hover:bg-[#F2CFFF] text-black font-black text-[11px] uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Guardar Plan</span>
                    </button>
                  </div>

                  {/* 4-Week Syllabus Editor for the Instructor */}
                  <div className="bg-[#130f21] border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[#D9A9FF]" />
                          Módulos Semanales de tu Cátedra
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          Estructura el progreso técnico que tus alumnos cursarán durante el mes.
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                        4 Módulos Activos
                      </span>
                    </div>

                    <div className="space-y-3">
                      {trainingWeeks.map((wk, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-[#0e0a1b] border border-white/10 space-y-2 hover:border-[#D9A9FF]/40 transition-all">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono font-black text-[#D9A9FF] uppercase bg-[#D9A9FF]/10 px-2 py-0.5 rounded border border-[#D9A9FF]/20">
                              Semana {wk.week}
                            </span>
                            <input
                              type="text"
                              value={wk.duration}
                              onChange={e => {
                                const updated = [...trainingWeeks];
                                updated[idx].duration = e.target.value;
                                setTrainingWeeks(updated);
                              }}
                              placeholder="Duración / Carga"
                              className="text-[10px] font-mono font-bold text-slate-400 bg-white/5 border border-white/10 rounded-lg px-2 py-1 focus:outline-none focus:border-[#D9A9FF] w-28 text-right"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={wk.title}
                              onChange={e => {
                                const updated = [...trainingWeeks];
                                updated[idx].title = e.target.value;
                                setTrainingWeeks(updated);
                              }}
                              placeholder="Título del Módulo Semanal..."
                              className="w-full bg-[#140e26] border border-white/10 rounded-xl px-3 py-1.5 text-white font-bold text-xs focus:outline-none focus:border-[#D9A9FF]"
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div className="sm:col-span-2">
                                <input
                                  type="text"
                                  value={wk.desc}
                                  onChange={e => {
                                    const updated = [...trainingWeeks];
                                    updated[idx].desc = e.target.value;
                                    setTrainingWeeks(updated);
                                  }}
                                  placeholder="Descripción de los contenidos técnicos y ejercicios..."
                                  className="w-full bg-[#140e26] border border-white/10 rounded-xl px-3 py-1.5 text-slate-300 text-[11px] focus:outline-none focus:border-[#D9A9FF]"
                                />
                              </div>
                              <div>
                                <input
                                  type="text"
                                  value={wk.focus}
                                  onChange={e => {
                                    const updated = [...trainingWeeks];
                                    updated[idx].focus = e.target.value;
                                    setTrainingWeeks(updated);
                                  }}
                                  placeholder="Enfoque clave"
                                  className="w-full bg-[#140e26] border border-white/10 rounded-xl px-3 py-1.5 text-purple-300 font-mono text-[10px] focus:outline-none focus:border-purple-400"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleSaveDossier(e)}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-900/40 via-[#D9A9FF]/20 to-purple-900/40 border border-[#D9A9FF]/50 text-[#fbe18d] hover:text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <Sparkles className="w-4 h-4 text-[#D9A9FF]" />
                      <span>Sincronizar Syllabus con Todos los Alumnos</span>
                    </button>
                  </div>

                  {/* Publisher Form & Published List */}
                  <div className="bg-[#130f21] border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl mt-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                      <PlusCircle className="w-4 h-4 text-emerald-400" />
                      {t.publishTitle}
                    </h3>

                    <form onSubmit={handlePublishResource} className="space-y-3">
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'workshop', label: t.pubWorkshop, icon: Video },
                          { id: 'course', label: t.pubCourse, icon: Layers },
                          { id: 'ebook', label: t.pubEbook, icon: BookMarked }
                        ].map(type => {
                          const Icon = type.icon;
                          const isSel = pubType === type.id;
                          return (
                            <button
                              type="button"
                              key={type.id}
                              onClick={() => {
                                playChime('click');
                                setPubType(type.id as any);
                              }}
                              className={`p-2 rounded-xl border text-center flex flex-col items-center justify-center transition-all ${
                                isSel 
                                  ? 'bg-pink-500/20 border-pink-500 text-white' 
                                  : 'bg-[#0e0a1f] border-white/5 text-slate-400'
                              }`}
                            >
                              <Icon className="w-4 h-4 mb-1" />
                              <span className="text-[9px] font-black uppercase">{type.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      <input
                        type="text"
                        required
                        value={pubTitle}
                        onChange={e => setPubTitle(e.target.value)}
                        placeholder="Título de la publicación..."
                        className="w-full px-3 py-2 rounded-xl bg-[#0e0a1f] border border-white/10 text-white font-bold text-xs focus:outline-none"
                      />

                      <textarea
                        value={pubDesc}
                        onChange={e => setPubDesc(e.target.value)}
                        rows={2}
                        placeholder="Descripción breve..."
                        className="w-full px-3 py-2 rounded-xl bg-[#0e0a1f] border border-white/10 text-slate-300 text-xs focus:outline-none resize-none"
                      />

                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="5"
                          max="200"
                          step="1"
                          required
                          value={pubPrice}
                          onChange={e => setPubPrice(e.target.value)}
                          className="w-28 px-3 py-2 rounded-xl bg-[#0e0a1f] border border-white/10 text-white font-mono text-xs focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs uppercase transition-all"
                        >
                          {t.publishBtn}
                        </button>
                      </div>
                    </form>
                  </div>

                </div>

              </div>

              {/* EXPEDIENTE DEL INSTRUCTOR: METODOLOGÍA & HERRAMIENTAS FREESTYLE LAB */}
              <div className="mt-8 space-y-8">
                <TeachingMethodologyEditor
                  currentUser={currentUser}
                  language={language}
                  onSaveSuccess={(updatedUser) => {
                    onUserChange(updatedUser);
                    setAlertText('¡Metodología pedagógica y herramientas del Freestyle Lab actualizadas exitosamente!');
                    setTimeout(() => setAlertText(null), 4000);
                  }}
                  playChime={playChime}
                />

                {/* HERRAMIENTAS PEDAGÓGICAS DE AUDIO Y RITMO */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-[#D9A9FF] uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#C23E9E]" /> Metrónomo de Alta Precisión del Profesor
                    </h4>
                    <MetronomeLabComponent />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-[#D9A9FF] uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Music className="w-4 h-4 text-[#C23E9E]" /> Reproductor de SoundCloud de Cátedra
                    </h4>
                    <SoundCloudPlayer playlistUrl="https://soundcloud.com/user-615971162" title="SoundCloud Sync - Perfil del Profesor" />
                  </div>
                </div>
              </div>

              {/* UBICACIÓN CENTRALIZADA DEL DIRECTORIO DE PROFESORES */}
              <div className="mt-10 pt-8 border-t border-white/10 space-y-6">
                <div className="bg-[#121212] border border-[#D9A9FF]/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
                  <div className="space-y-2 max-w-xl">
                    <span className="text-[10px] font-mono font-bold text-[#D9A9FF] bg-[#D9A9FF]/10 px-3 py-1 rounded-full border border-[#D9A9FF]/20 uppercase inline-flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {language === 'es' ? 'UBICACIÓN CENTRALIZADA' : 'CENTRAL LOCATION'}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Globe className="w-5 h-5 text-[#D9A9FF]" /> 
                      {language === 'es' ? 'Directorio Global de Profesores en el Tablero Principal' : 'Global Instructors Directory on Main Dashboard'}
                    </h3>
                    <p className="text-xs text-[#8A8A8A] font-semibold leading-relaxed">
                      {language === 'es' 
                        ? 'El directorio oficial de profesores internacionales ha sido reubicado de forma accesible en el Tablero Principal (Dashboard) para que todos los alumnos puedan consultar los perfiles, tarifas personalizadas y planes de membresía directamente.' 
                        : 'The official global instructors directory has been relocated accessibly to the Main Dashboard so all students can view profiles, custom fees, and membership plans directly.'}
                    </p>
                  </div>
                  
                  {setActiveTab && (
                    <button
                      type="button"
                      onClick={() => {
                        playChime('click');
                        setActiveTab('dashboard');
                      }}
                      className="px-6 py-3.5 bg-[#D9A9FF] hover:bg-[#B87CFF] text-black text-xs font-black rounded-xl uppercase tracking-wider transition-all shadow-xl shrink-0 flex items-center gap-2 active:scale-95"
                    >
                      <span>{language === 'es' ? 'Ir al Directorio del Tablero' : 'Go to Dashboard Directory'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* SECCIÓN/APARTADO: ¿CUÁNTO VALE LA SUSCRIPCIÓN? */}
              <div className="mt-10 bg-gradient-to-r from-[#171128] via-[#1c1633] to-[#171128] border border-[#D9A9FF]/40 rounded-[32px] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#D9A9FF]/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6 relative z-10">
                  <div className="space-y-2 max-w-xl">
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase bg-[#D9A9FF]/20 text-[#D9A9FF] border border-[#D9A9FF]/30 tracking-widest inline-flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> PLAN DE MEMBRESÍA MENSUAL
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
                      ¿CUÁNTO VALE LA SUSCRIPCIÓN?
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                      La suscripción mensual para acceder al plan de entrenamiento intensivo de cualquier profesor internacional de la plataforma tiene un valor transparente y accesible:
                    </p>
                  </div>

                  {/* Dynamic Editable Price Tag Highlight */}
                  <div className="bg-[#0a0814] border-2 border-[#D9A9FF] rounded-2xl p-5 min-w-[280px] sm:min-w-[320px] shadow-2xl relative space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-300 font-extrabold uppercase tracking-widest block">
                        TARIFA MENSUAL EDITABLE
                      </span>
                      <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> RBAC VALIDADO
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text.base font-mono font-bold text-[#D9A9FF]">$</span>
                        <input
                          type="number"
                          step="0.50"
                          min="1"
                          value={priceNumberInput}
                          onChange={(e) => {
                            setPricingError(null);
                            setPriceNumberInput(e.target.value);
                          }}
                          placeholder="15.00"
                          className="w-full bg-[#161224] border border-[#D9A9FF]/50 rounded-xl pl-8 pr-16 py-2.5 text-base font-mono font-black text-white focus:border-[#D9A9FF] focus:ring-1 focus:ring-[#D9A9FF] outline-none transition-all"
                        />
                        <span className="absolute right-3 text-xs font-mono font-bold text-slate-400">USD/mes</span>
                      </div>

                      {pricingError && (
                        <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-[11px] font-mono leading-tight flex items-start gap-1.5 animate-fadeIn">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span>{pricingError}</span>
                        </div>
                      )}

                      <button
                        type="button"
                        disabled={isUpdatingPrice}
                        onClick={() => handleUpdatePricing(priceNumberInput)}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-[#C23E9E] via-[#C23FA0] to-[#D9A9FF] hover:brightness-110 active:scale-95 text-white text-xs font-mono font-black uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                        {isUpdatingPrice ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-[#D9A9FF]" />
                            <span>Validando Backend...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-[#D9A9FF]" />
                            <span>Actualizar Tarifa</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 text-center pt-1 border-t border-white/5">
                      Tarifa actual publicada: <strong className="text-[#D9A9FF]">{currentUser.monthlyPrice || '$15.00 USD/mes'}</strong>
                    </div>
                  </div>
                </div>

                {/* Inclusions grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                  {[
                    {
                      title: "Plan Intensivo de 4 Semanas",
                      desc: "Acceso total a las clases semanales en video HD, drills técnicos y metodología paso a paso del instructor.",
                      icon: GraduationCap,
                      color: "text-pink-400"
                    },
                    {
                      title: "Evaluación & Feedback Personal",
                      desc: "Envía tus videos de práctica a través del Somatic Diary para recibir correcciones personalizadas del profesor.",
                      icon: Target,
                      color: "text-[#D9A9FF]"
                    },
                    {
                      title: "Material & Recursos Exclusivos",
                      desc: "Descarga Ebooks sobre historia del Waacking, playlists seleccionadas para entrenamiento y partituras de ritmo.",
                      icon: BookOpen,
                      color: "text-cyan-400"
                    },
                    {
                      title: "Pase Directo a Live Battles",
                      desc: "Participa en las batallas en vivo, jam sessions y sesiones de preguntas y respuestas mensuales con el instructor.",
                      icon: Radio,
                      color: "text-purple-400"
                    },
                    {
                      title: "Certificado de Finalización",
                      desc: "Al completar las 4 semanas del programa y entregar tu solo final, recibes el diploma verificado de Waack On.",
                      icon: Award,
                      color: "text-emerald-400"
                    },
                    {
                      title: "100% Flexible & Transparente",
                      desc: "Sin contratos ni cargos ocultos. Puedes pausar o activar la suscripción a otros profesores en cualquier momento.",
                      icon: ShieldCheck,
                      color: "text-amber-400"
                    }
                  ].map((inc, i) => {
                    const Icon = inc.icon;
                    return (
                      <div key={i} className="p-4 rounded-2xl bg-[#0d091a]/80 border border-white/10 space-y-2">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                            <Icon className={`w-4 h-4 ${inc.color}`} />
                          </div>
                          <h4 className="text-xs font-bold text-white">{inc.title}</h4>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug">{inc.desc}</p>
                      </div>
                    );
                  })}
                </div>

                {/* FEATURED SUBSCRIPTION EXAMPLE FOR BRANDON HERMOSO */}
                <div className="bg-[#0b0816] border border-[#D9A9FF]/50 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-5 relative z-10 shadow-xl">
                  <div className="flex items-center gap-4">
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"
                      alt="Brandon Hermoso"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-[#D9A9FF] shadow-lg shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-black uppercase text-[#D9A9FF] bg-[#D9A9FF]/10 px-2 py-0.5 rounded border border-[#D9A9FF]/20">
                          EJEMPLO PRÁCTICO
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">$15 USD / MES</span>
                      </div>
                      <h4 className="text-base font-extrabold text-white mt-1">Suscripción a Brandon Hermoso (Aka_Wackson)</h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Al suscribirte a Brandon Hermoso por $15/mes, desbloqueas su Plan de 4 Semanas (Rolls, Poses, Transitions & Performance Lab).
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleSubscribeInstructor('Brandon Hermoso', '$15 USD/mes')}
                    className={`px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-xl shrink-0 flex items-center gap-2 active:scale-95 ${
                      subscribedInstructors.includes('Brandon Hermoso')
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border border-emerald-400 shadow-emerald-500/20'
                        : 'bg-gradient-to-r from-[#2c2212] via-[#D9A9FF] to-[#2c2212] hover:opacity-95 text-black border border-[#D9A9FF] shadow-[#D9A9FF]/20'
                    }`}
                  >
                    {subscribedInstructors.includes('Brandon Hermoso') ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        SUSCRITO A BRANDON HERMOSO ($15/MES)
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 text-black" />
                        SUSCRIBIRME A BRANDON HERMOSO ($15/MES)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeSubTab === 'documents' && (
            <motion.div
              key="documents-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Header Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-[#18112b] via-[#120a21] to-[#0d0718] border border-[#D9A9FF]/30 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-[#D9A9FF]/10 border border-[#D9A9FF]/40 flex items-center justify-center text-[#D9A9FF]">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg sm:text-2xl font-black tracking-wider text-white uppercase font-mono">
                      GESTORÍA DE DOCUMENTOS, GUÍAS & PLANIFICACIONES (PDF)
                    </h2>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed max-w-2xl">
                    Sube y distribuye <strong className="text-[#D9A9FF]">Guías y manuales de técnica en PDF</strong> (ej: Cuaderno de Práctica Biomecánica para prevención de lesiones de hombro y codo) y <strong className="text-[#D9A9FF]">Planificaciones de entrenamiento</strong> (plantillas imprimibles o interactivas para registro semanal de BPM).
                  </p>
                </div>

                {onOpenDocsModal && (
                  <button
                    onClick={onOpenDocsModal}
                    className="px-4 py-2.5 rounded-2xl bg-[#4285F4] hover:bg-blue-600 text-white font-black text-xs uppercase flex items-center gap-2 shadow-lg transition-all shrink-0 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Redactar en Google Docs</span>
                  </button>
                )}
              </div>

              {/* Document Publisher & List Container */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT COLUMN: Upload / Create Document Form (5 cols) */}
                <div className="lg:col-span-5 bg-[#130f21] border border-[#D9A9FF]/30 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                    <Upload className="w-4 h-4 text-[#D9A9FF]" />
                    <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      Publicar Nuevo Documento o PDF
                    </h3>
                  </div>

                  <form onSubmit={handlePublishDocument} className="space-y-4">
                    {/* Category Selection Buttons */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block">
                        Categoría del Recurso
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDocCategory('guia_pdf');
                            setDocFormat('PDF - Guía de Técnica');
                          }}
                          className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                            docCategory === 'guia_pdf'
                              ? 'bg-[#D9A9FF]/20 border-[#D9A9FF] text-white shadow-md'
                              : 'bg-[#0a0814] border-white/10 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-[#D9A9FF]" />
                            <span className="text-[10px] font-black uppercase">Guías & Manuales PDF</span>
                          </div>
                          <span className="text-[8px] text-slate-400 leading-tight">Biomecánica, anatomía y prevención.</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDocCategory('planificacion_bpm');
                            setDocFormat('Plantilla Imprimible & Digital');
                          }}
                          className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                            docCategory === 'planificacion_bpm'
                              ? 'bg-purple-500/20 border-purple-400 text-white shadow-md'
                              : 'bg-[#0a0814] border-white/10 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <Printer className="w-4 h-4 text-purple-400" />
                            <span className="text-[10px] font-black uppercase">Planificación BPM</span>
                          </div>
                          <span className="text-[8px] text-slate-400 leading-tight">Plantillas de rutinas e hitos semanales.</span>
                        </button>
                      </div>
                    </div>

                    {/* Document Title */}
                    <div>
                      <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block mb-1">
                        Título del Documento *
                      </label>
                      <input
                        type="text"
                        required
                        value={docTitle}
                        onChange={e => setDocTitle(e.target.value)}
                        placeholder={docCategory === 'guia_pdf' ? 'ej: Cuaderno de Práctica Biomecánica para prevención de lesiones de hombro y codo' : 'ej: Planificación Semanal de Rutinas BPM e Incrementos de Tempo'}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a0814] border border-white/20 text-white font-bold text-xs focus:outline-none focus:border-[#D9A9FF]"
                      />
                    </div>

                    {/* Format / Specification */}
                    <div>
                      <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block mb-1">
                        Especificación de Formato / Páginas
                      </label>
                      <input
                        type="text"
                        value={docFormat}
                        onChange={e => setDocFormat(e.target.value)}
                        placeholder="ej: PDF - 18 Páginas (Biomecánica) o Plantilla Imprimible"
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a0814] border border-white/20 text-white text-xs focus:outline-none focus:border-[#D9A9FF]"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block mb-1">
                        Descripción Pedagógica / Instrucciones
                      </label>
                      <textarea
                        rows={3}
                        value={docDescription}
                        onChange={e => setDocDescription(e.target.value)}
                        placeholder="Explica qué aprenderán tus alumnas con este documento y cómo deben registrar sus rutinas de BPM..."
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a0814] border border-white/20 text-slate-200 text-xs focus:outline-none focus:border-[#D9A9FF] resize-none leading-relaxed"
                      />
                    </div>

                    {/* PDF File Upload */}
                    <div>
                      <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block mb-1">
                        Archivo PDF (.pdf) o Material Adjunto
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="flex-1 px-3.5 py-3 rounded-2xl bg-[#0a0814] border border-dashed border-white/30 hover:border-[#D9A9FF] text-center cursor-pointer transition-all flex items-center justify-center gap-2">
                          <Upload className="w-4 h-4 text-[#D9A9FF]" />
                          <span className="text-xs font-bold text-slate-300 truncate">
                            {docFileName ? docFileName : 'Subir PDF desde este dispositivo'}
                          </span>
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleFileUploadPDF}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {docFileUrl && (
                        <p className="text-[9px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Archivo PDF listo para cargar
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isUploadingDoc}
                      className="w-full py-3 rounded-2xl bg-[#D9A9FF] hover:bg-[#B87CFF] text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer active:scale-98"
                    >
                      {isUploadingDoc ? 'Procesando PDF...' : 'Publicar Documento para Alumnas'}
                    </button>
                  </form>
                </div>

                {/* RIGHT COLUMN: Published Documents List (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <BookMarked className="w-4 h-4 text-[#D9A9FF]" />
                      Documentos Publicados en la Academia ({instructorDocuments.length})
                    </h3>
                    <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      DISPONIBLES PARA ALUMNAS
                    </span>
                  </div>

                  {instructorDocuments.length === 0 ? (
                    <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 text-center space-y-2">
                      <FileText className="w-10 h-10 text-slate-500 mx-auto" />
                      <p className="text-xs text-slate-300 font-bold">No has subido documentos aún.</p>
                      <p className="text-[11px] text-slate-500">Completa el formulario a la izquierda para subir tu primera guía o plantilla.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {instructorDocuments.map(doc => (
                        <div
                          key={doc.id}
                          className="bg-[#130f21] border border-white/10 hover:border-[#D9A9FF]/50 rounded-3xl p-5 space-y-3 transition-all relative overflow-hidden shadow-xl group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                                doc.category === 'guia_pdf'
                                  ? 'bg-[#D9A9FF]/10 border-[#D9A9FF]/40 text-[#D9A9FF]'
                                  : 'bg-purple-500/10 border-purple-400/40 text-purple-400'
                              }`}>
                                {doc.category === 'guia_pdf' ? <FileText className="w-5 h-5" /> : <Printer className="w-5 h-5" />}
                              </div>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                                    doc.category === 'guia_pdf'
                                      ? 'bg-[#D9A9FF]/10 text-[#D9A9FF] border-[#D9A9FF]/30'
                                      : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                                  }`}>
                                    {doc.categoryLabel}
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                    {doc.format}
                                  </span>
                                </div>
                                <h4 className="text-sm font-extrabold text-white mt-1 group-hover:text-[#D9A9FF] transition-colors leading-snug">
                                  {doc.title}
                                </h4>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors shrink-0"
                              title="Eliminar documento"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed font-sans">
                            {doc.description}
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10 text-[10px] font-mono text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <span>Fecha: {doc.createdAt}</span>
                              <span>•</span>
                              <span>Descargas: {doc.downloadsCount}</span>
                            </span>

                            <div className="flex items-center gap-2">
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={doc.fileName || true}
                                className="px-3.5 py-1.5 rounded-xl bg-[#D9A9FF] text-black font-black uppercase text-[10px] hover:bg-[#B87CFF] transition-all flex items-center gap-1.5 shadow active:scale-95 cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Descargar PDF</span>
                              </a>

                              <button
                                onClick={() => {
                                  const win = window.open(doc.fileUrl, '_blank');
                                  if (win) win.focus();
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold uppercase text-[10px] transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Imprimir / Ver</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {activeSubTab === 'students' && (
            <motion.div
              key="students-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Top AI Onboarding Engine Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-[#1E0D1B] via-[#140813] to-[#0D0914] border border-[#3A223B] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-2xl bg-[#C23E9E]/20 border border-[#C23E9E]/40 text-[#D9A9FF] shrink-0">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono font-bold text-[#D9A9FF] uppercase tracking-widest flex items-center gap-1.5">
                      <span>MOTOR IA PEDAGÓGICO DE ONBOARDING</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <h3 className="text-sm font-extrabold text-white tracking-wide mt-0.5">
                      Diagnóstico de Alumnos & Panel de Instructor
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Evalúa las 4 necesidades clave de tus alumnos y genera un Plan de Entrenamiento Personalizado con el Freestyle Lab.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowQuestionnaireModal(true)}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#C23E9E] via-[#C23FA0] to-[#D9A9FF] text-white text-xs font-mono font-bold uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto"
                >
                  <PlusCircle className="w-4 h-4 text-[#D9A9FF]" />
                  <span>Nuevo Diagnóstico IA</span>
                </button>
              </div>

              {/* Student Plan Modal / Display View */}
              {selectedStudentPlan && (
                <div className="relative p-6 rounded-3xl bg-[#0E0B12] border border-[#3D2948] shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-[#2B1B33] pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-[#C23E9E]/20 text-[#D9A9FF]">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-[#D9A9FF] font-bold uppercase tracking-widest">
                          CÁTEDRA DEL INSTRUCTOR • EXPEDIENTE
                        </span>
                        <h4 className="text-base font-bold text-white">
                          Plan de Entrenamiento de {selectedStudentPlan.student.name}
                        </h4>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedStudentPlan(null)}
                      className="px-3 py-1.5 rounded-xl border border-[#3A2A47] bg-[#181321] hover:bg-[#251D30] text-slate-300 hover:text-white text-xs font-mono font-bold transition-colors"
                    >
                      ✕ Cerrar Plan
                    </button>
                  </div>

                  <OnboardingPlanViewer
                    studentName={selectedStudentPlan.student.name}
                    planMarkdown={selectedStudentPlan.planMarkdown}
                    currentUser={currentUser}
                  />
                </div>
              )}

              {/* Active Filtered Student Alert Banner inside Students tab */}
              {selectedStudent && (
                <div className="p-4 rounded-2xl bg-pink-950/40 border border-pink-500/40 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-400/40 text-pink-300 flex items-center justify-center font-bold text-xs">
                      {selectedStudent.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[10px] font-mono font-bold text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>ESTUDIANTE SELECCIONADO PARA ESTA SESIÓN</span>
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        {selectedStudent.name} <span className="text-slate-400 font-normal font-mono text-xs">({selectedStudent.email})</span>
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenStudentPlan(selectedStudent)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:brightness-110 text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#D9A9FF]" />
                      <span>Ver Plan Onboarding IA</span>
                    </button>
                    <button
                      onClick={() => handleSelectStudentForFilter(null)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold transition-all"
                    >
                      Ver Todos
                    </button>
                  </div>
                </div>
              )}

              {/* Table of Students */}
              <div className="bg-[#121212] border border-white/5 rounded-[24px] p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-mono tracking-wider text-[#8A8A8A] font-bold uppercase">
                      {language === 'es' ? 'ALUMNOS VINCULADOS A TUS CÁTEDRAS' : 'STUDENTS LINKED TO YOUR CLASSES'}
                    </h3>
                    <p className="text-[11px] text-slate-400">Selecciona un alumno para mantener su seguimiento activo al cambiar de pestaña</p>
                  </div>
                  <span className="text-xs text-[#D9A9FF] bg-[#D9A9FF]/10 px-2 py-0.5 rounded border border-[#D9A9FF]/20 font-bold">
                    {students.length} Alumnos
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 pb-2 text-[#8A8A8A] font-black font-mono">
                        <th className="pb-3 pr-2">ESTADO / SELECCIÓN</th>
                        <th className="pb-3 pr-2">{t.tableStudent}</th>
                        <th className="pb-3 px-2">{t.tableLevel}</th>
                        <th className="pb-3 px-2">EMAIL</th>
                        <th className="pb-3 px-2">{t.tableLastActive}</th>
                        <th className="pb-3 pl-2 text-right">PLAN DE CÁTEDRA</th>
                        <th className="pb-3 pl-2 text-right">{t.tableAction}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(students || []).map(std => {
                        const isSel = selectedStudentUid === std.id;
                        return (
                          <tr 
                            key={std.id} 
                            className={`border-b border-white/5 transition-all ${
                              isSel ? 'bg-pink-500/15 border-pink-500/30' : 'hover:bg-white/5'
                            }`}
                          >
                            <td className="py-3 pr-2">
                              <button
                                onClick={() => handleSelectStudentForFilter(isSel ? null : std.id)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all flex items-center gap-1 ${
                                  isSel
                                    ? 'bg-pink-600 border-pink-400 text-white shadow-sm'
                                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-white'
                                }`}
                              >
                                {isSel ? (
                                  <>
                                    <Check className="w-3 h-3 text-pink-200" />
                                    <span>Filtrado</span>
                                  </>
                                ) : (
                                  <span>Filtrar</span>
                                )}
                              </button>
                            </td>
                            <td className="py-3 pr-2 font-bold text-white flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold border text-[10px] ${
                                isSel ? 'bg-pink-500 border-pink-400 text-white' : 'bg-white/5 border-white/10 text-[#D9A9FF]'
                              }`}>
                                {(std.name || 'WA').substring(0, 2).toUpperCase()}
                              </div>
                              <span className={isSel ? 'text-pink-200 font-extrabold' : ''}>{std.name}</span>
                            </td>
                            <td className="py-3 px-2 font-semibold">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                std.level === 'Avanzado' ? 'bg-[#C23E9E]/10 text-red-400 border border-[#C23E9E]/20' :
                                std.level === 'Intermedio' ? 'bg-[#D9A9FF]/10 text-[#D9A9FF] border border-[#D9A9FF]/20' :
                                'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                              }`}>
                                {std.level}
                              </span>
                            </td>
                            <td className="py-3 px-2 font-mono text-[#8A8A8A]">
                              {std.email}
                            </td>
                            <td className="py-3 px-2 text-[#C2C7D1]">
                              {std.lastActive}
                            </td>
                            <td className="py-3 pl-2 text-right">
                              <button
                                onClick={() => handleOpenStudentPlan(std)}
                                className="px-3 py-1 rounded-lg bg-[#C23E9E]/20 hover:bg-[#C23E9E]/40 border border-[#C23E9E]/40 text-[#D9A9FF] text-[10px] font-mono font-bold transition-all flex items-center gap-1.5 ml-auto"
                              >
                                <Sparkles className="w-3 h-3 text-[#D9A9FF]" />
                                <span>Plan Onboarding IA</span>
                              </button>
                            </td>
                            <td className="py-3 pl-2 text-right">
                              <button
                                onClick={() => handleAlertStudent(std.name)}
                                className="px-3 py-1 rounded-lg bg-white/5 hover:bg-[#D9A9FF]/20 border border-white/10 hover:border-[#D9A9FF]/30 text-[#EDEFF4] text-[10px] font-bold transition-all"
                              >
                                {t.alertStudent}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeSubTab === 'classes' && (
            <motion.div
              key="classes-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Instructor Class Panel Header & Sub-Tab Navigation */}
              <div className="bg-[#121212] border border-white/10 rounded-[28px] p-5 sm:p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-[#D9A9FF]/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#D9A9FF]/10 border border-[#D9A9FF]/30 text-[#D9A9FF] text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5" />
                        CENTRO DE CONTROL DOCENTE
                      </span>
                      {selectedStudent && (
                        <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-[10px] font-mono font-bold flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          Enfoque: {selectedStudent.name}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                      {language === 'es' ? 'Gestión de Cátedras, Clases & Evaluaciones' : 'Instructor Class & Curriculum Control'}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      {language === 'es' 
                        ? 'Herramientas pedagógicas exclusivas para programar sesiones en vivo, asignar currículo, dirigir prácticas con metrónomo y calificar tareas de alumnos.'
                        : 'Exclusive instructor suite to schedule live workshops, manage curriculum assignments, conduct live metronome drills, and grade student submissions.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setClassPanelSubTab('schedule')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
                        classPanelSubTab === 'schedule'
                          ? 'bg-[#D9A9FF] text-black shadow-lg font-black'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>1. Sesiones en Vivo</span>
                    </button>

                    <button
                      onClick={() => setClassPanelSubTab('curriculum')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
                        classPanelSubTab === 'curriculum'
                          ? 'bg-[#D9A9FF] text-black shadow-lg font-black'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>2. Currículo & Asignaciones</span>
                    </button>

                    <button
                      onClick={() => setClassPanelSubTab('live_control')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
                        classPanelSubTab === 'live_control'
                          ? 'bg-[#D9A9FF] text-black shadow-lg font-black'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>3. Pizarra & Metrónomo</span>
                    </button>

                    <button
                      onClick={() => setClassPanelSubTab('submissions')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 relative ${
                        classPanelSubTab === 'submissions'
                          ? 'bg-[#D9A9FF] text-black shadow-lg font-black'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                      }`}
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      <span>4. Tareas & Notas</span>
                      {studentSubmissions.filter(s => s.status === 'pending').length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse absolute -top-1 -right-1" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Summary Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#D9A9FF]/10 text-[#D9A9FF] flex items-center justify-center font-bold">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">Clases en Agenda</div>
                      <div className="text-sm font-black text-white">
                        {(events || []).filter(ev => ev && (ev.instructor === currentUser.name || (ev.title && ev.title.includes('[Taller]')))).length} Sesiones
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-300 flex items-center justify-center font-bold">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">Alumnos en Cátedra</div>
                      <div className="text-sm font-black text-white">{students.length} Inscritos</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">Lecciones Catálogo</div>
                      <div className="text-sm font-black text-white">{(lessons || []).length || 12} Lecciones</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-300 flex items-center justify-center font-bold">
                      <ClipboardCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">Revisiones Pendientes</div>
                      <div className="text-sm font-black text-white">
                        {studentSubmissions.filter(s => s.status === 'pending').length} Entregas
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1. SUB-TAB: SCHEDULE & LIVE SESSIONS */}
              {classPanelSubTab === 'schedule' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left: Schedule Form */}
                  <div className="lg:col-span-2 bg-[#121212] border border-white/5 rounded-[24px] p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/5">
                      <h3 className="text-base font-black text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#D9A9FF]" />
                        Programar Nueva Sesión en Directo / Taller Magistral
                      </h3>
                      {selectedStudent && (
                        <div className="px-2.5 py-1 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-200 text-[10px] font-mono font-bold flex items-center gap-1.5">
                          <UserCheck className="w-3 h-3 text-pink-300" />
                          <span>Alumno Enfocado: {selectedStudent.name}</span>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleScheduleClass} className="space-y-4">
                      {/* Tipo de Clase / Taller */}
                      <div>
                        <label className="block text-[10px] font-mono text-[#8A8A8A] font-bold uppercase mb-1.5">
                          Tipo de Sesión Pedagógica
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            'Taller Intensivo de Técnica',
                            'Masterclass Magistral',
                            'Sesión 1-a-1 de Corrección',
                            'Laboratorio de Freestyle'
                          ].map(tType => (
                            <button
                              type="button"
                              key={tType}
                              onClick={() => setClassEventType(tType as any)}
                              className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all text-left ${
                                classEventType === tType
                                  ? 'bg-[#D9A9FF]/15 border-[#D9A9FF] text-white shadow-sm'
                                  : 'bg-[#161616] border-white/5 text-slate-400 hover:text-white'
                              }`}
                            >
                              {tType}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Título de la Clase */}
                      <div>
                        <label className="block text-[10px] font-mono text-[#8A8A8A] font-bold uppercase mb-1.5">
                          {language === 'es' ? 'Nombre o Tema Central de la Clase' : 'Class Title'}
                        </label>
                        <input
                          type="text"
                          required
                          value={classTitle}
                          onChange={e => setClassTitle(e.target.value)}
                          placeholder={language === 'es' ? "ej: Aceleración de Rolls & Limpieza Angular en Posing" : "e.g., Extreme Arm speed live drill"}
                          className="w-full px-4 py-3 rounded-xl bg-[#161616] border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-[#D9A9FF] transition-all"
                        />
                      </div>

                      {/* Fecha, Hora, Duración */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono text-[#8A8A8A] font-bold uppercase mb-1.5">
                            {t.classDate}
                          </label>
                          <input
                            type="date"
                            required
                            value={classDate}
                            onChange={e => setClassDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-[#161616] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#D9A9FF] transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-[#8A8A8A] font-bold uppercase mb-1.5">
                            {t.classTime}
                          </label>
                          <input
                            type="text"
                            required
                            value={classTime}
                            onChange={e => setClassTime(e.target.value)}
                            placeholder="19:30"
                            className="w-full px-4 py-3 rounded-xl bg-[#161616] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#D9A9FF] transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-[#8A8A8A] font-bold uppercase mb-1.5">
                            {t.classDuration}
                          </label>
                          <input
                            type="text"
                            required
                            value={classDuration}
                            onChange={e => setClassDuration(e.target.value)}
                            placeholder="90 min"
                            className="w-full px-4 py-3 rounded-xl bg-[#161616] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#D9A9FF] transition-all"
                          />
                        </div>
                      </div>

                      {/* Audiencia / Destinatario */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono text-[#8A8A8A] font-bold uppercase mb-1.5">
                            Destinatarios de la Clase
                          </label>
                          <select
                            value={classTargetAudience}
                            onChange={e => setClassTargetAudience(e.target.value as any)}
                            className="w-full px-4 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-[#D9A9FF]"
                          >
                            <option value="all">Toda la Cátedra ({students.length} Alumnos)</option>
                            {selectedStudent && (
                              <option value="selected_only">Exclusivo para {selectedStudent.name} (1 a 1)</option>
                            )}
                            <option value="level_specific">Alumnos por Nivel Específico</option>
                          </select>
                        </div>

                        {classTargetAudience === 'level_specific' && (
                          <div>
                            <label className="block text-[10px] font-mono text-[#8A8A8A] font-bold uppercase mb-1.5">
                              Nivel Requerido
                            </label>
                            <select
                              value={classTargetLevel}
                              onChange={e => setClassTargetLevel(e.target.value as any)}
                              className="w-full px-4 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-[#D9A9FF]"
                            >
                              <option value="all">Todos los Niveles</option>
                              <option value="Principiante">Nivel Principiante</option>
                              <option value="Intermedio">Nivel Intermedio</option>
                              <option value="Avanzado">Nivel Avanzado</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Sala de Google Meet */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-[10px] font-mono text-[#8A8A8A] font-bold uppercase">
                            Sala Oficial de Streaming / Google Meet
                          </label>
                          <button
                            type="button"
                            onClick={() => setClassMeet(generateGoogleMeetRoomUrl(classTitle || 'live'))}
                            className="text-[9px] font-mono font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded transition-all flex items-center gap-1 active:scale-95"
                          >
                            <Video className="w-3 h-3 text-blue-400" />
                            AUTO-GENERAR GOOGLE MEET
                          </button>
                        </div>
                        <input
                          type="url"
                          value={classMeet}
                          onChange={e => setClassMeet(e.target.value)}
                          placeholder="https://meet.google.com/abc-defg-hij"
                          className="w-full px-4 py-3 rounded-xl bg-[#161616] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#D9A9FF] transition-all"
                        />
                      </div>

                      {/* Música y BPM para la clase */}
                      <div className="p-4 rounded-2xl bg-[#1a1528] border border-purple-500/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] font-mono text-[#D9A9FF] font-bold uppercase flex items-center gap-1.5">
                            <Radio className="w-3.5 h-3.5 text-[#D9A9FF]" />
                            Pista Musical Multifuente (YouTube, Spotify, SoundCloud)
                          </label>
                          <span className="text-[9px] font-mono text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30 font-semibold">
                            Auto-Sincronización
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <input
                              type="url"
                              value={classMusicUrl}
                              onChange={e => setClassMusicUrl(e.target.value)}
                              placeholder="Pega enlace de YouTube, Spotify o SoundCloud"
                              className="w-full px-4 py-2.5 rounded-xl bg-[#120f1e] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-purple-400 transition-all"
                            />
                          </div>
                          <div>
                            <div className="relative flex items-center">
                              <input
                                type="number"
                                value={classBpm}
                                onChange={e => setClassBpm(e.target.value ? parseInt(e.target.value) : '')}
                                placeholder="128"
                                className="w-full px-4 py-2.5 rounded-xl bg-[#120f1e] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-purple-400 transition-all"
                              />
                              <span className="absolute right-3 text-[10px] font-mono font-bold text-purple-300">BPM</span>
                            </div>
                          </div>
                        </div>

                        {classMusicUrl.trim() && (
                          <div className="mt-2 space-y-1">
                            <p className="text-[10px] font-mono text-slate-300 uppercase font-bold">Vista Previa Reproductor Multifuente:</p>
                            <MultiSourcePlayer 
                              musicSource={parseMusicSource(classMusicUrl, classTitle || 'Track de Entrenamiento', typeof classBpm === 'number' ? classBpm : 128)}
                              compact={true}
                            />
                          </div>
                        )}
                      </div>

                      {/* Notas e instrucciones previas para los alumnos */}
                      <div>
                        <label className="block text-[10px] font-mono text-[#8A8A8A] font-bold uppercase mb-1.5">
                          Indicaciones y Material Requerido para el Alumno
                        </label>
                        <textarea
                          rows={2}
                          value={classNotes}
                          onChange={e => setClassNotes(e.target.value)}
                          placeholder="Requisitos: Calzado de suela plana, toalla, calentamiento previo de manguito rotador y espacio despejado..."
                          className="w-full px-4 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-slate-300 text-xs focus:outline-none focus:border-[#D9A9FF] resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 px-5 rounded-xl bg-[#D9A9FF] hover:bg-[#F2CFFF] text-black font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>{language === 'es' ? 'Programar e Inyectar en Agenda de Cátedra' : 'Inject Class to Calendar'}</span>
                      </button>
                    </form>
                  </div>

                  {/* Right: Scheduled Sessions List with Instructor Launch & Attendance Controls */}
                  <div className="bg-[#121212] border border-white/5 rounded-[24px] p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                      <h3 className="text-sm font-mono tracking-wider text-[#8A8A8A] font-bold uppercase">
                        {language === 'es' ? 'Tus Clases en Agenda' : 'Your Scheduled Events'}
                      </h3>
                      <span className="text-[10px] font-mono text-[#D9A9FF] bg-[#D9A9FF]/10 px-2 py-0.5 rounded border border-[#D9A9FF]/20 font-bold">
                        {(events || []).filter(ev => ev.instructor === currentUser.name || (ev.title && ev.title.includes('[Taller]'))).length} Clases
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                      {(events || []).filter(ev => ev.instructor === currentUser.name || (ev.title && ev.title.includes('[Taller]'))).map(ev => {
                        const eventAttendance = attendanceRecords[ev.id] || {};
                        const presentCount = Object.values(eventAttendance).filter(st => st === 'present').length;
                        
                        return (
                          <div key={ev.id} className="p-4 bg-[#161616] border border-white/5 hover:border-white/15 rounded-2xl space-y-3 transition-all">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-mono text-[#D9A9FF] font-bold">{ev.date} @ {ev.time}</span>
                              <span className="text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                                {ev.rsvpCount || students.length} Alumnos
                              </span>
                            </div>

                            <div>
                              <h4 className="text-xs font-black text-white">{ev.title}</h4>
                              <p className="text-[11px] text-[#8A8A8A] font-semibold mt-0.5">{ev.duration} • {ev.instructor}</p>
                            </div>

                            {ev.meetUrl && (
                              <div className="p-2 rounded-xl bg-blue-950/30 border border-blue-500/20 text-[10px] font-mono text-blue-200 truncate flex items-center gap-1.5">
                                <Video className="w-3 h-3 text-blue-400 shrink-0" />
                                <span className="truncate">{ev.meetUrl}</span>
                              </div>
                            )}

                            {/* Action Buttons for the Instructor */}
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              {ev.meetUrl ? (
                                <a
                                  href={ev.meetUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1.5 text-center shadow-md active:scale-95"
                                >
                                  <Play className="w-3 h-3" />
                                  <span>Iniciar Sala</span>
                                </a>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleCopyClassLink(generateGoogleMeetRoomUrl(ev.title), ev.title)}
                                  className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-mono text-[10px] font-bold uppercase transition-all"
                                >
                                  Generar Link
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setAttendanceModalEvent(ev)}
                                className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#D9A9FF] font-mono text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1"
                              >
                                <ClipboardCheck className="w-3 h-3" />
                                <span>Lista ({presentCount} Pres.)</span>
                              </button>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] text-slate-400">
                              <button
                                type="button"
                                onClick={() => handleCopyClassLink(ev.meetUrl || generateGoogleMeetRoomUrl(ev.title), ev.title)}
                                className="hover:text-white flex items-center gap-1 transition-colors"
                              >
                                <Copy className="w-3 h-3" />
                                <span>Copiar Enlace</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm('¿Cancelar y eliminar esta sesión de la agenda?')) {
                                    playChime('click');
                                    setAlertText('Sesión cancelada.');
                                    setTimeout(() => setAlertText(null), 2500);
                                  }
                                }}
                                className="hover:text-rose-400 flex items-center gap-1 transition-colors text-slate-500"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Cancelar</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {(events || []).filter(ev => ev && (ev.instructor === currentUser.name || (ev.title && ev.title.includes('[Taller]')))).length === 0 && (
                        <div className="py-12 text-center text-[#8A8A8A] text-xs font-mono">
                          [NO HAY SESIONES ACTIVAS EN AGENDA]
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. SUB-TAB: CURRICULUM & LESSON ASSIGNMENT */}
              {classPanelSubTab === 'curriculum' && (
                <div className="space-y-6">
                  {/* Filter & Search Bar */}
                  <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 max-w-md bg-[#161616] border border-white/10 rounded-xl px-3 py-2">
                      <Search className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={curriculumSearchQuery}
                        onChange={e => setCurriculumSearchQuery(e.target.value)}
                        placeholder="Buscar lecciones de técnica, rolls, musicalidad..."
                        className="w-full bg-transparent text-white text-xs font-semibold focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto">
                      {(['all', 'Principiante', 'Intermedio', 'Avanzado'] as const).map(lvl => (
                        <button
                          key={lvl}
                          onClick={() => setCurriculumLevelFilter(lvl)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                            curriculumLevelFilter === lvl
                              ? 'bg-[#D9A9FF] text-black font-black'
                              : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                          }`}
                        >
                          {lvl === 'all' ? 'Todos los Niveles' : lvl}
                        </button>
                      ))}

                      <button
                        onClick={() => setShowAddLessonModal(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-black transition-all flex items-center gap-1.5 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Nueva Lección</span>
                      </button>
                    </div>
                  </div>

                  {/* Focused Student Banner in Curriculum */}
                  {selectedStudent && (
                    <div className="p-4 rounded-2xl bg-pink-950/40 border border-pink-500/40 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center font-bold text-xs">
                          {selectedStudent.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-bold text-pink-300 uppercase">MODO ASIGNACIÓN INDIVIDUAL:</span>
                          <h4 className="text-sm font-black text-white">{selectedStudent.name} ({selectedStudent.level})</h4>
                        </div>
                      </div>
                      <p className="text-xs text-pink-200/80">
                        Haz clic en <strong>"Asignar Lección"</strong> o <strong>"Validar Aprobación"</strong> para personalizar la ruta técnica de este alumno.
                      </p>
                    </div>
                  )}

                  {/* Lessons Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(lessons || []).filter(l => {
                      const matchQuery = !curriculumSearchQuery.trim() || l.title.toLowerCase().includes(curriculumSearchQuery.toLowerCase()) || l.description.toLowerCase().includes(curriculumSearchQuery.toLowerCase());
                      const matchLvl = curriculumLevelFilter === 'all' || 
                        (curriculumLevelFilter === 'Principiante' && (l.level === 1 || l.difficulty === 'principiante')) ||
                        (curriculumLevelFilter === 'Intermedio' && (l.level === 2 || l.difficulty === 'intermedio')) ||
                        (curriculumLevelFilter === 'Avanzado' && (l.difficulty === 'avanzado'));
                      return matchQuery && matchLvl;
                    }).map(lesson => {
                      const assignedStudents = curriculumAssignedMap[lesson.id] || [];
                      const approvedStudents = curriculumApprovedMap[lesson.id] || [];
                      const isAssignedToSelected = selectedStudent ? assignedStudents.includes(selectedStudent.id) : false;
                      const isApprovedBySelected = selectedStudent ? approvedStudents.includes(selectedStudent.id) : false;
                      const levelName = lesson.difficulty 
                        ? (lesson.difficulty.charAt(0).toUpperCase() + lesson.difficulty.slice(1)) 
                        : (lesson.level === 1 ? 'Principiante' : 'Intermedio');

                      return (
                        <div key={lesson.id} className="bg-[#121212] border border-white/5 hover:border-white/20 rounded-[24px] p-5 space-y-4 flex flex-col justify-between transition-all group">
                          <div className="space-y-3">
                            <div className="relative rounded-2xl overflow-hidden aspect-video bg-black/40 border border-white/10">
                              <img 
                                src={(lesson as any).thumbnailUrl || (lesson as any).thumbnail || "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600"} 
                                alt={lesson.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/10">
                                {lesson.duration}
                              </div>
                              {lesson.bpm && (
                                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-purple-900/80 backdrop-blur-md text-[10px] font-mono font-bold text-purple-200 border border-purple-500/30">
                                  {lesson.bpm} BPM
                                </div>
                              )}
                              <span className={`absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                levelName === 'Avanzado' ? 'bg-red-500/80 text-white' :
                                levelName === 'Intermedio' ? 'bg-[#D9A9FF]/90 text-black' :
                                'bg-cyan-500/80 text-black'
                              }`}>
                                {levelName}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] font-mono text-purple-300 font-bold uppercase">{lesson.category}</span>
                              <h4 className="text-sm font-extrabold text-white mt-1 group-hover:text-[#D9A9FF] transition-colors">{lesson.title}</h4>
                              <p className="text-xs text-slate-400 font-medium line-clamp-2 mt-1">{lesson.description}</p>
                            </div>
                          </div>

                          <div className="space-y-3 pt-3 border-t border-white/5">
                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                              <span>Asignados: <strong className="text-white">{assignedStudents.length} alumnos</strong></span>
                              <span>Aprobados: <strong className="text-emerald-400">{approvedStudents.length}</strong></span>
                            </div>

                            {/* Action Buttons for Instructor */}
                            {selectedStudent ? (
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleToggleAssignLesson(lesson.id, selectedStudent.id)}
                                  className={`py-2 px-2.5 rounded-xl text-[10px] font-mono font-bold transition-all flex items-center justify-center gap-1 ${
                                    isAssignedToSelected
                                      ? 'bg-pink-600 text-white shadow-md'
                                      : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300'
                                  }`}
                                >
                                  <UserCheck className="w-3 h-3" />
                                  <span>{isAssignedToSelected ? 'Asignada' : 'Asignar'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleApproveLesson(lesson.id, selectedStudent.id)}
                                  className={`py-2 px-2.5 rounded-xl text-[10px] font-mono font-bold transition-all flex items-center justify-center gap-1 ${
                                    isApprovedBySelected
                                      ? 'bg-emerald-600 text-white shadow-md'
                                      : 'bg-white/5 hover:bg-white/10 border border-white/10 text-emerald-400'
                                  }`}
                                >
                                  <Check className="w-3 h-3" />
                                  <span>{isApprovedBySelected ? 'Aprobada' : 'Validar'}</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAssignLessonToAll(lesson.id)}
                                className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-[#D9A9FF]/20 border border-white/10 hover:border-[#D9A9FF]/40 text-slate-200 hover:text-[#D9A9FF] font-mono text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5"
                              >
                                <Users className="w-3 h-3" />
                                <span>Asignar a Toda la Cátedra</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. SUB-TAB: LIVE CONTROL ROOM & METRONOME */}
              {classPanelSubTab === 'live_control' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left (2 Cols): Live Metronome & Practice Timer */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* High Precision Live Metronome */}
                    <div className="bg-[#121212] border border-[#D9A9FF]/30 rounded-[28px] p-6 space-y-5 shadow-2xl relative overflow-hidden">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-[#D9A9FF]" />
                          <h3 className="text-base font-black text-white uppercase tracking-wider">
                            Metrónomo en Vivo para Dirección de Clases
                          </h3>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          liveMetronomeActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse' : 'bg-white/5 text-slate-400'
                        }`}>
                          {liveMetronomeActive ? 'Activo / Marcando Compás' : 'En Pausa'}
                        </span>
                      </div>

                      {/* 8-Beat Visual Indicator Lights */}
                      <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase">
                          <span>Conteo Visual de Compás (8 Tiempos):</span>
                          <span>Acentos en Tiempos 1 y 5</span>
                        </div>
                        <div className="grid grid-cols-8 gap-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(beat => {
                            const isCurrent = liveMetronomeActive && liveMetronomeBeat === beat;
                            const isAccentBeat = beat === 1 || beat === 5;
                            return (
                              <div
                                key={beat}
                                className={`h-12 rounded-xl border flex flex-col items-center justify-center font-mono font-black text-xs transition-all ${
                                  isCurrent
                                    ? isAccentBeat
                                      ? 'bg-[#D9A9FF] text-black border-[#D9A9FF] shadow-[0_0_20px_rgba(217, 169, 255,0.8)] scale-105'
                                      : 'bg-purple-500 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.8)] scale-105'
                                    : isAccentBeat
                                      ? 'bg-white/10 border-[#D9A9FF]/30 text-[#D9A9FF]'
                                      : 'bg-white/5 border-white/5 text-slate-400'
                                }`}
                              >
                                <span>{beat}</span>
                                {isAccentBeat && <span className="text-[7px] uppercase font-bold">ACC</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* BPM Slider & Direct Speed Presets */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-slate-400 font-bold uppercase">Tempo de Práctica (BPM):</span>
                          <span className="text-3xl font-mono font-black text-[#D9A9FF]">{liveMetronomeBpm} <span className="text-xs text-slate-400 font-normal">BPM</span></span>
                        </div>

                        <input
                          type="range"
                          min="90"
                          max="150"
                          step="1"
                          value={liveMetronomeBpm}
                          onChange={e => setLiveMetronomeBpm(parseInt(e.target.value))}
                          className="w-full accent-[#D9A9FF] cursor-pointer h-2 bg-white/10 rounded-lg"
                        />

                        <div className="flex flex-wrap items-center gap-2">
                          {[100, 110, 118, 124, 128, 132, 140].map(speed => (
                            <button
                              key={speed}
                              type="button"
                              onClick={() => {
                                setLiveMetronomeBpm(speed);
                                playChime('click');
                              }}
                              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                                liveMetronomeBpm === speed
                                  ? 'bg-[#D9A9FF] text-black font-black'
                                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                              }`}
                            >
                              {speed} BPM
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Start / Stop Metronome Button */}
                      <button
                        type="button"
                        onClick={() => {
                          playChime('click');
                          setLiveMetronomeActive(!liveMetronomeActive);
                        }}
                        className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl active:scale-98 ${
                          liveMetronomeActive
                            ? 'bg-rose-600 hover:bg-rose-500 text-white'
                            : 'bg-[#D9A9FF] hover:bg-[#F2CFFF] text-black'
                        }`}
                      >
                        {liveMetronomeActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        <span>{liveMetronomeActive ? 'Detener Metrónomo en Vivo' : 'Iniciar Metrónomo de Clase'}</span>
                      </button>
                    </div>

                    {/* Drill & Freestyle Round Timer */}
                    <div className="bg-[#121212] border border-white/5 rounded-[28px] p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                          <Timer className="w-5 h-5 text-purple-400" />
                          <h3 className="text-base font-black text-white uppercase tracking-wider">
                            Cronómetro de Rondas de Drill & Freestyle
                          </h3>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-400">
                          {Math.floor(liveRoundTimerSeconds / 60)}:{(liveRoundTimerSeconds % 60).toString().padStart(2, '0')}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-black/40 border border-white/5">
                        <div className="text-center sm:text-left">
                          <div className="text-4xl sm:text-5xl font-mono font-black text-white">
                            {Math.floor(liveRoundTimerSeconds / 60)}:{(liveRoundTimerSeconds % 60).toString().padStart(2, '0')}
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono mt-1">Temporizador de intervención para alumnos en cámara</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {[30, 45, 60, 90, 120].map(secs => (
                            <button
                              key={secs}
                              type="button"
                              onClick={() => handleStartRoundTimer(secs)}
                              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs font-bold transition-all"
                            >
                              {secs}s
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setLiveRoundTimerRunning(!liveRoundTimerRunning)}
                          className={`py-3 rounded-xl font-mono text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${
                            liveRoundTimerRunning
                              ? 'bg-amber-600 text-white'
                              : 'bg-purple-600 hover:bg-purple-500 text-white'
                          }`}
                        >
                          {liveRoundTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          <span>{liveRoundTimerRunning ? 'Pausar Ronda' : 'Comenzar Ronda'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleResetRoundTimer}
                          className="py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Reiniciar</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right (1 Col): Live Teacher Quick Notes & Posture Remarks */}
                  <div className="bg-[#121212] border border-white/5 rounded-[28px] p-6 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <h4 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                          <Edit3 className="w-4 h-4 text-[#D9A9FF]" />
                          Bitácora de Observaciones en Vivo
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">Auto-Guardado</span>
                      </div>

                      <p className="text-[11px] text-slate-400 font-medium">
                        Anota correcciones técnicas, simetría braquial y postura de los alumnos durante la sesión en directo:
                      </p>

                      <textarea
                        rows={14}
                        value={liveTeacherNotes}
                        onChange={e => setLiveTeacherNotes(e.target.value)}
                        placeholder="Escribe tus observaciones técnicas aquí..."
                        className="w-full p-3.5 rounded-2xl bg-[#161616] border border-white/10 text-slate-200 text-xs font-mono leading-relaxed focus:outline-none focus:border-[#D9A9FF] resize-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(liveTeacherNotes);
                        playChime('click');
                        setAlertText('¡Observaciones de clase copiadas al portapapeles!');
                        setTimeout(() => setAlertText(null), 3000);
                      }}
                      className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-2"
                    >
                      <Copy className="w-4 h-4 text-[#D9A9FF]" />
                      <span>Copiar Bitácora para WhatsApp / Email</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 4. SUB-TAB: SUBMISSIONS & HOMEWORK GRADING */}
              {classPanelSubTab === 'submissions' && (
                <div className="space-y-6">
                  <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-black text-white uppercase">
                        Entregas Técnicas y Tareas de Alumnos
                      </h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Revisa los videos de práctica enviados por tus alumnos, asigna puntaje técnico y brinda feedback pedagógico.
                      </p>
                    </div>

                    <span className="text-xs font-mono text-[#D9A9FF] bg-[#D9A9FF]/10 px-3 py-1 rounded-xl border border-[#D9A9FF]/20 font-bold">
                      {studentSubmissions.length} Tareas Registradas
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {studentSubmissions.map(sub => (
                      <div key={sub.id} className="bg-[#121212] border border-white/5 rounded-[24px] p-5 space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#D9A9FF]/10 text-[#D9A9FF] font-bold text-xs flex items-center justify-center border border-[#D9A9FF]/20">
                                {sub.studentName.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="text-sm font-black text-white">{sub.studentName}</h4>
                                <span className="text-[10px] font-mono text-slate-400">{sub.submittedAt}</span>
                              </div>
                            </div>

                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                              sub.status === 'graded' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            }`}>
                              {sub.status === 'graded' ? `Calificado (${sub.score}/100)` : 'Pendiente de Revisión'}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Lección Correspondiente:</span>
                            <h5 className="text-xs font-black text-white mt-0.5">{sub.lessonTitle}</h5>
                          </div>

                          <div className="relative rounded-2xl overflow-hidden aspect-video bg-black/40 border border-white/10">
                            <img src={sub.videoUrl} alt={sub.lessonTitle} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <div className="w-10 h-10 rounded-full bg-[#D9A9FF] text-black flex items-center justify-center shadow-lg font-bold">
                                <Play className="w-5 h-5 ml-0.5" />
                              </div>
                            </div>
                          </div>

                          {sub.feedback && (
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Tu Feedback Docente:</span>
                              <p className="text-xs text-slate-300 italic font-medium">"{sub.feedback}"</p>
                            </div>
                          )}
                        </div>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => setGradingSubmission({
                              submission: sub,
                              score: sub.score || 85,
                              feedback: sub.feedback || 'Excelente fluidez en el patrón. Recuerda mantener la extensión de codos en los compases acelerados.'
                            })}
                            className="w-full py-2.5 px-4 rounded-xl bg-[#D9A9FF] hover:bg-[#F2CFFF] text-black font-mono text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                          >
                            <ClipboardCheck className="w-4 h-4" />
                            <span>{sub.status === 'graded' ? 'Editar Calificación & Feedback' : 'Calificar Entrega Técnica'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ATTENDANCE SHEET MODAL */}
          {attendanceModalEvent && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#141414] border border-[#D9A9FF]/40 rounded-[28px] p-6 max-w-xl w-full space-y-5 shadow-2xl relative"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#D9A9FF] uppercase">CONTROL DE ASISTENCIA OFICIAL</span>
                    <h3 className="text-base font-black text-white">{attendanceModalEvent.title}</h3>
                    <p className="text-xs font-mono text-slate-400">{attendanceModalEvent.date} @ {attendanceModalEvent.time}</p>
                  </div>
                  <button
                    onClick={() => setAttendanceModalEvent(null)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {students.map(std => {
                    const eventAttendance = attendanceRecords[attendanceModalEvent.id] || {};
                    const currentStatus = eventAttendance[std.id] || 'absent';

                    return (
                      <div key={std.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-[#D9A9FF]">
                            {std.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{std.name}</h4>
                            <span className="text-[10px] font-mono text-slate-400">{std.level}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSetStudentAttendance(attendanceModalEvent.id, std.id, 'present')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                              currentStatus === 'present'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-white/5 text-slate-400 hover:text-white'
                            }`}
                          >
                            Presente
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetStudentAttendance(attendanceModalEvent.id, std.id, 'late')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                              currentStatus === 'late'
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'bg-white/5 text-slate-400 hover:text-white'
                            }`}
                          >
                            Tarde
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetStudentAttendance(attendanceModalEvent.id, std.id, 'absent')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                              currentStatus === 'absent'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'bg-white/5 text-slate-400 hover:text-white'
                            }`}
                          >
                            Ausente
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-xs font-mono text-slate-400">
                    Asistencia: <strong className="text-emerald-400">{Object.values(attendanceRecords[attendanceModalEvent.id] || {}).filter(st => st === 'present').length} de {students.length} presentes</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      playChime('success');
                      setAlertText('¡Lista de asistencia guardada correctamente!');
                      setAttendanceModalEvent(null);
                      setTimeout(() => setAlertText(null), 3000);
                    }}
                    className="py-2 px-4 rounded-xl bg-[#D9A9FF] text-black font-mono text-xs font-black uppercase transition-all"
                  >
                    Guardar Asistencia
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* GRADING SUBMISSION MODAL */}
          {gradingSubmission && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#141414] border border-[#D9A9FF]/40 rounded-[28px] p-6 max-w-lg w-full space-y-4 shadow-2xl relative"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#D9A9FF] uppercase">CALIFICAR ENTREGA TÉCNICA</span>
                    <h3 className="text-sm font-black text-white">{gradingSubmission.submission.studentName}</h3>
                    <p className="text-xs font-mono text-slate-400">{gradingSubmission.submission.lessonTitle}</p>
                  </div>
                  <button
                    onClick={() => setGradingSubmission(null)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-mono text-[#8A8A8A] font-bold uppercase mb-1">
                      Puntaje de Rendimiento (1 - 100)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="50"
                        max="100"
                        step="1"
                        value={gradingSubmission.score}
                        onChange={e => setGradingSubmission({
                          ...gradingSubmission,
                          score: parseInt(e.target.value)
                        })}
                        className="flex-1 accent-[#D9A9FF] cursor-pointer"
                      />
                      <span className="text-xl font-mono font-black text-[#D9A9FF] w-14 text-right">
                        {gradingSubmission.score}/100
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-[#8A8A8A] font-bold uppercase mb-1">
                      Correcciones y Feedback Técnico para el Alumno
                    </label>
                    <textarea
                      rows={4}
                      value={gradingSubmission.feedback}
                      onChange={e => setGradingSubmission({
                        ...gradingSubmission,
                        feedback: e.target.value
                      })}
                      placeholder="Indica correcciones sobre la simetría de rolls, posición de hombros y musicalidad..."
                      className="w-full p-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-[#D9A9FF] resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setGradingSubmission(null)}
                    className="py-2 px-3 rounded-xl bg-white/5 text-slate-400 text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGradeSubmission(
                      gradingSubmission.submission.id,
                      gradingSubmission.score,
                      gradingSubmission.feedback
                    )}
                    className="py-2 px-4 rounded-xl bg-[#D9A9FF] hover:bg-[#F2CFFF] text-black font-mono text-xs font-black uppercase transition-all shadow-md"
                  >
                    Guardar & Emitir Nota
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* ADD NEW LESSON MODAL */}
          {showAddLessonModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#141414] border border-[#D9A9FF]/40 rounded-[28px] p-6 max-w-lg w-full space-y-4 shadow-2xl relative"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-black text-white uppercase">Añadir Nueva Lección al Currículo</h3>
                  </div>
                  <button
                    onClick={() => setShowAddLessonModal(false)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newLessonTitle.trim()) return;
                    playChime('success');
                    setShowAddLessonModal(false);
                    setAlertText(`¡Lección "${newLessonTitle}" añadida al currículo y disponible para asignaciones!`);
                    setTimeout(() => setAlertText(null), 3500);
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-[10px] font-mono text-[#8A8A8A] font-bold uppercase mb-1">Título de la Lección</label>
                    <input
                      type="text"
                      required
                      value={newLessonTitle}
                      onChange={e => setNewLessonTitle(e.target.value)}
                      placeholder="ej: Micro-Musicalidad & Sincopa a 130 BPM"
                      className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-[#D9A9FF]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-[#8A8A8A] font-bold uppercase mb-1">Categoría Técnica</label>
                      <input
                        type="text"
                        value={newLessonCategory}
                        onChange={e => setNewLessonCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-[#8A8A8A] font-bold uppercase mb-1">Nivel</label>
                      <select
                        value={newLessonLevel}
                        onChange={e => setNewLessonLevel(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-white/10 text-white font-bold text-xs focus:outline-none"
                      >
                        <option value="Principiante">Principiante</option>
                        <option value="Intermedio">Intermedio</option>
                        <option value="Avanzado">Avanzado</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-[#8A8A8A] font-bold uppercase mb-1">Duración</label>
                      <input
                        type="text"
                        value={newLessonDuration}
                        onChange={e => setNewLessonDuration(e.target.value)}
                        placeholder="20 min"
                        className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-xs font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-[#8A8A8A] font-bold uppercase mb-1">Tempo (BPM)</label>
                      <input
                        type="number"
                        value={newLessonBpm}
                        onChange={e => setNewLessonBpm(parseInt(e.target.value) || 128)}
                        className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-[#8A8A8A] font-bold uppercase mb-1">Descripción Pedagógica</label>
                    <textarea
                      rows={2}
                      value={newLessonDescription}
                      onChange={e => setNewLessonDescription(e.target.value)}
                      placeholder="Desglose del contenido técnico..."
                      className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-white/10 text-slate-300 text-xs focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setShowAddLessonModal(false)}
                      className="py-2 px-3 rounded-xl bg-white/5 text-slate-400 text-xs font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-black uppercase transition-all shadow-md"
                    >
                      Guardar Lección
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {activeSubTab === 'promotion' && (
            <motion.div
              key="promotion-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8 animate-fade-in"
              id="promotion-tab-container"
            >
              {/* Introduction Banner */}
              <div className="bg-[#121212] border border-[#D9A9FF]/20 rounded-[24px] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute right-[-30px] top-[-30px] w-48 h-48 bg-[#D9A9FF]/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2 max-w-xl">
                    <span className="inline-flex items-center gap-1 bg-[#D9A9FF]/10 text-[#D9A9FF] border border-[#D9A9FF]/30 text-[9px] font-mono font-bold tracking-widest px-2.5 py-1 rounded-full uppercase">
                      <Sparkles className="w-3.5 h-3.5 text-[#D9A9FF]" /> 
                      {language === 'es' ? 'ALCANCE GLOBAL DESTACADO' : 'GLOBAL OUTREACH FEATURES'}
                    </span>
                    <h3 className="text-lg md:text-2xl font-serif-elegant font-black text-white uppercase leading-tight">
                      {language === 'es' ? 'Suscripción de Instructor Destacado' : 'Featured Instructor Subscription'}
                    </h3>
                    <p className="text-xs text-[#8A8A8A] font-semibold leading-relaxed">
                      {language === 'es' 
                        ? 'Consigue visibilidad máxima. Aparece al inicio de la lista de instructores, recibe la insignia oficial dorada de instructor destacado y atrae a miles de alumnos de todo el mundo.'
                        : 'Get maximum visibility. Appear at the top of the instructors catalog, receive the official golden featured instructor badge, and attract thousands of students worldwide.'}
                    </p>
                  </div>

                  {currentUser.isFeaturedInstructor ? (
                    <div className="bg-[#161616] border border-[#D9A9FF]/30 p-4 rounded-2xl flex flex-col items-start gap-1 w-full md:w-auto shrink-0 shadow-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#D9A9FF] animate-pulse" />
                        <span className="text-[10px] font-mono font-bold text-[#D9A9FF] uppercase">
                          {language === 'es' ? 'ESTATUS: DESTACADO ACTIVO' : 'STATUS: ACTIVE FEATURED'}
                        </span>
                      </div>
                      <p className="text-[11px] text-white font-bold uppercase mt-1">
                        {language === 'es' ? 'PLAN:' : 'PLAN:'} SUSCRIPCIÓN DE INSTRUCTOR ({currentUser.monthlyPrice || '$35 USD/MES'})
                      </p>
                      <p className="text-[9px] font-mono text-[#8A8A8A] uppercase mt-0.5">
                        {language === 'es' ? 'VENCE EL:' : 'EXPIRES:'} {currentUser.featuredExpiry}
                      </p>
                      <button
                        onClick={handleCancelSubscription}
                        className="mt-3 text-[10px] text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
                      >
                        {language === 'es' ? 'Desactivar Suscripción' : 'Deactivate Subscription'}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-[#161616] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center w-full md:w-auto shrink-0">
                      <span className="text-[10px] font-mono font-bold text-[#8A8A8A] uppercase">
                        {language === 'es' ? 'ESTATUS SIN DESTACADO' : 'NON-FEATURED STATUS'}
                      </span>
                      <p className="text-[11px] text-[#C2C7D1] font-semibold mt-1 max-w-[180px]">
                        {language === 'es' ? 'Registrado como Instructor Estándar' : 'Registered as Standard Instructor'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ESTABLECER PRECIO DE MEMBRESÍA MENSUAL */}
              <div className="bg-[#121212] border border-[#D9A9FF]/30 rounded-[24px] p-6 space-y-4 shadow-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-48 h-48 bg-[#D9A9FF]/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#D9A9FF]" />
                  <h4 className="text-sm font-mono font-bold tracking-widest text-white uppercase">
                    {language === 'es' ? 'Establece tu Precio de Membresía Mensual ($ USD/mes)' : 'Set Your Monthly Membership Fee ($ USD/mo)'}
                  </h4>
                </div>

                <p className="text-xs text-[#8A8A8A] font-semibold leading-relaxed">
                  {language === 'es' 
                    ? 'Define la tarifa mensual personalizada que pagarán tus alumnos para acceder a tu Cátedra, Plan de 4 Semanas, Ebooks y clases grabadas. Los cambios se actualizarán inmediatamente en el Directorio Global del Tablero Principal con validación de backend.' 
                    : 'Set the custom monthly fee students will pay to access your Class, 4-Week Plan, Ebooks, and recorded sessions. Changes will immediately update on the Main Dashboard Directory with backend validation.'}
                </p>

                {pricingError && (
                  <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs font-mono flex items-center gap-2 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{pricingError}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#D9A9FF]">$</span>
                    <input 
                      type="number"
                      step="0.50"
                      min="1"
                      value={priceNumberInput}
                      onChange={(e) => {
                        setPricingError(null);
                        setPriceNumberInput(e.target.value);
                      }}
                      placeholder="15.00"
                      className="w-full bg-[#161616] border border-white/10 rounded-xl pl-8 pr-16 py-2.5 text-xs text-white font-mono font-bold focus:border-[#D9A9FF] outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 font-bold">USD/mes</span>
                  </div>

                  {/* Quick Presets */}
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    {['15', '25', '35', '45', '55'].map((presetPrice) => (
                      <button
                        key={presetPrice}
                        type="button"
                        onClick={() => {
                          setPricingError(null);
                          setPriceNumberInput(presetPrice);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                          priceNumberInput === presetPrice 
                            ? 'bg-[#D9A9FF]/20 text-[#D9A9FF] border-[#D9A9FF]' 
                            : 'bg-white/5 text-[#8A8A8A] border-white/5 hover:text-white'
                        }`}
                      >
                        ${presetPrice} USD
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={isUpdatingPrice}
                    onClick={() => handleUpdatePricing(priceNumberInput)}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#C23E9E] via-[#C23FA0] to-[#D9A9FF] hover:brightness-110 text-white text-xs font-black rounded-xl uppercase tracking-wider transition-all shrink-0 active:scale-95 flex items-center justify-center gap-1.5 shadow-lg"
                  >
                    {isUpdatingPrice ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#D9A9FF]" />
                        <span>Validando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#D9A9FF]" />
                        <span>Actualizar Tarifa</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* CONFIGURATION SECTION: BILLING & VISIBILITY */}
              <div className="bg-[#121212] border border-[#262626] rounded-[24px] p-6 space-y-4 shadow-2xl relative overflow-hidden">
                <div className="absolute right-0 bottom-0 w-48 h-48 bg-[#D9A9FF]/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-2">
                  <Settings className="w-4.5 h-4.5 text-[#D9A9FF]" />
                  <h4 className="text-xs font-mono font-bold tracking-widest text-white uppercase">
                    {language === 'es' ? 'Configuración de Suscripción & Visibilidad' : 'Subscription & Visibility Configuration'}
                  </h4>
                </div>
                
                <p className="text-xs text-[#8A8A8A] font-semibold leading-relaxed">
                  {language === 'es' 
                    ? 'La visibilidad destacada en el Directorio Global está vinculada directamente al estado de suscripción y facturación de tu cuenta (billingStatus). Mantén tu suscripción activa para aparecer en las primeras posiciones.' 
                    : 'Featured visibility in the Global Directory is linked directly to your subscription and billing status (billingStatus). Keep your subscription active to appear at top positions.'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Card 1: Billing Status */}
                  <div className="bg-[#161616] border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase">
                        {language === 'es' ? 'ESTADO DE FACTURACIÓN (billingStatus)' : 'BILLING STATUS (billingStatus)'}
                      </span>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${currentUser.billingStatus === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                        <span className="text-xs font-bold text-white uppercase font-mono">
                          {currentUser.billingStatus === 'active' 
                            ? (language === 'es' ? 'ACTIVO (Suscrito)' : 'ACTIVE (Subscribed)') 
                            : (language === 'es' ? 'INACTIVO / CANCELADO' : 'INACTIVE / CANCELLED')}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8A8A8A] font-semibold mt-2">
                        {currentUser.billingStatus === 'active'
                          ? (language === 'es' ? '¡Tienes acceso completo a todos los ebooks de Waack On y cursos premium!' : 'You have full access to all Waack On ebooks and premium courses!')
                          : (language === 'es' ? 'Registra una suscripción de promoción para activar los beneficios premium globales.' : 'Register a promotion subscription to activate global premium benefits.')}
                      </p>
                    </div>
                    
                    {currentUser.billingStatus === 'active' ? (
                      <button
                        onClick={() => {
                          if (window.confirm(language === 'es' ? '¿Deseas dar de baja tu estado de facturación activo? Esto desactivará tu posición destacada.' : 'Do you want to unsubscribe your active billing status? This will deactivate your featured position.')) {
                            playChime('click');
                            onUserChange({
                              ...currentUser,
                              billingStatus: 'cancelled',
                              isFeaturedInstructor: false,
                              featuredPlan: undefined,
                              featuredExpiry: undefined
                            });
                            setAlertText(language === 'es' ? 'Suscripción de facturación desactivada.' : 'Billing subscription deactivated.');
                            setTimeout(() => setAlertText(null), 3000);
                          }
                        }}
                        className="mt-4 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-[10px] font-bold transition-all text-center uppercase cursor-pointer"
                      >
                        {language === 'es' ? 'Cancelar Facturación' : 'Cancel Billing Subscription'}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          playChime('click');
                          setSelectedPlan('monthly');
                          setIsCheckingOut(true);
                        }}
                        className="mt-4 px-3 py-1.5 bg-[#D9A9FF] hover:bg-[#F2CFFF] text-black rounded-xl text-[10px] font-black transition-all text-center uppercase cursor-pointer"
                      >
                        {language === 'es' ? 'Activar con Plan de Destacado' : 'Activate with Promotion Plan'}
                      </button>
                    )}
                  </div>

                  {/* Card 2: Visibility Toggle */}
                  <div className="bg-[#161616] border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase">
                        {language === 'es' ? 'VISIBILIDAD EN EL DIRECTORIO' : 'DIRECTORY VISIBILITY'}
                      </span>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${currentUser.isFeaturedInstructor ? 'bg-[#D9A9FF] animate-pulse' : 'bg-zinc-600'}`} />
                        <span className="text-xs font-bold text-white uppercase font-mono">
                          {currentUser.isFeaturedInstructor 
                            ? (language === 'es' ? 'DESTACADO (Arriba de la Lista)' : 'FEATURED (Top of List)') 
                            : (language === 'es' ? 'ESTÁNDAR (Búsqueda Regular)' : 'STANDARD (Regular Search)')}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8A8A8A] font-semibold mt-2">
                        {language === 'es'
                          ? 'Los instructores destacados aparecen primero en el buscador del directorio global en la pantalla principal.'
                          : 'Featured instructors appear first in the global directory search on the main dashboard.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                      {currentUser.billingStatus === 'active' ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[10px] font-mono font-bold text-[#C2C7D1] uppercase">
                            {language === 'es' ? 'Alternar Visibilidad:' : 'Toggle Visibility:'}
                          </span>
                          <button
                            onClick={() => {
                              playChime('click');
                              const targetFeatured = !currentUser.isFeaturedInstructor;
                              onUserChange({
                                ...currentUser,
                                isFeaturedInstructor: targetFeatured
                              });
                              setAlertText(
                                language === 'es' 
                                  ? `Visibilidad destacada ${targetFeatured ? 'activada' : 'desactivada'} 🔥` 
                                  : `Featured visibility ${targetFeatured ? 'activated' : 'deactivated'} 🔥`
                              );
                              setTimeout(() => setAlertText(null), 3000);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer uppercase ${
                              currentUser.isFeaturedInstructor 
                                ? 'bg-[#D9A9FF] text-black hover:bg-[#F2CFFF]' 
                                : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                            }`}
                          >
                            {currentUser.isFeaturedInstructor ? (language === 'es' ? 'Desactivar Destacado' : 'Disable Featured') : (language === 'es' ? 'Activar Destacado' : 'Enable Featured')}
                          </button>
                        </div>
                      ) : (
                        <div className="w-full bg-[#0A0A0A] border border-dashed border-rose-500/10 p-2 rounded-xl text-center text-[9px] text-rose-400 font-mono font-bold uppercase">
                          {language === 'es' ? '⚠️ REQUIERE FACTURACIÓN ACTIVA' : '⚠️ REQUIRES ACTIVE BILLING'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Single $15/mo Instructor Subscription Plan */}
              <div className="max-w-2xl mx-auto bg-gradient-to-br from-[#18122a] via-[#130f21] to-[#0f0b1a] border-2 border-[#D9A9FF] rounded-[28px] p-6 sm:p-8 relative shadow-2xl overflow-hidden space-y-6">
                <div className="absolute top-0 right-0 bg-[#D9A9FF] text-black text-[9px] font-mono font-black uppercase px-4 py-1.5 rounded-bl-2xl tracking-widest shadow-md">
                  MODELO DE SUSCRIPCIÓN INDEPENDIENTE
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-mono font-black text-[#D9A9FF] bg-[#D9A9FF]/15 border border-[#D9A9FF]/30 px-3 py-1 rounded-full uppercase inline-block">
                    SUSCRIPCIÓN POR PROFESOR
                  </span>
                  <h4 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
                    SUSCRIPCIÓN MENSUAL POR PROFESOR
                  </h4>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    Acceso completo al programa intensivo de 4 semanas, material descargable, evaluaciones personalizadas y clases en vivo del instructor seleccionado.
                  </p>
                  <div className="flex items-baseline gap-2 pt-2">
                    <span className="text-4xl font-serif-elegant font-black text-[#D9A9FF]">$15.00</span>
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase">USD / mes por instructor</span>
                  </div>
                </div>

                <div className="h-[1px] bg-white/10" />

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-200">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#D9A9FF] shrink-0 mt-0.5" />
                    <span>Programa Intensivo de 4 Semanas HD</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#D9A9FF] shrink-0 mt-0.5" />
                    <span>Feedback en Video del Instructor</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#D9A9FF] shrink-0 mt-0.5" />
                    <span>Acceso a Live Battles & Q&A</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#D9A9FF] shrink-0 mt-0.5" />
                    <span>Cancelación en cualquier momento</span>
                  </li>
                </ul>

                <button
                  onClick={() => {
                    playChime('click');
                    setSelectedPlan('monthly');
                    setIsCheckingOut(true);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#D9A9FF] via-[#f7d978] to-[#D9A9FF] hover:opacity-95 text-black font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#D9A9FF]/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4 text-black" />
                  ACTIVAR SUSCRIPCIÓN ({currentUser.monthlyPrice || '$35 USD / MES'})
                </button>
              </div>

              {/* Safe Secure Badge */}
              <div className="flex items-center justify-center gap-3 py-4 border border-white/5 bg-white/[0.01] rounded-2xl max-w-xl mx-auto">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-[10px] font-mono font-bold text-[#8A8A8A] uppercase tracking-wide">
                  {language === 'es' 
                    ? 'PASARELA DE PAGO ENCRIPTADA SSL INTEGRADA Y SEGURA' 
                    : 'INTEGRATED SSL ENCRYPTED SECURE PAYMENT GATEWAY'}
                </p>
              </div>

              {/* Checkout Modal / Sidebar Overlay */}
              <AnimatePresence>
                {isCheckingOut && selectedPlan && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-[#0F0F13] border-2 border-[#D9A9FF]/30 rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-[0_20px_50px_rgba(217, 169, 255,0.1)] space-y-6"
                    >
                      <button
                        onClick={() => {
                          playChime('click');
                          setIsCheckingOut(false);
                          setSelectedPlan(null);
                        }}
                        className="absolute top-4 right-4 text-[#8A8A8A] hover:text-white transition-all p-1"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      {checkoutSuccess ? (
                        <div className="py-8 text-center space-y-4">
                          <div className="w-16 h-16 bg-[#D9A9FF]/10 border-2 border-[#D9A9FF] rounded-full flex items-center justify-center mx-auto text-[#D9A9FF] shadow-xl animate-bounce">
                            <ShieldCheck className="w-8 h-8" />
                          </div>
                          <h4 className="text-lg font-serif-elegant font-black text-white uppercase tracking-tight">
                            {language === 'es' ? '¡SUSCRIPCIÓN EXITOSA!' : 'SUBSCRIPTION SUCCESSFUL!'}
                          </h4>
                          <p className="text-xs text-[#8A8A8A] font-semibold">
                            {language === 'es' 
                              ? 'Tu perfil ha sido actualizado con estatus Destacado de forma instantánea.' 
                              : 'Your profile has been successfully updated with Featured status.'}
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                          <div className="text-center space-y-2">
                            <span className="text-[9px] font-mono bg-[#D9A9FF]/15 text-[#D9A9FF] border border-[#D9A9FF]/20 px-2.5 py-0.5 rounded uppercase">
                              {language === 'es' ? 'MÉTODO DE PAGO SEGURO' : 'SECURE PAYMENT METHOD'}
                            </span>
                            <h3 className="text-lg font-serif-elegant font-black text-white uppercase tracking-tight">
                              {language === 'es' ? 'CONFIRMAR SUSCRIPCIÓN' : 'CONFIRM SUBSCRIPTION'}
                            </h3>
                            <p className="text-xs text-[#8A8A8A] font-bold">
                              {selectedPlan === 'annual' 
                                ? (language === 'es' ? 'PLAN ANUAL DE ORO ($120 USD/año)' : 'ANNUAL GOLD PLAN ($120 USD/year)')
                                : selectedPlan === 'semi-annual'
                                  ? (language === 'es' ? 'PLAN SEMESTRAL PRO ($75 USD/6 meses)' : 'SEMI-ANNUAL PRO PLAN ($75 USD/6 months)')
                                  : (language === 'es' ? `PLAN MENSUAL (${currentUser.monthlyPrice || '$35 USD/mes'})` : `MONTHLY PLAN (${currentUser.monthlyPrice || '$35 USD/mo'})`)
                              }
                            </p>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-[9px] font-mono text-[#8A8A8A] font-bold uppercase mb-1">
                                {language === 'es' ? 'Nombre en la Tarjeta' : 'Name on Card'}
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="BRANDO HERMOSO"
                                value={checkoutCardName}
                                onChange={e => setCheckoutCardName(e.target.value.toUpperCase())}
                                className="w-full px-4 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#D9A9FF] transition-all"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-mono text-[#8A8A8A] font-bold uppercase mb-1">
                                {language === 'es' ? 'Número de Tarjeta' : 'Card Number'}
                              </label>
                              <input
                                type="text"
                                required
                                maxLength={19}
                                placeholder="•••• •••• •••• ••••"
                                value={checkoutCardNumber}
                                onChange={e => {
                                  // Format card input
                                  const val = e.target.value.replace(/\D/g, '');
                                  const matches = val.match(/\d{4,16}/g);
                                  const match = (matches && matches[0]) || '';
                                  const parts = [];
                                  for (let i = 0, len = match.length; i < len; i += 4) {
                                    parts.push(match.substring(i, i + 4));
                                  }
                                  if (parts.length > 0) {
                                    setCheckoutCardNumber(parts.join(' '));
                                  } else {
                                    setCheckoutCardNumber(val);
                                  }
                                }}
                                className="w-full px-4 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#D9A9FF] transition-all"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[9px] font-mono text-[#8A8A8A] font-bold uppercase mb-1">
                                  {language === 'es' ? 'Expira' : 'Expiry'}
                                </label>
                                <input
                                  type="text"
                                  required
                                  placeholder="MM/AA"
                                  maxLength={5}
                                  value={checkoutCardExpiry}
                                  onChange={e => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    if (val.length >= 2) {
                                      setCheckoutCardExpiry(val.substring(0, 2) + '/' + val.substring(2, 4));
                                    } else {
                                      setCheckoutCardExpiry(val);
                                    }
                                  }}
                                  className="w-full px-4 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#D9A9FF] transition-all"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-mono text-[#8A8A8A] font-bold uppercase mb-1">
                                  CVC
                                </label>
                                <input
                                  type="password"
                                  required
                                  maxLength={3}
                                  placeholder="•••"
                                  value={checkoutCardCVC}
                                  onChange={e => setCheckoutCardCVC(e.target.value.replace(/\D/g, ''))}
                                  className="w-full px-4 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#D9A9FF] transition-all"
                                />
                              </div>
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={checkoutLoading}
                            className="w-full mt-4 py-3 bg-[#D9A9FF] hover:bg-[#F2CFFF] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
                          >
                            {checkoutLoading ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                {language === 'es' ? 'PROCESANDO PAGO...' : 'PROCESSING PAYMENT...'}
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4" />
                                {language === 'es' ? 'PROCESAR PAGO SEGURO' : 'PROCESS SECURE PAYMENT'}
                              </>
                            )}
                          </button>
                        </form>
                      )}
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

            </motion.div>
          )}

          {activeSubTab === 'soundcloud' && (
            <motion.div
              key="playlists-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <InstructorPlaylistsManager currentUser={currentUser} language={language} />

              {/* SoundCloud Fallback Sync Option */}
              <div className="bg-[#121212]/80 border border-white/10 p-6 rounded-3xl shadow-xl space-y-4">
                <div className="flex items-center gap-3 border-b border-[#262626] pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#C23E9E]/20 border border-[#C23E9E] flex items-center justify-center text-[#D9A9FF]">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold uppercase text-white tracking-wider flex items-center gap-2">
                      Sincronizador Opcional de SoundCloud - Perfil del Profesor
                    </h3>
                    <p className="text-xs font-mono text-[#8A8A8A]">
                      Enlace alternativo directo a SoundCloud: https://soundcloud.com/user-615971162
                    </p>
                  </div>
                </div>
                <SoundCloudPlayer playlistUrl="https://soundcloud.com/user-615971162" title="Perfil de SoundCloud del Profesor" />
              </div>
            </motion.div>
          )}

          {activeSubTab === 'podcasts' && (
            <motion.div
              key="podcasts-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Header Card */}
              <div className="bg-[#121226] border-2 border-[#D9A9FF]/40 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D9A9FF]/20 border border-[#D9A9FF]/50 text-[#D9A9FF] text-xs font-mono font-bold uppercase">
                    <Radio className="w-4 h-4 animate-pulse" />
                    GESTIÓN DE AUDIO CÁTEDRA & PODCASTS
                  </div>
                  <h3 className="text-2xl font-black text-white font-mono uppercase">
                    Tus Programas de Podcast & Episodios
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Publica audio episodios técnicos, entrevistas y teoría de waacking. <strong className="text-[#D9A9FF]">Los podcasts se incluyen automáticamente dentro de la suscripción mensual de tu cátedra.</strong> No hay precios independientes.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedPodcastForEdit(null);
                    setPodcastModalMode('create_show');
                    setIsPodcastModalOpen(true);
                  }}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#D9A9FF] to-[#f3d775] text-black font-mono text-xs font-black uppercase tracking-wider shadow-lg hover:brightness-110 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                  + Crear Podcast (Show)
                </button>
              </div>

              {/* List of Shows */}
              <div className="space-y-6">
                {instructorPodcasts.map(pod => (
                  <div
                    key={pod.id}
                    className="bg-[#101224] border border-white/10 rounded-3xl p-6 space-y-6 shadow-xl"
                  >
                    {/* Show Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-5">
                      <div className="flex items-center gap-4">
                        <img
                          src={pod.coverImage}
                          alt={pod.title}
                          className="w-20 h-20 rounded-2xl object-cover border border-[#D9A9FF]"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#D9A9FF]/20 text-[#D9A9FF] text-[10px] font-mono font-bold uppercase">
                              {pod.category || 'Podcast Cátedra'}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                              pod.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800 text-gray-400'
                            }`}>
                              {pod.status === 'active' ? 'Activo' : 'Archivado'}
                            </span>
                          </div>
                          <h4 className="text-lg font-black text-white font-mono uppercase mt-1">
                            {pod.title}
                          </h4>
                          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                            {pod.description}
                          </p>
                        </div>
                      </div>

                      {/* Show Action Buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => {
                            setSelectedPodcastForEdit(pod);
                            setPodcastModalMode('add_episode');
                            setIsPodcastModalOpen(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-[#D9A9FF] hover:bg-[#B478F0] text-black font-mono text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Plus className="w-4 h-4" /> + Agregar Episodio
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPodcastForEdit(pod);
                            setPodcastModalMode('create_show');
                            setIsPodcastModalOpen(true);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Editar Show
                        </button>
                        <button
                          onClick={() => handleDeletePodcast(pod.id)}
                          className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 border border-red-500/30 transition-all cursor-pointer"
                          title="Eliminar Podcast"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Episodes Table / List */}
                    <div className="space-y-3">
                      <h5 className="text-xs font-mono font-bold uppercase text-gray-300 tracking-wider flex items-center justify-between">
                        <span>Episodios Publicados ({(pod.episodes || []).length})</span>
                        <span className="text-[10px] text-gray-500 font-normal">Acceso exclusivo para tus suscriptores</span>
                      </h5>

                      {(pod.episodes || []).length === 0 ? (
                        <div className="p-6 text-center rounded-2xl bg-white/5 border border-dashed border-white/10 text-xs text-gray-400">
                          Aún no has subido episodios a este podcast. ¡Haz clic en "+ Agregar Episodio" para publicar tu primera cátedra!
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {(pod.episodes || []).map(ep => (
                            <div
                              key={ep.id}
                              className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-4"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-[#D9A9FF]/20 border border-[#D9A9FF]/40 flex items-center justify-center text-[#D9A9FF] shrink-0">
                                  <Radio className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
                                    {ep.episodeNumber && <span>Episodio {ep.episodeNumber}</span>}
                                    <span>•</span>
                                    <span>{ep.duration}</span>
                                    <span>•</span>
                                    <span>{ep.publishDate}</span>
                                    <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold ${
                                      ep.status === 'published' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                                    }`}>
                                      {ep.status === 'published' ? 'Publicado' : 'Borrador'}
                                    </span>
                                  </div>
                                  <h6 className="font-bold text-xs text-white truncate mt-0.5">
                                    {ep.title}
                                  </h6>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-[10px] font-mono text-gray-400 hidden sm:inline">
                                  {ep.playsCount || 0} reproducciones
                                </span>
                                <button
                                  onClick={() => handleDeleteEpisode(pod.id, ep.id)}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-red-950/60 text-gray-400 hover:text-red-400 transition-all cursor-pointer"
                                  title="Eliminar Episodio"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </motion.div>
          )}

          {activeSubTab === 'workspace_classroom' && (
            <motion.div
              key="classroom-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <ClassroomView currentUser={currentUser} language={language} lessons={lessons} />
            </motion.div>
          )}

          {activeSubTab === 'workspace_tasks' && (
            <motion.div
              key="tasks-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <TasksView currentUser={currentUser} language={language} lessons={lessons} />
            </motion.div>
          )}

          {activeSubTab === 'workspace_gmail' && (
            <motion.div
              key="gmail-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="py-4"
            >
              <GmailWidget isOpen={true} onClose={() => setActiveSubTab('dashboard')} />
            </motion.div>
          )}

          {activeSubTab === 'workspace_drive' && (
            <motion.div
              key="drive-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="py-4"
            >
              <GooglePickerModal 
                isOpen={true} 
                onClose={() => setActiveSubTab('dashboard')} 
                onSelectFile={(file) => {
                  setAlertText(`Archivo seleccionado: ${file.name}`);
                  setTimeout(() => setAlertText(null), 4000);
                }} 
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Modal / Drawer: Training Plan Viewer ("Pestaña de Plan de Entrenamiento") */}
        <AnimatePresence>
          {selectedInstructorPlan && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-[#120f20] border border-pink-500/30 rounded-[32px] p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl text-white relative"
              >
                {/* Close button */}
                <button
                  onClick={() => {
                    playChime('click');
                    setSelectedInstructorPlan(null);
                  }}
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-4 border-b border-white/10 pb-5">
                  <img
                    src={selectedInstructorPlan.avatar}
                    alt={selectedInstructorPlan.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-pink-500 shadow-lg"
                  />
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase bg-pink-500/20 text-pink-300 px-2.5 py-0.5 rounded-full border border-pink-500/30">
                      Pestaña de Plan de Entrenamiento
                    </span>
                    <h3 className="text-xl font-black text-white mt-1">{selectedInstructorPlan.name}</h3>
                    <p className="text-xs font-mono text-pink-400 font-bold">{selectedInstructorPlan.aka} • {selectedInstructorPlan.ig}</p>
                  </div>
                </div>

                {/* Bio & Overview */}
                <div className="bg-[#17122e]/80 p-4 rounded-2xl border border-white/5 text-xs text-slate-300 space-y-2">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Filosofía & Enfoque:</span>
                  <p className="leading-relaxed">{selectedInstructorPlan.bio}</p>
                </div>

                {/* Weeks Breakdown */}
                <div className="space-y-4">
                  <h4 className="text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Temario y Progreso Semana a Semana
                  </h4>

                  <div className="space-y-3">
                    {selectedInstructorPlan.weeks?.map((wk: any, i: number) => (
                      <div key={i} className="p-4 rounded-2xl bg-[#17122e] border border-white/10 space-y-2 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black font-mono text-pink-400 uppercase">
                            Semana {wk.week}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {wk.duration}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-white">{wk.title}</h5>
                        <p className="text-xs text-slate-300 leading-snug">{wk.desc}</p>
                        <div className="pt-1">
                          <span className="text-[9px] font-mono uppercase bg-white/5 px-2 py-0.5 rounded text-amber-300 border border-white/5">
                            Focus: {wk.focus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs font-mono text-slate-400">
                    <span>Acceso ilimitado a todas las clases del plan.</span>
                  </div>
                  <button
                    onClick={() => handleJoinTrainingPlan(selectedInstructorPlan.name)}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Unirse a Clase / Inscribirse Ahora
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Lightbox Modal for Instructor Portfolio */}
        <AnimatePresence>
          {instructorLightboxPhoto && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative max-w-3xl w-full max-h-[85vh] bg-[#121212] border border-white/20 rounded-2xl overflow-hidden p-3 flex flex-col items-center"
              >
                <button
                  type="button"
                  onClick={() => setInstructorLightboxPhoto(null)}
                  className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
                <img src={instructorLightboxPhoto} alt="Portfolio Preview" className="max-h-[70vh] w-auto object-contain rounded-xl" />
                <div className="p-3 flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleSetPortfolioAsInstructorAvatar(instructorLightboxPhoto);
                      setInstructorLightboxPhoto(null);
                    }}
                    className="px-4 py-2 bg-[#D9A9FF] text-black text-xs font-mono font-bold uppercase rounded-xl hover:bg-[#E4B8FF] transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>Establecer como Foto de Perfil</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* Podcast Uploader / Manager Modal */}
        <PodcastUploaderModal
          isOpen={isPodcastModalOpen}
          onClose={() => setIsPodcastModalOpen(false)}
          currentUser={currentUser}
          existingPodcast={selectedPodcastForEdit}
          mode={podcastModalMode}
          onSavePodcast={handleSavePodcast}
          onAddEpisode={handleAddEpisodeToPodcast}
        />

        {/* Onboarding Questionnaire Modal */}
        <OnboardingQuestionnaireModal
          currentUser={currentUser}
          isOpen={showQuestionnaireModal}
          onClose={() => setShowQuestionnaireModal(false)}
          onPlanGenerated={(answers, planMarkdown) => {
            const newStudentId = `st-${Date.now()}`;
            const newStudentName = answers.studentName || 'Nuevo Alumno';
            const updatedMap = {
              ...studentPlansMap,
              [newStudentId]: planMarkdown
            };
            setStudentPlansMap(updatedMap);
            localStorage.setItem('waack_student_plans_map', JSON.stringify(updatedMap));

            // Also add to student list if not exists
            setStudents(prev => [
              {
                id: newStudentId,
                name: newStudentName,
                level: 'Iniciación',
                lastActive: 'Hace un momento',
                email: `${(newStudentName || 'estudiante').toLowerCase().replace(/\s+/g, '.')}@waack.on`
              },
              ...prev
            ]);

            setSelectedStudentPlan({
              student: {
                id: newStudentId,
                name: newStudentName,
                level: 'Iniciación',
                lastActive: 'Hace un momento',
                email: `${(newStudentName || 'estudiante').toLowerCase().replace(/\s+/g, '.')}@waack.on`
              },
              planMarkdown
            });

            playChime('success');
            setAlertText('¡Plan de Entrenamiento de Onboarding generado exitosamente por la IA pedagógica!');
            setTimeout(() => setAlertText(null), 4000);
          }}
        />

        {/* Integrated Google Workspace Modal Tool */}
        <AnimatePresence>
          {activeWorkspaceModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-[#120f20] border border-sky-500/30 rounded-[32px] p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl text-white relative"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[10px] font-mono font-bold uppercase">
                      INTEGRACIÓN CÁTEDRA
                    </span>
                    <h3 className="text-base font-bold text-white uppercase font-mono">
                      {activeWorkspaceModal === 'classroom' && 'Google Classroom Sync'}
                      {activeWorkspaceModal === 'tasks' && 'Google Tasks (Pauta de Trabajo)'}
                      {activeWorkspaceModal === 'gmail' && 'Gmail Cátedra (Comunicados)'}
                      {activeWorkspaceModal === 'drive' && 'Drive Picker (Materiales Exclusivos)'}
                      {activeWorkspaceModal === 'slides' && 'Google Slides (Presentaciones)'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveWorkspaceModal(null)}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {activeWorkspaceModal === 'classroom' && (
                  <ClassroomView currentUser={currentUser} language={language} lessons={lessons} />
                )}
                {activeWorkspaceModal === 'tasks' && (
                  <TasksView currentUser={currentUser} language={language} lessons={lessons} />
                )}
                {activeWorkspaceModal === 'gmail' && (
                  <GmailWidget isOpen={true} onClose={() => setActiveWorkspaceModal(null)} />
                )}
                {activeWorkspaceModal === 'drive' && (
                  <GooglePickerModal 
                    isOpen={true} 
                    onClose={() => setActiveWorkspaceModal(null)} 
                    onSelectFile={(file) => {
                      setAlertText(`Archivo seleccionado: ${file.name}`);
                      setTimeout(() => setAlertText(null), 4000);
                      setActiveWorkspaceModal(null);
                    }} 
                  />
                )}
                {activeWorkspaceModal === 'slides' && (
                  <GoogleSlidesView currentUser={currentUser} language={language} onClose={() => setActiveWorkspaceModal(null)} />
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  </div>
);
}
