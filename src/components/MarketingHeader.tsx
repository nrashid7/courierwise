import { Link } from "@tanstack/react-router";
import { ArrowRight, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarketingHeader({ maxWidth = "max-w-5xl" }: { maxWidth?: string }) {
  return (
    <header className={`mx-auto flex ${maxWidth} items-center justify-between px-4 py-4 sm:px-6`}>
      <Link to="/" className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Truck className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-base font-bold leading-none tracking-tight">CourierWise</p>
          <p className="mt-1 text-[11px] font-medium uppercase text-muted-foreground">
            Bangladesh courier compare
          </p>
        </div>
      </Link>
      <Link to="/compare">
        <Button variant="outline" size="sm" className="h-9">
          Compare rates
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </Link>
    </header>
  );
}

export function MarketingFooter({ current }: { current: "home" | "about" | "privacy" | "compare" }) {
  const linkCls = (key: typeof current) =>
    key === current
      ? "font-semibold text-foreground underline underline-offset-4"
      : "hover:text-foreground";
  return (
    <footer className="mt-10 border-t pt-6">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Resources
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
        <Link to="/about" className={linkCls("about")}>About</Link>
        <Link to="/privacy" className={linkCls("privacy")}>Privacy</Link>
        <Link to="/compare" className={linkCls("compare")}>Compare rates</Link>
      </div>
    </footer>
  );
}
