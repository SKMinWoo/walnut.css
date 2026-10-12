/* walnut.css · tabs, typed
   ─────────────────────────────────────────────────────────────────────────
   walnut-tabs.js is a side effect: loading it builds every .wal-tabs on the
   page, handles the keys on every .wal-tablist, and puts walnut.tabs on
   window.walnut. These are its types, so a TypeScript app can import the
   script (import "walnut.css/tabs", or a copy of it) and use them.
   ───────────────────────────────────────────────────────────────────────── */

export interface WalnutTabs {
  /** Build the row of tabs for a .wal-tabs box added after the page loaded. */
  init(box: Element): void;
  /**
   * Open the tab holding `el` (an element, or its id), and any tabs around
   * that one, outermost first. Does nothing for an element in no tab.
   */
  show(el: Element | string | null): void;
}

/** The detail of wal-tabchange, which a .wal-tabs box fires (it bubbles). */
export interface WalnutTabChange {
  tab: HTMLButtonElement;
  panel: HTMLElement;
  index: number;
}

declare global {
  interface WalnutGlobal {
    tabs?: WalnutTabs;
  }
  interface Window {
    walnut?: WalnutGlobal;
  }
  interface HTMLElementEventMap {
    "wal-tabchange": CustomEvent<WalnutTabChange>;
  }
}
