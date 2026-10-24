/* ═══════════════════════════════════════════════════
   FROM A VIBE · theme the page, then take it to your site
   ───────────────────────────────────────────────────
   A vibe card, or a set made from a description, is applied to <html> as
   walnut's own custom properties (docs/sets.mjs, varsOf) plus a
   data-texture attribute. Nothing else changes: the components on the page
   are stock walnut, reading the tokens they always read. That is also why
   the export is just those properties: the same file themes any page that
   loads walnut.css.

   A set travels in the address: ?vibe=noir for a card, ?look=… for a
   described set, the set itself as base64url JSON, checked again on the way
   in. The page's own script keeps ?p and ?s, so colours edited in the
   palette panel ride along on top.
═══════════════════════════════════════════════════ */

import { BODY, DISPLAY, LABEL, SET_VARS, BRIEF_MAX, BRIEF_MIN, VIBES, checkSet, cssOf, decodeLook, encodeLook, fileOf, findVibe, fontsHref, swatchesOf, varsOf, vibeSet } from "./sets.mjs";

const root = document.documentElement;
const $ = (id) => document.getElementById(id);
const walnut = window.walnut ?? {};
const HOUSE = "site-prairie";
const ROOMS = [...document.querySelectorAll(".site-drawer[data-room]")].map((d) => d.dataset.room);
// The colour half of a set.
const COLOUR = SET_VARS.filter((p) => /-(hue|chroma)$/.test(p));
// The ten a link's ?s carries, as the page's own script writes them: a
// set's pinned bloom and cool hues are not among them, so those stay the set's.
const LINKED = ["--wal-hue", "--wal-chroma", "--wal-accent-hue", "--wal-accent-chroma", "--wal-gold-hue", "--wal-gold-chroma",
  "--wal-olive-hue", "--wal-olive-chroma", "--wal-bloom-chroma", "--wal-cool-chroma"];
const CDN = "https://cdn.jsdelivr.net/gh/SKMinWoo/walnut.css@v0.4.0/dist/walnut.min.css";
const reduce = matchMedia("(prefers-reduced-motion: reduce)");
// The page's own live region. Emptied first, so the same words twice in a
// row are still a change.
const announce = (text) => {
  const el = $("announce");
  if (!el) return;
  el.textContent = "";
  requestAnimationFrame(() => { el.textContent = text; });
};

const cards = $("vibes");
const form = $("brief-form");
const panel = $("vibe-panel");
if (!cards || !form || !panel) throw new Error("vibes.mjs: the From a vibe tab is missing");
$("vibes-nojs")?.remove();

/* ── Fonts ──
   Every display face, asked of Google Fonts once, when the tab first comes
   near the screen. The stylesheet only names the faces; a face's file is
   fetched when something first uses it. */
const loaded = new Set();
function loadFonts(href) {
  if (!href || loaded.has(href)) return;
  loaded.add(href);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.append(link);
}
const allFaces = () => loadFonts(`https://fonts.googleapis.com/css2?${Object.values(DISPLAY)
  .flatMap((f) => (f.google ? [`family=${f.google}`] : [])).join("&")}&display=swap`);
new IntersectionObserver((entries, io) => {
  if (entries.some((e) => e.isIntersecting)) { allFaces(); io.disconnect(); }
}, { rootMargin: "400px" }).observe(cards);

/* ── The cards ──
   Each card is drawn in its own vibe: its display face, its corners and
   shadow, and its colours as walnut paints them in light and dark, so a
   card never needs redrawing when the mode changes. */
