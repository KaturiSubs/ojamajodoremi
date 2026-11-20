import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Public, read-only content for the countdown site. Served through the server
// so the database tables themselves stay closed to direct public reads.

export const getPublicSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  return data ?? null;
});

export const getSecretPrompt = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().trim().min(1).max(100) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("secrets")
      .select("prompt")
      .eq("slug", data.slug)
      .maybeSingle();
    return row ? { prompt: row.prompt as string | null } : null;
  });

export const getCountdownSecrets = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [hs, ks] = await Promise.all([
    supabaseAdmin.from("hotspots").select("id, x_pct, y_pct, width_pct, height_pct, secrets(slug)"),
    supabaseAdmin
      .from("secrets")
      .select("slug, key_sequence")
      .eq("discovery_type", "key_sequence"),
  ]);
  const hotspots = (hs.data ?? [])
    .filter((h: any) => h.secrets?.slug)
    .map((h: any) => ({
      id: h.id as string,
      x_pct: Number(h.x_pct),
      y_pct: Number(h.y_pct),
      width_pct: Number(h.width_pct),
      height_pct: Number(h.height_pct),
      slug: h.secrets.slug as string,
    }));
  const keySecrets = (ks.data ?? [])
    .filter((s) => s.key_sequence)
    .map((s) => ({ slug: s.slug, key_sequence: s.key_sequence as string }));
  return { hotspots, keySecrets };
});
