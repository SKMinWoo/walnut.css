/* walnut.css · depth
   ─────────────────────────────────────────────────────────────────────────
   A light over the page, so that a thing lifted off it casts the shadow a
   held thing does: sharp where it touches, then further off, softer and
   paler the higher it goes, as more of the room's light gets in under it.

   The gatefold is what it lights first. Loaded beside walnut-motion.js,
   the cover is picked up off the card, carried up past where it will be
   held and lowered into the hand, and the notes cast their own shadow as
   they swing out from behind it and lie down beside it. Closing carries
   the cover back and sets it down on the card. A plain .wal-window's
   panel is held in the same light. Nothing to call:

       <script src="walnut-motion.js" defer></script>
       <script src="walnut-depth.js" defer></script>

   The shadow is drawn with three.js, in one canvas laid under the window
   while it is open. It is drawn while something moves and once when it
   lands, so a window held open costs nothing, and at half the screen's
   resolution, since a shadow has no detail to lose. It is not a shadow
   map: each shape's shadow is worked out exactly, as a box blurred by how
   high each of its edges is held, so an edge that touches stays sharp and
   the edge of a turning page goes soft.

   three.js is fetched once the page is idle, and only on a page with a
   window to light; never under reduced motion or Save-Data, where the
   window opens in place and keeps its CSS shadow. It comes from
   data-three on this script if you give one, else from your import map's
   "three" (or your bundler's), else from jsDelivr, pinned:

       <script src="walnut-depth.js" data-three="/vendor/three.module.min.js" defer></script>

   Until three.js has arrived, and wherever there is no WebGL, the window
   keeps the CSS shadow it has always had (04-components.css, Gatefold).
   Once the light is on, <html> says so with data-wal-depth and that
   shadow stands down, so the two are never drawn together.

   The shadow's colour is --wal-depth-ink: its alpha is how dark it gets
   right under a thing that touches. --wal-elevation sets how high a window
   is held, so a finish that lies flat holds it low, and 0 casts nothing.

   A movement of your own (walnut.open.styles.mine) is lit by naming what
   it lifts, and how high, from 0 on the page to 1 held:

       walnut.depth.styles.mine = (dialog) => [{ el: dialog.querySelector(".card"), lift: 1 }];

   It is asked on every frame the window moves, so the lift can follow the
   movement. The shape is read from the element's own transform and inset()
   clip-path, its box from the layout, seen through its parent's
   perspective. walnut.depth.ready() fetches three.js now rather than at
   idle, and resolves to whether the light is on.
   ───────────────────────────────────────────────────────────────────────── */
