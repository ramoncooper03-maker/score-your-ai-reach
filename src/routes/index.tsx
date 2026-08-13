import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  MapPin,
  MessageCircle,
  Quote,
  Search,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import type { ReactNode } from "react";

import { Meter } from "@/components/aieo/Meter";
import { ProviderChip } from "@/components/aieo/ProviderChip";
import { Reveal } from "@/components/aieo/Reveal";
import { SignalBar } from "@/components/aieo/SignalBar";
import { SampleDataBadge } from "@/components/SampleDataBadge";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { Button } from "@/components/ui/button";
import { VARIABILITY_DISCLOSURE } from "@/lib/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AIEO Meter — Does AI Recommend Your Business?" },
      {
        name: "description",
        content:
          "AIEO Meter measures how your business shows up across ChatGPT, Gemini and Perplexity, then shows you exactly what to improve. Standardized tests, real evidence.",
      },
      { property: "og:title", content: "AIEO Meter — Does AI Recommend Your Business?" },
      {
        property: "og:description",
        content:
          "See how your business appears across ChatGPT, Gemini and Perplexity — then discover what you can do to improve.",
      },
    ],
  }),
  component: LandingPage,
});

const PROVIDERS = ["ChatGPT", "Gemini", "Perplexity"] as const;

const PROMPTS = [
  { text: "Best plumber near me", icon: Search },
  { text: "Who should install my new roof?", icon: MessageCircle },
  { text: "Best dentist in Orlando", icon: MapPin },
  { text: "Who can clear my property?", icon: Search },
];

const RESULT_ROWS = [
  { name: "Your Business", state: "Not found", tone: "bad" as const },
  { name: "Competitor A", state: "Recommended", tone: "good" as const },
  { name: "Competitor B", state: "Recommended", tone: "good" as const },
  { name: "Competitor C", state: "Mentioned", tone: "warn" as const },
];

const COMPONENT_CARDS = [
  {
    title: "Recommendation Frequency",
    body: "How often AI names you as the answer, not just a passing mention.",
    tone: "signal" as const,
    value: 42,
    icon: Star,
  },
  {
    title: "Mention Frequency",
    body: "How often you appear anywhere in the answer at all.",
    tone: "mint" as const,
    value: 58,
    icon: MessageCircle,
  },
  {
    title: "Share of Voice",
    body: "Your slice of the businesses AI talks about in your category.",
    tone: "violet" as const,
    value: 18,
    icon: TrendingUp,
  },
  {
    title: "Prominence",
    body: "Whether you land near the top of the list or right at the bottom.",
    tone: "amber" as const,
    value: 35,
    icon: Target,
  },
  {
    title: "Citation Presence",
    body: "Whether the pages AI cites actually include yours.",
    tone: "coral" as const,
    value: 24,
    icon: Quote,
  },
  {
    title: "Consistency",
    body: "Whether every AI engine agrees about you, or only one does.",
    tone: "primary" as const,
    value: 61,
    icon: BadgeCheck,
  },
];

const SHARE_OF_VOICE = [
  { name: "Your Business", value: 18, tone: "coral" as const },
  { name: "Competitor A", value: 34, tone: "signal" as const },
  { name: "Competitor B", value: 27, tone: "mint" as const },
  { name: "Competitor C", value: 21, tone: "violet" as const },
];

const READINESS_ROWS = [
  { label: "Business Clarity", value: 78 },
  { label: "Services & Locations", value: 54 },
  { label: "Site Fundamentals", value: 71 },
  { label: "Trust", value: 62 },
  { label: "Local Consistency", value: 45 },
  { label: "Third-Party Presence", value: 58 },
  { label: "Structured Data", value: 33 },
  { label: "Question Coverage", value: 49 },
];

const FIXES = [
  {
    priority: "Priority 1",
    title: "Clarify your service area",
    body: "AIEO Meter found inconsistent location information across important pages.",
  },
  {
    priority: "Priority 2",
    title: "Strengthen your service pages",
    body: "3 of your primary services lack dedicated supporting content.",
  },
  {
    priority: "Priority 3",
    title: "Make your reviews findable",
    body: "Your strongest proof lives off-site where the tested answers never reached it.",
  },
];

