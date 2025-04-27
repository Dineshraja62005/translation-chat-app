const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { Translate } = require('@google-cloud/translate').v2;

// Load environment variables
dotenv.config();

// Create a client
const translate = new Translate({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n')
    }
});

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

// Language mapping
const LANGUAGE_CODES = {
    'english': 'en',
    'tamil': 'ta',
    'hindi': 'hi',
    'spanish': 'es',
    'french': 'fr'
};

// Advanced translation function
async function translateText(text, targetLanguage) {
    try {
        // If the target language is the same as the source, return the original text
        if (!text || !targetLanguage) return text;

        // Detect source language
        const [detection] = await translate.detect(text);
        const sourceLanguage = detection.language;

        // If source and target are the same, return original text
        if (sourceLanguage === LANGUAGE_CODES[targetLanguage]) return text;

        // Perform translation
        const [translation] = await translate.translate(text, {
            from: sourceLanguage,
            to: LANGUAGE_CODES[targetLanguage]
        });

        return translation;
    } catch (error) {
        console.error('Translation error:', error);
        return text; // Fallback to original text if translation fails
    }
}

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
    socket.on('send_message', async (messageData) => {
        console.log('Received message:', messageData);

        try {
            // Translate message
            const translatedText = await translateText(
                messageData.text, 
                messageData.language
            );

            // Broadcast message to all connected clients
            io.emit('receive_message', {
                text: messageData.text,
                translatedText: translatedText,
                sender: socket.id,
                senderLanguage: messageData.language,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Message sending error:', error);
        }
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