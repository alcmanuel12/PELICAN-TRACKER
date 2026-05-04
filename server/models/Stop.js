const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    nombre: { type: String, required: true },
    coords: { type: [Number], required: true },
    isCheckpoint: { type: Boolean, default: false }
});

module.exports = mongoose.models.Stop || mongoose.model('Stop', stopSchema);
