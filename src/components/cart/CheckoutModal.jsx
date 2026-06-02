import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { orderService } from '../../services/order.service';
import { useAuth } from '../../context/AuthContext';
import { X, MapPin } from 'lucide-react';

const CheckoutModal = ({ open, onClose, businessId, deliveryPoints = [], onOrderSuccess }) => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const points = Array.isArray(deliveryPoints) ? deliveryPoints : [];
  
  const [selectedPoint, setSelectedPoint] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Debes iniciar sesión para realizar un pedido.");
      return;
    }

    if (!selectedPoint && points.length > 0) {
      alert("Selecciona un punto de encuentro.");
      return;
    }

    setLoading(true);

    const orderData = {
      business_id: businessId,
      user_id: user.id,
      total: total,
      delivery_point: selectedPoint || 'Acordar con el vendedor',
      customer_notes: notes,
      status: 'pending'
    };

    const { error } = await orderService.createOrder(orderData, items);

    setLoading(false);

    if (error) {
      alert('Error al procesar el pedido: ' + error.message);
    } else {
      clearCart();
      onOrderSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-dark">Detalles de Entrega</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              Punto de Encuentro
            </label>
            
            {points.length > 0 ? (
              <select
                required
                value={selectedPoint}
                onChange={(e) => setSelectedPoint(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
              >
                <option value="">Selecciona una opción...</option>
                {points.map((point, idx) => (
                  <option key={idx} value={point}>{point}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                value={selectedPoint}
                onChange={(e) => setSelectedPoint(e.target.value)}
                placeholder="Ej. Entrada principal, Parque central..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            )}
            <p className="text-xs text-gray-500 mt-2">
              {points.length > 0 
                ? 'El vendedor ha predefinido estos puntos para la entrega.' 
                : 'Indica dónde te encontrarás con el vendedor.'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Notas adicionales (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Voy con chaqueta roja, por favor sin cebolla..."
              rows="3"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
            />
          </div>

          <div className="bg-primary/5 rounded-xl p-4 flex justify-between items-center border border-primary/10">
            <span className="font-medium text-dark">Total a pagar:</span>
            <span className="text-xl font-bold text-primary">
              ${total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-opacity-90 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              'Confirmar Pedido'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
