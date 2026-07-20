import { useEffect, useRef, useState, type ReactNode, type CSSProperties, type ElementType } from "react";

/**
 * Reveal — fades content up on scroll into view.
 * Respects prefers-reduced-motion.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setShown(true); return; }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const style: CSSProperties = {
    transitionDelay: `${delay}ms`,
  };

  const Element = Tag as unknown as "div";
  return (
    <Element
      ref={ref as never}
      style={style}
      className={
        `transition-all duration-700 ease-out will-change-transform ${
          shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        } ${className}`
      }
    >
      {children}
    </Element>
  );
}
