-- The 8 categories are a fixed structure from the source book (see CLAUDE.md
-- "Content structure"), not admin-editable content — seed them directly.

insert into categories (name_ml, slug, sort_order) values
  ('അടിസ്ഥാനങ്ങൾ', 'foundations', 1),
  ('വിവിധ സ്വലാത്തുകൾ', 'swalath', 2),
  ('വിർദുകളും റാതിബുകളും', 'awrad-ratib', 3),
  ('സംരക്ഷണ ദിക്റുകൾ', 'protection', 4),
  ('ദൈനംദിന ജീവിതം', 'daily-life', 5),
  ('യാത്ര', 'travel', 6),
  ('റമളാൻ', 'ramadan', 7),
  ('ഖസീദ', 'qaseeda', 8)
on conflict (slug) do nothing;
