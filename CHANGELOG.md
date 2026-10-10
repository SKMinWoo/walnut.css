# Changelog

## Unreleased

Motion that moves the colour script itself, rather than the elements on top
of it — and a contrast pass that brings every text pair in every palette and
mode to WCAG AA. Then openings taken from furniture (a plan chest, a sliding
door, a gatefold), materials that give them weight, charts, and the parts
the platform can now draw with no script.

### Changed (breaking)

- **Café, Bone, Dusk and Forest lead with new accents.** All five shipped
  palettes used to open on a warm red or orange (accents between 25° and
  60°), so side by side they read as one palette in five rooms. Each now
  leads with its own hue and keeps its old lead as a supporting cue:

  | Palette | Accent was | Accent now | The old lead moved to |
  |---------|------------|------------|-----------------------|
  | Café    | terracotta 25° | china blue 258° | (the default script, below) |
  | Bone    | terracotta stamp 25° | asagi teal 208° | cool, as a hanko vermilion 30° |
  | Dusk    | sunset orange 40° | twilight violet 302° | gold, as the lantern 62° |
  | Forest  | copper 60° | fern 150° | bloom, as campfire copper 55° |

  Press keeps its tomato. Café now pins `--wal-bloom-hue` and
  `--wal-cool-hue`, and Bone and Forest pin `--wal-bloom-hue`, because the
  default steps from these accents land on hues outside their stories.
  Forest's ground turns from 145° to 120°. Every fill in the four sits inside
  sRGB, and every text pair still clears 4.5:1 in both modes.

  **Café is no longer the default script.** `:root` keeps the terracotta
  script it always had; a page that named no palette looks exactly as
  before. A page that put `.wal-cafe` on to get that look should drop the
  class.

- **Tooltip markup.** The tip now goes *inside* its trigger, and the trigger
  points at it:

  ```html
  <button class="wal-tooltip-trigger" aria-describedby="t1">Save
    <span class="wal-tooltip" id="t1" role="tooltip" aria-hidden="true">Saves a draft</span>
  </button>
  ```

  The sibling form, the undocumented `:popover-open` form and anchor
  positioning are gone. Escape-to-dismiss needs two lines of script; see the
  README. An `overflow: hidden` ancestor (`.wal-card` is one) clips it.

- **Removed the per-primitive gap modifiers** (`.wal-stack.wal-gap-lg` and
  friends in the layout layer). They never applied: the `.wal-gap-*`
  utilities sit in a later layer, and layer order outranks specificity, so no
  rendered spacing changes — but a selector that targeted them is gone.

- **The ramp is typed.** Lightness stops must be a `<percentage>`, chroma
  multipliers a `<number>`, the ink and hover shifts a `<percentage>`, and
  `--wal-radius-sm` / `-lg` a `<length>`. A wrongly-typed value (`0.93` for a
  stop, `6` for a radius) used to flow through; it now falls back to the stock
  value.

- **Press and Bone no longer set `--wal-elevation` or `--wal-wash`.** Without a
  finish they get the stock shadow and wash. For the old look put
  `data-finish="catalogue"` on Press, or `--wal-elevation: 0.75` on Bone. See
  Fixed.

- **Catalogue label tracking 0.16em → 0.12em.** Courier Prime is monospaced, so
  its advance is already wide, and captions multiply the token by 1.6 — at
  0.16em they set at 0.26em and read as spaced-out letters.

- **The contrast pass moves colours.** Hues, chromas and palette character are
  unchanged; these lightness stops moved, by the least that clears AA:

  | Stop | Light | Dark |
  |------|-------|------|
  | `--wal-l-text-muted` | 58% → 49% | 52% → 64% |
  | `--wal-l-text-soft` | — | 68% → 72% |
  | `--wal-l-bloom` | 58% → 54% | — |
  | `--wal-l-gold` | 62% → 60% | — |
  | `--wal-l-olive` | — | 55% → 60% |

  Press: soft 50.2% → 44% and muted 48.5% on paper, soft 80% / muted 72.5% /
  ink shift 15% on the desk. Bone: muted 56% → 50.5%. Forest: gold 59% on
  paper. Dusk: olive 58% → 62% at night. `--wal-danger` now uses the accent's
  *ink* stop, so `.wal-error` is darker on paper and lighter at night. Dark-mode
  primary buttons (and every `-fg` the threshold change below flips) now carry
  near-black type.

