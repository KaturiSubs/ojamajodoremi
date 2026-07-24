import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (error) throw new Error("Role check failed");
  if (!data) throw new Error("Forbidden");
}

export const adminListSecrets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("secrets")
      .select("*")
      .order("created_at");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const createSchema = z.object({
  slug: z.string().trim().min(1).max(100),
});

export const adminCreateSecret = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => createSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("secrets")
      .insert({
        slug: data.slug,
        prompt: "What is their secret?",
        correct_answers: [],
        discovery_type: "route",
      })
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

const updateSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().trim().min(1).max(100),
  prompt: z.string().max(1000).nullable().optional(),
  correct_answers: z.array(z.string().max(500)).max(200),
  discovery_type: z.string().max(50),
  key_sequence: z.string().max(500).nullable().optional(),
  on_correct_redirect: z.string().max(1000).nullable().optional(),
});

export const adminUpdateSecret = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => updateSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("secrets")
      .update({
        slug: data.slug,
        prompt: data.prompt ?? "What is their secret?",
        correct_answers: data.correct_answers,
        discovery_type: data.discovery_type,
        key_sequence: data.key_sequence ?? null,
        on_correct_redirect: data.on_correct_redirect ?? null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

const deleteSchema = z.object({ id: z.string().uuid() });

export const adminDeleteSecret = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => deleteSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("secrets").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
