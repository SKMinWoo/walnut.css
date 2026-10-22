/* ═══════════════════════════════════════════════════
   ERAS · a whole look from vetted parts
   ───────────────────────────────────────────────────
   A "set" is the whole look of a page as a handful of choices: walnut's hue
   rods for colour, three type roles, a corner, a shadow and a texture.
   Nothing in a set is free-form CSS, so whoever chose it — a reader, an era
   card, the rules director or the AI art director — the page can only be
   dressed in parts that were made to work together. walnut derives every
   tint, ink and hover from the rods.

   Shared, and pure: the docs page imports it to wear a set, and the art
   director's function (api/art-director.mjs) imports it to check what the
   model proposes. One file, so the browser and the server can never disagree
   about what a set is or whether it reads.
═══════════════════════════════════════════════════ */

/* ── The parts ──
   Roles are narrow on purpose. Display faces carry the era but only set
   headings; body text is always one of three proven reading faces; labels
   are the small voice, so nothing that only works large is offered there.
   `google` is the family as Google Fonts names it; null is a system face. */
export const DISPLAY = {
  jost: { name: "Jost", look: "geometric sans, Futura-like; mid-century modern", stack: '"Jost", Futura, system-ui, sans-serif', google: "Jost:wght@400..800" },
  poiret: { name: "Poiret One", look: "thin geometric Art Deco capitals", stack: '"Poiret One", system-ui, sans-serif', google: "Poiret+One" },
  playfair: { name: "Playfair Display", look: "high-contrast transitional serif; film noir title cards", stack: '"Playfair Display", Georgia, serif', google: "Playfair+Display:wght@400..900" },
  righteous: { name: "Righteous", look: "rounded 1960s display; mod and op-art posters", stack: '"Righteous", system-ui, sans-serif', google: "Righteous" },
  shrikhand: { name: "Shrikhand", look: "fat italic 1970s display; disco and diner signage", stack: '"Shrikhand", Georgia, serif', google: "Shrikhand" },
  vt323: { name: "VT323", look: "terminal pixel face; 1980s arcades and CRTs", stack: '"VT323", ui-monospace, monospace', google: "VT323" },
  times: { name: "Times New Roman", look: "the default serif of the 1990s web", stack: '"Times New Roman", Times, serif', google: null },
};
export const LABEL = {
  "dm-mono": { name: "DM Mono", look: "clean modern monospace", stack: '"DM Mono", ui-monospace, monospace', google: "DM+Mono:wght@400;500" },
  courier: { name: "Courier Prime", look: "typewriter", stack: '"Courier Prime", "Courier New", Courier, monospace', google: "Courier+Prime:wght@400;700" },
  verdana: { name: "Verdana", look: "1990s screen sans", stack: "Verdana, Geneva, sans-serif", google: null },
};
export const BODY = {
  inter: { name: "Inter", look: "neutral modern sans", stack: '"Inter", system-ui, sans-serif', google: "Inter:wght@400..700" },
  georgia: { name: "Georgia", look: "bookish screen serif", stack: 'Georgia, "Times New Roman", serif', google: null },
  verdana: { name: "Verdana", look: "wide 1990s screen sans", stack: "Verdana, Geneva, sans-serif", google: null },
};

/* walnut's three radii, small to large. Round is walnut's own. */
export const CORNERS = {
  square: ["0px", "0px", "0px"],
  soft: ["2px", "3px", "6px"],
  round: ["6px", "12px", "18px"],
  pill: ["12px", "22px", "28px"],
};
/* walnut's three shadows, small to large. Soft leaves walnut's own (and the
   finish's) in place, so it writes nothing. */
const ink = "color-mix(in oklch, var(--wal-text) 45%, transparent)";
const glow = "color-mix(in oklch, var(--wal-accent) 70%, transparent)";
export const SHADOWS = {
  none: ["none", "none", "none"],
  soft: null,
  hard: [`2px 2px 0 0 ${ink}`, `4px 4px 0 0 ${ink}`, `6px 6px 0 0 ${ink}`],
  glow: [`0 0 12px -4px ${glow}`, `0 0 28px -6px ${glow}`, `0 0 40px -8px ${glow}`],
};
export const TEXTURES = ["none", "grain", "halftone", "scanlines"];

