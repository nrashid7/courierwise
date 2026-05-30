# CourierWise

CourierWise is a mobile-first web app that helps Bangladesh f-commerce sellers
compare estimated parcel delivery costs across **Pathao**, **REDX**,
**Steadfast**, and **Delivery Tiger** before booking a courier.

Sellers enter parcel details (zone, weight, COD amount), and the app returns a
ranked list of estimated charges using a manually maintained slab-based rate
table. The cheapest courier is highlighted.

## Tech stack

- **Framework:** TanStack Start v1 (React 19, Vite 7, SSR)
- **Routing:** TanStack Router (file-based routes in `src/routes/`)
- **Data:** TanStack Query
- **UI:** Tailwind CSS v4 + shadcn/ui + lucide-react
- **Backend:** Lovable Cloud (Supabase Postgres + RLS)
- **Server logic:** `createServerFn` (TanStack server functions)

## Required environment variables

Provided automatically by Lovable Cloud:

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | client + server | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | client | Public/anon Supabase key |
| `SUPABASE_URL` | server | Same URL for server fns |
| `SUPABASE_PUBLISHABLE_KEY` | server | Same publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Admin writes (server fns) |

Set manually as a secret:

| Variable | Purpose |
| --- | --- |
| `ADMIN_PASSPHRASE` | Gates `/admin` slab & report management |

## Rate table logic

Rates live in the `courier_rate_slabs` table. Each row defines a weight slab
for one courier + zone:

- `courier_name`, `zone`
- `min_weight`, `max_weight` (kg) — slab is matched when
  `min_weight < weight <= max_weight` (when `min_weight = 0`, the lower bound
  is inclusive)
- `price` (BDT) — base delivery charge for the slab
- `cod_percent`, `cod_fixed_fee` — COD fee is
  `max(cod_fixed_fee, cod_amount * cod_percent / 100)`
- `active` — public results only include active slabs
- `notes`, `source_url`, `last_verified_date` — provenance

Total = `price + cod_fee`. The slab selector sorts each courier's slabs by
`min_weight` ascending and picks the first matching slab.

User-reported corrections land in `rate_reports`.

### Row-level security

- `courier_rate_slabs` — public can `SELECT` only `active = true`. No public
  insert/update/delete. Writes go through `src/lib/slabs.functions.ts` gated
  by `ADMIN_PASSPHRASE`.
- `rate_reports` — public can `INSERT` only (with length validation). No
  public read/update/delete. Reads + reviewed-status updates go through
  `src/lib/reports.functions.ts` gated by `ADMIN_PASSPHRASE`.

## Launch checklist

- [ ] Replace seed slab rows with verified merchant rates per courier and zone
- [ ] Confirm `ADMIN_PASSPHRASE` is set in Lovable Cloud secrets
- [ ] Visit `/admin`, unlock, review/edit all slabs, set
      `last_verified_date`
- [ ] Verify `/compare` → `/results` flow on mobile + desktop
- [ ] Confirm sample-rate disclaimer banner appears on `/results`
- [ ] Submit a test rate report and confirm it shows in `/admin` reports
- [ ] Replace `console.log` in `src/lib/analytics.ts` with a real analytics
      provider
- [ ] Publish via Lovable

## Known limitations

- Rates are **estimates** based on a hand-maintained table; no live courier
  API integration.
- No user accounts, no booking, no payment, no parcel tracking.
- No image upload for "Report wrong rate" (note field only).
- Admin gate is a shared passphrase, not per-user auth.
- Analytics is a `console.log` placeholder — swap in a real SDK before launch.
