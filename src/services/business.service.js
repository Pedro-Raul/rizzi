import { supabase } from '../utils/supabaseClient';

export const businessService = {
  /**
   * @param {{ categoryId?: string | null }} [options]
   * Si `categoryId` está definido, solo negocios de esa categoría (excluye sin categoría).
   */
  async getBusinesses(options = {}) {
    let query = supabase
      .from('businesses')
      .select('*, categories(name, icon_url)')
      .order('created_at', { ascending: false });

    if (options.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }

    if (options.searchQuery) {
      query = query.or(`name.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%`);
    }

    const { data, error } = await query;

    return { data, error };
  },

  async getBusinessById(id) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*, categories(name, icon_url)')
      .eq('id', id)
      .single();

    return { data, error };
  },

  async getUserBusinesses(userId) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*, categories(name)')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async createBusiness(businessData) {
    const { data, error } = await supabase
      .from('businesses')
      .insert([businessData])
      .select();

    return { data, error };
  },

  async updateBusiness(businessId, businessData) {
    const { data, error } = await supabase
      .from('businesses')
      .update(businessData)
      .eq('id', businessId)
      .select();

    return { data, error };
  },

  async deleteBusiness(businessId) {
    const { error: rpcError } = await supabase.rpc('delete_business_if_allowed', {
      target_id: businessId
    });

    if (!rpcError) {
      return { error: null, deleted: 1 };
    }

    const missingRpc =
      rpcError.code === 'PGRST202' ||
      rpcError.code === '42883' ||
      /delete_business_if_allowed|function.*does not exist|Could not find the function/i.test(
        rpcError.message || ''
      );

    if (!missingRpc) {
      return { error: rpcError, deleted: 0 };
    }

    const { data, error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', businessId)
      .select('id');

    if (error) {
      return { error, deleted: 0 };
    }

    if (!data?.length) {
      return {
        error: {
          message:
            'No se eliminó el negocio. En Supabase ejecuta rpc_delete_business.sql (recomendado) o admin_cascade_delete.sql + admin_policies.sql, y verifica role = admin en public.users.'
        },
        deleted: 0
      };
    }

    return { error: null, deleted: data.length };
  },

  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    return { data, error };
  }
};