/* Paint chips: hue names the director is shown, and the colour words the
   rules director understands. */
export const CHIPS = [
  { name: "Flamingo", hue: 350 }, { name: "Cherry", hue: 15 }, { name: "Tomato", hue: 31 },
  { name: "Tangerine", hue: 55 }, { name: "Mustard", hue: 85 }, { name: "Chartreuse", hue: 110 },
  { name: "Avocado", hue: 135 }, { name: "Jade", hue: 165 }, { name: "Teal", hue: 195 },
  { name: "Adriatic", hue: 240 }, { name: "Cobalt", hue: 265 }, { name: "Plum", hue: 315 },
];

/* ── The eras ──
   Hand-dressed sets, one card each. Mid-century is walnut's own default
   script and type. Every era must pass checkSet (test/sets.test.mjs).
   `tags` are the words the rules director matches a brief against. */
export const ERAS = [
  { era: "deco", name: "Art Deco", year: "'25",
    tags: ["deco", "art deco", "1920s", "20s", "gatsby", "jazz", "roaring", "speakeasy", "gold", "chrysler"],
    // A copper bloom: at the accent's +27° it is a teal that misses AA under white text.
    hues: { ground: 95, accent: 165, gold: 85, bloom: 45 },
    display: "poiret", label: "dm-mono", body: "inter", corners: "square", shadow: "hard", texture: "none" },
  { era: "noir", name: "Noir", year: "'47",
    tags: ["noir", "film noir", "1940s", "40s", "detective", "crime", "rain", "hardboiled", "mystery", "black and white"],
    hues: { ground: 250, accent: 15, gold: 60 },
    display: "playfair", label: "courier", body: "georgia", corners: "square", shadow: "soft", texture: "grain" },
  { era: "midcentury", name: "Mid-century", year: "'56",
    tags: ["mid-century", "midcentury", "1950s", "50s", "eames", "atomic", "diner", "modern"],
    hues: { ground: 55, accent: 25, gold: 85 },
    display: "jost", label: "dm-mono", body: "inter", corners: "round", shadow: "soft", texture: "none" },
  { era: "mod", name: "Mod", year: "'66",
    tags: ["mod", "1960s", "60s", "sixties", "op art", "psychedelic", "pop art", "swinging", "space age", "beatles"],
    hues: { ground: 300, accent: 340, gold: 55 },
    display: "righteous", label: "dm-mono", body: "inter", corners: "pill", shadow: "none", texture: "halftone" },
  { era: "disco", name: "Disco", year: "'77",
    tags: ["disco", "1970s", "70s", "seventies", "funk", "groovy", "roller", "boogie", "saturday night"],
    hues: { ground: 45, accent: 25, gold: 75 },
    display: "shrikhand", label: "dm-mono", body: "inter", corners: "round", shadow: "glow", texture: "none" },
  { era: "arcade", name: "Arcade", year: "'84",
    tags: ["arcade", "1980s", "80s", "eighties", "neon", "synthwave", "retro game", "8-bit", "pixel", "crt", "vhs"],
    hues: { ground: 285, accent: 320, gold: 95, cool: 195 },
    display: "vt323", label: "dm-mono", body: "inter", corners: "square", shadow: "glow", texture: "scanlines" },
  { era: "web", name: "Web", year: "'97",
    tags: ["web 1.0", "1990s", "90s", "nineties", "geocities", "netscape", "dial-up", "early internet", "windows 95"],
    hues: { ground: 230, accent: 255, gold: 60 },
    display: "times", label: "verdana", body: "verdana", corners: "square", shadow: "hard", texture: "none" },
];

export const findEra = (id) => ERAS.find((e) => e.era === id);
/** An era as a set to wear: named with its year, without the card's bookkeeping. */
export const eraSet = ({ tags, year, ...set }) => ({ ...set, name: `${set.name} ${year}` });

/* ── walnut's stock ramp ──
   Mirrored from src/layers/01-tokens.css so the server can measure a set
   without a browser. test/sets.test.mjs reads the stylesheet and fails if
   any of these drift from it. */
