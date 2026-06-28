/**
 * Coalesces rapid persistence calls (e.g. dragging an object, the color picker firing every
 * ~16ms, repeated font tweaks) into a single disk write per key.
 *
 * Each call replaces any pending write for the same key with the newest value, so only the
 * latest state is written after the debounce window. Pending writes are flushed on a best-effort
 * basis when the window is hidden/unloaded so an edit isn't lost if the app is closed quickly.
 */

const DEBOUNCE_MS = 300;

const timers = new Map<string, ReturnType<typeof setTimeout>>();
const flushers = new Map<string, () => void>();

export function debouncedSave(key: string, run: () => Promise<void>): void {
  const existing = timers.get(key);
  if (existing !== undefined) clearTimeout(existing);

  const flush = () => {
    const timer = timers.get(key);
    if (timer !== undefined) {
      clearTimeout(timer);
      timers.delete(key);
    }
    flushers.delete(key);
    run().catch((error) => console.error("Debounced save failed:", error));
  };

  // Replacing the flusher means the latest captured value wins when the timer fires.
  flushers.set(key, flush);
  timers.set(key, setTimeout(flush, DEBOUNCE_MS));
}

/** Immediately run all pending saves (used before the window unloads). */
export function flushAllSaves(): void {
  for (const flush of Array.from(flushers.values())) {
    flush();
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", flushAllSaves);
  window.addEventListener("pagehide", flushAllSaves);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushAllSaves();
  });
}
