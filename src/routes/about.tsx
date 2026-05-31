import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Calculator,
  Compass,
  Mail,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingHeader, MarketingFooter } from "@/components/MarketingHeader";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About CourierWise" },
      {
        name: "description",
        content:
          "Learn what CourierWise is, how rates are verified, and how Bangladesh merchants can report courier pricing corrections.",
      },
      { property: "og:title", content: "About CourierWise" },
      {
        property: "og:description",
        content:
          "Learn what CourierWise is, how rates are verified, and how Bangladesh merchants can report courier pricing corrections.",
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
      <MarketingHeader />

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        {/* Hero */}
        <section className="grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
              <BadgeCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              About CourierWise
            </div>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              Built so BD merchants can pick the right courier in seconds.
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
              CourierWise helps Bangladesh f-commerce sellers compare estimated delivery and COD
              costs across Pathao, REDX, Steadfast, and Delivery Tiger before they book.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/compare">
                <Button size="lg" className="h-12 w-full px-6 text-base sm:w-auto">
                  Compare rates
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                Independent. Estimate-first. No booking lock-in.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-xl shadow-foreground/5">
            <div className="rounded-xl bg-secondary p-4">
              <p className="text-xs font-semibold uppercase text-primary">What it helps answer</p>
              <h2 className="mt-2 text-xl font-bold tracking-tight">
                Which courier protects my margin today?
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Enter parcel details once, then compare the seller-facing total: delivery fee plus
                COD fee.
              </p>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              <Signal label="Couriers" value="4" />
              <Signal label="Modes" value="Single + bulk" />
              <Signal label="Ranking" value="Lowest total" />
            </div>
          </div>
        </section>

        {/* Why it exists — featured full-width card */}
        <InfoCard className="mt-10" icon={<Compass className="h-5 w-5" />} title="Why it exists">
          <p>
            Most small sellers do not need another logistics dashboard. They need a fast,
            trustworthy way to answer a simple question: which courier protects my margin for this
            parcel or today's full order list?
          </p>
          <p>
            CourierWise exists to make that decision easier. It combines route, weight, zone, and
            COD impact into one simple comparison flow so merchants can choose with more confidence.
          </p>
        </InfoCard>

        {/* Two-up: How rates work + Verification */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <InfoCard icon={<Calculator className="h-5 w-5" />} title="How rates work">
            <p>
              CourierWise uses courier rate slab data and zone logic to estimate total shipping
              cost. Rankings are based on total merchant-facing cost, including delivery fee and COD
              fee where applicable.
            </p>
            <p>
              Some courier rates are directly verified, while others may be community-verified or
              estimated when official public data is incomplete. Because courier pricing changes
              over time, merchants should verify important quotes before booking.
            </p>
          </InfoCard>

          <InfoCard icon={<BadgeCheck className="h-5 w-5" />} title="How trust improves over time">
            <p>
              Rate slabs can carry verification status, source links, freshness dates, notes, and
              confidence labels so merchants can see how much trust to place in a quote.
            </p>
            <p>
              If a merchant finds an incorrect courier rate, they can report a correction or submit
              a verification for admin review.
            </p>
            <div className="pt-2">
              <Link to="/compare">
                <Button variant="outline" size="sm" className="h-9">
                  Report a rate
                </Button>
              </Link>
            </div>
          </InfoCard>
        </div>

        {/* Two-up: Not + Independent */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <InfoCard icon={<XCircle className="h-5 w-5" />} title="What CourierWise is not">
            <p>
              CourierWise is not a booking platform. It does not create shipments, manage
              fulfillment, or replace courier operations.
            </p>
            <p>
              It is a pricing and decision-support layer for merchants who want to compare options
              before booking.
            </p>
          </InfoCard>

          <InfoCard icon={<ShieldCheck className="h-5 w-5" />} title="Independent by design">
            <p>
              CourierWise rankings are not pay-to-play. No courier can buy a better position. The
              cheapest total cost wins, every time.
            </p>
            <p>
              That independence is the whole point — and the reason merchants can trust the
              comparison.
            </p>
          </InfoCard>
        </div>

        {/* Contact CTA */}
        <section className="mt-6 rounded-2xl border bg-secondary p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Mail className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Contact</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Questions, corrections, or partnership inquiries — get in touch.
                </p>
              </div>
            </div>
            <a href="mailto:hello@courierwise.app">
              <Button size="lg" className="h-11">
                hello@courierwise.app
              </Button>
            </a>
          </div>
        </section>

        <MarketingFooter current="about" />
      </main>
    </div>
  );
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-background px-4 py-3">
      <p className="text-[11px] font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  children,
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border bg-card p-6 shadow-sm ${className}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        {icon}
      </div>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-6 text-muted-foreground">{children}</div>
    </section>
  );
}
