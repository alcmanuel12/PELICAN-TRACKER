import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { API_URL } from '../utils/api';
import { Settings, MapPin, X, Clock } from 'lucide-react';

import { MapView } from './Map/MapView';
import { StopsListCard } from './UI/Cards/StopsListCard';
import { SettingsCard } from './UI/Cards/SettingsCard';
import { ScheduleCard } from './UI/Cards/ScheduleCard';
import { translations } from '../utils/translations';
import { ChatPanel } from './UI/Cards/ChatPanel';

export const Home = () => {
  const [lang, setLang] = useState(() => localStorage.getItem('pelican_lang') || 'es');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('pelican_dark') === 'true');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('pelican_font') || 'md');

  useEffect(() => { localStorage.setItem('pelican_lang', lang); }, [lang]);
  useEffect(() => { localStorage.setItem('pelican_dark', darkMode); }, [darkMode]);
  useEffect(() => { localStorage.setItem('pelican_font', fontSize); }, [fontSize]);
  const [showStops, setShowStops] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  
  const [activeStopId, setActiveStopId] = useState(null);
  const [globalAlert, setGlobalAlert] = useState(null);

  const t = translations?.[lang] || translations?.es || {};

  const getFontScale = () => {
    if (fontSize === 'sm') return 'text-sm';
    if (fontSize === 'lg') return 'text-lg';
    return 'text-base'; 
  };

  useEffect(() => {
    const socket = io(API_URL, { withCredentials: true });

    socket.on('broadcastAlert', (data) => {
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
        <MapView darkMode={darkMode} activeStopId={activeStopId} />
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none p-4 flex flex-col justify-between">
        
        {globalAlert && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md z-50 animate-in slide-in-from-top-5 duration-500 pointer-events-auto">
                <div 
                    className={`
                        px-5 py-4 rounded-xl shadow-2xl border-l-8 flex items-center gap-4
                        ${globalAlert.type === 'warning' 
                            ? 'bg-yellow-400 text-black border-yellow-700'  
                            : 'bg-blue-600 text-white border-blue-900'      
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
            className={`p-3 rounded-full shadow-lg transition-transform active:scale-95 flex items-center justify-center ${
                darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {showSettings ? <X size={24} /> : <Settings size={24} />}
          </button>

          {showSettings && (
            <SettingsCard darkMode={darkMode} setDarkMode={setDarkMode} lang={lang} setLang={setLang} fontSize={fontSize} setFontSize={setFontSize} t={t} />
          )}
        </div>

        <div className="pointer-events-auto flex flex-col items-start gap-2 max-h-[60vh]">
          <div className="flex gap-2">
            <button
              onClick={() => { setShowStops(!showStops); setShowSchedule(false); }}
              className={`p-3 rounded-full shadow-lg transition-transform active:scale-95 flex items-center justify-center ${
                  darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
              title={t.showStops}
            >
              {showStops ? <X size={24} /> : <MapPin size={24} />}
            </button>
            <button
              onClick={() => { setShowSchedule(!showSchedule); setShowStops(false); }}
              className={`p-3 rounded-full shadow-lg transition-transform active:scale-95 flex items-center justify-center ${
                  darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
              title={t.showSchedule ?? 'Horario'}
            >
              {showSchedule ? <X size={24} /> : <Clock size={24} />}
            </button>
          </div>

          {showStops && (
            <div className="animate-in slide-in-from-bottom-5 duration-300 origin-bottom-left">
              <StopsListCard t={t} onStopClick={setActiveStopId} />
            </div>
          )}

          {showSchedule && (
            <div className="animate-in slide-in-from-bottom-5 duration-300 origin-bottom-left">
              <ScheduleCard darkMode={darkMode} t={t} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Home;