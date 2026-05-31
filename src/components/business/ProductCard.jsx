import { Package, Pencil, Trash2, Power, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product, isOwner, onDelete, onEdit, onToggleActive }) => {
  const { addToCart } = useCart();
  const isActive = product.is_active;

  const handleAddToCart = () => {
    try {
      addToCart(product, 1);
    } catch (error) {
      if (error.message !== 'DIFFERENT_BUSINESS') {
        throw error;
      }

      const shouldReplace = window.confirm(
        'Tu carrito tiene productos de otro negocio. ¿Quieres vaciarlo y agregar este producto?'
      );

      if (shouldReplace) {
        addToCart(product, 1, { replace: true });
      }
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden relative group ${!isActive && isOwner ? 'opacity-70' : ''}`}>
      {isOwner && (
        <div className="absolute top-2 right-2 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(product)}
            className="bg-white/90 hover:bg-primary/10 text-primary p-2 rounded-full shadow-sm"
            title="Editar producto"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="bg-white/90 hover:bg-red-50 text-red-500 p-2 rounded-full shadow-sm"
            title="Eliminar producto"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {isOwner && (
        <div className="absolute top-2 left-2 z-10">
          <button
            onClick={() => onToggleActive(product)}
            className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm flex items-center gap-1 ${
              isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
            title={isActive ? 'Producto Disponible (Click para marcar Agotado)' : 'Producto Agotado (Click para marcar Disponible)'}
          >
            <Power size={12} />
            {isActive ? 'Disponible' : 'Agotado'}
          </button>
        </div>
      )}

      <div className="h-40 bg-gray-100 w-full relative flex items-center justify-center">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className={`w-full h-full object-cover ${!isActive && isOwner ? 'grayscale' : ''}`}
          />
        ) : (
          <Package size={32} className="text-gray-300" />
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h4 className="font-bold text-dark line-clamp-1 mb-1">{product.name}</h4>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
          {product.description || 'Sin descripción'}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <span className="font-bold text-lg text-primary">
            ${Number(product.price).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </span>
          {!isOwner && isActive && (
            <button
              onClick={handleAddToCart}
              className="bg-primary/10 hover:bg-primary text-primary hover:text-white p-2 rounded-lg transition-colors"
              title="Agregar al carrito"
            >
              <ShoppingCart size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
