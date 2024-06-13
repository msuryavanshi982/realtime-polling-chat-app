const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let polls = { option1: 0, option2: 0, option3: 0 };
let chatMessages = [];

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.emit('init', { polls, chatMessages });

  socket.on('vote', (option) => {
    if (polls[option] !== undefined) {
      polls[option]++;
      io.emit('updatePolls', polls);
    }
  });

  socket.on('sendMessage', (message) => {
    message.id = chatMessages.length; // Assign a unique ID to each message
    chatMessages.push(message);
    io.emit('newMessage', message);
  });

  socket.on('editMessage', (updatedMessage) => {
    const index = chatMessages.findIndex(msg => msg.id === updatedMessage.id);
    if (index !== -1) {
      chatMessages[index].message = updatedMessage.message;
      io.emit('updateMessage', chatMessages[index]);
    }
  });

  socket.on('deleteMessage', (messageId) => {
    chatMessages = chatMessages.filter(msg => msg.id !== messageId);
    io.emit('removeMessage', messageId);
  });

  socket.on('typing', (username) => {
    socket.broadcast.emit('typing', username);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
