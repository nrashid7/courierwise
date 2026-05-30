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


const rateSchema = z.object({
  courier_name: z.string().min(1).max(100),
  zone: z.string().min(1).max(50),
  base_weight_limit: z.number().min(0).max(100),
  base_price: z.number().min(0).max(100000),
  extra_kg_price: z.number().min(0).max(10000),
  cod_percent: z.number().min(0).max(100),
  cod_fixed_fee: z.number().min(0).max(10000),
  estimated_delivery_time: z.string().max(100).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  source_url: z.string().max(500).nullable().optional(),
  last_verified_date: z.string().nullable().optional(),
  active: z.boolean(),
});

export const listAllRates = createServerFn({ method: "GET" })
  .inputValidator((input: { passphrase: string }) => input)
  .handler(async ({ data }) => {
    checkAdmin(data.passphrase);
    const { data: rows, error } = await supabaseAdmin
      .from("courier_rates")
      .select("*")
      .order("courier_name")
      .order("zone");
    if (error) throw new Error(error.message);
    return { rates: rows ?? [] };
  });

export const upsertRate = createServerFn({ method: "POST" })
  .inputValidator((input: { passphrase: string; id?: string; rate: unknown }) => ({
    passphrase: String(input.passphrase),
    id: input.id,
    rate: rateSchema.parse(input.rate),
  }))
  .handler(async ({ data }) => {
    checkAdmin(data.passphrase);
    if (data.id) {
      const { error } = await supabaseAdmin
        .from("courier_rates")
        .update({ ...data.rate, updated_at: new Date().toISOString() })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("courier_rates").insert(data.rate);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteRate = createServerFn({ method: "POST" })
  .inputValidator((input: { passphrase: string; id: string }) => input)
  .handler(async ({ data }) => {
    checkAdmin(data.passphrase);
    const { error } = await supabaseAdmin.from("courier_rates").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const reportSchema = z.object({
  courier_name: z.string().min(1).max(100),
  zone: z.string().max(50).optional().nullable(),
  issue: z.string().min(3).max(2000),
  actual_amount: z.number().min(0).max(1000000).optional().nullable(),
  user_weight: z.number().min(0).max(1000).optional().nullable(),
  user_cod_amount: z.number().min(0).max(10000000).optional().nullable(),
  screenshot_note: z.string().max(1000).optional().nullable(),
  reporter_contact: z.string().max(200).optional().nullable(),
});

export const submitRateReport = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => reportSchema.parse(input))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("rate_reports").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
