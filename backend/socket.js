import { Server } from 'socket.io';

let io;

export const init = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // In production, replace with your frontend URL
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join', (room) => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

// Specialized emitters for systemic notifications
export const emitNewEvent = (event) => {
  if (io) {
    io.emit('new_event', event);
  }
};

export const emitNewWorkshop = (workshop) => {
  if (io) {
    io.emit('new_workshop', workshop);
  }
};

export const emitBroadcast = (message) => {
  if (io) {
    io.emit('broadcast_update', message);
  }
};
