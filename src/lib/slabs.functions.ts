import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function checkAdmin(passphrase: string) {
  const expected = process.env.ADMIN_PASSPHRASE;
  if (!expected) {
    throw new Error("ADMIN_PASSPHRASE is not configured");
  }
  if (passphrase !== expected) {
    throw new Error("Unauthorized");
  }
}

const slabSchema = z.object({
  courier_name: z.string().min(1).max(100),
  zone: z.string().min(1).max(100),
  canonical_zone: z
    .enum(["INSIDE_DHAKA", "SUBURBAN", "OUTSIDE_DHAKA", "INTER_DISTRICT"])
    .default("INSIDE_DHAKA"),
  min_weight: z.number().min(0).max(1000),
  max_weight: z.number().min(0).max(1000),
  price: z.number().min(0).max(1000000),
  cod_percent: z.number().min(0).max(100),
  cod_fixed_fee: z.number().min(0).max(100000),
  extra_kg_price: z.number().min(0).max(100000).default(0),
  min_charge: z.number().min(0).max(100000).default(0),
  estimated_delivery_time: z.string().max(100).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  source_url: z.string().max(500).nullable().optional(),
  source_type: z.string().max(50).nullable().optional(),
  verification_status: z
    .enum(["VERIFIED", "COMMUNITY_VERIFIED", "ESTIMATED", "OUTDATED", "DISPUTED"])
    .default("ESTIMATED"),
  confidence_score: z.number().min(0).max(1).default(0.35),
  estimated_flag: z.boolean().default(true),
  verified_by: z.string().max(200).nullable().optional(),
  last_verified_date: z.string().nullable().optional(),
  active: z.boolean(),
});

export const listAllSlabs = createServerFn({ method: "GET" })
  .inputValidator((input: { passphrase: string }) => input)
  .handler(async ({ data }) => {
    checkAdmin(data.passphrase);
    const { data: rows, error } = await supabaseAdmin
      .from("courier_rate_slabs")
      .select("*")
      .order("courier_name")
      .order("zone")
      .order("min_weight");
    if (error) throw new Error(error.message);
    return { slabs: rows ?? [] };
  });

export const upsertSlab = createServerFn({ method: "POST" })
  .inputValidator((input: { passphrase: string; id?: string; slab: unknown }) => ({
    passphrase: String(input.passphrase),
    id: input.id,
    slab: slabSchema.parse(input.slab),
  }))
  .handler(async ({ data }) => {
    checkAdmin(data.passphrase);
    if (data.slab.max_weight <= data.slab.min_weight) {
      throw new Error("max_weight must be greater than min_weight");
    }

    const { data: existing, error: exErr } = await supabaseAdmin
      .from("courier_rate_slabs")
      .select("id, min_weight, max_weight")
      .eq("courier_name", data.slab.courier_name)
      .eq("zone", data.slab.zone);
    if (exErr) throw new Error(exErr.message);

    const overlaps = (existing ?? []).some((row) => {
      if (data.id && row.id === data.id) return false;
      return (
        Number(row.min_weight) < data.slab.max_weight &&
        Number(row.max_weight) > data.slab.min_weight
      );
    });
    if (overlaps) {
      throw new Error(
        "This slab overlaps with an existing slab for this courier and zone.",
      );
    }

    const payload = {
      ...data.slab,
      last_verified_at: new Date().toISOString(),
    };

    if (data.id) {
      const { error } = await supabaseAdmin
        .from("courier_rate_slabs")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("courier_rate_slabs")
        .insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteSlab = createServerFn({ method: "POST" })
  .inputValidator((input: { passphrase: string; id: string }) => input)
  .handler(async ({ data }) => {
    checkAdmin(data.passphrase);
    const { error } = await supabaseAdmin
      .from("courier_rate_slabs")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleSlabActive = createServerFn({ method: "POST" })
  .inputValidator((input: { passphrase: string; id: string; active: boolean }) => input)
  .handler(async ({ data }) => {
    checkAdmin(data.passphrase);
    const { error } = await supabaseAdmin
      .from("courier_rate_slabs")
      .update({ active: data.active, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
