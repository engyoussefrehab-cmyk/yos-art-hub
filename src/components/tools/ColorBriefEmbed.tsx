import { useEffect, useRef } from "react";
import { useLang } from "@/i18n/use-lang";

const COLOR_TOOL_SRC = "/tools/lon-elbrief.html?v=20261010-contrast";

export function ColorBriefEmbed() {
  const { lang } = useLang();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const isAr = lang === "ar";

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    let contentObserver: ResizeObserver | undefined;
    const syncTheme = () => {
      const frameDocument = frame.contentDocument;
      if (!frameDocument?.documentElement) return;
      frameDocument.documentElement.dataset.theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    };
    const resizeFrame = () => {
      const frameDocument = frame.contentDocument;
      const frameBody = frameDocument?.body;
      const frameRoot = frameDocument?.documentElement;
      if (!frameRoot || !frameBody) return;
      frame.style.height = `${Math.max(frameRoot.scrollHeight, frameBody.scrollHeight)}px`;
    };
    const handleFrameLoad = () => {
      syncTheme();
      resizeFrame();
      const frameDocument = frame.contentDocument;
      if (!frameDocument?.body || !frameDocument.documentElement) return;
      contentObserver?.disconnect();
      contentObserver = new ResizeObserver(resizeFrame);
      contentObserver.observe(frameDocument.body);
      contentObserver.observe(frameDocument.documentElement);
      frame.contentWindow?.addEventListener("resize", resizeFrame);
    };

    frame.addEventListener("load", handleFrameLoad);
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    syncTheme();
    resizeFrame();

    return () => {
      frame.removeEventListener("load", handleFrameLoad);
      frame.contentWindow?.removeEventListener("resize", resizeFrame);
      contentObserver?.disconnect();
      observer.disconnect();
    };
  }, []);

  return (
    <section dir={isAr ? "rtl" : "ltr"} className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:py-12">
      <div className="mb-6 flex flex-col gap-3 sm:mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          {isAr ? "أداة تصميم من YR Studio" : "A design tool by YR Studio"}
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {isAr ? "مختبر الألوان" : "Color Palette Studio"}
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
          {isAr
            ? "استكشف اتجاهات لونية مبدئية، ووازن بين طبيعة المجال والسوق والجمهور قبل اعتماد الهوية النهائية."
            : "Explore early color directions and see how industry, market, and audience shape a palette before finalizing the identity."}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-[0_20px_80px_-48px_rgba(0,0,0,.45)]">
        <iframe
          ref={frameRef}
          src={COLOR_TOOL_SRC}
          title={isAr ? "مختبر الألوان لاختيار لوحات لونية" : "Color Palette Studio"}
          className="block min-h-[calc(100svh-8rem)] w-full border-0"
          style={{ height: "1200px" }}
          loading="eager"
        />
      </div>
    </section>
  );
}
