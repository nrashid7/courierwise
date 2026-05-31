// Lightweight event-tracking abstraction. Safe no-op when no provider is wired.
// TODO: Wire a real provider before launch — options:
//   - PostHog  (posthog-js)
//   - Plausible (plausible-tracker / script tag)
//   - Google Analytics 4 (gtag.js)
// Keep this function's signature stable so call sites don't need to change.

export type TrackedEvent =
  | "compare_submitted"
  | "results_viewed"
  | "rate_report_submitted";

const DEBUG =
  typeof import.meta !== "undefined" && (import.meta as any).env?.DEV === true;

export function trackEvent(
  event: TrackedEvent,
  props?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  try {
    // No provider configured yet → no-op in production, log in dev only.
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log(`[analytics] ${event}`, props ?? {});
    }
    // TODO: forward to provider, e.g.
    //   window.posthog?.capture(event, props);
    //   window.plausible?.(event, { props });
    //   window.gtag?.("event", event, props);
  } catch {
    // Never let analytics break the app.
  }
}
