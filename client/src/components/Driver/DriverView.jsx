import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { MapPin, Navigation, LogOut } from 'lucide-react';
import { ChatPanel } from "../UI/Cards/ChatPanel";
import { useStops } from '../../context/StopsContext';
import { API_URL } from '../../utils/api';

export const DriverView = ({ onLogout }) => {
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState("Conectando...");
  const { checkpoints, loading: loadingStops, error: stopsError } = useStops();

  useEffect(() => {
    const newSocket = io(API_URL, { withCredentials: true });
    setSocket(newSocket);
    setStatus("🟢 En línea");
    newSocket.emit('driverJoin');
    return () => newSocket.disconnect();
  }, []);

  const handleArrival = (stopId, stopName) => {
    if (!socket) return;
    socket.emit('driverUpdate', { stopId, stopName });
    if (navigator.vibrate) navigator.vibrate(200);
    alert(`✅ Confirmada llegada a: ${stopName}`);
  };

  return (
    <div className="min-h-screen bg-slate-800 p-6 flex flex-col items-center gap-6 relative overflow-hidden">

      <div className="w-full max-w-md bg-slate-900/50 p-4 rounded-2xl border border-slate-700 flex justify-between items-center text-white z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Navigation size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg">Panel Conductor</h1>
            <p className="text-xs text-slate-400">{status}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="bg-red-500/20 hover:bg-red-600 text-red-400 hover:text-white p-2 rounded-lg transition-all border border-red-500/30"
          title="Cerrar Sesión"
        >
          <LogOut size={20} />
        </button>
      </div>

      <div className="w-full max-w-md grid gap-4 z-10">
        {loadingStops && (
          <div className="text-center text-slate-400 py-8">Cargando paradas...</div>
        )}
        {stopsError && (
          <div className="text-center text-red-400 py-8">{stopsError}</div>
        )}
        {!loadingStops && !stopsError && checkpoints.map((stop) => (
          <button
            key={stop.id}
            onClick={() => handleArrival(stop.id, stop.nombre)}
            className="group relative overflow-hidden bg-white/10 hover:bg-blue-600 active:scale-95 transition-all duration-200 p-6 rounded-2xl border border-white/10 text-left shadow-lg"
          >
            <div className="flex items-center gap-4 z-10 relative">
              <div className="bg-white/20 p-3 rounded-full text-white group-hover:bg-white group-hover:text-blue-600 transition-colors">
                <MapPin size={28} />
              </div>
              <h2 className="text-xl font-bold text-white">{stop.nombre}</h2>
            </div>
          </button>
        ))}
      </div>

      <div className="text-slate-500 text-sm mt-auto text-center z-10">
        PelicanTracker v1.0 • Solo uso autorizado
      </div>

      <ChatPanel userName="Autobús 1" role="driver" />
    </div>
  );
};
