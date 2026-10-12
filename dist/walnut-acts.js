/*! walnut.css v0.4.0 · acts | MIT License | github.com/SKMinWoo/walnut.css */
/* walnut.css · acts
   ─────────────────────────────────────────────────────────────────────────
   A film's colour script changes from act to act. This lets a page's do
   the same: mark sections as acts, and as each one reaches the middle of the
   window the whole page — masthead, desk, every paper — retunes to its
   script, the way .wal-retune retunes it to a palette.

       <section data-act="wal-dusk">…</section>            a palette, by class
       <section data-act style="--wal-accent-hue: 200">…   or rods of its own

   An act lasts until the next one begins. Above the first, the page has the
   script it was loaded with.

   Acts can also play inside something that scrolls on its own, such as a
   full-screen .wal-window. Mark the scroller data-wal-acts and give it
   .wal-palette: the acts inside it retune the scroller, not the page, as
   they reach the middle of it.

       <dialog class="wal-window wal-palette wal-cafe" data-wal-acts>
         <section data-act="wal-cafe">…</section>
         <section data-act="wal-dusk">…</section>
       </dialog>

   CSS cannot do this on its own: nothing lets a section hand its palette to
   <html>. So this is a script, and an optional one — without it the acts are
   ordinary sections and the page keeps one script throughout.

   Acts change the script, never the mode. Palettes that force a mode — Press
   and Bone are light-first — will flip a dark page to light when their act
   arrives; give the page a data-theme, or cast palettes that agree.

   Cheap on purpose: an IntersectionObserver wakes it only when an act's edge
   crosses the cue line, so scrolling through an act does no work at all. The
   retune itself is the ordinary one — the rods tween for
   --wal-retune-duration, and under reduced motion they cut.
   ───────────────────────────────────────────────────────────────────────── */
(() => {
  const all = [...document.querySelectorAll("[data-act]")];
  if (!all.length) return;

  /* Where on the window an act takes the page, as a fraction of its height
     from the top: 0.5 is the middle. */
  const CUE = 0.5;

  /**
   * Which act owns the page right now.
   *
   * @param {Element[]} acts  every act on the page, in document order
   * @param {number} line     the cue line, in px from the top of the window
   * @returns {Element|null}  the act in charge, or null for the page's own
   *                          script (the line is above the first act)
   */
  function actAt(acts, line) {
    // TODO(you): decide when an act takes the page. Until then: the last
    // act whose top edge has reached the cue line.
    let owner = null;
    for (const act of acts) if (act.getBoundingClientRect().top <= line) owner = act;
    return owner;
  }

  // What each act writes on its stage: a palette class, and any rods it states.
  const classOf = (act) => act.dataset.act || null;
  const rodsOf = (el) => [...el.style].filter((p) => p.startsWith("--wal-")).map((p) => [p, el.style.getPropertyValue(p)]);

  /* Every palette class an act might have to take off its stage: the ones
     the acts name, and walnut's own. Two palette classes on one element are
     settled by stylesheet order, not by intent, so the stage's opening
     palette has to come off while an act holds it. A palette class of your
     own that no act names cannot be recognised — cast it as the first act
     instead of putting it on the stage. */
  const palettes = new Set(["wal-cafe", "wal-press", "wal-forest", "wal-dusk", "wal-bone",
    ...all.map(classOf).filter(Boolean)]);

  // The page is one stage, and every data-wal-acts scroller is another.
  const stages = new Map();
  for (const act of all) {
    const box = act.parentElement.closest("[data-wal-acts]");
    if (!stages.has(box)) stages.set(box, []);
    stages.get(box).push(act);
  }

  for (const [box, acts] of stages) play(box, acts);

  function play(box, acts) {
    const stage = box ?? document.documentElement;

    // The stage's own script, to come back to above the first act. Its rods
    // count as written, so the first act clears them like any other's.
    const opening = {
      classes: [...stage.classList].filter((c) => palettes.has(c)),
      rods: rodsOf(stage),
    };
    let current, written = opening.rods;

    function cast(act, tween) {
      if (act === current) return;
      current = act;
      // A scroller's tween comes off for a cut. The page's stays, as it
      // always has, for retunes of its own.
      if (tween) stage.classList.add("wal-retune");
      else if (box) stage.classList.remove("wal-retune");
      // The outgoing act's rods and class come off in the same frame as the
      // incoming one's go on, so the tween runs from where the stage was.
      for (const [prop] of written) stage.style.removeProperty(prop);
      for (const c of palettes) stage.classList.remove(c);
      const next = act ? { classes: [classOf(act)].filter(Boolean), rods: rodsOf(act) } : opening;
      stage.classList.add(...next.classes);
      for (const [prop, value] of next.rods) stage.style.setProperty(prop, value);
      written = next.rods;
    }

    // The cue line, in px from the top of the window: the middle of the
    // window, or of the scroller.
    function line() {
      if (!box) return innerHeight * CUE;
      const r = box.getBoundingClientRect();
      return r.top + box.clientHeight * CUE;
    }

    /* Until the page has settled, every change cuts: a page that tweened on
       load would look like it was still loading. "Settled" is a frame after
       `load`, by which time a reload has restored the reader's scroll
       position — the observer's first look can come before that, see the top
       of the page, and would otherwise tween from act I to wherever the
       reader was. (A #fragment link still glides there under walnut's smooth
       scrolling, and the acts turn as it passes them, which is what a glide
       should do.) A scroller that is not shown, a shut dialog, has nothing
       to look at; the first look after it is shown again cuts too, so a
       window opens already in the act it opens on. */
    let settled = false, shown = true;
    const look = () => {
      if (box && !box.getClientRects().length) { shown = false; return; }
      cast(actAt(acts, line()), settled && shown);
      shown = true;
    };
    const io = new IntersectionObserver(look, {
      root: box,
      rootMargin: `-${CUE * 100}% 0px -${(1 - CUE) * 100}% 0px`,
    });
    for (const act of acts) io.observe(act);
    const settle = () => requestAnimationFrame(() => { look(); settled = true; });
    if (document.readyState === "complete") settle();
    else addEventListener("load", settle, { once: true });
  }
})();
