import { useEffect, useRef } from "react";

/**
 * Calls `handler` whenever the Escape key is pressed — e.g. to close a popup.
 * Uses a ref so the listener is registered once but always runs the latest
 * handler (no stale closures, no re-adding the listener every render).
 */
export function useEscClose(handler: () => void) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") ref.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
