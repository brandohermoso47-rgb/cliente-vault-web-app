// Modo Practice / Battle Training: videollamada real 1 a 1 usando WebRTC, con Firestore solo como
// "buzón" para intercambiar la oferta/respuesta y los candidatos de red (patrón estándar de señalización;
// el video y audio viajan directo entre los dos navegadores, nunca pasan por nuestro servidor).
// Importante: esto es 1 a 1. Para transmitir a muchos espectadores a la vez hace falta un servidor de
// medios (SFU) que este proyecto no tiene todavía — "Ir en vivo" de esta función es una señal de
// presencia + tu cámara local, no una transmisión masiva.
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';

const RTC_CONFIG: RTCConfiguration = { iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }] };

export type Round = { phase: 'idle' | 'countdown' | 'turn1' | 'turn2' | 'done'; startedAt?: any };
export type CallDoc = { id: string; callerId: string; calleeId: string; mode: 'practice' | 'battle'; status: 'ringing' | 'accepted' | 'declined' | 'ended'; offer?: any; answer?: any; round?: Round };

export class BattleCall {
  pc: RTCPeerConnection;
  callId: string | null = null;
  isCaller = false;
  localStream: MediaStream | null = null;
  remoteStream = new MediaStream();
  private unsubs: Array<() => void> = [];
  onRemoteTrack?: () => void;
  onRoundChange?: (round: Round) => void;
  onEnded?: () => void;

  constructor(private myUid: string) {
    this.pc = new RTCPeerConnection(RTC_CONFIG);
    this.pc.ontrack = (e) => { e.streams[0]?.getTracks().forEach((t) => this.remoteStream.addTrack(t)); this.onRemoteTrack?.(); };
  }

  // Comparte tu pantalla (incluye el audio de la pestaña/sistema si el navegador lo permite): así
  // "suena la música directamente" sin que nosotros necesitemos alojar ninguna pista con derechos.
  async shareScreen() {
    this.localStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    this.localStream.getTracks().forEach((t) => this.pc.addTrack(t, this.localStream!));
    return this.localStream;
  }

  async call(otherUid: string, mode: 'practice' | 'battle') {
    this.isCaller = true;
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    const ref = await addDoc(collection(db, 'battle_calls'), {
      callerId: this.myUid, calleeId: otherUid, mode, status: 'ringing',
      offer: { type: offer.type, sdp: offer.sdp }, round: { phase: 'idle' }, createdAt: serverTimestamp(),
    });
    this.callId = ref.id;
    this.pc.onicecandidate = (e) => { if (e.candidate) addDoc(collection(db, 'battle_calls', ref.id, 'callerCandidates'), e.candidate.toJSON()); };
    this.unsubs.push(onSnapshot(ref, async (snap) => {
      const d = snap.data() as any;
      if (!d) { this.onEnded?.(); return; }
      if (d.status === 'ended' || d.status === 'declined') { this.onEnded?.(); return; }
      if (d.answer && this.pc.signalingState === 'have-local-offer') await this.pc.setRemoteDescription(new RTCSessionDescription(d.answer));
      if (d.round) this.onRoundChange?.(d.round);
    }));
    this.unsubs.push(onSnapshot(collection(db, 'battle_calls', ref.id, 'calleeCandidates'), (snap) => {
      snap.docChanges().forEach((c) => { if (c.type === 'added') this.pc.addIceCandidate(new RTCIceCandidate(c.doc.data())).catch(() => {}); });
    }));
    return ref.id;
  }

  async answer(callId: string, offer: any) {
    this.callId = callId;
    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    await updateDoc(doc(db, 'battle_calls', callId), { status: 'accepted', answer: { type: answer.type, sdp: answer.sdp } });
    this.pc.onicecandidate = (e) => { if (e.candidate) addDoc(collection(db, 'battle_calls', callId, 'calleeCandidates'), e.candidate.toJSON()); };
    this.unsubs.push(onSnapshot(doc(db, 'battle_calls', callId), (snap) => {
      const d = snap.data() as any;
      if (!d || d.status === 'ended' || d.status === 'declined') { this.onEnded?.(); return; }
      if (d.round) this.onRoundChange?.(d.round);
    }));
    this.unsubs.push(onSnapshot(collection(db, 'battle_calls', callId, 'callerCandidates'), (snap) => {
      snap.docChanges().forEach((c) => { if (c.type === 'added') this.pc.addIceCandidate(new RTCIceCandidate(c.doc.data())).catch(() => {}); });
    }));
  }

  setRound(round: Round) { if (this.callId) updateDoc(doc(db, 'battle_calls', this.callId), { round }).catch(() => {}); }

  async hangUp() {
    if (this.callId) await updateDoc(doc(db, 'battle_calls', this.callId), { status: 'ended' }).catch(() => {});
    this.unsubs.forEach((u) => u());
    this.localStream?.getTracks().forEach((t) => t.stop());
    this.pc.close();
  }
}

export function watchIncomingCalls(uid: string, cb: (calls: CallDoc[]) => void) {
  return onSnapshot(query(collection(db, 'battle_calls'), where('calleeId', '==', uid), where('status', '==', 'ringing')), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  }, () => cb([]));
}

export const declineCall = (id: string) => updateDoc(doc(db, 'battle_calls', id), { status: 'declined' });

// "Ir en vivo" libre: presencia + tu cámara, no una transmisión a muchos espectadores (ver nota arriba).
export const goLive = (uid: string, displayName: string) => setDoc(doc(db, 'live_sessions', uid), { uid, displayName, startedAt: serverTimestamp() });
export const stopLive = (uid: string) => deleteDoc(doc(db, 'live_sessions', uid)).catch(() => {});
