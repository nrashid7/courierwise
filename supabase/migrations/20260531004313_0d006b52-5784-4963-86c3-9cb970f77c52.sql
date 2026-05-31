-- 1. Schema: drop old check constraints, change confidence_score TEXT -> NUMERIC, add canonical_zone

-- Drop existing CHECK constraints on courier_rate_slabs (verification_status, confidence_score)
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.courier_rate_slabs'::regclass
      AND contype = 'c'
      AND (pg_get_constraintdef(oid) ILIKE '%verification_status%'
           OR pg_get_constraintdef(oid) ILIKE '%confidence_score%')
  LOOP
    EXECUTE format('ALTER TABLE public.courier_rate_slabs DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

-- Convert confidence_score TEXT -> NUMERIC(3,2)
ALTER TABLE public.courier_rate_slabs
  ALTER COLUMN confidence_score DROP DEFAULT;

ALTER TABLE public.courier_rate_slabs
  ALTER COLUMN confidence_score TYPE numeric(3,2)
  USING CASE
    WHEN confidence_score = 'high' THEN 0.95
    WHEN confidence_score = 'medium' THEN 0.70
    WHEN confidence_score = 'low' THEN 0.35
    ELSE 0.50
  END;

ALTER TABLE public.courier_rate_slabs
  ALTER COLUMN confidence_score SET DEFAULT 0.50;

-- New CHECK constraints with uppercase enum
ALTER TABLE public.courier_rate_slabs
  ADD CONSTRAINT courier_rate_slabs_confidence_range_chk
  CHECK (confidence_score >= 0 AND confidence_score <= 1);

-- Normalize any existing rows to uppercase status before adding check
UPDATE public.courier_rate_slabs SET verification_status =
  CASE upper(verification_status)
    WHEN 'OFFICIAL' THEN 'VERIFIED'
    WHEN 'COMMUNITY_VERIFIED' THEN 'COMMUNITY_VERIFIED'
    WHEN 'ESTIMATED' THEN 'ESTIMATED'
    WHEN 'OUTDATED' THEN 'OUTDATED'
    WHEN 'DISPUTED' THEN 'DISPUTED'
    WHEN 'VERIFIED' THEN 'VERIFIED'
    ELSE 'ESTIMATED'
  END;

ALTER TABLE public.courier_rate_slabs
  ALTER COLUMN verification_status SET DEFAULT 'ESTIMATED';

ALTER TABLE public.courier_rate_slabs
  ADD CONSTRAINT courier_rate_slabs_status_chk
  CHECK (verification_status IN ('VERIFIED','COMMUNITY_VERIFIED','ESTIMATED','OUTDATED','DISPUTED'));

-- Add canonical_zone column
ALTER TABLE public.courier_rate_slabs
  ADD COLUMN IF NOT EXISTS canonical_zone text;

UPDATE public.courier_rate_slabs SET canonical_zone =
  CASE zone
    WHEN 'Inside Dhaka' THEN 'INSIDE_DHAKA'
    WHEN 'Dhaka Suburbs' THEN 'SUBURBAN'
    WHEN 'Sub-Dhaka' THEN 'SUBURBAN'
    WHEN 'Outside Dhaka' THEN 'OUTSIDE_DHAKA'
    WHEN 'Outside Dhaka → Outside Dhaka' THEN 'INTER_DISTRICT'
    ELSE 'OUTSIDE_DHAKA'
  END
WHERE canonical_zone IS NULL;

ALTER TABLE public.courier_rate_slabs
  ALTER COLUMN canonical_zone SET NOT NULL;

ALTER TABLE public.courier_rate_slabs
  ADD CONSTRAINT courier_rate_slabs_canonical_zone_chk
  CHECK (canonical_zone IN ('INSIDE_DHAKA','SUBURBAN','OUTSIDE_DHAKA','INTER_DISTRICT'));

-- 2. Submission throttle log
CREATE TABLE IF NOT EXISTS public.submission_throttle_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('verification','report')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS submission_throttle_log_ip_created_idx
  ON public.submission_throttle_log (ip, kind, created_at DESC);

GRANT SELECT, INSERT ON public.submission_throttle_log TO authenticated;
GRANT ALL ON public.submission_throttle_log TO service_role;

ALTER TABLE public.submission_throttle_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages throttle log"
  ON public.submission_throttle_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Update zone_mappings normalized values to canonical enums
UPDATE public.zone_mappings SET normalized_zone =
  CASE
    WHEN normalized_zone IN ('Inside Dhaka') THEN 'INSIDE_DHAKA'
    WHEN normalized_zone IN ('Dhaka Suburbs','Sub-Dhaka','SUBURBAN','Suburban') THEN 'SUBURBAN'
    WHEN normalized_zone IN ('Outside Dhaka') THEN 'OUTSIDE_DHAKA'
    WHEN normalized_zone IN ('Outside Dhaka → Outside Dhaka','Inter District') THEN 'INTER_DISTRICT'
    ELSE upper(replace(normalized_zone,' ','_'))
  END;