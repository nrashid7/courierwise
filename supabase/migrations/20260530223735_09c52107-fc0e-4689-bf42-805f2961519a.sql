
-- 1. Create courier_rate_slabs table
CREATE TABLE public.courier_rate_slabs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  courier_name TEXT NOT NULL,
  zone TEXT NOT NULL,
  min_weight NUMERIC NOT NULL,
  max_weight NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  cod_percent NUMERIC NOT NULL DEFAULT 0,
  cod_fixed_fee NUMERIC NOT NULL DEFAULT 0,
  estimated_delivery_time TEXT,
  notes TEXT,
  source_url TEXT,
  last_verified_date DATE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.courier_rate_slabs TO anon;
GRANT SELECT ON public.courier_rate_slabs TO authenticated;
GRANT ALL ON public.courier_rate_slabs TO service_role;

ALTER TABLE public.courier_rate_slabs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active slabs"
  ON public.courier_rate_slabs
  FOR SELECT
  USING (active = true);

CREATE INDEX idx_slabs_lookup ON public.courier_rate_slabs (zone, courier_name, active);

-- 2. Add columns to rate_reports
ALTER TABLE public.rate_reports
  ADD COLUMN IF NOT EXISTS user_weight NUMERIC,
  ADD COLUMN IF NOT EXISTS user_cod_amount NUMERIC;

-- 3. Seed sample slab data
INSERT INTO public.courier_rate_slabs
  (courier_name, zone, min_weight, max_weight, price, cod_percent, cod_fixed_fee, estimated_delivery_time, notes, last_verified_date, active)
VALUES
  -- Pathao
  ('Pathao','Inside Dhaka',0,0.5,60,1,10,'1-2 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Pathao','Inside Dhaka',0.5,1,70,1,10,'1-2 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Pathao','Inside Dhaka',1,2,90,1,10,'1-2 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Pathao','Inside Dhaka',2,3,110,1,10,'1-2 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Pathao','Sub-Dhaka',0,0.5,90,1,10,'2-3 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Pathao','Sub-Dhaka',0.5,1,100,1,10,'2-3 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Pathao','Sub-Dhaka',1,2,125,1,10,'2-3 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Pathao','Sub-Dhaka',2,3,150,1,10,'2-3 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Pathao','Outside Dhaka',0,0.5,110,1,10,'3-5 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Pathao','Outside Dhaka',0.5,1,130,1,10,'3-5 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Pathao','Outside Dhaka',1,2,160,1,10,'3-5 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Pathao','Outside Dhaka',2,3,190,1,10,'3-5 days','Sample rate — verify before use',CURRENT_DATE,true),
  -- REDX
  ('REDX','Inside Dhaka',0,0.5,60,1,10,'1-2 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('REDX','Inside Dhaka',0.5,1,70,1,10,'1-2 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('REDX','Inside Dhaka',1,2,90,1,10,'1-2 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('REDX','Inside Dhaka',2,3,110,1,10,'1-2 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('REDX','Sub-Dhaka',0,0.5,85,1,10,'2-3 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('REDX','Sub-Dhaka',0.5,1,95,1,10,'2-3 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('REDX','Sub-Dhaka',1,2,120,1,10,'2-3 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('REDX','Sub-Dhaka',2,3,145,1,10,'2-3 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('REDX','Outside Dhaka',0,0.5,110,1,10,'3-5 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('REDX','Outside Dhaka',0.5,1,120,1,10,'3-5 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('REDX','Outside Dhaka',1,2,150,1,10,'3-5 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('REDX','Outside Dhaka',2,3,180,1,10,'3-5 days','Sample rate — verify before use',CURRENT_DATE,true),
  -- Steadfast
  ('Steadfast','Inside Dhaka',0,0.5,60,1,10,'1-2 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Steadfast','Inside Dhaka',0.5,1,70,1,10,'1-2 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Steadfast','Inside Dhaka',1,2,90,1,10,'1-2 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Steadfast','Inside Dhaka',2,3,110,1,10,'1-2 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Steadfast','Sub-Dhaka',0,0.5,80,1,10,'2-3 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Steadfast','Sub-Dhaka',0.5,1,90,1,10,'2-3 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Steadfast','Sub-Dhaka',1,2,115,1,10,'2-3 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Steadfast','Sub-Dhaka',2,3,140,1,10,'2-3 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Steadfast','Outside Dhaka',0,0.5,100,1,10,'3-5 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Steadfast','Outside Dhaka',0.5,1,110,1,10,'3-5 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Steadfast','Outside Dhaka',1,2,140,1,10,'3-5 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Steadfast','Outside Dhaka',2,3,170,1,10,'3-5 days','Sample rate — verify before use',CURRENT_DATE,true),
  -- Delivery Tiger
  ('Delivery Tiger','Inside Dhaka',0,0.5,70,1,10,'1-2 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Delivery Tiger','Inside Dhaka',0.5,1,80,1,10,'1-2 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Delivery Tiger','Inside Dhaka',1,2,100,1,10,'1-2 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Delivery Tiger','Inside Dhaka',2,3,125,1,10,'1-2 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Delivery Tiger','Sub-Dhaka',0,0.5,95,1,10,'2-3 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Delivery Tiger','Sub-Dhaka',0.5,1,105,1,10,'2-3 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Delivery Tiger','Sub-Dhaka',1,2,130,1,10,'2-3 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Delivery Tiger','Sub-Dhaka',2,3,160,1,10,'2-3 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Delivery Tiger','Outside Dhaka',0,0.5,120,1,10,'3-5 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Delivery Tiger','Outside Dhaka',0.5,1,130,1,10,'3-5 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Delivery Tiger','Outside Dhaka',1,2,165,1,10,'3-5 days','Sample rate — verify before use',CURRENT_DATE,true),
  ('Delivery Tiger','Outside Dhaka',2,3,200,1,10,'3-5 days','Sample rate — verify before use',CURRENT_DATE,true);
