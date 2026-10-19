/**
 * The stills: tests/specimen.html photographed in every shipped palette and
 * the default script, in light and dark, in the soft and catalogue finishes
 * (6 × 2 × 2 = 24), into tests/stills/. CI keeps them as an artifact, so a
 * change's effect on every combination can be looked at side by side. They
 * are for eyes, not a pixel diff: fonts render differently from one machine
 * to the next, and a diff that fails on that is a diff people learn to skip.
 *
 *   node tests/stills.mjs            after `npm run build`
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, "stills");
const PALETTES = ["default", "press", "cafe", "forest", "dusk", "bone"];
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 760 } });
await page.goto(pathToFileURL(path.join(here, "specimen.html")).href, { waitUntil: "load" });
let n = 0;
for (const palette of PALETTES) {
  for (const mode of ["light", "dark"]) {
    for (const finish of ["soft", "catalogue"]) {
      await page.evaluate(({ palette, mode, finish }) => {
        const html = document.documentElement;
        html.className = palette === "default" ? "" : `wal-${palette}`;
        html.dataset.theme = mode;
        html.dataset.finish = finish;
      }, { palette, mode, finish });
      await page.screenshot({ path: path.join(out, `${palette}-${mode}-${finish}.png`), fullPage: true });
      n++;
    }
  }
}
await browser.close();
console.log(`\n  stills: ${n} written to tests/stills/\n`);
