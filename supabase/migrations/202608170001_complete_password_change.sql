-- Allows an authenticated user to clear only their own temporary-password flag.
-- SECURITY DEFINER avoids silent zero-row updates when an older profiles RLS policy is missing.
create or replace function public.complete_password_change()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  changed boolean;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  update public.profiles
  set must_change_password = false
  where id = auth.uid();

  changed := found;
  return changed;
end;
$$;

revoke all on function public.complete_password_change() from public;
grant execute on function public.complete_password_change() to authenticated;
