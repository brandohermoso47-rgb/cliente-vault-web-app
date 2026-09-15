import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import * as THREE from 'three';
import { Disc3, Sparkles } from 'lucide-react';

export interface DiscoBallWidgetHandle {
  /** Fires a bright celebratory flash across the ball and its light beams. */
  burst: () => void;
}

interface DiscoBallWidgetProps {
  /** Beats per minute the ball pulses to while `live` is true. */
  bpm: number;
  /** Live class in session vs. paused — dims the spin and beams when false. */
  live: boolean;
}

function buildBall(T: typeof THREE) {
  const mirror = new T.MeshStandardMaterial({ color: 0xe8ecf2, metalness: 0.38, roughness: 0.10 });
  const warm = new T.MeshStandardMaterial({ color: 0xbcc6d2, metalness: 0.36, roughness: 0.18 });
  const core = new T.MeshStandardMaterial({ color: 0x15161a, metalness: 0.2, roughness: 0.7 });
  const steel = new T.MeshStandardMaterial({ color: 0xa9aeb6, metalness: 0.4, roughness: 0.28 });
  const cordMat = new T.MeshStandardMaterial({ color: 0x3a3d44, metalness: 0.1, roughness: 0.85 });

  const group = new T.Group();
  group.name = 'disco_ball';
  const R = 0.30;

  const sphere = new T.Mesh(new T.SphereGeometry(R * 0.985, 40, 28), core);
  group.add(sphere);

  const bands = 16;
  const tileGeoCache: Record<string, THREE.BoxGeometry> = {};
  for (let b = 0; b < bands; b++) {
    const phi = ((b + 0.5) / bands) * Math.PI;
    const ringR = R * Math.sin(phi);
    const bandH = ((Math.PI * R) / bands) * 0.86;
    const count = Math.max(4, Math.round((2 * Math.PI * ringR) / (bandH * 1.02)));
    const tileW = ((2 * Math.PI * ringR) / count) * 0.86;
    const key = tileW.toFixed(4);
    if (!tileGeoCache[key]) tileGeoCache[key] = new T.BoxGeometry(tileW, bandH, 0.006);

    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2 + (b % 2 ? Math.PI / count : 0);
      const tile = new T.Mesh(tileGeoCache[key], (b + i) % 5 === 0 ? warm : mirror);
      const nx = Math.sin(phi) * Math.cos(theta);
      const nz = Math.sin(phi) * Math.sin(theta);
      const ny = Math.cos(phi);
      tile.position.set(nx * (R + 0.004), ny * (R + 0.004), nz * (R + 0.004));
      tile.lookAt(nx * 10, ny * 10, nz * 10);
      group.add(tile);
    }
  }

  const cap = new T.Mesh(new T.CylinderGeometry(0.032, 0.042, 0.030, 24), steel);
  cap.position.y = R + 0.012;
  group.add(cap);

  const ring = new T.Mesh(new T.TorusGeometry(0.023, 0.005, 12, 28), steel);
  ring.position.y = R + 0.046;
  ring.rotation.y = Math.PI / 2;
  group.add(ring);

  const cord = new T.Mesh(new T.CylinderGeometry(0.004, 0.004, 0.34, 10), cordMat);
  cord.position.y = R + 0.07 + 0.17;
  group.add(cord);

  group.position.y = -0.06;
  return group;
}

