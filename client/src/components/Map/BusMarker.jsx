import { useEffect, useState, useRef } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import { PARADAS, RUTA_BUS } from '../../utils/routeData';

// 1. ICONO MÁS GRANDE Y LIMPIO (CON GIRO SUAVE)
const busIcon = L.divIcon({
    html: `
        <img 
            src="https://res.cloudinary.com/din119ww9/image/upload/v1771321969/Gemini_Generated_Image_3a0znq3a0znq3a0z_1_gkm9rk.png" 
            alt="Bus PelicanTracker" 
            style="
                width: 100%; 
                height: 100%; 
                object-fit: contain; 
                filter: drop-shadow(0 4px 4px rgba(0,0,0,0.5));
                /* Transición más lenta para giros súper suaves */
                transition: transform 0.8s ease-in-out; 
                transform-origin: center center;
            "
            class="bus-img-rotatable"
        />
    `,
    className: '', 
    iconSize: [80, 80],      // Tamaño ampliado
    iconAnchor: [40, 40],    
    popupAnchor: [0, -40]    
});

export const BusMarker = () => {
    const [currentIndex, setCurrentIndex] = useState(0); 
    const [targetIndex, setTargetIndex] = useState(0);
    const [nextStopName, setNextStopName] = useState("En base");
    
    const map = useMap();
    const markerRef = useRef(null);

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

    // 2. CÁLCULO DE ÁNGULO CON TU CORRECCIÓN DE 270 GRADOS 📐🔄
    const calculateRotationAngle = (currentPos, nextPos) => {
        if (!currentPos || !nextPos) return 0;
        
        const dy = nextPos[0] - currentPos[0]; 
        const dx = nextPos[1] - currentPos[1]; 
        
        let angleRad = Math.atan2(dy, dx);
        let angleDeg = angleRad * (180 / Math.PI);

        // Corrección de 270 grados para el asset de Cloudinary
        let correctedAngle = angleDeg + 270;

        return -correctedAngle; 
    };

    useEffect(() => {
        const socket = io('http://localhost:3000', { transports: ['websocket', 'polling'] });

        socket.on('busUpdate', (data) => {
            const paradaDestino = PARADAS.find(p => p.id === data.stopId);
            if (paradaDestino) {
                setNextStopName(paradaDestino.nombre);
                const newTarget = getClosestRouteIndex(paradaDestino.coords[0], paradaDestino.coords[1]);
                setTargetIndex(newTarget);
            }
        });

        return () => {
            socket.off('busUpdate');
            socket.disconnect();
        };
    }, []);

    // 5. MOTOR DE ANIMACIÓN Y ROTACIÓN (CON LOOK-AHEAD) 🚌🔄
    useEffect(() => {
        if (currentIndex === targetIndex) return;

        // --- A. CÁLCULO DE ROTACIÓN CON "LOOK-AHEAD" (AMORTIGUADOR) ---
        // Miramos 5 puntos más adelante para ignorar los baches del GeoJSON
        let lookAheadIndex = currentIndex + 5; 
        
        // Si nos pasamos del final de la ruta, damos la vuelta al circuito
        if (lookAheadIndex >= RUTA_BUS.length) {
            lookAheadIndex = lookAheadIndex - RUTA_BUS.length;
        }

        const angle = calculateRotationAngle(RUTA_BUS[currentIndex], RUTA_BUS[lookAheadIndex]);

        if (markerRef.current) {
            const imgElement = markerRef.current.getElement().querySelector('.bus-img-rotatable');
            if (imgElement) {
                imgElement.style.transform = `rotateZ(${angle}deg)`;
            }
        }

        // --- B. AVANCE DE POSICIÓN ---
        const SPEED_MS = 150; // Velocidad de avance relajada
        const timer = setTimeout(() => {
            setCurrentIndex((prev) => {
                if (prev < targetIndex) return prev + 1;
                if (prev > targetIndex) {
                    return prev < RUTA_BUS.length - 1 ? prev + 1 : 0;
                }
                return prev;
            });
        }, SPEED_MS);

        return () => clearTimeout(timer);
    }, [currentIndex, targetIndex]);

    useEffect(() => {
        const currentPos = RUTA_BUS[currentIndex];
        if (currentPos) {
            map.panTo(currentPos, { animate: true, duration: 0.5 });
        }
    }, [currentIndex, map]);

    if (!RUTA_BUS || RUTA_BUS.length === 0) return null;
    const currentPos = RUTA_BUS[currentIndex] || RUTA_BUS[0];

    return (
        <Marker ref={markerRef} position={currentPos} icon={busIcon} zIndexOffset={1000}>
            <Popup>
                <div className="text-center font-sans">
                    <strong className="text-blue-600 block uppercase tracking-wider text-xs">PelicanTracker Circular</strong>
                    <div className="mt-1">
                        <span className="text-slate-500 text-xs uppercase">Próxima parada:</span><br/>
                        <span className="text-base font-bold text-slate-800 leading-tight">
                            {nextStopName}
                        </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-100">
                        Progreso ruta: {Math.round((currentIndex / RUTA_BUS.length) * 100)}%
                    </div>
                </div>
            </Popup>
        </Marker>
    );
};