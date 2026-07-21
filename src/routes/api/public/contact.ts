import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(2).max(150),
  message: z.string().trim().min(10).max(2000),
  call_date: z.string().trim().max(20).optional().default(""),
  call_time: z.string().trim().max(10).optional().default(""),
  call_tz: z.string().trim().max(120).optional().default(""),
  website: z.string().optional(), // honeypot
});

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export const Route = createFileRoute("/api/public/contact")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders() }),
      POST: async ({ request }) => {
        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400, headers: corsHeaders() });
        }

        const parsed = schema.safeParse(payload);
        if (!parsed.success) {
          return Response.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400, headers: corsHeaders() });
        }

        // Honeypot: silently accept spam
        if (parsed.data.website && parsed.data.website.trim().length > 0) {
          return Response.json({ ok: true }, { headers: corsHeaders() });
        }

        const { name, email, subject, message, call_date, call_time, call_tz } = parsed.data;
        const callRequested = Boolean(call_date || call_time || call_tz);
        const callSummary = callRequested
          ? [call_date, call_time].filter(Boolean).join(" · ") + (call_tz ? ` (${call_tz})` : "")
          : "";
        const messageWithCall = callRequested
          ? `${message}\n\n---\nطلب مكالمة مجانية / Free call requested:\n${callSummary}`
          : message;

        // Always persist to the admin inbox first — this is the source of truth.
        let stored = false;
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error: insertError } = await supabaseAdmin.from("contact_messages").insert({
            name,
            email,
            subject: callRequested ? `${subject} [مكالمة: ${callSummary}]` : subject,
            message: messageWithCall,
            status: "unread",
          });
          if (insertError) {
            console.error("contact_messages insert failed:", insertError);
          } else {
            stored = true;
          }
        } catch (e) {
          console.error("contact_messages insert threw:", e);
        }

        if (!stored) {
          return Response.json({ error: "Failed to save message" }, { status: 500, headers: corsHeaders() });
        }

        // Best-effort email notification. Only fires if Resend is configured.
        const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        if (LOVABLE_API_KEY && RESEND_API_KEY) {
          const callRow = callRequested
            ? `<tr><td style="padding:8px 0;color:#666">مكالمة مجانية</td><td style="padding:8px 0;font-weight:600;color:#c2410c">${esc(callSummary)}</td></tr>`
            : "";

          const html = `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#ffffff;color:#111">
              <h2 style="margin:0 0 16px;color:#0b1a2b">رسالة جديدة من موقع YR Studio</h2>
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:8px 0;color:#666;width:120px">الاسم</td><td style="padding:8px 0;font-weight:600">${esc(name)}</td></tr>
                <tr><td style="padding:8px 0;color:#666">البريد</td><td style="padding:8px 0"><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
                <tr><td style="padding:8px 0;color:#666">الموضوع</td><td style="padding:8px 0">${esc(subject)}</td></tr>
                ${callRow}
              </table>
              <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
              <div style="white-space:pre-wrap;line-height:1.7">${esc(message)}</div>
            </div>`;

          try {
            const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "X-Connection-Api-Key": RESEND_API_KEY,
              },
              body: JSON.stringify({
                from: "YR Studio <noreply@yrstudio.art>",
                to: ["info@yrstudio.art"],
                reply_to: email,
                subject: `[نموذج التواصل] ${subject}`,
                html,
              }),
            });
            if (!res.ok) {
              const body = await res.text();
              console.error(`Resend send failed [${res.status}]: ${body}`);
            }
          } catch (e) {
            console.error("Resend send threw:", e);
          }
        } else {
          console.warn("Resend not configured — message stored to inbox only.");
        }

        return Response.json({ ok: true }, { headers: corsHeaders() });
      },
    },
  },
});
