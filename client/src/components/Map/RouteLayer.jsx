import { useRef, useEffect, memo } from 'react';
import { Polyline, CircleMarker, Popup, useMap } from 'react-leaflet';
import { RUTA_BUS } from '../../utils/routeData';
import { useStops } from '../../context/StopsContext';

export const RouteLayer = memo(({ activeStopId }) => {
  const lineOptions = { color: '#3b82f6', weight: 6, opacity: 0.8 };
  const { stops: paradas } = useStops();
  const markersRef = useRef({});
  const map = useMap();

  useEffect(() => {
    if (activeStopId && markersRef.current[activeStopId]) {
      const marker = markersRef.current[activeStopId];
      const paradaInfo = paradas.find(p => p.id === activeStopId);
      marker.openPopup();
      if (paradaInfo) map.flyTo(paradaInfo.coords, 16, { animate: true, duration: 1.5 });
    }
  }, [activeStopId, map, paradas]);

  return (
    <>
      <Polyline pathOptions={lineOptions} positions={RUTA_BUS} />

      {paradas.map((parada) => {
        const isMain = parada.isCheckpoint;

        return (
          <CircleMarker
            key={parada.id}
            center={parada.coords}
            pathOptions={{
              color: 'white',
              fillColor: isMain ? '#1e40af' : '#0ea5e9',
              fillOpacity: 1,
              weight: isMain ? 3 : 2
            }}
            radius={isMain ? 8 : 6}
            ref={(ref) => { if (ref) markersRef.current[parada.id] = ref; }}
          >
            <Popup className="custom-popup">
              <div className="font-sans px-3 py-1 flex items-center justify-center">
                <span className="text-base font-bold text-slate-800 tracking-tight whitespace-nowrap">
                  {parada.nombre}
                </span>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
});
