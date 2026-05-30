import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Pencil, Plus, Trash2, Lock } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { COURIERS, ZONES, type CourierRate } from "@/lib/courier";
import {
  deleteRate,
  listAllRates,
  upsertRate,
} from "@/lib/rates.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — CourierWise" },
      { name: "description", content: "Manage courier rates." },
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
              Required to view and edit courier rates.
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
  const list = useServerFn(listAllRates);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin_rates"],
    queryFn: () => list({ data: { passphrase } }),
    retry: false,
  });

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
      <header className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-4">
        <div className="flex items-center gap-2">
          <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <h1 className="text-lg font-semibold">Rate management</h1>
        </div>
        <div className="flex gap-2">
          <RateDialog
            passphrase={passphrase}
            onSaved={() => qc.invalidateQueries({ queryKey: ["admin_rates"] })}
            trigger={
              <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add rate</Button>
            }
          />
          <Button variant="outline" size="sm" onClick={onLock}>Lock</Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        <div className="space-y-2">
          {data?.rates.map((r) => (
            <RateRow
              key={r.id}
              rate={r as CourierRate}
              passphrase={passphrase}
              onChanged={() => qc.invalidateQueries({ queryKey: ["admin_rates"] })}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

function RateRow({
  rate,
  passphrase,
  onChanged,
}: {
  rate: CourierRate;
  passphrase: string;
  onChanged: () => void;
}) {
  const del = useServerFn(deleteRate);
  const delMut = useMutation({
    mutationFn: () => del({ data: { passphrase, id: rate.id } }),
    onSuccess: () => { toast.success("Deleted"); onChanged(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{rate.courier_name}</span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              {rate.zone}
            </span>
            {!rate.active && (
              <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-destructive">
                inactive
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Base ৳{rate.base_price} up to {rate.base_weight_limit}kg · +৳{rate.extra_kg_price}/kg ·
            COD {rate.cod_percent}% (min ৳{rate.cod_fixed_fee})
          </div>
          {rate.last_verified_date && (
            <div className="mt-1 text-[11px] text-muted-foreground">
              Last verified: {rate.last_verified_date}
            </div>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <RateDialog
            passphrase={passphrase}
            initial={rate}
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
              if (confirm("Delete this rate?")) delMut.mutate();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function RateDialog({
  passphrase,
  initial,
  onSaved,
  trigger,
}: {
  passphrase: string;
  initial?: CourierRate;
  onSaved: () => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [courier, setCourier] = useState<string>(initial?.courier_name ?? COURIERS[0]);
  const [zone, setZone] = useState<string>(initial?.zone ?? ZONES[0]);
  const [baseWeight, setBaseWeight] = useState(String(initial?.base_weight_limit ?? 1));
  const [basePrice, setBasePrice] = useState(String(initial?.base_price ?? 60));
  const [extraKg, setExtraKg] = useState(String(initial?.extra_kg_price ?? 20));
  const [codPercent, setCodPercent] = useState(String(initial?.cod_percent ?? 1));
  const [codFixed, setCodFixed] = useState(String(initial?.cod_fixed_fee ?? 10));
  const [eta, setEta] = useState(initial?.estimated_delivery_time ?? "1-2 days");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [sourceUrl, setSourceUrl] = useState(initial?.source_url ?? "");
  const [verified, setVerified] = useState(
    initial?.last_verified_date ?? new Date().toISOString().slice(0, 10),
  );
  const [active, setActive] = useState(initial?.active ?? true);

  const upsert = useServerFn(upsertRate);
  const mut = useMutation({
    mutationFn: () =>
      upsert({
        data: {
          passphrase,
          id: initial?.id,
          rate: {
            courier_name: courier,
            zone,
            base_weight_limit: Number(baseWeight) || 0,
            base_price: Number(basePrice) || 0,
            extra_kg_price: Number(extraKg) || 0,
            cod_percent: Number(codPercent) || 0,
            cod_fixed_fee: Number(codFixed) || 0,
            estimated_delivery_time: eta || null,
            notes: notes || null,
            source_url: sourceUrl || null,
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
          <DialogTitle>{initial ? "Edit rate" : "Add rate"}</DialogTitle>
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
            <Field label="Base weight limit (kg)">
              <Input type="number" step="0.1" value={baseWeight} onChange={(e) => setBaseWeight(e.target.value)} />
            </Field>
            <Field label="Base price (BDT)">
              <Input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} />
            </Field>
            <Field label="Extra per kg (BDT)">
              <Input type="number" value={extraKg} onChange={(e) => setExtraKg(e.target.value)} />
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
          <Field label="Source URL">
            <Input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://" />
          </Field>
          <Field label="Notes">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </Field>
          <DialogFooter>
            <Button type="submit" disabled={mut.isPending} className="w-full">
              {mut.isPending ? "Saving…" : "Save rate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
