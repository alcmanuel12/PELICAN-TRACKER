import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { RouteLayer } from './RouteLayer';
import { CustomZoomControl } from './CustomZoomControl';
import { BusMarker } from './BusMarker';
// 👇 IMPORTAMOS EL NUEVO COMPONENTE
import { UserLocationMarker } from './UserLocationMarker'; 

// Recibimos darkMode como prop
export const MapView = ({ darkMode, activeStopId }) => {
    const position = [37.4713, -5.6418]; // Coordenadas de Carmona

    return (
        <MapContainer
            center={position}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            className="relative"
        >
            {/* LÓGICA DE AZULEJOS (TILES) */}
            {darkMode ? (
                // MAPA OSCURO (Dark Matter)
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
            ) : (
                // MAPA CLARO (Voyager)
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                
            )}
            <RouteLayer activeStopId={activeStopId} />
            <BusMarker />
            
            <UserLocationMarker />
            
            <CustomZoomControl />
        </MapContainer>
    );
};