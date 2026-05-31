import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Calculator,
  MapPin,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CourierWise — Compare Bangladesh courier rates" },
      {
        name: "description",
        content:
          "CourierWise helps f-commerce sellers estimate delivery cost across Pathao, REDX, Steadfast, and Delivery Tiger.",
      },
      { property: "og:title", content: "CourierWise — Compare Bangladesh courier rates" },
      {
        property: "og:description",
        content:
          "Compare Pathao, REDX, Steadfast and Delivery Tiger rates before you book.",
      },
    ],
  }),
  component: Index,
});

function Index() {
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
            Compare
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
              Compare estimated Pathao, REDX, Steadfast, and Delivery Tiger
              charges by route, weight, and COD amount in one quick flow.
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
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-xl shadow-foreground/5">
            <div className="rounded-xl bg-secondary p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">Sample quote</span>
                <span className="rounded-full bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground">
                  Cheapest highlighted
                </span>
              </div>
              <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
                <RoutePill label="Dhaka" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <RoutePill label="Chattogram" />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <QuotePreview courier="Pathao" price="৳120" meta="1kg + COD ৳1,500" active />
              <QuotePreview courier="Steadfast" price="৳130" meta="Estimated slab" />
              <QuotePreview courier="REDX" price="৳145" meta="Community verified" />
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-3 sm:grid-cols-3">
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
        </section>

        <p className="mt-8 max-w-2xl text-sm leading-6 text-muted-foreground">
          CourierWise is independent and not affiliated with any courier company.
          Rates are estimates and should be verified before booking.
        </p>
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
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}
