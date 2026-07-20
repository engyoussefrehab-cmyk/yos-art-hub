
-- Attach universal CMS triggers to portfolio_projects so writes automatically
-- populate cms_revisions and emit cms_events. Idempotent.

DROP TRIGGER IF EXISTS trg_portfolio_projects_updated_at ON public.portfolio_projects;
CREATE TRIGGER trg_portfolio_projects_updated_at
BEFORE UPDATE ON public.portfolio_projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_portfolio_projects_revision ON public.portfolio_projects;
CREATE TRIGGER trg_portfolio_projects_revision
AFTER INSERT OR UPDATE ON public.portfolio_projects
FOR EACH ROW EXECUTE FUNCTION public.cms_write_revision('project');

DROP TRIGGER IF EXISTS trg_portfolio_projects_workflow_event ON public.portfolio_projects;
CREATE TRIGGER trg_portfolio_projects_workflow_event
AFTER INSERT OR UPDATE ON public.portfolio_projects
FOR EACH ROW EXECUTE FUNCTION public.cms_emit_workflow_event('project');

-- Handy indexes for admin list/filter
CREATE INDEX IF NOT EXISTS idx_pp_deleted_at ON public.portfolio_projects (deleted_at);
CREATE INDEX IF NOT EXISTS idx_pp_workflow_state ON public.portfolio_projects (workflow_state);
CREATE INDEX IF NOT EXISTS idx_pp_updated_at ON public.portfolio_projects (updated_at DESC);
