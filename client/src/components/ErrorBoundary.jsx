import React from 'react';
import { RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('[PelicanTracker] Error no controlado:', error, info.componentStack);
    }

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-center px-6">
                <div className="text-7xl mb-6 select-none">🦅</div>
                <h1 className="text-2xl font-bold text-white mb-2">Algo ha fallado</h1>
                <p className="text-slate-400 text-sm mb-2 max-w-xs">
                    {this.state.error?.message || 'Error inesperado en la aplicación.'}
                </p>
                <p className="text-slate-600 text-xs mb-8 max-w-xs">
                    Si el problema persiste, contacta con el administrador del sistema.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-all active:scale-95 shadow-lg"
                >
                    <RefreshCw size={18} /> Recargar página
                </button>
            </div>
        );
    }
}
