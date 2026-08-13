import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Check, Circle, Loader2 } from "lucide-react";

import { Meter } from "@/components/aieo/Meter";
import { ProviderChip } from "@/components/aieo/ProviderChip";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getScanDetail } from "@/lib/app.functions";
import { SCAN_STEPS, TERMINAL_STATUSES } from "@/lib/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/scans/$scanId")({
  head: () => ({
    meta: [
      { title: "Scan status — AIEO Meter" },
      { name: "description", content: "Live status of your AI visibility scan, step by step." },
      { property: "og:title", content: "Scan status — AIEO Meter" },
      {
        property: "og:description",
        content: "Follow each stage of your standardized AI discovery scan.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ScanStatusPage,
});

function ScanStatusPage() {
  const { scanId } = Route.useParams();
  const fetchScan = useServerFn(getScanDetail);

  const scanQuery = useQuery({
    queryKey: ["scan", scanId],
    queryFn: () => fetchScan({ data: { scanId } }),
    refetchInterval: (query) => {
      const status = query.state.data?.scan.status;
      return status && (TERMINAL_STATUSES as readonly string[]).includes(status) ? false : 5000;
    },
  });

  const scan = scanQuery.data?.scan;
  const queries = scanQuery.data?.queries ?? [];
  const runs = scanQuery.data?.runs ?? [];
  const currentIndex = scan ? SCAN_STEPS.findIndex((step) => step.status === scan.status) : -1;
  const terminal = scan ? (TERMINAL_STATUSES as readonly string[]).includes(scan.status) : false;

  // Provider states come only from recorded runs — never invented for effect.
  const providerStates = runs.reduce<
    Record<string, { done: number; failed: number; total: number }>
  >((acc, run) => {
    const key = run.provider ?? "Unknown";
    const entry = acc[key] ?? { done: 0, failed: 0, total: 0 };
    entry.total += 1;
    if (run.status !== "pending" && run.status !== "running") entry.done += 1;
    if (run.status === "failed" || run.status === "timeout") entry.failed += 1;
    acc[key] = entry;
    return acc;
  }, {});

  return (
    <DashboardShell
      title={
        scan?.status === "complete" ? "Your AIEO Meter is ready" : "Measuring your AI visibility"
      }
      description="Each stage below reflects real progress on your scan — nothing is shown as done before it is."
      actions={
        terminal ? (
          <Button asChild className="rounded-full px-6 hover-lift">
            <Link to="/reports/$scanId" params={{ scanId }}>
              Open report
            </Link>
          </Button>
        ) : undefined
      }
    >
      {scanQuery.isLoading ? (
        <Skeleton className="h-72 w-full" />
      ) : scanQuery.isError || !scan ? (
        <Card>
          <CardContent className="p-8 text-sm text-destructive">
            We could not load this scan. It may not exist or may belong to another account.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
          <Card className="border-border/80 shadow-card">
            <CardContent className="p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-ink">
                    {scan.businesses?.name ?? "Business"}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {scan.businesses?.category} · {scan.businesses?.city}, {scan.businesses?.state}
                  </p>
                </div>
                <Badge variant={scan.status === "failed" ? "destructive" : "secondary"}>
                  {scan.status.replace(/_/g, " ")}
                </Badge>
              </div>

              {scan.status === "complete" && scanQuery.data?.score ? (
                <div className="mt-8 flex justify-center border-b border-border pb-8">
                  <Meter
                    score={
                      scanQuery.data.score.visibility_score == null
                        ? null
                        : Number(scanQuery.data.score.visibility_score)
                    }
                    label="AI Visibility"
                    size="md"
                    signals
                  />
                </div>
              ) : null}

              {Object.keys(providerStates).length > 0 ? (
                <div className="mt-8 flex flex-wrap gap-2.5">
                  {Object.entries(providerStates).map(([provider, state]) => (
                    <ProviderChip
                      key={provider}
                      name={provider}
                      state={state.done + state.failed >= state.total ? "done" : "searching"}
                      note={`${state.done}/${state.total} recorded${state.failed ? ` · ${state.failed} failed` : ""}`}
                    />
                  ))}
                </div>
              ) : null}

              <ol className="mt-8 space-y-1">
                {SCAN_STEPS.map((step, index) => {
                  const done = currentIndex > index || scan.status === "complete";
                  const active = currentIndex === index && !terminal;
                  return (
                    <li
                      key={step.status}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                        active && "bg-accent/60",
                      )}
                    >
                      {done ? (
                        <Check
                          className="h-4 w-4 text-success"
                          style={{ animation: "var(--animate-pop)" }}
                          aria-hidden="true"
                        />
                      ) : active ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
                      ) : (
                        <Circle className="h-4 w-4 text-border-strong" aria-hidden="true" />
                      )}
                      <span
                        className={cn(
                          "text-sm",
                          done
                            ? "text-ink"
                            : active
                              ? "font-medium text-ink"
                              : "text-muted-foreground",
                        )}
                      >
                        {step.label}
                      </span>
                      <span className="sr-only">
                        {done ? "complete" : active ? "in progress" : "pending"}
                      </span>
                    </li>
                  );
                })}
              </ol>

              {scan.status === "partial" ? (
                <div className="mt-6 flex gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm text-ink">
                  <AlertTriangle
                    className="mt-0.5 h-4 w-4 shrink-0 text-warning"
                    aria-hidden="true"
                  />
                  <p>
                    One or more AI engines failed during this scan. Your report is marked partial
                    and the affected engines are listed in it — failed engines are excluded from
                    scoring rather than counted as zero.
                  </p>
                </div>
              ) : null}

              {scan.status === "failed" ? (
                <div className="mt-6 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-ink">
                  <p className="font-medium text-destructive">This scan failed.</p>
                  <p className="mt-2 text-ink-soft">
                    {scan.error_message ?? "No usable evidence was collected."}
                  </p>
                </div>
              ) : null}

              {scan.status === "refund_review" ? (
                <div className="mt-6 rounded-lg border border-border bg-surface p-4 text-sm text-ink-soft">
                  This scan collected too little evidence to score fairly and has been flagged for
                  refund review.
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border/80">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Coverage
                </h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <Row label="Standardized queries" value={String(queries.length)} />
                  <Row label="Provider runs recorded" value={String(runs.length)} />
                  <Row
                    label="Engines requested"
                    value={
                      scan.providers_requested.length
                        ? scan.providers_requested.join(", ")
                        : "Not configured yet"
                    }
                  />
                  <Row
                    label="Engines failed"
                    value={scan.providers_failed.length ? scan.providers_failed.join(", ") : "None"}
                  />
                </dl>
                {scan.providers_requested.length === 0 ? (
                  <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                    No AI engine adapters are configured in this deployment yet, so this scan stops
                    after generating its standardized query set. Nothing is scored until real
                    provider evidence exists.
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Queries in this scan
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-ink-soft">
                  {queries.length === 0 ? (
                    <li className="text-muted-foreground">Not generated yet.</li>
                  ) : (
                    queries.map((query) => (
                      <li
                        key={query.id}
                        className="rounded-lg border border-border bg-surface px-3 py-2"
                      >
                        {query.query_text}
                      </li>
                    ))
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}
