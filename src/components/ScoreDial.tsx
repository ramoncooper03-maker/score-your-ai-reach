import { scoreBand } from "@/lib/scoring/readiness";
import { cn } from "@/lib/utils";

const BAND_CLASS: Record<ReturnType<typeof scoreBand>, string> = {
  critical: "text-score-critical",
  weak: "text-score-weak",
  developing: "text-score-developing",
  strong: "text-score-strong",
  leading: "text-score-leading",
};

const BAND_STROKE: Record<ReturnType<typeof scoreBand>, string> = {
  critical: "stroke-score-critical",
  weak: "stroke-score-weak",
  developing: "stroke-score-developing",
  strong: "stroke-score-strong",
  leading: "stroke-score-leading",
};

export const BAND_LABEL: Record<ReturnType<typeof scoreBand>, string> = {
  critical: "Not visible",
  weak: "Rarely surfaced",
  developing: "Sometimes surfaced",
  strong: "Frequently surfaced",
  leading: "Consistently surfaced",
};

interface ScoreDialProps {
  score: number | null;
  label: string;
  caption?: string;
  size?: "sm" | "lg";
  className?: string;
}

/** The score is the product's primary visual: a calm, precise dial. */
export function ScoreDial({ score, label, caption, size = "lg", className }: ScoreDialProps) {
  const value = score == null ? 0 : Math.min(100, Math.max(0, score));
  const band = scoreBand(value);
  const dimension = size === "lg" ? 208 : 132;
  const stroke = size === "lg" ? 12 : 9;
  const radius = (dimension - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative" style={{ width: dimension, height: dimension }}>
        <svg width={dimension} height={dimension} className="-rotate-90" aria-hidden="true">
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            className="stroke-border"
          />
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={score == null ? circumference : offset}
            className={cn("transition-[stroke-dashoffset] duration-700 ease-out", BAND_STROKE[band])}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "numeric font-semibold leading-none",
              size === "lg" ? "text-6xl" : "text-4xl",
              score == null ? "text-muted-foreground" : BAND_CLASS[band],
            )}
          >
            {score == null ? "—" : value}
          </span>
          <span className="mt-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">/ 100</span>
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold text-ink">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{caption ?? (score == null ? "Not calculated yet" : BAND_LABEL[band])}</p>
    </div>
  );
}
