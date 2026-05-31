import { useCart } from '../../context/CartContext';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

const CartDrawer = ({ open, onClose, onCheckout }) => {
  const { items, removeFromCart, updateQuantity, total, itemCount } = useCart();

  if (!open) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="text-primary" />
            Tu Pedido
            <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
              {itemCount}
            </span>
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
              <ShoppingBag size={48} className="opacity-20" />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product_id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ShoppingBag size={24} />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-dark text-sm line-clamp-2">{item.product_name}</h4>
                    <button 
                      onClick={() => removeFromCart(item.product_id)}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-bold text-primary">
                      ${Number(item.price * item.quantity).toLocaleString('es-ES')}
                    </span>
                    
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200">
                      <button 
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="p-1 text-gray-500 hover:text-primary transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="p-1 text-gray-500 hover:text-primary transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500">Total a pagar</span>
            <span className="text-2xl font-bold text-dark">
              ${total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <button 
            onClick={onCheckout}
            disabled={items.length === 0}
            className="w-full bg-primary hover:bg-opacity-90 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar Pedido
          </button>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
