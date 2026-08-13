import { useCountUp, useInView, usePrefersReducedMotion } from "@/components/aieo/motion";
import { scoreBand } from "@/lib/scoring/readiness";
import { cn } from "@/lib/utils";

type Band = ReturnType<typeof scoreBand>;

const BAND_TEXT: Record<Band, string> = {
  critical: "text-score-critical",
  weak: "text-score-weak",
  developing: "text-score-developing",
  strong: "text-score-strong",
  leading: "text-score-leading",
};

const BAND_STROKE: Record<Band, string> = {
  critical: "stroke-score-critical",
  weak: "stroke-score-weak",
  developing: "stroke-score-developing",
  strong: "stroke-score-strong",
  leading: "stroke-score-leading",
};

const BAND_GLOW: Record<Band, string> = {
  critical: "bg-score-critical/20",
  weak: "bg-score-weak/20",
  developing: "bg-score-developing/20",
  strong: "bg-score-strong/20",
  leading: "bg-score-leading/20",
};

/** Plain-language descriptor so colour is never the only status indicator. */
export const BAND_DESCRIPTOR: Record<Band, string> = {
  critical: "Not showing up",
  weak: "Rarely showing up",
  developing: "Sometimes showing up",
  strong: "Good visibility",
  leading: "Consistently recommended",
};

const SIZES = {
  sm: { box: 148, stroke: 10, number: "text-4xl", label: "text-[10px]" },
  md: { box: 216, stroke: 13, number: "text-6xl", label: "text-[11px]" },
  lg: { box: 300, stroke: 17, number: "text-7xl sm:text-8xl", label: "text-xs" },
} as const;

export interface MeterProps {
  /** 0–100, or null when nothing has been measured yet. */
  score: number | null;
  label: string;
  descriptor?: string | undefined;
  size?: keyof typeof SIZES | undefined;
  /** Small floating signal dots around the arc — reserved for hero moments. */
  signals?: boolean | undefined;
  className?: string | undefined;
}

/**
 * The AIeometer — the signature score visual used everywhere a score appears.
 * An abstract arc (never a speedometer needle) that fills as the value counts up.
 */
export function Meter({
  score,
  label,
  descriptor,
  size = "md",
  signals = false,
  className,
}: MeterProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const reduced = usePrefersReducedMotion();
  const target = score == null ? null : Math.min(100, Math.max(0, score));
  const animated = useCountUp(target, { active: inView });
  const value = animated ?? 0;
  const band = scoreBand(target ?? 0);

  const { box, stroke, number, label: labelSize } = SIZES[size];
  const radius = (box - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const sweep = 0.78; // leaves an open gap at the bottom: abstract, not a dial
  const arc = circumference * sweep;
  const offset = arc * (1 - value / 100);
  const settled = target != null && value >= target - 0.4;

  return (
    <div ref={ref} className={cn("flex flex-col items-center", className)}>
      <div className="relative" style={{ width: box, height: box }}>
        {settled && !reduced ? (
          <span
            className={cn("absolute inset-3 rounded-full", BAND_GLOW[band])}
            style={{ animation: "var(--animate-halo)" }}
            aria-hidden="true"
          />
        ) : null}

        <svg
          width={box}
          height={box}
          viewBox={`0 0 ${box} ${box}`}
          className="relative"
          style={{ transform: "rotate(140deg)" }}
          aria-hidden="true"
        >
          <circle
            cx={box / 2}
            cy={box / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arc} ${circumference}`}
            className="stroke-border"
          />
          <circle
            cx={box / 2}
            cy={box / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arc} ${circumference}`}
            strokeDashoffset={target == null ? arc : offset}
            className={cn(BAND_STROKE[band], "transition-[stroke]")}
          />
        </svg>

        {signals && !reduced ? (
          <>
            <span
              className="absolute left-1 top-10 h-2 w-2 rounded-full bg-brand-signal/70"
              style={{ animation: "var(--animate-float)" }}
              aria-hidden="true"
            />
            <span
              className="absolute right-2 top-16 h-1.5 w-1.5 rounded-full bg-brand-mint/80"
              style={{ animation: "var(--animate-float)", animationDelay: "1.4s" }}
              aria-hidden="true"
            />
            <span
              className="absolute bottom-12 right-6 h-2.5 w-2.5 rounded-full bg-brand-amber/70"
              style={{ animation: "var(--animate-float)", animationDelay: "2.6s" }}
              aria-hidden="true"
            />
          </>
        ) : null}

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            className={cn(
              "mb-1 font-semibold uppercase tracking-[0.18em] text-muted-foreground",
              labelSize,
            )}
          >
            {label}
          </span>
          <span
            className={cn(
              "numeric font-semibold leading-none",
              number,
              target == null ? "text-muted-foreground" : BAND_TEXT[band],
            )}
          >
            {target == null ? "—" : Math.round(value)}
          </span>
          <span className="numeric mt-1 text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>

      <p className="mt-4 max-w-[16rem] text-center text-sm font-semibold text-ink">
        {descriptor ?? (target == null ? "Not measured yet" : BAND_DESCRIPTOR[band])}
      </p>
      <span className="sr-only">
        {label}:{" "}
        {target == null
          ? "not measured yet"
          : `${Math.round(target)} out of 100, ${BAND_DESCRIPTOR[band]}`}
      </span>
    </div>
  );
}
