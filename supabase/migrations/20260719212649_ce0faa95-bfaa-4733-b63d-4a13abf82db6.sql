
DO $$ BEGIN CREATE TYPE public.cms_workflow_state AS ENUM ('draft','in_review','approved','published','archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.cms_revision_state AS ENUM ('draft','autosave','checkpoint','published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.cms_nav_location AS ENUM ('header','footer','mobile','sidebar','mega'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.cms_dependency_kind AS ENUM ('reference','media','block','navigation','component','template','layout','form'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.crm_lead_status AS ENUM ('new','contacted','qualified','proposal','won','lost','archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path=public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT private.has_role(_user_id, _role);
$$;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.cms_can_manage()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role::text IN ('admin','editor','author','reviewer')
  );
$$;
GRANT EXECUTE ON FUNCTION public.cms_can_manage() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.cms_is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'admin'
  );
$$;
GRANT EXECUTE ON FUNCTION public.cms_is_admin() TO authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.cms_entity_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE, label text NOT NULL,
  table_name text NOT NULL, pk_column text NOT NULL DEFAULT 'id',
  slug_column text, has_i18n boolean NOT NULL DEFAULT false,
  supports_workflow boolean NOT NULL DEFAULT true,
  supports_versioning boolean NOT NULL DEFAULT true,
  deletable boolean NOT NULL DEFAULT true,
  preview_path_template text, icon text, sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cms_entity_types TO authenticated;
GRANT ALL ON public.cms_entity_types TO service_role;
ALTER TABLE public.cms_entity_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY cms_entity_types_read ON public.cms_entity_types FOR SELECT TO authenticated USING (public.cms_can_manage());
CREATE POLICY cms_entity_types_admin ON public.cms_entity_types FOR ALL TO authenticated USING (public.cms_is_admin()) WITH CHECK (public.cms_is_admin());
CREATE TRIGGER cms_entity_types_touch BEFORE UPDATE ON public.cms_entity_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.cms_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL, entity_id uuid NOT NULL, version_number int NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  change_summary text, snapshot jsonb, diff jsonb,
  state public.cms_revision_state NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id, version_number)
);
CREATE INDEX IF NOT EXISTS cms_revisions_entity_idx ON public.cms_revisions (entity_type, entity_id, version_number DESC);
GRANT SELECT, INSERT ON public.cms_revisions TO authenticated;
GRANT ALL ON public.cms_revisions TO service_role;
ALTER TABLE public.cms_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY cms_revisions_read ON public.cms_revisions FOR SELECT TO authenticated USING (public.cms_can_manage());
CREATE POLICY cms_revisions_insert ON public.cms_revisions FOR INSERT TO authenticated WITH CHECK (public.cms_can_manage());

CREATE TABLE IF NOT EXISTS public.cms_autosaves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL, entity_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payload jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id, user_id)
);
CREATE INDEX IF NOT EXISTS cms_autosaves_entity_idx ON public.cms_autosaves (entity_type, entity_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_autosaves TO authenticated;
GRANT ALL ON public.cms_autosaves TO service_role;
ALTER TABLE public.cms_autosaves ENABLE ROW LEVEL SECURITY;
CREATE POLICY cms_autosaves_own ON public.cms_autosaves FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.cms_can_manage())
  WITH CHECK (user_id = auth.uid() AND public.cms_can_manage());
