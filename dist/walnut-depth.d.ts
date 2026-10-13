/* walnut.css · depth, typed
   ─────────────────────────────────────────────────────────────────────────
   walnut-depth.js is a side effect: loading it puts walnut.depth on
   window.walnut. These are its types, so a TypeScript app can import the
   script (import "walnut.css/depth", or a copy of it) and use it without
   declaring anything.
   ───────────────────────────────────────────────────────────────────────── */

/** One thing a window holds up off the page. */
export interface WalnutDepthPart {
  /** The element that casts. Its shape is its layout box, under its own
      transform and inset() clip-path. */
  el: Element;
  /** How high it is held: 0 on the page, 1 at the window's height (set by
      --wal-elevation). Past 1 is higher still. Defaults to 1. */
  lift?: number;
}

/** What a window of one data-wal-open style holds up, asked on every frame
    it moves and once when it lands. */
export type WalnutDepthStyle = (dialog: HTMLDialogElement) => WalnutDepthPart[];

export interface WalnutDepth {
  /** By data-wal-open name. gatefold is built in; add your own here. */
  styles: Record<string, WalnutDepthStyle>;
  /** The light. Change it before a window opens. */
  light: {
    /** How far a shadow falls to the right, per px of height (0.1). */
    x: number;
    /** How far a shadow falls down, per px of height (0.42). */
    y: number;
    /** How much softer the key light's shadow grows per px of height (0.14). */
    spread: number;
    /** The same for the room's light, which falls straight under (0.5). */
    sky: number;
    /** The key light's share of the light; the room has the rest (0.7). */
    key: number;
  };
  /** Fetch three.js now rather than at idle. Resolves to whether the
      light is on: false without WebGL, or if three.js could not load. */
  ready(): Promise<boolean>;
}

declare global {
  interface WalnutGlobal {
    depth?: WalnutDepth;
  }
  interface Window {
    walnut?: WalnutGlobal;
  }
}
