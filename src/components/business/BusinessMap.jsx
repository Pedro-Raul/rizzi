import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to center map when businesses change
const MapUpdater = ({ businesses }) => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    if (businesses.length > 0) {
      const markers = businesses.filter(b => b.latitude && b.longitude);
      if (markers.length > 0) {
        const bounds = L.latLngBounds(markers.map(b => [b.latitude, b.longitude]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [businesses, map]);
  return null;
};

const BusinessMap = ({ businesses, onBusinessClick }) => {
  const businessesWithLocation = businesses.filter(b => b.latitude && b.longitude);

  return (
    <div className="w-full h-[450px] rounded-xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
      <MapContainer 
        center={[4.6097, -74.0817]} 
        zoom={12} 
        zoomControl={false}
        attributionControl={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater businesses={businessesWithLocation} />
        
        {businessesWithLocation.map(business => (
          <Marker 
            key={business.id} 
            position={[business.latitude, business.longitude]}
            eventHandlers={{
              click: () => onBusinessClick(business)
            }}
          >
            <Popup>
              <div className="text-center p-1">
                <h3 className="font-bold text-dark text-sm">{business.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{business.categories?.name}</p>
                <button 
                  onClick={() => onBusinessClick(business)}
                  className="bg-primary text-white text-xs px-3 py-1 rounded w-full hover:bg-opacity-90 transition-colors"
                >
                  Ver detalles
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default BusinessMap;
