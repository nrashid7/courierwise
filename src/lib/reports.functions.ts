import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function checkAdmin(passphrase: string) {
  const expected = process.env.ADMIN_PASSPHRASE;
  if (!expected) throw new Error("ADMIN_PASSPHRASE is not configured");
  if (passphrase !== expected) throw new Error("Unauthorized");
}

export interface RateReport {
  id: string;
  courier_name: string;
  zone: string | null;
  issue: string;
  actual_amount: number | null;
  user_weight: number | null;
  user_cod_amount: number | null;
  screenshot_note: string | null;
  reporter_contact: string | null;
  reviewed: boolean;
  created_at: string;
}

export const listRateReports = createServerFn({ method: "GET" })
  .inputValidator((input: { passphrase: string }) => input)
  .handler(async ({ data }) => {
    checkAdmin(data.passphrase);
    const { data: rows, error } = await supabaseAdmin
      .from("rate_reports")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[db error]", error);
      throw new Error("A database error occurred. Please try again.");
    }
    return { reports: (rows ?? []) as unknown as RateReport[] };
  });

export const markReportReviewed = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        passphrase: z.string(),
        id: z.string().uuid(),
        reviewed: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    checkAdmin(data.passphrase);
    const { error } = await supabaseAdmin
      .from("rate_reports")
      .update({ reviewed: data.reviewed })
      .eq("id", data.id);
    if (error) {
      console.error("[db error]", error);
      throw new Error("A database error occurred. Please try again.");
    }
    return { ok: true };
  });
