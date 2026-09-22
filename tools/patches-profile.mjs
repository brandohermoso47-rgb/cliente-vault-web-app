// Foto de perfil real: se ve donde antes había "SM"/"@sara.waack" de mentira (menú de cuenta,
// panel desplegable y pantalla de Perfil), y se puede crear/cambiar desde la pantalla de Perfil.
export default function patchesProfile(s) {
  const rep = (a, b) => {
    if (!s.includes(a)) throw new Error('parche no encontrado (profile): ' + a.slice(0, 80));
    s = s.replace(a, () => b);
  };

  // Escucha en vivo el documento de perfil propio (displayName/handle/photoURL) mientras haya sesión.
  rep(`      watch('lives', (rows) => {
        this.insClasses = rows.sort(byOrder).map((c: any) => ({ t: c.title ?? c.t ?? '', when: c.when ?? '', who: c.who ?? '', state: c.state ?? 'Programada', live: !!c.live }));
      }),
    ];
  }`, `      watch('lives', (rows) => {
        this.insClasses = rows.sort(byOrder).map((c: any) => ({ t: c.title ?? c.t ?? '', when: c.when ?? '', who: c.who ?? '', state: c.state ?? 'Programada', live: !!c.live }));
      }),
      onSnapshot(doc(db, 'users', this.state.user.uid), (snap: any) => {
        const d: any = snap.data() ?? {};
        this.myProfile = { displayName: d.displayName ?? null, photoURL: d.photoURL ?? null, photoPath: d.photoPath ?? null, handle: d.handle ?? null };
        this.forceUpdate();
      }, () => {}),
    ];
  }

  myProfile: any = null;
  myAvatarBusy = false;
  myAvatarPct: number | null = null;
  myAvatarErr = '';
  onMyAvatarPick = () => { (document.getElementById('perf-avatar-input') as HTMLInputElement | null)?.click(); };
  onMyAvatarFile = (e: any) => {
    const f = e?.target?.files?.[0];
    if (e?.target) e.target.value = '';
    const user = this.state.user;
    if (!f || !user) return;
    if (!IMAGE_TYPES.includes(f.type)) { this.myAvatarErr = 'Formato no permitido (usa JPG, PNG, WEBP o GIF).'; this.forceUpdate(); return; }
    if (f.size > MAX_IMAGE_MB * 1048576) { this.myAvatarErr = \`La foto puede pesar máx. \${MAX_IMAGE_MB} MB.\`; this.forceUpdate(); return; }
    this.myAvatarErr = ''; this.myAvatarBusy = true; this.myAvatarPct = 0; this.forceUpdate();
    const path = \`users/\${user.uid}/avatar/\${Date.now()}-\${f.name.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^A-Za-z0-9._-]+/g, '_').slice(-80)}\`;
    const task = uploadBytesResumable(ref(storage, path), f, { contentType: f.type });
    task.on('state_changed',
      (snap: any) => { this.myAvatarPct = (snap.bytesTransferred / snap.totalBytes) * 100; this.forceUpdate(); },
      () => { this.myAvatarBusy = false; this.myAvatarPct = null; this.myAvatarErr = 'No se pudo subir la foto. Inténtalo de nuevo.'; this.forceUpdate(); },
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          const old = this.myProfile?.photoPath;
          await updateDoc(doc(db, 'users', user.uid), { photoURL: url, photoPath: path, updatedAt: serverTimestamp() });
          await updateProfile(user, { photoURL: url });
          if (old) deleteObject(ref(storage, old)).catch(() => {});
        } catch { this.myAvatarErr = 'La foto se subió pero no se pudo guardar.'; }
        this.myAvatarBusy = false; this.myAvatarPct = null; this.forceUpdate();
      });
  };`);

  // Iniciales/foto reales para el avatar del menú de cuenta (arriba a la derecha).
  rep("acctAvatar: 'width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;background:linear-gradient(135deg,var(--purple),var(--pink));cursor:pointer;transition:box-shadow .2s ease;box-shadow:' + (this.state.acct ? '0 0 0 2px var(--ground), 0 0 0 4px var(--pink)' : 'var(--lg-edge)'),",
      `acctAvatar: 'width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;background:' + (this.myProfile?.photoURL ? \`center/cover no-repeat url('\${this.myProfile.photoURL}')\` : 'linear-gradient(135deg,var(--purple),var(--pink))') + ';cursor:pointer;transition:box-shadow .2s ease;box-shadow:' + (this.state.acct ? '0 0 0 2px var(--ground), 0 0 0 4px var(--pink)' : 'var(--lg-edge)'),
      myInitial: this.myProfile?.photoURL ? '' : (this.myProfile?.displayName || this.state.user?.displayName || this.state.user?.email || '?').trim().slice(0, 1).toUpperCase(),
      myDropAvatar: 'width:44px;height:44px;flex:0 0 44px;border-radius:50%;background:' + (this.myProfile?.photoURL ? \`center/cover no-repeat url('\${this.myProfile.photoURL}')\` : 'linear-gradient(135deg,var(--purple),var(--pink))') + ';display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:#fff',
      myDisplayName: this.myProfile?.displayName || this.state.user?.displayName || 'Sin nombre',
      myHandle: this.myProfile?.handle ? '@' + this.myProfile.handle : (this.state.user?.email ? '@' + this.state.user.email.split('@')[0] : '@usuario'),
      perfAvatarStyle: 'width:100%;height:100%;border-radius:50%;border:3px solid var(--ground);display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:800;color:#fff;letter-spacing:-.02em;cursor:pointer;background:' + (this.myProfile?.photoURL ? \`center/cover no-repeat url('\${this.myProfile.photoURL}')\` : 'linear-gradient(135deg,var(--purple),var(--pink))'),
      perfAvatarBusy: this.myAvatarBusy,
      perfAvatarPct: this.myAvatarPct == null ? '' : Math.round(this.myAvatarPct) + '%',
      perfAvatarErr: this.myAvatarErr,
      onMyAvatarPick: this.onMyAvatarPick,
      onMyAvatarFile: this.onMyAvatarFile,`);

  return s;
}
