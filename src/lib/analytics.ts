// Lightweight event-tracking placeholder. Swap console.log for a real
// analytics SDK (PostHog, Plausible, GA4) when launching.
export type TrackedEvent =
  | "compare_submitted"
  | "results_viewed"
  | "rate_report_submitted";

export function trackEvent(
  event: TrackedEvent,
  props?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line no-console
  console.log(`[analytics] ${event}`, props ?? {});
}
