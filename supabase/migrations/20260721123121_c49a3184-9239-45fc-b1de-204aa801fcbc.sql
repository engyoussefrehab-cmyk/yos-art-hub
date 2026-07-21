
CREATE TABLE public.client_logos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text NOT NULL,
  href text,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.client_logos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_logos TO authenticated;
GRANT ALL ON public.client_logos TO service_role;

ALTER TABLE public.client_logos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read visible client logos"
  ON public.client_logos FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Admins read all client logos"
  ON public.client_logos FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert client logos"
  ON public.client_logos FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update client logos"
  ON public.client_logos FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete client logos"
  ON public.client_logos FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_client_logos_updated_at
  BEFORE UPDATE ON public.client_logos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.client_logos (name, logo_url, sort_order) VALUES
('ARAMCO','data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20200%2060%22%3E%3Ctext%20x%3D%22100%22%20y%3D%2238%22%20text-anchor%3D%22middle%22%20font-family%3D%22Inter%2CArial%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%2226%22%20letter-spacing%3D%224%22%20fill%3D%22white%22%3EARAMCO%3C/text%3E%3C/svg%3E',10),
('STC','data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20200%2060%22%3E%3Ctext%20x%3D%22100%22%20y%3D%2238%22%20text-anchor%3D%22middle%22%20font-family%3D%22Inter%2CArial%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%2226%22%20letter-spacing%3D%224%22%20fill%3D%22white%22%3ESTC%3C/text%3E%3C/svg%3E',20),
('NEOM','data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20200%2060%22%3E%3Ctext%20x%3D%22100%22%20y%3D%2238%22%20text-anchor%3D%22middle%22%20font-family%3D%22Inter%2CArial%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%2226%22%20letter-spacing%3D%224%22%20fill%3D%22white%22%3ENEOM%3C/text%3E%3C/svg%3E',30),
('ROSHN','data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20200%2060%22%3E%3Ctext%20x%3D%22100%22%20y%3D%2238%22%20text-anchor%3D%22middle%22%20font-family%3D%22Inter%2CArial%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%2226%22%20letter-spacing%3D%224%22%20fill%3D%22white%22%3EROSHN%3C/text%3E%3C/svg%3E',40),
('SABIC','data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20200%2060%22%3E%3Ctext%20x%3D%22100%22%20y%3D%2238%22%20text-anchor%3D%22middle%22%20font-family%3D%22Inter%2CArial%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%2226%22%20letter-spacing%3D%224%22%20fill%3D%22white%22%3ESABIC%3C/text%3E%3C/svg%3E',50),
('TABBY','data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20200%2060%22%3E%3Ctext%20x%3D%22100%22%20y%3D%2238%22%20text-anchor%3D%22middle%22%20font-family%3D%22Inter%2CArial%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%2226%22%20letter-spacing%3D%224%22%20fill%3D%22white%22%3ETABBY%3C/text%3E%3C/svg%3E',60),
('TAMARA','data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20200%2060%22%3E%3Ctext%20x%3D%22100%22%20y%3D%2238%22%20text-anchor%3D%22middle%22%20font-family%3D%22Inter%2CArial%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%2226%22%20letter-spacing%3D%224%22%20fill%3D%22white%22%3ETAMARA%3C/text%3E%3C/svg%3E',70),
('NOON','data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20200%2060%22%3E%3Ctext%20x%3D%22100%22%20y%3D%2238%22%20text-anchor%3D%22middle%22%20font-family%3D%22Inter%2CArial%2Csans-serif%22%20font-weight%3D%22800%22%20font-size%3D%2226%22%20letter-spacing%3D%224%22%20fill%3D%22white%22%3ENOON%3C/text%3E%3C/svg%3E',80);
