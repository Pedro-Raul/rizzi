import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { businessService } from '../services/business.service';
import { productService } from '../services/product.service';
import { storageService } from '../services/storage.service';
import { reportService } from '../services/report.service';
import ProductCard from '../components/business/ProductCard';
import ReportBusinessModal from '../components/business/ReportBusinessModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { containsBlockedLanguage, MODERATION_MESSAGE } from '../utils/moderation';
import {
  Store,
  MapPin,
  Phone,
  ArrowLeft,
  Plus,
  X,
  Package,
  Image as ImageIcon,
  AtSign,
  Share2,
  Music2,
  Globe,
  MessageCircle,
  Trash2,
  Flag,
  MapPinned
} from 'lucide-react';

const emptyProductForm = {
  name: '',
  description: '',
  price: ''
};

const socialLinks = [
  { key: 'instagram_url', label: 'Instagram', icon: AtSign },
  { key: 'facebook_url', label: 'Facebook', icon: Share2 },
  { key: 'tiktok_url', label: 'TikTok', icon: Music2 },
  { key: 'website_url', label: 'Web', icon: Globe },
  { key: 'whatsapp_url', label: 'WhatsApp', icon: MessageCircle }
];

const ProductSection = ({ title, products, isOwner, onEdit, onDelete }) => (
  <section className="space-y-4">
    <div className="text-white font-bold text-center py-2 rounded-lg" style={{ backgroundColor: isOwner?.theme_color || '#8B7DFA' }}>
      {title}
    </div>
    {products.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isOwner={isOwner}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    ) : (
      <div className="h-32 bg-white/70 border border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400">
        Sin productos por ahora
      </div>
    )}
  </section>
);

const BusinessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyProductForm);
  const [productImageFile, setProductImageFile] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportSaving, setReportSaving] = useState(false);

  const isOwner = user && business && user.id === business.owner_id;
  const canManage = isOwner || isAdmin;
  const canReport = user && business && user.id !== business.owner_id;
  const bestSellers = products.slice(0, 3);
  const featuredProducts = products.slice(3);
  const availableSocialLinks = business
    ? socialLinks.filter((link) => business[link.key])
    : [];

  const loadData = useCallback(async () => {
    setLoading(true);

    const { data: businessData, error: businessError } = await businessService.getBusinessById(id);
    if (businessError || !businessData) {
      setError('No se pudo encontrar el negocio o fue eliminado.');
      setLoading(false);
      return;
    }

    setBusiness(businessData);

    const { data: productData } = await productService.getBusinessProducts(id);
    if (productData) {
      setProducts(productData);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const resetProductForm = () => {
    setFormData(emptyProductForm);
    setProductImageFile(null);
    setEditingProduct(null);
  };

  const openCreateProductForm = () => {
    resetProductForm();
    setShowForm(true);
  };

  const openEditProductForm = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price ?? ''
    });
    setProductImageFile(null);
    setShowForm(true);
  };

  const closeProductForm = () => {
    setShowForm(false);
    resetProductForm();
  };

  const handleProductChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleProductImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setProductImageFile(event.target.files[0]);
    }
  };

  const refreshProducts = async () => {
    const { data } = await productService.getBusinessProducts(id);
    if (data) setProducts(data);
  };

  const handleSaveProduct = async (event) => {
    event.preventDefault();

    if (containsBlockedLanguage(formData.name) || containsBlockedLanguage(formData.description)) {
      alert(MODERATION_MESSAGE);
      return;
    }

    setSaving(true);

    let image_url = editingProduct?.image_url || null;

    if (productImageFile) {
      const { url, error: uploadError } = await storageService.uploadImage(productImageFile, 'products/images');
      if (uploadError) {
        alert('Error al subir la imagen del producto: ' + uploadError.message);
        setSaving(false);
        return;
      }
      image_url = url;
    }

    const productPayload = {
      ...formData,
      business_id: id,
      image_url,
      price: parseFloat(formData.price) || 0
    };

    const { error: saveError } = editingProduct
      ? await productService.updateProduct(editingProduct.id, productPayload)
      : await productService.createProduct(productPayload);

    if (!saveError) {
      closeProductForm();
      refreshProducts();
    } else {
      alert(`Error al ${editingProduct ? 'actualizar' : 'añadir'} producto: ${saveError.message}`);
    }

    setSaving(false);
  };

  const handleDeleteProduct = (productId) => {
    const product = products.find((item) => item.id === productId);

    setConfirmDialog({
      type: 'product',
      id: productId,
      title: 'Eliminar producto',
      description: `¿Quieres confirmar que vas a eliminar "${product?.name || 'este producto'}"? Esta acción no se puede deshacer.`
    });
  };

  const handleDeleteBusiness = () => {
    setConfirmDialog({
      type: 'business',
      id: business.id,
      title: 'Eliminar negocio',
      description: `¿Quieres confirmar que vas a eliminar "${business.name}"? También se eliminarán sus productos y favoritos asociados.`
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog) return;

    setDeleting(true);

    if (confirmDialog.type === 'product') {
      const { error: deleteError } = await productService.deleteProduct(confirmDialog.id);
      if (!deleteError) {
        setProducts(products.filter((product) => product.id !== confirmDialog.id));
        setConfirmDialog(null);
      } else {
        alert('Error al eliminar el producto: ' + deleteError.message);
      }
    }

    if (confirmDialog.type === 'business') {
      const { error: deleteError } = await businessService.deleteBusiness(confirmDialog.id);
      if (!deleteError) {
        setConfirmDialog(null);
        navigate('/dashboard');
      } else {
        alert('Error al eliminar el negocio: ' + deleteError.message);
      }
    }

    setDeleting(false);
  };

  const handleSubmitReport = async ({ reason, details }) => {
    if (!user || !business) return;

    if (containsBlockedLanguage(details)) {
      alert(MODERATION_MESSAGE);
      return;
    }

    setReportSaving(true);
    const { error } = await reportService.createReport({
      businessId: business.id,
      reporterId: user.id,
      reason,
      details
    });
    setReportSaving(false);

    if (error) {
      if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
        alert('Ya enviaste un reporte para este negocio. El equipo lo revisará.');
      } else {
        alert('No se pudo enviar el reporte: ' + error.message);
      }
      return;
    }

    setReportModalOpen(false);
    alert('Gracias. Tu reporte fue enviado y será revisado por el equipo.');
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center bg-light">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-light">
        <Store size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-dark mb-2">Negocio no encontrado</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <button onClick={() => navigate('/')} className="bg-primary text-white px-6 py-2 rounded-lg font-medium">
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F3F1FB] px-4 md:px-8 py-6 md:py-10">
      <div 
        className="-mx-4 -mt-6 md:-mx-8 md:-mt-10 h-44 md:h-60 overflow-hidden" 
        style={{ backgroundColor: business.theme_color || '#8B7DFA' }}
      >
        {business.banner_url && (
          <img
            src={business.banner_url}
            alt={`Portada de ${business.name}`}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="bg-white text-primary border border-primary px-6 py-3 rounded-lg font-bold hover:bg-primary hover:text-white transition-all inline-flex items-center gap-2 my-6"
        >
          <ArrowLeft size={18} />
          Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          <main className="space-y-8">
            <section>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-white border border-white shadow-sm flex items-center justify-center overflow-hidden">
                  {business.logo_url ? (
                    <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="text-primary" size={30} />
                  )}
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-dark">{business.name}</h1>
                  <p className="text-gray-500 mt-1">
                    {[business.categories?.name, business.neighborhood, business.address].filter(Boolean).join(' · ') || 'Negocio local'}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed max-w-4xl">
                {business.description || 'Este negocio aún no tiene una descripción detallada.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {canReport && (
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(true)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 border border-gray-200 bg-white px-3 py-2 rounded-lg hover:border-red-100 hover:bg-red-50/50 transition-colors"
                  >
                    <Flag size={16} />
                    Reportar negocio
                  </button>
                )}
                {!user && (
                  <Link
                    to="/login"
                    state={{ from: `/business/${id}` }}
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary border border-gray-200 bg-white px-3 py-2 rounded-lg transition-colors"
                  >
                    <Flag size={16} />
                    Inicia sesión para reportar
                  </Link>
                )}
              </div>
            </section>

            {canManage && !showForm && (
              <button
                onClick={openCreateProductForm}
                className="text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 flex items-center gap-2 transition-all"
                style={{ backgroundColor: business.theme_color || '#8B7DFA' }}
              >
                <Plus size={18} />
                Añadir Producto
              </button>
            )}

            {showForm && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative">
                <button
                  onClick={closeProductForm}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
                <h3 className="text-xl font-bold text-dark mb-4">
                  {editingProduct ? 'Editar producto' : 'Añadir nuevo producto'}
                </h3>
                <form onSubmit={handleSaveProduct} className="space-y-4 max-w-2xl">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <ImageIcon size={16} className="text-primary" />
                      Imagen del producto
                    </label>
                    {editingProduct?.image_url && !productImageFile && (
                      <img src={editingProduct.image_url} alt="Imagen actual" className="w-28 h-28 object-cover rounded-lg border border-gray-200 mb-3" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                    />
                    {productImageFile && <p className="text-xs text-green-600 mt-2">Archivo seleccionado</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del producto *</label>
                      <input required name="name" value={formData.name} onChange={handleProductChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
                      <input type="number" step="0.01" min="0" required name="price" value={formData.price} onChange={handleProductChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea name="description" value={formData.description} onChange={handleProductChange} rows="2" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"></textarea>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button type="submit" disabled={saving} className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 disabled:opacity-50">
                      {saving ? 'Guardando...' : editingProduct ? 'Guardar cambios' : 'Añadir Producto'}
                    </button>
                    <button type="button" onClick={closeProductForm} className="bg-white text-gray-700 font-medium py-2 px-6 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all">
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {products.length > 0 ? (
              <>
                <ProductSection
                  title="Más vendidos"
                  products={bestSellers}
                  isOwner={business}
                  onEdit={openEditProductForm}
                  onDelete={handleDeleteProduct}
                />
                <ProductSection
                  title="Destacados"
                  products={featuredProducts}
                  isOwner={business}
                  onEdit={openEditProductForm}
                  onDelete={handleDeleteProduct}
                />
              </>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-dark mb-1">Aún no hay productos</h3>
                <p className="text-gray-500">
                  {canManage
                    ? 'Añade tu primer producto para que los clientes lo vean.'
                    : 'Este negocio aún no ha subido su catálogo.'}
                </p>
              </div>
            )}
          </main>

          <aside className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:sticky lg:top-28">
            <h2 className="text-xl font-bold text-dark mb-5">Información del local</h2>
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex gap-3">
                <MapPin size={18} className="shrink-0" style={{ color: business.theme_color || '#8B7DFA' }} />
                <span>{business.address || 'Ubicación no disponible'}</span>
              </div>
              {business.neighborhood?.trim() && (
                <div className="flex gap-3">
                  <MapPinned size={18} className="shrink-0" style={{ color: business.theme_color || '#8B7DFA' }} />
                  <span>{business.neighborhood.trim()}</span>
                </div>
              )}
              <div className="flex gap-3">
                <Phone size={18} className="shrink-0" style={{ color: business.theme_color || '#8B7DFA' }} />
                <span>{business.phone || 'Teléfono no disponible'}</span>
              </div>
            </div>

            {availableSocialLinks.length > 0 && (
              <div className="mt-6 pt-5 border-t border-gray-100">
                <h3 className="font-bold text-dark mb-3">Redes</h3>
                <div className="flex flex-wrap gap-2">
                  {availableSocialLinks.map((link) => {
                    const Icon = link.icon;

                    return (
                      <a
                        key={link.key}
                        href={business[link.key]}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        style={{ 
                          color: business.theme_color || '#8B7DFA',
                          backgroundColor: `${business.theme_color || '#8B7DFA'}1A`
                        }}
                      >
                        <Icon size={16} />
                        {link.label}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              {business.categories?.name && (
                <span className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-xs font-bold">
                  {business.categories.name}
                </span>
              )}
              {business.neighborhood?.trim() && (
                <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-bold">
                  {business.neighborhood.trim()}
                </span>
              )}
              <span className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-xs font-bold">
                Local
              </span>
              <span className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-xs font-bold">
                Comunidad
              </span>
            </div>

            {canManage && (
              <div className="mt-6 pt-5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleDeleteBusiness}
                  className="w-full inline-flex items-center justify-center gap-2 bg-red-50 text-red-600 font-bold px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={16} />
                  Eliminar negocio
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmDialog}
        title={confirmDialog?.title}
        description={confirmDialog?.description}
        confirmLabel="Sí, eliminar"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog(null)}
      />

      <ReportBusinessModal
        key={business?.id}
        open={reportModalOpen}
        businessName={business?.name}
        saving={reportSaving}
        onClose={() => setReportModalOpen(false)}
        onSubmit={handleSubmitReport}
      />
    </div>
  );
};

export default BusinessDetails;
