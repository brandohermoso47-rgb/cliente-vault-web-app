// Publicar de verdad en el dashboard + feed que depende de tus amigos.
// Reemplaza el compositor decorativo y los 2 posts de mentira por Firestore real,
// y la tarjeta "Recomendaciones" por un panel de amigos real (solicitudes/aceptar/buscar).
export default function patchesFeed(s) {
  const rep = (a, b) => {
    if (!s.includes(a)) throw new Error('parche no encontrado (feed): ' + a.slice(0, 80));
    s = s.replace(a, () => b);
  };

  // Arranca/para las suscripciones de amistades + feed junto con el resto de datos en vivo.
  rep(`      onSnapshot(doc(db, 'users', auth.currentUser!.uid), (snap: any) => {`,
      `      watchMyFriendships(auth.currentUser!.uid, (rows: any) => {
        this.friendRows = rows;
        this.forceUpdate();
        const uid = auth.currentUser!.uid;
        const ids = [uid, ...myFriendIds(rows, uid)];
        this.unsubFeed && this.unsubFeed();
        this.unsubFeed = subscribeFeed(ids, (posts: any) => { this.livePosts = posts; this.forceUpdate(); });
      }),
      onSnapshot(doc(db, 'users', auth.currentUser!.uid), (snap: any) => {`);
  rep('  stopData() { this.unsubData.forEach((u: any) => u()); this.unsubData = []; }',
      `  unsubFeed: any = null;
  friendRows: any[] = [];
  livePosts: any[] = [];
  feedComposerText = '';
  feedComposerFile: File | null = null;
  feedComposerBusy = false;
  feedComposerErr = '';
  friendSearch = '';
  friendSearchBusy = false;
  friendSearchErr = '';
  friendSearchResult: any = null;

  timeAgo = (ts: any) => {
    const secs = ts?.seconds ? (Date.now() / 1000 - ts.seconds) : null;
    if (secs == null) return 'ahora';
    if (secs < 60) return 'hace unos segundos';
    if (secs < 3600) return 'hace ' + Math.floor(secs / 60) + ' min';
    if (secs < 86400) return 'hace ' + Math.floor(secs / 3600) + ' h';
    return 'hace ' + Math.floor(secs / 86400) + ' d';
  };
  feedComposerChange = (e: any) => { this.feedComposerText = e.target.value; this.forceUpdate(); };
  onFeedPick = (kind: 'image' | 'video') => {
    this.feedPendingKind = kind;
    (document.getElementById('feed-media-input') as HTMLInputElement | null)?.click();
  };
  onFeedFile = (e: any) => {
    const f = e?.target?.files?.[0];
    if (e?.target) e.target.value = '';
    if (!f) return;
    this.feedComposerFile = f;
    this.feedComposerErr = '';
    this.forceUpdate();
  };
  feedClearFile = () => { this.feedComposerFile = null; this.forceUpdate(); };
  feedPublish = async () => {
    const user = this.state.user;
    if (!user || this.feedComposerBusy) return;
    this.feedComposerErr = '';
    this.feedComposerBusy = true;
    this.forceUpdate();
    try {
      await publishPost({
        uid: user.uid,
        authorName: this.myProfile?.displayName || user.displayName || 'Sin nombre',
        authorHandle: this.myProfile?.handle ? '@' + this.myProfile.handle : '@usuario',
        authorPhotoURL: this.myProfile?.photoURL ?? null,
        text: this.feedComposerText,
        file: this.feedComposerFile,
      });
      this.feedComposerText = '';
      this.feedComposerFile = null;
    } catch (e: any) {
      this.feedComposerErr = e?.message || 'No se pudo publicar. Inténtalo de nuevo.';
    }
    this.feedComposerBusy = false;
    this.forceUpdate();
  };

  friendSearchChange = (e: any) => { this.friendSearch = e.target.value; this.forceUpdate(); };
  friendSearchGo = async () => {
    const handle = this.friendSearch.trim().toLowerCase().replace(/^@/, '');
    if (!handle) return;
    this.friendSearchBusy = true; this.friendSearchErr = ''; this.friendSearchResult = null; this.forceUpdate();
    try {
      const snap = await getDocs(query(collection(db, 'users'), where('handle', '==', handle), fbLimit(1)));
      if (snap.empty) this.friendSearchErr = 'No se encontró ese usuario.';
      else this.friendSearchResult = { id: snap.docs[0].id, ...snap.docs[0].data() };
    } catch { this.friendSearchErr = 'No se pudo buscar. Inténtalo de nuevo.'; }
    this.friendSearchBusy = false; this.forceUpdate();
  };
  friendAdd = async (otherUid: string) => {
    try { await sendFriendRequest(this.state.user.uid, otherUid); this.friendSearchResult = null; this.friendSearch = ''; }
    catch (e: any) { this.friendSearchErr = e?.message || 'No se pudo enviar la solicitud.'; }
    this.forceUpdate();
  };
  friendAccept = (id: string) => acceptFriend(id);
  friendDecline = (id: string) => declineFriend(id);
  friendRemove = (id: string) => removeFriend(id);

  userNameCache: Record<string, string> = {};
  resolveUserName = (uid: string) => {
    if (this.userNameCache[uid]) return this.userNameCache[uid];
    if (!uid || this.userNameCache[uid] === '') return uid;
    this.userNameCache[uid] = '';
    getDoc(doc(db, 'users', uid)).then((snap) => {
      const d: any = snap.data();
      this.userNameCache[uid] = d?.handle ? '@' + d.handle : (d?.displayName || 'Alguien');
      this.forceUpdate();
    }).catch(() => { this.userNameCache[uid] = 'Alguien'; });
    return 'Cargando…';
  };

  stopData() { this.unsubData.forEach((u: any) => u()); this.unsubData = []; this.unsubFeed && this.unsubFeed(); this.unsubFeed = null; }`);

  // La barra de herramientas: solo Imagen/Video quedan activas por ahora; el resto, "Próximamente".
  rep(`      feedTools: this.feedToolList.map((t) => ({
        name: t.name,
        svg: React.createElement('svg', {
          width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
          strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round',
          dangerouslySetInnerHTML: { __html: t.d }
        })
      })),`, `      feedTools: this.feedToolList.map((t, i) => ({
        name: t.name,
        ready: i < 2,
        pick: i === 0 ? () => this.onFeedPick('image') : i === 1 ? () => this.onFeedPick('video') : undefined,
        style: 'width:34px;height:34px;border-radius:11px;display:flex;align-items:center;justify-content:center;color:var(--ink-2);transition:background .16s ease, color .16s ease;' + (i < 2 ? 'cursor:pointer' : 'cursor:default;opacity:.4'),
        title: i < 2 ? t.name : t.name + ' (próximamente)',
        svg: React.createElement('svg', {
          width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
          strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round',
          dangerouslySetInnerHTML: { __html: t.d }
        })
      })),
      feedComposerValue: this.feedComposerText,
      feedComposerChange: this.feedComposerChange,
      feedFileName: this.feedComposerFile?.name ?? '',
      feedClearFile: this.feedClearFile,
      feedPublish: this.feedPublish,
      feedPublishBusy: this.feedComposerBusy,
      feedPublishLabel: this.feedComposerBusy ? 'Publicando…' : 'Publicar',
      feedPublishStyle: 'padding:10px 22px;border-radius:999px;font-size:12.5px;font-weight:700;color:#14111A;background:var(--pink);box-shadow:0 10px 22px -10px var(--pink), inset 0 1px 0 rgba(255,255,255,.3);white-space:nowrap;' + (this.feedComposerBusy ? 'opacity:.6;cursor:default' : 'cursor:pointer'),
      feedComposerErr: this.feedComposerErr,
      onFeedFile: this.onFeedFile,`);

  // Los 2 posts de mentira quedan solo como respaldo si Firestore aún no tiene nada (recién publicado el sitio).
  rep(`      feedPosts: this.feedPostData.map((p) => ({
        name: p.name, handle: p.handle, time: p.time, text: p.text, tags: p.tags, likes: p.likes, comments: p.comments,
        media: this.tvGrad(p.g),
        avatar: 'width:42px;height:42px;flex:0 0 42px;border-radius:50%;background:' + this.tvGrad(p.g),
        card: 'border-radius:24px;overflow:hidden;' + glassCard
      })),`, `      feedPosts: (this.livePosts.length ? this.livePosts : this.feedPostData).map((p) => ({
        name: p.name ?? p.authorName, handle: p.handle ?? p.authorHandle,
        time: p.time ?? this.timeAgo(p.createdAt), text: p.text, tags: p.tags ?? '',
        likes: p.likes ?? p.likesCount ?? 0, comments: p.comments ?? p.commentsCount ?? 0,
        mediaUrl: p.mediaUrl ?? null, isImage: p.mediaType === 'image', isVideo: p.mediaType === 'video',
        media: p.g ? this.tvGrad(p.g) : 'linear-gradient(135deg,var(--pink),var(--purple))',
        avatar: (p.authorPhotoURL || p.avatarUrl)
          ? \`width:42px;height:42px;flex:0 0 42px;border-radius:50%;background:center/cover no-repeat url('\${p.authorPhotoURL || p.avatarUrl}')\`
          : 'width:42px;height:42px;flex:0 0 42px;border-radius:50%;background:' + (p.g ? this.tvGrad(p.g) : 'linear-gradient(135deg,var(--pink),var(--purple))'),
        card: 'border-radius:24px;overflow:hidden;' + glassCard
      })),
      friendPending: this.friendRows.filter((f: any) => f.status === 'pending' && f.requesterId !== this.state.user?.uid).map((f: any) => ({
        id: f.id, other: this.resolveUserName(f.users.find((u: string) => u !== this.state.user?.uid)),
        accept: () => this.friendAccept(f.id), decline: () => this.friendDecline(f.id)
      })),
      friendList: this.friendRows.filter((f: any) => f.status === 'accepted').map((f: any) => ({
        id: f.id, other: this.resolveUserName(f.users.find((u: string) => u !== this.state.user?.uid)), remove: () => this.friendRemove(f.id)
      })),
      friendListEmpty: this.friendRows.filter((f: any) => f.status === 'accepted').length === 0,
      friendSearchValue: this.friendSearch,
      friendSearchChange: this.friendSearchChange,
      friendSearchGo: this.friendSearchGo,
      friendSearchBusy: this.friendSearchBusy,
      friendSearchLabel: this.friendSearchBusy ? '…' : 'Buscar',
      friendSearchErr: this.friendSearchErr,
      friendSearchResult: this.friendSearchResult ? {
        id: this.friendSearchResult.id, name: this.friendSearchResult.displayName || this.friendSearchResult.handle,
        handle: this.friendSearchResult.handle ? '@' + this.friendSearchResult.handle : '',
        add: () => this.friendAdd(this.friendSearchResult.id)
      } : null,`);

  return s;
}
