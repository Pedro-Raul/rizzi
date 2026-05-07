-- Ejecuta estas consultas en Supabase SQL Editor para diagnosticar el problema.
-- No borran ni modifican datos.

-- 1. Verifica que el bucket que usa la app exista y sea público.
SELECT id, name, public
FROM storage.buckets
WHERE id = 'public-images';

-- 2. Verifica que existan políticas para storage.objects sobre public-images.
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;

-- 3. Verifica si tu usuario autenticado tiene perfil en public.users.
-- Ejecuta esto estando logueado en la app no aplica aquí, pero sirve si reemplazas el id.
-- Copia el UUID de Authentication > Users en Supabase y pégalo abajo.
-- SELECT * FROM public.users WHERE id = 'PEGA_AQUI_TU_USER_ID';

-- 4. Lista usuarios de Auth que no tienen perfil público.
-- Si aparece tu cuenta, ejecuta el script fix_missing_profiles.sql.
SELECT au.id, au.email, au.raw_user_meta_data->>'full_name' AS full_name
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
WHERE pu.id IS NULL;
