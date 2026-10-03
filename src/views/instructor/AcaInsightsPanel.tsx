import React, { useMemo, useState } from 'react';
import { motion, MotionConfig, type Variants } from 'motion/react';
import { Sparkles, MessageSquareWarning, TrendingUp, Users2, Wallet2, Check } from 'lucide-react';

interface InsightsStudent {
  id: string;
  name: string;
  level: string;
  lastActive: string;
  email: string;
}

interface AcaInsightsPanelProps {
  students: InsightsStudent[];
  onMessageStudent?: (studentId: string, studentName: string) => void;
}

// Heurística determinística: estima riesgo de baja a partir del texto de
// "última actividad" (no hay telemetría real de asistencia/pago aún), para
// que la IA tenga algo consistente que explicar en vez de números al azar.
function riskFromActivity(text: string, seed: string): { score: number; reason: string } {
  const t = (text || '').toLowerCase();
  let base = 20;
  let reason = 'Actividad reciente, sin señales de alerta.';
  if (t.includes('minuto') || t.includes('momento')) { base = 6; reason = 'Activa en los últimos minutos.'; }
  else if (t.includes('hora')) { base = 14; reason = 'Activa en las últimas horas.'; }
  else if (t.includes('hoy')) { base = 12; reason = 'Entró hoy a la plataforma.'; }
  else if (t.includes('ayer')) { base = 28; reason = 'Sin actividad desde ayer.'; }
  else if (t.includes('día')) {
    const n = parseInt(t.match(/\d+/)?.[0] || '3', 10);
    base = Math.min(90, 30 + n * 9);
    reason = `Sin actividad desde hace ${n} día${n === 1 ? '' : 's'}.`;
  } else if (t.includes('semana')) {
    const n = parseInt(t.match(/\d+/)?.[0] || '2', 10);
    base = Math.min(96, 55 + n * 12);
    reason = `Sin reservas ni clases hace ${n} semana${n === 1 ? '' : 's'}.`;
  }
  // jitter determinístico por id para que no queden todos iguales
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const jitter = (h % 11) - 5;
  const score = Math.max(4, Math.min(97, base + jitter));
  return { score, reason };
}

// Cifras de ejemplo: todavía no hay un historial real de retención conectado.
// Las etiquetas de mes sí se calculan a partir de la fecha actual para que
// nunca queden desfasadas, aunque los valores sean ilustrativos.
const MONTH_RETENTION_DEMO = [88, 86, 90, 84, 87, 91];
function lastSixMonthLabels(): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(d.toLocaleDateString('es-MX', { month: 'short' }).replace('.', ''));
  }
  return out;
}

const RECOMMENDATIONS = [
  {
    id: 'rec-1',
    title: 'Abrir segundo grupo de Fundamentals el jueves 19:00',
    detail: 'Hay alumnas en lista de espera y la clase del viernes llega llena varias semanas seguidas.',
    icon: TrendingUp,
  },
  {
    id: 'rec-2',
    title: 'Mover la clase de nivel Kids al sábado 12:00',
    detail: 'La mayoría de las faltas ocurren el mismo día entre semana; el sábado hay más disponibilidad de sala.',
    icon: Users2,
  },
  {
    id: 'rec-3',
    title: 'Ofrecer upgrade a mensual a alumnas que toman 7+ clases al mes',
    detail: 'El plan mensual les sale más barato por clase y retiene considerablemente más que el pago por clase suelta.',
    icon: Wallet2,
  },
];

const card: React.CSSProperties = {
  padding: 18,
  borderRadius: 18,
  border: '1px solid var(--hair)',
  background: 'var(--glass)',
  backdropFilter: 'var(--lg-blur)',
  WebkitBackdropFilter: 'var(--lg-blur)',
  boxShadow: 'var(--lg-edge)',
};

const eyebrow: React.CSSProperties = {
  fontFamily: "'Geist Mono', monospace",
  fontSize: 10,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--ink-3)',
};

function AiTag() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 999,
      fontFamily: "'Geist Mono', monospace", fontSize: 9, fontWeight: 700,
      letterSpacing: '0.1em', textTransform: 'uppercase',
      background: 'color-mix(in oklch, var(--gold-hi) 18%, transparent)',
      color: 'var(--gold-hi)', border: '1px solid color-mix(in oklch, var(--gold-hi) 40%, transparent)',
    }}>
      <Sparkles size={11} /> IA
    </span>
  );
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35, ease: 'easeOut' } }),
};

