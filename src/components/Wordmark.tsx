import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-[11px] font-bold text-background">
        AI
      </span>
      <span className="text-display text-base font-semibold text-ink">LocalAI Score</span>
    </Link>
  );
}
