import { useState, useEffect, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import { MapPin, Navigation, LogOut, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { ChatPanel } from "../UI/Cards/ChatPanel";
import { useStops } from '../../context/StopsContext';
import { API_URL } from '../../utils/api';

const STATUS = {
    connecting:   { label: 'Conectando...',          color: 'text-slate-400',  icon: Loader2,  spin: true  },
    online:       { label: 'En línea',               color: 'text-green-400',  icon: Wifi,     spin: false },
    reconnecting: { label: 'Reconectando...',         color: 'text-yellow-400', icon: Loader2,  spin: true  },
    offline:      { label: 'Sin conexión',            color: 'text-red-400',    icon: WifiOff,  spin: false },
    error:        { label: 'Error de conexión',       color: 'text-red-400',    icon: WifiOff,  spin: false },
};

export const DriverView = ({ onLogout }) => {
    const [socket, setSocket] = useState(null);
    const [statusKey, setStatusKey] = useState('connecting');
    const [confirmedStop, setConfirmedStop] = useState(null);
    const confirmTimerRef = useRef(null);
    const { checkpoints, loading: loadingStops, error: stopsError } = useStops();

    useEffect(() => {
        const newSocket = io(API_URL, { withCredentials: true });
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setStatusKey('online');
            newSocket.emit('driverJoin');
        });
        newSocket.on('disconnect', (reason) => {
            setStatusKey(reason === 'io server disconnect' ? 'offline' : 'reconnecting');
        });
        newSocket.on('connect_error', () => setStatusKey('error'));

        return () => newSocket.disconnect();
    }, []);

    useEffect(() => () => { clearTimeout(confirmTimerRef.current); }, []);

    const handleArrival = useCallback((stopId, stopName) => {
        if (!socket) return;
        socket.emit('driverUpdate', { stopId, stopName });
        if (navigator.vibrate) navigator.vibrate(200);
        clearTimeout(confirmTimerRef.current);
        setConfirmedStop(stopName);
        confirmTimerRef.current = setTimeout(() => setConfirmedStop(null), 3000);
    }, [socket]);

    const { label, color, icon: StatusIcon, spin } = STATUS[statusKey];

    return (
        <div className="min-h-screen bg-slate-800 p-6 flex flex-col items-center gap-6 relative overflow-hidden">

            <div className="w-full max-w-md bg-slate-900/50 p-4 rounded-2xl border border-slate-700 flex justify-between items-center text-white z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Navigation size={24} />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg">Panel Conductor</h1>
                        <p className={`text-xs flex items-center gap-1 ${color}`}>
                            <StatusIcon size={12} className={spin ? 'animate-spin' : ''} />
                            {label}
                        </p>
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

            {confirmedStop && (
                <div className="w-full max-w-md bg-green-600/20 border border-green-500/40 rounded-xl px-4 py-3 flex items-center gap-3 z-10 animate-in slide-in-from-top-3 duration-300">
                    <span className="text-green-400 text-lg">✓</span>
                    <p className="text-green-300 text-sm font-medium">Llegada confirmada: <strong>{confirmedStop}</strong></p>
                </div>
            )}

            <div className="w-full max-w-md grid gap-4 z-10">
                {loadingStops && (
                    <div className="flex items-center justify-center gap-2 text-slate-400 py-8">
                        <Loader2 size={20} className="animate-spin" /> Cargando paradas...
                    </div>
                )}
                {stopsError && (
                    <div className="text-center text-red-400 py-8">{stopsError}</div>
                )}
                {!loadingStops && !stopsError && checkpoints.map((stop) => (
                    <button
                        key={stop.id}
                        onClick={() => handleArrival(stop.id, stop.nombre)}
                        disabled={statusKey !== 'online'}
                        className="group relative overflow-hidden bg-white/10 hover:bg-blue-600 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 p-6 rounded-2xl border border-white/10 text-left shadow-lg"
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
