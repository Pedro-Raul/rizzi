import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CartDrawer from '../components/cart/CartDrawer';
import CheckoutModal from '../components/cart/CheckoutModal';
import { useCart } from '../context/CartContext';
import { businessService } from '../services/business.service';

const MainLayout = () => {
  const { businessId } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutBusiness, setCheckoutBusiness] = useState(null);

  useEffect(() => {
    const loadCheckoutBusiness = async () => {
      if (!checkoutOpen || !businessId) {
        setCheckoutBusiness(null);
        return;
      }

      const { data } = await businessService.getBusinessById(businessId);
      setCheckoutBusiness(data || null);
    };

    loadCheckoutBusiness();
  }, [checkoutOpen, businessId]);

  const handleCheckout = () => {
    if (!businessId) return;
    setCheckoutOpen(true);
  };

  const handleOrderSuccess = () => {
    alert('Pedido creado correctamente. El vendedor lo recibirá en su panel.');
    setCartOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
      />
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        businessId={businessId}
        deliveryPoints={checkoutBusiness?.delivery_points || []}
        onOrderSuccess={handleOrderSuccess}
      />
    </div>
  );
};

export default MainLayout;
