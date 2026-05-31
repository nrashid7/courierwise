import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const reportSchema = z.object({
  courier_name: z.string().min(1).max(100),
  zone: z.string().max(100).optional().nullable(),
  issue: z.string().min(3).max(2000),
  actual_amount: z.number().min(0).max(1000000).optional().nullable(),
  user_weight: z.number().min(0).max(1000).optional().nullable(),
  user_cod_amount: z.number().min(0).max(10000000).optional().nullable(),
  screenshot_note: z.string().max(1000).optional().nullable(),
  reporter_contact: z.string().max(200).optional().nullable(),
  website: z.string().max(0, "Spam detected").optional(),
});

export const submitRateReport = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const parsed = reportSchema.safeParse(input);
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
      .eq("kind", "report")
      .gte("created_at", since);
    if ((count ?? 0) >= 5) {
      throw new Error("Too many reports from your network. Please try again later.");
    }
    await supabaseAdmin
      .from("submission_throttle_log")
      .insert({ ip, kind: "report" });
    const { error } = await supabaseAdmin.from("rate_reports").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
