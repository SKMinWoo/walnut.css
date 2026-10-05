<div align="center">

# 🌰 walnut.css

**A cinematic CSS framework you theme by writing a colour script.**<br>
One ground rod. Five cues. Zero JavaScript.

[![License: MIT](https://img.shields.io/badge/license-MIT-E5A62E?style=flat-square)](LICENSE)
![CSS Only](https://img.shields.io/badge/javascript-zero-2D2418?style=flat-square)
![Modern CSS](https://img.shields.io/badge/modern_css-oklch_%7C_light--dark()_%7C_@layer-D9432F?style=flat-square)

[Demo](https://walnut-css.vercel.app) · [Colour script](#the-colour-script) · [Three axes](#three-axes) · [Install](#install)

</div>

---

## What is this?

walnut.css is a CSS framework built entirely on modern platform APIs — no JavaScript, no build step, no preprocessor. What makes it different from other drop-in stylesheets is **how you theme it**.

A film's colour script is the sequence of colours that carries its emotional arc — fixed by intent, not derived from a formula. walnut borrows the term literally. Theming it means writing one:

```css
:root {
  /* the ground rod — every neutral is this hue at a different lightness */
  --wal-hue: 78.5;
  --wal-chroma: 0.024;

  /* the five cues */
  --wal-accent-hue: 31;   --wal-accent-chroma: 0.19;   /* tomato    */
  --wal-gold-hue:   78;   --wal-gold-chroma:   0.14;   /* goldenrod */
  --wal-olive-hue:  140;  --wal-olive-chroma:  0.09;   /* olive     */
}
```

That is the entire input surface. Every surface, hairline, ink, hover state, shadow, wash and foreground is derived from those numbers — **in both light and dark, from a single declaration each.**

Add `data-finish="catalogue"` and you get a sophisticated mid-century catalogued look on top of whatever palette you just wrote.

## Install

From jsDelivr, pinned to a release tag:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/SKMinWoo/walnut.css@v0.4.0/dist/walnut.min.css">
<!-- optional: a named palette -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/SKMinWoo/walnut.css@v0.4.0/dist/themes/press.css">

<html class="wal-press" data-finish="catalogue">
```

Or copy `dist/` into your project and link it from there — it is plain CSS with no runtime.

The base stylesheet already carries the café script on `:root`, so a palette file is optional — and unnecessary if you are writing your own script.

---

## The colour script

### The ground rod

Every neutral on the page — the page ground, the card stock, the ink, the hairlines — is **one hue at a different lightness**. That is what makes a palette a system rather than a collection. A palette hand-mixed by eye tends to drift a few degrees between its neutrals; the drift is invisible in isolation and is exactly what stops the neutrals from reading as one material.

```css
--wal-hue: 78.5;      /* the rod */
--wal-chroma: 0.024;  /* how far off grey the ground sits */
```

### The five cues

| Cue | Token | Role |
|-----|-------|------|
| 1 | `--wal-accent` | The lead. The one cue that means "you can act on this". |
| 2 | `--wal-bloom` | The warm mid — gradients, washes, the second voice. |
| 3 | `--wal-gold` | The metal — rules, markers, ornament. |
| 4 | `--wal-olive` | The botanical — the calm, receding cue. |
| 5 | `--wal-cool` | The split complement. The only cue that argues with the others. |

**You only have to write three of them.** `--wal-bloom-hue` defaults to the accent **+27°** and `--wal-cool-hue` to the accent **+209°** — a warm step, and a split complement 29° past the accent's direct opposite. Those offsets were measured off a palette tuned by hand over months, and they are why rotating the accent rotates the whole script *in tune* rather than pulling the lead colour away from the rest of the cast. Set either to a plain number to break the relationship deliberately.

`--wal-cue-1` … `--wal-cue-5` alias the same colours by position, for when you want to *iterate* the script — a swatch strip, a chart series, an `nth-child` rule — without knowing whether cue 3 is called "gold" or "brass".

### Four forms of every cue

Picking the right form is most of what good theming is, and the second one is what hand-made palettes usually miss.

| Token | Use |
|-------|-----|
| `--wal-gold` | The cue as a **fill** — a swatch, a rule, a marker. |
| `--wal-gold-ink` | The cue as **type**, shifted to stay legible on the page ground. |
| `--wal-gold-soft` | A 15% wash, for chip and badge backgrounds. |
| `--wal-gold-fg` | A foreground legible **on** the cue. Computed, never chosen. |

Goldenrod is a fine button and an illegible paragraph. `--wal-gold` and `--wal-gold-ink` are that difference, and every component that puts a cue on type reads the `-ink` form.

`-fg` is computed with relative colour syntax, so you never re-decide black-or-white when you rotate a cue. Each mode's branch starts from that mode's gold, rebuilt from its stops:

```css
--wal-gold-fg: light-dark(
  oklch(from oklch(var(--wal-l-gold-light) var(--wal-gold-chroma) var(--wal-gold-hue))
        clamp(0.16, (0.57 - l) * 1000, 0.97)  /* near-black or near-white */
        calc(c * 0.08)                         /* keep a trace of the hue  */
        h),
  oklch(from oklch(var(--wal-l-gold-dark)  var(--wal-gold-chroma) var(--wal-gold-hue))
        clamp(0.16, (0.57 - l) * 1000, 0.97) calc(c * 0.08) h));
```

`light-dark()` goes outside rather than in the origin. Written as `oklch(from var(--wal-gold) …)`, the origin is itself a `light-dark()`, which Chrome 127 and earlier cannot resolve, and the text silently takes the page colour. It sits behind `@supports` and degrades to a stated value.

### The gamut caveat

Chroma is a **per-cue input** rather than a constant because the sRGB gamut is not the same width at every hue. At 62% lightness `c = 0.17` is in gamut around terracotta and clips across much of the green–blue arc, where the browser flattens it silently and the rendered colour stops matching the hue you asked for. CSS cannot compute the gamut boundary, so if you rotate a hue rod far from its shipped value, lower its chroma with it.

---

## Three axes

Three different syntaxes for three different questions, so it is always obvious which one a hook is turning.

```html
<html class="wal-press" data-theme="light" data-finish="catalogue">
       <!-- palette -->  <!-- mode -->      <!-- finish -->
```

### Palette — by class

| Palette | Class | Mood |
|---------|-------|------|
| 🗂 Press | `.wal-press` | 1960s parts catalogue on a walnut desk. Paper-first. |
| ☕ Café | `.wal-cafe` (default) | Walnut wood, bone china, brass fixtures. |
| 🌲 Forest | `.wal-forest` | Mossy floor at dawn, copper firelight. |
| 🌅 Dusk | `.wal-dusk` | Mountain sunset, purple twilight, lantern glow. |
| 📜 Bone | `.wal-bone` | Sunlit linen, watercolour, pressed flowers. Light-first. |

A palette file is its colour script — a ground rod, some cues, and any ramp stops it nudges — and nothing else.

### Mode — by attribute

Mode is a real `color-scheme`, not a class convention, so native form controls, scrollbars and the canvas follow it too.

```html
<html data-theme="light">   <!-- or .wal-light  -->
<html data-theme="dark">    <!-- or .wal-dark   -->
<html>                      <!-- follows the system -->
```

Every colour is declared once as `light-dark(light, dark)`. A custom property's `var()`s are substituted where it is declared, but a `light-dark()` inside it is just more tokens, so it is not resolved there — it is resolved where the token is *used*, against the used element's `color-scheme`. One declaration therefore covers dark, light, **and any subtree that asks for the other one**:

```html
<section class="wal-light">
  <!-- a light island on a dark page. No second palette. -->
</section>
```

`[data-theme="cafe"][data-theme="light"]` can never match — an element has exactly one value per attribute — so combine the axes as `.wal-cafe[data-theme="light"]`, or use the fused `[data-theme="cafe-light"]` when you only have one hook.

### Finish — by attribute

A finish answers a different question from a palette: not *what colour is this* but *what kind of object is this page*. It is almost entirely a retune of the geometry and atmosphere tokens every component already reads, which is why adding a component does not mean updating a finish.

| Finish | Attribute | Look |
|--------|-----------|------|
| Catalogue | `data-finish="catalogue"` | Square corners, visible rules, tabular figures, typewriter labels, no glow. |
| Soft | `data-finish="soft"` (default) | Pills, rounded cards, warm wash, lifted shadows. |

```css
[data-finish="catalogue"] {
  --wal-radius: 3px;  --wal-btn-radius: 2px;   /* no pills */
  --wal-elevation: 0.35;                        /* print barely casts */
  --wal-wash: 0;                                /* and does not glow */
  --wal-line-boost: 1.7;                        /* rules are the whole language */
  --wal-tracking-label: 0.12em;
  --wal-font-label: var(--wal-font-typewriter);
}
```

Pair it with `.wal-press` for the full mid-century catalogue.

The two axes never write the same token: a palette sets only its colour script, and shadow depth, wash, radius and label voice belong to the finish. That is what lets every finish work on every palette, including a palette scoped to one section of a page with a different finish.

---

## Tuning beyond the script

You will rarely need these, but the ramp is open. All are optional and all have defaults.

| Token family | Controls |
|--------------|----------|
| `--wal-l-*-light` / `--wal-l-*-dark` | The lightness stop for each surface, ink and cue, per mode. |
| `--wal-cx-ground/surface/line/ink-*` | Chroma as a fraction of `--wal-chroma`, per surface family. |
| `--wal-ink-shift-*` | How far a cue moves when used as type. |
| `--wal-hover-shift-*` | How far the accent moves on hover. |
| `--wal-line-boost` | Hairline strength, without owning a colour. |
| `--wal-hairline` · `--wal-border` | Rule width, and the standard rule as one shorthand (`var(--wal-hairline) solid var(--wal-line)`). |
| `--wal-line-input` | The edge of a form control: held to 3:1 against every ground (WCAG 1.4.11), unlike a divider. |
| `--wal-elevation` | Scales every shadow offset. `0` flattens the page. |
| `--wal-wash` | Scales the tinted light on `<body>`. `0` removes it. |
| `--wal-radius` · `--wal-btn-radius` · `--wal-chip-radius` · `--wal-badge-radius` | Geometry, per component family. |

To scope a whole script to a subtree, add `.wal-palette`:

```html
<section class="wal-palette" style="--wal-accent-hue: 200">
  <!-- re-derives the entire script from the rods in effect here -->
</section>
```

That includes bloom and cool: inside a `.wal-palette` they follow the accent in effect there, even under a palette that stated its own. Set them on the same element to pin them. A `data-finish` on a subtree re-derives only what a finish owns — rules and shadows — never a colour.

---

## Components

| Component | Class | Description |
|-----------|-------|-------------|
| Navbar | `.wal-nav` | Sticky masthead; wraps rather than overflowing at narrow widths |
| Hero | `.wal-hero` | Full-viewport landing section |
| Button | `.wal-btn` | Primary, secondary, ghost variants |
| Card | `.wal-card` | Surface card; rebinds the ink scale so it can stay light on a dark page |
| Plate | `.wal-plate` | Specification grid (key–value pairs) |
| **Colour script** | **`.wal-script`** | **The palette, printed. Five empty `<li>`s and it fills itself** |
| **Rule** | **`.wal-rule`** | **A hairline with a label sitting in it** |
| **Caption** | **`.wal-caption`** | **The label voice: mono, uppercase, widely tracked** |
| **Index** | **`.wal-index`** | **A plate number, in tabular figures** |
| **Section head** | **`.wal-section-head`** | **Index, title and standfirst as one block** |
| Metric | `.wal-metric` | Big number + label |
| Stat | `.wal-stat` | A metric without the box |
| Chip | `.wal-chip` | Small pill tag |
| Badge | `.wal-badge` | Monospace pill label; `-accent` `-bloom` `-gold` `-olive` `-cool` |
| Timeline | `.wal-timeline` | Experience/event timeline |
| Table | `.wal-table` | Styled data table |
| Note | `.wal-note` | A titled block under a coloured top rule |
| Frame | `.wal-frame` | Fixed-ratio letterboxed window with a caption rail |
| Divider | `.wal-divider` | Gold flourish ornament |
| Input | `.wal-input` | Form fields with a warm focus ring |
| Field set | `.wal-field` `.wal-label` `.wal-hint` `.wal-error` | Form furniture |
| Check / radio | `.wal-check` `.wal-radio` | Native controls themed with `accent-color` |
| Dialog | `.wal-dialog` | Native dialog + Popover API |
| Tooltip | `.wal-tooltip` | Inside a `.wal-tooltip-trigger`; shown on hover and keyboard focus — [markup](#tooltip) |
| Drawer | `.wal-drawer` | Mobile slide-in panel |
| Swatch | `.wal-swatch` | Colour swatch display |

### Tooltip

The tip goes inside its trigger, and the trigger points at it:

```html
<button class="wal-tooltip-trigger" aria-describedby="save-tip">
  Save
  <span class="wal-tooltip" id="save-tip" role="tooltip" aria-hidden="true">Saves a draft</span>
</button>
```

`aria-hidden` keeps the tip out of the button's accessible *name* ("Save", not "Save Saves a draft"); `aria-describedby` still announces it as the description. The tip shows on hover and on keyboard focus, and stays while the pointer moves onto it. WCAG 1.4.13 also wants it dismissible with Escape, which CSS cannot hear — these two lines do it, once per page:

```js
addEventListener("keydown", (e) => { if (e.key === "Escape") document.querySelectorAll(".wal-tooltip-trigger:is(:hover, :focus-visible)").forEach((t) => t.classList.add("is-dismissed")); });
for (const ev of ["pointerover", "focusin"]) addEventListener(ev, () => document.querySelectorAll(".wal-tooltip-trigger.is-dismissed:not(:hover, :focus-within)").forEach((t) => t.classList.remove("is-dismissed")));
```

It is positioned against the trigger, so an `overflow: hidden` ancestor between them clips it — `.wal-card` is one.

### Drawer

`.wal-drawer` is the panel and its open/closed styling; opening it is yours to script, because three things a modal drawer needs are not CSS's to do. Toggle `.is-open` on the drawer and on its `.wal-drawer-overlay`, and:

- **Focus.** On open, move focus into the drawer (its first link or its close button); on close, return it to the button that opened it.
- **Escape.** Close on <kbd>Escape</kbd>, and on a click on the overlay.
- **Inert.** Set `inert` on the rest of the page while it is open, so neither the keyboard nor a screen reader can reach what is behind it.

The closed drawer is already `visibility: hidden`, so its links are out of the tab order without any script. If you would rather not write the above, a `<dialog class="wal-dialog">` opened with `showModal()` does all three natively.

### The naming trap

`wal-text-*` sets a font **size**. `wal-color-*` sets a **colour**. There is no `.wal-text-muted` class — `--wal-text-muted` is a *token*, and the class you want is `.wal-color-muted`. Using a token name as a class fails silently.

```html
<p class="wal-text-sm wal-color-muted">small and muted</p>

<!-- does nothing: .wal-text-muted is not a class -->
<p class="wal-text-muted">still full size, full contrast</p>
```

### Everything else that ships

Smaller pieces the tables above do not cover. All are in `dist/walnut.css`.

| Class | What it is |
|-------|------------|
| `.wal-eyebrow` | Small uppercase kicker above a heading, in the accent's ink |
| `.wal-iconbtn` | Round icon-only button; give it an `aria-label` |
| `.wal-link-arrow` | Text link whose gap opens on hover, stepping the arrow away |
| `.wal-list-dash` | List with a short rule as its marker |
| `.wal-avail` · `.wal-avail-dot` | "Available" line with a pulsing dot |
| `.wal-sidebar` | Fixed sidebar + fluid content that stacks when it runs out of room |
| `.wal-skip` | Skip link, off-screen until focused |
| `.wal-footer` · `.wal-footer-grid` | End-credits colophon: a rule and a row of `dt`/`dd` pairs |
| `.wal-fill-*` | A cue as a fill with its computed `-fg` as the text — `-accent` `-bloom` `-gold` `-olive` `-cool` |
| `.wal-bg-*` | Backgrounds: `-surface` `-surface-2` and each cue's `-soft` wash |
| `.wal-glass` | Translucent surface with a backdrop blur |
| `.wal-gradient-text` | Accent-to-gold gradient clipped to the text |
| `.wal-sr-only` | Visually hidden, still read by screen readers |
| `.wal-m-*` `.wal-p-*` (`t` `b` `l` `r` `x` `y`) · `.wal-gap-*` | Spacing on the `xs`…`3xl` scale, plus `-0` |
| `.wal-reveal` · `-left` · `-right` · `-scale` | Scroll-driven entrances |
| `.wal-parallax` · `.wal-progress-bar` | Scroll-linked drift; reading-progress bar |
| `.wal-animate-drift` · `-pulse` · `-breathe` · `.wal-delay-100`…`1000` | Looping ambient motion and its delays |

**State classes are unprefixed.** walnut reads `.is-open` (`.wal-drawer`, `.wal-drawer-overlay`), `.is-scrolled` (`.wal-nav`), `.is-active` (a `.wal-nav-links` link) and `.is-dismissed` (`.wal-tooltip-trigger`). Your script sets them; they only take effect alongside the `wal-` class, so they will not collide with an app's own `is-*` styles — but an app's own `.is-open { … }` rule *will* reach walnut's elements.

`.wal-text-center` / `-left` / `-right` set alignment, not size, despite the `wal-text-*` size family; renaming them would break existing pages, so they stay.

## Cinematic motion

### Motion that comes from the script

Every colour, radius and shadow in walnut is derived from registered numbers, and a registered number interpolates. So the two motion classes walnut is built around do not animate the page — they animate its **inputs**, and the page re-derives on every frame.

```html
<html class="wal-press wal-cue-in wal-retune">
```

| Class | What moves |
|-------|------------|
| `.wal-cue-in` | On load the page prints itself: the paper first, then the five cues in script order, each rising from zero chroma. Lightness never moves, so contrast is final from the first frame. |
| `.wal-retune` | Change a palette class, a finish, or a rod from script and the page travels to it instead of cutting. A hue travels along the wheel, so every in-between frame is still a coherent script, not a crossfade of two. Derived cues hold their offsets on every frame. |

A hue is a registered `<number>`, so it travels the *numeric* way between two values, not the short way round the wheel: Café's ground (55) to Dusk's (280) passes through green and blue on the way. Where that matters, write neighbouring palettes' hues within 180 of each other — Dusk's ground as `-80` instead of `280` is the same colour and travels through red and violet instead.

Tune with `--wal-cue-in-pass` (0.7s), `--wal-cue-in-stagger` (0.14s), `--wal-retune-duration` (0.8s) and `--wal-ease-travel`.

Take `.wal-retune` off while a slider bound to a rod is being dragged: direct manipulation should move the page under the thumb, not chase it. Mode can't tween — `color-scheme` is discrete — so switch it inside a view transition, which walnut crossfades at the root.

Both need `@property` to interpolate (Chrome 85, Safari 16.4, Firefox 128). Below that the rods still apply; they step instead of gliding.

### Scroll and view helpers

Scroll-driven animations with no JavaScript:

```html
<div class="wal-reveal">Content appears cinematically</div>
<div class="wal-reveal-left">From the left</div>
<div class="wal-progress-bar"></div>
```

All animations respect `prefers-reduced-motion: reduce`.

## Cascade

walnut ships entirely inside `@layer`:

```css
@layer reset, tokens, base, layout, components, finish, utilities, cinema;
```

Unlayered declarations beat every layered one regardless of specificity, so an ordinary rule of yours overrides the framework with no `!important` and no specificity games.

The palette files in `dist/themes/` are the exception: they are plain, unlayered rules, so a palette's rods are overridden by an unlayered rule of yours, not by an `@layer` one. That never lets a palette override a finish, because a palette sets nothing a finish sets.

Two caveats worth knowing before you debug one of them. An unlayered rule only outranks the framework **for the properties it actually declares** — override `flex-direction` and walnut's `gap` still applies. And `!important` inverts layer order, so walnut's reduced-motion block deliberately still wins.

## Browser support

`light-dark()` sets the floor:

- Chrome / Edge 123+
- Safari 17.5+
- Firefox 120+

Relative colour syntax (the computed `-fg` tokens) sits behind `@supports` and degrades to a stated value, which is what Firefox 120–127 gets.

`.wal-retune` and `.wal-cue-in` need `@property` to interpolate, which Firefox has from 128. Below that the rods still apply; they cut instead of tweening.

## License

[MIT](LICENSE) — Alex Kim
