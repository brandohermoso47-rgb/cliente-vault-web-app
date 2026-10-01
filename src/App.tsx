// GENERADO por tools/port-logic.mjs desde la lógica del prototipo. Edita tools/logic.source.js o el script, no este archivo.
/* eslint-disable */
// @ts-nocheck
import React, { Component } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, getDocs, setDoc, updateDoc, serverTimestamp, collection, onSnapshot, query, where, addDoc, deleteDoc, orderBy, limit as fbLimit } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage, firebaseConfigured } from './lib/firebase';
import { IMAGE_TYPES, VIDEO_TYPES, MAX_IMAGE_MB, MAX_VIDEO_MB } from './lib/validators';
import Shell from './Shell';
import Login from './views/Login';
import ChatDock from './views/ChatDock';
import Register from './screens/Register';
import RegisterPro from './screens/RegisterPro';
import SetupPhoto from './screens/SetupPhoto';
import { takePending } from './lib/session';
import { startCheckout, startConnectOnboarding, getInstructorEarnings } from './lib/payments';
import { api } from './lib/api';
import { acceptFriend, declineFriend, myFriendIds, removeFriend, sendFriendRequest } from './lib/friends';
import { publishPost, subscribeFeed } from './lib/posts';
import { addComment, likeInfo, toggleFollow, toggleLike, watchComments } from './lib/social';
import { publishReel } from './lib/reels';
import { watchFollowCounts, watchMyMedia, watchMyPostCount } from './lib/profileStats';
import { BattleCall, declineCall, goLive, stopLive, watchIncomingCalls, watchLiveSessions } from './lib/battle';
import { STUDY_MODULES, watchStudyProgress, toggleTechniqueItem, saveReflectionAnswer, saveQuizScoreAndComplete } from './lib/studyPlan';
import { publishAnnouncement, subscribeAnnouncements } from './lib/announcements';
import { publishEbook, subscribeEbooks } from './lib/ebooks';
import { createEvent, deleteEvent, downloadIcs, googleCalendarUrl, subscribeEvents } from './lib/events';
import { CAPTION_LANGS, speechSupported, startCaptions, translateText, translatorSupported } from './lib/captions';
import { checkGroupFile, cleanGroupCode, createGroup, deleteGroup, deleteMessage, joinGroup, leaveGroup, sendMessage, watchMessages, watchMyGroups } from './lib/groups';
import { markAllNotificationsRead, markNotificationRead, watchMyNotifications, type AppNotification } from './lib/notifications';

import { sty } from './lib/dc';

class App extends Component<any, any> {
  static defaultProps = { paleta: 'Fucsia & naranja', materia: 'Vidrio platinado', profundidad: 1.6, menu: 'Expandido' };
  state: any = { view: (import.meta.env.DEV && new URLSearchParams(location.search).get('view')) || 'login', theme: 'dark', navOpen: null, acct: false, user: null, authReady: false };
  unsubAuth: any = null;

  /* Rol derivado de las dos suscripciones posibles */
  subs = import.meta.env.DEV ? { platform: false, instructor: true, docente: false } : { platform: false, instructor: false, docente: false };

  toggleSub(k) {
    if (!import.meta.env.DEV) return; // solo demo local
    this.subs = Object.assign({}, this.subs, { [k]: !this.subs[k] });
    this.forceUpdate();
  }

  role() {
    const p = this.subs.platform, i = this.subs.instructor;
    if (p && i) return { id: 'estudiante_premium', name: 'Estudiante Premium', short: 'EST · PREMIUM', color: 'var(--gold)', ink: '#1A1400', desc: 'Suscripción de plataforma y al menos una cátedra activa. Acceso completo.' };
    if (i) return { id: 'estudiante', name: 'Estudiante', short: 'ESTUDIANTE', color: 'var(--blue)', ink: '#08060B', desc: 'Suscrito a una cátedra de instructor. Acceso a sus cursos, lives y material.' };
    if (p) return { id: 'usuario_premium', name: 'Usuario Premium', short: 'PREMIUM', color: 'var(--purple)', ink: '#fff', desc: 'Suscripción de plataforma activa. Laboratorio, diario y comunidad sin cátedras.' };
    return { id: 'usuario', name: 'Usuario', short: 'USUARIO', color: 'var(--ink-3)', ink: '#08060B', desc: 'Cuenta gratuita. Muro, reels y una lección de muestra por instructor.' };
  }

  navIsOpen() {
    if (this.state.navOpen === true || this.state.navOpen === false) return this.state.navOpen;
    return (this.props.menu ?? 'Solo iconos') === 'Expandido';
  }

  /* ---------- Laboratorio Freestyle ---------- */
  labBpm = 112;
  labRunning = false;
  labDrill = 0;

  drillData = [
    { t: 'Arm rolls continuos', d: 'Rotación completa sin parar el flujo. Mantén el codo alto.', secs: '2:00', c1: 'var(--blue)', c2: 'var(--purple)' },
    { t: 'Punto y pose', d: 'Marca el golpe, congela dos tiempos, suelta.', secs: '1:30', c1: 'var(--pink)', c2: 'var(--purple)' },
    { t: 'Síncopa cruzada', d: 'Acentúa el contratiempo con el brazo contrario.', secs: '2:30', c1: 'var(--yellow)', c2: 'var(--pink)' },
    { t: 'Freestyle libre', d: 'Sin estructura. Solo escucha y responde.', secs: '3:00', c1: 'var(--purple)', c2: 'var(--blue)' }
  ];

  setBpm = (e) => { this.labBpm = Number(e.target.value); this.forceUpdate(); };
  toggleMetro = () => { this.labRunning = !this.labRunning; this.forceUpdate(); };
  pickDrill(i) { this.labDrill = i; this.forceUpdate(); }

  buildDrills() {
    return this.drillData.map((d, i) => ({
      key: 'd' + i,
      title: d.t,
      desc: d.d,
      secs: d.secs,
      isActive: this.labDrill === i,
      pick: () => this.pickDrill(i),
      dot: 'width:10px;height:10px;flex:0 0 10px;border-radius:50%;background:linear-gradient(135deg,' + d.c1 + ',' + d.c2 + ')',
      card: 'display:flex;align-items:center;gap:14px;padding:16px 18px;border-radius:20px;cursor:pointer;border:1px solid ' + (this.labDrill === i ? 'color-mix(in oklch, var(--blue) 55%, transparent)' : 'var(--hair)') + ';background:var(--glass);backdrop-filter:var(--lg-blur);-webkit-backdrop-filter:var(--lg-blur);box-shadow:var(--lg-edge);transform-style:preserve-3d;transition:transform .26s cubic-bezier(.2,.85,.25,1), border-color .2s ease;animation:rise3d .8s cubic-bezier(.2,.85,.25,1) ' + (0.06 * i).toFixed(2) + 's backwards'
    }));
  }

  /* ---------- Laboratorio: espejo, takes, annotator ---------- */
  labRec = false;
  labMirror = true;
  labGrid = false;
  labTake = 0;
  labFrame = 2;
  labNote = '';

  toggleRec = () => { this.labRec = !this.labRec; this.forceUpdate(); };
  toggleMirror = () => { this.labMirror = !this.labMirror; this.forceUpdate(); };
  toggleGrid = () => { this.labGrid = !this.labGrid; this.forceUpdate(); };
  pickTake(i) { this.labTake = i; this.forceUpdate(); }
  pickFrame(i) { this.labFrame = i; this.forceUpdate(); }
  onLabNote = (e) => { this.labNote = e.target.value; this.forceUpdate(); };

  takeData = [
    { n: 'TAKE_04', drill: 'Síncopa cruzada', dur: '0:42', bpm: 118, frames: 6, c1: 'var(--yellow)', c2: 'var(--pink)' },
    { n: 'TAKE_03', drill: 'Punto y pose', dur: '1:06', bpm: 112, frames: 3, c1: 'var(--pink)', c2: 'var(--purple)' },
    { n: 'TAKE_02', drill: 'Arm rolls continuos', dur: '2:00', bpm: 104, frames: 8, c1: 'var(--blue)', c2: 'var(--purple)' },
    { n: 'TAKE_01', drill: 'Freestyle libre', dur: '3:00', bpm: 96, frames: 2, c1: 'var(--purple)', c2: 'var(--blue)' }
  ];

  buildTakes() {
    return this.takeData.map((t, i) => ({
      key: 'tk' + i,
      name: t.n,
      drill: t.drill,
      meta: t.dur + ' · ' + t.bpm + ' BPM · ' + t.frames + ' frames',
      pick: () => this.pickTake(i),
      isOn: this.labTake === i,
      thumb: 'height:104px;border-radius:16px;background:linear-gradient(135deg,' + t.c1 + ',' + t.c2 + ');opacity:' + (this.labTake === i ? '.95' : '.55') + ';position:relative;overflow:hidden',
      card: 'display:flex;flex-direction:column;gap:12px;padding:14px;border-radius:22px;cursor:pointer;border:1px solid ' + (this.labTake === i ? 'color-mix(in oklch, var(--yellow) 55%, transparent)' : 'var(--hair)') + ';background:var(--glass);backdrop-filter:var(--lg-blur);-webkit-backdrop-filter:var(--lg-blur);box-shadow:var(--lg-edge);transition:border-color .2s ease, transform .26s cubic-bezier(.2,.85,.25,1)'
    }));
  }

  frameData = [
    { t: '00:03', tag: 'PREP' }, { t: '00:07', tag: 'ROLL_IN' }, { t: '00:11', tag: 'PEAK' },
    { t: '00:16', tag: 'HOLD' }, { t: '00:21', tag: 'RELEASE' }, { t: '00:26', tag: 'RECOVER' }
  ];

  buildFrames() {
    return this.frameData.map((f, i) => ({
      key: 'fr' + i,
      time: f.t,
      tag: f.tag,
      pick: () => this.pickFrame(i),
      style: 'flex:0 0 96px;display:flex;flex-direction:column;gap:6px;padding:8px;border-radius:14px;cursor:pointer;border:1px solid ' + (this.labFrame === i ? 'var(--yellow)' : 'var(--hair)') + ';background:var(--glass-2);transition:border-color .18s ease',
      thumb: 'height:54px;border-radius:9px;background:repeating-linear-gradient(115deg, color-mix(in oklch, var(--ink) 12%, transparent) 0 3px, transparent 3px 9px), var(--glass-2);opacity:' + (this.labFrame === i ? '1' : '.6'),
      label: 'font-family:\'Geist Mono\',monospace;font-size:8.5px;letter-spacing:.14em;color:' + (this.labFrame === i ? 'var(--yellow)' : 'var(--ink-3)')
    }));
  }

  frameMetrics = [
    { k: 'ELBOW_EXT', v: '164.2°' },
    { k: 'TORSO_TORQUE', v: '12 Nm' },
    { k: 'SYMMETRY', v: '84%' },
    { k: 'FLUIDITY', v: '92%' }
  ];

  coachData = [
    { t: 'Mantén la elevación', d: 'El codo cae bajo la línea del hombro en el barrido radial. Súbelo dos dedos y la silueta se abre.', c: 'var(--yellow)', tag: null },
    { t: 'Torque del torso', d: 'Estás rotando desde la cintura. Inicia el giro en la costilla y el brazo llegará más lejos sin esfuerzo.', c: 'var(--pink)', tag: '84% EFICIENCIA' },
    { t: 'Bloqueo de tempo', d: 'Pierdes el pulso en el tiempo 7 de cada frase. Cuenta el contratiempo en voz alta durante dos rondas.', c: 'var(--blue)', tag: null }
  ];

  buildCoach() {
    return this.coachData.map((c, i) => ({
      key: 'co' + i,
      title: c.t,
      desc: c.d,
      tag: c.tag,
      hasTag: !!c.tag,
      card: 'padding:18px 20px;border-radius:20px;border:1px solid var(--hair);border-left:3px solid ' + c.c + ';background:var(--glass);backdrop-filter:var(--lg-blur);-webkit-backdrop-filter:var(--lg-blur);box-shadow:var(--lg-edge)',
      chip: 'font-family:\'Geist Mono\',monospace;font-size:9px;letter-spacing:.12em;padding:4px 8px;border-radius:7px;white-space:nowrap;color:' + c.c + ';border:1px solid color-mix(in oklch, ' + c.c + ' 45%, transparent)'
    }));
  }

  timelineData = [
    { l: 'Calentamiento', m: '4 min', w: 18, c: 'var(--blue)' },
    { l: 'Arm rolls', m: '2 min', w: 14, c: 'var(--purple)' },
    { l: 'Punto y pose', m: '1:30', w: 12, c: 'var(--pink)' },
    { l: 'Síncopa cruzada', m: '2:30', w: 20, c: 'var(--yellow)' },
    { l: 'Freestyle libre', m: '3 min', w: 22, c: 'var(--purple)' },
    { l: 'Enfriar', m: '2 min', w: 14, c: 'var(--ink-3)' }
  ];

  buildTimeline() {
    return this.timelineData.map((t, i) => ({
      key: 'tl' + i,
      label: t.l,
      meta: t.m,
      isNow: i === 3,
      bar: 'flex:' + t.w + ' 1 0;height:100%;background:' + t.c + ';opacity:' + (i === 3 ? '1' : '.4'),
      col: 'flex:' + t.w + ' 1 0;min-width:0;display:flex;flex-direction:column;gap:3px;padding-right:8px'
    }));
  }

  labStats = [
    { k: 'TEMPO_LOCK', v: '92%', d: 'Pulso sostenido esta semana' },
    { k: 'SYMMETRY', v: '84%', d: 'Brazo izquierdo dos grados corto' },
    { k: 'TAKES', v: '14', d: 'Grabados en los últimos 7 días' },
    { k: 'FRAMES', v: '38', d: 'Anotados con sensación interna' }
  ];

  buildLabStats() {
    return this.labStats.map((s, i) => ({
      key: 'ls' + i,
      kicker: s.k,
      value: s.v,
      desc: s.d,
      card: 'padding:20px;border-radius:22px;border:1px solid var(--hair);background:var(--glass);backdrop-filter:var(--lg-blur);-webkit-backdrop-filter:var(--lg-blur);box-shadow:var(--lg-edge)'
    }));
  }

  /* ---------- Somatic Diary ---------- */
  moodPick = 2;
  setMood(i) { this.moodPick = i; this.forceUpdate(); }

  moodData = [
    { l: 'Agotada', c: 'var(--purple)' },
    { l: 'Cansada', c: 'var(--blue)' },
    { l: 'Neutral', c: 'var(--ink-3)' },
    { l: 'Con chispa', c: 'var(--yellow)' },
    { l: 'Imparable', c: 'var(--pink)' }
  ];

  buildMoods() {
    const base = 'flex:1 1 0;text-align:center;padding:14px 10px;border-radius:18px;font-size:12px;font-weight:600;cursor:pointer;transition:border-color .2s ease, color .2s ease;';
    return this.moodData.map((m, i) => ({
      key: 'm' + i,
      label: m.l,
      pick: () => this.setMood(i),
      style: base + (this.moodPick === i
        ? 'color:#fff;background:' + m.c + ';border:1px solid transparent;'
        : 'color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);')
    }));
  }

  bodyLog = [
    { zone: 'Hombros', note: 'Tensión leve tras los overhead rolls', level: 'Media', pct: 55 },
    { zone: 'Muñecas', note: 'Sin molestias, movilidad completa', level: 'Baja', pct: 20 },
    { zone: 'Zona lumbar', note: 'Rigidez al despertar, mejora al calentar', level: 'Media', pct: 48 },
    { zone: 'Tobillos', note: 'Buen rango en los giros', level: 'Baja', pct: 15 }
  ];

  buildBody() {
    return this.bodyLog.map((b, i) => ({
      key: 'b' + i,
      zone: b.zone,
      note: b.note,
      level: b.level,
      bar: 'width:' + b.pct + '%;height:100%;border-radius:999px;background:' + (b.pct > 50 ? 'var(--yellow)' : 'var(--blue)')
    }));
  }

  /* ---------- Manuales & Podcasts ---------- */
  libTab = 'Todo';
  pickLib(t) { this.libTab = t; this.forceUpdate(); }

  libData = [
    { t: 'Manual de Fundamentos', k: 'Manual', meta: '48 páginas · PDF', by: 'Brando Hermoso', c1: 'var(--blue)', c2: 'var(--purple)' },
    { t: 'Anatomía del brazo waacker', k: 'Manual', meta: '32 páginas · PDF', by: 'Brando Hermoso', c1: 'var(--purple)', c2: 'var(--blue)' },
    { t: 'El waacking no es una pose, es una respuesta', k: 'Podcast', ep: 0, meta: 'Ep. 12 · 48 min', by: 'Brando Hermoso', c1: 'var(--pink)', c2: 'var(--yellow)' },
    { t: 'Batallas: leer al rival en ocho tiempos', k: 'Podcast', ep: 2, meta: 'Ep. 10 · 53 min', by: 'Pedro Punking', c1: 'var(--yellow)', c2: 'var(--pink)' },
    { t: 'Playlist Disco esencial', k: 'Guía', meta: '24 temas comentados', by: 'Equipo Waack ON', c1: 'var(--blue)', c2: 'var(--pink)' },
    { t: 'Glosario de poses', k: 'Guía', meta: '60 términos', by: 'Equipo Waack ON', c1: 'var(--purple)', c2: 'var(--pink)' }
  ];

  buildLibTabs() {
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
  }

  buildLib() {
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
  }

  /* ---------- Muro & Retos ---------- */
  wallData = [
    { u: 'Lorena "WaackQueen"', r: 'Instructora', t: 'Subid vuestro clip del reto #34 antes del domingo. Miro todos y comento los tres mejores.', time: 'hace 20 min', likes: 84, comments: 12, c1: 'var(--pink)', c2: 'var(--purple)' },
    { u: 'Sara Molina', r: 'Nivel 2', t: 'Primera vez que encadeno 16 tiempos a 128 BPM sin perder el punto. Gracias por los drills.', time: 'hace 2 h', likes: 152, comments: 31, c1: 'var(--blue)', c2: 'var(--pink)' },
    { u: 'Ibuki Imata', r: 'Instructor', t: 'Recordad: el freno importa más que la velocidad. Grabaos de perfil para verlo.', time: 'hace 5 h', likes: 208, comments: 44, c1: 'var(--yellow)', c2: 'var(--pink)' }
  ];

  buildWall() {
    return this.wallData.map((w, i) => ({
      key: 'w' + i,
      user: w.u,
      role: w.r,
      text: w.t,
      time: w.time,
      likes: String(w.likes),
      comments: String(w.comments),
      avatar: 'width:42px;height:42px;flex:0 0 42px;border-radius:15px;border:1px solid var(--hair);background:linear-gradient(135deg, color-mix(in oklch, ' + w.c1 + ' 72%, #fff 8%), color-mix(in oklch, ' + w.c2 + ' 70%, #000 18%))'
    }));
  }

  challengeData = [
    { n: '#34', t: 'Síncopa en contratiempo', d: 'Graba 30 s marcando el contratiempo con brazo contrario.', left: '2 días', joined: 486, c1: 'var(--pink)', c2: 'var(--purple)' },
    { n: '#35', t: 'Posing de alta costura', d: 'Tres poses encadenadas, una por cada acento del tema.', left: '9 días', joined: 122, c1: 'var(--purple)', c2: 'var(--blue)' }
  ];

  buildChallenges() {
    return this.challengeData.map((c, i) => ({
      key: c.n,
      num: 'Reto ' + c.n,
      title: c.t,
      desc: c.d,
      left: 'Quedan ' + c.left,
      joined: c.joined + ' participantes',
      cover: 'height:120px;background:linear-gradient(135deg, color-mix(in oklch, ' + c.c1 + ' 58%, #000 20%), color-mix(in oklch, ' + c.c2 + ' 55%, #000 32%))'
    }));
  }

  /* ---------- Ranking & Insignias ---------- */
  rankData = [
    { p: 1, n: 'Ibuki Imata', lv: 'Nivel 4', pts: 4820, c1: 'var(--yellow)', c2: 'var(--pink)' },
    { p: 2, n: 'Sara Molina', lv: 'Nivel 3', pts: 3990, c1: 'var(--blue)', c2: 'var(--purple)' },
    { p: 3, n: 'Yoonji Kim', lv: 'Nivel 3', pts: 3610, c1: 'var(--purple)', c2: 'var(--pink)' },
    { p: 4, n: 'Elena Pose', lv: 'Nivel 2', pts: 2870, c1: 'var(--pink)', c2: 'var(--yellow)' },
    { p: 5, n: 'Marc Duarte', lv: 'Nivel 2', pts: 2410, c1: 'var(--blue)', c2: 'var(--pink)' },
    { p: 18, n: 'Tú', lv: 'Nivel 1', pts: 100, me: true, c1: 'var(--purple)', c2: 'var(--pink)' }
  ];

  buildRank() {
    return this.rankData.map((r, i) => ({
      key: 'r' + r.p,
      pos: String(r.p).padStart(2, '0'),
      name: r.n,
      level: r.lv,
      pts: r.pts.toLocaleString('es-ES') + ' pts',
      isMe: !!r.me,
      avatar: 'width:40px;height:40px;flex:0 0 40px;border-radius:14px;border:1px solid var(--hair);background:linear-gradient(135deg, color-mix(in oklch, ' + r.c1 + ' 72%, #fff 8%), color-mix(in oklch, ' + r.c2 + ' 70%, #000 18%))',
      row: 'display:flex;align-items:center;gap:14px;padding:14px 18px;border-radius:20px;border:1px solid ' + (r.me ? 'color-mix(in oklch, var(--pink) 55%, transparent)' : 'var(--hair)') + ';background:var(--glass);backdrop-filter:var(--lg-blur);-webkit-backdrop-filter:var(--lg-blur);box-shadow:var(--lg-edge);transform-style:preserve-3d;transition:transform .26s cubic-bezier(.2,.85,.25,1), border-color .26s ease;animation:rise3d .8s cubic-bezier(.2,.85,.25,1) ' + (0.05 * i).toFixed(2) + 's backwards'
    }));
  }

  badgeData = [
    { t: 'Primer paso', d: 'Completaste tu primera lección', got: true, c: 'var(--blue)', ic: 'step' },
    { t: 'Racha de 7', d: 'Siete días seguidos entrenando', got: true, c: 'var(--pink)', ic: 'flame' },
    { t: 'Ritmo firme', d: 'Un drill completo a 128 BPM', got: true, c: 'var(--yellow)', ic: 'beat' },
    { t: 'Voz propia', d: 'Publica tu primer reel', got: true, c: 'var(--purple)', ic: 'mic' },
    { t: 'Retadora', d: 'Participa en tres retos semanales', got: true, c: 'var(--blue)', ic: 'trophy' },
    { t: 'Diario vivo', d: 'Diez entradas en el Somatic Diary', got: true, c: 'var(--pink)', ic: 'book' },
    { t: 'Batalla ganada', d: 'Gana una ronda 1vs1', got: false, c: 'var(--ink-3)', ic: 'trophy' },
    { t: 'Nivel 3', d: 'Alcanza el Nivel 3', got: false, c: 'var(--ink-3)', ic: 'star' }
  ];

  buildBadges() {
    return this.badgeData.map((b, i) => ({
      key: 'bg' + i,
      title: b.t,
      desc: b.d,
      locked: !b.got,
      unlocked: !!b.got,
      icStep: b.ic === 'step',
      icFlame: b.ic === 'flame',
      icBeat: b.ic === 'beat',
      icMic: b.ic === 'mic',
      icTrophy: b.ic === 'trophy',
      icBook: b.ic === 'book',
      icStar: b.ic === 'star',
      ring: 'position:relative;display:flex;align-items:center;justify-content:center;width:52px;height:52px;flex:0 0 52px;border-radius:50%;border:2px solid ' + (b.got ? b.c : 'var(--hair)') + ';color:' + (b.got ? b.c : 'var(--ink-3)') + ';background:var(--glass-2)',
      card: 'display:flex;align-items:center;gap:14px;padding:16px 18px;border-radius:20px;border:1px solid var(--hair);background:var(--glass);backdrop-filter:var(--lg-blur);-webkit-backdrop-filter:var(--lg-blur);box-shadow:var(--lg-edge);opacity:' + (b.got ? '1' : '.55') + ';transform-style:preserve-3d;transition:transform .26s cubic-bezier(.2,.85,.25,1), border-color .26s ease;animation:rise3d .8s cubic-bezier(.2,.85,.25,1) ' + (0.05 * i).toFixed(2) + 's backwards'
    }));
  }

  /* ---------- Planes & Membresía ---------- */
  planCycle = 'Mensual';
  setCycle(c) { this.planCycle = c; this.forceUpdate(); }

  planData = [
    { n: 'Explora', p: { Mensual: '0 €', Anual: '0 €' }, d: 'Acceso al muro, reels y una lección de muestra por instructor.', feats: ['Muro y reels completos', 'Una lección de muestra', 'Retos semanales sin premio'], cur: false, hi: false },
    { n: 'Una cátedra', p: { Mensual: '19 € / mes', Anual: '190 € / año' }, d: 'Todos los cursos de un instructor, con su sala de chat privada.', feats: ['Un instructor a elegir', 'Sala de chat de la cátedra', 'Lives en directo y repetición', 'Manuales y podcasts'], cur: true, hi: false },
    { n: 'Escuela completa', p: { Mensual: '39 € / mes', Anual: '390 € / año' }, d: 'Todas las cátedras, laboratorio y prioridad en batallas.', feats: ['Todos los instructores', 'Laboratorio Freestyle', 'Somatic Diary con seguimiento', 'Plaza prioritaria en batallas'], cur: false, hi: true }
  ];

  /* ---------- Pagos (Stripe Checkout) ---------- */
  planPickerOpen = false;
  planMsg = '';
  planBusy = false;
  PLAN_IDS = { 'Explora': 'explora', 'Una cátedra': 'catedra', 'Escuela completa': 'escuela' };

  planIsCurrent(p) {
    const id = this.PLAN_IDS[p.n];
    const { platform, instructor } = this.subs;
    if (id === 'escuela') return !!platform;
    if (id === 'catedra') return !!instructor && !platform;
    return !platform && !instructor;
  }

