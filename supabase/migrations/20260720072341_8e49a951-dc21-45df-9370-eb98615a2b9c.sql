
-- =========================================================================
-- SETTINGS REGISTRY
-- =========================================================================
CREATE TABLE public.cms_settings_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  icon text,
  category text NOT NULL DEFAULT 'general',
  sort_order int NOT NULL DEFAULT 0,
  schema jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cms_settings_groups TO authenticated;
GRANT ALL ON public.cms_settings_groups TO service_role;
ALTER TABLE public.cms_settings_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_groups_read" ON public.cms_settings_groups FOR SELECT TO authenticated USING (public.cms_can_manage());
CREATE POLICY "settings_groups_write" ON public.cms_settings_groups FOR ALL TO authenticated USING (public.cms_is_admin()) WITH CHECK (public.cms_is_admin());
CREATE TRIGGER trg_settings_groups_updated BEFORE UPDATE ON public.cms_settings_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.cms_settings_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_key text NOT NULL REFERENCES public.cms_settings_groups(key) ON DELETE CASCADE,
  key text NOT NULL,
  value jsonb,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_key, key)
);
GRANT SELECT ON public.cms_settings_values TO authenticated;
GRANT ALL ON public.cms_settings_values TO service_role;
ALTER TABLE public.cms_settings_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_values_read" ON public.cms_settings_values FOR SELECT TO authenticated USING (public.cms_can_manage());
CREATE POLICY "settings_values_write" ON public.cms_settings_values FOR ALL TO authenticated USING (public.cms_is_admin()) WITH CHECK (public.cms_is_admin());
CREATE TRIGGER trg_settings_values_updated BEFORE UPDATE ON public.cms_settings_values FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed core settings groups
INSERT INTO public.cms_settings_groups (key, label, description, icon, category, sort_order, is_system) VALUES
  ('general',      'General',       'Site name, timezone, locale, default language', 'settings',  'core',        10, true),
  ('branding',     'Branding',      'Logo, favicon, colors, brand assets',            'palette',   'core',        20, true),
  ('seo',          'SEO',           'Default meta title/description, robots, sitemap','search',    'core',        30, true),
  ('email',        'Email',         'From address, SMTP, transactional templates',    'mail',      'core',        40, true),
  ('storage',      'Storage',       'Media storage buckets, quotas, CDN',             'database',  'core',        50, true),
  ('integrations', 'Integrations',  'Third-party services and webhooks',              'plug',      'integrations',60, true),
  ('analytics',    'Analytics',     'Analytics providers and tracking IDs',           'bar-chart', 'integrations',70, true),
  ('social',       'Social Links',  'Social media profile URLs',                      'share-2',   'core',        80, true),
  ('scripts',      'Custom Scripts','Head/body custom scripts and pixels',            'code',      'developer',   90, true)
ON CONFLICT (key) DO NOTHING;

-- =========================================================================
-- FEATURE FLAGS
-- =========================================================================
CREATE TABLE public.cms_feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  enabled boolean NOT NULL DEFAULT false,
  rollout_percent int NOT NULL DEFAULT 0 CHECK (rollout_percent BETWEEN 0 AND 100),
  enabled_roles text[] NOT NULL DEFAULT '{}',
  enabled_user_ids uuid[] NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cms_feature_flags TO authenticated;
GRANT ALL ON public.cms_feature_flags TO service_role;
ALTER TABLE public.cms_feature_flags ENABLE ROW LEVEL SECURITY;
-- Any signed-in user can read flag state so the app can gate features
CREATE POLICY "feature_flags_read" ON public.cms_feature_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "feature_flags_write" ON public.cms_feature_flags FOR ALL TO authenticated USING (public.cms_is_admin()) WITH CHECK (public.cms_is_admin());
CREATE TRIGGER trg_feature_flags_updated BEFORE UPDATE ON public.cms_feature_flags FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed feature flags for in-flight Phase-0 modules
INSERT INTO public.cms_feature_flags (key, label, description, enabled) VALUES
  ('cms.new_admin_shell',       'New Admin Shell',        'Enable the rebuilt /admin experience',       true),
  ('cms.homepage_builder',      'Homepage Builder',       'Block-based homepage editor',                false),
  ('cms.navigation_builder',    'Navigation Builder',     'Visual navigation editor',                   false),
  ('cms.forms_builder',         'Forms Builder',          'Drag-and-drop form builder',                 false),
  ('cms.leads_crm',             'Leads / CRM',            'Kanban pipeline for leads',                  false),
  ('cms.ai_assist',             'AI Assist',              'Generate/refine copy with AI',               false),
  ('cms.theme_presets',         'Theme Presets',          'Named design-token bundles',                 false),
  ('cms.dependency_checker',    'Dependency Checker',     'Cross-entity delete safeguard',              false),
  ('cms.media_usage_tracking',  'Media Usage Tracking',   'Track where each asset is used',             false),
  ('cms.workflow_states',       'Workflow States',        'Draft/Review/Approved/Published flow',       false)
ON CONFLICT (key) DO NOTHING;

-- =========================================================================
-- EVENT LOG (internal event bus, durable)
-- =========================================================================
CREATE TABLE public.cms_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  entity_type text,
  entity_id uuid,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_cms_events_type_created ON public.cms_events (event_type, created_at DESC);
CREATE INDEX idx_cms_events_entity ON public.cms_events (entity_type, entity_id);
CREATE INDEX idx_cms_events_unprocessed ON public.cms_events (created_at) WHERE processed_at IS NULL;

