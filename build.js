/**
 * walnut.css build script
 * Concatenates all CSS layers into a single dist file and minifies.
 * No dependencies — uses Node.js built-ins only.
 */
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "src");
const DIST = path.join(__dirname, "dist");

/* Order here IS the cascade layer order in dist. `finish` sits between
   components and utilities: a finish must be able to restyle a component, and
   a utility must be able to beat a finish. The numeric filename prefixes are
   historical and no longer imply order — this array does. */
const LAYERS = [
  "layers/00-reset.css",
  "layers/01-tokens.css",
  "layers/02-base.css",
  "layers/03-layout.css",
  "layers/04-components.css",
  "layers/07-finish.css",
  "layers/05-utilities.css",
  "layers/06-cinema.css",
];

const THEMES = ["cafe", "press", "forest", "dusk", "bone"];

// Ensure dist directories exist
fs.mkdirSync(path.join(DIST, "themes"), { recursive: true });

// ─── Build main bundle ───
const banner = `/*! walnut.css v0.4.0 | MIT License | github.com/SKMinWoo/walnut.css */\n`;

let bundle = banner;
bundle += `@layer reset, tokens, base, layout, components, finish, utilities, cinema;\n\n`;

for (const layer of LAYERS) {
  const layerName = path.basename(layer, ".css").replace(/^\d+-/, "");
  const content = fs.readFileSync(path.join(SRC, layer), "utf8");
  bundle += `/* ── ${layerName} ── */\n`;
  bundle += `@layer ${layerName} {\n${content}\n}\n\n`;
}

fs.writeFileSync(path.join(DIST, "walnut.css"), bundle);

// ─── Minify (basic: strip comments, collapse whitespace) ───
let minified = bundle
  // Remove block comments (but keep the banner)
  .replace(/\/\*(?!\!)[^]*?\*\//g, "")
  // NO single-line comment stripping. CSS has no `//` comments, so this step
  // could only ever destroy real content — and it did: the `//` in the
  // `xmlns="http://www.w3.org/2000/svg"` of the inline SVG data URIs matched,
  // deleting the rest of the line and leaving `url('data:…<svg xmlns="http:`
  // unterminated. An unterminated string swallows the CSS that follows it, so
  // in walnut.min.css every rule after .wal-card-flora — the back half of the
  // components layer and the whole finish layer — silently stopped applying.
  // Nothing about the minified build looked broken; it just quietly wasn't the
  // same stylesheet as walnut.css.
  // Collapse whitespace
  .replace(/\s+/g, " ")
  // Remove space around punctuation.
  //
  // `+` and `~` are deliberately NOT in this class even though they are
  // combinators. CSS *requires* whitespace on both sides of `+` and `-` inside
  // calc(), so stripping it turned `calc(var(--a) + 27)` into `calc(var(--a)+27)`
  // — invalid, and therefore a colour that silently computed to black. Every
  // derived hue and lightness in the tokens layer went through that path, so
  // walnut.min.css (the file the README tells you to install) was shipping a
  // broken palette while walnut.css was fine. The two bytes are not worth it.
  .replace(/\s*([{}:;,>])\s*/g, "$1")
  // Remove trailing semicolons before closing braces
  .replace(/;}/g, "}")
  // Remove empty rules
  .replace(/[^{}]+\{\s*\}/g, "")
  .trim();

fs.writeFileSync(path.join(DIST, "walnut.min.css"), minified);

// ─── Copy theme files ───
for (const theme of THEMES) {
  const src = path.join(SRC, "themes", `${theme}.css`);
  const dest = path.join(DIST, "themes", `${theme}.css`);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

// ─── Report sizes ───
const fullSize = Buffer.byteLength(bundle, "utf8");
const minSize = Buffer.byteLength(minified, "utf8");

console.log(`\n  walnut.css built successfully\n`);
console.log(`  dist/walnut.css     ${(fullSize / 1024).toFixed(1)} KB`);
console.log(`  dist/walnut.min.css ${(minSize / 1024).toFixed(1)} KB`);
console.log(`  themes:             ${THEMES.join(", ")}`);
console.log();
