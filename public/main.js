const socket = io();

socket.on('init', (data) => {
  updatePollResults(data.polls);
  updateChatMessages(data.chatMessages);
});

socket.on('updatePolls', (polls) => {
  updatePollResults(polls);
});

socket.on('newMessage', (message) => {
  appendMessage(message);
});

socket.on('updateMessage', (message) => {
  updateMessage(message);
});

socket.on('removeMessage', (messageId) => {
  removeMessage(messageId);
});

socket.on('typing', (username) => {
  showTypingIndicator(username);
});

function vote(option) {
  socket.emit('vote', option);
}

function sendMessage() {
  const username = document.getElementById('username').value;
  const message = document.getElementById('message').value;
  if (username && message) {
    socket.emit('sendMessage', { username, message });
    document.getElementById('message').value = '';
  }
}

function updatePollResults(polls) {
  const pollResults = document.getElementById('poll-results');
  pollResults.innerHTML = '';
  for (let option in polls) {
    pollResults.innerHTML += `<p>${option}: ${polls[option]}</p>`;
  }
}

function updateChatMessages(messages) {
  const messageContainer = document.getElementById('messages');
  messageContainer.innerHTML = '';
  messages.forEach(msg => appendMessage(msg));
}

function appendMessage(message) {
  const messageContainer = document.getElementById('messages');
  const msgElement = document.createElement('div');
  msgElement.setAttribute('data-id', message.id);
  msgElement.innerHTML = `
    <strong>${message.username}:</strong> ${message.message}
    <button onclick="editMessage(${message.id})">Edit</button>
    <button onclick="deleteMessage(${message.id})">Delete</button>
  `;
  messageContainer.appendChild(msgElement);
}

function updateMessage(message) {
  const msgElement = document.querySelector(`div[data-id='${message.id}']`);
  if (msgElement) {
    msgElement.innerHTML = `
      <strong>${message.username}:</strong> ${message.message}
      <button onclick="editMessage(${message.id})">Edit</button>
      <button onclick="deleteMessage(${message.id})">Delete</button>
    `;
  }
}

function removeMessage(messageId) {
  const msgElement = document.querySelector(`div[data-id='${messageId}']`);
  if (msgElement) {
    msgElement.remove();
  }
}

function showTypingIndicator(username) {
  const typingIndicator = document.getElementById('typing-indicator');
  typingIndicator.style.display = 'block';
  setTimeout(() => {
    typingIndicator.style.display = 'none';
  }, 2000); // Adjust the timeout as needed
}

function addEmoji(emoji) {
  const messageInput = document.getElementById('message');
  messageInput.value += emoji;
}

function editMessage(messageId) {
  const newMessage = prompt("Edit your message:");
  if (newMessage) {
    socket.emit('editMessage', { id: messageId, message: newMessage });
  }
}

function deleteMessage(messageId) {
  if (confirm("Are you sure you want to delete this message?")) {
    socket.emit('deleteMessage', messageId);
  }
}

document.getElementById('message').addEventListener('input', () => {
  const username = document.getElementById('username').value;
  if (username) {
    socket.emit('typing', username);
  }
});