export const RAMP = {
  light: { bg: 0.93, surface: 0.97, text: 0.2, "text-muted": 0.49, accent: 0.52, bloom: 0.54, gold: 0.6, olive: 0.48, cool: 0.46,
    "ink-shift": -0.12, "cx-ground": 0.65, "cx-surface": 0.4, "cx-ink": 0.85 },
  dark: { bg: 0.16, surface: 0.22, text: 0.92, "text-muted": 0.64, accent: 0.62, bloom: 0.7, gold: 0.75, olive: 0.6, cool: 0.62,
    "ink-shift": 0.08, "cx-ground": 1, "cx-surface": 1.15, "cx-ink": 0.45 },
};
/** Each cue's chroma at most, walnut's stock value; less where the gamut is narrower. */
export const CAP = { accent: 0.17, bloom: 0.12, gold: 0.15, olive: 0.1, cool: 0.11 };
/** Where walnut puts bloom and cool when a set leaves them to the accent. */
export const OFFSET = { bloom: 27, cool: 209 };
export const GROUND_CHROMA = 0.04;
const STOCK_OLIVE = 130;
const CUES = ["accent", "bloom", "gold", "olive", "cool"];
const MODES = ["light", "dark"];

/* ── Colour maths: oklch → sRGB, gamut, WCAG contrast ──
   The same maths as the page's own palette tools. */
export const deg = (h) => ((h % 360) + 360) % 360;
const toLinear = (L, C, h) => {
  const a = C * Math.cos((h * Math.PI) / 180), b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
};
const inGamut = (L, C, h) => toLinear(L, C, h).every((v) => v >= -1e-4 && v <= 1 + 1e-4);
const enc = (x) => { x = Math.min(1, Math.max(0, x)); return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055; };
const dec = (x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
export const srgb = (L, C, h) => toLinear(L, C, h).map(enc);
const lum = (c) => { const [r, g, b] = c.map(dec); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (x, y) => { const a = lum(x), b = lum(y); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); };
const over = (fg, alpha, bg) => fg.map((v, i) => v * alpha + bg[i] * (1 - alpha));
export const hex = (c) => "#" + c.map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("");

/** The largest chroma at this hue that fits sRGB at every lightness walnut paints the cue: fill and ink, light and dark. */
export function fitChroma(cue, hue) {
  const ls = MODES.flatMap((m) => [RAMP[m][cue], RAMP[m][cue] + RAMP[m]["ink-shift"]]);
  let lo = 0, hi = CAP[cue];
  if (ls.every((L) => inGamut(L, hi, hue))) return hi;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (ls.every((L) => inGamut(L, mid, hue))) lo = mid; else hi = mid;
  }
  return Math.floor(lo * 1000) / 1000;
}

/** Every rod a set paints with: hues resolved, chromas fitted. */
export function rodsOf(set) {
  const h = set.hues;
  const hue = { accent: deg(h.accent), gold: deg(h.gold), olive: deg(h.olive ?? STOCK_OLIVE),
    bloom: deg(h.bloom ?? h.accent + OFFSET.bloom), cool: deg(h.cool ?? h.accent + OFFSET.cool) };
  const chroma = Object.fromEntries(CUES.map((c) => [c, fitChroma(c, hue[c])]));
  return { ground: deg(h.ground), groundChroma: GROUND_CHROMA, hue, chroma };
}

/* ── Measuring ──
   Every text pair the page's palette tools count, in both modes: text and
   muted text on the ground, and each colour as text on the page, on a
   surface and on its own wash, and text on the colour itself. */
const LABELS = { text: "body text", muted: "muted text", ink: "text on the page", surface: "text on a card", fg: "text on a fill", wash: "text on its wash" };
export function measure(set, aa = 4.5) {
  const r = rodsOf(set);
  const list = [];
  for (const m of MODES) {
    const k = RAMP[m];
    const ground = (L, cx) => srgb(L, r.groundChroma * cx, r.ground);
    const bg = ground(k.bg, k["cx-ground"]), surface = ground(k.surface, k["cx-surface"]);
    list.push({ mode: m, cue: "ground", pair: "text", ratio: ratio(ground(k.text, k["cx-ink"]), bg) },
      { mode: m, cue: "ground", pair: "muted", ratio: ratio(ground(k["text-muted"], k["cx-ink"] * (m === "dark" ? 1.4 : 1)), bg) });
    for (const cue of CUES) {
      const L = k[cue], C = r.chroma[cue], h = r.hue[cue];
      const fill = srgb(L, C, h), inkC = srgb(L + k["ink-shift"], C, h);
      list.push({ mode: m, cue, pair: "ink", ratio: ratio(inkC, bg) },
        { mode: m, cue, pair: "surface", ratio: ratio(inkC, surface) },
        { mode: m, cue, pair: "fg", ratio: ratio(srgb(L < 0.57 ? 0.97 : 0.16, C * 0.08, h), fill) },
        { mode: m, cue, pair: "wash", ratio: ratio(inkC, over(fill, cue === "gold" ? 0.15 : 0.12, bg)) });
    }
  }
  const fails = list.filter((p) => p.ratio < aa);
  return { list, fails, pass: list.length - fails.length, all: list.length };
}

