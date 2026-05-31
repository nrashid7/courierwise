
DELETE FROM public.courier_rate_slabs WHERE notes = 'Sample rate — verify before use';

INSERT INTO public.courier_rate_slabs
  (courier_name, zone, canonical_zone, min_weight, max_weight, price, cod_percent, cod_fixed_fee, extra_kg_price, min_charge, estimated_flag, verification_status, confidence_score, source_url, last_verified_date, estimated_delivery_time, notes, active)
VALUES
  -- Pathao (VERIFIED 0.95)
  ('Pathao','Inside Dhaka','INSIDE_DHAKA',0,0.5,60,0.5,0,15,60,false,'VERIFIED',0.95,'https://pathao.com/courier/','2026-05-01','24 hours','Verified from official courier pricing',true),
  ('Pathao','Inside Dhaka','INSIDE_DHAKA',0.5,1,70,0.5,0,15,60,false,'VERIFIED',0.95,'https://pathao.com/courier/','2026-05-01','24 hours','Verified from official courier pricing',true),
  ('Pathao','Inside Dhaka','INSIDE_DHAKA',1,2,90,0.5,0,15,60,false,'VERIFIED',0.95,'https://pathao.com/courier/','2026-05-01','24 hours','Verified from official courier pricing',true),
  ('Pathao','Inside Dhaka','INSIDE_DHAKA',2,3,110,0.5,0,15,60,false,'VERIFIED',0.95,'https://pathao.com/courier/','2026-05-01','24 hours','Verified from official courier pricing',true),

  ('Pathao','Dhaka Suburbs','SUBURBAN',0,0.5,80,1,0,25,80,false,'VERIFIED',0.95,'https://pathao.com/courier/','2026-05-01','48–72 hours','Verified from official courier pricing',true),
  ('Pathao','Dhaka Suburbs','SUBURBAN',0.5,1,100,1,0,25,80,false,'VERIFIED',0.95,'https://pathao.com/courier/','2026-05-01','48–72 hours','Verified from official courier pricing',true),
  ('Pathao','Dhaka Suburbs','SUBURBAN',1,2,130,1,0,25,80,false,'VERIFIED',0.95,'https://pathao.com/courier/','2026-05-01','48–72 hours','Verified from official courier pricing',true),
  ('Pathao','Dhaka Suburbs','SUBURBAN',2,3,160,1,0,25,80,false,'VERIFIED',0.95,'https://pathao.com/courier/','2026-05-01','48–72 hours','Verified from official courier pricing',true),

  ('Pathao','Outside Dhaka','OUTSIDE_DHAKA',0,0.5,110,1,0,25,110,false,'VERIFIED',0.95,'https://pathao.com/courier/','2026-05-01','48–72 hours','Verified from official courier pricing',true),
  ('Pathao','Outside Dhaka','OUTSIDE_DHAKA',0.5,1,130,1,0,25,110,false,'VERIFIED',0.95,'https://pathao.com/courier/','2026-05-01','48–72 hours','Verified from official courier pricing',true),
  ('Pathao','Outside Dhaka','OUTSIDE_DHAKA',1,2,170,1,0,25,110,false,'VERIFIED',0.95,'https://pathao.com/courier/','2026-05-01','48–72 hours','Verified from official courier pricing',true),
  ('Pathao','Outside Dhaka','OUTSIDE_DHAKA',2,3,200,1,0,25,110,false,'VERIFIED',0.95,'https://pathao.com/courier/','2026-05-01','48–72 hours','Verified from official courier pricing',true),

  ('Pathao','Outside Dhaka → Outside Dhaka','INTER_DISTRICT',0,0.5,120,1,0,25,120,false,'VERIFIED',0.95,'https://pathao.com/courier/','2026-05-01','48–72 hours','Verified from official courier pricing',true),
  ('Pathao','Outside Dhaka → Outside Dhaka','INTER_DISTRICT',0.5,1,145,1,0,25,120,false,'VERIFIED',0.95,'https://pathao.com/courier/','2026-05-01','48–72 hours','Verified from official courier pricing',true),
  ('Pathao','Outside Dhaka → Outside Dhaka','INTER_DISTRICT',1,2,180,1,0,25,120,false,'VERIFIED',0.95,'https://pathao.com/courier/','2026-05-01','48–72 hours','Verified from official courier pricing',true),
  ('Pathao','Outside Dhaka → Outside Dhaka','INTER_DISTRICT',2,3,210,1,0,25,120,false,'VERIFIED',0.95,'https://pathao.com/courier/','2026-05-01','48–72 hours','Verified from official courier pricing',true),

  -- REDX (COMMUNITY_VERIFIED 0.70)
  ('REDX','Inside Dhaka','INSIDE_DHAKA',0,1,60,0,0,15,60,false,'COMMUNITY_VERIFIED',0.70,'https://redx.com.bd','2026-05-01','24 hours','Community verified by merchants',true),
  ('REDX','Inside Dhaka','INSIDE_DHAKA',1,2,75,0,0,15,60,false,'COMMUNITY_VERIFIED',0.70,'https://redx.com.bd','2026-05-01','24 hours','Community verified by merchants',true),
  ('REDX','Inside Dhaka','INSIDE_DHAKA',2,3,90,0,0,15,60,false,'COMMUNITY_VERIFIED',0.70,'https://redx.com.bd','2026-05-01','24 hours','Community verified by merchants',true),

  ('REDX','Dhaka Suburbs','SUBURBAN',0,1,100,1,0,15,100,false,'COMMUNITY_VERIFIED',0.70,'https://redx.com.bd','2026-05-01','48–72 hours','Community verified by merchants',true),
  ('REDX','Dhaka Suburbs','SUBURBAN',1,2,115,1,0,15,100,false,'COMMUNITY_VERIFIED',0.70,'https://redx.com.bd','2026-05-01','48–72 hours','Community verified by merchants',true),
  ('REDX','Dhaka Suburbs','SUBURBAN',2,3,130,1,0,15,100,false,'COMMUNITY_VERIFIED',0.70,'https://redx.com.bd','2026-05-01','48–72 hours','Community verified by merchants',true),

  ('REDX','Outside Dhaka','OUTSIDE_DHAKA',0,1,130,1,0,20,130,false,'COMMUNITY_VERIFIED',0.70,'https://redx.com.bd','2026-05-01','48–72 hours','Community verified by merchants',true),
  ('REDX','Outside Dhaka','OUTSIDE_DHAKA',1,2,160,1,0,20,130,false,'COMMUNITY_VERIFIED',0.70,'https://redx.com.bd','2026-05-01','48–72 hours','Community verified by merchants',true),
  ('REDX','Outside Dhaka','OUTSIDE_DHAKA',2,3,190,1,0,20,130,false,'COMMUNITY_VERIFIED',0.70,'https://redx.com.bd','2026-05-01','48–72 hours','Community verified by merchants',true),

  -- Steadfast (mixed VERIFIED base + ESTIMATED heavier)
  ('Steadfast','Inside Dhaka','INSIDE_DHAKA',0,1,70,1,0,20,70,false,'VERIFIED',0.95,'https://steadfast.com.bd','2026-05-01','24 hours','Verified from official courier pricing',true),
  ('Steadfast','Inside Dhaka','INSIDE_DHAKA',1,2,90,1,0,20,70,true,'ESTIMATED',0.35,'https://steadfast.com.bd','2026-05-01','24 hours','Estimated from adjacent courier slabs',true),
  ('Steadfast','Inside Dhaka','INSIDE_DHAKA',2,3,110,1,0,20,70,true,'ESTIMATED',0.35,'https://steadfast.com.bd','2026-05-01','24 hours','Estimated from adjacent courier slabs',true),

  ('Steadfast','Dhaka Suburbs','SUBURBAN',0,1,100,1,0,20,100,false,'VERIFIED',0.95,'https://steadfast.com.bd','2026-05-01','48–72 hours','Verified from official courier pricing',true),
  ('Steadfast','Dhaka Suburbs','SUBURBAN',1,2,120,1,0,20,100,true,'ESTIMATED',0.35,'https://steadfast.com.bd','2026-05-01','48–72 hours','Estimated from adjacent courier slabs',true),
  ('Steadfast','Dhaka Suburbs','SUBURBAN',2,3,140,1,0,20,100,true,'ESTIMATED',0.35,'https://steadfast.com.bd','2026-05-01','48–72 hours','Estimated from adjacent courier slabs',true),

  ('Steadfast','Outside Dhaka','OUTSIDE_DHAKA',0,1,130,1,0,20,130,false,'VERIFIED',0.95,'https://steadfast.com.bd','2026-05-01','48–72 hours','Verified from official courier pricing',true),
  ('Steadfast','Outside Dhaka','OUTSIDE_DHAKA',1,2,150,1,0,20,130,true,'ESTIMATED',0.35,'https://steadfast.com.bd','2026-05-01','48–72 hours','Estimated from adjacent courier slabs',true),
  ('Steadfast','Outside Dhaka','OUTSIDE_DHAKA',2,3,170,1,0,20,130,true,'ESTIMATED',0.35,'https://steadfast.com.bd','2026-05-01','48–72 hours','Estimated from adjacent courier slabs',true),

  -- Delivery Tiger (COMMUNITY_VERIFIED 0.65)
  ('Delivery Tiger','Inside Dhaka','INSIDE_DHAKA',0,1,60,0,5,15,60,false,'COMMUNITY_VERIFIED',0.65,'https://deliverytiger.com.bd','2026-05-01','24 hours','Community verified by merchants',true),
  ('Delivery Tiger','Inside Dhaka','INSIDE_DHAKA',1,2,75,0,5,15,60,false,'COMMUNITY_VERIFIED',0.65,'https://deliverytiger.com.bd','2026-05-01','24 hours','Community verified by merchants',true),
  ('Delivery Tiger','Inside Dhaka','INSIDE_DHAKA',2,3,90,0,5,15,60,false,'COMMUNITY_VERIFIED',0.65,'https://deliverytiger.com.bd','2026-05-01','24 hours','Community verified by merchants',true),

  ('Delivery Tiger','Dhaka Suburbs','SUBURBAN',0,1,85,1,0,20,85,false,'COMMUNITY_VERIFIED',0.65,'https://deliverytiger.com.bd','2026-05-01','48–72 hours','Community verified by merchants',true),
  ('Delivery Tiger','Dhaka Suburbs','SUBURBAN',1,2,105,1,0,20,85,false,'COMMUNITY_VERIFIED',0.65,'https://deliverytiger.com.bd','2026-05-01','48–72 hours','Community verified by merchants',true),
  ('Delivery Tiger','Dhaka Suburbs','SUBURBAN',2,3,125,1,0,20,85,false,'COMMUNITY_VERIFIED',0.65,'https://deliverytiger.com.bd','2026-05-01','48–72 hours','Community verified by merchants',true),

  ('Delivery Tiger','Outside Dhaka','OUTSIDE_DHAKA',0,1,85,1,0,20,85,false,'COMMUNITY_VERIFIED',0.65,'https://deliverytiger.com.bd','2026-05-01','48–72 hours','Community verified by merchants',true),
  ('Delivery Tiger','Outside Dhaka','OUTSIDE_DHAKA',1,2,105,1,0,20,85,false,'COMMUNITY_VERIFIED',0.65,'https://deliverytiger.com.bd','2026-05-01','48–72 hours','Community verified by merchants',true),
  ('Delivery Tiger','Outside Dhaka','OUTSIDE_DHAKA',2,3,125,1,0,20,85,false,'COMMUNITY_VERIFIED',0.65,'https://deliverytiger.com.bd','2026-05-01','48–72 hours','Community verified by merchants',true);
