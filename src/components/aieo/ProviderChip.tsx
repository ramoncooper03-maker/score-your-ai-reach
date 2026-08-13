import { Check, Loader2, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

export type ProviderState = "idle" | "searching" | "done" | "skipped";

const DOT: Record<string, string> = {
  ChatGPT: "bg-brand-mint",
  Gemini: "bg-brand-signal",
  Perplexity: "bg-brand-violet",
};

/**
 * Small pill representing one AI engine. State is always passed in from real
 * data — the component never invents a provider result.
 */
export function ProviderChip({
  name,
  state = "idle",
  note,
  className,
}: {
  name: string;
  state?: ProviderState;
  note?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border border-border bg-card px-3.5 py-2 text-sm shadow-card",
        className,
      )}
    >
      <span className={cn("h-2 w-2 shrink-0 rounded-full", DOT[name] ?? "bg-primary")} aria-hidden="true" />
      <span className="font-medium text-ink">{name}</span>
      {note ? <span className="text-xs text-muted-foreground">{note}</span> : null}
      {state === "searching" ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" aria-hidden="true" />
      ) : state === "done" ? (
        <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
      ) : state === "skipped" ? (
        <Minus className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      ) : null}
      <span className="sr-only">{state}</span>
    </div>
  );
}
