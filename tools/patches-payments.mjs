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

  // Estado real desde Firestore: rol del perfil y suscripciones activas
  rep("      watch('reels', (rows) => {", `      onSnapshot(doc(db, 'users', this.state.user.uid), (snap) => {
        const role = snap.data()?.role ?? 'usuario';
        this.subs = Object.assign({}, this.subs, { docente: ['instructor', 'estudio', 'admin'].includes(role) });
        this.forceUpdate();
      }, () => {}),
      onSnapshot(query(collection(db, 'subscriptions'), where('uid', '==', this.state.user.uid)), (snap) => {
        const live = snap.docs.map((d) => d.data()).filter((x) => ['active', 'trialing', 'past_due'].includes(x.status));
        this.subs = Object.assign({}, this.subs, { platform: live.some((x) => x.planId === 'escuela'), instructor: live.some((x) => x.planId === 'catedra') });
        this.forceUpdate();
      }, () => {}),
      watch('reels', (rows) => {`);

  // Al volver de Stripe (?checkout=… / ?connect=…) abrir Mi cuenta
  rep("(['login', 'register', 'registerInstructor', 'registerStudio'].includes(st.view) ? 'dashboard' : st.view)",
      "(['login', 'register', 'registerInstructor', 'registerStudio'].includes(st.view) ? (/[?&](checkout|connect)=/.test(location.search) ? 'cuenta' : 'dashboard') : st.view)");
  return s;
}