const both = (c) => `light-dark(${c.light}, ${c.dark})`;
for (const vibe of VIBES) {
  const set = vibeSet(vibe);
  const sw = swatchesOf(set);
  const b = document.createElement("button");
  b.type = "button";
  b.className = "site-vibe";
  b.dataset.vibe = vibe.vibe;
  b.setAttribute("aria-pressed", "false");
  // Named by the vibe, not by the mood line that sits above it.
  const id = `vibe-card-${vibe.vibe}`;
  b.setAttribute("aria-labelledby", `${id}-name`);
  b.setAttribute("aria-describedby", `${id}-mood ${id}-parts`);
  b.style.cssText = [
    `--vibe-ground: ${both(sw.ground)}`, `--vibe-accent: ${both(sw.accent)}`, `--vibe-bloom: ${both(sw.bloom)}`,
    `--vibe-gold: ${both(sw.gold)}`, `--vibe-cool: ${both(sw.cool)}`,
    `--vibe-font: ${DISPLAY[set.display].stack}`, `--vibe-radius: ${varsOf(set)["--wal-radius"]}`,
  ].join("; ");
  b.dataset.shadow = set.shadow;
  const name = document.createElement("span");
  name.className = "site-vibe-name";
  name.id = `${id}-name`;
  name.textContent = vibe.name;
  const mood = document.createElement("span");
  mood.className = "site-vibe-mood";
  mood.id = `${id}-mood`;
  mood.textContent = vibe.mood;
  const chips = document.createElement("span");
  chips.className = "site-vibe-chips";
  chips.setAttribute("aria-hidden", "true");
  for (const cue of ["accent", "bloom", "gold", "cool"]) chips.append(Object.assign(document.createElement("i"), { style: `--c: var(--vibe-${cue})` }));
  const parts = document.createElement("span");
  parts.className = "site-vibe-parts";
  parts.id = `${id}-parts`;
  parts.textContent = `${DISPLAY[set.display].name} · ${set.corners} · ${set.texture === "none" ? set.shadow + " shadow" : set.texture}`;
  b.append(mood, name, chips, parts);
  cards.append(b);
}

/* ── Applying ──
   Through walnut.recolour, so a set arrives the way any palette does: from
   the press, in the page's own style. The page's script hears the
   wal-recolour event and rewrites the address, keeping ?vibe and ?look. */
let current = null; // { set, note, by, trace }
// Set inside each change, which walnut.recolour follows at once with its
// wal-recolour event: so the flag names that event even when a second press
// overlaps the first's transition.
let ours = false;
// A set chosen but not yet written: walnut.recolour makes the change when
// the transition is ready, a frame or more after the press. Until then the
// page still wears the last set, and the export must not read it as an edit.
let pending = false;

function setParams(fn) {
  const q = new URLSearchParams(location.search);
  q.delete("vibe");
  q.delete("look");
  fn(q);
  const search = q.toString().replace(/%2C/g, ",");
  try { history.replaceState(history.state, "", location.pathname + (search ? "?" + search : "") + location.hash); } catch {}
}

function write(set, { keepColour = false } = {}) {
  const keep = (p) => keepColour && LINKED.includes(p);
  for (const p of SET_VARS) if (!keep(p)) root.style.removeProperty(p);
  for (const [p, v] of Object.entries(varsOf(set))) if (!keep(p)) root.style.setProperty(p, v);
  // The guard measured the set on walnut's stock lightness stops; Prairie's
  // are the closest the page has, and a shipped palette's may not be.
  root.classList.remove(...ROOMS);
  root.classList.add(HOUSE);
  root.dataset.texture = set.texture;
  if (set.vibe) root.dataset.vibe = set.vibe; else delete root.dataset.vibe;
}

function clear() {
  for (const p of SET_VARS) root.style.removeProperty(p);
  delete root.dataset.texture;
  delete root.dataset.vibe;
}

function apply(entry, from, opts = {}) {
  const first = panel.hidden;
  current = entry;
  pending = true;
  loadFonts(fontsHref(entry.set));
  setParams((q) => (entry.by === "card" ? q.set("vibe", entry.set.vibe) : q.set("look", encodeLook(entry.set, entry.note))));
  const change = () => {
    write(entry.set, opts);
    ours = true;
    // An older press finishing late leaves the newer one pending.
    if (current === entry) { pending = false; refreshExport(); }
  };
  show();
  if (!opts.instant) {
    const { pass, all } = checkSet(entry.set).score;
    announce(`${entry.set.name} applied. ${pass} of ${all} text pairs pass AA in light and dark.`);
    // The panel opens below the cards, often below the fold: bring its
    // heading and buttons up, once, without moving a reader who can see them.
    if (first) panel.querySelector(".site-actions").scrollIntoView({ block: "nearest", behavior: reduce.matches ? "auto" : "smooth" });
  }
  if (walnut.recolour && !opts.instant) walnut.recolour(root, change, { from });
  else { change(); root.dispatchEvent(new CustomEvent("wal-recolour", { bubbles: true })); }
}

function remove(from) {
  // Focus would fall to the page when the panel it sits in hides, so it
  // goes back to where the set came from: its card, or the box it was
  // described in.
  const back = current?.by === "card" ? cards.querySelector(`[data-vibe="${current.set.vibe}"]`) : $("brief");
  current = null;
  pending = false;
  setParams(() => {});
  const change = () => { clear(); ours = true; };
  if (walnut.recolour) walnut.recolour(root, change, { from });
  else { change(); root.dispatchEvent(new CustomEvent("wal-recolour", { bubbles: true })); }
  if (panel.contains(from)) back?.focus();
  show();
  announce("Vibe removed.");
}

