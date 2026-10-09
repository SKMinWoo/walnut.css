/*! walnut.css v0.4.0 · motion | MIT License | github.com/SKMinWoo/walnut.css */
/* walnut.css · motion
   ─────────────────────────────────────────────────────────────────────────
   Two movements CSS cannot make on its own, because each needs to know
   where something was before it moved.

   The gatefold. A .wal-window marked data-wal-open="gatefold" opens out of
   the button that opened it: the cover travels from the card's picture and
   the notes unfold beside it on the spine, and on closing the notes fold
   back and the cover goes home to the card. Nothing to call; the window's
   own buttons do it:

       <button commandfor="dusk" command="show-modal">
         <span data-wal-art>…</span> Dusk
       </button>
       <dialog class="wal-window" data-wal-open="gatefold" id="dusk" closedby="any">
         <div class="wal-gatefold-spread">
           <figure class="wal-gatefold-cover">…</figure>
           <div class="wal-gatefold-notes">…</div>
         </div>
       </dialog>

   The picture that travels is the button's [data-wal-art], or the button.
   From script, walnut.open(dialog, button) and walnut.open.close(dialog).

   The shuffle. walnut.shuffle(list, change) runs a change to a list, a
   filter or a sort, so that every item travels to its new place. The
   travelling is CSS (06-cinema.css, Shuffle); this sets it going.

   Both move on the opening tokens of the element they move, so a material
   (06-cinema.css, Materials) reaches them: under walnut the notes come
   down flat with a knock. Under reduced motion the window simply opens and
   the change simply happens, and so they do in a browser without the
   commands API or view transitions. The window works without this file
   at all; it just opens the way .wal-dialog does.
   ───────────────────────────────────────────────────────────────────────── */
