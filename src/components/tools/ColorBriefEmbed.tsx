import { useEffect, useRef } from "react";
import { useLang } from "@/i18n/use-lang";

export function ColorBriefEmbed() {
  const { lang } = useLang();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const isAr = lang === "ar";

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const syncTheme = () => {
      const frameDocument = frame.contentDocument;
      if (!frameDocument?.documentElement) return;
      frameDocument.documentElement.dataset.theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    };

    frame.addEventListener("load", syncTheme);
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    syncTheme();

    return () => {
      frame.removeEventListener("load", syncTheme);
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
          {isAr ? "لون البريف" : "Color Brief"}
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
          {isAr
            ? "حوّل وصف المشروع إلى اتجاهات لونية مبدئية، ووازن بين طبيعة المجال والسوق والجمهور قبل اعتماد الهوية النهائية."
            : "Turn a project brief into early color directions, and explore how industry, market, and audience shape a palette before finalizing the identity."}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-[0_20px_80px_-48px_rgba(0,0,0,.45)]">
        <iframe
          ref={frameRef}
          src="/tools/lon-elbrief.html"
          title={isAr ? "أداة لون البريف لاختيار الألوان" : "Color Brief palette tool"}
          className="block h-[calc(100svh-11rem)] min-h-[650px] w-full border-0"
          loading="eager"
        />
      </div>
    </section>
  );
}
