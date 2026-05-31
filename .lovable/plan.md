## CourierWise — Verified Rates + Intelligence Layer

Large change. Migration-first, then engine + UI. Frontend reads everything from DB.

### 1. DB migration (`courier_rate_slabs` + new tables)

Add columns to `courier_rate_slabs`:
- `verification_status` text check in (`official`,`community_verified`,`estimated`,`outdated`,`disputed`) default `estimated`
- `confidence_score` text check in (`high`,`medium`,`low`) default `low`
- `source_type` text (`official_site`,`merchant_doc`,`community`,`admin_manual`)
- `verified_by` text
- `estimated_flag` boolean default true
- `last_verified_at` timestamptz
- `extra_kg_price` numeric default 0 — enables dynamic per-kg pricing beyond slab max
- `min_charge` numeric default 0 — for Delivery Tiger min-charge model

Allow new zones: extend `Zone` to include `"Dhaka Suburbs"` and `"Outside Dhaka → Outside Dhaka"` (Pathao 4th zone). Keep `"Sub-Dhaka"` as alias of `"Dhaka Suburbs"` — migrate existing rows.

New table `zone_mappings`:
- `district` text, `normalized_zone` text, `courier_name` text nullable (courier-specific overrides)
- Seed: Gazipur, Savar, Narayanganj, Keraniganj, Tongi → `Dhaka Suburbs`; Dhaka → `Inside Dhaka`; others → `Outside Dhaka`.
- GRANTs + RLS public-read.

New table `rate_verifications` (crowd-sourced):
- `slab_id` uuid nullable, `courier_name`, `zone`, `weight`, `submitted_price`, `evidence_url`, `submitter_contact`, `status` (`pending`/`approved`/`rejected`/`merged`), `notes`, `created_at`
- Public insert (validated), admin select/update.

### 2. Seed verified rates

Wipe `courier_rate_slabs` and insert the verified May 2026 rates from the brief:
- **Pathao** (official, high): 4 zones × slabs (0–0.5, 0.5–1, 1–2) + `extra_kg_price` 15/25 by zone. COD 0.5%/1%.
- **REDX** (community_verified, medium): 3 zones × (0–1, 1–2, 2–3). COD 0/1%.
- **Steadfast**: base slab (0–1) marked `official/high`; 1–2, 2–3 slabs marked `estimated/low` with `extra_kg_price` 20. COD 1%.
- **Delivery Tiger** (official/medium): base 0–1 with `min_charge` 75, `extra_kg_price` 20. COD flat 5 inside / max(1%,10) outside — model `cod_fixed_fee`=5 inside, =10 outside with `cod_percent`=0/1.

Each row gets `source_url`, `last_verified_at = '2026-05-01'`.

### 3. Pricing engine (`src/lib/courier.ts`)

Upgrade `rankSlabQuotes`:
- Pick slab where weight falls in range OR weight > max of largest slab → use largest slab + `(weight - max) * extra_kg_price`.
- `deliveryCharge = max(min_charge, slabPrice + overflowKgCharge)`.
- COD unchanged (`max(cod_fixed_fee, codAmount * cod_percent/100)`).
- Return `confidence`, `verification_status`, `source_url`, `last_verified_at` in result for UI.

### 4. UI

**`/compare`**: add Pathao 4th zone option (`Outside Dhaka → Outside Dhaka`). Add helper text for suburbs (use zone_mappings list).

**`/results`**: each courier card shows badge:
- `official` + `high` → green "Verified Official"
- `community_verified` → amber "Community Verified"
- `estimated` → gray "Estimated — verify before use"
- Source link + "Last verified <date>"
- Replace "all sample" banner with "Some rates are estimated — submit corrections" when any estimated slabs are present.

Add "Submit verification" form (separate from existing rate-report) that posts to `rate_verifications`.

**`/admin`**: 
- Slab editor: add fields for verification_status, confidence_score, source_type, extra_kg_price, min_charge.
- New "Verifications" tab listing `rate_verifications` with approve/reject/merge actions.

### 5. Server functions

- `slabs.functions.ts`: extend schema with new fields.
- New `verifications.functions.ts`: `submitVerification` (public), `listVerifications` (admin), `updateVerificationStatus` (admin).
- `rates.functions.ts`: unchanged (still owns `rate_reports`).

### 6. Out of scope (explicit)

- AI recommendation engine
- Merchant analytics
- Auto-scraping
- Courier API integrations
- Volumetric weight / fragile surcharges

These are documented in README as roadmap.

### Acceptance

- Old sample rates gone; DB has verified rates only.
- Pathao 4 zones work, Delivery Tiger min-charge model works, Steadfast >1kg shows "Estimated" badge.
- Results show verification badge + source link.
- Admin can edit verification fields and review crowd submissions.
- Zone mapping table queryable for suburb helper text.
- All rates load from DB; no hardcoded rates in components.

### Files touched

- `supabase/migrations/<new>.sql` (one migration, schema + seed data merged into two calls — migration for schema, insert for data)
- `src/lib/courier.ts` — engine + zones + types
- `src/lib/slabs.functions.ts` — extended schema
- `src/lib/verifications.functions.ts` — new
- `src/routes/compare.tsx` — 4th zone, suburb helper
- `src/routes/results.tsx` — confidence badges, source attribution, verification submit
- `src/routes/admin.tsx` — extended slab editor + verifications tab
- `README.md` — updated rate logic + roadmap