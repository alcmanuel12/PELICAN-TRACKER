import { GlassCard } from '../GlassCard';
import { MapPin, Loader2 } from 'lucide-react';
import { useStops } from '../../../context/StopsContext';

export const StopsListCard = ({ t, onStopClick }) => {
    const { stops: paradas, loading, error } = useStops();
    const safeT = t || {};

    return (
        <GlassCard title={safeT.stops || "PARADAS"} className="w-64 text-[1em]">
            <div className="max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                {loading && (
                    <div className="flex items-center justify-center gap-2 py-4 text-slate-500 text-sm">
                        <Loader2 size={16} className="animate-spin" /> Cargando...
                    </div>
                )}
                {error && (
                    <p className="text-red-500 text-xs text-center py-4">{error}</p>
                )}
                {!loading && !error && paradas.map((parada) => (
                    <div
                        key={parada.id}
                        className="flex items-center gap-3 p-2 hover:bg-white/40 rounded-lg transition-colors cursor-pointer group"
                        onClick={() => onStopClick?.(parada.id)}
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
