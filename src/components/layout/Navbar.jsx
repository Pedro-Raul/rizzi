import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { authService } from '../../services/auth.service';
import { ShoppingCart, Menu, X, Home, Heart, Package, Info, LogOut, LayoutDashboard } from 'lucide-react';

const Navbar = ({ onCartOpen }) => {
  const { user, isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close the mobile menu automatically when the route changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMenuOpen(false);
  }, [pathname]);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const getLinkClass = (to) => {
    const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);

    return isActive
      ? 'text-primary transition-colors'
      : 'text-gray-500 hover:text-primary transition-colors';
  };

  return (
    <>
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

          {/* Desktop Authentication Options */}
          <div className="hidden md:flex items-center gap-3 md:gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className={pathname.startsWith('/dashboard')
                  ? 'text-primary bg-primary/5 px-4 py-2 rounded-md font-medium transition-all'
                  : 'text-primary hover:bg-primary/5 px-4 py-2 rounded-md font-medium transition-all'}
              >
                Mi Panel
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className={pathname === '/login'
                    ? 'text-primary font-medium transition-colors'
                    : 'text-gray-600 hover:text-primary font-medium transition-colors'}
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

          {/* Mobile Hamburg Menu Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-colors focus:outline-none"
            aria-label="Menu principal"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-[280px] sm:w-[320px] bg-white shadow-2xl z-[70] p-6 flex flex-col justify-between md:hidden transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <Link to="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
              <img src="/logo.png" alt="Logo" className="w-9 h-9 object-contain" />
              <span className="font-bold text-lg text-dark">Rizzi</span>
            </Link>
            <button 
              onClick={() => setIsMenuOpen(false)} 
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="Cerrar menú"
            >
              <X size={22} />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Navegación</span>
            <Link
              to="/"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium transition-all ${
                pathname === '/' ? 'text-primary bg-primary/5 font-semibold' : 'text-gray-600 hover:text-primary hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Home size={18} />
              Inicio
            </Link>
            <Link
              to="/favorites"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium transition-all ${
                pathname.startsWith('/favorites') ? 'text-primary bg-primary/5 font-semibold' : 'text-gray-600 hover:text-primary hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Heart size={18} />
              Favoritos
            </Link>
            {isAuthenticated && (
              <Link
                to="/orders"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium transition-all ${
                  pathname.startsWith('/orders') ? 'text-primary bg-primary/5 font-semibold' : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Package size={18} />
                Mis pedidos
              </Link>
            )}
            <Link
              to="/about"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium transition-all ${
                pathname.startsWith('/about') ? 'text-primary bg-primary/5 font-semibold' : 'text-gray-600 hover:text-primary hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Info size={18} />
              Quienes somos
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 space-y-4">
          {isAuthenticated ? (
            <div className="space-y-4">
              <div className="px-3">
                <p className="text-xs text-gray-400">Sesión iniciada como</p>
                <p className="text-sm font-bold text-dark truncate">{user?.user_metadata?.full_name || user?.email}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium transition-all ${
                    pathname.startsWith('/dashboard') ? 'text-primary bg-primary/5 font-semibold' : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard size={18} />
                  Mi Panel
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    setIsMenuOpen(false);
                    await authService.logout();
                    navigate('/login');
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut size={18} />
                  Cerrar sesión
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to="/login"
                className="flex items-center justify-center py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-opacity-90 transition-all text-center shadow-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