GRANT SELECT ON public.cms_events TO authenticated;
GRANT ALL ON public.cms_events TO service_role;
ALTER TABLE public.cms_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_read" ON public.cms_events FOR SELECT TO authenticated USING (public.cms_can_manage());
CREATE POLICY "events_admin_write" ON public.cms_events FOR ALL TO authenticated USING (public.cms_is_admin()) WITH CHECK (public.cms_is_admin());

-- Emitter helper (SECURITY DEFINER so triggers and server code can call it)
CREATE OR REPLACE FUNCTION public.cms_emit_event(
  _event_type text,
  _entity_type text DEFAULT NULL,
  _entity_id uuid DEFAULT NULL,
  _payload jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_id uuid;
BEGIN
  INSERT INTO public.cms_events (event_type, entity_type, entity_id, actor_id, payload)
  VALUES (_event_type, _entity_type, _entity_id, auth.uid(), COALESCE(_payload, '{}'::jsonb))
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
REVOKE ALL ON FUNCTION public.cms_emit_event(text, text, uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cms_emit_event(text, text, uuid, jsonb) TO authenticated, service_role;

-- Workflow transition event emitter (fires when workflow_state changes on any registered table)
CREATE OR REPLACE FUNCTION public.cms_emit_workflow_event() RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_entity_type text := TG_ARGV[0];
BEGIN
  IF (TG_OP = 'INSERT') THEN
    PERFORM public.cms_emit_event(
      v_entity_type || '.created',
      v_entity_type,
      NEW.id,
      jsonb_build_object('workflow_state', to_jsonb(NEW)->>'workflow_state')
    );
  ELSIF (TG_OP = 'UPDATE') THEN
    IF COALESCE((to_jsonb(OLD)->>'workflow_state'),'') IS DISTINCT FROM COALESCE((to_jsonb(NEW)->>'workflow_state'),'') THEN
      PERFORM public.cms_emit_event(
        v_entity_type || '.workflow_changed',
        v_entity_type,
        NEW.id,
        jsonb_build_object(
          'from', to_jsonb(OLD)->>'workflow_state',
          'to',   to_jsonb(NEW)->>'workflow_state'
        )
      );
      IF (to_jsonb(NEW)->>'workflow_state') = 'published' THEN
        PERFORM public.cms_emit_event(
          v_entity_type || '.published',
          v_entity_type,
          NEW.id,
          '{}'::jsonb
        );
      END IF;
    ELSE
      PERFORM public.cms_emit_event(
        v_entity_type || '.updated',
        v_entity_type,
        NEW.id,
        '{}'::jsonb
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.cms_emit_workflow_event() FROM PUBLIC;

-- Wire workflow events to primary content tables
DROP TRIGGER IF EXISTS trg_portfolio_projects_events ON public.portfolio_projects;
CREATE TRIGGER trg_portfolio_projects_events AFTER INSERT OR UPDATE ON public.portfolio_projects
  FOR EACH ROW EXECUTE FUNCTION public.cms_emit_workflow_event('portfolio_project');

DROP TRIGGER IF EXISTS trg_insight_articles_events ON public.insight_articles;
CREATE TRIGGER trg_insight_articles_events AFTER INSERT OR UPDATE ON public.insight_articles
  FOR EACH ROW EXECUTE FUNCTION public.cms_emit_workflow_event('insight_article');

DROP TRIGGER IF EXISTS trg_services_events ON public.services;
CREATE TRIGGER trg_services_events AFTER INSERT OR UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.cms_emit_workflow_event('service');

DROP TRIGGER IF EXISTS trg_pages_events ON public.pages;
CREATE TRIGGER trg_pages_events AFTER INSERT OR UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.cms_emit_workflow_event('page');

-- Lead-created + form-submitted events
CREATE OR REPLACE FUNCTION public.cms_emit_lead_created() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.cms_emit_event('lead.created', 'crm_lead', NEW.id, '{}'::jsonb);
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.cms_emit_lead_created() FROM PUBLIC;
DROP TRIGGER IF EXISTS trg_crm_leads_events ON public.crm_leads;
CREATE TRIGGER trg_crm_leads_events AFTER INSERT ON public.crm_leads
  FOR EACH ROW EXECUTE FUNCTION public.cms_emit_lead_created();

CREATE OR REPLACE FUNCTION public.cms_emit_form_submitted() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.cms_emit_event(
    'form.submitted',
    'cms_form_submission',
    NEW.id,
    jsonb_build_object('form_id', NEW.form_id)
  );
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.cms_emit_form_submitted() FROM PUBLIC;
DROP TRIGGER IF EXISTS trg_form_submissions_events ON public.cms_form_submissions;
CREATE TRIGGER trg_form_submissions_events AFTER INSERT ON public.cms_form_submissions
  FOR EACH ROW EXECUTE FUNCTION public.cms_emit_form_submitted();

-- Media deleted event
CREATE OR REPLACE FUNCTION public.cms_emit_media_deleted() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.cms_emit_event(
    'media.deleted',
    'media_asset',
    OLD.id,
    jsonb_build_object('path', to_jsonb(OLD)->>'path')
  );
  RETURN OLD;
END;
$$;
REVOKE ALL ON FUNCTION public.cms_emit_media_deleted() FROM PUBLIC;
DROP TRIGGER IF EXISTS trg_media_assets_deleted_events ON public.media_assets;
CREATE TRIGGER trg_media_assets_deleted_events AFTER DELETE ON public.media_assets
  FOR EACH ROW EXECUTE FUNCTION public.cms_emit_media_deleted();