/* ── The guard ──
   What any director — a reader's link, the rules or the model — must satisfy
   before a set is worn or shown. Enforced in code, after the fact: the
   model's prompt asks for the same things, but a prompt is a request, not a
   control.

     1. Shape: every part is one of the vetted ids, the hues are numbers, and
        the name and note are plain words — no markup, no links.
     2. Legibility: every text pair passes AA in light AND dark.
     3. Decency: the name and note are shown to whoever opens the link, so
        neither may contain a word from the blocklist. */
const PLAIN = /^[\p{L}\p{N} '’&.,:;!?()\-–—·]+$/u;
export const NAME_MAX = 40;
export const NOTE_MAX = 160;
const HUES = ["ground", "accent", "gold", "olive", "cool", "bloom"];
const REQUIRED_HUES = ["ground", "accent", "gold"];
const KEYS = ["name", "era", "hues", "display", "label", "body", "corners", "shadow", "texture"];

/* Deliberately short: the name and note come from a model or a template, so
   this is a backstop, not a moderation system. Whole words for the short ones
   (so "Cocktail Hour" survives), stems only where a stem has no innocent use. */
const BLOCKED_WORDS = new Set(["shit", "dick", "cock", "rape", "nazi", "nazis", "hitler", "kkk", "retard", "retarded"]);
const BLOCKED_STEMS = ["fuck", "cunt", "bitch", "whore", "slut", "porn", "wank", "twat", "pussy", "nigg", "fagg"];
export function hasBlockedWord(text) {
  const words = text.toLowerCase().split(/[^a-z]+/).filter(Boolean);
  return words.some((w) => BLOCKED_WORDS.has(w) || BLOCKED_STEMS.some((s) => w.includes(s)));
}

const plain = (v, max, what, problems) => {
  if (typeof v !== "string" || !v.trim()) { problems.push(`${what}: required`); return null; }
  const t = v.trim();
  if (t.length > max) problems.push(`${what}: at most ${max} characters`);
  else if (!PLAIN.test(t)) problems.push(`${what}: letters, numbers and simple punctuation only`);
  else if (hasBlockedWord(t)) problems.push(`${what}: wording not allowed`);
  return t;
};

/**
 * Check a set from untrusted input: a tool call's arguments, or a shared
 * link. Returns the set rebuilt from known keys only, or the problems, worded
 * so the model can fix them.
 */
export function checkSet(args) {
  const problems = [];
  if (!args || typeof args !== "object") return { ok: false, problems: ["set: expected an object"] };
  const { note: rawNote, ...rest } = args;
  for (const k of Object.keys(rest)) if (!KEYS.includes(k)) problems.push(`${k}: not a part of a set`);
  const name = plain(rest.name, NAME_MAX, "name", problems);
  const note = rawNote === undefined ? undefined : plain(rawNote, NOTE_MAX, "note", problems);
  const era = rest.era === undefined ? undefined : findEra(rest.era)?.era;
  if (rest.era !== undefined && !era) problems.push("era: not one of the eras");

  const hues = {};
  const given = rest.hues && typeof rest.hues === "object" ? rest.hues : {};
  for (const k of Object.keys(given)) if (!HUES.includes(k)) problems.push(`hues.${k}: not a hue rod`);
  for (const k of HUES) {
    const v = given[k];
    if (v === undefined || v === null) { if (REQUIRED_HUES.includes(k)) problems.push(`hues.${k}: required`); continue; }
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 360) problems.push(`hues.${k}: a number from 0 to 360`);
    else hues[k] = Math.round(v * 10) / 10;
  }
  const pick = (k, table) => {
    if (!Object.hasOwn(table, rest[k])) problems.push(`${k}: one of ${Object.keys(table).join(", ")}`);
    return rest[k];
  };
  const set = {
    name, ...(era ? { era } : {}), hues,
    display: pick("display", DISPLAY), label: pick("label", LABEL), body: pick("body", BODY),
    corners: pick("corners", CORNERS), shadow: pick("shadow", SHADOWS),
    texture: TEXTURES.includes(rest.texture) ? rest.texture : (problems.push(`texture: one of ${TEXTURES.join(", ")}`), null),
  };
  if (problems.length) return { ok: false, problems };

  const score = measure(set);
  for (const f of score.fails.slice(0, 4)) {
    problems.push(`contrast: ${f.cue === "ground" ? "" : f.cue + " "}${LABELS[f.pair]} ${f.ratio.toFixed(2)}:1 in ${f.mode} (needs 4.5)`);
  }
  if (score.fails.length > 4) problems.push(`contrast: ${score.fails.length - 4} more pairs fail`);
  return problems.length ? { ok: false, problems } : { ok: true, set, note, score };
}

