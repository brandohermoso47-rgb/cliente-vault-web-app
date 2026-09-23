// Pruebas de las reglas de Firestore y Storage con la API de simulación de reglas de Firebase
// (no necesita Java ni emulador y NO toca datos reales). Requiere `gcloud auth login`.
//   node rules-tests/run.mjs
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT = process.env.FIREBASE_PROJECT || 'buoyant-objective-fwjkk';
const token = execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim();

const DOC = (p) => `/databases/(default)/documents/${p}`;
const roleMock = (uid, role) => ({ function: 'get', args: [{ exactValue: DOC(`users/${uid}`) }], result: { value: { data: { role } } } });
// Roles conocidos en las pruebas
const MOCKS = [
  roleMock('admin1', 'admin'), roleMock('inst1', 'instructor'), roleMock('estu1', 'estudio'), roleMock('user1', 'usuario'), roleMock('user2', 'usuario'),
  { function: 'get', args: [{ exactValue: DOC('battle_calls/call1') }], result: { value: { data: { callerId: 'user1', calleeId: 'user2' } } } },
];
const auth = (uid) => ({ uid, token: { email_verified: true } });

let cases = [];
const t = (name, expectation, method, path, { uid, data, incoming } = {}) => cases.push({
  name, expectation, tc: {
    expectation,
    request: { path: DOC(path), method, ...(uid ? { auth: auth(uid) } : {}), ...(incoming ? { resource: { data: incoming } } : {}) },
    ...(data ? { resource: { data } } : {}),
    functionMocks: MOCKS,
  },
});
const allow = (n, m, p, o) => t(n, 'ALLOW', m, p, o);
const deny = (n, m, p, o) => t(n, 'DENY', m, p, o);

// ── Firestore ─────────────────────────────────────────────────────────────────────────────────────
const validProfile = { displayName: 'Ana', handle: 'ana.w', countryCode: 'ES', bio: 'hola', role: 'usuario' };

// perfiles
deny('anónimo no lee perfiles', 'get', 'users/user1', {});
allow('usuario con sesión lee perfiles', 'get', 'users/user2', { uid: 'user1', data: validProfile });
allow('crea su perfil como usuario', 'create', 'users/user1', { uid: 'user1', incoming: validProfile });
deny('NO se puede crear perfil con rol admin', 'create', 'users/user1', { uid: 'user1', incoming: { ...validProfile, role: 'admin' } });
deny('NO se puede crear el perfil de otra persona', 'create', 'users/user2', { uid: 'user1', incoming: validProfile });
deny('perfil con campos desconocidos', 'create', 'users/user1', { uid: 'user1', incoming: { ...validProfile, isVip: true } });
deny('bio de más de 280 caracteres', 'create', 'users/user1', { uid: 'user1', incoming: { ...validProfile, bio: 'x'.repeat(281) } });
allow('edita su propio perfil sin tocar el rol', 'update', 'users/user1', { uid: 'user1', data: validProfile, incoming: { ...validProfile, bio: 'nueva' } });
deny('NO puede subirse el rol a admin', 'update', 'users/user1', { uid: 'user1', data: validProfile, incoming: { ...validProfile, role: 'admin' } });
deny('NO puede editar el perfil de otro', 'update', 'users/user2', { uid: 'user1', data: validProfile, incoming: { ...validProfile, bio: 'hackeado' } });
allow('un admin sí puede cambiar roles', 'update', 'users/user2', { uid: 'admin1', data: validProfile, incoming: { ...validProfile, role: 'instructor' } });
// Un perfil viejo con un campo heredado (fuera de la lista actual) no debe bloquear futuras ediciones,
// como subir la foto: solo se revisan los campos que cambian, no todo el documento.
allow('sube la foto aunque el perfil tenga un campo heredado', 'update', 'users/user1', { uid: 'user1', data: { ...validProfile, legacyField: 'x' }, incoming: { ...validProfile, legacyField: 'x', photoURL: 'https://x', photoPath: 'users/user1/avatar/1.png' } });
deny('nadie borra perfiles salvo admin', 'delete', 'users/user2', { uid: 'user1', data: validProfile });
allow('el dueño lee su galería privada', 'get', 'users/user1/media/m1', { uid: 'user1', data: { url: 'x' } });
deny('otro usuario NO lee la galería privada', 'get', 'users/user1/media/m1', { uid: 'user2', data: { url: 'x' } });
deny('otro usuario NO escribe en la galería ajena', 'create', 'users/user1/media/m2', { uid: 'user2', incoming: { url: 'x' } });