/** Animated chrome disco ball (three.js): pulses to BPM, dims when paused, drags to spin, flashes on burst(). */
const DiscoBallWidget = forwardRef<DiscoBallWidgetHandle, DiscoBallWidgetProps>(
  function DiscoBallWidget({ bpm, live }, ref) {
    const hostRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const beamsRef = useRef<HTMLCanvasElement>(null);
    const auraRef = useRef<HTMLDivElement>(null);

    const bpmRef = useRef(bpm);
    const liveRef = useRef(live);
    const flashRef = useRef(0);
    useEffect(() => { bpmRef.current = bpm; }, [bpm]);
    useEffect(() => { liveRef.current = live; }, [live]);

    useImperativeHandle(ref, () => ({
      burst: () => { flashRef.current = 1; },
    }), []);

    useEffect(() => {
      const host = hostRef.current;
      const canvas = canvasRef.current;
      const beams = beamsRef.current;
      const aura = auraRef.current;
      if (!host || !canvas || !beams || !aura) return;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
      camera.position.set(0, 0.05, 1.55);

      scene.add(new THREE.HemisphereLight(0xcfd6e4, 0x1a1520, 1.15));
      const key = new THREE.DirectionalLight(0xffffff, 1.5);
      key.position.set(2, 3, 3);
      scene.add(key);
      const gold = new THREE.PointLight(0xe9c349, 6, 8);
      gold.position.set(-1.4, 0.9, 1.2);
      scene.add(gold);
      const pink = new THREE.PointLight(0xec4899, 5, 8);
      pink.position.set(1.5, -0.6, 1.0);
      scene.add(pink);

      const ball = buildBall(THREE);
      const pivot = new THREE.Group();
      pivot.add(ball);
      scene.add(pivot);

      const resize = () => {
        const w = host.clientWidth || 240;
        const h = host.clientHeight || 240;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        beams.width = w;
        beams.height = h;
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      const drag = { active: false, x: 0, y: 0, vel: 0, manual: 0 };
      let hover = false;

      const onPointerDown = (e: PointerEvent) => {
        drag.active = true;
        drag.x = e.clientX;
        drag.y = e.clientY;
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = 'grabbing';
      };
      const onPointerMove = (e: PointerEvent) => {
        if (!drag.active) return;
        const dx = e.clientX - drag.x;
        const dy = e.clientY - drag.y;
        drag.x = e.clientX;
        drag.y = e.clientY;
        drag.manual += dx * 0.008;
        ball.rotation.x = Math.max(-0.6, Math.min(0.6, ball.rotation.x + dy * 0.006));
        drag.vel = dx * 0.008;
      };
      const onPointerUp = () => {
        drag.active = false;
        canvas.style.cursor = 'grab';
      };
      const onPointerEnter = () => { hover = true; };
      const onPointerLeave = () => { hover = false; };

      canvas.style.cursor = 'grab';
      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('pointercancel', onPointerUp);
      host.addEventListener('pointerenter', onPointerEnter);
      host.addEventListener('pointerleave', onPointerLeave);

      const beamsCtx = beams.getContext('2d');
      const drawBeams = (time: number, beat: number, isLive: boolean) => {
        if (!beamsCtx) return;
        const w = beams.width, h = beams.height;
        beamsCtx.clearRect(0, 0, w, h);
        const cx = w / 2, cy = h * 0.46;
        const n = 9;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + time * (isLive ? 0.35 : 0.06);
          const len = Math.max(w, h) * 0.9;
          const spread = 0.035 + beat * 0.02;
          beamsCtx.beginPath();
          beamsCtx.moveTo(cx, cy);
          beamsCtx.lineTo(cx + Math.cos(a - spread) * len, cy + Math.sin(a - spread) * len);
          beamsCtx.lineTo(cx + Math.cos(a + spread) * len, cy + Math.sin(a + spread) * len);
          beamsCtx.closePath();
          const g = beamsCtx.createRadialGradient(cx, cy, 0, cx, cy, len);
          const alpha = (isLive ? 0.13 + beat * 0.22 : 0.05) * (i % 3 === 0 ? 1 : 0.6);
          g.addColorStop(0, `rgba(255,255,255,${alpha})`);
          g.addColorStop(0.35, i % 2 ? `rgba(217, 169, 255,${alpha * 0.7})` : `rgba(236,72,153,${alpha * 0.55})`);
          g.addColorStop(1, 'rgba(0,0,0,0)');
          beamsCtx.fillStyle = g;
          beamsCtx.fill();
        }
      };

      let raf = 0;
      let t0 = performance.now();
      let phase = 0;
      const loop = (t: number) => {
        const dt = Math.min(0.05, (t - t0) / 1000);
        t0 = t;
        const isLive = liveRef.current;
        const bps = bpmRef.current / 60;
        phase = (phase + dt * bps) % 1;
        const beat = Math.pow(1 - phase, 5);

        const base = isLive ? 0.5 : 0.09;
        if (!drag.active) {
          drag.vel *= 0.94;
          drag.manual += drag.vel;
        }
        ball.rotation.y += dt * (base + (hover ? 0.35 : 0));
        pivot.rotation.y = drag.manual;

        const s = 1 + (isLive ? beat * 0.045 : 0) + flashRef.current * 0.09;
        ball.scale.setScalar(s);
        gold.intensity = 4 + (isLive ? beat * 7 : 0) + flashRef.current * 10;
        pink.intensity = 3.5 + (isLive ? beat * 5 : 0) + flashRef.current * 8;
        aura.style.opacity = String(0.28 + (isLive ? beat * 0.5 : 0.05) + flashRef.current * 0.4);
        flashRef.current *= 0.94;

        drawBeams(t / 1000, isLive ? beat : 0, isLive);
        renderer.render(scene, camera);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.removeEventListener('pointercancel', onPointerUp);
        host.removeEventListener('pointerenter', onPointerEnter);
        host.removeEventListener('pointerleave', onPointerLeave);
        scene.traverse(obj => {
          const mesh = obj as THREE.Mesh;
          if (mesh.isMesh) {
            mesh.geometry?.dispose();
            const mat = mesh.material;
            if (Array.isArray(mat)) mat.forEach(m => m.dispose());
            else mat?.dispose();
          }
        });
        renderer.dispose();
      };
    }, []);

    return (
      <div ref={hostRef} className="absolute inset-0 overflow-hidden select-none touch-none">
        <div
          ref={auraRef}
          className="absolute left-1/2 top-[46%] w-[78%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none opacity-55"
          style={{
            filter: 'blur(38px)',
            background: 'radial-gradient(circle, rgba(217, 169, 255,.42) 0%, rgba(236,72,153,.22) 45%, transparent 70%)',
          }}
        />
        <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
        <canvas ref={beamsRef} className="absolute inset-0 block w-full h-full pointer-events-none mix-blend-screen opacity-70" />
        <div
          className="absolute left-1/2 bottom-[6%] w-[62%] h-3.5 -translate-x-1/2 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(217, 169, 255,.35), transparent 70%)', filter: 'blur(6px)' }}
        />
      </div>
    );
  }
);

