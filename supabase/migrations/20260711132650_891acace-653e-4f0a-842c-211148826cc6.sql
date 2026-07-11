
-- Public read (for SEO/social sharing of cover images)
CREATE POLICY "Public can view insight covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'insights-covers');

-- Admin write/update/delete
CREATE POLICY "Admins upload insight covers"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'insights-covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update insight covers"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'insights-covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete insight covers"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'insights-covers' AND public.has_role(auth.uid(), 'admin'));