  choosePlan(p) {
    if (this.planIsCurrent(p) || this.planBusy) return;
    const id = this.PLAN_IDS[p.n];
    if (!id || id === 'explora') return; // el plan gratuito no se cobra
    if (id === 'catedra') { this.planPickerOpen = true; this.planMsg = ''; this.forceUpdate(); return; }
    this.payStart(id);
  }

  async payStart(planId, instructorId) {
    this.planBusy = true;
    this.planMsg = 'Abriendo el pago seguro…';
    this.planPickerOpen = false;
    this.forceUpdate();
    try {
      await startCheckout(planId, this.planCycle === 'Anual' ? 'year' : 'month', instructorId);
    } catch (e) {
      this.planBusy = false;
      this.planMsg = e.message || 'No se pudo abrir el pago.';
      this.forceUpdate();
    }
  }

  buildPlans() {
    return this.planData.map((p, i) => ({
      key: p.n,
      name: p.n,
      choose: () => this.choosePlan(p),
      price: p.p[this.planCycle],
      desc: p.d,
      feats: p.feats.map((f, j) => ({ key: p.n + j, text: f })),
      isCurrent: this.planIsCurrent(p),
      ctaLabel: this.planIsCurrent(p) ? 'Tu plan actual' : (p.hi ? 'Mejorar plan' : 'Elegir plan'),
      slotId: 'plan-bg-' + (i + 1),
      slotHint: 'Imagen de fondo · ' + p.n,
      cta: p.hi
        ? 'position:relative;z-index:2;display:block;text-align:center;padding:14px 20px;border-radius:999px;font-size:13px;font-weight:700;color:#1A1400;background:linear-gradient(90deg,var(--gold-hi),var(--gold-lo));box-shadow:inset 0 1px 0 rgba(255,255,255,.5);cursor:pointer'
        : 'position:relative;z-index:2;display:block;text-align:center;padding:14px 20px;border-radius:999px;font-size:13px;font-weight:700;color:var(--ink);border:1px solid var(--hair);background:var(--glass-2);box-shadow:var(--lg-edge);cursor:pointer',
      card: 'position:relative;overflow:hidden;min-height:460px;display:flex;flex-direction:column;gap:16px;padding:172px 26px 28px;border-radius:26px;border:1px solid ' + (p.hi ? 'color-mix(in oklch, var(--purple) 55%, transparent)' : 'var(--hair)') + ';background:var(--glass);backdrop-filter:var(--lg-blur);-webkit-backdrop-filter:var(--lg-blur);box-shadow:var(--lg-edge);opacity:1;animation:rise3d .8s cubic-bezier(.2,.85,.25,1) ' + (0.08 * i).toFixed(2) + 's backwards' + (p.hi ? ';animation:goldEdge 4.5s ease-in-out infinite' : '')
    }));
  }

  buildCycleTabs() {
    const base = 'flex:1;text-align:center;padding:10px 18px;border-radius:999px;font-size:12px;cursor:pointer;';
    return ['Mensual', 'Anual'].map((c) => ({
      key: c,
      label: c === 'Anual' ? 'Anual · 2 meses gratis' : 'Mensual',
      style: base + (this.planCycle === c
        ? 'font-weight:700;color:var(--ink);background:var(--glass);border:1px solid var(--hair);box-shadow:var(--lg-edge);'
        : 'font-weight:600;color:var(--ink-2);border:1px solid transparent;'),
      pick: () => this.setCycle(c)
    }));
  }

  /* ---------- Ayuda & Legal ---------- */
  faqOpen = 0;
  toggleFaq(i) { this.faqOpen = this.faqOpen === i ? -1 : i; this.forceUpdate(); }

  faqData = [
    { q: '¿Puedo suscribirme a varios instructores?', a: 'Sí. Cada cátedra se cobra por separado y aparece como una sección propia en Clases & Cursos. También puedes pasar al plan Escuela completa, que las incluye todas.' },
    { q: '¿Qué pasa si cancelo a mitad de mes?', a: 'Mantienes el acceso hasta el final del periodo pagado. No se emiten reembolsos parciales, pero tu progreso y tus insignias se conservan.' },
    { q: '¿Los lives quedan grabados?', a: 'Sí, las sesiones en directo quedan disponibles en repetición durante 30 días para quien tenga la cátedra activa.' },
    { q: '¿Cómo funciona el Somatic Diary?', a: 'Registras sensación y molestias tras cada sesión. Tu instructor ve el resumen agregado, nunca las notas privadas.' },
    { q: '¿Puedo descargar los manuales?', a: 'Los manuales en PDF se descargan con marca de agua personal. Los podcasts se escuchan en la app.' }
  ];

  buildFaq() {
    return this.faqData.map((f, i) => ({
      key: 'f' + i,
      q: f.q,
      a: f.a,
      isOpen: this.faqOpen === i,
      toggle: () => this.toggleFaq(i),
      sign: this.faqOpen === i ? '−' : '+'
    }));
  }

  annData = [
    { id: 'a1', cat: 'Competencias', author: 'Brando Hermoso', role: 'Instructor', title: 'Gran Batalla Waack On 2026', body: 'Inscripciones abiertas para la batalla 1vs1. Categorías Novice y Open. Plazas limitadas a 32 bailarines por ronda.', date: '09 · 02 · 26', c1: 'var(--blue)', c2: 'var(--purple)', cta: 'Inscribirme', pinned: true },
    { id: 'a2', cat: 'Sesiones & Jams', author: 'Lorena "WaackQueen"', role: 'Instructora', title: 'Jam & Sesión Rítmica', body: 'Jam abierta con DJ en directo. Trae ropa cómoda; empezamos con círculo de calentamiento a las 19:00.', date: '09 · 07 · 26', c1: 'var(--pink)', c2: 'var(--yellow)', cta: 'Apuntarme' },
    { id: 'a3', cat: 'Clases Especiales', author: 'Yoon Ji Kim', role: 'Clase especial', title: 'Masterclass Yoon Ji Kim', body: 'Sesión única sobre musicalidad K-Groove. Plazas por orden de inscripción; se graba para los suscriptores anuales.', date: '09 · 15 · 26', c1: 'var(--purple)', c2: 'var(--blue)', cta: 'Reservar' },
    { id: 'a4', cat: 'Comunicados', author: 'Equipo Waack ON', role: 'Comunicado', title: 'Nuevo horario de soporte', body: 'A partir de octubre el soporte responde de lunes a viernes, de 10:00 a 18:00 (CET).', date: '09 · 18 · 26', c1: 'var(--yellow)', c2: 'var(--pink)', cta: 'Leer' }
  ];

  annFilter = 'Todos';

  pickAnn(c) { this.annFilter = c; this.forceUpdate(); }

  buildAnnTabs() {
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
  }

  buildAnns() {
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
  }

  trackData = [
    { t: 'Waack That Funk', bpm: '112 BPM', tag: 'Entrenamiento', c1: 'var(--pink)', c2: 'var(--purple)' },
    { t: 'Midnight Posing Lounge', bpm: '96 BPM', tag: 'Calentamiento', c1: 'var(--blue)', c2: 'var(--purple)' },
    { t: 'Whacking Arms Drill', bpm: '128 BPM', tag: 'Velocidad', c1: 'var(--yellow)', c2: 'var(--pink)' }
  ];

  playingIndex = 0;

  playTrack(i) { this.playingIndex = i; this.forceUpdate(); }

  buildTracks() {
    return this.trackData.map((t, i) => ({
      key: 't' + i,
      title: t.t,
      bpm: t.bpm,
      tag: t.tag,
      isPlaying: this.playingIndex === i,
      play: () => this.playTrack(i),
      thumb: 'display:flex;align-items:center;justify-content:center;width:40px;height:40px;flex:0 0 40px;border-radius:13px;color:#fff;background:linear-gradient(135deg, color-mix(in oklch, ' + t.c1 + ' 70%, #000 10%), color-mix(in oklch, ' + t.c2 + ' 66%, #000 22%))',
      card: 'display:flex;align-items:center;gap:12px;padding:13px 15px;border-radius:20px;border:1px solid ' + (this.playingIndex === i ? 'color-mix(in oklch, var(--pink) 55%, transparent)' : 'var(--hair)') + ';background:var(--glass);backdrop-filter:var(--lg-blur);-webkit-backdrop-filter:var(--lg-blur);box-shadow:var(--lg-edge);cursor:pointer;transform-style:preserve-3d;transition:transform .26s cubic-bezier(.2,.85,.25,1), border-color .2s ease;animation:rise3d .8s cubic-bezier(.2,.85,.25,1) ' + (0.06 * i).toFixed(2) + 's backwards'
    }));
  }

  chatRooms = [
    { id: 'general', name: 'Waack ON Global', topic: 'Sala general de la comunidad', last: 'Lorena: mañana subo el drill de 128 BPM', time: '2 min', unread: 4, live: true, c1: 'var(--pink)', c2: 'var(--purple)', members: '1.2K' },
    { id: 'brando', name: 'Cátedra · Brando Hermoso', topic: 'Dudas de fundamentos y biomecánica', last: 'Brando: revisad la alineación del codo', time: '18 min', unread: 2, c1: 'var(--blue)', c2: 'var(--purple)', members: '312' },
    { id: 'lorena', name: 'Cátedra · Lorena WaackQueen', topic: 'Speed-Waack y síncopas', last: 'Tú: ¿el contratiempo va en el hi-hat?', time: '1 h', unread: 0, c1: 'var(--pink)', c2: 'var(--yellow)', members: '204' },
    { id: 'retos', name: 'Reto semanal #34', topic: 'Sube tu clip antes del domingo', last: 'Ibuki: quedan 9 plazas para la ronda 2', time: '3 h', unread: 7, c1: 'var(--yellow)', c2: 'var(--pink)', members: '486' },
    { id: 'battles', name: 'Battles & Cyphers', topic: 'Convocatorias y resultados', last: 'Sara: cypher en Madrid el sábado', time: 'Ayer', unread: 0, c1: 'var(--purple)', c2: 'var(--blue)', members: '733' },
    { id: 'soporte', name: 'Soporte Waack ON', topic: 'Pagos, accesos y cuenta', last: 'Equipo: tu recibo de septiembre está listo', time: '2 d', unread: 0, c1: 'var(--blue)', c2: 'var(--pink)', members: 'Equipo' }
  ];

  fisState = { part: 'Hombros', routine: ['Círculos de hombro controlados', 'Apertura de pecho en pared'] };
  fisData = {
    'Hombros': { time: '12 min', items: [
      { name: 'Círculos de hombro controlados', kind: 'Movilidad', dose: '2 × 10 por lado', level: 'Base', note: 'De pie, brazos sueltos. Dibuja círculos lentos hacia atrás sin subir el trapecio. Es el calentamiento obligatorio antes de cualquier arm control.' },
      { name: 'Deslizamiento en pared', kind: 'Movilidad', dose: '3 × 8', level: 'Base', note: 'Espalda y antebrazos pegados a la pared. Sube y baja los brazos sin despegar las muñecas.' },
      { name: 'Estiramiento de deltoides cruzado', kind: 'Estiramiento', dose: '30 s por lado', level: 'Base', note: 'Cruza el brazo al pecho y empuja con el codo contrario. Hombro abajo, no encogido.' },
      { name: 'Rotación externa con banda', kind: 'Fuerza', dose: '3 × 12 por lado', level: 'Medio', note: 'Codo pegado al costado. Abre el antebrazo contra la banda. Protege el manguito rotador en sesiones largas.' },
      { name: 'Plancha con toque de hombro', kind: 'Fuerza', dose: '3 × 20 toques', level: 'Medio', note: 'Plancha alta, cadera quieta. Toca el hombro contrario alternando sin girar la pelvis.' }
    ]},
    'Brazos y muñecas': { time: '10 min', items: [
      { name: 'Círculos de muñeca', kind: 'Movilidad', dose: '2 × 15 por sentido', level: 'Base', note: 'Antebrazo fijo. Solo gira la muñeca. Base del twirl limpio.' },
      { name: 'Estiramiento de flexores', kind: 'Estiramiento', dose: '30 s por brazo', level: 'Base', note: 'Brazo extendido, palma al frente, tira suave de los dedos hacia ti.' },
      { name: 'Latigazo de antebrazo', kind: 'Técnica', dose: '3 × 12 por lado', level: 'Medio', note: 'Impulso desde el codo, la mano llega última. Trabaja la disociación que pide el waacking.' },
      { name: 'Isométrico de agarre', kind: 'Fuerza', dose: '3 × 25 s', level: 'Medio', note: 'Aprieta un objeto blando. Evita el temblor de mano en los puntos finales.' }
    ]},
    'Pecho': { time: '11 min', items: [
      { name: 'Apertura de pecho en pared', kind: 'Estiramiento', dose: '40 s por lado', level: 'Base', note: 'Antebrazo en el marco de la puerta, gira el torso al lado contrario. Abre espacio para el arm control alto.' },
      { name: 'Puente torácico apoyado', kind: 'Movilidad', dose: '2 × 8 respiraciones', level: 'Base', note: 'Espalda alta sobre un rulo o cojín firme. Deja caer los brazos abiertos.' },
      { name: 'Flexión con tempo', kind: 'Fuerza', dose: '3 × 8 (3 s bajada)', level: 'Medio', note: 'Baja contando tres, sube en uno. Rodillas al suelo si pierdes la línea de cadera.' },
      { name: 'Apertura con banda', kind: 'Fuerza', dose: '3 × 15', level: 'Base', note: 'Banda al frente, abre los brazos hasta la línea del pecho y vuelve despacio.' }
    ]},
    'Espalda': { time: '13 min', items: [
      { name: 'Gato y vaca', kind: 'Movilidad', dose: '2 × 10 ciclos', level: 'Base', note: 'Sincroniza con la respiración. Despierta toda la columna antes de la sesión.' },
      { name: 'Rotación torácica en cuadrupedia', kind: 'Movilidad', dose: '2 × 8 por lado', level: 'Base', note: 'Mano en la nuca, abre el codo al techo siguiendo con la mirada.' },
      { name: 'Remo con banda', kind: 'Fuerza', dose: '3 × 12', level: 'Medio', note: 'Escápulas juntas al final del recorrido. Sostiene la postura en series largas de brazos.' },
      { name: 'Superman', kind: 'Fuerza', dose: '3 × 12', level: 'Base', note: 'Boca abajo, levanta pecho y muslos a la vez. Sin tensar el cuello.' },
      { name: 'Postura del niño', kind: 'Estiramiento', dose: '60 s', level: 'Base', note: 'Cierre de sesión. Suelta lumbar y hombros.' }
    ]},
    'Piernas': { time: '14 min', items: [
      { name: 'Sentadilla profunda sostenida', kind: 'Movilidad', dose: '3 × 40 s', level: 'Base', note: 'Talones en el suelo, pecho alto. Prepara los niveles bajos del freestyle.' },
      { name: 'Zancada con giro', kind: 'Movilidad', dose: '2 × 8 por lado', level: 'Medio', note: 'Zancada larga y rotación del torso sobre la pierna adelantada.' },
      { name: 'Estiramiento de isquiotibiales', kind: 'Estiramiento', dose: '40 s por pierna', level: 'Base', note: 'Pierna extendida, espalda larga. No redondees la lumbar para llegar más lejos.' },
      { name: 'Elevación de gemelos', kind: 'Fuerza', dose: '3 × 20', level: 'Base', note: 'Sube despacio, baja más despacio. Aguanta los apoyos en punta.' },
      { name: 'Sentadilla búlgara', kind: 'Fuerza', dose: '3 × 10 por pierna', level: 'Avanzado', note: 'Pie trasero elevado. Trabaja el equilibrio que pide el cambio de peso en el cypher.' }
    ]},
    'Core': { time: '9 min', items: [
      { name: 'Plancha frontal', kind: 'Fuerza', dose: '3 × 40 s', level: 'Base', note: 'Cadera en línea, glúteo activo. Sostiene el torso cuando los brazos van rápido.' },
      { name: 'Plancha lateral', kind: 'Fuerza', dose: '3 × 30 s por lado', level: 'Medio', note: 'Hombro sobre el codo. Evita que caiga la cadera.' },
      { name: 'Dead bug', kind: 'Control', dose: '3 × 10 por lado', level: 'Base', note: 'Lumbar pegada al suelo mientras extiendes brazo y pierna contrarios.' },
      { name: 'Giro ruso sin peso', kind: 'Fuerza', dose: '3 × 20', level: 'Medio', note: 'Gira desde el tronco, no desde los brazos. Prepara los cambios de frente.' }
    ]}
  };
  fisTipList = [
    { text: 'Calienta al menos seis minutos antes de cualquier serie de fuerza.' },
    { text: 'Si una zona molesta más de dos sesiones seguidas, avísale a tu instructor antes de seguir cargando.' },
    { text: 'Los estiramientos largos van al final, nunca antes de entrenar potencia.' }
  ];
  dirState = { q: '' };
  dirData = [
    { n: 'Master of Rhythm', c: 'Estados Unidos', pr: '$35 USD/mes', ini: 'MR', r: '5.0', v: '840', h: '@master_of_rhythm', hi: true, sp: ['Advanced', 'Técnica Waack On', 'Mecánica Corporal'], g: ['--pink', '--purple'] },
    { n: 'Brando Hermoso', c: 'España', pr: '$45 USD/mes', ini: 'BH', r: '4.9', v: '1548', h: '@brando_hermoso', hi: true, sp: ['Rolls Rápidos', 'Mecánica Corporal', 'Postura Somática'], g: ['--blue', '--purple'] },
    { n: 'YoonJi Kim', c: 'Corea', pr: '$48 USD/mes', ini: 'YK', r: '4.9', v: '1158', h: '@yoonji_waack', hi: true, sp: ['Musicalidad Rítmica', 'Aislamiento Codos', 'Síncopa Disco'], g: ['--purple', '--blue'] },
    { n: 'Kumari "WaackQueen"', c: 'Estados Unidos', pr: '$38 USD/mes', ini: 'KW', r: '4.8', v: '920', h: '@kumari_waack', hi: true, sp: ['Expresión Teatral', 'Pasarela Disco', 'Carácter Actoral'], g: ['--yellow', '--pink'] },
    { n: 'Ibuki Imata', c: 'Japón', pr: '$42 USD/mes', ini: 'II', r: '4.9', v: '2180', h: '@ibuki_waack_on', hi: false, sp: ['Velocidad Sostenida', 'Freestyle Dinámico', 'BPM Avanzados'], g: ['--pink', '--blue'] },
    { n: 'Lorena "La Waack"', c: 'Colombia', pr: '$29 USD/mes', ini: 'LW', r: '4.7', v: '480', h: '@lorena_lawaack', hi: false, sp: ['Pose Simétrica', 'Vibras de los 70s', 'Elegancia de Brazos'], g: ['--purple', '--pink'] }
  ];
  dirSetQ = (e) => { this.dirState.q = e.target.value; this.forceUpdate(); };

  liveNotifs: AppNotification[] = [];
  unsubNotifs: any = null;
  notifTypeColor: Record<string, string> = {
    like: '--pink', comment: '--blue', follow: '--purple', friend_request: '--purple', friend_accept: '--purple', announcement: '--gold',
  };
  perfState = { tab: 'Todo', upload: false, kind: 'Vídeo', draft: '', following: 342, agTab: 'Próximas', agOpen: 0 };
  agendaData = [
    { id: 1, when: 'next', day: 'JUE 24', hour: '19:00', dur: '60 min', title: 'Cátedra de Waacking — Nivel 2', teacher: 'Lorena "WaackQueen"', mode: 'En vivo', place: 'Sala virtual 1', accent: '--pink', note: 'Bloque de arm control y rotaciones. Lleva rodilleras y agua.' },
    { id: 2, when: 'next', day: 'VIE 25', hour: '11:30', dur: '45 min', title: 'Movilidad de hombro y muñeca', teacher: 'Equipo físico', mode: 'Grabada', place: 'Cuerpo & Estiramientos', accent: '--blue', note: 'Rutina corta previa a la cátedra del sábado.' },
    { id: 3, when: 'next', day: 'SÁB 26', hour: '17:00', dur: '90 min', title: 'Taller de musicalidad — Ibuki Imata', teacher: 'Ibuki Imata', mode: 'En vivo', place: 'Sala virtual 3', accent: '--yellow', note: 'Trae dos temas a 120-128 BPM para trabajar el freno.' },
    { id: 4, when: 'past', day: 'LUN 21', hour: '19:00', dur: '60 min', title: 'Cátedra de Waacking — Nivel 2', teacher: 'Lorena "WaackQueen"', mode: 'En vivo', place: 'Sala virtual 1', accent: '--pink', note: 'Sesión completada. La grabación está disponible 30 días.' },
    { id: 5, when: 'past', day: 'SÁB 19', hour: '12:00', dur: '50 min', title: 'Freestyle Lab guiado', teacher: 'Sesión abierta', mode: 'En vivo', place: 'Sala virtual 2', accent: '--purple', note: 'Sesión completada. Sube tu clip al muro si quieres feedback.' }
  ];
  agPick = (t) => { this.perfState.agTab = t; this.forceUpdate(); };
  agToggle = (id) => { this.perfState.agOpen = this.perfState.agOpen === id ? 0 : id; this.forceUpdate(); };
  perfMediaData = [
    { kind: 'Vídeo', likes: 214, g: ['--pink', '--purple'] },
    { kind: 'Vídeo', likes: 96, g: ['--blue', '--purple'] },
    { kind: 'Foto', likes: 341, g: ['--yellow', '--pink'] },
    { kind: 'Vídeo', likes: 58, g: ['--purple', '--blue'] },
    { kind: 'Foto', likes: 127, g: ['--pink', '--blue'] },
    { kind: 'Vídeo', likes: 402, g: ['--purple', '--pink'] },
    { kind: 'Foto', likes: 73, g: ['--blue', '--yellow'] },
    { kind: 'Vídeo', likes: 185, g: ['--pink', '--purple'] },
    { kind: 'Foto', likes: 240, g: ['--purple', '--yellow'] }
  ];
  perfHighlightData = [
    { label: 'Cyphers', n: '12' }, { label: 'Drills', n: '30' }, { label: 'Batallas', n: '06' },
    { label: 'Clase Lorena', n: '18' }, { label: 'Viajes', n: '09' }
  ];
  perfSuggestData = [
    { handle: '@pipe.waack', meta: 'Nivel 3 · 2 amigos en común', ini: 'PW', g: ['--pink', '--purple'], on: false },
    { handle: '@lu.somatic', meta: 'Instructora · Cuerpo', ini: 'LS', g: ['--blue', '--purple'], on: true },
    { handle: '@dani.tempo', meta: 'Instructor · Ritmo', ini: 'DT', g: ['--yellow', '--pink'], on: false },
    { handle: '@ibuki.imata', meta: 'Instructor · Punking', ini: 'II', g: ['--purple', '--blue'], on: false }
  ];
  perfToggleFollow = (i) => {
    const s = this.perfSuggestData[i];
    s.on = !s.on;
    this.perfState.following += s.on ? 1 : -1;
    this.forceUpdate();
  };
  perfPublishPost = () => {
    const k = this.perfState.kind;
    const pal = k === 'Vídeo' ? ['--pink', '--purple'] : ['--blue', '--yellow'];
    this.perfMediaData.unshift({ kind: k, likes: 0, g: pal });
    this.perfState.upload = false;
    this.perfState.draft = '';
    this.forceUpdate();
  };

  fisRun = { active: false, idx: 0, left: 0, paused: false };
  fisTimer = null;

  fisSecsFor(dose) {
    if (!dose) return 45;
    const s = dose.match(/(\d+)\s*s\b/);
    if (s) return Math.max(15, parseInt(s[1], 10) * (/por (lado|pierna)/.test(dose) ? 2 : 1));
    const m = dose.match(/(\d+)\s*×\s*(\d+)/);
    if (m) return Math.min(120, parseInt(m[1], 10) * parseInt(m[2], 10) * 3);
    return 45;
  }
  fisRunList() {
    const out = [];
    this.fisState.routine.forEach((name) => {
      Object.keys(this.fisData).forEach((k) => {
        this.fisData[k].items.forEach((e) => { if (e.name === name) out.push({ ...e, part: k }); });
      });
    });
    return out;
  }
  fisTick = () => {
    if (this.fisRun.paused) return;
    if (this.fisRun.left > 1) { this.fisRun.left -= 1; this.forceUpdate(); return; }
    this.fisAdvance();
  };
  fisAdvance() {
    const list = this.fisRunList();
    if (this.fisRun.idx + 1 >= list.length) {
      this.fisRun.idx = list.length;
      this.fisClearTimer();
    } else {
      this.fisRun.idx += 1;
      this.fisRun.left = this.fisSecsFor(list[this.fisRun.idx].dose);
    }
    this.forceUpdate();
  }
  fisClearTimer() { if (this.fisTimer) { clearInterval(this.fisTimer); this.fisTimer = null; } }
  fisStartRun = () => {
    const list = this.fisRunList();
    if (!list.length) return;
    this.fisClearTimer();
    this.fisRun = { active: true, idx: 0, left: this.fisSecsFor(list[0].dose), paused: false };
    this.fisTimer = setInterval(this.fisTick, 1000);
    this.forceUpdate();
  };
  fisStopRun = () => { this.fisClearTimer(); this.fisRun.active = false; this.forceUpdate(); };
  fisTogglePause = () => {
    this.fisRun.paused = !this.fisRun.paused;
    this.forceUpdate();
  };
  fisSetPart = (p) => { this.fisState.part = p; this.forceUpdate(); };
  fisToggle = (name) => {
    const r = this.fisState.routine;
    const i = r.indexOf(name);
    if (i === -1) r.push(name); else r.splice(i, 1);
    this.forceUpdate();
  };

