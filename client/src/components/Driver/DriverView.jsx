import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { GlassCard } from '../UI/GlassCard'; 
// 1. AÑADIDO: Importamos el icono LogOut
import { MapPin, Navigation, LogOut } from 'lucide-react';

// 2. AÑADIDO: Recibimos la función { onLogout } como prop
export const DriverView = ({ onLogout }) => {
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState("Conectando...");

  const checkpoints = [
    { id: 2, name: "Plaza de San Fernando", time: "Salida" },
    { id: 8, name: "Hytasa", time: "+15 min" },
    { id: 17, name: "Cibeles", time: "+30 min" },
    { id: 22, name: "San Antón", time: "+40 min" }
  ];

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);
    setStatus("🟢 En línea");

    return () => newSocket.disconnect();
  }, []);

  const handleArrival = (stopId, stopName) => {
    if (!socket) return;
    
    console.log(`Llegada confirmada a: ${stopName}`);
    socket.emit('driverUpdate', { stopId }); 

    if (navigator.vibrate) navigator.vibrate(200);
    alert(`✅ Confirmada llegada a: ${stopName}`);
  };

  return (
    <div className="min-h-screen bg-slate-800 p-6 flex flex-col items-center gap-6">
      
      {/* --- ENCABEZADO --- */}
      <div className="w-full max-w-md bg-slate-900/50 p-4 rounded-2xl border border-slate-700 flex justify-between items-center text-white">
        
        {/* Lado Izquierdo: Título y Estado */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Navigation size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg">Panel Conductor</h1>
            <p className="text-xs text-slate-400">{status}</p>
          </div>
        </div>

        {/* 3. Lado Derecho: BOTÓN DE SALIR (Reemplaza al reloj) */}
        <button 
          onClick={onLogout}
          className="bg-red-500/20 hover:bg-red-600 text-red-400 hover:text-white p-2 rounded-lg transition-all border border-red-500/30 flex flex-col items-center justify-center"
          title="Cerrar Sesión"
        >
          <LogOut size={20} />
        </button>

      </div>

      {/* --- BOTONERA DE CONTROL (Se mantiene igual) --- */}
      <div className="w-full max-w-md grid gap-4">
        {checkpoints.map((stop) => (
          <button
            key={stop.id}
            onClick={() => handleArrival(stop.id, stop.name)}
            className="group relative overflow-hidden bg-white/10 hover:bg-blue-600 active:scale-95 transition-all duration-200 p-6 rounded-2xl border border-white/10 text-left shadow-lg"
          >
            <div className="flex justify-between items-center z-10 relative">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full text-white group-hover:bg-white group-hover:text-blue-600 transition-colors">
                  <MapPin size={28} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">{stop.name}</h2>
                  <span className="text-sm text-slate-300 bg-slate-900/40 px-2 py-1 rounded">
                    {stop.time}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="text-slate-500 text-sm mt-auto text-center">
        PelicanTracker v1.0 • Solo uso autorizado
      </div>
    </div>
  );
};