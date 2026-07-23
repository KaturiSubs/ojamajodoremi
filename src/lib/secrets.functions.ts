import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  slug: z.string().trim().min(1).max(100).optional(),
  guess: z.string().trim().min(1).max(500),
  userAgent: z.string().max(500).optional(),
});

export const checkSecret = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const normalized = data.guess.trim().toLowerCase();

    let query = supabaseAdmin
      .from("secrets")
      .select("id, slug, correct_answers, on_correct_redirect");
    if (data.slug) {
      query = query.eq("slug", data.slug);
    }

    const { data: secrets, error } = await query;
    if (error) throw new Error("Lookup failed");

    const match = (secrets ?? []).find((secret) =>
      (secret.correct_answers ?? []).some(
        (a: string) => (a ?? "").trim().toLowerCase() === normalized,
      ),
    );

    const correct = !!match;

    await supabaseAdmin.from("secret_submissions").insert({
      secret_slug: match?.slug ?? data.slug ?? "unknown",
      guess: data.guess,
      is_correct: correct,
      user_agent: data.userAgent ?? null,
    });

    return correct
      ? { correct: true as const, redirect: match.on_correct_redirect ?? null }
      : { correct: false as const };
  });
