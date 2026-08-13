import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBusiness, startScan } from "@/lib/app.functions";
import { validateWebsiteUrl } from "@/lib/security/url";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Add your business — AIEO Meter" },
      { name: "description", content: "Tell us about your business so we can build its standardized AI discovery tests." },
      { property: "og:title", content: "Add your business — AIEO Meter" },
      { property: "og:description", content: "Business intake for AI visibility measurement." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OnboardingPage,
});

interface FormState {
  name: string;
  website: string;
  category: string;
  city: string;
  state: string;
  services: string;
  aliases: string;
  phone: string;
}

const EMPTY: FormState = {
  name: "",
  website: "",
  category: "",
  city: "",
  state: "",
  services: "",
  aliases: "",
  phone: "",
};

function splitList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 10);
}

function OnboardingPage() {
  const navigate = useNavigate();
  const saveBusiness = useServerFn(createBusiness);
  const requestScan = useServerFn(startScan);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const mutation = useMutation({
    mutationFn: async (input: FormState) => {
      const business = await saveBusiness({
        data: {
          name: input.name,
          website: input.website,
          category: input.category,
          city: input.city,
          state: input.state,
          primaryServices: splitList(input.services),
          aliases: splitList(input.aliases),
          phone: input.phone,
        },
      });
      const scan = await requestScan({ data: { businessId: business.businessId, scanType: "standard" } });
      return scan;
    },
    onSuccess: (scan) => {
      toast.success("Business saved. Scan queued.");
      void navigate({ to: "/scans/$scanId", params: { scanId: scan.scanId } });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save this business."),
  });

  function update(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (form.name.trim().length < 2) nextErrors.name = "Enter your business name.";
    const url = validateWebsiteUrl(form.website);
    if (!url.ok) nextErrors.website = url.message;
    if (!form.category.trim()) nextErrors.category = "Enter your business category.";
    if (!form.city.trim()) nextErrors.city = "Enter your city.";
    if (!form.state.trim()) nextErrors.state = "Enter your state.";
    if (splitList(form.services).length === 0) nextErrors.services = "List at least one primary service.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    mutation.mutate(form);
  }

  return (
    <DashboardShell
      title="Business intake"
      description="These inputs define the standardized query set. Accurate details produce a more meaningful score."
    >
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-start">
        <Card className="border-border/80 shadow-card">
          <CardContent className="p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Field label="Business name" error={errors.name} htmlFor="name">
                <Input id="name" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Rapid Plumbing" />
              </Field>

              <Field label="Website" error={errors.website} htmlFor="website" hint="Public https address. Internal or private addresses are rejected.">
                <Input id="website" value={form.website} onChange={(event) => update("website", event.target.value)} placeholder="rapidplumbing.com" />
              </Field>

              <Field label="Business category" error={errors.category} htmlFor="category">
                <Input id="category" value={form.category} onChange={(event) => update("category", event.target.value)} placeholder="plumber" />
              </Field>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="City" error={errors.city} htmlFor="city">
                  <Input id="city" value={form.city} onChange={(event) => update("city", event.target.value)} placeholder="Austin" />
                </Field>
                <Field label="State" error={errors.state} htmlFor="state">
                  <Input id="state" value={form.state} onChange={(event) => update("state", event.target.value)} placeholder="TX" />
                </Field>
              </div>

              <Field
                label="Primary services"
                error={errors.services}
                htmlFor="services"
                hint="One per line or comma separated. The first three drive service-specific tests."
              >
                <Textarea
                  id="services"
                  rows={4}
                  value={form.services}
                  onChange={(event) => update("services", event.target.value)}
                  placeholder={"drain cleaning\nwater heater replacement\nemergency leak repair"}
                />
              </Field>

              <Field label="Other names you go by" htmlFor="aliases" hint="Optional. Helps us recognise you in AI answers.">
                <Textarea
                  id="aliases"
                  rows={2}
                  value={form.aliases}
                  onChange={(event) => update("aliases", event.target.value)}
                  placeholder="Rapid Plumbing & Drain, Rapid Plumbing Austin"
                />
              </Field>

              <Field label="Phone" htmlFor="phone" hint="Optional. Used for local consistency checks.">
                <Input id="phone" value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="(512) 555-0134" />
              </Field>

              <Button type="submit" size="lg" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving…" : "Save and run scan"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-surface">
          <CardContent className="p-7 text-sm leading-relaxed text-ink-soft">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">What happens next</h2>
            <ol className="mt-5 space-y-4">
              {[
                "We validate your inputs and website address.",
                "We read your public website once and store the text as evidence.",
                "We generate the standardized buyer-intent query set in code.",
                "Each query runs through the configured AI engines and results are recorded.",
                "Scores are calculated from that stored evidence and your report is rendered.",
              ].map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="numeric mt-0.5 text-xs text-primary">{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string | undefined;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
