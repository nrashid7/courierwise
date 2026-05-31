import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function checkAdmin(passphrase: string) {
  const expected = process.env.ADMIN_PASSPHRASE;
  if (!expected) throw new Error("ADMIN_PASSPHRASE is not configured");
  if (passphrase !== expected) throw new Error("Unauthorized");
}

export interface RateVerification {
  id: string;
  slab_id: string | null;
  courier_name: string;
  zone: string | null;
  weight: number | null;
  submitted_price: number | null;
  evidence_url: string | null;
  submitter_contact: string | null;
  notes: string | null;
  status: "pending" | "approved" | "rejected" | "merged";
  created_at: string;
}

const submitSchema = z.object({
  slab_id: z.string().uuid().nullable().optional(),
  courier_name: z.string().min(1).max(100),
  zone: z.string().max(100).nullable().optional(),
  weight: z.number().min(0).max(1000).nullable().optional(),
  submitted_price: z.number().min(0).max(1000000).nullable().optional(),
  evidence_url: z.string().max(500).nullable().optional(),
  submitter_contact: z.string().max(200).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export const submitVerification = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => submitSchema.parse(input))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("rate_verifications")
      .insert({ ...data, status: "pending" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listVerifications = createServerFn({ method: "GET" })
  .inputValidator((input: { passphrase: string }) => input)
  .handler(async ({ data }) => {
    checkAdmin(data.passphrase);
    const { data: rows, error } = await supabaseAdmin
      .from("rate_verifications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { verifications: (rows ?? []) as unknown as RateVerification[] };
  });

export const updateVerificationStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        passphrase: z.string(),
        id: z.string().uuid(),
        status: z.enum(["pending", "approved", "rejected", "merged"]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    checkAdmin(data.passphrase);
    const { error } = await supabaseAdmin
      .from("rate_verifications")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
