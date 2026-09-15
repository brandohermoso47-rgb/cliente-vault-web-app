import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Timer, 
  Music, 
  MessageSquare, 
  Plus, 
  Sparkles, 
  Flame, 
  ChevronRight, 
  Compass, 
  Clock,
  PlayCircle,
  HelpCircle,
  Video,
  Swords,
  Trophy,
  Shuffle,
  EyeOff,
  Eye,
  Activity,
  Camera,
  Smile,
  Film,
  Sliders,
  Monitor,
  Lock,
  Zap,
  BarChart2,
  Radio
} from 'lucide-react';
import { User, PlaylistItem, FeedbackItem, Correction, Lesson } from '../types';
import { Language, translations } from '../lib/translations';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import PremiumGate from './PremiumGate';
import { DramaLab } from './lab/DramaLab';
import { DrillLab } from './lab/DrillLab';
import { BattleLab } from './lab/BattleLab';
import { CombosLab } from './lab/CombosLab';
import { PlaylistsLab } from './lab/PlaylistsLab';
import { SomaticFeedbackLab } from './lab/SomaticFeedbackLab';
import { SomaticPostureAnalyzer } from './entrenamiento/SomaticPostureAnalyzer';
import MovementTrailStudio from './entrenamiento/movementTrail/MovementTrailStudio';
import { WaackingRhythmGame } from './entrenamiento/WaackingRhythmGame';
import { AudioSpectrumVisualizer } from './entrenamiento/AudioSpectrumVisualizer';
import { SmartMusicalityTrainer } from './entrenamiento/SmartMusicalityTrainer';
import { PracticeDuelsModal } from './PracticeDuelsModal';
import { TrainingSummaryModal, TrainingSessionSummary } from './TrainingSummaryModal';
import { signInForGoogleDocs, createGoogleDoc, appendTextToGoogleDoc } from '../googleDocs';
import AIPoseLab from './AIPoseLab';

interface EntrenamientoViewProps {
  currentUser: User;
  playlists: PlaylistItem[];
  feedbackItems: FeedbackItem[];
  onAddFeedbackItem: (title: string, description: string, videoUrl: string) => void;
  onAddCorrection: (itemId: string, time: string, text: string) => void;
  onAddBonusPoints?: (amount: number) => void;
  onLogPractice?: (minutes: number, activityType: 'drill' | 'battle' | 'combo' | 'playlist' | 'sensorial', description: string, extra?: { category?: Lesson['category']; bpm?: number }) => void;
  language: Language;
  onUserChange?: (user: User) => void;
  trainingBpm?: number;
  onBpmChange?: (bpm: number) => void;
  theme?: 'dark' | 'light';
  onOpenSpotifyPlayer?: () => void;
}

const LOCALIZED_DRILL_INSTRUCTIONS: Record<Language, string[]> = {
  es: [
    "¡SOLO BRAZO DERECHO! (Mantén el izquierdo fijo en pose)",
    "¡SOLO BRAZO IZQUIERDO! (Mantén el derecho fijo en pose)",
    "¡ACENTÚA EL PECHO! (Golpea seco en los acentos 2 y 4)",
    "¡LÍNEAS LENTAS! (Mantén cada estiramiento por 4 tiempos completos)",
    "¡ROLLS EN LA CORONILLA! (Dibuja coronas por encima de tu frente)",
    "¡CAMBIO DE ALTURAS! (Entrena bajando la rodilla en el tiempo 1 y sube en el 5)",
    "¡DRAMA DRAMA DRAMA! (Usa la mirada, fíjate en la pantalla y posa con rabia)",
    "¡RITMO DOBLE TEMPO! (Haz dos rolls por cada beat rítmico)",
    "¡CONGELA EN EL TIEMPO 1! (Haz freestyle y congela rígido al inicio de cada 8)"
  ],
  en: [
    "RIGHT ARM ONLY! (Keep left arm fixed in pose)",
    "LEFT ARM ONLY! (Keep right arm fixed in pose)",
    "ACCENTUATE THE CHEST! (Hit sharp on accents 2 and 4)",
    "SLOW LINES! (Hold each stretch for 4 full counts)",
    "ROLLS ON THE CROWN! (Draw crowns above your forehead)",
    "LEVEL CHANGE! (Train lowering your knee on count 1 and rising on 5)",
    "DRAMA DRAMA DRAMA! (Use your gaze, lock eyes with screen, pose fiercely)",
    "DOUBLE TEMPO RHYTHM! (Do two rolls for each rhythmic beat)",
    "FREEZE ON COUNT 1! (Freestyle and freeze rigid at the start of each 8)"
  ],
  ko: [
    "오른팔만 사용! (왼팔은 포즈로 고정)",
    "왼팔만 사용! (오른팔은 포즈로 고정)",
    "가슴 액센트 강조! (2박과 4박에 강하게 타격)",
    "느린 선 만들기! (각 스트레칭을 가득 4박 동안 유지)",
    "정수리에 롤 돌리기! (이마 위로 왕관 그리기)",
    "높낮이 변화! (1박에 무릎을 낮추고 5박에 일어나기)",
    "드라마 드라마 드라마! (카메라를 강렬하게 쏘아보며 포즈)",
    "더블 템포 리듬! (비트당 두 번씩 롤 수행)",
    "1박에 프리즈! (프리스타일 중 매 8박 시작에 딱 맞추어 멈추기)"
  ],
  ja: [
    "右腕のみ！ (左腕はポーズで固定)",
    "左腕のみ！ (右腕はポーズで固定)",
    "胸のアクセント！ (カウント2と4でシャープに打つ)",
    "スローライン！ (各ストレッチを4カウント維持)",
    "頭上のロール！ (額の上にクラウンを描く)",
    "レベルチェンジ！ (カウント1で膝を下げ、カウント5で上がる)",
    "ドラマドラマドラマ！ (スクリーンを見つめ、激しくポーズ)",
    "ダブルテンポ！ (各ビートでロールを2回行う)",
    "カウント1でフリーズ！ (フリースタイルを行い、8カウントの頭で完全に静止)"
  ],
  pt: [
    "SÓ BRAÇO DIREITO! (Mantenha o esquerdo fixo em pose)",
    "SÓ BRAÇO ESQUERDO! (Mantenha o direito fixo em pose)",
    "ACENTUE O PEITO! (Golpeie seco nos acentos 2 e 4)",
    "LINHAS LENTAS! (Mantenha cada alongamento por 4 tempos completos)",
    "ROLLS NA COROA! (Desenhe coroas por cima da sua testa)",
    "MUDANÇA DE ALTURAS! (Treine descendo o joelho no tempo 1 e subindo no 5)",
    "DRAMA DRAMA DRAMA! (Use o olhar, foque na tela e pose com garra)",
    "RITMO EM DOBRO! (Faça dois rolls por cada beat rítmico)",
    "CONGELE NO TEMPO 1! (Faça freestyle e congele rígido no início de cada 8)"
  ]
};

const DRILL_INSTRUCTIONS = LOCALIZED_DRILL_INSTRUCTIONS.es;

