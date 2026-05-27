require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const User = require('./models/User');
const Stop = require('./models/Stop');
const BusState = require('./models/BusState');
const { SEED_STOPS } = require('./data/seedStops');
const { createToken, verifyToken, requireAdmin } = require('./utils/auth');
const { sanitize } = require('./utils/sanitize');
const { CHECKPOINT_IDS, VALID_ROLES } = require('./data/constants');

// En desarrollo: CORS_ORIGIN=http://localhost:5173 (por defecto abajo)
// En producción mismo servicio (Render): origin:true refleja el Origin del cliente → funciona sin env var
// En producción servicios separados: CORS_ORIGIN=https://tu-cliente.onrender.com
const CORS_ORIGIN = process.env.CORS_ORIGIN || true;

const app = express();
const server = http.createServer(app);

app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
        directives: {
            defaultSrc:  ["'self'"],
            scriptSrc:   ["'self'"],
            styleSrc:    ["'self'", "https:", "'unsafe-inline'"],
            fontSrc:     ["'self'", "https:", "data:"],
            imgSrc:      ["'self'", "data:", "https://*.cartocdn.com", "https://res.cloudinary.com"],
            connectSrc:  ["'self'", "wss:", "ws:", "https:"],
            workerSrc:   ["'self'", "blob:"],
            objectSrc:   ["'none'"],
            baseUri:     ["'self'"],
            formAction:  ["'self'"],
            frameAncestors: ["'self'"],
            upgradeInsecureRequests: [],
        }
    }
}));
app.use(cors({ origin: CORS_ORIGIN, methods: ["GET", "POST", "DELETE", "PATCH"], credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Sirve los archivos estáticos del frontend compilado (React/Vite)
app.use(express.static(path.join(__dirname, '../client/dist')));

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Demasiados intentos. Espera 15 minutos.' }
});

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("🟢 Conectado a MongoDB Atlas");
        const count = await Stop.countDocuments();
        if (count === 0) {
            await Stop.insertMany(SEED_STOPS);
            console.log("🌱 Paradas inicializadas en base de datos");
        }
        const saved = await BusState.findOne({ date: todayStr() });
        if (saved) {
            simMinTimeMin = saved.simMinTimeMin ?? -Infinity;
            liveTrip      = saved.liveTrip ?? null;
            console.log(`🔄 Estado del bus restaurado — simMinTimeMin: ${simMinTimeMin}, viaje: ${liveTrip?.tripIndex ?? 'ninguno'}`);
        }
    })
    .catch(err => console.error("🔴 Error conectando a MongoDB:", err));

app.get('/api/me', (req, res) => {
    const token = req.cookies?.pelicanToken;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });
    try {
        const decoded = verifyToken(token);
        res.json({ name: decoded.name, role: decoded.role });
    } catch {
        res.status(401).json({ message: 'Invalid token' });
    }
});

app.post('/api/logout', (_req, res) => {
    res.clearCookie('pelicanToken', { sameSite: 'strict', secure: process.env.NODE_ENV !== 'development' });
    res.json({ success: true });
});

app.get('/api/admin/users', requireAdmin, async (_req, res) => {
    try {
        const users = await User.find({}, '-password -__v');
        res.json(users);
    } catch {
        res.status(500).json({ message: 'Error obteniendo usuarios' });
    }
});

app.post('/api/admin/users', requireAdmin, async (req, res) => {
    const { username, password, name, role } = req.body;
    if (!username || !password || !name || !role)
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    if (typeof username !== 'string' || username.length > 32)
        return res.status(400).json({ message: 'El nombre de usuario no puede superar 32 caracteres' });
    if (typeof name !== 'string' || name.length > 64)
        return res.status(400).json({ message: 'El nombre no puede superar 64 caracteres' });
    if (!VALID_ROLES.includes(role))
        return res.status(400).json({ message: 'Rol no válido' });
    if (typeof password !== 'string' || password.length < 8)
        return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
    if (password.length > 128)
        return res.status(400).json({ message: 'La contraseña no puede superar 128 caracteres' });
    try {
        const hashed = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashed, name, role });
        await user.save();
        res.status(201).json({ id: user._id, username, name, role });
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ message: 'Ese nombre de usuario ya existe' });
        res.status(500).json({ message: 'Error creando usuario' });
    }
});

