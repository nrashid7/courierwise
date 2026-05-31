import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, Clock, Copy, ExternalLink, Flag, Info, MessageCircle, PackageOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  type CourierRateSlab,
  type SlabQuoteResult,
  type CanonicalZone,
  CANONICAL_ZONE_LABELS,
  confidenceLabel,
  legacyZoneToCanonical,
  rankSlabQuotes,
} from "@/lib/courier";
import { submitRateReport } from "@/lib/rates.functions";
import { submitVerification } from "@/lib/verifications.functions";
import { useServerFn } from "@tanstack/react-start";

const CANONICAL_ZONE_ENUM = ["INSIDE_DHAKA", "SUBURBAN", "OUTSIDE_DHAKA", "INTER_DISTRICT"] as const;

type Freshness = {
  label: string;
  tone: "fresh" | "recent" | "stale" | "old";
};

function getFreshness(
  lastVerifiedAt: string | null,
  lastVerifiedDate: string | null,
): Freshness | null {
  const raw = lastVerifiedAt ?? lastVerifiedDate;
  if (!raw) return null;
  const verified = new Date(raw);
  if (Number.isNaN(verified.getTime())) return null;
  const days = Math.floor((Date.now() - verified.getTime()) / 86_400_000);
  const monthDay = verified.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const monthYear = verified.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  if (days <= 7) return { label: "Verified this week", tone: "fresh" };
  if (days <= 30) return { label: `Verified ${monthDay}`, tone: "recent" };
  if (days <= 90) return { label: `Verified ${monthYear}`, tone: "stale" };
  return { label: "Confirm before booking", tone: "old" };
}

const searchSchema = z
  .object({
    pickup: z.string().default("Dhaka"),
    destination: z.string().default("Dhaka"),
    canonicalZone: z.enum(CANONICAL_ZONE_ENUM).default("INSIDE_DHAKA"),
    // Backward-compat: old links used a human zone string.
    zone: z.string().optional(),
    weight: z.number().default(1),
    cod: z.number().default(0),
    productType: z.string().optional(),
  })
  .transform((s) => {
    // If only legacy zone is present, map it to canonical.
    const canonical: CanonicalZone =
      s.canonicalZone ??
      (s.zone ? legacyZoneToCanonical(s.zone) : "INSIDE_DHAKA");
    return {
      pickup: s.pickup,
      destination: s.destination,
      canonicalZone: canonical,
      weight: s.weight,
      cod: s.cod,
      productType: s.productType,
    };
  });

