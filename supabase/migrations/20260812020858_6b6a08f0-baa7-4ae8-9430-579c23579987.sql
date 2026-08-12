-- ============ enums ============
CREATE TYPE public.app_role AS ENUM ('admin','user');

CREATE TYPE public.scan_status AS ENUM (
  'created','validating','crawling','profile_ready','generating_queries','running_tests',
  'normalizing_entities','calculating_scores','generating_recommendations','rendering_report',
  'complete','partial','failed','refund_review'
);

CREATE TYPE public.run_status AS ENUM ('pending','running','succeeded','failed','skipped','timeout');
CREATE TYPE public.mention_kind AS ENUM ('target','competitor');
CREATE TYPE public.order_status AS ENUM ('pending','paid','failed','refunded');
CREATE TYPE public.subscription_status AS ENUM ('active','trialing','past_due','canceled','incomplete');

-- ============ helpers ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ profiles ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  company_name TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ roles ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- profile autocreate
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ businesses ============
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  website TEXT,
  website_host TEXT,
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  primary_services TEXT[] NOT NULL DEFAULT '{}',
  aliases TEXT[] NOT NULL DEFAULT '{}',
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX businesses_owner_idx ON public.businesses(owner_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.businesses TO authenticated;
GRANT ALL ON public.businesses TO service_role;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER businesses_updated_at BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "businesses_own_all" ON public.businesses FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (owner_id = auth.uid());

CREATE OR REPLACE FUNCTION public.owns_business(_business_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = _business_id
      AND (b.owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  );
$$;

CREATE TABLE public.business_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses ON DELETE CASCADE,
  label TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'US',
  phone TEXT,
  place_reference TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX business_locations_business_idx ON public.business_locations(business_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_locations TO authenticated;
GRANT ALL ON public.business_locations TO service_role;
ALTER TABLE public.business_locations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER business_locations_updated_at BEFORE UPDATE ON public.business_locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "business_locations_own_all" ON public.business_locations FOR ALL TO authenticated
  USING (public.owns_business(business_id)) WITH CHECK (public.owns_business(business_id));

-- ============ scans ============
CREATE TABLE public.scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  status public.scan_status NOT NULL DEFAULT 'created',
  scan_type TEXT NOT NULL DEFAULT 'standard',
  idempotency_key TEXT NOT NULL,
  progress SMALLINT NOT NULL DEFAULT 0,
  providers_requested TEXT[] NOT NULL DEFAULT '{}',
  providers_succeeded TEXT[] NOT NULL DEFAULT '{}',
  providers_failed TEXT[] NOT NULL DEFAULT '{}',
  error_code TEXT,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, idempotency_key)
);
CREATE INDEX scans_owner_idx ON public.scans(owner_id);
CREATE INDEX scans_business_idx ON public.scans(business_id);
GRANT SELECT, INSERT, UPDATE ON public.scans TO authenticated;
GRANT ALL ON public.scans TO service_role;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER scans_updated_at BEFORE UPDATE ON public.scans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "scans_own_all" ON public.scans FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (owner_id = auth.uid() AND public.owns_business(business_id));

CREATE OR REPLACE FUNCTION public.owns_scan(_scan_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.scans s
    WHERE s.id = _scan_id
      AND (s.owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  );
$$;

CREATE TABLE public.scan_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  intent_type TEXT NOT NULL,
  service_focus TEXT,
  locale TEXT NOT NULL DEFAULT 'en-US',
  position SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX scan_queries_scan_idx ON public.scan_queries(scan_id);
GRANT SELECT ON public.scan_queries TO authenticated;
GRANT ALL ON public.scan_queries TO service_role;
ALTER TABLE public.scan_queries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scan_queries_read_own" ON public.scan_queries FOR SELECT TO authenticated
  USING (public.owns_scan(scan_id));

CREATE TABLE public.scan_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans ON DELETE CASCADE,
  scan_query_id UUID NOT NULL REFERENCES public.scan_queries ON DELETE CASCADE,
  provider TEXT NOT NULL,
  model TEXT,
  attempt SMALLINT NOT NULL DEFAULT 1,
  status public.run_status NOT NULL DEFAULT 'pending',
  latency_ms INTEGER,
  raw_response JSONB,
  answer_text TEXT,
  error_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (scan_query_id, provider, attempt)
);
CREATE INDEX scan_runs_scan_idx ON public.scan_runs(scan_id);
GRANT SELECT ON public.scan_runs TO authenticated;
GRANT ALL ON public.scan_runs TO service_role;
ALTER TABLE public.scan_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scan_runs_read_own" ON public.scan_runs FOR SELECT TO authenticated
  USING (public.owns_scan(scan_id));

CREATE TABLE public.detected_competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans ON DELETE CASCADE,
  canonical_name TEXT NOT NULL,
  normalized_key TEXT NOT NULL,
  website_host TEXT,
  aliases TEXT[] NOT NULL DEFAULT '{}',
  mention_count INTEGER NOT NULL DEFAULT 0,
  recommendation_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (scan_id, normalized_key)
);
CREATE INDEX detected_competitors_scan_idx ON public.detected_competitors(scan_id);
GRANT SELECT ON public.detected_competitors TO authenticated;
GRANT ALL ON public.detected_competitors TO service_role;
ALTER TABLE public.detected_competitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "detected_competitors_read_own" ON public.detected_competitors FOR SELECT TO authenticated
  USING (public.owns_scan(scan_id));

