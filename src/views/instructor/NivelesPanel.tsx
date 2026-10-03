import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Flame, Trophy, Radio, Check, type LucideIcon } from 'lucide-react';

interface Level {
  id: string;
  name: string;
  desc: string;
  icon: LucideIcon;
  color: string;
  badge?: string;
}

const LEVELS: Level[] = [
  { id: 'novato', name: 'Novato', desc: 'Primeros pasos: arm whips, poses y conteo.', icon: Sparkles, color: '#7C8FF7' },
  { id: 'intermedio', name: 'Intermedio', desc: 'Técnica fusionada y musicalidad.', icon: Flame, color: '#E4B94D', badge: 'Popular' },
  { id: 'avanzado', name: 'Avanzado', desc: 'Freestyle, storytelling y battles.', icon: Trophy, color: '#E5177A' },
  { id: 'profesional', name: 'Profesional', desc: 'Docencia, jurado y escena.', icon: Radio, color: '#8B66D8' },
];

const QUIZ = [
  '¿Dominas los arm whips básicos sin perder el conteo?',
  '¿Sostienes poses y frenos limpios en 8 tiempos?',
  '¿Has bailado en battles o showcases?',
];

type Step = 'pick' | 'quiz' | 'result';

interface NivelesPanelStudent {
  id: string;
  name: string;
}

interface NivelesPanelProps {
  students: NivelesPanelStudent[];
  /** Persiste el nivel elegido para la alumna seleccionada. */
  onSave: (studentId: string, levelId: string) => void;
}

const card: React.CSSProperties = {
  padding: 18,
  borderRadius: 18,
  border: '1px solid var(--hair)',
  background: 'var(--glass)',
  backdropFilter: 'var(--lg-blur)',
  WebkitBackdropFilter: 'var(--lg-blur)',
  boxShadow: 'var(--lg-edge)',
};

const btnPrimary: React.CSSProperties = {
  padding: '10px 20px', borderRadius: 999, fontSize: 12, fontWeight: 700,
  color: '#1A1400', background: 'linear-gradient(90deg, var(--gold-hi), var(--gold-lo))',
  border: 'none', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 6,
};

const btnGhost: React.CSSProperties = {
  padding: '10px 20px', borderRadius: 999, fontSize: 12, fontWeight: 700,
  color: 'var(--ink-2)', background: 'var(--glass-2)', border: '1px solid var(--hair)', cursor: 'pointer',
};

function initialQuizState() {
  return { step: 'pick' as Step, picked: null as string | null, qi: 0, yesCount: 0, resultLevel: null as Level | null, saved: false };
}

