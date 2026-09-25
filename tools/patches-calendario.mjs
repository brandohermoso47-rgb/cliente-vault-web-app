// Calendario de clases: el instructor programa (Panel de Instructor › Clases & Directos) y todos ven
// "Próximas clases" en Lives con botones para agregarlas a su calendario (.ics / Google Calendar).
export default function patchesCalendario(s) {
  const rep = (a, b) => {
    if (!s.includes(a)) throw new Error('parche no encontrado (calendario): ' + a.slice(0, 80));
    s = s.replace(a, () => b);
  };

  rep(`    this.unsubLiveSessions && this.unsubLiveSessions();
    this.unsubLiveSessions = watchLiveSessions(`, `    this.unsubEvents && this.unsubEvents();
    this.unsubEvents = subscribeEvents((rows: any) => { this.liveEvents = rows; this.forceUpdate(); });
    this.unsubLiveSessions && this.unsubLiveSessions();
    this.unsubLiveSessions = watchLiveSessions(`);
  rep(`    this.unsubLiveSessions && this.unsubLiveSessions(); this.unsubLiveSessions = null;`,
      `    this.unsubLiveSessions && this.unsubLiveSessions(); this.unsubLiveSessions = null;
    this.unsubEvents && this.unsubEvents(); this.unsubEvents = null;`);

  rep(`  unsubLiveSessions: any = null;`, `  unsubEvents: any = null;
  liveEvents: any[] = [];
  evTitle = '';
  evDesc = '';
  evWhen = '';
  evDuration = '60';
  evBusy = false;
  evErr = '';

  evTitleChange = (e: any) => { this.evTitle = e?.target?.value ?? ''; this.forceUpdate(); };
  evDescChange = (e: any) => { this.evDesc = e?.target?.value ?? ''; this.forceUpdate(); };
  evWhenChange = (e: any) => { this.evWhen = e?.target?.value ?? ''; this.forceUpdate(); };
  evDurationChange = (e: any) => { this.evDuration = e?.target?.value ?? '60'; this.forceUpdate(); };
  evSubmit = async () => {
    if (this.evBusy || !auth.currentUser || !this.isDocente()) return;
    this.evBusy = true; this.evErr = ''; this.forceUpdate();
    try {
      await createEvent({
        uid: auth.currentUser.uid, author: this.myProfile?.displayName || this.state.user?.displayName || 'Instructor',
        title: this.evTitle, description: this.evDesc, startsAt: new Date(this.evWhen), durationMin: Number(this.evDuration),
      });
      this.evTitle = ''; this.evDesc = ''; this.evWhen = '';
    } catch (e: any) { this.evErr = e?.message || 'No se pudo programar la clase.'; }
    this.evBusy = false; this.forceUpdate();
  };

  evFmt(ts: any) {
    const d: Date | null = ts?.toDate ? ts.toDate() : null;
    return d ? d.toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
  }
  evUpcoming() {
    const now = Date.now() - 3600_000;
    return this.liveEvents.filter((e: any) => e.startsAt?.toDate && e.startsAt.toDate().getTime() >= now);
  }
  evRow(e: any) {
    const mine = e.ownerId === auth.currentUser?.uid;
    return {
      key: e.id, title: e.title, desc: e.description || '', author: e.author || 'Instructor',
      when: this.evFmt(e.startsAt) + ' · ' + e.durationMin + ' min',
      ics: () => downloadIcs(e),
      gcal: () => window.open(googleCalendarUrl(e), '_blank', 'noopener'),
      canDelete: mine, del: () => { if (window.confirm('¿Borrar esta clase del calendario?')) deleteEvent(e.id).catch(() => { this.evErr = 'No se pudo borrar.'; this.forceUpdate(); }); },
    };
  }

  unsubLiveSessions: any = null;`);

  rep(`      liveIsWatching: !!this.liveWatching,`, `      liveIsWatching: !!this.liveWatching,
      evUpcomingList: this.evUpcoming().map((e: any) => this.evRow(e)),
      evHasUpcoming: this.evUpcoming().length > 0,
      evMine: this.evUpcoming().filter((e: any) => e.ownerId === auth.currentUser?.uid).map((e: any) => this.evRow(e)),
      evTitleValue: this.evTitle, evDescValue: this.evDesc, evWhenValue: this.evWhen, evDurationValue: this.evDuration,
      evTitleChange: this.evTitleChange, evDescChange: this.evDescChange, evWhenChange: this.evWhenChange, evDurationChange: this.evDurationChange,
      evSubmit: this.evSubmit, evSubmitLabel: this.evBusy ? 'Programando…' : 'Programar clase', evErr: this.evErr,`);
  return s;
}
