repo: brandohermoso47-rgb/cliente-vault-web-app
branch: main
path: src

## Last sync
date: 2026-09-11T01:55:00Z

### Updated in this project
- Recreado el panel de instructor (pestaña Dashboard) a partir de `InstructorView.tsx`
- Sustituida la bola disco SVG estática por una bola disco 3D real (three.js) animada
- La bola pulsa al BPM, indica clase en vivo/pausa y se puede girar arrastrando
- Añadido objeto 3D descargable (OBJ + MTL / GLB) en `bola-disco-3d.html`

## Screen map
| Pantalla del proyecto | Archivos del repo |
| --- | --- |
| Panel Instructor — Bola Disco.dc.html | src/components/InstructorView.tsx (líneas 400-406, 454-508, 1766-2360), src/index.css, index.html, src/components/Sidebar.tsx |
| bola-disco-3d.html | src/components/InstructorView.tsx (DiscoBall) |
