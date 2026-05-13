-- ════════════════════════════════════════════════════════════
--  NexCart · seed — categories only.
--  Products are seeded by scripts/seed.ts (richer data + arrays).
--  Idempotent.
-- ════════════════════════════════════════════════════════════

insert into public.categories (name, slug, icon, image_url) values
  ('Smartphones', 'smartphones', '📱', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=80'),
  ('Laptops',     'laptops',     '💻', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&q=80'),
  ('Gaming',      'gaming',      '🎮', 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1200&q=80'),
  ('Audio',       'audio',       '🎧', 'https://images.unsplash.com/photo-1518443855757-dfadac7101ae?w=1200&q=80'),
  ('Wearables',   'wearables',   '⌚', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1200&q=80'),
  ('Smart Home',  'smart-home',  '🏠', 'https://images.unsplash.com/photo-1558002038-1055907df827?w=1200&q=80'),
  ('Accessories', 'accessories', '🔌', 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=1200&q=80'),
  ('AI Gadgets',  'ai-gadgets',  '🤖', 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80')
on conflict (slug) do update set
  name      = excluded.name,
  icon      = excluded.icon,
  image_url = excluded.image_url;
