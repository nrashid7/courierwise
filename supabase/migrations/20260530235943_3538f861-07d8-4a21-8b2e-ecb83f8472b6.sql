
-- Extend courier_rate_slabs with verification metadata + dynamic pricing fields
ALTER TABLE public.courier_rate_slabs
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'estimated',
  ADD COLUMN IF NOT EXISTS confidence_score text NOT NULL DEFAULT 'low',
  ADD COLUMN IF NOT EXISTS source_type text,
  ADD COLUMN IF NOT EXISTS verified_by text,
  ADD COLUMN IF NOT EXISTS estimated_flag boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS extra_kg_price numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS min_charge numeric NOT NULL DEFAULT 0;

ALTER TABLE public.courier_rate_slabs
  DROP CONSTRAINT IF EXISTS courier_rate_slabs_verification_status_check;
ALTER TABLE public.courier_rate_slabs
  ADD CONSTRAINT courier_rate_slabs_verification_status_check
  CHECK (verification_status IN ('official','community_verified','estimated','outdated','disputed'));

ALTER TABLE public.courier_rate_slabs
  DROP CONSTRAINT IF EXISTS courier_rate_slabs_confidence_score_check;
ALTER TABLE public.courier_rate_slabs
  ADD CONSTRAINT courier_rate_slabs_confidence_score_check
  CHECK (confidence_score IN ('high','medium','low'));

-- Rename legacy 'Sub-Dhaka' rows to canonical 'Dhaka Suburbs'
UPDATE public.courier_rate_slabs SET zone = 'Dhaka Suburbs' WHERE zone = 'Sub-Dhaka';

-- Zone mapping table
CREATE TABLE IF NOT EXISTS public.zone_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district text NOT NULL,
  normalized_zone text NOT NULL,
  courier_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.zone_mappings TO anon, authenticated;
GRANT ALL ON public.zone_mappings TO service_role;

ALTER TABLE public.zone_mappings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read zone mappings" ON public.zone_mappings;
CREATE POLICY "Anyone can read zone mappings" ON public.zone_mappings
  FOR SELECT USING (true);

-- Crowd-sourced rate verifications
CREATE TABLE IF NOT EXISTS public.rate_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slab_id uuid,
  courier_name text NOT NULL,
  zone text,
  weight numeric,
  submitted_price numeric,
  evidence_url text,
  submitter_contact text,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rate_verifications_status_check
    CHECK (status IN ('pending','approved','rejected','merged'))
);

GRANT SELECT, INSERT ON public.rate_verifications TO anon, authenticated;
GRANT ALL ON public.rate_verifications TO service_role;

ALTER TABLE public.rate_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a verification" ON public.rate_verifications;
CREATE POLICY "Anyone can submit a verification" ON public.rate_verifications
  FOR INSERT WITH CHECK (
    length(courier_name) BETWEEN 1 AND 100
    AND (notes IS NULL OR length(notes) <= 2000)
    AND (evidence_url IS NULL OR length(evidence_url) <= 500)
    AND (submitter_contact IS NULL OR length(submitter_contact) <= 200)
  );

-- Seed zone mappings
INSERT INTO public.zone_mappings (district, normalized_zone) VALUES
  ('Dhaka', 'Inside Dhaka'),
  ('Gazipur', 'Dhaka Suburbs'),
  ('Savar', 'Dhaka Suburbs'),
  ('Narayanganj', 'Dhaka Suburbs'),
  ('Keraniganj', 'Dhaka Suburbs'),
  ('Tongi', 'Dhaka Suburbs'),
  ('Chattogram', 'Outside Dhaka'),
  ('Sylhet', 'Outside Dhaka'),
  ('Khulna', 'Outside Dhaka'),
  ('Rajshahi', 'Outside Dhaka'),
  ('Barishal', 'Outside Dhaka'),
  ('Rangpur', 'Outside Dhaka'),
  ('Mymensingh', 'Outside Dhaka'),
  ('Cumilla', 'Outside Dhaka'),
  ('Cox''s Bazar', 'Outside Dhaka'),
  ('Jessore', 'Outside Dhaka'),
  ('Bogura', 'Outside Dhaka'),
  ('Tangail', 'Outside Dhaka')
ON CONFLICT DO NOTHING;
