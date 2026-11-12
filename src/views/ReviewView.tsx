/*
 * Client review page (/review): a short form (stars + a few words). The review
 * is saved in YR Studio OS (RPC submit_review) and shows up by itself in the
 * «آراء العملاء» slider below and on the home page.
 */
import { useId, useRef, useState, type FormEvent } from "react";
import { PageHero, container } from "@/components/studio";
import { Testimonials } from "@/components/Testimonials";
import { submitReview } from "@/lib/reviews";

const LABELS = ["", "ضعيف", "مقبول", "جيد", "جيد جدا", "ممتاز"];

export function ReviewView() {
  const nameId = useId();
  const projectId = useId();
  const textId = useId();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const mountedAt = useRef(Date.now());

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget.elements;
    const get = (n: string) => (f.namedItem(n) as HTMLInputElement | HTMLTextAreaElement).value.trim();
    const hp = get("website");
    if (hp || Date.now() - mountedAt.current < 2500) return;
    if (!rating) return setError("اختر عدد النجوم أولا.");
    if (get("name").length < 2) return setError("اكتب اسمك من فضلك.");
    if (get("text").length < 15) return setError("اكتب بضع كلمات عن تجربتك (١٥ حرفا على الأقل).");
    setError(null);
    setSending(true);
    try {
      await submitReview({ name: get("name"), project: get("project"), text: get("text"), rating, website: hp });
      setDone(true);
    } catch (err) {
      const msg = String((err as Error).message || "");
      setError(
        /Too many/i.test(msg)
          ? "تم إرسال عدة تقييمات خلال وقت قصير. حاول لاحقا."
          : /Links/i.test(msg)
            ? "من فضلك لا تضع روابط في التقييم."
            : "تعذر الإرسال. تأكد من اتصالك وحاول مرة أخرى.",
      );
    } finally {
      setSending(false);
    }
  };

  const shown = hover || rating;
  const input =
    "mt-2 w-full rounded-xl border border-white/10 bg-ink/40 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40";
  const label = "block text-xs font-semibold uppercase tracking-widest text-white/60";

  return (
    <>
      <PageHero
        kicker="رأيك يهمني"
        title={<>قيّم <span className="text-accent">تجربتك</span> معي</>}
        lede="شكرا لثقتك. دقيقة واحدة لتخبرني كيف كانت التجربة، وسيظهر تقييمك مباشرة في آراء العملاء."
      />

      <section className={`${container} py-14 md:py-20`}>
        <div className="mx-auto max-w-2xl">
          {done ? (
            <div role="status" className="rounded-[2rem] border border-white/10 bg-[#0b0b0b] p-10 text-center text-white">
              <div className="text-5xl" aria-hidden>⭐</div>
              <h2 className="mt-4 font-display text-2xl font-bold">شكرا لك!</h2>
              <p className="mt-2 text-white/70">تم نشر تقييمك في آراء العملاء بالأسفل.</p>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              noValidate
              dir="rtl"
              className="rounded-[2rem] border border-white/10 bg-[#0b0b0b] p-6 text-white md:p-10"
            >
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

              <fieldset>
                <legend className={label}>تقييمك العام</legend>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex gap-1" dir="ltr" onMouseLeave={() => setHover(0)}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        aria-label={`${n} من 5`}
                        aria-pressed={rating === n}
                        onClick={() => setRating(n)}
                        onMouseEnter={() => setHover(n)}
                        className="rounded p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
                      >
                        <svg viewBox="0 0 20 20" width={36} height={36} fill="currentColor" aria-hidden
                          className={n <= shown ? "text-accent" : "text-white/20"}>
                          <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77l-5.2 2.73.99-5.78L1.58 7.62l5.82-.85L10 1.5z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-white/70" aria-live="polite">{LABELS[shown]}</span>
                </div>
              </fieldset>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor={nameId} className={label}>الاسم</label>
                  <input id={nameId} name="name" maxLength={80} autoComplete="name" className={input} />
                </div>
                <div>
                  <label htmlFor={projectId} className={label}>المشروع (اختياري)</label>
                  <input id={projectId} name="project" maxLength={120} placeholder="مثال: هوية بصرية — مطعم" className={input} />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor={textId} className={label}>رأيك</label>
                <textarea id={textId} name="text" rows={5} maxLength={800} className={input}
                  placeholder="كيف كانت تجربتك؟ الجودة، التواصل، الالتزام بالمواعيد..." />
              </div>

              {error && <p role="alert" className="mt-4 text-sm text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={sending}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
              >
                {sending ? "جار الإرسال..." : "أرسل تقييمي"}
              </button>
              <p className="mt-3 text-center text-xs text-white/40">سيظهر اسمك ورأيك علنا على الموقع.</p>
            </form>
          )}
        </div>
      </section>

      <Testimonials />
    </>
  );
}
