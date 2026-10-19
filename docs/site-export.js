/* The palette, exported three more ways beside "Copy CSS": as design tokens
   (W3C DTCG JSON, which Tokens Studio and Style Dictionary read), as a
   Tailwind v4 @theme block, and as a .css file to save.

   Everything is read back from the page rather than recomputed: the CSS is
   the "Your palette" block exactly as shown, and each token's colour is what
   walnut actually derived, measured in a light island and a dark one. So an
   export can never disagree with what is on screen. */
(() => {
  const CUES = ["accent", "bloom", "gold", "olive", "cool"];
  const FORMS = ["", "-ink", "-soft", "-fg"];
  const NEUTRALS = ["bg", "bg-subtle", "surface", "surface-2", "line-soft", "line", "text-muted", "text-soft", "text"];
  const RODS = ["--wal-hue", "--wal-chroma", "--wal-accent-hue", "--wal-accent-chroma", "--wal-gold-hue",
    "--wal-gold-chroma", "--wal-olive-hue", "--wal-olive-chroma", "--wal-bloom-hue", "--wal-cool-hue"];

  const tokens = () => [...NEUTRALS, ...CUES.flatMap((c) => FORMS.map((f) => c + f))];

  /* A painted colour → hex, through a 1×1 canvas so the browser does the
     colour-space conversion, and the oklch components when the browser
     reports the colour in oklch. */
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  function colour(css) {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000";
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    const hex = "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("") + (a < 255 ? a.toString(16).padStart(2, "0") : "");
    const m = css.match(/^oklch\(([\d.]+%?) ([\d.]+) ([\d.]+)/);
    if (!m) return { hex };
    const L = m[1].endsWith("%") ? parseFloat(m[1]) / 100 : parseFloat(m[1]);
    return { hex, oklch: [+L.toFixed(4), +parseFloat(m[2]).toFixed(4), +parseFloat(m[3]).toFixed(2)] };
  }

  // Each token as painted in one mode: a probe inside a .wal-light or
  // .wal-dark island, which walnut resolves light-dark() against.
  function measure(mode) {
    const island = document.createElement("div");
    island.className = `wal-${mode}`;
    island.hidden = true;
    const probe = document.createElement("i");
    island.append(probe);
    document.body.append(island);
    const out = {};
    for (const t of tokens()) {
      probe.style.color = `var(--wal-${t})`;
      out[t] = colour(getComputedStyle(probe).color);
    }
    island.remove();
    return out;
  }

  function dtcg() {
    const cs = getComputedStyle(document.documentElement);
    const group = (mode) => {
      const m = measure(mode);
      return Object.fromEntries(tokens().map((t) => [t, {
        $type: "color",
        $value: m[t].oklch
          ? { colorSpace: "oklch", components: m[t].oklch, hex: m[t].hex }
          : { colorSpace: "srgb", hex: m[t].hex },
      }]));
    };
    return JSON.stringify({
      $description: "walnut.css palette: the colour script's rods, and every colour walnut derives from them in light and dark.",
      walnut: {
        script: Object.fromEntries(RODS.map((p) => [p.slice(6), { $type: "number", $value: +parseFloat(cs.getPropertyValue(p)).toFixed(3) }])),
        light: group("light"),
        dark: group("dark"),
      },
    }, null, 2);
  }

  // Tailwind v4 reads its palette from @theme. Pointing each colour at
  // walnut's token, rather than at a value, keeps light/dark and any
  // .wal-palette scope working through Tailwind's utilities too.
  function tailwind() {
    const css = document.querySelector("[data-live-css]")?.textContent ?? "";
    const lines = tokens().map((t) => `  --color-${t}: var(--wal-${t});`);
    return `/* After walnut.css. Tailwind's bg-accent, text-text-muted, border-line… now wear the colour script. */\n${css}\n\n@theme inline {\n${lines.join("\n")}\n}\n`;
  }

  function save(name, type, text) {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const a = Object.assign(document.createElement("a"), { href: url, download: name });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function say(button, text) {
    button.dataset.label ??= button.textContent;
    button.textContent = text;
    clearTimeout(button._t);
    button._t = setTimeout(() => { button.textContent = button.dataset.label; }, 1600);
    const live = document.getElementById("announce");
    if (live) { live.textContent = ""; requestAnimationFrame(() => { live.textContent = text + "."; }); }
  }

  const ACTIONS = {
    tokens: ["Design tokens", (b) => { save("walnut-tokens.json", "application/json", dtcg()); say(b, "Saved"); }],
    tailwind: ["Tailwind", async (b) => {
      try { await navigator.clipboard.writeText(tailwind()); say(b, "Copied"); } catch { window.prompt("Copy:", tailwind()); }
    }],
    css: ["Download .css", (b) => { save("walnut-palette.css", "text/css", (document.querySelector("[data-live-css]")?.textContent ?? "") + "\n"); say(b, "Saved"); }],
  };

  // A row of them under each palette code box, made here: without this
  // script there is nothing to press them with.
  const start = () => {
    for (const box of document.querySelectorAll(".site-codebox:has([data-live-css])")) {
      const row = document.createElement("div");
      row.className = "site-exports";
      row.setAttribute("role", "group");
      row.setAttribute("aria-label", "Export the palette");
      row.innerHTML = '<span class="site-exports-label">Export</span>';
      for (const [key, [label, run]] of Object.entries(ACTIONS)) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "wal-btn wal-btn-ghost wal-btn-sm";
        b.textContent = label;
        b.dataset.export = key;
        b.addEventListener("click", () => run(b));
        row.append(b);
      }
      box.append(row);
    }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();

  window.walnutSiteExport = { dtcg, tailwind };
})();