- **`--wal-warning` is removed.** Nothing in walnut read it. Define it yourself
  if you used it: `oklch(var(--wal-l-gold-light) 0.14 85)` was its light value.

- **`[hidden]` is now `display: none !important`**, in the reset layer. It
  beats every walnut display rule, and an unlayered rule of yours as well:
  remove the attribute to show the element.

- **A `.wal-palette` scope re-derives bloom and cool** from the accent in
  effect there, including under a palette that stated its own. Set them on the
  same element to pin them.

### Added

- **Openings.** `.wal-chest`, a plan chest of `<details>` drawers that
  slide out of their slots in the flow of the page. `.wal-door`, a sliding
  side panel on a `<dialog>` opened with `commandfor`, so it needs none of
  `.wal-drawer`'s script. `.wal-window`, a page inside the page, which
  `walnut-motion.js` opens as a gatefold from the card that opened it
  (`data-wal-open="gatefold"`, `walnut.open`). A window that a link or Back
  opens can open in place and still go home to its card
  (`{ instant: true }`), and a close asked for while it opens waits for it
  to land. The cover needn't be the card picture's shape: it travels at one
  scale, cropped to the picture, and the crop opens as it lands
  (`--wal-cover-focus` places the picture on the cover). A card whose
  picture is not drawn opens and closes its window in place.
- **Materials.** `data-motion="materials"` on `<html>`, or
  `data-wal-material` on any element, gives openings weight: walnut
  (1050ms out, 800ms home) hits its stop and knocks back, brass (480ms,
  380ms) rings, stone (1200ms, 1000ms) grinds to a dead stop. A material is
  the four new opening tokens, `--wal-open-duration`, `--wal-open-ease`,
  `--wal-close-duration` and `--wal-close-ease`, so a part of your own takes
  one by transitioning on them.
- **Charts.** `.wal-chart` (columns on a brass rail, stringing for
  gridlines), `.wal-ring` (shares inlaid in a brass bezel) and `.wal-key`,
  drawn from the markup with no script. Under Materials they are brass, and
  a new value strikes and rings.
- **`.wal-tint`** and `.wal-fill-tint`: any colour, as ink, wash, fill and
  text on the fill, legible in both modes. Unset, it is the accent, rebuilt
  from its stops so it resolves in the Chrome versions the `-fg` fix below
  covers. The same as CSS functions, `--wal-ink()` and `--wal-soft()`.
- **`--wal-corner-shape`**: `round`, `squircle` or `bevel`, read by every
  rule that draws a radius. The Catalogue finish bevels.
- **Native parts.** `.wal-select` (`base-select`, options with swatches),
  `.wal-menu` (an anchored popover that flips to fit), `.wal-carousel`
  (scroll markers and buttons, in `walnut-scroll.css`), and `.wal-tip` (a
  tooltip on `interestfor`, with no script and no nesting).
- **Less script.** `.wal-nav` draws its scrolled rule with a scroll-driven
  animation and, with `walnut-scroll.css`, lights the link in view with
  `:target-current`; `.is-scrolled` and `.is-active` remain for browsers
  without them.
- **Parses in Lightning CSS**, so Next.js (Turbopack), Vite, Parcel and Bun
  can import it: the nav's rule is a scroll-driven animation rather than a
  scroll-state query, the open picker is `.wal-select:open::picker(select)`,
  and `@function` parameters are untyped. The build refuses the spellings
  Lightning CSS rejects.
- **`walnut-scroll.css`**, an optional sheet for the selectors Lightning CSS
  cannot read in any spelling: the carousel's `::scroll-marker` and
  `::scroll-button()`, and the nav's `:target-current`. Link it beside
  `walnut.css` (`walnut.css/scroll` in the package). Without it the
  carousel is a row you swipe and the nav lights a link from `.is-active`.
- **`walnut.shuffle`** and `.wal-shuffle`: a filter or sort where every
  item travels to its new place, as a view transition scoped to the list.
- **`walnut-motion.d.ts`**: types for `walnut.open` and `walnut.shuffle`,
  and for `window.walnut`, so a TypeScript app can load the script and call
  them as they are (`walnut.css/motion` resolves to both).
- **`walnut-motion.js`**, the third optional script, for the gatefold and
  the shuffle.
