import { Link } from "@tanstack/react-router";

import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { VARIABILITY_DISCLOSURE } from "@/lib/content";

const NAV = [
  { to: "/pricing", label: "Pricing" },
  { to: "/auth", label: "Sign in" },
] as const;

export function SiteHeader() {
  const { session } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Wordmark />
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
              activeProps={{ className: "text-ink" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {session ? (
            <Button asChild size="sm" className="rounded-full px-5 hover-lift">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild size="sm" className="rounded-full px-5 hover-lift">
              <Link to="/auth">Check My AI Visibility</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-surface">
      <div className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Wordmark />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Measurement for AI-powered local discovery. Standardized tests, deterministic scoring,
              auditable evidence.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm">
            <Link to="/pricing" className="text-ink-soft hover:text-ink">
              Pricing
            </Link>
            <Link to="/auth" className="text-ink-soft hover:text-ink">
              Sign in
            </Link>
          </nav>
        </div>
        <p className="mt-10 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
          {VARIABILITY_DISCLOSURE}
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} AIEO Meter. Not affiliated with any AI provider.
        </p>
      </div>
    </footer>
  );
}
