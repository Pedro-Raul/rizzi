-- Ejecutar en Supabase SQL Editor.
-- Sin esto, al admin le falla el DELETE de un negocio ajeno: el CASCADE intenta borrar
-- favoritos y reportes de otros usuarios y RLS lo bloquea (o no hay política DELETE en reportes).

DROP POLICY IF EXISTS "Admins can delete any favorite" ON public.favorites;
CREATE POLICY "Admins can delete any favorite"
ON public.favorites
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can delete business reports" ON public.business_reports;
CREATE POLICY "Admins can delete business reports"
ON public.business_reports
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  )
);
