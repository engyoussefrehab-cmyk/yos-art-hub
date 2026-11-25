import { useState, type FormEvent } from "react";
import { useLang } from "@/i18n/use-lang";
import { WEB3FORMS_ACCESS_KEY } from "@/lib/site";

export function NewsletterForm() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (honeypot || status === "sending") return;
    const address = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      setStatus("error");
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          from_name: "yrstudio.art",
          subject: "[yrstudio.art] اشتراك جديد في النشرة البريدية",
          email: address,
          replyto: address,
          message: `اشتراك جديد في النشرة البريدية: ${address}`,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error("Newsletter submission failed");
      setEmail("");
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="studio-newsletter" aria-labelledby="newsletter-title">
      <div>
        <h2 id="newsletter-title">{t("newsletter")}</h2>
        <p>{t("newsletter_sub")}</p>
      </div>
      <div>
        <form onSubmit={subscribe} noValidate>
          <input hidden type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} />
          <input
            aria-label={t("newsletter_placeholder")}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => { setEmail(event.target.value); setStatus("idle"); }}
            placeholder={t("newsletter_placeholder")}
            dir="ltr"
            readOnly={status === "sending"}
          />
          <button type="submit" disabled={status === "sending"}>{t("newsletter_subscribe")}</button>
        </form>
        {status === "ok" && <p role="status">{t("newsletter_ok")}</p>}
        {status === "error" && <p role="alert">{t("newsletter_err")}</p>}
      </div>
    </section>
  );
}
