import { GlassCard } from '../GlassCard';
import { PARADAS } from '../../../utils/routeData';
import { MapPin } from 'lucide-react';

// 👇 1. Recibimos onStopClick
export const StopsListCard = ({ t, onStopClick }) => {
    const safeT = t || {};

    if (!PARADAS) return <div className="p-4 bg-red-100 text-red-600">Error Data</div>;
    return (
        <GlassCard title={safeT.stops || "PARADAS"} className="w-64 text-[1em]">
            <div className="max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                {PARADAS.map((parada) => (
                    <div
                        key={parada.id}
                        className="flex items-center gap-3 p-2 hover:bg-white/40 rounded-lg transition-colors cursor-pointer group"
                        onClick={() => {
                            console.log("Ir a parada:", parada.nombre);
                            // 👇 2. Ejecutamos la función pasando el ID de la parada
                            if (onStopClick) {
                                onStopClick(parada.id);
                            }
                        }}
                    >
                        <div className="bg-blue-500/20 p-2 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <MapPin size={16} />
                        </div>
                        <span className="text-slate-700 font-medium opacity-90 group-hover:text-slate-900">
                            {parada.nombre}
                        </span>
                    </div>
                    
                ))}
            </div>
        </GlassCard>
    );
};