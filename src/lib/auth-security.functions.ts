import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const emailSchema = z.object({ email: z.string().email().max(200) });

export const preLoginCheckFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => emailSchema.parse(data))
  .handler(async ({ data }) => {
    const { checkLoginRateLimit } = await import("./security.server");
    return checkLoginRateLimit(data.email);
  });

const recordSchema = z.object({
  email: z.string().email().max(200),
  success: z.boolean(),
  reason: z.string().max(120).nullish(),
});

export const recordLoginAttemptFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => recordSchema.parse(data))
  .handler(async ({ data }) => {
    const { recordAuthAttempt, recordAudit } = await import("./security.server");
    await recordAuthAttempt({ email: data.email, success: data.success, reason: data.reason ?? null });
    if (data.success) {
      await recordAudit({
        action: "auth.login.success",
        actorEmail: data.email,
        target: data.email,
      });
    }
    return { ok: true };
  });
