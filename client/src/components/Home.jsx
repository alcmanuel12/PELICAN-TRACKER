import React, { useState } from 'react';

// 1. Importamos el Mapa
import { MapView } from './Map/MapView';

// 2. Importamos tus Tarjetas
import { StopsListCard } from './UI/Cards/StopsListCard';
import { SettingsCard } from './UI/Cards/SettingsCard';

// 3. Importamos las traducciones
import { translations } from '../utils/translations'; 

// Iconos
import { Settings, MapPin, X } from 'lucide-react';

export const Home = () => {
  // --- ESTADOS ---
  const [lang, setLang] = useState('es');
  const [darkMode, setDarkMode] = useState(false); // false = Modo Claro (Día) por defecto
  const [fontSize, setFontSize] = useState('md');

  // Visibilidad
  const [showStops, setShowStops] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Diccionario actual
  const t = translations?.[lang] || translations?.es || {};

  // Tamaño fuente
  const getFontScale = () => {
    if (fontSize === 'sm') return 'text-sm';
    if (fontSize === 'lg') return 'text-lg';
    return 'text-base'; 
  };

  return (
    <div className={`relative w-full h-screen overflow-hidden ${getFontScale()} transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800'}`}>
      
      {/* CAPA 1: MAPA */}
        <div className="absolute inset-0 z-0">
        {/* AÑADIMOS ESTO: Le pasamos el estado al mapa */}
        <MapView darkMode={darkMode} />
      </div>

      {/* CAPA 2: INTERFAZ FLOTANTE */}
      <div className="absolute inset-0 z-10 pointer-events-none p-4 flex flex-col justify-between">
        
        {/* --- ESQUINA SUPERIOR DERECHA (AJUSTES) --- */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-3 rounded-full shadow-lg transition-transform active:scale-95 ${
                darkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-gray-50'
            }`}
          >
            {showSettings ? <X size={24} /> : <Settings size={24} />}
          </button>

          {showSettings && (
            <SettingsCard 
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              lang={lang}
              setLang={setLang}
              fontSize={fontSize}
              setFontSize={setFontSize}
              t={t} 
            />
          )}
        </div>

        {/* --- ESQUINA INFERIOR IZQUIERDA (PARADAS) --- */}
        <div className="pointer-events-auto flex flex-col items-start gap-2 max-h-[60vh]">
           
           {/* BOTÓN FLOTANTE DE PARADAS (ICONO) */}
           <button 
            onClick={() => setShowStops(!showStops)}
            className={`p-3 rounded-full shadow-lg transition-transform active:scale-95 flex items-center justify-center ${
                darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            title={t.showStops}
          >
            {showStops ? <X size={24} /> : <MapPin size={24} />}
          </button>

          {/* LISTA DE PARADAS (Ahora se abre encima del botón o al lado) */}
          {showStops && (
            <div className="animate-in slide-in-from-bottom-5 duration-300 origin-bottom-left">
              <StopsListCard t={t} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Home;