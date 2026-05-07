import { supabase } from '../utils/supabaseClient';

export const favoriteService = {
  // Obtener los favoritos del usuario actual
  async getUserFavorites(userId) {
    if (!userId) return { data: [], error: null };
    
    const { data, error } = await supabase
      .from('favorites')
      .select('business_id')
      .eq('user_id', userId);
    
    return { 
      data: data ? data.map(f => f.business_id) : [], 
      error 
    };
  },

  // Obtener la información completa de los negocios favoritos
  async getFavoriteBusinesses(userId) {
    if (!userId) return { data: [], error: null };

    // Usamos un inner join implicito a traves de la tabla favorites
    const { data, error } = await supabase
      .from('favorites')
      .select('businesses(*, categories(name))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    // Extraemos solo el array de negocios
    return { 
      data: data ? data.map(f => f.businesses) : [], 
      error 
    };
  },

  // Añadir a favoritos
  async addFavorite(userId, businessId) {
    const { data, error } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, business_id: businessId }]);
    
    return { data, error };
  },

  // Quitar de favoritos
  async removeFavorite(userId, businessId) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('business_id', businessId);
    
    return { error };
  },
  
  // Alternar favorito (Toggle)
  async toggleFavorite(userId, businessId, isCurrentlyFavorited) {
    if (isCurrentlyFavorited) {
      return this.removeFavorite(userId, businessId);
    } else {
      return this.addFavorite(userId, businessId);
    }
  }
};
