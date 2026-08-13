import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, LineChart, ListChecks, Search, ShieldCheck } from "lucide-react";

import { SampleDataBadge } from "@/components/SampleDataBadge";
import { ScoreDial } from "@/components/ScoreDial";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VARIABILITY_DISCLOSURE } from "@/lib/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AIEO Meter — Is AI Recommending Your Business?" },
      {
        name: "description",
        content:
          "AIEO Meter measures how your local business appears when AI is asked the questions your customers ask. Standardized tests, deterministic scoring, auditable evidence.",
      },
      { property: "og:title", content: "AIEO Meter — Is AI Recommending Your Business?" },
      {
        property: "og:description",
        content: "AIEO Meter measures how your local business appears when AI is asked the questions your customers ask. Standardized tests, deterministic scoring, auditable evidence.",
      },
    ],
  }),
  component: LandingPage,
});

const STEPS = [
  {
    icon: Search,
    title: "Standardized buyer-intent tests",
    body: "We build a fixed set of questions a real customer might ask — best-in-market, service-specific, urgent, comparison — from your category, city and services.",
  },
  {
    icon: LineChart,
    title: "Multiple AI engines, recorded evidence",
    body: "Each question runs through supported web-grounded AI engines. Answers, cited sources and every business named are stored so results can be audited later.",
  },
  {
    icon: ListChecks,
    title: "Two separate scores",
    body: "An AI Visibility Score for how often you actually appear, and a separate AI Readiness Score for how well your business is prepared to be understood.",
  },
];

const HONESTY = [
  "We do not sell a permanent “ChatGPT ranking” — no such thing exists.",
  "We never guarantee that changes will make an AI recommend you.",
  "Scores are calculated in code from stored evidence, not judged by an AI.",
  "Every number in your report links back to the test that produced it.",
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-16 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-ink-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
              AI discovery measurement for local businesses
            </span>
            <h1 className="mt-6 text-4xl leading-[1.05] font-semibold text-ink sm:text-5xl lg:text-6xl">
              Is AI Recommending Your Business—or Your Competitors?
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              AIEO Meter measures how your business appears when AI is asked the questions your customers might ask.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link to="/auth">
                  Check My Business
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/methodology">See How It Works</Link>
              </Button>
            </div>
            <p className="mt-6 max-w-xl text-xs leading-relaxed text-muted-foreground">{VARIABILITY_DISCLOSURE}</p>
          </div>

          <Card className="border-border/80 shadow-lift">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Illustrative report
                </p>
                <SampleDataBadge />
              </div>
              <div className="mt-8 grid gap-8 sm:grid-cols-2">
                <ScoreDial score={38} label="AI Visibility Score" size="sm" />
                <ScoreDial score={64} label="AI Readiness Score" size="sm" />
              </div>
              <dl className="mt-8 space-y-3 border-t border-border pt-6 text-sm">
                {[
                  ["Recommended in", "3 of 14 tests"],
                  ["Share of voice", "11%"],
                  ["Top competitor observed", "Bright Drains Co"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="numeric font-medium text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 text-xs text-muted-foreground">
                Figures above are sample data for layout only. Your report contains only measured results.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <h2 className="max-w-2xl text-3xl font-semibold text-ink">
            Standardized tests, not guesswork
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">
            AI answers change between engines, sessions and phrasings. That is exactly why measurement has to be
            standardized and repeatable — and why we keep the raw evidence.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <Card key={step.title} className="border-border/80 shadow-card">
                <CardContent className="p-7">
                  <step.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h3 className="mt-5 text-lg font-semibold text-ink">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{step.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="text-3xl font-semibold text-ink">What the score actually measures</h2>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              The AI Visibility Score is a weighted 0–100 measure computed in code from the evidence a scan collected.
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              {[
                ["Recommendation frequency", "30%"],
                ["Mention frequency", "20%"],
                ["Share of voice", "15%"],
                ["Prominence", "15%"],
                ["Citation / source presence", "10%"],
                ["Consistency across engines", "10%"],
              ].map(([label, weight]) => (
                <li key={label} className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-ink">{label}</span>
                  <span className="numeric text-muted-foreground">{weight}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="link" className="mt-6 px-0">
              <Link to="/methodology">
                Read the full methodology
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <Card className="border-border/80 bg-surface shadow-card">
            <CardContent className="p-8">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="text-lg font-semibold text-ink">How we stay honest</h3>
              </div>
              <ul className="mt-6 space-y-4">
                {HONESTY.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-t border-border bg-ink">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-6 py-16 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-background sm:text-3xl">See where you stand today</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-background/70">
              Add your business once. Every scan reuses the same standardized tests, so you can compare over time.
            </p>
          </div>
          <Button asChild size="lg" variant="secondary">
            <Link to="/auth">Check My Business</Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
