// Require socket.io
import socketio from 'socket.io';
import messageHandlers from './utils/communications.js';

let io;

function setupSocket(server) {
  // Initialize socket.io with the server
  io = socketio.listen(server, {
    transports: ['websocket', 'polling'],
    'flash policy': false // For older versions, you might need this for cross-domain support
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

function getIo() {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
}

const all = { setupSocket, getIo };

export default all