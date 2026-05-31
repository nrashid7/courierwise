import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calculator,
  ChevronDown,
  Copy,
  Info,
  MapPin,
  Package,
  Plus,
  Settings2,
  Trash2,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import {
  CITIES,
  CANONICAL_ZONE_LABELS,
  type CanonicalZone,
  type CourierRateSlab,
  inferZone,
  rankSlabQuotes,
} from "@/lib/courier";
import { trackEvent } from "@/lib/analytics";
import { Disclaimer } from "@/components/Disclaimer";

const CANONICAL_ZONES: CanonicalZone[] = [
  "INSIDE_DHAKA",
  "SUBURBAN",
  "OUTSIDE_DHAKA",
  "INTER_DISTRICT",
];

const MAX_PARCELS = 20;

type ParcelRow = { weight: string; cod: string };

const emptyRow = (): ParcelRow => ({ weight: "", cod: "" });

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare courier rates — CourierWise" },
      {
        name: "description",
        content:
          "Enter pickup, destination, weight, and COD amount to compare estimated Pathao, REDX, Steadfast, and Delivery Tiger rates side by side.",
      },
      { property: "og:title", content: "Compare courier rates — CourierWise" },
      {
        property: "og:description",
        content:
          "Enter pickup, destination, weight, and COD amount to compare Pathao, REDX, Steadfast, and Delivery Tiger rates.",
      },
      { property: "og:url", content: "https://courierwise.lovable.app/compare" },
    ],
    links: [
      { rel: "canonical", href: "https://courierwise.lovable.app/compare" },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState("Dhaka");
  const [destination, setDestination] = useState("Dhaka");
  const [canonicalZone, setCanonicalZone] = useState<CanonicalZone>("INSIDE_DHAKA");
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [mode, setMode] = useState<"single" | "bulk">("single");

  // Auto-infer zone from pickup/destination whenever they change.
  useEffect(() => {
    setCanonicalZone(inferZone(pickup, destination));
  }, [pickup, destination]);

  // Single-mode state
  const [weight, setWeight] = useState("1");
  const [cod, setCod] = useState("0");
  const [productType, setProductType] = useState("");

  // Bulk-mode state
  const [parcels, setParcels] = useState<ParcelRow[]>([
    emptyRow(),
    emptyRow(),
    emptyRow(),
  ]);
  const [bulkSubmitted, setBulkSubmitted] = useState(false);

  const weightNum = Number(weight) || 0;
  const codNum = Number(cod) || 0;
  const overWeight = weightNum > 6;

  const onSubmitSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (weightNum <= 0) {
      toast.error("Weight must be greater than 0.");
      return;
    }
    if (codNum < 0) {
      toast.error("COD amount cannot be negative.");
      return;
    }
    trackEvent("compare_submitted", {
      canonical_zone: canonicalZone,
      zone_label: CANONICAL_ZONE_LABELS[canonicalZone],
      weight: weightNum,
      cod: codNum,
      pickup,
      destination,
    });
    navigate({
      to: "/results",
      search: {
        pickup,
        destination,
        canonicalZone,
        weight: weightNum,
        cod: codNum,
        productType: productType || undefined,
      },
    });
  };

  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4 sm:px-6">
        <Link to="/">
          <Button variant="ghost" size="icon" aria-label="Back to home">
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Button>
        </Link>
        <div>
          <p className="text-sm text-muted-foreground">CourierWise</p>
          <h1 className="text-lg font-semibold tracking-tight">Compare courier rates</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-28 sm:px-6 sm:pb-16">
        <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase text-primary">Quote details</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              Enter the parcel details once. Compare every courier after.
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Use the same details you would give before booking: pickup,
              destination, parcel weight, and COD amount.
            </p>
          </div>

          <div className="mt-5">
            <Disclaimer compact />
          </div>

          {/* Shared route inputs apply to both Single and Bulk */}
          <div className="mt-6 space-y-6">
            <FormSection icon={<MapPin className="h-4 w-4" />} title="Route">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="cmp-pickup" label="Pickup city">
                  <Select value={pickup} onValueChange={setPickup}>
                    <SelectTrigger id="cmp-pickup" className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field id="cmp-destination" label="Destination city">
                  <Select value={destination} onValueChange={setDestination}>
                    <SelectTrigger id="cmp-destination" className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Detected zone:{" "}
                    <span className="font-medium text-foreground/80">
                      {CANONICAL_ZONE_LABELS[canonicalZone]}
                    </span>
                  </p>
                </Field>
              </div>

              <Collapsible open={overrideOpen} onOpenChange={setOverrideOpen}>
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    aria-expanded={overrideOpen}
                    aria-controls="zone-override-panel"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Advanced override
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${overrideOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent
                  id="zone-override-panel"
                  className="mt-3 space-y-3"
                >
                  <Field id="cmp-zone" label="Delivery zone (manual override)">
                    <Select
                      value={canonicalZone}
                      onValueChange={(v) => setCanonicalZone(v as CanonicalZone)}
                    >
                      <SelectTrigger id="cmp-zone" className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CANONICAL_ZONES.map((z) => (
                          <SelectItem key={z} value={z}>{CANONICAL_ZONE_LABELS[z]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <p className="rounded-lg bg-secondary px-3 py-2 text-xs leading-5 text-muted-foreground">
                    Inside Dhaka is Dhaka city only. Dhaka Suburbs covers Gazipur,
                    Savar, Narayanganj, Keraniganj, and Tongi. Outside Dhaka covers
                    Dhaka pickup to other districts. Inter-district covers outside
                    Dhaka to outside Dhaka where available.
                  </p>
                </CollapsibleContent>
              </Collapsible>
            </FormSection>
          </div>

          {/* Mode tabs */}
          <div className="mt-6">
            <Tabs value={mode} onValueChange={(v) => setMode(v as "single" | "bulk")}>
              <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-grid">
                <TabsTrigger value="single">Single Parcel</TabsTrigger>
                <TabsTrigger value="bulk">Bulk Parcels</TabsTrigger>
              </TabsList>

              {/* SINGLE */}
              <TabsContent value="single" className="mt-6">
                <form onSubmit={onSubmitSingle} className="space-y-6">
                  <FormSection icon={<Wallet className="h-4 w-4" />} title="Parcel and payment">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field id="cmp-weight" label="Parcel weight (kg)">
                        <Input
                          id="cmp-weight"
                          className="h-11"
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.1"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          required
                        />
                      </Field>
                      <Field id="cmp-cod" label="COD amount (BDT)">
                        <Input
                          id="cmp-cod"
                          className="h-11"
                          type="number"
                          inputMode="numeric"
                          min="0"
                          step="1"
                          value={cod}
                          onChange={(e) => setCod(e.target.value)}
                        />
                      </Field>
                    </div>

                    {overWeight && (
                      <div className="flex items-start gap-2 rounded-lg border border-warning/35 bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                        <p>Rates above 6kg may vary by courier. Verify before booking.</p>
                      </div>
                    )}

                    <Field id="cmp-product-type" label="Product type (optional)">
                      <Input
                        id="cmp-product-type"
                        className="h-11"
                        value={productType}
                        onChange={(e) => setProductType(e.target.value)}
                        placeholder="e.g. Clothing, Electronics"
                      />
                    </Field>
                  </FormSection>

                  <div className="hidden sm:block">
                    <Button type="submit" size="lg" className="h-12 w-full text-base">
                      <Calculator className="h-5 w-5" aria-hidden="true" />
                      Compare rates
                    </Button>
                  </div>

                  <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 px-4 py-3 backdrop-blur sm:hidden">
                    <Button type="submit" size="lg" className="h-12 w-full text-base">
                      <Calculator className="h-5 w-5" aria-hidden="true" />
                      Compare rates
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* BULK */}
              <TabsContent value="bulk" className="mt-6">
                <BulkParcelMode
                  pickup={pickup}
                  destination={destination}
                  canonicalZone={canonicalZone}
                  parcels={parcels}
                  setParcels={setParcels}
                  submitted={bulkSubmitted}
                  setSubmitted={setBulkSubmitted}
                />
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ------------------------------ BULK MODE ------------------------------ */

function BulkParcelMode({
  pickup,
  destination,
  canonicalZone,
  parcels,
  setParcels,
  submitted,
  setSubmitted,
}: {
  pickup: string;
  destination: string;
  canonicalZone: CanonicalZone;
  parcels: ParcelRow[];
  setParcels: React.Dispatch<React.SetStateAction<ParcelRow[]>>;
  submitted: boolean;
  setSubmitted: (v: boolean) => void;
}) {
  type ValidRow = { index: number; weight: number; cod: number };

  const validRows: ValidRow[] = useMemo(() => {
    const out: ValidRow[] = [];
    parcels.forEach((p, i) => {
      const w = p.weight.trim();
      const c = p.cod.trim();
      if (!w && !c) return; // ignore empty
      const wn = Number(w);
      const cn = c === "" ? 0 : Number(c);
      if (!Number.isFinite(wn) || wn <= 0 || wn > 50) return;
      if (!Number.isFinite(cn) || cn < 0 || cn > 100000) return;
      out.push({ index: i, weight: wn, cod: cn });
    });
    return out;
  }, [parcels]);

  const canCompare = validRows.length > 0;

  // Fetch slabs only when bulk view has been submitted AND there are valid rows.
  const shouldFetch = submitted && canCompare;
  const { data: slabs, isLoading, error } = useQuery({
    queryKey: ["courier_rate_slabs", canonicalZone],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courier_rate_slabs")
        .select("*")
        .eq("active", true)
        .eq("canonical_zone", canonicalZone);
      if (error) throw error;
      return data as CourierRateSlab[];
    },
    enabled: shouldFetch,
  });

  const addRow = () => {
    setParcels((prev) => {
      if (prev.length >= MAX_PARCELS) {
        toast.error("Maximum 20 parcels per bulk quote.");
        return prev;
      }
      return [...prev, emptyRow()];
    });
  };

  const removeRow = (idx: number) => {
    setParcels((prev) =>
      prev.length === 1 ? [emptyRow()] : prev.filter((_, i) => i !== idx),
    );
  };

  const updateRow = (idx: number, patch: Partial<ParcelRow>) => {
    setParcels((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const handleCompare = () => {
    if (!canCompare) return;

    const invalidNonEmpty = parcels.filter((p) => {
      const w = p.weight.trim();
      const c = p.cod.trim();

      // completely empty rows are silently ignored
      if (!w && !c) return false;

      const wn = Number(w);
      const cn = c === "" ? 0 : Number(c);

      const wInvalid =
        !Number.isFinite(wn) ||
        wn <= 0 ||
        wn > 50;

      const cInvalid =
        !Number.isFinite(cn) ||
        cn < 0 ||
        cn > 100000;

      return wInvalid || cInvalid;
    });

    if (invalidNonEmpty.length > 0) {
      toast.warning(
        `${invalidNonEmpty.length} row${
          invalidNonEmpty.length > 1 ? "s" : ""
        } skipped — weight must be 0.1–50 kg and COD must be 0–100,000.`
      );
    }

    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <FormSection icon={<Package className="h-4 w-4" />} title="Parcels">
        <div className="space-y-3">
          {parcels.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_1fr_auto] gap-2 sm:gap-3"
            >
              <div>
                <Label
                  htmlFor={`bulk-w-${i}`}
                  className="text-xs text-muted-foreground"
                >
                  Weight (kg)
                </Label>
                <Input
                  id={`bulk-w-${i}`}
                  className="h-11"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={row.weight}
                  onChange={(e) => updateRow(i, { weight: e.target.value })}
                  placeholder="1"
                />
              </div>
              <div>
                <Label
                  htmlFor={`bulk-c-${i}`}
                  className="text-xs text-muted-foreground"
                >
                  COD (BDT)
                </Label>
                <Input
                  id={`bulk-c-${i}`}
                  className="h-11"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={row.cod}
                  onChange={(e) => updateRow(i, { cod: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 text-muted-foreground"
                  aria-label={`Remove parcel ${i + 1}`}
                  onClick={() => removeRow(i)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRow}
            disabled={parcels.length >= MAX_PARCELS}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add parcel
          </Button>
          <p className="text-xs text-muted-foreground">
            {validRows.length} valid of {parcels.length} rows · max {MAX_PARCELS}
          </p>
        </div>

        <Button
          type="button"
          size="lg"
          className="h-12 w-full text-base"
          onClick={handleCompare}
          disabled={!canCompare}
        >
          <Calculator className="h-5 w-5" aria-hidden="true" />
          Compare bulk rates
        </Button>
      </FormSection>

      {submitted && canCompare && (
        <BulkResults
          pickup={pickup}
          destination={destination}
          canonicalZone={canonicalZone}
          rows={validRows}
          parcels={parcels}
          slabs={slabs}
          isLoading={isLoading}
          error={error as Error | null}
        />
      )}
    </div>
  );
}

/* ----------------------------- BULK RESULTS ----------------------------- */

function BulkResults({
  pickup,
  destination,
  canonicalZone,
  rows,
  parcels,
  slabs,
  isLoading,
  error,
}: {
  pickup: string;
  destination: string;
  canonicalZone: CanonicalZone;
  rows: { index: number; weight: number; cod: number }[];
  parcels: ParcelRow[];
  slabs: CourierRateSlab[] | undefined;
  isLoading: boolean;
  error: Error | null;
}) {
  const zoneLabel = CANONICAL_ZONE_LABELS[canonicalZone];

  // Compute per-row, per-courier totals.
  const { couriers, perRow, totals, usedSlabIds } = useMemo(() => {
    if (!slabs)
      return {
        couriers: [] as string[],
        perRow: [] as Record<string, number>[],
        totals: {} as Record<string, number>,
        usedSlabIds: new Set<string>(),
      };

    const perRow: Record<string, number>[] = [];
    const courierUniverse = new Set<string>();
    const usedSlabIds = new Set<string>();

    for (const r of rows) {
      const quotes = rankSlabQuotes(slabs, {
        canonicalZone,
        weight: r.weight,
        codAmount: r.cod,
      });
      const map: Record<string, number> = {};
      for (const q of quotes) {
        map[q.courier_name] = q.total;
        courierUniverse.add(q.courier_name);
        usedSlabIds.add(q.slab.id);
      }
      perRow.push(map);
    }

    // Only keep couriers that quote every row.
    const couriers = Array.from(courierUniverse).filter((c) =>
      perRow.every((m) => typeof m[c] === "number"),
    );

    const totals: Record<string, number> = {};
    for (const c of couriers) {
      totals[c] = perRow.reduce((sum, m) => sum + (m[c] ?? 0), 0);
    }

    couriers.sort((a, b) => totals[a] - totals[b]);
    return { couriers, perRow, totals, usedSlabIds };
  }, [slabs, rows, canonicalZone]);

  const cheapest = couriers[0];
  const totalWeight = rows.reduce((s, r) => s + r.weight, 0);
  const totalCod = rows.reduce((s, r) => s + r.cod, 0);

  // Dynamic verification label, same logic as results.tsx.
  const verificationLabel = useMemo(() => {
    if (!slabs) return "Rates should be verified before booking";
    let newest: number | null = null;
    for (const s of slabs) {
      if (!usedSlabIds.has(s.id)) continue;
      const raw = s.last_verified_date ?? s.last_verified_at;
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
  }, [slabs, usedSlabIds]);

  // Fire bulk_quote_generated once per successful compute.
  useEffect(() => {
    if (!slabs || couriers.length === 0) return;
    trackEvent("bulk_quote_generated", {
      parcel_count: rows.length,
      canonical_zone: canonicalZone,
      total_cod: totalCod,
      total_weight: totalWeight,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slabs, couriers.length]);

  const handleCopyWhatsApp = async () => {
    try {
      const url = typeof window !== "undefined" ? window.location.href : "";
      const header = `CourierWise Bulk Quote\n\n${rows.length} parcels\n${pickup} → ${destination}`;
      const lines = couriers
        .map((c) => `${c} — ৳${totals[c].toFixed(0)}`)
        .join("\n");
      const savingsLines =
        cheapest && couriers.length > 1
          ? "\n\nEstimated savings:\n" +
            couriers
              .slice(1)
              .map(
                (c) =>
                  `৳${(totals[c] - totals[cheapest]).toFixed(0)} vs ${c}`,
              )
              .join("\n")
          : "";
      const text = `${header}\n\n${lines}${savingsLines}\n\n${verificationLabel}\n${url}`;
      await navigator.clipboard.writeText(text);
      trackEvent("bulk_whatsapp_copied", {
        parcel_count: rows.length,
        cheapest_courier: cheapest,
      });
      toast.success("WhatsApp summary copied");
    } catch {
      toast.error("Couldn't copy summary. Try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
        Calculating bulk quotes…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border bg-card p-5 text-sm text-destructive">
        Couldn't load rates. Please try again.
      </div>
    );
  }

  if (!slabs || couriers.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
        No couriers have published rates covering every parcel for {zoneLabel}.
      </div>
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
      {/* Savings */}
      <div>
        <p className="text-xs font-semibold uppercase text-primary">Bulk summary</p>
        <h3 className="mt-1 text-xl font-bold tracking-tight">
          Best overall courier: {cheapest}
        </h3>
        {couriers.length > 1 && (
          <ul className="mt-2 space-y-0.5 text-sm text-muted-foreground">
            <li className="font-medium text-foreground/80">Estimated savings:</li>
            {couriers.slice(1).map((c) => (
              <li key={c}>
                ৳{(totals[c] - totals[cheapest]).toFixed(0)} vs {c}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          {rows.length} parcels · {pickup} → {destination} · {zoneLabel}
        </p>
      </div>

      {/* Table */}
      <div className="-mx-4 overflow-x-auto sm:mx-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[140px]">Parcel</TableHead>
              {couriers.map((c) => (
                <TableHead
                  key={c}
                  className={`text-right ${
                    c === cheapest
                      ? "border-l border-primary/30 bg-primary/5 text-foreground"
                      : ""
                  }`}
                >
                  {c}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, ri) => (
              <TableRow key={r.index}>
                <TableCell className="font-medium">
                  {parcels[r.index].weight || r.weight}kg / COD ৳
                  {parcels[r.index].cod || r.cod}
                </TableCell>
                {couriers.map((c) => (
                  <TableCell
                    key={c}
                    className={`text-right tabular-nums ${
                      c === cheapest
                        ? "border-l border-primary/30 bg-primary/5"
                        : ""
                    }`}
                  >
                    ৳{(perRow[ri][c] ?? 0).toFixed(0)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter className="sticky bottom-0">
            <TableRow>
              <TableCell className="font-semibold">TOTAL</TableCell>
              {couriers.map((c) => (
                <TableCell
                  key={c}
                  className={`text-right font-semibold tabular-nums ${
                    c === cheapest
                      ? "border-l border-primary/40 bg-primary/10 text-foreground"
                      : ""
                  }`}
                >
                  ৳{totals[c].toFixed(0)}
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">{verificationLabel}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopyWhatsApp}
        >
          <Copy className="h-4 w-4" aria-hidden="true" />
          Copy WhatsApp summary
        </Button>
      </div>
    </section>
  );
}

/* ------------------------------ HELPERS ------------------------------ */

function FormSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          {icon}
        </div>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id?: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      {children}
    </div>
  );
}
