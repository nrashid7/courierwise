import { Info } from "lucide-react";

export function Disclaimer() {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
      <p>
        Sample rates — verify with the courier before booking. Rates shown are estimates.
      </p>
    </div>
  );
}
