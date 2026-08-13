import { BAND_DESCRIPTOR, Meter } from "@/components/aieo/Meter";
import type { scoreBand } from "@/lib/scoring/readiness";

/** Kept for existing imports: plain-language band labels. */
export const BAND_LABEL: Record<ReturnType<typeof scoreBand>, string> = BAND_DESCRIPTOR;

interface ScoreDialProps {
  score: number | null;
  label: string;
  caption?: string;
  size?: "sm" | "lg";
  className?: string;
}

/**
 * Thin wrapper around the AIEO Meter meter so existing report/landing usages
 * pick up the new signature visual without changing their call sites.
 */
export function ScoreDial({ score, label, caption, size = "lg", className }: ScoreDialProps) {
  return (
    <Meter
      score={score}
      label={label}
      descriptor={caption}
      size={size === "lg" ? "md" : "sm"}
      className={className}
    />
  );
}
