import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import io from 'socket.io-client';
import { SCHEDULE, SCHEDULE_STOPS, getNextTripIndex } from '../../../utils/scheduleData';
import { API_URL } from '../../../utils/api';

export const ScheduleCard = ({ darkMode, t }) => {
    const [nextIndexPerStop, setNextIndexPerStop] = useState({});
    const [liveTrip, setLiveTrip] = useState(null);

    useEffect(() => {
        const calc = () => {
            const result = {};
            SCHEDULE_STOPS.forEach(s => { result[s] = getNextTripIndex(s); });
            setNextIndexPerStop(result);
        };
        calc();
        const interval = setInterval(calc, 60_000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const socket = io(API_URL, { withCredentials: true });
        socket.on('scheduleAdjust', setLiveTrip);
        return () => socket.disconnect();
    }, []);

    const nextGlobalTrip = nextIndexPerStop[SCHEDULE_STOPS[0]] ?? -1;

    const bg       = darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800';
    const rowHover = darkMode ? 'hover:bg-slate-700/40' : 'hover:bg-slate-50';
    const headBg   = darkMode ? 'bg-slate-700/60 text-slate-300' : 'bg-slate-100 text-slate-500';
    const subText  = darkMode ? 'text-slate-400' : 'text-slate-500';

    return (
        <div className={`w-[340px] rounded-2xl shadow-2xl border overflow-hidden ${bg}`}>
            {/* Cabecera */}
            <div className={`px-4 py-3 flex items-center gap-2 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                <Clock size={16} className="text-blue-400 shrink-0" />
                <span className="font-bold text-sm">{t?.schedule ?? 'Horario'}</span>
                {liveTrip && liveTrip.delayMin !== 0 && (
                    <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${
                        liveTrip.delayMin > 0
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-green-500/20 text-green-400'
                    }`}>
                        {liveTrip.delayMin > 0 ? `+${liveTrip.delayMin} min` : `${liveTrip.delayMin} min`}
                    </span>
                )}
            </div>

            {/* Próxima salida rápida */}
            {nextGlobalTrip !== -1 ? (
                <div className={`px-4 py-2 flex gap-3 flex-wrap border-b ${darkMode ? 'border-slate-700/50 bg-blue-900/20' : 'border-slate-100 bg-blue-50'}`}>
                    {SCHEDULE_STOPS.map((stop, stopIdx) => {
                        const tripIdx    = nextIndexPerStop[stop] ?? -1;
                        const isLiveRow  = liveTrip?.tripIndex === tripIdx;
                        const rawTime    = SCHEDULE[tripIdx]?.[stop];
                        const time       = isLiveRow ? (liveTrip.adjustedTimes[stopIdx] ?? rawTime) : rawTime;
                        const isAdjusted = isLiveRow && time !== rawTime;
                        return (
                            <div key={stop} className="text-center min-w-[70px]">
                                <p className={`text-[10px] font-medium uppercase tracking-wide ${subText} truncate max-w-[80px]`}>
                                    {stop.split(' ').slice(-1)[0]}
                                </p>
                                <p className={`text-base font-bold ${isAdjusted ? 'text-orange-400' : 'text-blue-400'}`}>
                                    {time ?? '—'}
                                </p>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className={`px-4 py-2 text-xs font-medium text-center ${subText} border-b ${darkMode ? 'border-slate-700/50' : 'border-slate-100'}`}>
                    No hay más salidas hoy
                </div>
            )}

            {/* Tabla completa */}
            <div className="overflow-x-auto max-h-[280px] overflow-y-auto">
                <table className="w-full text-xs border-collapse">
                    <thead className="sticky top-0 z-10">
                        <tr>
                            {SCHEDULE_STOPS.map(s => (
                                <th key={s} className={`px-3 py-2 text-left font-semibold uppercase tracking-wide ${headBg}`}>
                                    {s.split(' ').slice(-1)[0]}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {SCHEDULE.map((trip, i) => {
                            const isPast = nextGlobalTrip !== -1 && i < nextGlobalTrip;
                            const isNext = i === nextGlobalTrip;
                            const isLive = liveTrip?.tripIndex === i;
                            return (
                                <tr
                                    key={i}
                                    className={`transition-colors ${rowHover} ${
                                        isLive
                                            ? darkMode ? 'bg-orange-500/10' : 'bg-orange-50'
                                            : isNext
                                            ? darkMode ? 'bg-blue-600/20' : 'bg-blue-50'
                                            : isPast
                                            ? 'opacity-35'
                                            : ''
                                    }`}
                                >
                                    {SCHEDULE_STOPS.map((stop, stopIdx) => {
                                        const rawTime     = trip[stop];
                                        const displayTime = isLive
                                            ? (liveTrip.adjustedTimes[stopIdx] ?? rawTime)
                                            : rawTime;
                                        const isAdjusted  = isLive && displayTime !== rawTime && rawTime !== null;
                                        return (
                                            <td
                                                key={stop}
                                                className={`px-3 py-2 font-mono ${
                                                    isAdjusted        ? 'text-orange-400 font-bold' :
                                                    isNext && !isLive ? 'text-blue-400 font-bold'   : ''
                                                }`}
                                            >
                                                {displayTime ?? <span className={subText}>—</span>}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
