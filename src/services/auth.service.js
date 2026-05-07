import { supabase } from '../utils/supabaseClient';

export const authService = {
  async register(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error };
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  async getUserProfile(userId) {
    if (!userId) return { data: null, error: null };

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    return { data, error };
  },
  
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};
