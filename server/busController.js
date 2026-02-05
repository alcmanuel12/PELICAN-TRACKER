const { FULL_ROUTE } = require('./data/route');
const { SCHEDULE } = require('./data/schedule');

// Configuración
const TICK_RATE = 1000; 
const TOTAL_LOOP_MINUTES = 45; 

// Estado interno del bus (Minuto 0 a 45)
let currentVirtualMinute = 0; 

// 1. FUNCIÓN QUE CALCULA DÓNDE ESTAMOS (Ya la tenías)
const calculateBusPosition = () => {
    currentVirtualMinute += 0.05; 
    
    if (currentVirtualMinute >= TOTAL_LOOP_MINUTES) {
        currentVirtualMinute = 0; 
    }

    let activeSegment = null;
    for (let i = 0; i < SCHEDULE.length - 1; i++) {
        const startStop = SCHEDULE[i];
        const endStop = SCHEDULE[i+1];

        if (currentVirtualMinute >= startStop.timeOffset && currentVirtualMinute < endStop.timeOffset) {
            activeSegment = { start: startStop, end: endStop };
            break;
        }
    }

    if (!activeSegment) return FULL_ROUTE[1]; 

    const { start, end } = activeSegment;
    const segmentDuration = end.timeOffset - start.timeOffset;
    const timeElapsed = currentVirtualMinute - start.timeOffset;
    const progress = timeElapsed / segmentDuration;

    let totalPoints;
    if (end.index < start.index) {
        totalPoints = (FULL_ROUTE.length - start.index) + end.index;
    } else {
        totalPoints = end.index - start.index;
    }

    const currentStep = Math.floor(totalPoints * progress);
    let currentPointIndex = start.index + currentStep;
    
    if (currentPointIndex >= FULL_ROUTE.length) {
        currentPointIndex -= FULL_ROUTE.length;
    }

    return FULL_ROUTE[currentPointIndex];
};

// 2. NUEVA FUNCIÓN: EL CONDUCTOR MANDA (La magia) ✨
const updateSimulationTimeByStopId = (stopId) => {
    // Buscamos la parada en el horario
    // Nota: Usamos 'find' comparando el index de la parada real
    // En schedule.js pusimos: Hytasa (index 7, timeOffset 15)
    
    // Mapeo manual rápido basado en tus IDs del frontend vs Indices del backend
    // ID 2 (San Fernando) -> Index 1
    // ID 8 (Hytasa) -> Index 7
    // ID 17 (Cibeles) -> Index 16
    // ID 22 (San Antón) -> Index 21
    
    const targetStop = SCHEDULE.find(s => {
        // Truco: Como no tenemos el ID en schedule.js, buscamos por nombre o aproximación
        // O mejor, buscamos por el timeOffset que sabemos que cuadra
        // Pero para hacerlo robusto, vamos a buscar por el índice de route.js
        if (stopId === 2 && s.index === 1) return true;
        if (stopId === 8 && s.index === 7) return true;
        if (stopId === 17 && s.index === 16) return true;
        if (stopId === 22 && s.index === 21) return true;
        return false;
    });

    if (targetStop) {
        console.log(`👨‍✈️ Conductor confirma: ${targetStop.name}. Saltando al minuto ${targetStop.timeOffset}`);
        
        // ¡AQUÍ ESTÁ EL TRUCO!
        // Forzamos el reloj interno al momento exacto de esa parada.
        // Sumamos 0.1 para que no se quede justo en el borde y avance un pelín.
        currentVirtualMinute = targetStop.timeOffset + 0.1;
        
        return true; // Éxito
    }
    return false; // No encontrado
};

// Exportamos ambas funciones
module.exports = { calculateBusPosition, updateSimulationTimeByStopId };