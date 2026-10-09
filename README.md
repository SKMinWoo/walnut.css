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
<!-- optional: the carousel's dots and arrows, and the nav's scroll-spy -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/SKMinWoo/walnut.css@v0.4.0/dist/walnut-scroll.css">

<html class="wal-press" data-finish="catalogue">
```

Or copy `dist/` into your project and link it from there — it is plain CSS with no runtime.

The base stylesheet already carries a default script on `:root` (terracotta and goldenrod on a warm amber ground), so a palette file is optional, and unnecessary if you are writing your own script.

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
| 🗂 Press | `.wal-press` | 1960s parts catalogue on a walnut desk: tomato plate numbers on paper. Paper-first. |
| ☕ Café | `.wal-cafe` | Golden hour: china blue, brass fixtures, a walnut counter. |
| 🌲 Forest | `.wal-forest` | Fern on a mossy floor at dawn, campfire copper. |
| 🌅 Dusk | `.wal-dusk` | Twilight violet, afterglow, lantern glow. |
| 📜 Bone | `.wal-bone` | Washi tape teal, pressed flowers, a vermilion stamp. Light-first. |

Each one leads with a different hue. A page that names no palette wears the default script from `01-tokens.css`.

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
| Catalogue | `data-finish="catalogue"` | Small cut corners ([bevelled](#corners)), visible rules, tabular figures, typewriter labels, paper with a tooth, no glow. |
| Soft | `data-finish="soft"` (default) | Pills, rounded cards, warm wash, lifted shadows, smooth stock. |

```css
[data-finish="catalogue"] {
  --wal-radius: 3px;  --wal-btn-radius: 2px;   /* no pills */
  --wal-elevation: 0.35;                        /* print barely casts */
  --wal-wash: 0;                                /* and does not glow */
  --wal-line-boost: 1.7;                        /* rules are the whole language */
  --wal-tooth: url(…);                          /* the stock has a tooth */
  --wal-tracking-label: 0.12em;
  --wal-font-label: var(--wal-font-typewriter);
}
```

The tooth is a fine fibre-and-mottle texture that every card, plate and metric multiplies into its own colour, so it carries no colour of its own. It darkens light stock by about four percent at its darkest speck and all but vanishes on dark stock; muted text on the darkest speck still clears 4.8:1 in every shipped palette. A paper repainted by a `.wal-fill-*` or `.wal-bg-*` utility is a solid surface and stays flat.

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
| Dialog | `.wal-dialog` | Native dialog + Popover API; rises into place as it opens and sinks as it closes (`@starting-style`) |
| Tooltip | `.wal-tooltip` | Inside a `.wal-tooltip-trigger`; shown on hover and keyboard focus — [markup](#tooltip) |
| Tip | `.wal-tip` | The tooltip as a hint popover: no script, no nesting, never clipped. [Details](#tip) |
| Drawer | `.wal-drawer` | Mobile slide-in panel; `.wal-door` is the same with no script |
| Swatch | `.wal-swatch` | Colour swatch display |
| **Desk** | **`.wal-desk`** | **A walnut grain under the page, papers resting above it — [details](#desk)** |
| **Duotone** | **`.wal-duotone`** | **Any photo printed in one of the palette's cues and paper; `data-ink` picks the cue. [Details](#duotone)** |
| **Plan chest** | **`.wal-chest`** | **Drawers in the flow of the page, made of `<details>`; each slides out of its slot. [Details](#plan-chest)** |
| **Sliding door** | **`.wal-door`** | **A side panel on its track, made of a `<dialog>`; no script. [Details](#sliding-door)** |
| **Window** | **`.wal-window`** | **A page inside the page; opens as a gatefold from the card that opened it. [Details](#window-and-gatefold)** |
| **Chart** | **`.wal-chart` `.wal-ring` `.wal-key`** | **Columns on a brass rail, a ring in a brass bezel, and their key, in the five cues. [Details](#chart)** |
| Tint | `.wal-tint` | Any colour you give it, as ink, wash, fill and text on the fill, legible in both modes. [Details](#tint) |
| Select | `.wal-select` | A `<select>` whose options can show a swatch or an icon. [Details](#menu-select-and-carousel) |
| Menu | `.wal-menu` | A popover menu anchored to its button, flipping to whichever side has room |
| Carousel | `.wal-carousel` | A snapping row of slides with the browser's own dots and buttons |
| Shuffle | `.wal-shuffle` | A list whose items travel to their new places when it is filtered or sorted. [Details](#shuffle) |

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

### Tip

The same tip with no script and no nesting:

```html
<button interestfor="save-tip">Save</button>
<span class="wal-tip" id="save-tip" popover="hint">Saves a draft</span>
```

`interestfor` makes the tip a hint popover the browser opens on hover and on focus and closes on <kbd>Escape</kbd>, so all three of WCAG 1.4.13's asks are met and the tip is announced as the button's description. It lives in the top layer, so no `overflow: hidden` can clip it, and it is anchored above its button, or below when there is no room above. A browser without `interestfor` never shows it, so keep anything the reader needs in the button's own name.

### Drawer

`.wal-drawer` is the panel and its open/closed styling; opening it is yours to script, because three things a modal drawer needs are not CSS's to do. Toggle `.is-open` on the drawer and on its `.wal-drawer-overlay`, and:

- **Focus.** On open, move focus into the drawer (its first link or its close button); on close, return it to the button that opened it.
- **Escape.** Close on <kbd>Escape</kbd>, and on a click on the overlay.
- **Inert.** Set `inert` on the rest of the page while it is open, so neither the keyboard nor a screen reader can reach what is behind it.

The closed drawer is already `visibility: hidden`, so its links are out of the tab order without any script. If you would rather not write the above, a [`.wal-door`](#sliding-door) does all three natively.

### Desk

```html
<html class="wal-press wal-desk">
```

`.wal-desk` puts the papers on a desk. A walnut grain lies under the page, drawn by the browser from SVG noise rather than shipped as a photograph and tinted from the ground rod, so rotate `--wal-hue` and the wood follows. It is fixed to the window, so cards scroll across the desk rather than with it. Every top-level card, plate and metric rests a shadow above it, and the finish decides how high: Catalogue's printed plates lie almost flat, Soft's lift off the wood.

| Token | |
|-------|-|
| `--wal-desk-ink` | The grain's colour: the ground rod a few points darker. On a light page it goes no darker than `--wal-bg-subtle`, so every ink keeps its AA contrast on the grain. |
| `--wal-desk-grain` | The grain itself, as a mask image; only its alpha is read, so any image with transparency can replace it. (Not `none`: an absent mask hides nothing, and the whole layer would show.) |

On `<html>` or `<body>`. The desk holds still on purpose: a version that shifted the grain with the pointer read as dizzying rather than as depth, even at a few pixels.

### Duotone

```html
<figure class="wal-duotone" data-ink="cool">
  <img src="photo.jpg" alt="…">
