# Changelog

## 0.4.0

The theming release. A theme used to be a 130-line file that restated every
derived token three times; it is now a **colour script** — one ground rod and
five cues — and everything else is derived from it, once, for both modes.

### Changed (breaking)

- **Mode is now `color-scheme`, driven by `light-dark()`.** Every colour token
  is declared exactly once as `light-dark(light, dark)` instead of being
  restated under a class rule and again under a `prefers-color-scheme` media
  query. `.wal-light` / `.wal-dark` / `data-theme` now set `color-scheme` and
  nothing else.

  **If your app does its own dark mode with a class, add `color-scheme` to it**
  or walnut's tokens will resolve to their light branch:

  ```css
  .dark { color-scheme: dark; }   /* one line */
  ```

  In exchange: native form controls, scrollbars and the canvas follow the mode
  for free, and a subtree can flip mode on its own (`<section class="wal-light">`)
  without a second palette, because `light-dark()` resolves where a token is
  *used*, not where it is declared.

- **Browser floor raised to Chrome 123 / Safari 17.5 / Firefox 120**, which is
  what `light-dark()` requires.

- **`.wal-color-*` utilities now resolve to the `-ink` form of their cue.**
  `.wal-color-gold` was setting `--wal-gold`, a fill colour, as paragraph text —
  legible on a dark ground and a squint on a light one. Use `--wal-gold`
  directly where you want the fill.

- **`--wal-accent-fg` and friends are computed, not stated.** If you were
  overriding them, you still can; they are now derived by default.

### Added

- **Two more cues: `--wal-bloom` and `--wal-cool`**, completing the five-cue
  script. Their hues default to *offsets from the accent* — `+27°` and `+209°`,
  a warm step and a near-exact complement — so rotating the accent rotates the
  whole script in tune instead of pulling the lead colour away from the cast.
  Both offsets were measured off a palette that had been mixed by hand over
  months; the structure was already there, it just was not written down.

- **`--wal-<cue>-ink` for all five cues.** A cue used as *type* needs more
  separation from the ground than the same cue used as a *fill*. This is the
  single most common way a hand-made palette fails — goldenrod is a fine button
  and an illegible paragraph — and it is now a token rather than something every
  consumer rediscovers. Badges, links, eyebrows, timeline dates and stat values
  all read the `-ink` form.

- **Computed foreground contrast.** `--wal-<cue>-fg` picks near-black or
  near-white arithmetically from the cue's own lightness using relative colour
  syntax, keeping a trace of the cue's chroma so it reads as warm cream rather
  than as a sticker. Behind `@supports`, with a stated fallback.

- **`--wal-cue-1` … `--wal-cue-5`.** Positional aliases, for iterating the
  script without knowing the cue names.

- **A third theming axis: finish.** `data-finish="catalogue"` applies a
  mid-century catalogued look — square corners, visible rules, tabular figures,
  typewriter labels, no glow, almost no shadow — to any palette in either mode.
  `data-finish="soft"` names the stock look. New `finish` cascade layer, between
  `components` and `utilities`.

- **New palette: `press`.** A 1960s parts catalogue on a walnut desk. Paper
  stock, tomato plate numbers, goldenrod rules, one cold blue. Paper-first, and
  the palette the catalogue finish was designed against.

- **Catalogue components:** `.wal-script` (the palette, printed — five empty
  `<li>`s and it fills itself from the cues), `.wal-rule` (a hairline with a
  label in it), `.wal-caption`, `.wal-index`, `.wal-section-head`.

- **Atmosphere and geometry scalars:** `--wal-elevation` scales every shadow
  offset, `--wal-wash` scales the tinted light on `<body>`, `--wal-line-boost`
  strengthens hairlines without owning a colour, `--wal-badge-radius` joins the
  existing per-component radius tokens. A finish is mostly just these.

- **`.wal-palette`** — a scoping hook. Any element carrying it re-derives the
  whole script from the rods in effect there.

- **`--wal-font-label`** — the face used for catalogue furniture (eyebrows,
  plate keys, captions, figure numbers), separate from `--wal-font-mono` so a
  finish can change the label voice without changing the code voice.

### Fixed

