import { supabase } from '../utils/supabaseClient';

export const reviewService = {
  async getBusinessReviews(businessId) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, users(full_name, avatar_url)')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async getUserReview(businessId, userId) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('business_id', businessId)
      .eq('user_id', userId)
      .maybeSingle();

    return { data, error };
  },

  async createReview(businessId, userId, rating, comment) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([{ business_id: businessId, user_id: userId, rating, comment }])
      .select();

    return { data, error };
  },

  async updateReview(reviewId, rating, comment) {
    const { data, error } = await supabase
      .from('reviews')
      .update({ rating, comment })
      .eq('id', reviewId)
      .select();

    return { data, error };
  },

  async deleteReview(reviewId) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    return { error };
  }
};
