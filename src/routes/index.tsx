import { createFileRoute, Link } from "@tanstack/react-router";
import { Truck, Calculator, Wallet, MapPin } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Truck className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">CourierWise</span>
        </div>
        <span className="sr-only">CourierWise</span>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-16 pt-8">
        <section className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Compare Bangladesh courier rates before you book
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            CourierWise helps f-commerce sellers estimate delivery cost across
            Pathao, REDX, Steadfast, and Delivery Tiger.
          </p>
          <Link to="/compare" className="mt-6 inline-block">
            <Button size="lg" className="h-12 px-8 text-base">
              <Calculator className="mr-2 h-5 w-5" />
              Compare Rates
            </Button>
          </Link>
        </section>

        <section className="mt-10 grid gap-3 sm:grid-cols-3">
          <Feature
            icon={<Calculator className="h-5 w-5" />}
            title="Find cheapest courier"
            text="Couriers ranked from lowest total cost to highest."
          />
          <Feature
            icon={<Wallet className="h-5 w-5" />}
            title="Include COD fees"
            text="Real totals with COD percentage and minimum fees."
          />
          <Feature
            icon={<MapPin className="h-5 w-5" />}
            title="Built for BD sellers"
            text="Inside Dhaka, Sub-Dhaka, and Outside Dhaka zones."
          />
        </section>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          CourierWise is not affiliated with any courier company. Rates are
          estimates and should be verified before booking.
        </p>
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
