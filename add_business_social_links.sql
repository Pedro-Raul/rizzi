-- Ejecuta este script en Supabase SQL Editor para permitir redes sociales opcionales
-- en los negocios existentes. No borra datos.

ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS tiktok_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_url TEXT;
