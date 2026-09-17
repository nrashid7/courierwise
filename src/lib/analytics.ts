// Lightweight event-tracking abstraction.
//
// Provider wiring is opt-in through environment variables so no analytics
// script loads unless a provider is actually configured:
//
//   VITE_PLAUSIBLE_DOMAIN  e.g. "courierwise.lovable.app"
//   VITE_POSTHOG_KEY       e.g. "phc_..."  (optional VITE_POSTHOG_HOST)
//   VITE_GA4_ID            e.g. "G-XXXXXXX"
//
// With none set, tracking stays a safe no-op (dev-only console logging).

export type TrackedEvent =
  | "compare_submitted"
  | "results_viewed"
  | "rate_report_submitted"
  | "bulk_quote_generated"
  | "bulk_whatsapp_copied";

type Env = Record<string, string | undefined>;

const env: Env =
  typeof import.meta !== "undefined" ? ((import.meta as any).env ?? {}) : {};

const DEBUG = env.DEV === true || (env as any).DEV === true;

const PLAUSIBLE_DOMAIN = env.VITE_PLAUSIBLE_DOMAIN;
const POSTHOG_KEY = env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = env.VITE_POSTHOG_HOST ?? "https://us.i.posthog.com";
const GA4_ID = env.VITE_GA4_ID;

let initialised = false;

function loadScript(src: string, attrs: Record<string, string> = {}) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const el = document.createElement("script");
  el.src = src;
  el.defer = true;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.head.appendChild(el);
}

/** Loads whichever provider is configured. Safe to call repeatedly. */
export function initAnalytics() {
  if (typeof window === "undefined" || initialised) return;
  initialised = true;
  try {
    if (PLAUSIBLE_DOMAIN) {
      loadScript("https://plausible.io/js/script.js", {
        "data-domain": PLAUSIBLE_DOMAIN,
      });
      (window as any).plausible =
        (window as any).plausible ||
        function (...args: unknown[]) {
          ((window as any).plausible.q = (window as any).plausible.q || []).push(
            args,
          );
        };
    }

    if (GA4_ID) {
      loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`);
      (window as any).dataLayer = (window as any).dataLayer || [];
      const gtag = function (...args: unknown[]) {
        (window as any).dataLayer.push(args);
      };
      (window as any).gtag = (window as any).gtag || gtag;
      (window as any).gtag("js", new Date());
      (window as any).gtag("config", GA4_ID);
    }

    if (POSTHOG_KEY) {
      void import("posthog-js")
        .then(({ default: posthog }) => {
          posthog.init(POSTHOG_KEY, { api_host: POSTHOG_HOST });
          (window as any).posthog = posthog;
        })
        .catch(() => {
          /* posthog-js not installed — ignore */
        });
    }
  } catch {
    // Never let analytics break the app.
  }
}

export function trackEvent(
  event: TrackedEvent,
  props?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  try {
    initAnalytics();

    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log(`[analytics] ${event}`, props ?? {});
    }

    (window as any).plausible?.(event, { props });
    (window as any).posthog?.capture?.(event, props);
    (window as any).gtag?.("event", event, props);
  } catch {
    // Never let analytics break the app.
  }
}
