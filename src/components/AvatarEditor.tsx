import { useEffect, useRef, useState } from 'react';

// Editor simple de foto de perfil: recorte circular + marcos/fondos decorativos.
// Todo se compone en un <canvas> y se exporta como PNG (Blob) listo para subir.

type Shape = 'circle' | 'squircle' | 'heart' | 'blob';
type Preset = { id: string; label: string; shape: Shape; bg: string | null; swatch: string };

const PRESETS: Preset[] = [
  { id: 'plain', label: 'Solo foto', shape: 'circle', bg: null, swatch: 'linear-gradient(135deg,#cbd5e1,#94a3b8)' },
  { id: 'heart', label: 'Corazón', shape: 'heart', bg: '#F5385C', swatch: '#F5385C' },
  { id: 'blob-purple', label: 'Salpicón', shape: 'blob', bg: '#7C3AED', swatch: '#7C3AED' },
  { id: 'squircle-lav', label: 'Lavanda', shape: 'squircle', bg: '#B9A6F5', swatch: '#B9A6F5' },
  { id: 'squircle-pink', label: 'Rosa', shape: 'squircle', bg: '#F7A8D6', swatch: '#F7A8D6' },
  { id: 'squircle-mint', label: 'Menta', shape: 'squircle', bg: '#9FEFD9', swatch: '#9FEFD9' },
  { id: 'squircle-peach', label: 'Durazno', shape: 'squircle', bg: '#FBC69A', swatch: '#FBC69A' },
];

const SIZE = 480;

function squirclePath(cx: number, cy: number, r: number): Path2D {
  const p = new Path2D();
  const k = r * 0.92; // curvatura tipo "app icon"
  p.moveTo(cx - k, cy - r);
  p.quadraticCurveTo(cx + r, cy - r, cx + r, cy - k);
  p.quadraticCurveTo(cx + r, cy + r, cx + k, cy + r);
  p.quadraticCurveTo(cx - r, cy + r, cx - r, cy + k);
  p.quadraticCurveTo(cx - r, cy - r, cx - k, cy - r);
  p.closePath();
  return p;
}

function heartPath(cx: number, cy: number, r: number): Path2D {
  const p = new Path2D();
  const w = r * 1.05;
  p.moveTo(cx, cy + r * 0.85);
  p.bezierCurveTo(cx - w * 1.35, cy - r * 0.15, cx - w * 0.55, cy - r * 1.25, cx, cy - r * 0.42);
  p.bezierCurveTo(cx + w * 0.55, cy - r * 1.25, cx + w * 1.35, cy - r * 0.15, cx, cy + r * 0.85);
  p.closePath();
  return p;
}

function blobPath(cx: number, cy: number, r: number, seed: number): Path2D {
  const points = 9;
  const amp = r * 0.16;
  const coords: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const rad = r + amp * Math.sin(angle * 3 + seed) + amp * 0.4 * Math.cos(angle * 2 - seed);
    coords.push([cx + rad * Math.cos(angle), cy + rad * Math.sin(angle)]);
  }
  const p = new Path2D();
  p.moveTo((coords[0][0] + coords[points - 1][0]) / 2, (coords[0][1] + coords[points - 1][1]) / 2);
  for (let i = 0; i < points; i++) {
    const next = coords[(i + 1) % points];
    const mid: [number, number] = [(coords[i][0] + next[0]) / 2, (coords[i][1] + next[1]) / 2];
    p.quadraticCurveTo(coords[i][0], coords[i][1], mid[0], mid[1]);
  }
  p.closePath();
  return p;
}

function shapePath(shape: Shape, cx: number, cy: number, r: number): Path2D {
  if (shape === 'squircle') return squirclePath(cx, cy, r);
  if (shape === 'heart') return heartPath(cx, cy, r);
  if (shape === 'blob') return blobPath(cx, cy, r, 1.3);
  const p = new Path2D();
  p.arc(cx, cy, r, 0, Math.PI * 2);
  return p;
}

export default function AvatarEditor({ file, onCancel, onSave }: { file: File; onCancel: () => void; onSave: (blob: Blob) => void }) {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { imgRef.current = img; draw(preset); };
    img.src = url;
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  useEffect(() => { if (imgRef.current) draw(preset); }, [preset]);

  const draw = (p: Preset) => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    canvas.width = SIZE; canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, SIZE, SIZE);

    const cx = SIZE / 2, cy = SIZE / 2;
    const photoR = p.bg ? SIZE * 0.34 : SIZE * 0.48;

    if (p.bg) {
      const bgPath = shapePath(p.shape, cx, cy, SIZE * 0.47);
      ctx.save();
      ctx.fillStyle = p.bg;
      ctx.fill(bgPath);
      ctx.restore();
    }

    ctx.save();
    ctx.clip(shapePath('circle', cx, cy, photoR));
    const scale = Math.max((photoR * 2) / img.width, (photoR * 2) / img.height);
    const dw = img.width * scale, dh = img.height * scale;
    ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
    ctx.restore();
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBusy(true);
    canvas.toBlob((blob) => { setBusy(false); if (blob) onSave(blob); }, 'image/png', 0.95);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(10,10,18,.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 420, borderRadius: 22, background: 'var(--ground,#15151f)', border: '1px solid var(--hair)', padding: 22, color: 'var(--ink,#fff)' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800 }}>Editar foto de perfil</h2>
        <p style={{ margin: '0 0 16px', fontSize: 12.5, color: 'var(--ink-2,#9aa0b4)' }}>Elige un marco o déjala tal cual.</p>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <canvas ref={canvasRef} style={{ width: 200, height: 200, borderRadius: 16 }} />
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPreset(p)}
              title={p.label}
              style={{
                width: 40, height: 40, borderRadius: '50%', background: p.swatch, cursor: 'pointer',
                border: preset.id === p.id ? '3px solid #fff' : '2px solid rgba(255,255,255,.25)',
                boxShadow: preset.id === p.id ? '0 0 0 2px var(--pink,#FF2E86)' : 'none',
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onCancel} disabled={busy} style={{ padding: '10px 18px', borderRadius: 999, border: '1px solid var(--hair)', background: 'transparent', color: 'inherit', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
          <button type="button" onClick={save} disabled={busy} style={{ padding: '10px 20px', borderRadius: 999, border: 0, fontWeight: 700, color: '#fff', background: 'linear-gradient(90deg,#FF7A2F,#FF2E86)', cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>{busy ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </div>
    </div>
  );
}
