/**
 * The contrast audit: every text pair walnut promises clears WCAG AA (4.5:1),
 * in every shipped palette and the default script, in light and in dark.
 *
 * Measured, not modelled: each palette is loaded from dist/ into a real
 * browser and every colour is read back as painted, so this checks what
 * walnut actually derives, light-dark(), relative colour syntax and all.
 * The pairs are the ones the docs page scores (docs/index.html, PAIRS): the
 * page's text and muted text on the ground and on a card, and each cue as
 * text on the ground, on a card and on its own wash, and the text set on it.
 *
 *   node tests/contrast.mjs          after `npm run build`
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = (f) => pathToFileURL(path.join(root, "dist", f)).href;
export const PALETTES = ["default", "press", "cafe", "forest", "dusk", "bone"];
const CUES = ["accent", "bloom", "gold", "olive", "cool"];
const AA = 4.5;

const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const page = await browser.newPage();
const failures = [];
let checked = 0;

for (const palette of PALETTES) {
  const theme = palette === "default" ? "" : `<link rel="stylesheet" href="${dist(`themes/${palette}.css`)}">`;
  const cls = palette === "default" ? "" : `wal-${palette}`;
  // From a file, not setContent: an about:blank page may not load file: URLs.
  const file = path.join(os.tmpdir(), `walnut-contrast-${palette}.html`);
  fs.writeFileSync(file, `<!doctype html><html class="${cls}"><head><link rel="stylesheet" href="${dist("walnut.css")}">${theme}</head><body></body></html>`);
  await page.goto(pathToFileURL(file).href, { waitUntil: "load" });
  for (const mode of ["light", "dark"]) {
    const pairs = await page.evaluate(({ mode, CUES }) => {
      const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
      const island = Object.assign(document.createElement("div"), { className: `wal-${mode}` });
      const probe = document.createElement("i");
      island.append(probe);
      document.body.append(island);
      const css = (token) => { probe.style.color = `var(--wal-${token})`; return getComputedStyle(probe).color; };
      // Paints `over` on top of `under` and reads back the pixel: a
      // translucent wash is only a colour once it sits on something.
      const rgb = (over, under = "#fff") => {
        ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 1, 1);
        ctx.fillStyle = under; ctx.fillRect(0, 0, 1, 1);
        ctx.fillStyle = over; ctx.fillRect(0, 0, 1, 1);
        return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
      };
      const lum = (c) => {
        const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
      const bg = rgb(css("bg")), surface = rgb(css("surface"));
      const out = [
        ["text on bg", ratio(rgb(css("text")), bg)],
        ["text on surface", ratio(rgb(css("text")), surface)],
        ["text-soft on bg", ratio(rgb(css("text-soft")), bg)],
        ["text-muted on bg", ratio(rgb(css("text-muted")), bg)],
        ["text-muted on surface", ratio(rgb(css("text-muted")), surface)],
      ];
      for (const cue of CUES) {
        const ink = rgb(css(`${cue}-ink`));
        out.push(
          [`${cue}-ink on bg`, ratio(ink, bg)],
          [`${cue}-ink on surface`, ratio(ink, surface)],
          [`${cue}-ink on ${cue}-soft`, ratio(ink, rgb(css(`${cue}-soft`), css("bg")))],
          [`${cue}-fg on ${cue}`, ratio(rgb(css(`${cue}-fg`)), rgb(css(cue)))],
        );
      }
      island.remove();
      return out;
    }, { mode, CUES });
    for (const [pair, r] of pairs) {
      checked++;
      if (!(r >= AA)) failures.push(`${palette.padEnd(7)} ${mode.padEnd(5)} ${pair.padEnd(28)} ${r.toFixed(2)}:1`);
    }
  }
}
await browser.close();

if (failures.length) {
  console.error(`\n  ${failures.length} of ${checked} text pairs fall short of ${AA}:1\n\n  ` + failures.join("\n  ") + "\n");
  process.exit(1);
}
console.log(`\n  contrast: all ${checked} text pairs clear ${AA}:1 (${PALETTES.length} palettes × light and dark)\n`);
