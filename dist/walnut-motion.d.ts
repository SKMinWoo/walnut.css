/* walnut.css · motion, typed
   ─────────────────────────────────────────────────────────────────────────
   walnut-motion.js is a side effect: loading it puts walnut.open and
   walnut.shuffle on window.walnut. These are their types, so a TypeScript
   app can import the script (import "walnut.css/motion", or a copy of it)
   and call them without declaring anything.
   ───────────────────────────────────────────────────────────────────────── */

/** Opens a window with a movement, from the card that opened it. */
export interface WalnutOpen {
  /**
   * Open `dialog` from `from`, the card whose `[data-wal-art]` (or itself)
   * the cover travels out of. `instant` opens it in place, for a window a
   * link or Back opens; it still goes home to `from` when it closes.
   * Called on a window already open, it changes the card it goes home to.
   */
  (dialog: HTMLDialogElement, from?: Element | null, options?: { instant?: boolean }): void;
  /** Close `dialog`, playing its movement back home to its card. */
  close(dialog: HTMLDialogElement): void;
  /** The movements, by their data-wal-open name. Add your own here. */
  styles: Record<string, WalnutOpenStyle>;
}

export interface WalnutOpenStyle {
  open(dialog: HTMLDialogElement, from: Element): unknown;
  /** May return a function, run once the dialog has closed. */
  close(dialog: HTMLDialogElement, from: Element): unknown;
}

export interface WalnutMotion {
  open: WalnutOpen;
  /**
   * Run `change`, a filter or sort of `list`, so that every item travels to
   * its new place. Returns the view transition, or nothing when the change
   * was simply made (reduced motion, or no view transitions).
   */
  shuffle(list: Element, change: () => void): { ready: Promise<void>; finished: Promise<void> } | undefined;
}

declare global {
  interface Window {
    /** walnut's scripts, each adding its own part as it loads. */
    walnut?: Partial<WalnutMotion>;
  }
}
