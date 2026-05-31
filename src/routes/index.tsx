import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  Calculator,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Compare Pathao, REDX, Steadfast & Delivery Tiger rates — CourierWise" },
      {
        name: "description",
        content:
          "Compare BD courier pricing for a single parcel or a full day of orders. See total delivery + COD costs side by side before booking.",
      },
      { property: "og:title", content: "Compare Pathao, REDX, Steadfast & Delivery Tiger rates — CourierWise" },
      {
        property: "og:description",
        content:
          "Compare BD courier pricing for a single parcel or a full day of orders before you book.",
      },
      { property: "og:url", content: "https://courierwise.lovable.app/" },
    ],
    links: [
      { rel: "canonical", href: "https://courierwise.lovable.app/" },
    ],
  }),
  component: Index,
});

function useNewestVerificationLabel() {
  const { data } = useQuery({
    queryKey: ["newest_verification"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courier_rate_slabs")
        .select("last_verified_date, last_verified_at")
        .eq("active", true);
      if (error) throw error;
      let newest: number | null = null;
      for (const row of data ?? []) {
        const raw =
          (row as { last_verified_date?: string | null; last_verified_at?: string | null })
            .last_verified_date ??
          (row as { last_verified_at?: string | null }).last_verified_at;
        if (!raw) continue;
        const t = new Date(raw).getTime();
        if (!Number.isNaN(t) && (newest === null || t > newest)) newest = t;
      }
      return newest;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (data == null) return "Rates should be verified before booking";
  const monthYear = new Date(data).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  return `Rates independently verified • Updated ${monthYear}`;
}

function Index() {
  const verificationLabel = useNewestVerificationLabel();

  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Truck className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-base font-bold leading-none tracking-tight">CourierWise</p>
            <p className="mt-1 text-[11px] font-medium uppercase text-muted-foreground">
              Bangladesh courier compare
            </p>
          </div>
        </div>
        <Link to="/compare">
          <Button variant="outline" size="sm" className="h-9">
            Compare rates
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
              <BadgeCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Built for BD f-commerce sellers
            </div>
            <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              Pick the courier that protects your margin before you book.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Compare courier pricing across Bangladesh for a single parcel or
              an entire day's orders. See total delivery + COD costs side by
              side before booking.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/compare">
                <Button size="lg" className="h-12 w-full px-6 text-base sm:w-auto">
                  <Calculator className="h-5 w-5" aria-hidden="true" />
                  Compare rates
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                No login. No booking lock-in.
              </div>
            </div>
            <p className="mt-4 text-xs font-medium text-muted-foreground">
              {verificationLabel}
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-xl shadow-foreground/5">
            <div className="rounded-xl bg-secondary p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">Sample quote</span>
                <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground">
                  Illustrative example only
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Dhaka → Chattogram • 1kg • COD ৳1,500
              </p>
              <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
                <RoutePill label="Dhaka" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <RoutePill label="Chattogram" />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <QuotePreview courier="REDX" price="৳127" meta="Community verified" active />
              <QuotePreview courier="Pathao" price="৳138" meta="1kg + COD ৳1,500" />
              <QuotePreview courier="Steadfast" price="৳149" meta="Estimated slab" />
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Feature
            icon={<Calculator className="h-5 w-5" />}
            title="Ranked by total cost"
            text="Delivery fee and COD fee are combined before sorting."
          />
          <Feature
            icon={<Wallet className="h-5 w-5" />}
            title="COD-aware totals"
            text="See prepaid vs COD impact before choosing a courier."
          />
          <Feature
            icon={<MapPin className="h-5 w-5" />}
            title="BD delivery zones"
            text="Inside Dhaka, Dhaka Suburbs, Outside Dhaka, and inter-district."
          />
          <Feature
            icon={<Package className="h-5 w-5" />}
            title="Bulk shipping optimizer"
            text="Compare a full day's parcels across all couriers. See total savings instantly."
          />
        </section>

        <p className="mt-8 max-w-2xl text-sm leading-6 text-muted-foreground">
          CourierWise is independent and not affiliated with any courier company.
          Rates are estimates and should be verified before booking.{" "}
          <Link to="/compare" className="font-medium text-primary underline-offset-4 hover:underline">
            Found an incorrect courier rate? Help improve CourierWise.
          </Link>
        </p>

        <footer className="mt-10 border-t pt-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Resources
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground">About</Link>
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/compare" className="hover:text-foreground">Compare rates</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

function RoutePill({ label }: { label: string }) {
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-center font-semibold">
      {label}
    </div>
  );
}

function QuotePreview({
  courier,
  price,
  meta,
  active = false,
}: {
  courier: string;
  price: string;
  meta: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border p-3 ${
        active ? "border-primary bg-accent/70" : "bg-background"
      }`}
    >
      <div>
        <p className="font-semibold">{courier}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{meta}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold tabular-nums">{price}</p>
        {active && <p className="text-[11px] font-semibold text-primary">Best fit</p>}
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        {icon}
      </div>
      <h2 className="mt-4 text-sm font-semibold">{title}</h2>
      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}
