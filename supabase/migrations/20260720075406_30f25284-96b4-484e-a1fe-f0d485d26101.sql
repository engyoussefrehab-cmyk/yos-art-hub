
-- Attach universal CMS triggers to the three core content tables

DROP TRIGGER IF EXISTS trg_portfolio_projects_revision ON public.portfolio_projects;
CREATE TRIGGER trg_portfolio_projects_revision
AFTER INSERT OR UPDATE ON public.portfolio_projects
FOR EACH ROW EXECUTE FUNCTION public.cms_write_revision('project');

DROP TRIGGER IF EXISTS trg_portfolio_projects_workflow ON public.portfolio_projects;
CREATE TRIGGER trg_portfolio_projects_workflow
AFTER INSERT OR UPDATE ON public.portfolio_projects
FOR EACH ROW EXECUTE FUNCTION public.cms_emit_workflow_event('project');

DROP TRIGGER IF EXISTS trg_insight_articles_revision ON public.insight_articles;
CREATE TRIGGER trg_insight_articles_revision
AFTER INSERT OR UPDATE ON public.insight_articles
FOR EACH ROW EXECUTE FUNCTION public.cms_write_revision('article');

DROP TRIGGER IF EXISTS trg_insight_articles_workflow ON public.insight_articles;
CREATE TRIGGER trg_insight_articles_workflow
AFTER INSERT OR UPDATE ON public.insight_articles
FOR EACH ROW EXECUTE FUNCTION public.cms_emit_workflow_event('article');

DROP TRIGGER IF EXISTS trg_services_revision ON public.services;
CREATE TRIGGER trg_services_revision
AFTER INSERT OR UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.cms_write_revision('service');

DROP TRIGGER IF EXISTS trg_services_workflow ON public.services;
CREATE TRIGGER trg_services_workflow
AFTER INSERT OR UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.cms_emit_workflow_event('service');

CREATE INDEX IF NOT EXISTS idx_insight_articles_deleted_at ON public.insight_articles(deleted_at);
CREATE INDEX IF NOT EXISTS idx_insight_articles_workflow ON public.insight_articles(workflow_state);
CREATE INDEX IF NOT EXISTS idx_services_deleted_at ON public.services(deleted_at);
CREATE INDEX IF NOT EXISTS idx_services_workflow ON public.services(workflow_state);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_deleted_at ON public.portfolio_projects(deleted_at);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_workflow ON public.portfolio_projects(workflow_state);
