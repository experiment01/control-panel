const http = require('http');
const socketIo = require('socket.io');
const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 3000;

const app = express();

// Serve static files from the React app's build directory
app.use(express.static(path.join(__dirname, 'build')));

// Middleware to handle JSON payloads
app.use(express.json({ limit: '10mb' }));

// Route to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    transports: ['websocket', 'polling'],
  },
  maxHttpBufferSize: 1e7,
});

// Handle client connections
io.on('connection', (socket) => {
  console.log('A client connected');

  socket.on('sendData', (data) => {
    console.log('Received data:', data);
    socket.broadcast.emit('receiveData', data);
  });

  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});

// Start the server
server.listen(PORT, () => console.log(`Listening on ${PORT}`));