</figure>
```

Any photograph, printed in two inks: a deep shade of one of the palette's cues, and paper. `data-ink` is `accent` (the default), `bloom`, `gold`, `olive` or `cool`. A new palette or mode regrades every print with nothing for the page to do, so stock photography always belongs to the palette, and one picture can sit in two sections graded two ways.

It is a true gradient map from two blend modes, in every browser: the image goes grey and is screened over the ink, so its shadows take the ink and its highlights stay light; then the paper is multiplied over the lot. By night the paper is greyed, so a dark page is not lit by a white rectangle. The figure sizes to its image; give it an `aspect-ratio` or a block size and the image covers it. In forced colours the photograph is shown as it is. Add [`.wal-reveal-develop`](#scroll-and-view-helpers) and it develops as it scrolls into view.

### Plan chest

```html
<div class="wal-chest">
  <details name="colourways">
    <summary>Forest</summary>
    <div>Everything in the drawer.</div>
  </details>
  <details name="colourways">…</details>
</div>
```

Drawers in the flow of the page, like a plan chest's. Each drawer is a `<details>` and its front is the summary; the drawer slides out of the slot beneath the front while the rows below make room, and its contents ride out with it rather than unrolling. A shared `name` makes them one chest, where pulling out a drawer pushes the open one home; leave it off and any number can be out at once. The browser owns the rest: the keyboard, the open state, and find-in-page reaching into a shut drawer.

Under [Materials](#materials) a drawer runs out heavy, hits its stop and knocks back before it settles. A browser without `::details-content` opens the drawer at once, as a plain `<details>` does. Printed, a chest comes out with every drawer open.

### Sliding door

```html
<button commandfor="cart" command="show-modal">Cart</button>