CREATE TRIGGER cms_autosaves_touch BEFORE UPDATE ON public.cms_autosaves FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.cms_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_type text, entity_id uuid, action text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cms_audit_log_entity_idx ON public.cms_audit_log (entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS cms_audit_log_actor_idx ON public.cms_audit_log (actor_id, created_at DESC);
GRANT SELECT, INSERT ON public.cms_audit_log TO authenticated;
GRANT ALL ON public.cms_audit_log TO service_role;
ALTER TABLE public.cms_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY cms_audit_log_read ON public.cms_audit_log FOR SELECT TO authenticated USING (public.cms_can_manage());
CREATE POLICY cms_audit_log_insert ON public.cms_audit_log FOR INSERT TO authenticated WITH CHECK (public.cms_can_manage());

CREATE TABLE IF NOT EXISTS public.cms_locks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL, entity_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  acquired_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  UNIQUE (entity_type, entity_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_locks TO authenticated;
GRANT ALL ON public.cms_locks TO service_role;
ALTER TABLE public.cms_locks ENABLE ROW LEVEL SECURITY;
CREATE POLICY cms_locks_manage ON public.cms_locks FOR ALL TO authenticated USING (public.cms_can_manage()) WITH CHECK (public.cms_can_manage());

CREATE TABLE IF NOT EXISTS public.cms_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key text NOT NULL, entity_type text NOT NULL,
  actions text[] NOT NULL DEFAULT '{}',
  UNIQUE (role_key, entity_type)
);
GRANT SELECT ON public.cms_permissions TO authenticated;
GRANT ALL ON public.cms_permissions TO service_role;
ALTER TABLE public.cms_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY cms_permissions_read ON public.cms_permissions FOR SELECT TO authenticated USING (public.cms_can_manage());
CREATE POLICY cms_permissions_admin ON public.cms_permissions FOR ALL TO authenticated USING (public.cms_is_admin()) WITH CHECK (public.cms_is_admin());

CREATE TABLE IF NOT EXISTS public.cms_workflow_transitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key text NOT NULL,
  from_state public.cms_workflow_state NOT NULL,
  to_state public.cms_workflow_state NOT NULL,
  UNIQUE (role_key, from_state, to_state)
);
GRANT SELECT ON public.cms_workflow_transitions TO authenticated;
GRANT ALL ON public.cms_workflow_transitions TO service_role;
ALTER TABLE public.cms_workflow_transitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY cms_wt_read ON public.cms_workflow_transitions FOR SELECT TO authenticated USING (public.cms_can_manage());
CREATE POLICY cms_wt_admin ON public.cms_workflow_transitions FOR ALL TO authenticated USING (public.cms_is_admin()) WITH CHECK (public.cms_is_admin());

CREATE TABLE IF NOT EXISTS public.cms_reusable_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE, label text NOT NULL, block_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  workflow_state public.cms_workflow_state NOT NULL DEFAULT 'published',
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_reusable_blocks TO authenticated;
GRANT SELECT ON public.cms_reusable_blocks TO anon;
GRANT ALL ON public.cms_reusable_blocks TO service_role;
ALTER TABLE public.cms_reusable_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY cms_rb_public_read ON public.cms_reusable_blocks FOR SELECT USING (workflow_state='published' AND deleted_at IS NULL);
CREATE POLICY cms_rb_manage ON public.cms_reusable_blocks FOR ALL TO authenticated USING (public.cms_can_manage()) WITH CHECK (public.cms_can_manage());
CREATE TRIGGER cms_reusable_blocks_touch BEFORE UPDATE ON public.cms_reusable_blocks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.cms_global_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE, label text NOT NULL, component_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  workflow_state public.cms_workflow_state NOT NULL DEFAULT 'published',
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_global_components TO authenticated;
GRANT SELECT ON public.cms_global_components TO anon;
GRANT ALL ON public.cms_global_components TO service_role;
ALTER TABLE public.cms_global_components ENABLE ROW LEVEL SECURITY;
CREATE POLICY cms_gc_public_read ON public.cms_global_components FOR SELECT USING (workflow_state='published' AND deleted_at IS NULL);
CREATE POLICY cms_gc_manage ON public.cms_global_components FOR ALL TO authenticated USING (public.cms_can_manage()) WITH CHECK (public.cms_can_manage());
CREATE TRIGGER cms_global_components_touch BEFORE UPDATE ON public.cms_global_components FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.cms_design_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE, tokens jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cms_design_tokens TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_design_tokens TO authenticated;
GRANT ALL ON public.cms_design_tokens TO service_role;
ALTER TABLE public.cms_design_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY cms_dt_public_read ON public.cms_design_tokens FOR SELECT USING (true);
CREATE POLICY cms_dt_manage ON public.cms_design_tokens FOR ALL TO authenticated USING (public.cms_can_manage()) WITH CHECK (public.cms_can_manage());
CREATE TRIGGER cms_design_tokens_touch BEFORE UPDATE ON public.cms_design_tokens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.cms_theme_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE, label text NOT NULL,
  tokens jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cms_theme_presets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_theme_presets TO authenticated;
