import { Link } from "@tanstack/react-router";

import logo from "@/assets/aieometer-lockup.png.asset.json";
import { cn } from "@/lib/utils";

/** AIeometer brand lockup: gauge mark + wordmark. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn("group flex items-center", className)}
      aria-label="AIeometer home"
    >
      <img
        src={logo.url}
        alt="AIeometer"
        className="h-9 w-auto transition-transform duration-300 group-hover:-translate-y-0.5"
      />
    </Link>
  );
}
