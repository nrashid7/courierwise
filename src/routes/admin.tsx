import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Pencil, Plus, Trash2, Lock } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  COURIERS,
  ZONES,
  VERIFICATION_STATUSES,
  CANONICAL_ZONE_LABELS,
  type CanonicalZone,
  type CourierRateSlab,
  type VerificationStatus,
} from "@/lib/courier";

function zoneToCanonical(zone: string): CanonicalZone {
  switch (zone) {
    case "Inside Dhaka":
      return "INSIDE_DHAKA";
    case "Dhaka Suburbs":
      return "SUBURBAN";
    case "Outside Dhaka":
      return "OUTSIDE_DHAKA";
    case "Outside Dhaka → Outside Dhaka":
      return "INTER_DISTRICT";
    default:
      return "INSIDE_DHAKA";
  }
}
import {
  deleteSlab,
  listAllSlabs,
  toggleSlabActive,
  upsertSlab,
} from "@/lib/slabs.functions";
import {
  listRateReports,
  markReportReviewed,
  type RateReport,
} from "@/lib/reports.functions";
import {
  listVerifications,
  updateVerificationStatus,
  type RateVerification,
} from "@/lib/verifications.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — CourierWise" },
      { name: "description", content: "Manage courier rate slabs." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [passphrase, setPassphrase] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState("");

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background">
        <header className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-4">
          <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <h1 className="text-lg font-semibold">Admin</h1>
        </header>
        <main className="mx-auto max-w-sm px-4 pt-10">
          <div className="rounded-xl border bg-card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="mt-3 text-base font-semibold">Enter admin passphrase</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Required to view and edit courier slab rates.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPassphrase(input);
                setUnlocked(true);
              }}
              className="mt-4 space-y-3"
            >
              <Input
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Passphrase"
                autoFocus
              />
              <Button type="submit" className="w-full">Unlock</Button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return <AdminPanel passphrase={passphrase} onLock={() => { setUnlocked(false); setInput(""); }} />;
}

