
DROP VIEW IF EXISTS public.secrets_public;

-- Anon can only read non-answer columns from secrets
GRANT SELECT (id, slug, label, prompt, discovery_type, key_sequence) ON public.secrets TO anon;
CREATE POLICY "anon reads secrets (safe cols)" ON public.secrets FOR SELECT TO anon USING (true);
CREATE POLICY "authenticated reads secrets" ON public.secrets FOR SELECT TO authenticated USING (true);

-- Lock down SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon, authenticated;
