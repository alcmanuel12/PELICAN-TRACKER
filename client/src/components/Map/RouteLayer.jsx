import { useRef, useEffect } from 'react';
import { Polyline, CircleMarker, Popup, useMap } from 'react-leaflet';
import { RUTA_BUS, PARADAS } from '../../utils/routeData';

// Recibimos el ID de la parada que el usuario ha tocado en la lista
export const RouteLayer = ({ activeStopId }) => {
  const lineOptions = { color: '#3b82f6', weight: 6, opacity: 0.8 };
  
  // 1. Guardamos referencias a todos los marcadores del mapa
  const markersRef = useRef({});
  const map = useMap();

  // 2. Efecto: Cuando 'activeStopId' cambie, abrimos el popup y volamos hacia allí
  useEffect(() => {
    if (activeStopId && markersRef.current[activeStopId]) {
      const marker = markersRef.current[activeStopId];
      const paradaInfo = PARADAS.find(p => p.id === activeStopId);
      
      // Abrimos el popup del marcador
      marker.openPopup();
      
      // Hacemos que la cámara viaje suavemente hasta la parada
      if (paradaInfo) {
          map.flyTo(paradaInfo.coords, 16, { animate: true, duration: 1.5 });
      }
    }
  }, [activeStopId, map]);

  return (
    <>
      <Polyline pathOptions={lineOptions} positions={RUTA_BUS} />

      {PARADAS.map((parada) => {
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
            // 3. Asignamos la referencia de este marcador a nuestro diccionario
            ref={(ref) => {
                if (ref) markersRef.current[parada.id] = ref;
            }}
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
};