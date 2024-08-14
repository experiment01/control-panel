const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });



// Serve static files
app.use(express.static(path.join(__dirname, 'public')));



// Broadcast received data to all connected clients except the sender
wss.on('connection', ws => {
    console.log('Client connected');

    ws.on('message', (data, isBinary) => {    
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });    

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});



// EJS
const sampleModules = [
    { text: '', image: null }
];

app.set("view engine", "ejs");

app.get('/', (req, res) => {
    res.render('control-panel', {
        title: "Control Panel",
        header: "Patriot Daily Control Panel",
        modules: sampleModules
    });
});

app.get('/img-output', (req, res) => {
    res.render('img-output', { 
        websocketUrl: 'ws://localhost:3000'
    });
});

app.get('/text-output', (req, res) => {
    res.render('text-output', { 
        initialText: 'BREAKING NEWS' // Pass any initial text or data
    });
});



// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
function shutdown() {
    console.log('Shutting down server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0); // Exit the process
    });

    // If server doesn't close in a reasonable time, force exit
    setTimeout(() => {
        console.error('Forcing server shutdown...');
        process.exit(1);
    }, 1000); // 1 seconds timeout
}

// Listen for termination signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
