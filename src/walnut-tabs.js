/* walnut.css · tabs
   ─────────────────────────────────────────────────────────────────────────
   Sections you switch between, from plain markup:

       <div class="wal-tabs" data-label="Install">
         <section data-tab="CDN" id="install-cdn">…</section>
         <section data-tab="Download" id="install-download">…</section>
       </div>

   This script reads each section's data-tab and builds the row of tabs above
   them: a role="tablist" of buttons, each tied to its section with
   aria-controls and aria-labelledby. One section shows at a time.

   Keys    Left and Right go to the next tab and choose it, round from the
           last to the first (mirrored in right-to-left text). Home and End
           go to the first and last. Tab leaves the row for the panel.
   Links   Each section keeps its id, so #install-download opens that tab,
           and a link to anything inside a section opens it too. Choosing a
           tab puts its id in the address bar without adding to history.
   Find    The other sections are hidden="until-found", so find-in-page
           searches them and opens the tab with the match. A browser without
           until-found hides them outright.
   Start   data-selected on a section shows it first.
   Event   The box fires wal-tabchange, which bubbles, with
           { tab, panel, index } in its detail.

   data-style and data-numbered on the box carry over to the row (see the
   Tabs section of walnut.css). From script, walnut.tabs.init(box) builds a
   box added after load, and walnut.tabs.show(id) opens the tab holding that
   element.

   An app that renders its own row (React, say) can keep rendering it. Give
   it class="wal-tablist" and role="tablist", and its buttons role="tab":
   the keys here work on any .wal-tablist. They move focus and click the
   next tab, so the app's own click handler does the choosing.
   ───────────────────────────────────────────────────────────────────────── */
