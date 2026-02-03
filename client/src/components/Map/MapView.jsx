import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { RouteLayer } from './RouteLayer';
import { CustomZoomControl } from './CustomZoomControl';
import { BusMarker } from './BusMarker';

export const MapView = ({ setMapInstance }) => {
    const position = [37.4713, -5.6418];

    return (
        <MapContainer
            center={position}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            className="relative"
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap'
            />

            <RouteLayer />
            <BusMarker />
            <CustomZoomControl />
        </MapContainer>
    );
};