import { createFileRoute, Link } from "@tanstack/react-router";
import { Truck, Calculator, MapPin, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Disclaimer } from "@/components/Disclaimer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CourierWise — Compare Bangladesh courier rates" },
      {
        name: "description",
        content:
          "Compare Pathao, REDX, Steadfast and Delivery Tiger rates side-by-side. Built for Bangladesh f-commerce sellers.",
      },
      { property: "og:title", content: "CourierWise — Find the cheapest courier" },
      {
        property: "og:description",
        content: "Rate comparison calculator for Bangladesh f-commerce sellers.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Truck className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">CourierWise</span>
        </div>
        <Link
          to="/admin"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Admin
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-16 pt-8">
        <section className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Find the cheapest courier before you book
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Built for Bangladesh f-commerce sellers. Compare Pathao, REDX, Steadfast,
            and Delivery Tiger in seconds — including COD fees and weight charges.
          </p>
          <Link to="/compare" className="mt-6 inline-block">
            <Button size="lg" className="h-12 px-8 text-base">
              <Calculator className="mr-2 h-5 w-5" />
              Compare Rates
            </Button>
          </Link>
        </section>

        <div className="mt-8">
          <Disclaimer />
        </div>

        <section className="mt-10 grid gap-3 sm:grid-cols-3">
          <Feature
            icon={<MapPin className="h-5 w-5" />}
            title="All zones"
            text="Inside Dhaka, Sub-Dhaka, and Outside Dhaka."
          />
          <Feature
            icon={<Calculator className="h-5 w-5" />}
            title="Real math"
            text="Weight tiers and COD fees calculated properly."
          />
          <Feature
            icon={<BadgeCheck className="h-5 w-5" />}
            title="Cheapest pick"
            text="Couriers ranked from lowest cost to highest."
          />
        </section>
      </main>
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
    <div className="rounded-xl border bg-card p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        {icon}
      </div>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{text}</p>
    </div>
  );
}