app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
    try {
        if (req.user.id === req.params.id)
            return res.status(400).json({ message: 'No puedes eliminarte a ti mismo' });
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch {
        res.status(500).json({ message: 'Error eliminando usuario' });
    }
});

app.get('/api/stops', async (req, res) => {
    try {
        const filter = req.query.checkpoint === 'true' ? { isCheckpoint: true } : {};
        const stops = await Stop.find(filter, '-_id -__v').sort({ id: 1 });
        res.json(stops);
    } catch {
        res.status(500).json({ message: "Error obteniendo paradas" });
    }
});

app.post('/api/admin/stops', requireAdmin, async (req, res) => {
    const { nombre, coords, isCheckpoint } = req.body;
    if (!nombre || !Array.isArray(coords) || coords.length !== 2)
        return res.status(400).json({ message: 'Nombre y coordenadas [lat, lng] son obligatorios' });
    if (typeof nombre !== 'string' || nombre.length > 80)
        return res.status(400).json({ message: 'El nombre no puede superar 80 caracteres' });
    const [lat, lng] = coords.map(Number);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180)
        return res.status(400).json({ message: 'Coordenadas fuera de rango válido' });
    try {
        const last = await Stop.findOne().sort({ id: -1 });
        const nextId = last ? last.id + 1 : 1;
        const stop = await Stop.create({ id: nextId, nombre, coords, isCheckpoint: !!isCheckpoint });
        res.status(201).json({ id: stop.id, nombre: stop.nombre, coords: stop.coords, isCheckpoint: stop.isCheckpoint });
    } catch {
        res.status(500).json({ message: 'Error creando parada' });
    }
});

app.patch('/api/admin/stops/:id', requireAdmin, async (req, res) => {
    const { nombre, coords, isCheckpoint } = req.body;
    if (nombre !== undefined && (typeof nombre !== 'string' || nombre.length === 0 || nombre.length > 80))
        return res.status(400).json({ message: 'El nombre debe tener entre 1 y 80 caracteres' });
    if (coords !== undefined) {
        if (!Array.isArray(coords) || coords.length !== 2)
            return res.status(400).json({ message: 'Coordenadas inválidas' });
        const [lat, lng] = [Number(coords[0]), Number(coords[1])];
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180)
            return res.status(400).json({ message: 'Coordenadas fuera de rango válido' });
    }
    try {
        const update = {};
        if (nombre) update.nombre = nombre;
        if (Array.isArray(coords) && coords.length === 2) update.coords = coords;
        if (isCheckpoint !== undefined) update.isCheckpoint = !!isCheckpoint;
        const stop = await Stop.findOneAndUpdate({ id: Number(req.params.id) }, update, { new: true, select: '-_id -__v' });
        if (!stop) return res.status(404).json({ message: 'Parada no encontrada' });
        res.json(stop);
    } catch {
        res.status(500).json({ message: 'Error actualizando parada' });
    }
});

app.delete('/api/admin/stops/:id', requireAdmin, async (req, res) => {
    try {
        const stop = await Stop.findOneAndDelete({ id: Number(req.params.id) });
        if (!stop) return res.status(404).json({ message: 'Parada no encontrada' });
        res.json({ success: true });
    } catch {
        res.status(500).json({ message: 'Error eliminando parada' });
    }
});

// ── Avisos globales vía HTTP (más fiable que socket para auth de admin) ──────
app.post('/api/admin/alert', requireAdmin, (req, res) => {
    const { msg, type } = req.body;
    if (!msg || typeof msg !== 'string' || !msg.trim())
        return res.status(400).json({ message: 'El mensaje no puede estar vacío' });
    const safeType = type === 'warning' ? 'warning' : 'info';
    io.emit('broadcastAlert', { msg: sanitize(msg.trim()), type: safeType });
    res.json({ success: true });
});

app.post('/api/admin/alert/clear', requireAdmin, (_req, res) => {
    io.emit('broadcastClearAlert');
    res.json({ success: true });
});

