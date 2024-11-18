const http = require('http');
const socketIo = require('socket.io');
const express = require('express');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }), express.json({ limit: '10mb' }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = socketIo(server, {
  cors: {
    origin: '*', // Allow all origins
    methods: ['GET', 'POST'],
    transports: ['websocket', 'polling'], // Allow both websocket and polling
  },
  maxHttpBufferSize: 1e7, // Increase buffer size
});

// Handle client connections
io.on('connection', (socket) => {
  console.log('A client connected');

  // Listen for data sent from clients
  socket.on('sendData', (data) => {
    console.log('Received data:', data);
    socket.broadcast.emit('receiveData', data); // Broadcast the data to all clients (except the sender)
  });

  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});