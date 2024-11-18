const http = require('http');
const socketIo = require('socket.io');
const express = require('express');

const PORT = process.env.PORT || 3000;
const INDEX = '/public/index.html'; // Updated path to index.html

const app = express();

// Serve static files from the public directory
app.use(express.static('public'));

// Middleware to handle JSON payloads
app.use(express.json({ limit: '10mb' }));

// Route to serve the index.html file
app.get('/', (req, res) => res.sendFile(INDEX, { root: __dirname }));

const server = http.createServer(app);

// Setup socket.io with larger payload size
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

// Start the server
server.listen(PORT, () => console.log(`Listening on ${PORT}`));
