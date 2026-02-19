import { useState } from 'react';
import { Marker, Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LocateFixed } from 'lucide-react';

// 1. EL ICONO DEL USUARIO (Un punto azul estilo Google Maps)
const userIcon = L.divIcon({
    html: `
        <div style="
            background-color: #3b82f6; 
            width: 16px; 
            height: 16px; 
            border-radius: 50%; 
            border: 3px solid white; 
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
        "></div>
    `,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
});

export const UserLocationMarker = () => {
    const [position, setPosition] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const map = useMap();

    const preventPropagation = (e) => {
        e.stopPropagation();
    };

    const handleLocate = (e) => {
        preventPropagation(e);
        
        if (!navigator.geolocation) {
            alert("Tu navegador no soporta geolocalización. 🚫");
            return;
        }

        setIsTracking(true); 

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                const newPos = [latitude, longitude];
                
                setPosition(newPos); 
                map.flyTo(newPos, 16, { animate: true, duration: 1.5 }); 
                setIsTracking(false);
            },
            (err) => {
                console.warn("Error de Geolocalización:", err);
                // Mensajes de error detallados para saber qué pasa
                let msg = "No pudimos obtener tu ubicación.";
                if (err.code === 1) msg = "Permiso denegado. Haz clic en el candado de la barra de direcciones y permite la ubicación.";
                if (err.code === 2) msg = "Ubicación no disponible";
                if (err.code === 3) msg = "Se agoto el tiempo de espera buscando el GPS.";
                
                alert(msg);
                setIsTracking(false);
            },
            { 
                enableHighAccuracy: false, // LO CAMBIAMOS A FALSE (Ayuda mucho en PCs)
                timeout: 10000,            // Le damos 10 segundos máximo para buscar
                maximumAge: 0 
            }
        );
    };

    return (
        <>
            {/* 2. EL BOTÓN FLOTANTE (Justo encima de los controles de zoom) */}
            <div 
                className="absolute bottom-40 right-6 z-[1000]"
                onDoubleClick={preventPropagation}
                onMouseDown={preventPropagation}
            >
                <button
                    onClick={handleLocate}
                    disabled={isTracking}
                    className={`p-3 rounded-full shadow-lg transition-all flex items-center justify-center ${
                        isTracking 
                            ? 'bg-blue-700 text-white animate-pulse' 
                            : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
                    }`}
                    title="Mi Ubicación"
                >
                    <LocateFixed size={24} />
                </button>
            </div>

            {/* 3. EL MARCADOR EN EL MAPA (Punto azul + Halo de precisión) */}
            {position && (
                <>
                    {/* Halo azul de precisión (opcional pero queda muy pro) */}
                    <Circle 
                        center={position} 
                        radius={40} 
                        pathOptions={{ fillColor: '#3b82f6', fillOpacity: 0.15, color: 'transparent' }} 
                    />
                    {/* Puntito azul central */}
                    <Marker position={position} icon={userIcon} zIndexOffset={900}>
                        <Popup>
                            <span className="font-bold text-slate-700">📍 Estás aquí</span>
                        </Popup>
                    </Marker>
                </>
            )}
        </>
    );
};