import { useCallback, useEffect, useState } from 'react';
import { orderService } from '../../services/order.service';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';

const OrdersPanel = ({ businessId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data } = await orderService.getBusinessOrders(businessId);
    setOrders(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (businessId) fetchOrders();
  }, [businessId, fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(true);
    const { error } = await orderService.updateOrderStatus(orderId, newStatus);
    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } else {
      alert('Error al actualizar el pedido: ' + error.message);
    }
    setUpdating(false);
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_preparation: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    pending: 'Pendiente',
    in_preparation: 'En Preparación',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando pedidos...</div>;
  }

  const orderList = Array.isArray(orders) ? orders : [];

  if (orderList.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <Package className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-medium text-dark mb-1">Aún no hay pedidos</h3>
        <p className="text-gray-500">Aquí aparecerán los pedidos de tus clientes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orderList.map(order => (
        <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
            <div>
              <h4 className="font-bold text-dark text-lg">Pedido #{order.id.slice(0, 8)}</h4>
              <p className="text-sm text-gray-500">Cliente: {order.users?.full_name || 'Desconocido'}</p>
              <p className="text-sm text-gray-500">Punto de Entrega: <span className="font-medium text-dark">{order.delivery_point || 'No especificado'}</span></p>
              <p className="text-xs text-gray-400 mt-1">{new Date(order.created_at).toLocaleString()}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status]}`}>
                {statusLabels[order.status]}
              </span>
              <span className="font-bold text-lg text-primary">
                ${Number(order.total).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <h5 className="text-sm font-bold text-gray-700 mb-2">Artículos:</h5>
            <ul className="space-y-1">
              {(Array.isArray(order.order_items) ? order.order_items : []).map(item => (
                <li key={item.id} className="text-sm flex justify-between">
                  <span>{item.quantity}x {item.product_name}</span>
                  <span className="text-gray-600">${Number(item.price * item.quantity).toLocaleString('es-ES')}</span>
                </li>
              ))}
            </ul>
            {order.customer_notes && (
              <div className="mt-3 text-sm text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-100">
                <strong>Nota del cliente:</strong> {order.customer_notes}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            {order.status === 'pending' && (
              <button
                disabled={updating}
                onClick={() => handleStatusChange(order.id, 'in_preparation')}
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
              >
                <Clock size={16} /> Preparar
              </button>
            )}
            {(order.status === 'pending' || order.status === 'in_preparation') && (
              <button
                disabled={updating}
                onClick={() => handleStatusChange(order.id, 'delivered')}
                className="bg-green-50 text-green-600 hover:bg-green-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
              >
                <CheckCircle size={16} /> Marcar Entregado
              </button>
            )}
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <button
                disabled={updating}
                onClick={() => handleStatusChange(order.id, 'cancelled')}
                className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ml-auto"
              >
                <XCircle size={16} /> Cancelar
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrdersPanel;
