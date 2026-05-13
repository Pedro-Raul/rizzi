-- Ejecutar en Supabase SQL Editor (después de add_business_neighborhood.sql).
-- Conteos públicos respetando RLS del rol que llama (anon ve solo negocios aprobados).

CREATE OR REPLACE FUNCTION public.public_platform_stats()
RETURNS json
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT json_build_object(
    'businesses', (
      SELECT COUNT(*)::int
      FROM public.businesses
      WHERE is_approved = true
    ),
    'users', (
      SELECT COUNT(*)::int
      FROM public.users
    ),
    'neighborhoods', (
      SELECT COALESCE(COUNT(*)::int, 0)
      FROM (
        SELECT DISTINCT TRIM(BOTH FROM neighborhood) AS n
        FROM public.businesses
        WHERE is_approved = true
          AND neighborhood IS NOT NULL
          AND TRIM(BOTH FROM neighborhood) <> ''
      ) s
    )
  );
$$;

REVOKE ALL ON FUNCTION public.public_platform_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_platform_stats() TO anon;
GRANT EXECUTE ON FUNCTION public.public_platform_stats() TO authenticated;

COMMENT ON FUNCTION public.public_platform_stats() IS 'Conteo negocios aprobados, usuarios y barrios distintos con dato de barrio.';