export const Route = createFileRoute("/results")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Results — CourierWise" },
      { name: "description", content: "Cheapest courier options for your parcel." },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const search = Route.useSearch() as {
    pickup: string;
    destination: string;
    canonicalZone: CanonicalZone;
    weight: number;
    cod: number;
    productType?: string;
  };
  const zoneLabel = CANONICAL_ZONE_LABELS[search.canonicalZone];

  const { data, isLoading, error } = useQuery({
    queryKey: ["courier_rate_slabs", search.canonicalZone],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courier_rate_slabs")
        .select("*")
        .eq("active", true)
        .eq("canonical_zone", search.canonicalZone);
      if (error) throw error;
      return data as CourierRateSlab[];
    },
  });

  const [codMode, setCodMode] = useState<"cod" | "prepaid">("cod");
  const effectiveCod = codMode === "prepaid" ? 0 : search.cod;

  const quotes: SlabQuoteResult[] = data
    ? rankSlabQuotes(data, {
        canonicalZone: search.canonicalZone,
        weight: search.weight,
        codAmount: effectiveCod,
      })
    : [];

  useEffect(() => {
    if (!isLoading) {
      trackEvent("results_viewed", {
        canonical_zone: search.canonicalZone,
        zone_label: zoneLabel,
        weight: search.weight,
        cod: effectiveCod,
        cod_mode: codMode,
        resultCount: quotes.length,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, search.canonicalZone, search.weight, effectiveCod, codMode]);

  const hasEstimated =
    quotes.length > 0 &&
    quotes.some(
      (q) =>
        q.slab.verification_status === "ESTIMATED" ||
        q.slab.estimated_flag ||
        q.overflow,
    );


  const weightOverLimit = search.weight > 6;

  const handleCopyLink = async () => {
    try {
      const url = typeof window !== "undefined" ? window.location.href : "";
      await navigator.clipboard.writeText(url);
      toast.success("Quote link copied");
    } catch {
      toast.error("Couldn't copy link. Please copy from the address bar.");
    }
  };

  const verificationLabel = (() => {
    let newest: number | null = null;
    for (const q of quotes) {
      const raw = q.slab.last_verified_date ?? q.slab.last_verified_at;
      if (!raw) continue;
      const t = new Date(raw).getTime();
      if (!Number.isNaN(t) && (newest === null || t > newest)) newest = t;
    }
    if (newest === null) return "Rates should be verified before booking";
    const monthYear = new Date(newest).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    return `Rates verified ${monthYear}`;
  })();

  const handleCopyWhatsApp = async () => {
    try {
      const url = typeof window !== "undefined" ? window.location.href : "";
      const top = quotes.slice(0, 3);
      const codLine =
        codMode === "prepaid"
          ? "Prepaid"
          : `COD ৳${search.cod}`;
      const header = `CourierWise Quote\n${search.weight}kg • ${zoneLabel} • ${codLine}`;
      const lines = top
        .map((q) => `${q.courier_name} — ৳${q.total.toFixed(0)}`)
        .join("\n");
      const footer = `${verificationLabel}\n${url}`;
      const text = `${header}\n\n${lines}\n\n${footer}`;
      await navigator.clipboard.writeText(text);
      toast.success("WhatsApp summary copied");
    } catch {
      toast.error("Couldn't copy summary. Try again.");
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4 sm:px-6">
        <Link to="/compare">
          <Button variant="ghost" size="icon" aria-label="Back to compare form">
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Button>
        </Link>
        <div>
          <p className="text-sm text-muted-foreground">CourierWise</p>
          <h1 className="text-lg font-semibold tracking-tight">Comparison results</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-primary">Quote summary</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">
                {quotes.length > 0
                  ? `${quotes.length} courier options found`
                  : "Checking available rates"}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <SummaryChip label="Route" value={`${search.pickup} to ${search.destination}`} />
                <SummaryChip label="Zone" value={zoneLabel} />
                <SummaryChip label="Weight" value={`${search.weight} kg`} />
                <SummaryChip
                  label="Payment"
                  value={codMode === "prepaid" ? "Prepaid" : `COD ৳${search.cod}`}
                />
              </div>
            </div>

            <div className="inline-flex w-full rounded-xl border bg-muted p-1 text-sm font-medium sm:w-auto">
              <button
                type="button"
                onClick={() => setCodMode("cod")}
                className={`h-9 flex-1 rounded-lg px-3 transition sm:flex-none ${
                  codMode === "cod"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
                aria-pressed={codMode === "cod"}
              >
                With COD
              </button>
              <button
                type="button"
                onClick={() => setCodMode("prepaid")}
                className={`h-9 flex-1 rounded-lg px-3 transition sm:flex-none ${
                  codMode === "prepaid"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
                aria-pressed={codMode === "prepaid"}
              >
                Prepaid
              </button>
            </div>
          </div>
        </section>

        <p className="mt-3 text-xs text-muted-foreground">
          Rates are based on publicly available courier pricing (verified May 2026).
          Final charges may vary by parcel size, remote area surcharges, and courier
          promotions.
        </p>

        {hasEstimated && (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-xs font-medium text-warning-foreground"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
            <p>
              Some rates below are <strong>estimated</strong> — couriers do not publish
              full pricing for every weight slab. Verify with your courier before
              booking, and <strong>submit a correction</strong> using the button on
              any card to help us improve accuracy.
            </p>
          </div>
        )}

        {weightOverLimit && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
            <p>Rates above 6kg may vary by courier. Verify before booking.</p>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-10"
            onClick={handleCopyWhatsApp}
            disabled={quotes.length === 0}
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Copy WhatsApp summary
          </Button>
          <Button variant="outline" size="sm" className="h-10" onClick={handleCopyLink}>
            <Copy className="h-4 w-4" aria-hidden="true" />
            Copy quote link
          </Button>
        </div>

        {isLoading && (
          <div className="mt-4 space-y-3" aria-label="Loading rates">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="h-6 w-20 rounded bg-muted" />
                </div>
                <div className="mt-3 h-3 w-3/4 rounded bg-muted" />
                <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
              </div>
            ))}
          </div>
        )}
        {error && (
          <p className="mt-6 text-center text-sm text-destructive">
            Couldn't load rates. {(error as Error).message}
          </p>
        )}

        {!isLoading && quotes.length > 0 && (
          <div className="mt-6">
            <h2 className="text-base font-semibold tracking-tight">Courier options</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Ranked from lowest total cost to highest.
            </p>
          </div>
        )}

        <div className="mt-3 space-y-3">
          {quotes.map((q, i) => (
            <ResultCard
              key={q.slab.id}
              quote={q}
              rank={i + 1}
              cheapestTotal={quotes[0]?.total ?? q.total}
              canonicalZone={search.canonicalZone}
              zoneLabel={zoneLabel}
              userWeight={search.weight}
              userCod={effectiveCod}
            />
          ))}
          {!isLoading && quotes.length === 0 && (
            <div className="rounded-2xl border bg-card p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <PackageOpen className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-base font-semibold">No rate available yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                We don't have a matching rate for this weight and zone yet.
              </p>
              <Link to="/compare" className="mt-4 inline-block">
                <Button size="sm">Try different details</Button>
              </Link>
              <p className="mt-3 text-xs text-muted-foreground">
                Spotted a missing courier? Help other merchants by reporting it from
                any quote card once rates appear.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link to="/compare">
            <Button variant="outline">Edit details</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full border bg-background px-3 py-1.5">
      <span className="font-medium text-foreground">{label}:</span> {value}
    </span>
  );
}

function ResultCard({
  quote,
  rank,
  cheapestTotal,
  canonicalZone,
  zoneLabel,
  userWeight,
  userCod,
}: {
  quote: SlabQuoteResult;
  rank: number;
  cheapestTotal: number;
  canonicalZone: CanonicalZone;
  zoneLabel: string;
  userWeight: number;
  userCod: number;
}) {
  const cheapest = rank === 1;
  const diff = Math.max(0, Math.round(quote.total - cheapestTotal));
  const conf = confidenceLabel(quote.slab);
  const toneClasses =
    conf.tone === "success"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
      : conf.tone === "warning"
        ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
        : "bg-muted text-muted-foreground border border-border";

  return (
    <div
      className={`rounded-2xl border bg-card shadow-sm transition ${
        cheapest
          ? "border-primary p-4 shadow-primary/10 ring-2 ring-primary/15"
          : "p-3"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {cheapest ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase text-primary-foreground">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Cheapest
              </span>
            ) : (
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                #{rank}
              </span>
            )}
            <h3 className={`font-bold tracking-tight ${cheapest ? "text-lg" : "text-base"}`}>{quote.courier_name}</h3>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${toneClasses}`}
              title={`Verification: ${quote.slab.verification_status} - Confidence: ${quote.slab.confidence_score}`}
            >
              {conf.label}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>{quote.weightRangeLabel}</span>
            {quote.slab.estimated_delivery_time && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {quote.slab.estimated_delivery_time}
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="text-xs font-medium text-muted-foreground">Total</div>
          <div className={`font-black tabular-nums ${cheapest ? "text-2xl" : "text-xl"}`}>
            ৳{quote.total.toFixed(0)}
          </div>
          {!cheapest && diff > 0 && (
            <div className="text-[11px] font-medium text-muted-foreground">
              ৳{diff} more than cheapest
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Stat label="Delivery" value={`৳${quote.deliveryCharge.toFixed(0)}`} />
        <Stat label="COD fee" value={`৳${quote.codFee.toFixed(0)}`} />
      </div>

      {quote.slab.notes && (
        <p className="mt-3 rounded-lg bg-secondary px-3 py-2 text-xs leading-5 text-muted-foreground">
          {quote.slab.notes}
        </p>
      )}

      {quote.courier_name === "Delivery Tiger" && canonicalZone !== "INSIDE_DHAKA" && (
        <p className="mt-2 text-xs text-muted-foreground">
          Flat rate pricing across Bangladesh.
        </p>
      )}

      {(() => {
        const freshness = getFreshness(
          quote.slab.last_verified_at,
          quote.slab.last_verified_date,
        );
        if (!freshness) return null;
        const toneClass =
          freshness.tone === "fresh"
            ? "text-emerald-700 dark:text-emerald-400"
            : freshness.tone === "old"
              ? "text-destructive"
              : "text-muted-foreground";
        return (
          <p
            className={`mt-3 inline-flex items-center gap-1.5 text-xs font-medium ${toneClass}`}
          >
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
            {freshness.label}
          </p>
        );
      })()}

      <div className="mt-4 flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground">
          {quote.slab.source_url && (
            <a
              href={quote.slab.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              View source <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <VerifyDialog
            slabId={quote.slab.id}
            courierName={quote.courier_name}
            canonicalZone={canonicalZone}
            zoneLabel={zoneLabel}
            userWeight={userWeight}
          />
          <ReportDialog
            courierName={quote.courier_name}
            canonicalZone={canonicalZone}
            zoneLabel={zoneLabel}
            userWeight={userWeight}
            userCod={userCod}
          />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary p-3 text-center">
      <div className="text-[11px] font-semibold uppercase text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-base font-bold tabular-nums">{value}</div>
    </div>
  );
}

function ReportDialog({
  courierName,
  canonicalZone,
  zoneLabel,
  userWeight,
  userCod,
}: {
  courierName: string;
  canonicalZone: CanonicalZone;
  zoneLabel: string;
  userWeight: number;
  userCod: number;
}) {
  const [open, setOpen] = useState(false);
  const [issue, setIssue] = useState("");
  const [actual, setActual] = useState("");
  const [screenshotNote, setScreenshotNote] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submit = useServerFn(submitRateReport);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (issue.trim().length < 3) {
      toast.error("Please describe what was wrong.");
      return;
    }
    setSubmitting(true);
    try {
      await submit({
        data: {
          courier_name: courierName,
          zone: canonicalZone,
          issue: issue.trim(),
          actual_amount: actual ? Number(actual) : null,
          user_weight: userWeight,
          user_cod_amount: userCod,
          screenshot_note: screenshotNote.trim() || null,
          reporter_contact: reporterContact.trim() || null,
        },
      });
      trackEvent("rate_report_submitted", {
        courier: courierName,
        canonical_zone: canonicalZone,
        zone_label: zoneLabel,
      });
      toast.success("Thanks — report submitted.");
      setOpen(false);
      setIssue(""); setActual(""); setScreenshotNote(""); setReporterContact("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 text-xs">
          <Flag className="mr-1 h-3 w-3" /> Report wrong rate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report a wrong rate</DialogTitle>
          <DialogDescription>
            Help keep CourierWise accurate. Tell us what's off about the {courierName} rate.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">What was wrong?</Label>
            <Textarea
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="e.g. Base price is now ৳80 inside Dhaka."
              rows={3}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Actual charged amount (BDT, optional)</Label>
            <Input
              type="number"
              min="0"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Screenshot note (optional)</Label>
            <Input
              value={screenshotNote}
              onChange={(e) => setScreenshotNote(e.target.value)}
              placeholder="Describe your screenshot / proof"
            />
            <p className="text-[10px] text-muted-foreground">
              Submitted with weight {userWeight}kg and COD ৳{userCod}. Image upload coming soon.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Your contact (optional)</Label>
            <Input
              value={reporterContact}
              onChange={(e) => setReporterContact(e.target.value)}
              placeholder="Phone, email, or page name — so we can follow up"
              maxLength={200}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Submitting…" : "Submit report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function VerifyDialog({
  slabId,
  courierName,
  canonicalZone,
  zoneLabel,
  userWeight,
}: {
  slabId: string;
  courierName: string;
  canonicalZone: CanonicalZone;
  zoneLabel: string;
  userWeight: number;
}) {
  const [open, setOpen] = useState(false);
  const [submittedPrice, setSubmittedPrice] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [submitterContact, setSubmitterContact] = useState("");
  const [notes, setNotes] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const submit = useServerFn(submitVerification);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittedPrice && !notes.trim()) {
      toast.error("Provide a corrected price or a note.");
      return;
    }
    if (notes.length > 2000) {
      toast.error("Notes must be 2000 characters or fewer.");
      return;
    }
    const trimmedUrl = evidenceUrl.trim();
    if (trimmedUrl) {
      try {
        new URL(trimmedUrl);
      } catch {
        toast.error("Evidence link must be a valid URL (https://…)");
        return;
      }
    }
    setSubmitting(true);
    try {
      await submit({
        data: {
          slab_id: slabId,
          courier_name: courierName,
          zone: canonicalZone,
          weight: userWeight,
          submitted_price: submittedPrice ? Number(submittedPrice) : null,
          evidence_url: trimmedUrl || null,
          submitter_contact: submitterContact.trim() || null,
          notes: notes.trim() || null,
          website,
        },

      });
      toast.success("Thanks — verification submitted for review.");
      setOpen(false);
      setSubmittedPrice(""); setEvidenceUrl(""); setSubmitterContact(""); setNotes(""); setWebsite("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs">
          <BadgeCheck className="mr-1 h-3 w-3" /> Verify
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit a verified rate</DialogTitle>
          <DialogDescription>
            Help confirm or correct the {courierName} rate for {zoneLabel}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", height: 0, overflow: "hidden" }}>
            <Label htmlFor="vd-website">Website</Label>
            <Input
              id="vd-website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Verified price (BDT)</Label>
            <Input
              type="number"
              min="0"
              value={submittedPrice}
              onChange={(e) => setSubmittedPrice(e.target.value)}
              placeholder={`Actual charge for ${userWeight}kg`}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Evidence link (invoice / screenshot URL)</Label>
            <Input
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="https://"
              maxLength={500}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Anything else worth noting"
              maxLength={2000}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Your contact (optional)</Label>
            <Input
              value={submitterContact}
              onChange={(e) => setSubmitterContact(e.target.value)}
              placeholder="Phone, email, or page name"
              maxLength={200}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Submitting…" : "Submit verification"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