GRANT ALL ON public.cms_theme_presets TO service_role;
ALTER TABLE public.cms_theme_presets ENABLE ROW LEVEL SECURITY;
CREATE POLICY cms_tp_public_read ON public.cms_theme_presets FOR SELECT USING (true);
CREATE POLICY cms_tp_manage ON public.cms_theme_presets FOR ALL TO authenticated USING (public.cms_can_manage()) WITH CHECK (public.cms_can_manage());
CREATE TRIGGER cms_theme_presets_touch BEFORE UPDATE ON public.cms_theme_presets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.cms_category_layouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.project_categories(id) ON DELETE CASCADE,
  blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  allowed_blocks text[] NOT NULL DEFAULT '{}', locked_blocks text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category_id)
);
GRANT SELECT ON public.cms_category_layouts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_category_layouts TO authenticated;
GRANT ALL ON public.cms_category_layouts TO service_role;
ALTER TABLE public.cms_category_layouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY cms_cl_public_read ON public.cms_category_layouts FOR SELECT USING (true);
CREATE POLICY cms_cl_manage ON public.cms_category_layouts FOR ALL TO authenticated USING (public.cms_can_manage()) WITH CHECK (public.cms_can_manage());
CREATE TRIGGER cms_category_layouts_touch BEFORE UPDATE ON public.cms_category_layouts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.cms_category_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.project_categories(id) ON DELETE CASCADE,
  default_methodology jsonb NOT NULL DEFAULT '[]'::jsonb,
  default_cta jsonb NOT NULL DEFAULT '{}'::jsonb,
  default_seo jsonb NOT NULL DEFAULT '{}'::jsonb,
  default_related_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category_id)
);
GRANT SELECT ON public.cms_category_templates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_category_templates TO authenticated;
GRANT ALL ON public.cms_category_templates TO service_role;
ALTER TABLE public.cms_category_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY cms_ct_public_read ON public.cms_category_templates FOR SELECT USING (true);
CREATE POLICY cms_ct_manage ON public.cms_category_templates FOR ALL TO authenticated USING (public.cms_can_manage()) WITH CHECK (public.cms_can_manage());
CREATE TRIGGER cms_category_templates_touch BEFORE UPDATE ON public.cms_category_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.cms_navigations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location public.cms_nav_location NOT NULL UNIQUE, label text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cms_navigations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_navigations TO authenticated;
GRANT ALL ON public.cms_navigations TO service_role;
ALTER TABLE public.cms_navigations ENABLE ROW LEVEL SECURITY;
CREATE POLICY cms_nav_public_read ON public.cms_navigations FOR SELECT USING (true);
CREATE POLICY cms_nav_manage ON public.cms_navigations FOR ALL TO authenticated USING (public.cms_can_manage()) WITH CHECK (public.cms_can_manage());
CREATE TRIGGER cms_navigations_touch BEFORE UPDATE ON public.cms_navigations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.cms_navigation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  navigation_id uuid NOT NULL REFERENCES public.cms_navigations(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.cms_navigation_items(id) ON DELETE CASCADE,
  label_ar text NOT NULL, label_en text NOT NULL,
  entity_type text, entity_id uuid, href text, icon text,
  visibility_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order int NOT NULL DEFAULT 0, is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cms_navigation_items_nav_idx ON public.cms_navigation_items (navigation_id, parent_id, sort_order);
GRANT SELECT ON public.cms_navigation_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_navigation_items TO authenticated;
GRANT ALL ON public.cms_navigation_items TO service_role;
ALTER TABLE public.cms_navigation_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY cms_ni_public_read ON public.cms_navigation_items FOR SELECT USING (is_hidden = false);
CREATE POLICY cms_ni_manage ON public.cms_navigation_items FOR ALL TO authenticated USING (public.cms_can_manage()) WITH CHECK (public.cms_can_manage());
CREATE TRIGGER cms_navigation_items_touch BEFORE UPDATE ON public.cms_navigation_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.cms_nav_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL, entity_id uuid NOT NULL,
  suggested_label_ar text, suggested_label_en text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  handled_at timestamptz,
  UNIQUE (entity_type, entity_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_nav_suggestions TO authenticated;
GRANT ALL ON public.cms_nav_suggestions TO service_role;
ALTER TABLE public.cms_nav_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY cms_ns_manage ON public.cms_nav_suggestions FOR ALL TO authenticated USING (public.cms_can_manage()) WITH CHECK (public.cms_can_manage());

CREATE TABLE IF NOT EXISTS public.cms_media_usages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
  entity_type text NOT NULL, entity_id uuid NOT NULL, field_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (asset_id, entity_type, entity_id, field_path)
);
CREATE INDEX IF NOT EXISTS cms_media_usages_asset_idx ON public.cms_media_usages (asset_id);
CREATE INDEX IF NOT EXISTS cms_media_usages_entity_idx ON public.cms_media_usages (entity_type, entity_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_media_usages TO authenticated;
GRANT ALL ON public.cms_media_usages TO service_role;
ALTER TABLE public.cms_media_usages ENABLE ROW LEVEL SECURITY;
CREATE POLICY cms_mu_manage ON public.cms_media_usages FOR ALL TO authenticated USING (public.cms_can_manage()) WITH CHECK (public.cms_can_manage());

CREATE TABLE IF NOT EXISTS public.cms_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_entity_type text NOT NULL, from_entity_id uuid NOT NULL, from_field text,
  to_entity_type text NOT NULL, to_entity_id uuid NOT NULL,
  kind public.cms_dependency_kind NOT NULL DEFAULT 'reference',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (from_entity_type, from_entity_id, from_field, to_entity_type, to_entity_id)
);
CREATE INDEX IF NOT EXISTS cms_dependencies_from_idx ON public.cms_dependencies (from_entity_type, from_entity_id);
CREATE INDEX IF NOT EXISTS cms_dependencies_to_idx ON public.cms_dependencies (to_entity_type, to_entity_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_dependencies TO authenticated;
GRANT ALL ON public.cms_dependencies TO service_role;
ALTER TABLE public.cms_dependencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY cms_dep_manage ON public.cms_dependencies FOR ALL TO authenticated USING (public.cms_can_manage()) WITH CHECK (public.cms_can_manage());

CREATE TABLE IF NOT EXISTS public.cms_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE, label text NOT NULL, description text,
  success_message_ar text, success_message_en text,
  notification_emails text[] NOT NULL DEFAULT '{}',
  webhook_url text, webhook_secret text,
  create_lead boolean NOT NULL DEFAULT true,
  workflow_state public.cms_workflow_state NOT NULL DEFAULT 'published',
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cms_forms TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_forms TO authenticated;
GRANT ALL ON public.cms_forms TO service_role;
ALTER TABLE public.cms_forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY cms_forms_public_read ON public.cms_forms FOR SELECT USING (workflow_state='published' AND deleted_at IS NULL);
CREATE POLICY cms_forms_manage ON public.cms_forms FOR ALL TO authenticated USING (public.cms_can_manage()) WITH CHECK (public.cms_can_manage());
CREATE TRIGGER cms_forms_touch BEFORE UPDATE ON public.cms_forms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.cms_form_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES public.cms_forms(id) ON DELETE CASCADE,
  key text NOT NULL, field_type text NOT NULL,
  label_ar text, label_en text, placeholder_ar text, placeholder_en text,
  required boolean NOT NULL DEFAULT false,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  validation jsonb NOT NULL DEFAULT '{}'::jsonb,
  conditional jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (form_id, key)
);
GRANT SELECT ON public.cms_form_fields TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_form_fields TO authenticated;
GRANT ALL ON public.cms_form_fields TO service_role;
ALTER TABLE public.cms_form_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY cms_ff_public_read ON public.cms_form_fields FOR SELECT USING (true);
CREATE POLICY cms_ff_manage ON public.cms_form_fields FOR ALL TO authenticated USING (public.cms_can_manage()) WITH CHECK (public.cms_can_manage());
CREATE TRIGGER cms_form_fields_touch BEFORE UPDATE ON public.cms_form_fields FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.cms_form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES public.cms_forms(id) ON DELETE CASCADE,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address inet, user_agent text, referrer text, lead_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cms_form_submissions_form_idx ON public.cms_form_submissions (form_id, created_at DESC);
GRANT SELECT ON public.cms_form_submissions TO authenticated;
GRANT ALL ON public.cms_form_submissions TO service_role;
ALTER TABLE public.cms_form_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY cms_fs_read ON public.cms_form_submissions FOR SELECT TO authenticated USING (public.cms_can_manage());

CREATE TABLE IF NOT EXISTS public.crm_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text, company text, email text, phone text,
  budget text, timeline text, service text, message text, notes text,
  status public.crm_lead_status NOT NULL DEFAULT 'new',
  follow_up_date date, meeting_date timestamptz,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  source_form_id uuid REFERENCES public.cms_forms(id) ON DELETE SET NULL,
  source_submission_id uuid REFERENCES public.cms_form_submissions(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS crm_leads_status_idx ON public.crm_leads (status, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_leads TO authenticated;
GRANT ALL ON public.crm_leads TO service_role;
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY crm_leads_manage ON public.crm_leads FOR ALL TO authenticated USING (public.cms_can_manage()) WITH CHECK (public.cms_can_manage());
CREATE TRIGGER crm_leads_touch BEFORE UPDATE ON public.crm_leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.cms_form_submissions DROP CONSTRAINT IF EXISTS cms_form_submissions_lead_fk;
ALTER TABLE public.cms_form_submissions
  ADD CONSTRAINT cms_form_submissions_lead_fk FOREIGN KEY (lead_id) REFERENCES public.crm_leads(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.cms_backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL, storage_path text, size_bytes bigint, checksum text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_backups TO authenticated;
GRANT ALL ON public.cms_backups TO service_role;
ALTER TABLE public.cms_backups ENABLE ROW LEVEL SECURITY;
CREATE POLICY cms_backups_admin ON public.cms_backups FOR ALL TO authenticated USING (public.cms_is_admin()) WITH CHECK (public.cms_is_admin());

CREATE TABLE IF NOT EXISTS public.cms_related_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_entity_type text NOT NULL, source_entity_id uuid NOT NULL,
  target_entity_type text NOT NULL, target_entity_id uuid NOT NULL,
  relation_type text NOT NULL DEFAULT 'auto',
  score numeric, is_manual boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_entity_type, source_entity_id, target_entity_type, target_entity_id)
);
CREATE INDEX IF NOT EXISTS cms_rc_source_idx ON public.cms_related_content (source_entity_type, source_entity_id, score DESC);
GRANT SELECT ON public.cms_related_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_related_content TO authenticated;
GRANT ALL ON public.cms_related_content TO service_role;
ALTER TABLE public.cms_related_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY cms_rc_public_read ON public.cms_related_content FOR SELECT USING (true);
CREATE POLICY cms_rc_manage ON public.cms_related_content FOR ALL TO authenticated USING (public.cms_can_manage()) WITH CHECK (public.cms_can_manage());
CREATE TRIGGER cms_related_content_touch BEFORE UPDATE ON public.cms_related_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DO $$ DECLARE t text; tables text[] := ARRAY[
  'portfolio_projects','insight_articles','services','project_categories','insight_categories',
  'pages','testimonials','site_menus','site_sections','media_assets'
]; BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS workflow_state public.cms_workflow_state NOT NULL DEFAULT ''draft''', t);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS deleted_at timestamptz', t);
  END LOOP;
END $$;

-- Backfill workflow_state from legacy status columns using ::text for enum safety
UPDATE public.portfolio_projects SET workflow_state='published' WHERE status::text='published' AND workflow_state='draft';
UPDATE public.portfolio_projects SET workflow_state='archived' WHERE status::text='archived' AND workflow_state='draft';
UPDATE public.insight_articles SET workflow_state='published' WHERE status::text='published' AND workflow_state='draft';
UPDATE public.services SET workflow_state='published' WHERE status::text='published' AND workflow_state='draft';
UPDATE public.pages SET workflow_state='published' WHERE status::text='published' AND workflow_state='draft';
UPDATE public.pages SET workflow_state='archived' WHERE status::text='archived' AND workflow_state='draft';

ALTER TABLE public.portfolio_projects
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_homepage_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_best_work boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_award_winner boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_recommended boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS highlight_sort int NOT NULL DEFAULT 0;

UPDATE public.portfolio_projects SET is_featured = true WHERE featured = true AND is_featured = false;

CREATE OR REPLACE FUNCTION public.cms_write_revision()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_entity_type text := TG_ARGV[0]; v_version int; v_state public.cms_revision_state;
BEGIN
  SELECT COALESCE(MAX(version_number),0) + 1 INTO v_version
  FROM public.cms_revisions WHERE entity_type = v_entity_type AND entity_id = NEW.id;
  v_state := CASE
    WHEN TG_OP = 'INSERT' THEN 'draft'::public.cms_revision_state
    WHEN (to_jsonb(NEW)->>'workflow_state') = 'published' THEN 'published'::public.cms_revision_state
    ELSE 'checkpoint'::public.cms_revision_state
  END;
  INSERT INTO public.cms_revisions (entity_type, entity_id, version_number, author_id, snapshot, state)
  VALUES (v_entity_type, NEW.id, v_version, auth.uid(), to_jsonb(NEW), v_state);
  RETURN NEW;
END; $$;

DO $$ DECLARE tt text; kk text; tables text[][] := ARRAY[
  ARRAY['portfolio_projects','project'],
  ARRAY['insight_articles','article'],
  ARRAY['services','service'],
  ARRAY['project_categories','category'],
  ARRAY['pages','page'],
  ARRAY['testimonials','testimonial'],
  ARRAY['cms_reusable_blocks','reusable_block'],
  ARRAY['cms_global_components','global_component'],
  ARRAY['cms_forms','form'],
  ARRAY['cms_category_layouts','category_layout'],
  ARRAY['cms_category_templates','category_template']
]; BEGIN
  FOR i IN 1..array_length(tables,1) LOOP
    tt := tables[i][1]; kk := tables[i][2];
    EXECUTE format('DROP TRIGGER IF EXISTS %I_write_revision ON public.%I', kk, tt);
    EXECUTE format('CREATE TRIGGER %I_write_revision AFTER INSERT OR UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.cms_write_revision(%L)', kk, tt, kk);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.cms_suggest_nav_item()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_entity_type text := TG_ARGV[0]; v_row jsonb := to_jsonb(NEW); v_ar text; v_en text;
BEGIN
  v_ar := COALESCE(v_row->>'name_ar', v_row->>'title_ar');
  v_en := COALESCE(v_row->>'name_en', v_row->>'title_en');
  INSERT INTO public.cms_nav_suggestions (entity_type, entity_id, suggested_label_ar, suggested_label_en)
  VALUES (v_entity_type, NEW.id, v_ar, v_en)
  ON CONFLICT (entity_type, entity_id) DO NOTHING;
  RETURN NEW;
END; $$;

DO $$ DECLARE tt text; kk text; tables text[][] := ARRAY[
  ARRAY['portfolio_projects','project'],
  ARRAY['insight_articles','article'],
  ARRAY['services','service'],
  ARRAY['project_categories','category'],
  ARRAY['pages','page']
]; BEGIN
  FOR i IN 1..array_length(tables,1) LOOP
    tt := tables[i][1]; kk := tables[i][2];
    EXECUTE format('DROP TRIGGER IF EXISTS %I_suggest_nav ON public.%I', kk, tt);
    EXECUTE format('CREATE TRIGGER %I_suggest_nav AFTER INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION public.cms_suggest_nav_item(%L)', kk, tt, kk);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.cms_form_submission_to_lead()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_create boolean; v_lead_id uuid; v_p jsonb := NEW.payload;
BEGIN
  SELECT create_lead INTO v_create FROM public.cms_forms WHERE id = NEW.form_id;
  IF COALESCE(v_create, false) THEN
    INSERT INTO public.crm_leads (name, company, email, phone, budget, timeline, service, message, source_form_id, source_submission_id, metadata)
    VALUES (v_p->>'name', v_p->>'company', v_p->>'email', v_p->>'phone', v_p->>'budget', v_p->>'timeline', v_p->>'service', v_p->>'message', NEW.form_id, NEW.id, v_p)
    RETURNING id INTO v_lead_id;
    UPDATE public.cms_form_submissions SET lead_id = v_lead_id WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS cms_form_submissions_to_lead ON public.cms_form_submissions;
CREATE TRIGGER cms_form_submissions_to_lead AFTER INSERT ON public.cms_form_submissions FOR EACH ROW EXECUTE FUNCTION public.cms_form_submission_to_lead();

INSERT INTO public.cms_entity_types (key, label, table_name, slug_column, has_i18n, preview_path_template, icon, sort_order) VALUES
  ('project','Projects','portfolio_projects','slug', true, '/preview/projects/{id}', 'folder-open', 10),
  ('category','Project Categories','project_categories','slug', true, '/projects/{slug}', 'layout-grid', 20),
  ('article','Articles','insight_articles','slug', true, '/insights/{category_slug}/{slug}', 'newspaper', 30),
  ('service','Services','services','slug', true, null, 'briefcase', 40),
  ('page','Pages','pages','slug', true, '/{slug}', 'file-text', 50),
  ('testimonial','Testimonials','testimonials',null, true, null, 'quote', 60),
  ('reusable_block','Reusable Blocks','cms_reusable_blocks','key', false, null, 'blocks', 70),
  ('global_component','Global Components','cms_global_components','key', false, null, 'component', 80),
  ('form','Forms','cms_forms','key', false, null, 'form-input', 90),
  ('lead','Leads','crm_leads',null, false, null, 'users', 100),
  ('media','Media','media_assets',null, false, null, 'image', 110),
  ('navigation','Navigation','cms_navigations',null, false, null, 'menu', 120),
  ('theme','Themes','cms_theme_presets','key', false, null, 'palette', 130)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.cms_workflow_transitions (role_key, from_state, to_state) VALUES
  ('admin','draft','in_review'), ('admin','draft','approved'), ('admin','draft','published'), ('admin','draft','archived'),
  ('admin','in_review','draft'), ('admin','in_review','approved'), ('admin','in_review','published'), ('admin','in_review','archived'),
  ('admin','approved','draft'), ('admin','approved','in_review'), ('admin','approved','published'), ('admin','approved','archived'),
  ('admin','published','draft'), ('admin','published','in_review'), ('admin','published','archived'),
  ('admin','archived','draft'), ('admin','archived','in_review'), ('admin','archived','published'),
  ('editor','draft','in_review'), ('editor','draft','published'), ('editor','draft','archived'),
  ('editor','in_review','draft'), ('editor','in_review','approved'), ('editor','in_review','published'),
  ('editor','approved','published'), ('editor','approved','draft'),
  ('editor','published','draft'), ('editor','published','archived'), ('editor','archived','draft'),
  ('reviewer','in_review','draft'), ('reviewer','in_review','approved'), ('reviewer','approved','in_review'),
  ('author','draft','in_review'), ('author','in_review','draft')
ON CONFLICT (role_key, from_state, to_state) DO NOTHING;

INSERT INTO public.cms_permissions (role_key, entity_type, actions) VALUES
  ('admin','*',   ARRAY['create','read','update','delete','publish','archive','duplicate','restore','force_delete']),
  ('editor','*',  ARRAY['create','read','update','delete','publish','archive','duplicate','restore']),
  ('reviewer','*',ARRAY['read','update','approve']),
  ('author','*',  ARRAY['create','read','update'])
ON CONFLICT (role_key, entity_type) DO NOTHING;

INSERT INTO public.cms_navigations (location, label) VALUES
  ('header','Header Navigation'), ('footer','Footer Navigation'),
  ('mobile','Mobile Navigation'), ('mega','Mega Menu'), ('sidebar','Sidebar Navigation')
ON CONFLICT (location) DO NOTHING;

INSERT INTO public.cms_forms (key, label, description, success_message_ar, success_message_en, notification_emails, create_lead)
VALUES ('contact','Contact Form','Primary site contact form','تم إرسال رسالتك بنجاح','Your message has been sent',ARRAY['info@yrstudio.art'], true)
ON CONFLICT (key) DO NOTHING;

WITH f AS (SELECT id FROM public.cms_forms WHERE key='contact')
INSERT INTO public.cms_form_fields (form_id, key, field_type, label_ar, label_en, required, sort_order)
SELECT f.id, k.key, k.field_type, k.label_ar, k.label_en, k.required, k.sort_order FROM f, (VALUES
  ('name','text','الاسم','Name', true, 10),
  ('email','email','البريد الإلكتروني','Email', true, 20),
  ('company','text','الشركة','Company', false, 30),
  ('phone','tel','الهاتف','Phone', false, 40),
  ('service','select','الخدمة','Service', false, 50),
  ('budget','select','الميزانية','Budget', false, 60),
  ('timeline','select','الجدول الزمني','Timeline', false, 70),
  ('message','textarea','الرسالة','Message', true, 80)
) k(key, field_type, label_ar, label_en, required, sort_order)
ON CONFLICT (form_id, key) DO NOTHING;

INSERT INTO public.cms_theme_presets (key, label, is_default, tokens) VALUES
  ('default','Default', true, '{}'::jsonb),
  ('minimal','Minimal', false, '{}'::jsonb),
  ('enterprise','Enterprise', false, '{}'::jsonb),
  ('luxury','Luxury', false, '{}'::jsonb),
  ('dark','Dark', false, '{}'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.cms_category_layouts (category_id, blocks)
SELECT id, '[]'::jsonb FROM public.project_categories ON CONFLICT (category_id) DO NOTHING;

INSERT INTO public.cms_category_templates (category_id)
SELECT id FROM public.project_categories ON CONFLICT (category_id) DO NOTHING;
