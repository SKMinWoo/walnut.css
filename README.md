<div align="center">

# 🌰 walnut.css

**A cinematic, nature-inspired CSS framework.**<br>
Café warmth. Botanical texture. Zero JavaScript.

[![License: MIT](https://img.shields.io/badge/license-MIT-E5A62E?style=flat-square)](LICENSE)
[![CSS Only](https://img.shields.io/badge/javascript-zero-2D2418?style=flat-square)]()
[![Modern CSS](https://img.shields.io/badge/modern_css-oklch_%7C_@layer_%7C_@container-D9432F?style=flat-square)]()

[Demo](https://skminwoo.github.io/walnut.css) · [Components](#components) · [Themes](#themes) · [Install](#install)

</div>

---

## What is this?

walnut.css is a CSS framework that looks like a warm café smells. It's built entirely on modern CSS platform APIs — no JavaScript, no build step required, no preprocessor.

Drop a single `<link>` tag into your page and get:
- 🎨 **oklch color system** — entire palette from a single hue variable
- 📦 **@layer cascade** — clean overrides, no specificity wars
- 📐 **Container queries** — components respond to their parent, not the viewport
- 🎬 **Scroll-driven animations** — cinematic reveals, parallax, progress bars — zero JS
- 🌿 **Four nature themes** — café, forest, dusk, bone
- ♿ **Respects `prefers-reduced-motion`** and `prefers-color-scheme`
- 🪶 **~10-15 KB** gzipped

## Install

### CDN (easiest)

```html
<link rel="stylesheet" href="https://unpkg.com/walnut.css/dist/walnut.min.css">
```

### npm

```bash
npm install walnut.css
```

```css
@import "walnut.css";
```

### Download

Grab [`walnut.min.css`](dist/walnut.min.css) and drop it in your project.

## Quick Start

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="walnut.min.css">
  <title>My Site</title>
</head>
<body>
  <nav class="wal-nav">
    <a class="wal-nav-brand" href="/">
      My Site
      <small>Made with walnut.css</small>
    </a>
  </nav>

  <section class="wal-hero">
    <div class="wal-hero-content">
      <h1 class="wal-hero-name">Hello, world</h1>
      <p class="wal-hero-tagline">A warm, cinematic landing page.</p>
      <div class="wal-hero-actions">
        <a href="#" class="wal-btn wal-btn-primary">Get started</a>
        <a href="#" class="wal-btn wal-btn-secondary">Learn more</a>
      </div>
    </div>
  </section>

  <div class="wal-wrap">
    <div class="wal-grid wal-cols-3 wal-gap-md">
      <div class="wal-card wal-reveal">Card 1</div>
      <div class="wal-card wal-reveal">Card 2</div>
      <div class="wal-card wal-reveal">Card 3</div>
    </div>
  </div>
</body>
</html>
```

## Themes

Switch themes by adding a class to `<html>` or `<body>`:

| Theme | Class | Mood |
|-------|-------|------|
| ☕ Café | `.wal-cafe` (default) | Walnut wood, bone china, brass fixtures |
| 🌲 Forest | `.wal-forest` | Mossy floor, morning mist, filtered light |
| 🌅 Dusk | `.wal-dusk` | Mountain sunset, purple twilight, lantern glow |
| 📜 Bone | `.wal-bone` | Sunlit linen, watercolor, Japanese stationery |

To use a theme, import the theme file after the main CSS:

```html
<link rel="stylesheet" href="walnut.min.css">
<link rel="stylesheet" href="themes/forest.css">
```

### Custom theme in 30 seconds

Override two variables to re-theme everything:

```css
:root {
  --wal-hue: 200;        /* Ocean blue */
  --wal-accent-hue: 15;  /* Coral accent */
}
```

## Components

| Component | Class | Description |
|-----------|-------|-------------|
| Navbar | `.wal-nav` | Sticky glassmorphism navigation |
| Hero | `.wal-hero` | Full-viewport landing section |
| Button | `.wal-btn` | Primary, secondary, ghost variants |
| Card | `.wal-card` | Surface card with hover effects |
| Plate | `.wal-plate` | Specification grid (key-value pairs) |
| Metric | `.wal-metric` | Big number + label |
| Chip | `.wal-chip` | Small pill tag |
| Timeline | `.wal-timeline` | Experience/event timeline |
| Table | `.wal-table` | Styled data table |
| Divider | `.wal-divider` | Gold flourish ornament |
| Input | `.wal-input` | Form fields with warm focus ring |
| Badge | `.wal-badge` | Monospace pill label |
| Dialog | `.wal-dialog` | Native dialog + Popover API |
| Tooltip | `.wal-tooltip` | CSS Anchor Positioning tooltip |
| Drawer | `.wal-drawer` | Mobile slide-in panel |
| Swatch | `.wal-swatch` | Color swatch display |

## Cinematic Motion

walnut.css includes scroll-driven animations that work without any JavaScript:

```html
<!-- Fades in as you scroll to it -->
<div class="wal-reveal">Content appears cinematically</div>

<!-- Slides in from the left -->
<div class="wal-reveal-left">From the left</div>

<!-- Page scroll progress bar -->
<div class="wal-progress-bar"></div>
```

All animations respect `prefers-reduced-motion: reduce`.

## Modern CSS Features Used

| Feature | Status | Usage |
|---------|--------|-------|
| `@layer` | ✅ Baseline | Cascade architecture |
| `@property` | ✅ Baseline | Animatable theme tokens |
| `oklch()` | ✅ Baseline | All color generation |
| `color-mix()` | ✅ Baseline | Hover/disabled states |
| Container Queries | ✅ Baseline | Responsive components |
| `:has()` | ✅ Baseline | Contextual card layouts |
| Native Nesting | ✅ Baseline | All component styles |
| Scroll-Driven Animations | 🟡 New | Reveal, parallax, progress |
| Anchor Positioning | 🟡 New | Tooltips |
| Popover API | ✅ Baseline | Dialogs |
| `field-sizing` | 🟡 New | Auto-grow textareas |
| View Transitions | 🟡 New | Page transitions |

## Browser Support

walnut.css targets modern browsers. It is designed for:
- Chrome/Edge 117+
- Firefox 128+
- Safari 17.4+

## License

[MIT](LICENSE) — Alex Kim