const WEEKS = [
  {
    week: "Week 1",
    title: "Foundation",
    body: "Fix the basics AI reads first: name, place, services, contact.",
  },
  {
    week: "Week 2",
    title: "Services & Locations",
    body: "Give every service and area a page worth quoting.",
  },
  {
    week: "Week 3",
    title: "Trust & Content",
    body: "Answer the real questions customers ask before buying.",
  },
  {
    week: "Week 4",
    title: "Authority & Verification",
    body: "Line up listings, citations and third-party proof.",
  },
];

const PLANS = [
  {
    name: "AI Presence Check",
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

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* SECTION 1 — hero */}
      <section className="relative overflow-hidden">
        <div
          className="aurora pointer-events-none absolute inset-0 opacity-90"
          aria-hidden="true"
        />
        <div
          className="grid-backdrop pointer-events-none absolute inset-0 opacity-40"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid w-full max-w-6xl gap-14 px-6 pb-20 pt-16 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:pb-28 lg:pt-24">
          <div style={{ animation: "var(--animate-rise)" }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-ink-soft shadow-card">
              <Sparkles className="h-3.5 w-3.5 text-brand-amber" aria-hidden="true" />A meter for
              your AI visibility
            </span>
            <h1 className="mt-6 text-[2.6rem] leading-[1.02] font-semibold text-ink sm:text-6xl lg:text-[4.25rem]">
              Does AI recommend your business?
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl">
              See how your business appears across ChatGPT, Gemini and Perplexity — then discover
              what you can do to improve.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-13 rounded-full px-7 text-base hover-lift">
                <Link to="/auth">
                  Check My AI Visibility
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-13 rounded-full px-7 text-base"
              >
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>
            <div className="mt-9 flex flex-wrap gap-2.5">
              {PROVIDERS.map((provider) => (
                <ProviderChip key={provider} name={provider} />
              ))}
            </div>
          </div>

          <div className="relative flex flex-col items-center">
            <div
              className="soft-card w-full max-w-md p-8 sm:p-10"
              style={{ animation: "var(--animate-pop)" }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Example result
                </p>
                <SampleDataBadge />
              </div>
              <Meter score={72} label="AI Visibility" size="md" signals className="mt-6" />
              <div className="mt-8 grid grid-cols-2 gap-3 border-t border-border pt-6">
                {[
                  ["Mentioned", true],
                  ["Recommended", true],
                  ["#2 Position", true],
                  ["5 Sources", true],
                ].map(([label, ok], index) => (
                  <div
                    key={String(label)}
                    className="flex items-center gap-2 text-sm text-ink"
                    style={{
                      animation: "var(--animate-rise)",
                      animationDelay: `${400 + index * 120}ms`,
                    }}
                  >
                    {ok ? (
                      <Check className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                    ) : null}
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-5 max-w-md text-center text-xs leading-relaxed text-muted-foreground">
              Figures shown here are an example for illustration. Your report contains only measured
              results.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2 — customers are asking AI */}
      <Chapter
        id="how-it-works"
        number="01"
        eyebrow="The new front door"
        title="Your customers are asking AI who to choose."
        lede="Before they call anyone, people describe their problem to an assistant and take the shortlist it gives back."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {PROMPTS.map((prompt, index) => (
            <Reveal key={prompt.text} delay={index * 90}>
              <div className="soft-card hover-lift flex items-center gap-3 px-5 py-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent">
                  <prompt.icon className="h-4 w-4 text-accent-foreground" aria-hidden="true" />
                </span>
                <p className="text-base text-ink">“{prompt.text}”</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={200}>
          <div className="soft-card mt-6 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-brand-mint" aria-hidden="true" />A typical
              answer
            </div>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              “Based on recent reviews and local coverage, three options stand out:{" "}
              <span className="font-semibold text-ink">Competitor A</span>,{" "}
              <span className="font-semibold text-ink">Competitor B</span> and{" "}
              <span className="font-semibold text-ink">Competitor C</span>.”
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              AI has quietly become another discovery channel — one nobody is measuring.
            </p>
          </div>
        </Reveal>
      </Chapter>

      {/* SECTION 3 — but is AI choosing you */}
      <Chapter
        number="02"
        eyebrow="The reveal"
        title="But is AI choosing you?"
        lede="Here is what a set of standardized discovery questions can look like when a business has no AI presence."
        surface
      >
        <Reveal>
          <div className="soft-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <p className="text-sm font-semibold text-ink">AI recommendation results</p>
              <SampleDataBadge />
            </div>
            <ul className="divide-y divide-border">
              {RESULT_ROWS.map((row, index) => (
                <li
                  key={row.name}
                  className={cn(
                    "flex items-center justify-between gap-4 px-6 py-5",
                    row.tone === "bad" && "bg-destructive/[0.04]",
                  )}
                  style={{ animation: "var(--animate-rise)", animationDelay: `${index * 110}ms` }}
                >
                  <span
                    className={cn(
                      "text-base",
                      row.tone === "bad" ? "font-semibold text-ink" : "text-ink-soft",
                    )}
                  >
                    {row.name}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
                      row.tone === "bad" &&
                        "border-destructive/30 bg-destructive/10 text-destructive",
                      row.tone === "good" && "border-success/30 bg-success/10 text-success",
                      row.tone === "warn" &&
                        "border-warning/40 bg-warning/10 text-warning-foreground",
                    )}
                  >
                    {row.tone === "bad" ? (
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {row.state}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={150}>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink">
            If AI doesn’t mention your business, you may never enter the customer’s consideration
            set.
          </p>
        </Reveal>
      </Chapter>

      {/* SECTION 4 — meet your AIEO Meter */}
      <Chapter
        number="03"
        eyebrow="The instrument"
        title="Meet your AIEO Meter."
        lede="AIEO Meter tests real discovery questions across supported AI systems and measures what actually appears."
      >
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal className="flex justify-center">
            <Meter score={72} label="AI Visibility" size="lg" signals />
          </Reveal>
          <div className="space-y-4">
            {[
              [
                "We ask the questions your customers ask",
                "Standardized, buyer-intent questions built from your category, city and services.",
              ],
              [
                "We run them across supported AI engines",
                "Every answer, source and business named is recorded as evidence.",
              ],
              [
                "We measure — we don’t guess",
                "Your score is calculated in code from that evidence. No AI grades you.",
              ],
            ].map(([title, body], index) => (
              <Reveal key={title} delay={index * 110}>
                <div className="soft-card hover-lift p-6">
                  <div className="flex items-center gap-3">
                    <span className="numeric grid h-8 w-8 place-items-center rounded-full bg-ink text-xs font-semibold text-background">
                      {index + 1}
                    </span>
                    <h3 className="text-base font-semibold text-ink">{title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{body}</p>
                </div>
              </Reveal>
            ))}
            <Reveal delay={340}>
              <div className="flex flex-wrap gap-2.5 pt-2">
                {PROVIDERS.map((provider) => (
                  <ProviderChip key={provider} name={provider} state="done" note="tested" />
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </Chapter>

      {/* SECTION 5 — one score, a lot behind it */}
      <Chapter
        number="04"
        eyebrow="Under the hood"
        title="One score. A lot behind it."
        lede="Six measured signals make up your AI Visibility Score. Each one is simple on its own."
        surface
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {COMPONENT_CARDS.map((card, index) => (
            <Reveal key={card.title} delay={index * 70}>
              <div className="soft-card hover-lift h-full p-6">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent">
                  <card.icon className="h-4.5 w-4.5 text-accent-foreground" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-base font-semibold text-ink">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{card.body}</p>
                <SignalBar value={card.value} tone={card.tone} className="mt-5" />
              </div>
            </Reveal>
          ))}
        </div>
      </Chapter>

      {/* SECTION 6 — competitors */}
      <Chapter
        number="05"
        eyebrow="Who is AI recommending instead?"
        title="See who AI recommends instead."
        lede="Every business named in a tested answer is recorded, so you can see who owns the conversation today."
      >
        <Reveal>
          <div className="soft-card p-7 sm:p-9">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Your AI share of voice
              </p>
              <SampleDataBadge />
            </div>
            <div className="mt-8 space-y-6">
              {SHARE_OF_VOICE.map((row) => (
                <SignalBar
                  key={row.name}
                  label={row.name}
                  value={row.value}
                  valueLabel={`${row.value}%`}
                  tone={row.tone}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </Chapter>

      {/* SECTION 7 — readiness */}
      <Chapter
        number="06"
        eyebrow="Then find out why"
        title="Then find out why."
        lede="Your AI Readiness Score measures how well your business is set up to be understood in the first place."
        surface
      >
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <Reveal className="flex justify-center">
            <Meter score={64} label="AI Readiness" size="md" />
          </Reveal>
          <Reveal delay={120}>
            <div className="soft-card grid gap-5 p-7 sm:grid-cols-2 sm:p-8">
              {READINESS_ROWS.map((row) => (
                <SignalBar
                  key={row.label}
                  label={row.label}
                  value={row.value}
                  valueLabel={`${row.value}`}
                />
              ))}
            </div>
          </Reveal>
        </div>
      </Chapter>

      {/* SECTION 8 — what to fix */}
      <Chapter
        number="07"
        eyebrow="Here’s what to fix"
        title="Know exactly what to fix."
        lede="Recommendations come from measured findings — in the order that moves your score the most."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {FIXES.map((fix, index) => (
            <Reveal key={fix.title} delay={index * 90}>
              <div className="soft-card hover-lift flex h-full flex-col p-6">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-amber/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
                  {fix.priority}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-ink">{fix.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{fix.body}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  View fix
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </Chapter>

      {/* SECTION 9 — blueprint timeline */}
      <Chapter
        number="08"
        eyebrow="Your game plan"
        title="From score to game plan."
        lede="The Blueprint sequences your fixes into four calm weeks of work."
        surface
      >
        <div className="relative">
          <div
            className="absolute left-4 top-2 hidden h-[calc(100%-1rem)] w-px bg-border md:block"
            aria-hidden="true"
          />
          <div className="space-y-5">
            {WEEKS.map((item, index) => (
              <Reveal key={item.week} delay={index * 100}>
                <div className="relative md:pl-14">
                  <span
                    className="absolute left-[0.55rem] top-7 hidden h-3.5 w-3.5 rounded-full border-2 border-background bg-primary md:block"
                    aria-hidden="true"
                  />
                  <div className="soft-card hover-lift flex flex-col gap-2 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="numeric text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {item.week}
                      </p>
                      <h3 className="mt-1.5 text-lg font-semibold text-ink">{item.title}</h3>
                    </div>
                    <p className="max-w-md text-sm leading-relaxed text-ink-soft">{item.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Chapter>

      {/* SECTION 10 — pricing */}
      <Chapter
        number="09"
        eyebrow="Pricing"
        title="Simple pricing. Full picture."
        lede="Every tier uses the same standardized tests and the same deterministic scoring."
      >
        <div className="grid gap-6 lg:grid-cols-2 items-stretch">
          {PLANS.map((plan, index) => (
            <Reveal key={plan.name} delay={index * 90} className="h-full">
              <div
                className={cn(
                  "soft-card hover-lift flex h-full flex-col p-7 sm:p-8",
                  plan.featured &&
                    "border-primary/40 shadow-lift ring-1 ring-primary/20",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
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
                    <li key={feature} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
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
        <Reveal delay={200}>
          <p className="mt-10 max-w-3xl text-xs leading-relaxed text-muted-foreground">
            {VARIABILITY_DISCLOSURE}
          </p>
        </Reveal>
      </Chapter>

      {/* Closing CTA */}
      <section className="relative overflow-hidden border-t border-border bg-ink">
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-8 px-6 py-20 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-background sm:text-4xl">
              Find out what AI says about you.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-background/70">
              One business, one scan, one clear number — plus the evidence behind it.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="h-13 rounded-full px-7 text-base hover-lift"
          >
            <Link to="/auth">
              Check My AI Visibility
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Chapter({
  id,
  number,
  eyebrow,
  title,
  lede,
  children,
}: {
  id?: string;
  number: string;
  eyebrow: string;
  title: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-20",
        Number(number) % 2 === 0
          ? "border-y border-border/70 bg-background"
          : "wash-mint",
      )}
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
        <Reveal>
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="chapter-number">{number}</span>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                {eyebrow}
              </span>
            </div>
            <h2 className="mt-5 text-3xl font-semibold leading-[1.1] text-ink sm:text-4xl lg:text-5xl">
              {title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">{lede}</p>
          </div>
        </Reveal>
        <div className="mt-12 sm:mt-14">{children}</div>
      </div>
    </section>
  );
}
