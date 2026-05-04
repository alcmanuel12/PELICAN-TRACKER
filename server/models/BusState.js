const mongoose = require('mongoose');

// Documento singleton — un único registro por día que guarda el estado del bus.
const busStateSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true }, // 'YYYY-MM-DD'
    simMinTimeMin: { type: Number, default: -Infinity },
    liveTrip: {
        tripIndex:     Number,
        adjustedTimes: [mongoose.Schema.Types.Mixed],
        delayMin:      Number,
        checkpointIdx: Number,
    },
    lastConfirmedStopId: Number,
}, { timestamps: true });

module.exports = mongoose.models.BusState || mongoose.model('BusState', busStateSchema);
