require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { calculateBusPosition, updateSimulationTimeByStopId } = require('./busController');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
  console.log('✨ Cliente conectado:', socket.id);
  
  // Enviar posición inicial
  socket.emit('busLocation', calculateBusPosition());

  // --- ESCUCHAR AL CONDUCTOR ---
  socket.on('driverUpdate', (data) => {
      console.log('📡 Recibida señal de conductor:', data);
      
      // 1. Intentamos actualizar el tiempo
      const success = updateSimulationTimeByStopId(data.stopId);
      
      if (success) {
          // 2. Si funciona, recalculamos posición y enviamos a TODOS
          const newPosition = calculateBusPosition();
          io.emit('busLocation', newPosition);
      }
  });

  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado');
  });
});

// Bucle normal de simulación (cada segundo)
setInterval(() => {
    const position = calculateBusPosition();
    io.emit('busLocation', position);
}, 1000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});