- **`walnut.min.css` was not the same stylesheet as `walnut.css`.** Two
  independent minifier bugs, both silent, in the file the README tells you to
  install:

  1. **`//` "line comment" stripping.** CSS has no `//` comments, so the step
     could only ever destroy real content — and it did. The `//` in
     `xmlns="http://www.w3.org/2000/svg"` inside the inline SVG data URIs
     matched, deleting the rest of the line and leaving `url('data:…<svg
     xmlns="http:` unterminated. An unterminated string swallows the CSS after
     it, so **every rule following `.wal-card-flora` stopped applying** — the
     back half of the components layer and the entire finish layer. Step
     removed.

  2. **Whitespace stripped around `+`.** CSS *requires* whitespace on both sides
     of `+` and `-` inside `calc()`, so `calc(var(--a) + 27)` became
     `calc(var(--a)+27)` — invalid, and silently computed to black. Every
     derived hue and lightness goes through that path. `+` and `~` are no longer
     stripped.

- **The `hidden` attribute did not work on walnut components.** Every component
  that sets `display` — `.wal-badge`, `.wal-chip`, `.wal-btn` and a dozen others
  — outranks the UA sheet's `[hidden] { display: none }`, so
  `<span class="wal-badge" hidden>` rendered anyway. Restated in the utilities
  layer, which is the only layer that sits after components.

- **`.wal-nav` overlapped its own brand at narrow widths.** A fixed `height`
  plus no wrapping meant the links ran off the page. It now wraps to a second
  row and the link row scrolls, so nothing is hidden and no JavaScript is
  involved.

- **`.wal-plate` drew a solid block in a ragged last row.** The hairlines were a
  line-coloured *container* showing through 1px gaps, so any grid area with no
  cell in it — three specs across two columns, which is just a narrow viewport —
  rendered as a filled block that read as a fourth, empty spec. The container
  now carries the cell colour and each cell draws its own dividers with
  `outline` (drawn outside the box, so it does not affect layout and adjacent
  cells meet inside the gap). Unfilled areas are simply blank.

- **walnut restyled every scroll container in a consuming app.** The Firefox
  scrollbar rule was on `*`; it is now on `html`, where the document scrollbar
  actually takes its styling from. Consumers no longer have to reset both
  `scrollbar-color` and `scrollbar-width` to get their own bars back.

- **Themes could not be scoped.** The derivation now also matches
  `.wal-palette` and the palette classes, so a palette on `<body>` or on a
  section works rather than silently inheriting `:root`'s already-substituted
  colours.

## 0.3.0

Continues the same exercise as 0.2.0 — everything here came from driving the
framework from an application rather than from reading the source. The one
breaking change is a token rename that was a mislabelling, not a redesign.

### Changed (breaking)

- **`--wal-font-serif` is now an actual serif stack.** It used to hold
  `"Courier Prime", Courier, monospace` — a typewriter face under a serif name,
  so `.wal-font-serif` silently gave you monospace. The typewriter stack moved
  to the new **`--wal-font-typewriter`** / `.wal-font-typewriter`, and
  `.wal-hero-tagline` (the only internal consumer, which wanted the screenplay
  texture) now points at it. If you were relying on `--wal-font-serif` for
  Courier, switch to `--wal-font-typewriter`.

### Fixed

- **Dead theme selectors.** Every theme file carried
  `[data-theme="cafe"][data-theme="light"]` and friends. One element has exactly
  one value per attribute, so these could never match. Removed; the working
  forms are `.wal-cafe[data-theme="light"]`, `[data-theme="cafe"].wal-light`,
  and the fused `[data-theme="cafe-light"]`. The convention is now stated in the
  source: **palette by class, mode by attribute.**

- **Theme files defeated the chroma tokens.** The base tokens derive
  `--wal-accent` from `var(--wal-accent-chroma)`, but each theme re-declared
  `--wal-accent` with the number inlined — so setting the token had no effect
  the moment a theme class was applied. Themes now *set* the chroma tokens and
  share the derivation, which is what makes gamut-aware dynamic theming
  possible under a theme.

- **`docs/index.html` rewritten against the real API.** It documented a
  framework that was never shipped: ten classes with no definition, a GitHub
  link to a nonexistent repo, wrong token defaults, and ~20 uses of
  `.wal-text-soft` / `.wal-text-muted` as colours — neither is a class, only a
  token, so they did nothing. The theme switcher was inert because it toggled
  `theme-cafe` / `theme-botanical` / `theme-midnight` / `theme-snow`, none of
  which exist. It now switches the four real palettes live.

### Added

- **`--wal-accent-chroma`, `--wal-gold-chroma`, `--wal-olive-chroma`.** The
  saturated tokens used to inline their chroma. The sRGB gamut is not the same
  width at every hue: at 62% lightness `c=0.17` is in gamut around terracotta
  and clips across much of the green–blue arc, where the browser silently
  flattens it and the rendered colour stops matching the requested hue. Anyone
  rotating `--wal-*-hue` therefore needs to lower chroma with it, and CSS cannot
  compute the gamut boundary — so it has to be an input.

