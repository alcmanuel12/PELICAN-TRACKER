import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Estilos obligatorios de Leaflet

export const MapView = () => {
  // Coordenadas iniciales (Centro de carmona por ejemplo)
    const position = [37.4713, -5.6418];

    return (
        <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }} // Ocupa toda la pantalla
        zoomControl={false} // Quitamos el zoom por defecto
        >
        <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        </MapContainer>
    );
};