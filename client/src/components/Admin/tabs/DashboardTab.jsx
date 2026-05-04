import { Users, Clock, MapPin, AlertTriangle } from 'lucide-react';

const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow flex items-center gap-4">
        <div className={`p-3 rounded-lg text-white ${color}`}>{icon}</div>
        <div>
            <h3 className="text-slate-400 text-xs uppercase tracking-wider">{title}</h3>
            <p className="text-xl font-bold text-white truncate max-w-[140px]">{value}</p>
        </div>
    </div>
);

export const DashboardTab = ({ logs, driverCount, getElapsedTime, lastStop }) => (
    <div className="space-y-6 animate-in fade-in duration-300">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard icon={<Users />}         title="Conductores"          value={`${driverCount} Activo${driverCount !== 1 ? 's' : ''}`} color="bg-blue-600" />
            <StatCard icon={<MapPin />}         title="Última parada"        value={lastStop}                                               color="bg-emerald-600" />
            <StatCard icon={<Clock />}          title="Tiempo servicio"      value={getElapsedTime()}                                       color="bg-purple-600" />
            <StatCard icon={<AlertTriangle />}  title="Paradas completadas"  value={`${logs.length}`}                                       color="bg-amber-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-200">
                    📄 Historial de Eventos
                </h2>
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="sticky top-0 bg-slate-800 z-10">
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
);
