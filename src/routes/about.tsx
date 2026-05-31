import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About CourierWise — Independent BD courier rate comparison" },
      {
        name: "description",
        content:
          "CourierWise helps Bangladeshi merchants compare courier delivery and COD costs before booking. Independent and community-maintained.",
      },
      { property: "og:title", content: "About CourierWise" },
      {
        property: "og:description",
        content:
          "How CourierWise helps Bangladeshi merchants compare courier delivery and COD costs before booking.",
      },
      { property: "og:url", content: "https://courierwise.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://courierwise.lovable.app/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Truck className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-base font-bold leading-none tracking-tight">CourierWise</p>
        </Link>
        <Link to="/compare">
          <Button variant="outline" size="sm" className="h-9">
            Compare
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">About CourierWise</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
          CourierWise helps Bangladeshi merchants compare courier delivery and
          COD costs before booking.
        </p>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Why it exists</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Courier pricing in Bangladesh is fragmented. Each operator
            publishes its own slabs, COD charges are easy to misread, and
            merchants often waste time and money comparing rates by hand.
            CourierWise exists to make that decision quick, transparent, and
            consistent — for one parcel or a full day's orders.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">How rates work</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Rates shown on CourierWise are sourced from publicly available
            courier pricing and maintained as slabs. Pricing changes from time
            to time, so we display verification dates where available and rely
            on merchants to report any incorrect rates they encounter. Always
            confirm final charges with the courier before booking.
          </p>
          <p className="mt-3 leading-7 text-muted-foreground">
            CourierWise is independent and not affiliated with any courier
            company.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">Contact</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Questions or corrections? Email{" "}
            <a
              href="mailto:hello@courierwise.app"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              hello@courierwise.app
            </a>
            .
          </p>
        </section>

        <footer className="mt-12 flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <Link to="/compare" className="hover:text-foreground">Compare rates</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
        </footer>
      </main>
    </div>
  );
}
