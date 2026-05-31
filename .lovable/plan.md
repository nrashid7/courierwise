## Feature 1 — Auto Zone Detection

**`src/lib/courier.ts`**
- Add `inferZone(pickup, destination): CanonicalZone` with case-insensitive/trimmed comparisons.
  - Constants: `DHAKA = "dhaka"`, `SUBURBAN = ["gazipur","savar","narayanganj","keraniganj","tongi"]`.
  - Rules in order:
    1. pickup=dhaka & destination=dhaka → `INSIDE_DHAKA`
    2. pickup=dhaka & destination ∈ SUBURBAN → `SUBURBAN`
    3. pickup=dhaka & destination≠dhaka → `OUTSIDE_DHAKA`
    4. fallback (pickup≠dhaka & destination≠dhaka) → `INTER_DISTRICT`
- `legacyZoneToCanonical()` already accepts new + old labels — leave as-is.

**`src/routes/compare.tsx`**
- On every `pickup`/`destination` change, call `setCanonicalZone(inferZone(pickup, destination))` (via `useEffect` on those two values).
- Below destination field show subtle muted text: `Detected zone: {CANONICAL_ZONE_LABELS[canonicalZone]}`.
- Wrap the existing zone `Select` (and the explanatory paragraph) in a collapsed `Collapsible` titled "Advanced override" with proper `aria-expanded` / `aria-controls`. Selector remains fully functional when expanded; manual selection just sets `canonicalZone` directly (auto-infer effect still re-runs if route fields change afterward — acceptable per spec).

## Feature 2 — Bulk Parcel Mode (inline, no new route)

**`src/routes/compare.tsx`** — add Tabs (`Single Parcel` | `Bulk Parcels`), default `single`. Tab state is local `useState` only — not URL, not search params.

Shared inputs (pickup, destination, inferred zone, advanced override) sit above the tabs so they apply to both modes.

### Single tab
Existing form + submit → `/results` navigation, unchanged.

### Bulk tab
- Local state `parcels: { weight: string; cod: string }[]`, init 3 empty rows.
- Mobile-first row UI: weight + COD inputs, remove button per row, "Add parcel" button below.
- Row cap 20; attempt to exceed → `toast.error("Maximum 20 parcels per bulk quote.")`.
- Per-row validation: weight `>0 && <=50`, cod `>=0 && <=100000`. Fully-empty rows ignored. Invalid non-empty rows skipped from compute and surfaced inline.
- Compare button disabled when no valid rows.

#### Data fetching
- Single `useQuery` keyed on `["courier_rate_slabs", canonicalZone]`, runs only when bulk tab is active and there's ≥1 valid row. Same shape as `results.tsx` (active=true + canonical_zone filter). Slabs fetched once, reused for all rows.

#### Compute (in-memory, no extra endpoints)
- For each valid row, run existing `rankSlabQuotes(slabs, { canonicalZone, weight, codAmount })`.
- Aggregate per-courier totals across rows.
- Exclude any courier missing a quote for any included row (prevents broken layout / partial columns).
- Sort couriers by ascending total.

#### Bulk results UI (rendered inline below the form)
1. **Savings header**: "Best overall courier: X" + per-other-courier delta lines (`৳N vs Pathao`).
2. **Results table**: rows = each parcel (`Wkg / COD V`), columns = surviving couriers, sticky `TOTAL` row at bottom. Horizontally scrollable on mobile. Cheapest column gets subtle stronger border/bg via existing tokens.
3. **Copy WhatsApp summary** button. Uses same dynamic `verificationLabel` logic as `results.tsx` (newest `last_verified_date`/`last_verified_at` across the slabs used → `Rates verified {Month YYYY}`, else fallback). URL = `window.location.href` (the `/compare` page) — no placeholder.

#### Analytics
- `bulk_quote_generated` on compute completion (debounced to one fire per submit click): `{ parcel_count, canonical_zone, total_cod, total_weight }`.
- `bulk_whatsapp_copied` on copy success: `{ parcel_count, cheapest_courier }`.

## Out of scope (explicit)
Pricing engine math, ranking logic, single-quote calc, visual redesign, new routes, new DB/API endpoints, accounts/dashboards/booking/tracking, search-param tab persistence, `/results/bulk`.

## Technical notes
- Reuse existing `supabase` client, `rankSlabQuotes`, `CANONICAL_ZONE_LABELS`, `trackEvent`, `Collapsible`, `Tabs`, `Table` shadcn components.
- Keep all styling via semantic tokens (no raw colors).
- No edits to `results.tsx`, pricing files, or DB migrations.
