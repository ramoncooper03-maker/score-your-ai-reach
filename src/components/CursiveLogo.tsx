import { Link } from "@tanstack/react-router";

export function CursiveLogo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`font-cursive text-2xl text-ink whitespace-nowrap ${className ?? ""}`}
    >
      AIEO METER
    </Link>
  );
}
