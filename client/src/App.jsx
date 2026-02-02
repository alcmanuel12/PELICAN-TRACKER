import { useState } from 'react'; 
import { MapView } from './components/Map/MapView';
import { StopsListCard } from './components/UI/Cards/StopsListCard';
import { Settings, MapPin, Plus, Minus } from 'lucide-react';

function App() {
  const [showOptions, setShowOptions] = useState(false);
  const [showStops, setShowStops] = useState(false);
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-100">
      
      {/* CAPA 1: EL MAPA */}
      <div className="absolute inset-0 z-0">
        <MapView />
      </div>

      {/* CAPA 2: INTERFAZ (HUD) */}
      <div className="absolute inset-0 z-10 pointer-events-none p-6 flex flex-col justify-between">
        
        {/* TOP: Título y Ajustes */}
        <div className="flex justify-between items-start pointer-events-auto">
           {/* Título simple o Logo */}
           <h1 className="text-xl font-bold text-slate-800 bg-white/60 p-2 px-4 rounded-xl backdrop-blur-md shadow-sm">
             Pelican Tracker 🚌
           </h1>

           <button 
             onClick={() => setShowOptions(!showOptions)}
             className="bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg hover:bg-white transition-all text-slate-600"
           >
             <Settings size={24} />
           </button>
           {/* Aquí iría el OptionsCard */}
        </div>

        {/* BOTTOM: Controles */}
        <div className="flex justify-between items-end pointer-events-auto">
          
          {/* ZONA IZQUIERDA: Botón Paradas + CARD */}
          <div className="flex flex-col gap-3">
             
             {/* LA MAGIA: Si showStops es true, mostramos la Card */}
             {showStops && (
                <div className="mb-2 animate-fade-in">
                   <StopsListCard />
                </div>
             )}

             <button 
                onClick={() => setShowStops(!showStops)}
                className={`p-4 rounded-full shadow-lg transition-all flex items-center justify-center
                  ${showStops ? 'bg-blue-600 text-white' : 'bg-white/80 text-blue-600 hover:bg-white'}
                `}
             >
               <MapPin size={28} />
             </button>
          </div>

          {/* ZONA DERECHA: Zoom (Lo haremos funcional luego) */}
          <div className="flex flex-col gap-1 bg-white/80 backdrop-blur-md rounded-xl shadow-lg overflow-hidden">
            <button className="p-3 hover:bg-white border-b border-gray-200 text-slate-600">
              <Plus size={24} />
            </button>
            <button className="p-3 hover:bg-white text-slate-600">
              <Minus size={24} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;