- **Print.** A walnut page prints as a catalogue sheet: A4, light, flat,
  numbered at the foot, with link addresses printed, screen furniture left
  off (or anything marked `data-wal-print="skip"`) and every chest drawer
  out. Charts, keys, scripts and swatches print in colour.

- **`.wal-retune`.** Tweens the rods — the ground, all five cues, the ramp and
  the geometry scalars — when a palette class, a finish or an inline rod
  changes. Because every colour is derived per frame from the in-flight
  numbers, a hue travels along the wheel and each intermediate frame is a
  coherent script, not a crossfade of two screenshots. Derived cues stay locked
  to the accent: bloom's transition runs on the accent's timing from a value
  27° away to a value 27° away. Opt-in, and meant to be dropped while a control
  bound to a rod is being dragged. `--wal-retune-duration`, `--wal-ease-travel`.

- **`.wal-cue-in`.** The page prints itself on load: ground chroma first, then
  the five cues in script order, each rising from zero. Only chroma moves, so
  contrast is final from the first frame. Keyframes state only `from`, so the
  same six print any palette, including one written inline.
  `--wal-cue-in-pass`, `--wal-cue-in-stagger`.

- **The ramp is registered.** All lightness stops (`--wal-l-*`), chroma
  multipliers (`--wal-cx-*`), `--wal-radius-sm` and `--wal-radius-lg` now have
  `@property` rules. Without them a palette switch snapped the stops a palette
  nudges while its hues were still travelling. Registration is typed, so these
  must be a `<percentage>`, `<number>` and `<length>` respectively; an invalid
  value now falls back to the stock ramp instead of invalidating the colour.
  The ink and hover shifts are registered too.

- **`--wal-line-input`**, the border of `.wal-input`, from a new registered
  stop pair `--wal-l-line-input-light/-dark`. A divider hairline may be faint;
  the edge of an empty text field is the only thing marking it, so it is held
  to 3:1 against every ground (WCAG 1.4.11). `--wal-line` measured 1.2–1.6:1.

- **`--wal-border`**, the standard rule as one shorthand
  (`var(--wal-hairline) solid var(--wal-line)`). Every border in walnut now
  goes through `--wal-hairline`; 30 of them hard-coded `1px`.

- **Forced-colours support.** Rules, the divider, list markers, the nav
  underline, the progress bar and the availability dot are redrawn as borders
  or in system colours under `forced-colors: active`; `select.wal-input` gets
  the native arrow back; colour-chart swatches keep their colours.

- **`.wal-desk`.** Papers on a walnut desk, literally: a grain under the page,
  drawn by the browser from SVG noise and tinted from the ground rod
  (`--wal-desk-ink`), so it re-themes with the script; and a resting shadow
  under every top-level card, plate and metric. On a light page the grain goes
  no darker than `--wal-bg-subtle`, so every ink keeps the contrast it was
  tuned to — 240 more pairs checked, none below AA. On `<html>` or `<body>`.
  The desk holds still: a pointer-parallax version was built and taken out,
  because a window's worth of grain moving even a few pixels read as
  dizzying rather than as depth.

- **Acts: `dist/walnut-acts.js`, an optional script.**
  Mark sections `data-act="wal-dusk"` (or give them rods of their own) and,
  as each reaches the middle of the window, the whole page retunes to its
  script under `.wal-retune`. An act lasts until the next begins; above the
  first, the page keeps its opening script. A page opened or reloaded
  mid-scroll starts in the right act without a tween, reduced motion cuts,
  and acts never change the mode. An IntersectionObserver wakes it only at
  an act's edge, so scrolling within an act does no work.

- **Page-to-page transitions.** `@view-transition { navigation: auto; }`:
  a same-origin navigation between walnut pages crossfades, so what the pages
  share — masthead, desk, ground — holds still while the papers change.
  Elements named alike on both pages travel between them on walnut's easing
  (`::view-transition-group(*)` now takes `--wal-duration-slow` and
  `--wal-ease`). Opt out with your own `@view-transition { navigation: none; }`.
  Chrome 126, Safari 18.2; elsewhere, and under reduced motion, links just
  navigate.