function AdminPanel({ passphrase, onLock }: { passphrase: string; onLock: () => void }) {
  const qc = useQueryClient();
  const list = useServerFn(listAllSlabs);
  const [courierFilter, setCourierFilter] = useState<string>("all");
  const [zoneFilter, setZoneFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [estimatedOnly, setEstimatedOnly] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin_slabs"],
    queryFn: () => list({ data: { passphrase } }),
    retry: false,
  });

  const filtered = useMemo(() => {
    const all = (data?.slabs ?? []) as unknown as CourierRateSlab[];
    return all.filter((s) => {
      if (courierFilter !== "all" && s.courier_name !== courierFilter) return false;
      if (zoneFilter !== "all" && s.zone !== zoneFilter) return false;
      if (statusFilter !== "all" && s.verification_status !== statusFilter) return false;
      if (estimatedOnly && !s.estimated_flag) return false;
      return true;
    });
  }, [data, courierFilter, zoneFilter, statusFilter, estimatedOnly]);

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-sm px-4 pt-10 text-center">
          <p className="text-sm text-destructive">{(error as Error).message}</p>
          <Button className="mt-4" onClick={onLock}>Try again</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 py-4">
        <div className="flex items-center gap-2">
          <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <h1 className="text-lg font-semibold">Slab rate management</h1>
        </div>
        <div className="flex gap-2">
          <SlabDialog
            passphrase={passphrase}
            onSaved={() => qc.invalidateQueries({ queryKey: ["admin_slabs"] })}
            trigger={<Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add slab</Button>}
          />
          <Button variant="outline" size="sm" onClick={onLock}>Lock</Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pb-16">
        <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label className="text-xs">Courier</Label>
            <Select value={courierFilter} onValueChange={setCourierFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All couriers</SelectItem>
                {COURIERS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Zone</Label>
            <Select value={zoneFilter} onValueChange={setZoneFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All zones</SelectItem>
                {ZONES.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Verification</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {VERIFICATION_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2 pb-1">
            <Switch checked={estimatedOnly} onCheckedChange={setEstimatedOnly} id="est-only" />
            <Label htmlFor="est-only" className="text-xs">Estimated only</Label>
          </div>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        <div className="space-y-2">
          {filtered.map((s) => (
            <SlabRow
              key={s.id}
              slab={s}
              passphrase={passphrase}
              onChanged={() => qc.invalidateQueries({ queryKey: ["admin_slabs"] })}
            />
          ))}
          {!isLoading && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">No slabs match your filters.</p>
          )}
        </div>
        <ReportsSection passphrase={passphrase} />
        <VerificationsSection passphrase={passphrase} />
      </main>
    </div>
  );
}

function ReportsSection({ passphrase }: { passphrase: string }) {
  const qc = useQueryClient();
  const list = useServerFn(listRateReports);
  const mark = useServerFn(markReportReviewed);
  const [showReviewed, setShowReviewed] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin_reports"],
    queryFn: () => list({ data: { passphrase } }),
    retry: false,
  });

  const markMut = useMutation({
    mutationFn: (vars: { id: string; reviewed: boolean }) =>
      mark({ data: { passphrase, ...vars } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin_reports"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const reports = (data?.reports ?? []) as RateReport[];
  const visible = showReviewed ? reports : reports.filter((r) => !r.reviewed);

  return (
    <section className="mt-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">User-submitted reports</h2>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Switch checked={showReviewed} onCheckedChange={setShowReviewed} />
          Show reviewed
        </label>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading reports…</p>}
      {error && (
        <p className="text-sm text-destructive">{(error as Error).message}</p>
      )}

      <div className="space-y-2">
        {visible.map((r) => (
          <div key={r.id} className="rounded-xl border bg-card p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{r.courier_name}</span>
              {r.zone && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {r.zone}
                </span>
              )}
              {r.reviewed && (
                <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-accent-foreground">
                  reviewed
                </span>
              )}
              <span className="ml-auto text-[11px] text-muted-foreground">
                {new Date(r.created_at).toLocaleString()}
              </span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm">{r.issue}</p>
            <div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
              {r.actual_amount != null && <span>Actual charged: ৳{r.actual_amount}</span>}
              {r.user_weight != null && <span>User weight: {r.user_weight} kg</span>}
              {r.user_cod_amount != null && <span>User COD: ৳{r.user_cod_amount}</span>}
              {r.reporter_contact && <span>Contact: {r.reporter_contact}</span>}
              {r.screenshot_note && (
                <span className="sm:col-span-2">Screenshot note: {r.screenshot_note}</span>
              )}
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                variant={r.reviewed ? "outline" : "default"}
                onClick={() =>
                  markMut.mutate({ id: r.id, reviewed: !r.reviewed })
                }
                disabled={markMut.isPending}
              >
                {r.reviewed ? "Mark as unreviewed" : "Mark as reviewed"}
              </Button>
            </div>
          </div>
        ))}
        {!isLoading && visible.length === 0 && (
          <p className="text-sm text-muted-foreground">No reports to show.</p>
        )}
      </div>
    </section>
  );
}

function SlabRow({
  slab,
  passphrase,
  onChanged,
}: {
  slab: CourierRateSlab;
  passphrase: string;
  onChanged: () => void;
}) {
  const del = useServerFn(deleteSlab);
  const toggle = useServerFn(toggleSlabActive);
  const delMut = useMutation({
    mutationFn: () => del({ data: { passphrase, id: slab.id } }),
    onSuccess: () => { toast.success("Deleted"); onChanged(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const toggleMut = useMutation({
    mutationFn: (active: boolean) => toggle({ data: { passphrase, id: slab.id, active } }),
    onSuccess: () => onChanged(),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{slab.courier_name}</span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              {slab.zone}
            </span>
            <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
              {slab.min_weight}–{slab.max_weight} kg
            </span>
            {!slab.active && (
              <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-destructive">
                inactive
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            ৳{slab.price} · COD {slab.cod_percent}% (min ৳{slab.cod_fixed_fee})
            {slab.estimated_delivery_time && <> · {slab.estimated_delivery_time}</>}
          </div>
          {slab.last_verified_date && (
            <div className="mt-1 text-[11px] text-muted-foreground">
              Last verified: {slab.last_verified_date}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Switch
            checked={slab.active}
            onCheckedChange={(v) => toggleMut.mutate(v)}
            aria-label="Active"
          />
          <SlabDialog
            passphrase={passphrase}
            initial={slab}
            onSaved={onChanged}
            trigger={
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Pencil className="h-4 w-4" />
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => {
              if (confirm("Delete this slab?")) delMut.mutate();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function SlabDialog({
  passphrase,
  initial,
  onSaved,
  trigger,
}: {
  passphrase: string;
  initial?: CourierRateSlab;
  onSaved: () => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [courier, setCourier] = useState<string>(initial?.courier_name ?? COURIERS[0]);
  const [zone, setZone] = useState<string>(initial?.zone ?? ZONES[0]);
  const [minWeight, setMinWeight] = useState(String(initial?.min_weight ?? 0));
  const [maxWeight, setMaxWeight] = useState(String(initial?.max_weight ?? 0.5));
  const [price, setPrice] = useState(String(initial?.price ?? 60));
  const [extraKgPrice, setExtraKgPrice] = useState(String(initial?.extra_kg_price ?? 0));
  const [minCharge, setMinCharge] = useState(String(initial?.min_charge ?? 0));
  const [codPercent, setCodPercent] = useState(String(initial?.cod_percent ?? 1));
  const [codFixed, setCodFixed] = useState(String(initial?.cod_fixed_fee ?? 10));
  const [eta, setEta] = useState(initial?.estimated_delivery_time ?? "1-2 days");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [sourceUrl, setSourceUrl] = useState(initial?.source_url ?? "");
  const [sourceType, setSourceType] = useState(initial?.source_type ?? "official_site");
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(
    (initial?.verification_status as VerificationStatus) ?? "ESTIMATED",
  );
  const [confidence, setConfidence] = useState<string>(
    String(initial?.confidence_score ?? 0.35),
  );
  const [estimatedFlag, setEstimatedFlag] = useState(initial?.estimated_flag ?? true);
  const [verifiedBy, setVerifiedBy] = useState(initial?.verified_by ?? "");
  const [verified, setVerified] = useState(
    initial?.last_verified_date ?? new Date().toISOString().slice(0, 10),
  );
  const [active, setActive] = useState(initial?.active ?? true);

  const upsert = useServerFn(upsertSlab);
  const mut = useMutation({
    mutationFn: () =>
      upsert({
        data: {
          passphrase,
          id: initial?.id,
          slab: {
            courier_name: courier,
            zone,
            min_weight: Number(minWeight) || 0,
            max_weight: Number(maxWeight) || 0,
            price: Number(price) || 0,
            extra_kg_price: Number(extraKgPrice) || 0,
            min_charge: Number(minCharge) || 0,
            cod_percent: Number(codPercent) || 0,
            cod_fixed_fee: Number(codFixed) || 0,
            estimated_delivery_time: eta || null,
            notes: notes || null,
            source_url: sourceUrl || null,
            source_type: sourceType || null,
            verification_status: verificationStatus,
            confidence_score: confidence,
            estimated_flag: estimatedFlag,
            verified_by: verifiedBy || null,
            last_verified_date: verified || null,
            active,
          },
        },
      }),
    onSuccess: () => {
      toast.success(initial ? "Updated" : "Created");
      setOpen(false);
      onSaved();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit slab" : "Add slab"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => { e.preventDefault(); mut.mutate(); }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label="Courier">
              <Select value={courier} onValueChange={setCourier}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COURIERS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Zone">
              <Select value={zone} onValueChange={setZone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ZONES.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Min weight (kg)">
              <Input type="number" step="0.1" value={minWeight} onChange={(e) => setMinWeight(e.target.value)} />
            </Field>
            <Field label="Max weight (kg)">
              <Input type="number" step="0.1" value={maxWeight} onChange={(e) => setMaxWeight(e.target.value)} />
            </Field>
            <Field label="Price (BDT)">
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            </Field>
            <Field label="Extra kg price (BDT)">
              <Input type="number" value={extraKgPrice} onChange={(e) => setExtraKgPrice(e.target.value)} />
            </Field>
            <Field label="Min charge (BDT)">
              <Input type="number" value={minCharge} onChange={(e) => setMinCharge(e.target.value)} />
            </Field>
            <Field label="COD percent (%)">
              <Input type="number" step="0.1" value={codPercent} onChange={(e) => setCodPercent(e.target.value)} />
            </Field>
            <Field label="COD fixed fee (BDT)">
              <Input type="number" value={codFixed} onChange={(e) => setCodFixed(e.target.value)} />
            </Field>
            <Field label="Est. delivery time">
              <Input value={eta} onChange={(e) => setEta(e.target.value)} />
            </Field>
            <Field label="Verification status">
              <Select value={verificationStatus} onValueChange={(v) => setVerificationStatus(v as typeof verificationStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="official">Official</SelectItem>
                  <SelectItem value="community_verified">Community verified</SelectItem>
                  <SelectItem value="estimated">Estimated</SelectItem>
                  <SelectItem value="outdated">Outdated</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Confidence">
              <Select value={confidence} onValueChange={(v) => setConfidence(v as typeof confidence)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Source type">
              <Select value={sourceType ?? "official_site"} onValueChange={setSourceType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="official_site">Official site</SelectItem>
                  <SelectItem value="merchant_doc">Merchant doc</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="admin_manual">Admin manual</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Estimated flag">
              <Select value={estimatedFlag ? "yes" : "no"} onValueChange={(v) => setEstimatedFlag(v === "yes")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Estimated</SelectItem>
                  <SelectItem value="no">Not estimated</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Last verified date">
              <Input type="date" value={verified} onChange={(e) => setVerified(e.target.value)} />
            </Field>
            <Field label="Active">
              <Select value={active ? "yes" : "no"} onValueChange={(v) => setActive(v === "yes")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Active</SelectItem>
                  <SelectItem value="no">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Verified by">
            <Input value={verifiedBy} onChange={(e) => setVerifiedBy(e.target.value)} placeholder="Name / source" />
          </Field>
          <Field label="Source URL">
            <Input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://" />
          </Field>
          <Field label="Notes">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </Field>
          <DialogFooter>
            <Button type="submit" disabled={mut.isPending} className="w-full">
              {mut.isPending ? "Saving…" : "Save slab"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function VerificationsSection({ passphrase }: { passphrase: string }) {
  const qc = useQueryClient();
  const list = useServerFn(listVerifications);
  const updateStatus = useServerFn(updateVerificationStatus);
  const [showAll, setShowAll] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin_verifications"],
    queryFn: () => list({ data: { passphrase } }),
    retry: false,
  });

  const mut = useMutation({
    mutationFn: (vars: { id: string; status: RateVerification["status"] }) =>
      updateStatus({ data: { passphrase, ...vars } }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["admin_verifications"] });
      if (vars.status === "merged") {
        toast.message("Status changed to merged. Update the actual slab manually if needed.");
      } else {
        toast.success(`Status updated to ${vars.status}.`);
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const verifications = (data?.verifications ?? []) as RateVerification[];
  const visible = showAll ? verifications : verifications.filter((v) => v.status === "pending");

  return (
    <section className="mt-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">Crowd-sourced rate verifications</h2>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Switch checked={showAll} onCheckedChange={setShowAll} />
          Show all statuses
        </label>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading verifications…</p>}
      {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}

      <div className="space-y-2">
        {visible.map((v) => (
          <div key={v.id} className="rounded-xl border bg-card p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{v.courier_name}</span>
              {v.zone && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {v.zone}
                </span>
              )}
              <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-accent-foreground">
                {v.status}
              </span>
              <span className="ml-auto text-[11px] text-muted-foreground">
                {new Date(v.created_at).toLocaleString()}
              </span>
            </div>
            <div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
              {v.weight != null && <span>Weight: {v.weight} kg</span>}
              {v.submitted_price != null && <span>Submitted price: ৳{v.submitted_price}</span>}
              {v.submitter_contact && <span>Contact: {v.submitter_contact}</span>}
              {v.evidence_url && (
                <a
                  href={v.evidence_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline sm:col-span-2"
                >
                  Evidence: {v.evidence_url}
                </a>
              )}
              {v.notes && <span className="sm:col-span-2">Notes: {v.notes}</span>}
            </div>
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              {(["approved", "merged", "rejected", "pending"] as const).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={v.status === s ? "default" : "outline"}
                  onClick={() => mut.mutate({ id: v.id, status: s })}
                  disabled={mut.isPending}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        ))}
        {!isLoading && visible.length === 0 && (
          <p className="text-sm text-muted-foreground">No verifications to show.</p>
        )}
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
