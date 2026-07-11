-- 1. Private schema (not exposed via the Data API)
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

-- 2. Recreate has_role in the private schema
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 3. Rewire public policies
DROP POLICY IF EXISTS "Admins manage categories" ON public.insight_categories;
CREATE POLICY "Admins manage categories" ON public.insight_categories
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can read all articles" ON public.insight_articles;
CREATE POLICY "Admins can read all articles" ON public.insight_articles
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can insert articles" ON public.insight_articles;
CREATE POLICY "Admins can insert articles" ON public.insight_articles
  FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can update articles" ON public.insight_articles;
CREATE POLICY "Admins can update articles" ON public.insight_articles
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can delete articles" ON public.insight_articles;
CREATE POLICY "Admins can delete articles" ON public.insight_articles
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- 4. Rewire storage policies
DROP POLICY IF EXISTS "Admins upload insight covers" ON storage.objects;
CREATE POLICY "Admins upload insight covers" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'insights-covers' AND private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins update insight covers" ON storage.objects;
CREATE POLICY "Admins update insight covers" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'insights-covers' AND private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins delete insight covers" ON storage.objects;
CREATE POLICY "Admins delete insight covers" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'insights-covers' AND private.has_role(auth.uid(), 'admin'::public.app_role));

-- 5. Drop the public SECURITY DEFINER functions
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.bootstrap_admin();