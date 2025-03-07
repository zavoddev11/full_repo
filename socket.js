// Require socket.io
import socketio from 'socket.io';
import messageHandlers from './utils/communications.js';
import { tryEach } from 'async';

let io;

function setupSocket(server) {
  // Initialize socket.io with the server

  io = socketio.listen(server, {
    transports: ['websocket', 'polling'],
    'flash policy': false,  // For older versions, you might need this for cross-domain support
    cors: {
      'origins': '*:*',  // Allow all origins (you can specify a specific origin if needed)
      methods: ["GET", "POST"],  // Allow GET and POST requests
      credentials: true  // Allow credentials (cookies, authorization headers, etc.)
    }
  });

  // io.configure(function () {
  io.set('close timeout', 60 * 60 * 24); // 24-hour timeout
  // });

  // Listen for connections

  io.sockets.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Use messageHandlers
    messageHandlers(io, socket);

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}

async function getIo(websiteData) {
  try {
    if (!io) {
      throw new Error('Socket.io has not been initialized!');
    }
    io.sockets.emit('create:website', websiteData);
  } catch (err) {
    cosole.log(err)
  }

}

const all = { setupSocket, getIo };

export default all