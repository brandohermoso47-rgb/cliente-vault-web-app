import { describe, expect, it } from 'vitest';
import { countryList, countryName, guessCountryCode } from './countries';
import { parseCss, sty } from './dc';
import { emailOk, handleOk, passwordOk } from './validators';
import { frameFocusEnergy } from './entrenar/freestyleCoach';
import { POSE_LANDMARK_INDEX as IDX } from './entrenar/poseTracker';

describe('validadores', () => {
  it('acepta correos normales, incluidos los que llevan la letra "s" (regresión del error de registro)', () => {
    for (const e of ['susana.sosa@ejemplo.com', 'sara@waack-on.com', 'a.b+c@sub.dominio.es', 'x@y.z']) expect(emailOk(e)).toBe(true);
  });
  it('rechaza correos inválidos', () => {
    for (const e of ['', 'mal@sin', 'sin-arroba.com', 'a b@c.com', '@x.com', 'a@@x.com']) expect(emailOk(e)).toBe(false);
  });
  it('contraseña: cumple la política de Firebase (9+, mayús, minús, número, símbolo)', () => {
    expect(passwordOk('Waack#2026x')).toBe(true);
    for (const p of ['corta1A#', 'sinmayuscula1#', 'SINMINUSCULA1#', 'SinNumero####', 'SinSimbolo123A', '']) expect(passwordOk(p)).toBe(false);
  });
  it('usuario: 3–20 caracteres en minúsculas, números, punto o guion bajo', () => {
    for (const h of ['sara.waack', 'a_b', 'abc', 'x'.repeat(20)]) expect(handleOk(h)).toBe(true);
    for (const h of ['ab', 'x'.repeat(21), 'con espacio', 'ñandú', 'a@b', "x'; DROP"]) expect(handleOk(h)).toBe(false);
  });
});

describe('países', () => {
  const list = countryList('es');
  it('hay unos 240 países con nombre legible (no el código)', () => {
    expect(list.length).toBeGreaterThan(230);
    expect(list.every((c) => c.name !== c.code)).toBe(true);
  });
  it('incluye los principales y está ordenada', () => {
    const names = list.map((c) => c.name);
    for (const n of ['México', 'España', 'Brasil', 'Estados Unidos', 'Japón', 'Colombia', 'Argentina', 'Kosovo']) expect(names).toContain(n);
    expect(names).toEqual([...names].sort(new Intl.Collator('es').compare));
  });
  it('sin códigos duplicados', () => { expect(new Set(list.map((c) => c.code)).size).toBe(list.length); });
  it('countryName y guessCountryCode', () => {
    expect(countryName('MX')).toBe('México');
    expect(countryName('')).toBe('');
    expect(guessCountryCode()).toMatch(/^([A-Z]{2})?$/);
  });
});

describe('estilos del prototipo (dc.ts)', () => {
  it('convierte CSS en objeto React, con variables y prefijos de navegador', () => {
    expect(parseCss('color:red;--x:1;-webkit-backdrop-filter:blur(2px)')).toEqual({ color: 'red', '--x': '1', WebkitBackdropFilter: 'blur(2px)' });
  });

  describe('energía de niveles en freestyle', () => {
    const poseAtHipHeight = (y: number) => {
      const points = Array.from({ length: 29 }, () => ({ x: 0, y: 0.55 }));
      points[IDX.leftHip] = { x: 0, y };
      points[IDX.rightHip] = { x: 0, y };
      return points;
    };

    it('mide el cambio de altura de las caderas y no su distancia al nivel neutro', () => {
      expect(frameFocusEnergy(poseAtHipHeight(0.7), poseAtHipHeight(0.7)).niveles).toBe(0);
      expect(frameFocusEnergy(poseAtHipHeight(0.7), poseAtHipHeight(0.5)).niveles).toBeCloseTo(0.4);
    });
  });
  it('no parte valores con ";" dentro de paréntesis o comillas (URLs data:)', () => {
    const o = parseCss("background:url(data:image/svg+xml;base64,AAA);content:'a;b';color:blue") as any;
    expect(o.background).toBe('url(data:image/svg+xml;base64,AAA)');
    expect(o.content).toBe("'a;b'");
    expect(o.color).toBe('blue');
  });
  it('sty tolera valores vacíos y objetos', () => {
    expect(sty(undefined)).toBeUndefined();
    expect(sty(false)).toBeUndefined();
    expect(sty({ color: 'red' })).toEqual({ color: 'red' });
  });
});
