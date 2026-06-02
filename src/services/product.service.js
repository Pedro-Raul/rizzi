import { supabase } from '../utils/supabaseClient';
import { containsBlockedLanguageInFields, createModerationError } from '../utils/moderation';

const productTextFields = (productData) => [
  productData?.name,
  productData?.description
];

export const productService = {
  // Obtener todos los productos de un negocio específico
  async getBusinessProducts(businessId, includeInactive = false) {
    let query = supabase
      .from('products')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    return { data, error };
  },

  // Crear un nuevo producto
  async createProduct(productData) {
    if (containsBlockedLanguageInFields(productTextFields(productData))) {
      return { data: null, error: createModerationError() };
    }

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select();

    return { data, error };
  },

  // Actualizar un producto existente
  async updateProduct(productId, productData) {
    if (containsBlockedLanguageInFields(productTextFields(productData))) {
      return { data: null, error: createModerationError() };
    }

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
