import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Database,
  FileCheck2,
  Lock,
  Mail,
  Network,
  ShieldCheck,
  ShieldOff,
  Target,
  UserX,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingHeader, MarketingFooter } from "@/components/MarketingHeader";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy - CourierWise" },
      {
        name: "description",
        content:
          "Learn what CourierWise collects, why it is collected, and how merchant submission and analytics data are handled.",
      },
      { property: "og:title", content: "Privacy Policy - CourierWise" },
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
      <MarketingHeader />

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        <section className="grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Privacy Policy
            </div>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              Lightweight, low-friction, and built to respect merchants.
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
              CourierWise keeps the comparison flow simple: no account is required for normal quote
              usage, and submissions are used to improve courier rate accuracy and protect the
              service.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/compare">
                <Button size="lg" className="h-12 w-full px-6 text-base sm:w-auto">
                  Compare rates
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Button>
              </Link>
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Last updated: May 2026
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-xl shadow-foreground/5">
            <p className="px-1 text-xs font-semibold uppercase text-primary">Privacy basics</p>
            <div className="mt-3 space-y-2">
              <PrivacySignal
                icon={<UserX className="h-4 w-4" />}
                title="No account for quotes"
                text="Core comparisons work without sign-up."
              />
              <PrivacySignal
                icon={<ShieldOff className="h-4 w-4" />}
                title="No personal data selling"
                text="Merchant data is not sold."
              />
              <PrivacySignal
                icon={<WalletCards className="h-4 w-4" />}
                title="No booking or payment handling"
                text="CourierWise compares costs only."
              />
            </div>
          </div>
        </section>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <InfoCard icon={<Database className="h-5 w-5" />} title="What CourierWise collects">
            <p className="text-muted-foreground">CourierWise may collect:</p>
            <BulletList
              items={[
                "Quote inputs such as pickup city, destination city, parcel weight, COD amount, and selected zone when you use comparison features.",
                "Product analytics events, such as quote generation and bulk summary copy events, to understand usage and improve the product.",
                "Verification or correction submissions you choose to send, including courier name, zone, submitted price, evidence URL, optional contact info, and notes.",
                "Technical anti-abuse data such as IP address for rate limiting and spam prevention on submissions.",
              ]}
            />
          </InfoCard>

          <InfoCard icon={<Target className="h-5 w-5" />} title="Why this information is collected">
            <p className="text-muted-foreground">CourierWise uses this information to:</p>
            <BulletList
              items={[
                "Generate courier comparisons and bulk quote summaries.",
                "Improve product quality and understand which features merchants use most.",
                "Review reported pricing corrections and verification submissions.",
                "Prevent spam, abuse, and repeated automated submissions.",
              ]}
            />
          </InfoCard>
        </div>

        <section className="mt-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <NotCard
              icon={<UserX className="h-5 w-5" />}
              title="No accounts required"
              text="CourierWise does not require user accounts for normal quote usage."
            />
            <NotCard
              icon={<ShieldOff className="h-5 w-5" />}
              title="No data selling"
              text="CourierWise does not sell your personal information."
            />
            <NotCard
              icon={<WalletCards className="h-5 w-5" />}
              title="No bookings or payments"
              text="CourierWise does not process courier bookings or payments."
            />
          </div>
        </section>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <InfoCard icon={<FileCheck2 className="h-5 w-5" />} title="Verification submissions">
            <p>
              If you submit a rate correction or verification, the information you provide may be
              stored and reviewed by the CourierWise admin system.
            </p>
            <p>
              Please do not include sensitive personal information unless it is necessary to explain
              a courier pricing issue.
            </p>
          </InfoCard>

          <InfoCard icon={<Lock className="h-5 w-5" />} title="Data retention and security">
            <p>
              CourierWise keeps only the information needed to operate the product, review
              corrections, and protect the service from abuse.
            </p>
            <p>
              Reasonable steps should be taken to protect stored data, but no internet service can
              guarantee absolute security.
            </p>
          </InfoCard>

          <InfoCard icon={<Network className="h-5 w-5" />} title="Third-party services">
            <p>
              CourierWise may rely on third-party infrastructure and tools to run the app, database,
              analytics, and hosting. These providers may process technical data required to deliver
              the service.
            </p>
          </InfoCard>
        </div>

        <section className="mt-6 rounded-2xl border bg-secondary p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Mail className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Privacy contact</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Have a privacy question or want a submission reviewed or removed? Reach out.
                </p>
              </div>
            </div>
            <a href="mailto:privacy@courierwise.app">
              <Button size="lg" className="h-11">
                privacy@courierwise.app
              </Button>
            </a>
          </div>
        </section>

        <MarketingFooter current="privacy" />
      </main>
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

function PrivacySignal({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border bg-background p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

function NotCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
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

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
