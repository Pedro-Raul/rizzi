-- Ejecutar en Supabase SQL Editor (una vez) si la tabla categories está vacía.
-- Idempotente: no duplica por slug.

INSERT INTO public.categories (name, slug, icon_url) VALUES
  ('Alimentación y bebidas', 'alimentacion-bebidas', null),
  ('Arte y manualidades', 'arte-manualidades', null),
  ('Belleza y cuidado personal', 'belleza', null),
  ('Moda y accesorios', 'moda', null),
  ('Hogar y decoración', 'hogar', null),
  ('Tecnología', 'tecnologia', null),
  ('Servicios profesionales', 'servicios', null),
  ('Salud y bienestar', 'salud', null),
  ('Mascotas', 'mascotas', null),
  ('Papelería y regalos', 'papeleria-regalos', null),
  ('Deportes y recreación', 'deportes', null),
  ('Educación y cursos', 'educacion', null),
  ('Automotriz', 'automotriz', null),
  ('Construcción y ferretería', 'construccion', null),
  ('Eventos y entretenimiento', 'eventos', null),
  ('Otros', 'otros', null)
ON CONFLICT (slug) DO NOTHING;
