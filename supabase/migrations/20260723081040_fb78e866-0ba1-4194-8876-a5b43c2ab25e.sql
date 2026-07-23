DROP POLICY IF EXISTS "anyone submits guesses" ON public.secret_submissions;
REVOKE INSERT ON public.secret_submissions FROM anon, authenticated;