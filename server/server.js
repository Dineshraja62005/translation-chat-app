const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

// Store connected users
const users = {};

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    // Store user information
    users[socket.id] = {
        id: socket.id,
        language: 'english' // Default language
    };

    // Handle incoming messages
    socket.on('send_message', (messageData) => {
        console.log('Received message:', messageData);

        // Broadcast message to all connected clients
        io.emit('receive_message', {
            text: messageData.text,
            sender: socket.id,
            timestamp: new Date()
        });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        delete users[socket.id];
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});