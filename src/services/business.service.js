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
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', businessId);

    return { error };
  },

  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    return { data, error };
  }
};
