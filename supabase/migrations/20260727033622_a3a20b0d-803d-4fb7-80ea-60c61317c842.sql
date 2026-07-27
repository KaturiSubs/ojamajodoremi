ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS ominous_phrases text[] NOT NULL DEFAULT '{}'::text[];

UPDATE public.site_settings
SET ominous_phrases = ARRAY[
  'experiment','666','proceed','weird','devil','demon','evil','youtube','theory','lake','beach',
  'other side','below','abuse','fairy-reliant tools','slaves','overwork','work','overworked',
  'enslaved','enslave','genocide','wiped out','extinct','species'
]
WHERE id = 1;