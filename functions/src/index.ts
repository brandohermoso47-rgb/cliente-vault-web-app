// Punto de entrada de las Cloud Functions. Cada trigger escribe notificaciones reales en la
// colección `notifications` (las reglas de Firestore bloquean su creación desde el cliente a
// propósito — solo el servidor puede crearlas). Ver README de esta carpeta para desplegar.
export { onLikeCreated, onCommentCreated } from './content.js';
export { onFollowCreated } from './follows.js';
export { onFriendRequestCreated, onFriendRequestAccepted } from './friendships.js';
export { onAnnouncementCreated } from './announcements.js';
