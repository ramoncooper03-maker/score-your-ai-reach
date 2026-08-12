import { cn } from "@/lib/utils";

/**
 * Required label for every illustrative figure in the UI.
 * Production metrics never use placeholder numbers; anything illustrative must
 * carry this badge.
 */
export function SampleDataBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-warning-foreground",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden="true" />
      Sample data
    </span>
  );
}
