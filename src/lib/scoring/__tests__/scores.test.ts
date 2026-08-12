import { describe, expect, it } from "vitest";

import { calculateVisibilityScore, consistencyAcrossProviders, prominenceForRun, shareOfVoiceTable, visibilityByProvider } from "../visibility";
import { calculateReadinessScore, scoreBand } from "../readiness";
import { READINESS_DIMENSIONS, VISIBILITY_WEIGHTS, type RunEvidence } from "../types";

function run(overrides: Partial<RunEvidence> = {}): RunEvidence {
  return {
    runId: overrides.runId ?? "run-1",
    queryId: overrides.queryId ?? "query-1",
    provider: overrides.provider ?? "provider-a",
    status: overrides.status ?? "succeeded",
    targetMentioned: overrides.targetMentioned ?? false,
    targetRecommended: overrides.targetRecommended ?? false,
    targetListPosition: overrides.targetListPosition ?? null,
    targetListLength: overrides.targetListLength ?? null,
    competitorKeys: overrides.competitorKeys ?? [],
    ownedDomainCited: overrides.ownedDomainCited ?? false,
  };
}

describe("weights", () => {
  it("visibility weights sum to 1", () => {
    const total = Object.values(VISIBILITY_WEIGHTS).reduce((sum, value) => sum + value, 0);
    expect(total).toBeCloseTo(1, 10);
  });

  it("readiness dimensions sum to 100", () => {
    const total = Object.values(READINESS_DIMENSIONS).reduce((sum, value) => sum + value, 0);
    expect(total).toBe(100);
  });
});

describe("calculateVisibilityScore", () => {
  it("returns 0 and flags insufficient evidence with no usable runs", () => {
    const result = calculateVisibilityScore([]);
    expect(result.score).toBe(0);
    expect(result.insufficientEvidence).toBe(true);
    expect(result.coverage.partial).toBe(false);
  });

  it("scores a perfect run set at 100", () => {
    const runs = ["provider-a", "provider-b"].flatMap((provider) =>
      [1, 2].map((n) =>
        run({
          runId: `${provider}-${n}`,
          queryId: `q${n}`,
          provider,
          targetMentioned: true,
          targetRecommended: true,
          targetListPosition: 1,
          targetListLength: 3,
          ownedDomainCited: true,
        }),
      ),
    );
    const result = calculateVisibilityScore(runs);
    expect(result.score).toBe(100);
    expect(result.components.shareOfVoice).toBe(1);
  });

  it("scores an invisible business at 0", () => {
    const runs = [run({ competitorKeys: ["acme plumbing"] }), run({ runId: "r2", competitorKeys: ["bright plumbing"] })];
    const result = calculateVisibilityScore(runs);
    expect(result.score).toBe(0);
    expect(result.insufficientEvidence).toBe(false);
  });

  it("is deterministic and order-independent", () => {
    const runs = [
      run({ runId: "a", targetMentioned: true, targetRecommended: true, targetListPosition: 2, targetListLength: 4, competitorKeys: ["x co"] }),
      run({ runId: "b", queryId: "q2", provider: "provider-b", targetMentioned: true, competitorKeys: ["x co", "y co"] }),
      run({ runId: "c", queryId: "q3", provider: "provider-b", status: "failed" }),
    ];
    const first = calculateVisibilityScore(runs);
    const second = calculateVisibilityScore([...runs].reverse());
    expect(first.score).toBe(second.score);
    expect(first.components).toEqual(second.components);
  });

  it("computes each component from evidence", () => {
    const runs = [
      run({ runId: "a", targetMentioned: true, targetRecommended: true, targetListPosition: 1, targetListLength: 2, ownedDomainCited: true, competitorKeys: ["rival one"] }),
      run({ runId: "b", queryId: "q2", targetMentioned: true, competitorKeys: ["rival one"] }),
      run({ runId: "c", queryId: "q3", competitorKeys: ["rival one", "rival two"] }),
      run({ runId: "d", queryId: "q4", competitorKeys: [] }),
    ];
    const result = calculateVisibilityScore(runs);
    expect(result.components.recommendationFrequency).toBeCloseTo(0.25);
    expect(result.components.mentionFrequency).toBeCloseTo(0.5);
    // target mentions 2, competitor mentions 4 -> 2/6
    expect(result.components.shareOfVoice).toBeCloseTo(2 / 6);
    // prominence: (1) and (0.5 unranked) -> 0.75
    expect(result.components.prominence).toBeCloseTo(0.75);
    expect(result.components.citationPresence).toBeCloseTo(0.25);
  });

  it("ignores failed runs but marks the result partial", () => {
    const runs = [
      run({ runId: "ok", targetMentioned: true, targetRecommended: true, provider: "provider-a" }),
      run({ runId: "bad", provider: "provider-b", status: "failed" }),
      run({ runId: "slow", provider: "provider-c", status: "timeout" }),
    ];
    const result = calculateVisibilityScore(runs);
    expect(result.coverage.runsScored).toBe(1);
    expect(result.coverage.runsFailed).toBe(2);
    expect(result.coverage.partial).toBe(true);
    expect(result.coverage.providersFailed).toEqual(["provider-b", "provider-c"]);
    expect(result.components.mentionFrequency).toBe(1);
  });

  it("does not treat a fully failed scan as a zero score", () => {
    const result = calculateVisibilityScore([run({ status: "failed" }), run({ runId: "b", status: "timeout" })]);
    expect(result.insufficientEvidence).toBe(true);
    expect(result.coverage.partial).toBe(false);
  });
});

