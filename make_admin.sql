-- Reemplaza el correo por el tuyo y ejecuta este script en Supabase SQL Editor.
-- No crea una cuenta de Auth nueva: convierte una cuenta existente en admin.

WITH selected_user AS (
  SELECT id, email, raw_user_meta_data
  FROM auth.users
  WHERE email = 'pedroarellano2509@gmail.com'
)
INSERT INTO public.users (id, full_name, avatar_url, role)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'full_name', email),
  raw_user_meta_data->>'avatar_url',
  'admin'
FROM selected_user
ON CONFLICT (id)
DO UPDATE SET role = 'admin';

SELECT id, full_name, role
FROM public.users
WHERE role = 'admin';
