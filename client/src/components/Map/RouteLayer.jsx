import { Polyline, CircleMarker, Popup } from 'react-leaflet';
import { RUTA_BUS, PARADAS } from '../../utils/routeData';

export const RouteLayer = () => {
  const limeOptions = { color: '#3b82f6', weight: 6, opacity: 0.8 };

  return (
    <>
      <Polyline pathOptions={limeOptions} positions={RUTA_BUS} />

      {PARADAS.map((parada) => (
        <CircleMarker
          key={parada.id}
          center={parada.coords}
          pathOptions={{ color: 'white', fillColor: '#0ea5e9', fillOpacity: 1, weight: 2 }}
          radius={6}
        >
          <Popup>{parada.nombre}</Popup>
        </CircleMarker>
      ))}
    </>
  );
};