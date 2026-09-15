import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  Calendar,
  Users,
  Video,
  FileText,
  Upload,
  Music,
  MessageSquare,
  Sparkles,
  Search,
  ChevronDown,
  Gauge,
  DollarSign,
  Share2,
  BookOpen,
  Eye,
  CheckCircle2,
  ExternalLink,
  Plus
} from 'lucide-react';
import { User } from '../../types';
import { Language } from '../../lib/translations';

interface InstructorQuickActionsProps {
  currentUser: User;
  theme: 'dark' | 'light';
  language: Language;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenDocsModal?: () => void;
  onOpenFormationPreview?: () => void;
  onOpenSomaticPosingPrototype?: () => void;
  onQuickBpmSelect?: (bpm: number) => void;
}

interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: 'teaching' | 'students' | 'materials' | 'management';
  action: () => void;
  badge?: string;
  shortcut?: string;
  colorClass: string;
  iconTooltip?: string;
}

export const InstructorQuickActions: React.FC<InstructorQuickActionsProps> = ({
  currentUser,
  theme,
  language,
  activeTab,
  setActiveTab,
  onOpenDocsModal,
  onOpenFormationPreview,
  onOpenSomaticPosingPrototype,
  onQuickBpmSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'teaching' | 'students' | 'materials' | 'management'>('all');
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close menu on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const t = {
    quickActions: language === 'es' ? 'Acciones Rápidas' : language === 'ja' ? 'クイック操作' : language === 'ko' ? '빠른 작업' : 'Quick Actions',
    instructorBadge: language === 'es' ? 'DOCENTE' : language === 'ja' ? '講師' : language === 'ko' ? '강사' : 'INSTRUCTOR',
    searchPlaceholder: language === 'es' ? 'Buscar herramientas y accesos directos...' : language === 'ja' ? 'ツールやショートカットを検索...' : language === 'ko' ? '도구 및 바로가기 검색...' : 'Search instructor tools & shortcuts...',
    categories: {
      all: language === 'es' ? 'Todos' : language === 'ja' ? 'すべて' : language === 'ko' ? '전체' : 'All',
      teaching: language === 'es' ? 'Docencia & Clases' : language === 'ja' ? 'レッスン・指導' : language === 'ko' ? '수업 및 교육' : 'Teaching & Live',
      students: language === 'es' ? 'Alumnas & Feedback' : language === 'ja' ? '生徒・フィードバック' : language === 'ko' ? '학생 및 피드백' : 'Students & Review',
      materials: language === 'es' ? 'Materiales & Docs' : language === 'ja' ? '教材・ドキュメント' : language === 'ko' ? '자료 및 문서' : 'Materials & Docs',
      management: language === 'es' ? 'Estudio & Finanzas' : language === 'ja' ? 'スタジオ・財務' : language === 'ko' ? '스튜디오 및 재정' : 'Studio & Business'
    },
    categoryTooltips: {
      all: language === 'es' ? 'Ver todas las 14 herramientas' : language === 'ja' ? '全14ツールを表示' : language === 'ko' ? '모든 14개 도구 표시' : 'View all 14 tools',
      teaching: language === 'es' ? 'Clases en vivo, BPM y posing somático' : language === 'ja' ? 'ライブレッスン、BPM、身体ポージング' : language === 'ko' ? '라이브 수업, BPM 및 신체 포징' : 'Live classes, BPM & somatic posing',
      students: language === 'es' ? 'Alumnas, corrección y mensajes directos' : language === 'ja' ? '生徒名簿、動画添削、個別DM' : language === 'ko' ? '학생 명단, 비디오 첨삭 및 1:1 메시지' : 'Students, video review & direct chat',
      materials: language === 'es' ? 'Publicación, Google Docs, música y formaciones' : language === 'ja' ? '投稿、Docs、音楽、ステージ隊形' : language === 'ko' ? '게시, Google 문서, 음악 및 무대 대형' : 'Uploads, Google Docs, music & formations',
      management: language === 'es' ? 'Finanzas, comunicados masivos y syllabus' : language === 'ja' ? '報酬収益、公式通知、指導シラバス' : language === 'ko' ? '재정 정산, 공식 공지 및 실라버스' : 'Finances, broadcasts & syllabus'
    },
    quickPills: {
      newClass: language === 'es' ? '+ Clase' : language === 'ja' ? '+ レッスン' : language === 'ko' ? '+ 수업' : '+ Class',
      students: language === 'es' ? 'Alumnas' : language === 'ja' ? '生徒一覧' : language === 'ko' ? '학생 명단' : 'Students',
      bpmLab: language === 'es' ? 'Metrónomo' : language === 'ja' ? 'BPM' : language === 'ko' ? '메트로놈' : 'Metronome',
      publish: language === 'es' ? 'Publicar' : language === 'ja' ? '投稿' : language === 'ko' ? '게시' : 'Publish'
    },
    tooltips: {
      newClass: language === 'es' ? 'Programar Nueva Clase o Masterclass' : language === 'ja' ? '新規レッスン / 特別講義を予約' : language === 'ko' ? '새 수업 또는 마스터클래스 예약' : 'Schedule New Class or Masterclass',
      students: language === 'es' ? 'Roster de Alumnas & Asistencia' : language === 'ja' ? '生徒名簿 & 出席管理' : language === 'ko' ? '학생 명단 & 출석 관리' : 'Student Roster & Attendance Tracking',
      publish: language === 'es' ? 'Publicar Lección o Video Drill' : language === 'ja' ? '新規レッスン動画 / ドリルを投稿' : language === 'ko' ? '새 레슨 비디오 / 드릴 게시' : 'Publish New Video Lesson or Drill',
      quickActionsHub: language === 'es' ? 'Centro de Acciones Rápidas' : language === 'ja' ? 'クイック操作センター' : language === 'ko' ? '빠른 작업 센터' : 'Quick Actions Hub'
    },
    hubLogoTooltip: language === 'es' ? 'Centro de Comando Docente Waack On' : language === 'ja' ? 'Waack On 講師コマンドハブ' : language === 'ko' ? 'Waack On 강사 커맨드 허브' : 'Waack On Instructor Command Hub',
    searchTooltip: language === 'es' ? 'Búsqueda rápida por nombre o categoría' : language === 'ja' ? 'ツール名またはカテゴリで検索' : language === 'ko' ? '도구 이름 또는 카테고리로 검색' : 'Quick search by tool name or category',
    launchTool: language === 'es' ? 'Ejecutar acción' : language === 'ja' ? 'ツールを実行' : language === 'ko' ? '도구 실행' : 'Launch action'
  };

  const actionItems: QuickActionItem[] = [
    // --- Teaching & Classes ---
    {
      id: 'schedule_class',
      title: language === 'es' ? 'Programar Nueva Clase / Masterclass' : language === 'ja' ? '新規レッスン / 特別講義を予約' : language === 'ko' ? '새 수업 / 마스터클래스 예약' : 'Schedule New Class / Masterclass',
      description: language === 'es' ? 'Configurar horarios, fecha, link de Google Meet y cupos.' : language === 'ja' ? '日時、Google Meetリンク、定員を設定します。' : language === 'ko' ? '일정, 구글 미트 링크 및 정원 설정.' : 'Set time, Google Meet link, and student slots.',
      icon: Calendar,
      category: 'teaching',
      badge: language === 'es' ? 'En Vivo' : 'Live',
      colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      iconTooltip: language === 'es' ? 'Clases & Meet' : language === 'ja' ? 'レッスン & Meet' : language === 'ko' ? '수업 & Meet' : 'Classes & Meet',
      action: () => {
        setActiveTab('instructor_classes');
        setIsOpen(false);
      }
    },
    {
      id: 'live_room',
      title: language === 'es' ? 'Iniciar Sala de Transmisión Live' : language === 'ja' ? 'ライブ配信ルームを開始' : language === 'ko' ? '라이브 방송 룸 시작' : 'Launch Live Broadcast Room',
      description: language === 'es' ? 'Abrir escenario interactivo con webcam, audio y chat en vivo.' : language === 'ja' ? 'Webカメラ、音声、ライブチャット付きのスタジオを開きます。' : language === 'ko' ? '웹캠, 오디오 및 라이브 채팅이 있는 스튜디오 열기.' : 'Open interactive live studio with webcam and live chat.',
      icon: Video,
      category: 'teaching',
      badge: 'Meet / Live',
      colorClass: 'text-red-400 bg-red-500/10 border-red-500/20',
      iconTooltip: language === 'es' ? 'Sala Live Stream' : language === 'ja' ? 'ライブ配信' : language === 'ko' ? '라이브 방송' : 'Live Broadcast',
      action: () => {
        setActiveTab('live');
        setIsOpen(false);
      }
    },
    {
      id: 'metronome_lab',
      title: language === 'es' ? 'Sala de Ritmo & BPM Metrónomo' : language === 'ja' ? 'リズムラボ & BPMメトロノーム' : language === 'ko' ? '리듬 랩 & BPM 메트로놈' : 'Rhythm Lab & Metronome Control',
      description: language === 'es' ? 'Drills técnicos, aceleración gradual y control de compás.' : language === 'ja' ? 'テクニカルドリル、テンポ調整、拍子コントロール。' : language === 'ko' ? '테크니컬 드릴, 템포 조절 및 비트 컨트롤.' : 'Technical drills, progressive tempo control, and beats.',
      icon: Gauge,
      category: 'teaching',
      badge: '128 BPM',
      colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      iconTooltip: language === 'es' ? 'Ritmo & Metrónomo' : language === 'ja' ? 'リズム & BPM' : language === 'ko' ? '리듬 & BPM' : 'Rhythm & Metronome',
      action: () => {
        if (onQuickBpmSelect) onQuickBpmSelect(128);
        setActiveTab('entrenamiento');
        setIsOpen(false);
      }
    },
    {
      id: 'somatic_posing',
      title: language === 'es' ? 'Guía Somática & Prototipo de Posing' : language === 'ja' ? '身体感覚ポージング・プロトタイプ' : language === 'ko' ? '소매틱 포징 & 신체 자세 프로토타입' : 'Somatic Posing & Biomechanics Prototype',
      description: language === 'es' ? 'Líneas corporales, ejes articulares y proyección escénica.' : language === 'ja' ? '体のライン、関節の軸、ステージ表現の確認。' : language === 'ko' ? '바디 라인, 관절 축 및 무대 표현 확인.' : 'Body alignment, articulation axes, and stage presence.',
      icon: Sparkles,
      category: 'teaching',
      badge: '3D / Guía',
      colorClass: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      iconTooltip: language === 'es' ? 'Posing Somático 3D' : language === 'ja' ? '3Dポージング' : language === 'ko' ? '소매틱 3D 포징' : '3D Somatic Posing',
      action: () => {
        if (onOpenSomaticPosingPrototype) onOpenSomaticPosingPrototype();
        setIsOpen(false);
      }
    },

    // --- Students & Review ---
    {
      id: 'student_roster',
      title: language === 'es' ? 'Roster de Alumnas & Control de Asistencia' : language === 'ja' ? '生徒名簿 & 出席管理' : language === 'ko' ? '학생 명단 & 출석 관리' : 'Student Roster & Attendance Tracking',
      description: language === 'es' ? 'Ver niveles, historial de práctica, membresías y asistencias.' : language === 'ja' ? 'レベル、練習履歴、会員ステータスを確認。' : language === 'ko' ? '레벨, 연습 기록, 회원 상태 확인.' : 'Review levels, practice logs, and class attendance.',
      icon: Users,
      category: 'students',
      colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      iconTooltip: language === 'es' ? 'Directorio Alumnas' : language === 'ja' ? '生徒名簿' : language === 'ko' ? '학생 명단' : 'Student Roster',
      action: () => {
        setActiveTab('instructor_students');
        setIsOpen(false);
      }
    },
    {
      id: 'video_corrections',
      title: language === 'es' ? 'Corrección de Videos y Devoluciones' : language === 'ja' ? '動画添削・個別フィードバック' : language === 'ko' ? '비디오 첨삭 및 개별 피드백' : 'Video Corrections & Student Feedback',
      description: language === 'es' ? 'Evaluar ejecuciones, timemarking y notas técnicas.' : language === 'ja' ? '動画のチェック、タイムスタンプ付きの指導コメント。' : language === 'ko' ? '비디오 평가, 타임스탬프 피드백 및 기술 지도.' : 'Assess choreography submissions with timestamped notes.',
      icon: CheckCircle2,
      category: 'students',
      badge: language === 'es' ? 'Feedback' : 'Review',
      colorClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      iconTooltip: language === 'es' ? 'Corrección de Video' : language === 'ja' ? '動画添削' : language === 'ko' ? '비디오 첨삭' : 'Video Feedback',
      action: () => {
        setActiveTab('cursos');
        setIsOpen(false);
      }
    },
    {
      id: 'direct_messages',
      title: language === 'es' ? 'Mensajes Directos con Alumnas' : language === 'ja' ? '生徒とのダイレクトメッセージ' : language === 'ko' ? '학생과의 1:1 다이렉트 메시지' : 'Direct Messages with Students',
      description: language === 'es' ? 'Atención personalizada, dudas técnicas y tutoría privada.' : language === 'ja' ? '個別指導、質問対応、メンタリング。' : language === 'ko' ? '개별 상담, 기술 질문 및 멘토링.' : '1-on-1 chats, technique questions, and private mentoring.',
      icon: MessageSquare,
      category: 'students',
      colorClass: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
      iconTooltip: language === 'es' ? 'Chat 1 a 1' : language === 'ja' ? '1対1チャット' : language === 'ko' ? '1:1 채팅' : 'Direct Messages',
      action: () => {
        setActiveTab('mensajes');
        setIsOpen(false);
      }
    },

    // --- Materials & Docs ---
    {
      id: 'publish_lesson',
      title: language === 'es' ? 'Publicar Nueva Lección / Video Drill' : language === 'ja' ? '新規レッスン動画 / ドリルを投稿' : language === 'ko' ? '새 레슨 비디오 / 드릴 게시' : 'Publish New Video Lesson / Drill',
      description: language === 'es' ? 'Subir cápsulas formativas, tutoriales y combos.' : language === 'ja' ? '解説動画、チュートリアル、コンボをアップロード。' : language === 'ko' ? '교육 영상, 튜토리얼 및 콤보 업로드.' : 'Upload technique breakdowns, tutorials, and combos.',
      icon: Upload,
      category: 'materials',
      badge: language === 'es' ? 'Nuevo' : 'New',
      colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      iconTooltip: language === 'es' ? 'Subir Lección' : language === 'ja' ? '動画投稿' : language === 'ko' ? '레슨 업로드' : 'Upload Lesson',
      action: () => {
        setActiveTab('instructor_publish');
        setIsOpen(false);
      }
    },
    {
      id: 'pedagogical_docs',
      title: language === 'es' ? 'Planificación Curricular & Google Docs' : language === 'ja' ? 'カリキュラム計画 & Google Docs' : language === 'ko' ? '커리큘럼 계획 & Google Docs' : 'Curriculum Planning & Google Docs',
      description: language === 'es' ? 'Planes de estudio, guías pedagógicas y apuntes oficiales.' : language === 'ja' ? 'シラバス、指導ガイド、公式メモを開きます。' : language === 'ko' ? '실라버스, 교육 가이드 및 공식 노트.' : 'Manage syllabus, lesson outlines, and teaching documents.',
      icon: FileText,
      category: 'materials',
      badge: 'Google Drive',
      colorClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      iconTooltip: language === 'es' ? 'Currículum & Docs' : language === 'ja' ? 'カリキュラム & Docs' : language === 'ko' ? '커리큘럼 & Docs' : 'Curriculum & Docs',
      action: () => {
        if (onOpenDocsModal) onOpenDocsModal();
        else setActiveTab('instructor_documents');
        setIsOpen(false);
      }
    },
    {
      id: 'music_playlists',
      title: language === 'es' ? 'Playlists de Clase & Audio en Google Drive' : language === 'ja' ? 'レッスン用プレイリスト & Drive音源' : language === 'ko' ? '수업 플레이리스트 & Drive 오디오' : 'Class Playlists & Google Drive Audio',
      description: language === 'es' ? 'Organizar tracks por BPM, disco, funk y compartir con alumnas.' : language === 'ja' ? 'BPM順にトラックを整理、生徒と共有。' : language === 'ko' ? 'BPM별 트랙 정리 및 학생들과 공유.' : 'Organize disco/funk tracks by BPM and share with students.',
      icon: Music,
      category: 'materials',
      colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      iconTooltip: language === 'es' ? 'Playlists & Audio' : language === 'ja' ? '音源プレイリスト' : language === 'ko' ? '음원 플레이리스트' : 'Playlists & Audio',
      action: () => {
        setActiveTab('musica');
        setIsOpen(false);
      }
    },
    {
      id: 'spatial_formations',
      title: language === 'es' ? 'Editor de Formaciones Espaciales' : language === 'ja' ? 'ステージ隊形・フォーメーション設計' : language === 'ko' ? '무대 대형 & 포메이션 시각화' : 'Stage Formations & Spatial Choreography',
      description: language === 'es' ? 'Diseñar transiciones grupales, planos y posiciones de escenario.' : language === 'ja' ? 'グループのフォーメーション移動を設計。' : language === 'ko' ? '그룹 대형 이동 및 무대 포지션 설계.' : 'Design group transitions, floor plans, and stage positions.',
      icon: Eye,
      category: 'materials',
      colorClass: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
      iconTooltip: language === 'es' ? 'Formaciones Escénicas' : language === 'ja' ? 'ステージ隊形' : language === 'ko' ? '무대 대형' : 'Stage Formations',
      action: () => {
        if (onOpenFormationPreview) onOpenFormationPreview();
        setIsOpen(false);
      }
    },

    // --- Studio & Management ---
    {
      id: 'finances',
      title: language === 'es' ? 'Balance de Honorarios & Finanzas' : language === 'ja' ? 'レッスン報酬・収益レポート' : language === 'ko' ? '강사 수익 & 정산 리포트' : 'Instructor Earnings & Financial Report',
      description: language === 'es' ? 'Ingresos por clases, suscripciones activas y liquidaciones.' : language === 'ja' ? '受講料収入、有効サブスクリプション数を確認。' : language === 'ko' ? '수업 수입 및 활성 구독 현황 확인.' : 'Track class revenue, active subscriptions, and payouts.',
      icon: DollarSign,
      category: 'management',
      colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      iconTooltip: language === 'es' ? 'Honorarios & Finanzas' : language === 'ja' ? '講師報酬 & 収益' : language === 'ko' ? '강사 수익 & 정산' : 'Earnings & Revenue',
      action: () => {
        setActiveTab('instructor_finances');
        setIsOpen(false);
      }
    },
    {
      id: 'announcements',
      title: language === 'es' ? 'Emitir Comunicado a la Comunidad' : language === 'ja' ? 'コミュニティへ公式お知らせを配信' : language === 'ko' ? '커뮤니티 공식 공지사항 발행' : 'Broadcast Announcement to Students',
      description: language === 'es' ? 'Avisar sobre talleres especiales, cambios de hora o novedades.' : language === 'ja' ? '特別ワークショップや連絡事項を一斉通知。' : language === 'ko' ? '특별 워크숍 및 주요 공지 전송.' : 'Notify all students of upcoming workshops and studio news.',
      icon: Share2,
      category: 'management',
      colorClass: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      iconTooltip: language === 'es' ? 'Comunicados Oficiales' : language === 'ja' ? '公式お知らせ' : language === 'ko' ? '공식 공지' : 'Broadcasts',
      action: () => {
        setActiveTab('anuncios');
        setIsOpen(false);
      }
    },
    {
      id: 'methodology',
      title: language === 'es' ? 'Metodología & Syllabus Oficial Waack On' : language === 'ja' ? 'Waack On 公式指導シラバス' : language === 'ko' ? 'Waack On 공식 교육 실라버스' : 'Waack On Official Teaching Syllabus',
      description: language === 'es' ? 'Fundamentos, biomecánica de brazos, musicalidad y evaluación.' : language === 'ja' ? 'アームスバイオメカニクス、音ハメ、評価基準。' : language === 'ko' ? '팔 동작 바이오메카닉스, 음악성 및 평가 기준.' : 'Fundamentals, arm biomechanics, musicality, and grading rubric.',
      icon: BookOpen,
      category: 'management',
      colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      iconTooltip: language === 'es' ? 'Syllabus Waack On' : language === 'ja' ? '指導シラバス' : language === 'ko' ? '교육 실라버스' : 'Teaching Syllabus',
      action: () => {
        setActiveTab('instructor_methodology');
        setIsOpen(false);
      }
    }
  ];

  // Filter actions by query & category
  const filteredActions = actionItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesQuery = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.badge && item.badge.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="relative flex items-center gap-1.5 shrink-0" ref={menuRef}>
      {/* Direct 1-Click Fast Action Pills on Desktop/Tablet with Hover Label Tooltips */}
      <div className="hidden 2xl:flex items-center gap-1">
        {/* + Clase pill */}
        <div className="relative group/pill">
          <button
            type="button"
            onClick={() => setActiveTab('instructor_classes')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold tracking-wider uppercase border transition-all cursor-pointer ${
              activeTab === 'instructor_classes'
                ? 'bg-[#D9A9FF] text-black border-[#D9A9FF] font-extrabold shadow-[0_0_10px_rgba(217, 169, 255,0.4)]'
                : theme === 'light'
                ? 'bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border-slate-200'
                : 'bg-[#141414] hover:bg-[#1f1a12] text-slate-300 hover:text-[#D9A9FF] border-[#2a2a2a] hover:border-[#D9A9FF]/40'
            }`}
            aria-label={t.tooltips.newClass}
          >
            <Calendar className="w-3 h-3 text-[#D9A9FF]" />
            <span>{t.quickPills.newClass}</span>
          </button>

          {/* Hover Label Tooltip */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 pointer-events-none opacity-0 group-hover/pill:opacity-100 transition-all duration-200 z-50 scale-95 group-hover/pill:scale-100 flex flex-col items-center">
            <div className={`w-2 h-2 rotate-45 -mb-1 border-t border-l ${
              theme === 'light' ? 'bg-slate-900 border-slate-700' : 'bg-[#18140B] border-[#D9A9FF]/40'
            }`} />
            <div className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono tracking-wide shadow-2xl border flex items-center gap-1.5 whitespace-nowrap ${
              theme === 'light'
                ? 'bg-slate-900 text-white border-slate-700 shadow-xl'
                : 'bg-[#18140B] text-[#EDEFF4] border-[#D9A9FF]/40 shadow-[0_8px_20px_rgba(0,0,0,0.8)]'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D9A9FF]" />
              <span className="font-bold">{t.tooltips.newClass}</span>
              <span className="px-1 py-0.2 rounded text-[8px] bg-[#D9A9FF]/20 text-[#D9A9FF] border border-[#D9A9FF]/30 font-bold uppercase">
                DOCENCIA
              </span>
            </div>
          </div>
        </div>

        {/* Alumnas pill */}
        <div className="relative group/pill">
          <button
            type="button"
            onClick={() => setActiveTab('instructor_students')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold tracking-wider uppercase border transition-all cursor-pointer ${
              activeTab === 'instructor_students'
                ? 'bg-[#D9A9FF] text-black border-[#D9A9FF] font-extrabold shadow-[0_0_10px_rgba(217, 169, 255,0.4)]'
                : theme === 'light'
                ? 'bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border-slate-200'
                : 'bg-[#141414] hover:bg-[#1f1a12] text-slate-300 hover:text-[#D9A9FF] border-[#2a2a2a] hover:border-[#D9A9FF]/40'
            }`}
            aria-label={t.tooltips.students}
          >
            <Users className="w-3 h-3 text-cyan-400" />
            <span>{t.quickPills.students}</span>
          </button>

          {/* Hover Label Tooltip */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 pointer-events-none opacity-0 group-hover/pill:opacity-100 transition-all duration-200 z-50 scale-95 group-hover/pill:scale-100 flex flex-col items-center">
            <div className={`w-2 h-2 rotate-45 -mb-1 border-t border-l ${
              theme === 'light' ? 'bg-slate-900 border-slate-700' : 'bg-[#18140B] border-[#D9A9FF]/40'
            }`} />
            <div className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono tracking-wide shadow-2xl border flex items-center gap-1.5 whitespace-nowrap ${
              theme === 'light'
                ? 'bg-slate-900 text-white border-slate-700 shadow-xl'
                : 'bg-[#18140B] text-[#EDEFF4] border-[#D9A9FF]/40 shadow-[0_8px_20px_rgba(0,0,0,0.8)]'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="font-bold">{t.tooltips.students}</span>
              <span className="px-1 py-0.2 rounded text-[8px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                ALUMNAS
              </span>
            </div>
          </div>
        </div>

        {/* Publicar pill */}
        <div className="relative group/pill">
          <button
            type="button"
            onClick={() => setActiveTab('instructor_publish')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold tracking-wider uppercase border transition-all cursor-pointer ${
              activeTab === 'instructor_publish'
                ? 'bg-[#D9A9FF] text-black border-[#D9A9FF] font-extrabold shadow-[0_0_10px_rgba(217, 169, 255,0.4)]'
                : theme === 'light'
                ? 'bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border-slate-200'
                : 'bg-[#141414] hover:bg-[#1f1a12] text-slate-300 hover:text-[#D9A9FF] border-[#2a2a2a] hover:border-[#D9A9FF]/40'
            }`}
            aria-label={t.tooltips.publish}
          >
            <Upload className="w-3 h-3 text-amber-400" />
            <span>{t.quickPills.publish}</span>
          </button>

          {/* Hover Label Tooltip */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 pointer-events-none opacity-0 group-hover/pill:opacity-100 transition-all duration-200 z-50 scale-95 group-hover/pill:scale-100 flex flex-col items-center">
            <div className={`w-2 h-2 rotate-45 -mb-1 border-t border-l ${
              theme === 'light' ? 'bg-slate-900 border-slate-700' : 'bg-[#18140B] border-[#D9A9FF]/40'
            }`} />
            <div className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono tracking-wide shadow-2xl border flex items-center gap-1.5 whitespace-nowrap ${
              theme === 'light'
                ? 'bg-slate-900 text-white border-slate-700 shadow-xl'
                : 'bg-[#18140B] text-[#EDEFF4] border-[#D9A9FF]/40 shadow-[0_8px_20px_rgba(0,0,0,0.8)]'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="font-bold">{t.tooltips.publish}</span>
              <span className="px-1 py-0.2 rounded text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
                MATERIALES
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Persistent 'Quick Actions' Hub Trigger Button with Hover Label Tooltip */}
      <div className="relative group/mainbtn">
        <motion.button
          type="button"
          id="instructor-quick-actions-btn"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer shadow-md select-none ${
            isOpen
              ? 'bg-gradient-to-r from-[#D9A9FF] to-amber-500 text-black border-amber-300 shadow-[0_0_15px_rgba(217, 169, 255,0.5)]'
              : theme === 'light'
              ? 'bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-950 border-amber-300 shadow-sm'
              : 'bg-gradient-to-r from-[#1A160D] via-[#241D12] to-[#17130A] hover:from-[#2A2315] hover:to-[#221B0E] text-[#D9A9FF] border-[#D9A9FF]/50 hover:border-[#D9A9FF]'
          }`}
          aria-label={t.quickActions}
          aria-expanded={isOpen}
        >
          <div className="relative flex items-center justify-center">
            <Zap className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isOpen ? 'text-black fill-black' : 'text-[#D9A9FF] fill-[#D9A9FF]'}`} />
            <motion.span
              className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]"
              animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>

          <span className="hidden sm:inline font-extrabold">
            {t.quickActions}
          </span>
          <span className="sm:hidden font-extrabold">
            ⚡ {language === 'es' ? 'Acciones' : 'Quick'}
          </span>

          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-black' : 'text-[#D9A9FF]'}`} />
        </motion.button>

        {/* Hover Label Tooltip on Quick Actions Button */}
        {!isOpen && (
          <div className="absolute top-full right-0 sm:left-1/2 sm:-translate-x-1/2 mt-2 pointer-events-none opacity-0 group-hover/mainbtn:opacity-100 transition-all duration-200 z-50 scale-95 group-hover/mainbtn:scale-100 flex flex-col items-end sm:items-center">
            <div className={`w-2 h-2 rotate-45 -mb-1 mr-4 sm:mr-0 border-t border-l ${
              theme === 'light' ? 'bg-slate-900 border-slate-700' : 'bg-[#18140B] border-[#D9A9FF]/40'
            }`} />
            <div className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono tracking-wide shadow-2xl border flex items-center gap-2 whitespace-nowrap ${
              theme === 'light'
                ? 'bg-slate-900 text-white border-slate-700 shadow-xl'
                : 'bg-[#18140B] text-[#EDEFF4] border-[#D9A9FF]/40 shadow-[0_8px_20px_rgba(0,0,0,0.8)]'
            }`}>
              <Zap className="w-3 h-3 text-[#D9A9FF] fill-[#D9A9FF]" />
              <span className="font-bold">{t.tooltips.quickActionsHub}</span>
              <span className="px-1 py-0.2 rounded text-[8px] bg-white/10 text-[#D9A9FF] border border-white/10 font-bold uppercase">
                14 ACCIONES
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Popover Dropdown Command Hub */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`fixed sm:absolute top-16 sm:top-full right-2 sm:right-0 mt-1 w-[calc(100vw-16px)] sm:w-[480px] max-h-[85vh] sm:max-h-[580px] rounded-2xl border shadow-2xl z-50 flex flex-col overflow-hidden backdrop-blur-xl ${
              theme === 'light'
                ? 'bg-white/95 border-amber-200 text-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.15)]'
                : 'bg-[#0E0E0E]/95 border-[#2A2418] text-[#EDEFF4] shadow-[0_20px_50px_rgba(0,0,0,0.85)]'
            }`}
          >
            {/* Header / Brand of Quick Actions */}
            <div className={`p-3.5 border-b shrink-0 flex items-center justify-between ${
              theme === 'light' ? 'bg-amber-50/80 border-amber-200/80' : 'bg-[#15120C]/90 border-[#2A2418]'
            }`}>
              <div className="flex items-center gap-2.5">
                {/* Branding Icon with Tooltip */}
                <div className="relative group/hublogo shrink-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D9A9FF] to-amber-600 flex items-center justify-center text-black font-black shadow-md cursor-help">
                    <Zap className="w-4 h-4 fill-black" />
                  </div>
                  <div className="absolute left-0 top-full mt-1.5 pointer-events-none opacity-0 group-hover/hublogo:opacity-100 transition-all duration-150 z-30 scale-95 group-hover/hublogo:scale-100">
                    <div className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold tracking-wide whitespace-nowrap border shadow-lg ${
                      theme === 'light' ? 'bg-slate-900 text-white border-slate-700' : 'bg-[#18140B] text-[#D9A9FF] border-[#D9A9FF]/40'
                    }`}>
                      {t.hubLogoTooltip}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-mono font-black uppercase tracking-wider">
                      {t.quickActions}
                    </h3>
                    <span className="px-1.5 py-0.2 rounded-md bg-[#D9A9FF]/20 text-[#D9A9FF] text-[9px] font-mono font-bold uppercase border border-[#D9A9FF]/30">
                      {t.instructorBadge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans truncate">
                    {currentUser.name} • {currentUser.email || 'Instructor Principal'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                <span className="hidden sm:inline px-1.5 py-0.5 rounded bg-black/30 border border-white/10">ESC</span>
              </div>
            </div>

            {/* Live Search Input */}
            <div className={`p-2.5 border-b shrink-0 ${
              theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#121212] border-[#222222]'
            }`}>
              <div className="relative flex items-center">
                {/* Search Icon with Tooltip */}
                <div className="relative group/searchicon flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-auto cursor-help" />
                  <div className="absolute left-3 bottom-full mb-1.5 pointer-events-none opacity-0 group-hover/searchicon:opacity-100 transition-all duration-150 z-30 scale-95 group-hover/searchicon:scale-100">
                    <div className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold tracking-wide whitespace-nowrap border shadow-lg ${
                      theme === 'light' ? 'bg-slate-900 text-white border-slate-700' : 'bg-[#18140B] text-[#D9A9FF] border-[#D9A9FF]/40'
                    }`}>
                      {t.searchTooltip}
                    </div>
                  </div>
                </div>

                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className={`w-full pl-9 pr-3 py-1.5 rounded-xl text-xs font-sans border outline-none transition-all ${
                    theme === 'light'
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                      : 'bg-[#1A1A1A] border-[#333333] text-white focus:border-[#D9A9FF] focus:ring-1 focus:ring-[#D9A9FF]'
                  }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 text-[10px] text-slate-400 hover:text-white font-mono px-1 rounded bg-black/40"
                  >
                    CLEAR
                  </button>
                )}
              </div>

              {/* Category Pills Filter with Hover Tooltips */}
              <div className="flex items-center gap-1 mt-2 overflow-x-auto pb-0.5 scrollbar-none">
                {(['all', 'teaching', 'students', 'materials', 'management'] as const).map((cat) => (
                  <div key={cat} className="relative group/cat shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        activeCategory === cat
                          ? 'bg-[#D9A9FF] text-black font-extrabold shadow-sm'
                          : theme === 'light'
                          ? 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                          : 'bg-[#1E1E1E] text-slate-400 hover:text-white hover:bg-[#2A2A2A] border border-white/5'
                      }`}
                      aria-label={t.categoryTooltips[cat]}
                    >
                      {t.categories[cat]}
                    </button>
                    {/* Hover Label Tooltip */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 pointer-events-none opacity-0 group-hover/cat:opacity-100 transition-all duration-150 z-30 scale-95 group-hover/cat:scale-100 flex flex-col items-center">
                      <div className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold tracking-wide whitespace-nowrap border shadow-lg ${
                        theme === 'light' ? 'bg-slate-900 text-white border-slate-700' : 'bg-[#18140B] text-[#D9A9FF] border-[#D9A9FF]/40'
                      }`}>
                        {t.categoryTooltips[cat]}
                      </div>
                      <div className={`w-1.5 h-1.5 rotate-45 -mt-0.5 border-b border-r ${
                        theme === 'light' ? 'bg-slate-900 border-slate-700' : 'bg-[#18140B] border-[#D9A9FF]/40'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Cards List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[380px] scrollbar-thin scrollbar-thumb-white/10">
              {filteredActions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-mono">
                  {language === 'es' ? 'No se encontraron herramientas con esa búsqueda.' : 'No matching tools found.'}
                </div>
              ) : (
                filteredActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.id}
                      type="button"
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={action.action}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer group ${
                        theme === 'light'
                          ? 'bg-slate-50/80 hover:bg-amber-50/70 border-slate-200/80 hover:border-amber-300'
                          : 'bg-[#141414] hover:bg-[#1A1812] border-[#222222] hover:border-[#D9A9FF]/50'
                      }`}
                    >
                      {/* Icon container with dedicated Hover Label Tooltip */}
                      <div className="relative group/icon shrink-0">
                        <div className={`p-2 rounded-xl border shrink-0 transition-transform group-hover/icon:scale-110 group-hover:scale-105 cursor-help ${action.colorClass}`}>
                          <Icon className="w-4 h-4" />
                        </div>

                        {/* Hover Label Tooltip on Icon */}
                        <div className="absolute left-0 top-full mt-1.5 pointer-events-none opacity-0 group-hover/icon:opacity-100 transition-all duration-150 z-40 scale-95 group-hover/icon:scale-100 origin-top-left flex flex-col items-start">
                          <div className={`w-2 h-2 rotate-45 -mb-1 ml-3 border-t border-l ${
                            theme === 'light' ? 'bg-slate-950 border-slate-700' : 'bg-[#18140B] border-[#D9A9FF]/50'
                          }`} />
                          <div className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono tracking-wide shadow-2xl border flex items-center gap-1.5 whitespace-nowrap ${
                            theme === 'light'
                              ? 'bg-slate-950 text-white border-slate-700 shadow-slate-900/40'
                              : 'bg-[#18140B] text-[#EDEFF4] border-[#D9A9FF]/50 shadow-[0_8px_25px_rgba(0,0,0,0.85)]'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D9A9FF] shrink-0 animate-pulse" />
                            <span className="font-bold text-white">{action.iconTooltip || action.title}</span>
                            <span className="px-1 py-0.2 rounded text-[8px] font-mono uppercase tracking-wider bg-white/10 text-[#D9A9FF] border border-white/10 shrink-0">
                              {action.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={`text-xs font-mono font-black tracking-wide truncate group-hover:text-[#D9A9FF] transition-colors ${
                            theme === 'light' ? 'text-slate-900' : 'text-white'
                          }`}>
                            {action.title}
                          </h4>
                          {action.badge && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#D9A9FF]/15 text-[#D9A9FF] border border-[#D9A9FF]/30 shrink-0">
                              {action.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-sans mt-0.5 line-clamp-1 leading-snug">
                          {action.description}
                        </p>
                      </div>

                      {/* Launch action icon with tooltip */}
                      <div className="relative group/link self-center">
                        <div className="p-1 rounded-lg hover:bg-white/10 transition-colors text-[#D9A9FF] opacity-70 group-hover:opacity-100">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </div>
                        <div className="absolute right-0 bottom-full mb-1.5 pointer-events-none opacity-0 group-hover/link:opacity-100 transition-all duration-150 z-30 scale-95 group-hover/link:scale-100 origin-bottom-right">
                          <div className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold tracking-wide whitespace-nowrap border shadow-lg ${
                            theme === 'light'
                              ? 'bg-slate-900 text-white border-slate-700'
                              : 'bg-[#16120A] text-[#D9A9FF] border-[#D9A9FF]/40'
                          }`}>
                            {t.launchTool}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>

            {/* Quick Stats / Bottom Quick Access Bar */}
            <div className={`p-2.5 px-3 border-t shrink-0 flex items-center justify-between text-[10px] font-mono ${
              theme === 'light' ? 'bg-slate-100/90 border-slate-200 text-slate-600' : 'bg-[#0B0B0B] border-[#1F1F1F] text-slate-400'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Modo Docente Activo</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('instructor_classes');
                    setIsOpen(false);
                  }}
                  className="hover:text-[#D9A9FF] transition-colors underline decoration-dotted"
                >
                  Ver Todo el Panel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InstructorQuickActions;
