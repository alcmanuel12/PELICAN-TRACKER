export const SCHEDULE_STOPS = [
    "Plaza de San Fernando",
    "Hytosa",
    "Cibeles",
    "San Bartolomé"
];

export const SCHEDULE = [
    { "Plaza de San Fernando": "7:45",  "Hytosa": "8:00",  "Cibeles": "8:15",  "San Bartolomé": "8:25"  },
    { "Plaza de San Fernando": "8:30",  "Hytosa": "8:45",  "Cibeles": "9:00",  "San Bartolomé": "9:10"  },
    { "Plaza de San Fernando": "9:15",  "Hytosa": "9:30",  "Cibeles": "9:45",  "San Bartolomé": "9:55"  },
    { "Plaza de San Fernando": "10:00", "Hytosa": "10:15", "Cibeles": "10:30", "San Bartolomé": "10:40" },
    { "Plaza de San Fernando": "10:45", "Hytosa": "11:00", "Cibeles": "11:15", "San Bartolomé": "11:25" },
    { "Plaza de San Fernando": "12:15", "Hytosa": "12:30", "Cibeles": "12:45", "San Bartolomé": "12:55" },
    { "Plaza de San Fernando": "13:00", "Hytosa": "13:15", "Cibeles": "13:30", "San Bartolomé": "13:40" },
    { "Plaza de San Fernando": "13:45", "Hytosa": "14:00", "Cibeles": "14:15", "San Bartolomé": "14:25" },
    { "Plaza de San Fernando": "14:30", "Hytosa": "14:45", "Cibeles": "15:00", "San Bartolomé": null    },
];

const toMinutes = (timeStr) => {
    if (!timeStr) return Infinity;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
};

const nowMinutes = () => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
};

/** Devuelve el índice del próximo viaje para una parada dada, o -1 si no hay más hoy. */
export const getNextTripIndex = (stopName) => {
    const now = nowMinutes();
    return SCHEDULE.findIndex(trip => trip[stopName] != null && toMinutes(trip[stopName]) > now);
};

/** Devuelve la hora de la próxima salida de una parada, o null si no hay más hoy. */
export const getNextDeparture = (stopName) => {
    const idx = getNextTripIndex(stopName);
    return idx === -1 ? null : SCHEDULE[idx][stopName];
};
