import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import { RUTA_BUS } from '../../utils/routeData';
import { useStops } from '../../context/StopsContext';
import { API_URL } from '../../utils/api';

const busIcon = L.divIcon({
    html: `
        <img
            src="https://res.cloudinary.com/din119ww9/image/upload/v1771321969/Gemini_Generated_Image_3a0znq3a0znq3a0z_1_gkm9rk.png"
            alt="Bus PelicanTracker"
            style="
                width: 100%;
                height: 100%;
                object-fit: contain;
                filter: drop-shadow(0 4px 4px rgba(0,0,0,0.5));
                transition: transform 0.8s ease-in-out;
                transform-origin: center center;
            "
            class="bus-img-rotatable"
        />
    `,
    className: '',
    iconSize: [80, 80],
    iconAnchor: [40, 40],
    popupAnchor: [0, -40]
});

const getClosestRouteIndex = (lat, lng) => {
    if (!RUTA_BUS || RUTA_BUS.length === 0) return 0;
    let minDistance = Infinity;
    let closestIndex = 0;
    RUTA_BUS.forEach((coord, index) => {
        const dist = Math.sqrt(Math.pow(coord[0] - lat, 2) + Math.pow(coord[1] - lng, 2));
        if (dist < minDistance) { minDistance = dist; closestIndex = index; }
    });
    return closestIndex;
};

const findRouteIndex = (stopId, paradas) => {
    const stop = paradas.find(p => p.id === stopId);
    return stop ? getClosestRouteIndex(stop.coords[0], stop.coords[1]) : null;
};

const calcInitIndex = (data, paradas) => {
    if (data.fromStopId == null) return null;
    const fromIdx = findRouteIndex(data.fromStopId, paradas);
    const toIdx   = findRouteIndex(data.stopId,     paradas);
    if (fromIdx === null || toIdx === null) return null;
    if (toIdx >= fromIdx) return Math.round(fromIdx + data.progress * (toIdx - fromIdx));
    const steps = RUTA_BUS.length - fromIdx + toIdx;
    return (fromIdx + Math.round(data.progress * steps)) % RUTA_BUS.length;
};

const formatEta = (ms) => {
    const min = Math.round(ms / 60000);
    if (min <= 0) return 'Llegando';
    if (min === 1) return '1 min';
    return `${min} min`;
};

