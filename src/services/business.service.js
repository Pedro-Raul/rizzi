import { supabase } from '../utils/supabaseClient';

export const businessService = {
  async getBusinesses() {
    const { data, error } = await supabase
      .from('businesses')
      .select('*, categories(name, icon_url)')
      .order('created_at', { ascending: false });

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
            'No se eliminó ningún negocio. Si eres admin, ejecuta en Supabase el script admin_cascade_delete.sql (políticas RLS en favoritos y reportes) y comprueba que tu usuario tiene role = admin en public.users.'
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
