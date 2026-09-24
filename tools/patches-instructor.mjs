// Panel de Instructor: acceso real (solo instructor/estudio/admin, this.subs.docente ya viene de
// Postgres vía /me), rediseño del Dashboard (Quick Stats + Sala de clase + Student Management +
// Communication Hub + Message) y la pestaña Finanzas con dinero real de Stripe Connect.
export default function patchesInstructor(s) {
  const rep = (a, b) => {
    if (!s.includes(a)) throw new Error('parche no encontrado (instructor): ' + a.slice(0, 80));
    s = s.replace(a, () => b);
  };

  // El acceso real: this.subs.docente ya refleja el rol real (Postgres, vía refreshMe()).
  rep(
    `      insLiveLabel: this.insLive ? 'Terminar clase en vivo' : 'Abrir sala en vivo',`,
    `      insLiveLabel: this.insLive ? 'Terminar clase en vivo' : 'Abrir sala en vivo',
      isRealInstructor: this.subs.docente,
      isInstructorLocked: v === 'instructor' && !this.subs.docente,
      insStudentMgmt: this.buildInsStudentMgmt(),
      insCommHub: this.buildInsCommHub(),
      insLiveShortLabel: this.insLive ? 'Terminar clase' : 'Start Live Class',
      insFinBanner: !!this.insEarnings && !this.insEarnings.chargesEnabled,
      insFinBannerText: this.insEarnings && !this.insEarnings.onboarded
        ? 'Todavía no activaste tus cobros. Actívalos para poder retirar tu dinero.'
        : 'Tu cuenta de cobros está en revisión de Stripe. En cuanto se active, verás tu saldo real aquí.',
      insFinConnect: () => startConnectOnboarding().catch((e) => { this.insEarningsErr = e.message; this.forceUpdate(); }),
      insFinYourShareLabel: 'Tu parte · ' + (this.insEarnings ? (100 - this.insEarnings.feePercent) : 75) + '%',
      insFinPlatformShareLabel: 'Plataforma · ' + (this.insEarnings ? this.insEarnings.feePercent : 25) + '%',
      insFinNet: this.fmtCents(this.insEarnings?.monthlyNetCents, this.insEarnings?.currency),
      insFinGross: this.fmtCents(this.insEarnings ? this.insEarnings.monthlyGrossCents - this.insEarnings.monthlyNetCents : null, this.insEarnings?.currency),
      insFinAvailable: this.fmtCents(this.sumMinor(this.insEarnings?.available), this.insEarnings?.currency),
      insFinPending: this.fmtCents(this.sumMinor(this.insEarnings?.pending), this.insEarnings?.currency),
      insFinSubs: this.insEarnings ? this.insEarnings.activeSubscribers : '—',
      insFinLastPayout: this.insEarnings?.lastPayout ? this.fmtCents(this.insEarnings.lastPayout.amount, this.insEarnings.lastPayout.currency) : '—',
      insFinLastPayoutDate: this.insEarnings?.lastPayout ? ('Pagado · ' + new Date(this.insEarnings.lastPayout.arrivalDate * 1000).toLocaleDateString('es-ES')) : (this.insEarningsBusy ? 'Cargando…' : 'Sin pagos todavía'),`
  );

  // Datos + carga real de finanzas, y las listas del Dashboard.
  rep(
    `  setInsTab(id) { this.insTab = id; this.forceUpdate(); }`,
    `  insEarnings = null;
  insEarningsBusy = false;
  insEarningsErr = '';

  async loadInsEarnings() {
    if (this.insEarningsBusy) return;
    this.insEarningsBusy = true; this.insEarningsErr = ''; this.forceUpdate();
    try { this.insEarnings = await getInstructorEarnings(); }
    catch (e) { this.insEarningsErr = e.message || 'No se pudo cargar tu información de pagos.'; }
    this.insEarningsBusy = false; this.forceUpdate();
  }

  fmtCents(cents, currency) {
    if (cents == null || !currency) return '—';
    try { return new Intl.NumberFormat('es-ES', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100); }
    catch { return (cents / 100).toFixed(2) + ' ' + currency.toUpperCase(); }
  }

  sumMinor(list) { return Array.isArray(list) && list.length ? list.reduce((n, x) => n + x.amount, 0) : (list ? 0 : null); }

  buildInsStudentMgmt() {
    return this.students.slice(0, 3).map((st, i) => ({
      key: st.id,
      name: st.n,
      fraction: Math.round(st.pct / 10) + ' / 10',
      pctLabel: 'Progreso ' + st.pct + '%',
      bar: 'width:' + st.pct + '%;height:100%;border-radius:999px;background:linear-gradient(90deg,' + st.c1 + ',' + st.c2 + ')'
    }));
  }

  buildInsCommHub() {
    return this.students.slice(0, 3).map((st) => ({
      key: st.id,
      name: st.n,
      level: st.lv,
      last: st.last,
      avatar: 'width:36px;height:36px;flex:0 0 36px;border-radius:13px;border:1px solid var(--hair);background:linear-gradient(135deg, color-mix(in oklch, ' + st.c1 + ' 72%, #fff 8%), color-mix(in oklch, ' + st.c2 + ' 70%, #000 18%))'
    }));
  }

  setInsTab(id) {
    this.insTab = id;
    if (id === 'finances' && this.subs.docente && !this.insEarnings) this.loadInsEarnings();
    this.forceUpdate();
  }`
  );

  return s;
}
