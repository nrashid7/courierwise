import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Calculator, Info, MapPin, Package, Wallet } from "lucide-react";
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
import { CITIES, CANONICAL_ZONE_LABELS, type CanonicalZone } from "@/lib/courier";
import { trackEvent } from "@/lib/analytics";
import { Disclaimer } from "@/components/Disclaimer";

const CANONICAL_ZONES: CanonicalZone[] = [
  "INSIDE_DHAKA",
  "SUBURBAN",
  "OUTSIDE_DHAKA",
  "INTER_DISTRICT",
];

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
  const [weight, setWeight] = useState("1");
  const [cod, setCod] = useState("0");
  const [productType, setProductType] = useState("");

  const weightNum = Number(weight) || 0;
  const codNum = Number(cod) || 0;
  const overWeight = weightNum > 6;

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
              destination, delivery zone, parcel weight, and COD amount.
            </p>
          </div>

          <div className="mt-5">
            <Disclaimer compact />
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-6">
            <FormSection icon={<MapPin className="h-4 w-4" />} title="Route">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Pickup city">
                  <Select value={pickup} onValueChange={setPickup}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Destination city">
                  <Select value={destination} onValueChange={setDestination}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </FormSection>

            <FormSection icon={<Package className="h-4 w-4" />} title="Delivery zone">
              <Field label="Delivery zone">
                <Select
                  value={canonicalZone}
                  onValueChange={(v) => setCanonicalZone(v as CanonicalZone)}
                >
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
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
            </FormSection>

            <FormSection icon={<Wallet className="h-4 w-4" />} title="Parcel and payment">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Parcel weight (kg)">
                  <Input
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
                <Field label="COD amount (BDT)">
                  <Input
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

              <Field label="Product type (optional)">
                <Input
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
        </section>
      </main>
    </div>
  );
}

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}