<dialog class="wal-door" id="cart" closedby="any" aria-label="Cart">
  <button class="wal-door-pull" commandfor="cart" command="close" aria-label="Close"></button>
  <div class="wal-door-body">…</div>
</dialog>
```

A side panel that runs in on a track from the right and throws its shadow across the page; on a phone it rises from below. Its leading edge is the pull, which closes it. It is a `<dialog>`, so `commandfor` opens and closes it and `closedby="any"` lets a click outside or <kbd>Escape</kbd> close it: focus, the inert page behind and the Escape key are all the browser's, which is everything `.wal-drawer` asks you to script. Under [Materials](#materials) it is walnut, and knocks against its stop.

### Window and gatefold

```html
<button commandfor="dusk" command="show-modal">
  <span data-wal-art><img src="dusk.jpg" alt=""></span> Dusk
</button>

<dialog class="wal-window" data-wal-open="gatefold" id="dusk" closedby="any" aria-labelledby="dusk-title">
  <div class="wal-gatefold-spread">
    <figure class="wal-gatefold-cover"><img src="dusk.jpg" alt=""></figure>
    <div class="wal-gatefold-notes"><h2 id="dusk-title">Dusk</h2>…</div>
  </div>
</dialog>

<script src="walnut-motion.js" defer></script>
```

A page inside the page. `.wal-window` is the room it opens in, the whole viewport; on its own it opens like `.wal-dialog`, its panel (`.wal-window-panel`) rising the last few pixels into place. With `data-wal-open="gatefold"` and `walnut-motion.js` it opens like a gatefold sleeve: the cover travels out of the card's picture (`[data-wal-art]`, or the whole button), and the notes unfold beside it on the spine. Closing plays it back, and the cover goes home to the card. The window's own buttons drive it; from script, `walnut.open(dialog, button)` and `walnut.open.close(dialog)`. A window that a link or Back opens has no press to travel from: `walnut.open(dialog, card, { instant: true })` opens it in place, and closing still takes the cover home to that card. A close asked for while the window is still opening (Back pressed early, say) waits for it to land. A card whose picture is not drawn (`display: none` in a print or compact layout, say) has nowhere to travel from, so the window opens and closes in place.

The cover's shape is `--wal-cover-ratio`, `10 / 11` unless you set it on the window or anywhere above it, and it needn't be the shape of the card's picture. The cover is never stretched: it leaves at one scale, cropped to the picture's shape, and the crop opens out as it lands. `--wal-cover-focus` says which part of the cover the picture is, read the way `object-position` is (`50% 50%` unless you set it; `50% 0%` for a screenshot whose top is the picture). Every colourway in [next.html](docs/next.html) opens this way, its 4:3 plate travelling out as a 4:3 cover. The notes are the cover's size and scroll inside it. On a phone the spread stacks and the notes fold down. Without the script, or under reduced motion, the window simply opens.

### Tint

```html
<span class="wal-chip wal-tint" style="--wal-tint: #2f7d6d">Garden</span>
<span class="wal-badge wal-tint wal-fill-tint" style="--wal-tint: gold">New</span>
```

For the colours a site owns that no palette does: a tag colour a user picked, a category, a brand's own. `.wal-tint` takes any colour and gives it the four forms every cue has, each legible in both modes:

| Token | |
|-------|-|
| `--wal-tint-ink` | The colour as text on the page |
| `--wal-tint-soft` | A wash of it under text |
| `--wal-tint-fill` | The colour as a solid fill, moved out of the band of lightness where no text reaches 4.5:1 |
| `--wal-tint-fg` | Text on that fill |

A chip or badge with `.wal-tint` wears the ink on the wash; add `.wal-fill-tint` for the fill. The same engine is there for your own CSS, as two CSS functions:

```css
.price {
  color: #0a7f6f;                 /* for a browser without @function */
  color: --wal-ink(#0a7f6f);
  background: --wal-soft(#0a7f6f);
}
```

### Menu, select and carousel

```html
<button popovertarget="file-menu">File</button>
<div class="wal-menu" id="file-menu" popover>
  <button>New</button>
  <a href="…">Open…</a>
</div>

<select class="wal-select">
  <button><selectedcontent></selectedcontent></button>
  <option value="forest"><i class="swatch"></i> Forest</option>
</select>

<ul class="wal-carousel" aria-label="Colourways">
  <li>…</li>
  <li>…</li>
</ul>
```

Three parts the browser now draws itself, dressed in walnut. The **menu** is a popover anchored to its button: it opens below, or above, or to the other side, whichever has room, closes on <kbd>Escape</kbd> and on a click outside, and keeps the button's `aria-expanded` in step. The **select** uses `appearance: base-select`, so an option can hold any markup and `<selectedcontent>` copies the chosen one into the button; a browser without it shows the ordinary select with the same border. The **carousel** is a snapping list; with `walnut-scroll.css` it has a dot per slide (`::scroll-marker`) and Previous and Next buttons that grey out at either end (`::scroll-button`), and without them it is a row you swipe. Under [Materials](#materials) the menu and the select are brass.

### Chart

```html
<ol class="wal-chart" style="--max: 80" aria-label="Rooms painted, by season">
  <li><b>Spring</b><span style="--v: 42">42</span><span style="--v: 30">30</span></li>
  <li><b>Summer</b><span style="--v: 64">64</span><span style="--v: 51">51</span></li>
</ol>
<ul class="wal-key"><li>Walls</li><li>Trim</li></ul>

<div class="wal-ring" style="--a: 38; --b: 24; --c: 18; --d: 12">92<small>rooms</small></div>
```

Charts made like furniture, in the five cues. The data is the markup: no script, no canvas, nothing to load. Each `<li>` of `.wal-chart` is a group, and each `<span>` a column with its value in `--v` and printed above it; the nth column of every group is cue n, as is the nth entry in `.wal-key`. The columns stand on a brass rail, each on a brass shoe like a sideboard's feet, and the gridlines are stringing, the fine inlaid line of a paler wood.

`.wal-ring` shares a whole out as percentages: four shares are named, `--a` to `--d`, and the fifth is what is left. They are inlaid with a hairline of the ground between each, and the ring sits in a brass bezel with a tick at each quarter. Its own text is the figure in the middle.

| Token | |
|-------|-|
| `--max` | The top of the chart's scale (100) |
| `--ticks` | How many gridlines divide it (4) |
| `--wal-chart-h` | The chart's height (12rem) |
| `--wal-ring-size` | The ring's width, bezel included (8rem) |

Set a new `--v` or new shares and the column or the ring moves to it on the opening tokens, so under [Materials](#materials) a chart is brass: a column strikes its new height and rings. Charts, rings and keys print in colour.

### Corners

```css
:root { --wal-corner-shape: squircle; }
```

Every walnut rule that draws a radius also reads `--wal-corner-shape`: `round` (the default), `squircle` (Piet Hein's superellipse, the edge of his Superellipse table, between the circle's arc and the square), or `bevel`, a cut corner, which the Catalogue finish uses. Set it on any element and everything inside follows. A browser without `corner-shape` draws round corners whatever it says.

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
| `.wal-fill-*` | A cue as a fill with its computed `-fg` as the text — `-accent` `-bloom` `-gold` `-olive` `-cool`, and `-tint` with [`.wal-tint`](#tint) |
| `.wal-bg-*` | Backgrounds: `-surface` `-surface-2` and each cue's `-soft` wash |
| `.wal-glass` | Translucent surface with a backdrop blur |
| `.wal-gradient-text` | Accent-to-gold gradient clipped to the text |
| `.wal-sr-only` | Visually hidden, still read by screen readers |
| `.wal-m-*` `.wal-p-*` (`t` `b` `l` `r` `x` `y`) · `.wal-gap-*` | Spacing on the `xs`…`3xl` scale, plus `-0` |
| `.wal-reveal` · `-left` · `-right` · `-scale` · `-develop` | Scroll-driven entrances; `-develop` is for a `.wal-duotone` print |
| `.wal-parallax` · `.wal-progress-bar` | Scroll-linked drift; reading-progress bar |
| `.wal-animate-drift` · `-pulse` · `-breathe` · `.wal-delay-100`…`1000` | Looping ambient motion and its delays |

**State classes are unprefixed.** walnut reads `.is-open` (`.wal-drawer`, `.wal-drawer-overlay`), `.is-scrolled` (`.wal-nav`), `.is-active` (a `.wal-nav-links` link) and `.is-dismissed` (`.wal-tooltip-trigger`). Your script sets them; they only take effect alongside the `wal-` class, so they will not collide with an app's own `is-*` styles — but an app's own `.is-open { … }` rule *will* reach walnut's elements.

You can leave two of them to the browser. A `.wal-nav` gains its rule and shadow over the first 1.5rem the page scrolls (a scroll-driven animation, so no scroll listener), and, with `walnut-scroll.css`, its links light the one whose section is in view (`scroll-target-group` and `:target-current`, so no scroll-spy). Where the browser has neither, set `.is-scrolled` and `.is-active` as before. A script's `.is-scrolled` stands the browser's rule down, so the rule is never drawn twice; a scroll-spy script of your own can light a different link from the browser's, so keep it for browsers without `:target-current`.

`.wal-text-center` / `-left` / `-right` set alignment, not size, despite the `wal-text-*` size family; renaming them would break existing pages, so they stay.

### Print

Print a walnut page and it comes out as a sheet from a catalogue: A4, light and flat, numbered "Sheet 2 of 5" at the foot, with every link's address printed after it, since paper cannot be clicked. The furniture of a screen is left off: the masthead, the progress bar, drawers and doors, and anything you mark `data-wal-print="skip"`. A plan chest prints with every drawer out. Charts, rings, keys, colour scripts and swatches print in colour, because their colours are what they say. Headings stay with what follows them, and a card, plate, metric or chart is never cut across two sheets.

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

### Acts

A film's colour script turns from act to act, and a page's can too. Mark sections as acts and load the companion script. As each act reaches the middle of the window, the whole page (masthead, desk, every paper) retunes to the act's script, the way `.wal-retune` retunes to a palette:

```html
<section data-act="wal-dusk">…</section>            <!-- a palette, by class -->
<section data-act style="--wal-accent-hue: 200">…   <!-- or rods of its own -->

<script src="walnut-acts.js" defer></script>
```

An act lasts until the next one begins. Above the first, the page keeps the script it opened with, and scrolling back up plays the acts in reverse. A page opened or reloaded mid-scroll starts in the right act without a tween. Under reduced motion each act cuts instead of tweening.

Acts change the script, never the mode. Press and Bone are light-first, so their act will flip a dark page to light; give the page a `data-theme`, or cast palettes that agree. A palette class of your own on `<html>` that no act names can't be recognised and taken off, so cast it as the first act instead.

`walnut-acts.js` is optional, one of three small scripts walnut ships: CSS has no way for a section to hand its palette to `<html>`. It wakes only when an act's edge crosses the middle of the window, so scrolling within an act costs nothing. [specimen.html](docs/specimen.html) is a page in three acts.

### From the swatch

A theme picker can recolour from the control that was pressed. Load the other companion script and choose the style once, on `<html>`:

```html
<html class="wal-forest" data-wal-recolour="swatch">

<button data-wal-palette="wal-dusk">Dusk</button>
<button data-wal-palette="wal-press">Press</button>
<button data-wal-palette="">Our own</button>

<script src="walnut-recolour.js" defer></script>
```

Press Dusk and Dusk's colours open out of the button in a circle with a soft edge, until they cover the page. It is a view transition: the circle is a mask on the browser's picture of the finished page, so every frame shows either the old palette or the new one, never a mix, and contrast holds from the first frame to the last. Nothing on the live page animates.

The buttons need no script of your own. Each puts its palette class on `<html>` and takes the last one off (`""` goes back to your `:root` script), and every button that controls the same element keeps `aria-pressed` in step. Aim a button at one section with `aria-controls` and the circle covers only that section:

```html
<section id="shop" class="wal-palette wal-bone">…</section>
<button data-wal-palette="wal-dusk" aria-controls="shop">Dusk</button>
```

From script, for a picker that keeps its own state or writes rods:

```js
walnut.recolour(target, { palette: "wal-dusk" }, { from: button });
walnut.recolour(target, { rods: { "--wal-accent-hue": "200" } }, { from: button });
walnut.recolour(target, () => { /* change anything */ }, { from: button });
```

After every change the target fires a bubbling `wal-recolour` event from inside the change, so whatever a listener updates (a label, a chart) lands in the same picture. Without `data-wal-recolour`, or with `"retune"`, the same buttons and calls use `.wal-retune`'s tween; so does a browser without view-transition types. Reduced motion cuts. Acts keep retuning: a circle needs a control at its centre, and an act arrives by scrolling. Set `--wal-recolour-duration` on `:root` to tune the circle (760ms).

For a style of your own, add `walnut.recolour.styles.mine = (target, change, from) => { … }`, make the change inside it with `walnut.recolour.apply(target, change)`, and set `data-wal-recolour="mine"`. [next.html](docs/next.html) recolours every way it can from the swatch: its catalogue plates, its Roll button and each colourway's "Wear it" button.

**Step inside.** The change can be anything, so it can be a whole page. Pass a function that swaps the list for a detail page in the colourway's own palette, and the detail opens out of the card that was pressed, already wearing its colours:

```js
walnut.recolour(page, () => showDetail("forest"), { from: card });
```

### Materials

```html
<html data-motion="materials">
<div class="wal-chest" data-wal-material="stone">…</div>
```

Weight, felt in how a thing comes to a stop. Each material is a small collision model, sampled into a `linear()` curve, that never overshoots its stop: a heavy thing that hits it knocks back and settles.

| Material | Out | Home | How it lands |
|----------|-----|------|--------------|
| `walnut` | 1050ms | 800ms | For drawers and doors. Slow to get going and heavy when it lands: it hits its stop, knocks back about six per cent of its travel, and settles. |
| `brass` | 480ms | 380ms | For hardware: menus, pickers, a chart's columns and ring. Quick to its stop, then it rings like a spring, three knocks each smaller and quicker than the last. |
| `stone` | 1200ms | 1000ms | For big, slow surfaces. No bounce at all; it grinds to a dead stop. |

`data-motion="materials"` on `<html>` gives every part its own: walnut for `.wal-chest`, `.wal-door` and `.wal-window`, brass for `.wal-menu`, `.wal-select`, `.wal-chart` and `.wal-ring`. `data-wal-material` names one for an element and everything inside it. Without either, openings glide and settle as they always have.

A material is nothing more than four tokens, so a part of your own takes one by moving on them:

```css
.my-panel         { transition: translate var(--wal-close-duration) var(--wal-close-ease); }
.my-panel.is-open { transition: translate var(--wal-open-duration) var(--wal-open-ease); }
```

A transition takes the timing of the state it is going to, so the open state names the opening pair. The curves are tokens too (`--wal-ease-walnut`, `--wal-ease-walnut-shut`, `--wal-ease-brass`, `--wal-ease-stone`), and with no material the four default to 620ms glide out and 620ms settle home. Under reduced motion every opening is instant, whatever its material.

### Shuffle

```html
<ul class="wal-shuffle" id="tiles">…</ul>
```

```js
walnut.shuffle(tiles, () => { /* hide, show or reorder the items */ });
```

A list that is filtered or sorted, with every item travelling to its new place instead of jumping there. An item that stays travels; one that leaves shrinks and fades; one that arrives grows in once the others are on their way. It is a view transition scoped to the list, and each item is named by the browser for the length of the change only, so nothing needs an id and no other transition catches them. `walnut.shuffle` is in `walnut-motion.js`, with the gatefold. Without view transitions, or under reduced motion, the change simply happens.

### Between pages

A same-origin navigation between two walnut pages is a [cross-document view transition](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document): the pages crossfade instead of cutting. Whatever the two pages share — the masthead, the desk, the ground — is the same pixels on both sides of the fade, so it holds still while only the papers change. Nothing slides.

Give an element the same `view-transition-name` on both pages and it travels between them instead of fading. A card on one page and the heading of its detail page, say, and the card grows into the page; the travel takes walnut's own easing. If the page also runs same-document transitions (a mode switch, say), name the travellers only for the navigation, in the old page's `pageswap` event and the new page's `pagereveal`, or those transitions will catch them too:

```js
// in <head>: pagereveal can fire before a script at the end of <body> runs
addEventListener("pagereveal", (e) => {
  if (!e.viewTransition) return;
  card.style.viewTransitionName = "plate-14";
  e.viewTransition.finished.finally(() => (card.style.viewTransitionName = ""));
});
```

The docs do exactly this: the specimen card on the workbench grows into [plate 14's own page](docs/specimen.html) and back. Opt out with your own `@view-transition { navigation: none; }`. Reduced motion, and browsers without cross-document transitions (Firefox; Safari before 18.2), simply navigate.

**Within one page.** The same name helpers open a page inside the page, with no navigation at all: a card in a list grows into a detail view where the list was. Name the pieces that travel for the moment of the change only, and move the names over inside it, because a name can be on one element at a time:

```js
plate.classList.add("wal-transition-name-hero");
name.classList.add("wal-transition-name-title");
const t = document.startViewTransition(() => {
  plate.classList.remove("wal-transition-name-hero");
  name.classList.remove("wal-transition-name-title");
  showDetail();                                   // hide the list, show the page
  hero.classList.add("wal-transition-name-hero");
  heading.classList.add("wal-transition-name-title");
});
t.finished.finally(() => {
  hero.classList.remove("wal-transition-name-hero");
  heading.classList.remove("wal-transition-name-title");
});
```

Closing is the same thing the other way round. Where the card and the hero are different shapes, `::view-transition-old(wal-hero), ::view-transition-new(wal-hero) { block-size: 100%; object-fit: cover; }` crops the pictures instead of stretching them. Give the detail an address of its own with `history.pushState`, so Back closes it and a link opens it directly. For a detail that opens over the page instead, with weight, see [Window and gatefold](#window-and-gatefold).

### Scroll and view helpers

Scroll-driven animations with no JavaScript:

```html
<div class="wal-reveal">Content appears cinematically</div>
<div class="wal-reveal-left">From the left</div>
<div class="wal-progress-bar"></div>
<figure class="wal-duotone wal-reveal-develop"><img src="photo.jpg" alt="…"></figure>
```

`.wal-reveal-develop` brings a photograph up out of blank paper as it rises into view, shadows first and highlights last, the way a print comes up in the developer tray. It is made for a [`.wal-duotone`](#duotone) print, and like the other reveals it is tied to scrolling, so scrolling back up takes the print back to paper. Without scroll-driven animations the print is simply there.

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

Newer features enhance where they exist and are simply absent where they don't. Dialog and popover entrances need `@starting-style` (Chrome 117, Safari 17.5, Firefox 129); without it a dialog appears at once. Page-to-page transitions need cross-document view transitions (Chrome 126, Safari 18.2); without them a link just navigates. The swatch recolour needs view-transition types (Chrome 125, Safari 18.2), and `walnut-recolour.js` checks for them; without them it tweens with `.wal-retune`. The reveals, `.wal-reveal-develop` among them, need scroll-driven animations (Chrome 115, Safari 26); without them the content is simply there.

The newest parts are built on the platform's newest features, and Chrome and Edge have every one of them today. Each falls back to something that still works: a chest's drawer opens at once (`::details-content`), a door or window is opened by your own `showModal()` (`commandfor`), a tip stays hidden (`interestfor`), a select is the system's own (`base-select`), a carousel is a row you swipe (`::scroll-marker`), corners are round (`corner-shape`), `--wal-ink()` needs its fallback declaration (`@function`), and the nav needs its state classes (scroll-driven animations, `:target-current`).

walnut.css parses in Lightning CSS, which Next.js (Turbopack), Vite, Parcel and Bun use, so importing it into a bundled app works. Lightning CSS refuses a whole stylesheet over one rule it cannot read, so a few of these features are spelled the way it accepts: `.wal-select:open::picker(select)` rather than `:popover-open` on the picker, and `@function` parameters without a type. The selectors it cannot read in any spelling (`:target-current`, `::scroll-marker`, `::scroll-button()`) are in `walnut-scroll.css`, a separate file: in a bundled app, import `walnut.css` and link `walnut-scroll.css` from your public folder, or leave it out. The build refuses anything Lightning CSS rejects from finding its way back into `walnut.css`.

```js
import "walnut.css";                       // in the bundle
// <link rel="stylesheet" href="/walnut-scroll.css">, copied from walnut.css/scroll
```

## License

[MIT](LICENSE) — Alex Kim