/* A shipped palette or Reset clears every colour rod. That replaces the
   set's colours, so the set comes off whole, rather than leaving its type
   and corners on someone else's palette. A random palette writes rods:
   that is an edit, and the set stays, with the edit in its export. Only the
   rods count: Reset leaves a set's pinned bloom and cool hues, which no
   reader writes. */
root.addEventListener("wal-recolour", (e) => {
  if (e.target !== root) return;
  if (ours) { ours = false; return; }
  if (current && !LINKED.some((p) => root.style.getPropertyValue(p))) {
    current = null;
    clear();
    setParams(() => {});
  }
  show();
});

/* ── The export ──
   What a reader takes away is what is on screen: the set's own properties,
   with any colour they edited since in place of the set's. Read at the
   moment of copying or downloading, because a rod dragged by hand moves
   the page without announcing it. */
// How far a number may drift before it counts as an edit: the panel writes
// 25 where a set wrote 25.0, and chroma to three places.
const near = (p) => (p.endsWith("-chroma") ? 0.0005 : 0.05);
function liveVars(set) {
  const vars = varsOf(set);
  let edited = false;
  if (pending) return { vars, edited };
  for (const p of COLOUR) {
    const v = root.style.getPropertyValue(p).trim();
    if (!v) continue;
    if (!(p in vars) || Math.abs(parseFloat(v) - parseFloat(vars[p])) > near(p)) edited = true;
    vars[p] = v;
  }
  return { vars, edited };
}

function refreshExport() {
  if (!current) return;
  const { vars, edited } = liveVars(current.set);
  $("vibe-css").textContent = cssOf(current.set, vars);
  const file = fileOf(current.set);
  $("vibe-file").textContent = file;
  $("vibe-use").textContent = `<link rel="stylesheet" href="${CDN}">\n<link rel="stylesheet" href="/${file}">`;
  const score = checkSet(current.set).score;
  $("vibe-score").textContent = edited
    ? "You've edited its colours since it was applied, so the export has your colours. Your palette shows their contrast."
    : `${score.pass} of ${score.all} text pairs pass AA (4.5:1) in light and dark, measured before it was applied.`;
}

let saidDownloaded = 0;
function download(e) {
  refreshExport();
  const file = fileOf(current.set);
  const blob = new Blob([$("vibe-css").textContent + "\n"], { type: "text/css" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: file });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  // The browser may save without a word, so the button says it did, the
  // way the page's copy buttons say Copied.
  const b = e.currentTarget;
  b.textContent = "Downloaded";
  clearTimeout(saidDownloaded);
  saidDownloaded = setTimeout(() => { b.textContent = "Download CSS"; }, 1600);
  announce(`Downloaded ${file}.`);
}

// Before the page's own copy handler reads the box, in the capture phase.
document.addEventListener("click", (e) => {
  if (e.target.closest?.('[data-copy-from="vibe-css"], [data-copy-from="vibe-use"]')) refreshExport();
}, true);
$("palette-panel")?.addEventListener("close", refreshExport);

/* ── The panel ── */
const BY = { card: "Vibe", gemini: "Picked by Gemini", rules: "Matched by rules", link: "From a link" };
function show() {
  for (const b of cards.querySelectorAll(".site-vibe")) b.setAttribute("aria-pressed", String(current?.by === "card" && b.dataset.vibe === current.set.vibe));
  panel.hidden = !current;
  if (!current) return;
  const { set, note, by, trace } = current;
  $("vibe-name").textContent = set.name;
  $("vibe-by").textContent = BY[by];
  $("vibe-by").className = `wal-badge ${by === "gemini" ? "wal-badge-accent" : "wal-badge-olive"}`;
  // A card already shows its mood, so only a described set has a note.
  $("vibe-note").textContent = note ?? "";
  $("vibe-note").hidden = !note;
  // Say when the model was asked and could not deliver: the rules made it.
  const fell = trace?.find((t) => t.tool === "fallback");
  $("vibe-fallback").hidden = !fell;
  $("vibe-fallback").textContent = fell ? `Gemini couldn't make this one (${fell.detail}), so the rules matched it to a vibe instead.` : "";
  const list = $("vibe-trace");
  list.replaceChildren(...(trace ?? []).map((t) => {
    const li = document.createElement("li");
    if (t.refused) li.className = "is-refused";
    const tool = document.createElement("code");
    tool.textContent = t.tool;
    li.append(tool, ` ${t.detail}${t.ms ? ` · ${t.ms} ms` : ""}`);
    return li;
  }));
  $("vibe-trace-wrap").hidden = !trace?.length;
  $("vibe-parts").textContent = [`${DISPLAY[set.display].name} headings`, `${LABEL[set.label].name} labels`, `${BODY[set.body].name} text`,
    `${set.corners} corners`, `${set.shadow} shadow`, set.texture === "none" ? "no texture" : set.texture].join(" · ");
  refreshExport();
}

