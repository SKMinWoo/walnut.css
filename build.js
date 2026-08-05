/**
 * walnut.css build script
 * Concatenates all CSS layers into a single dist file and minifies.
 * No dependencies — uses Node.js built-ins only.
 */
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "src");
const DIST = path.join(__dirname, "dist");

const LAYERS = [
  "layers/00-reset.css",
  "layers/01-tokens.css",
  "layers/02-base.css",
  "layers/03-layout.css",
  "layers/04-components.css",
  "layers/05-utilities.css",
  "layers/06-cinema.css",
];

const THEMES = ["cafe", "forest", "dusk", "bone"];

// Ensure dist directories exist
fs.mkdirSync(path.join(DIST, "themes"), { recursive: true });

// ─── Build main bundle ───
const banner = `/*! walnut.css v0.2.0 | MIT License | github.com/SKMinWoo/walnut.css */\n`;

let bundle = banner;
bundle += `@layer reset, tokens, base, layout, components, utilities, cinema;\n\n`;

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
  // Remove single-line comments
  .replace(/\/\/.*$/gm, "")
  // Collapse whitespace
  .replace(/\s+/g, " ")
  // Remove space around punctuation
  .replace(/\s*([{}:;,>+~])\s*/g, "$1")
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
