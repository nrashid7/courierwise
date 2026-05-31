import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — CourierWise" },
      {
        name: "description",
        content:
          "How CourierWise handles data: anonymous analytics, rate limiting, and quote submissions. We do not sell personal data.",
      },
      { property: "og:title", content: "Privacy Policy — CourierWise" },
      {
        property: "og:description",
        content:
          "How CourierWise handles data. We do not sell personal data.",
      },
      { property: "og:url", content: "https://courierwise.lovable.app/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://courierwise.lovable.app/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
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
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: May 2026</p>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">Data we collect</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-7 text-muted-foreground">
            <li>Anonymous usage analytics (page views, feature events).</li>
            <li>IP address for rate limiting and abuse prevention.</li>
            <li>Quote form inputs (route, weight, COD amount) you submit.</li>
            <li>Courier rate verification submissions you contribute.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">How we use it</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-7 text-muted-foreground">
            <li>Improve quote accuracy and slab coverage.</li>
            <li>Prevent abuse, spam, and automated scraping.</li>
            <li>Understand which features merchants actually use.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">No selling of data</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            CourierWise does not sell personal data.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">Contact</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Privacy questions? Email{" "}
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
          <Link to="/about" className="hover:text-foreground">About</Link>
        </footer>
      </main>
    </div>
  );
}
