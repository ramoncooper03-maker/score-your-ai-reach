import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { Reveal } from "@/components/aieo/Reveal";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { Button } from "@/components/ui/button";
import { VARIABILITY_DISCLOSURE } from "@/lib/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — AIeometer" },
      {
        name: "description",
        content:
          "Choose the Audit or the Blueprint for the full picture and a 30-day plan.",
      },
      { property: "og:title", content: "Pricing — AIeometer" },
      {
        property: "og:description",
        content:
          "A $49 Audit or the $149 Blueprint with implementation guidance.",
      },
    ],
  }),
  component: PricingPage,
});

const PLANS = [
  {
    name: "AI Presence Check",
    tag: "Free",
    price: "$0",
    cadence: "",
    summary: "See whether AI knows you exist.",
    features: ["A first look at your AI presence", "One business", "Plain-language result"],
    cta: "Check My Business",
    featured: false,
  },
  {
    name: "Audit",
    tag: "One time",
    price: "$49",
    cadence: "one time",
    summary: "See exactly where you stand.",
    features: [
      "AI Visibility Score",
      "AI Readiness Score",
      "Competitors",
      "AI query results",
      "Sources",
      "Website findings",
      "Priority recommendations",
    ],
    cta: "Run My Audit",
    featured: false,
  },
  {
    name: "Blueprint",
    tag: "Most popular",
    price: "$149",
    cadence: "one time",
    summary: "Know exactly what to do next.",
    features: [
      "Everything in Audit",
      "Implementation guidance",
      "Ready-to-use assets",
      "Content recommendations",
      "Structured data suggestions",
      "30-day plan",
    ],
    cta: "Build My Blueprint",
    featured: true,
  },
];

const FAQ = [
  {
    q: "Can you guarantee AI will recommend me?",
    a: "No, and nobody can. AI systems change their models and phrasing without notice. What we guarantee is the method: the same standardized tests, the same deterministic scoring, and the raw evidence behind every number.",
  },
  {
    q: "Is this a permanent ranking?",
    a: "No. Your score reflects what a fixed set of tests observed at a point in time. Re-run it later to see movement.",
  },
  {
    q: "Who assigns the score?",
    a: "Code does. Scores are calculated from stored evidence — no language model grades your business.",
  },
];

function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div
          className="aurora pointer-events-none absolute inset-0 opacity-60"
          aria-hidden="true"
        />
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-16 sm:pt-20">
          <div className="max-w-2xl" style={{ animation: "var(--animate-rise)" }}>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Pricing
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.05] text-ink sm:text-5xl lg:text-6xl">
              Start free. Go deeper when you’re ready.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">
              Pay for measurement, not promises. Every tier uses the same standardized tests and the
              same deterministic scoring, so results stay comparable across scans.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:items-start">
            {PLANS.map((plan, index) => (
              <Reveal key={plan.name} delay={index * 90}>
                <div
                  className={cn(
                    "soft-card hover-lift flex h-full flex-col p-7 sm:p-8",
                    plan.featured &&
                      "border-primary/40 shadow-lift ring-1 ring-primary/20 lg:-mt-4 lg:pb-10",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-ink">{plan.name}</h2>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                        plan.featured
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-muted text-muted-foreground",
                      )}
                    >
                      {plan.tag}
                    </span>
                  </div>
                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="numeric text-4xl font-semibold text-ink">{plan.price}</span>
                    {plan.cadence ? (
                      <span className="text-sm text-muted-foreground">{plan.cadence}</span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm text-ink-soft">{plan.summary}</p>
                  <ul className="mt-7 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex gap-3 text-sm leading-relaxed text-ink-soft"
                      >
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    size="lg"
                    className="mt-8 h-12 rounded-full"
                    variant={plan.featured ? "default" : "outline"}
                  >
                    <Link to="/auth">{plan.cta}</Link>
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {FAQ.map((item, index) => (
              <Reveal key={item.q} delay={index * 90}>
                <div className="soft-card h-full p-6">
                  <h3 className="text-base font-semibold text-ink">{item.q}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{item.a}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <p className="mt-12 max-w-3xl text-xs leading-relaxed text-muted-foreground">
            {VARIABILITY_DISCLOSURE}
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
