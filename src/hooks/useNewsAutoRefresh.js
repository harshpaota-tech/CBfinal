import { useEffect } from "react";

/** Reload news feed on an interval while the tab is visible (default: every 15 min). */
export default function useNewsAutoRefresh(onRefresh, intervalMs = 15 * 60 * 1000) {
  useEffect(() => {
    if (!onRefresh) return;

    const tick = () => {
      if (document.visibilityState === "visible") onRefresh(true);
    };

    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [onRefresh, intervalMs]);
}
