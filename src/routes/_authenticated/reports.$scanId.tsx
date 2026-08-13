import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import type { ReactNode } from "react";

import { BAND_DESCRIPTOR, Meter } from "@/components/aieo/Meter";
import { Reveal } from "@/components/aieo/Reveal";
import { SignalBar } from "@/components/aieo/SignalBar";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getReport } from "@/lib/app.functions";
import { VARIABILITY_DISCLOSURE } from "@/lib/content";
import { READINESS_LABELS, scoreBand } from "@/lib/scoring/readiness";
import { READINESS_DIMENSIONS, VISIBILITY_WEIGHTS } from "@/lib/scoring/types";

export const Route = createFileRoute("/_authenticated/reports/$scanId")({
  head: () => ({
    meta: [
      { title: "AI visibility report — AIEO Meter" },
      {
        name: "description",
        content:
          "Your AI Visibility Score, AI Readiness Score, competitors observed and prioritized recommendations.",
      },
      { property: "og:title", content: "AI visibility report — AIEO Meter" },
      {
        property: "og:description",
        content: "Evidence-backed AI discovery report for your business.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReportPage,
});

const VISIBILITY_LABELS: Record<keyof typeof VISIBILITY_WEIGHTS, string> = {
  recommendationFrequency: "Recommendation frequency",
  mentionFrequency: "Mention frequency",
  shareOfVoice: "Share of voice",
  prominence: "Prominence",
  citationPresence: "Citation / source presence",
  consistency: "Consistency across engines",
};

function ReportPage() {
  const { scanId } = Route.useParams();
  const fetchReport = useServerFn(getReport);

  const reportQuery = useQuery({
    queryKey: ["report", scanId],
    queryFn: () => fetchReport({ data: { scanId } }),
  });

  if (reportQuery.isLoading) {
    return (
      <DashboardShell title="Report">
        <Skeleton className="h-96 w-full" />
      </DashboardShell>
    );
  }

  if (reportQuery.isError || !reportQuery.data) {
    return (
      <DashboardShell title="Report">
        <Card>
          <CardContent className="p-8 text-sm text-destructive">
            We could not load this report. It may not exist or may belong to another account.
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }

  const { scan, score, competitors, sources, recommendations, siteAudit } = reportQuery.data;
  const visibilityComponents = (score?.visibility_components ?? {}) as Partial<
    Record<keyof typeof VISIBILITY_WEIGHTS, number>
  >;
  const readinessComponents = (score?.readiness_components ?? {}) as Partial<
    Record<keyof typeof READINESS_DIMENSIONS, number>
  >;
  const complete = scan.status === "complete";

  return (
    <DashboardShell
      title={`${scan.businesses?.name ?? "Business"} — AI visibility report`}
      description={`${scan.businesses?.category ?? ""} · ${scan.businesses?.city ?? ""}, ${scan.businesses?.state ?? ""}`}
      actions={
        <Button asChild variant="outline">
          <Link to="/scans/$scanId" params={{ scanId }}>
            Scan details
          </Link>
        </Button>
      }
    >
      <div className="space-y-8">
        {!complete ? (
          <Card className="border-warning/40 bg-warning/5">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
              <div>
                <p className="text-sm font-semibold text-ink">
                  This report is {scan.status === "partial" ? "partial" : "not finished yet"}.
                </p>
                <p className="mt-2 max-w-2xl text-sm text-ink-soft">
                  Sections stay empty until real evidence exists. AIEO Meter never fills a report
                  with placeholder metrics — an unmeasured section is shown as unmeasured.
                </p>
              </div>
              <Badge variant="outline">{scan.status.replace(/_/g, " ")}</Badge>
            </CardContent>
          </Card>
        ) : null}

        <Reveal>
          <section className="aurora relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-card sm:p-12">
            <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between">
              <Meter
                score={score?.visibility_score == null ? null : Number(score.visibility_score)}
                label="Your AI Visibility"
                size="lg"
                signals
              />
              <div className="max-w-md text-center lg:text-left">
                <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
                  {score?.visibility_score == null
                    ? "No score yet — evidence is still being collected."
                    : `${BAND_DESCRIPTOR[scoreBand(Number(score.visibility_score))]} — here is what the tests found.`}
                </h2>
                <dl className="mt-8 grid grid-cols-2 gap-4">
                  {[
                    [
                      "AI Visibility",
                      score?.visibility_score == null ? "—" : String(score.visibility_score),
                    ],
                    [
                      "AI Readiness",
                      score?.readiness_score == null ? "—" : String(score.readiness_score),
                    ],
                    [
                      "Share of voice",
                      score?.share_of_voice == null
                        ? "—"
                        : `${Math.round(Number(score.share_of_voice) * 100)}%`,
                    ],
                    ["Top competitor", competitors[0]?.canonical_name ?? "—"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-border bg-background/70 p-4 text-left"
                    >
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {label}
                      </dt>
                      <dd className="numeric mt-2 truncate text-lg font-semibold text-ink">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>
        </Reveal>

        <Section number="01" title="Your score">
          {score ? (
            <p>
              Across{" "}
              {String(
                score.coverage &&
                  typeof score.coverage === "object" &&
                  "runsScored" in score.coverage
                  ? (score.coverage as { runsScored: number }).runsScored
                  : 0,
              )}{" "}
              completed engine tests, {scan.businesses?.name} scored {score.visibility_score ?? "—"}{" "}
              for AI visibility and {score.readiness_score ?? "—"} for AI readiness. Both figures
              are computed in code from the stored evidence for this scan (algorithm{" "}
              {score.algorithm_version}).
            </p>
          ) : (
            <p className="text-muted-foreground">
              No score snapshot has been calculated for this scan yet. Once provider evidence is
              recorded, scores appear here with their full component breakdown.
            </p>
          )}
        </Section>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border/80 shadow-card">
            <CardContent className="flex flex-col items-center p-8">
              <Meter
                score={score?.visibility_score == null ? null : Number(score.visibility_score)}
                label="AI Visibility"
              />
              <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
                How often the standardized tests actually surfaced this business.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-card">
            <CardContent className="flex flex-col items-center p-8">
              <Meter
                score={score?.readiness_score == null ? null : Number(score.readiness_score)}
                label="AI Readiness"
              />
              <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
                How well the business is prepared to be understood — measured separately from
                visibility.
              </p>
            </CardContent>
          </Card>
        </div>

        <Section number="02" title="What makes up your score">
          <div className="space-y-3">
            {(Object.keys(VISIBILITY_WEIGHTS) as Array<keyof typeof VISIBILITY_WEIGHTS>).map(
              (key) => {
                const value = visibilityComponents[key];
                return (
                  <div key={key} className="flex items-center gap-4">
                    <SignalBar
                      label={VISIBILITY_LABELS[key]}
                      value={Math.round((value ?? 0) * 100)}
                      valueLabel={value == null ? "unmeasured" : `${Math.round(value * 100)}%`}
                    />
                    <span className="numeric w-12 shrink-0 pt-5 text-right text-xs text-muted-foreground">
                      {Math.round(VISIBILITY_WEIGHTS[key] * 100)}%
                    </span>
                  </div>
                );
              },
            )}
          </div>
        </Section>

        <Section number="03" title="How ready your business is">
          <div className="space-y-2">
            {(Object.keys(READINESS_DIMENSIONS) as Array<keyof typeof READINESS_DIMENSIONS>).map(
              (key) => {
                const value = readinessComponents[key];
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between border-b border-border pb-2 text-sm"
                  >
                    <span className="text-ink">{READINESS_LABELS[key]}</span>
                    <span className="numeric text-muted-foreground">
                      {value == null
                        ? "unmeasured"
                        : `${Math.round(value * READINESS_DIMENSIONS[key] * 10) / 10} / ${READINESS_DIMENSIONS[key]}`}
                    </span>
                  </div>
                );
              },
            )}
          </div>
        </Section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Section number="04" title="Who AI recommended instead">
            {competitors.length === 0 ? (
              <Empty>No competitors have been recorded for this scan.</Empty>
            ) : (
              <ul className="space-y-2 text-sm">
                {competitors.map((competitor) => (
                  <li
                    key={competitor.id}
                    className="flex items-center justify-between border-b border-border pb-2"
                  >
                    <span className="text-ink">{competitor.canonical_name}</span>
                    <span className="numeric text-muted-foreground">
                      {competitor.recommendation_count} rec · {competitor.mention_count} mentions
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Your share of voice">
            {score?.share_of_voice == null ? (
              <Empty>Share of voice is calculated once engine evidence exists.</Empty>
            ) : (
              <p className="numeric text-3xl font-semibold text-ink">
                {Math.round(Number(score.share_of_voice) * 100)}%
              </p>
            )}
          </Section>

          <Section title="Where AI picked you">
            <Empty>
              Queries where this business was recommended will be listed here with their evidence
              snippets.
            </Empty>
          </Section>

          <Section title="Where AI picked someone else">
            <Empty>Queries where competitors were recommended instead will be listed here.</Empty>
          </Section>
        </div>

        <Section number="05" title="What AI cited">
          {sources.length === 0 ? (
            <Empty>No cited sources have been recorded for this scan.</Empty>
          ) : (
            <ul className="space-y-2 text-sm">
              {sources.slice(0, 25).map((source) => (
                <li
                  key={source.id}
                  className="flex items-center justify-between gap-4 border-b border-border pb-2"
                >
                  <span className="truncate text-ink">{source.title ?? source.url}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {source.host}
                    {source.is_owned_domain ? " · your domain" : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section number="06" title="Your website">
          {!siteAudit ? (
            <Empty>Your website has not been audited in this scan yet.</Empty>
          ) : (
            <div className="space-y-2 text-sm">
              <p className="text-ink-soft">
                {siteAudit.final_url ?? siteAudit.url} · HTTP {siteAudit.http_status ?? "—"}
              </p>
              <ul className="space-y-2">
                {(Array.isArray(siteAudit.findings)
                  ? (siteAudit.findings as Array<{ title?: string }>)
                  : []
                ).map((finding, index) => (
                  <li key={index} className="border-b border-border pb-2 text-ink">
                    {finding.title ?? "Finding"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Section>

        <Section number="07" title="Here’s what to fix">
          {recommendations.length === 0 ? (
            <Empty>
              Recommendations are generated from measured findings, so none appear until a scan
              completes.
            </Empty>
          ) : (
            <ol className="space-y-4">
              {recommendations.map((recommendation) => (
                <li key={recommendation.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="text-sm font-semibold text-ink">{recommendation.title}</h4>
                    <span className="numeric text-xs text-muted-foreground">
                      impact {recommendation.impact} · effort {recommendation.effort}
                    </span>
                  </div>
                  {recommendation.detail ? (
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {recommendation.detail}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
        </Section>

        <Section number="08" title="Your game plan">
          {recommendations.length === 0 ? (
            <Empty>
              The action plan sequences your measured recommendations across the next 30 days.
            </Empty>
          ) : (
            <ol className="space-y-2 text-sm text-ink-soft">
              {recommendations.slice(0, 6).map((recommendation, index) => (
                <li key={recommendation.id}>
                  Week {Math.floor(index / 2) + 1}: {recommendation.title}
                </li>
              ))}
            </ol>
          )}
        </Section>

        <Section title="Method and limits">
          <p>{VARIABILITY_DISCLOSURE}</p>
          <p className="mt-3">
            Scores in this report were computed in code from the evidence stored for this scan
            {score ? ` using algorithm ${score.algorithm_version}` : ""}. No language model assigned
            any score.
          </p>
        </Section>
      </div>
    </DashboardShell>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-7 shadow-card">
      <div className="flex items-center gap-3">
        {number ? <span className="chapter-number">{number}</span> : null}
        <h2 className="text-base font-semibold text-ink">{title}</h2>
      </div>
      <div className="mt-5 text-sm leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}
