import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { RouteLayer } from './RouteLayer';

const MapController = ({ setMapInstance }) => {
    const map = useMap();

    useEffect(() => {
        setMapInstance(map);
    }, [map, setMapInstance]);

    return null;
};

export const MapView = ({ setMapInstance }) => {
    const position = [37.4713, -5.6418];

    return (
        <MapContainer
            center={position}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap'
            />
            <RouteLayer />
            <MapController setMapInstance={setMapInstance} />
        </MapContainer>
    );
};