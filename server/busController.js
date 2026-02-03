// server/busController.js
const { FULL_ROUTE } = require('./data/route');
const { SCHEDULE } = require('./data/schedule');

// CONFIGURACIÓN DE VELOCIDAD
// 1000 = Tiempo Real (1 seg real = 1 seg simulación)
// 100  = Cámara Rápida (1 seg real = 10 seg simulación) -> ¡Usa este para probar!
const TICK_RATE = 1000; 
const TOTAL_LOOP_MINUTES = 45; 

// Empezamos en el minuto 0
let currentVirtualMinute = 0; 

const calculateBusPosition = () => {
    // Avanzamos el tiempo: 0.05 minutos por tick (aprox 3 segundos)
    currentVirtualMinute += 0.05; 
    
    // Si llegamos al minuto 45, reiniciamos el ciclo
    if (currentVirtualMinute >= TOTAL_LOOP_MINUTES) {
        currentVirtualMinute = 0; 
    }

    // 1. ¿En qué tramo estamos?
    let activeSegment = null;
    for (let i = 0; i < SCHEDULE.length - 1; i++) {
        const startStop = SCHEDULE[i];
        const endStop = SCHEDULE[i+1];

        if (currentVirtualMinute >= startStop.timeOffset && currentVirtualMinute < endStop.timeOffset) {
            activeSegment = { start: startStop, end: endStop };
            break;
        }
    }

    if (!activeSegment) return FULL_ROUTE[1]; // Fallback de seguridad

    // 2. Calcular porcentaje de avance en este tramo
    const { start, end } = activeSegment;
    const segmentDuration = end.timeOffset - start.timeOffset;
    const timeElapsed = currentVirtualMinute - start.timeOffset;
    const progress = timeElapsed / segmentDuration; // 0.0 a 1.0

    // 3. Mover el bus sobre los puntos del mapa
    let totalPoints;
    
    // Si estamos dando la vuelta (ej: del final al principio)
    if (end.index < start.index) {
        totalPoints = (FULL_ROUTE.length - start.index) + end.index;
    } else {
        totalPoints = end.index - start.index;
    }

    const currentStep = Math.floor(totalPoints * progress);
    
    // Calcular el índice real
    let currentPointIndex = start.index + currentStep;
    
    // Ajustar si nos salimos del array (vuelta circular)
    if (currentPointIndex >= FULL_ROUTE.length) {
        currentPointIndex -= FULL_ROUTE.length;
    }

    return FULL_ROUTE[currentPointIndex];
};

module.exports = { calculateBusPosition };