- **Form primitives:** `.wal-field`, `.wal-label` (with `[data-required]`),
  `.wal-hint`, `.wal-error`, `.wal-check`, `.wal-radio`. The controls use
  `accent-color` rather than re-drawing the native widget, which keeps the
  platform's focus ring, keyboard behaviour and indeterminate state.

- **Packaging:** an `exports` map (`.`, `./min`, `./themes/*`, `./src/*`),
  `"sideEffects": ["*.css"]` so bundlers don't tree-shake the stylesheet away,
  and `prepublishOnly` so `dist/` can never be published stale.

### Known issues

- Still no switch or fieldset styling; `.wal-field` is layout only and does not
  wire up `aria-describedby` for you.
- The chroma tokens are inputs, not guards. walnut cannot clamp them to the
  gamut itself — CSS has no way to compute the sRGB boundary — so a consumer
  driving hue at runtime has to fit chroma on its own side.

## 0.2.0

First release with real consumers. Everything below was found by adopting the
framework in a production site rather than by reading the source.

### Fixed

Four bugs that all parsed and rendered fine — they just did the wrong thing,
which is why none of them were obvious.

- **Nested `@layer components`.** `src/layers/04-components.css` opened its own
  `@layer components {`, and `build.js` wrapped every layer file again. The
  result was a sublayer `components.components`, which outranks the outer
  `components` layer — so a consumer writing `@layer components { ... }` to
  override a framework rule *lost*, which is the exact opposite of what the
  cascade-layer architecture promises.

- **Container queries that could never match.** `.wal-grid`, `.wal-plate` and
  `.wal-sidebar` each set `container-type` on themselves and then wrote
  `@container` rules targeting themselves. A container query resolves against
  the nearest **ancestor** container; an element cannot query its own size. So
  `.wal-cols-2/3/4/5` never collapsed and `.wal-plate` never went multi-row, at
  any width. All three now size intrinsically with `auto-fit` + `minmax()`,
  which needs no container and works at any nesting depth.

  Dropping `container-type` also removed the implied `contain: layout`, which
  had quietly made every grid, plate and wrap a containing block for
  `position: fixed` descendants — so a modal or drawer inside one would anchor
  to it instead of the viewport.

- **`wal-pulse` keyframe collision.** Defined twice: a box-shadow ping in
  `components` (used by `.wal-avail-dot`) and a `transform: scale()` in
  `cinema`. `cinema` sorts later, so the availability dot scaled instead of
  glowing. The components one is now `wal-ping`.

- **`.wal-plate` dividers** relied on `nth-child` rules that only held for one
  particular column count. They are now a 1px `gap` over a line-coloured
  background, which lands correctly at any wrap configuration.

- **`.wal-text-md`** utility was missing even though the `--wal-text-md` token
  existed.

- **README** documented `.wal-nav-name` / `.wal-nav-subtitle`, neither of which
  exists. The real API is `.wal-nav-brand` with a nested `<small>`.

### Added

- **`--wal-card-bg` and `--wal-card-ink{,-soft,-muted}`** — lets a surface
  deliberately *not* follow the page theme: a printed plate, receipt, ticket or
  code card that stays light on a dark page. `.wal-card`, `.wal-plate`,
  `.wal-metric` and `.wal-swatch` rebind the inherited ink scale from these, so
  every descendant flips with the surface without per-child overrides.

  `--wal-card-ink` must be a **literal** value, never `var(--wal-text)`.
  Pointing it at `--wal-text` while `.wal-card` points `--wal-text` at
  `--wal-card-ink` is a substitution cycle: both resolve invalid and every card
  loses its text colour.

- **Components:** `.wal-footer` / `.wal-footer-grid`, `.wal-iconbtn`,
  `.wal-link-arrow`, `.wal-stat`, `.wal-note`, `.wal-list-dash`, `.wal-frame` /
  `.wal-frame-window` / caption, and `.wal-cols-6`.

- **Token hooks** so consumers can retheme without overriding rules:
  `--wal-btn-radius`, `--wal-chip-radius`, `--wal-eyebrow-{color,font}`,
  `--wal-table-font`, `--wal-plate-bg`, `--wal-plate-min`,
  `--wal-metric-border-width`, `--wal-swatch-h`, `--wal-iconbtn-size`,
  `--wal-frame-ratio`, `--wal-note-color`, `--wal-stat-color`,
  `--wal-list-marker`, `--wal-footer-min`.

## 0.1.0

Initial release.
