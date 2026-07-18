import { useCallback, useEffect, useRef, useState } from "react";
import { Expand, Minus, Plus, RotateCcw, X } from "lucide-react";
import { useLang } from "@/i18n/use-lang";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
};

/**
 * Displays an image with an expand button (always visible on mobile,
 * appears on hover on desktop). When opened, shows a fullscreen lightbox
 * supporting pinch-zoom, drag-to-pan, wheel-zoom, and double-tap zoom.
 */
export function ZoomableImage({ src, alt = "", className = "", imgClassName = "", eager }: Props) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const t = (ar: string, en: string) => (isAr ? ar : en);
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={`group relative ${className}`}>
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onClick={() => setOpen(true)}
          className={`cursor-zoom-in ${imgClassName || "w-full"}`}
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t("عرض بحجم كامل", "View fullscreen")}
          className="absolute end-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur-sm transition md:opacity-0 md:group-hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Expand className="h-4 w-4" />
        </button>
      </div>
      {open && <Lightbox src={src} alt={alt} onClose={() => setOpen(false)} />}
    </>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const t = (ar: string, en: string) => (isAr ? ar : en);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const stateRef = useRef({
    dragging: false,
    lastX: 0,
    lastY: 0,
    pinchDist: 0,
    pinchScale: 1,
    lastTap: 0,
  });
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());

  const reset = useCallback(() => {
    setScale(1);
    setTx(0);
    setTy(0);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") setScale((s) => clamp(s * 1.25, 1, 6));
      if (e.key === "-") setScale((s) => clamp(s / 1.25, 1, 6));
      if (e.key === "0") reset();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, reset]);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY;
    setScale((s) => clamp(s * (delta > 0 ? 1.1 : 0.9), 1, 6));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size === 1) {
      stateRef.current.dragging = true;
      stateRef.current.lastX = e.clientX;
      stateRef.current.lastY = e.clientY;
      // double-tap detection
      const now = Date.now();
      if (now - stateRef.current.lastTap < 280) {
        setScale((s) => (s > 1.2 ? 1 : 2.5));
        if (scale > 1.2) reset();
        stateRef.current.lastTap = 0;
      } else {
        stateRef.current.lastTap = now;
      }
    } else if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      stateRef.current.pinchDist = Math.hypot(dx, dy);
      stateRef.current.pinchScale = scale;
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      const d = Math.hypot(dx, dy);
      if (stateRef.current.pinchDist > 0) {
        const next = clamp((stateRef.current.pinchScale * d) / stateRef.current.pinchDist, 1, 6);
        setScale(next);
      }
      return;
    }
    if (!stateRef.current.dragging) return;
    const dx = e.clientX - stateRef.current.lastX;
    const dy = e.clientY - stateRef.current.lastY;
    stateRef.current.lastX = e.clientX;
    stateRef.current.lastY = e.clientY;
    if (scale > 1) {
      setTx((v) => v + dx);
      setTy((v) => v + dy);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) stateRef.current.pinchDist = 0;
    if (pointersRef.current.size === 0) stateRef.current.dragging = false;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("عارض الصور", "Image viewer")}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      <div className="absolute end-3 top-3 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setScale((s) => clamp(s / 1.25, 1, 6)); }}
          aria-label={t("تصغير", "Zoom out")}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setScale((s) => clamp(s * 1.25, 1, 6)); }}
          aria-label={t("تكبير", "Zoom in")}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); reset(); }}
          aria-label={t("إعادة الضبط", "Reset")}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          aria-label={t("إغلاق", "Close")}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition hover:bg-white/90"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div
        className="relative h-full w-full touch-none select-none overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ cursor: scale > 1 ? "grab" : "zoom-in" }}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="pointer-events-none absolute left-1/2 top-1/2 max-h-[92vh] max-w-[96vw] -translate-x-1/2 -translate-y-1/2 object-contain will-change-transform"
          style={{ transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(${scale})`, transition: pointersRef.current.size === 0 ? "transform 120ms ease-out" : "none" }}
        />
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
          {t("قرص للتكبير · اسحب للتحريك · انقر مرتين للتبديل", "Pinch to zoom · drag to pan · double-tap to toggle")}
        </div>
      </div>
    </div>
  );
}