/* ── Wearing a set ──
   What a set writes: custom properties for the rods, the type, the corners
   and the shadow, and the texture as an attribute. */
export function varsOf(set) {
  const r = rodsOf(set);
  const v = { "--wal-hue": r.ground.toFixed(1), "--wal-chroma": r.groundChroma.toFixed(3) };
  for (const c of CUES) {
    // Bloom and cool follow the accent unless the set pins them.
    if (c === "accent" || c === "gold" || c === "olive" || set.hues[c] !== undefined) v[`--wal-${c}-hue`] = r.hue[c].toFixed(1);
    v[`--wal-${c}-chroma`] = r.chroma[c].toFixed(3);
  }
  v["--wal-font-display"] = DISPLAY[set.display].stack;
  v["--wal-font-label"] = LABEL[set.label].stack;
  v["--wal-font-body"] = BODY[set.body].stack;
  [v["--wal-radius-sm"], v["--wal-radius"], v["--wal-radius-lg"]] = CORNERS[set.corners];
  if (SHADOWS[set.shadow]) [v["--wal-shadow-sm"], v["--wal-shadow"], v["--wal-shadow-lg"]] = SHADOWS[set.shadow];
  return v;
}
/** Every property varsOf can write: what taking a set off removes. */
export const SET_VARS = Object.keys(varsOf({ ...eraSet(ERAS[0]), hues: { ground: 0, accent: 0, gold: 0, bloom: 0, cool: 0 }, shadow: "hard" }));

/** The Google Fonts stylesheet a set needs, or null when it uses only system faces. */
export function fontsHref(set) {
  const families = [...new Set([DISPLAY[set.display].google, LABEL[set.label].google, BODY[set.body].google].filter(Boolean))];
  return families.length ? `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join("&")}&display=swap` : null;
}

/* A texture is one overlay on the whole page, screen only, never in the way
   of a click. On body::before, because walnut's warm wash is body::after.
   The docs page carries the same rules in its own stylesheet. */
export const TEXTURE_CSS = {
  grain: `background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");\n    opacity: .16; mix-blend-mode: overlay;`,
  halftone: "background-image: radial-gradient(circle, color-mix(in oklch, var(--wal-text) 24%, transparent) 1px, transparent 1.7px);\n    background-size: 7px 7px; opacity: .45;",
  scanlines: "background-image: repeating-linear-gradient(to bottom, rgb(0 0 0 / .22) 0 1px, transparent 1px 3px);",
};

/** What a card shows: the ground and each cue as sRGB hex, light and dark, as walnut would paint them. */
export function swatchesOf(set) {
  const r = rodsOf(set);
  const out = {};
  for (const m of MODES) {
    const k = RAMP[m];
    (out.ground ??= {})[m] = hex(srgb(k.bg, r.groundChroma * k["cx-ground"], r.ground));
    for (const c of CUES) (out[c] ??= {})[m] = hex(srgb(k[c], r.chroma[c], r.hue[c]));
  }
  return out;
}

