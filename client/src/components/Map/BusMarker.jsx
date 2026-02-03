import { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';

// 1. CREAMOS UN ICONO PERSONALIZADO (Para que no sea el pin azul aburrido)
// Usamos un emoji de autobús dentro de un DivIcon. Es rápido y efectivo.
const busIcon = L.divIcon({
    html: `
        <div style="
        background-color: white; 
        border-radius: 50%; 
        width: 35px; 
        height: 35px; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        box-shadow: 0 3px 6px rgba(0,0,0,0.4);
        font-size: 20px;
    ">
        🚌
    </div>
    `,
    className: '', // Dejamos esto vacío para quitar estilos por defecto de Leaflet
    iconSize: [35, 35],
    iconAnchor: [17, 17], // El punto del mapa está en el centro del icono
    popupAnchor: [0, -20] // El popup sale un poco más arriba
});

export const BusMarker = () => {
    const [position, setPosition] = useState(null);

    useEffect(() => {
    // 2. CONECTAMOS CON EL SERVIDOR
    // Nos conectamos al puerto 3000 donde está la "radio" emitiendo
    const socket = io('http://localhost:3000');

    // 3. ESCUCHAMOS EL EVENTO
    socket.on('busLocation', (newPosition) => {
      // newPosition llega como [lat, lng]
        setPosition(newPosition);
    });

    // 4. LIMPIEZA
    // Si cierras el componente, nos desconectamos para no dejar "fugas"
    return () => {
        socket.disconnect();
    };
    }, []);

  // Si aún no tenemos posición (el primer milisegundo), no pintamos nada
    if (!position) return null;

    return (
        <Marker position={position} icon={busIcon} zIndexOffset={1000}>
        <Popup>
            <div className="text-center">
            <strong className="text-blue-600 block">Línea 1</strong>
            <span>En movimiento... 🚍</span>
            </div>
        </Popup>
        </Marker>
    );
};