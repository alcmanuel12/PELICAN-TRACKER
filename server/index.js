// server/index.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { calculateBusPosition } = require('./busController');

const app = express();
app.use(cors());

const server = http.createServer(app);

// Configuración de Socket.io (La Radio)
const io = new Server(server, {
    cors: {
        origin: "*", // Permite que tu frontend se conecte
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('✨ Nuevo cliente conectado:', socket.id);
    
    // Enviar posición inicial nada más conectar
    socket.emit('busLocation', calculateBusPosition());

    socket.on('disconnect', () => {
        console.log('❌ Cliente desconectado');
    });
});

// BUCLE DE SIMULACIÓN: Cada segundo envía la nueva posición
setInterval(() => {
    const position = calculateBusPosition();
    io.emit('busLocation', position);
    
    // Descomenta esto para ver las coordenadas en la terminal
    // console.log(`🚌 Bus moviéndose:`, position); 
}, 1000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});