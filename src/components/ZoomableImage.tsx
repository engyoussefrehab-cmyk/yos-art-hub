import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
};

/**
 * Image that opens a full-screen gallery when clicked. The gallery holds
 * every zoomable image on the page (in page order), so a visitor can flip
 * through all images of a project: arrows, thumbnails, keyboard ← → and
 * swipe on phones. Esc, ✕ or a click on the backdrop closes it.
 */
export function ZoomableImage({ src, alt = "", className = "", imgClassName = "", eager }: Props) {
  const [gallery, setGallery] = useState<{ list: string[]; index: number } | null>(null);

  const open = () => {
    // Page order; when an image repeats (e.g. the cover is also in the
    // gallery) keep its later place so the gallery order stays intact.
    const all = Array.from(document.querySelectorAll<HTMLImageElement>("img[data-zoom]")).map((i) => i.dataset.zoom!);
    const list = all.filter((u, n) => all.lastIndexOf(u) === n);
    const index = Math.max(0, list.indexOf(src));
    setGallery({ list: list.length ? list : [src], index });
  };

  return (
    <>
      <div className={`group relative ${className}`}>
        <img
          src={src}
          alt={alt}
          data-zoom={src}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onClick={open}
          className={`cursor-zoom-in ${imgClassName || "w-full"}`}
        />
        <button
          type="button"
          onClick={open}
          aria-label="تكبير الصورة"
          className="absolute end-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent md:opacity-0 md:group-hover:opacity-100"
        >
          <Expand className="h-4 w-4" />
        </button>
      </div>
      {gallery && <Viewer list={gallery.list} start={gallery.index} alt={alt} onClose={() => setGallery(null)} />}
    </>
  );
}

const btn =
  "inline-flex items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent";

function Viewer({ list, start, alt, onClose }: { list: string[]; start: number; alt: string; onClose: () => void }) {
  const [i, setI] = useState(start);
  const touchX = useRef<number | null>(null);
  const thumbs = useRef<HTMLDivElement>(null);
  const many = list.length > 1;
  const next = () => setI((v) => (v + 1) % list.length);
  const prev = () => setI((v) => (v - 1 + list.length) % list.length);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Arabic reads right-to-left: ← goes forward, → goes back.
      if (e.key === "ArrowLeft") setI((v) => (v + 1) % list.length);
      if (e.key === "ArrowRight") setI((v) => (v - 1 + list.length) % list.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, list.length]);

  // Keep the active thumbnail in view.
  useEffect(() => {
    thumbs.current?.querySelector<HTMLElement>(`[data-i="${i}"]`)?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [i]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="معرض الصور"
      onClick={onClose}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null || !many) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) (dx > 0 ? next : prev)();
      }}
      className="fixed inset-0 z-[100] flex flex-col bg-black/95"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-4 md:px-6">
        <span className="text-sm tabular-nums text-white/70" dir="ltr">
          {many ? `${i + 1} / ${list.length}` : ""}
        </span>
        <button type="button" onClick={onClose} autoFocus aria-label="إغلاق" className={`${btn} h-11 w-11 bg-white text-black hover:bg-white/90`}>
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Image */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-24">
        <img
          key={list[i]}
          src={list[i]}
          alt={alt}
          onClick={(e) => e.stopPropagation()}
          className="max-h-full max-w-full rounded-lg object-contain"
        />
        {many && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="الصورة السابقة"
              className={`${btn} absolute start-3 top-1/2 h-12 w-12 -translate-y-1/2 bg-white/10 text-white hover:bg-white/20 md:start-6`}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="الصورة التالية"
              className={`${btn} absolute end-3 top-1/2 h-12 w-12 -translate-y-1/2 bg-white/10 text-white hover:bg-white/20 md:end-6`}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {many && (
        <div ref={thumbs} onClick={(e) => e.stopPropagation()} className="flex gap-2 overflow-x-auto px-4 py-4 md:justify-center md:px-6">
          {list.map((u, n) => (
            <button
              key={u}
              type="button"
              data-i={n}
              onClick={() => setI(n)}
              aria-label={`صورة ${n + 1}`}
              aria-current={n === i}
              className={`h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 transition focus:outline-none focus-visible:border-accent md:h-16 md:w-24 ${
                n === i ? "border-white opacity-100" : "border-transparent opacity-50 hover:opacity-90"
              }`}
            >
              <img src={u} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}
