import { useState } from 'react';
import { GlassCard } from '../UI/GlassCard';
import { Lock, KeyRound, User, ChevronRight } from 'lucide-react';

export const LoginView = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Llamamos a la función de App.jsx enviando usuario y contraseña
    const result = await onLogin(username, password);
    
    if (!result.success) {
      setError(result.message || 'Error de acceso');
      setLoading(false);
    }
    // Si hay éxito, App.jsx se encarga de redirigir
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <GlassCard title="Acceso Autorizado" className="w-full max-w-sm text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600/20 p-4 rounded-full text-blue-500">
            <Lock size={40} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* CAMPO USUARIO (NUEVO) */}
          <div className="relative">
            <User size={20} className="absolute left-3 top-3 text-slate-500" />
            <input 
              type="text" 
              placeholder="Usuario (ej: conductor1)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
          </div>

          {/* CAMPO CONTRASEÑA */}
          <div className="relative">
            <KeyRound size={20} className="absolute left-3 top-3 text-slate-500" />
            <input 
              type="password" 
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
          </div>

          {/* MENSAJE DE ERROR */}
          {error && (
            <p className="text-red-500 text-sm font-semibold animate-pulse bg-red-100 p-2 rounded-lg border border-red-200">
              ⛔ {error}
            </p>
          )}

          <button 
            type="submit"
            disabled={loading}
            className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg ${loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
          >
            {loading ? 'Verificando...' : 'Entrar al Sistema'} 
            {!loading && <ChevronRight size={20} />}
          </button>
        </form>

        <p className="mt-6 text-xs text-slate-500">
          Sistema conectado a Base de Datos Municipal.
        </p>
      </GlassCard>
    </div>
  );
};