// contenido de instructores/estudios/admin
for (const col of ['teachers', 'lives', 'lessons', 'ebooks']) {
  allow(`${col}: lectura con sesión`, 'get', `${col}/c1`, { uid: 'user1', data: { ownerId: 'inst1' } });
  deny(`${col}: anónimo no lee`, 'get', `${col}/c1`, { data: { ownerId: 'inst1' } });
  deny(`${col}: un usuario normal NO publica`, 'create', `${col}/c1`, { uid: 'user1', incoming: { ownerId: 'user1' } });
  allow(`${col}: un instructor publica lo suyo`, 'create', `${col}/c1`, { uid: 'inst1', incoming: { ownerId: 'inst1' } });
  deny(`${col}: un instructor NO publica a nombre de otro`, 'create', `${col}/c1`, { uid: 'inst1', incoming: { ownerId: 'estu1' } });
  deny(`${col}: un instructor NO edita lo de otro`, 'update', `${col}/c1`, { uid: 'inst1', data: { ownerId: 'estu1' }, incoming: { ownerId: 'estu1', x: 1 } });
  allow(`${col}: un admin edita todo`, 'update', `${col}/c1`, { uid: 'admin1', data: { ownerId: 'estu1' }, incoming: { ownerId: 'estu1', x: 1 } });
}

// reels: el feed de la comunidad, cualquier persona con sesión publica el suyo
allow('reels: lectura con sesión', 'get', 'reels/r1', { uid: 'user1', data: { ownerId: 'user2' } });
deny('reels: anónimo no lee', 'get', 'reels/r1', { data: { ownerId: 'user2' } });
allow('reels: un usuario normal SÍ publica el suyo', 'create', 'reels/r1', { uid: 'user1', incoming: { ownerId: 'user1', caption: 'hola' } });
allow('un estudio también publica un reel propio', 'create', 'reels/r1', { uid: 'estu1', incoming: { ownerId: 'estu1' } });
deny('reels: NO publica a nombre de otro', 'create', 'reels/r1', { uid: 'user1', incoming: { ownerId: 'user2' } });
deny('reels: caption de más de 300 caracteres', 'create', 'reels/r1', { uid: 'user1', incoming: { ownerId: 'user1', caption: 'x'.repeat(301) } });
deny('reels: campos desconocidos', 'create', 'reels/r1', { uid: 'user1', incoming: { ownerId: 'user1', extra: 1 } });
allow('reels: el dueño solo edita la descripción', 'update', 'reels/r1', { uid: 'user1', data: { ownerId: 'user1', caption: 'a' }, incoming: { ownerId: 'user1', caption: 'b' } });
deny('reels: NO cambia el dueño al editar', 'update', 'reels/r1', { uid: 'user1', data: { ownerId: 'user1', caption: 'a' }, incoming: { ownerId: 'user2', caption: 'b' } });
deny('reels: un tercero NO edita', 'update', 'reels/r1', { uid: 'user2', data: { ownerId: 'user1', caption: 'a' }, incoming: { ownerId: 'user1', caption: 'b' } });
allow('reels: el dueño borra el suyo', 'delete', 'reels/r1', { uid: 'user1', data: { ownerId: 'user1' } });
deny('reels: un tercero NO borra', 'delete', 'reels/r1', { uid: 'user2', data: { ownerId: 'user1' } });
allow('reels: un admin borra cualquiera', 'delete', 'reels/r1', { uid: 'admin1', data: { ownerId: 'user1' } });

// likes/comentarios en reels
allow('reels: cualquiera con sesión da "me gusta"', 'create', 'reels/r1/likes/user1', { uid: 'user1', incoming: {} });
deny('reels: NO se puede dar "me gusta" a nombre de otro', 'create', 'reels/r1/likes/user1', { uid: 'user2', incoming: {} });
allow('reels: quita su propio "me gusta"', 'delete', 'reels/r1/likes/user1', { uid: 'user1', data: {} });
allow('reels: cualquiera con sesión comenta', 'create', 'reels/r1/comments/c1', { uid: 'user1', incoming: { uid: 'user1', text: 'hola' } });
deny('reels: NO comenta a nombre de otro', 'create', 'reels/r1/comments/c1', { uid: 'user1', incoming: { uid: 'user2', text: 'hola' } });
deny('reels: comentario de más de 500 caracteres', 'create', 'reels/r1/comments/c1', { uid: 'user1', incoming: { uid: 'user1', text: 'x'.repeat(501) } });
allow('reels: borra su propio comentario', 'delete', 'reels/r1/comments/c1', { uid: 'user1', data: { uid: 'user1', text: 'a' } });
deny('reels: un tercero NO borra el comentario ajeno', 'delete', 'reels/r1/comments/c1', { uid: 'user2', data: { uid: 'user1', text: 'a' } });

