import { useInView, usePrefersReducedMotion } from "@/components/aieo/motion";
import { cn } from "@/lib/utils";

const TONES = {
  primary: "bg-primary",
  signal: "bg-brand-signal",
  mint: "bg-brand-mint",
  coral: "bg-brand-coral",
  amber: "bg-brand-amber",
  violet: "bg-brand-violet",
} as const;

/** Animated progress bar used for score components and share of voice. */
export function SignalBar({
  label,
  value,
  valueLabel,
  tone = "primary",
  className,
}: {
  label?: string;
  /** 0–100 */
  value: number;
  valueLabel?: string;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const reduced = usePrefersReducedMotion();
  const width = reduced || inView ? `${Math.min(100, Math.max(0, value))}%` : "0%";

  return (
    <div ref={ref} className={cn("w-full", className)}>
      {label || valueLabel ? (
        <div className="mb-2 flex items-baseline justify-between gap-4">
          {label ? <span className="text-sm text-ink">{label}</span> : null}
          {valueLabel ? <span className="numeric text-sm text-muted-foreground">{valueLabel}</span> : null}
        </div>
      ) : null}
      <div
        className="h-2.5 overflow-hidden rounded-full bg-muted"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
        aria-label={label ?? "value"}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-1000 ease-out", TONES[tone])}
          style={{ width }}
        />
      </div>
    </div>
  );
}
