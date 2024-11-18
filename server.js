const http = require('http');
const socketIo = require('socket.io');
const express = require('express');

// Create an Express app to handle HTTP requests
const app = express();

// Increase the payload size limit for Socket.IO
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: '*', // Allow all origins
    methods: ['GET', 'POST'],
    transports: ['websocket', 'polling'], // Allow both websocket and polling
  },
  maxHttpBufferSize: 1e7, // Increase buffer size
  path: '/socket.io', // Explicitly set the path for socket.io (default is '/socket.io')
});;

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
const PORT = process.env.PORT || 3001; // Use Heroku's dynamic port
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