- **Recolour from the swatch: `dist/walnut-recolour.js`, an optional
  script.** Put `data-wal-recolour="swatch"` on `<html>` and every palette
  change made through it opens out of the control that asked for it, in a
  circle with a 96px soft edge, until it covers the page. A view transition
  masks the "after" picture, so every frame is either the old palette or the
  finished new one, and contrast holds throughout. Buttons with
  `data-wal-palette="wal-dusk"` need no script of their own; `aria-controls`
  aims one at a `.wal-palette` section, and `aria-pressed` is kept in step.
  From script, `walnut.recolour(target, { palette } | { rods } | fn, { from })`,
  and each change fires a bubbling `wal-recolour` event from inside it.
  Without the attribute, or without view-transition types, it tweens with
  `.wal-retune`; reduced motion cuts; acts keep retuning. Tune with
  `--wal-recolour-duration` (760ms). Exported as `walnut.css/recolour`.

- **`.wal-duotone`: any photograph printed in two inks**, a deep shade of
  one cue and paper, as a gradient map from two blend modes. `data-ink`
  picks the cue (`accent` by default). A new palette or mode regrades it with
  nothing for the page to do; by night the paper greys so a print is not a
  white rectangle; in forced colours the photograph is shown plainly.
  `overflow: clip`, so a scroll-driven animation inside it still reads the
  page's scroll.

- **`.wal-reveal-develop`.** A print comes up out of blank paper as it
  scrolls into view, shadows first and highlights last, by easing a
  brightness filter back down to the duotone's own. On the image, so the
  ink and the paper hold still around it.

- **Docs: `next.html` shows all three.** Its catalogue recolours from the
  swatch; each colourway's "Open page" opens a gatefold window whose cover
  is the plate, in walnut, with every colour's oklch, hex and contrast in
  both modes, and an `#open=` address so Back closes it; its prints are duotones with an
  ink row; and a new tool reads a photo into a palette whose every text pair
  passes AA. The README has the in-page morph under "Between pages".

- **Dialog and popover entrances.** A `.wal-dialog` that is a `<dialog>` or a
  `[popover]` rises the last 0.75rem into place as it fades in, and sinks back
  as it closes, backdrop with it — `@starting-style`, with `display` and
  `overlay` transitioning discretely so the exit plays in the top layer. A
  `.wal-dialog` used as a plain box is never hidden by it.

- **`--wal-tooth`, a finish token: the stock's paper tooth.** Catalogue sets
  a fibre-and-mottle texture that cards, plates and metrics multiply into
  their own colour; Soft resets it. It darkens light stock by about four
  percent at most, and muted text on the darkest speck still clears 4.8:1.
  A paper repainted by a `.wal-fill-*` or `.wal-bg-*` utility stays flat:
  gold's dark foreground on a toothed gold fill measured 4.3:1.

- **Docs: `openings.html`**, a deck of the openings, the materials and the
  seven new parts, each demo running on the built framework.

- **Docs: plate 14 has a page of its own** (`docs/specimen.html`), which the
  workbench's specimen card grows into and which is in three acts. The
  workbench now remembers the reader's palette, mode and finish for the tab.

### Changed

- **Same-origin navigations between walnut pages now crossfade** instead of
  cutting (see Page-to-page transitions). Visible on any site of more than
  one walnut page; opt out as above.

- **Tooltips drop the last quarter-rem into place** from their trigger as
  they fade in, rather than fading in where they stand.

- **Root view transitions crossfade instead of zooming.** The breathe keyframes
  scaled the whole-page snapshot to 0.98 / 1.02, which read as the browser
  zooming. Named elements keep the breathe; `root` fades.

### Fixed

- **No blur in a bundled app.** Every `backdrop-filter` (the nav, the
  overlay, the dialog and window backdrops, `.wal-glass`) was written before
  its `-webkit-` twin. Lightning CSS (Next.js with Turbopack, Vite, Parcel,
  Bun) reads the later one as overriding the first and prints the prefix
  alone, which Chrome ignores, so it drew none of them. They are now
  prefixed first, and the build refuses the old order.

- **Muted text failed AA everywhere.** `--wal-text-muted` measured 2.05–4.28:1
  in all 40 palette × mode × ground cases. It now clears 4.5:1 on `bg`,
  `bg-subtle`, `surface` and `surface-2` in every palette and mode, and stays
  visibly quieter than `--wal-text-soft`. Press's soft text on its `surface-2`
  and `bg-subtle` (3.93–4.49) is fixed with it.

