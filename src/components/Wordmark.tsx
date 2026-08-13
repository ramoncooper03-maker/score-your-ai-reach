import { Link } from "@tanstack/react-router";

import logo from "@/assets/aieometer-logo.png.asset.json";
import { cn } from "@/lib/utils";

/** AIEO Meter brand lockup: gauge mark + wordmark. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn("group flex items-center", className)}
      aria-label="AIEO Meter home"
    >
      <img
        src={logo.url}
        alt="AIEO Meter"
        className="h-12 w-auto transition-transform duration-300 group-hover:-translate-y-0.5"
      />
    </Link>
  );
}
