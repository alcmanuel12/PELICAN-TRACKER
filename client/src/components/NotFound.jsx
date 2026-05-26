import { useNavigate } from 'react-router-dom';
import { MapPin, Home } from 'lucide-react';

export const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-center px-6">
            <div className="mb-6 relative">
                <div className="text-[120px] font-black text-slate-800 select-none leading-none">404</div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-blue-600/20 border border-blue-500/30 rounded-2xl p-5">
                        <MapPin size={48} className="text-blue-400" />
                    </div>
                </div>
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">Parada no encontrada</h1>
            <p className="text-slate-400 text-sm mb-8 max-w-xs">
                Esta ruta no existe en el sistema. El bus no para aquí.
            </p>

            <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-all active:scale-95 shadow-lg"
            >
                <Home size={18} /> Volver al mapa
            </button>
        </div>
    );
};
