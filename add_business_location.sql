-- Añadir columnas de geolocalización a la tabla de negocios
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
