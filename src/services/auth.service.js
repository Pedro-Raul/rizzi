import { supabase } from '../utils/supabaseClient';
import { containsBlockedLanguageInFields, createModerationError } from '../utils/moderation';

export const authService = {
  async register(email, password, fullName) {
    if (containsBlockedLanguageInFields([fullName])) {
      return { data: null, error: createModerationError() };
    }

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

  async listUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, role, created_at')
      .order('full_name', { ascending: true, nullsFirst: false });

    return { data, error };
  },

  async updateUserRole(userId, role) {
    const { data, error } = await supabase.rpc('admin_update_user_role', {
      target_user_id: userId,
      new_role: role
    });

    return { data, error };
  },
  
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};
