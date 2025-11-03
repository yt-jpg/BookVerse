import { Server } from 'socket.io';

let io = null;
const userSockets = new Map();

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Configurar eventos do Socket.IO
  io.on('connection', (socket) => {
    // Registrar usuário
    socket.on('register-user', (userId) => {
      if (userId) {
        userSockets.set(userId, socket.id);
      }
    });

    // Desconexão
    socket.on('disconnect', () => {
      // Remover usuário do mapa
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
    });
  });

  return io;
};

// Função para enviar notificação em tempo real
export const sendRealTimeNotification = (userId, notification) => {
  if (!io) {
    return;
  }

  const socketId = userSockets.get(userId);
  if (socketId) {
    io.to(socketId).emit('new-notification', notification);
  }
};

// Função para broadcast de notificação para todos
export const broadcastNotification = (notification) => {
  if (!io) {
    return;
  }

  io.emit('new-notification', notification);
};

// Função para obter estatísticas de conexões
export const getConnectionStats = () => {
  return {
    connectedUsers: userSockets.size,
    totalConnections: io ? io.engine.clientsCount : 0,
    userSockets: Array.from(userSockets.keys())
  };
};