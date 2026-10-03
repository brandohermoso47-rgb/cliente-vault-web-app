import React, { useMemo, useState } from 'react';
import { motion, type Variants } from 'motion/react';
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

const AiTag = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider bg-[#E9C349]/15 text-[#E9C349] border border-[#E9C349]/30">
    <Sparkles className="w-2.5 h-2.5" /> IA
  </span>
);

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
  const risk = scored.slice(0, 6);

  const atRiskCount = atRisk.length;
  const avgRetention = MONTH_RETENTION_DEMO[MONTH_RETENTION_DEMO.length - 1];

  const stats = [
    { label: 'Retención mensual', value: `${avgRetention}%`, sub: '+4 pts vs. mes anterior' },
    { label: 'Riesgo de baja', value: String(atRiskCount), sub: 'alumnas detectadas esta semana' },
    { label: 'Alumnas activas', value: String(students.length), sub: 'con actividad registrada' },
    { label: 'Clases por semana', value: '12', sub: 'promedio de la academia' },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Resumen IA */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl border border-[#E9C349]/25 bg-gradient-to-br from-[#1a1430]/90 to-[#120f20]/90"
      >
        <div className="flex items-center gap-2 mb-2">
          <AiTag />
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Resumen del mes · datos de ejemplo</span>
        </div>
        <p className="text-sm leading-relaxed text-slate-200 max-w-2xl">
          La retención se mantiene en <b className="text-[#E9C349]">{avgRetention}%</b>. Detecté{' '}
          <b className="text-pink-400">{atRiskCount} alumna{atRiskCount === 1 ? '' : 's'} con riesgo de baja</b> por inactividad
          reciente. Revisa la lista de abajo y envíales un mensaje antes de que venza su paquete.
        </p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            custom={i}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="p-4 rounded-2xl border border-white/10 bg-white/5"
          >
            <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400">{s.label}</div>
            <div className="text-2xl font-black text-white mt-1">{s.value}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Riesgo de baja */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-4 rounded-2xl border border-white/10 bg-white/5 flex flex-col gap-1"
        >
          <div className="flex items-center gap-2 mb-2">
            <AiTag />
            <span className="text-xs font-bold text-white">Alumnas en riesgo de baja</span>
          </div>
          {risk.length === 0 && (
            <p className="text-xs text-slate-400 py-4">Aún no hay alumnas registradas para analizar.</p>
          )}
          {risk.map((r, i) => (
            <motion.div
              key={r.id}
              custom={i}
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-[11px] font-black text-white shrink-0">
                {r.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">{r.name}</div>
                <div className="text-[11px] text-slate-400">{r.reason}</div>
                <div className="h-1 rounded-full bg-white/10 mt-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${r.score}%` }}
                    transition={{ duration: 0.6, delay: 0.1 + i * 0.05 }}
                    className={`h-full rounded-full ${r.score >= 70 ? 'bg-pink-500' : 'bg-[#E9C349]'}`}
                  />
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`font-mono text-[11px] font-bold ${r.score >= 70 ? 'text-pink-400' : 'text-[#E9C349]'}`}>{r.score}%</span>
                <button
                  onClick={() => onMessageStudent?.(r.id, r.name)}
                  className="text-[10px] font-bold text-slate-300 hover:text-white underline-offset-2 hover:underline flex items-center gap-1"
                >
                  <MessageSquareWarning className="w-3 h-3" /> Escribir
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Retención histórica */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-4 rounded-2xl border border-white/10 bg-white/5"
        >
          <div className="text-xs font-bold text-white mb-1">Retención · últimos 6 meses</div>
          <div className="text-[10px] text-slate-500 mb-3">Ejemplo ilustrativo — aún no hay historial de retención conectado</div>
          <div className="flex items-end gap-2.5 h-36">
            {MONTH_RETENTION_DEMO.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="font-mono text-[10px] text-slate-400">{v}%</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${((v - 70) / 30) * 100}%` }}
                  transition={{ duration: 0.7, delay: 0.15 + i * 0.06, ease: 'easeOut' }}
                  className={`w-full rounded-t-md ${i === MONTH_RETENTION_DEMO.length - 1 ? 'bg-[#E9C349]' : 'bg-[#E9C349]/40'}`}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2.5 mt-2">
            {monthLabels.map((m, i) => (
              <span key={i} className="flex-1 text-center font-mono text-[9px] text-slate-500 uppercase">{m}</span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recomendaciones IA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl border border-white/10 bg-white/5"
      >
        <div className="flex items-center gap-2 mb-3">
          <AiTag />
          <span className="text-xs font-bold text-white">Recomendaciones</span>
        </div>
        <div className="flex flex-col">
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
                className={`flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0 transition-opacity ${isAcknowledged ? 'opacity-50' : ''}`}
              >
                <span className="w-9 h-9 rounded-xl bg-[#E9C349]/10 text-[#E9C349] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white">{r.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{r.detail}</div>
                </div>
                {isAcknowledged ? (
                  <span className="text-[10px] font-mono font-bold text-[#E9C349] flex items-center gap-1 shrink-0"><Check className="w-3 h-3" /> Revisada</span>
                ) : (
                  <button
                    onClick={() => setAcknowledged(a => [...a, r.id])}
                    title="Solo la marca como revisada; el cambio de horario o plan hay que hacerlo manualmente en la pestaña correspondiente."
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white shrink-0"
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
  );
}
