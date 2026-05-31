import { createFileRoute } from "@tanstack/react-router";
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
      <MarketingHeader maxWidth="max-w-3xl" />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">About CourierWise</h1>

        <div className="mt-5 space-y-4 leading-7 text-muted-foreground">
          <p>
            CourierWise helps Bangladesh merchants compare courier pricing before
            they book. It is built for f-commerce sellers who need a fast way to
            estimate delivery cost across Pathao, REDX, Steadfast, and Delivery
            Tiger.
          </p>
          <p>
            CourierWise is an independent tool. It is not affiliated with any
            courier company, booking platform, or logistics operator.
          </p>
        </div>

        <Section title="Why it exists">
          <p>
            Most small sellers do not need another logistics dashboard. They
            need a fast, trustworthy way to answer a simple question: which
            courier protects my margin for this parcel or today's full order
            list?
          </p>
          <p>
            CourierWise exists to make that decision easier. It combines route,
            weight, zone, and COD impact into one simple comparison flow so
            merchants can choose with more confidence.
          </p>
        </Section>

        <Section title="How rates work">
          <p>
            CourierWise uses courier rate slab data and zone logic to estimate
            total shipping cost. Rankings are based on total merchant-facing
            cost, including delivery fee and COD fee where applicable.
          </p>
          <p>
            Some courier rates are directly verified, while others may be
            community-verified or estimated when official public data is
            incomplete. Because courier pricing changes over time, merchants
            should verify important quotes before booking.
          </p>
        </Section>

        <Section title="Verification and corrections">
          <p>
            CourierWise supports merchant-submitted verification reports and
            rate corrections.
          </p>
          <p>
            If you find an incorrect courier rate, report it so the data can
            improve for everyone.
          </p>
        </Section>

        <Section title="What CourierWise is not">
          <p>
            CourierWise is not a booking platform. It does not create shipments,
            manage fulfillment, or replace courier operations.
          </p>
          <p>
            It is a pricing and decision-support layer for merchants who want to
            compare options before booking.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions, corrections, or partnership inquiries:{" "}
            <a
              href="mailto:hello@courierwise.app"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              hello@courierwise.app
            </a>
          </p>
        </Section>

        <MarketingFooter current="about" />
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-3 space-y-3 leading-7 text-muted-foreground">{children}</div>
    </section>
  );
}