export default function NivelesPanel({ students, onSave }: NivelesPanelProps) {
  const [studentId, setStudentId] = useState<string>('');
  // El quiz vive en un solo objeto para poder resetearlo de golpe al cambiar
  // de alumna — evita guardar la colocación de una alumna en el perfil de otra.
  const [quiz, setQuiz] = useState(initialQuizState);
  const { step, picked, qi, yesCount, resultLevel, saved } = quiz;

  const stepN = step === 'pick' ? 1 : step === 'quiz' ? 2 : 3;
  const selectedStudent = students.find(s => s.id === studentId) || null;

  const onPickStudent = (id: string) => { setStudentId(id); setQuiz(initialQuizState()); };

  const answer = (yes: boolean) => {
    const nextYes = yes ? yesCount + 1 : yesCount;
    if (qi < QUIZ.length - 1) {
      setQuiz(q => ({ ...q, yesCount: nextYes, qi: q.qi + 1 }));
    } else {
      const lvl = LEVELS[Math.min(nextYes, LEVELS.length - 1)];
      setQuiz(q => ({ ...q, resultLevel: lvl, step: 'result' }));
    }
  };

  const confirmPicked = () => {
    const lvl = LEVELS.find(l => l.id === picked) || null;
    setQuiz(q => ({ ...q, resultLevel: lvl, step: 'result' }));
  };

  const reset = () => setQuiz(initialQuizState());

  const save = () => {
    if (!studentId || !resultLevel) return;
    onSave(studentId, resultLevel.id);
    setQuiz(q => ({ ...q, saved: true }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 640 }}>
      <div>
        <label style={{ display: 'block', fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6 }}>
          Alumna *
        </label>
        <select
          value={studentId}
          onChange={e => onPickStudent(e.target.value)}
          style={{
            width: '100%', maxWidth: 320, padding: '10px 12px', borderRadius: 12,
            background: 'var(--glass-2)', border: '1px solid var(--hair)', color: 'var(--ink)', fontSize: 13,
          }}
        >
          <option value="">Selecciona una alumna…</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {!studentId && (
          <p style={{ fontSize: 11, color: 'var(--pink)', marginTop: 6 }}>Elige una alumna para poder guardar su nivel de colocación.</p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {[1, 2, 3].map(n => (
          <span key={n} style={{ height: 6, width: 32, borderRadius: 999, background: n <= stepN ? 'var(--gold-hi)' : 'var(--hair-soft)' }} />
        ))}
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: 'var(--ink-3)', marginLeft: 8 }}>PASO {stepN} DE 3</span>
      </div>

      <AnimatePresence mode="wait">
        {step === 'pick' && (
          <motion.div key="pick" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <h3 style={{ margin: 0, fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color: 'var(--ink)' }}>
                {selectedStudent ? `${selectedStudent.name} · ` : ''}¿Cuál es su nivel?
              </h3>
              <p style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4 }}>Elige el que más se acerque, o haz el quiz rápido de 3 preguntas.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
              {LEVELS.map(l => {
                const Icon = l.icon;
                const isOn = picked === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => setQuiz(q => ({ ...q, picked: l.id }))}
                    style={{
                      ...card, display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: 'left', cursor: 'pointer',
                      borderColor: isOn ? 'var(--gold-hi)' : 'var(--hair)',
                      background: isOn ? 'color-mix(in oklch, var(--gold-hi) 12%, var(--glass))' : 'var(--glass)',
                    }}
                  >
                    <span style={{ width: 36, height: 36, borderRadius: 12, flex: '0 0 36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${l.color}22`, color: l.color }}>
                      <Icon size={18} />
                    </span>
                    <span style={{ flex: 1 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>
                        {l.name}
                        {l.badge && (
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: 'color-mix(in oklch, var(--gold-hi) 20%, transparent)', color: 'var(--gold-hi)' }}>{l.badge}</span>
                        )}
                      </span>
                      <span style={{ display: 'block', fontSize: 11, color: 'var(--ink-2)', marginTop: 2 }}>{l.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button disabled={!picked} onClick={confirmPicked} style={{ ...btnPrimary, opacity: picked ? 1 : 0.4, cursor: picked ? 'pointer' : 'not-allowed' }}>
                Continuar
              </button>
              <button onClick={() => setQuiz(q => ({ ...q, picked: null, step: 'quiz' }))} style={btnGhost}>
                No estoy segura · hacer el quiz
              </button>
            </div>
          </motion.div>
        )}

        {step === 'quiz' && (
          <motion.div key="quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: 'var(--gold-hi)' }}>PREGUNTA {qi + 1} / {QUIZ.length}</div>
            <h3 style={{ margin: 0, fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: 'var(--ink)', maxWidth: 420 }}>{QUIZ[qi]}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxWidth: 360 }}>
              <button onClick={() => answer(true)} style={{ ...card, padding: '12px 0', textAlign: 'center', fontWeight: 700, fontSize: 13, color: 'var(--ink)', cursor: 'pointer' }}>Sí</button>
              <button onClick={() => answer(false)} style={{ ...card, padding: '12px 0', textAlign: 'center', fontWeight: 700, fontSize: 13, color: 'var(--ink)', cursor: 'pointer' }}>Todavía no</button>
            </div>
            <div style={{ height: 6, borderRadius: 999, background: 'var(--hair-soft)', maxWidth: 360, overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${(qi / QUIZ.length) * 100}%` }} transition={{ duration: 0.4 }} style={{ height: '100%', background: 'var(--gold-hi)', borderRadius: 999 }} />
            </div>
          </motion.div>
        )}

        {step === 'result' && resultLevel && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
              {picked ? 'Nivel elegido' : 'Según sus respuestas'}
            </div>
            <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ width: 52, height: 52, borderRadius: 16, flex: '0 0 52px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${resultLevel.color}22`, color: resultLevel.color }}>
                <resultLevel.icon size={24} />
              </span>
              <div>
                <h3 style={{ margin: 0, fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: 'var(--ink)' }}>{resultLevel.name}</h3>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-2)' }}>{resultLevel.desc}</p>
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--ink-2)', maxWidth: 420, lineHeight: 1.6 }}>
              Guarda este nivel en el perfil de la alumna para recomendarle las clases correctas.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {saved ? (
                <span style={{ ...btnPrimary, background: 'color-mix(in oklch, var(--gold-hi) 16%, transparent)', color: 'var(--gold-hi)' }}>
                  <Check size={14} /> Nivel guardado
                </span>
              ) : (
                <button disabled={!studentId} onClick={save} style={{ ...btnPrimary, opacity: studentId ? 1 : 0.4, cursor: studentId ? 'pointer' : 'not-allowed' }}>
                  <Check size={14} /> Guardar nivel
                </button>
              )}
              <button onClick={reset} style={btnGhost}>Volver a elegir</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
