/*
 * Project slider: one large image at a time with arrows, a counter and a
 * strip of thumbnails, so visitors see at once that there is more to flip
 * through. Swipe on phones, ← → keys when focused, click to open full screen.
 */
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Viewer } from "@/components/ZoomableImage";

const round =
  "inline-flex items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent";

export function ProjectSlider({ urls, name = "" }: { urls: string[]; name?: string }) {
  const [i, setI] = useState(0);
  const [full, setFull] = useState(false);
  const touchX = useRef<number | null>(null);
  const strip = useRef<HTMLDivElement>(null);
  const n = urls.length;
  const next = () => setI((v) => (v + 1) % n);
  const prev = () => setI((v) => (v - 1 + n) % n);

  // Keep the active thumbnail visible (scroll the strip only, not the page).
  useEffect(() => {
    const box = strip.current;
    const el = box?.querySelector<HTMLElement>(`[data-i="${i}"]`);
    if (box && el) box.scrollTo({ left: el.offsetLeft - box.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [i]);

  // Preload the neighbours so flipping feels instant.
  useEffect(() => {
    for (const k of [i + 1, i - 1]) {
      const img = new Image();
      img.src = urls[(k + n) % n];
    }
  }, [i, n, urls]);

  return (
    <div
      role="region"
      aria-roledescription="معرض"
      aria-label={`صور ${name}`}
      tabIndex={0}
      onKeyDown={(e) => {
        // Arabic reads right-to-left: ← goes forward, → goes back.
        if (e.key === "ArrowLeft") next();
        if (e.key === "ArrowRight") prev();
      }}
      className="rounded-[1.75rem] border border-white/10 bg-[#0b0b0b] p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 md:p-4"
    >
      {/* Stage */}
      <div
        className="group relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[1.25rem] bg-black md:aspect-[16/10]"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 40) (dx > 0 ? next : prev)();
        }}
      >
        <img
          key={urls[i]}
          src={urls[i]}
          alt={`${name} — ${i + 1}`}
          onClick={next}
          className="h-full w-full cursor-pointer select-none object-contain"
        />

        {/* Counter + full screen */}
        <span className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold tabular-nums text-white backdrop-blur" dir="ltr">
          {i + 1} / {n}
        </span>
        <button
          type="button"
          onClick={() => setFull(true)}
          aria-label="عرض بملء الشاشة"
          className={`${round} absolute left-3 top-3 h-10 w-10 bg-black/70 text-white backdrop-blur hover:bg-black`}
        >
          <Expand className="h-4 w-4" />
        </button>

        {/* Arrows */}
        <button
          type="button"
          onClick={prev}
          aria-label="الصورة السابقة"
          className={`${round} absolute start-3 top-1/2 h-12 w-12 -translate-y-1/2 bg-white text-black shadow-xl hover:scale-105 md:start-5 md:h-16 md:w-16`}
        >
          <ChevronRight className="h-6 w-6 md:h-7 md:w-7" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="الصورة التالية"
          className={`${round} absolute end-3 top-1/2 h-12 w-12 -translate-y-1/2 bg-white text-black shadow-xl hover:scale-105 md:end-5 md:h-16 md:w-16`}
        >
          <ChevronLeft className="h-6 w-6 md:h-7 md:w-7" />
        </button>

        {/* Progress */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
          <div className="h-full bg-accent transition-all duration-300" style={{ width: `${((i + 1) / n) * 100}%` }} />
        </div>
      </div>

      {/* Thumbnails */}
      <div ref={strip} className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
        {urls.map((u, k) => (
          <button
            key={u + k}
            type="button"
            data-i={k}
            onClick={() => setI(k)}
            aria-label={`صورة ${k + 1}`}
            aria-current={k === i}
            className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition focus:outline-none focus-visible:border-accent md:h-16 md:w-24 ${
              k === i ? "border-white opacity-100" : "border-transparent opacity-45 hover:opacity-90"
            }`}
          >
            <img src={u} alt="" loading="lazy" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-white/40">اضغط الأسهم أو اسحب الصورة لتصفح باقي الأعمال</p>

      {full && <Viewer list={urls} start={i} alt={name} onClose={() => setFull(false)} />}
    </div>
  );
}
