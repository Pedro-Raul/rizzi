-- Añadir columna theme_color a la tabla businesses
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS theme_color TEXT;
