/**
 * Deterministic scoring types.
 *
 * Everything in `src/lib/scoring` is pure: no network, no LLM, no randomness.
 * Scores are computed from stored scan evidence so any report can be
 * recomputed and audited later.
 */

export const ALGORITHM_VERSION = "v1.0.0";

/** Weights for the AI Visibility Score. Must sum to 1. */
export const VISIBILITY_WEIGHTS = {
  recommendationFrequency: 0.3,
  mentionFrequency: 0.2,
  shareOfVoice: 0.15,
  prominence: 0.15,
  citationPresence: 0.1,
  consistency: 0.1,
} as const;

export type VisibilityComponentKey = keyof typeof VISIBILITY_WEIGHTS;

/** Max points per AI Readiness dimension. Must sum to 100. */
export const READINESS_DIMENSIONS = {
  entityClarity: 20,
  serviceLocationCoverage: 20,
  siteFundamentals: 15,
  trustEvidence: 15,
  localConsistency: 10,
  thirdPartyFootprint: 10,
  structuredData: 5,
  questionCoverage: 5,
} as const;

export type ReadinessDimensionKey = keyof typeof READINESS_DIMENSIONS;

export type RunStatus = "pending" | "running" | "succeeded" | "failed" | "skipped" | "timeout";

/**
 * One provider execution of one standardized query, reduced to the facts the
 * score depends on. Produced from `scan_runs` + `run_mentions` + `run_sources`.
 */
export interface RunEvidence {
  runId: string;
  queryId: string;
  provider: string;
  status: RunStatus;
  /** Target business appeared anywhere in the answer. */
  targetMentioned: boolean;
  /** Target business was presented as a recommendation / suggested option. */
  targetRecommended: boolean;
  /** 1-indexed position of the target inside the answer's recommendation list. */
  targetListPosition: number | null;
  /** Total number of businesses listed in that answer. */
  targetListLength: number | null;
  /** Normalized keys of competing businesses mentioned in this answer. */
  competitorKeys: string[];
  /** True when at least one cited source is on a domain owned by the business. */
  ownedDomainCited: boolean;
}

export interface VisibilityComponentBreakdown {
  key: VisibilityComponentKey;
  /** Normalized 0..1 value. */
  value: number;
  weight: number;
  /** Points contributed to the 0..100 score. */
  points: number;
}

export interface VisibilityResult {
  algorithmVersion: string;
  /** Integer 0..100. */
  score: number;
  components: Record<VisibilityComponentKey, number>;
  breakdown: VisibilityComponentBreakdown[];
  coverage: {
    runsTotal: number;
    runsScored: number;
    runsFailed: number;
    queriesScored: number;
    providersScored: string[];
    providersFailed: string[];
    /** True when some providers/runs failed — report must be labelled partial. */
    partial: boolean;
  };
  shareOfVoice: number;
  /** True when there was no usable evidence at all; score is then null-equivalent (0) and unusable. */
  insufficientEvidence: boolean;
}

/** Readiness signals, each already reduced to a normalized 0..1 confidence. */
export type ReadinessSignals = Partial<Record<ReadinessDimensionKey, number>>;

export interface ReadinessDimensionBreakdown {
  key: ReadinessDimensionKey;
  value: number;
  maxPoints: number;
  points: number;
  evaluated: boolean;
}

export interface ReadinessResult {
  algorithmVersion: string;
  score: number;
  components: Record<ReadinessDimensionKey, number>;
  breakdown: ReadinessDimensionBreakdown[];
  /** Dimensions with no evidence score 0 and are listed here. */
  unevaluated: ReadinessDimensionKey[];
}
