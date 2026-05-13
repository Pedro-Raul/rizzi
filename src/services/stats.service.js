import { supabase } from '../utils/supabaseClient';

/**
 * Estadísticas públicas de la plataforma.
 * Preferencia: RPC `public_platform_stats` en Supabase (ver public_platform_stats.sql).
 */
export const statsService = {
  async getPublicStats() {
    const { data, error } = await supabase.rpc('public_platform_stats');

    let parsed = data;
    if (typeof data === 'string') {
      try {
        parsed = JSON.parse(data);
      } catch {
        parsed = null;
      }
    }

    if (!error && parsed && typeof parsed === 'object') {
      return {
        data: {
          businesses: Number(parsed.businesses) || 0,
          users: Number(parsed.users) || 0,
          neighborhoods: Number(parsed.neighborhoods) || 0
        },
        error: null
      };
    }

    const [bizRes, userRes] = await Promise.all([
      supabase.from('businesses').select('id', { count: 'exact', head: true }).eq('is_approved', true),
      supabase.from('users').select('id', { count: 'exact', head: true })
    ]);

    return {
      data: {
        businesses: bizRes.count ?? 0,
        users: userRes.count ?? 0,
        neighborhoods: 0
      },
      error: error || bizRes.error || userRes.error || null
    };
  }
};
