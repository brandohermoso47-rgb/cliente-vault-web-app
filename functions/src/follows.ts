// Notifica a alguien cuando otra persona empieza a seguirlo (colección `follows`, ver src/lib/social.ts).
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { DATABASE_ID } from './db.js';
import { actorLabel, notify } from './notify.js';

export const onFollowCreated = onDocumentCreated(
  { document: 'follows/{id}', database: DATABASE_ID },
  async (event) => {
    const data = event.data?.data() as { followerId?: string; followingId?: string } | undefined;
    if (!data?.followerId || !data?.followingId) return;
    const who = await actorLabel(data.followerId);
    await notify({
      userId: data.followingId,
      actorId: data.followerId,
      type: 'follow',
      title: `${who} empezó a seguirte`,
      text: '',
    });
  }
);
