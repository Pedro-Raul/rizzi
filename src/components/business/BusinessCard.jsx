import { Store, MapPin, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const BusinessCard = ({ 
  business, 
  onClick, 
  isSelected = false,
  isFavorite = false,
  onToggleFavorite
}) => {
  
  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(business.id);
    }
  };

  const cardContent = (
    <>
      {/* Portada / Banner */}
      <div className="h-32 bg-gray-200 w-full relative overflow-hidden">
        {business.banner_url ? (
          <img 
            src={business.banner_url} 
            alt={`Portada de ${business.name}`} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
             <Store size={40} className="text-primary/40" />
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col relative">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg text-dark line-clamp-1 pr-8">{business.name}</h3>
          <button 
            onClick={handleFavoriteClick}
            className={`absolute right-4 top-4 p-1.5 rounded-full transition-colors z-10 ${
              isFavorite 
                ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                : 'text-gray-400 bg-gray-50 hover:bg-gray-100 hover:text-red-500'
            }`}
          >
            <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
        
        <p className="text-gray-500 text-sm line-clamp-2 mt-1 mb-4">
          {business.description || 'Sin descripción disponible.'}
        </p>

        <div className="flex items-center gap-1 text-gray-400 text-xs mt-auto">
          <MapPin size={14} />
          <span className="line-clamp-1">{business.address || 'Ubicación no especificada'}</span>
        </div>
      </div>
    </>
  );

  const containerClasses = `bg-white rounded-xl border transition-all group overflow-hidden flex flex-col w-full h-[280px] shadow-sm hover:shadow-md cursor-pointer
    ${isSelected ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-gray-100'}`;

  // Si pasamos onClick, es un div seleccionable (como en la página de inicio rediseñada)
  if (onClick) {
    return (
      <div onClick={() => onClick(business)} className={containerClasses}>
        {cardContent}
      </div>
    );
  }

  // De lo contrario, es un link normal que navega al detalle
  return (
    <Link to={`/business/${business.id}`} className={containerClasses}>
      {cardContent}
    </Link>
  );
};

export default BusinessCard;
