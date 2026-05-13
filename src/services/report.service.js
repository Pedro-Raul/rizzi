import { supabase } from '../utils/supabaseClient';

export const reportService = {
  async createReport({ businessId, reporterId, reason, details }) {
    const { data, error } = await supabase
      .from('business_reports')
      .insert([
        {
          business_id: businessId,
          reporter_id: reporterId,
          reason,
          details: details?.trim() || null
        }
      ])
      .select()
      .single();

    return { data, error };
  },

  async listReportsForAdmin() {
    const { data, error } = await supabase
      .from('business_reports')
      .select(
        `
        id,
        reason,
        details,
        status,
        admin_notes,
        created_at,
        updated_at,
        business_id,
        reporter_id,
        businesses (
          id,
          name,
          owner_id
        ),
        users!business_reports_reporter_id_fkey (
          id,
          full_name
        )
      `
      )
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async updateReport(reportId, { status, admin_notes }) {
    const { data, error } = await supabase
      .from('business_reports')
      .update({
        status,
        admin_notes: admin_notes ?? null,
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId)
      .select()
      .single();

    return { data, error };
  }
};
