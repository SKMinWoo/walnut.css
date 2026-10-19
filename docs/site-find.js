/* The docs page's finder: ⌘K, Ctrl K or "/" opens a sheet that searches
   every section, tab and reference entry on the page, and going to a result
   opens the tabs (and the reference drawer) it sits in.

   Page furniture, not walnut: it is built from walnut's own dialog, input and
   buttons. It is an external file so the page's Content-Security-Policy
   ('self') lets it run with no hash to keep in step. Without it, the page
   still has its nav and the reference search. */
(() => {
  const label = (el) => el.textContent.replace(/\s+/g, " ").trim();

  /* What can be found: each section, each tab, each reference entry. A tab
     is listed under its section, so "Accordion" reads "Motion › Accordion". */
  function index() {
    const out = [];
    for (const section of document.querySelectorAll("main .site-section[id]")) {
      const head = section.querySelector("h2");
      if (!head) continue;
      const name = label(head);
      out.push({ id: section.id, title: name, where: "", text: label(section).slice(0, 400) });
      for (const tab of section.querySelectorAll("section[data-tab][id]")) {
        out.push({ id: tab.id, title: tab.dataset.tab, where: name, text: label(tab).slice(0, 400) });
      }
    }
    for (const item of document.querySelectorAll(".site-ref-item[id]")) {
      const head = item.querySelector("h3");
      if (head) out.push({ id: item.id, title: label(head), where: "Reference", text: label(item) });
    }
    return out;
  }

  /* A title hit beats a hit in the section's words, an earlier hit beats a
     later one, and the page's own order breaks ties. */
  function rank(entries, q) {
    q = q.trim().toLowerCase();
    if (!q) return entries.filter((e) => !e.where);
    return entries
      .map((e, i) => {
        const t = e.title.toLowerCase().indexOf(q);
        const w = (e.where + " " + e.text).toLowerCase().indexOf(q);
        const score = t >= 0 ? t : w >= 0 ? 1000 + w : -1;
        return { e, score, i };
      })
      .filter((r) => r.score >= 0)
      .sort((a, b) => a.score - b.score || a.i - b.i)
      .slice(0, 12)
      .map((r) => r.e);
  }

  function build() {
    const sheet = document.createElement("dialog");
    sheet.className = "wal-dialog site-find";
    sheet.setAttribute("aria-label", "Find on this page");
    sheet.innerHTML =
      '<form method="dialog" class="site-find-form" role="search">' +
      '<label class="wal-sr-only" for="site-find-q">Find a section, component or token</label>' +
      '<input class="wal-input" id="site-find-q" type="search" placeholder="A section, component or token" autocomplete="off" ' +
      'role="combobox" aria-expanded="true" aria-controls="site-find-list" aria-autocomplete="list">' +
      "</form>" +
      '<ul class="site-find-list" id="site-find-list" role="listbox" aria-label="Results"></ul>' +
      '<p class="site-find-foot"><kbd>↑</kbd><kbd>↓</kbd> to move · <kbd>Enter</kbd> to go · <kbd>Esc</kbd> to close</p>';
    document.body.append(sheet);
    return sheet;
  }

  let sheet, input, list, entries, results = [], at = 0;

  function render() {
    results = rank(entries, input.value);
    at = Math.min(at, Math.max(results.length - 1, 0));
    list.replaceChildren(
      ...results.map((e, i) => {
        const li = document.createElement("li");
        li.id = `site-find-${i}`;
        li.setAttribute("role", "option");
        li.setAttribute("aria-selected", String(i === at));
        li.dataset.i = String(i);
        li.innerHTML = '<b></b><span class="site-find-where"></span>';
        li.firstChild.textContent = e.title;
        li.lastChild.textContent = e.where;
        return li;
      }),
    );
    if (!results.length) {
      const li = document.createElement("li");
      li.className = "site-find-none";
      li.textContent = "Nothing on this page matches.";
      list.append(li);
    }
    input.setAttribute("aria-activedescendant", results.length ? `site-find-${at}` : "");
    list.children[at]?.scrollIntoView({ block: "nearest" });
  }

  function go(entry) {
    if (!entry) return;
    sheet.close();
    // The page's own hash handling opens the tabs (walnut-tabs.js) and the
    // browser opens the reference drawer; this just names where to go.
    if (location.hash === `#${entry.id}`) document.getElementById(entry.id)?.scrollIntoView();
    else location.hash = entry.id;
  }

  function open() {
    if (!sheet) {
      sheet = build();
      input = sheet.querySelector("input");
      list = sheet.querySelector("ul");
      input.addEventListener("input", () => { at = 0; render(); });
      input.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const n = results.length;
          if (n) at = (at + (e.key === "ArrowDown" ? 1 : n - 1)) % n;
          render();
        } else if (e.key === "Enter") {
          e.preventDefault();
          go(results[at]);
        }
      });
      list.addEventListener("click", (e) => go(results[Number(e.target.closest("[data-i]")?.dataset.i)]));
      sheet.addEventListener("click", (e) => { if (e.target === sheet) sheet.close(); });
    }
    entries = index();
    input.value = "";
    at = 0;
    render();
    sheet.showModal();
    input.focus();
  }

  document.addEventListener("keydown", (e) => {
    const typing = e.target.closest?.("input, textarea, select, [contenteditable]");
    if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      sheet?.open ? sheet.close() : open();
    } else if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      open();
    }
  });

  // A button for it in the nav, beside the palette, labelled with its key.
  const start = () => {
    const actions = document.querySelector(".site-nav .wal-nav-actions");
    if (!actions) return;
    const mac = /Mac|iPhone|iPad/.test(navigator.platform);
    const b = document.createElement("button");
    b.type = "button";
    b.className = "wal-btn wal-btn-ghost wal-btn-sm site-find-btn";
    b.innerHTML = '<svg class="site-icon" viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m10.5 10.5 3.5 3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><span>Find</span><kbd></kbd>';
    b.querySelector("kbd").textContent = mac ? "⌘K" : "Ctrl K";
    b.setAttribute("aria-label", "Find on this page");
    b.addEventListener("click", open);
    actions.prepend(b);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
