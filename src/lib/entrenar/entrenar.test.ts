import { describe, expect, it } from 'vitest';
import { DATA, LANGS, MV_ES, SKILL_KEYS, STYLES, UI, YTQ } from './data';
import { analyzeMotion } from './motion';
import type { MotionSample } from './motion';

describe('datos de "Entrenar con otros estilos"', () => {
  it('trae 13 estilos con ids únicos y datos completos', () => {
    expect(STYLES).toHaveLength(13);
    expect(new Set(STYLES.map((s) => s.id)).size).toBe(13);
    for (const s of STYLES) {
      expect(s.moves.length).toBeGreaterThanOrEqual(5);
      expect(s.bpm[0]).toBeLessThan(s.bpm[1]);
      expect(s.mid).toBeGreaterThanOrEqual(s.bpm[0]);
      expect(s.mid).toBeLessThanOrEqual(s.bpm[1]);
      expect(s.clues).toHaveLength(2);
      expect(s.skills.every((k) => SKILL_KEYS.includes(k))).toBe(true);
    }
  });

  it('cada idioma tiene todas las claves de interfaz del español, con la misma forma', () => {
    for (const { id } of LANGS) {
      for (const [k, v] of Object.entries(UI.es)) {
        const x = UI[id][k];
        expect(x, `${id}.${k}`).toBeDefined();
        expect(Array.isArray(x), `${id}.${k} (lista)`).toBe(Array.isArray(v));
        if (Array.isArray(v)) expect(x, `${id}.${k} (largo)`).toHaveLength(v.length);
        if (v && typeof v === 'object' && !Array.isArray(v)) expect(Object.keys(x).sort(), `${id}.${k} (claves)`).toEqual(Object.keys(v).sort());
      }
    }
  });

  it('las listas de pestañas, ejercicios y criterios tienen el tamaño que usa la vista', () => {
    for (const { id } of LANGS) {
      expect(UI[id].tabs).toHaveLength(7);
      expect(UI[id].wu).toHaveLength(7);
      expect(UI[id].blocks).toHaveLength(7);
      expect(UI[id].ev_crit).toHaveLength(5);
      expect(UI[id].days).toHaveLength(6);
      expect(YTQ).toHaveLength(UI[id].wu.length);
    }
  });

  it('cada estilo está traducido en los 5 idiomas con sus 8 campos', () => {
    for (const lang of ['en', 'fr', 'ko', 'zh', 'ja'] as const) {
      for (const s of STYLES) {
        const d = DATA[lang][s.id];
        expect(d, `${lang}.${s.id}`).toHaveLength(8);
        expect(d.every((x) => typeof x === 'string' && x.trim().length > 0), `${lang}.${s.id} vacío`).toBe(true);
      }
    }
  });

  it('las traducciones de pasos en español apuntan a pasos que existen', () => {
    const all = new Set(STYLES.flatMap((s) => s.moves));
    for (const m of Object.keys(MV_ES)) expect(all.has(m), m).toBe(true);
  });

  it('no queda el nombre viejo "Cypher Lab" en ningún texto', () => {
    expect(JSON.stringify([UI, DATA, STYLES])).not.toMatch(/cypher lab/i);
  });
});

// Serie sintética a 60 cuadros/s durante 30 s. `hit(t)` decide si en ese instante hay un golpe de movimiento.
function series(bpm: number, hit: (t: number) => boolean): MotionSample[] {
  const out: MotionSample[] = [];
  for (let i = 0; i < 1800; i++) {
    const t = i * (1000 / 60), h = hit(t);
    out.push({ t, e: h ? 0.12 : 0.003, up: h ? 300 : 5, lo: h ? 100 : 5, box: h ? 0.5 : 0.05 });
  }
  void bpm;
  return out;
}

describe('analyzeMotion', () => {
  it('devuelve null si hay muy pocas muestras o casi no hay movimiento', () => {
    expect(analyzeMotion([], 100)).toBeNull();
    expect(analyzeMotion(series(100, () => false), 100)).toBeNull();
  });

  it('da sincronía alta cuando los golpes caen siempre sobre el pulso', () => {
    const bpm = 120, per = 60000 / bpm; // 500 ms
    const r = analyzeMotion(series(bpm, (t) => t % (per / 2) < 1000 / 60), bpm)!;
    expect(r).not.toBeNull();
    expect(r.sync).toBeGreaterThan(0.85);
    expect(r.suggest[0]).toBeGreaterThanOrEqual(4);
  });

  it('da sincronía baja cuando los golpes caen sin relación con el pulso', () => {
    const bpm = 120;
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const times: number[] = [];
    for (let t = 300; t < 29000; t += 260 + rnd() * 240) times.push(t);
    const r = analyzeMotion(series(bpm, (t) => times.some((x) => t >= x && t < x + 1000 / 60)), bpm)!;
    expect(r).not.toBeNull();
    expect(r.sync).toBeLessThan(0.5);
  });

  it('mantiene todas las medidas entre 0 y 1 y sugiere calificaciones de 1 a 5', () => {
    const r = analyzeMotion(series(100, (t) => t % 300 < 1000 / 60), 100)!;
    for (const v of [r.sync, r.sharp, r.pause, r.space]) { expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThanOrEqual(1); }
    for (const v of Object.values(r.suggest)) { expect(v).toBeGreaterThanOrEqual(1); expect(v).toBeLessThanOrEqual(5); }
    expect(['hits', 'flow', 'hips', 'feet']).toContain(r.profile);
  });
});
