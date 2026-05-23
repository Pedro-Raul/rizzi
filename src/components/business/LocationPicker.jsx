import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

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

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
};

const LocationPicker = ({ latitude, longitude, onChange }) => {
  const [position, setPosition] = useState(
    latitude && longitude ? { lat: latitude, lng: longitude } : null
  );

  const defaultCenter = [4.6097, -74.0817];
  
  const handlePositionChange = useCallback((newPos) => {
    setPosition(newPos);
    if (newPos) {
      onChange({ latitude: newPos.lat, longitude: newPos.lng });
    } else {
      onChange({ latitude: null, longitude: null });
    }
  }, [onChange]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <MapPin size={18} className="text-primary" />
        <span className="text-sm font-medium text-gray-700">Ubicación en el mapa</span>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Haz clic en el mapa para marcar la ubicación exacta de tu negocio.
      </p>
      
      <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-300 relative z-0">
        <MapContainer 
          center={position || defaultCenter} 
          zoom={position ? 15 : 12} 
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={handlePositionChange} />
        </MapContainer>
      </div>
      
      {position && (
        <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded border border-green-100 flex items-center gap-2">
          <MapPin size={14} /> Ubicación guardada: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
          <button 
            type="button" 
            onClick={() => handlePositionChange(null)}
            className="ml-auto text-red-500 hover:underline"
          >
            Quitar
          </button>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
