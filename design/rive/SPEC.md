# walnut.riv — the artboard spec

Two pieces on the docs site have a CSS/SVG version today and are drawn to be
taken over by Rive: the mark in the nav, and the mixing desk in the hero.
The framework itself stays free of JavaScript; Rive is page furniture,
like `docs/site-*.js`.

## Before it can ship

The docs' Content-Security-Policy (`vercel.json`) blocks Rive today. It needs:

- `'wasm-unsafe-eval'` added to `script-src`;
- `connect-src 'self'` (the page currently has no `connect-src`, so `default-src 'none'` blocks the
  `.riv` and wasm fetches);
- the runtime (`@rive-app/canvas`, pinned) and its `rive.wasm` copied into `public/rive/` by
  `build.js`, and `RuntimeLoader.setWasmUrl` pointed at that copy, never unpkg.

## Rules for every artboard

- **Colours come from the page.** Each artboard has a view model with colour properties named after
  the cues: `accent`, `bloom`, `gold`, `olive`, `cool`, plus `surface` and `text`. Bind every fill to
  one of them. The page writes the live palette into them and rewrites them on every
  `wal-recolour`, so the art changes palette with the page. The editor defaults are Prairie's colours.
- **The idle frame matches the SVG it replaces**, at the same size, so the swap shows no seam.
- **State machine: `main`.** Text stays in HTML.
- **Under 40 KB** for the file; no rasters, no fonts.

## Artboard `Mark` — the nav's walnut

The SVG: `.site-mark` in `docs/index.html` (and `docs/favicon.svg`): a walnut split by its
ground rod, holding a pair of braces, a dot at the crown (`accent`) and at the base (`cool`).

| View model | Type | Does |
|---|---|---|
| `crack` | trigger | Fired on a palette change. The shell splits along the rod, the two halves part a few degrees, the five cues fan out between them as paint chips (one per cue), and the halves close over them. About 900 ms, settling like walnut's own drawer curve: a knock at the stop, then still. |
| `hover` | boolean | The halves part a hair. |

## Artboards `Knob` and `Lamp` — the mixing desk

The CSS: `.site-console` in `docs/index.html`, driven by `docs/site-desk.js`. One `Knob` instance
per hue rod (four), and one `Lamp`.

| View model (Knob) | Type | Does |
|---|---|---|
| `hue` | number, 0–360 | The cap's pointer angle, and the ring's highlight. The site writes it; the knob itself does not listen to pointers (the page keeps the slider semantics, so keyboard and screen readers work unchanged). |
| `ringLightness`, `ringChroma` | number | The hue ring's lightness and chroma, so each ring is drawn at its own cue's. |
| `turning` | boolean | While dragged: the cap sinks 1 px and the brass catches more light. |

| View model (Lamp) | Type | Does |
|---|---|---|
| `lit` | boolean | Warms up over 250 ms (filament, then glass), cools over 600 ms. |
