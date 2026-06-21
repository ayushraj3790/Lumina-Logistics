/**
 * Socket.io real-time handlers
 */
export const initSockets = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join:shipment', (shipmentId) => {
      socket.join(`shipment:${shipmentId}`);
    });

    socket.on('join:user', (userId) => {
      socket.join(`user:${userId}`);
    });

    socket.on('driver:location', (data) => {
      if (data.shipmentId) {
        io.to(`shipment:${data.shipmentId}`).emit('driver:location', data);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
