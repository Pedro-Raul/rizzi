-- 1. Añadir columnas a la tabla businesses para caching de ratings
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;

-- 2. Crear la tabla de reviews
CREATE TABLE public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (business_id, user_id) -- Permite solo 1 reseña por usuario por negocio
);

-- 3. Habilitar RLS en la tabla reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone." 
ON public.reviews FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own reviews." 
ON public.reviews FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews." 
ON public.reviews FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews." 
ON public.reviews FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any review." 
ON public.reviews FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- 4. Crear un trigger para actualizar el average rating en la tabla businesses
CREATE OR REPLACE FUNCTION public.update_business_rating()
RETURNS TRIGGER AS $$
DECLARE
    new_rating NUMERIC(3, 2);
    new_count INTEGER;
    b_id UUID;
BEGIN
    -- Identificar el business_id afectado (sirve para INSERT, UPDATE y DELETE)
    IF TG_OP = 'DELETE' THEN
        b_id := OLD.business_id;
    ELSE
        b_id := NEW.business_id;
    END IF;

    -- Calcular el nuevo promedio y el conteo
    SELECT COALESCE(AVG(rating), 0), COUNT(id)
    INTO new_rating, new_count
    FROM public.reviews
    WHERE business_id = b_id;

    -- Actualizar la tabla businesses
    UPDATE public.businesses
    SET rating = new_rating,
        reviews_count = new_count
    WHERE id = b_id;

    -- Actualizar el updated_at si es un UPDATE
    IF TG_OP = 'UPDATE' THEN
        NEW.updated_at = timezone('utc'::text, now());
        RETURN NEW;
    END IF;

    RETURN NULL; -- Para AFTER triggers que no necesitan modificar la fila (INSERT, DELETE)
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Adjuntar el trigger a la tabla reviews
DROP TRIGGER IF EXISTS on_review_changed ON public.reviews;
CREATE TRIGGER on_review_changed
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE PROCEDURE public.update_business_rating();
