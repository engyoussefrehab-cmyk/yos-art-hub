
CREATE POLICY "cms_buckets_admin_all" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id IN ('media-library','portfolio-covers','service-covers','site-branding')
    AND (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'))
  )
  WITH CHECK (
    bucket_id IN ('media-library','portfolio-covers','service-covers','site-branding')
    AND (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'))
  );
