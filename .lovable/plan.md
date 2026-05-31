## Goal

The About and Privacy pages currently read as a flat wall of muted text. The homepage feels alive thanks to: a chip badge, a bold tight headline, a side-by-side hero with a bordered card, feature cards with icon tiles, and crisp section grouping. I'll bring the same visual vocabulary to /about and /privacy without changing copy or routing.

## Shared structure (both pages)

- Keep `MarketingHeader` and `MarketingFooter` (use full `max-w-5xl` to match home).
- Add a **hero block** styled like the homepage hero:
  - Small chip badge with icon (e.g. `BadgeCheck` "About CourierWise" / `ShieldCheck` "Privacy Policy")
  - Large tight headline (`text-4xl sm:text-5xl font-bold tracking-tight`)
  - One-line muted intro paragraph beneath it
  - For Privacy: small "Last updated · May 2026" pill instead of plain text
- Replace plain `<section><h2>` blocks with **bordered content cards** (`rounded-2xl border bg-card p-6 shadow-sm`) like the sample-quote and feature cards on home.
- Each card gets a small **icon tile** (`h-10 w-10 rounded-lg bg-accent text-accent-foreground`) matching the home Feature component, plus title and body.
- Use a **2-column grid** (`sm:grid-cols-2`) for the shorter sections so the page reads as a composed surface rather than a long scroll. Long-form sections stay full width.
- Contact section becomes a highlighted CTA-style card (subtle `bg-secondary` or `bg-accent/40`) with the email rendered as a prominent link, echoing the homepage CTA row.
- Footer stays as-is (already shared).

## About page specifics

Sections rendered as icon-cards:
- Why it exists — `Compass` icon, full width
- How rates work — `Calculator` icon, half width
- Verification & corrections — `BadgeCheck` icon, half width
- What CourierWise is not — `XCircle` icon, half width
- Independent tool note — `ShieldCheck` icon, half width (pulled from the intro's second paragraph for visual balance)
- Contact — accent CTA card, full width

## Privacy page specifics

- Hero: chip "Privacy Policy", headline, muted intro, "Last updated" pill.
- Bulleted sections ("What CourierWise collects", "Why this information is collected") rendered as icon-cards full width with the existing bullet lists — bullets get a small primary-colored dot for polish.
- "What CourierWise does not do" rendered as 3 small stat-style cards in a `sm:grid-cols-3` row (one statement per card) — visually echoes the homepage 4-up Feature row.
- "Verification submissions", "Data retention and security", "Third-party services" as a 3-up icon-card grid.
- Contact: accent CTA card with `privacy@courierwise.app`.

## Files touched

- `src/routes/about.tsx` — restructure JSX, no copy changes, no route changes.
- `src/routes/privacy.tsx` — restructure JSX, no copy changes, no route changes.
- (Optional) small shared `InfoCard` / `IconTile` helper inside each file — kept local, no new shared component file unless it cleans up duplication meaningfully.

## Out of scope

- No copy edits (text stays verbatim from the previous prompt).
- No header/footer changes.
- No new routes, no design tokens added, no new dependencies.

## QA

After implementing, visit `/about` and `/privacy` in the preview at desktop and mobile widths to confirm cards align, icon tiles render, and the contact CTA pops without overwhelming the page.