(() => {
  const walnut = (window.walnut ??= {});
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");

  // An element's own value for a token, so a material set on it, or on
  // anything around it, is the one used.
  const token = (el, name, fallback) => getComputedStyle(el).getPropertyValue(name).trim() || fallback;
  const ms = (value) => (value.endsWith("ms") ? parseFloat(value) : parseFloat(value) * 1000) || 620;
  const timing = (el, way) => ({
    duration: ms(token(el, `--wal-${way}-duration`, "620ms")),
    ease: token(el, `--wal-${way}-ease`, way === "open" ? "cubic-bezier(.5, 0, .2, 1)" : "cubic-bezier(.2, 0, 0, 1)"),
    glide: token(el, "--wal-ease-glide", "cubic-bezier(.5, 0, .2, 1)"),
    settle: token(el, "--wal-ease-settle", "cubic-bezier(.2, 0, 0, 1)"),
  });

  /* How long a window takes to travel from a (the rectangle it leaves) to
     b (the rectangle it lands in), in ms, given the duration its material
     asks for. Every opening and closing asks this, so it sets the weight
     of all of them at once. */
  function pace(a, b, duration) {
    // TODO(Alex): should a longer or bigger move take longer?
    // Today every move takes its material's duration, near or far.
    return duration;
  }

  const sources = new WeakMap();
  const busy = new WeakSet();
  const settled = (anims) => Promise.all(anims.map((a) => a.finished.catch(() => {})));

  /* ── Gatefold ──
     The cover travels from the card's picture; with the same shape it is
     one scale. The notes turn on the spine from lying over the cover to
     lying flat beside it. Past the halfway turn their back faces you and is
     not drawn, so they appear as they come round. The notes land on the
     material's curve, since they come down on the table; the cover glides
     out and settles home whatever it is made of, being in flight both ways. */
  const stacked = (spread) => getComputedStyle(spread).gridTemplateColumns.trim().split(/\s+/).length === 1;
  const flip = (a, b) => `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})`;
  const parts = (dialog, from) => ({
    art: from.querySelector("[data-wal-art]") ?? from,
    cover: dialog.querySelector(".wal-gatefold-cover"),
    notes: dialog.querySelector(".wal-gatefold-notes"),
    spread: dialog.querySelector(".wal-gatefold-spread"),
  });
  const gatefold = {
    async open(dialog, from) {
      const { art, cover, notes, spread } = parts(dialog, from);
      const a = art.getBoundingClientRect();
      dialog.showModal();
      const b = cover.getBoundingClientRect();
      const turn = stacked(spread) ? "rotateX(180deg)" : "rotateY(-180deg)";
      const { duration, ease, glide } = timing(dialog, "open");
      const T = pace(a, b, duration);
      art.style.visibility = "hidden";
      const anims = [
        spread.animate([{ filter: "drop-shadow(0 0 0 transparent)" }, { filter: getComputedStyle(spread).filter }], { duration: T, easing: glide }),
        cover.animate([{ transform: flip(a, b) }, { transform: "none" }], { duration: T * 0.9, easing: glide }),
        notes.animate([{ transform: turn }, { transform: "none" }],
          { duration: T * 1.05, delay: T * 0.42, easing: ease, fill: "backwards" }),
        notes.animate([{ opacity: 1 }, { opacity: 0 }],
          { pseudoElement: "::after", duration: T * 1.05, delay: T * 0.42, easing: ease, fill: "backwards" }),
      ];
      await settled(anims);
    },
    async close(dialog, from) {
      const { art, cover, notes, spread } = parts(dialog, from);
      const turn = stacked(spread) ? "rotateX(180deg)" : "rotateY(-180deg)";
      const { duration, settle } = timing(dialog, "close");
      const T = pace(cover.getBoundingClientRect(), art.getBoundingClientRect(), duration);
      const fold = [
        notes.animate([{ transform: "none" }, { transform: turn }],
          { duration: T * 0.62, easing: "cubic-bezier(.45, 0, .7, .4)", fill: "forwards" }),
        notes.animate([{ opacity: 0 }, { opacity: 1 }], { pseudoElement: "::after", duration: T * 0.62, fill: "forwards" }),
      ];
      await new Promise((r) => setTimeout(r, T * 0.38));
      // Measured now, not before: the page may have scrolled under the window.
      const a = art.getBoundingClientRect(), b = cover.getBoundingClientRect();
      const home = cover.animate([{ transform: "none" }, { transform: flip(a, b) }],
        { duration: T * 0.78, easing: settle, fill: "forwards" });
      await settled([...fold, home]);
      return () => {
        art.style.visibility = "";
        [cover, notes].forEach((el) => el.getAnimations().forEach((x) => x.cancel()));
      };
    },
  };

  const STYLES = { gatefold };

  function open(dialog, from) {
    if (dialog.open || busy.has(dialog)) return;
    const style = STYLES[dialog.dataset.walOpen];
    if (from) sources.set(dialog, from);
    if (!style || reduce.matches || !from) return dialog.showModal();
    busy.add(dialog);
    dialog.dataset.walMoving = "";
    Promise.resolve(style.open(dialog, from)).finally(() => { busy.delete(dialog); delete dialog.dataset.walMoving; });
  }

  function close(dialog) {
    if (!dialog.open || busy.has(dialog)) return;
    const style = STYLES[dialog.dataset.walOpen];
    const from = sources.get(dialog);
    if (!style || reduce.matches || !from?.isConnected) return dialog.close();
    busy.add(dialog);
    dialog.dataset.walMoving = "";
    dialog.classList.add("is-closing");
    Promise.resolve(style.close(dialog, from)).then((after) => {
      dialog.close();
      // Style the closed window while .is-closing still holds its
      // transitions off, so it leaves the screen on this frame. A display
      // transition would otherwise keep it painted for its whole length.
      getComputedStyle(dialog).display;
      if (typeof after === "function") after();
    }).finally(() => { dialog.classList.remove("is-closing"); busy.delete(dialog); delete dialog.dataset.walMoving; });
  }

  const ours = (d) => d instanceof HTMLDialogElement && d.dataset.walOpen in STYLES;

  // The window's own buttons: commandfor/command, caught on the way down so
  // the movement can stand in for the browser's open and close.
  addEventListener("command", (e) => {
    if (!ours(e.target)) return;
    if (e.command === "show-modal") { e.preventDefault(); open(e.target, e.source); }
    else if (e.command === "close" || e.command === "request-close") { e.preventDefault(); close(e.target); }
  }, true);
  // Escape, and closedby's light dismiss, arrive as a cancelable cancel.
  addEventListener("cancel", (e) => {
    if (!ours(e.target) || !e.cancelable) return;
    e.preventDefault();
    close(e.target);
  }, true);
  // The window's dialog fills the viewport, so a click beside the window
  // lands on the dialog itself: that is a click outside.
  addEventListener("click", (e) => {
    if (ours(e.target) && e.target.open && e.target.getAttribute("closedby") === "any") close(e.target);
  });
  // However a window closed, its card is whole again and nothing is held.
  addEventListener("close", (e) => {
    if (!ours(e.target) || busy.has(e.target)) return;
    sources.get(e.target)?.querySelector("[data-wal-art]")?.style.removeProperty("visibility");
    e.target.querySelectorAll(".wal-window-panel, .wal-gatefold-cover, .wal-gatefold-notes")
      .forEach((el) => el.getAnimations().forEach((x) => x.cancel()));
  }, true);

  walnut.open = Object.assign(open, { close, styles: STYLES });

  /* ── Shuffle ──
     Scoped to the list where the browser can (element.startViewTransition),
     so the rest of the page stays live and a second list can shuffle at the
     same time; on the document where it cannot. Returns the transition, or
     nothing when the change was simply made. */
  walnut.shuffle = (list, change) => {
    const start = list.startViewTransition?.bind(list) ?? document.startViewTransition?.bind(document);
    if (reduce.matches || !start) { change(); return; }
    list.classList.add("is-shuffling");
    const t = start(change);
    // A transition the browser skips (another one started, or it could not
    // picture the list) still makes the change; only the movement is lost,
    // which is not the page's error to report.
    t.ready.catch(() => {});
    t.finished.finally(() => list.classList.remove("is-shuffling"));
    return t;
  };
})();
