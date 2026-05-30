
CREATE TABLE public.courier_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  courier_name TEXT NOT NULL,
  zone TEXT NOT NULL,
  base_weight_limit NUMERIC NOT NULL DEFAULT 1,
  base_price NUMERIC NOT NULL DEFAULT 0,
  extra_kg_price NUMERIC NOT NULL DEFAULT 0,
  cod_percent NUMERIC NOT NULL DEFAULT 1,
  cod_fixed_fee NUMERIC NOT NULL DEFAULT 0,
  estimated_delivery_time TEXT,
  notes TEXT,
  source_url TEXT,
  last_verified_date DATE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.rate_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  courier_name TEXT NOT NULL,
  zone TEXT,
  issue TEXT NOT NULL,
  actual_amount NUMERIC,
  screenshot_note TEXT,
  reporter_contact TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.courier_rates TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.courier_rates TO authenticated;
GRANT ALL ON public.courier_rates TO service_role;

GRANT INSERT ON public.rate_reports TO anon, authenticated;
GRANT SELECT ON public.rate_reports TO authenticated;
GRANT ALL ON public.rate_reports TO service_role;

ALTER TABLE public.courier_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active rates"
  ON public.courier_rates FOR SELECT
  USING (active = true);

CREATE POLICY "Anyone can submit a rate report"
  ON public.rate_reports FOR INSERT
  WITH CHECK (true);

INSERT INTO public.courier_rates
  (courier_name, zone, base_weight_limit, base_price, extra_kg_price, cod_percent, cod_fixed_fee, estimated_delivery_time, notes, last_verified_date)
VALUES
  ('Pathao', 'Inside Dhaka', 1, 60, 20, 1, 10, '1 day', 'Sample rate — verify before use', CURRENT_DATE),
  ('Pathao', 'Sub-Dhaka', 1, 100, 25, 1, 10, '1-2 days', 'Sample rate — verify before use', CURRENT_DATE),
  ('Pathao', 'Outside Dhaka', 1, 130, 30, 1, 10, '2-3 days', 'Sample rate — verify before use', CURRENT_DATE),
  ('REDX', 'Inside Dhaka', 1, 60, 15, 1, 10, '1 day', 'Sample rate — verify before use', CURRENT_DATE),
  ('REDX', 'Sub-Dhaka', 1, 90, 20, 1, 10, '1-2 days', 'Sample rate — verify before use', CURRENT_DATE),
  ('REDX', 'Outside Dhaka', 1, 120, 25, 1, 10, '2-3 days', 'Sample rate — verify before use', CURRENT_DATE),
  ('Steadfast', 'Inside Dhaka', 1, 60, 15, 1, 10, '1-2 days', 'Sample rate — verify before use', CURRENT_DATE),
  ('Steadfast', 'Sub-Dhaka', 1, 80, 20, 1, 10, '2 days', 'Sample rate — verify before use', CURRENT_DATE),
  ('Steadfast', 'Outside Dhaka', 1, 110, 25, 1, 10, '2-3 days', 'Sample rate — verify before use', CURRENT_DATE),
  ('Delivery Tiger', 'Inside Dhaka', 1, 70, 20, 1, 10, '1-2 days', 'Sample rate — verify before use', CURRENT_DATE),
  ('Delivery Tiger', 'Sub-Dhaka', 1, 100, 25, 1, 10, '2 days', 'Sample rate — verify before use', CURRENT_DATE),
  ('Delivery Tiger', 'Outside Dhaka', 1, 130, 30, 1, 10, '2-4 days', 'Sample rate — verify before use', CURRENT_DATE);