app.patch('/api/admin/users/:id', requireAdmin, async (req, res) => {
    const { name, role, password } = req.body;
    if (name !== undefined && (typeof name !== 'string' || name.length === 0 || name.length > 64))
        return res.status(400).json({ message: 'El nombre debe tener entre 1 y 64 caracteres' });
    if (role !== undefined && !VALID_ROLES.includes(role))
        return res.status(400).json({ message: 'Rol no válido' });
    try {
        const update = {};
        if (name) update.name = name;
        if (role) update.role = role;
        if (password !== undefined) {
            if (typeof password !== 'string' || password.length < 8)
                return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
            if (password.length > 128)
                return res.status(400).json({ message: 'La contraseña no puede superar 128 caracteres' });
            update.password = await bcrypt.hash(password, 10);
        }
        const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, select: '-password -__v' });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json(user);
    } catch {
        res.status(500).json({ message: 'Error actualizando usuario' });
    }
});

app.post('/api/login', loginLimiter, async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user)
            return res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });

        const isHashed = user.password.startsWith('$2b$') || user.password.startsWith('$2a$');
        let isValid;
        if (isHashed) {
            isValid = await bcrypt.compare(password, user.password);
        } else {
            isValid = user.password === password;
            if (isValid) {
                user.password = await bcrypt.hash(password, 10);
                await user.save();
            }
        }

        if (isValid) {
            const token = createToken({ id: user._id, name: user.name, role: user.role });
            res.cookie('pelicanToken', token, {
                httpOnly: true,
                sameSite: 'strict',
                // Render siempre sirve HTTPS → secure:true siempre; en dev HTTP también funciona
                // porque el navegador acepta cookies no-secure en localhost
                secure: process.env.NODE_ENV !== 'development',
                maxAge: 8 * 60 * 60 * 1000
            });
            res.json({ success: true, name: user.name, role: user.role });
        } else {
            res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
        }
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ success: false, message: "Error del servidor" });
    }
});

const io = new Server(server, {
    cors: { origin: CORS_ORIGIN, methods: ["GET", "POST"], credentials: true }
});

const extractToken = (cookieStr) => {
    const match = (cookieStr || '').match(/(?:^|;\s*)pelicanToken=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
};

io.use((socket, next) => {
    const token = extractToken(socket.handshake.headers.cookie);
    if (!token) { socket.user = { role: 'public' }; return next(); }
    try {
        socket.user = verifyToken(token);
    } catch {
        // Token inválido o expirado → tratar como público en vez de rechazar la conexión
        socket.user = { role: 'public' };
    }
    next();
});

let connectedDrivers = new Set();
let liveTrip = null;
let simMinTimeMin = -Infinity;
let simTimeOffset = 0;        // desplazamiento acumulado para bucle 24h
let lastProcessedIdx = null;

const todayStr = () => new Date().toISOString().slice(0, 10);

const nowDecMinutes = () => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes() + (n.getSeconds() * 1000 + n.getMilliseconds()) / 60_000;
};

// Tiempo virtual de simulación (se reinicia al completar el horario)
const getSimNow = () => nowDecMinutes() - simTimeOffset;

const persistBusState = async () => {
    try {
        await BusState.findOneAndUpdate(
            { date: todayStr() },
            { simMinTimeMin, liveTrip },
            { upsert: true, new: true }
        );
    } catch (err) {
        console.error('⚠️  Error guardando BusState:', err.message);
    }
};

const SEGMENTS = [
    { between: [3, 4, 5, 6, 7]                 },
    { between: [9, 10, 11, 12, 13, 14, 15, 16]  },
    { between: [18, 19, 20, 21]                 },
    { between: [23, 24, 25, 26, 27, 1]          },
];

const SIM_TRIPS = [
    ["7:45",  "8:00",  "8:15",  "8:25" ],
    ["8:30",  "8:45",  "9:00",  "9:10" ],
    ["9:15",  "9:30",  "9:45",  "9:55" ],
    ["10:00", "10:15", "10:30", "10:40"],
    ["10:45", "11:00", "11:15", "11:25"],
    ["12:15", "12:30", "12:45", "12:55"],
    ["13:00", "13:15", "13:30", "13:40"],
    ["13:45", "14:00", "14:15", "14:25"],
    ["14:30", "14:45", "15:00", null   ],
];

const toMinSim = (t) => {
    if (!t) return null;
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
};

const interpolateSegment = (startMin, endMin, stopIds, events) => {
    const n = stopIds.length;
    const duration = endMin - startMin;
    for (let i = 0; i < n; i++) {
        events.push({ stopId: stopIds[i], timeMin: startMin + duration * (i + 1) / (n + 1) });
    }
};

