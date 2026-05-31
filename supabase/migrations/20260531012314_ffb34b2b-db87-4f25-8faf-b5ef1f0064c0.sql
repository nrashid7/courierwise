-- Defensive hardening: ensure public roles cannot mutate slabs and cannot read
-- submission logs / reports / verifications. Mirrors the intended RLS posture.

-- courier_rate_slabs: public SELECT only (already enforced via policies). Strip
-- any stray write privileges that may have been granted historically.
REVOKE INSERT, UPDATE, DELETE ON public.courier_rate_slabs FROM anon, authenticated;
GRANT SELECT ON public.courier_rate_slabs TO anon, authenticated;
GRANT ALL ON public.courier_rate_slabs TO service_role;

-- rate_reports: INSERT only for the public; no SELECT/UPDATE/DELETE.
REVOKE SELECT, UPDATE, DELETE ON public.rate_reports FROM anon, authenticated;
GRANT INSERT ON public.rate_reports TO anon, authenticated;
GRANT ALL ON public.rate_reports TO service_role;

-- rate_verifications: INSERT only for the public.
REVOKE SELECT, UPDATE, DELETE ON public.rate_verifications FROM anon, authenticated;
GRANT INSERT ON public.rate_verifications TO anon, authenticated;
GRANT ALL ON public.rate_verifications TO service_role;

-- submission_throttle_log: service_role only.
REVOKE ALL ON public.submission_throttle_log FROM anon, authenticated;
GRANT ALL ON public.submission_throttle_log TO service_role;

-- zone_mappings: public SELECT only (read-only reference data).
REVOKE INSERT, UPDATE, DELETE ON public.zone_mappings FROM anon, authenticated;
GRANT SELECT ON public.zone_mappings TO anon, authenticated;
GRANT ALL ON public.zone_mappings TO service_role;