export const BusMarker = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [targetIndex, setTargetIndex] = useState(0);
    const [nextStopName, setNextStopName] = useState("En base");
    const [etaText, setEtaText] = useState(null);
    const { stops: paradas } = useStops();

    const map = useMap();
    const markerRef = useRef(null);
    const prevAngleRef = useRef(0);
    const etaRef = useRef(null);
    const isInitializedRef = useRef(false);
    const pendingInitRef = useRef(null);
    const paradasRef = useRef(paradas);

    useEffect(() => { paradasRef.current = paradas; }, [paradas]);

    const stopsOnRoute = useMemo(() => {
        if (paradas.length === 0) return [];
        return paradas
            .map(s => ({ ...s, routeIdx: getClosestRouteIndex(s.coords[0], s.coords[1]) }))
            .sort((a, b) => a.routeIdx - b.routeIdx);
    }, [paradas]);

    const calculateRotationAngle = useCallback((currentPos, nextPos) => {
        if (!currentPos || !nextPos) return prevAngleRef.current;
        const dy = nextPos[0] - currentPos[0];
        const dx = nextPos[1] - currentPos[1];
        const raw = -(Math.atan2(dy, dx) * (180 / Math.PI) + 270);
        const prev = prevAngleRef.current;
        const diff = ((raw - prev) % 360 + 540) % 360 - 180;
        const smooth = prev + diff;
        prevAngleRef.current = smooth;
        return smooth;
    }, []);

    const applyInit = useCallback((data, currentParadas) => {
        isInitializedRef.current = true;
        const newTarget = findRouteIndex(data.stopId, currentParadas);
        if (newTarget === null) return;
        if (data.eta > 0) {
            etaRef.current = { etaMs: data.eta, setAt: Date.now(), targetIdx: newTarget };
            setEtaText(formatEta(data.eta));
        }
        setTargetIndex(newTarget);
        const initIdx = calcInitIndex(data, currentParadas);
        setCurrentIndex(initIdx !== null ? initIdx : newTarget);
    }, []);

    useEffect(() => {
        const socket = io(API_URL, { withCredentials: true, transports: ['websocket', 'polling'] });

        socket.on('busUpdate', (data) => {
            const currentParadas = paradasRef.current;

            if (!isInitializedRef.current) {
                if (currentParadas.length === 0) {
                    pendingInitRef.current = data;
                    return;
                }
                applyInit(data, currentParadas);
                return;
            }

            const newTarget = findRouteIndex(data.stopId, currentParadas);
            if (newTarget === null) return;
            if (data.eta > 0) {
                etaRef.current = { etaMs: data.eta, setAt: Date.now(), targetIdx: newTarget };
                setEtaText(formatEta(data.eta));
            } else {
                setCurrentIndex(newTarget);
                setEtaText(null);
            }
            setTargetIndex(newTarget);
        });

        return () => {
            socket.off('busUpdate');
            socket.disconnect();
        };
    }, [applyInit]);

    useEffect(() => {
        if (paradas.length === 0 || isInitializedRef.current || !pendingInitRef.current) return;
        const data = pendingInitRef.current;
        pendingInitRef.current = null;
        applyInit(data, paradas);
    }, [paradas, applyInit]);

    useEffect(() => {
        if (stopsOnRoute.length === 0) return;
        const next = stopsOnRoute.find(s => s.routeIdx > currentIndex) ?? stopsOnRoute[0];
        if (next) setNextStopName(next.nombre);
    }, [currentIndex, stopsOnRoute]);

    useEffect(() => {
        if (currentIndex === targetIndex) return;

        const lookAheadIndex = (currentIndex + 5) % RUTA_BUS.length;
        const angle = calculateRotationAngle(RUTA_BUS[currentIndex], RUTA_BUS[lookAheadIndex]);

        if (markerRef.current) {
            const el = markerRef.current.getElement();
            const imgElement = el?.querySelector('.bus-img-rotatable');
            if (imgElement) imgElement.style.transform = `rotateZ(${angle}deg)`;
        }

        let SPEED_MS = 150;
        if (etaRef.current && etaRef.current.targetIdx === targetIndex) {
            const elapsed = Date.now() - etaRef.current.setAt;
            const remaining = etaRef.current.etaMs - elapsed;
            const steps = targetIndex >= currentIndex
                ? targetIndex - currentIndex
                : RUTA_BUS.length - currentIndex + targetIndex;
            if (steps > 0 && remaining > 0) {
                SPEED_MS = Math.max(80, Math.min(remaining / steps, 8000));
            }
        }

        const timer = setTimeout(() => {
            setCurrentIndex((prev) => {
                if (prev < targetIndex) return prev + 1;
                if (prev > targetIndex) return prev < RUTA_BUS.length - 1 ? prev + 1 : 0;
                return prev;
            });
        }, SPEED_MS);

        return () => clearTimeout(timer);
    }, [currentIndex, targetIndex]);

    useEffect(() => {
        const currentPos = RUTA_BUS[currentIndex];
        if (currentPos) map.panTo(currentPos, { animate: true, duration: 0.5 });
    }, [currentIndex, map]);

    if (!RUTA_BUS || RUTA_BUS.length === 0) return null;
    const currentPos = RUTA_BUS[currentIndex] || RUTA_BUS[0];

    return (
        <Marker ref={markerRef} position={currentPos} icon={busIcon} zIndexOffset={1000}>
            <Popup>
                <div className="text-center font-sans min-w-[140px]">
                    <strong className="text-blue-600 block uppercase tracking-wider text-xs">PelicanTracker Circular</strong>
                    <div className="mt-1">
                        <span className="text-slate-500 text-xs uppercase">Próxima parada</span><br/>
                        <span className="text-base font-bold text-slate-800 leading-tight">{nextStopName}</span>
                    </div>
                    {etaText && (
                        <div className="mt-2 pt-2 border-t border-slate-100">
                            <span className="text-slate-500 text-xs">⏱ ETA: </span>
                            <span className="text-sm font-bold text-blue-600">{etaText}</span>
                        </div>
                    )}
                    <div className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-100">
                        Progreso ruta: {Math.round((currentIndex / RUTA_BUS.length) * 100)}%
                    </div>
                </div>
            </Popup>
        </Marker>
    );
};