const buildDayTimeline = () => {
    const events = [];
    for (let t = 0; t < SIM_TRIPS.length; t++) {
        const trip = SIM_TRIPS[t];
        for (let c = 0; c < CHECKPOINT_IDS.length; c++) {
            if (!trip[c]) continue;
            const timeMin = toMinSim(trip[c]);
            events.push({ stopId: CHECKPOINT_IDS[c], timeMin });
            const nextTime = trip[c + 1] ?? null;
            if (nextTime !== null) {
                interpolateSegment(timeMin, toMinSim(nextTime), SEGMENTS[c].between, events);
            }
        }
        const nextTrip = SIM_TRIPS[t + 1];
        if (nextTrip) {
            const lastMin  = toMinSim(trip.filter(Boolean).slice(-1)[0]);
            const nextStart = toMinSim(nextTrip[0]);
            interpolateSegment(lastMin, nextStart, SEGMENTS[3].between, events);
        }
    }
    return events.sort((a, b) => a.timeMin - b.timeMin);
};

const DAY_TIMELINE = buildDayTimeline();
console.log(`📅 Timeline: ${DAY_TIMELINE.length} eventos programados`);

const getNextSimEvent = (now) => {
    const next = DAY_TIMELINE.find(e => e.timeMin > now && e.timeMin > simMinTimeMin);
    if (!next) return null;
    return { stopId: next.stopId, eta: Math.round((next.timeMin - now) * 60_000) };
};

const getCurrentBusState = (now) => {
    const nextIdx = DAY_TIMELINE.findIndex(e => e.timeMin > now && e.timeMin > simMinTimeMin);
    if (nextIdx === -1) return null;
    const next = DAY_TIMELINE[nextIdx];
    const eta  = Math.round((next.timeMin - now) * 60_000);
    const prev = nextIdx > 0 ? DAY_TIMELINE[nextIdx - 1] : null;
    if (!prev || prev.timeMin > now) return { stopId: next.stopId, eta };
    const progress = (now - prev.timeMin) / (next.timeMin - prev.timeMin);
    return { stopId: next.stopId, eta, fromStopId: prev.stopId, progress: Math.max(0, Math.min(1, progress)) };
};

const minsToTime = (mins) => {
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return `${h}:${m.toString().padStart(2, '0')}`;
};

const findActiveTripForCheckpoint = (checkpointIdx, nowMin) => {
    let bestTrip = -1, bestDiff = Infinity;
    for (let t = 0; t < SIM_TRIPS.length; t++) {
        const tripTime = toMinSim(SIM_TRIPS[t][checkpointIdx]);
        if (tripTime === null) continue;
        const diff = Math.abs(tripTime - nowMin);
        if (diff < bestDiff && diff <= 90) { bestDiff = diff; bestTrip = t; }
    }
    return bestTrip;
};

const resetSimLoop = () => {
    // Reinicia el bucle: desplaza el tiempo virtual para que empiece justo antes del primer evento
    simTimeOffset = nowDecMinutes() - (DAY_TIMELINE[0].timeMin - 0.5);
    simMinTimeMin = -Infinity;
    liveTrip      = null;
    lastProcessedIdx = null;
    console.log('🔄 Simulación: horario completado, reiniciando bucle...');
};

const emitSimState = async () => {
    let simNow = getSimNow();
    let event  = getNextSimEvent(simNow);

    if (!event) {
        // Fin del horario → reiniciar y emitir el primer evento del nuevo ciclo
        resetSimLoop();
        simNow = getSimNow();
        event  = getNextSimEvent(simNow);
        if (!event) return;
    }

    io.emit('busUpdate', event);
    console.log(`🕐 Sim → parada ${event.stopId}, ETA ${Math.round(event.eta / 60000)}min`);

    if (lastProcessedIdx === null) {
        lastProcessedIdx = -1;
        for (let i = 0; i < DAY_TIMELINE.length; i++) {
            if (DAY_TIMELINE[i].timeMin > simNow) break;
            lastProcessedIdx = i;
        }
        return;
    }

    const newlyPassed = [];
    let i = lastProcessedIdx + 1;
    while (i < DAY_TIMELINE.length && DAY_TIMELINE[i].timeMin <= simNow) {
        if (DAY_TIMELINE[i].timeMin > simMinTimeMin) newlyPassed.push(DAY_TIMELINE[i]);
        lastProcessedIdx = i++;
    }
    if (newlyPassed.length === 0) return;

    try {
        const ids = [...new Set(newlyPassed.map(e => e.stopId))];
        const stops = await Stop.find({ id: { $in: ids } }, 'id nombre -_id');
        const nameMap = Object.fromEntries(stops.map(s => [s.id, s.nombre]));
        newlyPassed.forEach((passed, i) => {
            io.emit('adminLog', {
                id: Date.now() + i,
                time: new Date().toLocaleTimeString(),
                event: `Bus en ${nameMap[passed.stopId] || `Parada ${passed.stopId}`}`,
                user: "Simulador",
                type: "info"
            });
        });
    } catch {}
};

