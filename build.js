/**
 * walnut.css build script
 * Concatenates all CSS layers into a single dist file and minifies.
 * No dependencies — uses Node.js built-ins only.
 *
 * Everything is assembled in memory first and every guard runs before the
 * first byte is written, so a failing guard leaves dist/ and public/ exactly
 * as the last good build left them rather than half-rewritten.
 */
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "src");
const DIST = path.join(__dirname, "dist");
const PUBLIC = path.join(__dirname, "public");
const DOCS = path.join(__dirname, "docs");

/* The one place the version is written down. The dist banner is built from
   it; the copies a reader sees without a build (src/walnut.css, the docs
   page) are checked against it by assertVersionStamped. */
const { version: VERSION } = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"), "utf8"));

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

// ─── Build main bundle ───
const banner = `/*! walnut.css v${VERSION} | MIT License | github.com/SKMinWoo/walnut.css */\n`;

let bundle = banner;
bundle += `@layer reset, tokens, base, layout, components, finish, utilities, cinema;\n\n`;

for (const layer of LAYERS) {
  const layerName = path.basename(layer, ".css").replace(/^\d+-/, "");
  const content = fs.readFileSync(path.join(SRC, layer), "utf8");
  bundle += `/* ── ${layerName} ── */\n`;
  bundle += `@layer ${layerName} {\n${content}\n}\n\n`;
}

// ─── Minify (basic: strip comments, collapse whitespace) ───
const minified = bundle
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
  //
  // `:` IS in the class, and that is a live hazard of the same kind: the space
  // before a pseudo-class is a descendant combinator, so `.a :hover` (any
  // hovered descendant of .a) would minify to `.a:hover` (.a itself, hovered)
  // with no error anywhere. Nothing in src/ is written that way. If a selector
  // ever needs it, spell it `.a *:hover`, which survives.
  .replace(/\s*([{}:;,>])\s*/g, "$1")
  // Remove trailing semicolons before closing braces
  .replace(/;}/g, "}")
  // Remove empty rules
  .replace(/[^{}]+\{\s*\}/g, "")
  .trim();

// ─── Read the palettes ───
// A theme listed in THEMES that is missing on disk is an error, not a skip:
// assertDocsRewritten expects a <link> for every one of them, and a skipped
// theme would otherwise ship as a 404 from a build that said it succeeded.
const themeCss = Object.fromEntries(
  THEMES.map((theme) => {
    const file = path.join(SRC, "themes", `${theme}.css`);
    if (!fs.existsSync(file)) {
      throw new Error(`src/themes/${theme}.css is listed in THEMES but does not exist.`);
    }
    return [theme, fs.readFileSync(file, "utf8")];
  })
);

/**
 * Guard the rule stated in the header of 07-finish.css: a palette never sets
 * a token that a finish sets.
 *
 * Nothing in CSS enforces it. A palette file that declares --wal-elevation
 * builds, loads and renders without complaint — it just silently overrides
 * every finish it is paired with, because dist/themes/ ship unlayered. That
 * is how Press and Bone shipped in 0.4.0. Like the docs rewrite below, it
 * fails open, so the build is the only place left to catch it.
 *
 * @param {string} finishCss  src/layers/07-finish.css exactly as read from disk
 * @param {Record<string, string>} palettes  theme name → that palette file's CSS
 * @throws naming each palette and the finish-owned token(s) it declares
 */
function assertPalettesLeaveFinishTokens(finishCss, palettes) {
  // TODO(you): decide what a finish owns, find any palette that declares it,
  // and throw. Returning without a check keeps the build passing meanwhile.
}

/**
 * Guard the ../dist/ → dist/ rewrite that assembles public/index.html.
 *
 * The rewrite is a regex over hand-written HTML, which means it fails open:
 * if someone edits the docs page and the paths stop matching the pattern,
 * `.replace()` returns the input unchanged, this build prints "built
 * successfully", and the deployed site quietly serves an unstyled page. That
 * is the same shape of failure as the two minifier bugs documented above — a
 * build that reported success while shipping a stylesheet that wasn't the one
 * anybody wrote. The build should refuse to produce a site it cannot vouch for.
 *
 * @param {string} original  docs/index.html exactly as read from disk
 * @param {string} rewritten the same HTML after ../dist/ became dist/
 * @throws to fail the build when the deployed page would be missing styles
 */
function assertDocsRewritten(original, rewritten) {
  // One <link> per theme, plus the bundle itself. Derived from THEMES rather
  // than hardcoded so adding a theme cannot quietly lower the bar.
  const expected = THEMES.length + 1;
  const found = (original.match(STYLESHEET_LINKS) || []).length;

  if (found !== expected) {
    throw new Error(
      `docs/index.html: expected ${expected} "../dist/" stylesheet links, found ${found}.\n` +
        `  The public/ rewrite is keyed to that exact pattern, so the deployed page\n` +
        `  would have shipped with ${expected - found} stylesheet(s) pointing above the\n` +
        `  site root. Update STYLESHEET_LINKS to match how the docs page links its CSS.`
    );
  }

  // Catches the partial failure the count above cannot: a link that matched the
  // pattern but survived the replace, or a new one written in some other shape.
  if (rewritten.includes("../")) {
    throw new Error(
      `public/index.html still contains a "../" path after rewriting.\n` +
        `  Nothing above the site root exists once deployed — it would 404.`
    );
  }
}

