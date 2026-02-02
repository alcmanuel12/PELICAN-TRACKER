import { GlassCard } from '../GlassCard'; // Asegúrate de que la ruta sea correcta
import { PARADAS } from '../../../utils/routeData';
import { MapPin } from 'lucide-react';

export const StopsListCard = () => {
  return (
    <GlassCard title="STOPS" className="w-64">
      <div className="max-h-60 overflow-y-auto pr-2 scrollbar-hide">
        {PARADAS.map((parada) => (
          <div 
            key={parada.id}
            className="flex items-center gap-3 p-2 hover:bg-white/40 rounded-lg transition-colors cursor-pointer group"
            onClick={() => {
              // Aquí podríamos hacer que el mapa vuele a la parada en el futuro
              console.log("Ir a parada:", parada.nombre);
            }}
          >
            <div className="bg-blue-500/20 p-2 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <MapPin size={16} />
            </div>
            <span className="text-slate-700 font-medium text-sm group-hover:text-slate-900">
              {parada.nombre}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};