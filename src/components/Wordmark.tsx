import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

/** AIeometer mark: an abstract measured arc, not a speedometer needle. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("group flex items-center gap-2.5", className)} aria-label="AIeometer home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink transition-transform duration-300 group-hover:-translate-y-0.5">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            d="M4 17a8 8 0 1 1 16 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            className="text-background/35"
          />
          <path
            d="M4 17A8 8 0 0 1 12 9"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            className="text-brand-mint"
          />
          <circle cx="12" cy="9" r="1.9" className="fill-brand-amber" />
        </svg>
      </span>
      <span className="text-display text-base font-semibold text-ink">AIeometer</span>
    </Link>
  );
}
