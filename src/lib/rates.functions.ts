import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

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
