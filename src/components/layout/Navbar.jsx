import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ShoppingCart } from 'lucide-react';

const Navbar = ({ onCartOpen }) => {
  const { isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const { pathname } = useLocation();

  const getLinkClass = (to) => {
    const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);

    return isActive
      ? 'text-primary transition-colors'
      : 'text-gray-500 hover:text-primary transition-colors';
  };

  return (
    <nav className="bg-white border-b border-gray-100 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
        </Link>
        <div className="hidden md:flex gap-6 font-medium">
          <Link to="/" className={getLinkClass('/')}>
            Inicio
          </Link>
          <Link to="/favorites" className={getLinkClass('/favorites')}>
            Favoritos
          </Link>
          {isAuthenticated && (
            <Link to="/orders" className={getLinkClass('/orders')}>
              Mis pedidos
            </Link>
          )}
          <Link to="/about" className={getLinkClass('/about')}>
            Quienes somos
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-3 md:gap-4">
        <button
          type="button"
          onClick={onCartOpen}
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-colors"
          title="Abrir carrito"
          aria-label={`Abrir carrito con ${itemCount} productos`}
        >
          <ShoppingCart size={20} />
          {itemCount > 0 && (
            <span className="absolute -right-2 -top-2 min-w-5 h-5 px-1 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </button>
        {isAuthenticated ? (
          <>
            <Link
              to="/orders"
              className={pathname.startsWith('/orders')
                ? 'text-primary bg-primary/5 px-3 py-2 rounded-md font-medium transition-all md:hidden'
                : 'text-gray-600 hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-md font-medium transition-all md:hidden'}
            >
              Pedidos
            </Link>
            <Link
              to="/dashboard"
              className={pathname.startsWith('/dashboard')
                ? 'text-primary bg-primary/5 px-4 py-2 rounded-md font-medium transition-all'
                : 'text-primary hover:bg-primary/5 px-4 py-2 rounded-md font-medium transition-all'}
            >
              Mi Panel
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className={pathname === '/login'
                ? 'text-primary font-medium transition-colors hidden sm:block'
                : 'text-gray-600 hover:text-primary font-medium transition-colors hidden sm:block'}
            >
              Iniciar sesion
            </Link>
            <Link
              to="/register"
              className="bg-primary hover:bg-opacity-90 text-white px-5 py-2 rounded-md font-medium transition-all shadow-sm"
            >
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