export default function AcaInsightsPanel({ students, onMessageStudent }: AcaInsightsPanelProps) {
  const [acknowledged, setAcknowledged] = useState<string[]>([]);

  const monthLabels = useMemo(lastSixMonthLabels, []);

  const scored = useMemo(
    () => students
      .map(s => ({ ...s, ...riskFromActivity(s.lastActive, s.id) }))
      .sort((a, b) => b.score - a.score),
    [students]
  );
  const atRisk = scored.filter(r => r.score >= 55);
  const risk = atRisk.slice(0, 6);

  const atRiskCount = atRisk.length;
  const avgRetention = MONTH_RETENTION_DEMO[MONTH_RETENTION_DEMO.length - 1];

  const stats = [
    { label: 'Retención mensual', value: `${avgRetention}%`, sub: '+4 pts vs. mes anterior' },
    { label: 'Riesgo de baja', value: String(atRiskCount), sub: 'alumnas detectadas esta semana' },
    { label: 'Alumnas activas', value: String(students.length), sub: 'con actividad registrada' },
    { label: 'Clases por semana', value: '12', sub: 'promedio de la academia' },
  ];

  return (
    <MotionConfig reducedMotion="user">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Resumen IA */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ ...card, borderColor: 'color-mix(in oklch, var(--gold-hi) 30%, var(--hair))' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <AiTag />
          <span style={eyebrow}>Resumen del mes · datos de ejemplo</span>
        </div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)', maxWidth: 680 }}>
          La retención se mantiene en <b style={{ color: 'var(--gold-hi)' }}>{avgRetention}%</b>. Detecté{' '}
          <b style={{ color: 'var(--pink)' }}>{atRiskCount} alumna{atRiskCount === 1 ? '' : 's'} con riesgo de baja</b> por inactividad
          reciente. Revisa la lista de abajo y envíales un mensaje antes de que venza su paquete.
        </p>
      </motion.div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
        {stats.map((s, i) => (
          <motion.div key={s.label} custom={i} initial="hidden" animate="show" variants={fadeUp} style={card}>
            <div style={eyebrow}>{s.label}</div>
            <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: 'var(--ink)', marginTop: 6 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 2 }}>{s.sub}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16 }}>
        {/* Riesgo de baja */}
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <AiTag />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Alumnas en riesgo de baja</span>
          </div>
          {risk.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--ink-2)', padding: '12px 0' }}>Ninguna alumna cruza el umbral de riesgo esta semana.</p>
          )}
          {risk.map((r, i) => (
            <motion.div
              key={r.id}
              custom={i}
              initial="hidden"
              animate="show"
              variants={fadeUp}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--hair-soft)' }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 11, flex: '0 0 32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff',
                background: 'linear-gradient(135deg, var(--pink), var(--purple))',
              }}>
                {r.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{r.name}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-2)' }}>{r.reason}</div>
                <div style={{ height: 4, borderRadius: 999, background: 'var(--hair-soft)', marginTop: 6, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${r.score}%` }}
                    transition={{ duration: 0.6, delay: 0.1 + i * 0.05 }}
                    style={{ height: '100%', borderRadius: 999, background: r.score >= 70 ? 'var(--pink)' : 'var(--gold-hi)' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flex: '0 0 auto' }}>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, fontWeight: 700, color: r.score >= 70 ? 'var(--pink)' : 'var(--gold-hi)' }}>{r.score}%</span>
                <button
                  onClick={() => onMessageStudent?.(r.id, r.name)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 10, fontWeight: 700, color: 'var(--ink-2)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  }}
                >
                  <MessageSquareWarning size={12} /> Escribir
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Retención histórica */}
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} style={card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Retención · últimos 6 meses</div>
          <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2, marginBottom: 14 }}>
            Ejemplo ilustrativo — aún no hay historial de retención conectado
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140 }}>
            {MONTH_RETENTION_DEMO.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: 'var(--ink-3)' }}>{v}%</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${((v - 70) / 30) * 100}%` }}
                  transition={{ duration: 0.7, delay: 0.15 + i * 0.06, ease: 'easeOut' }}
                  style={{
                    width: '100%', borderRadius: '6px 6px 0 0',
                    background: i === MONTH_RETENTION_DEMO.length - 1 ? 'var(--gold-hi)' : 'color-mix(in oklch, var(--gold-hi) 40%, transparent)',
                  }}
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            {monthLabels.map((m, i) => (
              <span key={i} style={{ flex: 1, textAlign: 'center', fontFamily: "'Geist Mono', monospace", fontSize: 9, color: 'var(--ink-3)', textTransform: 'uppercase' }}>{m}</span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recomendaciones IA */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <AiTag />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Recomendaciones</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {RECOMMENDATIONS.map((r, i) => {
            const Icon = r.icon;
            const isAcknowledged = acknowledged.includes(r.id);
            return (
              <motion.div
                key={r.id}
                custom={i}
                initial="hidden"
                animate="show"
                variants={fadeUp}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0',
                  borderBottom: '1px solid var(--hair-soft)', opacity: isAcknowledged ? 0.55 : 1,
                }}
              >
                <span style={{
                  width: 34, height: 34, borderRadius: 11, flex: '0 0 34px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'color-mix(in oklch, var(--gold-hi) 14%, transparent)', color: 'var(--gold-hi)',
                }}>
                  <Icon size={16} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-2)', marginTop: 2 }}>{r.detail}</div>
                </div>
                {isAcknowledged ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Geist Mono', monospace", fontSize: 10, fontWeight: 700, color: 'var(--gold-hi)', flex: '0 0 auto' }}>
                    <Check size={12} /> Revisada
                  </span>
                ) : (
                  <button
                    onClick={() => setAcknowledged(a => [...a, r.id])}
                    title="Solo la marca como revisada; el cambio de horario o plan hay que hacerlo manualmente en la pestaña correspondiente."
                    style={{
                      flex: '0 0 auto', fontSize: 10, fontWeight: 700, color: 'var(--ink)',
                      padding: '6px 10px', borderRadius: 10, border: '1px solid var(--hair)',
                      background: 'var(--glass-2)', cursor: 'pointer',
                    }}
                  >
                    Marcar como revisada
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
    </MotionConfig>
  );
}
