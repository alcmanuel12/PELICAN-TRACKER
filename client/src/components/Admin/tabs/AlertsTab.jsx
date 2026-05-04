import { Bell, Send, Trash2, AlertTriangle } from 'lucide-react';

export const AlertsTab = ({ alertMsg, setAlertMsg, alertType, setAlertType, isSending, handleSendAlert, handleClearAlert }) => (
    <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-300">
        <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">📢 Publicar Aviso Global</h2>
            <p className="text-slate-400">Escribe un mensaje para todos los pasajeros.</p>
        </div>

        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><Bell size={150} /></div>

            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => setAlertType('info')}
                    className={`flex-1 p-3 rounded-lg border-2 font-bold transition-all ${alertType === 'info' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-700 border-transparent text-slate-400'}`}
                >
                    ℹ️ Info
                </button>
                <button
                    onClick={() => setAlertType('warning')}
                    className={`flex-1 p-3 rounded-lg border-2 font-bold transition-all ${alertType === 'warning' ? 'bg-yellow-500 border-yellow-300 text-black' : 'bg-slate-700 border-transparent text-slate-400'}`}
                >
                    ⚠️ Aviso
                </button>
            </div>

            <textarea
                value={alertMsg}
                onChange={(e) => setAlertMsg(e.target.value)}
                placeholder="Escribe el mensaje aquí..."
                className="w-full h-32 bg-slate-900 border border-slate-600 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none mb-4"
            />

            <div className="flex gap-4">
                <button onClick={handleClearAlert} className="px-6 py-3 rounded-xl font-bold text-red-400 border border-red-900 hover:bg-red-900/30 flex items-center gap-2 transition-colors">
                    <Trash2 size={18} /> Retirar
                </button>
                <button
                    onClick={handleSendAlert}
                    disabled={!alertMsg.trim() || isSending}
                    className={`flex-1 flex justify-center items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${isSending ? 'opacity-50 cursor-wait' : 'hover:scale-[1.02]'} ${alertType === 'warning' ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-500/20' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'}`}
                >
                    {isSending ? 'Enviando...' : <><Send size={18} /> Publicar Aviso</>}
                </button>
            </div>
        </div>

        {alertMsg && (
            <div className="space-y-2">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Vista Previa (Usuario):</p>
                <div className={`p-4 rounded-lg shadow-lg border-l-4 flex gap-3 max-w-sm mx-auto bg-white text-slate-800 ${alertType === 'warning' ? 'border-yellow-500' : 'border-blue-500'}`}>
                    <AlertTriangle className={`shrink-0 ${alertType === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`} />
                    <div>
                        <strong className="block font-bold">{alertType === 'warning' ? 'AVISO IMPORTANTE' : 'INFORMACIÓN'}</strong>
                        <p className="text-sm">{alertMsg}</p>
                    </div>
                </div>
            </div>
        )}
    </div>
);
