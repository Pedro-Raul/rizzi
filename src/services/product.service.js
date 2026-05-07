import { supabase } from '../utils/supabaseClient';

export const productService = {
  // Obtener todos los productos de un negocio específico
  async getBusinessProducts(businessId) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Crear un nuevo producto
  async createProduct(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select();

    return { data, error };
  },

  // Actualizar un producto existente
  async updateProduct(productId, productData) {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', productId)
      .select();

    return { data, error };
  },

  // Eliminar (o desactivar) un producto
  async deleteProduct(productId) {
    // Para el MVP los eliminamos físicamente
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    return { error };
  }
};
