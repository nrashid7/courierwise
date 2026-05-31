import { Info } from "lucide-react";

export function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div
      role="note"
      className={`flex items-start gap-3 rounded-xl border border-warning/35 bg-warning/10 text-warning-foreground shadow-sm ${
        compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
      }`}
    >
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-warning/20 text-warning">
        <Info className="h-4 w-4" aria-hidden="true" />
      </div>
      <p className={compact ? "leading-5" : "leading-6"}>
        Rates are estimates based on maintained courier slabs. Verify final
        charges with the courier before booking.
      </p>
    </div>
  );
}
