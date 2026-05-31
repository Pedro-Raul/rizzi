-- Añadir columna de puntos de entrega a negocios
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS delivery_points TEXT[] DEFAULT '{}'::TEXT[];

-- Crear tabla de pedidos
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_preparation', 'delivered', 'cancelled')),
    total NUMERIC NOT NULL DEFAULT 0,
    delivery_point TEXT,
    customer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla de items del pedido
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Políticas para orders
-- Clientes pueden ver sus propios pedidos
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT
USING (auth.uid() = user_id);

-- Clientes pueden insertar (crear) sus pedidos
CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Dueños de negocios pueden ver los pedidos de su negocio
CREATE POLICY "Owners can view their business orders" ON public.orders FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
);

-- Dueños de negocios pueden actualizar los pedidos de su negocio (ej. cambiar status)
CREATE POLICY "Owners can update their business orders" ON public.orders FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
);

-- Políticas para order_items
-- Clientes pueden ver items de sus pedidos
CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);

-- Clientes pueden insertar items en sus pedidos
CREATE POLICY "Users can create their own order items" ON public.order_items FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);

-- Dueños pueden ver los items de los pedidos de su negocio
CREATE POLICY "Owners can view items of their business orders" ON public.order_items FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.orders o JOIN public.businesses b ON o.business_id = b.id WHERE o.id = order_id AND b.owner_id = auth.uid())
);