/** The set as CSS to paste after walnut.css. */
export function cssOf(set) {
  const href = fontsHref(set);
  const vars = varsOf(set);
  const width = Math.max(...Object.keys(vars).map((k) => k.length)) + 2;
  const lines = Object.entries(vars).map(([k, v]) => `  ${k}:${" ".repeat(width - k.length)}${v};`);
  const out = [];
  if (href) out.push(`@import url("${href}");`, "");
  out.push(`/* ${set.name} */`, ":root {", ...lines, "}");
  if (set.texture !== "none") {
    out.push("", "@media screen {", "  body::before {", '    content: ""; position: fixed; inset: 0; z-index: 300; pointer-events: none;',
      `    ${TEXTURE_CSS[set.texture]}`, "  }", "}");
  }
  return out.join("\n");
}

/* ── Links ──
   A set travels in the address as base64url JSON, so a directed set can be
   shared with no database. Whatever comes back in is untrusted and goes
   through checkSet like anything else. */
const toB64 = (s) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64 = (s) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0)));
export const encodeLook = (set, note) => toB64(JSON.stringify(note ? { ...set, note } : set));
export function decodeLook(text) {
  if (typeof text !== "string" || text.length > 1200 || !/^[\w-]+$/.test(text)) return { ok: false, problems: ["link: not a set"] };
  try { return checkSet(JSON.parse(fromB64(text))); } catch { return { ok: false, problems: ["link: not a set"] }; }
}

/* ── Briefs ── */
export const BRIEF_MIN = 3;
export const BRIEF_MAX = 120;
/** A brief as a director sees it: one line, no control characters or angle brackets, capped. Null when too short. */
export function cleanBrief(raw) {
  if (typeof raw !== "string") return null;
  const brief = raw.replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, BRIEF_MAX);
  return brief.length >= BRIEF_MIN ? brief : null;
}

/* ── The rules director ──
   What dresses a brief with no model: find the era it names, find the colour
   it asks for, and dress the set from the era cards. Same brief in, same set
   out, every time. */
const COLOUR_WORDS = {
  red: 15, crimson: 15, cherry: 15, scarlet: 20, tomato: 31, orange: 55, tangerine: 55, amber: 70,
  yellow: 85, mustard: 85, gold: 85, lime: 110, chartreuse: 110, green: 135, avocado: 135, olive: 120,
  emerald: 150, jade: 165, mint: 165, teal: 195, turquoise: 195, cyan: 195, aqua: 195, blue: 240,
  navy: 250, cobalt: 265, indigo: 275, violet: 290, purple: 300, lavender: 300, plum: 315,
  magenta: 330, pink: 350, flamingo: 350, rose: 355,
};
// FNV-1a: a stable choice when a brief names no era at all.
const hash = (text) => { let h = 0x811c9dc5; for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 0x01000193) >>> 0; return h; };
const title = (w) => w.charAt(0).toUpperCase() + w.slice(1);
// Whole word or phrase, so "mod" does not fire inside "modern".
const mentions = (text, phrase) => new RegExp(`(^|[^a-z0-9])${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`).test(text);

export function rulesDirector(brief) {
  const text = brief.toLowerCase();
  // The era whose tags the brief mentions most; longer tags count for more,
  // so "art deco" outweighs a stray "gold".
  let best = null;
  for (const era of ERAS) {
    const score = era.tags.filter((t) => mentions(text, t)).reduce((n, t) => n + t.length, 0);
    if (score > 0 && (!best || score > best.score)) best = { era, score };
  }
  const era = best?.era ?? ERAS[hash(text) % ERAS.length];
  const base = eraSet(era);
  const word = Object.keys(COLOUR_WORDS).find((w) => mentions(text, w));
  const tinted = word && { ...base, name: `${title(word)} ${era.name}`, hues: { ...base.hues, accent: COLOUR_WORDS[word] } };
  // A colour word only counts if the era still reads with it.
  const set = tinted && measure(tinted).fails.length === 0 ? tinted : base;
  const chip = set === tinted ? (CHIPS.find((c) => c.hue === COLOUR_WORDS[word])?.name ?? title(word)).toLowerCase() : null;
  const why = best ? `The ${era.name} ${era.year} set, from the era cards` : `The brief names no era this director knows, so the ${era.name} ${era.year} set stands in`;
  return { set, note: `${why}${chip ? `, with a ${chip} accent` : ""}.` };
}
