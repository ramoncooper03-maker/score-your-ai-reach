import {
  ALGORITHM_VERSION,
  READINESS_DIMENSIONS,
  type ReadinessDimensionKey,
  type ReadinessResult,
  type ReadinessSignals,
} from "./types";

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export const READINESS_LABELS: Record<ReadinessDimensionKey, string> = {
  entityClarity: "Business / entity clarity",
  serviceLocationCoverage: "Service & location coverage",
  siteFundamentals: "Indexability & site fundamentals",
  trustEvidence: "Trust & evidence signals",
  localConsistency: "Local information consistency",
  thirdPartyFootprint: "Third-party footprint",
  structuredData: "Structured-data accuracy",
  questionCoverage: "Content & question coverage",
};

/**
 * AI Readiness Score (0-100). Separate from the Visibility Score: readiness
 * describes how well the business is prepared to be understood, not whether an
 * AI system currently recommends it.
 */
export function calculateReadinessScore(signals: ReadinessSignals): ReadinessResult {
  const keys = Object.keys(READINESS_DIMENSIONS) as ReadinessDimensionKey[];
  const components = {} as Record<ReadinessDimensionKey, number>;
  const unevaluated: ReadinessDimensionKey[] = [];

  const breakdown = keys.map((key) => {
    const raw = signals[key];
    const evaluated = typeof raw === "number" && Number.isFinite(raw);
    const value = evaluated ? clamp01(raw) : 0;
    if (!evaluated) unevaluated.push(key);
    components[key] = value;
    const maxPoints = READINESS_DIMENSIONS[key];
    return {
      key,
      value,
      maxPoints,
      points: Math.round(value * maxPoints * 100) / 100,
      evaluated,
    };
  });

  const score = Math.round(breakdown.reduce((sum, item) => sum + item.value * item.maxPoints, 0));

  return { algorithmVersion: ALGORITHM_VERSION, score, components, breakdown, unevaluated };
}

/** Score band used for presentation only. */
export function scoreBand(score: number): "critical" | "weak" | "developing" | "strong" | "leading" {
  if (score < 20) return "critical";
  if (score < 40) return "weak";
  if (score < 60) return "developing";
  if (score < 80) return "strong";
  return "leading";
}