emitSimState();
setInterval(emitSimState, 30_000);

io.on('connection', (socket) => {
    console.log(`🔌 Conectado: ${socket.id} (rol: ${socket.user?.role || 'public'})`);

    const busState = getCurrentBusState(getSimNow());
    if (busState) socket.emit('busUpdate', busState);
    if (liveTrip) socket.emit('scheduleAdjust', liveTrip);

    socket.on('driverJoin', () => {
        connectedDrivers.add(socket.id);
        io.emit('driverCountUpdate', connectedDrivers.size);
    });

    socket.on('driverUpdate', (data) => {
        if (!data || typeof data !== 'object') return;
        io.emit('busUpdate', data);

        const checkpointIdx = CHECKPOINT_IDS.indexOf(Number(data.stopId));
        if (checkpointIdx !== -1) {
            const nowMin = Math.floor(nowDecMinutes());
            const tripIdx = findActiveTripForCheckpoint(checkpointIdx, nowMin);
            if (tripIdx !== -1) {
                const theoreticalMin = toMinSim(SIM_TRIPS[tripIdx][checkpointIdx]);
                const delayMin = Math.round(nowMin - theoreticalMin);
                const adjustedTimes = SIM_TRIPS[tripIdx].map((t, i) => {
                    if (t === null) return null;
                    if (i <= checkpointIdx) return t;
                    return minsToTime(toMinSim(t) + delayMin);
                });
                liveTrip = { tripIndex: tripIdx, adjustedTimes, delayMin, checkpointIdx };
                simMinTimeMin = theoreticalMin;
                io.emit('scheduleAdjust', liveTrip);
                persistBusState();
            }
        }

        io.emit('adminLog', {
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            event: `Llegada a ${sanitize(data.stopName) || 'Parada Desconocida'}`,
            user: "Conductor",
            type: "info"
        });
    });

    // adminMessage vía socket (fallback; la ruta preferida es POST /api/admin/alert)
    socket.on('adminMessage', (data, callback) => {
        if (socket.user?.role !== 'admin') {
            console.warn(`[socket] adminMessage bloqueado: socket=${socket.id} rol=${socket.user?.role}`);
            if (typeof callback === 'function') callback({ success: false, reason: `rol=${socket.user?.role}` });
            return;
        }
        io.emit('broadcastAlert', { msg: sanitize(data.msg), type: data.type });
        if (typeof callback === 'function') callback({ success: true });
    });

    socket.on('adminClearAlert', () => {
        if (socket.user?.role !== 'admin') return;
        io.emit('broadcastClearAlert');
    });

    socket.on('sendChatMessage', (messageData) => {
        if (!messageData || typeof messageData !== 'object') return;
        const text = typeof messageData.text === 'string' ? messageData.text.trim() : '';
        if (!text || text.length > 500) return;
        io.emit('receiveChatMessage', {
            ...messageData,
            text: sanitize(text),
            sender: sanitize(messageData.sender),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            id: Date.now()
        });
    });

    socket.on('disconnect', () => {
        if (connectedDrivers.has(socket.id)) {
            connectedDrivers.delete(socket.id);
            io.emit('driverCountUpdate', connectedDrivers.size);
        }
    });
});

// Ruta comodín: devuelve index.html para que React Router maneje /login, /map, etc.
// DEBE ir después de todas las rutas /api y del middleware express.static.
app.get('/{*path}', (_req, res) =>
    res.sendFile(path.join(__dirname, '../client/dist/index.html'))
);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
