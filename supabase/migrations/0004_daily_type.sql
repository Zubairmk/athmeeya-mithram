-- Flags which set(s) count as the home page's Morning / Evening tiles.
-- Nullable: most sets are neither. Admin assigns this from the edit page.

alter table dhikr_sets
  add column daily_type text check (daily_type in ('morning', 'evening'));