describe("prominenceForRun", () => {
  it("scores top of list 1 and bottom 0", () => {
    expect(prominenceForRun(run({ targetMentioned: true, targetListPosition: 1, targetListLength: 5 }))).toBe(1);
    expect(prominenceForRun(run({ targetMentioned: true, targetListPosition: 5, targetListLength: 5 }))).toBe(0);
  });

  it("scores unranked mentions 0.5 and absent mentions 0", () => {
    expect(prominenceForRun(run({ targetMentioned: true }))).toBe(0.5);
    expect(prominenceForRun(run({ targetMentioned: false }))).toBe(0);
  });

  it("clamps out-of-range positions", () => {
    expect(prominenceForRun(run({ targetMentioned: true, targetListPosition: 99, targetListLength: 3 }))).toBe(0);
    expect(prominenceForRun(run({ targetMentioned: true, targetListPosition: 0, targetListLength: 3 }))).toBe(1);
  });
});

describe("consistencyAcrossProviders", () => {
  it("is 1 when every provider behaves identically", () => {
    expect(
      consistencyAcrossProviders([
        run({ provider: "a", targetMentioned: true }),
        run({ provider: "b", targetMentioned: true }),
      ]),
    ).toBe(1);
  });

  it("is 0 when providers fully disagree", () => {
    expect(
      consistencyAcrossProviders([
        run({ provider: "a", targetMentioned: true }),
        run({ provider: "b", targetMentioned: false }),
      ]),
    ).toBe(0);
  });
});

describe("share of voice and per-provider breakdown", () => {
  it("shares sum to 1", () => {
    const table = shareOfVoiceTable(
      [
        run({ targetMentioned: true, competitorKeys: ["rival one"] }),
        run({ runId: "b", queryId: "q2", competitorKeys: ["rival one", "rival two"] }),
      ],
      "target biz",
    );
    expect(table.reduce((sum, row) => sum + row.share, 0)).toBeCloseTo(1);
    expect(table[0]!.key).toBe("rival one");
  });

  it("breaks visibility down per provider", () => {
    const breakdown = visibilityByProvider([
      run({ provider: "a", targetMentioned: true, targetRecommended: true }),
      run({ provider: "b", runId: "b" }),
    ]);
    expect(breakdown.map((entry) => entry.provider)).toEqual(["a", "b"]);
    expect(breakdown[0]!.result.score).toBeGreaterThan(breakdown[1]!.result.score);
  });
});

describe("calculateReadinessScore", () => {
  it("is 0 with no signals and lists unevaluated dimensions", () => {
    const result = calculateReadinessScore({});
    expect(result.score).toBe(0);
    expect(result.unevaluated).toHaveLength(Object.keys(READINESS_DIMENSIONS).length);
  });

  it("is 100 when every dimension is perfect", () => {
    const signals = Object.fromEntries(Object.keys(READINESS_DIMENSIONS).map((key) => [key, 1]));
    expect(calculateReadinessScore(signals).score).toBe(100);
  });

  it("weights dimensions by their maximum points", () => {
    expect(calculateReadinessScore({ entityClarity: 1 }).score).toBe(20);
    expect(calculateReadinessScore({ structuredData: 1 }).score).toBe(5);
    expect(calculateReadinessScore({ entityClarity: 0.5, siteFundamentals: 1 }).score).toBe(25);
  });

  it("clamps invalid values", () => {
    expect(calculateReadinessScore({ entityClarity: 5, trustEvidence: -3 }).score).toBe(20);
    expect(calculateReadinessScore({ entityClarity: Number.NaN }).unevaluated).toContain("entityClarity");
  });

  it("is independent of the visibility score", () => {
    const readiness = calculateReadinessScore({ entityClarity: 1, siteFundamentals: 1 });
    const visibility = calculateVisibilityScore([run()]);
    expect(readiness.score).toBe(35);
    expect(visibility.score).toBe(0);
  });
});

describe("scoreBand", () => {
  it("maps scores to presentation bands", () => {
    expect(scoreBand(0)).toBe("critical");
    expect(scoreBand(25)).toBe("weak");
    expect(scoreBand(55)).toBe("developing");
    expect(scoreBand(70)).toBe("strong");
    expect(scoreBand(95)).toBe("leading");
  });
});
