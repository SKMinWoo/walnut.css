<div align="center">

# 🌰 walnut.css

**A cinematic CSS framework you theme by writing a colour script.**<br>
One ground rod. Five cues. Zero JavaScript.

[![License: MIT](https://img.shields.io/badge/license-MIT-E5A62E?style=flat-square)](LICENSE)
[![CSS Only](https://img.shields.io/badge/javascript-zero-2D2418?style=flat-square)]()
[![Modern CSS](https://img.shields.io/badge/modern_css-oklch_%7C_light--dark()_%7C_@layer-D9432F?style=flat-square)]()

[Demo](https://skminwoo.github.io/walnut.css) · [Colour script](#the-colour-script) · [Three axes](#three-axes) · [Install](#install)

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

```bash
npm install walnut.css
```

```html
<link rel="stylesheet" href="node_modules/walnut.css/dist/walnut.css">
<link rel="stylesheet" href="node_modules/walnut.css/dist/themes/press.css">

<html class="wal-press" data-finish="catalogue">
```

Or via CDN:

```html
<link rel="stylesheet" href="https://unpkg.com/walnut.css/dist/walnut.min.css">
```

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
| 5 | `--wal-cool` | The complement. The only cue that argues with the others. |

**You only have to write three of them.** `--wal-bloom-hue` defaults to the accent **+27°** and `--wal-cool-hue` to the accent **+209°** — a warm step and a near-exact complement. Those offsets were measured off a palette tuned by hand over months, and they are why rotating the accent rotates the whole script *in tune* rather than pulling the lead colour away from the rest of the cast. Set either to a plain number to break the relationship deliberately.

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

`-fg` is computed with relative colour syntax, so you never re-decide black-or-white when you rotate a cue:

```css
--wal-gold-fg: oklch(from var(--wal-gold)
                 clamp(0.16, (0.63 - l) * 1000, 0.97)  /* near-black or near-white */
                 calc(c * 0.08)                         /* keep a trace of the hue  */
                 h);
```

It sits behind `@supports` and degrades to a stated value.

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

Each palette file is about thirty lines, because a palette file is a colour script and nothing else.

### Mode — by attribute

Mode is a real `color-scheme`, not a class convention, so native form controls, scrollbars and the canvas follow it too.

```html
<html data-theme="light">   <!-- or .wal-light  -->
<html data-theme="dark">    <!-- or .wal-dark   -->
<html>                      <!-- follows the system -->
```

Every colour is declared once as `light-dark(light, dark)`. Custom properties store an unsubstituted token stream, so that function is not resolved where it is declared — it is resolved where the token is *used*, against the used element's `color-scheme`. One declaration therefore covers dark, light, **and any subtree that asks for the other one**:

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
  --wal-tracking-label: 0.16em;
  --wal-font-label: var(--wal-font-typewriter);
}
```

Pair it with `.wal-press` for the full mid-century catalogue.

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
| `--wal-elevation` | Scales every shadow offset. `0` flattens the page. |
| `--wal-wash` | Scales the tinted light on `<body>`. `0` removes it. |
| `--wal-radius` · `--wal-btn-radius` · `--wal-chip-radius` · `--wal-badge-radius` | Geometry, per component family. |

To scope a whole script to a subtree, add `.wal-palette`:

```html
<section class="wal-palette" style="--wal-accent-hue: 200">
  <!-- re-derives the entire script from the rods in effect here -->
</section>
```

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
| Tooltip | `.wal-tooltip` | CSS Anchor Positioning tooltip |
| Drawer | `.wal-drawer` | Mobile slide-in panel |
| Swatch | `.wal-swatch` | Colour swatch display |

### The naming trap

`wal-text-*` sets a font **size**. `wal-color-*` sets a **colour**. There is no `.wal-text-muted` class — `--wal-text-muted` is a *token*, and the class you want is `.wal-color-muted`. Using a token name as a class fails silently.

```html
<p class="wal-text-sm wal-color-muted">small and muted</p>

<!-- does nothing: .wal-text-muted is not a class -->
<p class="wal-text-muted">still full size, full contrast</p>
```

## Cinematic motion

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

Two caveats worth knowing before you debug one of them. An unlayered rule only outranks the framework **for the properties it actually declares** — override `flex-direction` and walnut's `gap` still applies. And `!important` inverts layer order, so walnut's reduced-motion block deliberately still wins.

## Browser support

`light-dark()` sets the floor:

- Chrome / Edge 123+
- Safari 17.5+
- Firefox 120+

Relative colour syntax (the computed `-fg` tokens) sits behind `@supports` and degrades to a stated value.

## License

[MIT](LICENSE) — Alex Kim