/**
 * Guard the version a reader sees without running a build. src/walnut.css is
 * imported straight from the package, and the docs page is opened straight
 * off disk, so neither can be stamped at build time; they are checked against
 * package.json instead, so bumping the version there fails the build until
 * every copy agrees.
 *
 * @param {Record<string, string[]>} found  file → every version it states
 * @throws naming each file that states something other than VERSION
 */
function assertVersionStamped(found) {
  const wrong = Object.entries(found).filter(([, vs]) => vs.length === 0 || vs.some((v) => v !== VERSION));
  if (wrong.length) {
    throw new Error(
      `package.json says ${VERSION}, but:\n` +
        wrong.map(([file, vs]) => `  ${file} says ${vs.length ? vs.join(", ") : "nothing (marker not found)"}`).join("\n")
    );
  }
}

// ─── Assemble the deployable site (in memory) ───
//
// A static host serves exactly one directory. The docs page and the
// stylesheets it loads live in two — docs/ and dist/ — so neither is
// deployable alone: point a host at dist/ and there is no index.html, point it
// at docs/ and all six <link> tags 404. The write step below flattens both
// into public/, which is the outputDirectory named in vercel.json.
//
// public/ is a build artifact, not source. It is gitignored and rebuilt from
// scratch on every run, so a file deleted from docs/ or dist/ cannot linger
// there and keep working in production after it stopped existing.

/* docs/index.html links its stylesheets as `../dist/walnut.css` so that the
   page renders when opened straight off disk, with no server at all. In
   public/ the page sits at the root *beside* dist/, so that `../` has to go.

   Rewriting on copy — rather than changing docs/index.html to `dist/` and
   nesting the deployed copy to match — keeps the one-file, no-build-step
   promise the docs page makes about itself in the Install section. The cost is
   that the rewrite is a blind regex, which is what assertDocsRewritten guards. */
const STYLESHEET_LINKS = /\.\.\/dist\//g;
const docsHtml = fs.readFileSync(path.join(DOCS, "index.html"), "utf8");
const siteHtml = docsHtml.replace(STYLESHEET_LINKS, "dist/");

// ─── Guards — all of them, before anything is written ───
assertPalettesLeaveFinishTokens(fs.readFileSync(path.join(SRC, "layers", "07-finish.css"), "utf8"), themeCss);
assertDocsRewritten(docsHtml, siteHtml);
assertVersionStamped({
  "src/walnut.css": [...fs.readFileSync(path.join(SRC, "walnut.css"), "utf8").matchAll(/walnut\.css v(\d+\.\d+\.\d+\S*)/g)].map((m) => m[1]),
  "docs/index.html": [...docsHtml.matchAll(/<span data-version>([^<]*)<\/span>/g)].map((m) => m[1]),
});

// ─── Write ───
fs.mkdirSync(path.join(DIST, "themes"), { recursive: true });
fs.writeFileSync(path.join(DIST, "walnut.css"), bundle);
fs.writeFileSync(path.join(DIST, "walnut.min.css"), minified);
for (const [theme, css] of Object.entries(themeCss)) {
  fs.writeFileSync(path.join(DIST, "themes", `${theme}.css`), css);
}

fs.rmSync(PUBLIC, { recursive: true, force: true });
fs.mkdirSync(path.join(PUBLIC, "dist", "themes"), { recursive: true });
fs.writeFileSync(path.join(PUBLIC, "dist", "walnut.css"), bundle);
fs.writeFileSync(path.join(PUBLIC, "dist", "walnut.min.css"), minified);
for (const [theme, css] of Object.entries(themeCss)) {
  fs.writeFileSync(path.join(PUBLIC, "dist", "themes", `${theme}.css`), css);
}
fs.writeFileSync(path.join(PUBLIC, "index.html"), siteHtml);
if (fs.existsSync(path.join(DOCS, "favicon.svg"))) {
  fs.copyFileSync(path.join(DOCS, "favicon.svg"), path.join(PUBLIC, "favicon.svg"));
}
if (fs.existsSync(path.join(DOCS, "favicon.ico"))) {
  fs.copyFileSync(path.join(DOCS, "favicon.ico"), path.join(PUBLIC, "favicon.ico"));
}

// ─── Report sizes ───
const fullSize = Buffer.byteLength(bundle, "utf8");
const minSize = Buffer.byteLength(minified, "utf8");

console.log(`\n  walnut.css v${VERSION} built successfully\n`);
console.log(`  dist/walnut.css     ${(fullSize / 1024).toFixed(1)} KB`);
console.log(`  dist/walnut.min.css ${(minSize / 1024).toFixed(1)} KB`);
console.log(`  themes:             ${THEMES.join(", ")}`);
console.log();