cards.addEventListener("click", (e) => {
  const b = e.target.closest(".site-vibe");
  if (!b) return;
  if (b.getAttribute("aria-pressed") === "true") return remove(b);
  apply({ set: vibeSet(findVibe(b.dataset.vibe)), by: "card" }, b);
});
$("vibe-off").addEventListener("click", (e) => remove(e.currentTarget));
$("vibe-download").addEventListener("click", download);

/* ── Describe a vibe ──
   The function answers whether Gemini or the rules will reply, so the hint
   never promises a model that is not configured. With no function at all
   (a static copy of this page), the form stands down and the cards still
   work. */
const input = $("brief");
const submit = form.querySelector("button[type=submit]");
const hint = $("brief-hint");
const status = $("brief-status");
input.maxLength = BRIEF_MAX;
// Asked once, when the form first comes near the screen, not on every load.
new IntersectionObserver((entries, io) => {
  if (!entries.some((e) => e.isIntersecting)) return;
  io.disconnect();
  fetch("/api/vibe", { headers: { Accept: "application/json" } })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then(({ by }) => {
      hint.textContent = by === "gemini"
        ? "Gemini picks from the same fonts, corners and colours as the vibes above. Code checks every pick, contrast included, before it is applied."
        : "No model is set up here, so rules match your words to a vibe and a colour.";
    })
    .catch(() => {
      hint.textContent = "Describing a vibe needs walnut's server, which this copy of the page doesn't have. The vibes above still work.";
      input.disabled = submit.disabled = true;
    });
}, { rootMargin: "400px" }).observe(form);

// Busy, not disabled: a disabled button drops the focus of the reader who
// pressed it.
let busy = false;
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (busy) return;
  const brief = input.value.trim();
  if (brief.length < BRIEF_MIN) { status.textContent = "Describe the vibe in a few words."; return; }
  busy = true;
  submit.setAttribute("aria-disabled", "true");
  form.setAttribute("aria-busy", "true");
  status.textContent = "Making a palette…";
  try {
    const res = await fetch("/api/vibe", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ brief }),
      // The server answers within its own deadline; this is for a network
      // that never does.
      signal: AbortSignal.timeout(25000),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error ?? "That one couldn't be made. Pick a vibe above.");
    // The answer is checked here too: the page applies nothing it has not measured.
    const checked = checkSet({ ...body.set, note: body.note });
    if (!checked.ok) throw new Error("The palette that came back doesn't pass its checks, so it wasn't applied.");
    status.textContent = "";
    apply({ set: checked.set, note: checked.note, by: body.by === "gemini" ? "gemini" : "rules", trace: Array.isArray(body.trace) ? body.trace : [] }, submit);
  } catch (err) {
    status.textContent = err?.name === "TimeoutError" ? "walnut's server took too long to answer. Try again, or pick a vibe above."
      : err instanceof Error && err.message !== "Failed to fetch" ? err.message : "walnut's server couldn't be reached. Pick a vibe above.";
  } finally {
    busy = false;
    submit.removeAttribute("aria-disabled");
    form.removeAttribute("aria-busy");
  }
});

/* ── From the address ──
   After the page's own script, which has already applied ?p and ?s. A link
   made with a set on always carries ?s, the set's colours or the reader's
   edits of them, so those stay: unedited, they are the set's own. */
{
  const q = new URLSearchParams(location.search);
  const keepColour = q.has("s");
  const vibe = findVibe(q.get("vibe") ?? "");
  const look = q.get("look") ? decodeLook(q.get("look")) : null;
  if (look?.ok) apply({ set: look.set, note: look.note, by: "link" }, null, { instant: true, keepColour });
  else if (vibe) apply({ set: vibeSet(vibe), by: "card" }, null, { instant: true, keepColour });
  else if (look) setParams(() => {}); // a link that does not check out is dropped, not applied
}
