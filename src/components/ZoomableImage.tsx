import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Expand, X } from "lucide-react";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
};

/**
 * Image that opens full screen when clicked. The viewer is a plain overlay
 * rendered on <body>: the image is centred and fits the screen; Esc, the
 * close button or a click outside the image closes it.
 */
export function ZoomableImage({ src, alt = "", className = "", imgClassName = "", eager }: Props) {
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
          aria-label="تكبير الصورة"
          className="absolute end-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent md:opacity-0 md:group-hover:opacity-100"
        >
          <Expand className="h-4 w-4" />
        </button>
      </div>
      {open && <Viewer src={src} alt={alt} onClose={() => setOpen(false)} />}
    </>
  );
}

function Viewer({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="عرض الصورة"
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-10"
    >
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-full max-w-full rounded-lg object-contain"
      />
      <button
        type="button"
        onClick={onClose}
        autoFocus
        aria-label="إغلاق"
        className="absolute end-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <X className="h-5 w-5" />
      </button>
    </div>,
    document.body,
  );
}
