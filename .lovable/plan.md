# CourierWise — launch readiness review

The app works end to end: home, compare (single + bulk), results, about, privacy, admin. What follows is what I found still missing, verified against the live rate data and the code.

## 1. Rate data gaps (highest impact)

Live active rates today:

```text
Courier          Inside Dhaka  Suburban  Outside Dhaka  Outside→Outside  Weight ceiling
Pathao           yes           yes       yes            yes              2 kg
REDX             yes           yes       yes            MISSING          3 kg
Steadfast        yes           yes       yes            MISSING          3 kg
Delivery Tiger   yes           yes       yes            MISSING          6 kg
```

Consequences merchants will hit on day one:
- Pick "Outside Dhaka to Outside Dhaka" and only Pathao appears — the comparison looks broken.
- Any parcel above each courier's ceiling drops that courier from the list, because no slab has an extra-per-kg price set (all zeros). Above 6 kg every courier disappears and the page shows the empty state, even though the form accepts up to 50 kg.

Fix: add inter-district slabs for the three missing couriers, and add per-extra-kg pricing (or higher slabs) so weights above the ceiling still return a quote. Where no published rate exists, mark the row Estimated rather than leaving a hole.

Also: Steadfast above 1 kg is currently Estimated, not verified — worth confirming before launch since Steadfast is a top-3 choice.

## 2. Analytics is not connected

`src/lib/analytics.ts` is a no-op; events only log in development. Nothing about real usage will be measurable after launch. Needs a provider wired (Plausible or PostHog are the lightest options).

## 3. Contact addresses are invented

About and Privacy link to `hello@courierwise.app` and `privacy@courierwise.app`. I made those up in earlier work — they don't exist. Either give me real addresses (a Gmail is fine) or I'll swap them for a form-free alternative.

## 4. Sitemap and domain

- Sitemap lists only `/`, `/compare`, `/results` — missing `/about` and `/privacy`.
- All URLs are hardcoded to `courierwise.lovable.app`. If a custom domain is planned, sitemap, robots, canonical tags and the share card URL all need updating at the same time.
- Google Search Console is still not connected/verified, so no indexing visibility.

## 5. Admin access

Admin is one shared passphrase typed into a page anyone can reach by URL. Acceptable for a solo launch; not acceptable if a second person ever helps. Worth deciding now whether that stays.

## 6. Nothing to moderate yet

Zero rate reports and zero verifications exist, so the trust loop has never been exercised with real data. Before launch, submit one of each and walk the admin review flow once.

## Suggested order of work

1. Fill the rate gaps (inter-district + above-ceiling pricing).
2. Real contact addresses + sitemap entries.
3. Connect analytics.
4. Domain decision, then Search Console.
5. End-to-end test of report → admin review.

## Technical notes

- Rates live in `courier_rate_slabs`; slab selection picks the first matching `min_weight < w <= max_weight` per courier, so an uncovered weight means no row returned. `extra_kg_price` exists on the table and is 0 everywhere — it is the intended overflow mechanism.
- Zone coverage gap is data-only; `rankSlabQuotes()` and the canonical zone logic need no change.
- Analytics call sites already exist (`compare_submitted`, `results_viewed`, `rate_report_submitted`, `bulk_quote_generated`, `bulk_whatsapp_copied`) — only the provider hook is missing.
