ALTER TABLE public.rate_verifications
  ADD CONSTRAINT rate_verifications_evidence_url_protocol_chk
  CHECK (evidence_url IS NULL OR evidence_url ~* '^https://');

DROP POLICY IF EXISTS "Anyone can submit a verification" ON public.rate_verifications;

CREATE POLICY "Anyone can submit a verification"
ON public.rate_verifications
FOR INSERT
TO public
WITH CHECK (
  length(courier_name) >= 1 AND length(courier_name) <= 100
  AND (notes IS NULL OR length(notes) <= 2000)
  AND (evidence_url IS NULL OR (length(evidence_url) <= 500 AND evidence_url ~* '^https://'))
  AND (submitter_contact IS NULL OR length(submitter_contact) <= 200)
);