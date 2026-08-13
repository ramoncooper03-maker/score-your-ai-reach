
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION private.owns_business(_business_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = _business_id
      AND (b.owner_id = auth.uid() OR private.has_role(auth.uid(),'admin'))
  );
$$;

CREATE OR REPLACE FUNCTION private.owns_scan(_scan_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.scans s
    WHERE s.id = _scan_id
      AND (s.owner_id = auth.uid() OR private.has_role(auth.uid(),'admin'))
  );
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.owns_business(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.owns_scan(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.owns_business(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.owns_scan(uuid) TO authenticated, service_role;

-- Repoint policies to the private helpers
DROP POLICY audit_logs_read_own ON public.audit_logs;
CREATE POLICY audit_logs_read_own ON public.audit_logs FOR SELECT TO authenticated
  USING ((actor_id = auth.uid()) OR private.has_role(auth.uid(), 'admin'));

DROP POLICY businesses_own_all ON public.businesses;
CREATE POLICY businesses_own_all ON public.businesses FOR ALL TO authenticated
  USING ((owner_id = auth.uid()) OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK (owner_id = auth.uid());

DROP POLICY business_locations_own_all ON public.business_locations;
CREATE POLICY business_locations_own_all ON public.business_locations FOR ALL TO authenticated
  USING (private.owns_business(business_id))
  WITH CHECK (private.owns_business(business_id));

CREATE POLICY business_locations_owner_scoped ON public.business_locations AS RESTRICTIVE FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND (b.owner_id = auth.uid() OR private.has_role(auth.uid(),'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND (b.owner_id = auth.uid() OR private.has_role(auth.uid(),'admin'))));

DROP POLICY scans_own_all ON public.scans;
CREATE POLICY scans_own_all ON public.scans FOR ALL TO authenticated
  USING ((owner_id = auth.uid()) OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK ((owner_id = auth.uid()) AND private.owns_business(business_id));

DROP POLICY profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT TO authenticated
  USING ((id = auth.uid()) OR private.has_role(auth.uid(), 'admin'));

DROP POLICY user_roles_select_own ON public.user_roles;
CREATE POLICY user_roles_select_own ON public.user_roles FOR SELECT TO authenticated
  USING ((user_id = auth.uid()) OR private.has_role(auth.uid(), 'admin'));

DROP POLICY orders_read_own ON public.orders;
CREATE POLICY orders_read_own ON public.orders FOR SELECT TO authenticated
  USING ((owner_id = auth.uid()) OR private.has_role(auth.uid(), 'admin'));

DROP POLICY subscriptions_read_own ON public.subscriptions;
CREATE POLICY subscriptions_read_own ON public.subscriptions FOR SELECT TO authenticated
  USING ((owner_id = auth.uid()) OR private.has_role(auth.uid(), 'admin'));

DROP POLICY usage_events_read_own ON public.usage_events;
CREATE POLICY usage_events_read_own ON public.usage_events FOR SELECT TO authenticated
  USING ((owner_id = auth.uid()) OR private.has_role(auth.uid(), 'admin'));

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['scan_queries','scan_runs','detected_competitors','run_mentions','run_sources','site_audits','recommendations','report_versions','score_snapshots']
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', t || '_read_own', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (private.owns_scan(scan_id))', t || '_read_own', t);
  END LOOP;
END $$;

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.owns_business(uuid);
DROP FUNCTION IF EXISTS public.owns_scan(uuid);

-- Explicit, restrictive deny of client-side writes on server-owned tables
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['orders','subscriptions','usage_events','audit_logs','scan_queries','scan_runs','detected_competitors','run_mentions','run_sources','site_audits','recommendations','report_versions','score_snapshots']
  LOOP
    EXECUTE format('CREATE POLICY %I ON public.%I AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (false)', t || '_no_client_insert', t);
    EXECUTE format('CREATE POLICY %I ON public.%I AS RESTRICTIVE FOR UPDATE TO authenticated USING (false) WITH CHECK (false)', t || '_no_client_update', t);
    EXECUTE format('CREATE POLICY %I ON public.%I AS RESTRICTIVE FOR DELETE TO authenticated USING (false)', t || '_no_client_delete', t);
    EXECUTE format('REVOKE INSERT, UPDATE, DELETE ON public.%I FROM authenticated', t);
  END LOOP;
END $$;
