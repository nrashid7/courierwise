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
  courier_name: z.string().min(1, "Courier name is required").max(100, "Courier name is too long"),
  zone: z.string().max(100, "Zone is too long").nullable().optional(),
  weight: z.number().min(0).max(1000, "Weight must be 1000 kg or less").nullable().optional(),
  submitted_price: z
    .number()
    .min(0, "Price cannot be negative")
    .max(1000000, "Price is too large")
    .nullable()
    .optional(),
  evidence_url: z
    .string()
    .max(500, "Evidence URL is too long")
    .url("Evidence link must be a valid URL (https://…)")
    .nullable()
    .optional(),
  submitter_contact: z.string().max(200, "Contact is too long").nullable().optional(),
  notes: z.string().max(2000, "Notes must be 2000 characters or fewer").nullable().optional(),
  website: z.string().max(0, "Spam detected").optional(),
});

export const submitVerification = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const parsed = submitSchema.safeParse(input);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid submission";
      throw new Error(msg);
    }
    const { website: _hp, ...rest } = parsed.data;
    return rest;
  })
  .handler(async ({ data }) => {
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    const ip =
      getRequestHeader("cf-connecting-ip") ??
      getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("submission_throttle_log")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .eq("kind", "verification")
      .gte("created_at", since);
    if ((count ?? 0) >= 5) {
      throw new Error("Too many submissions from your network. Please try again later.");
    }
    await supabaseAdmin
      .from("submission_throttle_log")
      .insert({ ip, kind: "verification" });
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
