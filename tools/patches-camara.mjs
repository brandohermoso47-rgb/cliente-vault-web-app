// Cámara y transmisión en vivo: cualquier usuario (y el instructor desde su panel) enciende la cámara y
// transmite; los demás la ven desde Lives. Es peer-to-peer (WebRTC, señalización por Firestore), con un
// tope de espectadores simultáneos: para audiencias grandes haría falta un servidor de medios (SFU).
export default function patchesCamara(s) {
  const rep = (a, b) => {
    if (!s.includes(a)) throw new Error('parche no encontrado (camara): ' + a.slice(0, 80));
    s = s.replace(a, () => b);
  };

  // El botón "Ir en vivo" del panel de Battle Training y el del instructor usan ahora la cámara real.
  rep(`      onBattleGoLive: this.battleGoLive,`, `      onBattleGoLive: this.liveToggle,`);
  rep(`      battleLiveLabel: this.battleIsLive ? 'Terminar transmisión' : 'Ir en vivo',`,
      `      battleLiveLabel: this.liveStream ? 'Terminar transmisión' : 'Ir en vivo con mi cámara',`);
  rep(`  insLive = true;`, `  insLive = false;`);
  rep(`  toggleInsLive = () => { this.insLive = !this.insLive; this.forceUpdate(); };`, `  toggleInsLive = () => { this.liveToggle(); };`);

  // Las llamadas "live" entrantes las atiende automáticamente quien transmite; el resto sigue como antes.
  rep(`this.unsubIncomingCalls = watchIncomingCalls(meUid, (calls: any) => { this.battleIncoming = calls; this.forceUpdate(); });`,
      `this.unsubIncomingCalls = watchIncomingCalls(meUid, (calls: any) => { this.battleIncoming = calls.filter((c: any) => c.mode !== 'live'); this.liveHandleIncoming(calls); this.forceUpdate(); });`);

  // Lista en vivo de transmisiones (se engancha antes del enlace de invitación de Grupos).
  rep(`    const invite = new URLSearchParams(location.search).get('grupo');`,
      `    this.unsubLiveSessions && this.unsubLiveSessions();
    this.unsubLiveSessions = watchLiveSessions((rows: any) => { this.liveSessions = rows; this.forceUpdate(); });
    const invite = new URLSearchParams(location.search).get('grupo');`);
  rep(`    this.unsubGroupMsgs && this.unsubGroupMsgs(); this.unsubGroupMsgs = null;
  }`, `    this.unsubGroupMsgs && this.unsubGroupMsgs(); this.unsubGroupMsgs = null;
    this.unsubLiveSessions && this.unsubLiveSessions(); this.unsubLiveSessions = null;
    this.liveStop(); this.liveLeave();
  }`);

  rep(`  unsubGroups: any = null;`, `  unsubLiveSessions: any = null;
  liveSessions: any[] = [];
  liveStream: MediaStream | null = null;
  liveViewers = new Map<string, any>();
  liveServed = new Set<string>();
  liveErr = '';
  liveBusy = false;
  liveWatchCall: any = null;
  liveWatching: any = null;
  livePreviewEl: any = null;
  liveWatchEl: any = null;
  LIVE_MAX_VIEWERS = 6;

  setLivePreviewEl = (el: any) => { this.livePreviewEl = el; if (el && this.liveStream && el.srcObject !== this.liveStream) el.srcObject = this.liveStream; };
  setLiveWatchEl = (el: any) => { this.liveWatchEl = el; if (el && this.liveWatchCall && el.srcObject !== this.liveWatchCall.remoteStream) el.srcObject = this.liveWatchCall.remoteStream; };

  liveCameraError(e: any) {
    if (!navigator.mediaDevices?.getUserMedia) return 'Tu navegador no permite usar la cámara aquí (hace falta una conexión segura https).';
    const n = e?.name;
    if (n === 'NotAllowedError' || n === 'SecurityError') return 'Debes permitir el acceso a la cámara y al micrófono (icono junto a la barra de direcciones) y volver a intentarlo.';
    if (n === 'NotFoundError' || n === 'OverconstrainedError') return 'No encontramos una cámara en este dispositivo.';
    if (n === 'NotReadableError') return 'Otra aplicación está usando tu cámara. Ciérrala e inténtalo de nuevo.';
    return 'No se pudo encender la cámara. Inténtalo de nuevo.';
  }

  liveToggle = async () => {
    if (this.liveBusy) return;
    this.liveErr = '';
    if (this.liveStream) { this.liveStop(); this.forceUpdate(); return; }
    this.liveBusy = true; this.forceUpdate();
    try {
      this.liveStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true });
      this.liveStream.getVideoTracks()[0]?.addEventListener('ended', () => { this.liveStop(); this.forceUpdate(); });
      await goLive(auth.currentUser!.uid, this.myProfile?.displayName || this.state.user?.displayName || 'Alguien');
      this.battleIsLive = true; this.insLive = true;
      this.liveHandleIncoming(this.battleIncoming);
    } catch (e: any) {
      this.liveStream?.getTracks().forEach((t: any) => t.stop()); this.liveStream = null;
      this.liveErr = this.liveCameraError(e);
    }
    this.liveBusy = false; this.forceUpdate();
  };

  liveStop() {
    this.liveViewers.forEach((c: any) => c.hangUp()); this.liveViewers.clear(); this.liveServed.clear();
    const had = !!this.liveStream;
    this.liveStream?.getTracks().forEach((t: any) => t.stop()); this.liveStream = null;
    if (had && auth.currentUser) stopLive(auth.currentUser.uid);
    this.battleIsLive = false; this.insLive = false;
  }

  liveHandleIncoming(calls: any[]) {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    calls.filter((c: any) => c.mode === 'live' && !this.liveServed.has(c.id)).forEach((c: any) => {
      this.liveServed.add(c.id);
      if (!this.liveStream || this.liveViewers.size >= this.LIVE_MAX_VIEWERS) { declineCall(c.id); return; }
      const call = new BattleCall(uid);
      call.attachStream(this.liveStream);
      call.onEnded = () => { this.liveViewers.delete(c.id); this.forceUpdate(); };
      this.liveViewers.set(c.id, call);
      call.answer(c.id, c.offer).catch(() => { this.liveViewers.delete(c.id); this.forceUpdate(); });
      this.forceUpdate();
    });
  }

  liveWatch = async (uid: string, name: string) => {
    if (this.liveWatchCall) this.liveLeave();
    this.liveErr = '';
    const call = new BattleCall(auth.currentUser!.uid);
    this.liveWatchCall = call; this.liveWatching = { uid, name, connected: false };
    call.onRemoteTrack = () => { this.liveWatching = { ...this.liveWatching, connected: true }; if (this.liveWatchEl) this.liveWatchEl.srcObject = call.remoteStream; this.forceUpdate(); };
    call.onEnded = () => { if (this.liveWatchCall === call) { this.liveErr = 'La transmisión terminó.'; this.liveLeave(); } };
    this.forceUpdate();
    setTimeout(() => { if (this.liveWatchCall === call && !this.liveWatching?.connected) { this.liveErr = 'No se pudo conectar. Puede que la transmisión ya haya terminado.'; this.liveLeave(); } }, 20000);
    try { await call.watchLive(uid); } catch (e) { this.liveErr = 'No se pudo conectar a la transmisión.'; this.liveLeave(); }
  };

  liveLeave = () => {
    const c = this.liveWatchCall;
    this.liveWatchCall = null; this.liveWatching = null;
    c?.hangUp();
    this.forceUpdate();
  };

  unsubGroups: any = null;`);

  // Valores para la pantalla.
  rep(`      gShowList: !this.gActiveId && this.gMode === 'list',`, `      liveOn: !!this.liveStream,
      liveToggle: this.liveToggle,
      liveToggleLabel: this.liveBusy ? 'Abriendo cámara…' : (this.liveStream ? 'Terminar transmisión' : 'Encender cámara e ir en vivo'),
      liveToggleStyle: 'padding:12px 22px;border-radius:999px;font-size:12.5px;font-weight:700;cursor:pointer;' + (this.liveStream
        ? 'color:#fff;background:var(--pink)'
        : 'color:#1A1400;background:linear-gradient(90deg,var(--gold-hi),var(--gold-lo));box-shadow:inset 0 1px 0 rgba(255,255,255,.5)'),
      liveViewersLabel: this.liveViewers.size + (this.liveViewers.size === 1 ? ' espectador conectado' : ' espectadores conectados') + ' · máx. ' + this.LIVE_MAX_VIEWERS,
      liveErr: this.liveErr,
      setLivePreviewEl: this.setLivePreviewEl,
      setLiveWatchEl: this.setLiveWatchEl,
      liveList: this.liveSessions
        .filter((x: any) => x.uid !== this.state.user?.uid && (!x.startedAt?.seconds || Date.now() / 1000 - x.startedAt.seconds < 43200))
        .map((x: any) => ({ key: x.uid, name: x.displayName || 'Alguien', watch: () => this.liveWatch(x.uid, x.displayName || 'Alguien') })),
      liveHasList: this.liveSessions.some((x: any) => x.uid !== this.state.user?.uid && (!x.startedAt?.seconds || Date.now() / 1000 - x.startedAt.seconds < 43200)),
      liveIsWatching: !!this.liveWatching,
      liveWatchName: this.liveWatching?.name || '',
      liveWatchStatus: this.liveWatching?.connected ? 'EN VIVO' : 'Conectando…',
      liveLeave: this.liveLeave,
      gShowList: !this.gActiveId && this.gMode === 'list',`);

  return s;
}