CREATE TABLE public.run_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans ON DELETE CASCADE,
  scan_run_id UUID NOT NULL REFERENCES public.scan_runs ON DELETE CASCADE,
  kind public.mention_kind NOT NULL,
  business_id UUID REFERENCES public.businesses ON DELETE SET NULL,
  competitor_id UUID REFERENCES public.detected_competitors ON DELETE CASCADE,
  entity_name TEXT NOT NULL,
  mentioned BOOLEAN NOT NULL DEFAULT true,
  recommended BOOLEAN NOT NULL DEFAULT false,
  list_position SMALLINT,
  list_length SMALLINT,
  first_char_offset INTEGER,
  evidence_snippet TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX run_mentions_scan_idx ON public.run_mentions(scan_id);
CREATE INDEX run_mentions_run_idx ON public.run_mentions(scan_run_id);
GRANT SELECT ON public.run_mentions TO authenticated;
GRANT ALL ON public.run_mentions TO service_role;
ALTER TABLE public.run_mentions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "run_mentions_read_own" ON public.run_mentions FOR SELECT TO authenticated
  USING (public.owns_scan(scan_id));

CREATE TABLE public.run_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans ON DELETE CASCADE,
  scan_run_id UUID NOT NULL REFERENCES public.scan_runs ON DELETE CASCADE,
  url TEXT NOT NULL,
  host TEXT,
  title TEXT,
  is_owned_domain BOOLEAN NOT NULL DEFAULT false,
  position SMALLINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX run_sources_scan_idx ON public.run_sources(scan_id);
GRANT SELECT ON public.run_sources TO authenticated;
GRANT ALL ON public.run_sources TO service_role;
ALTER TABLE public.run_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "run_sources_read_own" ON public.run_sources FOR SELECT TO authenticated
  USING (public.owns_scan(scan_id));

CREATE TABLE public.site_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses ON DELETE CASCADE,
  url TEXT NOT NULL,
  final_url TEXT,
  http_status INTEGER,
  fetch_ms INTEGER,
  signals JSONB NOT NULL DEFAULT '{}'::jsonb,
  findings JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw_meta JSONB,
  error_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX site_audits_scan_idx ON public.site_audits(scan_id);
GRANT SELECT ON public.site_audits TO authenticated;
GRANT ALL ON public.site_audits TO service_role;
ALTER TABLE public.site_audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_audits_read_own" ON public.site_audits FOR SELECT TO authenticated
  USING (public.owns_scan(scan_id));

CREATE TABLE public.score_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses ON DELETE CASCADE,
  algorithm_version TEXT NOT NULL,
  visibility_score SMALLINT,
  visibility_components JSONB NOT NULL DEFAULT '{}'::jsonb,
  readiness_score SMALLINT,
  readiness_components JSONB NOT NULL DEFAULT '{}'::jsonb,
  share_of_voice NUMERIC(6,3),
  coverage JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX score_snapshots_scan_idx ON public.score_snapshots(scan_id);
GRANT SELECT ON public.score_snapshots TO authenticated;
GRANT ALL ON public.score_snapshots TO service_role;
ALTER TABLE public.score_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "score_snapshots_read_own" ON public.score_snapshots FOR SELECT TO authenticated
  USING (public.owns_scan(scan_id));

CREATE TABLE public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT,
  dimension TEXT,
  impact SMALLINT NOT NULL DEFAULT 0,
  effort SMALLINT NOT NULL DEFAULT 0,
  priority SMALLINT NOT NULL DEFAULT 0,
  action_window TEXT,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX recommendations_scan_idx ON public.recommendations(scan_id);
GRANT SELECT ON public.recommendations TO authenticated;
GRANT ALL ON public.recommendations TO service_role;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recommendations_read_own" ON public.recommendations FOR SELECT TO authenticated
  USING (public.owns_scan(scan_id));

CREATE TABLE public.report_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses ON DELETE CASCADE,
  version SMALLINT NOT NULL DEFAULT 1,
  algorithm_version TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_sample BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (scan_id, version)
);
CREATE INDEX report_versions_scan_idx ON public.report_versions(scan_id);
GRANT SELECT ON public.report_versions TO authenticated;
GRANT ALL ON public.report_versions TO service_role;
ALTER TABLE public.report_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "report_versions_read_own" ON public.report_versions FOR SELECT TO authenticated
  USING (public.owns_scan(scan_id));

-- ============ billing ============
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses ON DELETE SET NULL,
  scan_id UUID REFERENCES public.scans ON DELETE SET NULL,
  status public.order_status NOT NULL DEFAULT 'pending',
  product_code TEXT NOT NULL,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',
  provider TEXT,
  provider_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX orders_owner_idx ON public.orders(owner_id);
GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "orders_read_own" ON public.orders FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  status public.subscription_status NOT NULL DEFAULT 'incomplete',
  plan_code TEXT NOT NULL,
  provider TEXT,
  provider_reference TEXT,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX subscriptions_owner_idx ON public.subscriptions(owner_id);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "subscriptions_read_own" ON public.subscriptions FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users ON DELETE CASCADE,
  scan_id UUID REFERENCES public.scans ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  provider TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  cost_micros BIGINT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX usage_events_owner_idx ON public.usage_events(owner_id);
GRANT SELECT ON public.usage_events TO authenticated;
GRANT ALL ON public.usage_events TO service_role;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usage_events_read_own" ON public.usage_events FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users ON DELETE SET NULL,
  business_id UUID REFERENCES public.businesses ON DELETE SET NULL,
  scan_id UUID REFERENCES public.scans ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  ip_hash TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_actor_idx ON public.audit_logs(actor_id);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_logs_read_own" ON public.audit_logs FOR SELECT TO authenticated
  USING (actor_id = auth.uid() OR public.has_role(auth.uid(),'admin'));