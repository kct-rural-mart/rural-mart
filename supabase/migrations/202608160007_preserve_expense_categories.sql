-- Preserve the exact category selected/entered in the Financial Dashboard.
-- The original fixed list forced the application to rename legitimate UI
-- categories such as Electricity and Staff Salary.
alter table public.expenses
  drop constraint if exists expenses_category_check;

alter table public.expenses
  drop constraint if exists expenses_category_not_blank;

alter table public.expenses
  add constraint expenses_category_not_blank
  check (char_length(btrim(category)) > 0);

