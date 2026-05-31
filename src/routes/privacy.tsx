import { createFileRoute } from "@tanstack/react-router";
import { MarketingHeader, MarketingFooter } from "@/components/MarketingHeader";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — CourierWise" },
      {
        name: "description",
        content:
          "Learn what CourierWise collects, why it is collected, and how merchant submission and analytics data are handled.",
      },
      { property: "og:title", content: "Privacy Policy — CourierWise" },
      {
        property: "og:description",
        content:
          "Learn what CourierWise collects, why it is collected, and how merchant submission and analytics data are handled.",
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
      <MarketingHeader maxWidth="max-w-3xl" />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-xs text-muted-foreground">Last updated: May 2026</p>

        <div className="mt-5 space-y-4 leading-7 text-muted-foreground">
          <p>
            CourierWise is designed to be lightweight and low-friction. You can
            use core comparison features without creating an account.
          </p>
          <p>
            This page explains what information CourierWise may collect, why it
            is collected, and how it is used.
          </p>
        </div>

        <Section title="What CourierWise collects">
          <p>CourierWise may collect:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              Quote inputs such as pickup city, destination city, parcel weight,
              COD amount, and selected zone when you use comparison features.
            </li>
            <li>
              Product analytics events, such as quote generation and bulk summary
              copy events, to understand usage and improve the product.
            </li>
            <li>
              Verification or correction submissions you choose to send,
              including courier name, zone, submitted price, evidence URL,
              optional contact info, and notes.
            </li>
            <li>
              Technical anti-abuse data such as IP address for rate-limiting and
              spam prevention on submissions.
            </li>
          </ul>
        </Section>

        <Section title="Why this information is collected">
          <p>CourierWise uses this information to:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Generate courier comparisons and bulk quote summaries.</li>
            <li>
              Improve product quality and understand which features merchants
              use most.
            </li>
            <li>Review reported pricing corrections and verification submissions.</li>
            <li>Prevent spam, abuse, and repeated automated submissions.</li>
          </ul>
        </Section>

        <Section title="What CourierWise does not do">
          <p>CourierWise does not require user accounts for normal quote usage.</p>
          <p>CourierWise does not sell your personal information.</p>
          <p>CourierWise does not process courier bookings or payments.</p>
        </Section>

        <Section title="Verification submissions">
          <p>
            If you submit a rate correction or verification, the information you
            provide may be stored and reviewed by the CourierWise admin system.
          </p>
          <p>
            Please do not include sensitive personal information unless it is
            necessary to explain a courier pricing issue.
          </p>
        </Section>

        <Section title="Data retention and security">
          <p>
            CourierWise keeps only the information needed to operate the
            product, review corrections, and protect the service from abuse.
          </p>
          <p>
            Reasonable steps should be taken to protect stored data, but no
            internet service can guarantee absolute security.
          </p>
        </Section>

        <Section title="Third-party services">
          <p>
            CourierWise may rely on third-party infrastructure and tools to run
            the app, database, analytics, and hosting. These providers may
            process technical data required to deliver the service.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            If you have a privacy question or want a submission reviewed or
            removed, contact:{" "}
            <a
              href="mailto:privacy@courierwise.app"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              privacy@courierwise.app
            </a>
          </p>
        </Section>

        <MarketingFooter current="privacy" />
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
