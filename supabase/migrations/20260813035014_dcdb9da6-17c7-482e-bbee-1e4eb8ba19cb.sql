drop policy if exists businesses_no_owner_reassign on public.businesses;
create policy businesses_no_owner_reassign
on public.businesses
as restrictive
for all
to authenticated
using (owner_id = auth.uid() or private.has_role(auth.uid(), 'admin'::app_role))
with check (owner_id = auth.uid());

drop policy if exists scans_no_client_update on public.scans;
create policy scans_no_client_update
on public.scans
as restrictive
for update
to authenticated
using (false)
with check (false);

drop policy if exists scans_no_client_delete on public.scans;
create policy scans_no_client_delete
on public.scans
as restrictive
for delete
to authenticated
using (false);

drop policy if exists user_roles_no_client_insert on public.user_roles;
create policy user_roles_no_client_insert
on public.user_roles
as restrictive
for insert
to authenticated
with check (false);

drop policy if exists user_roles_no_client_update on public.user_roles;
create policy user_roles_no_client_update
on public.user_roles
as restrictive
for update
to authenticated
using (false)
with check (false);

drop policy if exists user_roles_no_client_delete on public.user_roles;
create policy user_roles_no_client_delete
on public.user_roles
as restrictive
for delete
to authenticated
using (false);