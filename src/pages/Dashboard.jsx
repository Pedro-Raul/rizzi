import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { businessService } from '../services/business.service';
import { storageService } from '../services/storage.service';
import { reportService } from '../services/report.service';
import { useNavigate } from 'react-router-dom';
import { Store, Plus, X, Image as ImageIcon, Pencil, Trash2, Flag } from 'lucide-react';
import BusinessCard from '../components/business/BusinessCard';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import AdminReportsPanel from '../components/admin/AdminReportsPanel';
import { containsBlockedLanguage, MODERATION_MESSAGE } from '../utils/moderation';

const emptyBusinessForm = {
  name: '',
  description: '',
  address: '',
  phone: '',
  category_id: '',
  instagram_url: '',
  facebook_url: '',
  tiktok_url: '',
  website_url: '',
  whatsapp_url: ''
};

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);

  const [formData, setFormData] = useState(emptyBusinessForm);
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [reports, setReports] = useState([]);

  const loadData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const [bizRes, catRes] = await Promise.all([
      isAdmin ? businessService.getBusinesses() : businessService.getUserBusinesses(user.id),
      businessService.getCategories()
    ]);

    if (bizRes.data) setBusinesses(bizRes.data);
    if (catRes.data) setCategories(catRes.data);

    if (isAdmin) {
      const { data: reportData } = await reportService.listReportsForAdmin();
      setReports(reportData || []);
    } else {
      setReports([]);
    }

    setLoading(false);
  }, [user, isAdmin]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadData();
    }
  }, [user, loadData]);

  const resetForm = () => {
    setFormData(emptyBusinessForm);
    setLogoFile(null);
    setBannerFile(null);
    setEditingBusiness(null);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (business) => {
    setEditingBusiness(business);
    setFormData({
      name: business.name || '',
      description: business.description || '',
      address: business.address || '',
      phone: business.phone || '',
      category_id: business.category_id || '',
      instagram_url: business.instagram_url || '',
      facebook_url: business.facebook_url || '',
      tiktok_url: business.tiktok_url || '',
      website_url: business.website_url || '',
      whatsapp_url: business.whatsapp_url || ''
    });
    setLogoFile(null);
    setBannerFile(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, setter) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      containsBlockedLanguage(formData.name) ||
      containsBlockedLanguage(formData.description) ||
      containsBlockedLanguage(formData.address)
    ) {
      alert(MODERATION_MESSAGE);
      return;
    }

    setSaving(true);

    let logo_url = editingBusiness?.logo_url || null;
    let banner_url = editingBusiness?.banner_url || null;

    if (logoFile) {
      const { url, error } = await storageService.uploadImage(logoFile, 'businesses/logos');
      if (error) {
        alert('Error al subir el logo: ' + error.message);
        setSaving(false);
        return;
      }
      logo_url = url;
    }

    if (bannerFile) {
      const { url, error } = await storageService.uploadImage(bannerFile, 'businesses/banners');
      if (error) {
        alert('Error al subir la portada: ' + error.message);
        setSaving(false);
        return;
      }
      banner_url = url;
    }

    const {
      instagram_url,
      facebook_url,
      tiktok_url,
      website_url,
      whatsapp_url,
      ...businessFields
    } = formData;

    const socialFields = Object.fromEntries(
      Object.entries({
        instagram_url,
        facebook_url,
        tiktok_url,
        website_url,
        whatsapp_url
      }).filter(([, value]) => value.trim())
    );

    const businessPayload = {
      ...businessFields,
      ...socialFields,
      category_id: formData.category_id || null,
      logo_url,
      banner_url
    };

    const { error } = editingBusiness
      ? await businessService.updateBusiness(editingBusiness.id, businessPayload)
      : await businessService.createBusiness({
          ...businessPayload,
          owner_id: user.id,
          is_approved: true
        });

    if (!error) {
      closeForm();
      loadData();
    } else {
      alert(`Error al ${editingBusiness ? 'actualizar' : 'crear'} el negocio: ${error.message}`);
    }

    setSaving(false);
  };

  const handleConfirmDeleteBusiness = async () => {
    if (!businessToDelete) return;

    setDeleting(true);
    const { error } = await businessService.deleteBusiness(businessToDelete.id);

    if (!error) {
      setBusinessToDelete(null);
      loadData();
    } else {
      alert('Error al eliminar el negocio: ' + error.message);
    }

    setDeleting(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-dark mb-2">Panel de Control</h1>
            <p className="text-gray-600">
              Bienvenido, <span className="font-semibold text-primary">{user?.user_metadata?.full_name || user?.email}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-5 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>

        {isAdmin && (
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-dark flex items-center gap-2 mb-2">
              <Flag className="text-primary" />
              Reportes de negocios
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Revisa los reportes enviados por la comunidad. Puedes marcarlos como revisados o descartados y dejar notas internas.
            </p>
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <AdminReportsPanel reports={reports} onRefresh={loadData} />
            )}
          </div>
        )}

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-dark flex items-center gap-2">
              <Store className="text-primary" />
              {isAdmin ? 'Administrar negocios' : 'Mis Negocios'}
            </h2>
            {!showForm && (
              <button
                onClick={openCreateForm}
                className="bg-primary hover:bg-opacity-90 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm md:text-base"
              >
                <Plus size={18} />
                <span className="hidden md:inline">Registrar Negocio</span>
                <span className="md:hidden">Nuevo</span>
              </button>
            )}
          </div>

          {showForm ? (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 relative">
              <button
                onClick={closeForm}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
              <h3 className="text-xl font-bold text-dark mb-4">
                {editingBusiness ? 'Editar negocio' : 'Registrar un nuevo negocio'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 rounded-lg border border-gray-200">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <ImageIcon size={16} className="text-primary" /> Logo del Negocio
                    </label>
                    {editingBusiness?.logo_url && !logoFile && (
                      <img src={editingBusiness.logo_url} alt="Logo actual" className="w-16 h-16 object-cover rounded-lg border border-gray-200 mb-3" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, setLogoFile)}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                    />
                    {logoFile && <p className="text-xs text-green-600 mt-2">Archivo seleccionado</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <ImageIcon size={16} className="text-secondary" /> Portada (Banner)
                    </label>
                    {editingBusiness?.banner_url && !bannerFile && (
                      <img src={editingBusiness.banner_url} alt="Portada actual" className="w-full h-20 object-cover rounded-lg border border-gray-200 mb-3" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, setBannerFile)}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-secondary/20 file:text-green-800 hover:file:bg-secondary/40 cursor-pointer"
                    />
                    {bannerFile && <p className="text-xs text-green-600 mt-2">Archivo seleccionado</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del negocio *</label>
                  <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white">
                      <option value="">Selecciona una categoría</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"></textarea>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <h4 className="font-bold text-dark mb-4">Redes sociales opcionales</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                      <input name="instagram_url" type="url" placeholder="https://instagram.com/tu_negocio" value={formData.instagram_url} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                      <input name="facebook_url" type="url" placeholder="https://facebook.com/tu_negocio" value={formData.facebook_url} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">TikTok</label>
                      <input name="tiktok_url" type="url" placeholder="https://tiktok.com/@tu_negocio" value={formData.tiktok_url} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sitio web</label>
                      <input name="website_url" type="url" placeholder="https://tusitio.com" value={formData.website_url} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                      <input name="whatsapp_url" type="url" placeholder="https://wa.me/573001234567" value={formData.whatsapp_url} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button type="submit" disabled={saving} className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                    {saving ? 'Guardando...' : editingBusiness ? 'Guardar cambios' : 'Guardar Negocio'}
                  </button>
                  <button type="button" onClick={closeForm} className="bg-white text-gray-700 font-medium py-2 px-6 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              {loading ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
              ) : businesses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {businesses.map((business) => (
                    <div key={business.id} className="space-y-3">
                      <BusinessCard business={business} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(business)}
                          className="w-full bg-white border border-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <Pencil size={16} />
                          Editar información
                        </button>
                        <button
                          type="button"
                          onClick={() => setBusinessToDelete(business)}
                          className="w-full bg-red-50 border border-red-100 text-red-600 font-medium py-2 px-4 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 size={16} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <Store className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-dark mb-1">Aún no tienes negocios</h3>
                  <p className="text-gray-500 mb-4">Puedes registrar tu negocio local para que los clientes te encuentren.</p>
                  <button onClick={openCreateForm} className="text-primary font-medium hover:underline">
                    Registrar mi primer negocio
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={!!businessToDelete}
        title="Eliminar negocio"
        description={`¿Quieres confirmar que vas a eliminar "${businessToDelete?.name || 'este negocio'}"? También se eliminarán sus productos y favoritos asociados.`}
        confirmLabel="Sí, eliminar"
        loading={deleting}
        onConfirm={handleConfirmDeleteBusiness}
        onCancel={() => setBusinessToDelete(null)}
      />
    </div>
  );
};

export default Dashboard;
