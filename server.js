const http = require('http');
const socketIo = require('socket.io');
const express = require('express');

// Create an Express app to handle HTTP requests
const app = express();

// Increase the payload size limit for Socket.IO
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:3000', // Local dev URL
  'https://still-wave-71113-90132f41daea.herokuapp.com/', // Production URL
];

const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    transports: ['websocket', 'polling'],
  },
  maxHttpBufferSize: 1e7, // Increase this value (default is 1 MB)
});


app.use(express.json({ limit: '10mb' })); // You can also increase this to allow larger payloads

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

// Start the server
server.listen(process.env.REACT_APP_SOCKET_SERVER || 3001, () => {
  console.log('Server is running on port', process.env.REACT_APP_SOCKET_SERVER || 3001);
});