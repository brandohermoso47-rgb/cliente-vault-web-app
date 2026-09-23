/* <disco-ball-widget> — animated chrome disco ball for the instructor panel.
   Attributes: bpm, live ("on"|"off"), size. Methods: burst() for celebration. */
(function () {
  const THREE_URL = 'https://unpkg.com/three@0.184.0/build/three.module.js';

  class DiscoBallWidget extends HTMLElement {
    static get observedAttributes() { return ['bpm', 'live']; }

    connectedCallback() {
      if (this._booted) return;
      this._booted = true;
      this.style.cssText = 'display:block;position:absolute;inset:0;';
      this._root = this.attachShadow({ mode: 'open' });
      this._root.innerHTML = `
        <style>
          :host { display:block; position:relative; }
          .wrap { position:absolute; inset:0; overflow:hidden; }
          canvas { display:block; width:100%; height:100%; cursor:grab; touch-action:none; }
          canvas.drag { cursor:grabbing; }
          .aura { position:absolute; left:50%; top:46%; width:78%; aspect-ratio:1; transform:translate(-50%,-50%);
                  border-radius:50%; pointer-events:none; filter:blur(38px); opacity:.55;
                  background:radial-gradient(circle, rgba(233,195,73,.42) 0%, rgba(236,72,153,.22) 45%, transparent 70%); }
          .beams { position:absolute; inset:0; pointer-events:none; mix-blend-mode:screen; opacity:.7; }
          .floor { position:absolute; left:50%; bottom:6%; width:62%; height:14px; transform:translateX(-50%);
                   border-radius:50%; background:radial-gradient(ellipse, rgba(233,195,73,.35), transparent 70%);
                   filter:blur(6px); pointer-events:none; }
        </style>
        <div class="wrap">
          <div class="aura"></div>
          <canvas></canvas>
          <canvas class="beams"></canvas>
          <div class="floor"></div>
        </div>`;
      this._canvas = this._root.querySelector('canvas');
      this._beams = this._root.querySelector('.beams');
      this._aura = this._root.querySelector('.aura');
      this._drag = { active: false, x: 0, y: 0, vel: 0, manual: 0 };
      this._flash = 0;
      this._boot();
    }

    attributeChangedCallback() { /* read live in the loop */ }

    get bpm() { return Math.max(40, Math.min(220, parseFloat(this.getAttribute('bpm')) || 120)); }
    get isLive() { return this.getAttribute('live') !== 'off'; }

    burst() { this._flash = 1; }

    async _boot() {
      let THREE;
      try { THREE = await import(THREE_URL); }
      catch (e) { console.warn('[disco-ball] three.js no disponible', e); return; }
      this._THREE = THREE;

      const cv = this._canvas;
      const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
      camera.position.set(0, 0.05, 1.55);

      scene.add(new THREE.HemisphereLight(0xcfd6e4, 0x1a1520, 1.15));
      const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(2, 3, 3); scene.add(key);
      const gold = new THREE.PointLight(0xE9C349, 6, 8); gold.position.set(-1.4, 0.9, 1.2); scene.add(gold);
      const pink = new THREE.PointLight(0xec4899, 5, 8); pink.position.set(1.5, -0.6, 1.0); scene.add(pink);

      const ball = this._buildBall(THREE);
      const pivot = new THREE.Group();
      pivot.add(ball);
      scene.add(pivot);
      this._ball = ball; this._pivot = pivot; this._gold = gold; this._pink = pink;

      const resize = () => {
        const w = this.clientWidth || 240, h = this.clientHeight || 240;
        renderer.setSize(w, h, false);
        camera.aspect = w / h; camera.updateProjectionMatrix();
        this._beams.width = w; this._beams.height = h;
      };
      resize();
      new ResizeObserver(resize).observe(this);

      cv.addEventListener('pointerdown', e => {
        this._drag.active = true; this._drag.x = e.clientX; this._drag.y = e.clientY;
        cv.setPointerCapture(e.pointerId); cv.classList.add('drag');
      });
      cv.addEventListener('pointermove', e => {
        if (!this._drag.active) return;
        const dx = e.clientX - this._drag.x, dy = e.clientY - this._drag.y;
        this._drag.x = e.clientX; this._drag.y = e.clientY;
        this._drag.manual += dx * 0.008;
        ball.rotation.x = Math.max(-0.6, Math.min(0.6, ball.rotation.x + dy * 0.006));
        this._drag.vel = dx * 0.008;
      });
      const end = e => { this._drag.active = false; cv.classList.remove('drag'); };
      cv.addEventListener('pointerup', end);
      cv.addEventListener('pointercancel', end);
      this.addEventListener('pointerenter', () => { this._hover = true; });
      this.addEventListener('pointerleave', () => { this._hover = false; });

      const beatsCtx = this._beams.getContext('2d');
      let t0 = performance.now(), phase = 0;
      const loop = (t) => {
        const dt = Math.min(0.05, (t - t0) / 1000); t0 = t;
        const live = this.isLive;
        const bps = this.bpm / 60;
        phase = (phase + dt * bps) % 1;
        const beat = Math.pow(1 - phase, 5);

        const base = live ? 0.5 : 0.09;
        if (!this._drag.active) {
          this._drag.vel *= 0.94;
          this._drag.manual += this._drag.vel;
        }
        ball.rotation.y += dt * (base + (this._hover ? 0.35 : 0)) + (this._drag.active ? 0 : 0);
        ball.rotation.y += this._drag.active ? 0 : 0;
        pivot.rotation.y = this._drag.manual;

        const s = 1 + (live ? beat * 0.045 : 0) + this._flash * 0.09;
        ball.scale.setScalar(s);
        this._gold.intensity = 4 + (live ? beat * 7 : 0) + this._flash * 10;
        this._pink.intensity = 3.5 + (live ? beat * 5 : 0) + this._flash * 8;
        this._aura.style.opacity = String(0.28 + (live ? beat * 0.5 : 0.05) + this._flash * 0.4);
        this._flash *= 0.94;

        this._drawBeams(beatsCtx, t / 1000, live ? beat : 0, live);
        renderer.render(scene, camera);
        this._raf = requestAnimationFrame(loop);
      };
      this._raf = requestAnimationFrame(loop);
      this.dispatchEvent(new CustomEvent('ready'));
    }

    disconnectedCallback() { cancelAnimationFrame(this._raf); }

    _drawBeams(ctx, time, beat, live) {
      if (!ctx) return;
      const w = this._beams.width, h = this._beams.height;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h * 0.46;
      const n = 9;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + time * (live ? 0.35 : 0.06);
        const len = Math.max(w, h) * 0.9;
        const spread = 0.035 + beat * 0.02;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a - spread) * len, cy + Math.sin(a - spread) * len);
        ctx.lineTo(cx + Math.cos(a + spread) * len, cy + Math.sin(a + spread) * len);
        ctx.closePath();
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, len);
        const alpha = (live ? 0.13 + beat * 0.22 : 0.05) * (i % 3 === 0 ? 1 : 0.6);
        g.addColorStop(0, `rgba(255,255,255,${alpha})`);
        g.addColorStop(0.35, i % 2 ? `rgba(233,195,73,${alpha * 0.7})` : `rgba(236,72,153,${alpha * 0.55})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fill();
      }
    }

    _buildBall(T) {
      const mirror = new T.MeshStandardMaterial({ name: 'chrome_mirror', color: 0xe8ecf2, metalness: 0.38, roughness: 0.10 });
      const warm = new T.MeshStandardMaterial({ name: 'chrome_mirror_warm', color: 0xbcc6d2, metalness: 0.36, roughness: 0.18 });
      const core = new T.MeshStandardMaterial({ name: 'ball_core', color: 0x15161a, metalness: 0.2, roughness: 0.7 });
      const steel = new T.MeshStandardMaterial({ name: 'steel_fitting', color: 0xa9aeb6, metalness: 0.4, roughness: 0.28 });
      const cordM = new T.MeshStandardMaterial({ name: 'cord', color: 0x3a3d44, metalness: 0.1, roughness: 0.85 });

      const g = new T.Group(); g.name = 'disco_ball';
      const R = 0.30;
      const sp = new T.Mesh(new T.SphereGeometry(R * 0.985, 40, 28), core); sp.name = 'core_sphere'; g.add(sp);

      const bands = 16, cache = {};
      let n = 0;
      for (let b = 0; b < bands; b++) {
        const phi = ((b + 0.5) / bands) * Math.PI;
        const ringR = R * Math.sin(phi);
        const bandH = (Math.PI * R) / bands * 0.86;
        const count = Math.max(4, Math.round((2 * Math.PI * ringR) / (bandH * 1.02)));
        const tileW = ((2 * Math.PI * ringR) / count) * 0.86;
        const k = tileW.toFixed(4);
        if (!cache[k]) cache[k] = new T.BoxGeometry(tileW, bandH, 0.006);
        for (let i = 0; i < count; i++) {
          const th = (i / count) * Math.PI * 2 + (b % 2 ? Math.PI / count : 0);
          const m = new T.Mesh(cache[k], (b + i) % 5 === 0 ? warm : mirror);
          m.name = 'mirror_tile_' + (++n);
          const nx = Math.sin(phi) * Math.cos(th), nz = Math.sin(phi) * Math.sin(th), ny = Math.cos(phi);
          m.position.set(nx * (R + 0.004), ny * (R + 0.004), nz * (R + 0.004));
          m.lookAt(nx * 10, ny * 10, nz * 10);
          g.add(m);
        }
      }
      const cap = new T.Mesh(new T.CylinderGeometry(0.032, 0.042, 0.030, 24), steel);
      cap.name = 'top_cap'; cap.position.y = R + 0.012; g.add(cap);
      const ring = new T.Mesh(new T.TorusGeometry(0.023, 0.005, 12, 28), steel);
      ring.name = 'hang_ring'; ring.position.y = R + 0.046; ring.rotation.y = Math.PI / 2; g.add(ring);
      const cord = new T.Mesh(new T.CylinderGeometry(0.004, 0.004, 0.34, 10), cordM);
      cord.name = 'hang_cord'; cord.position.y = R + 0.07 + 0.17; g.add(cord);
      g.position.y = -0.06;
      return g;
    }
  }

  if (!customElements.get('disco-ball-widget')) customElements.define('disco-ball-widget', DiscoBallWidget);
})();
