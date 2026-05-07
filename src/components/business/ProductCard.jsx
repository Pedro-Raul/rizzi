import { Package, Pencil, Trash2 } from 'lucide-react';

const ProductCard = ({ product, isOwner, onDelete, onEdit }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden relative group">
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

      <div className="h-40 bg-gray-100 w-full relative flex items-center justify-center">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
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

        <div className="mt-auto">
          <span className="font-bold text-lg text-primary">
            ${Number(product.price).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
