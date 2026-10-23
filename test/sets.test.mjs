import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { VIBES, RAMP, CAP, OFFSET, checkSet, cssOf, decodeLook, encodeLook, fileOf, matchVibe, varsOf, vibeSet } from "../docs/sets.mjs";
import { describeVibe } from "../api/vibe.mjs";

const tokens = readFileSync(new URL("../src/layers/01-tokens.css", import.meta.url), "utf8");
const stock = tokens.slice(tokens.indexOf("═══ THE DEFAULT SCRIPT ═══"));
const valueOf = (name) => {
  const m = stock.match(new RegExp(`${name}:\\s*(-?[\\d.]+)(%?)`));
  assert.ok(m, `${name} is not in 01-tokens.css`);
  return m[2] ? Number(m[1]) / 100 : Number(m[1]);
};

test("the mirrored ramp matches walnut's stylesheet", () => {
  for (const mode of ["light", "dark"]) {
    for (const [stop, v] of Object.entries(RAMP[mode])) {
      const name = /^(ink-shift|cx-)/.test(stop) ? `--wal-${stop}-${mode}` : `--wal-l-${stop}-${mode}`;
      assert.equal(v, valueOf(name), name);
    }
  }
  for (const [cue, c] of Object.entries(CAP)) assert.equal(c, valueOf(`--wal-${cue}-chroma`), cue);
  assert.match(tokens, new RegExp(`--wal-bloom-hue: calc\\(var\\(--wal-accent-hue\\) \\+ ${OFFSET.bloom}\\)`));
  assert.match(tokens, new RegExp(`--wal-cool-hue:\\s+calc\\(var\\(--wal-accent-hue\\) \\+ ${OFFSET.cool}\\)`));
});

test("every vibe passes the guard in light and dark", () => {
  for (const vibe of VIBES) {
    const r = checkSet(vibeSet(vibe));
    assert.ok(r.ok, `${vibe.vibe}: ${r.problems?.join("; ")}`);
  }
});

test("the guard refuses what is not a vetted part, a hue, or plain words", () => {
  const base = vibeSet(VIBES[2]);
  const bad = [
    { ...base, display: "comic-sans" },
    { ...base, hues: { ...base.hues, accent: 400 } },
    { ...base, hues: { accent: 20, gold: 80 } },
    { ...base, name: "<script>x</script>" },
    { ...base, name: "See https://example.com" },
    { ...base, css: "body { display: none }" },
    { ...base, note: "Some shit set." },
  ];
  for (const set of bad) assert.equal(checkSet(set).ok, false, JSON.stringify(set));
});

test("the guard bites on contrast, not only on shape", () => {
  // walnut pins lightness, so hue rarely moves contrast. Where it does is a
  // green bloom: at bloom's light-mode stop, white text on it lands just under AA.
  const r = checkSet({ ...vibeSet(VIBES[2]), hues: { ground: 55, accent: 25, gold: 85, bloom: 150 } });
  assert.equal(r.ok, false);
  assert.match(r.problems.join(" "), /contrast: bloom/);
});

test("a link carries a set and nothing else", () => {
  const set = vibeSet(VIBES[1]);
  const back = decodeLook(encodeLook(set, "Rain on the glass."));
  assert.ok(back.ok);
  assert.deepEqual(back.set, set);
  assert.equal(back.note, "Rain on the glass.");
  assert.equal(decodeLook("not base64!").ok, false);
  assert.equal(decodeLook(encodeLook({ ...set, name: "<b>x</b>" })).ok, false);
});

test("the rules match the vibe and colour a description asks for, and are deterministic", () => {
  const a = matchVibe("a 1960s mission control in teal");
  assert.equal(a.set.vibe, "mod");
  assert.equal(a.set.name, "Teal Mod");
  assert.equal(a.set.hues.accent, 195);
  assert.deepEqual(matchVibe("a 1960s mission control in teal"), a);
  assert.ok(checkSet({ ...a.set, note: a.note }).ok);
  // A colour that would fail contrast in that vibe is dropped, not applied.
  for (const brief of ["noir in yellow", "disco in lime", "web 1.0 in mint", "arcade in amber", "rainy afternoon"]) {
    const r = matchVibe(brief);
    assert.ok(checkSet({ ...r.set, note: r.note }).ok, brief);
  }
});

test("with no key, describing a vibe falls back to the rules and says so", async () => {
  const before = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  try {
    const r = await describeVibe("art deco hotel lobby", false);
    assert.equal(r.by, "rules");
    assert.equal(r.set.vibe, "deco");
    assert.match(r.trace[0].detail, /no model key/);
  } finally {
    if (before !== undefined) process.env.GEMINI_API_KEY = before;
  }
});

test("a set's CSS writes only walnut's own tokens", () => {
  for (const vibe of VIBES) {
    const vars = varsOf(vibeSet(vibe));
    assert.ok(Object.keys(vars).every((k) => k.startsWith("--wal-")));
    assert.match(cssOf(vibeSet(vibe)), /:root \{/);
  }
});

test("the export is a file to load after walnut.css, with the colours on screen", () => {
  const set = vibeSet(VIBES[1]);
  const css = cssOf(set);
  // A comment may come before @import; nothing else may.
  assert.match(css, /^\/\* Noir: a walnut\.css vibe\. Load it after walnut\.css\. \*\/\n\n@import url\("https:\/\/fonts\.googleapis\.com\//);
  assert.doesNotMatch(css, /@layer/);
  const edited = cssOf(set, { ...varsOf(set), "--wal-accent-hue": "200" });
  assert.match(edited, /--wal-accent-hue:\s+200;/);
  assert.equal(fileOf(set), "walnut-noir.css");
  assert.equal(fileOf({ name: "Teal Mid-century" }), "walnut-teal-mid-century.css");
  assert.equal(fileOf({ name: "Café Noir" }), "walnut-cafe-noir.css");
});
