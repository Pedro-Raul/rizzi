-- Ejecuta este script en Supabase SQL Editor para permitir subida de imágenes
-- sin borrar datos existentes de la aplicación.

INSERT INTO storage.buckets (id, name, public)
VALUES ('public-images', 'public-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public images are viewable by everyone." ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload public images." ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update public images." ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete public images." ON storage.objects;

CREATE POLICY "Public images are viewable by everyone."
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'public-images');

CREATE POLICY "Authenticated users can upload public images."
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'public-images'
  AND (
    (storage.foldername(name))[1] = 'businesses'
    OR (storage.foldername(name))[1] = 'products'
  )
);

CREATE POLICY "Authenticated users can update public images."
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'public-images'
)
WITH CHECK (
  bucket_id = 'public-images'
  AND (
    (storage.foldername(name))[1] = 'businesses'
    OR (storage.foldername(name))[1] = 'products'
  )
);

CREATE POLICY "Authenticated users can delete public images."
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'public-images');
