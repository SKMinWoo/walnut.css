/* The mixing desk: the hero's four hue rods as brass knobs, and a lamp that
   lights when a colour falls outside sRGB.

   Page furniture. The knobs are controllers over the palette panel's own
   range inputs: turning one sets that input and fires its "input" event, so
   the page applies, scores and shares the change exactly as it does from
   the panel. They read the page back, too, so Random, a shipped palette or
   the panel all turn them.

   Each knob is a role="slider": arrows step it a degree (Shift: ten), Page
   Up and Down by thirty, Home and End to 0° and 359°. Its ring is the hue
   wheel at that colour's own lightness and chroma, and the pointer sits on
   the hue it is set to. An external file, so the CSP's 'self' covers it. */
(() => {
  const root = document.documentElement;
  const KNOBS = [
    { id: "r-hue", prop: "--wal-hue", name: "Ground", l: 0.62, c: "calc(var(--wal-chroma) * 4 + .03)" },
    { id: "r-accent", prop: "--wal-accent-hue", name: "Accent", l: 0.62, c: "var(--wal-accent-chroma)" },
    { id: "r-gold", prop: "--wal-gold-hue", name: "Gold", l: 0.72, c: "var(--wal-gold-chroma)" },
    { id: "r-olive", prop: "--wal-olive-hue", name: "Olive", l: 0.6, c: "var(--wal-olive-chroma)" },
  ];
  const CUES = ["accent", "bloom", "gold", "olive", "cool"];
  const deg = (h) => ((h % 360) + 360) % 360;

  /* sRGB holds a colour when oklch → linear sRGB lands inside [0, 1]. This
     is the clipping the README's gamut caveat warns of: CSS flattens such a
     colour silently, and it stops matching the hue that was asked for. */
  function inGamut(L, C, h) {
    const a = C * Math.cos((h * Math.PI) / 180), b = C * Math.sin((h * Math.PI) / 180);
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    const rgb = [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ];
    return rgb.every((v) => v >= -0.0005 && v <= 1.0005);
  }

  function clipped() {
    const cs = getComputedStyle(root);
    const n = (p) => { const v = cs.getPropertyValue(p).trim(); return v.endsWith("%") ? parseFloat(v) / 100 : parseFloat(v); };
    const out = [];
    for (const cue of CUES) {
      for (const mode of ["light", "dark"]) {
        if (!inGamut(n(`--wal-l-${cue}-${mode}`), n(`--wal-${cue}-chroma`), n(`--wal-${cue}-hue`))) out.push(`${cue} in ${mode}`);
      }
    }
    return out;
  }

  function build() {
    const facts = document.querySelector(".site-hero .site-facts");
    if (!facts) return null;
    const desk = document.createElement("div");
    desk.className = "site-console";
    desk.setAttribute("role", "group");
    desk.setAttribute("aria-label", "Mixing desk: the palette's hues");
    desk.innerHTML = KNOBS.map((k) =>
      `<div class="site-knob-unit">` +
        `<div class="site-knob" role="slider" tabindex="0" aria-label="${k.name} hue" aria-valuemin="0" aria-valuemax="359" ` +
          `data-for="${k.id}" style="--kl: ${k.l}; --kc: ${k.c}">` +
          `<span class="site-knob-ring"></span><span class="site-knob-cap"><i></i></span>` +
        `</div>` +
        `<span class="site-knob-label">${k.name}</span><output class="site-knob-value"></output>` +
      `</div>`).join("") +
      `<div class="site-lamp-unit"><span class="site-gamut" aria-hidden="true"></span>` +
      `<span class="site-knob-label">Gamut</span><output class="site-knob-value site-gamut-say" aria-live="polite"></output></div>`;
    facts.after(desk);
    return desk;
  }

  const start = () => {
    const desk = build();
    if (!desk) return;
    const knobs = [...desk.querySelectorAll(".site-knob")];
    const lamp = desk.querySelector(".site-gamut");
    const say = desk.querySelector(".site-gamut-say");
    let turning = null;

    // The page → the knobs, and the lamp.
    const read = () => {
      const cs = getComputedStyle(root);
      KNOBS.forEach((k, i) => {
        if (knobs[i] === turning) return;
        show(knobs[i], deg(parseFloat(cs.getPropertyValue(k.prop))));
      });
      const off = clipped();
      lamp.classList.toggle("is-lit", off.length > 0);
      say.textContent = off.length ? "Clips" : "In sRGB";
      lamp.title = off.length ? `Outside sRGB: ${off.join(", ")}. Lower that colour's chroma.` : "Every colour is inside sRGB, in light and dark.";
    };
    const show = (knob, v) => {
      if (Number.isNaN(v)) return;
      const r = Math.round(v);
      knob.style.setProperty("--deg", String(v));
      knob.setAttribute("aria-valuenow", String(r));
      knob.setAttribute("aria-valuetext", `${r}°`);
      knob.parentElement.querySelector("output").textContent = `${r}°`;
    };

    // A knob → its input in the palette panel, which does the rest.
    const set = (knob, v) => {
      v = deg(v);
      const input = document.getElementById(knob.dataset.for);
      if (!input) return;
      show(knob, v);
      input.value = String(+v.toFixed(1));
      input.dispatchEvent(new Event("input", { bubbles: true }));
    };
    const now = (knob) => parseFloat(knob.getAttribute("aria-valuenow")) || 0;

    for (const knob of knobs) {
      // Turned by the angle of the pointer about the knob's centre, so it
      // moves the way a real knob does, and a whole turn is a whole wheel.
      const aim = (e) => {
        const r = knob.getBoundingClientRect();
        const a = (Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180) / Math.PI;
        set(knob, a);
      };
      knob.addEventListener("pointerdown", (e) => {
        turning = knob;
        knob.setPointerCapture(e.pointerId);
        knob.classList.add("is-turning");
        aim(e);
      });
      knob.addEventListener("pointermove", (e) => { if (knob.hasPointerCapture(e.pointerId)) aim(e); });
      const release = () => { turning = null; knob.classList.remove("is-turning"); read(); };
      knob.addEventListener("pointerup", release);
      knob.addEventListener("pointercancel", release);
      knob.addEventListener("keydown", (e) => {
        const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 30, PageDown: -30 }[e.key];
        if (step !== undefined) set(knob, now(knob) + step * (e.shiftKey && Math.abs(step) === 1 ? 10 : 1));
        else if (e.key === "Home") set(knob, 0);
        else if (e.key === "End") set(knob, 359);
        else return;
        e.preventDefault();
      });
    }

    // Anything else that changes the palette: the panel, Random, a shipped
    // palette, a shared link, a recolour as it travels.
    let frame = 0;
    const later = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; read(); }); };
    new MutationObserver(later).observe(root, { attributes: true, attributeFilter: ["style", "class"] });
    root.addEventListener("transitionend", (e) => { if (e.target === root) later(); });
    addEventListener("wal-recolour", later);
    read();
    // The page sets its palette up on load (a link's ?p=…, the colours easing in).
    setTimeout(read, 1200);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
