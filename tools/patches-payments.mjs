// Pagos (Stripe) sobre la lógica del prototipo: planes, elección de instructor y estado real de suscripciones.
export default function patchesPayments(s) {
  const rep = (a, b) => {
    if (!s.includes(a)) throw new Error('parche pagos no encontrado: ' + a.slice(0, 80));
    s = s.replace(a, () => b);
  };

  // En producción el rol y las suscripciones salen de Firestore (Stripe + rol del perfil), no de interruptores de demo.
  rep("subs = { platform: false, instructor: true, docente: false };",
      "subs = import.meta.env.DEV ? { platform: false, instructor: true, docente: false } : { platform: false, instructor: false, docente: false };");
  rep("  toggleSub(k) {\n",
      "  toggleSub(k) {\n    if (!import.meta.env.DEV) return; // solo demo local\n");

  // Métodos de pago
  rep("  buildPlans() {", `  /* ---------- Pagos (Stripe Checkout) ---------- */
  planPickerOpen = false;
  planMsg = '';
  planBusy = false;
  PLAN_IDS = { 'Explora': 'explora', 'Una cátedra': 'catedra', 'Escuela completa': 'escuela' };

  choosePlan(p) {
    if (p.cur || this.planBusy) return;
    const id = this.PLAN_IDS[p.n];
    if (!id || id === 'explora') return; // el plan gratuito no se cobra
    if (id === 'catedra') { this.planPickerOpen = true; this.planMsg = ''; this.forceUpdate(); return; }
    this.payStart(id);
  }

  async payStart(planId, instructorId) {
    this.planBusy = true;
    this.planMsg = 'Abriendo el pago seguro…';
    this.planPickerOpen = false;
    this.forceUpdate();
    try {
      await startCheckout(planId, this.planCycle === 'Anual' ? 'year' : 'month', instructorId);
    } catch (e) {
      this.planBusy = false;
      this.planMsg = e.message || 'No se pudo abrir el pago.';
      this.forceUpdate();
    }
  }

  buildPlans() {`);
  rep("      key: p.n,\n      name: p.n,", "      key: p.n,\n      name: p.n,\n      choose: () => this.choosePlan(p),");

  // El plan actual sale de las suscripciones reales, no de una marca fija del diseño.
  rep(`      isCurrent: p.cur,
      ctaLabel: p.cur ? 'Tu plan actual'`, `      isCurrent: this.planIsCurrent(p),
      ctaLabel: this.planIsCurrent(p) ? 'Tu plan actual'`);
  rep("    if (p.cur || this.planBusy) return;", "    if (this.planIsCurrent(p) || this.planBusy) return;");
  rep("  choosePlan(p) {", `  planIsCurrent(p) {
    const id = this.PLAN_IDS[p.n];
    const { platform, instructor } = this.subs;
    if (id === 'escuela') return !!platform;
    if (id === 'catedra') return !!instructor && !platform;
    return !platform && !instructor;
  }

  choosePlan(p) {`);

  // Valores para la plantilla
  rep("      plans: this.buildPlans(),", `      plans: this.buildPlans(),
      planMsg: this.planMsg,
      planPickerOpen: this.planPickerOpen,
      planPickerClose: () => { this.planPickerOpen = false; this.forceUpdate(); },
      planPickerStop: (e) => e.stopPropagation(),
      planPickerList: this.teacherData.map((t) => ({ key: t.uid || t.id, name: t.name, role: t.role, pick: () => this.payStart('catedra', t.uid || t.id) })),
      showRoleDemo: !!import.meta.env.DEV,`);

  // Rol y suscripciones reales: vienen de la API (PostgreSQL es la fuente de verdad).
  rep("  stopData() {", `  signupData = null;
  meApi = null;

  // Crea o recupera el usuario en PostgreSQL (idempotente); el primer admin se decide en el servidor.
  async syncSession(user) {
    // Si la API no estaba disponible en el registro, la solicitud se guardó en este navegador y se reenvía ahora.
    const key = 'waackon.pendingSignup.' + user.uid;
    let stored = null;
    try { stored = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { /* sin almacenamiento */ }
    const p = this.signupData || stored || {};
    this.signupData = null;
    const prof = p.profile || {};
    const body = {};
    if (prof.displayName) body.displayName = prof.displayName;
    if (prof.handle) body.handle = prof.handle;
    if (prof.countryCode) body.countryCode = prof.countryCode;
    if (p.application) body.application = p.application;
    if (p.terms) body.termsVersion = p.terms;
    try {
      const r = await api('POST', '/session', body);
      if (r.user && r.user.role === 'admin') await user.getIdToken(true); // recoge el claim de rol nuevo
    } catch (e) {
      console.warn('API no disponible; se reintentará en el próximo inicio de sesión.', e);
      // Solo se reintenta si el servicio no estaba disponible (no si los datos eran inválidos).
      const down = e && (e.status === 503 || e.status === 0 || e.status === 502 || e.status === 504);
      try { if (down && (p.application || p.profile)) localStorage.setItem(key, JSON.stringify(p)); else localStorage.removeItem(key); } catch (err) { /* sin almacenamiento */ }
      return;
    }
    try { localStorage.removeItem(key); } catch (e) { /* sin almacenamiento */ }
    await this.refreshMe();
    if (/[?&]checkout=/.test(location.search)) [3000, 8000, 15000].forEach((ms) => setTimeout(() => this.refreshMe(), ms)); // el webhook tarda unos segundos
  }

  async refreshMe() {
    try {
      const me = await api('GET', '/me');
      this.meApi = me;
      const live = (me.subscriptions || []).filter((x) => ['active', 'trialing', 'past_due'].includes(x.status));
      this.subs = Object.assign({}, this.subs, {
        platform: live.some((x) => x.planId === 'escuela'),
        instructor: live.some((x) => x.planId === 'catedra'),
        docente: ['instructor', 'estudio', 'admin'].includes(me.user && me.user.role),
      });
      this.forceUpdate();
    } catch (e) { /* API aún no disponible: se mantiene el estado por defecto */ }
  }

  stopData() {`);

  // Al volver de Stripe (?checkout=… / ?connect=…) abrir Mi cuenta
  rep("(['login', 'register', 'registerInstructor', 'registerStudio'].includes(st.view) ? 'dashboard' : st.view)",
      "(['login', 'register', 'registerInstructor', 'registerStudio'].includes(st.view) ? (/[?&](checkout|connect)=/.test(location.search) ? 'cuenta' : 'dashboard') : st.view)");
  return s;
}
