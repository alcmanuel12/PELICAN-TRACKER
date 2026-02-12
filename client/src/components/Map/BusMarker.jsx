import { useEffect, useState } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import { PARADAS, RUTA_BUS } from '../../utils/routeData';

// 1. ICONO DEL AUTOBÚS
const busIcon = L.divIcon({
    html: `
        <div style="
        background-color: #2bb4f9; 
        border: 2px solid white;
        border-radius: 50%; 
        width: 35px; 
        height: 35px; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        box-shadow: 0 4px 8px rgba(0,0,0,0.4);
        font-size: 20px;
        cursor: pointer;
        z-index: 1000;
        transition: all 0.1s linear; /* Suavizado CSS extra */
    ">
        🚌
    </div>
    `,
    className: '', 
    iconSize: [35, 35],
    iconAnchor: [17, 17], 
    popupAnchor: [0, -20] 
});

export const BusMarker = () => {
    // --- ESTADOS ---
    const [currentIndex, setCurrentIndex] = useState(0); 
    const [targetIndex, setTargetIndex] = useState(0);
    const [nextStopName, setNextStopName] = useState("En base");
    
    const map = useMap();

    // 2. FUNCIÓN DE CÁLCULO DE RUTA
    const getClosestRouteIndex = (lat, lng) => {
        if (!RUTA_BUS || RUTA_BUS.length === 0) return 0;
        let minDistance = Infinity;
        let closestIndex = 0;
        RUTA_BUS.forEach((coord, index) => {
            const dist = Math.sqrt(Math.pow(coord[0] - lat, 2) + Math.pow(coord[1] - lng, 2));
            if (dist < minDistance) {
                minDistance = dist;
                closestIndex = index;
            }
        });
        return closestIndex;
    };

    // 3. CONEXIÓN SOCKET
    useEffect(() => {
        const socket = io('http://localhost:3000', { transports: ['websocket', 'polling'] });

        socket.on('busUpdate', (data) => {
            const paradaDestino = PARADAS.find(p => p.id === data.stopId);
            if (paradaDestino) {
                setNextStopName(paradaDestino.nombre);
                // Calculamos nuevo destino
                const newTarget = getClosestRouteIndex(paradaDestino.coords[0], paradaDestino.coords[1]);
                setTargetIndex(newTarget);
            }
        });

        return () => {
            socket.off('busUpdate');
            socket.disconnect();
        };
    }, []);

    // 4. MOTOR DE ANIMACIÓN SUAVE 🐢
    useEffect(() => {
        if (currentIndex === targetIndex) return;

        // AJUSTE DE VELOCIDAD
        // 20ms = Rápido | 50ms = Normal | 100ms = Lento (Paseo turístico)
        const SPEED_MS = 50; 

        const timer = setTimeout(() => {
            setCurrentIndex((prev) => {
                let next = prev;
                if (prev < targetIndex) next = prev + 1;
                if (prev > targetIndex) next = prev - 1;
                return next;
            });
        }, SPEED_MS);

        return () => clearTimeout(timer);
    }, [currentIndex, targetIndex]);

    // 5. CÁMARA DE SEGUIMIENTO 🎥
    useEffect(() => {
        const currentPos = RUTA_BUS[currentIndex];
        if (currentPos) {
            // El mapa se mueve suavemente para seguir al autobús
            map.panTo(currentPos, { animate: true, duration: 0.5 });
        }
    }, [currentIndex, map]);

    if (!RUTA_BUS || RUTA_BUS.length === 0) return null;

    const currentPos = RUTA_BUS[currentIndex] || RUTA_BUS[0];

    return (
        <Marker position={currentPos} icon={busIcon} zIndexOffset={1000}>
            <Popup>
                <div className="text-center">
                    <strong className="text-blue-600 block">Línea Circular</strong>
                    <span className="text-sm font-bold text-slate-700">
                        Próxima: {nextStopName}
                    </span>
                    <div className="text-xs text-slate-400 mt-1">
                        Ruta: {Math.round((currentIndex / RUTA_BUS.length) * 100)}%
                    </div>
                </div>
            </Popup>
        </Marker>
    );
};