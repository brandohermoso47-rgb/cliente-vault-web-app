// Notifica una solicitud de amistad nueva y cuando la otra persona la acepta (colección
// `friendships`, ver src/lib/friends.ts). { users:[uidA,uidB], requesterId, status }.
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { DATABASE_ID } from './db.js';
import { actorLabel, notify } from './notify.js';

const otherUser = (users: string[] | undefined, uid: string) => (users || []).find((u) => u !== uid) ?? null;

export const onFriendRequestCreated = onDocumentCreated(
  { document: 'friendships/{id}', database: DATABASE_ID },
  async (event) => {
    const data = event.data?.data() as { users?: string[]; requesterId?: string; status?: string } | undefined;
    if (!data || data.status !== 'pending' || !data.requesterId) return;
    const target = otherUser(data.users, data.requesterId);
    if (!target) return;
    const who = await actorLabel(data.requesterId);
    await notify({
      eventId: event.id,
      userId: target,
      actorId: data.requesterId,
      type: 'friend_request',
      title: `${who} te envió una solicitud de amistad`,
      text: '',
    });
  }
);

export const onFriendRequestAccepted = onDocumentUpdated(
  { document: 'friendships/{id}', database: DATABASE_ID },
  async (event) => {
    const before = event.data?.before.data() as { status?: string; users?: string[]; requesterId?: string } | undefined;
    const after = event.data?.after.data() as { status?: string; users?: string[]; requesterId?: string } | undefined;
    if (!after || after.status !== 'accepted' || before?.status === 'accepted') return;
    if (!after.requesterId) return;
    // Quien acepta es la otra persona del par; avisamos a quien mandó la solicitud original.
    const accepter = otherUser(after.users, after.requesterId);
    if (!accepter) return;
    const who = await actorLabel(accepter);
    await notify({
      eventId: event.id,
      userId: after.requesterId,
      actorId: accepter,
      type: 'friend_accept',
      title: `${who} aceptó tu solicitud de amistad`,
      text: '',
    });
  }
);
