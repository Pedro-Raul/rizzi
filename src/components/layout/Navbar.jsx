import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/favorites', label: 'Favoritos' },
  { to: '/about', label: 'Quiénes somos' }
];

const Navbar = () => {
  const { isAuthenticated } = useAuth();
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
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className={getLinkClass(link.to)}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
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
                ? 'text-primary font-medium transition-colors hidden sm:block'
                : 'text-gray-600 hover:text-primary font-medium transition-colors hidden sm:block'}
            >
              Iniciar sesión
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
