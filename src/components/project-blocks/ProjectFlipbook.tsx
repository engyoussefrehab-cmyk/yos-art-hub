import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AR } from "@/components/studio-site";

export function ProjectFlipbook({ pages, name, title, rtl }: {
  pages: string[];
  name: string;
  title: string;
  rtl: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const count = pages.length;
  const canTurn = count > 1;
  const number = rtl ? AR : String;
  const previous = rtl ? "الصفحة السابقة" : "Previous page";
  const next = rtl ? "الصفحة التالية" : "Next page";
  const pageLabel = rtl ? `الصفحة ${number(index + 1)} من ${number(count)}` : `Page ${index + 1} of ${count}`;
  const PreviousArrow = rtl ? ArrowRight : ArrowLeft;
  const NextArrow = rtl ? ArrowLeft : ArrowRight;

  useEffect(() => {
    for (const url of [pages[index - 1], pages[index + 1]]) {
      if (url) new Image().src = url;
    }
  }, [index, pages]);

  function go(target: number) {
    if (target === index || target < 0 || target >= count) return;
    setDirection(target > index ? 1 : -1);
    setIndex(target);
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    const targets = { ArrowLeft: index + (rtl ? 1 : -1), ArrowRight: index + (rtl ? -1 : 1), Home: 0, End: count - 1 };
    if (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "Home" || event.key === "End") {
      event.preventDefault();
      go(targets[event.key]);
    }
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(event.clientY - start.y)) {
      const isForwardSwipe = rtl ? dx > 0 : dx < 0;
      go(index + (isForwardSwipe ? 1 : -1));
    }
  }

  return (
    <section className="case-book" aria-labelledby="case-book-title" onKeyDown={onKeyDown}>
      <div className="case-book-bar">
        <h2 id="case-book-title">{title}</h2>
        {canTurn && (
          <div className="case-book-controls">
            <button type="button" onClick={() => go(index - 1)} disabled={index === 0} aria-label={previous}>
              <PreviousArrow aria-hidden="true" size={18} />
            </button>
            <span className="case-book-count" aria-live="polite" aria-atomic="true">{pageLabel}</span>
            <button type="button" onClick={() => go(index + 1)} disabled={index === count - 1} aria-label={next}>
              <NextArrow aria-hidden="true" size={18} />
            </button>
          </div>
        )}
      </div>
      <div
        className="case-book-stage"
        tabIndex={canTurn ? 0 : undefined}
        onPointerDown={(event) => {
          if (canTurn && event.pointerType !== "mouse") {
            event.currentTarget.setPointerCapture(event.pointerId);
            touchStart.current = { x: event.clientX, y: event.clientY };
          }
        }}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { touchStart.current = null; }}
      >
        <img
          key={index}
          className={direction === 0 ? "" : direction === 1 ? "case-book-forward" : "case-book-back"}
          src={pages[index]}
          alt={canTurn ? `${name}، ${pageLabel}` : name}
          fetchPriority={index === 0 ? "high" : "auto"}
          draggable={false}
        />
      </div>
    </section>
  );
}
