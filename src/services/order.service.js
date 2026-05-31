import { supabase } from '../utils/supabaseClient';

export const orderService = {
  // Crear un nuevo pedido con sus items
  async createOrder(orderData, orderItems) {
    // 1. Crear el pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) return { error: orderError };

    // 2. Crear los items asociados al pedido
    const itemsToInsert = orderItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert);

    if (itemsError) {
      // Si falla, podríamos considerar cancelar el pedido, 
      // pero por simplicidad retornamos el error
      return { error: itemsError };
    }

    return { data: order };
  },

  // Obtener todos los pedidos de un negocio (para el panel del dueño)
  async getBusinessOrders(businessId) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        users ( full_name, email ),
        order_items ( id, product_id, product_name, quantity, price )
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Actualizar el estado de un pedido (pendiente, en preparación, entregado)
  async updateOrderStatus(orderId, newStatus) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select();

    return { data, error };
  }
};