  feedState = { filter: 'Todo' };
  feedFilterList = ['Todo', 'Clips', 'Retos', 'Cátedras'];
  feedToolList = [
    { name: 'Imagen', d: '<rect x="3" y="4" width="18" height="16" rx="3"></rect><path d="m4 17 5-5 4 4 3-2 4 4"></path>' },
    { name: 'Video', d: '<rect x="2" y="6" width="14" height="12" rx="3"></rect><path d="m22 8-6 4 6 4Z"></path>' },
    { name: 'Audio', d: '<rect x="9" y="3" width="6" height="11" rx="3"></rect><path d="M5 11a7 7 0 0 0 14 0M12 18v3"></path>' },
    { name: 'Encuesta', d: '<rect x="3" y="4" width="18" height="16" rx="3"></rect><path d="M7 15V9M12 15v-3M17 15v-5"></path>' },
    { name: 'Reto', d: '<path d="M4 4v16"></path><path d="M4 5h12l-2 3 2 3H4"></path>' },
    { name: 'Quiz', d: '<circle cx="12" cy="12" r="9"></circle><path d="M9.6 9.3a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .9-1 1.6M12 17h.01"></path>' },
    { name: 'Cuenta atrás', d: '<path d="M6 3h12M6 21h12"></path><path d="M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"></path>' },
    { name: 'Programar', d: '<rect x="3" y="5" width="18" height="16" rx="3"></rect><path d="M3 10h18M8 3v4M16 3v4"></path>' },
    { name: 'Propina', d: '<circle cx="12" cy="12" r="9"></circle><path d="M14.5 9.3A2.7 2.7 0 0 0 12 8c-1.5 0-2.5.8-2.5 2s1 1.9 2.5 2 2.5.8 2.5 2-1 2-2.5 2a2.7 2.7 0 0 1-2.5-1.3M12 6.4v11.2"></path>' },
    { name: 'Mencionar', d: '<circle cx="12" cy="12" r="4"></circle><path d="M16 8v5a2.8 2.8 0 0 0 5 0v-1a9 9 0 1 0-3.6 7.2"></path>' }
  ];
  feedPostData = [
    { name: 'PIPE', handle: '@pipe.waack', time: 'hace unos segundos', text: 'Take crudo del drill de muñeca de hoy. Sin corrección todavía, solo el pulso a 128.', tags: 'Añadir etiquetas', likes: '128', comments: '14', g: ['--pink', '--purple'] },
    { name: 'Lu Somatic', handle: '@lu.somatic', time: 'hace 2 h', text: 'Recordatorio: antes del cypher, tres minutos de hombro. El arm control se cae cuando el trapecio está frío.', tags: '#calentamiento #armcontrol', likes: '341', comments: '27', g: ['--blue', '--purple'] }
  ];
  feedSetFilter = (f) => { this.feedState.filter = f; this.forceUpdate(); };

  tvState = { connected: false, cat: 'Todo' };
  tvCatList = ['Todo', 'Clases abiertas', 'Batallas', 'Historia del waacking', 'Musicalidad', 'Detrás de cámara'];
  tvVideoData = [
    { title: 'Batalla final: cypher de septiembre', channel: 'Waack On Studio', meta: '32K vistas · hace 5 días', dur: '12:04', g: ['--pink', '--purple'] },
    { title: 'Rutina de brazos antes de entrenar', channel: 'Lu Somatic', meta: '8.1K vistas · hace 1 semana', dur: '07:19', g: ['--blue', '--purple'] },
    { title: 'Punking 70s: de dónde viene el arm control', channel: 'Archivo Waack On', meta: '21K vistas · hace 3 semanas', dur: '24:50', g: ['--purple', '--pink'] },
    { title: 'Escuchar el hi-hat: ejercicio de conteo', channel: 'Dani Tempo', meta: '5.6K vistas · hace 4 días', dur: '09:32', g: ['--yellow', '--pink'] },
    { title: 'Sesión de espejo con corrección en vivo', channel: 'Waack On Studio', meta: '11K vistas · hace 2 semanas', dur: '18:07', g: ['--blue', '--pink'] },
    { title: 'Mi primer año haciendo waacking', channel: 'Sofi Freestyle', meta: '3.2K vistas · hace 6 días', dur: '05:44', g: ['--purple', '--blue'] },
    { title: 'Cómo grabar tus takes con una sola luz', channel: 'Detrás del Lab', meta: '6.9K vistas · hace 1 mes', dur: '14:21', g: ['--yellow', '--purple'] },
    { title: 'Freestyle de 60 segundos sin repetir paso', channel: 'Kim Wrist', meta: '17K vistas · hace 9 días', dur: '02:58', g: ['--pink', '--blue'] }
  ];
  tvQueueData = [
    { title: 'Calentamiento de hombros, 6 minutos', channel: 'Lu Somatic', meta: '6:12 · hace 3 días', dur: '06:12', g: ['--blue', '--purple'] },
    { title: 'Drill de puntos sobre house clásico', channel: 'Dani Tempo', meta: '8:40 · hace 1 semana', dur: '08:40', g: ['--yellow', '--pink'] },
    { title: 'Cypher abierto: ronda de invitados', channel: 'Waack On Studio', meta: '22:15 · hace 2 semanas', dur: '22:15', g: ['--pink', '--purple'] },
    { title: 'Entrevista: la escena en Bogotá', channel: 'Archivo Waack On', meta: '31:02 · hace 1 mes', dur: '31:02', g: ['--purple', '--blue'] },
    { title: 'Estiramiento para después del take', channel: 'Lu Somatic', meta: '11:27 · hace 4 días', dur: '11:27', g: ['--blue', '--pink'] }
  ];
  tvChannelData = [
    { name: 'Waack On Studio', subs: '12.1K suscriptores', g: ['--pink', '--purple'] },
    { name: 'Lu Somatic', subs: '4.8K suscriptores', g: ['--blue', '--purple'] },
    { name: 'Dani Tempo', subs: '2.3K suscriptores', g: ['--yellow', '--pink'] },
    { name: 'Archivo Waack On', subs: '9.6K suscriptores', g: ['--purple', '--blue'] }
  ];
  tvGrad(g) { return 'linear-gradient(140deg, color-mix(in srgb, var(' + g[0] + ') 82%, #0D0A12 18%), color-mix(in srgb, var(' + g[1] + ') 58%, #0D0A12 42%))'; }
  tvSetCat = (c) => { this.tvState.cat = c; this.forceUpdate(); };
  tvToggleConnect = () => { this.tvState.connected = !this.tvState.connected; this.forceUpdate(); };

  chatState = { open: false, roomId: null, query: '' };

  toggleChat = () => {
    this.chatState = Object.assign({}, this.chatState, { open: !this.chatState.open });
    this.forceUpdate();
  };

  closeChat = () => {
    this.chatState = Object.assign({}, this.chatState, { open: false, roomId: null });
    this.forceUpdate();
  };

  openRoom(id) {
    this.chatState = Object.assign({}, this.chatState, { roomId: id });
    this.forceUpdate();
  }

  backToRooms = () => {
    this.chatState = Object.assign({}, this.chatState, { roomId: null });
    this.forceUpdate();
  };

  onChatQuery = (e) => {
    this.chatState = Object.assign({}, this.chatState, { query: e.target.value });
    this.forceUpdate();
  };

  buildChatRooms() {
    const q = this.chatState.query.trim().toLowerCase();
    return this.chatRooms
      .filter((r) => !q || r.name.toLowerCase().indexOf(q) > -1 || r.topic.toLowerCase().indexOf(q) > -1)
      .map((r) => ({
        key: r.id,
        name: r.name,
        topic: r.topic,
        last: r.last,
        time: r.time,
        members: r.members + ' miembros',
        isLive: !!r.live,
        hasUnread: r.unread > 0,
        unread: String(r.unread),
        open: () => this.openRoom(r.id),
        avatar: 'width:40px;height:40px;flex:0 0 40px;border-radius:14px;border:1px solid var(--hair);background:linear-gradient(135deg, color-mix(in oklch, ' + r.c1 + ' 72%, #fff 8%), color-mix(in oklch, ' + r.c2 + ' 70%, #000 18%))'
      }));
  }

  activeRoom() {
    const r = this.chatRooms.filter((x) => x.id === this.chatState.roomId)[0];
    if (!r) return null;
    return {
      name: r.name,
      topic: r.topic,
      members: r.members + ' miembros',
      avatar: 'width:36px;height:36px;flex:0 0 36px;border-radius:12px;border:1px solid var(--hair);background:linear-gradient(135deg, color-mix(in oklch, ' + r.c1 + ' 72%, #fff 8%), color-mix(in oklch, ' + r.c2 + ' 70%, #000 18%))'
    };
  }

  loginForm = { email: '', pass: '', error: '', info: '', mode: 'login' };

  setLoginField(k, v) {
    this.loginForm = Object.assign({}, this.loginForm, { [k]: v, error: '', info: '' });
    this.forceUpdate();
  }

