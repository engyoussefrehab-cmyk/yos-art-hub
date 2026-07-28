ALTER TABLE public.portfolio_projects ADD COLUMN IF NOT EXISTS client_logo_url text;

CREATE TABLE IF NOT EXISTS public.projects_page_stats (
  id text PRIMARY KEY DEFAULT 'default',
  projects_count integer NOT NULL DEFAULT 0,
  countries_count integer NOT NULL DEFAULT 0,
  sectors_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.projects_page_stats TO anon;
GRANT SELECT, INSERT, UPDATE ON public.projects_page_stats TO authenticated;
GRANT ALL ON public.projects_page_stats TO service_role;

ALTER TABLE public.projects_page_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read project stats"
  ON public.projects_page_stats FOR SELECT USING (true);

CREATE POLICY "CMS users can insert project stats"
  ON public.projects_page_stats FOR INSERT TO authenticated
  WITH CHECK (public.cms_can_manage());

CREATE POLICY "CMS users can update project stats"
  ON public.projects_page_stats FOR UPDATE TO authenticated
  USING (public.cms_can_manage()) WITH CHECK (public.cms_can_manage());

CREATE TRIGGER update_projects_page_stats_updated_at
  BEFORE UPDATE ON public.projects_page_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.projects_page_stats (id, projects_count, countries_count, sectors_count)
VALUES ('default', 0, 0, 0)
ON CONFLICT (id) DO NOTHING;