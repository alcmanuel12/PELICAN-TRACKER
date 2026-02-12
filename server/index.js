// 1. CARGAMOS LA CONFIGURACIÓN
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// 2. MIDDLEWARE
app.use(cors({
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"]
}));
app.use(express.json());

// 3. CONEXIÓN MONGODB
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log("🟢 Conectado a MongoDB Atlas"))
    .catch(err => console.error("🔴 Error conectando a MongoDB:", err));

// 4. MODELO DE USUARIO
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['driver', 'admin'], default: 'driver' },
    name: String
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// 5. RUTAS DE LA API
app.get('/', (req, res) => {
    res.send('Servidor PelicanTracker funcionando 🦅');
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && user.password === password) {
            res.json({ 
                success: true, 
                user: { 
                    id: user._id, 
                    name: user.name, 
                    role: user.role 
                } 
            });
        } else {
            res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
        }
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ success: false, message: "Error del servidor" });
    }
});

// 6. SOCKET.IO
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// LISTA GLOBAL DE CONDUCTORES
let connectedDrivers = new Set(); 

io.on('connection', (socket) => {
    console.log(`🔌 Usuario conectado: ${socket.id}`);

    // --- A. LOGICA DE CONDUCTORES ---
    socket.on('driverJoin', () => {
        console.log(`👨‍✈️ Conductor identificado: ${socket.id}`);
        connectedDrivers.add(socket.id);
        io.emit('driverCountUpdate', connectedDrivers.size);
    });

    socket.on('driverUpdate', (data) => {
        console.log('📡 Recibido driverUpdate:', data);
        
        // 1. Mover el bus en el mapa
        io.emit('busUpdate', data); 

        // 2. Crear log para el admin
        const newLog = {
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            event: `Llegada a ${data.stopName || 'Parada Desconocida'}`,
            user: "Conductor",
            type: "info"
        };
        io.emit('adminLog', newLog);
    });

    // --- B. GESTIÓN DE AVISOS (ALERTAS) ---
    
    // 1. PUBLICAR: Recibe objeto { msg, type } y lo reenvía
    socket.on('adminMessage', (data) => {
        console.log('📢 ALERTA GLOBAL:', data);
        io.emit('broadcastAlert', data);
    });

    // 2. BORRAR: Recibe orden y limpia pantallas
    socket.on('adminClearAlert', () => {
        console.log('🗑️ Orden de borrar avisos recibida');
        io.emit('broadcastClearAlert');
    });

    // --- C. DESCONEXIÓN ---
    socket.on('disconnect', () => {
        console.log('❌ Usuario desconectado');
        if (connectedDrivers.has(socket.id)) {
            connectedDrivers.delete(socket.id);
            io.emit('driverCountUpdate', connectedDrivers.size);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});