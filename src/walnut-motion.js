/* walnut.css · motion
   ─────────────────────────────────────────────────────────────────────────
   Three movements CSS cannot make on its own: two need to know where
   something was before it moved, and one follows a hand.

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
   A window that a link or Back opens has no press to travel from:
   walnut.open(dialog, card, { instant: true }) opens it in place, and it
   still goes home to that card when it closes.

   The pull. A .wal-door's pull can be dragged as well as pressed: the door
   comes with it, and let go far enough, or flicked, it shuts. Nothing to
   call; every door on the page has it once this file is loaded.

   The shuffle. walnut.shuffle(list, change) runs a change to a list, a
   filter or a sort, so that every item travels to its new place. The
   travelling is CSS (06-cinema.css, Shuffle); this sets it going.

   All three move on the opening tokens of the element they move, so a
   material (06-cinema.css, Materials) reaches them: under walnut the notes
   come down flat with a knock, and a door let go short of shut knocks on
   its stop. Under reduced motion the window simply opens, the door lands
   at once and the change simply happens, and so they do in a browser
   without the commands API or view transitions. The window and the door
   work without this file at all; the window opens the way .wal-dialog
   does, and the pull is pressed rather than dragged.
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
     The cover travels from the card's picture at one scale, cropped to the
     picture's shape until it lands (over, below). The notes turn on the spine from lying over the cover to
     lying flat beside it. Past the halfway turn their back faces you and is
     not drawn, so they appear as they come round. The notes land on the
     material's curve, since they come down on the table; the cover glides
     out and settles home whatever it is made of, being in flight both ways. */
  const stacked = (spread) => getComputedStyle(spread).gridTemplateColumns.trim().split(/\s+/).length === 1;
  /* The cover as it sits over the card's picture, a: never stretched, so
     at one scale, just large enough to cover the picture, and cropped to
     it. --wal-cover-focus says which part of the cover the picture is, as
     object-position would. A cover the picture's own shape needs no crop,
     and travels exactly as one would expect. */
  function over(cover, a, b, art) {
    const s = Math.max(a.width / b.width, a.height / b.height);
    const w = a.width / s, h = a.height / s;
    const [fx = 50, fy = 50] = token(cover, "--wal-cover-focus", "50% 50%").split(/\s+/).map(parseFloat);
    const x = (b.width - w) * fx / 100, y = (b.height - h) * fy / 100;
    const r = parseFloat(getComputedStyle(art).borderTopLeftRadius) || 0;
    return {
      transform: `translate(${a.left - b.left - x * s}px, ${a.top - b.top - y * s}px) scale(${s})`,
      clipPath: `inset(${y}px ${b.width - w - x}px ${b.height - h - y}px ${x}px round ${r / s}px)`,
    };
  }
  const home = { transform: "none", clipPath: "inset(0px 0px 0px 0px round 0px)" };
  const artOf = (from) => from.querySelector("[data-wal-art]") ?? from;
  const parts = (dialog, from) => ({
    art: artOf(from),
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
        cover.animate([over(cover, a, b, art), home], { duration: T * 0.9, easing: glide }),
        notes.animate([{ transform: turn }, { transform: "none" }],
          { duration: T * 1.05, delay: T * 0.42, easing: ease, fill: "backwards" }),
        notes.animate([{ opacity: 1 }, { opacity: 0 }],
          { pseudoElement: "::after", duration: T * 1.05, delay: T * 0.42, easing: ease, fill: "backwards" }),
      ];
      await settled(anims);
    },
    async close(dialog, from) {
      const { art, cover, notes, spread } = parts(dialog, from);
      // Hidden already, unless the window opened in place.
      art.style.visibility = "hidden";
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
      const back = cover.animate([home, over(cover, a, b, art)],
        { duration: T * 0.78, easing: settle, fill: "forwards" });
      await settled([...fold, back]);
      return () => {
        art.style.visibility = "";
        [cover, notes].forEach((el) => el.getAnimations().forEach((x) => x.cancel()));
      };
    },
  };

  const STYLES = { gatefold };

  // Asked for while the window moves (Back pressed as it opens, say): the
  // last request is kept, and made once the movement ends.
  const queued = new WeakMap();
  const landed = (dialog) => {
    busy.delete(dialog);
    delete dialog.dataset.walMoving;
    const next = queued.get(dialog);
    queued.delete(dialog);
    next?.();
  };

  // A card whose picture is not drawn (display: none, say, or taken off
  // the page) is no place to leave from or go home to: the window opens
  // and closes in place.
  const drawn = (from) => !!from?.isConnected && artOf(from).getClientRects().length > 0;

  // Called on a window already open, it changes the card the window goes
  // home to: a page showing another card's contents in the same window.
  // The card it leaves is whole again.
  function open(dialog, from, { instant = false } = {}) {
    const was = sources.get(dialog);
    if (from) sources.set(dialog, from);
    if (dialog.open && from && was && was !== from) artOf(was).style.removeProperty("visibility");
    if (busy.has(dialog)) return void queued.set(dialog, () => open(dialog, sources.get(dialog), { instant }));
    if (dialog.open) return;
    const style = STYLES[dialog.dataset.walOpen];
    if (!style || instant || reduce.matches || !drawn(from)) return dialog.showModal();
    busy.add(dialog);
    dialog.dataset.walMoving = "";
    Promise.resolve(style.open(dialog, from)).finally(() => landed(dialog));
  }

  function close(dialog) {
    if (busy.has(dialog)) return void queued.set(dialog, () => close(dialog));
    if (!dialog.open) return;
    const style = STYLES[dialog.dataset.walOpen];
    const from = sources.get(dialog);
    if (!style || reduce.matches || !drawn(from)) return dialog.close();
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
    }).finally(() => { dialog.classList.remove("is-closing"); landed(dialog); });
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
    const from = sources.get(e.target);
    if (from) artOf(from).style.removeProperty("visibility");
    e.target.querySelectorAll(".wal-window-panel, .wal-gatefold-cover, .wal-gatefold-notes")
      .forEach((el) => el.getAnimations().forEach((x) => x.cancel()));
  }, true);

  walnut.open = Object.assign(open, { close, styles: STYLES });

  /* ── The pull ──
     A door's pull shuts it when pressed. Taken in hand, it drags the door
     the way it shuts, and the shadow the door throws thins as it goes. Let
     go a third of the way, or with a flick, and the door runs home; let go
     short of that and it goes back to its stop on its material's curve,
     knocking as it lands. The door stays CSS's to move: the hand only holds
     its translate while it is on the pull, and the door's own transition
     takes it from wherever the hand let go. */
  const SLOP = 4; // px a press may wander and still be a press
  // Which way a door shuts: off the edge it stands against, so away from
  // the widest stretch of screen it leaves open.
  function track(door) {
    const r = door.getBoundingClientRect();
    const gaps = [[r.left, "x", 1], [innerWidth - r.right, "x", -1], [r.top, "y", 1], [innerHeight - r.bottom, "y", -1]];
    const [, axis, sign] = gaps.reduce((a, b) => (b[0] > a[0] ? b : a));
    return { axis, sign, size: axis === "x" ? r.width : r.height };
  }
  // How far out the door is now, in px toward shut: it may be grabbed
  // while it is still running out, partway along its transition.
  function outOf(door, { axis, sign, size }) {
    const [x = "0", y = "0"] = getComputedStyle(door).translate.replace("none", "0").split(" ");
    const v = axis === "x" ? x : y;
    return sign * (v.endsWith("%") ? (parseFloat(v) * size) / 100 : parseFloat(v) || 0);
  }

  addEventListener("pointerdown", (e) => {
    const pull = e.target instanceof Element ? e.target.closest(".wal-door-pull") : null;
    const door = pull?.closest(".wal-door");
    if (!door?.open || !e.isPrimary || e.button !== 0) return;
    const t = track(door);
    const from = outOf(door, t);
    const at = (p) => (t.axis === "x" ? p.clientX : p.clientY) * t.sign;
    const start = at(e);
    let held = false, out = from, last = { out, time: e.timeStamp }, speed = 0;
    pull.setPointerCapture(e.pointerId);

    const move = (p) => {
      const d = from + at(p) - start;
      if (!held && Math.abs(d - from) < SLOP) return;
      held = true;
      door.dataset.walHeld = "";
      // It runs freely toward shut, and only grudgingly further open.
      out = Math.min(d < 0 ? d / 4 : d, t.size);
      door.style.translate = t.axis === "x" ? `${out * t.sign}px 0` : `0 ${out * t.sign}px`;
      door.style.setProperty("--wal-door-out", Math.max(0, out / t.size).toFixed(3));
      const dt = p.timeStamp - last.time;
      if (dt > 0) speed = 0.6 * ((out - last.out) / dt) + 0.4 * speed;
      last = { out, time: p.timeStamp };
    };
    const end = (p) => {
      pull.removeEventListener("pointermove", move);
      pull.removeEventListener("pointerup", end);
      pull.removeEventListener("pointercancel", end);
      door.removeEventListener("close", end);
      if (!held) return;
      // A flick, or a third of the way out and not coming back: it shuts.
      const shut = p.type === "pointerup" && (speed > 0.5 || (out > t.size / 3 && speed > -0.2));
      // Let go: the transition is on again, from where the hand left it.
      delete door.dataset.walHeld;
      door.style.removeProperty("translate");
      door.style.removeProperty("--wal-door-out");
      if (shut && door.open) door.close();
      // A drag is not a press: the click that follows it does nothing.
      const eat = (c) => { c.preventDefault(); c.stopImmediatePropagation(); };
      addEventListener("click", eat, { capture: true, once: true });
      setTimeout(() => removeEventListener("click", eat, { capture: true }));
    };
    pull.addEventListener("pointermove", move);
    pull.addEventListener("pointerup", end);
    pull.addEventListener("pointercancel", end);
    door.addEventListener("close", end);
  });

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
