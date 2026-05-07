-- Ejecuta esto solo si supabase_diagnostics.sql muestra usuarios de Auth
-- que no existen en public.users. No borra datos.

INSERT INTO public.users (id, full_name, avatar_url)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  au.raw_user_meta_data->>'avatar_url'
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
WHERE pu.id IS NULL;
