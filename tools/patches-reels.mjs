// Reels: like, comentarios y seguir reales (Firestore), en vez del contador local de mentira.
// Si un reel todavía no tiene id real (los 6 de muestra del prototipo, mientras no haya contenido
// real publicado), se mantiene el "me gusta" local de siempre: no hay documento al que enganchar nada.
export default function patchesReels(s) {
  const rep = (a, b) => {
    if (!s.includes(a)) throw new Error('parche no encontrado (reels): ' + a.slice(0, 80));
    s = s.replace(a, () => b);
  };

  rep('  reelState = { liked: {}, muted: true, feedIndex: 0, tab: \'Para ti\' };',
      `  reelState = { liked: {}, muted: true, feedIndex: 0, tab: 'Para ti' };
  reelSocial: Record<string, { count: number; liked: boolean; following: boolean; commentsOpen: boolean; comments: any[]; unsubComments?: any; commentText: string }> = {};

  reelSocialFor(id: string) {
    if (!this.reelSocial[id]) {
      this.reelSocial[id] = { count: 0, liked: false, following: false, commentsOpen: false, comments: [], commentText: '' };
      const uid = this.state.user?.uid;
      if (uid) {
        likeInfo('reels', id, uid).then((info: any) => {
          this.reelSocial[id] = Object.assign({}, this.reelSocial[id], info);
          this.forceUpdate();
        });
      }
    }
    return this.reelSocial[id];
  }

  reelToggleLike(r: any) {
    const uid = this.state.user?.uid;
    if (!r.id || !uid) { this.toggleLike(r.i); return; }
    const cur = this.reelSocialFor(r.id);
    const liked = !cur.liked;
    this.reelSocial[r.id] = Object.assign({}, cur, { liked, count: cur.count + (liked ? 1 : -1) });
    this.forceUpdate();
    toggleLike('reels', r.id, uid, !liked).catch(() => {
      this.reelSocial[r.id] = cur;
      this.forceUpdate();
    });
  }

  reelToggleFollow(r: any) {
    const uid = this.state.user?.uid;
    if (!r.id || !r.ownerId || !uid || r.ownerId === uid) return;
    const cur = this.reelSocialFor(r.id);
    const following = !cur.following;
    this.reelSocial[r.id] = Object.assign({}, cur, { following });
    this.forceUpdate();
    toggleFollow(uid, r.ownerId, !following).catch(() => {
      this.reelSocial[r.id] = cur;
      this.forceUpdate();
    });
  }

  reelToggleComments(r: any) {
    if (!r.id) return;
    const cur = this.reelSocialFor(r.id);
    const open = !cur.commentsOpen;
    if (open && !cur.unsubComments) {
      cur.unsubComments = watchComments('reels', r.id, (rows: any) => {
        this.reelSocial[r.id] = Object.assign({}, this.reelSocial[r.id], { comments: rows });
        this.forceUpdate();
      });
    }
    this.reelSocial[r.id] = Object.assign({}, cur, { commentsOpen: open });
    this.forceUpdate();
  }

  reelCommentChange(r: any, e: any) {
    this.reelSocial[r.id] = Object.assign({}, this.reelSocialFor(r.id), { commentText: e.target.value });
    this.forceUpdate();
  }

  reelSendComment(r: any) {
    const uid = this.state.user?.uid;
    const cur = this.reelSocialFor(r.id);
    const text = cur.commentText.trim();
    if (!uid || !text) return;
    this.reelSocial[r.id] = Object.assign({}, cur, { commentText: '' });
    this.forceUpdate();
    addComment('reels', r.id, uid, this.myProfile?.displayName || this.state.user?.displayName || 'Alguien', text).catch(() => {});
  }`);

  rep(`  buildReels() {
    return this.reelData.map((r, i) => {
      const on = !!this.reelState.liked[i];
      return {
        key: 'r' + i,
        user: r.user,
        caption: r.caption,
        music: '♪ ' + r.music,
        isLive: !!r.live,
        isNew: !!r.nuevo,
        likeLabel: this.fmt(r.likes + (on ? 1 : 0)),
        commentLabel: this.fmt(r.comments),
        onLike: () => this.toggleLike(i),`,
      `  buildReels() {
    return this.reelData.map((r, i) => {
      const real = !!r.id;
      const social = real ? this.reelSocialFor(r.id) : null;
      const on = real ? social.liked : !!this.reelState.liked[i];
      const count = real ? social.count : r.likes + (on ? 1 : 0);
      const rr = Object.assign({}, r, { i });
      return {
        key: r.id || 'r' + i,
        user: r.user,
        caption: r.caption,
        music: '♪ ' + r.music,
        isLive: !!r.live,
        isNew: !!r.nuevo,
        likeLabel: this.fmt(count),
        commentLabel: this.fmt(real ? social.comments.length : r.comments),
        followLabel: real && social.following ? 'Siguiendo' : 'Seguir',
        showFollow: !real || (r.ownerId && r.ownerId !== this.state.user?.uid),
        onFollow: () => this.reelToggleFollow(rr),
        onComments: () => this.reelToggleComments(rr),
        commentsOpen: real ? social.commentsOpen : false,
        comments: real ? social.comments : [],
        commentValue: real ? social.commentText : '',
        onCommentChange: (e: any) => this.reelCommentChange(rr, e),
        onSendComment: () => this.reelSendComment(rr),
        onLike: () => this.reelToggleLike(rr),`);

  return s;
}
