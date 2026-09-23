// Manuales reales: cada ebook con su portada real (o degradado por categoría si no hay), y el
// formulario para subir el PDF (con portada opcional) que solo se ve en el Panel de Instructor.
export default function patchesEbooks(s) {
  const rep = (a, b) => {
    if (!s.includes(a)) throw new Error('parche no encontrado (ebooks): ' + a.slice(0, 80));
    s = s.replace(a, () => b);
  };

  // Arranca la escucha en vivo de manuales junto con el resto de datos (encadenado tras los
  // anuncios, que es lo último que agrega tools/patches-anuncios.mjs a startData()).
  rep(
    `    this.unsubAnnouncements && this.unsubAnnouncements();
    this.unsubAnnouncements = subscribeAnnouncements((rows: any) => { this.liveAnnouncements = rows; this.forceUpdate(); });
  }`,
    `    this.unsubAnnouncements && this.unsubAnnouncements();
    this.unsubAnnouncements = subscribeAnnouncements((rows: any) => { this.liveAnnouncements = rows; this.forceUpdate(); });
    this.unsubEbooks && this.unsubEbooks();
    this.unsubEbooks = subscribeEbooks((rows: any) => { this.liveEbooks = rows; this.forceUpdate(); });
  }`
  );

  rep(
    `    this.unsubAnnouncements && this.unsubAnnouncements(); this.unsubAnnouncements = null;
  }`,
    `    this.unsubAnnouncements && this.unsubAnnouncements(); this.unsubAnnouncements = null;
    this.unsubEbooks && this.unsubEbooks(); this.unsubEbooks = null;
  }`
  );

  // Estado + acciones del formulario de subida (solo visible/útil si eres instructor/estudio/admin).
  rep(
    `  annSourceList() {
    if (!this.liveAnnouncements.length) return this.annData;
    return this.liveAnnouncements.map((r: any) => ({
      id: r.id, cat: r.cat || 'Comunicados', author: r.author || 'Instructor', role: r.role || 'Instructor',
      title: r.title || '', body: r.body || '', date: this.fmtAnnDate(r.createdAt), imageUrl: r.imageUrl || null, pinned: false,
    }));
  }`,
    `  annSourceList() {
    if (!this.liveAnnouncements.length) return this.annData;
    return this.liveAnnouncements.map((r: any) => ({
      id: r.id, cat: r.cat || 'Comunicados', author: r.author || 'Instructor', role: r.role || 'Instructor',
      title: r.title || '', body: r.body || '', date: this.fmtAnnDate(r.createdAt), imageUrl: r.imageUrl || null, pinned: false,
    }));
  }

  unsubEbooks: any = null;
  liveEbooks: any[] = [];
  ebCat = 'Manual';
  ebTitle = '';
  ebMeta = '';
  ebCoverFile: File | null = null;
  ebCoverName = '';
  ebPdfFile: File | null = null;
  ebPdfName = '';
  ebBusy = false;
  ebErr = '';

  isEbStaff() { return ['instructor', 'estudio', 'admin'].includes(this.myProfile?.role || 'usuario'); }

  ebPickCat = (c: string) => { this.ebCat = c; this.forceUpdate(); };
  ebTitleChange = (e: any) => { this.ebTitle = e?.target?.value ?? ''; this.forceUpdate(); };
  ebMetaChange = (e: any) => { this.ebMeta = e?.target?.value ?? ''; this.forceUpdate(); };
  ebPickCover = () => { (document.getElementById('eb-cover-input') as HTMLInputElement | null)?.click(); };
  ebOnCover = (e: any) => {
    const f = e?.target?.files?.[0];
    if (e?.target) e.target.value = '';
    if (!f) return;
    if (!IMAGE_TYPES.includes(f.type)) { this.ebErr = 'Formato de portada no permitido (usa JPG, PNG, WEBP o GIF).'; this.forceUpdate(); return; }
    if (f.size > MAX_IMAGE_MB * 1048576) { this.ebErr = \`La portada puede pesar máx. \${MAX_IMAGE_MB} MB.\`; this.forceUpdate(); return; }
    this.ebErr = ''; this.ebCoverFile = f; this.ebCoverName = f.name; this.forceUpdate();
  };
  ebPickPdf = () => { (document.getElementById('eb-pdf-input') as HTMLInputElement | null)?.click(); };
  ebOnPdf = (e: any) => {
    const f = e?.target?.files?.[0];
    if (e?.target) e.target.value = '';
    if (!f) return;
    if (f.type !== 'application/pdf') { this.ebErr = 'Sube un archivo PDF.'; this.forceUpdate(); return; }
    if (f.size > MAX_PDF_MB * 1048576) { this.ebErr = \`El PDF puede pesar máx. \${MAX_PDF_MB} MB.\`; this.forceUpdate(); return; }
    this.ebErr = ''; this.ebPdfFile = f; this.ebPdfName = f.name; this.forceUpdate();
  };

  ebSubmit = async () => {
    const user = this.state.user;
    if (!user || !this.isEbStaff() || this.ebBusy) return;
    if (!this.ebTitle.trim()) { this.ebErr = 'Escribe un título.'; this.forceUpdate(); return; }
    if (!this.ebPdfFile) { this.ebErr = 'Selecciona el PDF del manual.'; this.forceUpdate(); return; }
    this.ebBusy = true; this.ebErr = ''; this.forceUpdate();
    try {
      await publishEbook({
        uid: auth.currentUser!.uid,
        author: this.myProfile?.displayName || user.displayName || 'Instructor',
        kind: this.ebCat as any, title: this.ebTitle, meta: this.ebMeta, pdfFile: this.ebPdfFile, coverFile: this.ebCoverFile,
      });
      this.ebTitle = ''; this.ebMeta = ''; this.ebCoverFile = null; this.ebCoverName = ''; this.ebPdfFile = null; this.ebPdfName = '';
    } catch (e: any) { this.ebErr = e?.message || 'No se pudo publicar el manual.'; }
    this.ebBusy = false; this.forceUpdate();
  };

  ebCatColors: Record<string, [string, string]> = {
    'Manual': ['var(--blue)', 'var(--purple)'],
    'Guía': ['var(--purple)', 'var(--pink)'],
  };

  myEbooks() {
    const uid = this.state.user && this.state.user.uid;
    return this.liveEbooks.filter((r: any) => r.ownerId === uid);
  }

  ebSourceList() {
    const realManualGuia = this.liveEbooks.map((r: any) => ({
      t: r.title, k: r.kind === 'Guía' ? 'Guía' : 'Manual', meta: r.meta || 'PDF', by: r.author || 'Instructor',
      coverUrl: r.coverUrl || null, pdfUrl: r.pdfUrl || null,
    }));
    const mockManualGuia = this.libData.filter((x: any) => x.k !== 'Podcast');
    const manualGuia = realManualGuia.length ? realManualGuia : mockManualGuia;
    const podcasts = this.libData.filter((x: any) => x.k === 'Podcast');
    return [...manualGuia, ...podcasts];
  }`
  );

  // Reemplaza buildLibTabs() para contar sobre la lista real (con reserva a los datos de muestra).
  rep(
    `  buildLibTabs() {
    const base = 'padding:9px 16px;border-radius:999px;font-size:12px;cursor:pointer;white-space:nowrap;';
    const on = base + 'font-weight:700;color:#fff;background:var(--blue);box-shadow:0 8px 18px -8px var(--blue), inset 0 1px 0 rgba(255,255,255,.3);';
    const off = base + 'font-weight:600;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);box-shadow:var(--lg-edge);';
    return ['Todo', 'Manual', 'Podcast', 'Guía'].map((t) => ({
      key: t,
      label: t === 'Todo' ? 'Todo' : t + 's',
      style: this.libTab === t ? on : off,
      pick: () => this.pickLib(t)
    }));
  }`,
    `  buildLibTabs() {
    const base = 'padding:9px 16px;border-radius:999px;font-size:12px;cursor:pointer;white-space:nowrap;';
    const on = base + 'font-weight:700;color:#fff;background:var(--blue);box-shadow:0 8px 18px -8px var(--blue), inset 0 1px 0 rgba(255,255,255,.3);';
    const off = base + 'font-weight:600;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);box-shadow:var(--lg-edge);';
    const list = this.ebSourceList();
    return ['Todo', 'Manual', 'Podcast', 'Guía'].map((t) => ({
      key: t,
      label: t === 'Todo' ? 'Todo' : t + 's',
      style: this.libTab === t ? on : off,
      pick: () => this.pickLib(t)
    }));
  }`
  );

  // Reemplaza buildLib(): fuente real (con portada si existe), abre el PDF en pestaña nueva.
  rep(
    `  buildLib() {
    const list = this.libTab === 'Todo' ? this.libData : this.libData.filter((x) => x.k === this.libTab);
    return list.map((x, i) => ({
      key: x.t,
      title: x.t,
      kind: x.k,
      meta: x.meta,
      by: x.by,
      isAudio: x.k === 'Podcast',
      onOpen: x.k === 'Podcast' ? () => this.setState({ view: 'podcast' }, () => this.podGo(x.ep || 0)) : undefined,
      cover: 'height:130px;background:linear-gradient(135deg, color-mix(in oklch, ' + x.c1 + ' 58%, #000 20%), color-mix(in oklch, ' + x.c2 + ' 55%, #000 32%))',
      card: 'display:flex;flex-direction:column;border-radius:24px;overflow:hidden;cursor:pointer;border:1px solid var(--hair);background:var(--glass);backdrop-filter:var(--lg-blur);-webkit-backdrop-filter:var(--lg-blur);box-shadow:var(--lg-edge);opacity:1;transform-style:preserve-3d;transition:transform .26s cubic-bezier(.2,.85,.25,1), border-color .26s ease;animation:rise3d .8s cubic-bezier(.2,.85,.25,1) ' + (0.06 * i).toFixed(2) + 's backwards'
    }));
  }`,
    `  buildLib() {
    const source = this.ebSourceList();
    const list = this.libTab === 'Todo' ? source : source.filter((x: any) => x.k === this.libTab);
    return list.map((x: any, i: number) => {
      const [dc1, dc2] = this.ebCatColors[x.k] || ['var(--blue)', 'var(--purple)'];
      const c1 = x.c1 || dc1, c2 = x.c2 || dc2;
      return {
        key: x.t + i,
        title: x.t,
        kind: x.k,
        meta: x.meta,
        by: x.by,
        isAudio: x.k === 'Podcast',
        onOpen: x.k === 'Podcast'
          ? () => this.setState({ view: 'podcast' }, () => this.podGo(x.ep || 0))
          : (x.pdfUrl ? () => window.open(x.pdfUrl, '_blank') : undefined),
        cover: x.coverUrl
          ? "height:130px;background:center/cover no-repeat url('" + x.coverUrl + "')"
          : 'height:130px;background:linear-gradient(135deg, color-mix(in oklch, ' + c1 + ' 58%, #000 20%), color-mix(in oklch, ' + c2 + ' 55%, #000 32%))',
        card: 'display:flex;flex-direction:column;border-radius:24px;overflow:hidden;cursor:pointer;border:1px solid var(--hair);background:var(--glass);backdrop-filter:var(--lg-blur);-webkit-backdrop-filter:var(--lg-blur);box-shadow:var(--lg-edge);opacity:1;transform-style:preserve-3d;transition:transform .26s cubic-bezier(.2,.85,.25,1), border-color .26s ease;animation:rise3d .8s cubic-bezier(.2,.85,.25,1) ' + (0.06 * i).toFixed(2) + 's backwards'
      };
    });
  }`
  );

  // Panel de Instructor · pestaña Manuales: lista real de lo que subió (no el mock), más el
  // formulario de subida (que solo un instructor/estudio/admin puede usar de verdad).
  rep(
    `      insDocList: this.simpleList(this.insDocs),`,
    `      insDocList: this.myEbooks().length
        ? this.myEbooks().map((r: any) => ({ key: r.id, title: r.title, meta: r.kind + ' · ' + (r.meta || 'PDF'), state: 'Publicado', hasState: true, badge: 'padding:5px 11px;border-radius:999px;font-family:"Geist Mono",monospace;font-size:8.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap;background:var(--blue);color:#fff;' }))
        : this.simpleList(this.insDocs),
      ebCatPicker: ['Manual', 'Guía'].map((c) => ({
        key: c, label: c,
        style: 'padding:8px 14px;border-radius:999px;font-size:11.5px;cursor:pointer;' + (this.ebCat === c
          ? 'font-weight:700;color:#fff;background:var(--purple);'
          : 'font-weight:600;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);'),
        pick: () => this.ebPickCat(c)
      })),
      ebTitleValue: this.ebTitle,
      ebMetaValue: this.ebMeta,
      ebTitleChange: this.ebTitleChange,
      ebMetaChange: this.ebMetaChange,
      ebPickCover: this.ebPickCover,
      ebOnCover: this.ebOnCover,
      ebCoverLabel: this.ebCoverName || 'Subir la portada del manual (opcional)',
      ebPickPdf: this.ebPickPdf,
      ebOnPdf: this.ebOnPdf,
      ebPdfLabel: this.ebPdfName || 'Arrastra o selecciona un PDF · máx. 50 MB',
      ebSubmit: this.ebSubmit,
      ebSubmitLabel: this.ebBusy ? 'Publicando…' : 'Publicar manual',
      ebErr: this.ebErr,`
  );

  return s;
}
