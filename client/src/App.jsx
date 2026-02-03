import { useState } from 'react';
import { MapView } from './components/Map/MapView';
import { StopsListCard } from './components/UI/Cards/StopsListCard';
import { SettingsCard } from './components/UI/Cards/SettingsCard';
import { Settings, MapPin } from 'lucide-react';
import { translations } from './utils/translations';

function App() {
    const [showOptions, setShowOptions] = useState(false);
    const [showStops, setShowStops] = useState(false);

    const [darkMode, setDarkMode] = useState(false);
    const [lang, setLang] = useState('es');
    const [fontSize, setFontSize] = useState('md');

    const t = translations[lang];

    const sizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-xl'
    };

    return (
        <div className={`relative w-screen h-screen overflow-hidden transition-all duration-300 
    ${darkMode ? 'bg-zinc-900' : 'bg-gray-100'}
    ${sizeClasses[fontSize]}
`}>
            <div className={`absolute inset-0 z-0 transition-all duration-500 ${
                darkMode ? 'opacity-80 invert hue-rotate-180 contrast-125' : 'opacity-100'
            }`}>
                <MapView />
            </div>

            <div className="absolute inset-0 z-10 pointer-events-none p-6 flex flex-col justify-between">
                <div className="flex flex-col items-end gap-2 pointer-events-auto self-end">
                    <button
                        onClick={() => setShowOptions(!showOptions)}
                        className={`p-3 rounded-full shadow-lg transition-all ${
                            showOptions ? 'bg-blue-600 text-white' : 'bg-white/80 text-slate-600 hover:bg-white'
                        }`}
                        aria-label={t.settings}
                    >
                        <Settings size={24} />
                    </button>

                    {showOptions && (
                        <div className="animate-fade-in">
                            <SettingsCard
                                darkMode={darkMode}
                                setDarkMode={setDarkMode}
                                lang={lang}
                                setLang={setLang}
                                fontSize={fontSize}
                                setFontSize={setFontSize}
                                t={t}
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-end w-full pointer-events-auto">
                    <div className="flex flex-col gap-3">
                        {showStops && (
                            <div className="mb-2 animate-fade-in">
                                <StopsListCard t={t} />
                            </div>
                        )}
                        <button
                            onClick={() => setShowStops(!showStops)}
                            className={`p-4 rounded-full shadow-lg transition-all flex items-center justify-center ${
                                showStops ? 'bg-blue-600 text-white' : 'bg-white/80 text-blue-600 hover:bg-white'
                            }`}
                        >
                            <MapPin size={28} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="absolute top-6 left-6 z-20 pointer-events-none">
                <h1 className="text-xl font-bold text-slate-800 bg-white/60 p-2 px-4 rounded-xl backdrop-blur-md shadow-sm">
                    Pelican Tracker 🚌
                </h1>
            </div>
        </div>
    );
}

export default App;