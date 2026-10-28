import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { VIBES, RAMP, CAP, OFFSET, checkSet, cssOf, decodeLook, encodeLook, fileOf, hasBlockedWord, matchVibe, varsOf, vibeSet } from "../docs/sets.mjs";
import { POST, describeVibe } from "../api/vibe.mjs";

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

test("a part must be the part's name, not something that contains it", () => {
  const set = vibeSet(VIBES[0]);
  for (const k of ["display", "label", "body", "corners", "shadow"]) {
    const r = checkSet({ ...set, [k]: [set[k]] });
    assert.ok(!r.ok, k);
  }
});

test("the wording guard reads digits as letters and short words whole", () => {
  for (const bad of ["Sh1t Show", "Wank Club", "F4ggot", "Nazi Chic"]) assert.ok(hasBlockedWord(bad), bad);
  for (const fine of ["Swank Lounge", "Cocktail Hour", "Scunthorpe Seaside", "1970s Disco", "Teal 50s Diner"]) assert.ok(!hasBlockedWord(fine), fine);
});

test("the rules refuse a description that names no vibe, rather than guess", () => {
  const r = matchVibe("quarterly earnings report");
  assert.equal(r.set, null);
  assert.match(r.refusal, /don't know that vibe/);
  // Words reviewers tried, which used to fall through to a guess.
  assert.equal(matchVibe("cyberpunk hacker terminal").set.vibe, "arcade");
  assert.equal(matchVibe("calm minimalist bakery").set.vibe, "midcentury");
  assert.equal(matchVibe("a rainy night in the city").set.vibe, "noir");
});

test("a model that runs past its deadline is cancelled, and the rules answer", async () => {
  const saved = { key: process.env.GEMINI_API_KEY, fallbacks: process.env.GEMINI_FALLBACK_MODELS, fetch: globalThis.fetch };
  process.env.GEMINI_API_KEY = "test-key";
  process.env.GEMINI_FALLBACK_MODELS = "none";
  // A model that never answers: the request ends only when it is aborted.
  globalThis.fetch = (_url, { signal }) => new Promise((_, reject) => signal.addEventListener("abort", () => reject(signal.reason)));
  try {
    const started = Date.now();
    const r = await describeVibe("art deco hotel lobby", true, { deadlineMs: 60 });
    assert.ok(Date.now() - started < 2000);
    assert.equal(r.by, "rules");
    assert.equal(r.set.vibe, "deco");
    assert.match(r.trace.find((t) => t.tool === "fallback").detail, /deadline/);
  } finally {
    globalThis.fetch = saved.fetch;
    for (const [k, v] of [["GEMINI_API_KEY", saved.key], ["GEMINI_FALLBACK_MODELS", saved.fallbacks]]) {
      if (v === undefined) delete process.env[k]; else process.env[k] = v;
    }
  }
});

test("POST /api/vibe turns away other sites and oversized bodies, and says when the rules can't help", async () => {
  const before = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  const ask = (body, headers = {}) => POST(new Request("https://walnut.test/api/vibe", {
    method: "POST", body, headers: { "Content-Type": "application/json", "x-real-ip": "203.0.113.9", ...headers },
  }));
  try {
    assert.equal((await ask(JSON.stringify({ brief: "noir" }), { Origin: "https://elsewhere.test" })).status, 403);
    assert.equal((await ask("x".repeat(3000), { "Content-Length": "3000" })).status, 413);
    assert.equal((await ask("{not json")).status, 400);
    const refused = await ask(JSON.stringify({ brief: "quarterly earnings report" }), { Origin: "https://walnut.test" });
    assert.equal(refused.status, 422);
    assert.match((await refused.json()).error, /don't know that vibe/);
    const ok = await ask(JSON.stringify({ brief: "moody noir" }), { Origin: "https://walnut.test" });
    assert.equal(ok.status, 200);
    assert.equal((await ok.json()).set.vibe, "noir");
  } finally {
    if (before !== undefined) process.env.GEMINI_API_KEY = before;
  }
});
