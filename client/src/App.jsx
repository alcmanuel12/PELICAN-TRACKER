import { MapView } from './components/Map/MapView';

function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-100">
      
      {/* CAPA 1: EL MAPA */}
      <div className="absolute inset-0 z-0">
        <MapView />
      </div>

      {/* CAPA 2: INTERFAZ (HUD) */}
      <div className="absolute inset-0 z-10 pointer-events-none p-6 flex flex-col justify-between">
        {/* Aquí pondremos tus botones más tarde */}
        <h1 className="text-2xl font-bold text-slate-800 bg-white/80 p-4 rounded-xl backdrop-blur-md self-start pointer-events-auto shadow-lg">
          Pelican Tracker  Pelican 🚌
        </h1>
      </div>

    </div>
  );
}

export default App;