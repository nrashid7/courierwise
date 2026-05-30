
# CourierWise — MVP Plan

A mobile-first web app that compares estimated parcel delivery costs across Pathao, REDX, Steadfast, and Delivery Tiger for Bangladesh f-commerce sellers.

## Scope

In: home, compare form, results, admin rate management, "report wrong rate" form, sample seed data, disclaimers.
Out: auth, booking, tracking, live courier APIs, payments.

## Storage

Use Lovable Cloud (Supabase) so rates and reports persist and the admin page is actually useful. Two tables:

- `courier_rates` — id, courier_name, zone, base_weight_limit, base_price, extra_kg_price, cod_percent, cod_fixed_fee, estimated_delivery_time, notes, source_url, last_verified_date, active, created_at.
- `rate_reports` — id, courier_name, issue, actual_amount, screenshot_note, created_at.

RLS: public read on `courier_rates` where `active = true`; public insert on `rate_reports`. Admin mutations on `courier_rates` go through a server function gated by a shared admin passphrase stored as a secret (no real auth, matches "protected-looking" requirement). Seed with sample rows for all 4 couriers × 3 zones.

## Routes (TanStack Start)

- `/` — landing: name, subtitle, description, "Compare Rates" CTA, disclaimer.
- `/compare` — rate comparison form.
- `/results` — results cards, sorted cheapest first, "Cheapest Option" badge, "Report wrong rate" button per card. Form inputs passed via search params so results are shareable/SSR-friendly.
- `/admin` — passphrase gate (local state), then CRUD table for `courier_rates`.

Each route gets its own `head()` metadata.

## Pricing logic (shared util)

For each active courier row matching the selected zone:
```
delivery = base_price
extra = max(0, ceil(weight - base_weight_limit)) * extra_kg_price
cod_fee = max(cod_fixed_fee, cod_amount * cod_percent / 100)
total = delivery + extra + cod_fee
```
Sort ascending by `total`. Mark rank 1 as cheapest.

## UI

shadcn cards, mobile-first, simple lucide icons (Truck, Package, MapPin, BadgeCheck). Sticky disclaimer banner: "Sample rates — verify before use." Clean neutral theme via tokens in `src/styles.css`.

## Form fields

Pickup city, destination city (dropdowns seeded with major BD cities), zone (Inside Dhaka / Sub-Dhaka / Outside Dhaka), weight (kg, number), COD amount (BDT, number), product type (optional text).

## Report-wrong-rate

Dialog opened from a result card, posts to `rate_reports` via a server function. Screenshot field is a placeholder note input only (no upload pipeline in MVP).

## Build order

1. Enable Lovable Cloud, create tables + RLS + seed rates.
2. Shared types + pricing util + city/zone constants.
3. Landing `/` and design tokens.
4. `/compare` form → navigates to `/results` with search params.
5. `/results` querying rates, computing totals, ranking, report dialog.
6. `/admin` passphrase gate + CRUD UI wired to server functions.
7. QA on mobile viewport.

## Technical notes

- Server functions in `src/lib/rates.functions.ts` for list/create/update/delete + report submit; admin mutations check passphrase from request against `ADMIN_PASSPHRASE` secret.
- Client uses TanStack Query (`ensureQueryData` in loaders, `useSuspenseQuery` in components).
- All colors via semantic tokens in `src/styles.css`.