// seguir a alguien
allow('sigue a otra persona', 'create', 'follows/user1_user2', { uid: 'user1', incoming: { followerId: 'user1', followingId: 'user2' } });
deny('NO se puede seguir a sí mismo', 'create', 'follows/user1_user1', { uid: 'user1', incoming: { followerId: 'user1', followingId: 'user1' } });
deny('NO crea un "follow" a nombre de otro', 'create', 'follows/user2_user1', { uid: 'user1', incoming: { followerId: 'user2', followingId: 'user1' } });
allow('deja de seguir', 'delete', 'follows/user1_user2', { uid: 'user1', data: { followerId: 'user1', followingId: 'user2' } });
deny('un tercero NO puede dejar de seguir por otro', 'delete', 'follows/user1_user2', { uid: 'user2', data: { followerId: 'user1', followingId: 'user2' } });

// Modo Practice / Battle Training: videollamada 1 a 1
allow('llama a otra persona', 'create', 'battle_calls/c1', { uid: 'user1', incoming: { callerId: 'user1', calleeId: 'user2', status: 'ringing' } });
deny('NO llama a nombre de otro', 'create', 'battle_calls/c1', { uid: 'user2', incoming: { callerId: 'user1', calleeId: 'user2', status: 'ringing' } });
deny('NO se puede llamar a sí mismo', 'create', 'battle_calls/c1', { uid: 'user1', incoming: { callerId: 'user1', calleeId: 'user1', status: 'ringing' } });
allow('el que llama lee su propia llamada', 'get', 'battle_calls/call1', { uid: 'user1', data: { callerId: 'user1', calleeId: 'user2' } });
allow('a quien llaman también la lee', 'get', 'battle_calls/call1', { uid: 'user2', data: { callerId: 'user1', calleeId: 'user2' } });
deny('un tercero NO lee la llamada', 'get', 'battle_calls/call1', { uid: 'admin1', data: { callerId: 'user1', calleeId: 'user2' } });
allow('el destinatario acepta (responde la oferta)', 'update', 'battle_calls/call1', { uid: 'user2', data: { callerId: 'user1', calleeId: 'user2', status: 'ringing' }, incoming: { callerId: 'user1', calleeId: 'user2', status: 'accepted', answer: { type: 'answer', sdp: 'x' } } });
deny('NO cambia quién llamó a quién', 'update', 'battle_calls/call1', { uid: 'user2', data: { callerId: 'user1', calleeId: 'user2' }, incoming: { callerId: 'user2', calleeId: 'user2', status: 'accepted' } });
allow('cualquiera de los dos cuelga', 'delete', 'battle_calls/call1', { uid: 'user1', data: { callerId: 'user1', calleeId: 'user2' } });
deny('un tercero NO cuelga la llamada ajena', 'delete', 'battle_calls/call1', { uid: 'admin1', data: { callerId: 'user1', calleeId: 'user2' } });
allow('quien llama manda su candidato ICE', 'create', 'battle_calls/call1/callerCandidates/x1', { uid: 'user1', incoming: { candidate: 'x' } });
deny('a quien llaman NO manda un candidato como si fuera el que llama', 'create', 'battle_calls/call1/callerCandidates/x1', { uid: 'user2', incoming: { candidate: 'x' } });
allow('a quien llaman manda su candidato ICE', 'create', 'battle_calls/call1/calleeCandidates/x1', { uid: 'user2', incoming: { candidate: 'x' } });

