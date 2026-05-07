import { useCallback, useEffect, useState } from 'react';
import { Heart, LogIn, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BusinessCard from '../components/business/BusinessCard';
import { favoriteService } from '../services/favorite.service';

const Favorites = () => {
  const { user, isAuthenticated } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadFavorites = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await favoriteService.getFavoriteBusinesses(user.id);

    if (!error && data) {
      const filteredBusinesses = data.filter(Boolean);
      setBusinesses(filteredBusinesses);
      setFavorites(filteredBusinesses.map((business) => business.id));
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadFavorites();
    }
  }, [isAuthenticated, user, loadFavorites]);

  const handleToggleFavorite = async (businessId) => {
    const previousBusinesses = businesses;
    const previousFavorites = favorites;

    setBusinesses((current) => current.filter((business) => business.id !== businessId));
    setFavorites((current) => current.filter((id) => id !== businessId));

    const { error } = await favoriteService.removeFavorite(user.id, businessId);

    if (error) {
      setBusinesses(previousBusinesses);
      setFavorites(previousFavorites);
      console.error('Error removing favorite:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-16">
        <div className="max-w-md w-full bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5">
            <LogIn size={28} />
          </div>
          <h1 className="text-2xl font-bold text-dark mb-3">Inicia sesión para ver tus favoritos</h1>
          <p className="text-gray-500 mb-6">
            Guarda emprendimientos locales y vuelve a ellos cuando quieras.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center bg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 px-4 md:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="text-red-500" fill="currentColor" size={28} />
            <h1 className="text-3xl font-bold text-dark">Mis favoritos</h1>
          </div>
          <p className="text-gray-500">
            Tus emprendimientos guardados para encontrarlos rápido.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse bg-white rounded-xl border border-gray-100 h-[280px] overflow-hidden">
                <div className="h-32 bg-gray-200" />
                <div className="p-4 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : businesses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
                isFavorite={favorites.includes(business.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
            <Store className="mx-auto text-gray-300 mb-4" size={48} />
            <h2 className="text-xl font-bold text-dark mb-2">Aún no tienes favoritos</h2>
            <p className="text-gray-500 mb-6">
              Explora el directorio y marca los negocios que quieras guardar.
            </p>
            <Link
              to="/"
              className="inline-flex bg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Explorar negocios
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
