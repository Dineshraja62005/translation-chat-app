document.addEventListener('DOMContentLoaded', () => {
    // Connect to Socket.IO server
    const socket = io();

    // DOM Elements
    const messagesContainer = document.getElementById('messages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const languageSelector = document.getElementById('languageSelector');
    const micIcon = sendButton.querySelector('.fa-microphone');
    const sendIcon = sendButton.querySelector('.fa-paper-plane');
    const themeToggle = document.getElementById('themeToggle');
    const themeToggleIcon = themeToggle.querySelector('i');

    // Theme Management
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggleIcon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('chat-theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            themeToggleIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('chat-theme', 'light');
        }
    }

    // Theme toggle event listener
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        applyTheme(currentTheme === 'light' ? 'dark' : 'light');
    });

    // Check saved theme preference
    const savedTheme = localStorage.getItem('chat-theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    }

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

            // Toggle icons
            micIcon.style.display = 'none';
            sendIcon.style.display = 'inline-block';
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

    // Input event to toggle icons
    messageInput.addEventListener('input', () => {
        const message = messageInput.value.trim();
        if (message) {
            micIcon.style.display = 'none';
            sendIcon.style.display = 'inline-block';
        } else {
            micIcon.style.display = 'inline-block';
            sendIcon.style.display = 'none';
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

        // Create message content with original and translated text
        const messageContent = document.createElement('div');
        
        // Original message
        const originalText = document.createElement('p');
        originalText.textContent = messageData.text;
        messageContent.appendChild(originalText);

        // Translated message (if different from original)
        if (messageData.translatedText && 
            messageData.translatedText.toLowerCase() !== messageData.text.toLowerCase()) {
            const translatedText = document.createElement('p');
            translatedText.classList.add('translated-text');
            translatedText.textContent = `Translation: "${messageData.translatedText}"`;
            messageContent.appendChild(translatedText);
        }

        // Append content to message element
        messageElement.appendChild(messageContent);

        // Add to messages container
        messagesContainer.appendChild(messageElement);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });

    // Back button functionality (optional, depends on your app's navigation)
    const backButton = document.querySelector('.back-button');
    backButton.addEventListener('click', () => {
        // You can add navigation logic here
        alert('Back to previous screen');
    });
});