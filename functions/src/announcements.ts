// Cuando el staff publica un anuncio (nueva clase/cátedra, taller, etc. — ver src/lib/announcements.ts),
// se lo notificamos a todo el mundo. Como `notifications` exige un documento por destinatario
// (las reglas leen `resource.data.userId == request.auth.uid`), hacemos un "fan-out": un documento
// de notificación por cada persona con cuenta, repartido en tandas para respetar el límite de 500
// escrituras por lote de Firestore.
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { FieldValue } from 'firebase-admin/firestore';
import { db, DATABASE_ID } from './db.js';

const BATCH_SIZE = 450;

export const onAnnouncementCreated = onDocumentCreated(
  { document: 'announcements/{id}', database: DATABASE_ID },
  async (event) => {
    const data = event.data?.data() as { ownerId?: string; author?: string; title?: string } | undefined;
    if (!data?.title) return;
    const authorLabel = data.author || 'El equipo de Waack On';
    const title = `${authorLabel} publicó algo nuevo: ${data.title}`;

    const usersSnap = await db.collection('users').select().get();
    const recipients = usersSnap.docs.map((d) => d.id).filter((uid) => uid !== data.ownerId);

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = db.batch();
      for (const uid of recipients.slice(i, i + BATCH_SIZE)) {
        const ref = db.collection('notifications').doc();
        batch.set(ref, {
          userId: uid,
          actorId: data.ownerId ?? null,
          type: 'announcement',
          title,
          text: '',
          read: false,
          createdAt: FieldValue.serverTimestamp(),
        });
      }
      await batch.commit();
    }
  }
);
