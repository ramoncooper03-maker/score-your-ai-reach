import {
  ALGORITHM_VERSION,
  VISIBILITY_WEIGHTS,
  type RunEvidence,
  type VisibilityComponentKey,
  type VisibilityResult,
} from "./types";

const SCORED_STATUSES = new Set(["succeeded"]);

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function ratio(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return clamp01(numerator / denominator);
}

/**
 * Prominence of a single mention.
 * Top of a list scores 1, bottom scores 0, single-item lists score 1.
 * A mention with no list structure scores 0.5 (present but unranked).
 */
export function prominenceForRun(run: RunEvidence): number {
  if (!run.targetMentioned) return 0;
  const position = run.targetListPosition;
  const length = run.targetListLength;
  if (position == null || length == null || length <= 0) return 0.5;
  if (length === 1) return 1;
  const bounded = Math.min(Math.max(position, 1), length);
  return clamp01((length - bounded) / (length - 1));
}

/**
 * Consistency across providers: 1 minus the normalized spread of each
 * provider's mention rate. Identical behaviour across providers scores 1,
 * one provider always mentioning and another never scores 0.
 */
export function consistencyAcrossProviders(runs: readonly RunEvidence[]): number {
  const byProvider = new Map<string, { mentions: number; total: number }>();
  for (const run of runs) {
    const bucket = byProvider.get(run.provider) ?? { mentions: 0, total: 0 };
    bucket.total += 1;
    if (run.targetMentioned) bucket.mentions += 1;
    byProvider.set(run.provider, bucket);
  }
  const rates = [...byProvider.values()].map((bucket) => ratio(bucket.mentions, bucket.total));
  if (rates.length === 0) return 0;
  if (rates.length === 1) return rates[0]! > 0 ? 1 : 0;
  const min = Math.min(...rates);
  const max = Math.max(...rates);
  return clamp01(1 - (max - min));
}

/**
 * Compute the AI Visibility Score (0-100) from stored run evidence.
 * Pure function — same evidence always yields the same score.
 */
export function calculateVisibilityScore(runs: readonly RunEvidence[]): VisibilityResult {
  const scored = runs.filter((run) => SCORED_STATUSES.has(run.status));
  const failed = runs.filter((run) => !SCORED_STATUSES.has(run.status));

  const recommendedCount = scored.filter((run) => run.targetRecommended).length;
  const mentionedRuns = scored.filter((run) => run.targetMentioned);

  const targetMentions = mentionedRuns.length;
  const competitorMentions = scored.reduce(
    (total, run) => total + new Set(run.competitorKeys).size,
    0,
  );

  const prominenceValues = mentionedRuns.map(prominenceForRun);
  const prominence =
    prominenceValues.length === 0
      ? 0
      : prominenceValues.reduce((sum, value) => sum + value, 0) / prominenceValues.length;

  const components: Record<VisibilityComponentKey, number> = {
    recommendationFrequency: ratio(recommendedCount, scored.length),
    mentionFrequency: ratio(targetMentions, scored.length),
    shareOfVoice: ratio(targetMentions, targetMentions + competitorMentions),
    prominence: clamp01(prominence),
    citationPresence: ratio(scored.filter((run) => run.ownedDomainCited).length, scored.length),
    consistency: consistencyAcrossProviders(scored),
  };

  const breakdown = (Object.keys(VISIBILITY_WEIGHTS) as VisibilityComponentKey[]).map((key) => {
    const weight = VISIBILITY_WEIGHTS[key];
    return {
      key,
      value: components[key],
      weight,
      points: round2(components[key] * weight * 100),
    };
  });

  const rawScore = breakdown.reduce(
    (sum, item) => sum + components[item.key] * item.weight * 100,
    0,
  );

  const providersScored = [...new Set(scored.map((run) => run.provider))].sort();
  const providersFailed = [...new Set(failed.map((run) => run.provider))].sort();

  return {
    algorithmVersion: ALGORITHM_VERSION,
    score: Math.round(rawScore),
    components,
    breakdown,
    coverage: {
      runsTotal: runs.length,
      runsScored: scored.length,
      runsFailed: failed.length,
      queriesScored: new Set(scored.map((run) => run.queryId)).size,
      providersScored,
      providersFailed,
      partial: failed.length > 0 && scored.length > 0,
    },
    shareOfVoice: components.shareOfVoice,
    insufficientEvidence: scored.length === 0,
  };
}

/** Per-provider visibility breakdown for the report's engine section. */
export function visibilityByProvider(
  runs: readonly RunEvidence[],
): Array<{ provider: string; result: VisibilityResult }> {
  const providers = [...new Set(runs.map((run) => run.provider))].sort();
  return providers.map((provider) => ({
    provider,
    result: calculateVisibilityScore(runs.filter((run) => run.provider === provider)),
  }));
}

/** Share of voice per entity (target + competitors), summing to 1 when evidence exists. */
export function shareOfVoiceTable(
  runs: readonly RunEvidence[],
  targetKey: string,
): Array<{ key: string; mentions: number; share: number }> {
  const scored = runs.filter((run) => SCORED_STATUSES.has(run.status));
  const counts = new Map<string, number>();
  for (const run of scored) {
    if (run.targetMentioned) counts.set(targetKey, (counts.get(targetKey) ?? 0) + 1);
    for (const key of new Set(run.competitorKeys)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  const total = [...counts.values()].reduce((sum, value) => sum + value, 0);
  return [...counts.entries()]
    .map(([key, mentions]) => ({ key, mentions, share: total === 0 ? 0 : mentions / total }))
    .sort((a, b) => b.mentions - a.mentions || a.key.localeCompare(b.key));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
