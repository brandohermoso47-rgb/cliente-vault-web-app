# Cloud Functions — notificaciones reales

Estas funciones son las únicas que pueden escribir en la colección `notifications` de Firestore
(las reglas bloquean `create` desde el cliente a propósito, para que nadie pueda falsificar una
notificación). Se disparan solas cuando ocurre algo real:

- **onLikeCreated** / **onCommentCreated** — alguien le dio like o comentó un reel, una clase en
  vivo o una publicación del muro.
- **onFollowCreated** — alguien empezó a seguirte.
- **onFriendRequestCreated** / **onFriendRequestAccepted** — te llegó o te aceptaron una solicitud
  de amistad.
- **onAnnouncementCreated** — el staff publicó un anuncio (clase, taller, etc.); se notifica a
  todas las cuentas existentes.

## Requisitos

- El proyecto de Firebase debe estar en el plan **Blaze** (pago por uso) — los triggers de
  Firestore de 2.ª generación no funcionan en el plan gratuito Spark.
- Node 20 (mismo runtime que declara `package.json`).

## Desarrollo

```bash
cd functions
npm install
npm run build   # compila TypeScript a lib/
```

## Desplegar

Desde la raíz del repo (usa el firebase.json de la raíz, que ya apunta a esta carpeta):

```bash
firebase deploy --only functions
```

## Nota sobre la base de datos

El proyecto usa una base de Firestore con nombre propio (no la "(default)"): el id está en
`src/db.ts` (`DATABASE_ID`) y se lo pasamos explícitamente tanto al Admin SDK como a cada trigger.
Si algún día cambian de base de datos, ese es el único lugar que hay que tocar.
