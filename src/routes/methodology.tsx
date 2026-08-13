import { createFileRoute } from "@tanstack/react-router";

import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { Card, CardContent } from "@/components/ui/card";
import { VARIABILITY_DISCLOSURE } from "@/lib/content";
import { READINESS_LABELS } from "@/lib/scoring/readiness";
import { QUERY_TEMPLATES } from "@/lib/scan/queries";
import { READINESS_DIMENSIONS, VISIBILITY_WEIGHTS, ALGORITHM_VERSION } from "@/lib/scoring/types";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Methodology — How AIEO Meter is calculated" },
      {
        name: "description",
        content:
          "How AIEO Meter works: standardized buyer-intent queries, multiple web-grounded AI engines, stored evidence, and deterministic 0-100 visibility and readiness scoring.",
      },
      { property: "og:title", content: "Methodology — How AIEO Meter is calculated" },
      {
        property: "og:description",
        content: "Standardized queries, stored evidence, and scores computed in code — not judged by an AI.",
      },
    ],
  }),
  component: MethodologyPage,
});

const VISIBILITY_LABELS: Record<keyof typeof VISIBILITY_WEIGHTS, { label: string; detail: string }> = {
  recommendationFrequency: {
    label: "Recommendation frequency",
    detail: "Share of completed tests where your business is presented as a suggested option, not merely named.",
  },
  mentionFrequency: {
    label: "Mention frequency",
    detail: "Share of completed tests where your business appears anywhere in the answer.",
  },
  shareOfVoice: {
    label: "Share of voice",
    detail: "Your mentions divided by all business mentions observed across the test set.",
  },
  prominence: {
    label: "Prominence",
    detail: "Where you appear within a ranked answer. Top of list scores 1, bottom scores 0, unranked mentions score 0.5.",
  },
  citationPresence: {
    label: "Citation / source presence",
    detail: "Share of completed tests where a source on your own domain was cited by the engine.",
  },
  consistency: {
    label: "Consistency",
    detail: "How similarly the engines behaved. Wide disagreement between engines lowers this component.",
  },
};

function MethodologyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <article className="mx-auto w-full max-w-3xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Algorithm version {ALGORITHM_VERSION}
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-ink sm:text-5xl">Methodology</h1>
        <p className="mt-6 text-lg leading-relaxed text-ink-soft">
          AIEO Meter is a measurement instrument. It runs a fixed set of buyer-intent questions through supported
          web-grounded AI engines, records exactly what came back, and computes scores from that stored evidence in
          code.
        </p>

        <Card className="mt-10 border-warning/40 bg-warning/5">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink">Important disclosure</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{VARIABILITY_DISCLOSURE}</p>
          </CardContent>
        </Card>

        <Section title="1. Business profile">
          <p>
            A scan starts from what you provide: business name, website, category, city, state and primary services.
            Your website is fetched once through a strict URL validator that refuses non-public addresses, and its text
            is stripped of markup before storage. All retrieved content is treated as untrusted data — never as
            instructions.
          </p>
        </Section>

        <Section title="2. Standardized query set">
          <p>
            Queries are generated in code from templates, never by a model, so two businesses in the same category get
            comparable tests and repeat scans stay consistent.
          </p>
          <ul className="mt-4 space-y-2">
            {QUERY_TEMPLATES.map((template) => (
              <li key={template.code} className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink">
                <span className="text-muted-foreground">{template.intentType}</span>
                <br />
                {template.template}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="3. Running the tests">
          <p>
            Each query is submitted to every configured web-grounded AI engine with a timeout and bounded retries. The
            answer text, cited sources, model identifier and raw provider payload are stored as scan evidence. If an
            engine fails, that failure is recorded and the scan is reported as partial rather than silently scored as
            a zero.
          </p>
        </Section>

        <Section title="4. Entity normalization">
          <p>
            Business names in answers are normalized — lowercased, de-accented, punctuation removed, legal suffixes
            such as LLC or Inc. dropped — so “The Rapid Plumbing Co.” and “Rapid Plumbing LLC” resolve to one entity.
            Ranked lists are parsed to determine position, and every non-target entry becomes an observed competitor.
          </p>
        </Section>

        <Section title="5. AI Visibility Score (0–100)">
          <p>
            Computed as a weighted sum of six components, each normalized to 0–1. The same evidence always produces the
            same score.
          </p>
          <div className="mt-5 space-y-3">
            {(Object.keys(VISIBILITY_WEIGHTS) as Array<keyof typeof VISIBILITY_WEIGHTS>).map((key) => (
              <div key={key} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-semibold text-ink">{VISIBILITY_LABELS[key].label}</h3>
                  <span className="numeric text-sm text-primary">{Math.round(VISIBILITY_WEIGHTS[key] * 100)}%</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{VISIBILITY_LABELS[key].detail}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="6. AI Readiness Score (0–100)">
          <p>
            Readiness is a separate score. It describes how well your business is prepared to be found, understood and
            trusted by AI systems — independent of whether you currently appear in answers. Dimensions with no
            available evidence contribute zero and are labelled as unevaluated in your report.
          </p>
          <div className="mt-5 space-y-2">
            {(Object.keys(READINESS_DIMENSIONS) as Array<keyof typeof READINESS_DIMENSIONS>).map((key) => (
              <div key={key} className="flex items-center justify-between border-b border-border pb-2 text-sm">
                <span className="text-ink">{READINESS_LABELS[key]}</span>
                <span className="numeric text-muted-foreground">{READINESS_DIMENSIONS[key]} pts</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="7. Auditability">
          <p>
            Raw evidence is retained for every scan: each provider response, each mention with its snippet, each cited
            source, and the website audit signals. Any score in a report can be recomputed from that evidence, and the
            algorithm version is stamped on every snapshot so historical reports stay interpretable.
          </p>
        </Section>

        <Section title="8. What this is not">
          <ul className="mt-2 space-y-3">
            <li>It is not a deterministic “ChatGPT ranking”; AI answers are probabilistic and change over time.</li>
            <li>It is not a guarantee. No optimization can force an AI system to recommend a business.</li>
            <li>It is not an LLM opinion. No model assigns your score — scores come from code and stored evidence.</li>
          </ul>
        </Section>
      </article>

      <SiteFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft [&_ul]:list-disc [&_ul]:pl-5">{children}</div>
    </section>
  );
}
