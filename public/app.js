document.addEventListener('DOMContentLoaded', () => {
    // Connect to Socket.IO server
    const socket = io();

    // DOM Elements
    const messagesContainer = document.getElementById('messages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const languageSelector = document.getElementById('languageSelector');

    // Current user's language
    let userLanguage = 'english';

    // Language change handler
    languageSelector.addEventListener('change', (e) => {
        userLanguage = e.target.value;
    });

    // Send message function
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            // Send message to server
            socket.emit('send_message', {
                text: message,
                language: userLanguage
            });

            // Clear input
            messageInput.value = '';
        }
    }

    // Send message on button click
    sendButton.addEventListener('click', sendMessage);

    // Send message on Enter key
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Receive messages
    socket.on('receive_message', (messageData) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        
        // Determine if message is sent by current user
        messageElement.classList.add(
            messageData.sender === socket.id ? 'sent' : 'received'
        );

        // Display message text
        messageElement.textContent = messageData.text;

        // Add to messages container
        messagesContainer.appendChild(messageElement);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
});