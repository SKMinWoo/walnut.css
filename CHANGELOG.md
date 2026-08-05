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

### Known issues

- `docs/index.html` is still out of sync with the CSS. It references classes
  that do not exist (`.theme-cafe`, `.wal-plate-col`, `.wal-nav-link`,
  `.wal-label`, `.wal-dialog-content`, …) so its theme switcher does nothing.
  The real theme classes are `.wal-cafe` / `.wal-forest` / `.wal-dusk` /
  `.wal-bone`.
- The docs also use `.wal-text-muted` / `.wal-text-soft` as **colours**. They
  are font **sizes**. The naming split is: **`wal-text-*` = size,
  `wal-color-*` = colour.**
- Theme files contain selectors like `[data-theme="cafe"][data-theme="light"]`
  which can never match, since an element has one value per attribute. Intended
  convention: palette by class (`.wal-cafe`), mode by attribute
  (`[data-theme="light"|"dark"]`).
- `--wal-font-serif` resolves to a *monospace* (Courier Prime) stack despite
  the name.
- No form-control coverage beyond `.wal-input`: no label, checkbox, radio,
  switch or fieldset styling.

## 0.1.0

Initial release.