(() => {
  const walnut = (window.walnut ??= {});
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const given = document.currentScript?.dataset.three;
  const CDN = "https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";

  const MAX = 4;     // shapes one window can cast
  const HELD = 60;   // px a window is held above the page, at --wal-elevation 1
  const SHARP = 1.5; // px of blur that even a touching edge keeps

  // The light. x and y are how far a shadow falls per px of height: from
  // above, a little to the left, as the CSS shadows fall. spread and sky are
  // how much softer each light's shadow grows per px of height, and key is
  // that light's share; the rest is the room's, which comes from everywhere,
  // so its shadow falls straight under.
  const light = { x: 0.1, y: 0.42, spread: 0.14, sky: 0.5, key: 0.7 };

  /* ── What is held ──
     How high the cover is as it travels: off the card quickly, a little
     past where it is held, then lowered into the hand. p is the travel's
     own eased progress, so the height keeps time with the cover, and
     closing plays it back. */
  const arc = (p) => p + 0.45 * Math.sin(Math.PI * p);
  const scripted = (a) => !("transitionProperty" in a) && !("animationName" in a);
  const styles = {
    gatefold(dialog) {
      const cover = dialog.querySelector(".wal-gatefold-cover");
      const notes = dialog.querySelector(".wal-gatefold-notes");
      if (!cover || !notes) return [];
      const p = cover.getAnimations().find(scripted)?.effect?.getComputedTiming().progress;
      const lift = p == null ? 1 : arc(dialog.classList.contains("is-closing") ? 1 - p : p);
      return [{ el: cover, lift }, { el: notes, lift }];
    },
    // A window with no movement of its own: its panel, held, rising the
    // last few pixels into place as it fades in.
    window: (dialog) => [...dialog.querySelectorAll(":scope > .wal-window-panel")].map((el) => ({ el })),
  };
  const styleOf = (d) => d.dataset.walOpen ?? (d.classList.contains("wal-window") ? "window" : "");
  const lit = (d) => d instanceof HTMLDialogElement && Object.hasOwn(styles, styleOf(d));

  /* ── A shape, in three dimensions ──
     The part of the element that is drawn, as a corner and two edges in
     CSS px from the window's top left, with height above the page as z.
     Its box is the layout's; its transform and clip are read as computed,
     so whatever is moving it, the shadow is of what is on screen. */
  const len = (v, of) => (v.endsWith("%") ? (parseFloat(v) * of) / 100 : parseFloat(v) || 0);
  const DEG = { deg: 1, rad: 180 / Math.PI, turn: 360, grad: 0.9 };
  const AXIS = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };

  function matrix(cs, w, h) {
    const [ox, oy, oz = 0] = cs.transformOrigin.split(" ").map(parseFloat);
    const m = new DOMMatrix().translateSelf(ox, oy, oz);
    if (cs.translate !== "none") {
      const [x, y = "0", z = "0"] = cs.translate.split(" ");
      m.translateSelf(len(x, w), len(y, h), parseFloat(z));
    }
    if (cs.rotate !== "none") {
      const parts = cs.rotate.split(" "), angle = parts.pop();
      const axis = parts.length === 3 ? parts.map(Number) : AXIS[parts[0] ?? "z"];
      m.rotateAxisAngleSelf(...axis, parseFloat(angle) * DEG[/[a-z]+$/.exec(angle)[0]]);
    }
    if (cs.scale !== "none") {
      const [x, y = x, z = "1"] = cs.scale.split(" ").map((s) => (s.endsWith("%") ? parseFloat(s) / 100 : s));
      m.scaleSelf(+x, +y, +z);
    }
    if (cs.transform !== "none") m.multiplySelf(new DOMMatrix(cs.transform));
    return m.translateSelf(-ox, -oy, -oz);
  }

  // An inset() clip-path crops the box; any other shape casts the whole box.
  function clip(cs, w, h) {
    const m = /^inset\((.*)\)$/.exec(cs.clipPath);
    if (!m) return [0, 0, 0, 0, 0];
    const [edges, round = "0"] = m[1].split(" round ");
    const [t, r = t, b = t, l = r] = edges.trim().split(/\s+/);
    return [len(t, h), len(r, w), len(b, h), len(l, w), parseFloat(round) || 0];
  }

  // Where the box sits in the window's visible area, from the layout, so a
  // transform on the element itself doesn't move it.
  function place(el, stage) {
    let x = 0, y = 0, n = el;
    while (n && n !== stage) {
      x += n.offsetLeft; y += n.offsetTop;
      const p = n.offsetParent;
      if (p && p !== stage) { x += p.clientLeft - p.scrollLeft; y += p.clientTop - p.scrollTop; }
      n = p;
    }
    return n === stage ? [x - stage.scrollLeft, y - stage.scrollTop] : null;
  }

  // The perspective an element's children are drawn through, if any: its
  // distance, and its vanishing point in the window's visible area.
  function perspective(parent, stage) {
    const cs = parent && getComputedStyle(parent);
    if (!cs || cs.perspective === "none") return null;
    const at = place(parent, stage);
    if (!at) return null;
    const [x, y] = cs.perspectiveOrigin.split(" ");
    return { d: parseFloat(cs.perspective), x: at[0] + len(x, parent.offsetWidth), y: at[1] + len(y, parent.offsetHeight) };
  }

  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  function shape(el, lift, stage, held) {
    const w = el.offsetWidth, h = el.offsetHeight, at = w && h && place(el, stage);
    if (!at) return null;
    const cs = getComputedStyle(el);
    const m = matrix(cs, w, h);
    const [ct, cr, cb, cl, round] = clip(cs, w, h);
    const z = held * lift;
    // Seen through its parent's perspective, a part turned toward you looms
    // and one turned away shrinks; its shadow keeps to where it is seen.
    const view = perspective(el.parentElement, stage);
    // A part turned back past where it is held (the notes, folded behind
    // the cover) sinks toward the page as it goes, but never through it.
    const pt = (x, y) => {
      const p = m.transformPoint(new DOMPoint(x, y)), dz = p.z / p.w;
      let X = p.x / p.w + at[0], Y = p.y / p.w + at[1];
      if (view && dz < view.d) {
        const k = view.d / (view.d - dz);
        X = view.x + (X - view.x) * k; Y = view.y + (Y - view.y) * k;
      }
      return [X, Y, dz >= 0 ? z + dz : z * Math.exp(dz / Math.max(z, 1))];
    };
    // Through a perspective the four corners are no longer a parallelogram:
    // this is the one that fits them best, its error split between the near
    // edge and the far one.
    const c = [pt(cl, ct), pt(w - cr, ct), pt(cl, h - cb), pt(w - cr, h - cb)];
    const u = [0, 1, 2].map((i) => (c[1][i] - c[0][i] + c[3][i] - c[2][i]) / 2);
    const v = [0, 1, 2].map((i) => (c[2][i] - c[0][i] + c[3][i] - c[1][i]) / 2);
    const o = [0, 1, 2].map((i) => (c[0][i] + c[1][i] + c[2][i] + c[3][i]) / 4 - (u[i] + v[i]) / 2);
    const size = Math.hypot(...u) * Math.hypot(...v);
    if (!size) return null;
    // Set down on the page, a thing's shadow is the page's own CSS shadow
    // under it, so this one fades out the last little way down.
    let weight = (parseFloat(cs.opacity) || 0) * smooth(0, 0.12, lift);
    // Turned away, a face that hides its back is not there to cast.
    if (cs.backfaceVisibility === "hidden") weight *= smooth(0, 0.25, (u[0] * v[1] - u[1] * v[0]) / size);
    // A rounded corner casts a rounded shadow: soft enough, a square one is the same.
    const radius = Math.max(round, ...["TopLeft", "TopRight", "BottomRight", "BottomLeft"].map((c) => parseFloat(cs[`border${c}Radius`]) || 0));
    const scale = Math.sqrt(size / Math.max(1, (w - cl - cr) * (h - ct - cb)));
    return { o, u, v, weight, floor: radius * scale * 0.5 };
  }

  /* ── The light ──
     For each pixel of the page, how much of each light the shapes keep from
     it. A shape's shadow falls along the light as a parallelogram; inside
     that, each pixel's distance to each edge is measured against how high
     that edge is held there, which says how soft it is, and the two pairs
     of edges multiply. For a flat shape that is exactly a box blurred by
     a Gaussian; for a tilted one, the edge nearer the page is the sharper. */
  const VERTEX = /* glsl */ `
    uniform vec2 uSize;
    varying vec2 vAt;
    void main() {
      vAt = vec2(position.x * 0.5 + 0.5, 0.5 - position.y * 0.5) * uSize;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }`;
  const FRAGMENT = /* glsl */ `
    #define MAX ${MAX}
    uniform int uCount;
    uniform vec4 uKeyAt[MAX], uKeyInv[MAX], uSkyAt[MAX], uSkyInv[MAX], uZ[MAX];
    uniform float uWeight[MAX];
    uniform vec4 uInk, uLight;
    varying vec2 vAt;

    vec2 erf(vec2 x) {
      vec2 s = sign(x), a = abs(x);
      x = 1.0 + (0.278393 + (0.230389 + 0.078108 * (a * a)) * a) * a;
      x *= x;
      return s - s / (x * x);
    }
    // How much of a strip between two edges is in shadow: d is the distance
    // inside each edge, s how soft each is.
    float strip(vec2 d, vec2 s) {
      vec2 e = erf(d / s * 0.70710678);
      return clamp(0.5 * (e.x + e.y), 0.0, 1.0);
    }
    float shade(vec4 at, vec4 inv, vec4 z, float spread) {
      vec2 q = vAt - at.xy;
      float s = dot(inv.xy, q), t = dot(inv.zw, q);
      float sc = clamp(s, 0.0, 1.0), tc = clamp(t, 0.0, 1.0);
      vec4 h = max(vec4(0.0), z.x + vec4(tc * z.z, z.y + tc * z.z, sc * z.y, z.z + sc * z.y));
      vec4 soft = max(vec4(z.w), ${SHARP.toFixed(2)} + spread * h);
      return strip(vec2(s, 1.0 - s) * at.z, soft.xy) * strip(vec2(t, 1.0 - t) * at.w, soft.zw);
    }
    void main() {
      float key = 1.0, sky = 1.0;
      for (int i = 0; i < MAX; i++) {
        if (i >= uCount) break;
        key *= 1.0 - uWeight[i] * shade(uKeyAt[i], uKeyInv[i], uZ[i], uLight.x);
        sky *= 1.0 - uWeight[i] * shade(uSkyAt[i], uSkyInv[i], uZ[i], uLight.y);
      }
      float dark = uInk.a * mix(1.0 - sky, 1.0 - key, uLight.z);
      gl_FragColor = vec4(uInk.rgb * dark, dark);
    }`;

  const keyAt = new Float32Array(MAX * 4), keyInv = new Float32Array(MAX * 4);
  const skyAt = new Float32Array(MAX * 4), skyInv = new Float32Array(MAX * 4);
  const heights = new Float32Array(MAX * 4), weights = new Float32Array(MAX);

  // The parallelogram a shape's shadow falls in, along (dx, dy) per px of
  // height: its corner, its width across each pair of edges, and the
  // inverse of its two edges, which takes a pixel to where it is across them.
  function cast(c, dx, dy, at, inv, i) {
    const j = i * 4;
    const ux = c.u[0] + c.u[2] * dx, uy = c.u[1] + c.u[2] * dy;
    const vx = c.v[0] + c.v[2] * dx, vy = c.v[1] + c.v[2] * dy;
    const det = ux * vy - uy * vx;
    // Edge on to the light, a shape casts nothing.
    if (Math.abs(det) < 0.5) { at.fill(0, j, j + 4); inv.fill(0, j, j + 4); return; }
    at.set([c.o[0] + c.o[2] * dx, c.o[1] + c.o[2] * dy, Math.abs(det) / Math.hypot(vx, vy), Math.abs(det) / Math.hypot(ux, uy)], j);
    inv.set([vy / det, -vx / det, -uy / det, ux / det], j);
  }

  /* ── The canvas ──
     One, moved into whichever window is open and laid under its contents
     (z-index -1 inside the window's own stacking context), so it is over the
     dimmed page and under the spread. It sits on the window's visible area
     and scrolls with it, so the shadow never trails a scroll; once the
     scroll has moved it, it is laid back over the visible area and drawn. */
  let three = null, renderer, scene, camera, uniforms, canvas, stage = null, raf = 0, drawn = [];
  let inkText = "", ink = [0, 0, 0, 0];
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });

  // The ink as computed for the window, light-dark() and all, read as sRGB.
  function inkOf(color) {
    if (color === inkText) return ink;
    inkText = color;
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = "rgb(30 24 18 / 0.4)";
    probe.fillStyle = color;
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;
    return (ink = [r / 255, g / 255, b / 255, a / 255]);
  }

  function draw() {
    const d = stage;
    const w = d.clientWidth, h = d.clientHeight;
    // Written only when they change: a write here would make every read
    // below lay the window out again.
    const left = `${d.scrollLeft}px`, top = `${d.scrollTop}px`;
    if (canvas.style.left !== left) canvas.style.left = left;
    if (canvas.style.top !== top) canvas.style.top = top;
    // A pixel to every two CSS px, and never more than a million and a half.
    const f = Math.min(0.5, Math.sqrt(1.5e6 / Math.max(1, w * h)));
    const bw = Math.max(1, Math.round(w * f)), bh = Math.max(1, Math.round(h * f));
    if (canvas.width !== bw || canvas.height !== bh) renderer.setSize(bw, bh, false);

    const elevation = parseFloat(getComputedStyle(d).getPropertyValue("--wal-elevation"));
    const held = HELD * (Number.isFinite(elevation) ? Math.max(0, elevation) : 1);
    const parts = held > 0 ? styles[styleOf(d)]?.(d) ?? [] : [];
    drawn = [];
    let n = 0;
    for (const { el, lift = 1 } of parts) {
      if (n === MAX) break;
      const c = el && shape(el, lift, d, held);
      if (!c) continue;
      drawn.push(el);
      watch(el);
      if (c.weight <= 0) continue;
      cast(c, light.x, light.y, keyAt, keyInv, n);
      cast(c, 0, 0, skyAt, skyInv, n);
      heights.set([c.o[2], c.u[2], c.v[2], c.floor], n * 4);
      weights[n++] = c.weight;
    }
    uniforms.uCount.value = n;
    uniforms.uSize.value.set(w, h);
    uniforms.uInk.value.fromArray(inkOf(getComputedStyle(canvas).color));
    uniforms.uLight.value.set(light.spread, light.sky, light.key, 0);
    renderer.render(scene, camera);
  }

  const running = (el) => el.getAnimations().some((a) => a.playState === "running");
  function tick() {
    raf = 0;
    if (!stage) return;
    draw();
    if (stage.hasAttribute("data-wal-moving") || drawn.some(running)) wake();
  }
  const wake = () => { if (stage && !raf) raf = requestAnimationFrame(tick); };

  // A window or a shape that changes size (the screen turned, a font
  // arrived) is drawn again. Observed once each: observing again would
  // report again, and draw again, every frame.
  const seen = new Set();
  const resized = new ResizeObserver(() => wake());
  const watch = (el) => { if (!seen.has(el)) { seen.add(el); resized.observe(el); } };
  const WAKERS = ["scroll", "transitionrun", "animationstart"];

  function enter(d) {
    if (stage === d) return wake();
    if (stage) leave();
    stage = d;
    d.append(canvas);
    for (const type of WAKERS) d.addEventListener(type, wake, { passive: true });
    watch(d);
    wake();
  }
  function leave() {
    for (const type of WAKERS) stage.removeEventListener(type, wake);
    resized.disconnect();
    seen.clear();
    canvas.remove();
    cancelAnimationFrame(raf);
    raf = 0;
    stage = null;
  }

  /* ── three.js, when it is wanted ── */
  const load = () =>
    given ? import(/* webpackIgnore: true */ /* @vite-ignore */ given)
      : import("three").catch(() => import(/* webpackIgnore: true */ /* @vite-ignore */ CDN));

  function ready() {
    removeEventListener("pointerover", opens);
    removeEventListener("focusin", opens);
    return (three ??= (async () => {
      const THREE = await load();
      canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      canvas.dataset.walPrint = "skip";
      canvas.style.cssText = "position: absolute; z-index: -1; width: 100%; height: 100%; pointer-events: none; color: var(--wal-depth-ink, oklch(22% 0.03 60 / 0.42))";
      renderer = new THREE.WebGLRenderer({
        canvas, alpha: true, premultipliedAlpha: true, antialias: false,
        depth: false, stencil: false, powerPreference: "low-power",
      });
      renderer.setPixelRatio(1);
      renderer.autoClear = false;
      uniforms = {
        uSize: { value: new THREE.Vector2() },
        uCount: { value: 0 },
        uKeyAt: { value: keyAt }, uKeyInv: { value: keyInv },
        uSkyAt: { value: skyAt }, uSkyInv: { value: skyInv },
        uZ: { value: heights }, uWeight: { value: weights },
        uInk: { value: new THREE.Vector4() },
        uLight: { value: new THREE.Vector4() },
      };
      const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
        uniforms, vertexShader: VERTEX, fragmentShader: FRAGMENT,
        blending: THREE.NoBlending, depthTest: false, depthWrite: false,
      }));
      quad.frustumCulled = false;
      scene = new THREE.Scene().add(quad);
      camera = new THREE.Camera();
      // Compiled, and drawn once, now: a driver may finish a program only
      // when it is first drawn, and the first frame of an opening is no
      // place for that.
      await renderer.compileAsync(scene, camera);
      renderer.render(scene, camera);
      // A lost context gives the window back its CSS shadow.
      canvas.addEventListener("webglcontextlost", () => {
        delete root.dataset.walDepth;
        if (stage) leave();
        three = Promise.resolve(false);
      });
      root.dataset.walDepth = "";
      const open = [...document.querySelectorAll("dialog[open]")].findLast(lit);
      if (open) enter(open);
      return true;
    })().catch(() => false));
  }

  // A window opening, moving or closing.
  new MutationObserver((records) => {
    for (const { target: d } of records) {
      if (!lit(d)) continue;
      if (!d.open) { if (d === stage) leave(); }
      else if (renderer && root.hasAttribute("data-wal-depth")) enter(d);
    }
  }).observe(document, { subtree: true, attributes: true, attributeFilter: ["open", "data-wal-moving"] });

  /* Fetched at idle, so the first opening is lit, and sooner when a hand
     goes to a button that opens a window. Not at all where the movement is
     not played, or the reader is saving data. */
  const wanted = () => !reduce.matches && !navigator.connection?.saveData;
  const opens = (e) => {
    const b = e.target instanceof Element && e.target.closest("[commandfor]");
    if (b && lit(document.getElementById(b.getAttribute("commandfor"))) && wanted()) ready();
  };
  addEventListener("pointerover", opens, { passive: true });
  addEventListener("focusin", opens);
  const idle = () => {
    if (wanted() && [...document.querySelectorAll("dialog[data-wal-open]")].some(lit)) ready();
  };
  const later = () => (window.requestIdleCallback ? requestIdleCallback(idle, { timeout: 4000 }) : setTimeout(idle, 1500));
  if (document.readyState === "complete") later();
  else addEventListener("load", later, { once: true });

  walnut.depth = { styles, light, ready };
})();
