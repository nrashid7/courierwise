import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Calculator, Info } from "lucide-react";
import { useState } from "react";
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
import { CITIES, ZONES } from "@/lib/courier";
import { trackEvent } from "@/lib/analytics";
import { Disclaimer } from "@/components/Disclaimer";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare courier rates — CourierWise" },
      {
        name: "description",
        content: "Enter parcel details to compare delivery costs across BD couriers.",
      },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState("Dhaka");
  const [destination, setDestination] = useState("Dhaka");
  const [zone, setZone] = useState<string>("Inside Dhaka");
  const [weight, setWeight] = useState("1");
  const [cod, setCod] = useState("0");
  const [productType, setProductType] = useState("");

  const weightNum = Number(weight) || 0;
  const codNum = Number(cod) || 0;
  const overWeight = weightNum > 3;

  const onSubmit = (e: React.FormEvent) => {
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
      zone,
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
        zone,
        weight: weightNum,
        cod: codNum,
        productType: productType || undefined,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-4">
        <Link to="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold">Compare rates</h1>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-16">
        <Disclaimer />
        <form onSubmit={onSubmit} className="mt-4 space-y-4 rounded-xl border bg-card p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Pickup city">
              <Select value={pickup} onValueChange={setPickup}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Destination city">
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Delivery zone">
            <Select value={zone} onValueChange={setZone}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ZONES.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Not sure? Choose <span className="font-medium">Inside Dhaka</span> only for
              Dhaka city delivery. Use <span className="font-medium">Outside Dhaka</span> for
              other districts.
            </p>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Parcel weight (kg)">
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              />
            </Field>
            <Field label="COD amount (BDT)">
              <Input
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
            <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <p>Rates above 3kg may vary by courier. Verify before booking.</p>
            </div>
          )}

          <Field label="Product type (optional)">
            <Input
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              placeholder="e.g. Clothing, Electronics"
            />
          </Field>

          <Button type="submit" size="lg" className="h-12 w-full text-base">
            <Calculator className="mr-2 h-5 w-5" />
            Compare Rates
          </Button>
        </form>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}
