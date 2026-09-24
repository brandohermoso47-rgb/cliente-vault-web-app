// Notificaciones reales (me gusta, comentarios, seguidores, solicitudes de amistad, anuncios) +
// like/comentario real en publicaciones del muro + arregla la duplicidad "Mi cuenta"/"Mi perfil"
// en el menú (quedan fusionados: un solo enlace "Mi perfil", con "Editar perfil" llevando a los
// ajustes de cuenta) + hace que el avatar en la barra lateral y en el compositor del muro muestren
// la foto real, igual que en el resto de la app.
export default function patchesNotifications(s) {
  const rep = (a, b) => {
    if (!s.includes(a)) throw new Error('parche no encontrado (notificaciones): ' + a.slice(0, 80));
    s = s.replace(a, () => b);
  };

  // Ya no hay notificaciones de mentira: las crean las Cloud Functions en /functions.
  rep(`  notifData = [
    { t: 'Lorena publicó una clase nueva', x: 'Cátedra Nivel 2 — bloque de arm control disponible ahora.', w: 'hace 12 min', c: '--pink', unread: true },
    { t: 'Tu clase empieza en 1 h', x: 'Taller de musicalidad con Ibuki Imata, sala virtual 3.', w: 'hace 40 min', c: '--yellow', unread: true },
    { t: 'Nueva insignia desbloqueada', x: 'Retadora: participaste en tres retos semanales.', w: 'ayer', c: '--blue', unread: true },
    { t: '14 me gusta en tu clip', x: 'Tu reel del reto #34 sigue subiendo en el muro.', w: 'hace 2 días', c: '--purple', unread: false }
  ];`, `  liveNotifs: AppNotification[] = [];
  unsubNotifs: any = null;
  notifTypeColor: Record<string, string> = {
    like: '--pink', comment: '--blue', follow: '--purple', friend_request: '--purple', friend_accept: '--purple', announcement: '--gold',
  };`);

  // Suscripción real a mis notificaciones, junto con el resto de listeners de la sesión.
  rep(`  unsubFeed: any = null;
  friendRows: any[] = [];
  livePosts: any[] = [];`, `  unsubFeed: any = null;
  friendRows: any[] = [];
  livePosts: any[] = [];
  postLikes: Record<string, { count: number; liked: boolean }> = {};
  postLikesLoading: Record<string, boolean> = {};
  postCommentsOpen: Record<string, boolean> = {};
  postComments: Record<string, any[]> = {};
  postCommentDraft: Record<string, string> = {};
  unsubPostComments: Record<string, () => void> = {};`);

  rep(`  stopData() {
    this.unsubData.forEach((u: any) => u()); this.unsubData = [];
    this.unsubFeed && this.unsubFeed(); this.unsubFeed = null;
    this.unsubFollowCounts && this.unsubFollowCounts(); this.unsubFollowCounts = null;
    this.unsubMyMedia && this.unsubMyMedia(); this.unsubMyMedia = null;
    this.unsubMyPostCount && this.unsubMyPostCount(); this.unsubMyPostCount = null;
    this.unsubIncomingCalls && this.unsubIncomingCalls(); this.unsubIncomingCalls = null;
    this.battleHangUp();
    this.unsubStudyProgress && this.unsubStudyProgress(); this.unsubStudyProgress = null;
    this.unsubAnnouncements && this.unsubAnnouncements(); this.unsubAnnouncements = null;`,
      `  stopData() {
    this.unsubData.forEach((u: any) => u()); this.unsubData = [];
    this.unsubFeed && this.unsubFeed(); this.unsubFeed = null;
    this.unsubFollowCounts && this.unsubFollowCounts(); this.unsubFollowCounts = null;
    this.unsubMyMedia && this.unsubMyMedia(); this.unsubMyMedia = null;
    this.unsubMyPostCount && this.unsubMyPostCount(); this.unsubMyPostCount = null;
    this.unsubIncomingCalls && this.unsubIncomingCalls(); this.unsubIncomingCalls = null;
    this.battleHangUp();
    this.unsubStudyProgress && this.unsubStudyProgress(); this.unsubStudyProgress = null;
    this.unsubAnnouncements && this.unsubAnnouncements(); this.unsubAnnouncements = null;
    this.unsubNotifs && this.unsubNotifs(); this.unsubNotifs = null;
    Object.values(this.unsubPostComments).forEach((u: any) => u());
    this.unsubPostComments = {};`);

  rep(`  friendSearchResult: any = null;
`, `  friendSearchResult: any = null;

  ensurePostLikeInfo = (postId: string) => {
    const uid = this.state.user?.uid;
    if (!uid || this.postLikes[postId] || this.postLikesLoading[postId]) return;
    this.postLikesLoading[postId] = true;
    likeInfo('posts', postId, uid).then((r) => {
      this.postLikes[postId] = r;
      delete this.postLikesLoading[postId];
      this.forceUpdate();
    }).catch(() => { delete this.postLikesLoading[postId]; });
  };
  postToggleLike = async (postId: string) => {
    const uid = this.state.user?.uid;
    if (!uid) return;
    const cur = this.postLikes[postId] ?? { count: 0, liked: false };
    const next = { count: cur.count + (cur.liked ? -1 : 1), liked: !cur.liked };
    this.postLikes[postId] = next;
    this.forceUpdate();
    try { await toggleLike('posts', postId, uid, cur.liked); }
    catch { this.postLikes[postId] = cur; this.forceUpdate(); }
  };
  postToggleComments = (postId: string) => {
    const opening = !this.postCommentsOpen[postId];
    this.postCommentsOpen[postId] = opening;
    if (opening && !this.unsubPostComments[postId]) {
      this.unsubPostComments[postId] = watchComments('posts', postId, (rows) => {
        this.postComments[postId] = rows;
        this.forceUpdate();
      });
    }
    this.forceUpdate();
  };
  postCommentChange = (postId: string, e: any) => { this.postCommentDraft[postId] = e.target.value; this.forceUpdate(); };
  postCommentSend = async (postId: string) => {
    const uid = this.state.user?.uid;
    const text = (this.postCommentDraft[postId] || '').trim();
    if (!uid || !text) return;
    this.postCommentDraft[postId] = '';
    this.forceUpdate();
    try {
      await addComment('posts', postId, uid, this.myProfile?.displayName || this.state.user?.displayName || 'Sin nombre', text);
    } catch { /* si falla, el borrador ya se perdió; el usuario puede volver a escribirlo */ }
  };
`);

  // La suscripción a notificaciones arranca junto a las demás cuando hay sesión.
  rep(`    this.unsubMyPostCount && this.unsubMyPostCount();
    this.unsubMyPostCount = watchMyPostCount(meUid, (n: any) => { this.myPostCount = n; this.forceUpdate(); });`,
      `    this.unsubMyPostCount && this.unsubMyPostCount();
    this.unsubMyPostCount = watchMyPostCount(meUid, (n: any) => { this.myPostCount = n; this.forceUpdate(); });
    this.unsubNotifs && this.unsubNotifs();
    this.unsubNotifs = watchMyNotifications(meUid, (rows: any) => { this.liveNotifs = rows; this.forceUpdate(); });`);

  // Publicaciones del feed: like/comentario reales, no solo un número de mentira.
  rep(`      feedPosts: (this.livePosts.length ? this.livePosts : this.feedPostData).map((p) => ({
        name: p.name ?? p.authorName, handle: p.handle ?? p.authorHandle,
        time: p.time ?? this.timeAgo(p.createdAt), text: p.text, tags: p.tags ?? '',
        likes: p.likes ?? p.likesCount ?? 0, comments: p.comments ?? p.commentsCount ?? 0,
        mediaUrl: p.mediaUrl ?? null, isImage: p.mediaType === 'image', isVideo: p.mediaType === 'video',
        media: p.g ? this.tvGrad(p.g) : 'linear-gradient(135deg,var(--pink),var(--purple))',
        avatar: (p.authorPhotoURL || p.avatarUrl)
          ? \`width:42px;height:42px;flex:0 0 42px;border-radius:50%;background:center/cover no-repeat url('\${p.authorPhotoURL || p.avatarUrl}')\`
          : 'width:42px;height:42px;flex:0 0 42px;border-radius:50%;background:' + (p.g ? this.tvGrad(p.g) : 'linear-gradient(135deg,var(--pink),var(--purple))'),
        card: 'border-radius:24px;overflow:hidden;' + glassCard
      })),`, `      feedPosts: (this.livePosts.length ? this.livePosts : this.feedPostData).map((p) => {
        const isReal = !!p.id && this.livePosts.length > 0;
        if (isReal) this.ensurePostLikeInfo(p.id);
        const likeState = isReal ? this.postLikes[p.id] : null;
        const commentsOpen = isReal && !!this.postCommentsOpen[p.id];
        return {
          id: p.id,
          name: p.name ?? p.authorName, handle: p.handle ?? p.authorHandle,
          time: p.time ?? this.timeAgo(p.createdAt), text: p.text, tags: p.tags ?? '',
          likes: likeState ? likeState.count : (p.likes ?? p.likesCount ?? 0),
          liked: !!likeState?.liked,
          comments: isReal ? (this.postComments[p.id]?.length ?? p.commentsCount ?? 0) : (p.comments ?? 0),
          canInteract: isReal,
          onLike: isReal ? () => this.postToggleLike(p.id) : undefined,
          onToggleComments: isReal ? () => this.postToggleComments(p.id) : undefined,
          commentsOpen,
          commentRows: commentsOpen ? (this.postComments[p.id] ?? []) : [],
          commentDraft: this.postCommentDraft[p.id] ?? '',
          onCommentChange: isReal ? (e: any) => this.postCommentChange(p.id, e) : undefined,
          onCommentSend: isReal ? () => this.postCommentSend(p.id) : undefined,
          mediaUrl: p.mediaUrl ?? null, isImage: p.mediaType === 'image', isVideo: p.mediaType === 'video',
          media: p.g ? this.tvGrad(p.g) : 'linear-gradient(135deg,var(--pink),var(--purple))',
          avatar: (p.authorPhotoURL || p.avatarUrl)
            ? \`width:42px;height:42px;flex:0 0 42px;border-radius:50%;background:center/cover no-repeat url('\${p.authorPhotoURL || p.avatarUrl}')\`
            : 'width:42px;height:42px;flex:0 0 42px;border-radius:50%;background:' + (p.g ? this.tvGrad(p.g) : 'linear-gradient(135deg,var(--pink),var(--purple))'),
          card: 'border-radius:24px;overflow:hidden;' + glassCard
        };
      }),`);

  // Notificaciones reales en el timbre/menú (en vez del array de mentira).
  rep(`      notifReadAll: () => { this.notifData.forEach((n) => { n.unread = false; }); this.forceUpdate(); },
      notifList: this.notifData.map((n, i) => ({
        title: n.t, text: n.x, time: n.w,
        row: 'display:flex;gap:11px;align-items:flex-start;padding:11px 12px;border-radius:16px;cursor:pointer;transition:background .18s ease;' + (n.unread ? 'background:color-mix(in oklch, var(--blue) 8%, transparent)' : ''),
        dot: 'width:8px;height:8px;flex:0 0 8px;margin-top:5px;border-radius:50%;background:' + (n.unread ? 'var(' + n.c + ')' : 'var(--hair)'),
        read: () => { this.notifData[i].unread = false; this.forceUpdate(); }
      })),`, `      notifUnreadCount: this.liveNotifs.filter((n) => !n.read).length,
      notifReadAll: () => markAllNotificationsRead(this.liveNotifs).catch(() => {}),
      notifEmpty: this.liveNotifs.length === 0,
      notifList: this.liveNotifs.map((n) => ({
        title: n.title, text: n.text, time: this.timeAgo(n.createdAt),
        row: 'display:flex;gap:11px;align-items:flex-start;padding:11px 12px;border-radius:16px;cursor:pointer;transition:background .18s ease;' + (!n.read ? 'background:color-mix(in oklch, var(--blue) 8%, transparent)' : ''),
        dot: 'width:8px;height:8px;flex:0 0 8px;margin-top:5px;border-radius:50%;background:' + (!n.read ? 'var(' + (this.notifTypeColor[n.type] || '--pink') + ')' : 'var(--hair)'),
        read: () => { if (!n.read) markNotificationRead(n.id).catch(() => {}); }
      })),`);

  // Avatar real (no un círculo de color fijo) en el pill de la barra lateral y en el compositor del muro.
  rep(`      myDropAvatar: 'width:44px;height:44px;flex:0 0 44px;border-radius:50%;background:' + (this.myProfile?.photoURL ? \`center/cover no-repeat url('\${this.myProfile.photoURL}')\` : 'linear-gradient(135deg,var(--purple),var(--pink))') + ';display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:#fff',`,
      `      myDropAvatar: 'width:44px;height:44px;flex:0 0 44px;border-radius:50%;background:' + (this.myProfile?.photoURL ? \`center/cover no-repeat url('\${this.myProfile.photoURL}')\` : 'linear-gradient(135deg,var(--purple),var(--pink))') + ';display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:#fff',
      navAvatar: 'width:34px;height:34px;flex:0 0 34px;border-radius:50%;background:' + (this.myProfile?.photoURL ? \`center/cover no-repeat url('\${this.myProfile.photoURL}')\` : 'linear-gradient(135deg,var(--purple),var(--pink))') + ';display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff',
      myComposerAvatar: 'width:38px;height:38px;flex:0 0 38px;border-radius:50%;background:' + (this.myProfile?.photoURL ? \`center/cover no-repeat url('\${this.myProfile.photoURL}')\` : 'linear-gradient(135deg,var(--purple),var(--pink))') + ';display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff',`);

  // "Mi perfil" y "Mi cuenta" son la misma persona: un solo enlace en el menú ("Mi perfil"); dentro
  // de esa pantalla, "Editar perfil" lleva a los ajustes de cuenta (goCuenta, abajo).
  rep(`      goPerfil: () => this.setState({ view: 'perfil' }),`,
      `      goPerfil: () => this.setState({ view: 'perfil' }),
      goCuenta: () => this.setState({ view: 'cuenta' }),`);

  return s;
}