// "Ir en vivo" libre
allow('cualquiera activa su propia transmisión', 'create', 'live_sessions/user1', { uid: 'user1', incoming: { uid: 'user1', displayName: 'Ana' } });
deny('NO activa la transmisión de otra persona', 'create', 'live_sessions/user1', { uid: 'user2', incoming: { uid: 'user1', displayName: 'Ana' } });
allow('cualquiera con sesión ve quién está en vivo', 'get', 'live_sessions/user1', { uid: 'user2', data: { uid: 'user1' } });
allow('termina su propia transmisión', 'delete', 'live_sessions/user1', { uid: 'user1', data: { uid: 'user1' } });
deny('NO termina la transmisión de otra persona', 'delete', 'live_sessions/user1', { uid: 'user2', data: { uid: 'user1' } });

// Plan de Estudio de Waacking (progreso privado del usuario)
allow('guarda su propio progreso del plan de estudio', 'create', 'study_progress/user1', { uid: 'user1', incoming: { completedModules: ['historia'] } });
allow('actualiza su propio progreso del plan de estudio', 'update', 'study_progress/user1', { uid: 'user1', incoming: { completedModules: ['historia', 'tecnica'] } });
deny('NO guarda progreso en el documento de otra persona', 'create', 'study_progress/user1', { uid: 'user2', incoming: { completedModules: ['historia'] } });
allow('lee su propio progreso del plan de estudio', 'get', 'study_progress/user1', { uid: 'user1', data: { completedModules: [] } });
deny('NO lee el progreso de otra persona', 'get', 'study_progress/user1', { uid: 'user2', data: { completedModules: [] } });
deny('NO borra el progreso de otra persona', 'delete', 'study_progress/user1', { uid: 'user2', data: { completedModules: [] } });

// comunidad
allow('publica en el muro con su uid', 'create', 'community_messages/m1', { uid: 'user1', incoming: { uid: 'user1', text: 'hola' } });
deny('NO publica suplantando a otro', 'create', 'community_messages/m1', { uid: 'user1', incoming: { uid: 'user2', text: 'hola' } });
deny('NO publica sin uid', 'create', 'community_messages/m1', { uid: 'user1', incoming: { text: 'hola' } });
deny('mensaje de más de 2000 caracteres', 'create', 'chat_messages/m1', { uid: 'user1', incoming: { uid: 'user1', text: 'x'.repeat(2001) } });
deny('NO edita mensajes ajenos', 'update', 'community_messages/m1', { uid: 'user2', data: { uid: 'user1', text: 'a' }, incoming: { uid: 'user1', text: 'b' } });
deny('NO cambia el autor de su mensaje', 'update', 'community_messages/m1', { uid: 'user1', data: { uid: 'user1', text: 'a' }, incoming: { uid: 'user2', text: 'a' } });
allow('borra su propio mensaje', 'delete', 'chat_messages/m1', { uid: 'user1', data: { uid: 'user1', text: 'a' } });
allow('un admin modera (borra)', 'delete', 'chat_messages/m1', { uid: 'admin1', data: { uid: 'user1', text: 'a' } });
deny('NO borra mensajes ajenos', 'delete', 'chat_messages/m1', { uid: 'user2', data: { uid: 'user1', text: 'a' } });

// mensajes directos
const dm = { participants: ['user1', 'user2'], senderId: 'user1', text: 'privado' };
allow('participante lee un mensaje directo', 'get', 'direct_messages/d1', { uid: 'user2', data: dm });
deny('un tercero NO lee mensajes directos', 'get', 'direct_messages/d1', { uid: 'admin1', data: dm });
deny('anónimo NO lee mensajes directos', 'get', 'direct_messages/d1', { data: dm });
allow('envía un mensaje directo', 'create', 'direct_messages/d1', { uid: 'user1', incoming: dm });
deny('NO envía mensajes a nombre de otro', 'create', 'direct_messages/d1', { uid: 'user2', incoming: dm });
deny('NO se auto-añade a una conversación ajena', 'create', 'direct_messages/d1', { uid: 'admin1', incoming: { ...dm, senderId: 'admin1' } });
deny('los mensajes directos no se editan', 'update', 'direct_messages/d1', { uid: 'user1', data: dm, incoming: { ...dm, text: 'x' } });
deny('el receptor no borra mensajes del emisor', 'delete', 'direct_messages/d1', { uid: 'user2', data: dm });

