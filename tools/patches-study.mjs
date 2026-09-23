// Plan de Estudio Interactivo de Waacking — 6 módulos con su propia herramienta interactiva
// (línea de tiempo, checklist de técnica, tarjetas de reflexión, galería de figuras con juego de
// emparejar, comparador Waacking vs. Voguing, y mapa global + línea de tiempo del revival), con
// progreso real guardado por usuario en Firestore. Solo visible para quien paga la suscripción de
// plataforma ($15/mes, "Usuario Premium" / this.subs.platform) — el resto ve una tarjeta de venta.
// Nota: STUDY_MODULES, watchStudyProgress, toggleTechniqueItem, saveReflectionAnswer y
// saveQuizScoreAndComplete se importan en tiempo de ejecución desde src/lib/studyPlan.ts —
// ver el bloque `head` en tools/port-logic.mjs. Este archivo .mjs corre bajo Node al generar el
// código y no puede importar el .ts directamente.

export default function patchesStudy(s) {
  const rep = (a, b) => {
    if (!s.includes(a)) throw new Error('parche no encontrado (study): ' + a.slice(0, 80));
    s = s.replace(a, () => b);
  };

  // Ruta + nav item (mismo patrón que goLab / navLab).
  rep('      isLab: v === \'entrenamiento\',', '      isLab: v === \'entrenamiento\',\n      isStudy: v === \'study\',');
  rep('      navLab: this.nav(v === \'entrenamiento\', \'var(--blue)\'),',
      '      navLab: this.nav(v === \'entrenamiento\', \'var(--blue)\'),\n      navStudy: this.nav(v === \'study\', \'var(--yellow)\'),');
  rep('      goLab: () => this.setState({ view: \'entrenamiento\' }),',
      '      goLab: () => this.setState({ view: \'entrenamiento\' }),\n      goStudy: () => this.setState({ view: \'study\' }),');

  // Suscripción en vivo al progreso + estado inicial, encadenado tras la llamada entrante de Battle Training.
  rep(`    this.unsubIncomingCalls && this.unsubIncomingCalls();
    this.unsubIncomingCalls = watchIncomingCalls(meUid, (calls: any) => { this.battleIncoming = calls; this.forceUpdate(); });
  }`,
      `    this.unsubIncomingCalls && this.unsubIncomingCalls();
    this.unsubIncomingCalls = watchIncomingCalls(meUid, (calls: any) => { this.battleIncoming = calls; this.forceUpdate(); });
    this.unsubStudyProgress && this.unsubStudyProgress();
    this.unsubStudyProgress = watchStudyProgress(meUid, (p: any) => { this.studyProgress = p; this.forceUpdate(); });
  }

  studyProgress: any = { completedModules: [], quizScores: {}, checklist: {}, reflections: {} };
  unsubStudyProgress: any = null;
  studyActiveModuleId: string | null = null;
  studyTimelineIdx = 0;
  studyReflectionDrafts: Record<string, string> = {};
  studyMatchSelectedPioneer: string | null = null;
  studyMatchWrong: string | null = null;
  studyCompareSide: 'waacking' | 'voguing' = 'waacking';
  studyHubActive = STUDY_MODULES.find((m: any) => m.id === 'revival')!.hubs![0].id;
  studyQuizAnswers: Record<string, (number | null)[]> = {};
  studyQuizSubmitted: Record<string, boolean> = {};

  studyModuleOrder() { return STUDY_MODULES.map((m: any) => m.id); }
  studyIsUnlocked(idx: number) { return idx === 0 || this.studyProgress.completedModules.includes(this.studyModuleOrder()[idx - 1]); }
  studyActiveModule() { return STUDY_MODULES.find((m: any) => m.id === this.studyActiveModuleId) || null; }

  studyOpenModule = (id: string) => {
    const idx = this.studyModuleOrder().indexOf(id);
    if (!this.studyIsUnlocked(idx)) return;
    this.studyActiveModuleId = this.studyActiveModuleId === id ? null : id;
    this.studyTimelineIdx = 0;
    this.forceUpdate();
  };

  studyPickTimeline = (i: number) => { this.studyTimelineIdx = i; this.forceUpdate(); };

  studyToggleTechnique = (itemId: string) => {
    const mod = this.studyActiveModule();
    if (!mod) return;
    toggleTechniqueItem(auth.currentUser!.uid, this.studyProgress, mod.id, itemId);
  };

  studyReflectionChange = (cardId: string, val: string) => { this.studyReflectionDrafts[cardId] = val; this.forceUpdate(); };
  studySaveReflection = (cardId: string) => {
    const text = this.studyReflectionDrafts[cardId] ?? this.studyProgress.reflections[cardId] ?? '';
    saveReflectionAnswer(auth.currentUser!.uid, this.studyProgress, cardId, text);
  };

  studyPickPioneer = (id: string) => { this.studyMatchSelectedPioneer = id; this.studyMatchWrong = null; this.forceUpdate(); };
  studyPickModern = (id: string) => {
    const mod = this.studyActiveModule();
    const pioneerId = this.studyMatchSelectedPioneer;
    if (!mod || !pioneerId) return;
    const pioneer = (mod.figures || []).find((f: any) => f.id === pioneerId);
    if (pioneer && pioneer.matches === id) {
      this.studyMatches = { ...(this.studyMatches || {}), [pioneerId]: id };
      this.studyMatchSelectedPioneer = null;
    } else {
      this.studyMatchWrong = id;
    }
    this.forceUpdate();
  };
  studyMatches: Record<string, string> = {};

  studySetCompareSide = (side: 'waacking' | 'voguing') => { this.studyCompareSide = side; this.forceUpdate(); };
  studyPickHub = (id: string) => { this.studyHubActive = id; this.forceUpdate(); };

  studyPickQuizAnswer = (moduleId: string, qIdx: number, optIdx: number) => {
    const arr = (this.studyQuizAnswers[moduleId] || STUDY_MODULES.find((m: any) => m.id === moduleId)!.quiz.map(() => null)).slice();
    arr[qIdx] = optIdx;
    this.studyQuizAnswers = { ...this.studyQuizAnswers, [moduleId]: arr };
    this.forceUpdate();
  };

  studySubmitQuiz = (moduleId: string) => {
    const mod = STUDY_MODULES.find((m: any) => m.id === moduleId);
    if (!mod) return;
    const answers = this.studyQuizAnswers[moduleId] || [];
    const score = mod.quiz.filter((q: any, i: number) => answers[i] === q.correct).length;
    this.studyQuizSubmitted = { ...this.studyQuizSubmitted, [moduleId]: true };
    saveQuizScoreAndComplete(auth.currentUser!.uid, this.studyProgress, moduleId, score);
    this.forceUpdate();
  };

  studyGoNextModule = (moduleId: string) => {
    const idx = this.studyModuleOrder().indexOf(moduleId);
    const next = this.studyModuleOrder()[idx + 1];
    this.studyActiveModuleId = next || null;
    this.studyTimelineIdx = 0;
    this.studyMatchSelectedPioneer = null;
    this.forceUpdate();
  };`);

  rep('  stopData() {\n    this.unsubData.forEach((u: any) => u()); this.unsubData = [];\n    this.unsubFeed && this.unsubFeed(); this.unsubFeed = null;\n    this.unsubFollowCounts && this.unsubFollowCounts(); this.unsubFollowCounts = null;\n    this.unsubMyMedia && this.unsubMyMedia(); this.unsubMyMedia = null;\n    this.unsubMyPostCount && this.unsubMyPostCount(); this.unsubMyPostCount = null;\n    this.unsubIncomingCalls && this.unsubIncomingCalls(); this.unsubIncomingCalls = null;\n    this.battleHangUp();\n  }',
      `  stopData() {
    this.unsubData.forEach((u: any) => u()); this.unsubData = [];
    this.unsubFeed && this.unsubFeed(); this.unsubFeed = null;
    this.unsubFollowCounts && this.unsubFollowCounts(); this.unsubFollowCounts = null;
    this.unsubMyMedia && this.unsubMyMedia(); this.unsubMyMedia = null;
    this.unsubMyPostCount && this.unsubMyPostCount(); this.unsubMyPostCount = null;
    this.unsubIncomingCalls && this.unsubIncomingCalls(); this.unsubIncomingCalls = null;
    this.battleHangUp();
    this.unsubStudyProgress && this.unsubStudyProgress(); this.unsubStudyProgress = null;
  }`);

  // Valores para la vista: se añaden justo después del último parche de Battle Training.
  rep('      setLocalVideoEl: this.setLocalVideoEl,\n      setRemoteVideoEl: this.setRemoteVideoEl,',
      `      setLocalVideoEl: this.setLocalVideoEl,
      setRemoteVideoEl: this.setRemoteVideoEl,
      studyLocked: !this.subs.platform,
      studyModuleList: STUDY_MODULES.map((m: any, i: number) => {
        const unlocked = this.studyIsUnlocked(i);
        const done = this.studyProgress.completedModules.includes(m.id);
        const active = this.studyActiveModuleId === m.id;
        return {
          id: m.id, order: m.order, title: m.title, description: m.description,
          pick: () => this.studyOpenModule(m.id),
          badge: done ? 'Completado' : (unlocked ? '' : 'Bloqueado'),
          badgeStyle: done
            ? 'font-family:\\'Geist Mono\\',monospace;font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#14111A;background:var(--yellow);padding:3px 8px;border-radius:999px'
            : 'font-family:\\'Geist Mono\\',monospace;font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3);background:var(--glass-2);padding:3px 8px;border-radius:999px',
          showBadge: done || !unlocked,
          card: 'display:flex;flex-direction:column;gap:8px;padding:18px;border-radius:20px;border:1px solid ' + (active ? 'var(--yellow)' : 'var(--hair)') + ';background:var(--glass-2);backdrop-filter:var(--lg-blur);-webkit-backdrop-filter:var(--lg-blur);box-shadow:var(--lg-edge);cursor:' + (unlocked ? 'pointer' : 'not-allowed') + ';opacity:' + (unlocked ? '1' : '.5') + ';transition:transform .2s ease',
        };
      }),
      studyActiveTitle: (this.studyActiveModule() || {}).title || '',
      studyActiveDescription: (this.studyActiveModule() || {}).description || '',
      studyHasActive: !!this.studyActiveModule(),
      studyShowTimeline: (this.studyActiveModule() || {}).toolType === 'timeline',
      studyShowChecklist: (this.studyActiveModule() || {}).toolType === 'checklist',
      studyShowReflection: (this.studyActiveModule() || {}).toolType === 'reflection',
      studyShowGallery: (this.studyActiveModule() || {}).toolType === 'gallery',
      studyShowCompare: (this.studyActiveModule() || {}).toolType === 'compare',
      studyShowMap: (this.studyActiveModule() || {}).toolType === 'map',
      studyTimelinePills: ((this.studyActiveModule() || {}).timeline || []).map((t: any, i: number) => ({
        year: t.year, title: t.title,
        pick: () => this.studyPickTimeline(i),
        style: i === this.studyTimelineIdx
          ? 'padding:10px 16px;border-radius:999px;font-size:12px;font-weight:700;color:#14111A;background:var(--yellow);cursor:pointer;white-space:nowrap'
          : 'padding:10px 16px;border-radius:999px;font-size:12px;font-weight:600;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);cursor:pointer;white-space:nowrap'
      })),
      studyTimelineDetailTitle: (((this.studyActiveModule() || {}).timeline || [])[this.studyTimelineIdx] || {}).title || '',
      studyTimelineDetailYear: (((this.studyActiveModule() || {}).timeline || [])[this.studyTimelineIdx] || {}).year || '',
      studyTimelineDetailText: (((this.studyActiveModule() || {}).timeline || [])[this.studyTimelineIdx] || {}).text || '',
      studyChecklist: ((this.studyActiveModule() || {}).technique || []).map((t: any) => {
        const mod = this.studyActiveModule();
        const checked = !!(mod && this.studyProgress.checklist[mod.id] && this.studyProgress.checklist[mod.id][t.id]);
        return {
          name: t.name, text: t.text, checked,
          toggle: () => this.studyToggleTechnique(t.id),
          btnLabel: checked ? 'Practicado ✓' : 'Lo practiqué',
          btn: checked
            ? 'padding:8px 16px;border-radius:999px;font-size:11.5px;font-weight:700;color:#14111A;background:var(--yellow);cursor:pointer;white-space:nowrap'
            : 'padding:8px 16px;border-radius:999px;font-size:11.5px;font-weight:600;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);cursor:pointer;white-space:nowrap',
        };
      }),
      studyChecklistDoneLabel: (() => {
        const mod = this.studyActiveModule();
        if (!mod || !mod.technique) return '0 / 0 movimientos practicados';
        const done = Object.values(this.studyProgress.checklist[mod.id] || {}).filter(Boolean).length;
        return done + ' / ' + mod.technique.length + ' movimientos practicados';
      })(),
      studyReflectionCards: ((this.studyActiveModule() || {}).reflection || []).map((r: any) => ({
        question: r.question,
        value: this.studyReflectionDrafts[r.id] ?? this.studyProgress.reflections[r.id] ?? '',
        change: (e: any) => this.studyReflectionChange(r.id, e.target.value),
        save: () => this.studySaveReflection(r.id),
        saved: !!this.studyProgress.reflections[r.id] && this.studyReflectionDrafts[r.id] === undefined,
      })),
      studyPioneers: ((this.studyActiveModule() || {}).figures || []).filter((f: any) => f.era === 'pionero').map((f: any) => {
        const matched = !!this.studyMatches[f.id];
        return {
          id: f.id, name: f.name, role: f.role, bio: f.bio,
          pick: () => this.studyPickPioneer(f.id),
          card: 'display:flex;flex-direction:column;gap:6px;padding:16px;border-radius:18px;border:1px solid ' + (matched ? 'var(--yellow)' : (this.studyMatchSelectedPioneer === f.id ? 'var(--blue)' : 'var(--hair)')) + ';background:var(--glass-2);cursor:' + (matched ? 'default' : 'pointer') + ';opacity:' + (matched ? '.6' : '1')
        };
      }),
      studyModernIcons: ((this.studyActiveModule() || {}).figures || []).filter((f: any) => f.era === 'moderno').map((f: any) => {
        const matched = Object.values(this.studyMatches).includes(f.id);
        return {
          id: f.id, name: f.name, role: f.role, bio: f.bio,
          pick: () => this.studyPickModern(f.id),
          card: 'display:flex;flex-direction:column;gap:6px;padding:16px;border-radius:18px;border:1px solid ' + (matched ? 'var(--yellow)' : (this.studyMatchWrong === f.id ? 'var(--pink)' : 'var(--hair)')) + ';background:var(--glass-2);cursor:' + (matched ? 'default' : 'pointer') + ';opacity:' + (matched ? '.6' : '1')
        };
      }),
      studyMatchCountLabel: Object.keys(this.studyMatches).length + ' / ' + ((this.studyActiveModule() || {}).figures || []).filter((f: any) => f.era === 'pionero').length + ' parejas encontradas',
      studyCompareRows: ((this.studyActiveModule() || {}).compare || []).map((c: any) => ({
        axis: c.axis, waacking: c.waacking, voguing: c.voguing,
        waackingStyle: 'font-size:13px;font-weight:' + (this.studyCompareSide === 'waacking' ? '700' : '400') + ';color:' + (this.studyCompareSide === 'waacking' ? 'var(--ink)' : 'var(--ink-3)'),
        voguingStyle: 'font-size:13px;font-weight:' + (this.studyCompareSide === 'voguing' ? '700' : '400') + ';color:' + (this.studyCompareSide === 'voguing' ? 'var(--ink)' : 'var(--ink-3)'),
      })),
      studyCompareWaackBtn: 'padding:10px 18px;border-radius:999px;font-size:12px;font-weight:700;cursor:pointer;' + (this.studyCompareSide === 'waacking' ? 'color:#14111A;background:var(--yellow)' : 'color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2)'),
      studyCompareVogueBtn: 'padding:10px 18px;border-radius:999px;font-size:12px;font-weight:700;cursor:pointer;' + (this.studyCompareSide === 'voguing' ? 'color:#14111A;background:var(--yellow)' : 'color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2)'),
      studySetWaack: () => this.studySetCompareSide('waacking'),
      studySetVogue: () => this.studySetCompareSide('voguing'),
      studyHubs: ((this.studyActiveModule() || {}).hubs || []).map((h: any) => ({
        place: h.place, pick: () => this.studyPickHub(h.id),
        style: this.studyHubActive === h.id
          ? 'padding:10px 16px;border-radius:999px;font-size:12px;font-weight:700;color:#14111A;background:var(--yellow);cursor:pointer'
          : 'padding:10px 16px;border-radius:999px;font-size:12px;font-weight:600;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);cursor:pointer'
      })),
      studyHubDetail: (((this.studyActiveModule() || {}).hubs || []).find((h: any) => h.id === this.studyHubActive) || {}).text || '',
      studyRevivalList: ((this.studyActiveModule() || {}).revival || []).map((r: any) => ({ year: r.year, text: r.text })),
      studyQuizList: ((this.studyActiveModule() || {}).quiz || []).map((q: any, qi: number) => {
        const mod = this.studyActiveModule();
        const submitted = !!(mod && this.studyQuizSubmitted[mod.id]);
        const picked = (mod && this.studyQuizAnswers[mod.id] && this.studyQuizAnswers[mod.id][qi]) ?? null;
        return {
          text: q.text,
          options: q.options.map((opt: string, oi: number) => {
            const isPicked = picked === oi;
            const isCorrect = oi === q.correct;
            let style = 'padding:10px 16px;border-radius:14px;font-size:12.5px;font-weight:600;cursor:pointer;text-align:left;border:1px solid var(--hair);background:var(--glass-2);color:var(--ink-2)';
            if (submitted && isCorrect) style = 'padding:10px 16px;border-radius:14px;font-size:12.5px;font-weight:700;cursor:default;text-align:left;border:1px solid var(--yellow);background:color-mix(in oklch, var(--yellow) 22%, transparent);color:var(--ink)';
            else if (submitted && isPicked) style = 'padding:10px 16px;border-radius:14px;font-size:12.5px;font-weight:700;cursor:default;text-align:left;border:1px solid var(--pink);background:color-mix(in oklch, var(--pink) 18%, transparent);color:var(--ink)';
            else if (!submitted && isPicked) style = 'padding:10px 16px;border-radius:14px;font-size:12.5px;font-weight:700;cursor:pointer;text-align:left;border:1px solid var(--blue);background:color-mix(in oklch, var(--blue) 18%, transparent);color:var(--ink)';
            return { label: opt, pick: submitted ? (() => {}) : (() => this.studyPickQuizAnswer(mod.id, qi, oi)), style };
          }),
        };
      }),
      studyQuizSubmitted: !!(this.studyActiveModule() && this.studyQuizSubmitted[this.studyActiveModule()!.id]),
      studyQuizNotSubmitted: !(this.studyActiveModule() && this.studyQuizSubmitted[this.studyActiveModule()!.id]),
      studyQuizScoreLabel: (() => {
        const mod = this.studyActiveModule();
        if (!mod) return '';
        const score = this.studyProgress.quizScores[mod.id];
        return score === undefined ? '' : score + ' / ' + mod.quiz.length + ' correctas';
      })(),
      studySubmitQuizClick: () => this.studyActiveModule() && this.studySubmitQuiz(this.studyActiveModule()!.id),
      studyGoNextClick: () => this.studyActiveModule() && this.studyGoNextModule(this.studyActiveModule()!.id),
      studyHasNextModule: !!this.studyActiveModule() && this.studyModuleOrder().indexOf(this.studyActiveModuleId!) < this.studyModuleOrder().length - 1,`);

  return s;
}
