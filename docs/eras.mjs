/* ═══════════════════════════════════════════════════
   THE ERAS TAB · wear a whole look on this page
   ───────────────────────────────────────────────────
   An era card, or a set the art director dressed from a brief, is worn on
   <html> as walnut's own custom properties (docs/sets.mjs, varsOf) plus a
   data-texture attribute. Nothing else changes: the components on the page
   are stock walnut, reading the tokens they always read.

   A set travels in the address: ?era=noir for a card, ?look=… for a
   directed set, the set itself as base64url JSON, checked again on the way
   in. The page's own script keeps ?p and ?s, so colours retouched in the
   palette panel ride along on top.
═══════════════════════════════════════════════════ */

import { BODY, DISPLAY, ERAS, LABEL, SET_VARS, BRIEF_MAX, checkSet, cssOf, decodeLook, encodeLook, eraSet, findEra, fontsHref, swatchesOf, varsOf } from "./sets.mjs";

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

const cards = $("eras");
const form = $("brief-form");
const worn = $("worn");
if (!cards || !form || !worn) throw new Error("eras.mjs: the Eras tab is missing");
$("eras-nojs")?.remove();

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
   Each card is drawn in its own era: its display face, its corners and
   shadow, and its colours as walnut paints them in light and dark, so a
   card never needs redrawing when the mode changes. */
const both = (c) => `light-dark(${c.light}, ${c.dark})`;
for (const era of ERAS) {
  const set = eraSet(era);
  const sw = swatchesOf(set);
  const b = document.createElement("button");
  b.type = "button";
  b.className = "site-era";
  b.dataset.era = era.era;
  b.setAttribute("aria-pressed", "false");
  b.style.cssText = [
    `--era-ground: ${both(sw.ground)}`, `--era-accent: ${both(sw.accent)}`, `--era-bloom: ${both(sw.bloom)}`,
    `--era-gold: ${both(sw.gold)}`, `--era-cool: ${both(sw.cool)}`,
    `--era-font: ${DISPLAY[set.display].stack}`, `--era-radius: ${varsOf(set)["--wal-radius"]}`,
  ].join("; ");
  b.dataset.shadow = set.shadow;
  const name = document.createElement("span");
  name.className = "site-era-name";
  name.textContent = era.name;
  const year = document.createElement("span");
  year.className = "site-era-year";
  year.textContent = era.year;
  const chips = document.createElement("span");
  chips.className = "site-era-chips";
  chips.setAttribute("aria-hidden", "true");
  for (const cue of ["accent", "bloom", "gold", "cool"]) chips.append(Object.assign(document.createElement("i"), { style: `--c: var(--era-${cue})` }));
  const parts = document.createElement("span");
  parts.className = "site-era-parts";
  parts.textContent = `${DISPLAY[set.display].name} · ${set.corners} · ${set.texture === "none" ? set.shadow + " shadow" : set.texture}`;
  b.append(year, name, chips, parts);
  cards.append(b);
}

/* ── Wearing ──
   Through walnut.recolour, so a set arrives the way any palette does: from
   the press, in the page's own style. The page's script hears the
   wal-recolour event and rewrites the address, keeping ?era and ?look. */
let current = null; // { set, note, by, trace }
// Set inside each change, which walnut.recolour follows at once with its
// wal-recolour event: so the flag names that event even when a second press
// overlaps the first's transition.
let ours = false;

function setParams(fn) {
  const q = new URLSearchParams(location.search);
  q.delete("era");
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
  if (set.era) root.dataset.era = set.era; else delete root.dataset.era;
}

function clear() {
  for (const p of SET_VARS) root.style.removeProperty(p);
  delete root.dataset.texture;
  delete root.dataset.era;
}

function wear(entry, from, opts = {}) {
  current = entry;
  loadFonts(fontsHref(entry.set));
  setParams((q) => (entry.by === "card" ? q.set("era", entry.set.era) : q.set("look", encodeLook(entry.set, entry.note))));
  const change = () => { write(entry.set, opts); ours = true; };
  if (walnut.recolour && !opts.instant) walnut.recolour(root, change, { from });
  else { change(); root.dispatchEvent(new CustomEvent("wal-recolour", { bubbles: true })); }
  show();
}

function takeOff(from) {
  current = null;
  setParams(() => {});
  const change = () => { clear(); ours = true; };
  if (walnut.recolour) walnut.recolour(root, change, { from });
  else { change(); root.dispatchEvent(new CustomEvent("wal-recolour", { bubbles: true })); }
  show();
}

/* A shipped palette or Reset clears every colour rod. That replaces the
   set's colours, so the set comes off whole, rather than leaving its type
   and corners on someone else's palette. A random palette writes rods:
   that is a retouch, and the set stays. */
root.addEventListener("wal-recolour", (e) => {
  if (e.target !== root) return;
  if (ours) { ours = false; return; }
  if (current && !COLOUR.some((p) => root.style.getPropertyValue(p))) {
    current = null;
    clear();
    setParams(() => {});
    show();
  }
});

