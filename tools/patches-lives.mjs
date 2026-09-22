// Lives: el chip "Batallas" abre un panel con dos botones reales — "Ir en vivo" (libre para
// cualquier usuario) y "Modo Practice" (solo si tienes una clase/cátedra activa con un instructor).
// Modo Practice abre una videollamada 1 a 1 real (WebRTC) con dos pantallas, ronda de 1 minuto por
// concursante con cuenta 3-2-1, y sin declarar ganador.
export default function patchesLives(s) {
  const rep = (a, b) => {
    if (!s.includes(a)) throw new Error('parche no encontrado (lives): ' + a.slice(0, 80));
    s = s.replace(a, () => b);
  };

  rep('    this.unsubMyPostCount = watchMyPostCount(meUid, (n: any) => { this.myPostCount = n; this.forceUpdate(); });\n  }',
      `    this.unsubMyPostCount = watchMyPostCount(meUid, (n: any) => { this.myPostCount = n; this.forceUpdate(); });
    this.unsubIncomingCalls && this.unsubIncomingCalls();
    this.unsubIncomingCalls = watchIncomingCalls(meUid, (calls: any) => { this.battleIncoming = calls; this.forceUpdate(); });
  }`);

  rep('  stopData() {\n    this.unsubData.forEach((u: any) => u()); this.unsubData = [];\n    this.unsubFeed && this.unsubFeed(); this.unsubFeed = null;\n    this.unsubFollowCounts && this.unsubFollowCounts(); this.unsubFollowCounts = null;\n    this.unsubMyMedia && this.unsubMyMedia(); this.unsubMyMedia = null;\n    this.unsubMyPostCount && this.unsubMyPostCount(); this.unsubMyPostCount = null;\n  }',
      `  stopData() {
    this.unsubData.forEach((u: any) => u()); this.unsubData = [];
    this.unsubFeed && this.unsubFeed(); this.unsubFeed = null;
    this.unsubFollowCounts && this.unsubFollowCounts(); this.unsubFollowCounts = null;
    this.unsubMyMedia && this.unsubMyMedia(); this.unsubMyMedia = null;
    this.unsubMyPostCount && this.unsubMyPostCount(); this.unsubMyPostCount = null;
    this.unsubIncomingCalls && this.unsubIncomingCalls(); this.unsubIncomingCalls = null;
    this.battleHangUp();
  }

  battlePanel: 'off' | 'menu' | 'pick' | 'call' = 'off';
  battleCall: any = null;
  battleIncoming: any[] = [];
  unsubIncomingCalls: any = null;
  battleIsLive = false;
  battleRound: any = { phase: 'idle' };
  battleCountdownN: number | null = null;
  battleTurnSecs: number | null = null;
  battleTimers: any[] = [];
  battleErr = '';
  localVideoEl: HTMLVideoElement | null = null;
  remoteVideoEl: HTMLVideoElement | null = null;
  setLocalVideoEl = (el: any) => { this.localVideoEl = el; if (el && this.battleCall?.localStream) el.srcObject = this.battleCall.localStream; };
  setRemoteVideoEl = (el: any) => { this.remoteVideoEl = el; if (el && this.battleCall?.remoteStream) el.srcObject = this.battleCall.remoteStream; };

  battleClearTimers() { this.battleTimers.forEach((t: any) => clearTimeout(t)); this.battleTimers = []; }

  battleToggleMenu = () => { this.battlePanel = this.battlePanel === 'off' ? 'menu' : 'off'; this.forceUpdate(); };

  battleGoLive = async () => {
    const user = this.state.user;
    if (!user) return;
    this.battleErr = '';
    try {
      if (this.battleIsLive) {
        stopLive(user.uid);
        this.battleIsLive = false;
      } else {
        await goLive(user.uid, this.myProfile?.displayName || user.displayName || 'Alguien');
        this.battleIsLive = true;
      }
    } catch { this.battleErr = 'No se pudo activar tu transmisión. Inténtalo de nuevo.'; }
    this.forceUpdate();
  };

  myInstructorList() {
    const subs = (this.meApi?.subscriptions || []).filter((x: any) => x.instructorId && ['active', 'trialing', 'past_due'].includes(x.status));
    const seen = new Set<string>();
    return subs.filter((s: any) => (seen.has(s.instructorId) ? false : (seen.add(s.instructorId), true)))
      .map((s: any) => ({ id: s.instructorId, name: this.resolveUserName(s.instructorId) }));
  }

  battleOpenPractice = () => {
    if (!this.myInstructorList().length) return;
    this.battlePanel = 'pick';
    this.forceUpdate();
  };

  battleStartCallSetup(call: any) {
    call.onRemoteTrack = () => { if (this.remoteVideoEl) this.remoteVideoEl.srcObject = call.remoteStream; this.forceUpdate(); };
    call.onRoundChange = (round: any) => this.battleApplyRound(round, call);
    call.onEnded = () => { this.battleErr = 'La llamada terminó.'; this.battleCall = null; this.battlePanel = 'menu'; this.battleClearTimers(); this.forceUpdate(); };
  }

  battleCallInstructor = async (otherUid: string) => {
    const user = this.state.user;
    if (!user) return;
    this.battleErr = '';
    try {
      const call = new BattleCall(user.uid);
      this.battleStartCallSetup(call);
      await call.shareScreen();
      if (this.localVideoEl) this.localVideoEl.srcObject = call.localStream;
      await call.call(otherUid, 'practice');
      this.battleCall = call;
      this.battlePanel = 'call';
    } catch (e: any) { this.battleErr = e?.message?.includes('Permission') ? 'Debes permitir compartir tu pantalla para entrenar.' : 'No se pudo iniciar la llamada.'; }
    this.forceUpdate();
  };

  battleAcceptIncoming = async (c: any) => {
    const user = this.state.user;
    if (!user) return;
    this.battleErr = '';
    try {
      const call = new BattleCall(user.uid);
      this.battleStartCallSetup(call);
      await call.shareScreen();
      if (this.localVideoEl) this.localVideoEl.srcObject = call.localStream;
      await call.answer(c.id, c.offer);
      this.battleCall = call;
      this.battlePanel = 'call';
    } catch { this.battleErr = 'No se pudo aceptar la llamada.'; }
    this.forceUpdate();
  };

  battleDeclineIncoming = (c: any) => { declineCall(c.id); };

  battleHangUp = () => {
    this.battleClearTimers();
    this.battleCall?.hangUp();
    this.battleCall = null;
    this.battleRound = { phase: 'idle' };
    this.battleCountdownN = null;
    this.battleTurnSecs = null;
    this.battlePanel = 'menu';
    this.forceUpdate();
  };

  battleStartRound = () => { this.battleCall?.setRound({ phase: 'countdown', startedAt: Date.now() }); };

  battleApplyRound(round: any, call: any) {
    this.battleRound = round;
    this.battleClearTimers();
    if (round.phase === 'countdown') {
      this.battleCountdownN = 3;
      this.battleTurnSecs = null;
      this.forceUpdate();
      [1, 2, 3].forEach((i) => this.battleTimers.push(setTimeout(() => { this.battleCountdownN = 3 - i; this.forceUpdate(); }, i * 1000)));
      if (call.isCaller) this.battleTimers.push(setTimeout(() => call.setRound({ phase: this.battleRound.turn === 2 ? 'turn2' : 'turn1', turn: this.battleRound.turn === 2 ? 2 : 1, startedAt: Date.now() }), 3000));
    } else if (round.phase === 'turn1' || round.phase === 'turn2') {
      this.battleCountdownN = null;
      this.battleTurnSecs = 60;
      this.forceUpdate();
      for (let s = 1; s <= 60; s++) this.battleTimers.push(setTimeout(() => { this.battleTurnSecs = 60 - s; this.forceUpdate(); }, s * 1000));
      if (call.isCaller) this.battleTimers.push(setTimeout(() => {
        if (round.phase === 'turn1') call.setRound({ phase: 'countdown', turn: 2, startedAt: Date.now() });
        else call.setRound({ phase: 'done', startedAt: Date.now() });
      }, 60000));
    } else {
      this.battleCountdownN = null;
      this.battleTurnSecs = null;
      this.forceUpdate();
    }
  }`);

  // Vista: el chip "Batallas" queda clicable y expone el panel real.
  rep("      chipOff: 'padding:10px 18px;border-radius:999px;font-size:12px;font-weight:600;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);box-shadow:var(--lg-edge);cursor:pointer;transform-style:preserve-3d;transition:transform .2s cubic-bezier(.2,.85,.25,1), color .2s ease',",
      `      chipOff: 'padding:10px 18px;border-radius:999px;font-size:12px;font-weight:600;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);box-shadow:var(--lg-edge);cursor:pointer;transform-style:preserve-3d;transition:transform .2s cubic-bezier(.2,.85,.25,1), color .2s ease',
      onBattleChip: this.battleToggleMenu,
      battleChipStyle: this.battlePanel !== 'off'
        ? 'padding:10px 18px;border-radius:999px;font-size:12px;font-weight:700;color:#14111A;background:var(--pink);cursor:pointer'
        : 'padding:10px 18px;border-radius:999px;font-size:12px;font-weight:600;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);cursor:pointer',
      battlePanelOpen: this.battlePanel !== 'off',
      battleShowMenu: this.battlePanel === 'menu',
      battleShowPick: this.battlePanel === 'pick',
      battleShowCall: this.battlePanel === 'call',
      battleLiveLabel: this.battleIsLive ? 'Terminar transmisión' : 'Ir en vivo',
      onBattleGoLive: this.battleGoLive,
      battlePracticeEnabled: this.myInstructorList().length > 0,
      battlePracticeCardStyle: 'flex:1;min-width:220px;padding:18px;border-radius:18px;border:1px solid var(--hair);background:var(--glass-2);' + (this.myInstructorList().length > 0 ? 'cursor:pointer' : 'cursor:default;opacity:.5'),
      onBattleOpenPractice: this.battleOpenPractice,
      battleInstructors: this.myInstructorList().map((i: any) => ({ id: i.id, name: i.name, call: () => this.battleCallInstructor(i.id) })),
      battleIncomingCalls: this.battleIncoming.map((c: any) => ({
        id: c.id, from: this.resolveUserName(c.callerId),
        accept: () => this.battleAcceptIncoming(c), decline: () => this.battleDeclineIncoming(c)
      })),
      battleErr: this.battleErr,
      onBattleHangUp: this.battleHangUp,
      onBattleStartRound: this.battleStartRound,
      battleShowStartRound: this.battleRound.phase === 'idle' || this.battleRound.phase === 'done',
      battleRoundDone: this.battleRound.phase === 'done',
      battleCountdownLabel: this.battleCountdownN != null ? String(this.battleCountdownN === 0 ? '¡Ya!' : this.battleCountdownN) : '',
      battleShowCountdown: this.battleCountdownN != null,
      battleShowTimer: this.battleTurnSecs != null,
      battleTurnLabel: this.battleRound.turn === 2 ? 'Turno 2' : 'Turno 1',
      battleTurnSecsLabel: this.battleTurnSecs != null ? String(this.battleTurnSecs) : '',
      setLocalVideoEl: this.setLocalVideoEl,
      setRemoteVideoEl: this.setRemoteVideoEl,`);

  return s;
}
