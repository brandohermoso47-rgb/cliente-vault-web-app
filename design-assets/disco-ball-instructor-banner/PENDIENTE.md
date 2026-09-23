# Pendiente: bola disco 3D en el banner del instructor

Guardado tal cual el 2026-09-23, para usarse más adelante en el **banner predeterminado del
Panel de Instructor** (`isInstructor` en `tools/template.html`). Todavía no está conectado a
la app — es solo el material fuente.

Pieza reutilizable clave: **`disco-ball-widget.js`** — un custom element `<disco-ball-widget>`
con Shadow DOM, atributos `bpm` y `live`, y un método `burst()` (para celebraciones). Carga
three.js desde unpkg.com en tiempo real. Es lo que hay que integrar; el resto del zip
(`InstructorView.tsx`, `_ds/`, etc.) es solo el prototipo original de referencia visual, en un
stack distinto (React + lucide-react + motion) al de este proyecto — no es portable directo.

`waack_on_O_neon_transparent-...jpg` — esta imagen ya se reutilizó en la landing page
(`landing/landing-media/`) para los 3 fondos de tarjeta que faltaban.
