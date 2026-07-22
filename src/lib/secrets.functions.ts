import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  slug: z.string().trim().min(1).max(100),
  guess: z.string().trim().min(1).max(500),
  userAgent: z.string().max(500).optional(),
});

export const checkSecret = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: secret, error } = await supabaseAdmin
      .from("secrets")
      .select("id, slug, correct_answers, on_correct_redirect")
      .eq("slug", data.slug)
      .maybeSingle();

    if (error) throw new Error("Lookup failed");
    if (!secret) return { correct: false as const };

    const normalized = data.guess.trim().toLowerCase();
    const correct = (secret.correct_answers ?? []).some(
      (a: string) => (a ?? "").trim().toLowerCase() === normalized,
    );

    await supabaseAdmin.from("secret_submissions").insert({
      secret_slug: data.slug,
      guess: data.guess,
      is_correct: correct,
      user_agent: data.userAgent ?? null,
    });

    return correct
      ? { correct: true as const, redirect: secret.on_correct_redirect ?? null }
      : { correct: false as const };
  });
