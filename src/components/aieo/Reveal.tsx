import type { ElementType, ReactNode } from "react";

import { useInView } from "@/components/aieo/motion";
import { cn } from "@/lib/utils";

/**
 * Wraps content so it rises gently into view on scroll.
 * Purely presentational — respects prefers-reduced-motion through CSS.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <Tag
      ref={ref}
      className={cn("reveal", inView && "is-visible", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
