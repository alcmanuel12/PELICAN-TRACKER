import React, { useState, useEffect } from 'react'; 
import io from 'socket.io-client';
import { Settings, MapPin, X } from 'lucide-react';

// --- COMPONENTES INTERNOS ---
import { MapView } from './Map/MapView';
import { StopsListCard } from './UI/Cards/StopsListCard';
import { SettingsCard } from './UI/Cards/SettingsCard';
import { translations } from '../utils/translations'; 

export const Home = () => {
  const [lang, setLang] = useState('es');
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('md');
  const [showStops, setShowStops] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [globalAlert, setGlobalAlert] = useState(null);

  const t = translations?.[lang] || translations?.es || {};

  const getFontScale = () => {
    if (fontSize === 'sm') return 'text-sm';
    if (fontSize === 'lg') return 'text-lg';
    return 'text-base'; 
  };

  useEffect(() => {
    const socket = io('http://localhost:3000');

    socket.on('broadcastAlert', (data) => {
        console.log("⚠️ ALERTA:", data);
        setGlobalAlert(data); 
    });

    socket.on('broadcastClearAlert', () => {
        setGlobalAlert(null);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className={`relative w-full h-screen overflow-hidden ${getFontScale()} transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800'}`}>
      
      <div className="absolute inset-0 z-0">
        <MapView darkMode={darkMode} />
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none p-4 flex flex-col justify-between">
        
        {/* --- AVISO UNIFICADO (SOLO AZUL O AMARILLO) --- */}
        {globalAlert && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md z-50 animate-in slide-in-from-top-5 duration-500 pointer-events-auto">
                <div 
                    className={`
                        px-5 py-4 rounded-xl shadow-2xl border-l-8 flex items-center gap-4
                        ${globalAlert.type === 'warning' 
                            ? 'bg-yellow-400 text-black border-yellow-700'  // AMARILLO (Aviso)
                            : 'bg-blue-600 text-white border-blue-900'      // AZUL (Info)
                        }
                    `}
                >
                    <div className="text-3xl shrink-0">
                        {globalAlert.type === 'warning' ? '⚠️' : 'ℹ️'}
                    </div>

                    <div className="flex-1">
                        <strong className="block font-black uppercase text-xs tracking-widest opacity-80 mb-1">
                            {globalAlert.type === 'warning' ? 'AVISO IMPORTANTE' : 'INFORMACIÓN'}
                        </strong>
                        <p className="text-base font-bold leading-tight drop-shadow-sm">
                            {globalAlert.msg}
                        </p>
                    </div>
                </div>
            </div>
        )}
        
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
            <SettingsCard darkMode={darkMode} setDarkMode={setDarkMode} lang={lang} setLang={setLang} fontSize={fontSize} setFontSize={setFontSize} t={t} />
          )}
        </div>

        <div className="pointer-events-auto flex flex-col items-start gap-2 max-h-[60vh]">
          <button
            onClick={() => setShowStops(!showStops)}
            className={`p-3 rounded-full shadow-lg transition-transform active:scale-95 flex items-center justify-center ${
                darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            title={t.showStops}
          >
            {showStops ? <X size={24} /> : <MapPin size={24} />}
          </button>

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