  submitLogin = async () => {
    const { email, pass } = this.loginForm;
    let error = '';
    if (!/^[^ @]+@[^ @]+[.][^ @]+$/.test(email)) error = 'Introduce un correo válido.';
    else if (this.loginForm.mode === 'signup' && !(pass.length >= 9 && /[a-z]/.test(pass) && /[A-Z]/.test(pass) && /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass))) error = 'La contraseña debe tener mínimo 9 caracteres, con mayúscula, minúscula, número y símbolo (ej. Waack#2026x).';
    else if (!pass) error = 'Escribe tu contraseña.';
    if (!error && !firebaseConfigured) error = 'Firebase no está configurado (falta .env.local).';
    if (error) {
      this.loginForm = Object.assign({}, this.loginForm, { error });
      this.forceUpdate();
      return;
    }
    try {
      if (this.loginForm.mode === 'signup') await createUserWithEmailAndPassword(auth, email, pass);
      else await signInWithEmailAndPassword(auth, email, pass);
    } catch (e: any) {
      const MSG: any = {
        'auth/invalid-credential': 'Correo o contraseña incorrectos.',
        'auth/wrong-password': 'Correo o contraseña incorrectos.',
        'auth/user-not-found': 'Correo o contraseña incorrectos.',
        'auth/email-already-in-use': 'Ese correo ya tiene una cuenta (quizá creada con Google). Pulsa «Continuar con Google» o inicia sesión.',
        'auth/weak-password': 'La contraseña es muy débil.',
        'auth/password-does-not-meet-requirements': 'La contraseña debe tener mínimo 9 caracteres, con mayúscula, minúscula, número y símbolo.',
        'auth/invalid-email': 'Introduce un correo válido.',
        'auth/network-request-failed': 'Sin conexión con Firebase. Revisa tu internet.',
        'auth/unauthorized-domain': 'Este dominio no está autorizado en Firebase Authentication.',
        'auth/too-many-requests': 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
        'auth/operation-not-allowed': 'El acceso con correo no está habilitado en Firebase.',
      };
      this.loginForm = Object.assign({}, this.loginForm, { error: MSG[e?.code] || ('No se pudo completar (' + (e?.code || e?.message || 'error desconocido') + ').') });
      this.forceUpdate();
    }
  };

  googleLogin = async () => {
    if (!firebaseConfigured) {
      this.loginForm = Object.assign({}, this.loginForm, { error: 'Firebase no está configurado (falta .env.local).' });
      this.forceUpdate();
      return;
    }
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e: any) {
      if (e?.code === 'auth/popup-closed-by-user' || e?.code === 'auth/cancelled-popup-request') return;
      const MSG: any = {
        'auth/popup-blocked': 'Tu navegador bloqueó la ventana de Google. Permite las ventanas emergentes para waack-on.com (icono junto a la barra de direcciones) y vuelve a pulsar. Si usas un navegador integrado de otra app, abre waack-on.com en Chrome o Safari.',
        'auth/unauthorized-domain': 'Este dominio no está autorizado en Firebase Authentication.',
        'auth/network-request-failed': 'Sin conexión con Firebase. Revisa tu internet.',
      };
      this.loginForm = Object.assign({}, this.loginForm, { error: MSG[e?.code] || ('No se pudo entrar con Google (' + (e?.code || 'error desconocido') + ').'), info: '' });
      this.forceUpdate();
    }
  };

  toggleLoginMode = () => {
    this.setState({ view: 'register' });
  };

  forgotPassword = async () => {
    const { email } = this.loginForm;
    if (!/^[^ @]+@[^ @]+[.][^ @]+$/.test(email)) {
      this.loginForm = Object.assign({}, this.loginForm, { error: 'Escribe tu correo arriba y vuelve a pulsar «Forgot Password?».', info: '' });
    } else if (!firebaseConfigured) {
      this.loginForm = Object.assign({}, this.loginForm, { error: 'Firebase no está configurado (falta .env.local).', info: '' });
    } else {
      try { await sendPasswordResetEmail(auth, email); } catch (e) {}
      // Mismo mensaje exista o no la cuenta, para no revelar qué correos están registrados.
      this.loginForm = Object.assign({}, this.loginForm, { error: '', info: 'Si existe una cuenta con ese correo, te enviamos un enlace para restablecer la contraseña.' });
    }
    this.forceUpdate();
  };

  logout = async () => {
    this.setState({ acct: false });
    try { await signOut(auth); } catch (e) {}
  };

  teacherData = [
    { id: 'brando', name: 'Brando Hermoso', role: 'Fundamentos & Biomecánica', plan: 'Mensual · renueva 12 oct', c1: 'var(--blue)', c2: 'var(--purple)', courses: [
      { t: 'Biomecánica & Fundamentos de Poses', d: 'Alineación articular, fijación de poses geométricas y disociación de torso.', lvl: 'Nivel 1', pct: 75 },
      { t: 'Rolls de Muñeca · Serie de Velocidad', d: 'Progresión de 96 a 128 BPM con control de trayectoria y freno.', lvl: 'Nivel 1', pct: 40 }
    ] },
    { id: 'lorena', name: 'Lorena "WaackQueen"', role: 'Speed-Waack & Síncopas', plan: 'Anual · renueva 3 mar', c1: 'var(--pink)', c2: 'var(--purple)', courses: [
      { t: 'Speed-Waack & Síncopas Avanzadas', d: 'Velocidad articular y precisión para marcar los platillos y el contratiempo.', lvl: 'Nivel 2', pct: 30 },
      { t: 'Battle Training · Rondas de 60 s', d: 'Estructura de ronda, respuesta al DJ y cierre de frase.', lvl: 'Nivel 2', pct: 0 }
    ] },
    { id: 'ibuki', name: 'Ibuki Imata', role: 'Overhead Rolls & Aislamiento', plan: 'Mensual · renueva 28 sep', c1: 'var(--purple)', c2: 'var(--blue)', courses: [
      { t: 'Overhead Rolls & Aislamiento de Codos', d: 'Rotación limpia en descenso de codos sin tensionar el trapecio superior.', lvl: 'Nivel 2', pct: 100 }
    ] }
  ];

  lockedData = [
    { name: 'Jessica Sonor', role: 'Dramatismo, Acting & Musicalidad Disco', price: '19 € / mes', c1: 'var(--yellow)', c2: 'var(--pink)' },
    { name: 'Yoonji Kim', role: 'Musicalidad K-Groove', price: '15 € / mes', c1: 'var(--blue)', c2: 'var(--pink)' }
  ];

  teacherFilter = 'all';

  pickTeacher(id) { this.teacherFilter = id; this.forceUpdate(); }

  avatarStyle(a, b, size) {
    return 'width:' + size + 'px;height:' + size + 'px;flex:0 0 ' + size + 'px;border-radius:50%;border:2px solid var(--hair);background:linear-gradient(135deg, color-mix(in oklch, ' + a + ' 72%, #fff 8%), color-mix(in oklch, ' + b + ' 70%, #000 18%))';
  }

  buildTeacherTabs() {
    const base = 'padding:10px 18px;border-radius:999px;font-size:12px;cursor:pointer;transition:transform .2s cubic-bezier(.2,.85,.25,1), color .2s ease;transform-style:preserve-3d;';
    const on = base + 'font-weight:700;color:#fff;background:var(--blue);box-shadow:0 8px 18px -8px var(--blue), inset 0 1px 0 rgba(255,255,255,.3);';
    const off = base + 'font-weight:600;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);box-shadow:var(--lg-edge);';
    const tabs = [{ id: 'all', label: 'Todos (' + this.teacherData.length + ')' }].concat(
      this.teacherData.map((t) => ({ id: t.id, label: t.name }))
    );
    return tabs.map((t) => ({
      key: t.id,
      label: t.label,
      style: this.teacherFilter === t.id ? on : off,
      pick: () => this.pickTeacher(t.id)
    }));
  }

  buildTeacherSections() {
    const list = this.teacherFilter === 'all'
      ? this.teacherData
      : this.teacherData.filter((t) => t.id === this.teacherFilter);
    return list.map((t, ti) => ({
      key: t.id,
      name: t.name,
      role: t.role,
      plan: t.plan,
      count: t.courses.length === 1 ? '1 curso' : t.courses.length + ' cursos',
      avatar: this.avatarStyle(t.c1, t.c2, 46),
      courses: t.courses.map((c, ci) => ({
        key: t.id + ci,
        title: c.t,
        desc: c.d,
        meta: t.name + ' · ' + c.lvl,
        pctLabel: c.pct === 0 ? 'Sin empezar' : c.pct + '%',
        bar: 'width:' + c.pct + '%;height:100%;background:' + (c.pct === 100 ? 'var(--blue)' : 'var(--blue)'),
        cover: 'height:160px;background:linear-gradient(135deg, color-mix(in oklch, ' + t.c1 + ' 60%, #000 18%), color-mix(in oklch, ' + t.c2 + ' 55%, #000 30%))',
        card: 'border-radius:24px;overflow:hidden;border:1px solid var(--hair);background:var(--glass);backdrop-filter:var(--lg-blur);-webkit-backdrop-filter:var(--lg-blur);cursor:pointer;opacity:1;transform-style:preserve-3d;transition:transform .26s cubic-bezier(.2,.85,.25,1), border-color .26s ease;animation:rise3d .8s cubic-bezier(.2,.85,.25,1) ' + (0.06 * (ti * 2 + ci)).toFixed(2) + 's backwards'
      }))
    }));
  }

  buildLocked() {
    return this.lockedData.map((l, i) => ({
      key: 'l' + i,
      name: l.name,
      role: l.role,
      price: l.price,
      avatar: this.avatarStyle(l.c1, l.c2, 44)
    }));
  }

  reelData = [
    { user: '@brando_waack_live', caption: 'Laboratorio de velocidad · 128 BPM', music: 'Chic — Le Freak', live: true, likes: 1284, comments: 96, c1: 'var(--pink)', c2: 'var(--purple)' },
    { user: '@lorena_waackqueen', caption: 'Síncopas en contratiempo', music: 'Cheryl Lynn — Got To Be Real', likes: 862, comments: 41, c1: 'var(--blue)', c2: 'var(--purple)' },
    { user: '@ibuki_imata', caption: 'Overhead rolls a 135 BPM', music: 'Sylvester — Dance', nuevo: true, likes: 2310, comments: 188, c1: 'var(--yellow)', c2: 'var(--pink)' },
    { user: '@yoonji_kim', caption: 'Musicalidad K-Groove', music: 'Brass Construction — Movin', likes: 1540, comments: 73, c1: 'var(--purple)', c2: 'var(--blue)' },
    { user: '@sara_waack', caption: 'Reto semanal #34', music: 'Loleatta Holloway — Hit & Run', likes: 604, comments: 29, c1: 'var(--pink)', c2: 'var(--yellow)' },
    { user: '@elena_pose', caption: 'Posing de alta costura', music: 'Grace Jones — Pull Up', likes: 998, comments: 57, c1: 'var(--blue)', c2: 'var(--pink)' }
  ];

  reelState = { liked: {}, muted: true, feedIndex: 0, tab: 'Para ti' };
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
  }

  reelUploadOpen = false;
  reelUploadFile: File | null = null;
  reelUploadCaption = '';
  reelUploadMusic = '';
  reelUploadBusy = false;
  reelUploadPct: number | null = null;
  reelUploadErr = '';
  reelUploadShow = () => { this.reelUploadOpen = true; this.forceUpdate(); };
  reelUploadHide = () => { if (!this.reelUploadBusy) { this.reelUploadOpen = false; this.reelUploadErr = ''; this.forceUpdate(); } };
  reelPickFile = () => { (document.getElementById('reel-upload-input') as HTMLInputElement | null)?.click(); };
  reelOnFile = (e: any) => {
    const f = e?.target?.files?.[0];
    if (e?.target) e.target.value = '';
    if (f) { this.reelUploadFile = f; this.reelUploadErr = ''; this.forceUpdate(); }
  };
  reelCaptionChange = (e: any) => { this.reelUploadCaption = e.target.value; this.forceUpdate(); };
  reelMusicChange = (e: any) => { this.reelUploadMusic = e.target.value; this.forceUpdate(); };
  reelSubmitUpload = async () => {
    const user = this.state.user;
    if (!user || this.reelUploadBusy) return;
    if (!this.reelUploadFile) { this.reelUploadErr = 'Elige un video para publicar.'; this.forceUpdate(); return; }
    this.reelUploadBusy = true; this.reelUploadErr = ''; this.reelUploadPct = 0; this.forceUpdate();
    try {
      await publishReel({
        uid: user.uid,
        ownerHandle: this.myProfile?.handle ? '@' + this.myProfile.handle : '@' + (user.displayName || 'usuario').toLowerCase().replace(/\s+/g, '.'),
        caption: this.reelUploadCaption, music: this.reelUploadMusic, file: this.reelUploadFile,
        onProgress: (pct: number) => { this.reelUploadPct = pct; this.forceUpdate(); },
      });
      this.reelUploadOpen = false; this.reelUploadFile = null; this.reelUploadCaption = ''; this.reelUploadMusic = '';
    } catch (e: any) { this.reelUploadErr = e?.message || 'No se pudo publicar el reel. Inténtalo de nuevo.'; }
    this.reelUploadBusy = false; this.reelUploadPct = null; this.forceUpdate();
  };

  fmt(n) { return n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'K' : String(n); }

  toggleLike(i) {
    const liked = Object.assign({}, this.reelState.liked);
    liked[i] = !liked[i];
    this.reelState = Object.assign({}, this.reelState, { liked });
    this.forceUpdate();
  }

  setReelTab(t) {
    this.reelState = Object.assign({}, this.reelState, { tab: t });
    this.forceUpdate();
  }

  toggleMute = () => {
    this.reelState = Object.assign({}, this.reelState, { muted: !this.reelState.muted });
    this.forceUpdate();
  };

  feedRef = (el) => { this.feedEl = el; };

  scrollReel = (dir) => {
    const el = this.feedEl;
    if (!el) return;
    el.scrollBy({ top: dir * el.clientHeight, behavior: 'smooth' });
  };

  buildReels() {
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
        hasVideo: !!r.mediaUrl,
        videoUrl: r.mediaUrl,
        onLike: () => this.reelToggleLike(rr),
        heart: on
          ? 'width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--pink);color:#fff;border:1px solid rgba(255,255,255,.35);cursor:pointer;transition:transform .18s cubic-bezier(.2,.85,.25,1);transform:scale(1.08)'
          : 'width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.14);color:#fff;border:1px solid rgba(255,255,255,.28);backdrop-filter:blur(14px);cursor:pointer;transition:transform .18s cubic-bezier(.2,.85,.25,1)',
        heartFill: on ? 'currentColor' : 'none',
        bg: 'position:absolute;inset:0;background:linear-gradient(150deg, color-mix(in oklch, ' + r.c1 + ' 58%, #000 22%), color-mix(in oklch, ' + r.c2 + ' 58%, #000 38%))',
        avatar: 'width:38px;height:38px;border-radius:50%;flex:0 0 auto;border:2px solid rgba(255,255,255,.85);background:linear-gradient(135deg, color-mix(in oklch, ' + r.c1 + ' 70%, #fff 10%), color-mix(in oklch, ' + r.c2 + ' 70%, #000 20%))'
      };
    });
  }

  /* ---------- Panel de Instructor ---------- */
  insTab = 'dashboard';
  insStudent = null;

  insTabs = [
    { id: 'dashboard', l: 'Dashboard' },
    { id: 'students', l: 'Alumnos', b: '5' },
    { id: 'classes', l: 'Clases & Directos' },
    { id: 'finances', l: 'Finanzas' },
    { id: 'documents', l: 'Documentos PDF', b: '2' },
    { id: 'methodology', l: 'Metodología & Lab' },
    { id: 'publish', l: 'Publicar Cursos' },
    { id: 'podcasts', l: 'Podcasts' },
    { id: 'overview', l: 'Ventas & Actividad' },
    { id: 'promotion', l: 'Ajustes & Destacados' }
  ];

  students = [
    { id: 'st-1', n: 'Ana "Waack Queen" Silva', lv: 'Intermedio', last: 'Ayer', mail: 'ana.queen@dance.com', pct: 85, c1: 'var(--pink)', c2: 'var(--purple)' },
    { id: 'st-2', n: 'Ji-Won Kim', lv: 'Principiante', last: 'Hace 2 horas', mail: 'jiwon@waack.kr', pct: 55, c1: 'var(--blue)', c2: 'var(--purple)' },
    { id: 'st-3', n: 'Yuki Sato', lv: 'Avanzado', last: 'Hace 3 días', mail: 'yuki.s@dance.jp', pct: 35, c1: 'var(--yellow)', c2: 'var(--pink)' },
    { id: 'st-4', n: 'Carlos Mendoza', lv: 'Intermedio', last: 'Hoy', mail: 'carlos.m@waacking.es', pct: 62, c1: 'var(--purple)', c2: 'var(--blue)' },
    { id: 'st-5', n: 'Melissa Roberts', lv: 'Principiante', last: 'Hace 5 minutos', mail: 'mel@roberts.com', pct: 18, c1: 'var(--pink)', c2: 'var(--yellow)' }
  ];

  insStats = [
    { v: '2,890', l: 'Alumnos alcanzados', d: '+12% vs. mes previo', c: 'var(--pink)' },
    { v: '1,387', l: 'Lecciones completadas', d: '+8% vs. mes previo', c: 'var(--blue)' },
    { v: '4,017', l: 'Notificaciones enviadas', d: '+3% vs. mes previo', c: 'var(--yellow)' },
    { v: '2,033', l: 'Ventas de cursos', d: '+21% vs. mes previo', c: 'var(--purple)' }
  ];

  // El rol real viene de la API (/me); si la API no responde, se usa el rol del perfil de Firestore (solo un admin puede cambiarlo).
  isDocente() { return !!this.subs.docente || ['instructor', 'estudio', 'admin'].includes(this.myProfile?.role); }

  insEarnings = null;
  insEarningsBusy = false;
  insEarningsErr = '';

  async loadInsEarnings() {
    if (this.insEarningsBusy) return;
    this.insEarningsBusy = true; this.insEarningsErr = ''; this.forceUpdate();
    try { this.insEarnings = await getInstructorEarnings(); }
    catch (e) { this.insEarningsErr = e.message || 'No se pudo cargar tu información de pagos.'; }
    this.insEarningsBusy = false; this.forceUpdate();
  }

  fmtCents(cents, currency) {
    if (cents == null || !currency) return '—';
    try { return new Intl.NumberFormat('es-ES', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100); }
    catch { return (cents / 100).toFixed(2) + ' ' + currency.toUpperCase(); }
  }

  sumMinor(list) { return Array.isArray(list) && list.length ? list.reduce((n, x) => n + x.amount, 0) : (list ? 0 : null); }

  buildInsStudentMgmt() {
    return this.students.slice(0, 3).map((st, i) => ({
      key: st.id,
      name: st.n,
      fraction: Math.round(st.pct / 10) + ' / 10',
      pctLabel: 'Progreso ' + st.pct + '%',
      bar: 'width:' + st.pct + '%;height:100%;border-radius:999px;background:linear-gradient(90deg,' + st.c1 + ',' + st.c2 + ')'
    }));
  }

  buildInsCommHub() {
    return this.students.slice(0, 3).map((st) => ({
      key: st.id,
      name: st.n,
      level: st.lv,
      last: st.last,
      avatar: 'width:36px;height:36px;flex:0 0 36px;border-radius:13px;border:1px solid var(--hair);background:linear-gradient(135deg, color-mix(in oklch, ' + st.c1 + ' 72%, #fff 8%), color-mix(in oklch, ' + st.c2 + ' 70%, #000 18%))'
    }));
  }

  setInsTab(id) {
    this.insTab = id;
    if (id === 'finances' && this.isDocente() && !this.insEarnings) this.loadInsEarnings();
    this.forceUpdate();
  }
  setStudent(id) { this.insStudent = this.insStudent === id ? null : id; this.forceUpdate(); }

  buildInsTabs() {
    const base = 'display:inline-flex;align-items:center;gap:8px;padding:11px 18px;border-radius:999px;font-size:12.5px;cursor:pointer;white-space:nowrap;transition:color .18s ease, border-color .18s ease;';
    const on = base + 'font-weight:700;color:#14111A;background:var(--pink);box-shadow:0 8px 18px -8px var(--pink), inset 0 1px 0 rgba(255,255,255,.3);';
    const off = base + 'font-weight:600;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);box-shadow:var(--lg-edge);';
    return this.insTabs.map((t) => ({
      key: t.id,
      label: t.l,
      badge: t.b || '',
      hasBadge: !!t.b,
      style: this.insTab === t.id ? on : off,
      pick: () => this.setInsTab(t.id)
    }));
  }

  buildStudentChips() {
    const base = 'display:inline-flex;align-items:center;gap:8px;padding:9px 15px;border-radius:999px;font-family:"Geist Mono",monospace;font-size:10.5px;font-weight:700;cursor:pointer;white-space:nowrap;';
    const all = {
      key: 'all',
      name: 'Todos (5)',
      pick: () => { this.insStudent = null; this.forceUpdate(); },
      style: base + (this.insStudent === null
        ? 'color:#1A1400;background:linear-gradient(90deg,var(--gold-hi),var(--gold-lo));box-shadow:inset 0 1px 0 rgba(255,255,255,.5);'
        : 'color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);')
    };
    return [all].concat(this.students.map((s) => ({
      key: s.id,
      name: s.n,
      pick: () => this.setStudent(s.id),
      style: base + (this.insStudent === s.id
        ? 'color:#fff;background:var(--purple);'
        : 'color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);')
    })));
  }

  buildInsStats() {
    return this.insStats.map((s, i) => ({
      key: 's' + i,
      value: s.v,
      label: s.l,
      delta: s.d,
      dot: 'width:38px;height:38px;border-radius:13px;background:' + s.c + ';box-shadow:0 8px 20px -8px ' + s.c,
      deltaStyle: 'font-family:"Geist Mono",monospace;font-size:10.5px;margin-top:10px;color:' + s.c,
      card: 'padding:24px;border-radius:24px;border:1px solid var(--hair);background:var(--glass);backdrop-filter:var(--lg-blur);-webkit-backdrop-filter:var(--lg-blur);box-shadow:var(--lg-edge);opacity:1;transform-style:preserve-3d;transition:transform .26s cubic-bezier(.2,.85,.25,1);animation:rise3d .8s cubic-bezier(.2,.85,.25,1) ' + (0.07 * i).toFixed(2) + 's backwards'
    }));
  }

  buildStudentRows() {
    const list = this.insStudent ? this.students.filter((s) => s.id === this.insStudent) : this.students;
    return list.map((s) => ({
      key: s.id,
      name: s.n,
      mail: s.mail,
      level: s.lv,
      last: s.last,
      pct: s.pct + '%',
      bar: 'width:' + s.pct + '%;height:100%;border-radius:999px;background:' + (s.pct > 60 ? 'var(--blue)' : 'var(--yellow)'),
      avatar: 'width:40px;height:40px;flex:0 0 40px;border-radius:14px;border:1px solid var(--hair);background:linear-gradient(135deg, color-mix(in oklch, ' + s.c1 + ' 72%, #fff 8%), color-mix(in oklch, ' + s.c2 + ' 70%, #000 18%))'
    }));
  }

  insBpm = 124;
  insLive = false;
  setInsBpm = (e) => { this.insBpm = Number(e.target.value); this.forceUpdate(); };
  toggleInsLive = () => { this.liveToggle(); };

  insClasses = [
    { t: 'Fundamentos · Grupo A', when: 'Hoy · 19:00 CET', who: '18 inscritos', state: 'En vivo', live: true },
    { t: 'Speed-Waack · Nivel 2', when: 'Jueves · 20:00 CET', who: '12 inscritos', state: 'Programada' },
    { t: 'Repaso de batalla', when: 'Sábado · 11:00 CET', who: '7 inscritos', state: 'Programada' }
  ];

  buildInsClasses() {
    return this.insClasses.map((c, i) => ({
      key: 'c' + i,
      title: c.t,
      when: c.when,
      who: c.who,
      state: c.state,
      isLive: !!c.live,
      badge: 'padding:5px 11px;border-radius:999px;font-family:"Geist Mono",monospace;font-size:8.5px;font-weight:700;letter-spacing:.12em;white-space:nowrap;text-transform:uppercase;' + (c.live ? 'background:var(--pink);color:#fff;' : 'border:1px solid var(--hair);color:var(--ink-3);')
    }));
  }

  insDocs = [
    { t: 'Manual de Fundamentos v3', m: '48 páginas · actualizado hace 2 días', st: 'Publicado' },
    { t: 'Guía de calentamiento somático', m: '12 páginas · borrador', st: 'Borrador' },
    { t: 'Pauta de batalla 1vs1', m: '6 páginas · pendiente de revisión', st: 'En revisión' }
  ];

  insCourses = [
    { t: 'Biomecánica & Fundamentos', m: '9 lecciones · 312 alumnos', st: 'Publicado' },
    { t: 'Overhead Rolls', m: '6 lecciones · 128 alumnos', st: 'Publicado' },
    { t: 'Taller de musicalidad disco', m: '4 lecciones · sin publicar', st: 'Borrador' }
  ];

  insPods = [
    { t: 'Historia del Waacking', m: 'Ep. 12 · 44 min · 1.2K escuchas' },
    { t: 'Cómo preparar una batalla', m: 'Ep. 13 · 38 min · 860 escuchas' },
    { t: 'Sobre el miedo al cypher', m: 'Ep. 14 · grabando' }
  ];

  simpleList(arr) {
    return arr.map((x, i) => ({
      key: 'i' + i,
      title: x.t,
      meta: x.m,
      state: x.st || '',
      hasState: !!x.st,
      badge: 'padding:5px 11px;border-radius:999px;font-family:"Geist Mono",monospace;font-size:8.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap;' + (x.st === 'Publicado' ? 'background:var(--blue);color:#fff;' : 'border:1px solid var(--hair);color:var(--ink-3);')
    }));
  }

  adData = [
    { k: 'Batalla', t: 'Gran Batalla Waack On 2026', m: 'Inscripciones abiertas · 32 plazas', c1: 'var(--blue)', c2: 'var(--purple)' },
    { k: 'Masterclass', t: 'Yoon Ji Kim · K-Groove', m: '15 oct · plazas limitadas', c1: 'var(--purple)', c2: 'var(--pink)' },
    { k: 'Tienda', t: 'Guantes de escenario', m: 'Envío gratis a España', c1: 'var(--pink)', c2: 'var(--yellow)' },
    { k: 'Jam', t: 'Jam & Sesión Rítmica', m: '7 oct · DJ en directo', c1: 'var(--yellow)', c2: 'var(--pink)' },
    { k: 'Podcast', t: 'Historia del Waacking', m: 'Nuevo episodio disponible', c1: 'var(--blue)', c2: 'var(--pink)' },
    { k: 'Festival', t: 'Iberian Waack Weekend', m: 'Lisboa · 21–23 nov', c1: 'var(--purple)', c2: 'var(--blue)' }
  ];

  buildAds(skin, blur) {
    const base = this.adData.concat(this.adData);
    return base.map((a, i) => ({
      key: 'ad' + i,
      kind: a.k,
      title: a.t,
      meta: a.m,
      thumb: 'width:44px;height:44px;flex:0 0 44px;border-radius:14px;background:linear-gradient(135deg, color-mix(in oklch, ' + a.c1 + ' 70%, #000 10%), color-mix(in oklch, ' + a.c2 + ' 66%, #000 24%))',
      card: 'display:flex;align-items:center;gap:12px;width:262px;flex:0 0 262px;padding:12px 14px;border-radius:18px;cursor:pointer;transform-style:preserve-3d;transition:transform .24s cubic-bezier(.2,.85,.25,1);' + (skin || '') + (blur || '')
    }));
  }

  hero(v) {
    const map = {
      dashboard: { kicker: 'Tu sesión de hoy', accent: 'var(--blue)', title: 'Nivel 1 · Fundamentos & Arm Rolls', sub: 'Continúa donde lo dejaste. Te faltan dos lecciones para desbloquear Nivel 2: Ritmo & Expresión Disco.', cta: 'Continuar entrenamiento' },
      cursos: { kicker: 'Entrenar', accent: 'var(--blue)', title: 'Clases & Cursos', sub: 'Tus cursos separados por instructor. Cada suscripción activa mantiene su propia cátedra y su progreso.', cta: 'Explorar cátedras' },
      entrenamiento: { kicker: 'Entrenar', accent: 'var(--blue)', title: 'Laboratorio Freestyle', sub: 'Elige un drill, fija el tempo y suelta el cuerpo. El laboratorio no corrige: solo marca el pulso para que tú improvises.', cta: 'Empezar sesión libre' },
      fisico: { kicker: 'Entrenar', accent: 'var(--blue)', title: 'Cuerpo & Estiramientos', sub: 'Rutinas de estiramiento y entrenamiento físico por zona del cuerpo. Arma tu sesión y ejecútala antes o después de bailar.', cta: 'Empezar rutina' },
      perfil: { kicker: 'Comunidad', accent: 'var(--pink)', title: 'Mi perfil', sub: 'Tu archivo público: los clips y fotos que compartes, y los bailarines a los que sigues.', cta: 'Subir contenido' },
      ebooks: { kicker: 'Entrenar', accent: 'var(--blue)', title: 'Manuales', sub: 'Material de lectura que acompaña a las cátedras: manuales y guías. Incluido en cualquier suscripción activa.', cta: 'Seguir leyendo' },
      podcast: { kicker: 'Comunidad', accent: 'var(--pink)', title: 'Waack On Radio', sub: 'Reproductor del podcast. Conversaciones largas con instructores e invitados de la comunidad.', cta: 'Ver todos los episodios' },
      podcasts: { kicker: 'Comunidad', accent: 'var(--pink)', title: 'Podcasts', sub: 'Conversaciones sobre cultura waacking, con instructores e invitados de la comunidad.', cta: 'Escuchar el último' },
      lives: { kicker: 'Comunidad', accent: 'var(--pink)', title: 'Lives / En Vivo', sub: 'Clases en directo con las cátedras activas. Quedan grabadas 30 días en repetición.', cta: 'Entrar al directo' },
      reels: { kicker: 'Comunidad', accent: 'var(--pink)', title: 'Waack Reels', sub: 'El feed de la comunidad. Desliza para ver los clips de otros bailarines.', cta: 'Publicar mi reel' },
      tv: { kicker: 'Comunidad', accent: 'var(--pink)', title: 'Waack On TV', sub: 'El canal abierto de la escuela. Conecta tu cuenta de YouTube y publica tu propio canal en la parrilla.', cta: 'Conectar mi canal' },
      comunidad: { kicker: 'Comunidad', accent: 'var(--pink)', title: 'Muro & Retos', sub: 'Lo que comparte la comunidad y los retos abiertos de la semana.', cta: 'Publicar en el muro' },
      ranking: { kicker: 'Comunidad', accent: 'var(--pink)', title: 'Ranking & Insignias', sub: 'Liga mensual por puntos de práctica. Se reinicia el día 1 de cada mes.', cta: 'Ver mis puntos' },
      planes: { kicker: 'Cuenta', accent: 'var(--purple)', title: 'Planes & Membresía', sub: 'Puedes pagar una cátedra suelta o abrir la escuela completa. Cambias o cancelas cuando quieras.', cta: 'Comparar planes' },
      support: { kicker: 'Cuenta', accent: 'var(--purple)', title: 'Ayuda & Legal', sub: 'Respuestas rápidas, contacto con soporte y los términos de la plataforma.', cta: 'Escribir a soporte' },
      instructor: { kicker: 'Docente · acceso verificado', accent: 'var(--purple)', title: 'Panel de Instructor', sub: 'Tu cátedra, tus alumnos y tus ingresos en un solo sitio. Solo tú y el equipo de Waack ON veis esta pantalla.', cta: 'Volver a Estudiante' }
    };
    return map[v] || map.dashboard;
  }

  rootRef = (el) => { this.rootEl = el; this.syncVars(); };

  bgVideoRef = (el) => {
    if (!el) return;
    try { el.muted = true; const p = el.play(); if (p && p.catch) p.catch(() => {}); } catch (e) {}
  };

  syncVars() {
    const el = this.rootEl;
    if (!el) return;
    const PALETAS = {
      'Neón de club': { blue: '#3BE8F0', pink: '#FF2E9A', purple: '#9B5CFF', yellow: '#F5C518' },
      'Fucsia & naranja': { blue: '#FF7A2F', pink: '#FF1E8E', purple: '#FF4FB0', yellow: '#FFA23A' },
      'Dorado de escenario': { blue: '#C9982E', pink: '#E4B94D', purple: '#8A6415', yellow: '#F4D374' },
      'Monocromo editorial': { blue: '#8E93A3', pink: '#C8CCD8', purple: '#5E6270', yellow: '#A8ADBA' }
    };
    const pal = PALETAS[this.props.paleta ?? 'Fucsia & naranja'] || PALETAS['Fucsia & naranja'];
    el.style.setProperty('--z3d', String(this.props.profundidad ?? 1));
    el.style.setProperty('--blue', pal.blue);
    el.style.setProperty('--pink', pal.pink);
    el.style.setProperty('--purple', pal.purple);
    el.style.setProperty('--yellow', pal.yellow);
  }

  syncTheme() {
    try {
      document.documentElement.setAttribute('data-theme', this.state.theme);
      document.body.setAttribute('data-theme', this.state.theme);
    } catch (e) {}
  }
  componentDidMount() {
    this.syncTheme(); this.syncVars();
    if (!firebaseConfigured) { this.setState({ authReady: true }); return; }
    this.unsubAuth = onAuthStateChanged(auth, async (user) => {
      this.setState((st: any) => ({ user, authReady: true, view: user ? (['login', 'register', 'registerInstructor', 'registerStudio'].includes(st.view) ? (/[?&](checkout|connect)=/.test(location.search) ? 'cuenta' : 'dashboard') : st.view) : (['register', 'registerInstructor', 'registerStudio'].includes(st.view) ? st.view : 'login') }));
      if (user) this.startData(); else this.stopData();
      if (user) {
        try {
          const ref = doc(db, 'users', user.uid);
          const p = takePending();
          const isNewAccount = !(await getDoc(ref)).exists();
          if (isNewAccount) await setDoc(ref, { displayName: user.displayName ?? null, photoURL: user.photoURL ?? null, ...(p.profile || {}), role: 'usuario', createdAt: serverTimestamp() });
          this.signupData = p;
          this.isNewAccount = isNewAccount;
        } catch (e) { console.warn('No se pudo crear el perfil en Firestore', e); }
        await this.syncSession(user);
        if (this.isNewAccount) { this.isNewAccount = false; if (!user.photoURL) this.setState({ view: 'setupPhoto' }); }
        if (await handleSpotifyReturnIfPresent()) this.setState({ view: 'musica' });
      }
    });
  }
  componentWillUnmount() { clearInterval(this._podTimer); this.fisClearTimer && this.fisClearTimer(); this.unsubAuth && this.unsubAuth(); this.stopData(); }

  /* ---------- Datos en vivo desde Firestore (reels, teachers, lives) ----------
     Si una colección está vacía se conservan los datos de ejemplo del prototipo. */
  unsubData: any[] = [];
  signupData = null;
  meApi = null;

  // Crea o recupera el usuario en PostgreSQL (idempotente); el primer admin se decide en el servidor.
  async syncSession(user) {
    // Si la API no estaba disponible en el registro, la solicitud se guardó en este navegador y se reenvía ahora.
    const key = 'waackon.pendingSignup.' + user.uid;
    let stored = null;
    try { stored = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { /* sin almacenamiento */ }
    const p = this.signupData || stored || {};
    this.signupData = null;
    const prof = p.profile || {};
    const body = {};
    if (prof.displayName) body.displayName = prof.displayName;
    if (prof.handle) body.handle = prof.handle;
    if (prof.countryCode) body.countryCode = prof.countryCode;
    if (p.application) body.application = p.application;
    if (p.terms) body.termsVersion = p.terms;
    try {
      const r = await api('POST', '/session', body);
      if (r.user && r.user.role === 'admin') await user.getIdToken(true); // recoge el claim de rol nuevo
    } catch (e) {
      console.warn('API no disponible; se reintentará en el próximo inicio de sesión.', e);
      // Solo se reintenta si el servicio no estaba disponible (no si los datos eran inválidos).
      const down = e && (e.status === 503 || e.status === 0 || e.status === 502 || e.status === 504);
      try { if (down && (p.application || p.profile)) localStorage.setItem(key, JSON.stringify(p)); else localStorage.removeItem(key); } catch (err) { /* sin almacenamiento */ }
      return;
    }
    try { localStorage.removeItem(key); } catch (e) { /* sin almacenamiento */ }
    await this.refreshMe();
    if (/[?&]checkout=/.test(location.search)) [3000, 8000, 15000].forEach((ms) => setTimeout(() => this.refreshMe(), ms)); // el webhook tarda unos segundos
  }

  async refreshMe() {
    try {
      const me = await api('GET', '/me');
      this.meApi = me;
      const live = (me.subscriptions || []).filter((x) => ['active', 'trialing', 'past_due'].includes(x.status));
      this.subs = Object.assign({}, this.subs, {
        platform: live.some((x) => x.planId === 'escuela'),
        instructor: live.some((x) => x.planId === 'catedra'),
        docente: ['instructor', 'estudio', 'admin'].includes(me.user && me.user.role),
      });
      this.forceUpdate();
    } catch (e) { /* API aún no disponible: se mantiene el estado por defecto */ }
  }

  unsubFeed: any = null;
  friendRows: any[] = [];
  livePosts: any[] = [];
  postLikes: Record<string, { count: number; liked: boolean }> = {};
  postLikesLoading: Record<string, boolean> = {};
  postCommentsOpen: Record<string, boolean> = {};
  postComments: Record<string, any[]> = {};
  postCommentDraft: Record<string, string> = {};
  unsubPostComments: Record<string, () => void> = {};
  feedComposerText = '';
  feedComposerFile: File | null = null;
  feedComposerBusy = false;
  feedComposerErr = '';
  friendSearch = '';
  friendSearchBusy = false;
  friendSearchErr = '';
  friendSearchResult: any = null;

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

  stopData() {
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
    this.unsubPostComments = {};
    this.unsubEbooks && this.unsubEbooks(); this.unsubEbooks = null;
    this.unsubGroups && this.unsubGroups(); this.unsubGroups = null;
    this.unsubGroupMsgs && this.unsubGroupMsgs(); this.unsubGroupMsgs = null;
    this.unsubLiveSessions && this.unsubLiveSessions(); this.unsubLiveSessions = null;
    this.unsubEvents && this.unsubEvents(); this.unsubEvents = null;
    this.liveStop(); this.liveLeave();
  }

  battlePanel: 'off' | 'menu' | 'pick' | 'call' = 'off';
  battleCall: any = null;
  battleIncoming: any[] = [];
  unsubIncomingCalls: any = null;
  battleIsLive = false;
  battleRound: any = { phase: 'idle' };
  battleCountdownN: number | null = null;
  battleTurnSecs: number | null = null;
  battleTimers: any[] = [];
  battleErr = '';
  localVideoEl: HTMLVideoElement | null = null;
  remoteVideoEl: HTMLVideoElement | null = null;
  setLocalVideoEl = (el: any) => { this.localVideoEl = el; if (el && this.battleCall?.localStream) el.srcObject = this.battleCall.localStream; };
  setRemoteVideoEl = (el: any) => { this.remoteVideoEl = el; if (el && this.battleCall?.remoteStream) el.srcObject = this.battleCall.remoteStream; };

  battleClearTimers() { this.battleTimers.forEach((t: any) => clearTimeout(t)); this.battleTimers = []; }

  battleToggleMenu = () => { this.battlePanel = this.battlePanel === 'off' ? 'menu' : 'off'; this.forceUpdate(); };

  battleGoLive = async () => {
    const user = this.state.user;
    if (!user) return;
    this.battleErr = '';
    try {
      if (this.battleIsLive) {
        stopLive(user.uid);
        this.battleIsLive = false;
      } else {
        await goLive(user.uid, this.myProfile?.displayName || user.displayName || 'Alguien');
        this.battleIsLive = true;
      }
    } catch { this.battleErr = 'No se pudo activar tu transmisión. Inténtalo de nuevo.'; }
    this.forceUpdate();
  };

  myInstructorList() {
    const subs = (this.meApi?.subscriptions || []).filter((x: any) => x.instructorId && ['active', 'trialing', 'past_due'].includes(x.status));
    const seen = new Set<string>();
    return subs.filter((s: any) => (seen.has(s.instructorId) ? false : (seen.add(s.instructorId), true)))
      .map((s: any) => ({ id: s.instructorId, name: this.resolveUserName(s.instructorId) }));
  }

  battleOpenPractice = () => {
    if (!this.myInstructorList().length) return;
    this.battlePanel = 'pick';
    this.forceUpdate();
  };

  battleStartCallSetup(call: any) {
    call.onRemoteTrack = () => { if (this.remoteVideoEl) this.remoteVideoEl.srcObject = call.remoteStream; this.forceUpdate(); };
    call.onRoundChange = (round: any) => this.battleApplyRound(round, call);
    call.onEnded = () => { this.battleErr = 'La llamada terminó.'; this.battleCall = null; this.battlePanel = 'menu'; this.battleClearTimers(); this.forceUpdate(); };
  }

  battleCallInstructor = async (otherUid: string) => {
    const user = this.state.user;
    if (!user) return;
    this.battleErr = '';
    try {
      const call = new BattleCall(user.uid);
      this.battleStartCallSetup(call);
      await call.shareScreen();
      if (this.localVideoEl) this.localVideoEl.srcObject = call.localStream;
      await call.call(otherUid, 'practice');
      this.battleCall = call;
      this.battlePanel = 'call';
    } catch (e: any) { this.battleErr = e?.message?.includes('Permission') ? 'Debes permitir compartir tu pantalla para entrenar.' : 'No se pudo iniciar la llamada.'; }
    this.forceUpdate();
  };

  battleAcceptIncoming = async (c: any) => {
    const user = this.state.user;
    if (!user) return;
    this.battleErr = '';
    try {
      const call = new BattleCall(user.uid);
      this.battleStartCallSetup(call);
      await call.shareScreen();
      if (this.localVideoEl) this.localVideoEl.srcObject = call.localStream;
      await call.answer(c.id, c.offer);
      this.battleCall = call;
      this.battlePanel = 'call';
    } catch { this.battleErr = 'No se pudo aceptar la llamada.'; }
    this.forceUpdate();
  };

  battleDeclineIncoming = (c: any) => { declineCall(c.id); };

  battleHangUp = () => {
    this.battleClearTimers();
    this.battleCall?.hangUp();
    this.battleCall = null;
    this.battleRound = { phase: 'idle' };
    this.battleCountdownN = null;
    this.battleTurnSecs = null;
    this.battlePanel = 'menu';
    this.forceUpdate();
  };

  battleStartRound = () => { this.battleCall?.setRound({ phase: 'countdown', startedAt: Date.now() }); };

  battleApplyRound(round: any, call: any) {
    this.battleRound = round;
    this.battleClearTimers();
    if (round.phase === 'countdown') {
      this.battleCountdownN = 3;
      this.battleTurnSecs = null;
      this.forceUpdate();
      [1, 2, 3].forEach((i) => this.battleTimers.push(setTimeout(() => { this.battleCountdownN = 3 - i; this.forceUpdate(); }, i * 1000)));
      if (call.isCaller) this.battleTimers.push(setTimeout(() => call.setRound({ phase: this.battleRound.turn === 2 ? 'turn2' : 'turn1', turn: this.battleRound.turn === 2 ? 2 : 1, startedAt: Date.now() }), 3000));
    } else if (round.phase === 'turn1' || round.phase === 'turn2') {
      this.battleCountdownN = null;
      this.battleTurnSecs = 60;
      this.forceUpdate();
      for (let s = 1; s <= 60; s++) this.battleTimers.push(setTimeout(() => { this.battleTurnSecs = 60 - s; this.forceUpdate(); }, s * 1000));
      if (call.isCaller) this.battleTimers.push(setTimeout(() => {
        if (round.phase === 'turn1') call.setRound({ phase: 'countdown', turn: 2, startedAt: Date.now() });
        else call.setRound({ phase: 'done', startedAt: Date.now() });
      }, 60000));
    } else {
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
    if (f.size > MAX_IMAGE_MB * 1048576) { this.annErr = `La imagen puede pesar máx. ${MAX_IMAGE_MB} MB.`; this.forceUpdate(); return; }
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
    if (f.size > MAX_IMAGE_MB * 1048576) { this.ebErr = `La portada puede pesar máx. ${MAX_IMAGE_MB} MB.`; this.forceUpdate(); return; }
    this.ebErr = ''; this.ebCoverFile = f; this.ebCoverName = f.name; this.forceUpdate();
  };
  ebPickPdf = () => { (document.getElementById('eb-pdf-input') as HTMLInputElement | null)?.click(); };
  ebOnPdf = (e: any) => {
    const f = e?.target?.files?.[0];
    if (e?.target) e.target.value = '';
    if (!f) return;
    if (f.type !== 'application/pdf') { this.ebErr = 'Sube un archivo PDF.'; this.forceUpdate(); return; }
    if (f.size > MAX_PDF_MB * 1048576) { this.ebErr = `El PDF puede pesar máx. ${MAX_PDF_MB} MB.`; this.forceUpdate(); return; }
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

  unsubEvents: any = null;
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

  unsubLiveSessions: any = null;
  liveSessions: any[] = [];
  liveStream: MediaStream | null = null;
  liveViewers = new Map<string, any>();
  liveServed = new Set<string>();
  liveErr = '';
  liveBusy = false;
  liveWatchCall: any = null;
  liveWatching: any = null;
  livePreviewEl: any = null;
  liveWatchEl: any = null;
  LIVE_MAX_VIEWERS = 6;

  setLivePreviewEl = (el: any) => { this.livePreviewEl = el; if (el && this.liveStream && el.srcObject !== this.liveStream) el.srcObject = this.liveStream; };
  setLiveWatchEl = (el: any) => { this.liveWatchEl = el; if (el && this.liveWatchCall && el.srcObject !== this.liveWatchCall.remoteStream) el.srcObject = this.liveWatchCall.remoteStream; };

  liveCameraError(e: any) {
    if (!navigator.mediaDevices?.getUserMedia) return 'Tu navegador no permite usar la cámara aquí (hace falta una conexión segura https).';
    const n = e?.name;
    if (n === 'NotAllowedError' || n === 'SecurityError') return 'Debes permitir el acceso a la cámara y al micrófono (icono junto a la barra de direcciones) y volver a intentarlo.';
    if (n === 'NotFoundError' || n === 'OverconstrainedError') return 'No encontramos una cámara en este dispositivo.';
    if (n === 'NotReadableError') return 'Otra aplicación está usando tu cámara. Ciérrala e inténtalo de nuevo.';
    return 'No se pudo encender la cámara. Inténtalo de nuevo.';
  }

  liveToggle = async () => {
    if (this.liveBusy) return;
    this.liveErr = '';
    if (this.liveStream) { this.liveStop(); this.forceUpdate(); return; }
    this.liveBusy = true; this.forceUpdate();
    try {
      this.liveStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true });
      this.liveStream.getVideoTracks()[0]?.addEventListener('ended', () => { this.liveStop(); this.forceUpdate(); });
      await goLive(auth.currentUser!.uid, this.myProfile?.displayName || this.state.user?.displayName || 'Alguien');
      this.battleIsLive = true; this.insLive = true;
      this.liveHandleIncoming(this.battleIncoming);
    } catch (e: any) {
      this.liveStream?.getTracks().forEach((t: any) => t.stop()); this.liveStream = null;
      this.liveErr = this.liveCameraError(e);
    }
    this.liveBusy = false; this.forceUpdate();
  };

  ccStopFn: any = null;
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
    this.ccStopFn && this.ccStopFn(); this.ccStopFn = null; this.ccOn = false;
    this.liveViewers.forEach((c: any) => c.hangUp()); this.liveViewers.clear(); this.liveServed.clear();
    const had = !!this.liveStream;
    this.liveStream?.getTracks().forEach((t: any) => t.stop()); this.liveStream = null;
    if (had && auth.currentUser) stopLive(auth.currentUser.uid);
    this.battleIsLive = false; this.insLive = false;
  }

  liveHandleIncoming(calls: any[]) {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    calls.filter((c: any) => c.mode === 'live' && !this.liveServed.has(c.id)).forEach((c: any) => {
      this.liveServed.add(c.id);
      if (!this.liveStream || this.liveViewers.size >= this.LIVE_MAX_VIEWERS) { declineCall(c.id); return; }
      const call = new BattleCall(uid);
      call.attachStream(this.liveStream);
      call.onEnded = () => { this.liveViewers.delete(c.id); this.forceUpdate(); };
      this.liveViewers.set(c.id, call);
      call.answer(c.id, c.offer).catch(() => { this.liveViewers.delete(c.id); this.forceUpdate(); });
      this.forceUpdate();
    });
  }

  liveWatch = async (uid: string, name: string) => {
    if (this.liveWatchCall) this.liveLeave();
    this.liveErr = '';
    const call = new BattleCall(auth.currentUser!.uid);
    this.liveWatchCall = call; this.liveWatching = { uid, name, connected: false };
    call.onRemoteTrack = () => { this.liveWatching = { ...this.liveWatching, connected: true }; if (this.liveWatchEl) this.liveWatchEl.srcObject = call.remoteStream; this.forceUpdate(); };
    call.onEnded = () => { if (this.liveWatchCall === call) { this.liveErr = 'La transmisión terminó.'; this.liveLeave(); } };
    this.forceUpdate();
    setTimeout(() => { if (this.liveWatchCall === call && !this.liveWatching?.connected) { this.liveErr = 'No se pudo conectar. Puede que la transmisión ya haya terminado.'; this.liveLeave(); } }, 20000);
    try { await call.watchLive(uid); } catch (e) { this.liveErr = 'No se pudo conectar a la transmisión.'; this.liveLeave(); }
  };

  liveLeave = () => {
    const c = this.liveWatchCall;
    this.liveWatchCall = null; this.liveWatching = null;
    c?.hangUp();
    this.forceUpdate();
  };

  unsubGroups: any = null;
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
      const id = await createGroup({ uid: auth.currentUser!.uid, name: this.gName, description: this.gDesc, kind: this.gKind === 'clase' && this.isDocente() ? 'clase' : 'grupo' });
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
  }
  startData() {
    this.stopData();
    const byNewest = (a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    const byOrder = (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0);
    const watch = (name: string, apply: (rows: any[]) => void) =>
      onSnapshot(collection(db, name), (snap) => {
        if (snap.empty) return;
        apply(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        this.forceUpdate();
      }, (e) => console.warn('Firestore ' + name + ':', e.code));
    this.unsubData = [
      watch('reels', (rows) => {
        this.reelData = rows.sort(byNewest).map((r: any) => ({ c1: 'var(--pink)', c2: 'var(--purple)', likes: 0, comments: 0, ...r }));
      }),
      watch('teachers', (rows) => {
        this.teacherData = rows.sort(byOrder).map((t: any) => ({ c1: 'var(--blue)', c2: 'var(--purple)', plan: '', courses: [], ...t }));
        if (this.teacherFilter !== 'all' && !this.teacherData.some((t: any) => t.id === this.teacherFilter)) this.teacherFilter = 'all';
      }),
      watch('lives', (rows) => {
        this.insClasses = rows.sort(byOrder).map((c: any) => ({ t: c.title ?? c.t ?? '', when: c.when ?? '', who: c.who ?? '', state: c.state ?? 'Programada', live: !!c.live }));
      }),
      watchMyFriendships(auth.currentUser!.uid, (rows: any) => {
        this.friendRows = rows;
        this.forceUpdate();
        const uid = auth.currentUser!.uid;
        const ids = [uid, ...myFriendIds(rows, uid)];
        this.unsubFeed && this.unsubFeed();
        this.unsubFeed = subscribeFeed(ids, (posts: any) => { this.livePosts = posts; this.forceUpdate(); });
      }),
      onSnapshot(doc(db, 'users', auth.currentUser!.uid), (snap: any) => {
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
    this.unsubNotifs && this.unsubNotifs();
    this.unsubNotifs = watchMyNotifications(meUid, (rows: any) => { this.liveNotifs = rows; this.forceUpdate(); });
    this.unsubIncomingCalls && this.unsubIncomingCalls();
    this.unsubIncomingCalls = watchIncomingCalls(meUid, (calls: any) => { this.battleIncoming = calls.filter((c: any) => c.mode !== 'live'); this.liveHandleIncoming(calls); this.forceUpdate(); });
    this.unsubStudyProgress && this.unsubStudyProgress();
    this.unsubStudyProgress = watchStudyProgress(meUid, (p: any) => { this.studyProgress = p; this.forceUpdate(); });
    this.unsubAnnouncements && this.unsubAnnouncements();
    this.unsubAnnouncements = subscribeAnnouncements((rows: any) => { this.liveAnnouncements = rows; this.forceUpdate(); });
    this.unsubEbooks && this.unsubEbooks();
    this.unsubEbooks = subscribeEbooks((rows: any) => { this.liveEbooks = rows; this.forceUpdate(); });
    this.unsubGroups && this.unsubGroups();
    this.unsubGroups = watchMyGroups(meUid, (rows: any) => { this.gList = rows; if (this.gActiveId && !rows.some((g: any) => g.id === this.gActiveId)) this.gBack(); this.forceUpdate(); });
    this.unsubEvents && this.unsubEvents();
    this.unsubEvents = subscribeEvents((rows: any) => { this.liveEvents = rows; this.forceUpdate(); });
    this.unsubLiveSessions && this.unsubLiveSessions();
    this.unsubLiveSessions = watchLiveSessions((rows: any) => { this.liveSessions = rows; this.forceUpdate(); });
    const invite = new URLSearchParams(location.search).get('grupo');
    if (invite) {
      this.gJoinCode = cleanGroupCode(invite); this.gMode = 'join';
      try { history.replaceState(null, '', location.pathname); } catch (e) { /* sin historial */ }
      this.setState({ view: 'grupos' });
    }
  }

  studyProgress: any = { completedModules: [], quizScores: {}, checklist: {}, reflections: {} };
  unsubStudyProgress: any = null;
  studyActiveModuleId: string | null = null;
  studyTimelineIdx = 0;
  studyReflectionDrafts: Record<string, string> = {};
  studyMatchSelectedPioneer: string | null = null;
  studyMatchWrong: string | null = null;
  studyCompareSide: 'waacking' | 'voguing' = 'waacking';
  studyHubActive = STUDY_MODULES.find((m: any) => m.id === 'revival')!.hubs![0].id;
  studyQuizAnswers: Record<string, (number | null)[]> = {};
  studyQuizSubmitted: Record<string, boolean> = {};

  studyModuleOrder() { return STUDY_MODULES.map((m: any) => m.id); }
  studyIsUnlocked(idx: number) { return idx === 0 || this.studyProgress.completedModules.includes(this.studyModuleOrder()[idx - 1]); }
  studyActiveModule() { return STUDY_MODULES.find((m: any) => m.id === this.studyActiveModuleId) || null; }

  studyOpenModule = (id: string) => {
    const idx = this.studyModuleOrder().indexOf(id);
    if (!this.studyIsUnlocked(idx)) return;
    this.studyActiveModuleId = this.studyActiveModuleId === id ? null : id;
    this.studyTimelineIdx = 0;
    this.forceUpdate();
  };

  studyPickTimeline = (i: number) => { this.studyTimelineIdx = i; this.forceUpdate(); };

  studyToggleTechnique = (itemId: string) => {
    const mod = this.studyActiveModule();
    if (!mod) return;
    toggleTechniqueItem(auth.currentUser!.uid, this.studyProgress, mod.id, itemId);
  };

  studyReflectionChange = (cardId: string, val: string) => { this.studyReflectionDrafts[cardId] = val; this.forceUpdate(); };
  studySaveReflection = (cardId: string) => {
    const text = this.studyReflectionDrafts[cardId] ?? this.studyProgress.reflections[cardId] ?? '';
    saveReflectionAnswer(auth.currentUser!.uid, this.studyProgress, cardId, text);
  };

  studyPickPioneer = (id: string) => { this.studyMatchSelectedPioneer = id; this.studyMatchWrong = null; this.forceUpdate(); };
  studyPickModern = (id: string) => {
    const mod = this.studyActiveModule();
    const pioneerId = this.studyMatchSelectedPioneer;
    if (!mod || !pioneerId) return;
    const pioneer = (mod.figures || []).find((f: any) => f.id === pioneerId);
    if (pioneer && pioneer.matches === id) {
      this.studyMatches = { ...(this.studyMatches || {}), [pioneerId]: id };
      this.studyMatchSelectedPioneer = null;
    } else {
      this.studyMatchWrong = id;
    }
    this.forceUpdate();
  };
  studyMatches: Record<string, string> = {};

  studySetCompareSide = (side: 'waacking' | 'voguing') => { this.studyCompareSide = side; this.forceUpdate(); };
  studyPickHub = (id: string) => { this.studyHubActive = id; this.forceUpdate(); };

  studyPickQuizAnswer = (moduleId: string, qIdx: number, optIdx: number) => {
    const arr = (this.studyQuizAnswers[moduleId] || STUDY_MODULES.find((m: any) => m.id === moduleId)!.quiz.map(() => null)).slice();
    arr[qIdx] = optIdx;
    this.studyQuizAnswers = { ...this.studyQuizAnswers, [moduleId]: arr };
    this.forceUpdate();
  };

  studySubmitQuiz = (moduleId: string) => {
    const mod = STUDY_MODULES.find((m: any) => m.id === moduleId);
    if (!mod) return;
    const answers = this.studyQuizAnswers[moduleId] || [];
    const score = mod.quiz.filter((q: any, i: number) => answers[i] === q.correct).length;
    this.studyQuizSubmitted = { ...this.studyQuizSubmitted, [moduleId]: true };
    saveQuizScoreAndComplete(auth.currentUser!.uid, this.studyProgress, moduleId, score);
    this.forceUpdate();
  };

  studyGoNextModule = (moduleId: string) => {
    const idx = this.studyModuleOrder().indexOf(moduleId);
    const next = this.studyModuleOrder()[idx + 1];
    this.studyActiveModuleId = next || null;
    this.studyTimelineIdx = 0;
    this.studyMatchSelectedPioneer = null;
    this.forceUpdate();
  };

  followCounts = { followers: 0, following: 0 };
  myMedia: any[] = [];
  myPostCount = 0;
  unsubFollowCounts: any = null;
  unsubMyMedia: any = null;
  unsubMyPostCount: any = null;

  myProfile: any = null;
  myAvatarBusy = false;
  myAvatarPct: number | null = null;
  myAvatarErr = '';
  perfInstructorModalOpen = false;
  perfInstructorReason = '';
  perfInstructorErr = '';
  perfInstructorBusy = false;
  onMyAvatarPick = () => { (document.getElementById('perf-avatar-input') as HTMLInputElement | null)?.click(); };
  perfBecomeInstructorClick = () => { this.perfInstructorModalOpen = true; this.perfInstructorErr = ''; this.forceUpdate(); };
  perfCloseInstructorModal = () => { this.perfInstructorModalOpen = false; this.perfInstructorReason = ''; this.perfInstructorErr = ''; this.forceUpdate(); };
  perfSetInstructorReason = (e: any) => { this.perfInstructorReason = e.target.value; };
  perfSubmitInstructorRequest = async () => {
    if (!this.perfInstructorReason.trim()) {
      this.perfInstructorErr = 'Por favor, cuéntanos por qué quieres ser instructor.';
      this.forceUpdate();
      return;
    }
    const user = this.state.user;
    if (!user) return;
    this.perfInstructorErr = '';
    this.perfInstructorBusy = true;
    this.forceUpdate();
    try {
      const requestRef = doc(db, 'users', user.uid, 'instructorRequests', 'current');
      await setDoc(requestRef, {
        reason: this.perfInstructorReason,
        status: 'pending',
        createdAt: serverTimestamp(),
        email: user.email,
        displayName: this.myProfile?.displayName || user.displayName || 'Usuario',
      });
      this.perfCloseInstructorModal();
      alert('Solicitud enviada. El equipo de Waack ON la revisará en 24-48 horas.');
    } catch (err) {
      this.perfInstructorErr = 'Error al enviar la solicitud. Inténtalo de nuevo.';
      console.error(err);
    }
    this.perfInstructorBusy = false;
    this.forceUpdate();
  };
  onMyAvatarFile = (e: any) => {
    const f = e?.target?.files?.[0];
    if (e?.target) e.target.value = '';
    const user = this.state.user;
    if (!f || !user) return;
    if (!IMAGE_TYPES.includes(f.type)) { this.myAvatarErr = 'Formato no permitido (usa JPG, PNG, WEBP o GIF).'; this.forceUpdate(); return; }
    if (f.size > MAX_IMAGE_MB * 1048576) { this.myAvatarErr = `La foto puede pesar máx. ${MAX_IMAGE_MB} MB.`; this.forceUpdate(); return; }
    this.myAvatarErr = ''; this.myAvatarBusy = true; this.myAvatarPct = 0; this.forceUpdate();
    const path = `users/${user.uid}/avatar/${Date.now()}-${f.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9._-]+/g, '_').slice(-80)}`;
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
  };
  componentDidUpdate() { this.syncTheme(); this.syncVars(); }

  autoPlay(el) {
    if (!el) return;
    el.muted = true;
    el.defaultMuted = true;
    el.setAttribute('muted', '');
    el.setAttribute('playsinline', '');
    const go = () => el.play().catch(() => {});
    go();
    el.addEventListener('canplay', go, { once: true });
  }

  heroVideoRef = (el) => this.autoPlay(el);
  loginVideoRef = (el) => this.autoPlay(el);
  insVideoRef = (el) => this.autoPlay(el);

  bannerRef = (el) => {
    if (!el) return;
    el.muted = true;
    el.defaultMuted = true;
    el.setAttribute('muted', '');
    el.setAttribute('playsinline', '');
    const go = () => el.play().catch(() => {});
    go();
    el.addEventListener('canplay', go, { once: true });
  };

  chromeInk() { return this.state.theme === 'light' ? '#14151A' : '#FFFFFF'; }
  chromeInk2() { return this.state.theme === 'light' ? 'rgba(20,21,26,.72)' : 'rgba(255,255,255,.75)'; }
  chromeInk3() { return this.state.theme === 'light' ? 'rgba(20,21,26,.55)' : 'rgba(255,255,255,.6)'; }

  nav(active, accent) {
    const light = this.state.theme === 'light';
    const open = this.navIsOpen();
    const base = 'display:flex;align-items:center;gap:11px;border-radius:999px;font-size:12px;font-weight:600;letter-spacing:.01em;cursor:pointer;transition:all .18s ease;'
      + (open ? 'padding:9px 14px;' : 'padding:11px 0;justify-content:center;');
    return active
      ? base + `color:${light ? '#14151A' : '#FFFFFF'};background:${light ? 'rgba(255,255,255,.72)' : 'rgba(255,255,255,.12)'};border:1px solid ${accent};box-shadow:var(--lg-edge);`
      : base + 'color:' + (light ? 'rgba(20,21,26,.72)' : 'rgba(255,255,255,.72)') + ';border:1px solid transparent;';
  }

  podEpisodes = [
    { n:'12', title:'El waacking no es una pose, es una respuesta', guest:'Con Brando Hermoso · grabado en Sala Central 01', dur:'48:20', secs:2900, notes:'Brando repasa cómo llegó al waacking desde el punking de los setenta, por qué entrena el brazo antes que la cara y qué escucha cuando prepara una batalla. En el último bloque responde preguntas de la comunidad sobre musicalidad a 128 BPM.' },
    { n:'11', title:'Escuchar el disco antes de mover el brazo', guest:'Con Sara Waack · sesión abierta', dur:'41:05', secs:2465, notes:'Una conversación sobre el oído: identificar el hi-hat, anticipar el break y usar el silencio. Sara propone tres ejercicios de escucha sin movimiento.' },
    { n:'10', title:'Batallas: leer al rival en ocho tiempos', guest:'Con Pedro Punking', dur:'53:48', secs:3228, notes:'Cómo se construye una ronda, qué mirar en los primeros ocho tiempos y cuándo conviene bajar la intensidad para subir el impacto.' },
    { n:'09', title:'Cuerpo, hombro y años de práctica', guest:'Con Elena Pose', dur:'37:12', secs:2232, notes:'Prevención de lesiones en el hombro, rutinas de calentamiento y la diferencia entre fuerza y control.' },
    { n:'08', title:'La escena latina, contada desde dentro', guest:'Mesa abierta con la comunidad', dur:'1:02:30', secs:3750, notes:'Cinco ciudades, cinco maneras de entender la pista. Un repaso de festivales, jams y lo que falta por construir.' }
  ];

  podFmt(s) {
    s = Math.max(0, Math.floor(s));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    const mm = String(m).padStart(2, '0'), ss = String(sec).padStart(2, '0');
    return h ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
  }

  podTick() {
    clearInterval(this._podTimer);
    if (!this.state.podPlaying) return;
    this._podTimer = setInterval(() => {
      const ep = this.podEpisodes[this.state.podTrack || 0];
      const next = (this.state.podPos || 0) + (this.state.podRate || 1);
      if (next >= ep.secs) { this.setState({ podPos: 0, podPlaying: false }); clearInterval(this._podTimer); }
      else this.setState({ podPos: next });
    }, 1000);
  }

  podGo(i) {
    const n = this.podEpisodes.length;
    this.setState({ podTrack: ((i % n) + n) % n, podPos: 0, podPlaying: true }, () => this.podTick());
  }

  buildPodBars() {
    const ep = this.podEpisodes[this.state.podTrack || 0];
    const pos = (this.state.podPos || 0) / ep.secs;
    const t = this.state.podTrack || 0;
    const out = [];
    for (let i = 0; i < 48; i++) {
      const h = 22 + Math.abs(Math.sin((i + 1) * (1.7 + t * 0.3))) * 66 + (i % 5) * 4;
      const done = i / 48 <= pos;
      out.push({ style: `flex:1;min-width:0;height:${Math.min(100, h)}%;border-radius:2px;background:${done ? 'var(--pink)' : 'var(--hair)'};transition:background .2s ease` });
    }
    return out;
  }

  buildPodList() {
    const cur = this.state.podTrack || 0;
    return this.podEpisodes.map((e, i) => ({
      n: e.n, title: e.title, meta: `${e.dur} · ${e.guest.replace(/^Con /, '')}`,
      onSelect: () => this.podGo(i),
      row: 'display:flex;align-items:flex-start;gap:14px;padding:15px 18px;cursor:pointer;transition:background .18s ease;' + (i ? 'border-top:1px solid var(--hair-soft);' : '') + (i === cur ? 'background:var(--glass);' : ''),
      num: `font-family:'Geist Mono',monospace;font-size:11px;font-weight:700;width:26px;flex:0 0 26px;padding-top:2px;color:${i === cur ? 'var(--pink)' : 'var(--ink-3)'}`
    }));
  }

  /* ---------- Reproductor: capítulos, transcripción, extras ---------- */
  podChapters = [
    { t: 0, l: 'Apertura y saludo' },
    { t: 320, l: 'Primer contacto con el waacking' },
    { t: 940, l: 'El brazo como respuesta, no como pose' },
    { t: 1620, l: 'Entrenar el oído antes del cuerpo' },
    { t: 2280, l: 'Consejos para quien empieza' }
  ];

  podLines = [
    { t: 0, s: 'Brando', x: 'Cuando empecé no había vídeos. Copiabas lo que veías en una fiesta y lo repetías toda la semana.' },
    { t: 320, s: 'Host', x: '¿Y cómo sabías si lo estabas haciendo bien?' },
    { t: 940, s: 'Brando', x: 'No lo sabías. Sabías si funcionaba con la música, que es otra cosa. El brazo responde a un sonido concreto.' },
    { t: 1620, s: 'Brando', x: 'Primero el oído. Si no distingues el hi-hat del clap, el brazo va a llegar tarde siempre.' },
    { t: 2280, s: 'Host', x: 'Un consejo para alguien que entra hoy al estilo.' }
  ];

  podVol = 0.8;
  podSleep = false;

  podSkip(n) {
    const ep = this.podEpisodes[this.state.podTrack || 0];
    const next = Math.min(ep.secs, Math.max(0, (this.state.podPos || 0) + n));
    this.setState({ podPos: next });
  }

  podSeekTo(t) { this.setState({ podPos: t, podPlaying: true }, () => this.podTick()); }
  setPodVol = (e) => { this.podVol = Number(e.target.value); this.forceUpdate(); };
  togglePodSleep = () => { this.podSleep = !this.podSleep; this.forceUpdate(); };

  podActiveChapter() {
    const pos = this.state.podPos || 0;
    let idx = 0;
    this.podChapters.forEach((c, i) => { if (pos >= c.t) idx = i; });
    return idx;
  }

  buildPodChapters() {
    const act = this.podActiveChapter();
    return this.podChapters.map((c, i) => ({
      key: 'pc' + i,
      label: c.l,
      time: this.podFmt(c.t),
      go: () => this.podSeekTo(c.t),
      row: 'display:flex;align-items:center;gap:14px;padding:13px 16px;border-radius:16px;cursor:pointer;border:1px solid ' + (act === i ? 'color-mix(in oklch, var(--pink) 55%, transparent)' : 'transparent') + ';background:' + (act === i ? 'var(--glass-2)' : 'transparent') + ';transition:background .18s ease, border-color .18s ease',
      num: 'font-family:\'Geist Mono\',monospace;font-size:11px;color:' + (act === i ? 'var(--pink)' : 'var(--ink-3)') + ';white-space:nowrap',
      text: 'flex:1;min-width:0;font-size:13.5px;font-weight:' + (act === i ? '700' : '600') + ';color:' + (act === i ? 'var(--ink)' : 'var(--ink-2)') + ';text-wrap:pretty'
    }));
  }

  buildPodLines() {
    const act = this.podActiveChapter();
    return this.podLines.map((l, i) => ({
      key: 'pl' + i,
      speaker: l.s,
      text: l.x,
      time: this.podFmt(l.t),
      go: () => this.podSeekTo(l.t),
      row: 'display:flex;gap:14px;padding:12px 4px;cursor:pointer;border-radius:12px;opacity:' + (act === i ? '1' : '.62') + ';transition:opacity .2s ease',
      name: 'font-family:\'Geist Mono\',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:' + (act === i ? 'var(--pink)' : 'var(--ink-3)') + ';flex:0 0 74px'
    }));
  }

  renderVals() {
    const v = this.state.view;
    const crumbs = { perfil:'Mi perfil', cuenta:'Mi cuenta', grupos:'Grupos', dashboard:'Dashboard', cursos:'Clases & Cursos', lives:'Lives / En Vivo', reels:'Waack Reels', tv:'Waack On TV', podcast:'Waack On Radio', entrenamiento:'Laboratorio Freestyle', fisico:'Cuerpo & Estiramientos', ebooks:'Manuales', podcasts:'Podcasts', comunidad:'Muro & Retos', ranking:'Ranking & Insignias', planes:'Planes & Membresía', support:'Ayuda & Legal', instructor:'Panel de Instructor' };
    const pill = 'flex:1;text-align:center;padding:8px 12px;border-radius:999px;font-size:11px;font-weight:700;cursor:pointer;transition:all .18s ease;';
    const on = pill + 'background:var(--glass);color:var(--ink);border:1px solid var(--hair);box-shadow:var(--lg-edge);';
    const off = pill + 'color:var(--ink-2);border:1px solid transparent;';
    const glassCard = 'border:1px solid var(--hair);background:var(--glass);backdrop-filter:var(--lg-blur);-webkit-backdrop-filter:var(--lg-blur);box-shadow:var(--lg-edge), var(--lg-lift);';
    const dark = this.state.theme === 'dark';
    /* --- Tweaks --- */
    const paleta = this.props.paleta ?? 'Fucsia & naranja';
    const materia = this.props.materia ?? 'Vidrio platinado';
    const depth = this.props.profundidad ?? 1;
    const rise = (i) => 'opacity:1;transform-style:preserve-3d;transition:transform .26s cubic-bezier(.2,.85,.25,1), border-color .26s ease;'
      + (depth > 0.05 ? 'animation:rise3d ' + (0.82 / Math.max(depth, 0.35)).toFixed(2) + 's cubic-bezier(.2,.85,.25,1) ' + (0.07 * i).toFixed(2) + 's backwards;' : '');

    const PALETAS = {
      'Neón de club': { blue: '#3BE8F0', pink: '#FF2E9A', purple: '#9B5CFF', yellow: '#F5C518' },
      'Fucsia & naranja': { blue: '#FF7A2F', pink: '#FF1E8E', purple: '#FF4FB0', yellow: '#FFA23A' },
      'Dorado de escenario': { blue: '#C9982E', pink: '#E4B94D', purple: '#8A6415', yellow: '#F4D374' },
      'Monocromo editorial': { blue: '#8E93A3', pink: '#C8CCD8', purple: '#5E6270', yellow: '#A8ADBA' }
    };
    const pal = PALETAS[paleta] || PALETAS['Fucsia & naranja'];
    const tweakVars = '--z3d:' + depth + ';--blue:' + pal.blue + ';--pink:' + pal.pink + ';--purple:' + pal.purple + ';--yellow:' + pal.yellow;

    const flat = materia === 'Plano mate';
    const soft = materia === 'Vidrio suave';

    const plate = dark
      ? 'background:linear-gradient(135deg, rgba(198,206,222,.20) 0%, rgba(74,80,94,.30) 26%, rgba(226,232,244,.22) 48%, rgba(52,56,66,.34) 70%, rgba(188,197,214,.18) 100%), #0A0910;border:1px solid rgba(226,232,244,.26);box-shadow:inset 0 1px 0 rgba(255,255,255,.55), inset 0 -24px 46px -28px rgba(0,0,0,.85), 0 28px 62px -28px rgba(0,0,0,.85);'
      : 'background:linear-gradient(135deg, rgba(255,255,255,.9) 0%, rgba(226,232,244,.62) 26%, rgba(255,255,255,.95) 48%, rgba(214,222,238,.6) 70%, rgba(255,255,255,.9) 100%);border:1px solid rgba(13,13,13,.09);box-shadow:inset 0 1px 0 rgba(255,255,255,1), inset 0 -20px 40px -30px rgba(255,255,255,.9), 0 20px 46px -28px rgba(13,13,13,.16);';
    const plateFlat = dark
      ? 'background:rgba(22,20,26,.92);border:1px solid rgba(226,232,244,.12);box-shadow:none;'
      : 'background:#F2F3F6;border:1px solid rgba(13,13,13,.08);box-shadow:none;';
    const plateSoft = dark
      ? 'background:rgba(233,196,226,.07);border:1px solid var(--hair);box-shadow:inset 0 1px 0 var(--sheen);'
      : 'background:rgba(255,255,255,.55);border:1px solid var(--hair);box-shadow:inset 0 1px 0 var(--sheen);';
    const plateSkin = flat ? plateFlat : (soft ? plateSoft : plate);
    const plateBlur = flat ? '' : (soft
      ? 'backdrop-filter:blur(22px) saturate(140%);-webkit-backdrop-filter:blur(22px) saturate(140%);'
      : 'backdrop-filter:blur(34px) saturate(190%);-webkit-backdrop-filter:blur(34px) saturate(190%);');
    const platePad = plateSkin + 'border-radius:' + (flat ? '20px' : '28px') + ';padding:22px;' + plateBlur;
    const grid3d = 'display:grid;gap:16px;perspective:1400px;perspective-origin:50% 0%;' + platePad;
    const tabBase = 'padding:7px 4px;font-size:14px;font-weight:700;white-space:nowrap;cursor:pointer;transition:color .18s ease;';
    const tabOn = tabBase + 'color:#fff;border-bottom:2px solid #fff;';
    const tabOff = tabBase + 'color:rgba(255,255,255,.55);border-bottom:2px solid transparent;';


    return {
      theme: this.state.theme,
      chromeInk: 'color:' + this.chromeInk(),
      chromeInk2: 'color:' + this.chromeInk2(),
      chromeBg: dark
        ? 'background:linear-gradient(160deg, #3A3D42 0%, #2B2E33 22%, #4A4E55 48%, #26282C 74%, #35383D 100%);'
        : 'background:linear-gradient(160deg, #F2F4F7 0%, #E3E6EB 24%, #FAFBFC 50%, #DDE1E7 76%, #EEF0F4 100%);',
      headerBg: dark
        ? 'background:linear-gradient(180deg, #5A5E66 0%, #43464D 52%, #33363B 100%);'
        : 'background:linear-gradient(180deg, #FFFFFF 0%, #F1F3F6 52%, #E6E9EE 100%);',
      isLight: !dark,
      isDark: dark,
      crumb: crumbs[v] || 'Dashboard',
      isLogin: v === 'login',
      isInicio: false,
      isApp: !['login', 'register', 'registerInstructor', 'registerStudio', 'setupPhoto'].includes(v),
      isRegister: v === 'register',
      isRegisterInstructor: v === 'registerInstructor',
      isRegisterStudio: v === 'registerStudio',
      isSetupPhoto: v === 'setupPhoto',
      isCuenta: v === 'cuenta',
      isMusica: v === 'musica',
      goView: (view) => this.setState({ view }),
      goRegisterPro: () => this.setState({ view: 'registerInstructor' }),
      ambientLayer: dark
        ? 'position:absolute;inset:0;pointer-events:none;background:radial-gradient(1000px 580px at 6% -10%, rgba(228,230,236,.14), transparent 66%), radial-gradient(900px 540px at 98% 6%, rgba(168,172,182,.12), transparent 70%), radial-gradient(800px 500px at 58% 110%, rgba(120,124,134,.10), transparent 72%)'
        : 'position:absolute;inset:0;pointer-events:none;background:radial-gradient(980px 560px at 8% -8%, color-mix(in oklch, var(--purple) 16%, transparent), transparent 68%), radial-gradient(880px 520px at 96% 4%, color-mix(in oklch, var(--blue) 14%, transparent), transparent 70%)',
      bannerScrim: dark
        ? 'position:absolute;inset:0;background:linear-gradient(100deg, rgba(8,6,11,.97) 46%, rgba(8,6,11,.72))'
        : 'position:absolute;inset:0;background:linear-gradient(100deg, rgba(255,255,255,.97) 46%, rgba(255,255,255,.78))',
      heroCard: 'padding:30px 26px;border-radius:22px;border:1px solid rgba(236,240,248,.28);background:rgba(232,236,244,.07);backdrop-filter:blur(26px) saturate(150%);-webkit-backdrop-filter:blur(26px) saturate(150%);box-shadow:inset 0 1px 0 rgba(255,255,255,.4), 0 18px 50px -24px rgba(0,0,0,.8)',
      goInicio: () => this.setState({ view: 'dashboard' }),
      isDashboard: v === 'dashboard',
      isCursos: v === 'cursos',
      isLives: v === 'lives',
      isReels: v === 'reels',
      isFeed: v === 'dashboard',
      showHero: v !== 'dashboard' && v !== 'perfil',
      feedPlate: platePad,
      composerPlate: platePad + 'background-image:linear-gradient(135deg, rgba(229,23,122,.28) 0%, rgba(229,23,122,.10) 34%, rgba(76,111,224,.14) 66%, rgba(76,111,224,.30) 100%);',
      railPlate: platePad,
      feedTools: this.feedToolList.map((t, i) => ({
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
      onFeedFile: this.onFeedFile,
      feedFilters: this.feedFilterList.map((f) => ({
        name: f,
        pick: () => this.feedSetFilter(f),
        style: this.feedState.filter === f
          ? 'padding:9px 17px;border-radius:999px;font-size:12px;font-weight:700;color:#14111A;background:var(--pink);box-shadow:0 8px 18px -8px var(--pink), inset 0 1px 0 rgba(255,255,255,.3);cursor:pointer;transition:transform .2s cubic-bezier(.2,.85,.25,1)'
          : 'padding:9px 17px;border-radius:999px;font-size:12px;font-weight:600;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);box-shadow:var(--lg-edge);cursor:pointer;transition:transform .2s cubic-bezier(.2,.85,.25,1), color .2s ease'
      })),
      feedPosts: (this.livePosts.length ? this.livePosts : this.feedPostData).map((p) => {
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
            ? `width:42px;height:42px;flex:0 0 42px;border-radius:50%;background:center/cover no-repeat url('${p.authorPhotoURL || p.avatarUrl}')`
            : 'width:42px;height:42px;flex:0 0 42px;border-radius:50%;background:' + (p.g ? this.tvGrad(p.g) : 'linear-gradient(135deg,var(--pink),var(--purple))'),
          card: 'border-radius:24px;overflow:hidden;' + glassCard
        };
      }),
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
      } : null,
      isTv: v === 'tv',
      tvConnected: this.tvState.connected,
      tvOffline: !this.tvState.connected,
      tvConnect: this.tvToggleConnect,
      tvConnectTitle: this.tvState.connected ? 'Canal conectado a Waack On TV' : 'Conecta tu canal y publícalo en Waack On TV',
      tvConnectHint: this.tvState.connected
        ? 'Tus videos públicos se sincronizan cada 6 horas. Elige qué listas aparecen en la parrilla de la comunidad.'
        : 'Accede con tu cuenta de YouTube para traer tus videos, listas y estadísticas. Solo lectura: nada se publica sin tu confirmación.',
      tvGridLabel: this.tvState.cat === 'Todo' ? 'Parrilla de la comunidad' : this.tvState.cat,
      tvHeroThumb: this.tvGrad(['--pink', '--purple']),
      tvCats: this.tvCatList.map((c) => ({
        name: c,
        pick: () => this.tvSetCat(c),
        style: this.tvState.cat === c
          ? 'padding:10px 18px;border-radius:999px;font-size:12px;font-weight:700;color:#14111A;background:var(--pink);box-shadow:0 8px 18px -8px var(--pink), inset 0 1px 0 rgba(255,255,255,.3);cursor:pointer;transition:transform .2s cubic-bezier(.2,.85,.25,1)'
          : 'padding:10px 18px;border-radius:999px;font-size:12px;font-weight:600;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);box-shadow:var(--lg-edge);cursor:pointer;transition:transform .2s cubic-bezier(.2,.85,.25,1), color .2s ease'
      })),
      tvVideos: this.tvVideoData.map((x, i) => ({
        title: x.title, channel: x.channel, meta: x.meta, dur: x.dur,
        thumb: this.tvGrad(x.g),
        card: 'border-radius:22px;overflow:hidden;cursor:pointer;transition:transform .24s cubic-bezier(.2,.85,.25,1);' + glassCard,
        avatar: 'width:32px;height:32px;border-radius:50%;flex:0 0 32px;background:' + this.tvGrad(x.g)
      })),
      tvQueue: this.tvQueueData.map((x) => ({ title: x.title, channel: x.channel, meta: x.meta, dur: x.dur, thumb: this.tvGrad(x.g) })),
      tvChannels: this.tvChannelData.map((x) => ({
        name: x.name, subs: x.subs,
        avatar: 'width:38px;height:38px;border-radius:50%;flex:0 0 38px;background:' + this.tvGrad(x.g)
      })),
      tvPlate: platePad,
      navTv: this.nav(v === 'tv', 'var(--pink)'),
      goTv: () => this.setState({ view: 'tv' }),
      isPodcast: v === 'podcast',
      podPlaying: !!this.state.podPlaying,
      podPaused: !this.state.podPlaying,
      podEpLabel: 'Episodio ' + this.podEpisodes[this.state.podTrack || 0].n + ' · Waack On Radio',
      podTitle: this.podEpisodes[this.state.podTrack || 0].title,
      podGuest: this.podEpisodes[this.state.podTrack || 0].guest,
      podNotes: this.podEpisodes[this.state.podTrack || 0].notes,
      podDuration: this.podEpisodes[this.state.podTrack || 0].dur,
      podElapsed: this.podFmt(this.state.podPos || 0),
      podBars: this.buildPodBars(),
      podChapterList: this.buildPodChapters(),
      podLineList: this.buildPodLines(),
      podBack15: () => this.podSkip(-15),
      podFwd15: () => this.podSkip(15),
      podVol: this.podVol,
      setPodVol: this.setPodVol,
      togglePodSleep: this.togglePodSleep,
      podSleepBtn: 'display:inline-flex;align-items:center;gap:8px;padding:11px 17px;border-radius:999px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid ' + (this.podSleep ? 'color-mix(in oklch, var(--pink) 55%, transparent)' : 'var(--hair)') + ';background:var(--glass-2);color:' + (this.podSleep ? 'var(--ink)' : 'var(--ink-2)'),
      podSleepLabel: this.podSleep ? 'Temporizador 30 min · activo' : 'Temporizador de sueño',
      podList: this.buildPodList(),
      podBtnLabel: this.state.podPlaying ? 'Pausar' : 'Reproducir',
      podRateLabel: (this.state.podRate || 1) + 'x',
      podBtnMain: 'display:inline-flex;align-items:center;gap:9px;padding:13px 22px;border-radius:999px;color:#fff;background:linear-gradient(135deg,var(--pink),var(--purple));border:1px solid var(--hair);box-shadow:var(--lg-lift);cursor:pointer;transition:transform .18s ease',
      podBtnGhost: 'display:inline-flex;align-items:center;justify-content:center;gap:6px;width:auto;min-width:44px;height:44px;padding:0 14px;border-radius:999px;color:var(--ink);border:1px solid var(--hair);background:var(--glass-2);box-shadow:var(--lg-edge);cursor:pointer;transition:border-color .18s ease',
      podToggle: () => this.setState({ podPlaying: !this.state.podPlaying }, () => this.podTick()),
      podNext: () => this.podGo((this.state.podTrack || 0) + 1),
      podPrev: () => this.podGo((this.state.podTrack || 0) - 1),
      podRate: () => { const r = [1, 1.25, 1.5, 2]; const i = r.indexOf(this.state.podRate || 1); this.setState({ podRate: r[(i + 1) % r.length] }); },
      podSeek: (e) => {
        const b = e.currentTarget.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (e.clientX - b.left) / b.width));
        this.setState({ podPos: Math.floor(p * this.podEpisodes[this.state.podTrack || 0].secs) });
      },
      navPodcast: this.nav(v === 'podcast', 'var(--purple)'),
      goPodcast: () => this.setState({ view: 'podcast' }),
      isLab: v === 'entrenamiento',
      isStudy: v === 'study',
      isGrupos: v === 'grupos',
      isFisico: v === 'fisico',
      fisPlate: platePad,
      fisPart: this.fisState.part,
      fisPartLower: this.fisState.part.toLowerCase(),
      fisPartTime: (this.fisData[this.fisState.part] || {}).time,
      fisParts: Object.keys(this.fisData).map((p) => ({
        name: p,
        pick: () => this.fisSetPart(p),
        style: this.fisState.part === p
          ? 'padding:10px 18px;border-radius:999px;font-size:12px;font-weight:700;color:#14111A;background:var(--blue);box-shadow:0 8px 18px -8px var(--blue), inset 0 1px 0 rgba(255,255,255,.3);cursor:pointer;transition:transform .2s cubic-bezier(.2,.85,.25,1)'
          : 'padding:10px 18px;border-radius:999px;font-size:12px;font-weight:600;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);box-shadow:var(--lg-edge);cursor:pointer;transition:transform .2s cubic-bezier(.2,.85,.25,1), color .2s ease'
      })),
      fisExercises: ((this.fisData[this.fisState.part] || {}).items || []).map((e, i) => {
        const inR = this.fisState.routine.indexOf(e.name) !== -1;
        return {
          num: String(i + 1).padStart(2, '0'),
          name: e.name, kind: e.kind, dose: e.dose, level: e.level, note: e.note,
          add: () => this.fisToggle(e.name),
          btnLabel: inR ? 'En la rutina' : 'Añadir',
          btn: inR
            ? 'padding:8px 16px;border-radius:999px;font-size:11.5px;font-weight:700;color:#14111A;background:var(--blue);cursor:pointer;white-space:nowrap'
            : 'padding:8px 16px;border-radius:999px;font-size:11.5px;font-weight:600;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);cursor:pointer;white-space:nowrap',
          tag: "font-family:'Geist Mono',monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;padding:4px 9px;border-radius:999px;white-space:nowrap;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2)"
        };
      }),
      fisRoutine: this.fisState.routine.map((name) => {
        let part = '', dose = '';
        Object.keys(this.fisData).forEach((k) => {
          this.fisData[k].items.forEach((e) => { if (e.name === name) { part = k; dose = e.dose; } });
        });
        return { name, part, dose, remove: () => this.fisToggle(name) };
      }),
      fisRoutineEmpty: this.fisState.routine.length === 0,
      fisRoutineTime: this.fisState.routine.length + ' ejercicios',
      fisTips: this.fisTipList,
      isPerfil: v === 'perfil',
      stopProp: (e) => e.stopPropagation(),
      ...(() => {
        const p = this.perfState;
        const shown = this.perfMediaData.filter((m) => p.tab === 'Todo' || (p.tab === 'Vídeos' ? m.kind === 'Vídeo' : m.kind === 'Foto'));
        const chip = (active) => active
          ? 'padding:10px 18px;border-radius:999px;font-size:12px;font-weight:700;color:#14111A;background:var(--blue);box-shadow:0 8px 18px -8px var(--blue), inset 0 1px 0 rgba(255,255,255,.3);cursor:pointer'
          : 'padding:10px 18px;border-radius:999px;font-size:12px;font-weight:600;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);box-shadow:var(--lg-edge);cursor:pointer;transition:color .18s ease';
        return {
          perfCount: this.myPostCount,
          myName: this.myProfile?.displayName || this.state.user?.displayName || 'Sin nombre',
          myBio: this.myProfile?.bio || '',
          agTabs: ['Próximas', 'Pasadas', 'Todas'].map((t) => ({
            label: t, style: chip(p.agTab === t), pick: () => this.agPick(t)
          })),
          agCount: this.agendaData.filter((a) => a.when === 'next').length + ' PRÓX.',
          agPanelOpen: !!p.agShow,
          agPanelToggle: () => { this.perfState.agShow = !p.agShow; this.forceUpdate(); },
          agPanelClose: () => { this.perfState.agShow = false; this.forceUpdate(); },
          agPanelBtn: 'display:inline-flex;align-items:center;gap:10px;padding:11px 16px;border-radius:999px;border:1px solid ' + (p.agShow ? 'color-mix(in oklch, var(--pink) 50%, transparent)' : 'var(--hair)') + ';background:var(--glass-2);box-shadow:var(--lg-edge);cursor:pointer;transition:border-color .18s ease',
          agList: this.agendaData
            .filter((a) => p.agTab === 'Todas' || (p.agTab === 'Próximas' ? a.when === 'next' : a.when === 'past'))
            .map((a) => {
              const open = p.agOpen === a.id;
              const past = a.when === 'past';
              return {
                day: a.day, hour: a.hour, dur: a.dur, title: a.title, teacher: a.teacher,
                mode: a.mode, place: a.place, note: a.note, open,
                arrow: open ? '−' : '+',
                cta: past ? 'Ver grabación' : 'Entrar a la sala',
                row: 'display:flex;align-items:center;gap:16px;padding:14px 16px;border-radius:18px;cursor:pointer;border:1px solid ' + (open ? 'color-mix(in oklch, var(' + a.accent + ') 55%, transparent)' : 'var(--hair)') + ';background:var(--glass-2);box-shadow:var(--lg-edge);transition:border-color .18s ease, transform .18s ease;opacity:' + (past ? '.72' : '1'),
                date: 'flex:0 0 58px;text-align:center;padding:8px 0;border-radius:13px;background:color-mix(in oklch, var(' + a.accent + ') 16%, transparent);border:1px solid color-mix(in oklch, var(' + a.accent + ') 32%, transparent)',
                dayStyle: "font-family:'Geist Mono',monospace;font-size:9px;letter-spacing:.12em;color:var(" + a.accent + ')',
                hourStyle: 'font-size:13px;font-weight:800;color:var(--ink);margin-top:3px;font-variant-numeric:tabular-nums',
                tag: "display:inline-flex;padding:4px 10px;border-radius:999px;font-family:'Geist Mono',monospace;font-size:8.5px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:var(" + a.accent + ');border:1px solid color-mix(in oklch, var(' + a.accent + ') 40%, transparent);background:color-mix(in oklch, var(' + a.accent + ') 12%, transparent)',
                ctaStyle: 'display:inline-flex;align-items:center;padding:9px 16px;border-radius:999px;font-size:11.5px;font-weight:700;cursor:pointer;' + (past
                  ? 'color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2)'
                  : 'color:#14111A;background:var(' + a.accent + ');box-shadow:0 8px 18px -10px var(' + a.accent + ')'),
                toggle: () => this.agToggle(a.id)
              };
            }),
          perfFollowing: this.followCounts.following,
          perfFollowers: this.followCounts.followers,
          perfVideoCount: this.myMedia.filter((m: any) => m.kind === 'Vídeo').length,
          perfPhotoCount: this.myMedia.filter((m: any) => m.kind === 'Foto').length,
          perfEmpty: this.myMedia.length === 0,
          perfHighlights: [],
          perfHighlightsEmpty: true,
          perfTabs: ['Todo', 'Vídeos', 'Fotos'].map((t) => ({
            label: t, style: chip(p.tab === t),
            pick: () => { this.perfState.tab = t; this.forceUpdate(); }
          })),
          perfMedia: this.myMedia
            .filter((m: any) => p.tab === 'Todo' || (p.tab === 'Vídeos' ? m.kind === 'Vídeo' : m.kind === 'Foto'))
            .map((m: any) => ({
              badge: m.kind, likes: m.likes, mediaUrl: m.mediaUrl, isVideo: m.kind === 'Vídeo',
              open: () => {},
              tile: 'position:relative;aspect-ratio:1;border-radius:16px;overflow:hidden;cursor:pointer;transition:transform .2s ease;background:#000;box-shadow:0 14px 30px -18px rgba(0,0,0,.7)'
            })),
          perfSuggest: this.perfSuggestData.map((s, i) => ({
            handle: s.handle, meta: s.meta, ini: s.ini,
            av: 'width:38px;height:38px;flex:0 0 38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;background:linear-gradient(135deg,var(' + s.g[0] + '),var(' + s.g[1] + '))',
            toggle: () => this.perfToggleFollow(i),
            btnLabel: s.on ? 'Siguiendo' : 'Seguir',
            btnWide: s.on
              ? 'padding:8px 12px;border-radius:13px;text-align:center;font-size:10.5px;font-weight:700;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);cursor:pointer'
              : 'padding:8px 12px;border-radius:13px;text-align:center;font-size:10.5px;font-weight:700;color:#14111A;background:var(--blue);box-shadow:0 8px 18px -10px var(--blue);cursor:pointer',
            btn: s.on
              ? 'padding:8px 14px;border-radius:999px;font-size:11px;font-weight:700;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);cursor:pointer;white-space:nowrap'
              : 'padding:8px 14px;border-radius:999px;font-size:11px;font-weight:700;color:#14111A;background:var(--blue);box-shadow:0 8px 18px -8px var(--blue);cursor:pointer;white-space:nowrap'
          })),
          perfUploadOpen: p.upload,
          perfOpenUpload: () => { this.perfState.upload = true; this.forceUpdate(); },
          perfCloseUpload: () => { this.perfState.upload = false; this.forceUpdate(); },
          perfKinds: ['Vídeo', 'Foto'].map((k) => ({
            label: k, style: chip(p.kind === k),
            pick: () => { this.perfState.kind = k; this.forceUpdate(); }
          })),
          perfDropTitle: p.kind === 'Vídeo' ? 'Arrastra tu clip aquí' : 'Arrastra tu foto aquí',
          perfDropHint: p.kind === 'Vídeo' ? 'MP4 o MOV, hasta 90 segundos. Vertical recomendado.' : 'JPG o PNG, mínimo 1080 px de ancho.',
          perfDraft: p.draft,
          perfSetDraft: (e) => { this.perfState.draft = e.target.value; this.forceUpdate(); },
          perfPublish: this.perfPublishPost
        };
      })(),
      ...(() => {
        const list = this.fisRunList();
        const r = this.fisRun;
        const done = r.idx >= list.length;
        const cur = done ? null : list[r.idx];
        const total = this.fisSecsFor(cur && cur.dose);
        const mm = Math.floor(r.left / 60), ss = r.left % 60;
        const empty = this.fisState.routine.length === 0;
        return {
          fisStart: empty ? () => {} : this.fisStartRun,
          fisStartLabel: empty ? 'Añade ejercicios primero' : 'Empezar rutina',
          fisStartBtn: empty
            ? 'margin-top:18px;padding:13px 18px;border-radius:999px;text-align:center;font-size:12.5px;font-weight:700;color:var(--ink-3);border:1px solid var(--hair);background:var(--glass-2);cursor:default'
            : 'margin-top:18px;padding:13px 18px;border-radius:999px;text-align:center;font-size:12.5px;font-weight:700;color:#14111A;background:var(--pink);box-shadow:0 10px 22px -10px var(--pink), inset 0 1px 0 rgba(255,255,255,.3);cursor:pointer;transition:transform .18s ease',
          fisRunActive: r.active,
          fisRunPlaying: r.active && !done,
          fisRunDone: r.active && done,
          fisRunStep: done ? list.length + ' de ' + list.length : (r.idx + 1) + ' de ' + list.length,
          fisRunBar: 'height:100%;background:linear-gradient(90deg,var(--blue),var(--pink));transition:width .3s ease;width:'
            + Math.round(((done ? list.length : r.idx + (total ? (total - r.left) / total : 0)) / Math.max(1, list.length)) * 100) + '%',
          fisRunName: cur ? cur.name : '',
          fisRunPart: cur ? cur.part : '',
          fisRunKind: cur ? cur.kind : '',
          fisRunDose: cur ? cur.dose : '',
          fisRunNote: cur ? cur.note : '',
          fisRunClock: mm + ':' + String(ss).padStart(2, '0'),
          fisRunSummary: list.length + ' ejercicios, ' + Math.round(list.reduce((a, e) => a + this.fisSecsFor(e.dose), 0) / 60) + ' minutos de trabajo. Anota cómo se sintió la zona en el Somatic Diary.',
          fisPause: this.fisTogglePause,
          fisPauseLabel: r.paused ? 'Reanudar' : 'Pausa',
          fisNext: () => this.fisAdvance(),
          fisNextLabel: r.idx + 1 >= list.length ? 'Terminar' : 'Siguiente',
          fisStop: this.fisStopRun
        };
      })(),
      isEbooks: v === 'ebooks' || v === 'podcasts',
      isMuro: v === 'comunidad',
      isRanking: v === 'ranking',
      isPlanes: v === 'planes',
      isSupport: v === 'support',
      labBpm: this.labBpm,
      labBpmLabel: this.labBpm + ' BPM',
      setBpm: this.setBpm,
      toggleMetro: this.toggleMetro,
      metroRunning: this.labRunning,
      metroLabel: this.labRunning ? 'Detener metrónomo' : 'Iniciar metrónomo',
      metroDot: 'width:86px;height:86px;border-radius:50%;background:linear-gradient(135deg,var(--blue),var(--purple));box-shadow:0 0 44px -6px var(--blue);' + (this.labRunning ? 'animation:metroBeat ' + (60 / this.labBpm).toFixed(3) + 's ease-in-out infinite;' : 'opacity:.4;'),
      drills: this.buildDrills(),
      labTakes: this.buildTakes(),
      labFrames: this.buildFrames(),
      labCoach: this.buildCoach(),
      labTimeline: this.buildTimeline(),
      labStatCards: this.buildLabStats(),
      labRecLabel: this.labRec ? 'Detener' : 'Grabar',
      labRecOn: this.labRec,
      toggleRec: this.toggleRec,
      toggleMirror: this.toggleMirror,
      toggleGrid: this.toggleGrid,
      labGridOn: this.labGrid,
      labNote: this.labNote,
      onLabNote: this.onLabNote,
      labNoteCount: this.labNote.length + '/280',
      labTakeName: this.takeData[this.labTake].n,
      labTakeDrill: this.takeData[this.labTake].drill,
      labFrameTime: this.frameData[this.labFrame].t,
      labFrameTag: this.frameData[this.labFrame].tag,
      labMetrics: this.frameMetrics.map((m, i) => ({ key: 'fm' + i, kicker: m.k, value: m.v })),
      labStageRec: 'display:inline-flex;align-items:center;gap:7px;padding:6px 12px;border-radius:999px;font-family:\'Geist Mono\',monospace;font-size:9.5px;letter-spacing:.14em;color:' + (this.labRec ? '#fff' : 'var(--ink-2)') + ';background:' + (this.labRec ? 'var(--pink)' : 'color-mix(in oklch, var(--ground) 62%, transparent)') + ';border:1px solid var(--hair)',
      labRecDot: 'width:7px;height:7px;border-radius:50%;background:' + (this.labRec ? '#fff' : 'var(--ink-3)') + ';' + (this.labRec ? 'animation:metroBeat 1s ease-in-out infinite' : ''),
      labMirrorBtn: 'display:inline-flex;align-items:center;gap:8px;padding:11px 18px;border-radius:999px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid ' + (this.labMirror ? 'color-mix(in oklch, var(--blue) 55%, transparent)' : 'var(--hair)') + ';background:var(--glass-2);color:' + (this.labMirror ? 'var(--ink)' : 'var(--ink-2)'),
      labGridBtn: 'display:inline-flex;align-items:center;gap:8px;padding:11px 18px;border-radius:999px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid ' + (this.labGrid ? 'color-mix(in oklch, var(--blue) 55%, transparent)' : 'var(--hair)') + ';background:var(--glass-2);color:' + (this.labGrid ? 'var(--ink)' : 'var(--ink-2)'),
      labRecBtn: 'display:inline-flex;align-items:center;gap:9px;padding:11px 20px;border-radius:999px;font-size:12px;font-weight:700;cursor:pointer;border:1px solid transparent;color:#fff;background:' + (this.labRec ? 'var(--pink)' : 'color-mix(in oklch, var(--pink) 78%, transparent)') + ';box-shadow:0 8px 18px -10px var(--pink), inset 0 1px 0 rgba(255,255,255,.3)',
      labGridOverlay: this.labGrid
        ? 'position:absolute;inset:0;background-image:linear-gradient(to right, color-mix(in oklch, var(--ink) 16%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--ink) 16%, transparent) 1px, transparent 1px);background-size:11.11% 11.11%;pointer-events:none'
        : 'display:none',
      moods: this.buildMoods(),
      bodyZones: this.buildBody(),
      libTabs: this.buildLibTabs(),
      libItems: this.buildLib(),
      wallPosts: this.buildWall(),
      challenges: this.buildChallenges(),
      rankRows: this.buildRank(),
      badges: this.buildBadges(),
      plans: this.buildPlans(),
      planMsg: this.planMsg,
      planPickerOpen: this.planPickerOpen,
      planPickerClose: () => { this.planPickerOpen = false; this.forceUpdate(); },
      planPickerStop: (e) => e.stopPropagation(),
      planPickerList: this.teacherData.map((t) => ({ key: t.uid || t.id, name: t.name, role: t.role, pick: () => this.payStart('catedra', t.uid || t.id) })),
      showRoleDemo: !!import.meta.env.DEV,
      cycleTabs: this.buildCycleTabs(),
      faqs: this.buildFaq(),
      loginToggleLabel: v === 'login' ? 'Ver la app' : 'Ver pantalla de acceso',
      showLoginToggle: false,
      logout: this.logout,
      loginInfo: this.loginForm.info,
      loginSubmitLabel: this.loginForm.mode === 'signup' ? 'Crear cuenta' : 'Log In',
      loginSwitchText: this.loginForm.mode === 'signup' ? 'Already have an account?' : "Don't have an account?",
      loginSwitchLabel: this.loginForm.mode === 'signup' ? 'Log In' : 'Sign Up',
      toggleLoginMode: this.toggleLoginMode,
      googleLogin: this.googleLogin,
      forgotPassword: this.forgotPassword,
      bannerRef: this.bannerRef,
      heroVideoRef: this.heroVideoRef,
      loginVideoRef: this.loginVideoRef,
      insVideoRef: this.insVideoRef,
      isInstructor: v === 'instructor',
      navInstructor: this.nav(v === 'instructor', 'var(--purple)'),
      goInstructor: () => this.setState({ view: 'instructor' }),
      insTabList: this.buildInsTabs(),
      insChips: this.buildStudentChips(),
      insStatCards: this.buildInsStats(),
      insRows: this.buildStudentRows(),
      insIsDashboard: this.insTab === 'dashboard',
      insIsStudents: this.insTab === 'students',
      insIsClasses: this.insTab === 'classes',
      insIsFinances: this.insTab === 'finances',
      insIsDocs: this.insTab === 'documents',
      insIsMethod: this.insTab === 'methodology',
      insIsPublish: this.insTab === 'publish',
      insIsPods: this.insTab === 'podcasts',
      insIsOverview: this.insTab === 'overview',
      insIsPromo: this.insTab === 'promotion',
      insClassList: this.buildInsClasses(),
      insDocList: this.myEbooks().length
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
      ebErr: this.ebErr,
      insCourseList: this.simpleList(this.insCourses),
      insPodList: this.simpleList(this.insPods),
      insBpm: this.insBpm,
      insBpmLabel: this.insBpm + ' BPM',
      setInsBpm: this.setInsBpm,
      insLive: this.insLive,
      toggleInsLive: this.toggleInsLive,
      insLiveLabel: this.insLive ? 'Terminar clase en vivo' : 'Abrir sala en vivo',
      isRealInstructor: this.isDocente(),
      liveOn: !!this.liveStream,
      liveToggle: this.liveToggle,
      liveToggleLabel: this.liveBusy ? 'Abriendo cámara…' : (this.liveStream ? 'Terminar transmisión' : 'Encender cámara e ir en vivo'),
      liveToggleStyle: 'padding:12px 22px;border-radius:999px;font-size:12.5px;font-weight:700;cursor:pointer;' + (this.liveStream
        ? 'color:#fff;background:var(--pink)'
        : 'color:#1A1400;background:linear-gradient(90deg,var(--gold-hi),var(--gold-lo));box-shadow:inset 0 1px 0 rgba(255,255,255,.5)'),
      liveViewersLabel: this.liveViewers.size + (this.liveViewers.size === 1 ? ' espectador conectado' : ' espectadores conectados') + ' · máx. ' + this.LIVE_MAX_VIEWERS,
      liveErr: this.liveErr,
      setLivePreviewEl: this.setLivePreviewEl,
      setLiveWatchEl: this.setLiveWatchEl,
      liveList: this.liveSessions
        .filter((x: any) => x.uid !== this.state.user?.uid && (!x.startedAt?.seconds || Date.now() / 1000 - x.startedAt.seconds < 43200))
        .map((x: any) => ({ key: x.uid, name: x.displayName || 'Alguien', watch: () => this.liveWatch(x.uid, x.displayName || 'Alguien') })),
      liveHasList: this.liveSessions.some((x: any) => x.uid !== this.state.user?.uid && (!x.startedAt?.seconds || Date.now() / 1000 - x.startedAt.seconds < 43200)),
      liveIsWatching: !!this.liveWatching,
      evUpcomingList: this.evUpcoming().map((e: any) => this.evRow(e)),
      evHasUpcoming: this.evUpcoming().length > 0,
      evMine: this.evUpcoming().filter((e: any) => e.ownerId === auth.currentUser?.uid).map((e: any) => this.evRow(e)),
      evTitleValue: this.evTitle, evDescValue: this.evDesc, evWhenValue: this.evWhen, evDurationValue: this.evDuration,
      evTitleChange: this.evTitleChange, evDescChange: this.evDescChange, evWhenChange: this.evWhenChange, evDurationChange: this.evDurationChange,
      evSubmit: this.evSubmit, evSubmitLabel: this.evBusy ? 'Programando…' : 'Programar clase', evErr: this.evErr,
      ccOn: this.ccOn,
      ccToggle: this.ccToggle,
      ccToggleLabel: this.ccOn ? 'Subtítulos: activados' : 'Activar subtítulos',
      ccSupported: speechSupported(),
      ccLangs: CAPTION_LANGS.map(([k, label]) => ({ key: k, label, pick: () => this.ccPickLang(k), style: 'padding:6px 12px;border-radius:999px;font-size:11px;cursor:pointer;' + (this.ccLang === k ? 'font-weight:700;color:#fff;background:var(--purple)' : 'color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2)') })),
      ccTargets: CAPTION_LANGS.map(([k, label]) => ({ key: k, label, pick: () => this.ccPickTarget(k), style: 'padding:6px 12px;border-radius:999px;font-size:11px;cursor:pointer;' + (this.ccTarget === k ? 'font-weight:700;color:#fff;background:var(--blue)' : 'color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2)') })),
      ccText: this.liveWatching ? this.ccCurrent() : '',
      ccHasText: !!(this.liveWatching && this.ccCurrent()),
      ccTranslateNote: translatorSupported() ? 'La traducción se hace en tu dispositivo.' : 'Para traducir en vivo usa Chrome o Edge actualizados; sin eso verás los subtítulos en el idioma original.',
      liveWatchName: this.liveWatching?.name || '',
      liveWatchStatus: this.liveWatching?.connected ? 'EN VIVO' : 'Conectando…',
      liveLeave: this.liveLeave,
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
      gCanClase: this.isDocente(),
      gKindPicker: [['grupo', 'Grupo de amigos'], ['clase', 'Clase grupal']].map(([k, label]) => ({
        key: k, label, pick: () => this.gSetKind(k as any),
        style: 'padding:9px 16px;border-radius:999px;font-size:12px;cursor:pointer;' + (this.gKind === k
          ? 'font-weight:700;color:#fff;background:var(--purple);'
          : 'font-weight:600;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);')
      })),
      gNameValue: this.gName, gDescValue: this.gDesc, gJoinValue: this.gJoinCode, gTextValue: this.gText,
      gNameChange: this.gNameChange, gDescChange: this.gDescChange, gJoinChange: this.gJoinChange, gTextChange: this.gTextChange,
      gCreate: this.gCreate, gJoin: this.gJoin,
      gCreateLabel: this.gBusy ? 'Creando…' : (this.gKind === 'clase' && this.isDocente() ? 'Crear grupo de clase' : 'Crear grupo'),
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
      gLeave: this.gLeave, gDelete: this.gDelete,
      isInstructorLocked: v === 'instructor' && !this.isDocente(),
      insStudentMgmt: this.buildInsStudentMgmt(),
      insCommHub: this.buildInsCommHub(),
      insLiveShortLabel: this.insLive ? 'Terminar clase' : 'Start Live Class',
      insFinBanner: !!this.insEarnings && !this.insEarnings.chargesEnabled,
      insFinBannerText: this.insEarnings && !this.insEarnings.onboarded
        ? 'Todavía no activaste tus cobros. Actívalos para poder retirar tu dinero.'
        : 'Tu cuenta de cobros está en revisión de Stripe. En cuanto se active, verás tu saldo real aquí.',
      insFinConnect: () => startConnectOnboarding().catch((e) => { this.insEarningsErr = e.message; this.forceUpdate(); }),
      insFinYourShareLabel: 'Tu parte · ' + (this.insEarnings ? (100 - this.insEarnings.feePercent) : 75) + '%',
      insFinPlatformShareLabel: 'Plataforma · ' + (this.insEarnings ? this.insEarnings.feePercent : 25) + '%',
      insFinNet: this.fmtCents(this.insEarnings?.monthlyNetCents, this.insEarnings?.currency),
      insFinGross: this.fmtCents(this.insEarnings ? this.insEarnings.monthlyGrossCents - this.insEarnings.monthlyNetCents : null, this.insEarnings?.currency),
      insFinAvailable: this.fmtCents(this.sumMinor(this.insEarnings?.available), this.insEarnings?.currency),
      insFinPending: this.fmtCents(this.sumMinor(this.insEarnings?.pending), this.insEarnings?.currency),
      insFinSubs: this.insEarnings ? this.insEarnings.activeSubscribers : '—',
      insFinLastPayout: this.insEarnings?.lastPayout ? this.fmtCents(this.insEarnings.lastPayout.amount, this.insEarnings.lastPayout.currency) : '—',
      insFinLastPayoutDate: this.insEarnings?.lastPayout ? ('Pagado · ' + new Date(this.insEarnings.lastPayout.arrivalDate * 1000).toLocaleDateString('es-ES')) : (this.insEarningsBusy ? 'Cargando…' : 'Sin pagos todavía'),
      roleName: this.role().name,
      roleShort: this.role().short,
      roleDesc: this.role().desc,
      roleBadge: 'display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:999px;font-family:"Geist Mono",monospace;font-size:10px;font-weight:700;letter-spacing:.12em;white-space:nowrap;color:' + this.role().ink + ';background:' + this.role().color,
      roleLine: 'font-family:"Geist Mono",monospace;font-size:9px;margin-top:3px;color:' + this.role().color,
      hasPlatform: this.subs.platform,
      hasInstructor: this.subs.instructor,
      togglePlatform: () => this.toggleSub('platform'),
      toggleInstructor: () => this.toggleSub('instructor'),
      subPlatformStyle: 'display:flex;align-items:center;gap:10px;padding:13px 16px;border-radius:18px;cursor:pointer;font-size:13px;font-weight:600;transition:border-color .2s ease;border:1px solid ' + (this.subs.platform ? 'color-mix(in oklch, var(--purple) 60%, transparent)' : 'var(--hair)') + ';background:var(--glass-2);color:' + (this.subs.platform ? 'var(--ink)' : 'var(--ink-2)'),
      subInstructorStyle: 'display:flex;align-items:center;gap:10px;padding:13px 16px;border-radius:18px;cursor:pointer;font-size:13px;font-weight:600;transition:border-color .2s ease;border:1px solid ' + (this.subs.instructor ? 'color-mix(in oklch, var(--blue) 60%, transparent)' : 'var(--hair)') + ';background:var(--glass-2);color:' + (this.subs.instructor ? 'var(--ink)' : 'var(--ink-2)'),
      acctOpen: this.state.acct,
      notifOpen: !!this.state.notif,
      notifToggle: () => this.setState({ notif: !this.state.notif, acct: false }),
      notifClose: () => this.setState({ notif: false }),
      notifUnreadCount: this.liveNotifs.filter((n) => !n.read).length,
      notifReadAll: () => markAllNotificationsRead(this.liveNotifs).catch(() => {}),
      notifEmpty: this.liveNotifs.length === 0,
      notifList: this.liveNotifs.map((n) => ({
        title: n.title, text: n.text, time: this.timeAgo(n.createdAt),
        row: 'display:flex;gap:11px;align-items:flex-start;padding:11px 12px;border-radius:16px;cursor:pointer;transition:background .18s ease;' + (!n.read ? 'background:color-mix(in oklch, var(--blue) 8%, transparent)' : ''),
        dot: 'width:8px;height:8px;flex:0 0 8px;margin-top:5px;border-radius:50%;background:' + (!n.read ? 'var(' + (this.notifTypeColor[n.type] || '--pink') + ')' : 'var(--hair)'),
        read: () => { if (!n.read) markNotificationRead(n.id).catch(() => {}); }
      })),
      acctToggle: () => this.setState({ acct: !this.state.acct }),
      acctClose: () => this.setState({ acct: false }),
      acctAvatar: 'width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;background:' + (this.myProfile?.photoURL ? `center/cover no-repeat url('${this.myProfile.photoURL}')` : 'linear-gradient(135deg,var(--purple),var(--pink))') + ';cursor:pointer;transition:box-shadow .2s ease;box-shadow:' + (this.state.acct ? '0 0 0 2px var(--ground), 0 0 0 4px var(--pink)' : 'var(--lg-edge)'),
      myInitial: this.myProfile?.photoURL ? '' : (this.myProfile?.displayName || this.state.user?.displayName || this.state.user?.email || '?').trim().slice(0, 1).toUpperCase(),
      myDropAvatar: 'width:44px;height:44px;flex:0 0 44px;border-radius:50%;background:' + (this.myProfile?.photoURL ? `center/cover no-repeat url('${this.myProfile.photoURL}')` : 'linear-gradient(135deg,var(--purple),var(--pink))') + ';display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:#fff',
      navAvatar: 'width:34px;height:34px;flex:0 0 34px;border-radius:50%;background:' + (this.myProfile?.photoURL ? `center/cover no-repeat url('${this.myProfile.photoURL}')` : 'linear-gradient(135deg,var(--purple),var(--pink))') + ';display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff',
      myComposerAvatar: 'width:38px;height:38px;flex:0 0 38px;border-radius:50%;background:' + (this.myProfile?.photoURL ? `center/cover no-repeat url('${this.myProfile.photoURL}')` : 'linear-gradient(135deg,var(--purple),var(--pink))') + ';display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff',
      myDisplayName: this.myProfile?.displayName || this.state.user?.displayName || 'Sin nombre',
      myHandle: this.myProfile?.handle ? '@' + this.myProfile.handle : (this.state.user?.email ? '@' + this.state.user.email.split('@')[0] : '@usuario'),
      perfAvatarStyle: 'width:100%;height:100%;border-radius:50%;border:3px solid var(--ground);display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:800;color:#fff;letter-spacing:-.02em;cursor:pointer;background:' + (this.myProfile?.photoURL ? `center/cover no-repeat url('${this.myProfile.photoURL}')` : 'linear-gradient(135deg,var(--purple),var(--pink))'),
      perfAvatarBusy: this.myAvatarBusy,
      perfAvatarPct: this.myAvatarPct == null ? '' : Math.round(this.myAvatarPct) + '%',
      perfAvatarErr: this.myAvatarErr,
      onMyAvatarPick: this.onMyAvatarPick,
      onMyAvatarFile: this.onMyAvatarFile,
      isInstructor: ['instructor', 'estudio', 'admin'].includes(this.myProfile?.role || 'usuario'),
      perfInstructorModalOpen: this.perfInstructorModalOpen,
      perfInstructorReason: this.perfInstructorReason,
      perfInstructorErr: this.perfInstructorErr,
      perfInstructorBusy: this.perfInstructorBusy,
      perfBecomeInstructorClick: this.perfBecomeInstructorClick,
      perfCloseInstructorModal: this.perfCloseInstructorModal,
      perfSetInstructorReason: this.perfSetInstructorReason,
      perfSubmitInstructorRequest: this.perfSubmitInstructorRequest,
      stopProp: (e: any) => e.stopPropagation(),
      acctLinks: [
        { label: 'Mi perfil', view: 'perfil' },
        ...(['instructor', 'estudio', 'admin'].includes(this.myProfile?.role || 'usuario') ? [{ label: 'Panel de instructor', view: 'instructor' }] : []),
        { label: 'Planes & Membresía', view: 'planes' },
        { label: 'Cuerpo & Estiramientos', view: 'fisico' },
        { label: 'Música', view: 'musica' },
        { label: 'Ayuda & Legal', view: 'support' }
      ].map((l) => ({
        label: l.label,
        go: () => this.setState({ view: l.view, acct: false }),
        style: 'display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;cursor:pointer;font-size:12.5px;font-weight:600;transition:background .16s ease, color .16s ease;color:' + (v === l.view ? '#FFFFFF' : 'rgba(255,255,255,.78)') + ';background:' + (v === l.view ? 'rgba(255,255,255,.12)' : 'transparent')
      })),
      acctSwitch: 'position:relative;display:inline-block;width:34px;height:19px;border-radius:999px;flex:0 0 34px;transition:background .2s ease;background:' + (this.subs.docente ? 'var(--gold)' : 'var(--glass-2)') + ';border:1px solid ' + (this.subs.docente ? 'transparent' : 'var(--hair)'),
      acctKnob: 'position:absolute;top:2px;left:' + (this.subs.docente ? '17px' : '2px') + ';width:13px;height:13px;border-radius:50%;background:' + (this.subs.docente ? '#1A1400' : 'var(--ink-3)') + ';transition:left .2s ease',
      isDocente: this.subs.docente,
      toggleDocente: () => this.toggleSub('docente'),
      subDocenteStyle: 'display:flex;align-items:center;gap:10px;padding:13px 16px;border-radius:18px;cursor:pointer;font-size:13px;font-weight:600;transition:border-color .2s ease;border:1px solid ' + (this.subs.docente ? 'color-mix(in oklch, var(--gold) 60%, transparent)' : 'var(--hair)') + ';background:var(--glass-2);color:' + (this.subs.docente ? 'var(--ink)' : 'var(--ink-2)'),
      dirQuery: this.dirState.q,
      dirSetQuery: this.dirSetQ,
      ...(() => {
        const q = this.dirState.q.trim().toLowerCase();
        const list = this.dirData
          .filter((d) => !q || (d.n + ' ' + d.c + ' ' + d.sp.join(' ')).toLowerCase().indexOf(q) !== -1)
          .slice()
          .sort((a, b) => (b.hi ? 1 : 0) - (a.hi ? 1 : 0));
        const loop = list.length >= 4 && !q;
        const mk = (d, i) => ({
            name: d.n, country: d.c, price: d.pr, ini: d.ini, rating: d.r, votes: d.v, handle: d.h, hi: d.hi,
            sp: d.sp.map((s, j) => ({ key: d.h + j, text: s })),
            av: 'width:38px;height:38px;flex:0 0 38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;background:linear-gradient(135deg,var(' + d.g[0] + '),var(' + d.g[1] + '))',
            priceStyle: 'display:inline-block;margin-top:10px;padding:5px 10px;border-radius:999px;font-family:\'Geist Mono\',monospace;font-size:9px;font-weight:700;color:#1A1400;background:linear-gradient(90deg,var(--gold-hi),var(--gold-lo))',
            card: 'position:relative;padding:13px;min-width:0;border-radius:18px;border:1px solid ' + (d.hi ? 'color-mix(in oklch, var(--gold) 28%, transparent)' : 'var(--hair)') + ';background:var(--glass-2);cursor:pointer;transition:transform .2s ease, border-color .2s ease;animation:rise3d .7s cubic-bezier(.2,.85,.25,1) ' + (0.06 * i).toFixed(2) + 's backwards'
        });
        return {
          dirEmpty: list.length === 0,
          dirTeachers: list.map(mk),
          dirTeachersLoop: loop ? list.map(mk) : [],
          dirTrackStyle: 'display:flex;flex-direction:column;gap:10px;'
            + (loop
              ? 'animation:dirScroll ' + (list.length * 7) + 's linear infinite;will-change:transform'
              : 'max-height:430px;overflow-y:auto')
        };
      })(),
      navOpen: this.navIsOpen(),
      asideW: this.navIsOpen() ? '266px' : '78px',
      navLabel: this.navIsOpen() ? 'flex:1' : 'display:none',
      navGroupLabel: this.navIsOpen()
        ? "font-family:'Geist Mono',monospace;font-size:9px;font-weight:700;letter-spacing:.22em;color:" + this.chromeInk3()
        : 'display:none',
      navKicker: this.navIsOpen()
        ? "font-family:'Geist Mono',monospace;font-size:8px;letter-spacing:.26em;color:var(--gold-text);font-weight:700;margin-top:8px"
        : 'display:none',
      navLogo: this.navIsOpen()
        ? 'width:200px;height:200px;object-fit:contain;display:block;filter:drop-shadow(0 12px 30px rgba(120,130,220,.45))'
        : 'width:56px;height:56px;object-fit:contain;display:block;filter:drop-shadow(0 8px 18px rgba(120,130,220,.5))',
      navCollapsed: !this.navIsOpen(),
      toggleNav: () => this.setState({ navOpen: !this.navIsOpen() }),
      navToggleLabel: this.navIsOpen() ? 'Recoger menú' : 'Expandir menú',
      adTiles: this.buildAds(plateSkin, plateBlur),
      adsBanner: 'position:relative;overflow:hidden;border-radius:22px;padding:14px 0;margin-bottom:26px;max-width:1180px;' + plateSkin + plateBlur,
      heroKicker: (this.hero(v) || {}).kicker,
      heroTitle: (this.hero(v) || {}).title,
      heroSub: (this.hero(v) || {}).sub,
      heroCta: (this.hero(v) || {}).cta,
      heroKickerStyle: "font-family:'Geist Mono',monospace;font-size:10px;letter-spacing:.22em;font-weight:700;text-transform:uppercase;color:" + (this.hero(v) || {}).accent,
      navIdle: this.nav(false),
      navLab: this.nav(v === 'entrenamiento', 'var(--blue)'),
      navStudy: this.nav(v === 'study', 'var(--yellow)'),
      navGrupos: this.nav(v === 'grupos', 'var(--blue)'),
      navFisico: this.nav(v === 'fisico', 'var(--blue)'),
      navEbooks: this.nav(v === 'ebooks', 'var(--blue)'),
      navPodcasts: this.nav(v === 'podcasts' || v === 'podcast', 'var(--pink)'),
      navMuro: this.nav(v === 'comunidad', 'var(--pink)'),
      navRanking: this.nav(v === 'ranking', 'var(--pink)'),
      navPlanes: this.nav(v === 'planes', 'var(--purple)'),
      navSupport: this.nav(v === 'support', 'var(--purple)'),
      goLab: () => this.setState({ view: 'entrenamiento' }),
      goStudy: () => this.setState({ view: 'study' }),
      goGrupos: () => { this.gBack(); this.setState({ view: 'grupos' }); },
      goGruposClase: () => { this.gBack(); this.gMode = 'create'; this.gKind = 'clase'; this.setState({ view: 'grupos' }); },
      goFisico: () => this.setState({ view: 'fisico' }),
      goPerfil: () => this.setState({ view: 'perfil' }),
      goCuenta: () => this.setState({ view: 'cuenta' }),
      navPerfil: this.nav(v === 'perfil', 'var(--pink)'),
      goEbooks: () => { this.libTab = 'Manual'; this.setState({ view: 'ebooks' }); },
      goPodcasts: () => { this.libTab = 'Podcast'; this.setState({ view: 'podcasts' }); },
      goMuro: () => this.setState({ view: 'comunidad' }),
      goRanking: () => this.setState({ view: 'ranking' }),
      goPlanes: () => this.setState({ view: 'planes' }),
      goSupport: () => this.setState({ view: 'support' }),
      navDashboard: this.nav(v === 'dashboard', 'var(--blue)'),
      navCursos: this.nav(v === 'cursos', 'var(--blue)'),
      navLives: this.nav(v === 'lives', 'var(--pink)'),
      navReels: this.nav(v === 'reels', 'var(--pink)'),
      annTabs: this.buildAnnTabs(),
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
      annErr: this.annErr,
      trackList: this.buildTracks(),
      nowPlaying: this.trackData[this.playingIndex].t,
      nowPlayingBpm: this.trackData[this.playingIndex].bpm,
      chatOpen: this.chatState.open,
      chatClosed: !this.chatState.open,
      chatRoomList: this.buildChatRooms(),
      chatRoom: this.activeRoom(),
      inRoom: !!this.chatState.roomId,
      chatRoomsVisible: !this.chatState.roomId,
      chatQuery: this.chatState.query,
      onChatQuery: this.onChatQuery,
      toggleChat: this.toggleChat,
      closeChat: this.closeChat,
      backToRooms: this.backToRooms,
      chatTotalUnread: '13',
      loginEmail: this.loginForm.email,
      loginPass: this.loginForm.pass,
      loginError: this.loginForm.error,
      onEmail: (e) => this.setLoginField('email', e.target.value),
      onPass: (e) => this.setLoginField('pass', e.target.value),
      submitLogin: this.submitLogin,
      teacherTabs: this.buildTeacherTabs(),
      teacherSections: this.buildTeacherSections(),
      lockedTeachers: this.buildLocked(),
      rootRef: this.rootRef,
      bgVideoRef: this.bgVideoRef,
      platePanel: platePad + 'display:flex;flex-direction:column;gap:10px;perspective:1400px;perspective-origin:50% 0%;',
      plateRow: platePad + 'display:flex;flex-direction:column;gap:12px;perspective:1400px;perspective-origin:50% 0%;',
      reelItems: this.buildReels(),
      reelMuted: this.reelState.muted,
      muteLabel: this.reelState.muted ? 'Sonido apagado' : 'Sonido activo',
      toggleMute: this.toggleMute,
      feedRef: this.feedRef,
      reelNext: () => this.scrollReel(1),
      reelPrev: () => this.scrollReel(-1),
      tabForYou: this.reelState.tab === 'Para ti' ? tabOn : tabOff,
      tabFollowing: this.reelState.tab === 'Siguiendo' ? tabOn : tabOff,
      pickForYou: () => this.setReelTab('Para ti'),
      pickFollowing: () => this.setReelTab('Siguiendo'),
      reelUploadOpen: this.reelUploadOpen,
      reelUploadShow: this.reelUploadShow,
      reelUploadHide: this.reelUploadHide,
      reelPickFile: this.reelPickFile,
      reelOnFile: this.reelOnFile,
      reelFileName: this.reelUploadFile?.name ?? '',
      reelCaptionValue: this.reelUploadCaption,
      reelCaptionChange: this.reelCaptionChange,
      reelMusicValue: this.reelUploadMusic,
      reelMusicChange: this.reelMusicChange,
      reelUploadErr: this.reelUploadErr,
      reelSubmitUpload: this.reelSubmitUpload,
      reelUploadLabel: this.reelUploadBusy ? (this.reelUploadPct == null ? 'Publicando…' : Math.round(this.reelUploadPct) + '%') : 'Publicar reel',
      statGrid: grid3d + 'grid-template-columns:repeat(auto-fit,minmax(200px,1fr));backdrop-filter:none;-webkit-backdrop-filter:none;background:' + (dark ? 'linear-gradient(135deg,#2B2E35 0%,#1C1E23 26%,#383C45 52%,#191B20 74%,#2F333B 100%)' : 'linear-gradient(135deg,#FFFFFF 0%,#EEF1F6 26%,#FFFFFF 52%,#E7EBF2 74%,#FFFFFF 100%)') + ';',
      cardGrid: grid3d + 'grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;',
      reelGrid: grid3d + 'grid-template-columns:repeat(auto-fill,minmax(210px,1fr));',
      statCard: 'padding:22px;border-radius:22px;' + glassCard,
      statCard1: 'padding:22px;border-radius:22px;' + glassCard + rise(0),
      statCard2: 'padding:22px;border-radius:22px;' + glassCard + rise(1),
      statCard3: 'padding:22px;border-radius:22px;' + glassCard + rise(2),
      statCard4: 'padding:22px;border-radius:22px;' + glassCard + rise(3),
      listCard: 'display:flex;gap:12px;padding:14px;border-radius:20px;cursor:pointer;' + glassCard,
      courseCard: 'border-radius:24px;overflow:hidden;cursor:pointer;' + glassCard,
      courseCard1: 'border-radius:24px;overflow:hidden;cursor:pointer;' + glassCard + rise(0),
      courseCard2: 'border-radius:24px;overflow:hidden;cursor:pointer;' + glassCard + rise(1),
      courseCard3: 'border-radius:24px;overflow:hidden;cursor:pointer;' + glassCard + rise(2),
      courseCard4: 'border-radius:24px;overflow:hidden;cursor:pointer;' + glassCard + rise(3),
      reelCard: 'border-radius:22px;overflow:hidden;cursor:pointer;' + glassCard,
      reelCard1: 'border-radius:22px;overflow:hidden;cursor:pointer;' + glassCard + rise(0),
      reelCard2: 'border-radius:22px;overflow:hidden;cursor:pointer;' + glassCard + rise(1),
      reelCard3: 'border-radius:22px;overflow:hidden;cursor:pointer;' + glassCard + rise(2),
      reelCard4: 'border-radius:22px;overflow:hidden;cursor:pointer;' + glassCard + rise(3),
      reelCard5: 'border-radius:22px;overflow:hidden;cursor:pointer;' + glassCard + rise(4),
      reelCard6: 'border-radius:22px;overflow:hidden;cursor:pointer;' + glassCard + rise(5),
      chipOn: 'padding:10px 18px;border-radius:999px;font-size:12px;font-weight:700;color:#fff;background:var(--blue);box-shadow:0 8px 18px -8px var(--blue), inset 0 1px 0 rgba(255,255,255,.3);cursor:pointer;transform-style:preserve-3d;transition:transform .2s cubic-bezier(.2,.85,.25,1), box-shadow .2s ease;animation:btnFloat3d 3.4s ease-in-out infinite',
      chipLive: 'padding:10px 18px;border-radius:999px;font-size:12px;font-weight:700;color:#14111A;background:var(--pink);box-shadow:0 8px 18px -8px var(--pink), inset 0 1px 0 rgba(255,255,255,.3);cursor:pointer;transform-style:preserve-3d;transition:transform .2s cubic-bezier(.2,.85,.25,1), box-shadow .2s ease;animation:btnFloat3d 3.4s ease-in-out infinite',
      chipOff: 'padding:10px 18px;border-radius:999px;font-size:12px;font-weight:600;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);box-shadow:var(--lg-edge);cursor:pointer;transform-style:preserve-3d;transition:transform .2s cubic-bezier(.2,.85,.25,1), color .2s ease',
      onBattleChip: this.battleToggleMenu,
      battleChipStyle: this.battlePanel !== 'off'
        ? 'padding:10px 18px;border-radius:999px;font-size:12px;font-weight:700;color:#14111A;background:var(--pink);cursor:pointer'
        : 'padding:10px 18px;border-radius:999px;font-size:12px;font-weight:600;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);cursor:pointer',
      battlePanelOpen: this.battlePanel !== 'off',
      battleShowMenu: this.battlePanel === 'menu',
      battleShowPick: this.battlePanel === 'pick',
      battleShowCall: this.battlePanel === 'call',
      battleLiveLabel: this.liveStream ? 'Terminar transmisión' : 'Ir en vivo con mi cámara',
      onBattleGoLive: this.liveToggle,
      battlePracticeEnabled: this.myInstructorList().length > 0,
      battlePracticeCardStyle: 'flex:1;min-width:220px;padding:18px;border-radius:18px;border:1px solid var(--hair);background:var(--glass-2);' + (this.myInstructorList().length > 0 ? 'cursor:pointer' : 'cursor:default;opacity:.5'),
      onBattleOpenPractice: this.battleOpenPractice,
      battleInstructors: this.myInstructorList().map((i: any) => ({ id: i.id, name: i.name, call: () => this.battleCallInstructor(i.id) })),
      battleIncomingCalls: this.battleIncoming.map((c: any) => ({
        id: c.id, from: this.resolveUserName(c.callerId),
        accept: () => this.battleAcceptIncoming(c), decline: () => this.battleDeclineIncoming(c)
      })),
      battleErr: this.battleErr,
      onBattleHangUp: this.battleHangUp,
      onBattleStartRound: this.battleStartRound,
      battleShowStartRound: this.battleRound.phase === 'idle' || this.battleRound.phase === 'done',
      battleRoundDone: this.battleRound.phase === 'done',
      battleCountdownLabel: this.battleCountdownN != null ? String(this.battleCountdownN === 0 ? '¡Ya!' : this.battleCountdownN) : '',
      battleShowCountdown: this.battleCountdownN != null,
      battleShowTimer: this.battleTurnSecs != null,
      battleTurnLabel: this.battleRound.turn === 2 ? 'Turno 2' : 'Turno 1',
      battleTurnSecsLabel: this.battleTurnSecs != null ? String(this.battleTurnSecs) : '',
      setLocalVideoEl: this.setLocalVideoEl,
      setRemoteVideoEl: this.setRemoteVideoEl,
      studyLocked: !this.subs.platform,
      studyModuleList: STUDY_MODULES.map((m: any, i: number) => {
        const unlocked = this.studyIsUnlocked(i);
        const done = this.studyProgress.completedModules.includes(m.id);
        const active = this.studyActiveModuleId === m.id;
        return {
          id: m.id, order: m.order, title: m.title, description: m.description,
          pick: () => this.studyOpenModule(m.id),
          badge: done ? 'Completado' : (unlocked ? '' : 'Bloqueado'),
          badgeStyle: done
            ? 'font-family:\'Geist Mono\',monospace;font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#14111A;background:var(--yellow);padding:3px 8px;border-radius:999px'
            : 'font-family:\'Geist Mono\',monospace;font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3);background:var(--glass-2);padding:3px 8px;border-radius:999px',
          showBadge: done || !unlocked,
          card: 'display:flex;flex-direction:column;gap:8px;padding:18px;border-radius:20px;border:1px solid ' + (active ? 'var(--yellow)' : 'var(--hair)') + ';background:var(--glass-2);backdrop-filter:var(--lg-blur);-webkit-backdrop-filter:var(--lg-blur);box-shadow:var(--lg-edge);cursor:' + (unlocked ? 'pointer' : 'not-allowed') + ';opacity:' + (unlocked ? '1' : '.5') + ';transition:transform .2s ease',
        };
      }),
      studyActiveTitle: (this.studyActiveModule() || {}).title || '',
      studyActiveDescription: (this.studyActiveModule() || {}).description || '',
      studyHasActive: !!this.studyActiveModule(),
      studyShowTimeline: (this.studyActiveModule() || {}).toolType === 'timeline',
      studyShowChecklist: (this.studyActiveModule() || {}).toolType === 'checklist',
      studyShowReflection: (this.studyActiveModule() || {}).toolType === 'reflection',
      studyShowGallery: (this.studyActiveModule() || {}).toolType === 'gallery',
      studyShowCompare: (this.studyActiveModule() || {}).toolType === 'compare',
      studyShowMap: (this.studyActiveModule() || {}).toolType === 'map',
      studyTimelinePills: ((this.studyActiveModule() || {}).timeline || []).map((t: any, i: number) => ({
        year: t.year, title: t.title,
        pick: () => this.studyPickTimeline(i),
        style: i === this.studyTimelineIdx
          ? 'padding:10px 16px;border-radius:999px;font-size:12px;font-weight:700;color:#14111A;background:var(--yellow);cursor:pointer;white-space:nowrap'
          : 'padding:10px 16px;border-radius:999px;font-size:12px;font-weight:600;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);cursor:pointer;white-space:nowrap'
      })),
      studyTimelineDetailTitle: (((this.studyActiveModule() || {}).timeline || [])[this.studyTimelineIdx] || {}).title || '',
      studyTimelineDetailYear: (((this.studyActiveModule() || {}).timeline || [])[this.studyTimelineIdx] || {}).year || '',
      studyTimelineDetailText: (((this.studyActiveModule() || {}).timeline || [])[this.studyTimelineIdx] || {}).text || '',
      studyChecklist: ((this.studyActiveModule() || {}).technique || []).map((t: any) => {
        const mod = this.studyActiveModule();
        const checked = !!(mod && this.studyProgress.checklist[mod.id] && this.studyProgress.checklist[mod.id][t.id]);
        return {
          name: t.name, text: t.text, checked,
          toggle: () => this.studyToggleTechnique(t.id),
          btnLabel: checked ? 'Practicado ✓' : 'Lo practiqué',
          btn: checked
            ? 'padding:8px 16px;border-radius:999px;font-size:11.5px;font-weight:700;color:#14111A;background:var(--yellow);cursor:pointer;white-space:nowrap'
            : 'padding:8px 16px;border-radius:999px;font-size:11.5px;font-weight:600;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);cursor:pointer;white-space:nowrap',
        };
      }),
      studyChecklistDoneLabel: (() => {
        const mod = this.studyActiveModule();
        if (!mod || !mod.technique) return '0 / 0 movimientos practicados';
        const done = Object.values(this.studyProgress.checklist[mod.id] || {}).filter(Boolean).length;
        return done + ' / ' + mod.technique.length + ' movimientos practicados';
      })(),
      studyReflectionCards: ((this.studyActiveModule() || {}).reflection || []).map((r: any) => ({
        question: r.question,
        value: this.studyReflectionDrafts[r.id] ?? this.studyProgress.reflections[r.id] ?? '',
        change: (e: any) => this.studyReflectionChange(r.id, e.target.value),
        save: () => this.studySaveReflection(r.id),
        saved: !!this.studyProgress.reflections[r.id] && this.studyReflectionDrafts[r.id] === undefined,
      })),
      studyPioneers: ((this.studyActiveModule() || {}).figures || []).filter((f: any) => f.era === 'pionero').map((f: any) => {
        const matched = !!this.studyMatches[f.id];
        return {
          id: f.id, name: f.name, role: f.role, bio: f.bio,
          pick: () => this.studyPickPioneer(f.id),
          card: 'display:flex;flex-direction:column;gap:6px;padding:16px;border-radius:18px;border:1px solid ' + (matched ? 'var(--yellow)' : (this.studyMatchSelectedPioneer === f.id ? 'var(--blue)' : 'var(--hair)')) + ';background:var(--glass-2);cursor:' + (matched ? 'default' : 'pointer') + ';opacity:' + (matched ? '.6' : '1')
        };
      }),
      studyModernIcons: ((this.studyActiveModule() || {}).figures || []).filter((f: any) => f.era === 'moderno').map((f: any) => {
        const matched = Object.values(this.studyMatches).includes(f.id);
        return {
          id: f.id, name: f.name, role: f.role, bio: f.bio,
          pick: () => this.studyPickModern(f.id),
          card: 'display:flex;flex-direction:column;gap:6px;padding:16px;border-radius:18px;border:1px solid ' + (matched ? 'var(--yellow)' : (this.studyMatchWrong === f.id ? 'var(--pink)' : 'var(--hair)')) + ';background:var(--glass-2);cursor:' + (matched ? 'default' : 'pointer') + ';opacity:' + (matched ? '.6' : '1')
        };
      }),
      studyMatchCountLabel: Object.keys(this.studyMatches).length + ' / ' + ((this.studyActiveModule() || {}).figures || []).filter((f: any) => f.era === 'pionero').length + ' parejas encontradas',
      studyCompareRows: ((this.studyActiveModule() || {}).compare || []).map((c: any) => ({
        axis: c.axis, waacking: c.waacking, voguing: c.voguing,
        waackingStyle: 'font-size:13px;font-weight:' + (this.studyCompareSide === 'waacking' ? '700' : '400') + ';color:' + (this.studyCompareSide === 'waacking' ? 'var(--ink)' : 'var(--ink-3)'),
        voguingStyle: 'font-size:13px;font-weight:' + (this.studyCompareSide === 'voguing' ? '700' : '400') + ';color:' + (this.studyCompareSide === 'voguing' ? 'var(--ink)' : 'var(--ink-3)'),
      })),
      studyCompareWaackBtn: 'padding:10px 18px;border-radius:999px;font-size:12px;font-weight:700;cursor:pointer;' + (this.studyCompareSide === 'waacking' ? 'color:#14111A;background:var(--yellow)' : 'color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2)'),
      studyCompareVogueBtn: 'padding:10px 18px;border-radius:999px;font-size:12px;font-weight:700;cursor:pointer;' + (this.studyCompareSide === 'voguing' ? 'color:#14111A;background:var(--yellow)' : 'color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2)'),
      studySetWaack: () => this.studySetCompareSide('waacking'),
      studySetVogue: () => this.studySetCompareSide('voguing'),
      studyHubs: ((this.studyActiveModule() || {}).hubs || []).map((h: any) => ({
        place: h.place, pick: () => this.studyPickHub(h.id),
        style: this.studyHubActive === h.id
          ? 'padding:10px 16px;border-radius:999px;font-size:12px;font-weight:700;color:#14111A;background:var(--yellow);cursor:pointer'
          : 'padding:10px 16px;border-radius:999px;font-size:12px;font-weight:600;color:var(--ink-2);border:1px solid var(--hair);background:var(--glass-2);cursor:pointer'
      })),
      studyHubDetail: (((this.studyActiveModule() || {}).hubs || []).find((h: any) => h.id === this.studyHubActive) || {}).text || '',
      studyRevivalList: ((this.studyActiveModule() || {}).revival || []).map((r: any) => ({ year: r.year, text: r.text })),
      studyQuizList: ((this.studyActiveModule() || {}).quiz || []).map((q: any, qi: number) => {
        const mod = this.studyActiveModule();
        const submitted = !!(mod && this.studyQuizSubmitted[mod.id]);
        const picked = (mod && this.studyQuizAnswers[mod.id] && this.studyQuizAnswers[mod.id][qi]) ?? null;
        return {
          text: q.text,
          options: q.options.map((opt: string, oi: number) => {
            const isPicked = picked === oi;
            const isCorrect = oi === q.correct;
            let style = 'padding:10px 16px;border-radius:14px;font-size:12.5px;font-weight:600;cursor:pointer;text-align:left;border:1px solid var(--hair);background:var(--glass-2);color:var(--ink-2)';
            if (submitted && isCorrect) style = 'padding:10px 16px;border-radius:14px;font-size:12.5px;font-weight:700;cursor:default;text-align:left;border:1px solid var(--yellow);background:color-mix(in oklch, var(--yellow) 22%, transparent);color:var(--ink)';
            else if (submitted && isPicked) style = 'padding:10px 16px;border-radius:14px;font-size:12.5px;font-weight:700;cursor:default;text-align:left;border:1px solid var(--pink);background:color-mix(in oklch, var(--pink) 18%, transparent);color:var(--ink)';
            else if (!submitted && isPicked) style = 'padding:10px 16px;border-radius:14px;font-size:12.5px;font-weight:700;cursor:pointer;text-align:left;border:1px solid var(--blue);background:color-mix(in oklch, var(--blue) 18%, transparent);color:var(--ink)';
            return { label: opt, pick: submitted ? (() => {}) : (() => this.studyPickQuizAnswer(mod.id, qi, oi)), style };
          }),
        };
      }),
      studyQuizSubmitted: !!(this.studyActiveModule() && this.studyQuizSubmitted[this.studyActiveModule()!.id]),
      studyQuizNotSubmitted: !(this.studyActiveModule() && this.studyQuizSubmitted[this.studyActiveModule()!.id]),
      studyQuizScoreLabel: (() => {
        const mod = this.studyActiveModule();
        if (!mod) return '';
        const score = this.studyProgress.quizScores[mod.id];
        return score === undefined ? '' : score + ' / ' + mod.quiz.length + ' correctas';
      })(),
      studySubmitQuizClick: () => this.studyActiveModule() && this.studySubmitQuiz(this.studyActiveModule()!.id),
      studyGoNextClick: () => this.studyActiveModule() && this.studyGoNextModule(this.studyActiveModule()!.id),
      studyHasNextModule: !!this.studyActiveModule() && this.studyModuleOrder().indexOf(this.studyActiveModuleId!) < this.studyModuleOrder().length - 1,
      chipHover3d: 'transform:perspective(700px) translateZ(18px) translateY(-3px) rotateX(-6deg);color:var(--ink)',
      themeDarkBtn: (this.navIsOpen() ? '' : 'width:100%;padding:9px 0;') + (this.state.theme === 'dark' ? on : off),
      themeLightBtn: (this.navIsOpen() ? '' : 'width:100%;padding:9px 0;') + (this.state.theme === 'light' ? on : off),
      themeDarkLabel: this.navIsOpen() ? 'Oscuro' : '☾',
      themeLightLabel: this.navIsOpen() ? 'Claro' : '☀',
      themeSwitchWrap: this.navIsOpen()
        ? 'display:flex;gap:5px;padding:5px;border-radius:999px;background:var(--glass-2);border:1px solid var(--hair)'
        : 'display:flex;flex-direction:column;gap:5px;padding:5px;border-radius:22px;background:var(--glass-2);border:1px solid var(--hair)',
      goDashboard: () => this.setState({ view: 'dashboard' }),
      goCursos: () => this.setState({ view: 'cursos' }),
      goLives: () => this.setState({ view: 'lives' }),
      goReels: () => this.setState({ view: 'reels' }),
      goLogin: () => this.setState({ view: this.state.view === 'login' ? 'dashboard' : 'login' }),
      setDark: () => this.setState({ theme: 'dark' }),
      setLight: () => this.setState({ theme: 'light' })
    };
  }
  render() {
    const v = { ...this.props, ...this.renderVals() };
    if (!this.state.authReady) return <div style={{ minHeight: '100vh', background: '#000' }} />;
    return (
      <div data-theme={v.theme} style={{ minHeight: '100vh', background: 'var(--ground)', color: 'var(--ink)', position: 'relative', overflow: 'hidden', fontFamily: 'Geist,system-ui,sans-serif' }} ref={v.rootRef}>
        <div style={sty(v.ambientLayer)}></div>
        {v.isLogin && <Login v={v} />}
        {v.isRegister && <Register go={v.goView} />}
        {v.isRegisterInstructor && <RegisterPro kind="instructor" go={v.goView} />}
        {v.isRegisterStudio && <RegisterPro kind="estudio" go={v.goView} />}
        {v.isSetupPhoto && <SetupPhoto go={v.goView} />}
        {v.isApp && <Shell v={v} />}
        {v.isApp && <ChatDock v={v} />}
      </div>
    );
  }
}

export default App;
