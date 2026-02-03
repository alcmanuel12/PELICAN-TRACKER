import { GlassCard } from '../GlassCard';
import { Moon, Sun, Type, Globe } from 'lucide-react';

export const SettingsCard = ({
    darkMode, setDarkMode,
    lang, setLang,
    fontSize, setFontSize,
    t
}) => {
    const safeT = t || {};

    return (
        <GlassCard title={safeT.settings || "CONFIG"} className="w-72 text-[1em]">
            <div className="mb-4">
                <div className="flex items-center gap-2 text-slate-700 font-semibold mb-2 opacity-80">
                    <Globe size={18} />
                    <span>{safeT.language || "Idioma"}</span>
                </div>
                <div className="flex bg-white/40 rounded-lg p-1">
                    {['es', 'en'].map((l) => (
                        <button
                            key={l}
                            onClick={() => setLang(l)}
                            className={`flex-1 py-1 px-2 rounded-md text-xs font-bold transition-all ${
                                lang === l ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-600 hover:bg-white/50'
                            }`}
                        >
                            {l === 'es' ? 'ESP' : 'ENG'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700 font-semibold opacity-80">
                    {darkMode ? <Moon size={18} /> : <Sun size={18} />}
                    <span>
                        {safeT.theme || "Tema"} ({darkMode ? (safeT.dark || "Oscuro") : (safeT.light || "Claro")})
                    </span>
                </div>

                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
                        darkMode ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                        darkMode ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                </button>
            </div>

            <div>
                <div className="flex items-center gap-2 text-slate-700 font-semibold mb-2 opacity-80">
                    <Type size={18} />
                    <span>{safeT.fontSize || "Fuente"}</span>
                </div>
                <div className="flex justify-between gap-2">
                    {[
                        { id: 'sm', label: 'A', sizeClass: 'text-xs' },
                        { id: 'md', label: 'A', sizeClass: 'text-base' },
                        { id: 'lg', label: 'A', sizeClass: 'text-xl' }
                    ].map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => setFontSize(opt.id)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${
                                fontSize === opt.id
                                    ? 'bg-blue-500 border-blue-500 text-white'
                                    : 'bg-white/40 border-white/50 text-slate-700 hover:bg-white/80'
                            }`}
                        >
                            <span className={`${opt.sizeClass} font-bold`}>{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </GlassCard>
    );
};