import { supabase } from '../utils/supabaseClient';

export const storageService = {
  /**
   * Sube una imagen al bucket de Supabase y retorna su URL pública.
   * @param {File} file Archivo a subir
   * @param {string} path Ruta dentro del bucket (ej: 'businesses/logos')
   * @returns {Promise<{url: string|null, error: any}>}
   */
  async uploadImage(file, path = 'general') {
    if (!file) return { url: null, error: null };

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      return { url: null, error: sessionError };
    }

    if (!sessionData.session) {
      return {
        url: null,
        error: new Error('Debes iniciar sesión nuevamente antes de subir imágenes.')
      };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${sessionData.session.user.id}_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('public-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error al subir imagen:', uploadError);
      return { url: null, error: uploadError };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('public-images')
      .getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  }
};
