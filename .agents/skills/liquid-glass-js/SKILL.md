---
name: liquid-glass-js
description: Add Apple "Liquid Glass"-style WebGL glass effects (buttons, containers, nav bars, panels) to a web page or project using the liquid-glass-js library. Use when the user asks for glassmorphism, frosted-glass, "liquid glass", or Apple-style translucent/refractive UI elements in HTML/CSS/JS.
---

# Liquid Glass JS

Vendored copy of [dashersw/liquid-glass-js](https://github.com/dashersw/liquid-glass-js) (MIT license) — a zero-dependency, vanilla-JS + WebGL library that renders real-time refraction/blur "liquid glass" UI elements (buttons, containers, nav bars) by sampling the page behind them.

## When to use this skill

- The user wants glassmorphism / frosted-glass / "Apple Liquid Glass" style UI: buttons, pill/nav bars, panels, control docks.
- The target is a plain HTML/CSS/JS page or an artifact — this library has no build step and no framework dependency.
- Not a fit for pure-CSS `backdrop-filter` blur asks that don't need real refraction — that's simpler and this library would be overkill.

## Files (in `assets/`)

- `container.js` — core `Container` class (WebGL glass rendering engine, shape masking, blur, page snapshot via html2canvas).
- `button.js` — `Button` class, extends `Container` with text, click handling, and nested-glass-on-glass rendering.
- `glass.css` — required glass component styles (`.glass-container`, `.glass-button`, etc).
- `styles.css` — base/demo page styles (optional — only needed to match the original demo look).

Copy the files you need into the target project (e.g. `js/liquid-glass/`) rather than referencing this skill's `assets/` path directly.

## Setup

Requires WebGL 2.0 support and `html2canvas` (for capturing the page behind the glass). Include in this order:

```html
<link rel="stylesheet" href="glass.css" />
<!-- styles.css is optional, only for demo-page base styling -->

<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
<script src="container.js"></script>
<script src="button.js"></script>
```

Must be served over `http(s)://` (not `file://`) — html2canvas and WebGL texture loading require it. Use a local server (`npx serve .`) when testing.

## Core API

### `new Container(options)`

| Option         | Type     | Default   | Notes                                   |
| -------------- | -------- | --------- | --------------------------------------- |
| `borderRadius` | number   | `48`      | px, ignored for `circle`/`pill` (auto-computed) |
| `type`         | string   | `'rounded'` | `'rounded'` \| `'circle'` \| `'pill'`   |
| `tintOpacity`  | number   | `0.2`     | 0–1 overlay strength                     |

Methods: `container.addChild(el)`, `container.removeChild(el)`, `container.updateSizeFromDOM()`.
Append `container.element` to the DOM.

### `new Button(options)` (extends Container)

| Option         | Type     | Default   | Notes                                  |
| -------------- | -------- | --------- | --------------------------------------- |
| `text`         | string   | `'Button'` |                                          |
| `size`         | number   | `48`      | font-size px, drives auto width/height  |
| `type`         | string   | `'rounded'` | `'rounded'` \| `'circle'` \| `'pill'`   |
| `onClick`       | function | `null`    | called with `(text)`                    |
| `warp`         | boolean  | `false`   | center distortion effect                |
| `tintOpacity`  | number   | `0.2`     |                                          |

```javascript
const button = new Button({
  text: 'Save Changes',
  size: 28,
  type: 'pill',
  tintOpacity: 0.4,
  onClick: text => console.log(`${text} clicked`)
})
document.body.appendChild(button.element)
```

### Nested glass (container + children)

Adding a `Button` to a `Container` makes the button sample the container's live rendered output instead of the raw page — glass-on-glass:

```javascript
const container = new Container({ borderRadius: 24, type: 'pill', tintOpacity: 0.3 })
const b1 = new Button({ text: 'Action', size: 24, type: 'pill' })
const b2 = new Button({ text: '✓', size: 24, type: 'circle' })
container.addChild(b1)
container.addChild(b2)
document.body.appendChild(container.element)
```

### Global tuning

`window.glassControls = { edgeIntensity, rimIntensity, baseIntensity, edgeDistance, rimDistance, baseDistance, cornerBoost, rippleEffect, blurRadius, tintOpacity }` — read once at each instance's shader-setup time. Set it *before* creating instances if you want non-default values; see README ranges below.

| Parameter        | Range     | Effect                              |
| ---------------- | --------- | ------------------------------------ |
| edgeIntensity     | 0–0.1     | refraction strength at edges         |
| rimIntensity     | 0–0.2     | rim lighting                         |
| baseIntensity    | 0–0.05    | center distortion (needs `warp:true`)|
| edgeDistance     | 0.05–0.5  | edge falloff curve                   |
| rimDistance      | 0.1–2.0   | rim falloff curve                    |
| baseDistance     | 0.05–0.3  | center falloff curve                 |
| cornerBoost      | 0–0.1     | extra corner enhancement             |
| rippleEffect     | 0–0.5     | surface ripple texture               |
| blurRadius       | 1–15      | background blur amount               |
| tintOpacity      | 0–1.0     | gradient overlay strength            |

## Known constraints

- No NPM package / no build step / no TypeScript types — plain `<script>` includes only.
- Every `Container`/`Button` opens its own WebGL context; avoid creating dozens on one page.
- `Container.pageSnapshot` is captured once (via html2canvas) and shared by all standalone (non-nested) instances — it does not auto-refresh if the page content changes after creation. For a page that changes dynamically, recreate the affected instances or accept a stale background sample.
- Browser support requires WebGL — mobile Safari/Chrome tested to spec in the README but always verify visually since this is shader-heavy.

## Verifying

After wiring it into a page, start a static server (`npx serve .` or the project's own dev server) and open it in a browser — check the effect renders and buttons respond to clicks. This cannot be verified by type-checking or unit tests alone since it's a WebGL visual effect.
