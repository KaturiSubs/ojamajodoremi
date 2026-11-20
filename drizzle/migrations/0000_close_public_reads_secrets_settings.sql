DROP POLICY IF EXISTS "anon reads secrets (safe cols)" ON public.secrets;
DROP POLICY IF EXISTS "authenticated reads secrets" ON public.secrets;
DROP POLICY IF EXISTS "anyone reads site settings" ON public.site_settings;
CREATE POLICY "admin reads settings" ON public.site_settings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));