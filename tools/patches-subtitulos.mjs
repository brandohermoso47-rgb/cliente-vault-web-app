// Subtítulos y traducción en vivo dentro de Lives (ver src/lib/captions.ts).
export default function patchesSubtitulos(s) {
  const rep = (a, b) => {
    if (!s.includes(a)) throw new Error('parche no encontrado (subtitulos): ' + a.slice(0, 80));
    s = s.replace(a, () => b);
  };

  rep(`  liveStop() {`, `  ccStopFn: any = null;
  ccOn = false;
  ccLang = 'es';
  ccTarget = 'es';
  ccTranslated = '';
  ccLastRaw = '';

  ccToggle = () => {
    if (this.ccOn) { this.ccStopFn && this.ccStopFn(); this.ccStopFn = null; this.ccOn = false; this.forceUpdate(); return; }
    if (!auth.currentUser || !this.liveStream) return;
    this.ccOn = true;
    this.ccStopFn = startCaptions(auth.currentUser.uid, this.ccLang, (m: string) => { this.liveErr = m; this.ccOn = false; this.ccStopFn = null; this.forceUpdate(); });
    this.forceUpdate();
  };
  ccPickLang = (l: string) => {
    this.ccLang = l;
    if (this.ccOn) { this.ccStopFn && this.ccStopFn(); this.ccOn = false; this.ccToggle(); }
    this.forceUpdate();
  };
  ccPickTarget = (l: string) => { this.ccTarget = l; this.ccLastRaw = ''; this.ccTranslated = ''; this.forceUpdate(); };

  // Subtítulo actual de la transmisión que estás viendo (y su traducción, si elegiste otro idioma).
  ccCurrent() {
    const w: any = this.liveWatching && this.liveSessions.find((x: any) => x.uid === this.liveWatching.uid);
    const raw: string = (w && w.caption) || '';
    const from = (w && w.captionLang) || 'es';
    if (raw !== this.ccLastRaw) {
      this.ccLastRaw = raw;
      if (this.ccTarget === from || !raw) this.ccTranslated = raw;
      else translateText(raw, from, this.ccTarget).then((t: string) => { if (this.ccLastRaw === raw) { this.ccTranslated = t; this.forceUpdate(); } });
    }
    return this.ccTarget === from ? raw : (this.ccTranslated || raw);
  }

  liveStop() {
    this.ccStopFn && this.ccStopFn(); this.ccStopFn = null; this.ccOn = false;`);

  rep(`      liveIsWatching: !!this.liveWatching,`, `      liveIsWatching: !!this.liveWatching,
      ccOn: this.ccOn,
      ccToggle: this.ccToggle,
      ccToggleLabel: this.ccOn ? 'Subtítulos: activados' : 'Activar subtítulos',
      ccSupported: speechSupported(),
      ccLangs: CAPTION_LANGS.map(([k, label]) => ({ key: k, label, pick: () => this.ccPickLang(k), style: 'padding:6px 12px;border-radius:999px;font-size:11px;cursor:pointer;' + (this.ccLang === k ? 'font-weight:700;color:#fff;background:var(--purple)' : 'color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2)') })),
      ccTargets: CAPTION_LANGS.map(([k, label]) => ({ key: k, label, pick: () => this.ccPickTarget(k), style: 'padding:6px 12px;border-radius:999px;font-size:11px;cursor:pointer;' + (this.ccTarget === k ? 'font-weight:700;color:#fff;background:var(--blue)' : 'color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2)') })),
      ccText: this.liveWatching ? this.ccCurrent() : '',
      ccHasText: !!(this.liveWatching && this.ccCurrent()),
      ccTranslateNote: translatorSupported() ? 'La traducción se hace en tu dispositivo.' : 'Para traducir en vivo usa Chrome o Edge actualizados; sin eso verás los subtítulos en el idioma original.',`);
  return s;
}
