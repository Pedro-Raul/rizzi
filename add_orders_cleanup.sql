-- 1. Políticas de eliminación (DELETE) para orders
-- Permite que los dueños de negocios eliminen los pedidos de su propio negocio
CREATE POLICY "Owners can delete their business orders" ON public.orders FOR DELETE
USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
);

-- Permite que los clientes eliminen sus propios pedidos si lo desean
CREATE POLICY "Users can delete their own orders" ON public.orders FOR DELETE
USING (auth.uid() = user_id);

-- 2. Función para limpiar automáticamente pedidos resueltos (entregados o cancelados) hace más de 15 días
CREATE OR REPLACE FUNCTION public.purge_old_orders()
RETURNS trigger AS $$
BEGIN
  DELETE FROM public.orders
  WHERE status IN ('delivered', 'cancelled')
    AND updated_at < (now() - INTERVAL '15 days');
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger para ejecutar la limpieza después de cualquier inserción o actualización en la tabla orders
CREATE OR REPLACE TRIGGER trigger_purge_old_orders
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.purge_old_orders();
