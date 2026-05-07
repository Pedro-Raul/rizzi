import { useState, useEffect, useCallback } from 'react';
import { MapPin, Store, Heart, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { businessService } from '../services/business.service';
import { favoriteService } from '../services/favorite.service';
import BusinessCard from '../components/business/BusinessCard';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const { data: businessData } = await businessService.getBusinesses();
    if (businessData) setBusinesses(businessData);

    if (isAuthenticated && user) {
      const { data: favoriteData } = await favoriteService.getUserFavorites(user.id);
      if (favoriteData) setFavorites(favoriteData);
    }

    setLoading(false);
  }, [isAuthenticated, user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handleToggleFavorite = async (businessId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const isFav = favorites.includes(businessId);

    setFavorites((previous) =>
      isFav ? previous.filter((id) => id !== businessId) : [...previous, businessId]
    );

    const { error } = await favoriteService.toggleFavorite(user.id, businessId, isFav);

    if (error) {
      setFavorites((previous) =>
        isFav ? [...previous, businessId] : previous.filter((id) => id !== businessId)
      );
      console.error('Error toggling favorite:', error);
    }
  };

  const handleCardClick = (business) => {
    setSelectedBusiness((current) => current?.id === business.id ? null : business);
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden h-[calc(100vh-73px)] bg-[#F3F1FB]">
      <div className="flex h-full w-full">
        <div className={`flex-1 overflow-y-auto transition-all duration-300 ${selectedBusiness ? 'md:pr-[350px] lg:pr-[400px]' : ''}`}>
          <section className="py-12 md:py-20 px-6">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-dark mb-4">
                Apoya a emprendedores locales
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-xl">
                Encuentra pequeños negocios y emprendimientos de tu comunidad. Descubre qué tienen para ofrecerte.
              </p>

              <button
                onClick={() => document.getElementById('directorio').scrollIntoView({ behavior: 'smooth' })}
                className="bg-primary text-white font-bold px-8 py-3 rounded-lg hover:bg-opacity-90 transition-colors shadow-sm"
              >
                Explorar
              </button>
            </div>
          </section>

          <section id="directorio" className="px-6 pb-12 max-w-6xl mx-auto w-full">
            <div className="border-t border-primary/20 pt-4 flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-dark">Emprendimientos Destacados</h2>
              <button
                onClick={fetchData}
                className="text-primary border border-primary/50 hover:bg-primary/10 px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
              >
                Actualizar
              </button>
            </div>

            {loading ? (
              <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="animate-pulse bg-white rounded-xl border border-gray-100 overflow-hidden min-w-[280px] w-[280px] h-[280px] shrink-0 snap-start">
                    <div className="h-32 bg-gray-200 w-full"></div>
                    <div className="p-5">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : businesses.length > 0 ? (
              <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar">
                {businesses.map((business) => (
                  <div key={business.id} className="min-w-[280px] w-[280px] shrink-0 snap-start">
                    <BusinessCard
                      business={business}
                      onClick={handleCardClick}
                      isSelected={selectedBusiness?.id === business.id}
                      isFavorite={favorites.includes(business.id)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/70 rounded-xl border border-dashed border-gray-300">
                <Store className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-dark mb-1">Aún no hay negocios</h3>
                <p className="text-gray-500">Sé el primero en registrar tu negocio en nuestra plataforma.</p>
              </div>
            )}
          </section>
        </div>

        <div className={`
          fixed inset-y-[73px] right-0 w-full md:w-[350px] lg:w-[400px] bg-white border-l border-gray-200 shadow-2xl transform transition-transform duration-300 ease-in-out z-40 overflow-y-auto flex flex-col
          ${selectedBusiness ? 'translate-x-0' : 'translate-x-full'}
        `}>
          {selectedBusiness && (
            <>
              <div className="h-48 relative bg-secondary">
                {selectedBusiness.banner_url && (
                  <img src={selectedBusiness.banner_url} alt={selectedBusiness.name} className="w-full h-full object-cover opacity-90" />
                )}
                <button
                  onClick={() => setSelectedBusiness(null)}
                  className="absolute top-4 right-4 bg-white/80 hover:bg-white text-dark p-2 rounded-full shadow-sm backdrop-blur-sm transition-all z-10"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 flex-1 flex flex-col relative -mt-8">
                <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 relative z-10 mb-6 flex flex-col gap-2">
                  <h2 className="text-2xl font-bold text-dark">{selectedBusiness.name}</h2>

                  {selectedBusiness.categories && (
                    <span className="text-sm font-medium text-gray-500">
                      {selectedBusiness.categories.name}
                    </span>
                  )}

                  <div className="flex items-start gap-2 text-gray-500 text-sm mt-2">
                    <MapPin size={16} className="shrink-0 mt-0.5" />
                    <span>{selectedBusiness.address || 'Ubicación no especificada'}</span>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-dark mb-2">Acerca del negocio</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    {selectedBusiness.description || 'Este negocio aún no ha añadido una descripción detallada.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                  <button
                    onClick={() => handleToggleFavorite(selectedBusiness.id)}
                    className={`p-3 rounded-full transition-colors border ${
                      favorites.includes(selectedBusiness.id)
                        ? 'text-red-500 bg-red-50 border-red-100 hover:bg-red-100'
                        : 'text-gray-400 bg-white border-gray-200 hover:bg-gray-50 hover:text-red-500'
                    }`}
                  >
                    <Heart size={20} fill={favorites.includes(selectedBusiness.id) ? 'currentColor' : 'none'} />
                  </button>

                  <button
                    onClick={() => navigate(`/business/${selectedBusiness.id}`)}
                    className="bg-primary text-white font-medium py-3 px-6 rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-sm flex-1 ml-4 justify-center"
                  >
                    Ver más
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Home;
