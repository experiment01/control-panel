const http = require('http');
const socketIo = require('socket.io');
const express = require('express');

// Create an Express app to handle HTTP requests
const app = express();

// Root route for HTTP requests
app.get('/', (req, res) => {
  res.send('Hello, Heroku! Your server is up and running!');
});

// Increase the payload size limit for Socket.IO
const server = http.createServer(app);

// Setup socket.io with larger payload size
const io = socketIo(server, {
  cors: {
    origin: '*', // Allow all origins
    methods: ['GET', 'POST'], // Allow specific methods
    transports: ['websocket', 'polling'], // Allow both websocket and polling
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
server.listen(process.env.PORT || 3001, () => {
  console.log('Server is running on port', process.env.PORT || 3001);
});
