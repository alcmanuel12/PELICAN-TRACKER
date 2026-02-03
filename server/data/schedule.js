// server/data/schedule.js

const SCHEDULE = [
    {
        name: "Plaza de San Fernando",
        index: 1,       // Parada 2 en tu lista
        timeOffset: 0   // Minuto 0 (Salida, ej: 7:45)
    },
    {
        name: "Hytasa",
        index: 7,       // Parada 8
        timeOffset: 15  // Minuto 15 (Ej: 8:00)
    },
    {
        name: "Cibeles",
        index: 16,      // Parada 17
        timeOffset: 30  // Minuto 30 (Ej: 8:15)
    },
    {
        name: "San Antón (San Bartolomé)",
        index: 21,      // Parada 22
        timeOffset: 40  // Minuto 40 (Ej: 8:25)
    },
    {
        name: "Fin de Vuelta (San Fernando)",
        index: 1,       // Volvemos al inicio para cerrar el bucle
        timeOffset: 45  // Minuto 45 (Ej: 8:30)
    }
];

module.exports = { SCHEDULE };