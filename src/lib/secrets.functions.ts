import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  slug: z.string().trim().min(1).max(100).optional(),
  guess: z.string().trim().min(1).max(500),
  userAgent: z.string().max(500).optional(),
});

const WATER = new Set(
  [
    "majo pi",
    "majo pon",
    "pi",
    "pon",
    "water",
    "kindergarten",
    "exam",
    "hydrate",
    "hydration",
    "liquid",
    "drink",
    "drink water",
  ].map((s) => s.trim().toLowerCase()),
);

async function loadForbidden(): Promise<Set<string>> {
  const { supabaseAdmin } = await import(
    "@/integrations/supabase/client.server"
  );
  const { data } = await supabaseAdmin
    .from("site_settings")
    .select("ominous_phrases")
    .eq("id", 1)
    .maybeSingle();
  const list: string[] = (data?.ominous_phrases as string[] | null) ?? [];
  return new Set(list.map((s) => s.trim().toLowerCase()).filter(Boolean));
}


export const checkSecret = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const normalized = data.guess.trim().toLowerCase();
    const FORBIDDEN = await loadForbidden();

    // Ominous phrases: log + return "ominous" so client plays the hell-super
    // sound AND triggers the white-fade / spam escalation on the countdown.
    if (FORBIDDEN.has(normalized)) {
      await supabaseAdmin.from("secret_submissions").insert({
        secret_slug: "ominous",
        guess: data.guess,
        is_correct: false,
        user_agent: data.userAgent ?? null,
      });
      return {
        correct: false as const,
        forbidden: true as const,
        ominous: true as const,
      };
    }

    // Water secret: hard-coded correct phrases redirect to /reveal/water.
    if (WATER.has(normalized)) {
      await supabaseAdmin.from("secret_submissions").insert({
        secret_slug: "water",
        guess: data.guess,
        is_correct: true,
        user_agent: data.userAgent ?? null,
      });
      return {
        correct: true as const,
        redirect: "/reveal/water",
        forbidden: false as const,
      };
    }

    let query = supabaseAdmin
      .from("secrets")
      .select("id, slug, correct_answers, on_correct_redirect");
    if (data.slug) query = query.eq("slug", data.slug);

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
      ? {
          correct: true as const,
          redirect: match.on_correct_redirect ?? null,
          forbidden: false as const,
        }
      : { correct: false as const, forbidden: false as const };
  });
