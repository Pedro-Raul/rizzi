-- Ejecuta este script en Supabase SQL Editor para que los usuarios con role='admin'
-- puedan revisar y eliminar contenido sin ser dueños del negocio.
-- No borra datos.

DROP POLICY IF EXISTS "Admins can view all businesses" ON public.businesses;
DROP POLICY IF EXISTS "Admins can update any business" ON public.businesses;
DROP POLICY IF EXISTS "Admins can delete any business" ON public.businesses;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update any product" ON public.products;
DROP POLICY IF EXISTS "Admins can delete any product" ON public.products;

CREATE POLICY "Admins can view all businesses"
ON public.businesses
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  )
);

CREATE POLICY "Admins can update any business"
ON public.businesses
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete any business"
ON public.businesses
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  )
);

CREATE POLICY "Admins can insert products"
ON public.products
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  )
);

CREATE POLICY "Admins can update any product"
ON public.products
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete any product"
ON public.products
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  )
);