// amistades
const fr = { users: ['user1', 'user2'], requesterId: 'user1', status: 'pending' };
allow('crea una solicitud de amistad', 'create', 'friendships/f1', { uid: 'user1', incoming: fr });
deny('NO crea una amistad ya aceptada', 'create', 'friendships/f1', { uid: 'user1', incoming: { ...fr, status: 'accepted' } });
deny('un tercero NO lee amistades ajenas', 'get', 'friendships/f1', { uid: 'admin1', data: fr });
allow('el destinatario acepta', 'update', 'friendships/f1', { uid: 'user2', data: fr, incoming: { ...fr, status: 'accepted' } });
deny('quien envió NO se auto-acepta', 'update', 'friendships/f1', { uid: 'user1', data: fr, incoming: { ...fr, status: 'accepted' } });
deny('NO cambia otros campos de la amistad', 'update', 'friendships/f1', { uid: 'user2', data: fr, incoming: { ...fr, status: 'accepted', users: ['user2', 'admin1'] } });

// notificaciones y datos personales
const nt = { userId: 'user1', read: false, text: 'hola' };
allow('lee sus notificaciones', 'get', 'notifications/n1', { uid: 'user1', data: nt });
deny('NO lee notificaciones ajenas', 'get', 'notifications/n1', { uid: 'user2', data: nt });
deny('un cliente NO crea notificaciones', 'create', 'notifications/n1', { uid: 'user1', incoming: nt });
allow('marca una notificación como leída', 'update', 'notifications/n1', { uid: 'user1', data: nt, incoming: { ...nt, read: true } });
deny('NO altera el texto de una notificación', 'update', 'notifications/n1', { uid: 'user1', data: nt, incoming: { ...nt, read: true, text: 'otra' } });
allow('crea su registro de práctica', 'create', 'practice_logs/p1', { uid: 'user1', incoming: { userId: 'user1', minutes: 30 } });
deny('NO crea registros a nombre de otro', 'create', 'practice_logs/p1', { uid: 'user1', incoming: { userId: 'user2', minutes: 30 } });
deny('NO lee registros de práctica ajenos', 'get', 'practice_logs/p1', { uid: 'user2', data: { userId: 'user1' } });
deny('NO lee playlists ajenas', 'get', 'user_playlists/l1', { uid: 'user2', data: { userId: 'user1' } });
deny('NO lee feedback ajeno', 'get', 'feedback_items/f1', { uid: 'user2', data: { userId: 'user1' } });

// batallas
allow('crea una batalla como anfitrión', 'create', 'battles/b1', { uid: 'user1', incoming: { hostId: 'user1', participants: ['user1'] } });
deny('NO crea batallas a nombre de otro', 'create', 'battles/b1', { uid: 'user1', incoming: { hostId: 'user2', participants: ['user2'] } });
deny('un no participante NO edita la batalla', 'update', 'battles/b1', { uid: 'user2', data: { hostId: 'user1', participants: ['user1'] }, incoming: { hostId: 'user1', participants: ['user1', 'user2'] } });
deny('NO cambia el anfitrión de la batalla', 'update', 'battles/b1', { uid: 'user1', data: { hostId: 'user1', participants: ['user1'] }, incoming: { hostId: 'user2', participants: ['user1'] } });

// colecciones eliminadas o inexistentes: todo denegado por defecto
deny('subscriptions ya no es accesible', 'get', 'subscriptions/s1', { uid: 'user1', data: { uid: 'user1' } });
deny('colección desconocida denegada', 'get', 'secretos/x', { uid: 'admin1', data: {} });
deny('un admin tampoco escribe en colecciones desconocidas', 'create', 'secretos/x', { uid: 'admin1', incoming: {} });
allow('test: lectura pública', 'get', 'test/t1', {});
deny('test: sin escritura pública', 'create', 'test/t1', { incoming: { a: 1 } });

// ── Storage ──────────────────────────────────────────────────────────────────────────────────────
const sCases = [];
const BUCKET = 'buoyant-objective-fwjkk.firebasestorage.app';
const MB = 1024 * 1024;
const st = (name, expectation, method, path, { uid, file } = {}) => sCases.push({
  name, expectation, tc: {
    expectation,
    request: { path: `/b/${BUCKET}/o/${path}`, method, ...(uid ? { auth: auth(uid) } : {}), ...(file ? { resource: file } : {}) },
  },
});
const png = (size = 1 * MB) => ({ contentType: 'image/png', size });
const mp4 = (size = 50 * MB) => ({ contentType: 'video/mp4', size });

