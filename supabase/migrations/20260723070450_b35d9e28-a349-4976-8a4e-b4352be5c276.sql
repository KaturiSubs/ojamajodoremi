ALTER TABLE public.secrets DROP CONSTRAINT IF EXISTS secrets_discovery_type_check;
ALTER TABLE public.secrets ADD CONSTRAINT secrets_discovery_type_check
  CHECK (discovery_type IN ('route','hotspot','key_sequence','typed_word'));

INSERT INTO public.secrets (slug, prompt, correct_answers, discovery_type)
VALUES ('witch', 'What is their secret?', ARRAY['another witch']::text[], 'typed_word')
ON CONFLICT (slug) DO NOTHING;