(() => {
  const walnut = (window.walnut ??= {});
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const shows = new WeakMap(); // a box → its show(panel)
  const FOCUSABLE = 'a[href], button, input, select, textarea, summary, iframe, [contenteditable], [tabindex]:not([tabindex="-1"])';
  let made = 0;

  const slug = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  function byHash(hash) {
    if (hash.length < 2) return null;
    try { return document.getElementById(decodeURIComponent(hash.slice(1))); }
    catch { return null; }
  }

  /**
   * Whether going to a tab with the arrow keys, Home or End also chooses it.
   *
   * Yes, and the panel changes as focus moves: one key press per look, and
   * what a screen reader announces is what is showing. No, and the keys only
   * move focus; Enter or Space chooses. That costs a press, but stepping
   * past three tabs to reach the fourth does not open the two between, which
   * matters when opening one does work: a wal-tabchange listener that draws
   * a chart, or an app whose click handler fetches.
   *
   * @param {Element} list  the .wal-tablist the keys were pressed in
   * @returns {boolean}
   */
  // TODO(Alex): this ships answering yes for every row, with
  // data-activate="manual" on a row as the way out. Your call.
  const follows = (list) => list.dataset.activate !== "manual";

  // Scroll the row, never the page, so the tab is in view with a little of
  // its neighbour showing.
  function keep(list, tab, smooth = true) {
    const row = list.getBoundingClientRect();
    const t = tab.getBoundingClientRect();
    const pad = 16;
    let by = 0;
    if (t.left < row.left + pad) by = t.left - row.left - pad;
    else if (t.right > row.right - pad) by = t.right - row.right + pad;
    if (by) list.scrollBy({ left: by, behavior: smooth && !reduce.matches ? "smooth" : "auto" });
  }

  function init(box) {
    if (shows.has(box)) return;
    const panels = [...box.children].filter((n) => n.hasAttribute("data-tab"));
    if (!panels.length) return;
    const own = box.id || `wal-tabs-${++made}`;

    const list = document.createElement("div");
    list.className = "wal-tablist";
    list.setAttribute("role", "tablist");
    if (box.dataset.label) list.setAttribute("aria-label", box.dataset.label);
    for (const key of ["style", "numbered", "activate"]) {
      if (key in box.dataset) list.dataset[key] = box.dataset[key];
    }

    const tabs = panels.map((panel) => {
      panel.id ||= `${own}-${slug(panel.dataset.tab)}`;
      const tab = document.createElement("button");
      tab.type = "button";
      tab.id = `${panel.id}-tab`;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", panel.id);
      tab.textContent = panel.dataset.tab;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tab.id);
      list.append(tab);
      return tab;
    });
    box.prepend(list);
    box.classList.add("is-enhanced");

    let current = -1;
    function choose(i, { user = false } = {}) {
      if (i === current) return;
      current = i;
      tabs.forEach((tab, j) => {
        const on = j === i;
        tab.setAttribute("aria-selected", String(on));
        tab.tabIndex = on ? 0 : -1;
        // A hidden panel keeps its box under until-found, so it would still
        // take focus from Tab. The chosen one is a Tab stop only when nothing
        // in it is, as the ARIA tabs pattern advises; otherwise Tab would stop
        // on the panel and then straight away on its first control.
        panels[j].tabIndex = on && !panels[j].querySelector(FOCUSABLE) ? 0 : -1;
        // The attribute, not the property: a browser without until-found
        // would turn the property into a plain hidden="", which print
        // cannot undo.
        if (on) panels[j].removeAttribute("hidden");
        else panels[j].setAttribute("hidden", "until-found");
      });
      keep(list, tabs[i], user);
      if (user) {
        box.dataset.walSwitched = "";
        history.replaceState(history.state, "", `#${panels[i].id}`);
      }
      box.dispatchEvent(new CustomEvent("wal-tabchange", {
        bubbles: true,
        detail: { tab: tabs[i], panel: panels[i], index: i },
      }));
    }

    list.addEventListener("click", (e) => {
      const tab = e.target.closest('[role="tab"]');
      if (tab) choose(tabs.indexOf(tab), { user: true });
    });

    shows.set(box, (panel) => choose(panels.indexOf(panel)));

    const target = byHash(location.hash);
    const at = panels.findIndex((p) => target && p.contains(target));
    const marked = panels.findIndex((p) => p.hasAttribute("data-selected"));
    choose(at >= 0 ? at : Math.max(marked, 0));
    // Building the row and hiding the panels before this one moved the
    // target after the browser had scrolled to it.
    if (at > 0) requestAnimationFrame(() => target.scrollIntoView());
  }

  // Open every tab between the page and `el`, outermost first, so a link
  // into a tab inside a tab opens both.
  function show(el) {
    if (typeof el === "string") el = document.getElementById(el);
    const path = [];
    for (let n = el; n?.parentElement; n = n.parentElement) {
      const open = shows.get(n.parentElement);
      if (open && n.getAttribute("role") === "tabpanel") path.unshift(() => open(n));
    }
    for (const open of path) open();
  }

  // The keys, for every .wal-tablist on the page: built here or by an app.
  document.addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const tab = e.target.closest?.('.wal-tablist [role="tab"]');
    if (!tab) return;
    const list = tab.closest(".wal-tablist");
    const tabs = [...list.querySelectorAll('[role="tab"]')]
      .filter((t) => !t.disabled && t.getAttribute("aria-disabled") !== "true");
    const i = tabs.indexOf(tab);
    const back = getComputedStyle(list).direction === "rtl" ? "ArrowRight" : "ArrowLeft";
    const next = back === "ArrowLeft" ? "ArrowRight" : "ArrowLeft";
    const to = { [next]: (i + 1) % tabs.length, [back]: (i - 1 + tabs.length) % tabs.length,
      Home: 0, End: tabs.length - 1 }[e.key];
    if (to === undefined || i < 0) return;
    e.preventDefault();
    tabs[to].focus({ preventScroll: true });
    keep(list, tabs[to]);
    if (follows(list) && tabs[to].getAttribute("aria-selected") !== "true") {
      tabs[to].click();
    }
  });

  // Find-in-page, and a link to something in a hidden panel, reveal it
  // before the browser scrolls there; this makes that the chosen tab.
  document.addEventListener("beforematch", (e) => show(e.target), true);
  // A browser without until-found could not scroll to a hidden target, so
  // it goes there once its tab is open.
  addEventListener("hashchange", () => {
    const el = byHash(location.hash);
    const hidden = el?.closest('[role="tabpanel"][hidden]');
    show(el);
    if (hidden) el.scrollIntoView();
  });

  walnut.tabs = { init, show };

  const start = () => document.querySelectorAll(".wal-tabs").forEach(init);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
