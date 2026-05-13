-- Ejecutar en Supabase SQL Editor (una vez).
-- Elimina un negocio evitando bloqueos de RLS en CASCADE (favoritos, reportes, productos).
-- Solo permite: usuario admin (public.users.role = 'admin') o el dueño del negocio.

CREATE OR REPLACE FUNCTION public.delete_business_if_allowed(target_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesión.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.users WHERE id = uid AND role = 'admin') THEN
    DELETE FROM public.businesses WHERE id = target_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Negocio no encontrado.';
    END IF;
    RETURN;
  END IF;

  DELETE FROM public.businesses WHERE id = target_id AND owner_id = uid;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No tienes permiso para eliminar este negocio.';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_business_if_allowed(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_business_if_allowed(uuid) TO authenticated;

COMMENT ON FUNCTION public.delete_business_if_allowed(uuid) IS
  'Borra negocio si el llamante es admin o dueño; bypass RLS en cascada.';