interface StudioVibeCardProps {
  /** Called with a short status message whenever the widget wants to surface a toast. */
  onToast?: (message: string) => void;
}

/** "Studio Vibe" dashboard card: the animated disco ball plus its tempo, live-status and celebration controls. */
export function StudioVibeCard({ onToast }: StudioVibeCardProps) {
  const [bpm, setBpm] = React.useState(124);
  const [live, setLive] = React.useState(true);
  const ballRef = useRef<DiscoBallWidgetHandle>(null);

  const celebrate = () => {
    ballRef.current?.burst();
    onToast?.('¡Destello lanzado a la sala!');
  };

  return (
    <div className="lg:col-span-4 bg-[#17132a]/60 border border-white/10 rounded-2xl relative overflow-hidden flex flex-col min-h-[340px]">
      <div className="relative z-[2] px-3.5 pt-3.5 flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-[#D9A9FF]">Studio Vibe</div>
          <div className="text-[13px] font-extrabold text-white mt-0.5 whitespace-nowrap">Bola disco de sala</div>
        </div>
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 whitespace-nowrap rounded-full text-[9px] font-mono font-bold tracking-wide border ${
            live
              ? 'border-emerald-400/45 bg-emerald-400/15 text-emerald-300'
              : 'border-white/15 bg-white/5 text-slate-400'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full block ${live ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          {live ? 'CLASE EN VIVO' : 'EN PAUSA'}
        </div>
      </div>

      <div className="flex-1 min-h-[210px] relative">
        <DiscoBallWidget ref={ballRef} bpm={bpm} live={live} />
      </div>

      <div className="relative z-[2] px-3.5 pb-3.5 flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2 bg-[#0a0815]/75 border border-white/10 rounded-xl px-2.5 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <Disc3 className="w-3.5 h-3.5 text-[#D9A9FF] shrink-0" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Tempo</span>
            <span className="text-[15px] font-mono font-bold text-white">{bpm}</span>
            <span className="text-[10px] font-mono text-slate-400">BPM</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              aria-label="Bajar BPM"
              onClick={() => setBpm(v => Math.max(60, v - 2))}
              className="w-[26px] h-[26px] rounded-lg border border-white/10 bg-white/5 text-slate-200 font-black leading-none hover:bg-[#D9A9FF]/20 hover:border-[#D9A9FF]/50 transition-all"
            >
              −
            </button>
            <button
              type="button"
              aria-label="Subir BPM"
              onClick={() => setBpm(v => Math.min(200, v + 2))}
              className="w-[26px] h-[26px] rounded-lg border border-white/10 bg-white/5 text-slate-200 font-black leading-none hover:bg-[#D9A9FF]/20 hover:border-[#D9A9FF]/50 transition-all"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setLive(v => !v)}
            className={`flex-1 py-2 px-2.5 rounded-xl text-[11px] font-extrabold border transition-all ${
              live
                ? 'border-pink-400/50 bg-pink-500/20 text-pink-300'
                : 'border-emerald-400/50 bg-emerald-400/[0.18] text-emerald-300'
            }`}
          >
            {live ? 'Pausar sala' : 'Abrir sala'}
          </button>
          <button
            type="button"
            onClick={celebrate}
            className="flex-1 py-2 px-2.5 rounded-xl text-[11px] font-extrabold border border-[#D9A9FF]/40 bg-[#D9A9FF]/[0.14] text-[#D9A9FF] hover:bg-[#D9A9FF]/25 transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-[13px] h-[13px]" />
            Destello
          </button>
        </div>
        <p className="text-center text-[10px] font-mono text-slate-500">Arrastra la bola para girarla</p>
      </div>
    </div>
  );
}

export default DiscoBallWidget;
