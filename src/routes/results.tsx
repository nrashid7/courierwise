import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, Clock, ExternalLink, Flag, Info } from "lucide-react";
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
  rankSlabQuotes,
} from "@/lib/courier";
import { submitRateReport } from "@/lib/rates.functions";
import { useServerFn } from "@tanstack/react-start";

const searchSchema = z.object({
  pickup: z.string().default("Dhaka"),
  destination: z.string().default("Dhaka"),
  zone: z.string().default("Inside Dhaka"),
  weight: z.number().default(1),
  cod: z.number().default(0),
  productType: z.string().optional(),
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
  const search = Route.useSearch();

  const { data, isLoading, error } = useQuery({
    queryKey: ["courier_rate_slabs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courier_rate_slabs")
        .select("*")
        .eq("active", true);
      if (error) throw error;
      return data as CourierRateSlab[];
    },
  });

  const quotes: SlabQuoteResult[] = data
    ? rankSlabQuotes(data, {
        zone: search.zone,
        weight: search.weight,
        codAmount: search.cod,
      })
    : [];

  useEffect(() => {
    if (!isLoading) {
      trackEvent("results_viewed", {
        zone: search.zone,
        weight: search.weight,
        cod: search.cod,
        resultCount: quotes.length,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, search.zone, search.weight, search.cod]);

  const allSample =
    quotes.length > 0 &&
    quotes.every((q) =>
      (q.slab.notes ?? "").toLowerCase().includes("sample rate"),
    );

  const weightOverLimit = search.weight > 3;

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-4">
        <Link to="/compare">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold">Comparison results</h1>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-16">
        <div className="rounded-xl border bg-card p-3 text-xs text-muted-foreground">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span><span className="text-foreground font-medium">Zone:</span> {search.zone}</span>
            <span><span className="text-foreground font-medium">Weight:</span> {search.weight} kg</span>
            <span><span className="text-foreground font-medium">COD:</span> ৳{search.cod}</span>
            <span><span className="text-foreground font-medium">Route:</span> {search.pickup} → {search.destination}</span>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Rates are estimates based on manually maintained courier rate tables.
        </p>

        {allSample && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <p>
              These rates are sample placeholders. Replace with verified merchant
              rates before public launch.
            </p>
          </div>
        )}

        {weightOverLimit && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <p>Rates above 3kg may vary by courier. Verify before booking.</p>
          </div>
        )}

        {isLoading && (
          <p className="mt-6 text-center text-sm text-muted-foreground">Loading rates…</p>
        )}
        {error && (
          <p className="mt-6 text-center text-sm text-destructive">
            Couldn't load rates. {(error as Error).message}
          </p>
        )}

        <div className="mt-4 space-y-3">
          {quotes.map((q, i) => (
            <ResultCard
              key={q.slab.id}
              quote={q}
              rank={i + 1}
              zone={search.zone}
              userWeight={search.weight}
              userCod={search.cod}
            />
          ))}
          {!isLoading && quotes.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              No rate available for this weight and zone yet.
            </p>
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

function ResultCard({
  quote,
  rank,
  zone,
  userWeight,
  userCod,
}: {
  quote: SlabQuoteResult;
  rank: number;
  zone: string;
  userWeight: number;
  userCod: number;
}) {
  const cheapest = rank === 1;
  return (
    <div
      className={`rounded-xl border bg-card p-4 ${cheapest ? "border-primary ring-1 ring-primary/30" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">#{rank}</span>
            <h3 className="text-base font-semibold">{quote.courier_name}</h3>
            {cheapest && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                <BadgeCheck className="h-3 w-3" />
                Cheapest
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {quote.weightRangeLabel}
          </p>
          {quote.slab.estimated_delivery_time && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {quote.slab.estimated_delivery_time}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="text-xl font-bold">৳{quote.total.toFixed(0)}</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <Stat label="Delivery" value={`৳${quote.deliveryCharge.toFixed(0)}`} />
        <Stat label="COD fee" value={`৳${quote.codFee.toFixed(0)}`} />
      </div>

      {quote.slab.notes && (
        <p className="mt-3 text-xs text-muted-foreground">{quote.slab.notes}</p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5 text-[11px] text-muted-foreground">
          {quote.slab.last_verified_date && (
            <span>Last verified: {quote.slab.last_verified_date}</span>
          )}
          {quote.slab.source_url && (
            <a
              href={quote.slab.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              Source <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        <ReportDialog
          courierName={quote.courier_name}
          zone={zone}
          userWeight={userWeight}
          userCod={userCod}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted p-2 text-center">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}

function ReportDialog({
  courierName,
  zone,
  userWeight,
  userCod,
}: {
  courierName: string;
  zone: string;
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
          zone,
          issue: issue.trim(),
          actual_amount: actual ? Number(actual) : null,
          user_weight: userWeight,
          user_cod_amount: userCod,
          screenshot_note: screenshotNote.trim() || null,
          reporter_contact: reporterContact.trim() || null,
        },
      });
      trackEvent("rate_report_submitted", { courier: courierName, zone });
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
