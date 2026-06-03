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
        businesses ( id, name ),
        users ( full_name, email ),
        order_items ( id, product_id, product_name, quantity, price )
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async getUserOrders(userId) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        businesses ( id, name, logo_url, phone, whatsapp_url ),
        order_items ( id, product_id, product_name, quantity, price )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async getOrderCountsByBusinessIds(businessIds) {
    if (!Array.isArray(businessIds) || businessIds.length === 0) {
      return { data: {}, error: null };
    }

    const { data, error } = await supabase
      .from('orders')
      .select('business_id, status')
      .in('business_id', businessIds);

    if (error) {
      return { data: {}, error };
    }

    const counts = (Array.isArray(data) ? data : []).reduce((acc, order) => {
      const current = acc[order.business_id] || { total: 0, pending: 0, active: 0 };
      current.total += 1;

      if (order.status === 'pending') {
        current.pending += 1;
      }

      if (order.status === 'pending' || order.status === 'in_preparation') {
        current.active += 1;
      }

      acc[order.business_id] = current;
      return acc;
    }, {});

    return { data: counts, error: null };
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
