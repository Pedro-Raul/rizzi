-- 0. Limpiar tablas y funciones existentes para evitar errores si ya se ejecutó antes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.favorites CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.businesses CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 1. Habilitar la extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Crear tabla de perfiles de usuario
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    role TEXT CHECK (role IN ('buyer', 'seller', 'admin')) DEFAULT 'buyer',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

-- 3. Crear tabla de categorías
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone." ON public.categories FOR SELECT USING (true);

-- 4. Crear tabla de negocios
CREATE TABLE public.businesses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    instagram_url TEXT,
    facebook_url TEXT,
    tiktok_url TEXT,
    website_url TEXT,
    whatsapp_url TEXT,
    address TEXT,
    phone TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved businesses are viewable by everyone." ON public.businesses FOR SELECT USING (is_approved = true OR auth.uid() = owner_id);
CREATE POLICY "Users can insert their own business." ON public.businesses FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update their own business." ON public.businesses FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete their own business." ON public.businesses FOR DELETE USING (auth.uid() = owner_id);
CREATE POLICY "Admins can view all businesses" ON public.businesses FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update any business" ON public.businesses FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete any business" ON public.businesses FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- 5. Crear tabla de productos
CREATE TABLE public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone." ON public.products FOR SELECT USING (true);

CREATE POLICY "Owners can insert products" ON public.products FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
);

CREATE POLICY "Owners can update products" ON public.products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
);

CREATE POLICY "Owners can delete products" ON public.products FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
);
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update any product" ON public.products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete any product" ON public.products FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- 6. Crear tabla de favoritos
CREATE TABLE public.favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, business_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own favorites." ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own favorites." ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites." ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- 7. Configurar Storage para imágenes públicas
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-images', 'public-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public images are viewable by everyone." ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload public images." ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update public images." ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete public images." ON storage.objects;

CREATE POLICY "Public images are viewable by everyone."
ON storage.objects FOR SELECT
USING (bucket_id = 'public-images');

CREATE POLICY "Authenticated users can upload public images."
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'public-images'
  AND auth.role() = 'authenticated'
  AND (
    name LIKE 'businesses/logos/%'
    OR name LIKE 'businesses/banners/%'
    OR name LIKE 'products/images/%'
  )
);

CREATE POLICY "Authenticated users can update public images."
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'public-images'
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'public-images'
  AND auth.role() = 'authenticated'
  AND (
    name LIKE 'businesses/logos/%'
    OR name LIKE 'businesses/banners/%'
    OR name LIKE 'products/images/%'
  )
);

CREATE POLICY "Authenticated users can delete public images."
ON storage.objects FOR DELETE
USING (
  bucket_id = 'public-images'
  AND auth.role() = 'authenticated'
);

-- 8. Trigger para crear perfil automáticamente al registrarse en Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
