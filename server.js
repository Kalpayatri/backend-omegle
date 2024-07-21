const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let waitingUser = null;

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('join random room', () => {
    if (waitingUser) {
      const roomName = `room-${waitingUser.id}-${socket.id}`;
      socket.join(roomName);
      waitingUser.join(roomName);
      io.to(roomName).emit('join room', roomName);
      waitingUser = null;
    } else {
      waitingUser = socket;
    }

    socket.on('disconnect', () => {
      if (waitingUser === socket) {
        waitingUser = null;
      }
    });
  });

  socket.on('chat message', (data) => {
    io.to(data.room).emit('chat message', data.message);
  });
});

server.listen(3001, () => {
  console.log('listening on *:3001');
});