st('el dueño sube una foto a su carpeta', 'ALLOW', 'create', 'users/user1/media/a.png', { uid: 'user1', file: png() });
st('el dueño sube un video de 150 MB', 'ALLOW', 'create', 'users/user1/media/v.mp4', { uid: 'user1', file: mp4(150 * MB) });
st('NO sube en la carpeta de otra persona', 'DENY', 'create', 'users/user1/media/a.png', { uid: 'user2', file: png() });
st('anónimo NO sube', 'DENY', 'create', 'users/user1/media/a.png', { file: png() });
st('foto de más de 10 MB', 'DENY', 'create', 'users/user1/media/a.png', { uid: 'user1', file: png(11 * MB) });
st('video de más de 200 MB', 'DENY', 'create', 'users/user1/media/v.mp4', { uid: 'user1', file: mp4(201 * MB) });
st('SVG (puede llevar scripts) denegado', 'DENY', 'create', 'users/user1/media/x.svg', { uid: 'user1', file: { contentType: 'image/svg+xml', size: 1000 } });
st('HTML denegado', 'DENY', 'create', 'users/user1/media/x.html', { uid: 'user1', file: { contentType: 'text/html', size: 1000 } });
st('ejecutable denegado', 'DENY', 'create', 'users/user1/media/x.exe', { uid: 'user1', file: { contentType: 'application/octet-stream', size: 1000 } });
st('el dueño sube un PDF de manual (ebook)', 'ALLOW', 'create', 'users/user1/ebooks/x.pdf', { uid: 'user1', file: { contentType: 'application/pdf', size: 30 * MB } });
st('PDF de más de 50 MB denegado', 'DENY', 'create', 'users/user1/media/x.pdf', { uid: 'user1', file: { contentType: 'application/pdf', size: 51 * MB } });
st('fuera de users/ todo denegado', 'DENY', 'create', 'publico/a.png', { uid: 'user1', file: png() });
st('un admin tampoco sube fuera de su carpeta', 'DENY', 'create', 'users/user1/media/a.png', { uid: 'admin1', file: png() });
st('usuario con sesión puede ver archivos', 'ALLOW', 'get', 'users/user1/avatar/a.png', { uid: 'user2' });
st('anónimo NO ve archivos', 'DENY', 'get', 'users/user1/avatar/a.png', {});
st('el dueño borra su archivo', 'ALLOW', 'delete', 'users/user1/media/a.png', { uid: 'user1' });
st('NO borra archivos ajenos', 'DENY', 'delete', 'users/user1/media/a.png', { uid: 'user2' });
st('los archivos no se sobrescriben (update)', 'DENY', 'update', 'users/user1/media/a.png', { uid: 'user1', file: png() });
st('nada legible fuera de users/', 'DENY', 'get', 'privado/a.png', { uid: 'admin1' });

// ── Ejecución ───────────────────────────────────────────────────────────────────────────────────
async function run(file, testCases) {
  const source = { files: [{ name: file.name, content: readFileSync(join(root, file.path), 'utf8') }] };
  const res = await fetch(`https://firebaserules.googleapis.com/v1/projects/${PROJECT}:test`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'x-goog-user-project': PROJECT },
    body: JSON.stringify({ source, testSuite: { testCases: testCases.map((c) => c.tc) } }),
  });
  const json = await res.json();
  if (!res.ok) { console.error('Error de la API:', JSON.stringify(json).slice(0, 600)); process.exit(2); }
  if (json.issues?.length) { console.error('Problemas en las reglas:', json.issues); process.exit(2); }
  return json.testResults ?? [];
}

let failed = 0;
async function suite(label, file, list) {
  const results = await run(file, list);
  let bad = 0;
  results.forEach((r, i) => {
    const ok = r.state === 'SUCCESS';
    if (!ok) bad++;
    console.log(`${ok ? '✓' : '✗'} ${list[i].name}${ok ? '' : `   → esperado ${list[i].expectation}, obtuve ${r.state}${r.errorPosition ? ' (' + JSON.stringify(r.errorPosition) + ')' : ''} ${(r.debugMessages || []).slice(0, 2).join(' | ')}`}`);
  });
  console.log(`\n${label}: ${results.length - bad}/${results.length} correctas\n`);
  failed += bad;
}
await suite('Firestore', { name: 'firestore.rules', path: process.env.RULES_FILE || 'firestore.rules' }, cases);
await suite('Storage', { name: 'storage.rules', path: 'storage.rules' }, sCases);
process.exit(failed ? 1 : 0);
