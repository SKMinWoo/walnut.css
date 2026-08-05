# Changelog

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

### Changed (breaking)

- **`--wal-font-serif` is now an actual serif stack.** It used to hold
  `"Courier Prime", Courier, monospace` — a typewriter face under a serif name,
  so `.wal-font-serif` silently gave you monospace. The typewriter stack moved
  to the new **`--wal-font-typewriter`** / `.wal-font-typewriter`, and
  `.wal-hero-tagline` (the only internal consumer, which wanted the screenplay
  texture) now points at it. If you were relying on `--wal-font-serif` for
  Courier, switch to `--wal-font-typewriter`.

### Known issues

- `docs/index.html` is still out of sync with the CSS. It references classes
  that do not exist (`.theme-cafe`, `.wal-plate-col`, `.wal-nav-link`,
  `.wal-label`, `.wal-dialog-content`, …) so its theme switcher does nothing.
  The real theme classes are `.wal-cafe` / `.wal-forest` / `.wal-dusk` /
  `.wal-bone`.
- The docs also use `.wal-text-muted` / `.wal-text-soft` as **colours**. They
  are font **sizes**. The naming split is: **`wal-text-*` = size,
  `wal-color-*` = colour.**
- Still no switch or fieldset styling; `.wal-field` is layout only and does not
  wire up `aria-describedby` for you.
- The chroma tokens are inputs, not guards. walnut cannot clamp them to the
  gamut itself — CSS has no way to compute the sRGB boundary — so a consumer
  driving hue at runtime has to fit chroma on its own side.

## 0.1.0

Initial release.
