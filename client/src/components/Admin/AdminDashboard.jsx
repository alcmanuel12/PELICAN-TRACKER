import { useState, useEffect, useRef } from 'react';
import { Users, Clock, MapPin, AlertTriangle, LogOut, Activity, Bell, Send, LayoutDashboard, Trash2 } from 'lucide-react';
import io from 'socket.io-client';
import { ChatPanel } from "../UI/Cards/ChatPanel";
export const AdminDashboard = ({ user, onLogout }) => {
    
    // --- ESTADOS GENERALES ---
    const [activeTab, setActiveTab] = useState('dashboard'); 
    const [logs, setLogs] = useState([]);
    const [driverCount, setDriverCount] = useState(0);

    // --- ESTADOS DE ALERTA ---
    const [alertMsg, setAlertMsg] = useState("");
    const [alertType, setAlertType] = useState('info'); // Solo 'info' o 'warning'
    const [isSending, setIsSending] = useState(false);

    // --- CONEXIÓN SOCKET ---
    const socketRef = useRef();

    useEffect(() => {
        socketRef.current = io('http://localhost:3000');

        socketRef.current.on('driverCountUpdate', (count) => {
            setDriverCount(count);
        });
        
        socketRef.current.on('adminLog', (newLog) => {
            setLogs((prevLogs) => [newLog, ...prevLogs]);
        });

        return () => socketRef.current.disconnect();
    }, []);

    // ACCIÓN 1: ENVIAR AVISO
    const handleSendAlert = () => {
        if (!alertMsg.trim()) return;
        setIsSending(true);
        
        socketRef.current.emit('adminMessage', { 
            msg: alertMsg, 
            type: alertType 
        });
        
        setTimeout(() => {
            alert("✅ Aviso publicado correctamente.");
            setIsSending(false);
        }, 500);
    };

    // ACCIÓN 2: BORRAR AVISO
    const handleClearAlert = () => {
        if (confirm("¿Seguro que quieres retirar el aviso de todos los usuarios?")) {
            socketRef.current.emit('adminClearAlert');
            alert("🗑️ Aviso retirado.");
        }
    };

    return (
        // Le añadimos 'relative' al contenedor principal para que el chat flote correctamente
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col relative overflow-hidden">
            
            {/* ENCABEZADO */}
            <header className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Activity className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Panel de Control</h1>
                        <p className="text-xs text-slate-400">Hola, {user?.name || "Administrador"}</p>
                    </div>
                </div>
                
                <button 
                    onClick={onLogout}
                    className="bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 p-2 rounded-lg transition-all flex items-center gap-2 border border-red-500/20"
                >
                    <LogOut size={18} /> <span className="hidden sm:inline">Salir</span>
                </button>
            </header>

            {/* PESTAÑAS */}
            <div className="flex border-b border-slate-700 bg-slate-800/50 px-6 gap-6">
                <TabButton 
                    active={activeTab === 'dashboard'} 
                    onClick={() => setActiveTab('dashboard')} 
                    icon={<LayoutDashboard size={18} />} 
                    label="Torre de Control" 
                />
                <TabButton 
                    active={activeTab === 'alerts'} 
                    onClick={() => setActiveTab('alerts')} 
                    icon={<Bell size={18} />} 
                    label="Gestión de Avisos" 
                />
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 p-6 overflow-y-auto">
                
                {/* === VISTA 1: DASHBOARD === */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <StatCard icon={<Users />} title="Conductores" value={`${driverCount} Activo${driverCount !== 1 ? 's' : ''}`} color="bg-blue-600" />
                            <StatCard icon={<MapPin />} title="Ubicación Bus" value="En ruta" color="bg-emerald-600" />
                            <StatCard icon={<Clock />} title="Tiempo Servicio" value="02:15 h" color="bg-purple-600" />
                            <StatCard icon={<AlertTriangle />} title="Incidencias" value="0" color="bg-amber-600" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-200">
                                    📄 Historial de Eventos
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="text-slate-500 border-b border-slate-700 uppercase text-xs">
                                                <th className="p-3">Hora</th>
                                                <th className="p-3">Evento</th>
                                                <th className="p-3">Usuario</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700/50">
                                            {logs.length === 0 ? (
                                                <tr><td colSpan="3" className="p-4 text-center text-slate-500">Esperando actividad...</td></tr>
                                            ) : (
                                                logs.map((log) => (
                                                    <tr key={log.id} className="hover:bg-slate-700/30">
                                                        <td className="p-3 font-mono text-slate-400">{log.time}</td>
                                                        <td className="p-3 font-medium text-slate-200">{log.event}</td>
                                                        <td className="p-3 text-slate-400">{log.user}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg h-fit">
                                <h2 className="text-lg font-bold mb-4 text-slate-200">Estado del Sistema</h2>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between p-3 bg-slate-900/50 rounded border border-slate-700">
                                        <span className="text-slate-400">Servidor</span>
                                        <span className="text-green-400 font-bold">ONLINE ●</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-slate-900/50 rounded border border-slate-700">
                                        <span className="text-slate-400">Base de Datos</span>
                                        <span className="text-green-400 font-bold">CONECTADA ●</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* === VISTA 2: GESTOR DE AVISOS === */}
                {activeTab === 'alerts' && (
                    <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-300">
                        
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-white">📢 Publicar Aviso Global</h2>
                            <p className="text-slate-400">Escribe un mensaje para todos los pasajeros.</p>
                        </div>

                        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Bell size={150} />
                            </div>

                            <div className="flex gap-4 mb-4">
                                <button 
                                    onClick={() => setAlertType('info')}
                                    className={`flex-1 p-3 rounded-lg border-2 font-bold transition-all ${alertType === 'info' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-700 border-transparent text-slate-400'}`}
                                >
                                    ℹ️ Info
                                </button>
                                <button 
                                    onClick={() => setAlertType('warning')}
                                    className={`flex-1 p-3 rounded-lg border-2 font-bold transition-all ${alertType === 'warning' ? 'bg-yellow-500 border-yellow-300 text-black' : 'bg-slate-700 border-transparent text-slate-400'}`}
                                >
                                    ⚠️ Aviso
                                </button>
                            </div>

                            <textarea 
                                value={alertMsg}
                                onChange={(e) => setAlertMsg(e.target.value)}
                                placeholder="Escribe el mensaje aquí..."
                                className="w-full h-32 bg-slate-900 border border-slate-600 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none mb-4"
                            />

                            <div className="flex gap-4">
                                <button 
                                    onClick={handleClearAlert}
                                    className="px-6 py-3 rounded-xl font-bold text-red-400 border border-red-900 hover:bg-red-900/30 flex items-center gap-2 transition-colors"
                                >
                                    <Trash2 size={18} /> Retirar
                                </button>

                                <button 
                                    onClick={handleSendAlert}
                                    disabled={!alertMsg.trim() || isSending}
                                    className={`flex-1 flex justify-center items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
                                        isSending ? 'opacity-50 cursor-wait' : 'hover:scale-[1.02]'
                                    } ${
                                        alertType === 'warning' ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-500/20' :
                                        'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
                                    }`}
                                >
                                    {isSending ? 'Enviando...' : (
                                        <>
                                            <Send size={18} /> Publicar Aviso
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* VISTA PREVIA */}
                        {alertMsg && (
                            <div className="space-y-2">
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Vista Previa (Usuario):</p>
                                <div className={`p-4 rounded-lg shadow-lg border-l-4 flex gap-3 max-w-sm mx-auto bg-white text-slate-800 ${
                                    alertType === 'warning' ? 'border-yellow-500' : 'border-blue-500'
                                }`}>
                                    <AlertTriangle className={`shrink-0 ${
                                        alertType === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                                    }`} />
                                    <div>
                                        <strong className="block font-bold">
                                            {alertType === 'warning' ? 'AVISO IMPORTANTE' : 'INFORMACIÓN'}
                                        </strong>
                                        <p className="text-sm">{alertMsg}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* 👇 AQUÍ AÑADIMOS EL PANEL DE CHAT PARA EL ADMINISTRADOR */}
            <ChatPanel userName={user?.name || "Central de Control"} role="admin" />

        </div>
    );
};

// --- COMPONENTES AUXILIARES UI ---
const TabButton = ({ active, onClick, icon, label }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors font-medium text-sm ${
        active 
            ? 'border-blue-500 text-blue-400' 
            : 'border-transparent text-slate-400 hover:text-slate-200'
        }`}
    >
        {icon} {label}
    </button>
);

const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow flex items-center gap-4">
        <div className={`p-3 rounded-lg text-white ${color}`}>
            {icon}
        </div>
        <div>
            <h3 className="text-slate-400 text-xs uppercase tracking-wider">{title}</h3>
            <p className="text-xl font-bold text-white">{value}</p>
        </div>
    </div>
);