const RIVALS = [
  { id: 'rival-pedro', name: 'Pedro Freestyle', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120', style: 'Rápido & Dinámico', difficulty: 'Fácil', speed: 118, bio: 'Especialista en transiciones rápidas y giros de muñeca a gran velocidad.' },
  { id: 'rival-carlos', name: 'Carlos Groove', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120', style: 'Sincronización & Ritmo', difficulty: 'Medio', speed: 125, bio: 'Su punto fuerte es golpear cada acento musical rítmico con una precisión robótica.' },
  { id: 'rival-sara', name: 'Sara Pose', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120', style: 'Drama, Poses & Líneas', difficulty: 'Difícil', speed: 128, bio: 'Reina de las expresiones faciales y líneas geométricas impecables. Te costará superarla.' }
];

export interface ObjectiveTheme {
  id: string;
  name: string;
  description: string;
  bpm: number;
  objectives: {
    id: string;
    text: string;
    points: number;
    tip: string;
  }[];
}

export const LOCALIZED_OBJECTIVE_THEMES: Record<Language, ObjectiveTheme[]> = {
  es: [
    {
      id: 'theme-monroe',
      name: 'Pose y Drama Marilyn Monroe 👑',
      description: 'Enfócate en la pose de pasarela en los acentos fuertes, expresiones faciales y la teatralidad de la época dorada.',
      bpm: 118,
      objectives: [
        { id: 'monroe-pose', text: 'Clavar una pose rígida exactamente en el Tiempo 1 de cada frase.', points: 40, tip: 'Mantén la mirada fija en tu reflejo o en la cámara al congelar.' },
        { id: 'monroe-arm', text: 'Ejecutar rolls altos cruzados por encima de la cabeza fluidamente.', points: 30, tip: 'Mantén los codos altos y hombros relajados para líneas más limpias.' },
        { id: 'monroe-gaze', text: 'Mantener proyección visual de orgullo y drama (mirada fija) constante.', points: 30, tip: 'Usa la mirada para contar una historia dramática al jurado.' }
      ]
    },
    {
      id: 'theme-rolls',
      name: 'Velocidad y Precisión de Wrist Rolls ⚡',
      description: 'Prueba tu limpieza técnica a alta velocidad de rolls en distintas posiciones espaciales.',
      bpm: 126,
      objectives: [
        { id: 'rolls-speed', text: 'Mantener rolls de muñecas continuos y simétricos sin desfases de tempo.', points: 40, tip: 'Alinea hombros y codos para evitar que la rotación se ensucie.' },
        { id: 'rolls-levels', text: 'Realizar un cambio de nivel completo (bajar rodilla o flexión profunda) con rolls.', points: 30, tip: 'El control del core es clave para estabilizar los brazos mientras bajas.' },
        { id: 'rolls-asym', text: 'Cambiar limpiamente de rolls dobles a rolls asimétricos (brazo arriba, brazo al lado).', points: 30, tip: 'Concéntrate en el aislamiento de cada hemisferio de tu cuerpo.' }
      ]
    },
    {
      id: 'theme-musicality',
      name: 'Métrica y Sincronización Rítmica 🎵',
      description: 'Trabaja en la sincronización de acentos en el contratiempo y los picos musicales.',
      bpm: 122,
      objectives: [
        { id: 'mus-beats', text: 'Acentuar con golpes secos de pecho o hombros en los Tiempos 2 y 4.', points: 40, tip: 'Usa el staccato y la contracción muscular seca en esos golpes.' },
        { id: 'mus-levels', text: 'Coordinar rolls lentos en 4 tiempos y rolls de doble tempo en los siguientes 4 tiempos.', points: 30, tip: 'Varía la dinámica rítmica para crear sorpresas visuales.' },
        { id: 'mus-freeze', text: 'Terminar la rutina con un freeze rígido absoluto exactamente en el segundo final.', points: 30, tip: 'No dejes que los brazos sigan fluyendo una vez finalice el cronómetro.' }
      ]
    }
  ],
  en: [
    {
      id: 'theme-monroe',
      name: 'Marilyn Monroe Pose & Drama 👑',
      description: 'Focus on runway posing on strong accents, facial expressions, and the theatricality of the golden era.',
      bpm: 118,
      objectives: [
        { id: 'monroe-pose', text: 'Sticking a stiff pose exactly on Count 1 of each phrase.', points: 40, tip: 'Keep your gaze locked on your reflection or camera when freezing.' },
        { id: 'monroe-arm', text: 'Executing high crossed rolls above your head fluidly.', points: 30, tip: 'Keep elbows high and shoulders relaxed for cleaner lines.' },
        { id: 'monroe-gaze', text: 'Maintaining a constant visual projection of pride and drama (gaze locked).', points: 30, tip: 'Use your gaze to tell a dramatic story to the judges.' }
      ]
    },
    {
      id: 'theme-rolls',
      name: 'Wrist Rolls Speed & Precision ⚡',
      description: 'Test your technical cleanliness at high speeds of rolls in different spatial positions.',
      bpm: 126,
      objectives: [
        { id: 'rolls-speed', text: 'Maintaining continuous, symmetrical wrist rolls without tempo lag.', points: 40, tip: 'Align shoulders and elbows to prevent rotation from getting messy.' },
        { id: 'rolls-levels', text: 'Performing a complete level change (knee-drop or deep squat) while rolling.', points: 30, tip: 'Core control is key to stabilizing your arms as you descend.' },
        { id: 'rolls-asym', text: 'Switching cleanly from double rolls to asymmetric rolls (one arm up, one side).', points: 30, tip: 'Focus on the isolation of each hemisphere of your body.' }
      ]
    },
    {
      id: 'theme-musicality',
      name: 'Meter & Rhythmic Synchronization 🎵',
      description: 'Work on accent synchronization on offbeats and musical peaks.',
      bpm: 122,
      objectives: [
        { id: 'mus-beats', text: 'Accenting with sharp chest or shoulder hits on Counts 2 and 4.', points: 40, tip: 'Use staccato and sharp muscle contraction in those hits.' },
        { id: 'mus-levels', text: 'Coordinating slow 4-count rolls and double tempo rolls in the next 4 counts.', points: 30, tip: 'Vary rhythmic dynamics to create visual surprises.' },
        { id: 'mus-freeze', text: 'Ending the routine with an absolute stiff freeze exactly at the final second.', points: 30, tip: 'Don\'t let arms keep flowing once the timer ends.' }
      ]
    }
  ],
  ko: [
    {
      id: 'theme-monroe',
      name: '마릴린 먼로 포즈 & 드라마 👑',
      description: '강한 액센트에 가해지는 패션쇼 포즈, 안면 표정 및 황금기 시대의 연극성에 집중해 보세요.',
      bpm: 118,
      objectives: [
        { id: 'monroe-pose', text: '매 구절의 정확히 1박에 경직된 포즈 고정하기.', points: 40, tip: '정지할 때 눈빛을 거울 속의 반사나 카메라에 고정하세요.' },
        { id: 'monroe-arm', text: '머리 위로 높고 교차된 롤을 부드럽게 실행하기.', points: 30, tip: '더 깨끗한 라인을 위해 팔꿈치를 높이고 어깨는 릴랙스하세요.' },
        { id: 'monroe-gaze', text: '도도함과 극적인 비주얼 프로젝션(눈빛 잠금) 일정하게 유지하기.', points: 30, tip: '심사위원에게 극적인 스토리를 전하기 위해 눈빛을 활용하세요.' }
      ]
    },
    {
      id: 'theme-rolls',
      name: '손목 롤 스피드 & 정확성 ⚡',
      description: '다양한 공간 위치에서 높은 템포로 롤 테크닉의 정확도를 시험합니다.',
      bpm: 126,
      objectives: [
        { id: 'rolls-speed', text: '템포 어긋남 없이 연속적이고 대칭적인 손목 롤 유지하기.', points: 40, tip: '회전이 흐트러지지 않도록 어깨와 팔꿈치를 한 줄로 맞추세요.' },
        { id: 'rolls-levels', text: '롤을 돌리는 동안 완전한 높낮이 변화(무릎 낮추기 또는 깊은 스쿼트) 수행하기.', points: 30, tip: '내려갈 때 팔을 안정화시키는 데에는 코어 제어가 필수적입니다.' },
        { id: 'rolls-asym', text: '더블 롤에서 비대칭 롤(한 팔 위로, 한 팔 옆으로)로 깔끔하게 전환하기.', points: 30, tip: '신체의 각 양측 분리에 집중하세요.' }
      ]
    },
    {
      id: 'theme-musicality',
      name: '박자 & 리드미컬 동기화 🎵',
      description: '엇박자와 음악적 클라이맥스에 대한 액센트 동기화를 연습합니다.',
      bpm: 122,
      objectives: [
        { id: 'mus-beats', text: '2박 and 4박에 가슴이나 어깨의 날카로운 타격으로 강조하기.', points: 40, tip: '해당 타격에 스타카토와 날카로운 근육 수축을 사용하세요.' },
        { id: 'mus-levels', text: '느린 4박 롤과 다음 4박 동안 더블 템포 롤 연동하기.', points: 30, tip: '시각적 반전을 만들기 위해 리드미컬한 역동성을 다양화하세요.' },
        { id: 'mus-freeze', text: '마지막 1초에 맞춰 정확히 완벽한 스티프 프리즈로 루틴 끝내기.', points: 30, tip: '타이머가 끝나면 팔이 계속 흐르지 않게 하세요.' }
      ]
    }
  ],
  ja: [
    {
      id: 'theme-monroe',
      name: 'マリリン・モンローのポーズ＆ドラマ 👑',
      description: '強いアクセントでのランウェイポージング、表情、そして黄金期の演劇性に焦点を当てます。',
      bpm: 118,
      objectives: [
        { id: 'monroe-pose', text: '各フレーズ of カウント1に正確に硬いポーズを決める。', points: 40, tip: 'フリーズするときは、視線を鏡の反射かカメラに固定したままにします。' },
        { id: 'monroe-arm', text: '頭上で交差する高いロールを滑らかに実行する。', points: 30, tip: 'より綺麗なラインのために、肘を高く保ち、肩をリラックスさせます。' },
        { id: 'monroe-gaze', text: 'アティチュードとドラマ（視線ロック）の絶え間ない投影を維持する。', points: 30, tip: '審査員にドラマチックなストーリーを語りかけるように視線を使ってください。' }
      ]
    },
    {
      id: 'theme-rolls',
      name: 'リストロールの速度と精度 ⚡',
      description: '様々な空間位置でのリストロールの高速技術の正確性をテストします。',
      bpm: 126,
      objectives: [
        { id: 'rolls-speed', text: 'テンポの遅れなしに、連続的で対称的なリストロールを維持する。', points: 40, tip: '回転が乱れるのを防ぐために、肩と肘の位置を合わせます。' },
        { id: 'rolls-levels', text: 'ロールを行いながら、完全なレベルチェンジ（膝下げや深いスクワット）を行う。', points: 30, tip: '下降する際に腕を安定させるには、体幹のコントロールが鍵となります。' },
        { id: 'rolls-asym', text: 'ダブルロールから非対称ロール（片方の腕が上、もう片方は横）へ綺麗に切り替える。', points: 30, tip: '身体のそれぞれの半身を独立させることに集中してください。' }
      ]
    },
    {
      id: 'theme-musicality',
      name: '拍子とリズムの同期 🎵',
      description: '弱拍と音楽のピークでのアクセント同期に取り組みます。',
      bpm: 122,
      objectives: [
        { id: 'mus-beats', text: 'カウント2と4で胸や肩のシャープなヒットでアクセントをつける。', points: 40, tip: 'ヒット時にスタッカートと鋭い筋肉の収縮を使用してください。' },
        { id: 'mus-levels', text: '次の4カウントで、遅い4カウントロールとダブルテンポロールを連動させる。', points: 30, tip: '視覚的なサプライズを生み出すために、リズムの強弱を変化させます。' },
        { id: 'mus-freeze', text: '最後の1秒の瞬間に、完璧に硬いフリーズでルーティンを終える。', points: 30, tip: 'タイマーが終わったら、腕が流れ続けないようにしてください。' }
      ]
    }
  ],
  pt: [
    {
      id: 'theme-monroe',
      name: 'Pose e Drama Marilyn Monroe 👑',
      description: 'Foque na pose de passarela nos acentos fortes, expressões faciais e na teatralidade da era de ouro.',
      bpm: 118,
      objectives: [
        { id: 'monroe-pose', text: 'Cravar uma pose rígida exatamente no Tempo 1 de cada frase.', points: 40, tip: 'Mantenha o olhar fixo no reflexo ou na câmera ao congelar.' },
        { id: 'monroe-arm', text: 'Executar rolls altos cruzados por cima da cabeça de forma fluida.', points: 30, tip: 'Mantenha os cotovelos altos e ombros relaxados para linhas mais limpas.' },
        { id: 'monroe-gaze', text: 'Manter a projeção visual de orgulho e drama (olhar fixo) constante.', points: 30, tip: 'Use o olhar para contar uma história dramática aos jurados.' }
      ]
    },
    {
      id: 'theme-rolls',
      name: 'Velocidade e Precisão dos Wrist Rolls ⚡',
      description: 'Teste a sua limpeza técnica de rolls em alta velocidade em diferentes posições espaciais.',
      bpm: 126,
      objectives: [
        { id: 'rolls-speed', text: 'Manter wrist rolls contínuos e simétricos sem atraso de tempo.', points: 40, tip: 'Alinhe ombros e cotovelos para evitar que a rotação fique bagunçada.' },
        { id: 'rolls-levels', text: 'Realizar uma mudança de nível completa (queda de joelho ou agachamento profundo) enquanto gira.', points: 30, tip: 'O controle do core é fundamental para estabilizar os braços enquanto desce.' },
        { id: 'rolls-asym', text: 'Mudar limpamente de rolls duplos para rolls assimétricos (um braço para cima, um para o lado).', points: 30, tip: 'Concentre-se no isolamento de cada hemisfério do seu corpo.' }
      ]
    },
    {
      id: 'theme-musicality',
      name: 'Métrica e Sincronização Rítmica 🎵',
      description: 'Trabalhe na sincronização de acentos no contratempo e picos musicais.',
      bpm: 122,
      objectives: [
        { id: 'mus-beats', text: 'Acentuar com golpes secos de peito ou ombros nos Tempos 2 e 4.', points: 40, tip: 'Use staccato e contração muscular seca nesses golpes.' },
        { id: 'mus-levels', text: 'Coordenar rolls lentos de 4 tempos e rolls de duplo tempo nos 4 tempos seguintes.', points: 30, tip: 'Varie a dinâmica rítmica para criar surpresas visuais.' },
        { id: 'mus-freeze', text: 'Terminar a rotina com um freeze rígido absoluto exatamente no segundo tempo final.', points: 30, tip: 'Não deixe os braços continuarem se movendo quando o cronômetro parar.' }
      ]
    }
  ]
};

export const OBJECTIVE_THEMES: ObjectiveTheme[] = LOCALIZED_OBJECTIVE_THEMES.es;

const LOCALIZED_COMBO_ARMS: Record<Language, string[]> = {
  es: [
    "Double Overhead Rolls (Círculos dobles sobre la cabeza)",
    "Cross Arms Extension (Línea de brazos cruzados con estiramiento)",
    "Asymmetric Crown Loops (Coronas asimétricas alternando codos)",
    "Behind-the-Back Shoulder Wrist Spin (Giro de muñeca tras la espalda)",
    "Speed Runway Swings (Columpios veloces de brazos de pasarela)"
  ],
  en: [
    "Double Overhead Rolls (Double circles over the head)",
    "Cross Arms Extension (Crossed arms line with stretch)",
    "Asymmetric Crown Loops (Asymmetrical crowns alternating elbows)",
    "Behind-the-Back Shoulder Wrist Spin (Wrist spin behind the back)",
    "Speed Runway Swings (Fast runway arm swings)"
  ],
  ko: [
    "더블 오버헤드 롤 (머리 위의 더블 서클)",
    "크로스 암즈 익스텐션 (스트레칭과 교차된 팔 라인)",
    "비대칭 크라운 루프 (팔꿈치를 번갈아 사용하는 비대칭 왕관)",
    "비하인드 더 백 숄더 리스트 스핀 (등 뒤로 하는 손목 회전)",
    "스피드 런웨이 스윙 (빠른 패션쇼 팔 흔들기)"
  ],
  ja: [
    "ダブルオーバーヘッドロール (頭上でのダブルサークル)",
    "クロスアームズエクステンション (ストレッチを伴う交差した腕のライン)",
    "非対称クラウンループ (肘を交互に使う非対称のクラウン)",
    "ビハインドザバック・ショルダーリストスピン (背中の後ろでの手首の回転)",
    "スピードランウェイスイング (高速なランウェイの腕のスイング)"
  ],
  pt: [
    "Double Overhead Rolls (Círculos duplos sobre a cabeça)",
    "Cross Arms Extension (Linha de braços cruzados com alongamento)",
    "Asymmetric Crown Loops (Coroas assimétricas alternando cotovelos)",
    "Behind-the-Back Shoulder Wrist Spin (Giro de punho por trás das costas)",
    "Speed Runway Swings (Balanços rápidos de braços estilo passarela)"
  ]
};

const LOCALIZED_COMBO_BODY: Record<Language, string[]> = {
  es: [
    "Ribcage Isolation (Aislamiento lateral de caja torácica)",
    "Pelvic Thrust & Anchor (Anclaje pélvico con contracción)",
    "Dynamic Shoulder Shrugs (Encogimiento asimétrico de hombros)",
    "Head & Neck Tilt (Inclinación dramática de cuello y cabeza)"
  ],
  en: [
    "Ribcage Isolation (Lateral ribcage isolation)",
    "Pelvic Thrust & Anchor (Pelvic anchor with contraction)",
    "Dynamic Shoulder Shrugs (Asymmetric shoulder shrugs)",
    "Head & Neck Tilt (Dramatic neck and head tilt)"
  ],
  ko: [
    "립케이지 아이솔레이션 (갈비뼈의 가로 격리)",
    "펠빅 트러스트 & 앵커 (수축과 골반 앵커)",
    "다이내믹 숄더 슈러그 (비대칭 어깨 으쓱하기)",
    "헤드 & 넥 틸트 (목과 머리의 극적인 기울임)"
  ],
  ja: [
    "リブケージアイソレーション (肋骨の横方向のアイソレーション)",
    "ペルヴィック・スラスト＆アンカー (収縮を伴う骨盤のアンカー)",
    "ダイナミック・ショルダー・シュラッグ (非対称の肩のすくめ)",
    "ヘッド＆ネックティルト (首と頭のドラマチックな傾き)"
  ],
  pt: [
    "Ribcage Isolation (Isolamento lateral de caixa torácica)",
    "Pelvic Thrust & Anchor (Ancoragem pélvica com contração)",
    "Dynamic Shoulder Shrugs (Encolhimento assimétrico de ombros)",
    "Head & Neck Tilt (Inclinação dramática de pescoço e cabeça)"
  ]
};

const LOCALIZED_COMBO_FEET: Record<Language, string[]> = {
  es: [
    "Level Change: Knee-Drop (Cambio de nivel: rodilla al piso)",
    "Pivot Turn: 180 Degrees (Giro de pivote completo a 180°)",
    "Chassé Side-Step (Paso lateral deslizado cruzado)",
    "High Stance Model Walk (Caminata de pasarela en postura alta)"
  ],
  en: [
    "Level Change: Knee-Drop (Level change: knee to the floor)",
    "Pivot Turn: 180 Degrees (Full 180° pivot turn)",
    "Chassé Side-Step (Slid crossed side-step)",
    "High Stance Model Walk (Runway walk in high stance)"
  ],
  ko: [
    "레벨 체인지: 니 드롭 (바닥에 무릎 내리기)",
    "피벗 턴: 180도 (완전한 180도 피벗 회전)",
    "샤세 사이드스텝 (미끄러지듯 교차하는 사이드스텝)",
    "하이 스탠스 모델 워크 (높은 보폭의 런웨이 모델 워킹)"
  ],
  ja: [
    "レベルチェンジ：ニードロップ (床への膝下げ)",
    "ピボットターン：180度 (完全な180度ピボットターン)",
    "シャッセ・サイドステップ (スライドする交差したサイドステップ)",
    "ハイスタンス・モデルウォーク (高姿勢でのランウェイウォーク)"
  ],
  pt: [
    "Level Change: Knee-Drop (Mudança de nível: joelho no chão)",
    "Pivot Turn: 180 Degrees (Giro pivô completo de 180°)",
    "Chassé Side-Step (Passo lateral cruzado deslizado)",
    "High Stance Model Walk (Caminhada de passarela em postura alta)"
  ]
};

const LOCALIZED_COMBO_ATTITUDE: Record<Language, string[]> = {
  es: [
    "High Fashion Runway Pose (Pose rígida de revista de modas)",
    "Sassy Eye-Lock (Mirada fija de orgullo y actitud en el 8)",
    "Staccato Sharp Freeze (Congelado rígido de un milisegundo)",
    "Soft Editorial Flow (Fluidez suave y seductora en los contratiempos)"
  ],
  en: [
    "High Fashion Runway Pose (Rigid fashion magazine pose)",
    "Sassy Eye-Lock (Staring gaze of pride and attitude on count 8)",
    "Staccato Sharp Freeze (Stiff one-millisecond freeze)",
    "Soft Editorial Flow (Smooth and seductive flow on offbeats)"
  ],
  ko: [
    "하이패션 런웨이 포즈 (패션 잡지 같은 고정 포즈)",
    "새시 아이락 (8박에 자부심과 태도를 가득 담아 응시)",
    "스타카토 샤프 프리즈 (1밀리초 동안의 단단한 프리즈)",
    "소프트 에디토리얼 플로우 (엇박에 부드럽고 매혹적인 흐름)"
  ],
  ja: [
    "ハイファッション・ランウェイポーズ (ファッション誌のような固定ポーズ)",
    "サッシー・アイロック (カウント8で誇りと自信に満ちた凝視)",
    "スタッカート・シャープフリーズ (1ミリ秒のピタッとしたフリーズ)",
    "ソフト・エディトリアル・フロー (弱拍での滑らかで魅力的な流れ)",
    "ソフ・エディトリアル・フロー"
  ],
  pt: [
    "High Fashion Runway Pose (Pose rígida de revista de modas)",
    "Sassy Eye-Lock (Olhar fixo de orgulho e atitude no 8)",
    "Staccato Sharp Freeze (Congelamento rígido de um milissegundo)",
    "Soft Editorial Flow (Fluidez suave e sedutora nos contratempos)"
  ]
};

const COMBO_ARMS = LOCALIZED_COMBO_ARMS.es;
const COMBO_BODY = LOCALIZED_COMBO_BODY.es;
const COMBO_FEET = LOCALIZED_COMBO_FEET.es;
const COMBO_ATTITUDE = LOCALIZED_COMBO_ATTITUDE.es;

const DANCER_PRESETS = [
  {
    name: 'High-Low Extension',
    url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800',
    defaultJoints: {
      handLeft: { x: 13, y: 58 },
      elbowLeft: { x: 21, y: 42 },
      shoulderLeft: { x: 32, y: 35 },
      chest: { x: 44, y: 28 },
      shoulderRight: { x: 53, y: 35 },
      elbowRight: { x: 69, y: 27 },
      handRight: { x: 85, y: 18 },
    },
    defaultFeltSense: "Siento los brazos proyectados desde el centro del esternón. La extensión asimétrica genera una línea de torsión que estabiliza mi postura y me ancla en el piso."
  },
  {
    name: 'Double Overhead Loop',
    url: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=800',
    defaultJoints: {
      handLeft: { x: 38, y: 22 },
      elbowLeft: { x: 28, y: 32 },
      shoulderLeft: { x: 38, y: 45 },
      chest: { x: 49, y: 49 },
      shoulderRight: { x: 60, y: 45 },
      elbowRight: { x: 70, y: 32 },
      handRight: { x: 61, y: 22 },
    },
    defaultFeltSense: "Rolls continuos sobre la coronilla. La energía sube en espiral desde la pelvis. Siento compresión escapular y control absoluto de mi centro de gravedad."
  },
  {
    name: 'Horizontal Wingspan',
    url: 'https://images.unsplash.com/photo-1535525133417-24112ac9cf4a?auto=format&fit=crop&q=80&w=800',
    defaultJoints: {
      handLeft: { x: 8, y: 45 },
      elbowLeft: { x: 24, y: 44 },
      shoulderLeft: { x: 38, y: 45 },
      chest: { x: 48, y: 45 },
      shoulderRight: { x: 58, y: 45 },
      elbowRight: { x: 72, y: 44 },
      handRight: { x: 88, y: 45 },
    },
    defaultFeltSense: "Amplitud máxima horizontal. Los hombros se mantienen deprimidos alargando la línea del cuello. La tensión isométrica recorre toda la espalda alta."
  }
];

const VISUAL_STIMULI = [
  {
    id: 'stim-coquetry',
    title: 'La Seducción & Coquetería',
    category: 'Sensualidad',
    description: 'Baja levemente la barbilla, gira tu cabeza un 30% a un lado, y sostén una mirada risueña y penetrante con un ligero arqueo de cejas. Añade el movimiento de "la máscara" (mano rozando suavemente los labios o la mejilla de forma rítmica).',
    prompt: 'Conecta con la cámara y baila transmitiendo misterio, juego y coqueteo de revista.',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vintage-retro-neon-style-dancing-girl-44026-large.mp4',
    pioneerQuote: '"El Waacking no es solo técnica de brazos; es actuar. Eres una estrella de cine mudo de la era dorada de Hollywood." — Tyrone Proctor',
    intensity: 'Media',
    badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/20'
  },
  {
    id: 'stim-drama',
    title: 'Drama Soberbio & Altivez',
    category: 'Altivez',
    description: 'Proyecta tu pecho, alarga el cuello tirando los hombros hacia abajo, levanta la barbilla y mira "hacia abajo" con soberbia absoluta. Tus manos deben dibujar coronas o asimetrías rígidas e impecables por encima de tu frente.',
    prompt: 'Imagínate en una pasarela de alta costura o una sesión de fotos editorial de los 70. Poses cortantes y frialdad extrema.',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=400',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-in-front-of-spotlights-with-retro-look-34289-large.mp4',
    pioneerQuote: '"No pidas perdón por tu grandeza. Míralos con orgullo, sella tu mirada y demuéstrales quién es la reina del club." — Pioneer Essence',
    intensity: 'Alta',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  },
  {
    id: 'stim-confrontation',
    title: 'Ira, Fuego & Confrontación',
    category: 'Intensidad',
    description: 'Enfoca tus ojos con máxima tensión en el compás, cejas levemente fruncidas pero sin perder la elegancia del marco facial. Tus golpes de brazos y rolls deben ser cortados con precisión quirúrgica, encarando tu propio reflejo.',
    prompt: 'Estás en la final de una batalla a muerte en la pista. Defiende tu arte con fuego en la mirada y gesticulación firme.',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-with-creative-makeup-posing-under-neon-light-40459-large.mp4',
    pioneerQuote: '"En la batalla, tu cara cuenta la historia de la resistencia. Usa el dolor del pasado y conviértelo en poder sobre el compás." — Outrageous Waackers',
    intensity: 'Extrema',
    badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20'
  },
  {
    id: 'stim-mystery',
    title: 'El Misterio / La Máscara',
    category: 'Misterio',
    description: 'Utiliza tus brazos para tapar parcialmente tu rostro en cortes rítmicos rápidos. Descubre un ojo en el tiempo 1, tapa la boca en el tiempo 4, descubre el perfil completo en el tiempo 7. Juega a ser indescifrable.',
    prompt: 'Baila como si llevaras un antifaz veneciano invisible. Revela tus expresiones faciales solo en momentos clave.',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-under-neon-lights-in-rain-slow-motion-42861-large.mp4',
    pioneerQuote: '"Esconde tus ojos, oculta tu dolor. Deja que el misterio atraiga al espectador y tu cuerpo hable por ti." — Vintage Hollywood Style',
    intensity: 'Baja',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
  },
  {
    id: 'stim-ecstasy',
    title: 'Éxtasis Disco & Celebración',
    category: 'Felicidad',
    description: 'Abre tus ojos de par en par con regocijo, esboza una sonrisa auténtica y radiante, levanta tus hombros en júbilo y proyecta una vibra festiva salvaje, emulando la energía liberadora de los clubs underground de 1975.',
    prompt: 'Siente la libertad absoluta de la música disco. Es pura celebración de vida, desinhibición y gozo absoluto.',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=400',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dancing-woman-in-a-nightclub-with-sparkles-and-lights-34283-large.mp4',
    pioneerQuote: '"Bailamos porque nos amamos. Bailamos porque somos libres. Que tu rostro irradie la luz de una supernova de felicidad." — Studio 54 Legends',
    intensity: 'Media',
    badgeColor: 'bg-yellow-500/10 text-[#D9A9FF] border-[#D9A9FF]/20'
  }
];

const LAB_TRANSLATIONS: Record<Language, Record<string, string>> = {
  es: {
    title: "LABORATORIO DE FREESTYLES",
    subtitle: "El laboratorio práctico de danza y experimentación. Entrena musicalidad a 3 tempos, drills, combos, freestyle a ciegas y expresión escénica.",
    drillTab: "⏱️ DRILL TRAINER",
    battleTab: "🎯 RETO DE OBJETIVOS",
    combosTab: "🔀 DRAFT DE COMBOS",
    sensorialTab: "👁️ ESPEJO CIEGO",
    somaticTab: "🧠 ANOTADOR SOMÁTICO",
    playlistsTab: "🎵 PLAYLISTS OFICIALES",
    feedbackTab: "🎬 FEEDBACK EN VIDEO",
  },
  en: {
    title: "FREESTYLE LABORATORY",
    subtitle: "The practical dance & experimentation lab. Train 3-tempo musicality, drills, combo drafts, blind freestyle, and stage expression.",
    drillTab: "⏱️ DRILL TRAINER",
    battleTab: "🎯 TARGET CHALLENGE",
    combosTab: "🔀 COMBO DRAFT",
    sensorialTab: "👁️ BLIND MIRROR",
    somaticTab: "🧠 SOMATIC ANNOTATOR",
    playlistsTab: "🎵 OFFICIAL PLAYLISTS",
    feedbackTab: "🎬 VIDEO FEEDBACK",
  },
  ko: {
    title: "프리스타일 연구소",
    subtitle: "실습 댄스 및 실험 연구소입니다. 3가지 템포 음악성, 드릴, 콤보 드래프트, 블라인드 프리스타일 및 무대 표현을 훈련하세요.",
    drillTab: "⏱️ 드릴 트레이너",
    battleTab: "🎯 목표 챌린지",
    combosTab: "🔀 콤보 드래프트",
    sensorialTab: "👁️ 블라인드 미러",
    somaticTab: "🧠 신체 일지 기록기",
    playlistsTab: "🎵 공식 재생목록",
    feedbackTab: "🎬 비디오 피드백",
  },
  ja: {
    title: "フリースタイル・ラボラトリー",
    subtitle: "実践的なダンス＆実験ラボ。3テンポ音楽性、ドリル、コンボドラフト、ブラインドフリースタイル、ステージ表現をトレーニングします。",
    drillTab: "⏱️ ドリルトレーナー",
    battleTab: "🎯 目標チャレンジ",
    combosTab: "🔀 コンボドラフト",
    sensorialTab: "👁️ ブラインドミラー",
    somaticTab: "🧠 ソマティック・アノテーター",
    playlistsTab: "🎵 公式プレイリスト",
    feedbackTab: "🎬 ビデオフィードバック",
  },
  pt: {
    title: "LABORATÓRIO DE FREESTYLES",
    subtitle: "O laboratório prático de dança e experimentação. Treine musicalidade em 3 tempos, drills, combos, freestyle às cegas e expressão cênica.",
    drillTab: "⏱️ DRILL TRAINER",
    battleTab: "🎯 DESAFIO DE OBJETIVOS",
    combosTab: "🔀 RASCUNHO DE COMBOS",
    sensorialTab: "👁️ ESPELHO CEGO",
    somaticTab: "🧠 ANOTADOR SOMÁTICO",
    playlistsTab: "🎵 PLAYLISTS OFICIAIS",
    feedbackTab: "🎬 FEEDBACK EM VÍDEO",
  }
};

const DRAMA_TRANSLATIONS: Record<Language, Record<string, string>> = {
  es: {
    tab: "🎭 LAB DE EXPRESIÓN",
    category: "TEATRALIDAD, EXPRESIÓN Y CONTROL FACIAL",
    title: "🎭 Laboratorio de Actitud & Drama",
    subtitle: "El Waacking no es solo mover los brazos de prisa; es el drama que transmites con tus ojos, tu mentón y tu actitud. Inspírate con el estímulo visual y enciende tu cámara para calibrar tu expresión escénica.",
    reward: "RECOMPENSA DE ACTITUD",
    points: "✨ +50 Puntos de Drama",
    stimulus: "ESTÍMULO VISUAL",
    detailedInst: "✍️ INSTRUCCIÓN DETALLADA DEL DIRECTOR:",
    directorCueTitle: "🎲 RETO EXPRÉS DEL DIRECTOR DE ESCENA:",
    generateCue: "[ Generar Otro Reto ]",
    monitor: "MONITOR EN TIEMPO REAL",
    liveCam: "LIVE CÁM",
    turnOnCam: "🔌 ENCENDER CÁMARA",
    turnOffCam: "🔌 APAGAR CÁMARA",
    filtersTitle: "🎨 PRESETS DE RETRO-FILTRO DRAMÁTICO:",
    filterLabel: "Filtro",
    mirror: "Reflejar Imagen (Efecto Espejo)",
    guides: "Guías de Alineación Facial",
    activeSession: "🎬 SESIÓN DE EXPRESIÓN ACTIVA",
    activeSessionDesc: "🔥 ¡MÍRATE EN LA CÁMARA, MANTÉN LA ACTITUD Y POSA AL RITMO DE TU MÚSICA RECOMENDADA!",
    stopPractice: "⏹️ DETENER PRÁCTICA",
    successTitle: "🎉 ¡Excelente Trabajo Dramático!",
    successDesc: "Has completado un ciclo completo de entrenamiento facial. Se han cargado +50 Puntos de Actitud a tu perfil místico.",
    instructorTipTitle: "Consejo del Instructor",
    instructorTipDesc: "Te recomendamos encender tu música disco favorita, seleccionar una categoría y dar play a la sesión. Al completar los 45s de entrenamiento, el director evaluará tu constancia.",
    startTraining: "▶ INICIAR ENTRENAMIENTO FACIAL DE 45 SEG",
    seconds: "Segundos",
    trainingDrama: "ENTRENANDO DRAMA",
    faceAlignment: "ALINEACIÓN DE ROSTRO",
    camDeactivatedTitle: "Cámara Desactivada",
    camDeactivatedDesc: "Enciende la cámara para verte en tiempo real. Esta herramienta utiliza tu webcam de forma 100% privada y segura en tu navegador.",
    enableWebcam: "🚀 ACTIVAR WEBCAM AHORA",
    pioneerLabel: "Cita del Pionero"
  },
  en: {
    tab: "🎭 EXPRESSION LAB",
    category: "THEATRICALITY, EXPRESSION & FACIAL CONTROL",
    title: "🎭 Attitude & Drama Lab",
    subtitle: "Waacking is not just about moving your arms fast; it is the drama you transmit with your eyes, chin, and attitude. Get inspired by the visual stimulus and turn on your camera to calibrate your scenic expression.",
    reward: "ATTITUDE REWARD",
    points: "✨ +50 Drama Points",
    stimulus: "VISUAL STIMULUS",
    detailedInst: "✍️ DETAILED DIRECTOR INSTRUCTION:",
    directorCueTitle: "🎲 EXPRESS SCENE DIRECTOR CHALLENGE:",
    generateCue: "[ Generate Another Challenge ]",
    monitor: "REAL-TIME MONITOR",
    liveCam: "LIVE CAM",
    turnOnCam: "🔌 TURN ON CAMERA",
    turnOffCam: "🔌 TURN OFF CAMERA",
    filtersTitle: "🎨 DRAMATIC RETRO-FILTER PRESETS:",
    filterLabel: "Filter",
    mirror: "Mirror Image (Mirror Effect)",
    guides: "Facial Alignment Guides",
    activeSession: "🎬 ACTIVE EXPRESSION SESSION",
    activeSessionDesc: "🔥 LOOK AT THE CAMERA, MAINTAIN ATTITUDE AND POSE TO THE RHYTHM OF YOUR RECOMMENDED MUSIC!",
    stopPractice: "⏹️ STOP PRACTICE",
    successTitle: "🎉 Excellent Dramatic Work!",
    successDesc: "You have completed a full facial training cycle. +50 Attitude Points have been loaded to your profile.",
    instructorTipTitle: "Instructor Tip",
    instructorTipDesc: "We recommend playing your favorite disco music, selecting a category, and starting the session. Upon completing the 45s of training, the director will evaluate your consistency.",
    startTraining: "▶ START 45S FACIAL TRAINING",
    seconds: "Seconds",
    trainingDrama: "TRAINING DRAMA",
    faceAlignment: "FACE ALIGNMENT",
    camDeactivatedTitle: "Camera Deactivated",
    camDeactivatedDesc: "Turn on the camera to see yourself in real time. This tool uses your webcam 100% privately and securely in your browser.",
    enableWebcam: "🚀 ENABLE WEBCAM NOW",
    pioneerLabel: "Pioneer Quote"
  },
  ko: {
    tab: "🎭 표현 연구실",
    category: "연극성, 표현 및 안면 제어",
    title: "🎭 태도 및 드라마 랩",
    subtitle: "왁킹은 단순히 팔을 빨리 움직이는 것이 아닙니다. 눈빛, 턱, 태도로 전달하는 드라마입니다. 시각적 자극에서 영감을 얻고 카메라를 켜서 무대 표현을 보정해 보세요.",
    reward: "태도 보상",
    points: "✨ +50 드라마 포인트",
    stimulus: "시각적 자극",
    detailedInst: "✍️ 감독의 상세 지시:",
    directorCueTitle: "🎲 무대 감독의 익스프레스 미션:",
    generateCue: "[ 다른 미션 생성 ]",
    monitor: "실시간 모니터",
    liveCam: "라이브 캠",
    turnOnCam: "🔌 카메라 켜기",
    turnOffCam: "🔌 카메라 끄기",
    filtersTitle: "🎨 드라마틱 레트로 필터 프리셋:",
    filterLabel: "필터",
    mirror: "이미지 좌우 반전 (거울 효과)",
    guides: "얼굴 정렬 가이드 라인",
    activeSession: "🎬 활성 표현 세션",
    activeSessionDesc: "🔥 카메라를 바라보고, 태도를 유지하며 추천 음악의 리듬에 맞춰 포즈를 취하세요!",
    stopPractice: "⏹️ 연습 중단",
    successTitle: "🎉 훌륭한 드라마틱 연습이었습니다!",
    successDesc: "얼굴 연습 주기를 모두 마쳤습니다. 프로필에 +50 태도 포인트가 적립되었습니다.",
    instructorTipTitle: "강사의 조언",
    instructorTipDesc: "가장 좋아하는 디스코 음악을 재생하고, 카테고리를 선택한 후 세션을 시작하는 것을 권장합니다. 45초 연습을 마치면 감독이 성실성을 평가할 것입니다.",
    startTraining: "▶ 45초 얼굴 연습 시작",
    seconds: "초",
    trainingDrama: "드라마 트레이닝 중",
    faceAlignment: "얼굴 정렬",
    camDeactivatedTitle: "카메라 비활성화됨",
    camDeactivatedDesc: "실시간으로 자신을 보려면 카메라를 켜세요. 이 도구는 웹캠을 브라우저에서 100% 비공개적이고 안전하게 사용합니다.",
    enableWebcam: "🚀 지금 웹캠 활성화",
    pioneerLabel: "개척자의 명언"
  },
  ja: {
    tab: "🎭 表現ラボ",
    category: "演劇性、表現、顔のコントロール",
    title: "🎭 アティチュード＆ドラマラボ",
    subtitle: "ワッキングは単に腕を速く動かすだけではありません。目、あご、態度で伝えるドラマです。視覚的な刺激からインスピレーションを得て、カメラをオンにしてステージの表現を調整してください。",
    reward: "アティチュード報酬",
    points: "✨ +50 ドラマポイント",
    stimulus: "視覚的刺激",
    detailedInst: "✍️ ディレクターの詳細な指示:",
    directorCueTitle: "🎲 舞台ディレクターのエクスプレスチャレンジ:",
    generateCue: "[ 別のチャレンジを生成 ]",
    monitor: "リアルタイムモニター",
    liveCam: "ライブカメラ",
    turnOnCam: "🔌 カメラをオンにする",
    turnOffCam: "🔌 カメラをオフにする",
    filtersTitle: "🎨 ドラマチックレトロフィルターのプリセット:",
    filterLabel: "フィルター",
    mirror: "画像を反転（ミラー効果）",
    guides: "顔の位置合わせガイド",
    activeSession: "🎬 アクティブな表現セッション",
    activeSessionDesc: "🔥 カメラを見つめ、アティチュードを維持し、おすすめの音楽のリズムに合わせてポーズをとってください！",
    stopPractice: "練習を停止",
    successTitle: "🎉 素晴らしいドラマチックな練習でした！",
    successDesc: "フェイシャルトレーニングサイクルを完了しました。プロフィールに+50アティチュードポイントが追加されました。",
    instructorTipTitle: "インストラクターのアドバイス",
    instructorTipDesc: "お気に入りのディスコ音楽を再生し、カテゴリを選択してセッションを開始することをお勧めします。45秒の練習が完了すると、ディレクターが継続性を評価します。",
    startTraining: "▶ 45秒間のフェイシャルトレーニングを開始",
    seconds: "秒",
    trainingDrama: "ドラマトレーニング中",
    faceAlignment: "顔の位置合わせ",
    camDeactivatedTitle: "カメラ無効",
    camDeactivatedDesc: "リアルタイムで自分を見るにはカメラをオンにしてください。このツールはブラウザ内でウェブカムを100%プライベートかつ安全に使用します。",
    enableWebcam: "🚀 今すぐウェブカムを有効にする",
    pioneerLabel: "パイオニアの言葉"
  },
  pt: {
    tab: "🎭 LAB DE EXPRESSÃO",
    category: "TEATRALIDADE, EXPRESSÃO E CONTROLE FACIAL",
    title: "🎭 Laboratório de Atitude & Drama",
    subtitle: "O Waacking não é apenas mover os braços rápido; é o drama que você transmite com seus olhos, queixo e atitude. Inspire-se com o estímulo visual e ligue sua câmera para calibrar sua expressão cênica.",
    reward: "RECOMPENSA DE ATITUDE",
    points: "✨ +50 Pontos de Drama",
    stimulus: "ESTÍMULO VISUAL",
    detailedInst: "✍️ INSTRUÇÃO DETALHADA DO DIRETOR:",
    directorCueTitle: "🎲 DESAFIO EXPRESSO DO DIRETOR DE CENA:",
    generateCue: "[ Gerar Outro Desafio ]",
    monitor: "MONITOR EM TEMPO REAL",
    liveCam: "LIVE CAM",
    turnOnCam: "🔌 LIGAR CÂMERA",
    turnOffCam: "🔌 DESLIGAR CÂMERA",
    filtersTitle: "🎨 PRESETS DE RETRO-FILTRO DRAMÁTICO:",
    filterLabel: "Filtro",
    mirror: "Espelhar Imagem (Efeito Espelho)",
    guides: "Guias de Alinhamento Facial",
    activeSession: "🎬 SESSÃO DE EXPRESSÃO ATIVA",
    activeSessionDesc: "OLHE PARA A CÂMERA, MANTENHA A ATITUDE E FAÇA POSES AO RITMO DA SUA MÚSICA RECOMENDADA!",
    stopPractice: "⏹️ PARAR PRÁTICA",
    successTitle: "🎉 Excelente Trabalho Dramático!",
    successDesc: "Você concluiu um ciclo completo de treinamento facial. +50 Pontos de Atitude foram creditados ao seu perfil.",
    instructorTipTitle: "Conselho do Instrutor",
    instructorTipDesc: "Recomendamos tocar sua música disco favorita, selecionar uma categoria e iniciar a sessão. Ao concluir os 45 segundos de treino, o diretor avaliará sua consistência.",
    startTraining: "▶ INICIAR TREINO FACIAL DE 45 SEGUNDOS",
    seconds: "Segundos",
    trainingDrama: "TREINANDO DRAMA",
    faceAlignment: "ALINHAMENTO FACIAL",
    camDeactivatedTitle: "Câmera Desativada",
    camDeactivatedDesc: "Ligue a câmera para se ver em tempo real. Esta ferramenta usa sua webcam de forma 100% privada e segura em seu navegador.",
    enableWebcam: "🚀 ATIVAR WEBCAM AGORA",
    pioneerLabel: "Citação do Pioneiro"
  }
};

const DIRECTOR_CUES: Record<Language, string[]> = {
  es: [
    "👁️ TIEMPO 1: Mirada de reojo fría. TIEMPO 5: Sonrisa triunfante con barbilla de realeza elevada.",
    "🎭 TIEMPOS 1-4: Cubre tu rostro con tu mano izquierda. TIEMPO 5: Descúbrelo lentamente con mirada seductora.",
    "⚡ TIEMPO 1: Mirada de ira cortante. TIEMPO 4: Guiño lento. TIEMPO 7: Congelado de pose con mentón desafiante.",
    "✨ TIEMPOS 1-8: Sigue los acentos del metrónomo solo inclinando la cabeza con dramatismo teatral.",
    "👑 TIEMPO 1: Sostén tu mano derecha en corona sobre tu frente y mira a cámara con absoluta altivez de pasarela.",
    "🔥 TIEMPO 1: Seducción suave. TIEMPO 3: Sorpresa súbita. TIEMPO 5: Orgullo gélido. TIEMPO 7: Éxtasis rítmico total."
  ],
  en: [
    "👁️ COUNT 1: Cold side-glance. COUNT 5: Triumphant smile with high royal chin posture.",
    "🎭 COUNTS 1-4: Cover your face with your left hand. COUNT 5: Reveal it slowly with a seductive gaze.",
    "⚡ COUNT 1: Sharp angry gaze. COUNT 4: Slow wink. COUNT 7: Frozen pose with a defiant chin.",
    "✨ COUNTS 1-8: Follow the metronome accents using only theatrical head tilts.",
    "👑 COUNT 1: Hold your right hand as a crown over your forehead and look at the camera with absolute runway haughtiness.",
    "🔥 COUNT 1: Soft seduction. COUNT 3: Sudden surprise. COUNT 5: Ice-cold pride. COUNT 7: Total rhythmic ecstasy."
  ],
  ko: [
    "👁️ 1박: 차가운 곁눈질. 5박: 위엄 있는 턱선과 승리의 미소.",
    "🎭 1-4박: 왼손으로 얼굴을 가리세요. 5박: 매혹적인 눈빛으로 천천히 손을 떼며 드러내세요.",
    "⚡ 1박: 날카로운 분노의 눈빛. 4박: 느린 윙크. 7박: 도전적인 턱 끝으로 정지 포즈.",
    "✨ 1-8박: 오직 연극적인 머리 끄덕임과 기울임만으로 메트로놈 악센트를 맞추세요.",
    "👑 1박: 이마 위에 오른손으로 왕관을 만들고 극도의 패션쇼 도도함으로 카메라를 응시하세요.",
    "🔥 1박: 부드러운 유혹. 3박: 돌발적인 놀람. 5박: 얼음처럼 차가운 오만함. 7박: 완전한 리듬감 있는 황홀경."
  ],
  ja: [
    "👁️ カウント1：冷たい横目。カウント5：気高きあごを上げた勝利 of 微笑み。",
    "🎭 カウント1-4：左手で顔を覆います。カウント5：誘惑的な視線でゆっくりと顔を明かします。",
    "⚡ カウント1：鋭い怒りの眼差し。カウント4：ゆっくりとしたウィンク。カウント7：挑戦的なあご先でのフリーズポーズ。",
    "✨ カウント1-8：演劇的な頭の傾きだけでメトロノームのアクセントに従います。",
    "👑 カウント1：右手を額の上に王冠のように掲げ、完璧なランウェイの傲慢さでカメラを見つめます。",
    "🔥 カウント1：柔らかな誘惑。カウント3：突然の驚き。カウント5：氷のように冷たいプライド。カウント7：完全なリズムの恍惚感。"
  ],
  pt: [
    "👁️ TEMPO 1: Olhar de soslaio frio. TEMPO 5: Sorriso triunfante com o queixo elevado com altivez.",
    "🎭 TEMPOS 1-4: Cubra o rosto com a mão esquerda. TEMPO 5: Descubra-o lentamente com olhar sedutor.",
    "⚡ TEMPO 1: Olhar cortante de ira. TEMPO 4: Piscada lenta. TEMPO 7: Pose congelada com queixo desafiador.",
    "✨ TEMPOS 1-8: Siga os acentos do metrônomo apenas inclinando a cabeça com dramaticidade teatral.",
    "👑 TEMPO 1: Segure a mão direita como coroa sobre a testa e olhe para a câmera com absoluta altivez de passarela.",
    "🔥 TEMPO 1: Sedução suave. TEMPO 3: Surpresa súbita. TEMPO 5: Orgulho gélido. TEMPO 7: Êxtase rítmico total."
  ]
};

const getLocalizedStimulus = (idx: number, lang: Language) => {
  const stim = VISUAL_STIMULI[idx];
  
  const localDb: Record<Language, Array<{title: string, category: string, description: string, prompt: string, pioneerQuote: string}>> = {
    es: [
      {
        title: 'La Seducción & Coquetería',
        category: 'Sensualidad',
        description: 'Baja levemente la barbilla, gira tu cabeza un 30% a un lado, y sostén una mirada risueña y penetrante con un ligero arqueo de cejas. Añade el movimiento de "la máscara" (mano rozando suavemente los labios o la mejilla de forma rítmica).',
        prompt: 'Conecta con la cámara y baila transmitiendo misterio, juego y coqueteo de revista.',
        pioneerQuote: '"El Waacking no es solo técnica de brazos; es actuar. Eres una estrella de cine mudo de la era dorada de Hollywood." — Tyrone Proctor'
      },
      {
        title: 'Drama Soberbio & Altivez',
        category: 'Altivez',
        description: 'Proyecta tu pecho, alarga el cuello tirando los hombros hacia abajo, levanta la barbilla y mira "hacia abajo" con soberbia absoluta. Tus manos deben dibujar coronas o asimetrías rígidas e impecables por encima de tu frente.',
        prompt: 'Imagínate en una pasarela de alta costura o una sesión de fotos editorial de los 70. Poses cortantes y frialdad extrema.',
        pioneerQuote: '"No pidas perdón por tu grandeza. Míralos con orgullo, sella tu mirada y demuéstrales quién es la reina del club." — Pioneer Essence'
      },
      {
        title: 'Ira, Fuego & Confrontación',
        category: 'Intensidad',
        description: 'Enfoca tus ojos con máxima tensión en el compás, cejas levemente fruncidas pero sin perder la elegancia del marco facial. Tus golpes de brazos y rolls deben ser cortados con precisión quirúrgica, encarando tu propio reflejo.',
        prompt: 'Estás en la final de una batalla a muerte en la pista. Defiende tu arte con fuego en la mirada y gesticulación firme.',
        pioneerQuote: '"En la batalla, tu cara cuenta la historia de la resistencia. Usa el dolor del pasado y conviértelo en poder sobre el compás." — Outrageous Waackers'
      },
      {
        title: 'El Misterio / La Máscara',
        category: 'Misterio',
        description: 'Utiliza tus brazos para tapar parcialmente tu rostro en cortes rítmicos rápidos. Descubre un ojo en el tiempo 1, tapa la boca en el tiempo 4, descubre el perfil completo en el tiempo 7. Juega a ser indescifrable.',
        prompt: 'Baila como si llevaras un antifaz veneciano invisible. Revela tus expresiones faciales solo en momentos clave.',
        pioneerQuote: '"Esconde tus ojos, oculta tu dolor. Deja que el misterio atraiga al espectador y tu cuerpo hable por ti." — Vintage Hollywood Style'
      },
      {
        title: 'Éxtasis Disco & Celebración',
        category: 'Felicidad',
        description: 'Abre tus ojos de par en par con regocijo, esboza una sonrisa auténtica y radiante, levanta tus hombros en júbilo y proyecta una vibra festiva salvaje, emulando la energía liberadora de los clubs underground de 1975.',
        prompt: 'Siente la libertad absoluta de la música disco. Es pura celebración de vida, desinhibición y gozo absoluto.',
        pioneerQuote: '"Bailamos porque nos amamos. Bailamos porque somos libres. Que tu rostro irradie la luz de una supernova de felicidad." — Studio 54 Legends'
      }
    ],
    en: [
      {
        title: 'Seduction & Coquetry',
        category: 'Sensuality',
        description: 'Lower your chin slightly, turn your head 30% to one side, and hold a playful, piercing gaze with a light eyebrow arch. Add the "mask" movement (hand softly brushing lips or cheek rhythmically).',
        prompt: 'Connect with the camera and dance, transmitting mystery, playfulness, and magazine-style coquetry.',
        pioneerQuote: '"Waacking is not just arm technique; it\'s acting. You\'re a silent movie star from the golden age of Hollywood." — Tyrone Proctor'
      },
      {
        title: 'Superb Drama & Haughtiness',
        category: 'Pride',
        description: 'Project your chest, elongate your neck pulling shoulders down, lift your chin and look "down" with absolute pride. Your hands must paint rigid, impeccable crowns above your forehead.',
        prompt: 'Imagine yourself on a high fashion runway or a 70s editorial photoshoot. Sharp poses and extreme coldness.',
        pioneerQuote: '"Never apologize for your greatness. Look at them with pride, lock your gaze, and show them who is the queen of the club." — Pioneer Essence'
      },
      {
        title: 'Anger, Fire & Confrontation',
        category: 'Intensity',
        description: 'Focus your eyes with maximum beat tension, slightly furrowed brows without losing the elegance of the facial frame. Your arm strikes and rolls must be cut with surgical precision, facing your own reflection.',
        prompt: 'You are in the finals of a battle to the death on the floor. Defend your art with fire in your gaze and firm expressions.',
        pioneerQuote: '"In battle, your face tells the story of resilience. Use the pain of the past and convert it into power over the beat." — Outrageous Waackers'
      },
      {
        title: 'The Mystery / The Mask',
        category: 'Mystery',
        description: 'Use your arms to partially cover your face in quick rhythmic cuts. Reveal one eye on count 1, cover your mouth on count 4, reveal the full profile on count 7. Play with being indecipherable.',
        prompt: 'Dance as if wearing an invisible Venetian mask. Reveal your facial expressions only at key moments.',
        pioneerQuote: '"Hide your eyes, conceal your pain. Let mystery attract the spectator and let your body speak for you." — Vintage Hollywood Style'
      },
      {
        title: 'Disco Ecstasy & Celebration',
        category: 'Joy',
        description: 'Open your eyes wide with joy, flash an authentic, beaming smile, raise your shoulders in jubilation and project a wild festive vibe, emulating the liberating energy of 1975 underground clubs.',
        prompt: 'Feel the absolute freedom of disco music. It is pure celebration of life, disinhibition, and absolute joy.',
        pioneerQuote: '"We dance because we love each other. We dance because we are free. Let your face radiate the light of a happiness supernova." — Studio 54 Legends'
      }
    ],
    ko: [
      {
        title: '유혹과 요염함 (Seduction & Coquetry)',
        category: '관능미',
        description: '턱을 약간 낮추고 고개를 한쪽으로 30도 돌린 채, 눈썹을 살짝 치켜세우며 장난기 어린 강렬한 눈빛을 유지하세요. 리듬감 있게 손으로 입술이나 뺨을 부드럽게 스치는 "마스크" 동작을 추가해 보세요.',
        prompt: '카메라와 시선을 맞추고 잡지 화보처럼 미스터리하고 요염하게 춤을 춰보세요.',
        pioneerQuote: '"왁킹은 단순한 팔 기술이 아닙니다. 연기입니다. 당신은 할리우드 황금기의 무성 영화 스타입니다." — 타이론 프록터'
      },
      {
        title: '도도함과 극적인 연출 (Superb Drama & Haughtiness)',
        category: '도도함',
        description: '가슴을 내밀고 어깨를 아래로 당기며 목을 늘이고, 턱을 들어 극도의 도도한 눈빛으로 "아래를" 내려다보세요. 손으로 이마 위에 완벽하고 단단한 왕관을 그리세요.',
        prompt: '70년대 하이패션 런웨이나 화보 촬영장에 서 있다고 상상해 보세요. 날카로운 포즈와 극도의 차가움을 보여주세요.',
        pioneerQuote: '"당신의 위대함에 대해 절대 사과하지 마세요. 당당하게 그들을 바라보고, 시선을 고정한 채 누가 클럽의 여왕인지 보여주세요." — 개척자의 정신'
      },
      {
        title: '분노, 열정 및 대립 (Anger, Fire & Confrontation)',
        category: '강렬함',
        description: '얼굴의 우아한 프레임을 잃지 않으면서 미간을 약간 찌푸린 채 비트에 맞춰 눈에 최대한의 힘을 주세요. 거울에 비친 자신을 마주하며 외과적인 정밀함으로 팔 치기와 롤을 끊어내세요.',
        prompt: '플로어 위에서 목숨을 건 배틀 결승전에 임하고 있습니다. 눈빛의 불꽃과 단단한 표현으로 당신의 예술을 지켜내세요.',
        pioneerQuote: '"배틀에서 당신의 얼굴은 회복력의 역사를 말해줍니다. 과거의 고통을 사용해 비트 위의 힘으로 전환하세요." — 아웃레이저스 왁커스'
      },
      {
        title: '미스터리 / 가면 (The Mystery / The Mask)',
        category: '신비로움',
        description: '팔을 사용해 빠른 리듬의 컷으로 얼굴을 부분적으로 가리세요. 1박에 한쪽 눈을 드러내고, 4박에 입을 가리고, 7박에 전체 프로필을 드러내세요. 해독할 수 없는 상태를 유지하세요.',
        prompt: '보이지 않는 베네치아 가면을 쓴 것처럼 춤추세요. 결정적인 순간에만 얼굴 표정을 드러내세요.',
        pioneerQuote: '"눈을 숨기고, 고통을 숨기세요. 신비로움으로 관객을 매료시키고 당신의 몸이 대신 말하게 하세요." — 빈티지 할리우드 스타일'
      },
      {
        title: '디스코 에크스타시와 축제 (Disco Ecstasy & Celebration)',
        category: '기쁨',
        description: '기쁨으로 눈을 크게 뜨고, 진실되고 환한 미소를 지으며, 어깨를 으쓱하며 환호하고, 1975년 언더그라운드 클럽의 해방감 넘치는 에너지를 모방하여 와일드한 축제 분위기를 투사하세요.',
        prompt: '디스코 음악의 절대적인 자유를 느끼세요. 그것은 삶의 순수한 축하, 탈억제, 절대적인 즐거움입니다.',
        pioneerQuote: '"우리는 서로 사랑하기 때문에 춤을 춥니다. 우리는 자유롭기 때문에 춤을 춥니다. 당신의 얼굴이 행복의 초신성 빛을 발산하게 하세요." — 스튜디오 54 전설들'
      }
    ],
    ja: [
      {
        title: '魅惑とコケティッシュ (Seduction & Coquetry)',
        category: '官能性',
        description: 'あごを少し引き、頭を横に30度傾け、眉を軽く上げて、いたずらっぽく鋭い視線を維持します。リズムに合わせて手で唇や頬を優しく撫でる「マスク」の動きを加えます。',
        prompt: 'カメラと視線を合わせ、雑誌のグラビアのようにミステリアスでコケティッシュに踊ります。',
        pioneerQuote: '「ワッキングは単なる腕の技術ではありません。演技です。あなたはハリウッド黄金期の無声映画のスターなのです。」 — タイロン・プロクター'
      },
      {
        title: '圧倒的なドラマと傲慢さ (Superb Drama & Haughtiness)',
        category: '傲慢さ',
        description: '胸を張り、肩を下げて首を伸ばし、あごを上げて絶対的な傲慢さで「見下す」ように見つめます。手で額の上に完璧で硬い王冠を描いてください。',
        prompt: '70年代のハイファッションランウェイやエディトリアル撮影に立っている自分を想像してください。鋭いポーズと極度の冷たさを表現します。',
        pioneerQuote: '「自分の偉大さを謝る必要はありません。誇りを持って彼らを見つめ、視線を固定し、誰がクラブの女王であるかを示してください。」 — パイオニアの真髄'
      },
      {
        title: '怒り、炎、対峙 (Anger, Fire & Confrontation)',
        category: '強度',
        description: '顔のエレガントなフレームを失わずに、眉を少しひそめてビートに合わせて目に最大限の力を入れます。鏡の中の自分と対峙し、外科的な精密さでアームストライク and ロールを切り裂きます。',
        prompt: 'フロアで命をかけたバトルの決勝に臨んでいます。目元の炎と固い表情で、あなたの芸術を守り抜いてください。',
        pioneerQuote: '「バトルでは、あなたの顔が回復の歴史を物語ります。過去の痛みを利用して、ビートの上のパワーに変換してください。」 — アウトレイジャス・ワッカーズ'
      },
      {
        title: 'ミステリー／仮面 (The Mystery / The Mask)',
        category: '神秘性',
        description: '腕を使って素早いリズムのカットで顔を部分的に覆います。カウント1で片目を現し、カウント4で口を覆い、カウント7で横顔全体を現します。解読不能な状態でプレイします。',
        prompt: '見えないベネチアの仮面をかぶっているように踊ります。決定的な瞬間だけ顔の表情を明らかにします。',
        pioneerQuote: '「目を隠し、痛みを隠してください。神秘性で観客を魅了し、あなたの体に語らせてください。」 — ヴィンテージハリウッドスタイル'
      },
      {
        title: 'ディスコ・エクスタシーと祝福 (Disco Ecstasy & Celebration)',
        category: '喜び',
        description: '喜びで目を大きく見開き、本物の輝く笑顔を見せ、歓喜で肩をすくめ、1975年のアンダーグラウンドクラブの解放感あふれるエネルギーを模倣して、ワイルドな祝福のバイブスを投影します。',
        prompt: 'ディスコ音楽の絶対的な自由を感じてください。それは生命の純粋な祝福、脱抑制、絶対的な楽しさです。',
        pioneerQuote: '「私たちが踊るのはお互いを愛しているからです。私たちが踊るのは自由だからです。あなたの顔に幸福の超新星の光を放射させてください。」 — スタジオ54の伝説たち'
      }
    ],
    pt: [
      {
        title: 'A Sedução & Coqueteria',
        category: 'Sensualidade',
        description: 'Abaixe levemente o queixo, gire a cabeça 30% para um lado e sustente um olhar risonho e penetrante com um leve arqueamento de sobrancelhas. Adicione o movimento da "máscara" (mão roçando suavemente os lábios ou a bochecha de forma rítmica).',
        prompt: 'Conecte-se com a câmera e dance transmitindo mistério, jogo e coqueteria de revista.',
        pioneerQuote: '"O Waacking não é apenas técnica de braços; é atuar. Você é uma estrela de cinema mudo da era de ouro de Hollywood." — Tyrone Proctor'
      },
      {
        title: 'Drama Soberbo & Altivez',
        category: 'Altivez',
        description: 'Projete o peito, alongue o pescoço puxando os ombros para baixo, levante o queixo e olhe "para baixo" com soberba absoluta. Suas mãos devem desenhar coroas ou assimetrias rígidas e impecáveis acima de sua testa.',
        prompt: 'Imagine-se em uma passarela de alta costura ou em uma sessão de fotos editorial dos anos 70. Poses cortantes e frieza extrema.',
        pioneerQuote: '"Nunca peça desculpas por sua grandeza. Olhe para eles com orgulho, sele seu olhar e mostre-lhes quem é a rainha do clube." — Pioneer Essence'
      },
      {
        title: 'Ira, Fogo & Confrontação',
        category: 'Intensidade',
        description: 'Enfoque seus olhos com máxima tensão no compasso, sobrancelhas levemente franzidas, mas sem perder a elegância do contorno facial. Seus golpes de braços e rolls devem ser cortados com precisão cirúrgica, encarando seu próprio reflexo.',
        prompt: 'Você está na final de uma batalha de morte na pista. Defenda sua arte com fogo no olhar e gesticulação firme.',
        pioneerQuote: '"Na batalha, seu rosto conta a história da resistência. Use a dor do passado e converta-a em poder sobre o compasso." — Outrageous Waackers'
      },
      {
        title: 'O Mistério / A Máscara',
        category: 'Mistério',
        description: 'Utilize seus braços para tapar parcialmente o rosto em cortes rítmicos rápidos. Descubra um olho no tempo 1, tape a boca no tempo 4, descubra o perfil completo no tempo 7. Jogue a ser indecifrável.',
        prompt: 'Dance como se estivesse usando uma máscara veneziana invisível. Revele suas expressões faciais apenas em momentos-chave.',
        pioneerQuote: '"Esconda seus olhos, oculte sua dor. Deixe que o mistério atraia o espectador e seu corpo fale por você." — Vintage Hollywood Style'
      },
      {
        title: 'Êxtase Disco & Celebração',
        category: 'Felicidade',
        description: 'Abra seus olhos de par en par com regozijo, esboce um sorriso autêntico e radiante, levante seus ombros em júbilo e projete uma vibra festiva selvagem, emulando a energia libertadora dos clubes underground de 1975.',
        prompt: 'Sinta a liberdade absoluta da música disco. É pura celebração da vida, desinibição e gozo absoluto.',
        pioneerQuote: '"Dançamos porque nos amamos. Dançamos porque somos livres. Que seu rosto irradie a luz de uma supernova de felicidade." — Studio 54 Legends'
      }
    ]
  };

  const currentList = localDb[lang] || localDb['es'];
  return {
    ...stim,
    title: currentList[idx]?.title || stim.title,
    category: currentList[idx]?.category || stim.category,
    description: currentList[idx]?.description || stim.description,
    prompt: currentList[idx]?.prompt || stim.prompt,
    pioneerQuote: currentList[idx]?.pioneerQuote || stim.pioneerQuote
  };
};

const getSpotifyEmbedUrl = (url: string) => {
  if (!url) return '';
  try {
    const cleaned = url.trim();
    if (cleaned.includes('spotify.com/embed/')) {
      return cleaned;
    }
    const match = cleaned.match(/spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
    if (match) {
      const type = match[1];
      const id = match[2];
      return `https://open.spotify.com/embed/${type}/${id}`;
    }
  } catch (e) {
    console.error("Error parsing Spotify URL", e);
  }
  return '';
};

export default function EntrenamientoView({
  currentUser,
  playlists,
  feedbackItems,
  onAddFeedbackItem,
  onAddCorrection,
  onAddBonusPoints,
  onLogPractice,
  language,
  onUserChange,
  trainingBpm,
  onBpmChange,
  theme,
  onOpenSpotifyPlayer
}: EntrenamientoViewProps) {
  const [subTab, setSubTab] = useState<'drill' | 'battle' | 'playlists' | 'combos' | 'sensorial' | 'feedback' | 'somatic' | 'drama' | 'rhythm' | 'spectrum' | 'musicality' | 'pose_lab' | 'trazos'>('musicality');

  // 9. DRAMA & EXPRESSION LAB STATE
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [activeStimulusIndex, setActiveStimulusIndex] = useState(0);
  const [activeCameraFilter, setActiveCameraFilter] = useState<'normal' | 'gold' | 'noir' | 'neon' | 'vaporwave'>('normal');
  const [isMirrored, setIsMirrored] = useState(true);
  const [isDramaPracticing, setIsDramaPracticing] = useState(false);
  const [dramaTimer, setDramaTimer] = useState(45);
  const [showFaceGuide, setShowFaceGuide] = useState(true);
  const [dramaPointsAwarded, setDramaPointsAwarded] = useState(false);
  const [directorCue, setDirectorCue] = useState<string>(() => {
    const welcomeCues: Record<Language, string> = {
      es: "¡Presiona el botón para recibir un desafío del director de escena!",
      en: "Press the button to receive a challenge from the scene director!",
      ko: "무대 감독의 도전 과제를 받으려면 버튼을 누르세요!",
      ja: "舞台ディレクターからのチャレンジを受け取るにはボタンを押してください！",
      pt: "Pressione o botão para receber um desafio do diretor de cena!"
    };
    return welcomeCues[language] || welcomeCues['es'];
  });

  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<TrainingSessionSummary | null>(null);

  const triggerSummary = (data: TrainingSessionSummary) => {
    setSessionSummary(data);
    setSummaryModalOpen(true);
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<any>(null);

  // Camera stream handler
  useEffect(() => {
    async function startCamera() {
      if (cameraActive) {
        setCameraError(null);
        try {
          if (!navigator?.mediaDevices?.getUserMedia) {
            throw new Error("MediaDevices non supported");
          }
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480, facingMode: 'user' }, 
            audio: false 
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(err => console.log("Video play failed:", err));
          }
        } catch (err: any) {
          console.warn("Webcam access notice:", err?.message || err);
          setCameraError(
            err?.name === 'NotAllowedError' || err?.message?.includes('Permission denied')
              ? "Permiso de cámara denegado. Por favor habilita el acceso en tu navegador."
              : "No se pudo iniciar la cámara. Verifica que no esté en uso por otra app y que tengas permisos habilitados."
          );
          setCameraActive(false);
        }
      } else {
        stopCamera();
      }
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [cameraActive]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Drama practice timer handler
  useEffect(() => {
    if (isDramaPracticing) {
      setDramaTimer(45);
      setDramaPointsAwarded(false);
      timerRef.current = setInterval(() => {
        setDramaTimer(prev => {
          const next = prev - 1;
          if (next <= 0) {
            clearInterval(timerRef.current);
            setTimeout(() => {
              setIsDramaPracticing(false);
              if (onAddBonusPoints) {
                onAddBonusPoints(50);
              }
              if (onLogPractice) {
                onLogPractice(1, 'sensorial', `Práctica en Lab de Expresión: ${VISUAL_STIMULI[activeStimulusIndex]?.title || 'Estímulo Dramático'}`);
              }
              setDramaPointsAwarded(true);
              playSynthBeep(1200, 0.3);
              setTimeout(() => {
                playSynthBeep(1500, 0.4);
              }, 150);

              triggerSummary({
                durationSeconds: 45,
                activityType: `Lab de Expresión: ${VISUAL_STIMULI[activeStimulusIndex]?.title || 'Estímulo Dramático'}`,
                pointsEarned: 50,
                details: 'Liderazgo de mirada, intención escénica y control de proyección',
                category: 'drama'
              });
            }, 0);
            return 0;
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isDramaPracticing, activeStimulusIndex]);

  const generateDirectorCue = () => {
    const cues = DIRECTOR_CUES[language] || DIRECTOR_CUES['es'];
    const randomCue = cues[Math.floor(Math.random() * cues.length)];
    setDirectorCue(randomCue);
    playSynthBeep(900, 0.05);
  };

  // Audio Context for synthetic synthesizer beats
  const audioCtxRef = useRef<AudioContext | null>(null);

  // 1. DRILL STATE
  const [drillBpm, setDrillBpm] = useState(115);
  const [drillDuration, setDrillDuration] = useState(60); // seconds
  const [timeLeft, setTimeLeft] = useState(60);
  const [isDrillRunning, setIsDrillRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentPrompt, setCurrentPrompt] = useState("¡DALE PLAY AL DRILL PARA EMPEZAR!");
  const [beatCount, setBeatCount] = useState(0);

  // Sync external header BPM when provided
  useEffect(() => {
    if (trainingBpm && trainingBpm >= 60 && trainingBpm <= 220) {
      setDrillBpm(trainingBpm);
      setBattleBpm(trainingBpm);
      setScBpm(trainingBpm);
      setTapChallengeBpm(trainingBpm);
      setComboPracticeBpm(trainingBpm);
    }
  }, [trainingBpm]);

  // Update standby prompt when language changes
  useEffect(() => {
    if (!isDrillRunning) {
      const standbyMsg = 
        language === 'es' ? "¡DALE PLAY AL DRILL PARA EMPEZAR!" :
        language === 'ko' ? "트레이닝을 시작하려면 플레이를 누르세요!" :
        language === 'ja' ? "練習を開始するにはプレイを押してください！" :
        language === 'pt' ? "DÊ PLAY NO DRILL PARA COMEÇAR!" :
        "PRESS PLAY ON THE DRILL TO START!";
      setCurrentPrompt(standbyMsg);
    }
  }, [language, isDrillRunning]);
  const [flashBeat, setFlashBeat] = useState(false);
  const [markingMode, setMarkingMode] = useState<'beat' | 'voice' | 'both' | 'strong' | 'weak'>('beat');

  // 2. PLAYLIST STATE
  const [isPlayingPlaylist, setIsPlayingPlaylist] = useState(false);
  const [activeTrack, setActiveTrack] = useState<PlaylistItem>(playlists[0]);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.75 | 1 | 1.25>(1);
  const [playlistProgress, setPlaylistProgress] = useState(15);

  // 4. SOUNDCLOUD PLAYER & SYNC ENGINE STATE
  const [playlistMode, setPlaylistMode] = useState<'local' | 'spotify' | 'soundcloud' | 'drive'>('local');
  const [soundCloudUrl, setSoundCloudUrl] = useState('https://soundcloud.com/dj-marcelo-1/classic-disco-mix-vol-1');
  const [soundCloudIframeUrl, setSoundCloudIframeUrl] = useState('');
  const [scBpm, setScBpm] = useState(120);
  const [isScPlaying, setIsScPlaying] = useState(false);
  const [scBeatCount, setScBeatCount] = useState(0);
  const [scMarkingMode, setScMarkingMode] = useState<'visual-only' | 'metronome' | 'voice' | 'both'>('visual-only');
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [scPulse, setScPulse] = useState(false);

  // 5. RHYTHM & OBJECTIVE CHALLENGE STATE (Improved Music-Synced Battle)
  const [selectedThemeId, setSelectedThemeId] = useState<string>('theme-monroe');
  const localizedThemes = LOCALIZED_OBJECTIVE_THEMES[language] || LOCALIZED_OBJECTIVE_THEMES['es'];
  const selectedTheme = localizedThemes.find(t => t.id === selectedThemeId) || localizedThemes[0];

  const [musicSource, setMusicSource] = useState<'synth' | 'spotify' | 'soundcloud'>('synth');
  const [customSpotifyUrl, setCustomSpotifyUrl] = useState('');
  const [spotifyEmbedUrl, setSpotifyEmbedUrl] = useState('https://open.spotify.com/embed/playlist/37i9dQZF1DX6XNisNdE8g6');
  const [customSoundcloudUrl, setCustomSoundcloudUrl] = useState('');
  const [soundcloudEmbedUrl, setSoundcloudEmbedUrl] = useState('https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1149455353&color=%239a2b3c&auto_play=false&hide_related=true&show_comments=false');
  const [bassIntensity, setBassIntensity] = useState<number>(3);

  const [battleDuration, setBattleDuration] = useState<30 | 45 | 60 | 120>(45);
  const [battleTimeLeft, setBattleTimeLeft] = useState(45);
  const [isBattleActive, setIsBattleActive] = useState(false);
  const [battleRound, setBattleRound] = useState<'none' | 'running' | 'ended'>('none');
  const [checkedObjectives, setCheckedObjectives] = useState<{ [key: string]: boolean }>({});
  const [hasSavedPoints, setHasSavedPoints] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [battleBpm, setBattleBpm] = useState(118);
  const [pulseBeat, setPulseBeat] = useState(false);
  const [liveCue, setLiveCue] = useState('¡Empieza con energía!');

  const visualizerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (battleRound !== 'running' || !isBattleActive) return;
    
    let animationId: number;
    
    const animate = () => {
      if (!visualizerRef.current) {
        animationId = requestAnimationFrame(animate);
        return;
      }
      
      const bars = visualizerRef.current.children;
      const time = Date.now() * 0.003;
      
      for (let i = 0; i < bars.length; i++) {
        const bar = bars[i] as HTMLDivElement;
        if (!bar) continue;
        
        // Calculate a base wave height
        let heightVal = 10 + Math.sin(time + i * 0.5) * 20;
        
        // Add random jitter
        heightVal += Math.random() * 15;
        
        // Low-frequency/Bass channels are the first 6 bars
        const isBass = i < 6;
        if (isBass) {
          // Boost bass bars during metronome beat pulse
          if (pulseBeat) {
            heightVal += 45 * (bassIntensity / 3);
          } else {
            heightVal += 10 * (bassIntensity / 3);
          }
        } else {
          // High frequency/intensity bars
          heightVal += (Math.sin(time * 2 + i) * 8 + Math.random() * 5) * (bassIntensity / 3);
        }
        
        // Constrain heights
        const finalHeight = Math.max(4, Math.min(80, heightVal));
        bar.style.height = `${finalHeight}%`;
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [battleRound, isBattleActive, pulseBeat, bassIntensity]);
  const [battleWinner, setBattleWinner] = useState<'user' | 'rival' | 'draw' | null>(null); // Kept for backwards compatibility
  const [selectedRival, setSelectedRival] = useState(RIVALS[0]); // Kept for type compatibility
  const [battleLogs, setBattleLogs] = useState<string[]>([]); // Kept for state compatibility
  const [battleScores, setBattleScores] = useState<{ user: number; rival: number } | null>(null); // Kept for compatibility
  const [battleVerdict, setBattleVerdict] = useState<string>(''); // Kept for compatibility
  const [battleConstraint, setBattleConstraint] = useState<string>('¡PREPÁRATE!'); // Kept for compatibility
  const [battleJudgeDetails, setBattleJudgeDetails] = useState<{ name: string; criteria: string; comment: string }[]>([]); // Kept for compatibility

  // 6. SOMATIC ALIGNMENT / TAP SYNC CHALLENGE STATE
  const [tapChallengeBpm, setTapChallengeBpm] = useState(120);
  const [tapChallengeStatus, setTapChallengeStatus] = useState<'idle' | 'countdown' | 'tapping' | 'ended'>('idle');
  const [tapCountdownVal, setTapCountdownVal] = useState(4);
  const [userTaps, setUserTaps] = useState<number[]>([]);
  const [tapSyncResult, setTapSyncResult] = useState<{ avgBpm: number; deviationMs: number; score: number; precision: number } | null>(null);

  // 7. COMBO PLANNER STATE
  const [comboArmsIdx, setComboArmsIdx] = useState(0);
  const [comboBodyIdx, setComboBodyIdx] = useState(0);
  const [comboFeetIdx, setComboFeetIdx] = useState(0);
  const [comboAttitudeIdx, setComboAttitudeIdx] = useState(0);

  const currentComboArms = LOCALIZED_COMBO_ARMS[language] || LOCALIZED_COMBO_ARMS['es'];
  const currentComboBody = LOCALIZED_COMBO_BODY[language] || LOCALIZED_COMBO_BODY['es'];
  const currentComboFeet = LOCALIZED_COMBO_FEET[language] || LOCALIZED_COMBO_FEET['es'];
  const currentComboAttitude = LOCALIZED_COMBO_ATTITUDE[language] || LOCALIZED_COMBO_ATTITUDE['es'];

  const comboArms = currentComboArms[comboArmsIdx] || currentComboArms[0];
  const comboBody = currentComboBody[comboBodyIdx] || currentComboBody[0];
  const comboFeet = currentComboFeet[comboFeetIdx] || currentComboFeet[0];
  const comboAttitude = currentComboAttitude[comboAttitudeIdx] || currentComboAttitude[0];
  const [comboPracticeActive, setComboPracticeActive] = useState(false);
  const [comboTimeLeft, setComboTimeLeft] = useState(60);
  const [comboBeatCount, setComboBeatCount] = useState(0);
  const [comboFlash, setComboFlash] = useState(false);
  const [comboPracticeBpm, setComboPracticeBpm] = useState(128);

  // 8. SOMATIC FRAME ANNOTATOR STATE
  const [somaticDancerIndex, setSomaticDancerIndex] = useState(0);
  const [joints, setJoints] = useState({
    handLeft: { x: 13, y: 58 },
    elbowLeft: { x: 21, y: 42 },
    shoulderLeft: { x: 32, y: 35 },
    chest: { x: 44, y: 28 },
    shoulderRight: { x: 53, y: 35 },
    elbowRight: { x: 69, y: 27 },
    handRight: { x: 85, y: 18 },
  });
  const [somaticFeltSense, setSomaticFeltSense] = useState(
    "Siento los brazos proyectados desde el centro del esternón. La extensión asimétrica genera una línea de torsión que estabiliza mi postura y me ancla en el piso."
  );
  const [gridVisible, setGridVisible] = useState(true);
  const [layersVisible, setLayersVisible] = useState(true);
  const [inspectorActive, setInspectorActive] = useState(true);
  const [recordingFrameName, setRecordingFrameName] = useState("FRM_0824_X");
  
  // --- SOMATIC VIDEO AI MOVEMENT ASSISTANT STATE ---
  const [userJoints, setUserJoints] = useState({
    handLeft: { x: 18, y: 62 },
    elbowLeft: { x: 25, y: 45 },
    shoulderLeft: { x: 34, y: 36 },
    chest: { x: 45, y: 30 },
    shoulderRight: { x: 54, y: 36 },
    elbowRight: { x: 67, y: 31 },
    handRight: { x: 80, y: 22 },
  });
  const [activeDragUserJoint, setActiveDragUserJoint] = useState<string | null>(null);
  const [somaticCameraActive, setSomaticCameraActive] = useState(false);
  const [somaticCameraError, setSomaticCameraError] = useState<string | null>(null);
  const [motionTrackingEnabled, setMotionTrackingEnabled] = useState(true);
  const [liveMotionLevel, setLiveMotionLevel] = useState(0);
  const [somaticReferenceVideoPreset, setSomaticReferenceVideoPreset] = useState(0);
  const [somaticReferenceVideo, setSomaticReferenceVideo] = useState('https://assets.mixkit.co/videos/preview/mixkit-vintage-retro-neon-style-dancing-girl-44026-large.mp4');
  const [somaticUploadedVideo, setSomaticUploadedVideo] = useState<string | null>(null);
  const [somaticAiAnalyzing, setSomaticAiAnalyzing] = useState(false);

  const [somaticDiary, setSomaticDiary] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('waacking_somatic_diary') || localStorage.getItem('waackon_somatic_diary');
      if (!saved) {
        return [
          {
            id: 'sd-1',
            date: '2026-07-12',
            poseClassification: 'High-Low Extension',
            confidence: 98.4,
            feltSense: 'Alargamiento extremo cruzado. Sensación de empujar el aire con la mano superior mientras jalo con la inferior.',
            symmetry: 84,
            fluidity: 92,
            elbowAngle: 164.2,
            torque: 12,
            poseImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800'
          }
        ];
      }
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // 3. FEEDBACK FORUM STATE
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoDesc, setNewVideoDesc] = useState('');

  // Comment/Correction fields
  const [correctionText, setCorrectionText] = useState<{ [key: string]: string }>({});
  const [correctionTime, setCorrectionTime] = useState<{ [key: string]: string }>({});

  // Web Audio synth click generator
  const playSynthBeep = (frequency: number, duration = 0.08) => {
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
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context block or not supported.", e);
    }
  };

  // Voice speaker for dance counting (accepts customizable BPM rate speed)
  const speakCount = (num: number, bpm: number = 115) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const words = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho"];
        const utterance = new SpeechSynthesisUtterance(words[num] || num.toString());
        utterance.lang = 'es-ES';
        // Speed up the speaking rate to match high BPMs
        utterance.rate = bpm > 130 ? 1.65 : bpm > 118 ? 1.5 : bpm > 105 ? 1.35 : 1.2;
        utterance.pitch = 1.05;
        utterance.volume = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn("Speech synthesis blocked or not supported", e);
    }
  };

  // Tap Tempo Algorithm
  const handleTapTempo = () => {
    const now = Date.now();
    setTapTimes((prev) => {
      // If the last tap was more than 2.5s ago, start fresh
      const filtered = prev.filter(t => now - t < 2500);
      const newTaps = [...filtered, now];
      
      if (newTaps.length > 1) {
        let sum = 0;
        for (let i = 1; i < newTaps.length; i++) {
          sum += (newTaps[i] - newTaps[i-1]);
        }
        const avgInterval = sum / (newTaps.length - 1);
        const calculatedBpm = Math.round(60000 / avgInterval);
        // Only update if it's within a sensible dance range (60 - 200 BPM)
        if (calculatedBpm >= 60 && calculatedBpm <= 200) {
          setTimeout(() => setScBpm(calculatedBpm), 0);
        }
      }
      return newTaps;
    });
  };

  // Sync SoundCloud Iframe url
  useEffect(() => {
    if (soundCloudUrl) {
      const encodedUrl = encodeURIComponent(soundCloudUrl.trim());
      setSoundCloudIframeUrl(
        `https://w.soundcloud.com/player/?url=${encodedUrl}&color=%23ff2d55&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`
      );
    }
  }, [soundCloudUrl]);

  // SoundCloud Sync Timer Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScPlaying && scBpm > 0) {
      const intervalMs = (60 / scBpm) * 1000;
      
      interval = setInterval(() => {
        setScBeatCount((prev) => {
          const nextBeat = (prev % 8) + 1; // 1 to 8 counts
          
          let playSound = false;
          let playVoice = false;
          
          if (scMarkingMode === 'metronome' || scMarkingMode === 'both') {
            playSound = true;
          }
          if (scMarkingMode === 'voice' || scMarkingMode === 'both') {
            playVoice = true;
          }
          
          if (playSound) {
            if (nextBeat === 1) {
              playSynthBeep(980, 0.12); // Accent on beat 1
            } else {
              playSynthBeep(580, 0.06); // Standard softer click
            }
          }
          
          if (playVoice) {
            speakCount(nextBeat, scBpm);
          }
          
          setTimeout(() => {
            setScPulse(true);
            setTimeout(() => setScPulse(false), 120);
          }, 0);
          
          return nextBeat;
        });
      }, intervalMs);
    } else {
      setScBeatCount(0);
    }
    
    return () => clearInterval(interval);
  }, [isScPlaying, scBpm, scMarkingMode]);

  // Beat tick timer for Drill
  useEffect(() => {
    let tickInterval: NodeJS.Timeout;
    let clockInterval: NodeJS.Timeout;

    if (isDrillRunning) {
      const beatMs = 60000 / drillBpm;

      // Seconds clock countdown
      clockInterval = setInterval(() => {
        setTimeLeft((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            setTimeout(() => {
              setIsDrillRunning(false);
              const completionMsg = 
                language === 'es' ? "¡ENTRENAMIENTO COMPLETADO! Gran trabajo 🔥" :
                language === 'ko' ? "트레이닝 완료! 아주 잘하셨습니다 🔥" :
                language === 'ja' ? "トレーニング完了！お疲れ様でした 🔥" :
                language === 'pt' ? "TREINAMENTO CONCLUÍDO! Bom trabalho 🔥" :
                "TRAINING COMPLETED! Great job 🔥";
              setCurrentPrompt(completionMsg);
              const pointsEarned = Math.max(20, Math.ceil(drillDuration / 60) * 20);
              if (onAddBonusPoints) {
                onAddBonusPoints(pointsEarned);
              }
              if (onLogPractice) {
                const logMsg = 
                  language === 'es' ? `Drill completado a ${drillBpm} BPM durante ${drillDuration} segundos` :
                  `Drill completed at ${drillBpm} BPM for ${drillDuration} seconds`;
                onLogPractice(Math.ceil(drillDuration / 60), 'drill', logMsg);
              }
              triggerSummary({
                durationSeconds: drillDuration,
                activityType: `Drill de Velocidad (${drillBpm} BPM)`,
                pointsEarned: pointsEarned,
                details: `Marcación ${markingMode.toUpperCase()} • Ritmo metronómico a ${drillBpm} BPM`,
                category: 'drill'
              });
            }, 0);
            return 0;
          }
          return next;
        });
      }, 1000);

      // Sound and flash tickers synced to BPM (using 8 counts)
      tickInterval = setInterval(() => {
        setBeatCount((prev) => {
          const nextBeat = (prev % 8) + 1; // 1, 2, 3, 4, 5, 6, 7, 8
          
          let playSound = false;
          let playVoice = false;

          if (soundEnabled) {
            if (markingMode === 'beat') {
              playSound = true;
            } else if (markingMode === 'voice') {
              playVoice = true;
            } else if (markingMode === 'both') {
              playSound = true;
              playVoice = true;
            } else if (markingMode === 'strong') {
              // Odd beats: 1, 3, 5, 7
              if (nextBeat % 2 !== 0) {
                playSound = true;
                playVoice = true;
              }
            } else if (markingMode === 'weak') {
              // Even beats: 2, 4, 6, 8
              if (nextBeat % 2 === 0) {
                playSound = true;
                playVoice = true;
              }
            }
          }

          if (playSound) {
            if (nextBeat === 1) {
              playSynthBeep(950, 0.12); // Accent on beat 1
            } else {
              playSynthBeep(550, 0.06); // Softer standard clicks
            }
          }

          if (playVoice) {
            speakCount(nextBeat, drillBpm);
          }

          // Visual beat trigger & prompt update
          setTimeout(() => {
            setFlashBeat(true);
            setTimeout(() => setFlashBeat(false), 100);

            if (nextBeat === 1) {
              const list = LOCALIZED_DRILL_INSTRUCTIONS[language] || LOCALIZED_DRILL_INSTRUCTIONS.es;
              const idx = Math.floor(Math.random() * list.length);
              setCurrentPrompt(list[idx]);
            }
          }, 0);

          return nextBeat;
        });
      }, beatMs);
    } else {
      setBeatCount(0);
    }

    return () => {
      clearInterval(tickInterval);
      clearInterval(clockInterval);
    };
  }, [isDrillRunning, drillBpm, soundEnabled, markingMode]);

  const handleStartDrill = () => {
    // Resume context if needed
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    if (isDrillRunning) {
      setIsDrillRunning(false);
      const elapsed = drillDuration - timeLeft;
      if (elapsed >= 5) {
        const pointsEarned = Math.max(10, Math.ceil(elapsed / 60) * 15);
        if (onAddBonusPoints) {
          onAddBonusPoints(pointsEarned);
        }
        triggerSummary({
          durationSeconds: elapsed,
          activityType: `Drill de Velocidad (${drillBpm} BPM)`,
          pointsEarned: pointsEarned,
          details: `Sesión de drill detenida • ${elapsed}s practicados a ${drillBpm} BPM`,
          category: 'drill'
        });
      }
    } else {
      setTimeLeft(drillDuration);
      setCurrentPrompt("¡COMIENZA EL DRILL! Sigue el ritmo...");
      setIsDrillRunning(true);
    }
  };

  // Simulated Playlist Player Progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingPlaylist) {
      // Speed multiplier
      const tickRate = playbackSpeed === 0.75 ? 1300 : playbackSpeed === 1.25 ? 700 : 1000;
      interval = setInterval(() => {
        setPlaylistProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, tickRate);
    }
    return () => clearInterval(interval);
  }, [isPlayingPlaylist, playbackSpeed]);

  // Playlist track selection helper
  const handleSelectTrack = (track: PlaylistItem) => {
    setActiveTrack(track);
    setIsPlayingPlaylist(true);
    setPlaylistProgress(0);
  };

  // --- MUSIC-SYNCED OBJECTIVE CHALLENGE ENGINE ---
  useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    let tickInterval: NodeJS.Timeout;

    if (isBattleActive) {
      const beatMs = 60000 / battleBpm;

      // Seconds Countdown Timer
      timerInterval = setInterval(() => {
        setBattleTimeLeft((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            // End of practice round!
            setTimeout(() => {
              setIsBattleActive(false);
              setBattleRound('ended');
              setCheckedObjectives({});
              setHasSavedPoints(false);
              playSynthBeep(900, 0.15);
              setTimeout(() => {
                playSynthBeep(1200, 0.25);
              }, 100);
            }, 0);
            return 0;
          }
          return next;
        });
      }, 1000);

      // Metronome and Cue Generator
      let localBeat = 0;
      tickInterval = setInterval(() => {
        // Play synth metronome beep if selected
        if (musicSource === 'synth') {
          playSynthBeep(650, 0.04);
        }

        // Trigger visual pulse
        setPulseBeat(true);
        setTimeout(() => setPulseBeat(false), 120);

        localBeat++;
        if (localBeat % 8 === 0) {
          const cues = [
            "¡Mantén los hombros bajos y estira bien los codos! ✨",
            "¡Fija la pose en el Tiempo 1 con determinación! 📸",
            "¡No descuides la mirada dramática al espejo! 🎭",
            "¡Coordina los rolls con tu respiración! 💨",
            "¡Asegura los acentos secos en los tiempos 2 y 4! ⚡",
            "¡Aprovecha todo el rango de movimiento de tus brazos! 👑",
            "¡Controla el descenso de niveles usando tu core! 📉",
            "¡Varía entre rolls de un solo brazo y rolls asimétricos! 🔄"
          ];
          const randomCue = cues[Math.floor(Math.random() * cues.length)];
          setLiveCue(randomCue);
        }
      }, beatMs);
    }

    return () => {
      clearInterval(timerInterval);
      clearInterval(tickInterval);
    };
  }, [isBattleActive, battleBpm, musicSource]);

  const startBattle = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    setBattleTimeLeft(battleDuration);
    setCheckedObjectives({});
    setHasSavedPoints(false);
    setEarnedPoints(0);
    setLiveCue('¡Inicia con intensidad! Sigue la métrica musical.');
    setBattleBpm(selectedTheme.bpm);
    setBattleRound('running');
    setIsBattleActive(true);
  };

  const stopBattle = () => {
    setIsBattleActive(false);
    setBattleRound('none');
  };

  const handleSaveChallengeScore = () => {
    if (hasSavedPoints) return;
    
    // Calculate final points from checked objectives
    let pointsEarned = 0;
    selectedTheme.objectives.forEach(obj => {
      if (checkedObjectives[obj.id]) {
        pointsEarned += obj.points;
      }
    });

    // Add consistency bonus if all completed
    const allCompleted = selectedTheme.objectives.every(obj => checkedObjectives[obj.id]);
    if (allCompleted) {
      pointsEarned += 20; // Perfect score bonus
    }

    setEarnedPoints(pointsEarned);
    setHasSavedPoints(true);

    if (onAddBonusPoints && pointsEarned > 0) {
      onAddBonusPoints(pointsEarned);
    }

    if (onLogPractice && selectedTheme) {
      const mins = Math.ceil(battleDuration / 60);
      const complCount = (selectedTheme.objectives || []).filter(obj => checkedObjectives[obj.id]).length;
      onLogPractice(
        mins, 
        'battle', 
        `Reto de Objetivos (${selectedTheme.name}) - Completó ${complCount}/${(selectedTheme.objectives || []).length} objetivos. Puntos ganados: +${pointsEarned}`
      );
    }

    const complCount = selectedTheme ? (selectedTheme.objectives || []).filter(obj => checkedObjectives[obj.id]).length : 0;
    const totalObjs = selectedTheme ? (selectedTheme.objectives || []).length : 0;
    triggerSummary({
      durationSeconds: battleDuration,
      activityType: `Reto de Objetivos: ${selectedTheme?.name || 'Waack Challenge'}`,
      pointsEarned: pointsEarned > 0 ? pointsEarned : 15,
      details: `${complCount} de ${totalObjs} objetivos cumplidos${allCompleted ? ' • ¡Bonus Puntuación Perfecta!' : ''}`,
      category: 'battle'
    });
  };

  // --- SOMATIC TAP CHALLENGE COUNTDOWN ---
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;
    if (tapChallengeStatus === 'countdown') {
      countdownInterval = setInterval(() => {
        setTapCountdownVal((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            clearInterval(countdownInterval);
            setTimeout(() => {
              setTapChallengeStatus('tapping');
              setUserTaps([]);
            }, 0);
            return 0;
          }
          // Play click for count
          playSynthBeep(880, 0.1);
          return next;
        });
      }, 60000 / tapChallengeBpm);
    }
    return () => clearInterval(countdownInterval);
  }, [tapChallengeStatus, tapChallengeBpm]);

  const handleTapChallengeButton = () => {
    if (tapChallengeStatus !== 'tapping') return;
    
    // Play a soft sound confirmation for the tap
    playSynthBeep(1200, 0.03);

    const now = Date.now();
    setUserTaps((prev) => {
      const nextTaps = [...prev, now];
      
      // We evaluate after 8 taps
      if (nextTaps.length === 8) {
        setTimeout(() => {
          evaluateTapChallenge(nextTaps);
        }, 300);
      }
      return nextTaps;
    });
  };

  const evaluateTapChallenge = (taps: number[]) => {
    setTapChallengeStatus('ended');
    if (taps.length < 2) return;

    let totalInterval = 0;
    const intervals: number[] = [];
    for (let i = 1; i < taps.length; i++) {
      const diff = taps[i] - taps[i - 1];
      intervals.push(diff);
      totalInterval += diff;
    }
    
    const avgInterval = totalInterval / (taps.length - 1);
    const measuredBpm = Math.round(60000 / avgInterval);
    const idealInterval = 60000 / tapChallengeBpm;
    
    // Calculate mean absolute deviation
    let deviationSum = 0;
    intervals.forEach((interval) => {
      deviationSum += Math.abs(interval - idealInterval);
    });
    const avgDeviationMs = Math.round(deviationSum / intervals.length);

    // Score out of 100
    const precisionPercentage = Math.max(0, Math.round(100 - (avgDeviationMs / idealInterval) * 100));
    
    let bonus = 10;
    if (precisionPercentage >= 95) bonus = 60;
    else if (precisionPercentage >= 88) bonus = 40;
    else if (precisionPercentage >= 75) bonus = 25;

    setTapSyncResult({
      avgBpm: measuredBpm,
      deviationMs: avgDeviationMs,
      precision: precisionPercentage,
      score: bonus
    });

    if (onAddBonusPoints) onAddBonusPoints(bonus);
    if (onLogPractice) {
      onLogPractice(2, 'sensorial', `Espejo Ciego: Desafío de propiocepción a ${tapChallengeBpm} BPM (Precisión: ${precisionPercentage}%)`);
    }
  };

  const startTapChallenge = () => {
    setTapChallengeStatus('countdown');
    setTapCountdownVal(4);
    setTapSyncResult(null);
    setUserTaps([]);
    // Play the first beep immediately
    playSynthBeep(880, 0.15);
  };

  // --- COMBO PRACTICE ENGINE ---
  useEffect(() => {
    let tickInterval: NodeJS.Timeout;
    let clockInterval: NodeJS.Timeout;

    if (comboPracticeActive) {
      const beatMs = 60000 / comboPracticeBpm;

      clockInterval = setInterval(() => {
        setComboTimeLeft((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            setTimeout(() => {
              setComboPracticeActive(false);
              if (onAddBonusPoints) onAddBonusPoints(50); // Completed practice combo points
              if (onLogPractice) {
                onLogPractice(1, 'combo', `Combo Draft practicado a ${comboPracticeBpm} BPM: ${comboArms} + ${comboBody}`);
              }
            }, 0);
            return 0;
          }
          return next;
        });
      }, 1000);

      tickInterval = setInterval(() => {
        setComboBeatCount((prev) => {
          const next = (prev % 8) + 1;
          
          // click sound
          if (next === 1) {
            playSynthBeep(990, 0.12);
          } else {
            playSynthBeep(600, 0.05);
          }
          
          setTimeout(() => {
            setComboFlash(true);
            setTimeout(() => setComboFlash(false), 90);
          }, 0);

          return next;
        });
      }, beatMs);
    } else {
      setComboBeatCount(0);
    }

    return () => {
      clearInterval(tickInterval);
      clearInterval(clockInterval);
    };
  }, [comboPracticeActive, comboPracticeBpm]);

  const generateRandomCombo = () => {
    setComboArmsIdx(Math.floor(Math.random() * currentComboArms.length));
    setComboBodyIdx(Math.floor(Math.random() * currentComboBody.length));
    setComboFeetIdx(Math.floor(Math.random() * currentComboFeet.length));
    setComboAttitudeIdx(Math.floor(Math.random() * currentComboAttitude.length));
    
    // Play a random synth confirm sound
    playSynthBeep(800, 0.08);
    setTimeout(() => playSynthBeep(1100, 0.08), 80);
  };

  // --- SOMATIC FRAME ANNOTATOR DRAG & DROP LOGIC ---
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeDragJoint, setActiveDragJoint] = useState<string | null>(null);

  const handleJointMouseDown = (jointKey: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveDragJoint(jointKey);
  };

  useEffect(() => {
    if (!activeDragJoint) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = Math.max(2, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(2, Math.min(98, ((e.clientY - rect.top) / rect.height) * 100));

      setJoints(prev => ({
        ...prev,
        [activeDragJoint]: { x, y }
      }));
    };

    const handleMouseUp = () => {
      setActiveDragJoint(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeDragJoint]);

  const handleJointTouchStart = (jointKey: string) => (e: React.TouchEvent) => {
    setActiveDragJoint(jointKey);
  };

  useEffect(() => {
    if (!activeDragJoint) return;

    const handleTouchMove = (e: TouchEvent) => {
      const container = containerRef.current;
      if (!container) return;

      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = container.getBoundingClientRect();
      const x = Math.max(2, Math.min(98, ((touch.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(2, Math.min(98, ((touch.clientY - rect.top) / rect.height) * 100));

      setJoints(prev => ({
        ...prev,
        [activeDragJoint]: { x, y }
      }));
    };

    const handleTouchEnd = () => {
      setActiveDragJoint(null);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeDragJoint]);

  // --- USER JOINTS DRAG & DROP LOGIC ---
  const userCameraContainerRef = useRef<HTMLDivElement>(null);

  const handleUserJointMouseDown = (jointKey: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveDragUserJoint(jointKey);
  };

  useEffect(() => {
    if (!activeDragUserJoint) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = userCameraContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = Math.max(2, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(2, Math.min(98, ((e.clientY - rect.top) / rect.height) * 100));

      setUserJoints(prev => ({
        ...prev,
        [activeDragUserJoint]: { x, y }
      }));
    };

    const handleMouseUp = () => {
      setActiveDragUserJoint(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeDragUserJoint]);

  const handleUserJointTouchStart = (jointKey: string) => (e: React.TouchEvent) => {
    setActiveDragUserJoint(jointKey);
  };

  useEffect(() => {
    if (!activeDragUserJoint) return;

    const handleTouchMove = (e: TouchEvent) => {
      const container = userCameraContainerRef.current;
      if (!container) return;

      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = container.getBoundingClientRect();
      const x = Math.max(2, Math.min(98, ((touch.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(2, Math.min(98, ((touch.clientY - rect.top) / rect.height) * 100));

      setUserJoints(prev => ({
        ...prev,
        [activeDragUserJoint]: { x, y }
      }));
    };

    const handleTouchEnd = () => {
      setActiveDragUserJoint(null);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeDragUserJoint]);

  const somaticVideoRef = useRef<HTMLVideoElement | null>(null);
  const somaticStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    async function startSomaticCamera() {
      if (somaticCameraActive) {
        setSomaticCameraError(null);
        try {
          if (!navigator?.mediaDevices?.getUserMedia) {
            throw new Error("MediaDevices non supported");
          }
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480, facingMode: 'user' }, 
            audio: false 
          });
          somaticStreamRef.current = stream;
          if (somaticVideoRef.current) {
            somaticVideoRef.current.srcObject = stream;
            somaticVideoRef.current.play().catch(err => console.log("Somatic camera play failed:", err));
          }
        } catch (err: any) {
          console.warn("Somatic webcam access notice:", err?.message || err);
          setSomaticCameraError(
            err?.name === 'NotAllowedError' || err?.message?.includes('Permission denied')
              ? "Permiso de cámara denegado. Puedes usar el simulador postural interactivo."
              : "No se pudo iniciar la cámara. Verifica que no esté en uso por otra app."
          );
          setSomaticCameraActive(false);
        }
      } else {
        stopSomaticCamera();
      }
    }

    startSomaticCamera();

    return () => {
      stopSomaticCamera();
    };
  }, [somaticCameraActive]);

  const stopSomaticCamera = () => {
    if (somaticStreamRef.current) {
      somaticStreamRef.current.getTracks().forEach(track => track.stop());
      somaticStreamRef.current = null;
    }
    if (somaticVideoRef.current) {
      somaticVideoRef.current.srcObject = null;
    }
  };

  // --- REAL-TIME CAMERA MOTION TRACKING ENGINE ---
  const motionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevFrameDataRef = useRef<Uint8ClampedArray | null>(null);

  useEffect(() => {
    if (!somaticCameraActive || !motionTrackingEnabled) {
      setLiveMotionLevel(0);
      return;
    }

    let animFrameId: number;
    let lastTime = 0;

    const processCameraMotion = (time: number) => {
      if (time - lastTime > 80) { // ~12 FPS optical sampling rate
        lastTime = time;
        const video = somaticVideoRef.current;
        if (video && video.readyState >= 2) {
          if (!motionCanvasRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 48;
            motionCanvasRef.current = canvas;
          }

          const canvas = motionCanvasRef.current;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const curr = frameData.data;

            if (prevFrameDataRef.current && prevFrameDataRef.current.length === curr.length) {
              const prev = prevFrameDataRef.current;
              let totalDiff = 0;
              let sumLX = 0, sumLY = 0, countL = 0;
              let sumRX = 0, sumRY = 0, countR = 0;
              let sumCX = 0, sumCY = 0, countC = 0;

              for (let i = 0; i < curr.length; i += 4) {
                const lumCurr = 0.299 * curr[i] + 0.587 * curr[i + 1] + 0.114 * curr[i + 2];
                const lumPrev = 0.299 * prev[i] + 0.587 * prev[i + 1] + 0.114 * prev[i + 2];
                const diff = Math.abs(lumCurr - lumPrev);

                if (diff > 25) {
                  totalDiff += diff;
                  const pixelIndex = i / 4;
                  const px = pixelIndex % canvas.width;
                  const py = Math.floor(pixelIndex / canvas.width);

                  // Relative percentage (mirrored because scale-x-[-1])
                  const pctX = 100 - (px / canvas.width) * 100;
                  const pctY = (py / canvas.height) * 100;

                  if (pctX < 45 && pctY < 75) {
                    sumLX += pctX;
                    sumLY += pctY;
                    countL++;
                  } else if (pctX > 55 && pctY < 75) {
                    sumRX += pctX;
                    sumRY += pctY;
                    countR++;
                  } else if (pctX >= 35 && pctX <= 65 && pctY < 60) {
                    sumCX += pctX;
                    sumCY += pctY;
                    countC++;
                  }
                }
              }

              const calculatedMotion = Math.min(100, Math.round((totalDiff / (canvas.width * canvas.height * 12)) * 100));
              setLiveMotionLevel(calculatedMotion);

              // Dynamically track joints to follow body motion
              if (calculatedMotion > 6) {
                setUserJoints(prevJoints => {
                  const updated = { ...prevJoints };

                  if (countL > 3) {
                    const avgLX = sumLX / countL;
                    const avgLY = sumLY / countL;
                    updated.handLeft = {
                      x: prevJoints.handLeft.x + (avgLX - prevJoints.handLeft.x) * 0.28,
                      y: prevJoints.handLeft.y + (avgLY - prevJoints.handLeft.y) * 0.28
                    };
                    updated.elbowLeft = {
                      x: prevJoints.elbowLeft.x + ((avgLX * 0.7 + prevJoints.shoulderLeft.x * 0.3) - prevJoints.elbowLeft.x) * 0.22,
                      y: prevJoints.elbowLeft.y + ((avgLY * 0.7 + prevJoints.shoulderLeft.y * 0.3) - prevJoints.elbowLeft.y) * 0.22
                    };
                  }

                  if (countR > 3) {
                    const avgRX = sumRX / countR;
                    const avgRY = sumRY / countR;
                    updated.handRight = {
                      x: prevJoints.handRight.x + (avgRX - prevJoints.handRight.x) * 0.28,
                      y: prevJoints.handRight.y + (avgRY - prevJoints.handRight.y) * 0.28
                    };
                    updated.elbowRight = {
                      x: prevJoints.elbowRight.x + ((avgRX * 0.7 + prevJoints.shoulderRight.x * 0.3) - prevJoints.elbowRight.x) * 0.22,
                      y: prevJoints.elbowRight.y + ((avgRY * 0.7 + prevJoints.shoulderRight.y * 0.3) - prevJoints.elbowRight.y) * 0.22
                    };
                  }

                  if (countC > 3) {
                    const avgCX = sumCX / countC;
                    const avgCY = sumCY / countC;
                    updated.chest = {
                      x: prevJoints.chest.x + (avgCX - prevJoints.chest.x) * 0.18,
                      y: prevJoints.chest.y + (avgCY - prevJoints.chest.y) * 0.18
                    };
                  }

                  return updated;
                });
              }
            }

            prevFrameDataRef.current = new Uint8ClampedArray(curr);
          }
        }
      }

      animFrameId = requestAnimationFrame(processCameraMotion);
    };

    animFrameId = requestAnimationFrame(processCameraMotion);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [somaticCameraActive, motionTrackingEnabled]);

  // Angle and balance calculations
  const leftAngle = (() => {
    const p1 = joints.handLeft;
    const p2 = joints.elbowLeft;
    const p3 = joints.shoulderLeft;
    const dx1 = p1.x - p2.x;
    const dy1 = (p1.y - p2.y) * 1.33;
    const dx2 = p3.x - p2.x;
    const dy2 = (p3.y - p2.y) * 1.33;
    const dot = dx1 * dx2 + dy1 * dy2;
    const mag1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const mag2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    if (mag1 * mag2 === 0) return 180;
    const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
    return Math.acos(cosAngle) * (180 / Math.PI);
  })();

  const rightAngle = (() => {
    const p1 = joints.handRight;
    const p2 = joints.elbowRight;
    const p3 = joints.shoulderRight;
    const dx1 = p1.x - p2.x;
    const dy1 = (p1.y - p2.y) * 1.33;
    const dx2 = p3.x - p2.x;
    const dy2 = (p3.y - p2.y) * 1.33;
    const dot = dx1 * dx2 + dy1 * dy2;
    const mag1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const mag2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    if (mag1 * mag2 === 0) return 180;
    const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
    return Math.acos(cosAngle) * (180 / Math.PI);
  })();

  const leftUserAngle = (() => {
    const p1 = userJoints.handLeft;
    const p2 = userJoints.elbowLeft;
    const p3 = userJoints.shoulderLeft;
    const dx1 = p1.x - p2.x;
    const dy1 = (p1.y - p2.y) * 1.33;
    const dx2 = p3.x - p2.x;
    const dy2 = (p3.y - p2.y) * 1.33;
    const dot = dx1 * dx2 + dy1 * dy2;
    const mag1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const mag2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    if (mag1 * mag2 === 0) return 180;
    const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
    return Math.acos(cosAngle) * (180 / Math.PI);
  })();

  const rightUserAngle = (() => {
    const p1 = userJoints.handRight;
    const p2 = userJoints.elbowRight;
    const p3 = userJoints.shoulderRight;
    const dx1 = p1.x - p2.x;
    const dy1 = (p1.y - p2.y) * 1.33;
    const dx2 = p3.x - p2.x;
    const dy2 = (p3.y - p2.y) * 1.33;
    const dot = dx1 * dx2 + dy1 * dy2;
    const mag1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const mag2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    if (mag1 * mag2 === 0) return 180;
    const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
    return Math.acos(cosAngle) * (180 / Math.PI);
  })();

  const postureMatchScore = (() => {
    const leftAngleDiff = Math.abs(leftAngle - leftUserAngle);
    const rightAngleDiff = Math.abs(rightAngle - rightUserAngle);
    const chestDiffX = Math.abs(userJoints.chest.x - joints.chest.x);
    const chestDiffY = Math.abs(userJoints.chest.y - joints.chest.y);
    const anglePenalty = (leftAngleDiff + rightAngleDiff) * 0.35;
    const posPenalty = (chestDiffX + chestDiffY) * 1.5;
    const rawScore = 100 - anglePenalty - posPenalty;
    return Math.max(30, Math.min(100, Math.round(rawScore)));
  })();

  const getBiomechanicalCues = () => {
    const cues: string[] = [];
    const leftDiff = Math.abs(leftAngle - leftUserAngle);
    if (leftDiff > 15) {
      cues.push(language === 'es' 
        ? `⚠️ Codo Izquierdo: Tu ángulo es de ${leftUserAngle.toFixed(0)}° (Referencia: ${leftAngle.toFixed(0)}°). ${leftUserAngle < leftAngle ? 'Extiende más el codo.' : 'Flexiona un poco el codo.'}`
        : `⚠️ Left Elbow: Your angle is ${leftUserAngle.toFixed(0)}° (Ref: ${leftAngle.toFixed(0)}°). ${leftUserAngle < leftAngle ? 'Extend your elbow more.' : 'Bend your elbow slightly.'}`
      );
    } else {
      cues.push(language === 'es' 
        ? "✅ Codo Izquierdo: ¡Extensión e inclinación perfectas!" 
        : "✅ Left Elbow: Perfect extension and inclination!"
      );
    }

    const rightDiff = Math.abs(rightAngle - rightUserAngle);
    if (rightDiff > 15) {
      cues.push(language === 'es' 
        ? `⚠️ Codo Derecho: Tu ángulo es de ${rightUserAngle.toFixed(0)}° (Referencia: ${rightAngle.toFixed(0)}°). ${rightUserAngle < rightAngle ? 'Extiende más el codo.' : 'Flexiona un poco el codo.'}`
        : `⚠️ Right Elbow: Your angle is ${rightUserAngle.toFixed(0)}° (Ref: ${rightAngle.toFixed(0)}°). ${rightUserAngle < rightAngle ? 'Extend your elbow more.' : 'Bend your elbow slightly.'}`
      );
    } else {
      cues.push(language === 'es' 
        ? "✅ Codo Derecho: ¡Línea angular simétrica impecable!" 
        : "✅ Right Elbow: Perfect symmetric angular line!"
      );
    }

    // Skeletal & Core Alignment
    const chestDiff = Math.abs(userJoints.chest.x - joints.chest.x);
    if (chestDiff > 6) {
      cues.push(language === 'es'
        ? "⚠️ Alineación Esquelética: Estás perdiendo el eje de gravedad central. Reubica tu esternón con la plomada de core."
        : "⚠️ Skeletal Alignment: You are losing the central gravity axis. Realign your sternum with the core plumb line."
      );
    } else {
      cues.push(language === 'es'
        ? "✅ Alineación Esquelética: Excelente centro de gravedad y estabilidad de torso."
        : "✅ Skeletal Alignment: Excellent center of gravity and torso stability."
      );
    }

    // Arm Elevation & Waacking Style Guidelines
    const avgHandY = (userJoints.handLeft.y + userJoints.handRight.y) / 2;
    if (avgHandY > 55) {
      cues.push(language === 'es'
        ? "💡 Mantener Elevación: Eleva los codos por encima del nivel de los hombros durante el barrido radial para maximizar la silueta teatral."
        : "💡 Maintain Elevation: Keep elbows above shoulder height during radial sweeps to maximize the theatrical silhouette."
      );
    } else {
      cues.push(language === 'es'
        ? "✨ Elevación Teatral: Proyección de brazos en altura óptima según los estándares de Waacking."
        : "✨ Theatrical Elevation: Optimal arm projection height according to Waacking standards."
      );
    }

    // Torque & Trajectory Optimization
    cues.push(language === 'es'
      ? `⚡ Optimización de Torque (${torsoTorqueVal}Nm): Canaliza la fuerza rotacional desde el core manteniendo la cadera fija para un latigazo nítido.`
      : `⚡ Torque Optimization (${torsoTorqueVal}Nm): Channel rotational force from the core while keeping hips fixed for a crisp whip.`
    );

    return cues;
  };

  const symmetryVal = Math.max(50, Math.min(100, Math.round(100 - Math.abs(leftAngle - rightAngle) * 0.4)));
  const fluidityVal = Math.max(60, Math.min(99, Math.round(92 + (joints.handLeft.y - joints.handRight.y) * 0.1)));
  const coreDisplacement = Math.abs(joints.chest.x - 45);
  const torsoTorqueVal = Math.max(2, Math.round(coreDisplacement * 2.1));

  const getDynamicPoseClassification = () => {
    const hlY = joints.handLeft.y;
    const hrY = joints.handRight.y;
    if (hlY > 50 && hrY < 30) return 'High-Low Extension';
    if (hlY < 30 && hrY > 50) return 'Asymmetric High-Low';
    if (hlY < 32 && hrY < 32) return 'Double Overhead Loop';
    if (Math.abs(hlY - 45) < 15 && Math.abs(hrY - 45) < 15) return 'Horizontal Wingspan';
    return 'Custom Freestyle Pose';
  };

  const currentClassification = getDynamicPoseClassification();

  // Export frame simulated action
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3000);
  };

  const handleExportFrame = () => {
    playSynthBeep(900, 0.1);
    triggerToast(`Cuadro "${recordingFrameName}.PNG" exportado correctamente a tu dispositivo.`);
  };

  const [showShareModal, setShowShareModal] = useState(false);
  const [showDuelsModal, setShowDuelsModal] = useState(false);
  const handleShareStats = () => {
    playSynthBeep(1000, 0.1);
    setShowShareModal(true);
  };

  const handleSaveSomaticDiary = () => {
    const newEntry = {
      id: `sd-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      poseClassification: currentClassification,
      confidence: 98.4,
      feltSense: somaticFeltSense || "Pose freestyle libre sin descripción interna.",
      symmetry: symmetryVal,
      fluidity: fluidityVal,
      elbowAngle: rightAngle,
      torque: torsoTorqueVal,
      poseImage: DANCER_PRESETS[somaticDancerIndex].url
    };

    const updated = [newEntry, ...somaticDiary];
    setSomaticDiary(updated);
    localStorage.setItem('waacking_somatic_diary', JSON.stringify(updated));

    playSynthBeep(1200, 0.15);
    triggerToast("¡Pose y datos guardados exitosamente en tu Diario Somático!");

    if (onAddBonusPoints) onAddBonusPoints(30);
    if (onLogPractice) {
      onLogPractice(
        5, 
        'sensorial', 
        `Análisis en Anotador Somático: Pose "${currentClassification}" guardada en el Diario Somático (Simetría: ${symmetryVal}%)`
      );
    }
  };

  const [isExportingDocs, setIsExportingDocs] = useState(false);
  const handleExportToGoogleDocs = async () => {
    try {
      setIsExportingDocs(true);
      const token = await signInForGoogleDocs();
      const doc = await createGoogleDoc(`Waack On - Diario Somático (${new Date().toLocaleDateString()})`, token);
      
      const contentSummary = (somaticDiary || []).map((entry: any) => 
        `Fecha: ${entry.date}\nPose: ${entry.poseClassification}\nSensación: ${entry.feltSense}\nSimetría: ${entry.symmetry}%, Fluidez: ${entry.fluidity}%, Codo: ${entry.elbowAngle?.toFixed?.(0) || entry.elbowAngle}°\n-----------------------------------\n`
      ).join('\n');

      if (contentSummary) {
        await appendTextToGoogleDoc(doc.documentId, contentSummary, token);
      }

      triggerToast("¡Diario Somático exportado con éxito a Google Docs!");
      if (doc.documentId) {
        window.open(`https://docs.google.com/document/d/${doc.documentId}/edit`, '_blank');
      }
    } catch (err: any) {
      console.error(err);
      triggerToast(err.message || "Error al exportar a Google Docs");
    } finally {
      setIsExportingDocs(false);
    }
  };

  // Video upload handler
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoTitle.trim() || !newVideoUrl.trim() || !newVideoDesc.trim()) return;
    onAddFeedbackItem(newVideoTitle, newVideoDesc, newVideoUrl);
    setNewVideoTitle('');
    setNewVideoUrl('');
    setNewVideoDesc('');
    setShowFeedbackForm(false);
  };

  // Instructor adds a correction under a student practice video
  const handleAddCorrectionSubmit = (itemId: string) => {
    const text = correctionText[itemId];
    const timestamp = correctionTime[itemId] || "0:00";
    if (!text || !text.trim()) return;
    onAddCorrection(itemId, timestamp, text);
    setCorrectionText(prev => ({ ...prev, [itemId]: '' }));
    setCorrectionTime(prev => ({ ...prev, [itemId]: '' }));
  };

  const lt = LAB_TRANSLATIONS[language] || LAB_TRANSLATIONS['es'];

  return (
    <div className="flex-1 min-h-full w-full p-4 sm:p-6 md:p-8 bg-transparent text-[#EDEFF4] flex flex-col space-y-6 sm:space-y-8">
      {/* Title Header with Glassmorphism Accent */}
      <div className="bg-gradient-to-r from-[#171322]/90 via-[#211a30]/80 to-[#12101b]/90 border border-white/15 p-6 sm:p-8 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden shrink-0">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono font-black text-[#D9A9FF] bg-white/10 border border-[#D9A9FF]/40 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
              LABORATORIO DE FREESTYLES
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display-lg italic text-white tracking-tight uppercase">
            <span className="bg-gradient-to-r from-white via-[#FFF8E7] to-[#D9A9FF] bg-clip-text text-transparent drop-shadow-sm">
              {lt.title}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-3xl leading-relaxed">{lt.subtitle}</p>
        </div>
        <button
          onClick={() => setShowDuelsModal(true)}
          className="relative z-10 px-5 py-3 bg-[#D9A9FF]/20 hover:bg-[#D9A9FF]/30 border border-[#D9A9FF]/50 rounded-2xl text-[#D9A9FF] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Swords className="w-4 h-4 text-[#D9A9FF] animate-bounce" />
          <span>⚔️ Duelos de Práctica</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex overflow-x-auto gap-3 border-b border-white/10 pb-4 scrollbar-none shrink-0 -mx-6 px-6 sm:mx-0 sm:px-0">
        <button
          id="subtab-musicality"
          onClick={() => setSubTab('musicality')}
          className={`group h-11 min-w-[210px] px-4 py-2 text-xs font-mono font-bold tracking-wider transition-all flex items-center justify-center gap-2 border rounded-xl shrink-0 focus:outline-none ${
            subTab === 'musicality' 
              ? 'bg-[#D9A9FF] text-black border-[#D9A9FF] shadow-xl font-black' 
              : 'bg-[#121212] text-[#D9A9FF] border-[#D9A9FF]/40 hover:bg-[#D9A9FF]/10'
          }`}
        >
          <Radio className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-125 animate-pulse" />
          🎵 LAB MUSICALIDAD (3 TEMPOS)
        </button>
        <button
          id="subtab-drill"
          onClick={() => setSubTab('drill')}
          className={`group h-11 min-w-[150px] px-4 py-2 text-xs font-mono font-bold tracking-wider transition-all flex items-center justify-center gap-2 border rounded-xl shrink-0 focus:outline-none ${
            subTab === 'drill' 
              ? 'bg-[#C23E9E] text-white border-[#C23E9E] shadow-lg' 
              : 'bg-[#121212] text-[#8A8A8A] border-[#262626] hover:text-white hover:border-[#D9A9FF]/30'
          }`}
        >
          <Timer className="w-4 h-4 text-[#D9A9FF] shrink-0 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 group-active:scale-90" />
          {lt.drillTab}
        </button>
        <button
          id="subtab-battle"
          onClick={() => setSubTab('battle')}
          className={`group h-11 min-w-[150px] px-4 py-2 text-xs font-mono font-bold tracking-wider transition-all flex items-center justify-center gap-2 border rounded-xl shrink-0 focus:outline-none ${
            subTab === 'battle' 
              ? 'bg-[#C23E9E] text-white border-[#C23E9E] shadow-lg' 
              : 'bg-[#121212] text-[#8A8A8A] border-[#262626] hover:text-white hover:border-[#D9A9FF]/30'
          }`}
        >
          <Swords className="w-4 h-4 text-[#D9A9FF] shrink-0 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-12 group-active:scale-90" />
          {lt.battleTab}
        </button>
        <button
          id="subtab-combos"
          onClick={() => setSubTab('combos')}
          className={`group h-11 min-w-[150px] px-4 py-2 text-xs font-mono font-bold tracking-wider transition-all flex items-center justify-center gap-2 border rounded-xl shrink-0 focus:outline-none ${
            subTab === 'combos' 
              ? 'bg-[#C23E9E] text-white border-[#C23E9E] shadow-lg' 
              : 'bg-[#121212] text-[#8A8A8A] border-[#262626] hover:text-white hover:border-[#D9A9FF]/30'
          }`}
        >
          <Shuffle className="w-4 h-4 text-[#D9A9FF] shrink-0 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-180 group-active:scale-90" />
          {lt.combosTab}
        </button>
        <button
          id="subtab-sensorial"
          onClick={() => setSubTab('sensorial')}
          className={`group h-11 min-w-[150px] px-4 py-2 text-xs font-mono font-bold tracking-wider transition-all flex items-center justify-center gap-2 border rounded-xl shrink-0 focus:outline-none ${
            subTab === 'sensorial' 
              ? 'bg-[#C23E9E] text-white border-[#C23E9E] shadow-lg' 
              : 'bg-[#121212] text-[#8A8A8A] border-[#262626] hover:text-white hover:border-[#D9A9FF]/30'
          }`}
        >
          <EyeOff className="w-4 h-4 text-[#D9A9FF] shrink-0 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 group-active:scale-90" />
          {lt.sensorialTab}
        </button>
        <button
          id="subtab-somatic"
          onClick={() => setSubTab('somatic')}
          className={`group h-11 min-w-[150px] px-4 py-2 text-xs font-mono font-bold tracking-wider transition-all flex items-center justify-center gap-2 border rounded-xl shrink-0 focus:outline-none ${
            subTab === 'somatic' 
              ? 'bg-[#C23E9E] text-white border-[#C23E9E] shadow-lg' 
              : 'bg-[#121212] text-[#8A8A8A] border-[#262626] hover:text-white hover:border-[#D9A9FF]/30'
          }`}
        >
          <Activity className="w-4 h-4 text-[#D9A9FF] shrink-0 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 group-active:scale-90" />
          {lt.somaticTab}
          {currentUser.billingStatus !== 'active' && <Lock className="w-3.5 h-3.5 text-primary ml-1 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />}
        </button>
        <button
          id="subtab-trazos"
          onClick={() => setSubTab('trazos')}
          className={`group h-11 min-w-[180px] px-4 py-2 text-xs font-mono font-bold tracking-wider transition-all flex items-center justify-center gap-2 border rounded-xl shrink-0 focus:outline-none ${
            subTab === 'trazos'
              ? 'bg-[#C23E9E] text-white border-[#C23E9E] shadow-lg'
              : 'bg-[#121212] text-[#8A8A8A] border-[#262626] hover:text-white hover:border-[#D9A9FF]/30'
          }`}
        >
          <Camera className="w-4 h-4 text-[#D9A9FF] shrink-0 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 group-active:scale-90" />
          {language === 'es' ? 'TRAZOS DE MOVIMIENTO' : 'MOVEMENT TRAILS'}
          {currentUser.billingStatus !== 'active' && <Lock className="w-3.5 h-3.5 text-primary ml-1 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />}
        </button>
        <button
          id="subtab-drama"
          onClick={() => setSubTab('drama')}
          className={`group h-11 min-w-[180px] px-4 py-2 text-xs font-mono font-bold tracking-wider transition-all flex items-center justify-center gap-2 border rounded-xl shrink-0 focus:outline-none ${
            subTab === 'drama' 
              ? 'bg-[#C23E9E] text-white border-[#C23E9E] shadow-lg' 
              : 'bg-[#121212] text-[#8A8A8A] border-[#262626] hover:text-white hover:border-[#D9A9FF]/30'
          }`}
        >
          <Smile className="w-4 h-4 text-[#D9A9FF] shrink-0 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 group-active:scale-90" />
          {DRAMA_TRANSLATIONS[language]?.tab || '🎭 LAB DE EXPRESIÓN'}
          {currentUser.billingStatus !== 'active' && <Lock className="w-3.5 h-3.5 text-primary ml-1 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />}
        </button>
        <button
          id="subtab-playlists"
          onClick={() => setSubTab('playlists')}
          className={`group h-11 min-w-[150px] px-4 py-2 text-xs font-mono font-bold tracking-wider transition-all flex items-center justify-center gap-2 border rounded-xl shrink-0 focus:outline-none ${
            subTab === 'playlists' 
              ? 'bg-[#C23E9E] text-white border-[#C23E9E] shadow-lg' 
              : 'bg-[#121212] text-[#8A8A8A] border-[#262626] hover:text-white hover:border-[#D9A9FF]/30'
          }`}
        >
          <Music className="w-4 h-4 text-[#D9A9FF] shrink-0 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-12 group-active:scale-90" />
          {lt.playlistsTab}
        </button>
        <button
          id="subtab-feedback"
          onClick={() => setSubTab('feedback')}
          className={`group h-11 min-w-[150px] px-4 py-2 text-xs font-mono font-bold tracking-wider transition-all flex items-center justify-center gap-2 border rounded-xl shrink-0 focus:outline-none ${
            subTab === 'feedback' 
              ? 'bg-[#C23E9E] text-white border-[#C23E9E] shadow-lg' 
              : 'bg-[#121212] text-[#8A8A8A] border-[#262626] hover:text-white hover:border-[#D9A9FF]/30'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-[#D9A9FF] shrink-0 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 group-active:scale-90" />
          {lt.feedbackTab}
        </button>
        <button
          id="subtab-rhythm"
          onClick={() => setSubTab('rhythm')}
          className={`group h-11 min-w-[170px] px-4 py-2 text-xs font-mono font-bold tracking-wider transition-all flex items-center justify-center gap-2 border rounded-xl shrink-0 focus:outline-none ${
            subTab === 'rhythm' 
              ? 'bg-[#C23E9E] text-white border-[#C23E9E] shadow-lg' 
              : 'bg-[#121212] text-[#8A8A8A] border-[#262626] hover:text-white hover:border-[#D9A9FF]/30'
          }`}
        >
          <Zap className="w-4 h-4 text-[#D9A9FF] shrink-0 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 group-active:scale-90 animate-pulse" />
          🎮 BEAT TRAINER
        </button>
        <button
          id="subtab-spectrum"
          onClick={() => setSubTab('spectrum')}
          className={`group h-11 min-w-[180px] px-4 py-2 text-xs font-mono font-bold tracking-wider transition-all flex items-center justify-center gap-2 border rounded-xl shrink-0 focus:outline-none ${
            subTab === 'spectrum' 
              ? 'bg-[#C23E9E] text-white border-[#C23E9E] shadow-lg' 
              : 'bg-[#121212] text-[#8A8A8A] border-[#262626] hover:text-white hover:border-[#D9A9FF]/30'
          }`}
        >
          <BarChart2 className="w-4 h-4 text-[#D9A9FF] shrink-0 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-12 group-active:scale-90" />
          📊 ESPECTRO AUDIO
        </button>

        {onOpenSpotifyPlayer && (
          <button
            id="open-spotify-training-btn"
            onClick={onOpenSpotifyPlayer}
            className="group h-11 px-4 py-2 text-xs font-mono font-black tracking-wider transition-all flex items-center justify-center gap-2 border rounded-xl shrink-0 focus:outline-none bg-[#1DB954]/15 border-[#1DB954]/40 text-[#1DB954] hover:bg-[#1DB954] hover:text-black shadow-md cursor-pointer ml-auto"
            title="Abrir reproductor de Spotify para bailar"
          >
            <Music className="w-4 h-4 text-inherit shrink-0 transition-transform group-hover:scale-125" />
            <span>Música Spotify</span>
          </button>
        )}
      </div>

      {/* SUB-TABS CONTENT */}
      <div className="flex-1 flex flex-col">

        {/* TAB: AI POSE LAB */}
        {subTab === 'pose_lab' && (
          <AIPoseLab
            currentUser={currentUser}
            onAddBonusPoints={onAddBonusPoints}
            onLogPractice={onLogPractice}
            language={language}
            theme={theme}
          />
        )}

        {/* TAB: DRAMA & FACIAL EXPRESSION LABORATORY */}
        {subTab === 'drama' && (
          <DramaLab
            language={language}
            activeStimulusIndex={activeStimulusIndex}
            setActiveStimulusIndex={setActiveStimulusIndex}
            isDramaPracticing={isDramaPracticing}
            setIsDramaPracticing={setIsDramaPracticing}
            dramaTimer={dramaTimer}
            setDramaTimer={setDramaTimer}
            dramaPointsAwarded={dramaPointsAwarded}
            setDramaPointsAwarded={setDramaPointsAwarded}
            onAddBonusPoints={onAddBonusPoints}
            onLogPractice={onLogPractice}
            currentUser={currentUser}
            bpm={trainingBpm || scBpm || drillBpm || 120}
          />
        )}

        {/* TAB: RHYTHM & OBJECTIVE CHALLENGE */}
        {subTab === 'battle' && (
          <BattleLab
            language={language}
            battleThemes={localizedThemes}
            selectedThemeId={selectedThemeId}
            setSelectedThemeId={setSelectedThemeId}
            musicSource={musicSource}
            setMusicSource={setMusicSource}
            battleBpm={battleBpm}
            setBattleBpm={setBattleBpm}
            spotifyUrl={spotifyEmbedUrl}
            setSpotifyUrl={setSpotifyEmbedUrl}
            soundcloudUrl={soundcloudEmbedUrl}
            setSoundcloudUrl={setSoundcloudEmbedUrl}
            battleDuration={battleDuration}
            setBattleDuration={setBattleDuration}
            startBattle={startBattle}
            stopBattle={stopBattle}
            isBattleActive={isBattleActive}
            battleRound={battleRound}
            setBattleRound={setBattleRound}
            battleTimeLeft={battleTimeLeft}
            pulseBeat={pulseBeat}
            visualizerRef={visualizerRef}
            bassIntensity={bassIntensity}
            setBassIntensity={setBassIntensity}
            liveCue={liveCue}
            spotifyEmbedUrl={spotifyEmbedUrl}
            soundcloudEmbedUrl={soundcloudEmbedUrl}
            checkedObjectives={checkedObjectives}
            setCheckedObjectives={setCheckedObjectives}
            hasSavedPoints={hasSavedPoints}
            handleSaveChallengeScore={handleSaveChallengeScore}
            earnedPoints={earnedPoints}
          />
        )}

        {/* TAB: COMBO PLANNER */}
        {subTab === 'combos' && (
          <CombosLab
            language={language}
            comboPracticeActive={comboPracticeActive}
            setComboPracticeActive={setComboPracticeActive}
            comboArms={comboArms}
            comboBody={comboBody}
            comboFeet={comboFeet}
            comboAttitude={comboAttitude}
            comboArmsIdx={comboArmsIdx}
            setComboArmsIdx={setComboArmsIdx}
            comboBodyIdx={comboBodyIdx}
            setComboBodyIdx={setComboBodyIdx}
            comboFeetIdx={comboFeetIdx}
            setComboFeetIdx={setComboFeetIdx}
            comboAttitudeIdx={comboAttitudeIdx}
            setComboAttitudeIdx={setComboAttitudeIdx}
            currentComboArms={currentComboArms}
            currentComboBody={currentComboBody}
            currentComboFeet={currentComboFeet}
            currentComboAttitude={currentComboAttitude}
            generateRandomCombo={generateRandomCombo}
            comboPracticeBpm={comboPracticeBpm}
            setComboPracticeBpm={setComboPracticeBpm}
            comboTimeLeft={comboTimeLeft}
            setComboTimeLeft={setComboTimeLeft}
            comboFlash={comboFlash}
            comboBeatCount={comboBeatCount}
            playSynthBeep={playSynthBeep}
          />
        )}

        {/* TAB: ESPEJO CIEGO (Somatic Blind Challenge) */}
        {subTab === 'sensorial' && (
          <SomaticFeedbackLab
            language={language}
            tapChallengeStatus={tapChallengeStatus}
            setTapChallengeStatus={setTapChallengeStatus}
            tapChallengeBpm={tapChallengeBpm}
            setTapChallengeBpm={setTapChallengeBpm}
            tapCountdownVal={tapCountdownVal}
            userTaps={userTaps}
            tapSyncResult={tapSyncResult}
            startTapChallenge={startTapChallenge}
            handleTapChallengeButton={handleTapChallengeButton}
          />
        )}

        {/* TAB 1: DRILL TRAINER */}
        {subTab === 'drill' && (
          <DrillLab
            flashBeat={flashBeat}
            beatCount={beatCount}
            currentPrompt={currentPrompt}
            isDrillRunning={isDrillRunning}
            timeLeft={timeLeft}
            handleStartDrill={handleStartDrill}
            drillBpm={drillBpm}
            setDrillBpm={setDrillBpm}
            drillDuration={drillDuration}
            setDrillDuration={setDrillDuration}
            setTimeLeft={setTimeLeft}
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
            markingMode={markingMode}
            setMarkingMode={setMarkingMode}
          />
        )}

        {/* TAB 2: PLAYLISTS OFICIALES */}
        {subTab === 'playlists' && (
          <PlaylistsLab
            language={language}
            currentUser={currentUser}
            playlists={playlists}
            playlistMode={playlistMode}
            setPlaylistMode={setPlaylistMode}
            activeTrack={activeTrack}
            handleSelectTrack={handleSelectTrack}
            isPlayingPlaylist={isPlayingPlaylist}
            setIsPlayingPlaylist={setIsPlayingPlaylist}
            playbackSpeed={playbackSpeed}
            setPlaybackSpeed={setPlaybackSpeed}
            playlistProgress={playlistProgress}
            soundCloudUrl={soundCloudUrl}
            setSoundCloudUrl={setSoundCloudUrl}
            scBpm={scBpm}
            setScBpm={setScBpm}
            isScPlaying={isScPlaying}
            setIsScPlaying={setIsScPlaying}
            scBeatCount={scBeatCount}
            onAddBonusPoints={onAddBonusPoints}
            onLogPractice={onLogPractice}
          />
        )}

        {/* TAB: SOMATIC FRAME ANNOTATOR */}
        {subTab === 'somatic' && (
          currentUser.billingStatus !== 'active' ? (
            <PremiumGate
              language={language}
              sectionName="diary"
              onSubscribe={() => onUserChange && onUserChange({ ...currentUser, billingStatus: 'active' })}
            />
          ) : (
            <div className="w-full flex flex-col gap-6 text-on-surface bg-background p-6 rounded-3xl border border-tertiary/20 relative overflow-hidden font-body-md select-none shadow-2xl">
            {/* Scanline background */}
            <div className="absolute inset-0 scanline pointer-events-none opacity-20" />

            {/* Custom Toast Alert */}
            {toastMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-tertiary text-on-tertiary-fixed border-2 border-background px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>{toastMsg}</span>
              </motion.div>
            )}

            {/* Share Stats Modal */}
            {showShareModal && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-surface-container-high border-2 border-tertiary/30 rounded-2xl p-6 max-w-md w-full shadow-2xl text-on-surface space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-xl">share</span>
                      <h4 className="font-display-lg text-base text-white uppercase tracking-wider">COMPARTIR ESTADÍSTICAS SOMÁTICAS</h4>
                    </div>
                    <button 
                      onClick={() => setShowShareModal(false)}
                      className="text-on-surface-variant hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>

                  <p className="text-xs text-on-surface-variant font-semibold leading-relaxed">
                    Copia y comparte este resumen técnico de tu propiocepción y biomecánica en tus redes de Waacking:
                  </p>

                  <div className="bg-[#08080a] border border-tertiary/10 rounded-xl p-4 font-mono text-[11px] text-tertiary space-y-2 select-all whitespace-pre-wrap">
{`🌟 WAACK ON SOMATIC REPORT
━━━━━━━━━━━━━━━━━━━
Pose: ${currentClassification}
AI Match Score: ${postureMatchScore}%
Symmetry Score: ${symmetryVal}%
Fluidity Index: ${fluidityVal}%
Torso Torque: ${torsoTorqueVal}Nm
Left Arm Extension: ${leftUserAngle.toFixed(1)}°
Right Arm Extension: ${rightUserAngle.toFixed(1)}°

"Felt Sense":
"${somaticFeltSense}"
━━━━━━━━━━━━━━━━━━━
#WaackOn #SomaticSensing #WaackingMechanics #AICoach`}
                  </div>

                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`🌟 WAACK ON SOMATIC REPORT\nPose: ${currentClassification}\nAI Match Score: ${postureMatchScore}%\nSymmetry: ${symmetryVal}%\nFluidity: ${fluidityVal}%\nTorque: ${torsoTorqueVal}Nm\nLeft/Right Elbows: ${leftUserAngle.toFixed(1)}° / ${rightUserAngle.toFixed(1)}°\n\nFelt Sense:\n"${somaticFeltSense}"`);
                      triggerToast("Resumen copiado al portapapeles.");
                      setShowShareModal(false);
                    }}
                    className="w-full bg-tertiary hover:bg-tertiary/90 text-on-tertiary-fixed py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                  >
                    COPIAR RESUMEN
                  </button>
                </motion.div>
              </div>
            )}

            {/* Top Header of Somatic Frame Annotator */}
            <div className="flex justify-between items-center border-b border-tertiary/10 pb-4 z-10">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-tertiary text-2xl">biotech</span>
                <span className="font-display-lg text-lg md:text-xl uppercase tracking-wider text-white">
                  Asistente de <span className="italic text-tertiary font-bold">Movimiento AI</span>
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-black/40 border border-tertiary/20 px-3 py-1.5 rounded-full text-[10px] font-mono tracking-wider text-on-surface-variant">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>BIOTECH SENSING: ACTIVE</span>
                </div>
                <button 
                  onClick={() => setSubTab('drill')}
                  className="text-on-surface-variant hover:text-tertiary transition-colors"
                  title="Cerrar asistente"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            </div>

            {/* SOMATIC POSTURE ANALYZER (Interactive Joint Vector Mesh) */}
            <div className="z-10">
              <SomaticPostureAnalyzer 
                language={language}
                onSaveLog={(log) => {
                  const updated = [
                    {
                      id: 'log-' + Date.now(),
                      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
                      feltSense: `Análisis Postural ${log.poseName}: Match ${log.poseMatchScore}%, Simetría ${log.symmetryScore}%, Codos L/R: ${log.leftElbowAngle}° / ${log.rightElbowAngle}°`,
                      poseMatchScore: log.poseMatchScore,
                      symmetryScore: log.symmetryScore,
                      poseName: log.poseName
                    },
                    ...somaticDiary
                  ];
                  setSomaticDiary(updated);
                  try {
                    localStorage.setItem('waackon_somatic_diary', JSON.stringify(updated));
                  } catch (e) {
                    // ignore
                  }
                }}
              />
            </div>

            {/* Interactive Dual Video Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch z-10">
              
              {/* Left & Right Screens Column (8 cols) */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Visual Selectors & Controls */}
                <div className="bg-surface-container-low border border-tertiary/10 p-4 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h4 className="text-xs font-mono font-bold text-tertiary uppercase tracking-wider">
                        1. Seleccionar Tutorial de Referencia o Sube tu Video
                      </h4>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">
                        Elige uno de nuestros presets de Waacking o sube un video propio para compararlo con tu cámara.
                      </p>
                    </div>

                    {/* Custom File Upload Button */}
                    <label className="flex items-center gap-1.5 bg-tertiary/10 hover:bg-tertiary/20 text-tertiary text-[11px] font-bold px-3 py-2 rounded-xl border border-tertiary/20 cursor-pointer transition-all uppercase tracking-wide">
                      <span className="material-symbols-outlined text-sm">cloud_upload</span>
                      <span>Subir Video</span>
                      <input 
                        type="file" 
                        accept="video/*" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setSomaticUploadedVideo(url);
                            setSomaticReferenceVideo(url);
                            triggerToast(language === 'es' ? "¡Video de referencia cargado correctamente!" : "Reference video uploaded successfully!");
                            try {
                              const storageRef = ref(storage, `somatic_videos/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
                              const snapshot = await uploadBytes(storageRef, file);
                              const downloadUrl = await getDownloadURL(snapshot.ref);
                              setSomaticUploadedVideo(downloadUrl);
                              setSomaticReferenceVideo(downloadUrl);
                            } catch (err) {
                              console.warn("Storage video upload notice:", err);
                            }
                          }
                        }}
                        className="hidden" 
                      />
                    </label>
                  </div>

                  {/* Video Preset Row */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      { name: 'Overhead Loop (Alineación)', url: 'https://assets.mixkit.co/videos/preview/mixkit-vintage-retro-neon-style-dancing-girl-44026-large.mp4' },
                      { name: 'Radial Sweep (Amplitud)', url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-hip-hop-in-a-studio-41712-large.mp4' },
                      { name: 'Asymmetric Strike (Fuerza)', url: 'https://assets.mixkit.co/videos/preview/mixkit-girl-dancing-street-dance-in-a-park-41715-large.mp4' }
                    ].map((videoPreset, idx) => (
                      <button
                        key={videoPreset.name}
                        onClick={() => {
                          setSomaticReferenceVideoPreset(idx);
                          setSomaticReferenceVideo(videoPreset.url);
                          // Shift joints to pre-defined states per preset for high tech realism
                          if (idx === 0) {
                            setJoints({
                              handLeft: { x: 18, y: 62 },
                              elbowLeft: { x: 25, y: 45 },
                              shoulderLeft: { x: 34, y: 36 },
                              chest: { x: 45, y: 30 },
                              shoulderRight: { x: 54, y: 36 },
                              elbowRight: { x: 67, y: 31 },
                              handRight: { x: 80, y: 22 },
                            });
                          } else if (idx === 1) {
                            setJoints({
                              handLeft: { x: 12, y: 48 },
                              elbowLeft: { x: 22, y: 40 },
                              shoulderLeft: { x: 35, y: 35 },
                              chest: { x: 47, y: 30 },
                              shoulderRight: { x: 58, y: 35 },
                              elbowRight: { x: 70, y: 41 },
                              handRight: { x: 84, y: 46 },
                            });
                          } else {
                            setJoints({
                              handLeft: { x: 35, y: 78 },
                              elbowLeft: { x: 32, y: 55 },
                              shoulderLeft: { x: 36, y: 38 },
                              chest: { x: 46, y: 32 },
                              shoulderRight: { x: 55, y: 38 },
                              elbowRight: { x: 68, y: 24 },
                              handRight: { x: 76, y: 10 },
                            });
                          }
                        }}
                        className={`px-3 py-2 rounded-xl text-[10px] font-semibold tracking-wide transition-all border truncate max-w-[200px] ${
                          somaticReferenceVideo === videoPreset.url
                            ? 'bg-tertiary text-on-tertiary-fixed border-tertiary font-bold shadow-md'
                            : 'bg-black/30 text-on-surface-variant border-tertiary/10 hover:border-tertiary/30'
                        }`}
                      >
                        🎥 {videoPreset.name}
                      </button>
                    ))}
                    {somaticUploadedVideo && (
                      <button
                        onClick={() => setSomaticReferenceVideo(somaticUploadedVideo)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-semibold tracking-wide transition-all border ${
                          somaticReferenceVideo === somaticUploadedVideo
                            ? 'bg-[#C23E9E] text-white border-[#C23E9E] font-bold shadow-md'
                            : 'bg-black/30 text-red-300 border-red-500/10 hover:border-red-500/30'
                        }`}
                      >
                        📂 Mi Video Subido
                      </button>
                    )}
                  </div>
                </div>

                {/* Double Panel Screen (Reference vs Webcam) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* PANE 1: Reference Video Player with skeleton overlay */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-mono text-tertiary font-bold tracking-wider uppercase">
                        🎥 VIDEO DE REFERENCIA
                      </span>
                      <span className="text-[9px] font-mono text-on-surface-variant">
                        Mueve los puntos para calibrar
                      </span>
                    </div>

                    <div 
                      ref={containerRef}
                      className={`relative aspect-[4/3] w-full bg-[#08080a] border rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
                        somaticCameraActive 
                          ? 'animate-bpm-pulse border-[#D9A9FF]/60 shadow-[0_0_25px_rgba(217, 169, 255,0.2)]' 
                          : 'border-tertiary/10'
                      }`}
                      style={{ '--bpm-pulse-duration': `${(60 / (trainingBpm || scBpm || drillBpm || 120)).toFixed(3)}s` } as React.CSSProperties}
                    >
                      {/* Grid background overlay */}
                      {gridVisible && (
                        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 pointer-events-none z-10 opacity-30">
                          {Array.from({ length: 36 }).map((_, i) => (
                            <div key={i} className="border-[0.5px] border-tertiary/10" />
                          ))}
                        </div>
                      )}

                      {/* Video element */}
                      <video 
                        key={somaticReferenceVideo}
                        src={somaticReferenceVideo}
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover opacity-75 select-none pointer-events-none"
                      />

                      {/* Plumb alignment reference line */}
                      {gridVisible && (
                        <div 
                          className="absolute top-0 bottom-0 border-l border-dashed border-red-500/40 z-10"
                          style={{ left: '45%' }}
                        />
                      )}

                      {/* Skeleton Lines */}
                      {layersVisible && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                          {/* Skeleton Lines */}
                          <line 
                            x1={`${joints.handLeft.x}%`} y1={`${joints.handLeft.y}%`}
                            x2={`${joints.elbowLeft.x}%`} y2={`${joints.elbowLeft.y}%`}
                            className="stroke-tertiary/80 stroke-2"
                          />
                          <line 
                            x1={`${joints.elbowLeft.x}%`} y1={`${joints.elbowLeft.y}%`}
                            x2={`${joints.shoulderLeft.x}%`} y2={`${joints.shoulderLeft.y}%`}
                            className="stroke-tertiary/80 stroke-2"
                          />
                          <line 
                            x1={`${joints.shoulderLeft.x}%`} y1={`${joints.shoulderLeft.y}%`}
                            x2={`${joints.chest.x}%`} y2={`${joints.chest.y}%`}
                            className="stroke-tertiary/80 stroke-2"
                          />
                          <line 
                            x1={`${joints.chest.x}%`} y1={`${joints.chest.y}%`}
                            x2={`${joints.shoulderRight.x}%`} y2={`${joints.shoulderRight.y}%`}
                            className="stroke-tertiary/80 stroke-2"
                          />
                          <line 
                            x1={`${joints.shoulderRight.x}%`} y1={`${joints.shoulderRight.y}%`}
                            x2={`${joints.elbowRight.x}%`} y2={`${joints.elbowRight.y}%`}
                            className="stroke-tertiary/80 stroke-2"
                          />
                          <line 
                            x1={`${joints.elbowRight.x}%`} y1={`${joints.elbowRight.y}%`}
                            x2={`${joints.handRight.x}%`} y2={`${joints.handRight.y}%`}
                            className="stroke-tertiary/80 stroke-2"
                          />
                        </svg>
                      )}

                      {/* Interactive Draggable Joint Dots (Ref) */}
                      {layersVisible && Object.entries(joints).map(([key, jointVal]) => {
                        const joint = jointVal as { x: number; y: number };
                        return (
                          <div
                            key={key}
                            onMouseDown={handleJointMouseDown(key)}
                            onTouchStart={handleJointTouchStart(key)}
                            className={`absolute w-3.5 h-3.5 rounded-full border border-white cursor-pointer -translate-x-1/2 -translate-y-1/2 z-30 transition-shadow ${
                              activeDragJoint === key 
                                ? 'bg-red-500 scale-125 shadow-[0_0_12px_#ef4444]' 
                                : 'bg-tertiary shadow-[0_0_8px_#d9a9ff]'
                            }`}
                            style={{ left: `${joint.x}%`, top: `${joint.y}%` }}
                            title={`Arrastra para calibrar referencia: ${key}`}
                          />
                        );
                      })}

                      {/* Left Floating Toolbar */}
                      <div className="absolute left-3 bottom-3 flex gap-1.5 z-30 bg-black/60 p-1 rounded-xl border border-white/5">
                        <button 
                          type="button"
                          onClick={() => setGridVisible(!gridVisible)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all border ${
                            gridVisible 
                              ? 'bg-tertiary/20 border-tertiary text-tertiary' 
                              : 'bg-black/40 border-white/10 text-on-surface-variant hover:text-white'
                          }`}
                          title="Cuadrícula"
                        >
                          <span className="material-symbols-outlined text-sm">grid_on</span>
                        </button>
                        <button 
                          type="button"
                          onClick={() => setLayersVisible(!layersVisible)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all border ${
                            layersVisible 
                              ? 'bg-tertiary/20 border-tertiary text-tertiary' 
                              : 'bg-black/40 border-white/10 text-on-surface-variant hover:text-white'
                          }`}
                          title="Esqueleto"
                        >
                          <span className="material-symbols-outlined text-sm">layers</span>
                        </button>
                      </div>

                      {/* Floating Angle Badges (Ref) */}
                      <div className="absolute right-3 top-3 flex flex-col gap-1 z-20 bg-black/80 px-2 py-1.5 rounded-xl border border-white/5 text-[9px] font-mono">
                        <div className="text-on-surface-variant">ÁNGULOS REFERENCIA:</div>
                        <div className="text-tertiary font-bold">L-ELBOW: {leftAngle.toFixed(0)}°</div>
                        <div className="text-tertiary font-bold">R-ELBOW: {rightAngle.toFixed(0)}°</div>
                      </div>
                    </div>
                  </div>

                  {/* PANE 2: Real-time user's camera feed with skeleton overlay */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#4ade80] font-bold tracking-wider uppercase flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-ping" />
                          <span>📸 MI CAPTURA EN VIVO</span>
                        </span>

                        {somaticCameraActive && (
                          <button
                            type="button"
                            onClick={() => setMotionTrackingEnabled(!motionTrackingEnabled)}
                            className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border transition-all flex items-center gap-1 ${
                              motionTrackingEnabled
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                            }`}
                            title="Activar/desactivar auto-captura de movimiento óptico"
                          >
                            <span>{motionTrackingEnabled ? '🎯 AUTO-RASTREO ACTIVO' : '⏹️ RASTREO PAUSADO'}</span>
                          </button>
                        )}
                      </div>

                      <button 
                        onClick={() => setSomaticCameraActive(!somaticCameraActive)}
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border transition-all ${
                          somaticCameraActive 
                            ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' 
                            : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                        }`}
                      >
                        {somaticCameraActive ? '🔌 APAGAR CÁMARA' : '🔌 ENCIENDE CÁMARA'}
                      </button>
                    </div>

                    <div 
                      ref={userCameraContainerRef}
                      className={`relative aspect-[4/3] w-full bg-[#08080a] border rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center text-center transition-all duration-300 ${
                        somaticCameraActive 
                          ? 'animate-bpm-pulse border-[#D9A9FF]/80 shadow-[0_0_30px_rgba(217, 169, 255,0.3)]' 
                          : 'border-tertiary/10'
                      }`}
                      style={{ '--bpm-pulse-duration': `${(60 / (trainingBpm || scBpm || drillBpm || 120)).toFixed(3)}s` } as React.CSSProperties}
                    >
                      {/* Active Webcam Feed */}
                      {somaticCameraActive ? (
                        <>
                          {/* Inner BPM Rhythm Ring */}
                          <div 
                            className="absolute inset-0 pointer-events-none rounded-2xl border-2 border-[#D9A9FF]/40 animate-bpm-ring z-15"
                            style={{ '--bpm-pulse-duration': `${(60 / (trainingBpm || scBpm || drillBpm || 120)).toFixed(3)}s` } as React.CSSProperties}
                          />

                          <video 
                            ref={somaticVideoRef}
                            autoPlay 
                            playsInline 
                            muted
                            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" 
                          />
                          
                          {/* Motion Pulse Glow overlay when moving */}
                          {motionTrackingEnabled && liveMotionLevel > 15 && (
                            <div 
                              className="absolute inset-0 pointer-events-none transition-opacity duration-300 border-2 border-emerald-400/30 rounded-2xl bg-emerald-500/5 animate-pulse z-10"
                            />
                          )}

                          {/* Live Motion Status Tag */}
                          <div className="absolute left-3 top-3 z-20 flex flex-col gap-1 items-start">
                            <div className="bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-emerald-500/30 flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${liveMotionLevel > 10 ? 'bg-emerald-400 animate-ping' : 'bg-yellow-400'}`} />
                              <span className="text-[9px] font-mono font-bold text-emerald-300 uppercase tracking-wide">
                                {motionTrackingEnabled 
                                  ? (liveMotionLevel > 10 ? `⚡ CAPTANDO MOVIMIENTO (${liveMotionLevel}%)` : '👀 ESPERANDO MOVIMIENTO')
                                  : 'PAUSADO'}
                              </span>
                            </div>

                            {/* Motion Sensitivity Level Progress Bar */}
                            {motionTrackingEnabled && (
                              <div className="w-28 h-1 bg-black/60 rounded-full overflow-hidden border border-white/10">
                                <div 
                                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-300 to-cyan-400 transition-all duration-150"
                                  style={{ width: `${Math.min(100, liveMotionLevel * 1.5)}%` }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Skeleton Overlay */}
                          {layersVisible && (
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                              {/* Skeleton Lines (User) */}
                              <line 
                                x1={`${userJoints.handLeft.x}%`} y1={`${userJoints.handLeft.y}%`}
                                x2={`${userJoints.elbowLeft.x}%`} y2={`${userJoints.elbowLeft.y}%`}
                                className="stroke-[#4ade80]/90 stroke-2"
                              />
                              <line 
                                x1={`${userJoints.elbowLeft.x}%`} y1={`${userJoints.elbowLeft.y}%`}
                                x2={`${userJoints.shoulderLeft.x}%`} y2={`${userJoints.shoulderLeft.y}%`}
                                className="stroke-[#4ade80]/90 stroke-2"
                              />
                              <line 
                                x1={`${userJoints.shoulderLeft.x}%`} y1={`${userJoints.shoulderLeft.y}%`}
                                x2={`${userJoints.chest.x}%`} y2={`${userJoints.chest.y}%`}
                                className="stroke-[#4ade80]/90 stroke-2"
                              />
                              <line 
                                x1={`${userJoints.chest.x}%`} y1={`${userJoints.chest.y}%`}
                                x2={`${userJoints.shoulderRight.x}%`} y2={`${userJoints.shoulderRight.y}%`}
                                className="stroke-[#4ade80]/90 stroke-2"
                              />
                              <line 
                                x1={`${userJoints.shoulderRight.x}%`} y1={`${userJoints.shoulderRight.y}%`}
                                x2={`${userJoints.elbowRight.x}%`} y2={`${userJoints.elbowRight.y}%`}
                                className="stroke-[#4ade80]/90 stroke-2"
                              />
                              <line 
                                x1={`${userJoints.elbowRight.x}%`} y1={`${userJoints.elbowRight.y}%`}
                                x2={`${userJoints.handRight.x}%`} y2={`${userJoints.handRight.y}%`}
                                className="stroke-[#4ade80]/90 stroke-2"
                              />
                            </svg>
                          )}

                          {/* Interactive Draggable Joint Dots (User) */}
                          {layersVisible && Object.entries(userJoints).map(([key, jointVal]) => {
                            const joint = jointVal as { x: number; y: number };
                            return (
                              <div
                                key={key}
                                onMouseDown={handleUserJointMouseDown(key)}
                                onTouchStart={handleUserJointTouchStart(key)}
                                className={`absolute w-3.5 h-3.5 rounded-full border border-white cursor-pointer -translate-x-1/2 -translate-y-1/2 z-30 transition-shadow ${
                                  activeDragUserJoint === key 
                                    ? 'bg-yellow-500 scale-125 shadow-[0_0_12px_#fbbf24]' 
                                    : 'bg-[#4ade80] shadow-[0_0_8px_#4ade80]'
                                }`}
                                style={{ left: `${joint.x}%`, top: `${joint.y}%` }}
                                title={`Ajustar tu articulación: ${key}`}
                              />
                            );
                          })}

                          {/* Angle Badges (User) */}
                          <div className="absolute right-3 top-3 flex flex-col gap-1 z-20 bg-black/80 px-2 py-1.5 rounded-xl border border-white/5 text-[9px] font-mono">
                            <div className="text-on-surface-variant">MIS ÁNGULOS (CAM):</div>
                            <div className="text-[#4ade80] font-bold">L-ELBOW: {leftUserAngle.toFixed(0)}°</div>
                            <div className="text-[#4ade80] font-bold">R-ELBOW: {rightUserAngle.toFixed(0)}°</div>
                          </div>
                        </>
                      ) : (
                        <div className="p-6 space-y-4 max-w-sm z-10">
                          <div className="w-16 h-16 bg-tertiary/10 border border-tertiary/20 rounded-full flex items-center justify-center mx-auto text-tertiary animate-pulse shadow-md">
                            <span className="material-symbols-outlined text-3xl">videocam_off</span>
                          </div>
                          <div>
                            <h5 className="font-display-lg text-sm text-white uppercase tracking-wider">Cámara de Movimiento Inactiva</h5>
                            <p className="text-[11px] text-on-surface-variant mt-1 leading-normal font-semibold">
                              Enciende tu webcam para que la IA somática compare tu postura corporal con el esqueleto del video tutorial.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSomaticCameraActive(true)}
                            className="bg-tertiary hover:bg-tertiary/90 text-on-tertiary-fixed text-[11px] font-bold px-4 py-2 rounded-xl transition-all uppercase tracking-wider font-mono shadow-md"
                          >
                            🔌 ENCIENDE CÁMARA DE MOVIMIENTO
                          </button>
                        </div>
                      )}

                      {/* Camera Permission Errors */}
                      {somaticCameraError && (
                        <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-4 z-40">
                          <div className="max-w-xs space-y-3">
                            <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
                            <p className="text-xs text-on-surface-variant font-semibold leading-relaxed">
                              {somaticCameraError}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setSomaticCameraError(null);
                                setSomaticCameraActive(false);
                              }}
                              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-mono uppercase"
                            >
                              Entendido
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>

              {/* Right Column: AI Analysis & Coaching Dashboard (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-5">
                
                {/* POSE CLASSIFICATION HEADER */}
                <div className="bg-[#0e0c18] border border-tertiary/20 rounded-2xl p-4 space-y-2 shadow-lg">
                  <span className="text-[9px] font-mono tracking-widest text-on-surface-variant font-black uppercase block">
                    CLASIFICACIÓN DE POSE (AI)
                  </span>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-tertiary/10 border border-tertiary/30 flex items-center justify-center text-tertiary">
                        <span className="material-symbols-outlined text-lg">accessibility_new</span>
                      </div>
                      <div>
                        <h5 className="font-display-lg text-sm text-white font-bold tracking-tight">
                          {currentClassification}
                        </h5>
                        <p className="text-[10px] font-mono text-emerald-400 font-semibold">
                          98.4% CONFIDENCE
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1. REAL-TIME AI POSTURE MATCH & METRICS */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono tracking-wider text-on-surface-variant font-bold uppercase">
                    MÉTRICAS Y COINCIDENCIA DE POSTURA
                  </span>
                  
                  <div className="bg-[#09090d] border border-tertiary/15 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden space-y-3">
                    <div className="absolute -top-12 -left-12 w-24 h-24 bg-tertiary/5 rounded-full blur-2xl" />
                    
                    <div className="relative z-10 space-y-1">
                      <div className="text-[9px] font-mono text-on-surface-variant font-black uppercase tracking-widest">
                        ESTADO DE EJECUCIÓN
                      </div>
                      
                      {/* Big Ring score matching color */}
                      <div className="py-1 flex items-baseline justify-center gap-1">
                        <span className={`text-4xl md:text-5xl font-display-lg font-black tracking-tighter ${
                          postureMatchScore >= 85 
                            ? 'text-green-400' 
                            : postureMatchScore >= 65 
                              ? 'text-yellow-400' 
                              : 'text-red-400'
                        }`}>
                          {postureMatchScore}%
                        </span>
                        <span className="text-xs text-on-surface-variant font-mono uppercase">Match</span>
                      </div>

                      {/* Diagnostic tag */}
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border uppercase tracking-wider ${
                        postureMatchScore >= 85 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : postureMatchScore >= 65 
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' 
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {postureMatchScore >= 85 
                          ? 'Excelente Simetría' 
                          : postureMatchScore >= 65 
                            ? 'Alineación Regular' 
                            : 'Requiere Ajustes'
                        }
                      </span>
                    </div>

                    {/* Dual Sub-Metrics: Symmetry & Fluidity */}
                    <div className="grid grid-cols-2 gap-2 w-full pt-2 border-t border-white/5 font-mono text-left">
                      <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-[8px] text-on-surface-variant uppercase font-bold">SIMETRÍA</div>
                        <div className="text-sm font-bold text-tertiary">{symmetryVal}%</div>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-[8px] text-on-surface-variant uppercase font-bold">FLUIDEZ</div>
                        <div className="text-sm font-bold text-tertiary">{fluidityVal}%</div>
                      </div>
                    </div>

                    {/* Scan effect animation on click scan */}
                    {somaticAiAnalyzing && (
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-tertiary/25 to-transparent h-1/2 w-full animate-pulse z-20 pointer-events-none border-b border-tertiary/40" />
                    )}
                  </div>
                </div>

                {/* 2. AI COACHING INTELLIGENCE CARDS */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono tracking-wider text-on-surface-variant font-bold uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-tertiary text-sm">psychology</span>
                    <span>INTELIGENCIA DE COACHING EN TIEMPO REAL</span>
                  </span>

                  <div className="space-y-2 bg-[#09090d] border border-tertiary/15 rounded-2xl p-3 shadow-lg">
                    {/* Maintain Elevation Card */}
                    <div className="p-3 bg-tertiary/5 border-l-2 border-l-tertiary border-tertiary/10 rounded-xl space-y-1">
                      <div className="flex items-center gap-2 text-tertiary text-xs font-bold font-mono uppercase">
                        <span className="material-symbols-outlined text-sm">lightbulb</span>
                        <span>Mantener Elevación</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">
                        Conserva los codos por encima del nivel de los hombros durante el barrido radial para maximizar la silueta teatral.
                      </p>
                    </div>

                    {/* Torque Optimization Card */}
                    <div className="p-3 bg-emerald-500/5 border-l-2 border-l-emerald-400 border-emerald-500/10 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-mono uppercase">
                          <span className="material-symbols-outlined text-sm">rotate_right</span>
                          <span>Optimización de Torque</span>
                        </div>
                        <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                          {Math.min(99, Math.max(70, Math.round(80 + torsoTorqueVal * 0.8)))}% EFFICIENCY
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">
                        Incrementa la rotación del torso manteniendo las caderas estables para transmitir mayor potencia en los latigazos.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. REAL-TIME CORRECTION ADVICE FEED */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono tracking-wider text-on-surface-variant font-bold uppercase">
                    PAUTAS TÉCNICAS Y RECOMENDACIONES
                  </span>
                  
                  <div className="space-y-2 bg-black/40 border border-tertiary/5 rounded-2xl p-3 shadow-inner max-h-[160px] overflow-y-auto custom-scrollbar">
                    {getBiomechanicalCues().map((cue, idx) => {
                      const isWarning = cue.startsWith('⚠️');
                      return (
                        <div 
                          key={idx} 
                          className={`text-[11px] font-semibold leading-relaxed p-2.5 rounded-xl border flex items-start gap-2 ${
                            isWarning 
                              ? 'bg-red-500/5 border-red-500/10 text-red-300' 
                              : 'bg-green-500/5 border-green-500/10 text-green-300'
                          }`}
                        >
                          <span className="text-xs select-none mt-0.5">
                            {isWarning ? '⚡' : '✨'}
                          </span>
                          <span>{cue}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. FELT-SENSE INTROSPECTION */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono tracking-wider text-on-surface-variant font-bold uppercase">PROPIOCEPCIÓN Y SENTIR INTERNO</span>
                    <span className="text-[9px] font-mono text-on-surface-variant">{somaticFeltSense.length}/280</span>
                  </div>
                  <textarea 
                    value={somaticFeltSense}
                    onChange={(e) => setSomaticFeltSense(e.target.value.slice(0, 280))}
                    rows={2}
                    className="w-full bg-[#0d0d11]/80 border border-tertiary/15 rounded-xl p-2.5 text-xs text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-tertiary/40 leading-relaxed font-semibold resize-none"
                    placeholder="Describe la propiocepción y sensación física interna..."
                  />
                  <p className="text-[9px] italic text-on-surface-variant leading-normal opacity-70">
                    * e.g., "Sintiendo la extensión desde el plexo solar, proyectando energía por las puntas de los dedos."
                  </p>
                </div>

                {/* Simulated AI Scan button */}
                <button
                  type="button"
                  onClick={() => {
                    setSomaticAiAnalyzing(true);
                    playSynthBeep(880, 0.1);
                    setTimeout(() => {
                      playSynthBeep(1100, 0.15);
                      setSomaticAiAnalyzing(false);
                      triggerToast(language === 'es' ? "¡Escaneo de puntos biomecánicos finalizado!" : "Biomechanical keypoints scanned successfully!");
                    }, 1200);
                  }}
                  disabled={somaticAiAnalyzing}
                  className="w-full py-2.5 bg-tertiary/10 hover:bg-tertiary/20 border border-tertiary/20 text-tertiary text-[10px] font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-xs">radar</span>
                  <span>{somaticAiAnalyzing ? 'ESCANEANDO CUERPO...' : 'ESCANEAR PUNTOS DE REFERENCIA (AI)'}</span>
                </button>

              </div>

            </div>

            {/* Bottom Actions Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-tertiary/10 pt-4 z-10">
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={handleExportFrame}
                  className="flex items-center gap-1.5 bg-transparent hover:bg-white/5 text-on-surface text-[11px] font-bold px-3 py-2 rounded-xl border border-tertiary/20 hover:border-tertiary/40 transition-all uppercase tracking-wide"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  Export Frame
                </button>
                <button 
                  type="button"
                  onClick={handleShareStats}
                  className="flex items-center gap-1.5 bg-transparent hover:bg-white/5 text-on-surface text-[11px] font-bold px-3 py-2 rounded-xl border border-tertiary/20 hover:border-tertiary/40 transition-all uppercase tracking-wide"
                >
                  <span className="material-symbols-outlined text-base">share</span>
                  Share Stats
                </button>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  type="button"
                  onClick={() => setSubTab('drill')}
                  className="text-xs text-on-surface-variant hover:text-white font-semibold transition-colors uppercase tracking-wider"
                >
                  Resume Drill
                </button>
                <button 
                  type="button"
                  onClick={handleSaveSomaticDiary}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-wider"
                >
                  <span className="material-symbols-outlined text-base">menu_book</span>
                  Guardar en Diario Somático
                </button>
              </div>
            </div>

            {/* Section 4: Somatic Diary Log (Past saved entries grid) */}
            <div className="border-t border-tertiary/10 pt-6 mt-2 z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary text-lg">auto_stories</span>
                  <h4 className="text-xs font-display-lg text-white font-medium uppercase tracking-wider">
                    Historial del Diario Somático
                  </h4>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-on-surface-variant">
                    {(somaticDiary || []).length} LOGS GUARDADOS
                  </span>
                  {(somaticDiary || []).length > 0 && (
                    <button
                      type="button"
                      disabled={isExportingDocs}
                      onClick={handleExportToGoogleDocs}
                      className="px-3 py-1.5 bg-[#4285F4] hover:bg-[#3367D6] text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 shadow-md uppercase disabled:opacity-50"
                      title="Exportar registros a un nuevo documento de Google Docs"
                    >
                      <span className="material-symbols-outlined text-xs">description</span>
                      <span>{isExportingDocs ? 'Exportando...' : 'Google Docs'}</span>
                    </button>
                  )}
                </div>
              </div>

              {(!somaticDiary || somaticDiary.length === 0) ? (
                <div className="p-8 bg-[#0d0d11]/50 border border-dashed border-tertiary/10 rounded-2xl text-center text-xs text-on-surface-variant">
                  Tu Diario Somático está vacío. ¡Anota y guarda tus poses de entrenamiento favoritas!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(somaticDiary || []).map((entry: any) => (
                    <div 
                      key={entry.id}
                      className="bg-[#0d0d11]/80 border border-tertiary/10 rounded-2xl overflow-hidden p-4 flex flex-col justify-between gap-3 shadow-lg hover:border-tertiary/30 transition-all"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h5 className="font-bold text-white text-[11px] tracking-wide leading-snug">{entry.poseClassification}</h5>
                          <p className="text-[9px] font-mono text-on-surface-variant mt-0.5">{entry.date}</p>
                        </div>
                        <span className="text-[8px] font-mono font-bold text-tertiary bg-tertiary/10 border border-tertiary/20 px-1.5 py-0.5 rounded">
                          {entry.confidence}% Match
                        </span>
                      </div>

                      <p className="text-[11px] text-on-surface-variant leading-relaxed line-clamp-3 bg-black/20 p-2 rounded border border-white/5 font-semibold">
                        "{entry.feltSense}"
                      </p>

                      <div className="grid grid-cols-4 gap-1 pt-2 border-t border-tertiary/5 text-center">
                        <div>
                          <div className="text-[7px] text-on-surface-variant font-black">ANGULO</div>
                          <div className="text-[9px] font-mono text-white font-bold">{entry.elbowAngle?.toFixed(0) || 164}°</div>
                        </div>
                        <div>
                          <div className="text-[7px] text-on-surface-variant font-black">TORQUE</div>
                          <div className="text-[9px] font-mono text-white font-bold">{entry.torque || 12}Nm</div>
                        </div>
                        <div>
                          <div className="text-[7px] text-on-surface-variant font-black">SIMETRÍA</div>
                          <div className="text-[9px] font-mono text-tertiary font-bold">{entry.symmetry}%</div>
                        </div>
                        <div>
                          <div className="text-[7px] text-on-surface-variant font-black">FLUIDEZ</div>
                          <div className="text-[9px] font-mono text-tertiary font-bold">{entry.fluidity}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          )
        )}
        {subTab === 'trazos' && (
          currentUser.billingStatus !== 'active' ? (
            <PremiumGate
              language={language}
              sectionName="diary"
              onSubscribe={() => onUserChange && onUserChange({ ...currentUser, billingStatus: 'active' })}
            />
          ) : (
            <MovementTrailStudio
              language={language}
              onAddBonusPoints={onAddBonusPoints}
              onLogPractice={onLogPractice}
            />
          )
        )}
        {subTab === 'feedback' && (
          <SomaticFeedbackLab
            currentUser={currentUser}
            feedbackItems={feedbackItems}
            showFeedbackForm={showFeedbackForm}
            setShowFeedbackForm={setShowFeedbackForm}
            newVideoTitle={newVideoTitle}
            setNewVideoTitle={setNewVideoTitle}
            newVideoUrl={newVideoUrl}
            setNewVideoUrl={setNewVideoUrl}
            newVideoDesc={newVideoDesc}
            setNewVideoDesc={setNewVideoDesc}
            handleFeedbackSubmit={handleFeedbackSubmit}
            correctionText={correctionText}
            setCorrectionText={setCorrectionText}
            correctionTime={correctionTime}
            setCorrectionTime={setCorrectionTime}
            handleAddCorrectionSubmit={handleAddCorrectionSubmit}
          />
        )}

        {subTab === 'rhythm' && (
          <WaackingRhythmGame
            currentUser={currentUser}
            onAddBonusPoints={onAddBonusPoints}
            onUserChange={onUserChange}
          />
        )}

        {subTab === 'musicality' && (
          <SmartMusicalityTrainer 
            language={language} 
            onAddBonusPoints={onAddBonusPoints} 
            theme={theme}
          />
        )}

        {subTab === 'spectrum' && (
          <AudioSpectrumVisualizer 
            bpm={trainingBpm || drillBpm || 120} 
            onBpmChange={(newBpm) => {
              setDrillBpm(newBpm);
              if (onBpmChange) onBpmChange(newBpm);
            }}
            theme={theme}
          />
        )}

      </div>

      {showDuelsModal && (
        <PracticeDuelsModal
          currentUser={currentUser}
          onClose={() => setShowDuelsModal(false)}
          onAwardPoints={(pts) => {
            if (onAddBonusPoints) onAddBonusPoints(pts);
          }}
        />
      )}

      <TrainingSummaryModal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        summary={sessionSummary}
        currentUserId={currentUser.id}
        onSaveToFirestore={(summ) => {
          if (onLogPractice) {
            const minutes = Math.max(1, Math.ceil(summ.durationSeconds / 60));
            const activityTypeMapped = 
              summ.category === 'battle' ? 'battle' :
              summ.category === 'combo' ? 'combo' :
              summ.category === 'drama' || summ.category === 'sensorial' ? 'sensorial' :
              summ.category === 'playlist' ? 'playlist' : 'drill';
            onLogPractice(
              minutes,
              activityTypeMapped,
              `${summ.activityType} • ${summ.details || 'Práctica completada'}`,
              { bpm: summ.bpm }
            );
          }
        }}
      />
    </div>
  );
}