- **`-fg` picked the worse foreground in 19 of 50 cases.** The computed
  threshold was `0.63`; any value in 0.56–0.58 picks the better of the two
  candidates for every shipped cue, and it is now `0.57`. Dark-mode primary
  buttons went from 3.6:1 to 4.9:1; text on gold (the skip link) from 3.3:1
  to 4.7:1 or better. Bloom on paper and olive at night sat where neither
  candidate reaches 4.5:1 and moved out of that band. The `@supports`
  fallbacks, which failed 20 of 50, now make the same per-mode pick.

- **Badges and error text below 4.5:1.** Gold badges on paper (4.17–4.46),
  Press's olive ink on a dark card (3.86) and its accent, olive and cool badges
  there (4.0–4.3), and `.wal-error` on Press's desk (4.15). All clear AA now on
  `bg` and `surface`.

- **Bloom, cool, rules and shadows did not follow a scope.** The bloom and cool
  offsets were declared only on `:root`, and the hues are registered numbers,
  so `<section class="wal-forest">` inherited bloom 58 instead of 87, and the
  README's `.wal-palette` example did not move them. A `data-finish` subtree
  changed radii and label voice but kept the root's rule strength and shadow
  depth. Both now re-derive where they are scoped.

- **`--wal-tracking-label`'s `@property` rule was invalid** (`0.1em` is not a
  computationally independent initial value), so it was dropped by every
  browser. The rule and its dead `.wal-retune` entry are gone.

- **`[hidden]` lost to `.wal-flex` and the other display utilities.**

- **The tooltip renamed its trigger and failed WCAG 1.4.13.** Its text was
  part of the button's accessible name; it could not be hovered or dismissed.
  It now can, and the name is the button's own.

- **`.wal-input` lost its focus indicator in forced-colours mode** (`outline:
  none`, and the box-shadow ring is dropped there). It uses a transparent
  outline, which forced colours paint.

- **Press and Bone's light-first rule beat an app's `.dark { color-scheme:
  dark }`** at (0,4,0). It is wrapped in `:where()`.

- **`walnut.css/themes/press.css` resolved to `press.css.css`** through the
  package exports.

- **Smaller fixes.** The required-field `*` is no longer read aloud; the
  disabled select keeps its arrow; `.wal-sr-only` uses `clip-path`; drawer
  links ease back out; impossible fallbacks (`#10b981` ×5, `64px`, card
  tokens) and cinema fallbacks that disagreed with the tokens are gone;
  `.wal-dialog[popover]` no longer repeats its parent; the soft finish resets
  with `initial` instead of restating each stock number.

- **Docs page.** Install instructions pointed at an npm package that was never
  published; they now use jsDelivr. "Copy this CSS" omitted the palette's ramp
  nudges, its own cool and its forced mode, so the pasted script rendered a
  different page. A double click on the mode button logged an unhandled
  rejection. The foreground showcase used gold, which no longer flips between
  modes; it shows the accent. Browser support now states the Firefox 128 floor
  for `.wal-retune` and the `mod()` the wheel needs.

- **Build.** Guards run before anything is written, so a failing one cannot
  leave a half-written `dist/`; a theme missing from disk fails the build
  instead of being skipped; the version comes from `package.json`.

- **Hue travel is numeric, and now says so.** A registered `<number>` hue
  interpolates the numeric way, not the short way round: Café (55) to Dusk
  (280) passes through green. The README and the cinema layer said "round the
  wheel"; they now explain it and the workaround (state a neighbour's hue
  within 180, e.g. `-80` for `280`).

- **The docs tooltip never appeared, and two tooltips could not coexist.** The
  only rule that showed a `.wal-tooltip` expected it as the trigger's next
  sibling, so the markup on the docs page stayed at opacity 0 on hover. Every
  trigger also shared one `anchor-name`, which resolves to the *last* element
  on the page carrying it, so a second tooltip pinned the first to the wrong
  button.

- **The `<select>` arrow vanished on dark grounds.** It was an SVG data URI
  stroked with `currentColor`, but a background SVG is its own document, so
  its `currentColor` is always black. It is now two gradients, which read the
  element's real `currentColor`.

- **A closed `.wal-drawer` kept its links in the tab order.** It was only
  translated off-canvas, so keyboard focus walked into a panel nobody could
  see. It is now `visibility: hidden` once the slide finishes.

