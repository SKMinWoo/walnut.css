/*! walnut.css v0.4.0 · recolour | MIT License | github.com/SKMinWoo/walnut.css */
/* walnut.css · recolour
   ─────────────────────────────────────────────────────────────────────────
   How a new palette arrives. Pick a style once, for the whole site, and
   every palette change made through this script uses it:

       <html class="wal-forest" data-wal-recolour="swatch">
       <button data-wal-palette="wal-dusk">Dusk</button>

   swatch   The new palette opens out of the control that asked for it, in a
            soft-edged circle that grows until it covers the page. It is a
            view transition: the browser takes a picture of the page before
            and after, and the circle is a mask on the "after" picture, so
            nothing on the live page animates and every frame is the finished
            palette, readable throughout.
   retune   The default. walnut's own tween (.wal-retune): the rods travel and
            every colour re-derives on each frame.

   A button with data-wal-palette puts that palette class on the page, or on
   the element its aria-controls names (a section with .wal-palette, say),
   and keeps aria-pressed in step on every button that controls the same
   element. data-wal-palette="" takes the palette off again, back to the
   page's own :root script. From script:

       walnut.recolour(target, { palette: "wal-dusk" }, { from: button });
       walnut.recolour(target, { rods: { "--wal-accent-hue": "200" } });
       walnut.recolour(target, () => { anything at all }, { from: button });

   The third form is for a page that keeps its own state: whatever the
   function changes arrives in the page's style. After every change the
   target fires `wal-recolour` (it bubbles) from inside the change, so a
   listener's own updates land in the same "after" picture.

   Under reduced motion every style simply cuts. A browser without
   view-transition types gets retune in place of swatch, detected rather
   than assumed. Acts (walnut-acts.js) keep retuning: a circle needs a
   control at its centre, and an act arrives by scrolling.
   ───────────────────────────────────────────────────────────────────────── */
(() => {
  const walnut = (window.walnut ??= {});
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const typed = "ViewTransition" in window && "types" in ViewTransition.prototype;

  // Every number a palette can set: a hue and a chroma for the ground and
  // each cue, the lightness stops, and the shift and contrast numbers. A
  // change clears them all, so rods written for the old palette never ride
  // along into the new one.
  const CUES = ["", "accent-", "bloom-", "gold-", "olive-", "cool-"];
  const STOPS = ["bg", "subtle", "surface", "surface-2", "line", "line-soft", "line-input",
    "text", "text-soft", "text-muted", "accent", "bloom", "gold", "olive", "cool"];
  const RODS = [...CUES.flatMap((c) => [`--wal-${c}hue`, `--wal-${c}chroma`]),
    ...STOPS.flatMap((s) => [`--wal-l-${s}-light`, `--wal-l-${s}-dark`]),
    "--wal-hover-shift-light", "--wal-hover-shift-dark", "--wal-ink-shift-light", "--wal-ink-shift-dark",
    ...["ground", "surface", "line", "ink"].flatMap((c) => [`--wal-cx-${c}-light`, `--wal-cx-${c}-dark`])];
  const SHIPPED = ["wal-cafe", "wal-press", "wal-forest", "wal-dusk", "wal-bone"];

  // Every palette class a button can ask for, so the outgoing one comes off.
  // Read each time: buttons can arrive after this script.
  const buttons = () => [...document.querySelectorAll("[data-wal-palette]")];
  const palettes = () => new Set([...SHIPPED, ...buttons().map((b) => b.dataset.walPalette).filter(Boolean)]);
  const controls = (b) => document.getElementById(b.getAttribute("aria-controls")) ?? root;
  const written = (el) => RODS.some((p) => el.style.getPropertyValue(p));

  // A button is pressed while its palette, and nothing written over it, is
  // what its target wears.
  function sync(target) {
    const known = palettes();
    const worn = [...target.classList].find((c) => known.has(c)) ?? "";
    for (const b of buttons()) {
      if (controls(b) === target) b.setAttribute("aria-pressed", String(!written(target) && b.dataset.walPalette === worn));
    }
  }

  function apply(target, change) {
    if (typeof change === "function") change();
    else {
      const { palette, rods } = change;
      for (const p of RODS) target.style.removeProperty(p);
      target.classList.remove(...palettes());
      if (palette) target.classList.add(palette);
      for (const [p, v] of Object.entries(rods ?? {})) target.style.setProperty(p, v);
    }
    sync(target);
    target.dispatchEvent(new CustomEvent("wal-recolour", { bubbles: true }));
  }

  /* ── From the swatch ──
     The target carries the view-transition name wal-recolour while it
     changes, and the CSS keys on that name and the type. The circle's
     centre is the middle of whatever was pressed, relative to the target,
     and its radius reaches the target's furthest corner plus the soft edge.
     Those three numbers go on <html>, where the transition's pseudo-elements
     inherit from: written once per change and taken off after. */
  const FEATHER = 96; // px, the soft edge; 06-cinema.css draws the same
  let turn = 0;
  function swatch(target, change, from) {
    if (!typed) return retune(target, change);
    const box = target === root ? new DOMRect(0, 0, innerWidth, innerHeight) : target.getBoundingClientRect();
    const r = from?.getBoundingClientRect();
    const x = r ? r.left + r.width / 2 - box.left : box.width / 2;
    const y = r ? r.top + r.height / 2 - box.top : box.height / 2;
    const reach = Math.max(Math.hypot(x, y), Math.hypot(box.width - x, y),
      Math.hypot(x, box.height - y), Math.hypot(box.width - x, box.height - y));
    const mine = ++turn;
    root.style.setProperty("--wal-recolour-x", `${Math.round(x)}px`);
    root.style.setProperty("--wal-recolour-y", `${Math.round(y)}px`);
    root.style.setProperty("--wal-recolour-r", `${Math.ceil(reach + FEATHER)}px`);
    target.style.viewTransitionName = "wal-recolour";
    const t = document.startViewTransition({ update: () => apply(target, change), types: ["wal-recolour", "wal-swatch"] });
    // A second press before the first circle has started skips the first
    // transition. Its change is still made, so the skip is not an error.
    t.ready.catch(() => {});
    t.finished.finally(() => {
      if (turn !== mine) return;
      target.style.viewTransitionName = "";
      for (const p of ["x", "y", "r"]) root.style.removeProperty(`--wal-recolour-${p}`);
    });
  }

  function retune(target, change) {
    target.classList.add("wal-retune");
    apply(target, change);
  }

  // Your own: walnut.recolour.styles.mine = (target, change, from) => { … }
  // and data-wal-recolour="mine". Make the change with walnut.recolour.apply.
  const STYLES = { retune, swatch };

  walnut.recolour = (target = root, change = {}, { from, style } = {}) => {
    style ??= target.closest("[data-wal-recolour]")?.dataset.walRecolour ?? "retune";
    if (reduce.matches) return apply(target, change);
    (STYLES[style] ?? retune)(target, change, from);
  };
  walnut.recolour.styles = STYLES;
  walnut.recolour.apply = apply;

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-wal-palette]");
    if (!b) return;
    const target = controls(b);
    const palette = b.dataset.walPalette;
    const worn = palette ? target.classList.contains(palette) : ![...target.classList].some((c) => palettes().has(c));
    if (worn && !written(target)) return;
    walnut.recolour(target, { palette }, { from: b });
  });

  // Pressed from the start, for every target a button names.
  const start = () => new Set(buttons().map(controls)).forEach(sync);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
