
DELETE FROM public.secrets WHERE slug IN ('carnival','roxanne','sakura','help','fafa','tense');

INSERT INTO public.secrets (slug, prompt, correct_answers, discovery_type, on_correct_redirect) VALUES
('carnival', 'INPUT.', ARRAY['carnival','ojamajo carnival','season 1'], 'typed_word', '/reveal/carnival'),
('roxanne',  'INPUT.', ARRAY['roxanne','majo roxanne','fairy reliant','fairy reliant tools','fairy-reliant','fairy-reliant tools'], 'typed_word', '/reveal/roxanne'),
('help',     'INPUT.', ARRAY['what','help','?','what?','hello','hi'], 'typed_word', '/reveal/help'),
('fafa',     'INPUT.', ARRAY['pop','fafa'], 'typed_word', '/reveal/fafa'),
('tense',    'INPUT.', ARRAY[]::text[], 'route', '/reveal/tense'),
('sakura',   'INPUT.', ARRAY['soon','year','one','one year','two years','fami','future','sakura','tree','forgotten','miraical','pirilalatte','doremicord','video','countdown','cherry blossom','cherry','blossom','end','ending','the end','yojigen','yoji','world','sekai','mirai','1','2','6','1 month','one month','two months','two month','2 months','6 months','six months','1 year','2 years','11 years','11','eleven years','eleven','long','how','patient','patience','peaches','peach','last','last one','takaramono','treasure','naisho','secret','ojamajo doremi naisho','na~i~sho','mugendai','infinite','thank you','thanks','himitsu','ty','thx','goodbye','disappearance','1620s','16-20s','16','20','ojamajo doremi 1620s','1620','ln','light novel','teen','teenager'], 'typed_word', '/reveal/sakura');

UPDATE public.secrets SET correct_answers = ARRAY['witches','witch','another witch'] WHERE slug='witches';

-- Fairy secret: route via /reveal/fairy instead of direct mp4 so browsers reliably play it
UPDATE public.secrets SET on_correct_redirect = '/reveal/fairy' WHERE slug='fairy';