- **`.wal-progress-bar` sat at full width in browsers without scroll-driven
  animations.** The timeline was dropped, the animation ran at its default 0s,
  and nothing held the start frame. It is now hidden there.

- **Colour contrast in two components.** The secondary button's hover label
  used the plain accent as type (3.8:1 on dark); it now uses `--wal-accent-ink`,
  as links do, and so does the drawer's hover. The skip link set `--wal-bg` on
  gold (3.0:1 on light); it now uses the computed `--wal-gold-fg`.

- **Scrollbar styling reached every scroll container in Safari.** A bare
  `::-webkit-scrollbar` means `*::-webkit-scrollbar`, so the "scoped to `html`"
  rule was not. It now says `html::-webkit-scrollbar`. The comment also now
  admits that `scrollbar-color` inherits, and how to opt a container out.

- **"+209° is a near-exact complement" was wrong.** The direct opposite is
  +180°, so +209° is 29° past it: a split complement. Corrected in the
  README, the tokens layer and `press.css`. The docs page already had it right.

- **Docs page.** The mode button read "follow the system" as dark, so on a
  light system with Café, Forest or Dusk its first click did nothing. The
  install snippet put `class="wal-press"` on a page without `press.css`, which
  renders Café. The two "gold sits at L …" captions were hard-coded and wrong
  under Forest and Dusk; they are now read live, like every other number on
  the page. Also corrected: heading levels no longer skip, the specimen's
  link goes to its own spec plate instead of an unrelated section, the demo
  inputs have labels, and the generated CSS is no longer a live region
  announcing every animation frame. The specimen is now a walnut sideboard
  from a mid-century furniture catalogue rather than a pair of binoculars. In
  the README, the Demo link pointed at a GitHub Pages site that does not
  exist.

- **A finish could not change shadows or the body wash under Press or Bone.**
  Both palettes set `--wal-elevation` (Press also `--wal-wash`), and
  `dist/themes/*.css` ship unlayered, which beats the `finish` layer. On
  `<html class="wal-press">` both `soft` and `catalogue` read 0.5 / 0.5, so
  catalogue's "no glow" never applied on the palette it was designed against.
  Importing the palette through `src/walnut.css` with `layer(tokens)` let the
  finish win, so the two install paths also disagreed. Atmosphere now belongs
  to the finish alone, and the palettes no longer set it. Layering the palette
  files would not have been enough, because a layer cannot beat a descendant's
  own declaration: `<section class="wal-bone">` on a catalogue page would
  still have lifted its shadows back up.

  **Without a finish, Press and Bone now get the stock shadow and wash.** For
  the old look, put `data-finish="catalogue"` on Press, or set
  `--wal-elevation: 0.75` on Bone yourself.

- **`.wal-caption` broke after four words.** A caption is usually a `<p>`, and
  base caps `<p>` at 65ch — measured in the caption's own tiny face, which is
  under 30rem. Section-head standfirsts wrapped with their last two words on a
  line of their own. Captions now take their container's measure.

- **Any restyle of `<html>` started a transition on every button, card and
  input.** Their `transition: all` caught `scrollbar-color`, which inherits,
  so in Chrome a rod from a slider, a palette, even a custom property nothing
  reads set off 21 on the docs page, each restyling its element every frame
  for 0.2s. Each component now lists what it animates. Apart from the input's
  focus flash below, every transition you could see before still runs. A rule
  of your own that moves another property on them needs its own `transition`.

- **Focusing an input flashed a dark ring.** Its outline is transparent, there
  only for forced-colors mode, but `all` faded it from the text colour to
  transparent, so a dark ring showed for about 50ms. The outline no longer
  transitions; the border and the shadow ring still ease in, and in
  forced-colors mode the outline now appears at once.

- **Computed `-fg` fell back to the page text in Chrome 127 and earlier.**
  Each was a relative colour whose origin was its cue, and a cue is a
  `light-dark()` value. Those versions parse that, so `@supports` passed, but
  cannot resolve it, so the primary button, every `.wal-fill-*` and the skip
  link took the inherited text colour: dark type on terracotta on paper,
  light type on gold at night. `light-dark()` now chooses between two relative
  colours whose origins are the cue rebuilt from its stops. `-fg` therefore
  follows the rods and the ramp, as `-ink` and `-hover` do, not a colour set
  directly on `--wal-<cue>`.

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
