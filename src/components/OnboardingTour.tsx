import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Award, 
  LayoutDashboard, 
  Users, 
  Info,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { Language } from '../lib/translations';
import { User } from '../types';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

interface OnboardingTourProps {
  currentUser: User;
  language: Language;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddBonusPoints: (amount: number) => void;
  onUpdateUser: (updatedUser: Partial<User> | ((prev: User) => User)) => void;
  onClose: () => void;
}

interface TourStep {
  title: string;
  description: string;
  tab: string;
  icon: React.ReactNode;
  badge: string;
}

export default function OnboardingTour({
  currentUser,
  language,
  activeTab,
  setActiveTab,
  onAddBonusPoints,
  onUpdateUser,
  onClose
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedWeakAreas, setSelectedWeakAreas] = useState<string[]>(
    currentUser.weakAreas || ['Extensión y limpieza de brazos (Waacks)']
  );
  const [selectedLab, setSelectedLab] = useState<string>(
    currentUser.onboardingPreferences?.lab || 'DramaLab (Teatralidad)'
  );
  const [selectedBpm, setSelectedBpm] = useState<string>(
    currentUser.onboardingPreferences?.preferredBpm || '120 BPM'
  );

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Web Audio synth sound generator for premium feel
  const playTourSound = (frequency: number, duration = 0.1) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context not allowed yet:", e);
    }
  };

  const weakAreaOptions = [
    'Extensión y limpieza de brazos (Waacks)',
    'Fuerza y aceleración en Arm-Rolls',
    'Musicalidad y contra-tiempos (Off-beats)',
    'Postura corporal y simetría',
    'Teatralidad y expresión facial'
  ];

  const labOptions = [
    'DramaLab (Teatralidad)',
    'SomaticFeedbackLab (Espejo Ciego)',
    'BattleLab (Batallas)',
    'MetronomeLab (BPM)'
  ];

  const stepsTranslations: Record<Language, TourStep[]> = {
    es: [
      {
        badge: "INTRODUCCIÓN",
        title: "¡Te damos la bienvenida a Waack On! 🎭",
        description: "Estás en el portal de Monroe Academy. Permítenos guiarte por las herramientas interactivas diseñadas para dominar el arte, expresión, ritmo y biomecánica del Waacking.",
        tab: "dashboard",
        icon: <Sparkles className="w-8 h-8 text-[#E9C349]" />
      },
      {
        badge: "DASHBOARD",
        title: "Tu Panel de Control 📊",
        description: "Aquí supervisas tus estadísticas de rendimiento semanal, nivel de consistencia, clases completadas e historial de práctica. ¡Es tu bitácora de progreso constante!",
        tab: "dashboard",
        icon: <LayoutDashboard className="w-8 h-8 text-cyan-400" />
      },
      {
        badge: "ENTRENAMIENTO",
        title: "Laboratorio Freestyle & Práctica ⚡",
        description: "¡La zona interactiva clave! Ajusta el BPM de las pistas, activa el metrónomo, entrena tu expresión con la webcam usando filtros dramáticos y envía videos para recibir correcciones.",
        tab: "entrenamiento",
        icon: <Sparkles className="w-8 h-8 text-[#9A2B3C]" />
      },
      {
        badge: "DIAGNÓSTICO",
        title: "Áreas Débiles y Preferencias 🎯",
        description: "Selecciona tus áreas de mejora prioritarias para personalizar tu entrenamiento somático en Waack On.",
        tab: "entrenamiento",
        icon: <HelpCircle className="w-8 h-8 text-amber-400" />
      },
      {
        badge: "COMUNIDAD",
        title: "El Lobby de la Academia 👥",
        description: "Conéctate en tiempo real con otros estudiantes. Comparte tus presentaciones grabadas, recibe comentarios constructivos del instructor o compañeros, y platica en el chat grupal.",
        tab: "comunidad",
        icon: <Users className="w-8 h-8 text-emerald-400" />
      },
      {
        badge: "CELEBRACIÓN",
        title: "¡Todo Listo para Brillar! 👑",
        description: "Has completado la inducción del portal. Para celebrar tu llegada a la pista, te otorgamos una bonificación de +100 puntos de experiencia iniciales. ¡Demuestra tu actitud!",
        tab: "dashboard",
        icon: <Award className="w-10 h-10 text-[#E9C349] animate-bounce" />
      }
    ],
    en: [
      {
        badge: "INTRODUCTION",
        title: "Welcome to Waack On! 🎭",
        description: "You've entered the Monroe Academy portal. Let us guide you on a quick tour of our interactive tools designed to master the art, posture, rhythm, and biomechanics of Waacking.",
        tab: "dashboard",
        icon: <Sparkles className="w-8 h-8 text-[#E9C349]" />
      },
      {
        badge: "DASHBOARD",
        title: "Your Control Dashboard 📊",
        description: "This is your main command center. Monitor your weekly performance metrics, completed classes, shoulder conditioning levels, and practice logs at a glance.",
        tab: "dashboard",
        icon: <LayoutDashboard className="w-8 h-8 text-cyan-400" />
      },
      {
        badge: "TRAINING ZONE",
        title: "Freestyle Lab & Metronome ⚡",
        description: "The core interactive practice space. Sintonize premium tracks, adjust BPM speed, enable the synchronized metronome click, and activate your camera with custom retro filters.",
        tab: "entrenamiento",
        icon: <Sparkles className="w-8 h-8 text-[#9A2B3C]" />
      },
      {
        badge: "DIAGNOSTIC",
        title: "Weak Areas & Preferences 🎯",
        description: "Select your priority improvement areas to personalize your somatic training in Waack On.",
        tab: "entrenamiento",
        icon: <HelpCircle className="w-8 h-8 text-amber-400" />
      },
      {
        badge: "COMMUNITY",
        title: "The Academy Lobby Chat 👥",
        description: "Connect with Waackers worldwide! Share video assignments, leave support comments on fellow students' profiles, and hang out in the real-time chat room.",
        tab: "comunidad",
        icon: <Users className="w-8 h-8 text-emerald-400" />
      },
      {
        badge: "CELEBRATION",
        title: "Ready to Shine! 👑",
        description: "You've completed the academy orientation tour. To celebrate your arrival, we're rewarding you with +100 experience points! Show off your unique dramatic attitude!",
        tab: "dashboard",
        icon: <Award className="w-10 h-10 text-[#E9C349] animate-bounce" />
      }
    ],
    ko: [
      {
        badge: "인사말",
        title: "Waack On에 오신 것을 환영합니다! 🎭",
        description: "먼로 아카데미 포털에 로그인하셨습니다. 왁킹의 예술적 감각, 춤 동작의 리듬, 그리고 어깨 관절 가동성 향상을 도울 똑똑한 전용 기능들을 빠르게 안내해 드립니다.",
        tab: "dashboard",
        icon: <Sparkles className="w-8 h-8 text-[#E9C349]" />
      },
      {
        badge: "대시보드",
        title: "나만의 학습 대시보드 📊",
        description: "이곳에서 주간 연습 통계, 출석 점수, 완료한 동영상 강의 및 트레이닝 세션 내역을 한눈에 추적하세요. 회원님의 꾸준한 댄스 기록이 여기에 쌓입니다.",
        tab: "dashboard",
        icon: <LayoutDashboard className="w-8 h-8 text-cyan-400" />
      },
      {
        badge: "연습 공간",
        title: "프리스타일 랩 및 메트로놈 ⚡",
        description: "왁킹 연습의 핵심 공간! 비트 음악의 속도(BPM) 조절, 비트음 소리 동기화, 웹캠 레트로 필터를 사용한 역동적인 표정 연습, 강사 피드백 비디오 촬영 등이 가능합니다.",
        tab: "entrenamiento",
        icon: <Sparkles className="w-8 h-8 text-[#9A2B3C]" />
      },
      {
        badge: "진단",
        title: "취약 분야 및 선호도 🎯",
        description: "와크온 소매틱 트레이닝을 맞춤화할 우선 개선 영역을 선택하세요.",
        tab: "entrenamiento",
        icon: <HelpCircle className="w-8 h-8 text-amber-400" />
      },
      {
        badge: "커뮤니티",
        title: "아카데미 라이브 로비 👥",
        description: "전 세계 학생들과 실시간으로 소통하세요! 연습 영상을 피드에 올려 동료들의 평가를 받거나 격려를 나누고, 활발한 단체 채팅방에 참여해보세요.",
        tab: "comunidad",
        icon: <Users className="w-8 h-8 text-emerald-400" />
      },
      {
        badge: "축하합니다",
        title: "왁킹 무대를 정복할 준비 완료! 👑",
        description: "아카데미 오리엔테이션 투어가 모두 끝났습니다. 첫 가입을 축하하는 의미로 +100 경험치 포인트를 드립니다! 멋진 댄스 감각을 뽐내보세요!",
        tab: "dashboard",
        icon: <Award className="w-10 h-10 text-[#E9C349] animate-bounce" />
      }
    ],
    ja: [
      {
        badge: "イントロダクション",
        title: "Waack On へようこそ！ 🎭",
        description: "モンロー・アカデミーの学習ポータルへようこそ！ワッキングの芸術性、リズム感、身体可動域をマスターするために設計された、高度な学習機能をご案内します。",
        tab: "dashboard",
        icon: <Sparkles className="w-8 h-8 text-[#E9C349]" />
      },
      {
        badge: "ダッシュボード",
        title: "学習ダッシュボード 📊",
        description: "ここでは、週間のパフォーマンス、ストレッチのコンディショニング履歴、レッスン完了率などを視覚的に確認できます。練習を習慣化するためのベースです。",
        tab: "dashboard",
        icon: <LayoutDashboard className="w-8 h-8 text-cyan-400" />
      },
      {
        badge: "練習エリア",
        title: "フリースタイル・ラボ ⚡",
        description: "実際のコア練習エリア！専用音源のBPM微調整、ビート・メトロノーム機能、カメラ配信フィルターを駆使した表情演技の練習、インストラクターへの提出が全て行えます。",
        tab: "entrenamiento",
        icon: <Sparkles className="w-8 h-8 text-[#9A2B3C]" />
      },
      {
        badge: "診断",
        title: "弱点エリアと設定 🎯",
        description: "ソマティック・トレーニングを最適化するための重点強化エリアを選択してください。",
        tab: "entrenamiento",
        icon: <HelpCircle className="w-8 h-8 text-amber-400" />
      },
      {
        badge: "コミュニティ",
        title: "アカデミー・ライブロビー 👥",
        description: "生徒同士のインタラクティブな交流スペースです。練習成果を撮影して提出したり、クラスメイトの動画にいいねを残したり、リアルタイムのチャットを楽しみましょう。",
        tab: "comunidad",
        icon: <Users className="w-8 h-8 text-emerald-400" />
      },
      {
        badge: "完了",
        title: "ステージで輝く準備完了！ 👑",
        description: "チュートリアル・ツアーが完了しました！最初の練習に弾みをつけるため、ボーナスとして初期ポイント+100を付与しました。自分らしい表現を追求しましょう！",
        tab: "dashboard",
        icon: <Award className="w-10 h-10 text-[#E9C349] animate-bounce" />
      }
    ],
    pt: [
      {
        badge: "INTRODUÇÃO",
        title: "Boas-vindas ao Waack On! 🎭",
        description: "Você entrou no portal oficial da Monroe Academy. Deixe-nos guiar você em uma rápida jornada pelas ferramentas interativas criadas para dominar a arte, postura, ritmo e biomecânica do Waacking.",
        tab: "dashboard",
        icon: <Sparkles className="w-8 h-8 text-[#E9C349]" />
      },
      {
        badge: "DASHBOARD",
        title: "Seu Painel de Controle 📊",
        description: "Aqui você monitora estatísticas semanais de treino, níveis de consistência somática, aulas já concluídas e logs de atividade. Todo seu progresso em um relance!",
        tab: "dashboard",
        icon: <LayoutDashboard className="w-8 h-8 text-cyan-400" />
      },
      {
        badge: "ZONA DE TREINAMENTO",
        title: "Laboratório Freestyle & Prática ⚡",
        description: "O playground de prática definitivo! Escolha faixas premium, ajuste o ritmo com o BPM tuner, ligue o metrônomo visual, treine sua dramaticidade facial com filtros na câmera e envie gravações.",
        tab: "entrenamiento",
        icon: <Sparkles className="w-8 h-8 text-[#9A2B3C]" />
      },
      {
        badge: "DIAGNÓSTICO",
        title: "Áreas Fracas e Preferências 🎯",
        description: "Selecione suas áreas de melhoria prioritárias para personalizar seu treinamento no Waack On.",
        tab: "entrenamiento",
        icon: <HelpCircle className="w-8 h-8 text-amber-400" />
      },
      {
        badge: "COMUNIDADE",
        title: "O Lobby da Academia 👥",
        description: "Conecte-se em tempo real com bailarinos de todo o mundo. Compartilhe suas apresentações em vídeo, deixe comentários de suporte para os colegas e use o bate-papo coletivo.",
        tab: "comunidad",
        icon: <Users className="w-8 h-8 text-emerald-400" />
      },
      {
        badge: "CELEBRAÇÃO",
        title: "Pronto para Brilhar! 👑",
        description: "Você completou o tour de integração. Para comemorar seu início, adicionamos um bônus de +100 pontos de experiência à sua conta. Mostre sua atitude na pista!",
        tab: "dashboard",
        icon: <Award className="w-10 h-10 text-[#E9C349] animate-bounce" />
      }
    ]
  };

  const steps = stepsTranslations[language] || stepsTranslations['es'];
  const activeStepData = steps[currentStep];

  // Auto switch the tab in the background to show the actual view being discussed!
  useEffect(() => {
    if (activeStepData.tab !== activeTab) {
      setActiveTab(activeStepData.tab);
    }
  }, [currentStep]);

  // Initial trigger chime
  useEffect(() => {
    playTourSound(523.25, 0.15); // C5
    setTimeout(() => playTourSound(659.25, 0.15), 100); // E5
    setTimeout(() => playTourSound(783.99, 0.2), 200); // G5
  }, []);

  const handleNext = () => {
    if (currentStep === 3) {
      const updatedData = {
        weakAreas: selectedWeakAreas,
        onboardingPreferences: {
          lab: selectedLab,
          preferredBpm: selectedBpm
        }
      };
      onUpdateUser(prev => ({ ...prev, ...updatedData }));
      if (currentUser?.id) {
        setDoc(doc(db, 'users', currentUser.id), updatedData, { merge: true }).catch(err => {
          console.error("Error saving weak areas to Firestore:", err);
        });
      }
    }

    if (currentStep < steps.length - 1) {
      playTourSound(600 + (currentStep + 1) * 80, 0.08);
      setCurrentStep(currentStep + 1);
    } else {
      // Reward points!
      onAddBonusPoints(100);
      playTourSound(880, 0.12);
      setTimeout(() => playTourSound(1320, 0.25), 80);
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      playTourSound(600 + (currentStep - 1) * 80, 0.08);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    playTourSound(440, 0.15);
    onClose();
  };

  const labels = {
    es: { back: "Atrás", next: "Siguiente", end: "¡Empezar a Bailar! 🚀", skip: "Saltar tutorial", step: "Paso" },
    en: { back: "Back", next: "Next", end: "Let's Dance! 🚀", skip: "Skip intro", step: "Step" },
    ko: { back: "이전", next: "다음", end: "시작하기! 🚀", skip: "설명 건너뛰기", step: "단계" },
    ja: { back: "戻る", next: "次へ", end: "練習を開始！ 🚀", skip: "スキップする", step: "ステップ" },
    pt: { back: "Voltar", next: "Próximo", end: "Bailar Agora! 🚀", skip: "Pular tutorial", step: "Passo" }
  }[language] || { back: "Atrás", next: "Siguiente", end: "¡Empezar a Bailar! 🚀", skip: "Saltar tutorial", step: "Paso" };

  return (
    <div id="onboarding-tour-backdrop" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      {/* Dynamic Animated Spotlight Box */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E9C349]/5 rounded-full blur-[80px]" />
      </div>

      <motion.div
        id="onboarding-tour-card"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ type: "spring", damping: 25, stiffness: 180 }}
        className="glass-panel bg-[#121212]/95 border-2 border-[#E9C349]/30 shadow-[0_0_50px_rgba(233,195,73,0.15)] rounded-[28px] max-w-md w-full relative overflow-hidden flex flex-col p-6 sm:p-8"
      >
        {/* Scanline overlay */}
        <div className="absolute inset-0 scanline pointer-events-none opacity-10" />

        {/* Top Header Row */}
        <div className="flex items-center justify-between border-b border-[#262626] pb-4 mb-5 z-10 relative">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black text-black bg-[#E9C349] px-2 py-0.5 rounded tracking-widest">
              {activeStepData.badge}
            </span>
            <span className="text-[10px] font-mono text-[#8A8A8A] font-bold">
              {labels.step} {currentStep + 1} / {steps.length}
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="text-[#8A8A8A] hover:text-[#EDEFF4] p-1 rounded-lg hover:bg-white/5 transition-all"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Content */}
        <div className="flex-1 flex flex-col items-center text-center py-2 z-10 relative">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 shadow-inner"
          >
            {activeStepData.icon}
          </motion.div>

          <motion.h4
            key={`title-${currentStep}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="text-xl sm:text-2xl font-serif-elegant font-black tracking-tight text-[#EDEFF4] mb-2"
          >
            {activeStepData.title}
          </motion.h4>

          {currentStep === 3 ? (
            <motion.div
              key="weak-areas-step"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="w-full space-y-3 my-2 text-left"
            >
              <p className="text-xs text-[#C2C7D1] font-semibold text-center mb-2">
                {activeStepData.description}
              </p>
              <div>
                <label className="text-[10px] font-mono font-bold text-[#E9C349] uppercase tracking-wider block mb-1.5">
                  Selecciona Áreas a Mejorar:
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {weakAreaOptions.map(area => {
                    const isSelected = selectedWeakAreas.includes(area);
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedWeakAreas((selectedWeakAreas || []).filter(a => a !== area));
                          } else {
                            setSelectedWeakAreas([...(selectedWeakAreas || []), area]);
                          }
                          playTourSound(750, 0.05);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#9A2B3C]/30 border-[#E9C349] text-white shadow'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <span className="truncate mr-2">{area}</span>
                        <div className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center ${isSelected ? 'bg-[#E9C349] border-[#E9C349] text-black' : 'border-white/30'}`}>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase tracking-wider block mb-1">
                    Lab Preferido:
                  </label>
                  <select
                    value={selectedLab}
                    onChange={(e) => setSelectedLab(e.target.value)}
                    className="w-full bg-[#1C1B1B] border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-[#E9C349]"
                  >
                    {labOptions.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase tracking-wider block mb-1">
                    Banda BPM:
                  </label>
                  <select
                    value={selectedBpm}
                    onChange={(e) => setSelectedBpm(e.target.value)}
                    className="w-full bg-[#1C1B1B] border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-[#E9C349]"
                  >
                    <option value="110 BPM">110 BPM (Suave)</option>
                    <option value="120 BPM">120 BPM (Estándar)</option>
                    <option value="130+ BPM">130+ BPM (Rápido)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.p
              key={`desc-${currentStep}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="text-xs sm:text-sm text-[#C2C7D1] font-semibold leading-relaxed"
            >
              {activeStepData.description}
            </motion.p>
          )}
        </div>

        {/* Indicator Dots */}
        <div className="flex gap-1.5 justify-center my-4 z-10 relative">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                playTourSound(600 + idx * 80, 0.05);
                setCurrentStep(idx);
              }}
              className={`h-2 rounded-full transition-all duration-350 ${
                currentStep === idx 
                  ? 'w-6 bg-[#E9C349]' 
                  : 'w-2 bg-white/10 hover:bg-white/20'
              }`}
              title={`${labels.step} ${idx + 1}`}
            />
          ))}
        </div>

        {/* Bottom Actions Row */}
        <div className="flex items-center justify-between mt-2 pt-4 border-t border-[#262626] z-10 relative">
          <button
            onClick={handleSkip}
            className="text-[10px] font-mono text-[#8A8A8A] hover:text-[#EDEFF4] hover:underline font-bold transition-all uppercase"
          >
            [{labels.skip}]
          </button>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-all flex items-center gap-1 active:scale-95"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                {labels.back}
              </button>
            )}

            <button
              id="onboarding-next-btn"
              onClick={handleNext}
              className="px-4 py-2.5 rounded-xl bg-[#E9C349] hover:bg-[#ffdf6b] text-black font-black text-xs transition-all flex items-center gap-1 shadow-md active:scale-95 hover:shadow-[0_0_15px_rgba(233,195,73,0.3)]"
            >
              <span>{currentStep === steps.length - 1 ? labels.end : labels.next}</span>
              <ChevronRight className="w-3.5 h-3.5 stroke-[3px]" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
