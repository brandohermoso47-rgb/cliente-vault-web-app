# Editor de reconocimiento de movimiento

Panel de instructor → pestaña **Editor de movimiento**.

## Flujo

1. El instructor elige una clase y sube el video. Se guarda en Storage (`users/{uid}/classes/{classId}/…`, menos de 200 MB), y la clase guarda `videoUrl` y `videoDurationMs` en Firestore.
2. La detección corre **una sola vez**, en el navegador del instructor.
   - Usa MediaPipe Pose Landmarker (`@mediapipe/tasks-vision@0.10.14`, Apache-2.0) a 10 cuadros por segundo.
   - Pasa por las reglas geométricas del prototipo `waackon_prototipo_overlays.html`.
   - El resultado es una lista de **eventos de figura** propuestos.
   Al reemplazar el video, las figuras publicadas se retiran (se calcularon sobre el anterior) y el video anterior se borra de Storage.
3. El instructor acepta o elimina cada figura, o silencia un tipo completo, y guarda.
4. Solo lo aceptado y no silenciado se guarda con `PUT /api/v1/classes/:classId/figure-events`, en la tabla `figure_events` de Postgres.
5. El reproductor del alumno (`StudentPlayer`) solo lee el video y los eventos, y los dibuja en un canvas. Nunca corre MediaPipe; el chunk de detección solo se descarga cuando un instructor detecta.

## Evento de figura

```json
{ "type": "arm_line", "side": "L", "startMs": 1200, "endMs": 1850, "editedManually": false,
  "params": { "keyframes": [ { "t": 1200, "pts": { "sh": { "x": 0.41, "y": 0.32 }, "wr": { "x": 0.18, "y": 0.30 } } } ] } }
```

- **Coordenadas:** normalizadas (0–1) respecto al cuadro del video. Al dibujar se mapean al área real del video (`contentRect`), así que un video 9:16 con barras queda alineado.
- **Keyframes:** la figura se mueve durante el evento. Solo se guarda un keyframe cuando algún punto se mueve más de 0.004, y `draw` interpola entre ellos.

## Motor de efectos (`src/lib/motionRecognition/`)

| Archivo | Responsabilidad |
|---|---|
| `detection.ts` | Video → poses (MediaPipe, seek cada 100 ms, cancelable) |
| `engine.ts` | Poses → eventos: suavizado del prototipo y segmentador por `key` (tolera 2 cuadros sin dato, descarta eventos de menos de 200 ms) |
| `effects/*.ts` | Un plugin por efecto |
| `geometry.ts` | Ángulos, rejilla, interpolación y mapeo de pantalla |

### Agregar un efecto

Crea `effects/miEfecto.ts` con un `EffectPlugin` y agrégalo a `EFFECT_PLUGINS` en `effects/index.ts`. El orden de esa lista es el orden de dibujo. No hace falta tocar nada más del motor.

```ts
detect(pose, { tMs, aspect, state }) => FrameState[]  // {key, side?, pts, v?}; `state` persiste entre cuadros
draw({ ctx, map, width, height }, event, tMs) => void // map: normalizado → píxeles
```

### Efectos

| Efecto | Regla | Por defecto |
|---|---|---|
| Rejilla del torso | 2×3, de nariz − 0.6·torso a las caderas, ±1.2·ancho de hombros | sí |
| Brazo extendido | codo > 160° | sí |
| Ángulo de 90° | codo entre 70° y 112° | sí |
| Puntos de rejilla | muñeca a menos de 0.045·ancho de un nodo | sí |
| Arco de rotación | barrido de la muñeca > 95° en 650 ms | experimental |
| Estela de muñeca | últimos 500 ms | experimental |
| Ecos de pose | 4 ecos cada 120 ms | experimental |

Los ángulos se miden en proporción real de pantalla. El prototipo los medía en coordenadas normalizadas, lo que deformaba los ángulos en videos verticales.

## Persistencia

Tabla `figure_events` (`api/src/db/schema.ts`, migración `0004`):

- `class_id` es el ID del documento de Firestore, así que no lleva clave foránea.
- RLS: cada instructor solo ve y modifica sus filas, y el admin puede leerlas.
- `PUT` reemplaza la lista completa en una transacción. Antes comprueba en Firestore que `users/{uid}/classes/{classId}` exista y exige rol docente.

## Requisitos de despliegue

- El navegador descarga el WASM de `cdn.jsdelivr.net` y el modelo de `storage.googleapis.com`.
- **Detectar sobre un video ya subido** (no recién elegido) exige que el bucket de Storage tenga CORS para el dominio de la app. Si no lo tiene, el navegador no deja leer los cuadros. Detectar justo después de subir usa el archivo local y no necesita CORS.
- La API necesita `FIRESTORE_DB` para comprobar a quién pertenece cada clase.

## Pendiente (fases 2 y 3)

- **Fase 2:** arrastrar inicio y fin en la línea de tiempo, texto y stickers anclados a articulaciones, activar arcos, estela y ecos, y para el alumno espejo, loop y una pantalla propia.
- **Fase 3:** exportar un reel MP4 9:16 con los overlays quemados, dos bailarines en cuadro y comparación DTW.
