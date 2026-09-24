// Grupos con chat en vivo: cualquier usuario crea el suyo; los instructores además pueden crear un grupo
// de "Clase" (solo ellos publican el resumen de la clase). Se entra con un código o un enlace de invitación.
export default function patchesGrupos(s) {
  const rep = (a, b) => {
    if (!s.includes(a)) throw new Error('parche no encontrado (grupos): ' + a.slice(0, 80));
    s = s.replace(a, () => b);
  };

  // Ruta + menú lateral (mismo patrón que Plan de Estudio).
  rep(`      isStudy: v === 'study',`, `      isStudy: v === 'study',
      isGrupos: v === 'grupos',`);
  rep(`      navStudy: this.nav(v === 'study', 'var(--yellow)'),`, `      navStudy: this.nav(v === 'study', 'var(--yellow)'),
      navGrupos: this.nav(v === 'grupos', 'var(--blue)'),`);
  rep(`      goStudy: () => this.setState({ view: 'study' }),`, `      goStudy: () => this.setState({ view: 'study' }),
      goGrupos: () => { this.gBack(); this.setState({ view: 'grupos' }); },
      goGruposClase: () => { this.gBack(); this.gMode = 'create'; this.gKind = 'clase'; this.setState({ view: 'grupos' }); },`);
  rep(`cuenta:'Mi cuenta',`, `cuenta:'Mi cuenta', grupos:'Grupos',`);

  // Suscripciones en vivo (encadenado tras Manuales) y enlace de invitación ?grupo=CODIGO.
  rep(`    this.unsubEbooks && this.unsubEbooks();
    this.unsubEbooks = subscribeEbooks((rows: any) => { this.liveEbooks = rows; this.forceUpdate(); });
  }`, `    this.unsubEbooks && this.unsubEbooks();
    this.unsubEbooks = subscribeEbooks((rows: any) => { this.liveEbooks = rows; this.forceUpdate(); });
    this.unsubGroups && this.unsubGroups();
    this.unsubGroups = watchMyGroups(meUid, (rows: any) => { this.gList = rows; if (this.gActiveId && !rows.some((g: any) => g.id === this.gActiveId)) this.gBack(); this.forceUpdate(); });
    const invite = new URLSearchParams(location.search).get('grupo');
    if (invite) {
      this.gJoinCode = cleanGroupCode(invite); this.gMode = 'join';
      try { history.replaceState(null, '', location.pathname); } catch (e) { /* sin historial */ }
      this.setState({ view: 'grupos' });
    }
  }`);
  rep(`    this.unsubEbooks && this.unsubEbooks(); this.unsubEbooks = null;
  }`, `    this.unsubEbooks && this.unsubEbooks(); this.unsubEbooks = null;
    this.unsubGroups && this.unsubGroups(); this.unsubGroups = null;
    this.unsubGroupMsgs && this.unsubGroupMsgs(); this.unsubGroupMsgs = null;
  }`);

  // Estado y acciones.
  rep(`  myEbooks() {`, `  unsubGroups: any = null;
  unsubGroupMsgs: any = null;
  gList: any[] = [];
  gMessages: any[] = [];
  gActiveId: string | null = null;
  gMode: 'list' | 'create' | 'join' = 'list';
  gKind: 'grupo' | 'clase' = 'grupo';
  gName = '';
  gDesc = '';
  gJoinCode = '';
  gText = '';
  gFile: File | null = null;
  gBusy = false;
  gErr = '';
  gCopied = '';

  gActive() { return this.gList.find((g: any) => g.id === this.gActiveId) || null; }

  gOpen = (id: string) => {
    this.unsubGroupMsgs && this.unsubGroupMsgs();
    this.gActiveId = id; this.gMessages = []; this.gText = ''; this.gFile = null; this.gErr = ''; this.gCopied = '';
    this.unsubGroupMsgs = watchMessages(id, (rows: any) => { this.gMessages = rows; this.forceUpdate(); });
    this.forceUpdate();
  };
  gBack = () => {
    this.unsubGroupMsgs && this.unsubGroupMsgs(); this.unsubGroupMsgs = null;
    this.gActiveId = null; this.gMessages = []; this.gMode = 'list'; this.gErr = ''; this.gName = ''; this.gDesc = ''; this.gJoinCode = '';
    this.gKind = 'grupo';
    this.forceUpdate();
  };
  gSetMode = (m: 'list' | 'create' | 'join') => { this.gMode = m; this.gErr = ''; this.forceUpdate(); };
  gSetKind = (k: 'grupo' | 'clase') => { this.gKind = k; this.forceUpdate(); };
  gNameChange = (e: any) => { this.gName = e?.target?.value ?? ''; this.forceUpdate(); };
  gDescChange = (e: any) => { this.gDesc = e?.target?.value ?? ''; this.forceUpdate(); };
  gJoinChange = (e: any) => { this.gJoinCode = e?.target?.value ?? ''; this.forceUpdate(); };
  gTextChange = (e: any) => { this.gText = e?.target?.value ?? ''; this.forceUpdate(); };
  gPickFile = () => { (document.getElementById('group-media-input') as HTMLInputElement | null)?.click(); };
  gOnFile = (e: any) => {
    const f = e?.target?.files?.[0];
    if (e?.target) e.target.value = '';
    if (!f) return;
    const kind = checkGroupFile(f);
    if (kind !== 'image' && kind !== 'video') { this.gErr = kind; this.forceUpdate(); return; }
    this.gErr = ''; this.gFile = f; this.forceUpdate();
  };
  gClearFile = () => { this.gFile = null; this.forceUpdate(); };

  gCreate = async () => {
    if (this.gBusy) return;
    this.gBusy = true; this.gErr = ''; this.forceUpdate();
    try {
      const id = await createGroup({ uid: auth.currentUser!.uid, name: this.gName, description: this.gDesc, kind: this.gKind === 'clase' && this.subs.docente ? 'clase' : 'grupo' });
      this.gName = ''; this.gDesc = ''; this.gMode = 'list';
      this.gOpen(id);
    } catch (e: any) { this.gErr = e?.message || 'No se pudo crear el grupo.'; }
    this.gBusy = false; this.forceUpdate();
  };

  gJoin = async () => {
    if (this.gBusy) return;
    const code = cleanGroupCode(this.gJoinCode);
    if (code.length < 10) { this.gErr = 'El código tiene 10 letras y números.'; this.forceUpdate(); return; }
    this.gBusy = true; this.gErr = ''; this.forceUpdate();
    try {
      await joinGroup(code, auth.currentUser!.uid);
      this.gJoinCode = ''; this.gMode = 'list';
      this.gOpen(code);
    } catch (e: any) { this.gErr = 'No se encontró ese grupo, o está lleno (máx. 50 personas). Revisa el código.'; }
    this.gBusy = false; this.forceUpdate();
  };

  gSend = async (kind: 'msg' | 'resumen') => {
    const g = this.gActive();
    if (!g || this.gBusy) return;
    this.gBusy = true; this.gErr = ''; this.forceUpdate();
    try {
      await sendMessage({
        groupId: g.id, uid: auth.currentUser!.uid, kind,
        name: this.myProfile?.displayName || this.state.user?.displayName || 'Sin nombre',
        text: this.gText, file: this.gFile,
      });
      this.gText = ''; this.gFile = null;
    } catch (e: any) { this.gErr = e?.message || 'No se pudo enviar.'; }
    this.gBusy = false; this.forceUpdate();
  };

  gLeave = async () => {
    const g = this.gActive();
    if (!g || !window.confirm('¿Salir de este grupo?')) return;
    try { await leaveGroup(g.id, auth.currentUser!.uid); this.gBack(); } catch (e) { this.gErr = 'No se pudo salir del grupo.'; this.forceUpdate(); }
  };
  gDelete = async () => {
    const g = this.gActive();
    if (!g || !window.confirm('¿Borrar el grupo para todos? Esto no se puede deshacer.')) return;
    try { await deleteGroup(g.id); this.gBack(); } catch (e) { this.gErr = 'No se pudo borrar el grupo.'; this.forceUpdate(); }
  };

  gLink() { const g = this.gActive(); return g ? location.origin + '/?grupo=' + g.id : ''; }
  gCopy = async (what: 'code' | 'link') => {
    const g = this.gActive();
    if (!g) return;
    try { await navigator.clipboard.writeText(what === 'code' ? g.id : this.gLink()); this.gCopied = what; }
    catch (e) { this.gErr = 'No se pudo copiar. Selecciona el código y cópialo a mano.'; }
    this.forceUpdate();
    setTimeout(() => { this.gCopied = ''; this.forceUpdate(); }, 2000);
  };
  gShare = async () => {
    const g = this.gActive();
    if (!g) return;
    if ((navigator as any).share) {
      try { await (navigator as any).share({ title: g.name, text: 'Únete a mi grupo en Waack On', url: this.gLink() }); return; } catch (e) { /* canceló */ }
    }
    this.gCopy('link');
  };

  myEbooks() {`);

  // Valores para la pantalla.
  rep(`      isRealInstructor: this.subs.docente,`, `      isRealInstructor: this.subs.docente,
      gShowList: !this.gActiveId && this.gMode === 'list',
      gShowCreate: !this.gActiveId && this.gMode === 'create',
      gShowJoin: !this.gActiveId && this.gMode === 'join',
      gShowChat: !!this.gActive(),
      gHasGroups: this.gList.length > 0,
      gGroups: this.gList.map((g: any) => ({
        id: g.id, name: g.name, desc: g.description || '', open: () => this.gOpen(g.id),
        meta: (g.kind === 'clase' ? 'Clase · ' : 'Grupo · ') + (g.memberIds || []).length + (((g.memberIds || []).length === 1) ? ' miembro' : ' miembros'),
        card: 'display:flex;flex-direction:column;gap:6px;padding:18px 20px;border-radius:22px;border:1px solid var(--hair);background:var(--glass);backdrop-filter:var(--lg-blur);-webkit-backdrop-filter:var(--lg-blur);box-shadow:var(--lg-edge);cursor:pointer'
      })),
      gGoList: () => this.gSetMode('list'),
      gGoCreate: () => { this.gKind = 'grupo'; this.gSetMode('create'); },
      gGoJoin: () => this.gSetMode('join'),
      gBack: this.gBack,
      gCanClase: this.subs.docente,
      gKindPicker: [['grupo', 'Grupo de amigos'], ['clase', 'Clase grupal']].map(([k, label]) => ({
        key: k, label, pick: () => this.gSetKind(k as any),
        style: 'padding:9px 16px;border-radius:999px;font-size:12px;cursor:pointer;' + (this.gKind === k
          ? 'font-weight:700;color:#fff;background:var(--purple);'
          : 'font-weight:600;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);')
      })),
      gNameValue: this.gName, gDescValue: this.gDesc, gJoinValue: this.gJoinCode, gTextValue: this.gText,
      gNameChange: this.gNameChange, gDescChange: this.gDescChange, gJoinChange: this.gJoinChange, gTextChange: this.gTextChange,
      gCreate: this.gCreate, gJoin: this.gJoin,
      gCreateLabel: this.gBusy ? 'Creando…' : (this.gKind === 'clase' && this.subs.docente ? 'Crear grupo de clase' : 'Crear grupo'),
      gJoinLabel: this.gBusy ? 'Uniéndome…' : 'Unirme al grupo',
      gErr: this.gErr,
      gTitle: this.gActive()?.name || '',
      gDescription: this.gActive()?.description || '',
      gKindLabel: this.gActive()?.kind === 'clase' ? 'CLASE GRUPAL' : 'GRUPO',
      gCode: this.gActive()?.id || '',
      gIsOwner: this.gActive()?.ownerId === this.state.user?.uid,
      gIsNotOwner: this.gActive() ? this.gActive().ownerId !== this.state.user?.uid : false,
      gCanResumen: !!this.gActive() && this.gActive().kind === 'clase' && this.gActive().ownerId === this.state.user?.uid,
      gCopyCodeLabel: this.gCopied === 'code' ? '¡Código copiado!' : 'Copiar código',
      gCopyLinkLabel: this.gCopied === 'link' ? '¡Enlace copiado!' : 'Copiar enlace',
      gCopyCode: () => this.gCopy('code'), gCopyLink: () => this.gCopy('link'), gShare: this.gShare,
      gMembers: (this.gActive()?.memberIds || []).map((u: string) => ({
        key: u, name: this.resolveUserName(u) + (u === this.gActive()?.ownerId ? ' · ' + (this.gActive()?.kind === 'clase' ? 'instructor' : 'creador') : '')
      })),
      gMembersLabel: (this.gActive()?.memberIds || []).length + ' en el grupo',
      gMsgs: this.gMessages.map((m: any) => {
        const mine = m.uid === this.state.user?.uid;
        const resumen = m.kind === 'resumen';
        return {
          key: m.id, name: m.uid === this.state.user?.uid ? 'Tú' : (m.name || this.resolveUserName(m.uid)), text: m.text || '',
          hasText: !!m.text, time: this.timeAgo(m.createdAt), isResumen: resumen,
          hasImage: m.mediaType === 'image', hasVideo: m.mediaType === 'video', mediaUrl: m.mediaUrl || '',
          canDelete: mine || this.gActive()?.ownerId === this.state.user?.uid,
          del: () => deleteMessage(this.gActive()!.id, m.id).catch(() => { this.gErr = 'No se pudo borrar el mensaje.'; this.forceUpdate(); }),
          wrap: 'display:flex;flex-direction:column;max-width:82%;align-self:' + (mine ? 'flex-end' : 'flex-start'),
          bubble: 'padding:11px 14px;border-radius:18px;border:1px solid ' + (resumen ? 'var(--gold)' : 'var(--hair)') + ';background:' + (resumen ? 'color-mix(in oklch, var(--gold) 14%, transparent)' : (mine ? 'color-mix(in oklch, var(--blue) 18%, transparent)' : 'var(--glass-2)'))
        };
      }),
      gHasMsgs: this.gMessages.length > 0,
      gFileName: this.gFile ? this.gFile.name : '',
      gPickFile: this.gPickFile, gOnFile: this.gOnFile, gClearFile: this.gClearFile,
      gSendMsg: () => this.gSend('msg'), gSendResumen: () => this.gSend('resumen'),
      gSendLabel: this.gBusy ? 'Enviando…' : 'Enviar',
      gLeave: this.gLeave, gDelete: this.gDelete,`);

  return s;
}
