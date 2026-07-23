-- 1. Hide sensitive secret columns from anonymous readers
REVOKE SELECT ON public.secrets FROM anon;
GRANT SELECT (id, slug, label, prompt, discovery_type, key_sequence, created_at) ON public.secrets TO anon;

-- Also restrict authenticated to safe columns; admins go through service_role/server fns
REVOKE SELECT ON public.secrets FROM authenticated;
GRANT SELECT (id, slug, label, prompt, discovery_type, key_sequence, created_at) ON public.secrets TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.secrets TO authenticated;

-- 2. Explicit INSERT-only policy for public submissions (reads remain admin-only)
CREATE POLICY "anyone submits guesses"
  ON public.secret_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

GRANT INSERT ON public.secret_submissions TO anon, authenticated;