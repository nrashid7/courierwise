# CourierWise — Canonical Rates + Trust Architecture

The current schema/code uses:
- `verification_status` as lowercase enum (`official`, `community_verified`, `estimated`…)
- `confidence_score` as TEXT (`high`/`medium`/`low`)
- Zone strings stored as human-readable text ("Inside Dhaka", "Dhaka Suburbs", "Outside Dhaka", "Outside Dhaka → Outside Dhaka")

You're asking for uppercase enums, numeric confidence, canonical zone keys, rate limiting, admin filters, and a fresh seed. Below is the staged plan.

## 1. Migration (`<new>_canonical_rates.sql`)

Schema changes:
- Drop the lowercase CHECK on `verification_status`; add new CHECK for `VERIFIED`, `COMMUNITY_VERIFIED`, `ESTIMATED`, `OUTDATED`, `DISPUTED`.
- Convert `confidence_score` TEXT → NUMERIC(3,2). Map existing `high→0.95`, `medium→0.7`, `low→0.35` during the type swap (USING clause).
- Add `canonical_zone` TEXT to `courier_rate_slabs` with CHECK in (`INSIDE_DHAKA`, `SUBURBAN`, `OUTSIDE_DHAKA`, `INTER_DISTRICT`). Keep human `zone` column for UI labels.
- Update `zone_mappings.normalized_zone` values to the new enum keys; backfill.
- Add `verification_submissions_log` table (ip text, created_at) for IP throttling on `rate_verifications` + `rate_reports`. RLS: anon insert with rate-limit check via trigger (max 5 per IP per hour).

Seed:
- `DELETE FROM courier_rate_slabs;`
- Re-insert verified May 2026 rates (same numbers as last migration) but with:
  - `verification_status` in new uppercase casing per courier rule (Pathao=VERIFIED/0.95, REDX=COMMUNITY_VERIFIED/0.70, Steadfast 0–1kg=VERIFIED/0.95 & higher=ESTIMATED/0.35+estimated_flag, Delivery Tiger=COMMUNITY_VERIFIED/0.65).
  - `canonical_zone` mapped from zone string.
  - `notes` set to canonical strings ("Verified from official courier pricing", "Community verified by merchants", "Estimated from adjacent courier slabs").
  - Real `source_url` per courier (pathao.com/courier, redx.com.bd, steadfast.com.bd, deliverytiger.com.bd).
  - `last_verified_at = '2026-05-01'`.

## 2. Code changes

- `src/lib/courier.ts`:
  - `ConfidenceScore` → `number` (0..1).
  - `VerificationStatus` uppercase union.
  - `confidenceLabel` rewritten: VERIFIED→"Verified", COMMUNITY_VERIFIED→"Community Verified", ESTIMATED or estimated_flag→"Estimated", and tone derived from `confidence_score` numeric.
  - Add `CanonicalZone` type + `CANONICAL_ZONE_LABELS` map for display.
  - Quote engine unchanged (already correct: overflow ceil, min_charge floor, COD-zero guard).

- `src/lib/slabs.functions.ts`: update Zod schema (`confidence_score: z.number().min(0).max(1)`, uppercase enum, add `canonical_zone` field).

- `src/lib/verifications.functions.ts` + `src/lib/reports.functions.ts`: insert into `verification_submissions_log` and check count(ip, last hour) ≤ 5; throw "Too many submissions, try again later" otherwise. Keep honeypot.

- `src/routes/results.tsx`:
  - Update badge tones to read numeric confidence.
  - Show "Last verified <date>" line + clickable source URL.
  - Add prominent "⚠ Estimated rate" warning chip when `estimated_flag`.

- `src/routes/admin.tsx`:
  - Slab list filters: courier dropdown, verification status dropdown, "Show estimated only" toggle.
  - Update slab form: numeric confidence input, uppercase status options, canonical_zone select.

- `src/routes/compare.tsx`: remove the literal string "Sub-Dhaka" (already migrated to "Dhaka Suburbs" — verify and tidy helper text).

- Grep & remove any remaining `"Sub-Dhaka"` literals.

## 3. Out of scope (explicit)

- No new public API.
- No change to pricing engine math (already correct per last fix).
- No change to `rate_reports` schema beyond the rate-limit log.

## 4. Acceptance

- Migration runs cleanly; confidence_score is numeric; statuses are uppercase.
- Results page shows verified/community/estimated badges with correct tones and source link.
- Admin can filter slabs by courier/status/estimated.
- Submitting >5 verifications/reports from same IP within 1h returns clear error.
- Quote ranking still sorts by `total` ascending; COD=0 → codFee=0.
- No remaining "Sub-Dhaka" or "Sample rate" strings in repo.

Confirm and I'll execute migration + code changes (large multi-file diff).
