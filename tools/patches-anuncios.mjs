// Anuncios reales: los instructores (y estudio/admin) publican con imagen opcional; se ven en vivo.
// La imagen queda arriba de la tarjeta (antes del título) para darle más peso visual.
export default function patchesAnuncios(s) {
  const rep = (a, b) => {
    if (!s.includes(a)) throw new Error('parche no encontrado (anuncios): ' + a.slice(0, 80));
    s = s.replace(a, () => b);
  };

  // Arranca la escucha en vivo de anuncios junto con el resto de datos (encadenado tras el
  // progreso del Plan de Estudio, que es lo último que agrega tools/patches-study.mjs a startData()).
  rep(
    `    this.unsubStudyProgress && this.unsubStudyProgress();
    this.unsubStudyProgress = watchStudyProgress(meUid, (p: any) => { this.studyProgress = p; this.forceUpdate(); });
  }`,
    `    this.unsubStudyProgress && this.unsubStudyProgress();
    this.unsubStudyProgress = watchStudyProgress(meUid, (p: any) => { this.studyProgress = p; this.forceUpdate(); });
    this.unsubAnnouncements && this.unsubAnnouncements();
    this.unsubAnnouncements = subscribeAnnouncements((rows: any) => { this.liveAnnouncements = rows; this.forceUpdate(); });
  }`
  );

  // Para la escucha al salir (stopData() ya la cierra tools/patches-study.mjs en último lugar).
  rep(
    `    this.unsubStudyProgress && this.unsubStudyProgress(); this.unsubStudyProgress = null;
  }`,
    `    this.unsubStudyProgress && this.unsubStudyProgress(); this.unsubStudyProgress = null;
    this.unsubAnnouncements && this.unsubAnnouncements(); this.unsubAnnouncements = null;
  }`
  );

  // Estado + acciones del panel "publicar anuncio" y la lista en vivo.
  rep(
    `    } else {
      this.battleCountdownN = null;
      this.battleTurnSecs = null;
      this.forceUpdate();
    }
  }`,
    `    } else {
      this.battleCountdownN = null;
      this.battleTurnSecs = null;
      this.forceUpdate();
    }
  }

  unsubAnnouncements: any = null;
  liveAnnouncements: any[] = [];
  annCreateOpen = false;
  annCat = 'Competencias';
  annTitle = '';
  annBody = '';
  annImageFile: File | null = null;
  annImageName = '';
  annBusy = false;
  annErr = '';

  isAnnStaff() { return ['instructor', 'estudio', 'admin'].includes(this.myProfile?.role || 'usuario'); }

  onAnnBadgeClick = () => {
    if (!this.isAnnStaff()) return;
    this.annCreateOpen = !this.annCreateOpen;
    this.annErr = '';
    this.forceUpdate();
  };

  annPickCat = (c: string) => { this.annCat = c; this.forceUpdate(); };
  annTitleChange = (e: any) => { this.annTitle = e?.target?.value ?? ''; this.forceUpdate(); };
  annBodyChange = (e: any) => { this.annBody = e?.target?.value ?? ''; this.forceUpdate(); };
  annPickImage = () => { (document.getElementById('ann-image-input') as HTMLInputElement | null)?.click(); };
  annOnImage = (e: any) => {
    const f = e?.target?.files?.[0];
    if (e?.target) e.target.value = '';
    if (!f) return;
    if (!IMAGE_TYPES.includes(f.type)) { this.annErr = 'Formato no permitido (usa JPG, PNG, WEBP o GIF).'; this.forceUpdate(); return; }
    if (f.size > MAX_IMAGE_MB * 1048576) { this.annErr = \`La imagen puede pesar máx. \${MAX_IMAGE_MB} MB.\`; this.forceUpdate(); return; }
    this.annErr = ''; this.annImageFile = f; this.annImageName = f.name; this.forceUpdate();
  };

  annCancelCreate = () => {
    this.annCreateOpen = false; this.annTitle = ''; this.annBody = ''; this.annImageFile = null; this.annImageName = ''; this.annErr = '';
    this.forceUpdate();
  };

  annSubmit = async () => {
    const user = this.state.user;
    if (!user || !this.isAnnStaff() || this.annBusy) return;
    if (!this.annTitle.trim() || !this.annBody.trim()) { this.annErr = 'Escribe un título y una descripción.'; this.forceUpdate(); return; }
    this.annBusy = true; this.annErr = ''; this.forceUpdate();
    try {
      const role = this.myProfile?.role === 'estudio' ? 'Estudio' : this.myProfile?.role === 'admin' ? 'Equipo Waack ON' : 'Instructor';
      await publishAnnouncement({
        uid: auth.currentUser!.uid,
        author: this.myProfile?.displayName || user.displayName || 'Instructor',
        role, cat: this.annCat, title: this.annTitle, body: this.annBody, file: this.annImageFile,
      });
      this.annCreateOpen = false; this.annTitle = ''; this.annBody = ''; this.annImageFile = null; this.annImageName = '';
    } catch (e: any) { this.annErr = e?.message || 'No se pudo publicar el anuncio.'; }
    this.annBusy = false; this.forceUpdate();
  };

  annCatColors: Record<string, [string, string]> = {
    'Competencias': ['var(--blue)', 'var(--purple)'],
    'Sesiones & Jams': ['var(--pink)', 'var(--yellow)'],
    'Clases Especiales': ['var(--purple)', 'var(--blue)'],
    'Comunicados': ['var(--yellow)', 'var(--pink)'],
  };

  fmtAnnDate(ts: any) {
    if (!ts?.seconds) return 'Recién publicado';
    const d = new Date(ts.seconds * 1000);
    return String(d.getMonth() + 1).padStart(2, '0') + ' · ' + String(d.getDate()).padStart(2, '0') + ' · ' + String(d.getFullYear()).slice(-2);
  }

  annSourceList() {
    if (!this.liveAnnouncements.length) return this.annData;
    return this.liveAnnouncements.map((r: any) => ({
      id: r.id, cat: r.cat || 'Comunicados', author: r.author || 'Instructor', role: r.role || 'Instructor',
      title: r.title || '', body: r.body || '', date: this.fmtAnnDate(r.createdAt), imageUrl: r.imageUrl || null, pinned: false,
    }));
  }`
  );

  // Reemplaza buildAnnTabs() para contar sobre la lista real (con reserva a los datos de muestra).
  rep(
    `  buildAnnTabs() {
    const base = 'display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border-radius:999px;font-size:12px;cursor:pointer;white-space:nowrap;transition:transform .2s cubic-bezier(.2,.85,.25,1), color .2s ease;transform-style:preserve-3d;';
    const on = base + 'font-weight:700;color:#fff;background:var(--purple);box-shadow:0 8px 18px -8px var(--purple), inset 0 1px 0 rgba(255,255,255,.3);';
    const off = base + 'font-weight:600;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);box-shadow:var(--lg-edge);';
    const cats = ['Todos', 'Competencias', 'Sesiones & Jams', 'Clases Especiales', 'Comunicados'];
    return cats.map((c) => ({
      key: c,
      label: c === 'Todos' ? 'Todos los anuncios' : c,
      count: String(c === 'Todos' ? this.annData.length : this.annData.filter((a) => a.cat === c).length),
      style: this.annFilter === c ? on : off,
      pick: () => this.pickAnn(c)
    }));
  }`,
    `  buildAnnTabs() {
    const base = 'display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border-radius:999px;font-size:12px;cursor:pointer;white-space:nowrap;transition:transform .2s cubic-bezier(.2,.85,.25,1), color .2s ease;transform-style:preserve-3d;';
    const on = base + 'font-weight:700;color:#fff;background:var(--purple);box-shadow:0 8px 18px -8px var(--purple), inset 0 1px 0 rgba(255,255,255,.3);';
    const off = base + 'font-weight:600;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);box-shadow:var(--lg-edge);';
    const cats = ['Todos', 'Competencias', 'Sesiones & Jams', 'Clases Especiales', 'Comunicados'];
    const list = this.annSourceList();
    return cats.map((c) => ({
      key: c,
      label: c === 'Todos' ? 'Todos los anuncios' : c,
      count: String(c === 'Todos' ? list.length : list.filter((a: any) => a.cat === c).length),
      style: this.annFilter === c ? on : off,
      pick: () => this.pickAnn(c)
    }));
  }`
  );

  // Reemplaza buildAnns(): fuente real (con imagen si existe), la portada ahora se calcula por categoría.
  rep(
    `  buildAnns() {
    const list = this.annFilter === 'Todos' ? this.annData : this.annData.filter((a) => a.cat === this.annFilter);
    return list.map((a, i) => ({
      key: a.id,
      cat: a.cat,
      author: a.author,
      role: a.role,
      title: a.title,
      body: a.body,
      date: a.date,
      cta: a.cta,
      isPinned: !!a.pinned,
      avatar: 'width:34px;height:34px;flex:0 0 34px;border-radius:12px;border:1px solid var(--hair);background:linear-gradient(135deg, color-mix(in oklch, ' + a.c1 + ' 72%, #fff 8%), color-mix(in oklch, ' + a.c2 + ' 70%, #000 18%))',
      cover: 'height:150px;background:linear-gradient(135deg, color-mix(in oklch, ' + a.c1 + ' 58%, #000 20%), color-mix(in oklch, ' + a.c2 + ' 55%, #000 32%))',
      card: 'display:flex;flex-direction:column;border-radius:24px;overflow:hidden;border:1px solid var(--hair);background:var(--glass);backdrop-filter:var(--lg-blur);-webkit-backdrop-filter:var(--lg-blur);box-shadow:var(--lg-edge);opacity:1;transform-style:preserve-3d;transition:transform .26s cubic-bezier(.2,.85,.25,1), border-color .26s ease;animation:rise3d .8s cubic-bezier(.2,.85,.25,1) ' + (0.07 * i).toFixed(2) + 's backwards'
    }));
  }`,
    `  buildAnns() {
    const source = this.annSourceList();
    const list = this.annFilter === 'Todos' ? source : source.filter((a: any) => a.cat === this.annFilter);
    return list.map((a: any, i: number) => {
      const [c1, c2] = this.annCatColors[a.cat] || this.annCatColors['Comunicados'];
      return {
        key: a.id,
        cat: a.cat,
        author: a.author,
        role: a.role,
        title: a.title,
        body: a.body,
        date: a.date,
        cta: a.cta || 'Ver más',
        isPinned: !!a.pinned,
        avatar: 'width:34px;height:34px;flex:0 0 34px;border-radius:12px;border:1px solid var(--hair);background:linear-gradient(135deg, color-mix(in oklch, ' + c1 + ' 72%, #fff 8%), color-mix(in oklch, ' + c2 + ' 70%, #000 18%))',
        cover: a.imageUrl
          ? "height:180px;background:center/cover no-repeat url('" + a.imageUrl + "')"
          : 'height:150px;background:linear-gradient(135deg, color-mix(in oklch, ' + c1 + ' 58%, #000 20%), color-mix(in oklch, ' + c2 + ' 55%, #000 32%))',
        card: 'display:flex;flex-direction:column;border-radius:24px;overflow:hidden;border:1px solid var(--hair);background:var(--glass);backdrop-filter:var(--lg-blur);-webkit-backdrop-filter:var(--lg-blur);box-shadow:var(--lg-edge);opacity:1;transform-style:preserve-3d;transition:transform .26s cubic-bezier(.2,.85,.25,1), border-color .26s ease;animation:rise3d .8s cubic-bezier(.2,.85,.25,1) ' + (0.07 * i).toFixed(2) + 's backwards'
      };
    });
  }`
  );

  // Expone el panel de creación y el estado del badge en el view-model.
  rep(
    `      annTabs: this.buildAnnTabs(),
      annCards: this.buildAnns(),`,
    `      annTabs: this.buildAnnTabs(),
      annCards: this.buildAnns(),
      annBadgeLabel: this.isAnnStaff() ? 'Publicar anuncio' : 'Publicación limitada a instructores',
      annBadgeStyle: 'display:inline-flex;align-items:center;gap:9px;padding:11px 18px;border-radius:999px;border:1px solid var(--hair);background:var(--glass);backdrop-filter:var(--lg-blur);-webkit-backdrop-filter:var(--lg-blur);box-shadow:var(--lg-edge);font-size:12px;font-weight:600;color:var(--ink-2);white-space:nowrap;' + (this.isAnnStaff() ? 'cursor:pointer' : 'cursor:default'),
      onAnnBadgeClick: this.onAnnBadgeClick,
      annCreateOpen: this.annCreateOpen && this.isAnnStaff(),
      annCatPicker: ['Competencias', 'Sesiones & Jams', 'Clases Especiales', 'Comunicados'].map((c) => ({
        key: c, label: c,
        style: 'padding:8px 14px;border-radius:999px;font-size:11.5px;cursor:pointer;' + (this.annCat === c
          ? 'font-weight:700;color:#fff;background:var(--purple);'
          : 'font-weight:600;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);'),
        pick: () => this.annPickCat(c)
      })),
      annTitleValue: this.annTitle,
      annBodyValue: this.annBody,
      annTitleChange: this.annTitleChange,
      annBodyChange: this.annBodyChange,
      annPickImage: this.annPickImage,
      annOnImage: this.annOnImage,
      annImageLabel: this.annImageName || 'Agregar una imagen al anuncio (opcional)',
      annCancelCreate: this.annCancelCreate,
      annSubmit: this.annSubmit,
      annSubmitLabel: this.annBusy ? 'Publicando…' : 'Publicar anuncio',
      annErr: this.annErr,`
  );

  return s;
}
