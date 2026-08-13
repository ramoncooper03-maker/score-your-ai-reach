import { useEffect, useRef, useState } from "react";

/** True when the visitor asked the OS to reduce motion. SSR-safe. */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/**
 * Observes an element and reports once it has entered the viewport.
 * Used for scroll-reveal and for starting animations only when visible.
 */
export function useInView<T extends HTMLElement>(options?: {
  rootMargin?: string;
  once?: boolean;
}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (options?.once !== false) observer.disconnect();
          } else if (options?.once === false) {
            setInView(false);
          }
        }
      },
      { rootMargin: options?.rootMargin ?? "0px 0px -12% 0px", threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options?.rootMargin, options?.once]);

  return { ref, inView };
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Animates a number from 0 to `target` with requestAnimationFrame.
 * Returns `target` immediately when motion is reduced or animation is off.
 */
export function useCountUp(
  target: number | null,
  options?: { active?: boolean; duration?: number },
) {
  const reduced = usePrefersReducedMotion();
  const active = options?.active ?? true;
  const duration = options?.duration ?? 1400;
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target == null) {
      setValue(0);
      return;
    }
    if (!active) return;
    if (reduced) {
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setValue(target * easeOutCubic(progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active, duration, reduced]);

  return target == null ? null : value;
}
