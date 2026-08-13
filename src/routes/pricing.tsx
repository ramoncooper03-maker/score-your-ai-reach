import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — AIeometer" },
      {
        name: "description",
        content:
          "Simple pricing for AI visibility measurement: a one-time diagnostic report, or ongoing tracking for businesses that want to watch the trend.",
      },
      { property: "og:title", content: "Pricing — AIeometer" },
      { property: "og:description", content: "One-time AI visibility reports and ongoing tracking plans." },
    ],
  }),
  component: PricingPage,
});

const PLANS = [
  {
    name: "Single Report",
    price: "$149",
    cadence: "one-time",
    summary: "A full diagnostic for one business location.",
    features: [
      "Standardized buyer-intent test set",
      "AI Visibility Score with component breakdown",
      "AI Readiness Score with website findings",
      "Observed competitors and share of voice",
      "Query wins, losses and cited sources",
      "Prioritized recommendations + 30-day action plan",
    ],
    cta: "Check My Business",
    highlighted: false,
  },
  {
    name: "Monitoring",
    price: "$99",
    cadence: "per month",
    summary: "Re-run the same tests monthly and track movement.",
    features: [
      "Everything in Single Report",
      "Monthly re-scan on the same standardized tests",
      "Score history and trend view",
      "Competitor movement tracking",
      "Email summary when scores change",
    ],
    cta: "Join the waitlist",
    highlighted: true,
    comingSoon: true,
  },
  {
    name: "Agency",
    price: "Custom",
    cadence: "",
    summary: "Multiple clients, shared workspaces, white-labeled reports.",
    features: ["Multiple businesses per workspace", "Team access", "White-labeled report export", "Bulk scanning"],
    cta: "Contact us",
    highlighted: false,
    comingSoon: true,
  },
];

function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold text-ink sm:text-5xl">Straightforward pricing</h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">
            Pay for measurement, not promises. Every plan uses the same standardized tests and the same deterministic
            scoring, so results are comparable across scans.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.highlighted
                  ? "relative border-primary/40 shadow-lift ring-1 ring-primary/20"
                  : "border-border/80 shadow-card"
              }
            >
              <CardContent className="flex h-full flex-col p-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-ink">{plan.name}</h2>
                  {plan.comingSoon ? (
                    <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Coming soon
                    </span>
                  ) : null}
                </div>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="numeric text-4xl font-semibold text-ink">{plan.price}</span>
                  {plan.cadence ? <span className="text-sm text-muted-foreground">{plan.cadence}</span> : null}
                </div>
                <p className="mt-3 text-sm text-ink-soft">{plan.summary}</p>
                <ul className="mt-7 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-8" variant={plan.highlighted ? "default" : "outline"}>
                  <Link to="/auth">{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-14 rounded-xl border border-border bg-surface p-8">
          <h2 className="text-lg font-semibold text-ink">What is not included</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-soft">
            No plan includes a guarantee of placement in any AI answer. AI systems change their models, grounding and
            phrasing without notice. What we guarantee is the method: the same standardized tests, the same
            deterministic scoring, and the raw evidence behind every number in your report.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
