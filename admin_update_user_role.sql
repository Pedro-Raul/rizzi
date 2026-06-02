-- Permite que un administrador cambie el rol de cualquier usuario desde la app.
-- Ejecutar en Supabase SQL Editor.

CREATE OR REPLACE FUNCTION public.admin_update_user_role(
  target_user_id UUID,
  new_role TEXT
)
RETURNS public.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_user public.users;
BEGIN
  IF new_role NOT IN ('buyer', 'seller', 'admin') THEN
    RAISE EXCEPTION 'Rol no permitido: %', new_role
      USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Solo un administrador puede cambiar roles'
      USING ERRCODE = '42501';
  END IF;

  UPDATE public.users
  SET role = new_role
  WHERE id = target_user_id
  RETURNING * INTO updated_user;

  IF updated_user.id IS NULL THEN
    RAISE EXCEPTION 'Usuario no encontrado: %', target_user_id
      USING ERRCODE = 'P0002';
  END IF;

  RETURN updated_user;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_update_user_role(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_update_user_role(UUID, TEXT) TO authenticated;

-- Evita que un usuario cambie su propio role con un update directo.
-- La politica RLS existente puede permitir actualizar el perfil propio;
-- estos permisos limitan esa actualizacion a campos no sensibles.
REVOKE UPDATE ON TABLE public.users FROM anon, authenticated;
GRANT UPDATE (full_name, avatar_url) ON TABLE public.users TO authenticated;
