-- ════════════════════════════════════════════════════════════
--  NexCart · 005 · fix infinite recursion in admin RLS policies
--
--  Bug: `profiles_admin_read` queried `profiles` from inside its USING
--  clause. Postgres evaluated profiles' RLS for the subquery too, hit the
--  same policy, and raised:
--    ERROR: infinite recursion detected in policy for relation "profiles"
--
--  Symptom: server-side `select role from profiles` returned no row, so
--  the account page silently fell back to role = 'member' even though
--  the row actually had role = 'super_admin'.
--
--  Fix: replace the recursive subquery with a SECURITY DEFINER function
--  that bypasses RLS for the role check itself. Idempotent — safe to
--  re-run.
-- ════════════════════════════════════════════════════════════

-- 1) Non-recursive admin check, callable from any policy
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('admin','super_admin') from public.profiles where id = auth.uid()),
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- 2) Replace every recursive admin policy with a call to is_admin()
drop policy if exists "profiles_admin_read"     on public.profiles;
drop policy if exists "orders_admin_read"       on public.orders;
drop policy if exists "orders_admin_update"     on public.orders;
drop policy if exists "order_items_admin_read"  on public.order_items;

create policy "profiles_admin_read"
  on public.profiles for select using (public.is_admin());

create policy "orders_admin_read"
  on public.orders for select using (public.is_admin());

create policy "orders_admin_update"
  on public.orders for update using (public.is_admin());

create policy "order_items_admin_read"
  on public.order_items for select using (public.is_admin());
