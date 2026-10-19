/**
 * Renders docs/og.png (the link-preview card, from og.html beside this file)
 * and docs/apple-touch-icon.png (the mark, docs/favicon.svg, at 180px).
 * Run after `npm run build` (og.html reads dist/walnut.min.css), with
 * playwright-core available:
 *
 *   npm i --no-save playwright-core && node scripts/og/render.mjs
 *
 * Both images are committed; build.js only copies them.
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const docs = path.join(here, "..", "..", "docs");
const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});

const card = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await card.goto(pathToFileURL(path.join(here, "og.html")).href, { waitUntil: "networkidle" });
await card.screenshot({ path: path.join(docs, "og.png") });

const icon = await browser.newPage({ viewport: { width: 180, height: 180 } });
const svg = fs.readFileSync(path.join(docs, "favicon.svg"), "utf8").replace('width="256" height="256"', 'width="180" height="180"');
await icon.setContent(`<style>html,body{margin:0;background:#1C140B}svg{display:block}</style>${svg}`);
await icon.screenshot({ path: path.join(docs, "apple-touch-icon.png") });

await browser.close();
