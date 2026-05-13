-- Ejecutar en Supabase SQL Editor (una vez).
-- Barrio / zona para conteos y filtros futuros.

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS neighborhood TEXT;

COMMENT ON COLUMN public.businesses.neighborhood IS 'Barrio o zona del negocio (texto libre, para estadísticas)';
