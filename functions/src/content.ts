// Notificaciones por interacción real en contenido: "me gusta" y comentarios en reels, lives y
// publicaciones del muro (posts). Todas viven en subcolecciones `{content}/{docId}/likes|comments`.
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { db, DATABASE_ID } from './db.js';
import { actorLabel, notify } from './notify.js';

const LIKEABLE = new Set(['reels', 'lives', 'posts']);
// reels/lives son contenido de un dueño (`ownerId`); posts del muro usan `authorId`.
const ownerFieldFor = (content: string) => (content === 'posts' ? 'authorId' : 'ownerId');

const contentLabel = (content: string) => (content === 'posts' ? 'tu publicación' : content === 'reels' ? 'tu reel' : 'tu clase en vivo');

async function ownerOf(content: string, docId: string): Promise<string | null> {
  const snap = await db.collection(content).doc(docId).get();
  if (!snap.exists) return null;
  const data = snap.data() as Record<string, unknown>;
  const uid = data[ownerFieldFor(content)];
  return typeof uid === 'string' ? uid : null;
}

export const onLikeCreated = onDocumentCreated(
  { document: '{content}/{docId}/likes/{likerUid}', database: DATABASE_ID },
  async (event) => {
    const { content, docId, likerUid } = event.params as Record<string, string>;
    if (!LIKEABLE.has(content)) return;
    const ownerId = await ownerOf(content, docId);
    if (!ownerId || ownerId === likerUid) return;
    const who = await actorLabel(likerUid);
    await notify({
      userId: ownerId,
      actorId: likerUid,
      type: 'like',
      title: `${who} le dio me gusta a ${contentLabel(content)}`,
      text: '',
    });
  }
);

export const onCommentCreated = onDocumentCreated(
  { document: '{content}/{docId}/comments/{commentId}', database: DATABASE_ID },
  async (event) => {
    const { content, docId } = event.params as Record<string, string>;
    if (!LIKEABLE.has(content)) return;
    const data = event.data?.data() as { uid?: string; authorName?: string; text?: string } | undefined;
    const commenterUid = data?.uid;
    if (!commenterUid) return;
    const ownerId = await ownerOf(content, docId);
    if (!ownerId || ownerId === commenterUid) return;
    const who = data.authorName || (await actorLabel(commenterUid));
    await notify({
      userId: ownerId,
      actorId: commenterUid,
      type: 'comment',
      title: `${who} comentó en ${contentLabel(content)}`,
      text: (data.text || '').slice(0, 140),
    });
  }
);
