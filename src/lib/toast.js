// Tiny event-bus toast system. No context provider needed — anywhere in the
// app, call showToast(...) and the <ToastHost /> mounted in App.jsx renders it.

const EVENT = "cb:toast";

export function showToast(message, type = "success", durationMs = 4000) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(EVENT, { detail: { message, type, durationMs } })
  );
}

export function subscribeToast(handler) {
  if (typeof window === "undefined") return () => {};
  const fn = (e) => handler(e.detail);
  window.addEventListener(EVENT, fn);
  return () => window.removeEventListener(EVENT, fn);
}