/* ── The worn panel ── */
const BY = { card: "Era card", gemini: "Gemini art director", rules: "Rules director", link: "From a link" };
function show() {
  for (const b of cards.querySelectorAll(".site-era")) b.setAttribute("aria-pressed", String(current?.by === "card" && b.dataset.era === current.set.era));
  worn.hidden = !current;
  if (!current) return;
  const { set, note, by, trace } = current;
  $("worn-name").textContent = set.name;
  $("worn-by").textContent = BY[by];
  $("worn-by").className = `wal-badge ${by === "gemini" ? "wal-badge-accent" : "wal-badge-olive"}`;
  $("worn-note").textContent = note ?? "";
  $("worn-note").hidden = !note;
  // Say when the model was asked and could not deliver: the rules dressed it.
  const fell = trace?.find((t) => t.tool === "fallback");
  $("worn-fallback").hidden = !fell;
  $("worn-fallback").textContent = fell ? `The model could not dress this one (${fell.detail}), so the rules director did, from the era cards.` : "";
  const score = checkSet(set).score;
  $("worn-score").textContent = `${score.pass} of ${score.all} text pairs pass AA (4.5:1) in light and dark, measured before it was worn.`;
  $("worn-css").textContent = cssOf(set);
  const list = $("worn-trace");
  list.replaceChildren(...(trace ?? []).map((t) => {
    const li = document.createElement("li");
    if (t.refused) li.className = "is-refused";
    const tool = document.createElement("code");
    tool.textContent = t.tool;
    li.append(tool, ` ${t.detail}${t.ms ? ` · ${t.ms} ms` : ""}`);
    return li;
  }));
  $("worn-trace-wrap").hidden = !trace?.length;
  $("worn-parts").textContent = [`${DISPLAY[set.display].name} headings`, `${LABEL[set.label].name} labels`, `${BODY[set.body].name} text`,
    `${set.corners} corners`, `${set.shadow} shadow`, set.texture === "none" ? "no texture" : set.texture].join(" · ");
}

cards.addEventListener("click", (e) => {
  const b = e.target.closest(".site-era");
  if (!b) return;
  if (b.getAttribute("aria-pressed") === "true") return takeOff(b);
  wear({ set: eraSet(findEra(b.dataset.era)), by: "card" }, b);
});
$("worn-off").addEventListener("click", (e) => takeOff(e.currentTarget));

/* ── The art director ──
   The function answers which director is on set, so the hint never
   promises a model that is not configured. With no function at all (a
   static copy of this page), the form stands down and the cards still work. */
const input = $("brief");
const submit = form.querySelector("button[type=submit]");
const hint = $("brief-hint");
const status = $("brief-status");
input.maxLength = BRIEF_MAX;
fetch("/api/art-director", { headers: { Accept: "application/json" } })
  .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
  .then(({ director }) => {
    hint.textContent = director === "gemini"
      ? "A Gemini agent picks from the same parts as the cards. Code checks every pick, contrast included, before it is worn."
      : "No model is configured here, so the rules director matches your words to an era card and a colour.";
  })
  .catch(() => {
    hint.textContent = "The art director is not on this copy of the page. The era cards still work.";
    input.disabled = submit.disabled = true;
  });

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const brief = input.value.trim();
  if (brief.length < 3) { status.textContent = "Give the art director a few words to go on."; return; }
  submit.disabled = true;
  form.setAttribute("aria-busy", "true");
  status.textContent = "Dressing the page…";
  try {
    const res = await fetch("/api/art-director", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ brief }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error ?? "The art director could not dress that one.");
    // The answer is checked here too: the page wears nothing it has not measured.
    const checked = checkSet({ ...body.set, note: body.note });
    if (!checked.ok) throw new Error("The art director sent back a set that does not pass its checks.");
    status.textContent = "";
    wear({ set: checked.set, note: checked.note, by: body.director === "gemini" ? "gemini" : "rules", trace: Array.isArray(body.trace) ? body.trace : [] }, submit);
  } catch (err) {
    status.textContent = err instanceof Error && err.message !== "Failed to fetch" ? err.message : "The art director could not be reached. Try an era card.";
  } finally {
    submit.disabled = false;
    form.removeAttribute("aria-busy");
  }
});

/* ── From the address ──
   After the page's own script, which has already applied ?p and ?s: when
   ?s is there the reader retouched the set's colours, so those stay. */
{
  const q = new URLSearchParams(location.search);
  const keepColour = q.has("s");
  const era = findEra(q.get("era") ?? "");
  const look = q.get("look") ? decodeLook(q.get("look")) : null;
  if (look?.ok) wear({ set: look.set, note: look.note, by: "link" }, null, { instant: true, keepColour });
  else if (era) wear({ set: eraSet(era), by: "card" }, null, { instant: true, keepColour });
  else if (look) setParams(() => {}); // a link that does not check out is dropped, not worn
}
