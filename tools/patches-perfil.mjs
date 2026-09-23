// Perfil real: sin números de mentira. Un usuario nuevo empieza en cero en todo (publicaciones,
// seguidores, siguiendo, insignias) y el contenido que se ve es lo que de verdad publicó
// (sus posts con foto/video + sus reels), no el "Sara Molina" ni las fotos de ejemplo del prototipo.
export default function patchesPerfil(s) {
  const rep = (a, b) => {
    if (!s.includes(a)) throw new Error('parche no encontrado (perfil): ' + a.slice(0, 80));
    s = s.replace(a, () => b);
  };

  rep(`      onSnapshot(doc(db, 'users', auth.currentUser!.uid), (snap: any) => {
        const d: any = snap.data() ?? {};
        this.myProfile = { displayName: d.displayName ?? null, photoURL: d.photoURL ?? null, photoPath: d.photoPath ?? null, handle: d.handle ?? null, bio: d.bio ?? null, role: d.role ?? 'usuario' };
        this.forceUpdate();
      }, () => {}),
    ];
  }`, `      onSnapshot(doc(db, 'users', auth.currentUser!.uid), (snap: any) => {
        const d: any = snap.data() ?? {};
        this.myProfile = { displayName: d.displayName ?? null, photoURL: d.photoURL ?? null, photoPath: d.photoPath ?? null, handle: d.handle ?? null, bio: d.bio ?? null, role: d.role ?? 'usuario' };
        this.forceUpdate();
      }, () => {}),
    ];
    const meUid = auth.currentUser!.uid;
    this.unsubFollowCounts && this.unsubFollowCounts();
    this.unsubFollowCounts = watchFollowCounts(meUid, (c: any) => { this.followCounts = c; this.forceUpdate(); });
    this.unsubMyMedia && this.unsubMyMedia();
    this.unsubMyMedia = watchMyMedia(meUid, (tiles: any) => { this.myMedia = tiles; this.forceUpdate(); });
    this.unsubMyPostCount && this.unsubMyPostCount();
    this.unsubMyPostCount = watchMyPostCount(meUid, (n: any) => { this.myPostCount = n; this.forceUpdate(); });
  }

  followCounts = { followers: 0, following: 0 };
  myMedia: any[] = [];
  myPostCount = 0;
  unsubFollowCounts: any = null;
  unsubMyMedia: any = null;
  unsubMyPostCount: any = null;`);

  rep('  stopData() { this.unsubData.forEach((u: any) => u()); this.unsubData = []; this.unsubFeed && this.unsubFeed(); this.unsubFeed = null; }',
      `  stopData() {
    this.unsubData.forEach((u: any) => u()); this.unsubData = [];
    this.unsubFeed && this.unsubFeed(); this.unsubFeed = null;
    this.unsubFollowCounts && this.unsubFollowCounts(); this.unsubFollowCounts = null;
    this.unsubMyMedia && this.unsubMyMedia(); this.unsubMyMedia = null;
    this.unsubMyPostCount && this.unsubMyPostCount(); this.unsubMyPostCount = null;
  }`);

  // Publicaciones/seguidores/siguiendo: números reales, no this.perfMediaData.length ni this.perfState.following.
  rep('          perfCount: this.perfMediaData.length,', '          perfCount: this.myPostCount,\n          myName: this.myProfile?.displayName || this.state.user?.displayName || \'Sin nombre\',\n          myBio: this.myProfile?.bio || \'\',');
  rep('          perfFollowing: p.following,', '          perfFollowing: this.followCounts.following,\n          perfFollowers: this.followCounts.followers,');

  // Insignias reales: mientras no exista un motor de logros, no se inventa ninguna (queda vacío, no "Cyphers 12" de mentira).
  rep(`          perfHighlights: this.perfHighlightData.map((h, i) => ({
            label: h.label, n: h.n,
            ring: 'width:62px;height:62px;border-radius:50%;padding:2px;background:linear-gradient(135deg,var(' + ['--pink', '--purple', '--blue', '--yellow'][i % 4] + '),var(' + ['--purple', '--blue', '--pink', '--pink'][i % 4] + '))'
          })),`, `          perfHighlights: [],
          perfHighlightsEmpty: true,`);

  // Grilla real: mis posts con foto/video + mis reels, no this.perfMediaData de mentira.
  rep(`          perfMedia: shown.map((m) => ({
            badge: m.kind, likes: m.likes,
            open: () => {},
            tile: 'position:relative;aspect-ratio:1;border-radius:16px;overflow:hidden;cursor:pointer;transition:transform .2s ease;background:linear-gradient(135deg,var(' + m.g[0] + '),var(' + m.g[1] + '));box-shadow:0 14px 30px -18px rgba(0,0,0,.7)'
          })),`, `          perfMedia: this.myMedia
            .filter((m: any) => p.tab === 'Todo' || (p.tab === 'Vídeos' ? m.kind === 'Vídeo' : m.kind === 'Foto'))
            .map((m: any) => ({
              badge: m.kind, likes: m.likes, mediaUrl: m.mediaUrl, isVideo: m.kind === 'Vídeo',
              open: () => {},
              tile: 'position:relative;aspect-ratio:1;border-radius:16px;overflow:hidden;cursor:pointer;transition:transform .2s ease;background:#000;box-shadow:0 14px 30px -18px rgba(0,0,0,.7)'
            })),`);
  rep('          perfVideoCount: this.perfMediaData.filter((m) => m.kind === \'Vídeo\').length,\n          perfPhotoCount: this.perfMediaData.filter((m) => m.kind === \'Foto\').length,\n          perfEmpty: shown.length === 0,',
      '          perfVideoCount: this.myMedia.filter((m: any) => m.kind === \'Vídeo\').length,\n          perfPhotoCount: this.myMedia.filter((m: any) => m.kind === \'Foto\').length,\n          perfEmpty: this.myMedia.length === 0,');

  return s;
}
