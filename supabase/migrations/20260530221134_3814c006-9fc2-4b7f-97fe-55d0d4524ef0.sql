
DROP POLICY "Anyone can submit a rate report" ON public.rate_reports;

CREATE POLICY "Anyone can submit a valid rate report"
  ON public.rate_reports FOR INSERT
  WITH CHECK (
    length(courier_name) BETWEEN 1 AND 100
    AND length(issue) BETWEEN 3 AND 2000
    AND (screenshot_note IS NULL OR length(screenshot_note) <= 1000)
    AND (reporter_contact IS NULL OR length(reporter_contact) <= 200)
  );
