import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ArrowRight, ArrowLeft, Loader2, Target, ShieldCheck, Dumbbell, AlertCircle, Compass, Zap, Activity } from 'lucide-react';
import { User } from '../types';
import { generateOnboardingPlanBackend, OnboardingAnswersInput } from '../lib/api';

interface OnboardingQuestionnaireModalProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onPlanGenerated: (answers: OnboardingAnswersInput, planMarkdown: string) => void;
}

export default function OnboardingQuestionnaireModal({
  currentUser,
  isOpen,
  onClose,
  onPlanGenerated
}: OnboardingQuestionnaireModalProps) {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [generalGoals, setGeneralGoals] = useState<string>('');
  const [waackingObjective, setWaackingObjective] = useState<string>('');
  const [improvementAreas, setImprovementAreas] = useState<string>('');
  const [currentChallenges, setCurrentChallenges] = useState<string>('');
  const [preferredLab, setPreferredLab] = useState<string>('DramaLab');
  const [bpmBand, setBpmBand] = useState<string>('115-125 BPM (Estándar Waacking)');

  if (!isOpen) return null;

  const quickPillsStep1 = [
    'Bailar profesionalmente en escenarios',
    'Ganar batallas internacionales de freestyle',
    'Conectar con la cultura Disco y la comunidad',
    'Expresarme con libertad sin juzgarme'
  ];

  const quickPillsStep2 = [
    'Competir en batallas de Waacking 1v1',
    'Mejorar mi freestyle e improvisación',
    'Crear coreografías y proyectos en video',
    'Profundizar en la historia y cultura del Punking'
  ];

  const quickPillsStep3 = [
    'Extensión y limpieza de líneas en brazos (Waacks)',
    'Fuerza y aceleración en arm-rolls',
    'Musicalidad disco y sincopado',
    'Teatralidad, miradas y control de poses'
  ];

  const quickPillsStep4 = [
    'Me quedo en blanco al improvisar en batallas',
    'Siento rigidez en los hombros y cuello',
    'Me cuesta mantener la velocidad a más de 120 BPM',
    'Me sobrepienso los movimientos y pierdo el feeling'
  ];

  const labOptions = [
    { id: 'DramaLab', name: 'DramaLab (Teatralidad y Expresión)' },
    { id: 'SomaticFeedbackLab', name: 'SomaticFeedbackLab (Espejo Ciego)' },
    { id: 'BattleLab', name: 'BattleLab (Simulación de Batallas)' },
    { id: 'MetronomeLab', name: 'MetronomeLab (Precisión Métrica & BPM)' }
  ];

  const bpmOptions = [
    '100-110 BPM (Suave / Control Técnico)',
    '115-125 BPM (Estándar Waacking & Disco)',
    '130+ BPM (Alta Velocidad & Blitz Training)'
  ];

  const handleNext = () => {
    setErrorMsg(null);
    if (step === 1 && !generalGoals.trim()) {
      setErrorMsg('Por favor responde tus metas generales.');
      return;
    }
    if (step === 2 && !waackingObjective.trim()) {
      setErrorMsg('Por favor responde tu objetivo en Waacking.');
      return;
    }
    if (step === 3 && !improvementAreas.trim()) {
      setErrorMsg('Por favor indica tus áreas de mejora.');
      return;
    }
    if (step === 4 && !currentChallenges.trim()) {
      setErrorMsg('Por favor describe tus desafíos o bloqueos actuales.');
      return;
    }
    if (step === 5 && (!preferredLab || !bpmBand)) {
      setErrorMsg('Por favor selecciona tu lab preferido y banda de BPM.');
      return;
    }

    if (step < 5) {
      setStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg(null);

    const answersPayload: OnboardingAnswersInput = {
      studentName: currentUser.nickname || currentUser.name || 'Alumno Waack On',
      generalGoals,
      waackingObjective,
      improvementAreas,
      currentChallenges,
      preferredLab,
      bpmBand
    };

    try {
      const plan = await generateOnboardingPlanBackend(currentUser, answersPayload);
      onPlanGenerated(answersPayload, plan);
      onClose();
    } catch (err: any) {
      console.warn('[Onboarding Submission API Warning - using client fallback]:', err);
      const fallbackPlan = `👤 Perfil de Ingreso del Alumno
Alumno: ${answersPayload.studentName}
Objetivo Principal: ${answersPayload.waackingObjective}
Áreas de Mejora: ${answersPayload.improvementAreas}
Desafíos: ${answersPayload.currentChallenges}
Lab Preferido: ${answersPayload.preferredLab} | Banda BPM: ${answersPayload.bpmBand}

🎯 Estrategia Pedagógica Sugerida
- Enfoque Técnico: Extensión limpia de codos, simetría en arm-rolls y limpieza postural en ${answersPayload.bpmBand}.
- Integración del Lab Preferido (${answersPayload.preferredLab}): Activar sesiones diarias enfocadas en superar los bloqueos de ${answersPayload.currentChallenges}.

📅 Plan de Acción (Semanas 1-4)
- Semana 1-2: Práctica guiada en ${answersPayload.preferredLab} con control métrico en ${answersPayload.bpmBand}.
- Semana 3-4: Consolidación de rutinas y autoevaluación en el Espejo Ciego.`;

      onPlanGenerated(answersPayload, fallbackPlan);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0F0F12] border border-[#2D2335] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#1A0C18] via-[#120814] to-[#0D0A14] border-b border-[#2D2335] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#9A2B3C]/20 border border-[#9A2B3C]/40 text-[#E9C349]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#E9C349] flex items-center gap-1.5">
                <span>IA PEDAGÓGICA WAACK ON</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h3 className="text-base font-extrabold text-white tracking-wide">
                Diagnóstico de Onboarding & Plan Somático
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-white text-xs font-mono px-3 py-1.5 rounded-xl border border-[#2D2335] bg-[#16131D] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-[#16131D] px-6 py-3 border-b border-[#2D2335] grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                <span className={step === s ? 'text-[#E9C349] font-bold' : step > s ? 'text-emerald-400' : ''}>
                  Paso {s}
                </span>
                {step > s && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              </div>
              <div className="h-1.5 w-full bg-[#261E2E] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    step > s ? 'bg-emerald-400' : step === s ? 'bg-gradient-to-r from-[#9A2B3C] to-[#E9C349]' : 'bg-transparent'
                  }`}
                  style={{ width: step >= s ? '100%' : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-slate-200">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#9A2B3C]/10 border border-[#9A2B3C]/30 text-[#E9C349] shrink-0 mt-0.5">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    1. Metas Generales en la Danza
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    ¿Cuáles son tus metas principales a corto y largo plazo dentro de la danza?
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {quickPillsStep1.map((pill, i) => (
                  <button
                    key={i}
                    onClick={() => setGeneralGoals(prev => prev ? `${prev}. ${pill}` : pill)}
                    className="text-[11px] px-3 py-1.5 rounded-xl bg-[#1A1622] hover:bg-[#2A2238] border border-[#33273D] hover:border-[#E9C349]/40 text-slate-300 hover:text-white transition-all text-left flex items-center gap-1.5"
                  >
                    <Zap className="w-3 h-3 text-[#E9C349] shrink-0" />
                    <span>{pill}</span>
                  </button>
                ))}
              </div>

              <textarea
                value={generalGoals}
                onChange={e => setGeneralGoals(e.target.value)}
                placeholder="Ejemplo: Quiero bailar con confianza en eventos sociales, mejorar mi postura corporal..."
                className="w-full h-32 p-4 rounded-2xl bg-[#13101A] border border-[#2D2335] focus:border-[#E9C349] focus:outline-none text-xs text-white placeholder-slate-500 transition-colors resize-none"
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#9A2B3C]/10 border border-[#9A2B3C]/30 text-[#E9C349] shrink-0 mt-0.5">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    2. Objetivo Específico en Waacking
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    ¿Qué buscas lograr específicamente con el Waacking? (Ej. competir, freestyle, coreografía).
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {quickPillsStep2.map((pill, i) => (
                  <button
                    key={i}
                    onClick={() => setWaackingObjective(prev => prev ? `${prev}. ${pill}` : pill)}
                    className="text-[11px] px-3 py-1.5 rounded-xl bg-[#1A1622] hover:bg-[#2A2238] border border-[#33273D] hover:border-[#E9C349]/40 text-slate-300 hover:text-white transition-all text-left flex items-center gap-1.5"
                  >
                    <Zap className="w-3 h-3 text-[#E9C349] shrink-0" />
                    <span>{pill}</span>
                  </button>
                ))}
              </div>

              <textarea
                value={waackingObjective}
                onChange={e => setWaackingObjective(e.target.value)}
                placeholder="Ejemplo: Busco dominar el freestyle en batallas 1v1 y tener suficiente vocabulario de arm-rolls..."
                className="w-full h-32 p-4 rounded-2xl bg-[#13101A] border border-[#2D2335] focus:border-[#E9C349] focus:outline-none text-xs text-white placeholder-slate-500 transition-colors resize-none"
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#9A2B3C]/10 border border-[#9A2B3C]/30 text-[#E9C349] shrink-0 mt-0.5">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    3. Áreas de Mejora Urgentes
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    ¿Qué aspectos técnicos o expresivos estás buscando mejorar? (Ej. líneas, fuerza, musicalidad).
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {quickPillsStep3.map((pill, i) => (
                  <button
                    key={i}
                    onClick={() => setImprovementAreas(prev => prev ? `${prev}. ${pill}` : pill)}
                    className="text-[11px] px-3 py-1.5 rounded-xl bg-[#1A1622] hover:bg-[#2A2238] border border-[#33273D] hover:border-[#E9C349]/40 text-slate-300 hover:text-white transition-all text-left flex items-center gap-1.5"
                  >
                    <Zap className="w-3 h-3 text-[#E9C349] shrink-0" />
                    <span>{pill}</span>
                  </button>
                ))}
              </div>

              <textarea
                value={improvementAreas}
                onChange={e => setImprovementAreas(e.target.value)}
                placeholder="Ejemplo: Necesito mejorar la extensión simétrica de mis codos y ganar teatralidad dramática..."
                className="w-full h-32 p-4 rounded-2xl bg-[#13101A] border border-[#2D2335] focus:border-[#E9C349] focus:outline-none text-xs text-white placeholder-slate-500 transition-colors resize-none"
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#9A2B3C]/10 border border-[#9A2B3C]/30 text-[#E9C349] shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    4. Desafíos Actuales & Bloqueos
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    ¿Cuáles consideras que son tus mayores bloqueos o desafíos actuales al momento de bailar?
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {quickPillsStep4.map((pill, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentChallenges(prev => prev ? `${prev}. ${pill}` : pill)}
                    className="text-[11px] px-3 py-1.5 rounded-xl bg-[#1A1622] hover:bg-[#2A2238] border border-[#33273D] hover:border-[#E9C349]/40 text-slate-300 hover:text-white transition-all text-left flex items-center gap-1.5"
                  >
                    <Zap className="w-3 h-3 text-[#E9C349] shrink-0" />
                    <span>{pill}</span>
                  </button>
                ))}
              </div>

              <textarea
                value={currentChallenges}
                onChange={e => setCurrentChallenges(e.target.value)}
                placeholder="Ejemplo: Siento que repito las mismas secuencias, me pongo nervios@ frente a público..."
                className="w-full h-32 p-4 rounded-2xl bg-[#13101A] border border-[#2D2335] focus:border-[#E9C349] focus:outline-none text-xs text-white placeholder-slate-500 transition-colors resize-none"
              />
            </div>
          )}

          {/* Step 5: OnboardingWeakAreasStep (Labs & BPM Band) */}
          {step === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#9A2B3C]/10 border border-[#9A2B3C]/30 text-[#E9C349] shrink-0 mt-0.5">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    5. Labs Preferidos & Banda de BPM
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Selecciona tu laboratorio de entrenamiento principal y la velocidad métrica ideal para tus prácticas.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                  Laboratorio de Entrenamiento Preferido:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {labOptions.map(lab => (
                    <button
                      key={lab.id}
                      onClick={() => setPreferredLab(lab.name)}
                      className={`p-3 rounded-2xl border text-xs text-left transition-all flex items-center justify-between ${
                        preferredLab === lab.name
                          ? 'bg-[#9A2B3C]/20 border-[#E9C349] text-white shadow-md'
                          : 'bg-[#16131D] border-[#2D2335] text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <span className="font-medium">{lab.name}</span>
                      {preferredLab === lab.name && <CheckCircle2 className="w-4 h-4 text-[#E9C349] shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                  Banda de Ritmo / BPM Inicial:
                </label>
                <div className="space-y-2">
                  {bpmOptions.map(bpm => (
                    <button
                      key={bpm}
                      onClick={() => setBpmBand(bpm)}
                      className={`w-full p-3 rounded-2xl border text-xs text-left transition-all flex items-center justify-between ${
                        bpmBand === bpm
                          ? 'bg-[#9A2B3C]/20 border-[#E9C349] text-white shadow-md'
                          : 'bg-[#16131D] border-[#2D2335] text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <span className="font-mono font-bold">{bpm}</span>
                      {bpmBand === bpm && <CheckCircle2 className="w-4 h-4 text-[#E9C349] shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#120F18] border-t border-[#2D2335] flex items-center justify-between gap-4">
          <button
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            disabled={step === 1 || loading}
            className={`px-4 py-2.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              step === 1 || loading
                ? 'opacity-30 border-[#2D2335] text-slate-600 cursor-not-allowed'
                : 'border-[#3D304A] bg-[#1B1624] text-slate-300 hover:text-white hover:border-[#E9C349]/40'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </button>

          <button
            onClick={handleNext}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#9A2B3C] via-[#B8344B] to-[#E9C349] text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generando Plan Somático...</span>
              </>
            ) : step < 5 ? (
              <>
                <span>Siguiente Paso</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#E9C349]" />
                <span>Generar Plan Pedagógico</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
