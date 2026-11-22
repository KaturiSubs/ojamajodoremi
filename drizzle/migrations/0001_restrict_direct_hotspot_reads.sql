DROP POLICY IF EXISTS "anyone reads hotspots" ON public.hotspots;
REVOKE SELECT ON TABLE public.hotspots FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.hotspots TO authenticated;
GRANT ALL ON TABLE public.hotspots TO service_role;
ALTER TABLE public.hotspots ENABLE ROW LEVEL SECURITY;