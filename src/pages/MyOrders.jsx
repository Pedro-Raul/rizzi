import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, Store, MapPin, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/order.service';

const statusStyles = {
  pending: {
    label: 'Pendiente',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800',
  },
  in_preparation: {
    label: 'En preparacion',
    icon: Package,
    className: 'bg-blue-100 text-blue-800',
  },
  delivered: {
    label: 'Entregado',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800',
  },
  cancelled: {
    label: 'Cancelado',
    icon: Package,
    className: 'bg-red-100 text-red-800',
  },
};

const MyOrders = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = user?.id;

  const loadOrders = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    const { data, error } = await orderService.getUserOrders(userId);

    if (error) {
      alert('Error al cargar tus pedidos: ' + error.message);
      setOrders([]);
    } else {
      setOrders(Array.isArray(data) ? data : []);
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();
  }, [isAuthenticated, loadOrders, navigate]);

  return (
    <div className="flex-1 bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold text-dark mb-2 flex items-center gap-2">
            <Package className="text-primary" />
            Mis pedidos
          </h1>
          <p className="text-gray-600">
            Consulta el estado y la informacion de los pedidos que realizaste.
          </p>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = statusStyles[order.status] || statusStyles.pending;
                const StatusIcon = status.icon;
                const business = order.businesses;

                return (
                  <div key={order.id} className="border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div className="flex gap-3">
                        {business?.logo_url ? (
                          <img
                            src={business.logo_url}
                            alt={business.name || 'Negocio'}
                            className="h-12 w-12 rounded-lg object-cover border border-gray-100"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <Store size={22} />
                          </div>
                        )}
                        <div>
                          <h2 className="font-bold text-dark text-lg">
                            {business?.name || 'Negocio no disponible'}
                          </h2>
                          <p className="text-sm text-gray-500">Pedido #{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(order.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex md:flex-col items-start md:items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${status.className}`}>
                          <StatusIcon size={14} />
                          {status.label}
                        </span>
                        <span className="font-bold text-lg text-primary">
                          ${Number(order.total).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="bg-gray-50 rounded-lg p-3 flex gap-2">
                        <MapPin size={17} className="text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-gray-700">Punto de entrega</p>
                          <p className="text-gray-600">{order.delivery_point || 'No especificado'}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 flex gap-2">
                        <MessageSquare size={17} className="text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-gray-700">Notas</p>
                          <p className="text-gray-600">{order.customer_notes || 'Sin notas adicionales'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <h3 className="text-sm font-bold text-gray-700 mb-2">Articulos del pedido</h3>
                      <ul className="space-y-1">
                        {(Array.isArray(order.order_items) ? order.order_items : []).map((item) => (
                          <li key={item.id} className="text-sm flex justify-between gap-4">
                            <span>{item.quantity}x {item.product_name}</span>
                            <span className="text-gray-600">${Number(item.price * item.quantity).toLocaleString('es-ES')}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <Package className="mx-auto text-gray-400 mb-4" size={48} />
              <h2 className="text-lg font-medium text-dark mb-1">Aun no tienes pedidos</h2>
              <p className="text-gray-500 mb-4">Cuando compres en un negocio, veras aqui el seguimiento.</p>
              <Link to="/" className="text-primary font-medium hover:underline">
                Explorar negocios
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
